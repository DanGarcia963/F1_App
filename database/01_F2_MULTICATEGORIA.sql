-- F1_App: migracion multicategoria aditiva.
-- Ejecutar despues de F1_2011_2020_SEED.sql, sin modificar sus claves unicas.
BEGIN;
SET LOCAL search_path = public, pg_temp;

-- Existing installations use category 1 for F1.
DO $guard$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.categoria WHERE id_categoria=1 AND lower(replace(nombre,' ',''))='formula1') THEN
   RAISE EXCEPTION 'La categoria 1 no es Formula 1';
 END IF;
 IF EXISTS (SELECT 1 FROM public.categoria WHERE id_categoria=2 AND lower(replace(nombre,' ','')) NOT IN ('formula2','f2')) THEN
   RAISE EXCEPTION 'La categoria 2 esta ocupada; revisar antes de continuar';
 END IF;
END;
$guard$;

INSERT INTO public.categoria(id_categoria,nombre) VALUES (2,'Formula 2') ON CONFLICT(id_categoria) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.pilotos_categorias (
 piloto_id integer NOT NULL REFERENCES public.piloto(id_piloto),
 id_categoria integer NOT NULL REFERENCES public.categoria(id_categoria),
 PRIMARY KEY(piloto_id,id_categoria)
);
INSERT INTO public.pilotos_categorias(piloto_id,id_categoria)
 SELECT id_piloto,id_categoria FROM public.piloto WHERE id_categoria IS NOT NULL
ON CONFLICT DO NOTHING;

-- Extra inscriptions (one per driver, category, season); legacy table stays intact.
CREATE TABLE IF NOT EXISTS public.pilotos_temporada_categoria (
 piloto_id integer NOT NULL,
 id_categoria integer NOT NULL,
 temporada_id integer NOT NULL REFERENCES public.temporada(id_temporada),
 equipo_id integer NOT NULL REFERENCES public.equipo(id_equipo),
 numero smallint,
 PRIMARY KEY(piloto_id,id_categoria,temporada_id),
 FOREIGN KEY(piloto_id,id_categoria) REFERENCES public.pilotos_categorias(piloto_id,id_categoria)
);
CREATE OR REPLACE FUNCTION public.validar_inscripcion_categoria()
RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,public AS $validar$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.equipo e WHERE e.id_equipo=NEW.equipo_id AND e.id_categoria=NEW.id_categoria) THEN
   RAISE EXCEPTION 'El equipo no pertenece a la categoria de la inscripcion';
 END IF;
 RETURN NEW;
END;
$validar$;
DROP TRIGGER IF EXISTS trg_validar_inscripcion_categoria ON public.pilotos_temporada_categoria;
CREATE TRIGGER trg_validar_inscripcion_categoria BEFORE INSERT OR UPDATE ON public.pilotos_temporada_categoria
FOR EACH ROW EXECUTE FUNCTION public.validar_inscripcion_categoria();

CREATE OR REPLACE VIEW public.v_pilotos_temporada_categoria WITH (security_invoker=true) AS
 SELECT pt.piloto_id,e.id_categoria,pt.temporada_id,pt.equipo_id,pt.numero
 FROM public.pilotos_temporada pt JOIN public.equipo e ON e.id_equipo=pt.equipo_id
 WHERE NOT EXISTS (SELECT 1 FROM public.pilotos_temporada_categoria x
   WHERE x.piloto_id=pt.piloto_id AND x.temporada_id=pt.temporada_id AND x.id_categoria=e.id_categoria)
 UNION ALL
 SELECT piloto_id,id_categoria,temporada_id,equipo_id,numero FROM public.pilotos_temporada_categoria;

-- FIA official championship standings, separate from race sums (penalties, ties, etc.).
CREATE TABLE IF NOT EXISTS public.clasificacion_pilotos_oficial (
 id_categoria integer NOT NULL REFERENCES public.categoria(id_categoria),
 temporada_id integer NOT NULL REFERENCES public.temporada(id_temporada),
 piloto_id integer NOT NULL REFERENCES public.piloto(id_piloto),
 posicion integer NOT NULL CHECK(posicion>0),
 puntos numeric(10,2) NOT NULL,
 fuente text NOT NULL,
 PRIMARY KEY(id_categoria,temporada_id,piloto_id)
);
CREATE TABLE IF NOT EXISTS public.clasificacion_equipos_oficial (
 id_categoria integer NOT NULL REFERENCES public.categoria(id_categoria),
 temporada_id integer NOT NULL REFERENCES public.temporada(id_temporada),
 equipo_id integer NOT NULL REFERENCES public.equipo(id_equipo),
 posicion integer NOT NULL CHECK(posicion>0),
 puntos numeric(10,2) NOT NULL,
 fuente text NOT NULL,
 PRIMARY KEY(id_categoria,temporada_id,equipo_id)
);
-- Publish official standings only after entire category-season has been reconciled.
CREATE TABLE IF NOT EXISTS public.temporadas_categoria (
 id_categoria integer NOT NULL REFERENCES public.categoria(id_categoria),
 temporada_id integer NOT NULL REFERENCES public.temporada(id_temporada),
 finalizada boolean NOT NULL DEFAULT false,
 clasificacion_verificada boolean NOT NULL DEFAULT false,
 fuente text,
 PRIMARY KEY(id_categoria,temporada_id)
);
-- F2 nominal full-distance scoring. Actual awards, shortened races and sanctions
-- must come from official classification, not from this reference table.
CREATE TABLE IF NOT EXISTS public.reglas_puntuacion_categoria (
 id_categoria integer NOT NULL REFERENCES public.categoria(id_categoria),
 anio smallint NOT NULL,
 tipo_carrera varchar(12) NOT NULL CHECK(tipo_carrera IN ('GP','SP')),
 puntos_posiciones numeric[] NOT NULL,
 puntos_pole numeric(5,2) NOT NULL,
 puntos_vuelta_rapida numeric(5,2) NOT NULL,
 sprints_por_ronda smallint NOT NULL,
 fuente text NOT NULL,
 PRIMARY KEY(id_categoria,anio,tipo_carrera)
);
INSERT INTO public.reglas_puntuacion_categoria
SELECT 2,y,'GP',ARRAY[25,18,15,12,10,8,6,4,2,1]::numeric[],
 CASE WHEN y<=2021 THEN 4 ELSE 2 END,CASE WHEN y<=2021 THEN 2 ELSE 1 END,
 CASE WHEN y=2021 THEN 2 ELSE 1 END,
 CASE WHEN y<=2021 THEN 'https://www.fia.com/news/new-weekend-format-fia-formula-2-announced'
 ELSE 'https://www.fiaformula2.com/en/latest/article/recapping-f2s-new-points-system-and-overhauled-weekend-format.42leXfhLWgL8RDSOhNRpvU' END
FROM generate_series(2017,2026)y
ON CONFLICT DO NOTHING;
INSERT INTO public.reglas_puntuacion_categoria
SELECT 2,y,'SP',CASE WHEN y<=2021 THEN ARRAY[15,12,10,8,6,4,2,1]::numeric[] ELSE ARRAY[10,8,6,5,4,3,2,1]::numeric[] END,
 0,CASE WHEN y<=2021 THEN 2 ELSE 1 END,CASE WHEN y=2021 THEN 2 ELSE 1 END,
 CASE WHEN y<=2021 THEN 'https://www.fia.com/news/new-weekend-format-fia-formula-2-announced'
 ELSE 'https://www.fiaformula2.com/en/latest/article/recapping-f2s-new-points-system-and-overhauled-weekend-format.42leXfhLWgL8RDSOhNRpvU' END
FROM generate_series(2017,2026)y
ON CONFLICT DO NOTHING;

-- Metadata only; GP = Feature Race and SP = Sprint Race. Sprint 1/2 use separate source IDs.
ALTER TABLE public.grandes_premios ADD COLUMN IF NOT EXISTS ronda smallint;
ALTER TABLE public.grandes_premios ADD COLUMN IF NOT EXISTS numero_sesion smallint;
ALTER TABLE public.grandes_premios ADD COLUMN IF NOT EXISTS fuente_oficial text;
ALTER TABLE public.resultados ADD COLUMN IF NOT EXISTS puntos_posicion numeric(7,2);
ALTER TABLE public.resultados ADD COLUMN IF NOT EXISTS puntos_pole numeric(7,2);
ALTER TABLE public.resultados ADD COLUMN IF NOT EXISTS puntos_vuelta_rapida numeric(7,2);
ALTER TABLE public.resultados ADD COLUMN IF NOT EXISTS ajuste_puntos numeric(7,2);
ALTER TABLE public.resultados ADD COLUMN IF NOT EXISTS numero_carrera smallint;
-- Direct Railway backend uses database role; no public API access is granted.
ALTER TABLE public.pilotos_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilotos_temporada_categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clasificacion_pilotos_oficial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clasificacion_equipos_oficial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporadas_categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reglas_puntuacion_categoria ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pilotos_categorias,public.pilotos_temporada_categoria,public.clasificacion_pilotos_oficial,
 public.clasificacion_equipos_oficial,public.temporadas_categoria,public.reglas_puntuacion_categoria,
 public.v_pilotos_temporada_categoria FROM PUBLIC,anon,authenticated;
CREATE INDEX IF NOT EXISTS idx_ptc_equipo_temporada ON public.pilotos_temporada_categoria(equipo_id,temporada_id);
CREATE INDEX IF NOT EXISTS idx_gp_categoria_temporada_tipo ON public.grandes_premios(id_categoria,temporada_id,tipo_carrera);
COMMIT;

SELECT id_categoria,count(*) AS pilotos FROM public.pilotos_categorias GROUP BY id_categoria ORDER BY id_categoria;
