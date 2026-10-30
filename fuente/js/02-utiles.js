/* =========================================================
   2. UTILIDADES
   ========================================================= */
const $ = (selector, raiz) => (raiz || document).querySelector(selector);
const $$ = (selector, raiz) => Array.prototype.slice.call((raiz || document).querySelectorAll(selector));

/* Azar: en las pruebas automáticas se usa una semilla para poder repetir los resultados */
const Azar = {
  semilla: 0,
  sembrar(s) { this.semilla = s >>> 0; },
  aleatorio() {
    if (!this.semilla) return Math.random();
    // mulberry32: rápido y suficiente para un juego
    let t = (this.semilla = (this.semilla + 0x6D2B79F5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
};
const rnd = () => Azar.aleatorio();
const azar = (min, max) => Math.floor(rnd() * (max - min + 1)) + min;
const elegir = lista => lista[Math.floor(rnd() * lista.length)];
const esperar = ms => new Promise(resolver => setTimeout(resolver, ms));
/* En las pruebas automáticas las esperas se acortan */
const T = ms => (MODO_PRUEBA && typeof Pruebas !== 'undefined' && Pruebas.rapido ? Math.min(ms, 20) : ms);
const limitar = (v, min, max) => Math.max(min, Math.min(max, v));
const rango = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
/* Id de la frase grabada de un número. Hasta 100 (y las centenas exactas) hay una frase;
   el resto se compone: 342 = «trescientos» + «cuarenta y dos». */
const N = n => {
  n = Math.round(Number(n));
  if (n <= 100 || n > 1000 || n % 100 === 0) return 'n' + n;
  return ['cc' + (Math.floor(n / 100) * 100), 'n' + (n % 100)];
};
/* Aplana listas de frases (algunas partes, como N(342), son a su vez listas) */
function aplanar(lista) {
  const r = [];
  (function meter(x) { if (Array.isArray(x)) x.forEach(meter); else if (x !== undefined && x !== null && x !== false && x !== '') r.push(x); })(lista);
  return r;
}

function barajar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = copia[i]; copia[i] = copia[j]; copia[j] = t;
  }
  return copia;
}

/* Crea un elemento con clase y contenido HTML opcional */
function crear(etiqueta, clase, html) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (html !== undefined && html !== null) el.innerHTML = html;
  return el;
}

/* Botón con tipo y etiqueta accesible */
function boton(clase, html, etiqueta, alTocar) {
  const b = crear('button', clase, html);
  b.type = 'button';
  if (etiqueta) b.setAttribute('aria-label', etiqueta);
  if (alTocar) b.addEventListener('click', alTocar);
  return b;
}

/* Oscurece (f < 0) o aclara (f > 0) un color hexadecimal */
function tono(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  const h = v => ('0' + Math.round(limitar(v, 0, 255)).toString(16)).slice(-2);
  return '#' + h(r) + h(g) + h(b);
}

/* Texto seguro para meter en HTML (nombres de perfiles escritos por los padres) */
function escapar(texto) {
  return String(texto === undefined || texto === null ? '' : texto)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* Fecha local en formato AAAA-MM-DD */
function hoyISO(fecha) {
  const d = fecha || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function diasEntre(a, b) {
  const pa = a.split('-').map(Number), pb = b.split('-').map(Number);
  const fa = new Date(pa[0], pa[1] - 1, pa[2]), fb = new Date(pb[0], pb[1] - 1, pb[2]);
  return Math.round((fb - fa) / 86400000);
}
/* Número sencillo a partir de un texto (para elegir las misiones del día sin azar) */
function huella(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* Opciones de respuesta: la correcta y otras cercanas, ordenadas de menor a mayor */
function opcionesCercanas(respuesta, min, max, total) {
  const candidatos = [];
  [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6].forEach(d => {
    const v = respuesta + d;
    if (v >= min && v <= max && candidatos.indexOf(v) < 0) candidatos.push(v);
  });
  const cercanos = barajar(candidatos.slice(0, 4)).slice(0, total - 1);
  return cercanos.concat([respuesta]).sort((a, b) => a - b);
}

/* Opciones para números de dos cifras: errores típicos (cifras al revés, una decena de más o de menos) */
function opcionesDosCifras(respuesta, min, max, total) {
  const d = Math.floor(respuesta / 10), u = respuesta % 10;
  const tipicos = [];
  const anadir = v => { if (v >= min && v <= max && v !== respuesta && tipicos.indexOf(v) < 0) tipicos.push(v); };
  if (u !== d && u > 0) anadir(u * 10 + d);
  anadir(respuesta + 10);
  anadir(respuesta - 10);
  anadir(respuesta + 1);
  anadir(respuesta - 1);
  anadir(respuesta + 2);
  anadir(respuesta - 2);
  const elegidas = barajar(tipicos.slice(0, 4)).slice(0, total - 1);
  return elegidas.concat([respuesta]).sort((a, b) => a - b);
}

/* Elige la mejor rejilla (columnas y tamaño de celda) para n elementos en un hueco W x H */
function medirRejilla(W, H, n, aspecto, hueco) {
  aspecto = aspecto || 1;
  hueco = hueco || 6;
  let mejor = { alto: 0, ancho: 0, cols: 1, filas: n };
  for (let cols = 1; cols <= Math.max(1, n); cols++) {
    const filas = Math.ceil(n / cols);
    const w = (W - hueco * (cols - 1)) / cols;
    const h = (H - hueco * (filas - 1)) / filas;
    const alto = Math.min(w / aspecto, h);
    if (alto > mejor.alto + 0.5) mejor = { alto: alto, ancho: alto * aspecto, cols: cols, filas: filas };
  }
  return mejor;
}

/* Fusiona datos guardados con los valores por defecto (por si faltan campos nuevos) */
function fusionar(base, guardado) {
  if (!guardado || typeof guardado !== 'object') return base;
  Object.keys(base).forEach(k => {
    if (!(k in guardado)) return;
    const b = base[k], g = guardado[k];
    if (b && typeof b === 'object' && !Array.isArray(b) && g && typeof g === 'object' && !Array.isArray(g)) {
      base[k] = Object.keys(b).length ? fusionar(b, g) : g;
    } else if (Array.isArray(b)) {
      if (Array.isArray(g)) base[k] = g;
    } else if (typeof g === typeof b || b === null) {
      base[k] = g;
    }
  });
  return base;
}

/* Base64 -> ArrayBuffer (para los clips de voz) */
function base64ABuffer(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

/* ---------- Progreso de un perfil (usado también por las medallas) ---------- */
function registroMundo(p, id) {
  if (!p.mundos[id]) p.mundos[id] = { niveles: {}, casa: 'no', visto: false };
  return p.mundos[id];
}
function nivelHecho(p, mundoId, tipoId) {
  const m = p.mundos[mundoId];
  return !!(m && m.niveles[tipoId] && m.niveles[tipoId].mejor > 0);
}
function mundoTerminado(p, i) {
  return nivelHecho(p, MUNDOS[i].id, 'proyecto');
}
function mundosTerminados(p) {
  return MUNDOS.filter((m, i) => mundoTerminado(p, i)).length;
}
function contarTresEstrellas(p) {
  let n = 0;
  Object.keys(p.mundos).forEach(id => {
    const niv = p.mundos[id].niveles;
    Object.keys(niv).forEach(t => { if (niv[t].mejor >= 3) n++; });
  });
  return n;
}
function retosCasaHechos(p) {
  return Object.keys(p.mundos).filter(id => p.mundos[id].casa === 'hecho').length;
}
function estrellasMundo(p, mundoId) {
  const m = p.mundos[mundoId];
  if (!m) return 0;
  return TIPOS_NIVEL.reduce((s, t) => s + ((m.niveles[t.id] && m.niveles[t.id].mejor) || 0), 0);
}
function rangoDe(p) {
  const n = mundosTerminados(p);
  let r = 0;
  RANGOS.forEach((x, i) => { if (n >= x.mundos) r = i; });
  return r;
}
