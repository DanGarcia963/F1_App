/* F1_App Paddock UI | progressive enhancement, no API changes */
(() => {
  'use strict';
  const slug = (window.location.pathname.split('/').filter(Boolean).pop() || 'categories')
    .replace(/\.html$/i, '').toLowerCase();
  const map = { '':'categories','index':'categories','categories':'categories',
    'granpremio':'granpremio','gran_premio':'granpremio' };
  const page = map[slug] || slug;
  const params = new URLSearchParams(window.location.search);
  // En una ficha, ?id representa el piloto, equipo, circuito o GP; no la categoría.
  const isList = ['categories','main','seasons','pilotos','teams','circuitos'].includes(page);
  const category = params.get('categoria')
    || (isList ? params.get('id') : null)
    || sessionStorage.getItem('f1_categoria') || '1';
  const safeCategory = /^\d+$/.test(category) && Number(category) > 0 ? category : '1';
  sessionStorage.setItem('f1_categoria',safeCategory);
  document.body.dataset.f1Page = page;
  const pages = {
    categories: {
      eyebrow: 'WELCOME TO THE PADDOCK / FORMULA 1',
      title: 'Vive cada <em>décima.</em>',
      desc: 'Resultados, pilotos, escuderías y grandes premios. Toda la historia reciente de la Fórmula 1, en una experiencia diseñada para aficionados.',
      tags: ['PADDOCK HUB','DATOS DE COMPETICIÓN','TEMPORADA 2026']
    },
    main: {
      eyebrow: 'RACE CENTRE / LIVE DATA',
      title: 'La temporada <em>al límite.</em>',
      desc: 'El pulso de cada gran premio: calendario, clasificación de pilotos y la batalla de constructores en un solo lugar.',
      tags: ['CAMPEONATO','CLASIFICACIONES','GRANDES PREMIOS']
    },
    pilotos: {
      eyebrow: 'THE GRID / DRIVER DIRECTORY',
      title: 'Los nombres de <em>la parrilla.</em>',
      desc: 'Talento, carácter y velocidad. Explora a los protagonistas de la Fórmula 1 y entra en sus estadísticas.',
      tags: ['PILOTOS','PERFILES','ESTADÍSTICAS']
    },
    piloto: {
      eyebrow: 'DRIVER PROFILE / THE GRID',
      title: 'ADN de <em>piloto.</em>',
      desc: 'Una carrera contada en victorias, podios, poles y momentos decisivos.',
      tags: ['TRAYECTORIA','VICTORIAS','RÉCORDS']
    },
    teams: {
      eyebrow: 'THE GARAGE / CONSTRUCTORS',
      title: 'Ingeniería para <em>ganar.</em>',
      desc: 'Conoce las escuderías y sus historias. Rendimiento, talento y evolución de los monoplazas.',
      tags: ['EQUIPOS','CONSTRUCTORES','MONOPLAZAS']
    },
    team: {
      eyebrow: 'TEAM PROFILE / THE GARAGE',
      title: 'Dentro de <em>la escudería.</em>',
      desc: 'Pilotos, monoplazas, temporadas y los resultados que construyen un legado.',
      tags: ['HISTORIA','GARAJE','RESULTADOS']
    },
    seasons: {
      eyebrow: 'CHAMPIONSHIP ARCHIVE / SEASONS',
      title: 'Cada año, <em>una leyenda.</em>',
      desc: 'Explora temporada por temporada: campeones, equipos, grandes premios y las batallas que marcaron cada año.',
      tags: ['ARCHIVO','CAMPEONATOS','HISTORIA RECIENTE']
    },
    season: {
      eyebrow: 'CHAMPIONSHIP / SEASON REVIEW',
      title: 'Una temporada. <em>Mil historias.</em>',
      desc: 'Todas las piezas de un campeonato: calendario, parrilla, equipos y clasificación.',
      tags: ['CALENDARIO','PILOTOS','CONSTRUCTORES']
    },
    granpremio: {
      eyebrow: 'RACE WEEKEND / GRAND PRIX',
      title: 'La vuelta <em>decisiva.</em>',
      desc: 'Resultados, posiciones de salida y lo que sucedió en el circuito.',
      tags: ['RACE RESULTS','CLASIFICACIÓN','GRID']
    },
    circuitos: {
      eyebrow: 'RACE TRACKS / CIRCUIT DIRECTORY',
      title: 'Asfalto y <em>adrenalina.</em>',
      desc: 'Descubre cada trazado y conoce los escenarios donde se escriben las grandes historias.',
      tags: ['CIRCUITOS','TRAZADOS','RÉCORDS']
    },
    circuito: {
      eyebrow: 'TRACK PROFILE / GRAND PRIX',
      title: 'El arte del <em>trazado.</em>',
      desc: 'Longitud, curvas, poles y récords: cada curva tiene su historia.',
      tags: ['FICHA TÉCNICA','RÉCORDS','VELOCIDAD']
    }
  };
  const copy = pages[page] || pages.main;
  const navLinks = [
    {name:'Inicio', icon:'⌂',href:'/main?id='+safeCategory,active:page==='main'},
    {name:'Pilotos',icon:'01',href:'/pilotos?id='+safeCategory,active:page==='piloto'||page==='pilotos'},
    {name:'Equipos',icon:'02',href:'/teams?id='+safeCategory,active:page==='team'||page==='teams'},
    {name:'Temporadas',icon:'03',href:'/seasons?id='+safeCategory,active:page==='season'||page==='seasons'},
    {name:'Circuitos',icon:'04',href:'/circuitos?id='+safeCategory,active:page==='circuito'||page==='circuitos'}
  ];
  function el(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value != null) element.textContent = value;
    return element;
  }
  function link(label,href,className,active) {
    const a = el('a',className,label);
    a.href = href;
    if (active) a.setAttribute('aria-current','page');
    return a;
  }

  function buildHeader() {
    let header = document.querySelector('body > header');
    if (!header) {
      header = el('header','f1-topbar-fallback sticky top-0');
      document.body.prepend(header);
    } else {
      Array.from(header.children).forEach(node => {
        if (!node.matches('.f1-desktop-nav')) node.classList.add('f1-legacy-header');
      });
    }
    const navigation = el('div','f1-desktop-nav');
    const brand = el('a','f1-brand');
    brand.href = '/';
    brand.setAttribute('aria-label','F1 Paddock — inicio');
    brand.append(el('span','f1-brand-mark','F1'));
    const bLabel = el('span','f1-brand-name');
    bLabel.append(el('strong','', 'PADDOCK'),el('span','', 'DATA & RACING'));
    brand.append(bLabel);
    navigation.append(brand);
    const links = el('nav','f1-links');
    links.setAttribute('aria-label','Navegación principal');
    navLinks.forEach(x => links.append(link(x.name,x.href,'',x.active)));
    navigation.append(links);
    navigation.append(el('span','f1-live-chip','2026 / F1'));
    header.prepend(navigation);
    const refresh = document.getElementById('btnRefresh');
    if (refresh) {
      refresh.classList.add('f1-refresh');
      refresh.textContent = '↻ Actualizar';
      navigation.append(refresh);
      if (page === 'categories' && typeof window.cargarCategorias === 'function') {
        refresh.addEventListener('click', window.cargarCategorias);
      }
    }
    const gpHeading = document.getElementById('gpTitle');
    if (gpHeading) {
      gpHeading.classList.add('f1-gp-header-title');
      navigation.append(gpHeading);
    }
  }

  function buildHero() {
    const hero = el('section','f1-hero');
    hero.setAttribute('aria-label','Presentación de la sección');
    const wrap = el('div','f1-hero-content');
    const title = el('h1','f1-title');
    title.innerHTML = copy.title; // static authored copy, not user/API content
    const metadata = el('div','f1-meta');
    copy.tags.forEach(t => metadata.append(el('span','',t)));
    wrap.append(el('div','f1-kicker',copy.eyebrow),title,el('p','f1-desc',copy.desc),metadata);
    hero.append(wrap);
    document.querySelector('body > header')?.insertAdjacentElement('afterend',hero);
    const nextGP = document.getElementById('nextGPContainer');
    if (nextGP) {
      nextGP.classList.add('f1-next-gp');
      hero.append(nextGP);
    }
  }
  function buildMobileNav() {
    const dock = el('nav','f1-mobile-dock');
    dock.setAttribute('aria-label','Navegación para móviles');
    navLinks.forEach(x => {
      const a = link('',x.href,'',x.active);
      a.append(el('span','',x.icon),el('span','',x.name));
      dock.append(a);
    });
    document.body.append(dock);
  }

  const cardHosts = [
    'categoriaGrid','gridPilotos','gridEquipos','gridCircuitos','gridSeasons',
    'gridDriverSeason','gridTeamSeason','gridGPs','gridVictories','gridPodios',
    'gridTrayectoria','gridDuplas','gridWDC','gridWCC','gridLastWinner'
  ];
  function enrichImages(root) {
    const images = [];
    if (root instanceof HTMLImageElement) images.push(root);
    if (root.querySelectorAll) images.push(...root.querySelectorAll('img:not([data-f1-enhanced])'));
    images.forEach(img => {
      if (img.dataset.f1Enhanced) return;
      img.dataset.f1Enhanced = '1';
      img.decoding = 'async';
      if (!img.hasAttribute('loading') && !img.closest('header')) img.loading = 'lazy';
      img.addEventListener('error', () => {
        img.classList.add('f1-image-fallback');
        const holder = img.parentElement;
        if (holder && holder !== document.body && !holder.classList.contains('f1-brand')) {
          holder.classList.add('f1-image-empty');
        }
      });
      img.addEventListener('load', () => {
        img.classList.remove('f1-image-fallback');
        img.parentElement?.classList.remove('f1-image-empty');
      });
    });
  }
  function enrichCards(root) {
    for (const name of cardHosts) {
      const parent = root.id === name ? root : (root.querySelector ? root.querySelector('#'+name) : null);
      if (!parent) continue;
      for (const card of parent.children) {
        if (card.dataset.f1Card) continue;
        card.dataset.f1Card = '1';
        if (card.classList.contains('cursor-pointer') && !card.matches('a,button')) {
          card.tabIndex = 0;
          card.setAttribute('role','link');
          card.addEventListener('keydown', e => {
            if (e.target === card && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();card.click();
            }
          });
        }
      }
    }
  }
  function enhance() {
    enrichImages(document);
    enrichCards(document);
  }
  function observeDynamicContent() {
    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        enhance();
      });
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  buildHeader();
  buildHero();
  buildMobileNav();
  enhance();
  observeDynamicContent();
})();
