-- 04_F2_AUDITAR_CARGA.sql: read-only diagnostics before publishing.
WITH r AS (
 SELECT c.anio,x.piloto,x.equipo,x.puntos
 FROM f2_import.resultados_verificados x JOIN f2_import.carreras_verificadas c ON c.codigo=x.carrera
), p AS (
 SELECT anio,piloto,sum(puntos) AS puntos FROM r GROUP BY anio,piloto
), e AS (
 SELECT anio,equipo,sum(puntos) AS puntos FROM r GROUP BY anio,equipo
)
SELECT 'piloto' AS tipo,c.anio,c.piloto AS codigo,c.puntos AS oficiales,
 COALESCE(p.puntos,0) AS carreras,COALESCE(a.puntos,0) AS ajuste,
 c.puntos-COALESCE(p.puntos,0)-COALESCE(a.puntos,0) AS diferencia
 FROM f2_import.campeonato_pilotos_verificado c LEFT JOIN p USING(anio,piloto)
 LEFT JOIN f2_import.ajustes_campeonato_pilotos a USING(anio,piloto)
UNION ALL
SELECT 'equipo',c.anio,c.equipo,c.puntos,COALESCE(e.puntos,0),COALESCE(a.puntos,0),
 c.puntos-COALESCE(e.puntos,0)-COALESCE(a.puntos,0)
 FROM f2_import.campeonato_equipos_verificado c LEFT JOIN e USING(anio,equipo)
 LEFT JOIN f2_import.ajustes_campeonato_equipos a USING(anio,equipo)
ORDER BY anio,tipo,codigo;
