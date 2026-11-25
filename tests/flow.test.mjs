// Regression tests for F1 App's category -> current season -> standings flow.
// Run: npm run test:flow
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../pages/main.html',import.meta.url),'utf8');
const script=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .find(x=>x[1].includes('temporada-actual'))?.[1];
assert.ok(script,'Falta el controlador de la página principal');

const node=(name='div')=>({
  nodeName:name,children:[],textContent:'',style:{},dataset:{},attributes:{},
  addEventListener(){},append(...xs){this.children.push(...xs)},
  replaceChildren(...xs){this.children=xs},
  setAttribute(k,v){this.attributes[k]=v},
  remove(){this.removed=true}
});

async function scenario({category=1,year=2026,fail=null}={}) {
 const ids=['gridGPs','gridWDC','gridWCC','anio','nextGPContainer',
    'nextGPName','nextGPDate','text-GP','nextGPFlag',
    'mainPage','teamsPage','driversPage','seasonPage'];
 const nodes=Object.fromEntries(ids.map(id=>[id,node()]));
 const live=node();
 const document={
  createElement:tag=>node(tag),
  getElementById:id=>nodes[id]||null,
  querySelector:selector=>selector==='.f1-live-chip'?live:null
 };
 const values=new Map(),requested=[];
 const sessionStorage={
  getItem:k=>values.get(k)||null,
  setItem:(k,v)=>values.set(k,String(v))
 };
 const window={
  location:{search:'?id='+category,assign(path){this.destination=path}},
  addEventListener(type,fn){if(type==='DOMContentLoaded')this.load=fn}
 };
 const fetch=async path=>{
  requested.push(path);
  if(fail==='temporada')return {ok:false,status:503};
  if(fail==='missing-new-route' && path.endsWith('/temporada-actual'))return {ok:false,status:404,json:async()=>({message:'Ruta no encontrada'})};
  if(fail==='all404')return {ok:false,status:404,json:async()=>({message:'Ruta no encontrada'})};
  if(path==='/api/temporada/')return {ok:true,json:async()=>[{anio:2026,id_Temporada:6},{anio:2025,id_Temporada:5}]};
  if(path.endsWith('/temporada-actual')){
    return {ok:true,json:async()=>({anio:year,id_Temporada:1,id_Categoria:category})};
  }
  if(fail==='pilotos'&&path.includes('obtenerWDCPorAnio'))
    return {ok:false,status:500};
  if(path.includes('obtenerGPTemporada'))return {ok:true,json:async()=>[
    {id_GP:6,Nombre_GP:'México',Nombre_Circuito:'Hermanos Rodríguez',
      fecha:year+'-10-25',Ganador:'VER'},
    {id_GP:7,Nombre_GP:'Abu Dabi',Nombre_Circuito:'Yas Marina',
      fecha:year+'-12-06',Ganador:'Aún no se disputa'}
  ]};
  if(path.includes('obtenerWDCPorAnio'))return {ok:true,json:async()=>[
    {id_Piloto:20,Nombre:'Lando Norris',nombre_completo:'Lando Norris',puntos_totales:'360.50'}
  ]};
  if(path.includes('obtenerWCCPorAnio'))return {ok:true,json:async()=>[
    {id_Equipo:4,equipo:'McLaren',puntos_totales:'500.00'}
  ]};
  throw Error('Ruta no simulada: '+path);
 };
 runInNewContext(script,{window,document,sessionStorage,fetch,URLSearchParams,
   console:{error(){},warn(){}},Intl,Date,setTimeout,clearTimeout});
 assert.ok(window.load,'No se registró el controlador DOMContentLoaded');
 await window.load();
 return {nodes,requested,values,window,live};
}

test('F1 muestra temporada disponible y paneles de 2026',async()=>{
 const a=await scenario();
 assert.equal(a.nodes.anio.textContent,'2026');
 assert.equal(a.nodes.gridGPs.children.length,2);
 assert.equal(a.nodes.gridWDC.children.length,1);
 assert.equal(a.nodes.gridWCC.children.length,1);
 assert.match(a.nodes.gridWDC.children[0].href,/categoria=1/);
 assert.equal(a.requested[0],'/api/categoria/1/temporada-actual');
});
test('otra categoría usa su propio año, no el año del sistema',async()=>{
 const a=await scenario({category:2,year:2024});
 assert.equal(a.nodes.anio.textContent,'2024');
 assert.ok(a.requested.every(x=>!x.includes('/2026')));
 assert.match(a.nodes.gridWCC.children[0].href,/categoria=2/);
});
test('un error de clasificación no borra calendario ni constructores',async()=>{
 const a=await scenario({fail:'pilotos'});
 assert.equal(a.nodes.gridGPs.children.length,2);
 assert.equal(a.nodes.gridWCC.children.length,1);
 assert.match(a.nodes.gridWDC.children[0].textContent,/No se pudieron cargar/);
});
test('un fallo al consultar Supabase muestra aviso en lugar de página vacía',async()=>{
 const a=await scenario({fail:'temporada'});
 assert.equal(a.nodes.anio.textContent,'—');
 assert.equal(a.requested.length,1);
 assert.match(a.nodes.gridGPs.children[0].textContent,/HTTP 503/);
});
test('404 al consultar temporada-actual usa rutas historicas',async()=>{
 const a=await scenario({fail:'missing-new-route'});
 assert.equal(a.nodes.anio.textContent,'2026');
 assert.ok(a.requested.includes('/api/temporada/'));
 assert.equal(a.nodes.gridGPs.children.length,2);
});
test('404 del proxy muestra error visible',async()=>{
 const a=await scenario({fail:'all404'});
 assert.equal(a.nodes.anio.textContent,'—');
 assert.ok(a.requested.includes('/api/temporada/'));
 assert.match(a.nodes.gridGPs.children[0].textContent,/HTTP 404/);
});
test('navegación y fichas nunca consumen localhost en producción',()=>{
 for(const name of ['main','team','pilotos','teams','circuitos','season','seasons']) {
  const page=readFileSync(new URL('../pages/'+name+'.html',import.meta.url),'utf8');
  assert.doesNotMatch(page,/http:\/\/localhost:1234/);
 }
});
test('fichas de equipos y temporada utilizan rutas GET públicas',()=>{
 const team=readFileSync(new URL('../pages/team.html',import.meta.url),'utf8');
 const season=readFileSync(new URL('../pages/season.html',import.meta.url),'utf8');
 assert.match(team,/\/estadisticas-pilotos\//);
 assert.match(team,/\/monoplazas/);
 assert.match(season,/\/duplaPilotos\//);
 assert.doesNotMatch(season,/"\/api\/pilotoTemporada\/duplaPilotos",/);
});
