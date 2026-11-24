import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, 'dist');
const backendRaw = (process.env.BACKEND_URL || '').trim();

if (!backendRaw) {
  throw new Error('Falta BACKEND_URL. Configura en Netlify la URL publica de Railway, por ejemplo https://tu-api.up.railway.app');
}

let backendUrl;
try {
  backendUrl = new URL(backendRaw);
} catch {
  throw new Error('BACKEND_URL no es una URL valida: ' + backendRaw);
}

if (!['https:', 'http:'].includes(backendUrl.protocol)
    || backendUrl.username || backendUrl.password
    || backendUrl.pathname !== '/' || backendUrl.search || backendUrl.hash) {
  throw new Error('BACKEND_URL debe ser el origen de Railway, sin ruta, parametros ni credenciales: https://tu-api.up.railway.app');
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const folder of ['Driver_photos', 'Team_photos', 'Logos']) {
  fs.cpSync(path.join(root, folder), path.join(output, folder), { recursive: true });
}
fs.cpSync(path.join(root, 'public', 'styles'), path.join(output, 'styles'), { recursive: true });
fs.copyFileSync(path.join(root, 'scripts', 'admin-fetch.js'), path.join(output, 'admin-fetch.js'));

const redirects = ['/api/* ' + backendUrl.origin + '/api/:splat 200'];
const pagesDir = path.join(root, 'pages');
const pages = fs.readdirSync(pagesDir).filter(name => name.endsWith('.html')).sort();

for (const name of pages) {
  let html = fs.readFileSync(path.join(pagesDir, name), 'utf8');
  html = html.replace(/href=(["'])styles\/style\.css\1/g, 'href="/styles/style.css"');
  html = html.replace(/<head\b[^>]*>/i, match => match + '\n  <script src="/admin-fetch.js"></script>');
  const targetName = name === 'categories.html' ? 'index.html' : name;
  fs.writeFileSync(path.join(output, targetName), html, 'utf8');

  if (name !== 'categories.html') {
    const route = name.slice(0, -5);
    redirects.push('/' + route + ' /' + name + ' 200');
    redirects.push('/' + route + '/ /' + name + ' 200');
  }
}

// Compatibilidad con la ruta original de Express (archivo gran_Premio.html).
redirects.push('/granPremio /gran_Premio.html 200');
redirects.push('/granPremio/ /gran_Premio.html 200');
fs.writeFileSync(path.join(output, '_redirects'), redirects.join('\n') + '\n');
console.log('Frontend construido: ' + pages.length + ' paginas, recursos multimedia y API proxy -> ' + backendUrl.origin);
