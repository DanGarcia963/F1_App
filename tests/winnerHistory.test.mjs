import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');

function loadModel(fakeConnection){
  const script=read('models/PostgreSQL/grandPrix.js')
    .replace(/^import .+$/gm,'').replaceAll('export ','');
  return runInNewContext(script+'\nGPModel;', {connectionPostgres:fakeConnection});
}
function loadController(){
  const script=read('controllers/grandPrix.js').replaceAll('export ','');
  return runInNewContext(script+'\nGPController;',{});
}

test('ganadores anteriores se consultan por id, circuito, categoria y fecha',async()=>{
  let sql,params;
  const Model=loadModel({query:async(q,p)=>{
    sql=q;params=p;
    return [[{id_GP:34,anio:2025,Winners:'Max Verstappen',Circuito:'Suzuka'}]];
  }});
  const result=await Model.obtenerLastWinnerGPPorId(110);
  assert.equal(result[0].Winners,'Max Verstappen');
  assert.deepEqual(Array.from(params),[110]);
  assert.match(sql,/hist\.circuito_id\s*=\s*actual\.circuito_id/);
  assert.match(sql,/hist\.id_categoria\s*=\s*actual\.id_categoria/);
  assert.match(sql,/hist\.fecha\s*<\s*actual\.fecha/);
  assert.match(sql,/hist\.tipo_carrera\s*=\s*'GP'/);
  assert.match(sql,/r\.posicion_final\s*=\s*1/);
  assert.doesNotMatch(sql,/hist\.nombre_oficial\s*=\s*actual\.nombre_oficial/);
});
test('circuito sin carreras historicas responde lista vacia',async()=>{
  const GP=loadModel({query:async()=>[[]]});
  const Controller=loadController();
  const instance=new Controller({GPModel:GP});
  const response={
    statusCode:200,
    status(code){this.statusCode=code;return this;},
    json(value){this.value=value;return this;}
  };
  await instance.obtenerLastWinnerGPPorId({params:{id:'8'}},response);
  assert.equal(response.statusCode,200);
  assert.deepEqual(JSON.parse(JSON.stringify(response.value)),[]);
});
test('la ruta historica esta declarada junto con su controlador',()=>{
  const routes=read('routes/grandPrix.js');
  assert.match(routes,/get\('\/obtenerLastWinnersPorGp\/:id'/);
  assert.match(routes,/gpController\.obtenerLastWinnerGPPorId/);
});
test('resultados incluyen piloto y equipo para construir podio',()=>{
  const results=read('models/PostgreSQL/results.js');
  assert.match(results,/p\.id_piloto AS "id_Piloto"/);
  assert.match(results,/AS "nombre_piloto"/);
  assert.match(results,/r\.puntos_obtenidos/);
  assert.match(results,/posicion_final ASC NULLS LAST/);
});
