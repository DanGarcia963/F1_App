-- Reconciliacion automatica de candidatos. No certifica ni publica datos de carrera.
-- Requiere 01, 02, fuentes, mapeo v3 y F2_REGISTRO_PILOTOS_EQUIPOS_CIRCUITOS.
BEGIN;
CREATE OR REPLACE VIEW f2_import.v_historico_conciliado WITH (security_invoker=true) AS
SELECT extract(year FROM f.fecha)::smallint AS anio, f.fecha AS fecha_fuente,
  CASE WHEN trim(f.ronda) ~ '^Round [0-9]+$' THEN substring(trim(f.ronda) FROM '[0-9]+')::smallint END AS ronda,
  CASE f.tipo WHEN 'Feature-Race' THEN 'GP' WHEN 'Sprint-Race' THEN 'SP' WHEN 'Sprint-Race-2' THEN 'SP' ELSE 'Q' END AS tipo,
  CASE WHEN f.tipo='Sprint-Race-2' THEN 2 ELSE 1 END AS sesion,
  f.piloto_fuente, f.equipo_fuente, f.circuito_fuente,
  p.codigo AS piloto, e.codigo AS equipo, c.codigo_fuente AS circuito_codigo,
  CASE WHEN f.numero_fuente ~ '^[0-9]{1,3}$' THEN f.numero_fuente::smallint END AS numero,
  CASE WHEN f.datos->>'POS' ~ '^[0-9]{1,3}(\.0+)?$' THEN NULLIF((f.datos->>'POS')::numeric::smallint,0) END AS posicion,
  CASE WHEN f.datos->>'LAPS' ~ '^[0-9]{1,3}(\.0+)?$' THEN (f.datos->>'LAPS')::numeric::smallint END AS vueltas,
  f.datos
FROM f2_import.clasificaciones_fuente f
LEFT JOIN f2_import.mapa_pilotos_fuente p ON p.proveedor='pipeline' AND p.anio=extract(year FROM f.fecha) AND p.alias_fuente=f.piloto_fuente
LEFT JOIN f2_import.mapa_equipos_fuente e ON e.proveedor='pipeline' AND e.anio=extract(year FROM f.fecha) AND e.alias_fuente=f.equipo_fuente
LEFT JOIN f2_import.mapa_circuitos_fuente m ON m.proveedor='pipeline' AND m.alias_fuente=f.circuito_fuente
LEFT JOIN public.circuito c ON c.id_circuito=m.circuito_id;
-- Conserva todas las parejas piloto/equipo/numero observadas, no escoge una arbitrariamente.
CREATE OR REPLACE VIEW f2_import.v_inscripciones_candidatas WITH (security_invoker=true) AS
SELECT anio,piloto,equipo,numero,min(fecha_fuente) AS primera_fecha_fuente,
max(fecha_fuente) AS ultima_fecha_fuente,count(*) AS filas
FROM f2_import.v_historico_conciliado
WHERE piloto IS NOT NULL AND equipo IS NOT NULL AND numero IS NOT NULL
GROUP BY anio,piloto,equipo,numero;
-- En fuentes recientes el dorsal puede pertenecer a mas de un piloto.
CREATE OR REPLACE VIEW f2_import.v_dorsales_recientes WITH (security_invoker=true) AS
SELECT f.anio, x.v->>'permanentNumber' AS numero,
array_agg(DISTINCT x.v->>'driverId') AS identificadores,
array_agg(DISTINCT p.codigo) FILTER(WHERE p.codigo IS NOT NULL) AS pilotos,
array_agg(DISTINCT e.codigo) FILTER(WHERE e.codigo IS NOT NULL) AS equipos,
bool_and(p.codigo IS NOT NULL AND e.codigo IS NOT NULL) AS mapeado
FROM f2_import.fuente_reciente f
CROSS JOIN LATERAL jsonb_each(f.datos) x(k,v)
LEFT JOIN f2_import.mapa_pilotos_fuente p ON p.proveedor='telemetry' AND p.anio=f.anio AND p.alias_fuente=x.v->>'driverId'
LEFT JOIN f2_import.mapa_equipos_fuente e ON e.proveedor='telemetry' AND e.anio=f.anio AND e.alias_fuente=f.datos->'Constructor'->>'constructorId'
WHERE f.tipo='drivers' AND x.k ~ '^Driver[0-9]*$' AND x.v->>'driverId' IS NOT NULL
GROUP BY f.anio,x.v->>'permanentNumber';
CREATE OR REPLACE VIEW f2_import.v_resultados_recientes_candidatos WITH (security_invoker=true) AS
SELECT f.anio,f.clave,f.datos->>'round' AS ronda,f.datos->>'session' AS sesion,
f.datos->>'raceName' AS nombre_fuente,f.datos->'result'->>'number' AS numero,
CASE WHEN cardinality(d.identificadores)=1 AND d.mapeado AND cardinality(d.pilotos)=1 AND cardinality(d.equipos)=1 THEN d.pilotos[1] END AS piloto,
CASE WHEN cardinality(d.identificadores)=1 AND d.mapeado AND cardinality(d.pilotos)=1 AND cardinality(d.equipos)=1 THEN d.equipos[1] END AS equipo,
f.datos->'result'->>'position' AS posicion_fuente,
CASE WHEN f.datos->'result'->>'points' ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (f.datos->'result'->>'points')::numeric END AS puntos_fuente,
f.datos,f.fuente
FROM f2_import.fuente_reciente f LEFT JOIN f2_import.v_dorsales_recientes d ON d.anio=f.anio AND d.numero=f.datos->'result'->>'number'
WHERE f.tipo='resultado';
REVOKE ALL ON f2_import.v_historico_conciliado,f2_import.v_inscripciones_candidatas,
 f2_import.v_dorsales_recientes,f2_import.v_resultados_recientes_candidatos FROM PUBLIC,anon,authenticated;
COMMIT;
-- Reporta todos los anios, inclusive 2024. Los nulos se conservan, no se convierten en cero.
WITH h AS (SELECT anio,count(*) AS filas,count(*) FILTER(WHERE piloto IS NULL OR equipo IS NULL OR circuito_codigo IS NULL OR ronda IS NULL) AS sin_mapa
FROM f2_import.v_historico_conciliado GROUP BY anio),
r AS (SELECT anio,count(*) AS filas,count(*) FILTER(WHERE piloto IS NULL OR equipo IS NULL) AS sin_mapa,
count(*) FILTER(WHERE puntos_fuente IS NULL) AS sin_puntos FROM f2_import.v_resultados_recientes_candidatos GROUP BY anio)
SELECT y.anio,coalesce(h.filas,0) AS filas_historicas,coalesce(r.filas,0) AS resultados_recientes,
coalesce(h.sin_mapa,0)+coalesce(r.sin_mapa,0) AS filas_sin_mapa,
r.sin_puntos AS resultados_recientes_sin_puntos,
coalesce(l.verificado,false) AS lote_verificado
FROM generate_series(2017,2026) y(anio) LEFT JOIN h USING(anio) LEFT JOIN r USING(anio)
LEFT JOIN f2_import.lotes_verificados l USING(anio) ORDER BY y.anio;
