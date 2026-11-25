// Un resultado vacio no es una URL inexistente. Pruebas de regresion API F1.
// No requiere BD: se inyectan modelos de lectura vacios.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const cases=[
  {
    "file": "controllers/pilot.js",
    "methods": [
      "obtenerInfoPilotoPorId",
      "obtenerVictoriasPilotoPorID",
      "obtenerPodiosPilotoPorID",
      "obtenerTrayectoriaPilotoPorID"
    ],
    "empty": "[]"
  },
  {
    "file": "controllers/team.js",
    "methods": [
      "obtenerMonoplazaActualEquipo",
      "obtenerPilotoseEquipoTemporada",
      "obtenerInfoEquipoPorId",
      "obtenerDuplasPilotos",
      "obtenerVictoriasEquipoPorID"
    ],
    "empty": "[]"
  },
  {
    "file": "controllers/circuit.js",
    "methods": [
      "obtenerRecordPolePorId",
      "obtenerRecordVueltaPorId",
      "obtenerMaxVencedorPorId"
    ],
    "empty": "null"
  },
  {
    "file": "controllers/results.js",
    "methods": [
      "obtenerResultadoPorGPPorId"
    ],
    "empty": "[]"
  },
  {
    "file": "controllers/grandPrix.js",
    "methods": [
      "obtenerGPTemporadaPorId",
      "obtenerLastWinnerGP"
    ],
    "empty": "[]"
  },
  {
    "file": "controllers/pilotSeason.js",
    "methods": [
      "obtenerPilotosPorTemporadaPorId",
      "obtenerDuplaPilotos",
      "obtenerPilotosPorTemporadaYEquipoPorId"
    ],
    "empty": "[]"
  },
  {
    "file": "controllers/teamSeason.js",
    "methods": [
      "obtenerEquiposPorTemporadaPorId",
      "obtenerEquiposPorIDYPorTemporadaPorId"
    ],
    "empty": "[]"
  }
];
for(const entry of cases){
 const source=readFileSync(new URL('../'+entry.file,import.meta.url),'utf8');
 const className=source.match(/export class (\w+)/)?.[1];
 const modelName=source.match(/this\.(\w+Model)\s*=\s*Modelos\.(\w+Model)/)?.[2];
 assert.ok(className&&modelName,'Controlador sin clase/modelo '+entry.file);
 const Controller=runInNewContext(source.replaceAll('export ','')+'\n'+className+';',{});
 const model=new Proxy({}, {get(){return async()=>false;}});
 const controller=new Controller({[modelName]:model});
 for(const method of entry.methods){
   test(entry.file+' / '+method+' devuelve 200 sin datos', async()=>{
     const res={statusCode:200, status(code){this.statusCode=code;return this},
       json(value){this.body=value;return this}};
     await controller[method]({method:'GET',
       params:{id:1,anio:2026,Categoria:1,Anio:2026,idTemporada:3,idEquipo:2},body:{}},res);
     assert.equal(res.statusCode,200);
     assert.deepEqual(JSON.parse(JSON.stringify(res.body)),
        entry.empty==='null'?null:[]);
   });
 }
}
