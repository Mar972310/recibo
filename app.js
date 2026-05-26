// ===== Número a letras (Español) =====
function numeroALetras(num, moneda = 'COP') {
  num = Math.floor(Math.abs(num));
  const unidad = moneda === 'USD'
    ? (num === 1 ? 'dólar' : 'dólares')
    : (num === 1 ? 'peso' : 'pesos');
  if (num === 0) return "cero " + unidad;

  const UNIDADES = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
    "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
    "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
  const DECENAS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const CENTENAS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

  function seccion(n) {
    if (n < 30) return UNIDADES[n];
    if (n < 100) {
      const d = Math.floor(n / 10), u = n % 10;
      return DECENAS[d] + (u ? " y " + UNIDADES[u] : "");
    }
    if (n === 100) return "cien";
    const c = Math.floor(n / 100), r = n % 100;
    return CENTENAS[c] + (r ? " " + seccion(r) : "");
  }

  function miles(n) {
    if (n < 1000) return seccion(n);
    const m = Math.floor(n / 1000), r = n % 1000;
    const milTxt = m === 1 ? "mil" : seccion(m) + " mil";
    return milTxt + (r ? " " + seccion(r) : "");
  }

  function millones(n) {
    if (n < 1000000) return miles(n);
    const mi = Math.floor(n / 1000000), r = n % 1000000;
    const miTxt = mi === 1 ? "un millón" : miles(mi) + " millones";
    return miTxt + (r ? " " + miles(r) : "");
  }

  let txt = millones(num) + " " + unidad;
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

function formatoNumero(n) {
  return n.toLocaleString('es-CO');
}

// ===== Trayectos =====
const trayectosDiv = document.getElementById('trayectos');
let trayectoCount = 0;

function addTrayecto(inicio = "", fin = "", valor = "", paradas = []) {
  trayectoCount++;
  const div = document.createElement('div');
  div.className = 'trayecto';
  div.dataset.tipo = 'trayecto';
  div.innerHTML = `
    <div class="trayecto-head">
      <span>Trayecto ${trayectoCount}</span>
      <button class="del-btn" onclick="this.closest('.trayecto').remove(); actualizar();">×</button>
    </div>
    <div class="trayecto-grid three">
      <input type="text" class="t-inicio" placeholder="Inicio (ej: aeropuerto)" value="${inicio}" oninput="actualizar()" />
      <input type="text" class="t-fin" placeholder="Fin (ej: hotel)" value="${fin}" oninput="actualizar()" />
      <input type="number" class="t-valor" placeholder="Valor" value="${valor}" oninput="actualizar()" />
    </div>
    <div class="paradas-list"></div>
    <button class="add-parada" onclick="addParada(this)">+ Agregar parada</button>
  `;
  trayectosDiv.appendChild(div);
  const list = div.querySelector('.paradas-list');
  paradas.forEach(p => addParadaTo(list, p));
  actualizar();
}

function addServicioHoras() {
  trayectoCount++;
  const div = document.createElement('div');
  div.className = 'trayecto';
  div.dataset.tipo = 'horas';
  div.innerHTML = `
    <div class="trayecto-head">
      <span>Servicio por horas</span>
      <button class="del-btn" onclick="this.closest('.trayecto').remove(); actualizar();">×</button>
    </div>
    <input type="text" class="t-desc" placeholder="Descripción (opcional)" oninput="actualizar()" style="margin-bottom:6px;" />
    <div class="trayecto-grid" style="grid-template-columns: 1fr 1fr 1fr;">
      <input type="number" class="t-horas" placeholder="Horas (opcional)" oninput="onHorasPrecioChange(this)" />
      <input type="number" class="t-precio" placeholder="Precio/hora" oninput="onHorasPrecioChange(this)" />
      <input type="number" class="t-valor" placeholder="Valor" oninput="actualizar()" />
    </div>
  `;
  trayectosDiv.appendChild(div);
  actualizar();
}

function onHorasPrecioChange(input) {
  const card = input.closest('.trayecto');
  const horas = parseFloat(card.querySelector('.t-horas').value) || 0;
  const precio = parseFloat(card.querySelector('.t-precio').value) || 0;
  const valorInput = card.querySelector('.t-valor');
  if (horas > 0 && precio > 0) {
    valorInput.value = horas * precio;
  }
  actualizar();
}

function addParada(btn) {
  const list = btn.previousElementSibling;
  addParadaTo(list, "");
  actualizar();
}

function addParadaTo(list, value) {
  const row = document.createElement('div');
  row.className = 'parada-row';
  row.innerHTML = `
    <input type="text" placeholder="Parada intermedia" value="${value}" oninput="actualizar()" />
    <button class="del-btn" onclick="this.parentElement.remove(); actualizar();">×</button>
  `;
  list.appendChild(row);
}

function actualizar() {
  const moneda = document.getElementById('moneda').value;
  document.getElementById('rMoneda').textContent = moneda;

  const num = document.getElementById('numero').value || "";
  document.getElementById('rNumero').textContent = num;

  document.getElementById('rCancela').textContent = document.getElementById('cancela').value || "";

  const fechaRaw = document.getElementById('fecha').value;
  if (fechaRaw) {
    const [y, m, d] = fechaRaw.split('-');
    document.getElementById('rFecha').textContent = `${d}/${m}/${y}`;
  } else {
    document.getElementById('rFecha').textContent = '';
  }

  const items = trayectosDiv.querySelectorAll('.trayecto');
  let total = 0;
  const partes = [];
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  items.forEach(it => {
    const val = parseFloat(it.querySelector('.t-valor').value) || 0;
    total += val;
    if (it.dataset.tipo === 'horas') {
      const desc = cap(it.querySelector('.t-desc').value.trim()) || 'Servicio por horas';
      const horas = parseFloat(it.querySelector('.t-horas').value) || 0;
      const precio = parseFloat(it.querySelector('.t-precio').value) || 0;
      let texto = desc;
      if (horas > 0 && precio > 0) {
        texto = `${desc}: ${horas} ${horas === 1 ? 'hora' : 'horas'} a $${formatoNumero(precio)} c/u`;
      }
      if (val > 0 || desc) partes.push(`${texto} (${formatoNumero(val)})`);
    } else {
      const inicio = cap(it.querySelector('.t-inicio').value.trim());
      const fin = cap(it.querySelector('.t-fin').value.trim());
      const paradas = Array.from(it.querySelectorAll('.parada-row input'))
        .map(i => cap(i.value.trim()))
        .filter(Boolean);
      const tramo = [inicio, ...paradas, fin].filter(Boolean).join(' - ');
      if (tramo) partes.push(`${tramo} (${formatoNumero(val)})`);
    }
  });
  document.getElementById('rTrayectos').textContent = partes.length ? partes.join(' / ') : '';

  const conceptoUser = document.getElementById('concepto').value.trim();
  let conceptoFinal = conceptoUser;
  if (!conceptoUser && partes.length > 0) {
    conceptoFinal = partes.length === 1 ? 'Servicio de transporte' : 'Servicios de transporte';
  }
  document.getElementById('rConcepto').textContent = conceptoFinal;
  document.getElementById('rValor').textContent = formatoNumero(total);

  const letras = numeroALetras(total, moneda);
  document.getElementById('rLetras').innerHTML = `${letras} &nbsp;&nbsp; (${formatoNumero(total)})`;

  document.getElementById('totalPreview').textContent = (moneda === 'USD' ? 'US$ ' : '$ ') + formatoNumero(total);
  document.getElementById('letrasPreview').textContent = letras;
}

// ===== Datos sensibles =====
const ENCRYPTED_DATA = "__ENCRYPTED_DATA__";
const CAMPOS_SENSIBLES = ['rNombre', 'rEmail', 'rMovil', 'rFirma', 'rNit'];
let datosDesbloqueados = null;

function pintarSensibles() {
  CAMPOS_SENSIBLES.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (datosDesbloqueados) {
      el.classList.remove('locked');
      el.textContent = mapDatoAField(id);
    } else {
      el.classList.add('locked');
      el.textContent = '';
    }
  });
}

function mapDatoAField(id) {
  const d = datosDesbloqueados;
  if (!d) return '';
  switch (id) {
    case 'rNombre': return d.nombre || '';
    case 'rEmail': return d.email || '';
    case 'rMovil': return d.movil || '';
    case 'rFirma': return d.firma || d.nombre || '';
    case 'rNit': return d.nit || '';
  }
  return '';
}

// ===== Modal contraseña =====
function abrirModalPwd() {
  document.getElementById('pwdErr').textContent = '';
  document.getElementById('pwdInput').value = '';
  document.getElementById('modalPwd').classList.add('open');
  setTimeout(() => document.getElementById('pwdInput').focus(), 50);
}

function cerrarModalPwd() {
  document.getElementById('modalPwd').classList.remove('open');
}

function validarPwd() {
  const pwd = document.getElementById('pwdInput').value;
  const err = document.getElementById('pwdErr');
  err.textContent = '';

  if (!ENCRYPTED_DATA || ENCRYPTED_DATA === '__' + 'ENCRYPTED_DATA__') {
    err.textContent = 'Datos no configurados. Despliega con GitHub Actions.';
    return;
  }
  if (!pwd) { err.textContent = 'Ingresa la contraseña.'; return; }

  try {
    const bytes = CryptoJS.AES.decrypt(ENCRYPTED_DATA, pwd);
    const txt = bytes.toString(CryptoJS.enc.Utf8);
    if (!txt) throw new Error('bad pwd');
    datosDesbloqueados = JSON.parse(txt);
  } catch (e) {
    err.textContent = 'Contraseña incorrecta.';
    return;
  }

  cerrarModalPwd();
  pintarSensibles();
  const num = document.getElementById('numero').value || 'recibo';
  document.title = `recibo-caja-${num}`;
  setTimeout(() => window.print(), 100);
}

window.addEventListener('afterprint', () => {
  datosDesbloqueados = null;
  pintarSensibles();
});

function generarPDF() {
  abrirModalPwd();
}

// ===== Listeners =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('numero').addEventListener('input', actualizar);
  document.getElementById('fecha').addEventListener('change', actualizar);
  document.getElementById('cancela').addEventListener('input', actualizar);
  document.getElementById('concepto').addEventListener('input', actualizar);
  document.getElementById('moneda').addEventListener('change', actualizar);
  document.getElementById('pwdInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') validarPwd();
    if (e.key === 'Escape') cerrarModalPwd();
  });

  pintarSensibles();
  actualizar();
});
