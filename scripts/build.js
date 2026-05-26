const fs = require('fs');
const path = require('path');
const CryptoJS = require('crypto-js');

const required = ['NOMBRE', 'EMAIL', 'MOVIL', 'NIT', 'PASSWORD'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('Faltan variables de entorno: ' + missing.join(', '));
  process.exit(1);
}

const datos = {
  nombre: process.env.NOMBRE,
  email: process.env.EMAIL,
  movil: process.env.MOVIL,
  nit: process.env.NIT,
  firma: process.env.FIRMA || process.env.NOMBRE,
};

const encrypted = CryptoJS.AES.encrypt(
  JSON.stringify(datos),
  process.env.PASSWORD
).toString();

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });

fs.copyFileSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));
fs.copyFileSync(path.join(root, 'styles.css'), path.join(dist, 'styles.css'));

const appJs = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const out = appJs.replace('"__ENCRYPTED_DATA__"', JSON.stringify(encrypted));
fs.writeFileSync(path.join(dist, 'app.js'), out);
