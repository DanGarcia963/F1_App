-- 03_F2_PUBLICAR_VERIFICADOS.sql: run ONLY once verified staging is populated.
-- Run for a complete verified season or verified current-season snapshot; no synthetic data.
BEGIN;
SET LOCAL statement_timeout='0';
SET LOCAL search_path=public,pg_temp;
CREATE TEMP TABLE f2_lotes ON COMMIT DROP AS SELECT * FROM f2_import.lotes_verificados WHERE verificado;
DO $check$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM f2_lotes) THEN RAISE EXCEPTION 'No existen temporadas F2 verificadas en staging. No se ha importado nada.'; END IF;
 IF EXISTS (SELECT 1 FROM f2_lotes l WHERE
   l.carreras_esperadas<>(SELECT count(*) FROM f2_import.carreras_verificadas c WHERE c.anio=l.anio)
   OR l.resultados_esperados<>(SELECT count(*) FROM f2_import.resultados_verificados r JOIN f2_import.carreras_verificadas c ON c.codigo=r.carrera WHERE c.anio=l.anio)
   OR l.pilotos_clasificados<>(SELECT count(*) FROM f2_import.campeonato_pilotos_verificado p WHERE p.anio=l.anio)
   OR l.equipos_clasificados<>(SELECT count(*) FROM f2_import.campeonato_equipos_verificado e WHERE e.anio=l.anio))
 THEN RAISE EXCEPTION 'Cobertura de la fuente incompleta'; END IF;
 IF EXISTS (SELECT 1 FROM f2_import.carreras_verificadas c JOIN f2_lotes l USING(anio)
 WHERE NOT EXISTS(SELECT 1 FROM public.circuito WHERE codigo_fuente=c.circuito_codigo)
 OR 1<>(SELECT count(*) FROM f2_import.resultados_verificados r WHERE r.carrera=c.codigo AND r.posicion_final=1))
 THEN RAISE EXCEPTION 'Circuito sin mapear o carrera sin ganador unico'; END IF;
 IF EXISTS(SELECT 1 FROM f2_import.resultados_verificados r JOIN f2_import.carreras_verificadas c ON c.codigo=r.carrera JOIN f2_lotes l USING(anio)
 WHERE NOT EXISTS(SELECT 1 FROM f2_import.inscripciones_verificadas i WHERE i.anio=c.anio AND i.piloto=r.piloto)
 OR NOT EXISTS(SELECT 1 FROM f2_import.equipos_temporada_verificados e WHERE e.anio=c.anio AND e.equipo=r.equipo))
 THEN RAISE EXCEPTION 'Inscripciones o equipos de temporada faltantes'; END IF;
 IF EXISTS(SELECT 1 FROM f2_import.pilotos_verificados s JOIN public.piloto p ON lower(p.nombre)=lower(s.nombre) AND lower(p.apellido)=lower(s.apellido) AND p.fecha_nacimiento=s.nacimiento
 WHERE s.piloto_existente IS DISTINCT FROM p.id_piloto AND p.codigo_fuente IS DISTINCT FROM s.codigo)
 THEN RAISE EXCEPTION 'Posible piloto duplicado. Conciliar piloto_existente antes de cargar.'; END IF;
 IF EXISTS(SELECT 1 FROM f2_import.pilotos_verificados s JOIN public.piloto p ON p.id_piloto=s.piloto_existente
 WHERE p.fecha_nacimiento IS DISTINCT FROM s.nacimiento)
 THEN RAISE EXCEPTION 'Identidad de piloto existente no coincide'; END IF;
 IF EXISTS(SELECT 1 FROM f2_import.equipos_verificados s JOIN public.equipo e ON e.codigo_fuente=s.codigo WHERE e.id_categoria<>2)
 OR EXISTS(SELECT 1 FROM f2_import.carreras_verificadas s JOIN public.grandes_premios g ON g.codigo_fuente=s.codigo WHERE g.id_categoria<>2)
 THEN RAISE EXCEPTION 'Codigo de origen ocupado por otra categoria'; END IF;
 IF EXISTS (SELECT 1 FROM f2_import.campeonato_pilotos_verificado p JOIN f2_lotes l USING(anio)
 LEFT JOIN f2_import.ajustes_campeonato_pilotos a ON a.anio=p.anio AND a.piloto=p.piloto
 WHERE p.puntos <> COALESCE((SELECT sum(r.puntos) FROM f2_import.resultados_verificados r JOIN f2_import.carreras_verificadas c ON c.codigo=r.carrera WHERE c.anio=p.anio AND r.piloto=p.piloto),0)+COALESCE(a.puntos,0))
 OR EXISTS (SELECT 1 FROM f2_import.campeonato_equipos_verificado p JOIN f2_lotes l USING(anio)
 LEFT JOIN f2_import.ajustes_campeonato_equipos a ON a.anio=p.anio AND a.equipo=p.equipo
 WHERE p.puntos <> COALESCE((SELECT sum(r.puntos) FROM f2_import.resultados_verificados r JOIN f2_import.carreras_verificadas c ON c.codigo=r.carrera WHERE c.anio=p.anio AND r.equipo=p.equipo),0)+COALESCE(a.puntos,0))
 THEN RAISE EXCEPTION 'Diferencias de puntos sin ajuste oficial documentado'; END IF;
 IF EXISTS(SELECT 1 FROM f2_import.resultados_verificados r JOIN f2_import.carreras_verificadas c ON c.codigo=r.carrera JOIN f2_lotes l USING(anio)
 WHERE NOT EXISTS(SELECT 1 FROM f2_import.campeonato_pilotos_verificado p WHERE p.anio=c.anio AND p.piloto=r.piloto)
 OR NOT EXISTS(SELECT 1 FROM f2_import.campeonato_equipos_verificado e WHERE e.anio=c.anio AND e.equipo=r.equipo))
 THEN RAISE EXCEPTION 'Participante sin clasificacion oficial'; END IF;
 IF EXISTS(SELECT 1 FROM f2_import.pilotos_verificados s JOIN public.piloto p ON p.codigo_fuente=s.codigo WHERE p.fecha_nacimiento IS DISTINCT FROM s.nacimiento)
 THEN RAISE EXCEPTION 'Codigo fuente de piloto con fecha de nacimiento incompatible'; END IF;
END;
$check$;
-- Only entities belonging to selected seasons.
CREATE TEMP TABLE f2_pilotos_activos ON COMMIT DROP AS
 SELECT DISTINCT piloto AS codigo FROM f2_import.inscripciones_verificadas i JOIN f2_lotes l USING(anio)
 UNION SELECT DISTINCT piloto FROM f2_import.campeonato_pilotos_verificado p JOIN f2_lotes l USING(anio);
CREATE TEMP TABLE f2_equipos_activos ON COMMIT DROP AS
 SELECT DISTINCT equipo AS codigo FROM f2_import.equipos_temporada_verificados e JOIN f2_lotes l USING(anio);
INSERT INTO public.temporada(anio,finalizada)
SELECT anio,finalizada::integer FROM f2_lotes ON CONFLICT(anio) DO NOTHING;
INSERT INTO public.piloto(codigo_fuente,nombre,apellido,nacionalidad,fecha_nacimiento,numero,codigo_fia,id_categoria)
SELECT s.codigo,s.nombre,s.apellido,s.nacionalidad,s.nacimiento,s.numero,s.codigo_fia,2
FROM f2_import.pilotos_verificados s JOIN f2_pilotos_activos a USING(codigo)
WHERE s.piloto_existente IS NULL ON CONFLICT(codigo_fuente) DO NOTHING;
CREATE TEMP TABLE f2_map_p ON COMMIT DROP AS
SELECT s.codigo,COALESCE(s.piloto_existente,p.id_piloto) AS piloto_id
FROM f2_import.pilotos_verificados s JOIN f2_pilotos_activos a USING(codigo)
LEFT JOIN public.piloto p ON p.codigo_fuente=s.codigo;
DO $identidad$
BEGIN
 IF EXISTS(SELECT 1 FROM f2_map_p WHERE piloto_id IS NULL)
 OR EXISTS(SELECT piloto_id FROM f2_map_p GROUP BY piloto_id HAVING count(*)>1)
 THEN RAISE EXCEPTION 'Mapeo de pilotos ambiguo o incompleto'; END IF;
END;
$identidad$;
INSERT INTO public.pilotos_categorias SELECT piloto_id,2 FROM f2_map_p ON CONFLICT DO NOTHING;
INSERT INTO public.equipo(codigo_fuente,nombre,motor,pais,id_categoria)
SELECT s.codigo,s.nombre,s.motor,s.pais,2 FROM f2_import.equipos_verificados s JOIN f2_equipos_activos a USING(codigo)
ON CONFLICT(codigo_fuente) DO NOTHING;
INSERT INTO public.equipos_temporada(equipo_id,temporada_id,register_name,monoplaza)
SELECT e.id_equipo,t.id_temporada,s.register_name,s.monoplaza
FROM f2_import.equipos_temporada_verificados s JOIN f2_lotes l USING(anio)
JOIN public.temporada t ON t.anio=s.anio JOIN public.equipo e ON e.codigo_fuente=s.equipo
ON CONFLICT(equipo_id,temporada_id) DO UPDATE SET register_name=excluded.register_name,monoplaza=excluded.monoplaza;
INSERT INTO public.pilotos_temporada_categoria(piloto_id,id_categoria,temporada_id,equipo_id,numero)
SELECT p.piloto_id,2,t.id_temporada,e.id_equipo,s.numero
FROM f2_import.inscripciones_verificadas s JOIN f2_lotes l USING(anio)
JOIN f2_map_p p ON p.codigo=s.piloto JOIN public.temporada t ON t.anio=s.anio
JOIN public.equipo e ON e.codigo_fuente=s.equipo
ON CONFLICT(piloto_id,id_categoria,temporada_id) DO UPDATE SET equipo_id=excluded.equipo_id,numero=excluded.numero;
INSERT INTO public.grandes_premios(codigo_fuente,nombre_oficial,fecha,circuito_id,temporada_id,vueltas_totales,pole_position_piloto_id,tiempo_pole,vuelta_rapida_piloto_id,tiempo_vuelta_rapida,tipo_carrera,id_categoria,estado_gp,ronda,numero_sesion,fuente_oficial)
SELECT s.codigo,s.nombre,s.fecha,c.id_circuito,t.id_temporada,s.vueltas,p.piloto_id,s.tiempo_pole,v.piloto_id,s.tiempo_vr,s.tipo,2,'V',s.ronda,s.sesion,s.fuente
FROM f2_import.carreras_verificadas s JOIN f2_lotes l USING(anio)
JOIN public.circuito c ON c.codigo_fuente=s.circuito_codigo JOIN public.temporada t ON t.anio=s.anio
LEFT JOIN f2_map_p p ON p.codigo=s.pole LEFT JOIN f2_map_p v ON v.codigo=s.vr
ON CONFLICT(codigo_fuente) DO UPDATE SET nombre_oficial=excluded.nombre_oficial,fecha=excluded.fecha,circuito_id=excluded.circuito_id,vueltas_totales=excluded.vueltas_totales,
pole_position_piloto_id=excluded.pole_position_piloto_id,tiempo_pole=excluded.tiempo_pole,vuelta_rapida_piloto_id=excluded.vuelta_rapida_piloto_id,tiempo_vuelta_rapida=excluded.tiempo_vuelta_rapida,ronda=excluded.ronda,numero_sesion=excluded.numero_sesion,fuente_oficial=excluded.fuente_oficial,estado_gp='V';
INSERT INTO public.resultados(grand_prix_id,piloto_id,equipo_id,posicion_final,posicion_inicio,vueltas_completadas,puntos_obtenidos,estado_resultado,numero_carrera,puntos_posicion,puntos_pole,puntos_vuelta_rapida,ajuste_puntos)
SELECT g.id_gp,p.piloto_id,e.id_equipo,r.posicion_final,r.posicion_inicio,r.vueltas,r.puntos,r.estado,r.numero,r.puntos_posicion,r.puntos_pole,r.puntos_vr,r.ajuste
FROM f2_import.resultados_verificados r JOIN f2_import.carreras_verificadas c ON c.codigo=r.carrera JOIN f2_lotes l USING(anio)
JOIN public.grandes_premios g ON g.codigo_fuente=c.codigo JOIN f2_map_p p ON p.codigo=r.piloto JOIN public.equipo e ON e.codigo_fuente=r.equipo
ON CONFLICT(grand_prix_id,piloto_id) DO UPDATE SET equipo_id=excluded.equipo_id,posicion_final=excluded.posicion_final,posicion_inicio=excluded.posicion_inicio,vueltas_completadas=excluded.vueltas_completadas,puntos_obtenidos=excluded.puntos_obtenidos,estado_resultado=excluded.estado_resultado,numero_carrera=excluded.numero_carrera,puntos_posicion=excluded.puntos_posicion,puntos_pole=excluded.puntos_pole,puntos_vuelta_rapida=excluded.puntos_vuelta_rapida,ajuste_puntos=excluded.ajuste_puntos;
-- Official standings; refuse if row coverage does not match staging.
INSERT INTO public.clasificacion_pilotos_oficial(id_categoria,temporada_id,piloto_id,posicion,puntos,fuente)
SELECT 2,t.id_temporada,p.piloto_id,s.posicion,s.puntos,s.fuente
FROM f2_import.campeonato_pilotos_verificado s JOIN f2_lotes l USING(anio) JOIN public.temporada t ON t.anio=s.anio JOIN f2_map_p p ON p.codigo=s.piloto
ON CONFLICT(id_categoria,temporada_id,piloto_id) DO UPDATE SET posicion=excluded.posicion,puntos=excluded.puntos,fuente=excluded.fuente;
INSERT INTO public.clasificacion_equipos_oficial(id_categoria,temporada_id,equipo_id,posicion,puntos,fuente)
SELECT 2,t.id_temporada,e.id_equipo,s.posicion,s.puntos,s.fuente
FROM f2_import.campeonato_equipos_verificado s JOIN f2_lotes l USING(anio) JOIN public.temporada t ON t.anio=s.anio JOIN public.equipo e ON e.codigo_fuente=s.equipo
ON CONFLICT(id_categoria,temporada_id,equipo_id) DO UPDATE SET posicion=excluded.posicion,puntos=excluded.puntos,fuente=excluded.fuente;
DO $final$
BEGIN
 IF EXISTS(SELECT 1 FROM f2_lotes l JOIN public.temporada t ON t.anio=l.anio WHERE
 l.carreras_esperadas<>(SELECT count(*) FROM public.grandes_premios g WHERE g.temporada_id=t.id_temporada AND g.id_categoria=2 AND g.estado_gp='V')
 OR l.resultados_esperados<>(SELECT count(*) FROM public.resultados r JOIN public.grandes_premios g ON g.id_gp=r.grand_prix_id WHERE g.temporada_id=t.id_temporada AND g.id_categoria=2)
 OR l.pilotos_clasificados<>(SELECT count(*) FROM public.clasificacion_pilotos_oficial c WHERE c.temporada_id=t.id_temporada AND c.id_categoria=2)
 OR l.equipos_clasificados<>(SELECT count(*) FROM public.clasificacion_equipos_oficial c WHERE c.temporada_id=t.id_temporada AND c.id_categoria=2))
 THEN RAISE EXCEPTION 'Conciliacion fallida: no se confirma ninguna modificacion'; END IF;
END;
$final$;
INSERT INTO public.temporadas_categoria(id_categoria,temporada_id,finalizada,clasificacion_verificada,fuente)
SELECT 2,t.id_temporada,l.finalizada,true,l.fuente FROM f2_lotes l JOIN public.temporada t ON t.anio=l.anio
ON CONFLICT(id_categoria,temporada_id) DO UPDATE SET finalizada=excluded.finalizada,clasificacion_verificada=excluded.clasificacion_verificada,fuente=excluded.fuente;
COMMIT;
SELECT t.anio,tc.finalizada,tc.clasificacion_verificada FROM public.temporadas_categoria tc JOIN public.temporada t ON t.id_temporada=tc.temporada_id WHERE tc.id_categoria=2 ORDER BY t.anio;
