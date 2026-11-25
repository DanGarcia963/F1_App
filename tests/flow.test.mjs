// API regressions for category-specific seasons and safe public reads.
// No database credentials are needed: queries are simulated, not executed.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
function evaluateModel(file,globalName,mock){
 const source=read('models/PostgreSQL/'+file+'.js')
   .replace(/^import .*$/gm,'').replace('export class ', 'class ');
 const context={connectionPostgres:mock};
 const model=runInNewContext(source+'\n'+globalName+';',context);
 return model;
}
test('temporada actual se obtiene desde PostgreSQL y respeta categoría',async()=>{
 let statement='',params;
 const Model=evaluateModel('categories','CategoriesModel',{
   async query(s,p){statement=s;params=p;return [[{
     id_Temporada:6,anio:2026,finalizada:0,grandes_premios:23
   }]];}
 });
 const result=await Model.obtenerTemporadaActual(1);
 assert.equal(result.anio,2026);
 assert.deepEqual([...params],[1]);
 assert.match(statement,/gp\.id_categoria\s*=\s*\?/);
 assert.match(statement,/ORDER BY t\.anio DESC/);
});
test('estadísticas por equipo solo cuentan carreras de su temporada y equipo',async()=>{
 let statement='',params;
 const Model=evaluateModel('team','TeamModel',{
  async query(s,p){statement=s;params=p;return [[{
    id_Piloto:42,nombre_completo:'Piloto de ejemplo',victorias:3,podios:8
  }]];}
 });
 const result=await Model.obtenerPilotoseEquipoTemporada({entrada:{idEquipo:12,anio:2026}});
 assert.equal(result.length,1);
 assert.deepEqual([...params],[12,2026]);
 assert.match(statement,/gp\.temporada_id\s*=\s*t\.id_temporada/);
 assert.match(statement,/gp\.tipo_carrera\s*=\s*'GP'/);
 assert.match(statement,/COALESCE\(r\.equipo_id,\s*pt\.equipo_id\)/);
});
test('lecturas de temporada, monoplazas y duplas tienen rutas GET',()=>{
 const cat=read('routes/categories.js');
 const team=read('routes/team.js');
 const pilotSeason=read('routes/pilotSeason.js');
 assert.match(cat,/\.get\('\/:id\/temporada-actual'/);
 assert.match(team,/\.get\('\/:id\/monoplazas'/);
 assert.match(team,/\.get\('\/:id\/estadisticas-pilotos\/:anio'/);
 assert.match(pilotSeason,/\.get\('\/duplaPilotos\/:idTemporada\/:idEquipo'/);
});
test('las consultas GP en el calendario excluyen sprint duplicadas',()=>{
 const gp=read('models/PostgreSQL/grandPrix.js');
 assert.match(gp,/gp\.tipo_carrera\s*=\s*'GP'/);
});
