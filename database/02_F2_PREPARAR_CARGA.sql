-- 02_F2_PREPARAR_CARGA.sql: staging privado de datos normalizados y comprobados.
-- No genera puntos ni participantes ficticios. Ejecutar despues de 01_F2_MULTICATEGORIA.sql.
BEGIN;
CREATE SCHEMA IF NOT EXISTS f2_import;
REVOKE ALL ON SCHEMA f2_import FROM PUBLIC,anon,authenticated;
-- One row per season, imported only when source has been verified.
CREATE TABLE IF NOT EXISTS f2_import.lotes_verificados(
 anio smallint PRIMARY KEY CHECK(anio BETWEEN 2017 AND 2026),
 finalizada boolean NOT NULL,
 carreras_esperadas integer NOT NULL CHECK(carreras_esperadas>0),
 resultados_esperados integer NOT NULL CHECK(resultados_esperados>0),
 pilotos_clasificados integer NOT NULL CHECK(pilotos_clasificados>0),
 equipos_clasificados integer NOT NULL CHECK(equipos_clasificados>0),
 fuente text NOT NULL CHECK(fuente LIKE 'https://%'),
 verificado boolean NOT NULL DEFAULT false
);
-- Identity must be matched against existing pilote source code before new profile is inserted.
CREATE TABLE IF NOT EXISTS f2_import.pilotos_verificados(
 codigo text PRIMARY KEY,
 nombre text NOT NULL, apellido text NOT NULL, nacionalidad text NOT NULL,
 nacimiento date NOT NULL, numero smallint, codigo_fia text NOT NULL,
 codigo_fia_original text, piloto_existente integer REFERENCES public.piloto(id_piloto),
 fuente text NOT NULL CHECK(fuente LIKE 'https://%')
);
CREATE TABLE IF NOT EXISTS f2_import.equipos_verificados(
 codigo text PRIMARY KEY CHECK(codigo LIKE 'f2-%'), nombre text NOT NULL,
 motor text NOT NULL, pais text NOT NULL, fuente text NOT NULL CHECK(fuente LIKE 'https://%')
);
CREATE TABLE IF NOT EXISTS f2_import.equipos_temporada_verificados(
 anio smallint REFERENCES f2_import.lotes_verificados(anio), equipo text REFERENCES f2_import.equipos_verificados(codigo),
 register_name text NOT NULL, monoplaza text, PRIMARY KEY(anio,equipo)
);
CREATE TABLE IF NOT EXISTS f2_import.inscripciones_verificadas(
 anio smallint REFERENCES f2_import.lotes_verificados(anio),
 piloto text REFERENCES f2_import.pilotos_verificados(codigo),
 equipo text NOT NULL, numero smallint NOT NULL,
 PRIMARY KEY(anio,piloto), FOREIGN KEY(anio,equipo) REFERENCES f2_import.equipos_temporada_verificados(anio,equipo)
);
CREATE TABLE IF NOT EXISTS f2_import.carreras_verificadas(
 codigo text PRIMARY KEY CHECK(codigo LIKE 'f2-%'),
 anio smallint NOT NULL REFERENCES f2_import.lotes_verificados(anio),
 ronda smallint NOT NULL CHECK(ronda>0), tipo varchar(12) NOT NULL CHECK(tipo IN ('GP','SP')),
 sesion smallint NOT NULL CHECK(sesion>0), nombre text NOT NULL, fecha date NOT NULL,
 circuito_codigo text NOT NULL, vueltas smallint NOT NULL CHECK(vueltas>=0),
 pole text REFERENCES f2_import.pilotos_verificados(codigo), tiempo_pole text,
 vr text REFERENCES f2_import.pilotos_verificados(codigo), tiempo_vr text,
 fuente text NOT NULL CHECK(fuente LIKE 'https://%'),
 UNIQUE(anio,ronda,tipo,sesion), CHECK(EXTRACT(YEAR FROM fecha)=anio),
 CHECK(tipo='GP' OR pole IS NULL)
);
CREATE TABLE IF NOT EXISTS f2_import.resultados_verificados(
 carrera text REFERENCES f2_import.carreras_verificadas(codigo),
 piloto text REFERENCES f2_import.pilotos_verificados(codigo),
 equipo text NOT NULL REFERENCES f2_import.equipos_verificados(codigo),
 numero smallint NOT NULL, posicion_final smallint CHECK(posicion_final>0),
 posicion_inicio smallint CHECK(posicion_inicio>0), vueltas smallint CHECK(vueltas>=0),
 estado varchar(15) NOT NULL, puntos numeric(7,2) NOT NULL,
 puntos_posicion numeric(7,2), puntos_pole numeric(7,2), puntos_vr numeric(7,2), ajuste numeric(7,2),
 fuente text NOT NULL CHECK(fuente LIKE 'https://%'),
 PRIMARY KEY(carrera,piloto),
 CHECK(puntos_posicion IS NULL OR puntos_pole IS NULL OR puntos_vr IS NULL OR ajuste IS NULL OR puntos=puntos_posicion+puntos_pole+puntos_vr+ajuste)
);
CREATE TABLE IF NOT EXISTS f2_import.campeonato_pilotos_verificado(
 anio smallint REFERENCES f2_import.lotes_verificados(anio), piloto text REFERENCES f2_import.pilotos_verificados(codigo),
 posicion integer NOT NULL CHECK(posicion>0), puntos numeric(10,2) NOT NULL, fuente text NOT NULL CHECK(fuente LIKE 'https://%'),
 PRIMARY KEY(anio,piloto)
);
CREATE TABLE IF NOT EXISTS f2_import.campeonato_equipos_verificado(
 anio smallint REFERENCES f2_import.lotes_verificados(anio), equipo text REFERENCES f2_import.equipos_verificados(codigo),
 posicion integer NOT NULL CHECK(posicion>0), puntos numeric(10,2) NOT NULL, fuente text NOT NULL CHECK(fuente LIKE 'https://%'),
 PRIMARY KEY(anio,equipo)
);
ALTER TABLE f2_import.lotes_verificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE f2_import.pilotos_verificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE f2_import.equipos_verificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE f2_import.equipos_temporada_verificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE f2_import.inscripciones_verificadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE f2_import.carreras_verificadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE f2_import.resultados_verificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE f2_import.campeonato_pilotos_verificado ENABLE ROW LEVEL SECURITY;
ALTER TABLE f2_import.campeonato_equipos_verificado ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA f2_import FROM PUBLIC,anon,authenticated;
COMMIT;
-- No official records loaded by this script. Staging may be populated with verified source rows.
SELECT anio,verificado,carreras_esperadas,resultados_esperados FROM f2_import.lotes_verificados ORDER BY anio;
