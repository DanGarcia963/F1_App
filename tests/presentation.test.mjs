import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const gp=read('pages/gran_Premio.html');
const pilot=read('pages/piloto.html');
const seasons=read('pages/seasons.html');
const css=read('public/styles/f1-premium.css');
class FakeNode {
  constructor(tag='div',value=''){
    this.tag=tag;this.textContent=String(value);this.children=[];
    this.style={};this.attributes={};this.hidden=false;this.className='';
  }
  append(...items){this.children.push(...items)}
  replaceChildren(...items){this.children=items}
  setAttribute(key,value){this.attributes[key]=value}
  addEventListener(){}
  remove(){}
}
function create(tag,cls,text){
  const n=new FakeNode(tag,text??'');n.className=cls||'';return n;
}
function renderers(){
  const from=gp.indexOf('  function renderPodium(data){');
  const to=gp.indexOf('  if (Array.isArray(resultados) && resultados.length > 0)',from);
  assert.ok(from>0&&to>from,'No se hallaron las funciones de resultados');
  const nodes={podiumSection:new FakeNode(),restResultsContainer:new FakeNode()};
  const resultsBody=new FakeNode('tbody');
  const document={createElement:t=>new FakeNode(t),getElementById:key=>nodes[key]||null};
  const load=new Function('document','createElement','portrait','pointValue',
    'numberValue','anio','idCategoria','location','resultadosBody',
    gp.slice(from,to)+'\nreturn {renderPodium,renderOtherResults};');
  const display=load(document,create,(name,year,cls)=>create('img',cls),
    n=>Number(n??0)+' pts',(value,fallback='—')=>value==null?fallback:String(value),
    2026,1,{assign(){}},resultsBody);
  return {...display,nodes,resultsBody};
}
const ranked=[
 {nombre_piloto:'Piloto A',equipo:'Equipo A',posicion_final:1,puntos_obtenidos:25},
 {nombre_piloto:'Piloto B',equipo:'Equipo B',posicion_final:2,puntos_obtenidos:18},
 {nombre_piloto:'Piloto C',equipo:'Equipo C',posicion_final:3,puntos_obtenidos:15},
 {nombre_piloto:'Piloto D',equipo:'Equipo D',posicion_final:4,puntos_obtenidos:12},
 {nombre_piloto:'Piloto E',equipo:'Equipo E',posicion_final:null,puntos_obtenidos:0}
];
test('podio se ordena P2, P1, P3 y la tabla inicia con P4',()=>{
 const {nodes,resultsBody,renderPodium,renderOtherResults}=renderers();
 renderPodium(ranked);renderOtherResults(ranked);
 const stage=nodes.podiumSection.children.find(c=>c.className==='gp-podium-stage');
 assert.deepEqual(stage.children.map(c=>c.children[0].textContent),['P2','P1','P3']);
 assert.deepEqual(resultsBody.children.map(r=>r.children[0].textContent),['4','NC']);
 assert.equal(resultsBody.children[1].children[5].textContent,'0 pts');
});
test('podio vacío se oculta, pero los resultados sin posición siguen visibles',()=>{
 const {nodes,resultsBody,renderPodium,renderOtherResults}=renderers();
 renderPodium(ranked.slice(3));renderOtherResults(ranked.slice(3));
 assert.equal(nodes.podiumSection.hidden,true);
 assert.equal(resultsBody.children.length,2);
});
test('historial utiliza id de GP y no su nombre oficial',()=>{
 assert.match(gp,/\/api\/granPremio\/obtenerLastWinnersPorGp\//);
 assert.doesNotMatch(gp,/fetch\(\`\/api\/granPremio\/obtenerLastWinners\/\$\{nombreGP\}/);
});
test('temporadas y estadisticas tienen estilos fluidos',()=>{
 assert.match(seasons,/class="season-cards"/);
 assert.match(seasons,/season-card-year/);
 assert.match(pilot,/class="driver-stats-grid"/);
 assert.match(pilot,/id="puntosPromedio"/);
 assert.match(css,/#gridSeasons\.season-cards/);
 assert.match(css,/\.gp-podium-stage/);
 assert.match(css,/\.driver-stats-grid/);
 assert.match(css,/@media\(max-width:650px\)/);
});
test('fechas no muestran ISO largo ni alteran el dia UTC',()=>{
 assert.match(gp,/dateLabel\(row\.fecha\)/);
 assert.match(gp,/String\(data\.fecha \|\| ''\)\.slice\(0,10\)/);
 assert.match(pilot,/formatHistoricDate\(infoPiloto\.fecha_nacimiento\)/);
});
