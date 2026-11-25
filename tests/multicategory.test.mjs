import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
function model(file,name,query){
 const src=readFileSync(new URL('../models/PostgreSQL/'+file+'.js',import.meta.url),'utf8').replace(/^[ \t]*import .*$/gm,'').replace('export class ','class ');
 return runInNewContext(src+'\n'+name+';', {connectionPostgres:{query}});
}
test('pilot reads scope by category and use matching placeholders',async()=>{
 const calls=[];
 const m=model('pilot','PilotModel',async(sql,params)=>{calls.push({sql,params});return [[]]});
 await m.obtenerTodosLosPilotos(2);
 await m.obtenerPilotoPorId(1,2);
 await m.obtenerInfoPilotoPorId(1,2);
 await m.obtenerVictoriasPilotoPorID(1,2);
 await m.obtenerPodiosPilotoPorID(1,2);
 await m.obtenerTrayectoriaPilotoPorID(1,2);
 for(const c of calls){assert.equal((c.sql.match(/\?/g)||[]).length,c.params.length);assert.ok(c.params.includes(2));}
});
test('F2 championship requires official reconciled standings',async()=>{
 const m=model('grandPrix','GPModel',async(sql,params)=>{
   assert.match(sql,/clasificacion_verificada/);
   assert.equal(params[0],2);return [[]];
 });
 assert.equal((await m.obtenerCampeonatoPilotosPorAnio(2,2025)).length,0);
 assert.equal((await m.obtenerCampeonatoConstructoresPorAnio(2,2025)).length,0);
});
