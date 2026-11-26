-- Read-only; execute after scripts 01,02 and the source data SQLs.
-- A zero in verified data is expected until identity, dates, points and official coverage are reconciled.
WITH years AS (SELECT generate_series(2017,2026) AS anio),
raw AS (SELECT extract(year FROM fecha)::int AS anio,
 count(*) FILTER(WHERE tipo<>'Qualifying-Session') AS resultados_fuente,
 count(*) FILTER(WHERE tipo='Qualifying-Session') AS clasificaciones_fuente
 FROM f2_import.clasificaciones_fuente GROUP BY 1),
recent AS (SELECT anio,count(*) FILTER(WHERE tipo='resultado' AND lower(coalesce(datos->'result'->>'status',''))<>'cancelled') AS resultados_fuente,
 count(*) FILTER(WHERE tipo='resultado' AND nullif(datos->'result'->>'points','') IS NOT NULL) AS con_puntos
 FROM f2_import.fuente_reciente GROUP BY anio),
verified AS (SELECT c.anio,count(*) AS resultados_normalizados FROM f2_import.resultados_verificados r JOIN f2_import.carreras_verificadas c ON c.codigo=r.carrera GROUP BY c.anio)
SELECT y.anio,coalesce(raw.resultados_fuente,recent.resultados_fuente,0) AS resultados_fuente,
 coalesce(raw.clasificaciones_fuente,0) AS clasificaciones_fuente,coalesce(recent.con_puntos,0) AS registros_recientes_con_puntos,
 coalesce(verified.resultados_normalizados,0) AS resultados_normalizados,coalesce(l.verificado,false) AS listo_para_publicar
FROM years y LEFT JOIN raw USING(anio) LEFT JOIN recent USING(anio) LEFT JOIN verified USING(anio)
LEFT JOIN f2_import.lotes_verificados l USING(anio) ORDER BY y.anio;
