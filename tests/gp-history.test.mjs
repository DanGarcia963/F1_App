import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const model = read('models/MySQL/grandPrix.js');
const controller = read('controllers/grandPrix.js');
const routes = read('routes/grandPrix.js');
const results = read('models/MySQL/results.js');

test('historial por identificador del GP, sin coincidencia literal del patrocinador', () => {
  const from = model.indexOf('static async obtenerLastWinnersPorGp(');
  const to = model.indexOf('static async registrarGP(', from);
  assert.ok(from > -1 && to > from);
  const query = model.slice(from, to);
  assert.match(query, /gp\.circuito_id = actual\.circuito_id/);
  assert.match(query, /gp\.id_Categoria = actual\.id_Categoria/);
  assert.match(query, /COALESCE\(gp\.tipo_carrera/);
  assert.match(query, /r\.posicion_final = 1/);
  assert.match(query, /temporada\.anio < temporadaActual\.anio/);
  assert.doesNotMatch(query, /nombre_oficial\s*=/);
  assert.match(query, /\[idGP\]/);
});
test('API expone el endpoint al frontend y valida el parámetro', () => {
  assert.match(routes, /get\('\/obtenerLastWinnersPorGp\/:id'/);
  assert.match(controller, /Number\.isSafeInteger\(idGP\)/);
  assert.match(controller, /this\.gpModel\.obtenerLastWinnersPorGp\(idGP\)/);
});
test('resultados incluyen el ID del piloto para enlazar su podio', () => {
  assert.match(results, /p\.id_Piloto AS id_Piloto/);
});
