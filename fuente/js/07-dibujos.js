/* =========================================================
   7. DIBUJOS EN SVG
   Planetas, fases de la Luna, la nave de Pipo, monedas y billetes,
   relojes y objetos para medir. Todo dibujado aquí: sin imágenes externas.
   ========================================================= */
let contadorSVG = 0;
const idSVG = base => base + (++contadorSVG);

/* Datos de dibujo de cada cuerpo del sistema solar (versión 4: con atmósfera y más detalle) */
const ASTROS = {
  mercurio: { nombre: 'Mercurio', c1: '#D6CBC0', c2: '#6F625A' },
  venus: { nombre: 'Venus', c1: '#FFF1C9', c2: '#D38C3A', halo: '#FFE2A0' },
  tierra: { nombre: 'Tierra', c1: '#5CBCFF', c2: '#163F9E', halo: '#7CC8FF' },
  luna: { nombre: 'Luna', c1: '#F4F4F8', c2: '#8E8EA6' },
  marte: { nombre: 'Marte', c1: '#FF9E6E', c2: '#982F18', halo: '#FF9A7A' },
  jupiter: { nombre: 'Júpiter', c1: '#F7E6C8', c2: '#B5764A', halo: '#F5D6A8' },
  saturno: { nombre: 'Saturno', c1: '#FAEBC0', c2: '#C29548', halo: '#F6E2A8' },
  urano: { nombre: 'Urano', c1: '#D4FBF8', c2: '#3FA9BC', halo: '#B8FFF8' },
  neptuno: { nombre: 'Neptuno', c1: '#8DB0FF', c2: '#1A2FA6', halo: '#7FA1FF' },
  sol: { nombre: 'Sol', c1: '#FFF8C4', c2: '#FF7F1A' },
  pluton: { nombre: 'Plutón', c1: '#EED8C0', c2: '#94705A' }
};

/* Banda ondulada (para los gigantes de gas): de y1 a y2, con olas */
function bandaSVG(y1, y2, color, op, ola, fase) {
  ola = ola || 2.4; fase = fase || 0;
  let d = 'M0 ' + y1;
  for (let x = 0; x <= 120; x += 10) d += ' L' + x + ' ' + (y1 + Math.sin(x / 13 + fase) * ola).toFixed(1);
  for (let x = 120; x >= 0; x -= 10) d += ' L' + x + ' ' + (y2 + Math.sin(x / 11 + fase + 1.7) * ola).toFixed(1);
  return '<path d="' + d + 'Z" fill="' + color + '" opacity="' + (op === undefined ? 1 : op) + '"/>';
}

/* Un planeta en un lienzo de 120 x 120 (círculo de radio 40 en el centro).
   op.mini = sin detalles finos (para el mapa en pantallas pequeñas) */
function planetaSVG(id, op) {
  op = op || {};
  const a = ASTROS[id] || ASTROS.tierra;
  const g = idSVG('pg'), sombra = idSVG('ps'), recorte = idSVG('pc'), halo = idSVG('ph');
  const fino = !op.mini;
  let defs = '<radialGradient id="' + g + '" cx="34%" cy="30%" r="80%"><stop offset="0" stop-color="' + a.c1 + '"/><stop offset="1" stop-color="' + a.c2 + '"/></radialGradient>' +
    '<radialGradient id="' + sombra + '" cx="30%" cy="27%" r="88%"><stop offset=".44" stop-color="#0B0530" stop-opacity="0"/><stop offset=".8" stop-color="#0B0530" stop-opacity=".46"/><stop offset="1" stop-color="#0B0530" stop-opacity=".74"/></radialGradient>' +
    '<clipPath id="' + recorte + '"><circle cx="60" cy="60" r="40"/></clipPath>';
  if (a.halo) defs += '<radialGradient id="' + halo + '"><stop offset=".62" stop-color="' + a.halo + '" stop-opacity=".75"/><stop offset=".74" stop-color="' + a.halo + '" stop-opacity=".22"/><stop offset="1" stop-color="' + a.halo + '" stop-opacity="0"/></radialGradient>';
  let detras = a.halo ? '<circle cx="60" cy="60" r="54" fill="url(#' + halo + ')"/>' : '', cuerpo = '', delante = '';
  const R = 'clip-path="url(#' + recorte + ')"';
  const crater = (x, y, r, osc, claro) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + osc + '" opacity=".55"/>' +
    (fino ? '<path d="M' + (x - r * 0.8) + ' ' + (y + r * 0.45) + ' A' + r + ' ' + r + ' 0 0 0 ' + (x + r * 0.85) + ' ' + (y + r * 0.35) + '" stroke="' + claro + '" stroke-width="1.5" fill="none" opacity=".85"/>' +
      '<path d="M' + (x - r * 0.75) + ' ' + (y - r * 0.2) + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + r * 0.3) + ' ' + (y - r * 0.85) + '" stroke="#000" stroke-width="1.2" fill="none" opacity=".18"/>' : '');

  switch (id) {
    case 'tierra':
      cuerpo = '<g ' + R + '>' +
        '<path d="M26 34 C34 26 46 28 50 36 C54 44 46 48 48 56 C50 64 42 72 36 68 C28 62 22 56 24 48 C25 42 22 38 26 34 Z" fill="#46C46E"/>' +
        '<path d="M30 52 C34 50 38 54 36 60 C34 64 30 62 30 58Z" fill="#D9C27A" opacity=".85"/>' +
        '<path d="M62 24 C72 20 86 26 90 36 C93 44 84 48 78 46 C72 44 66 40 62 34 C60 30 58 26 62 24 Z" fill="#46C46E"/>' +
        '<path d="M64 60 C72 56 84 60 88 70 C91 80 82 90 74 88 C66 86 60 76 62 68 C62 64 62 62 64 60 Z" fill="#3BAE60"/>' +
        '<path d="M74 66 C78 66 80 70 78 74 C76 76 72 74 72 70Z" fill="#D9C27A" opacity=".8"/>' +
        '<path d="M44 88 C52 84 64 86 70 94 L40 96 Z" fill="#46C46E"/>' +
        '<ellipse cx="60" cy="21" rx="20" ry="5.5" fill="#F4FBFF"/><ellipse cx="60" cy="99" rx="18" ry="5" fill="#F4FBFF"/>' +
        (fino ? '<path d="M22 72 C30 66 40 70 46 66" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".85"/>' +
          '<path d="M54 46 C62 40 74 44 80 40 C84 38 88 40 90 44" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>' +
          '<path d="M50 80 C58 76 66 80 72 78" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".75"/>' +
          '<path d="M30 30 C34 28 38 30 40 28" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>' : '') +
        '</g>';
      break;
    case 'luna':
    case 'mercurio': {
      const luna = id === 'luna';
      const osc = luna ? '#8C8CA6' : '#5E5048', claro = luna ? '#FFFFFF' : '#E6DCD2';
      const mares = luna ? '<path d="M36 40 C44 32 56 36 56 44 C56 52 46 54 40 52 C34 50 32 44 36 40Z M60 58 C68 52 80 56 80 64 C80 72 70 76 64 72 C58 68 56 62 60 58Z" fill="#A8A8BE" opacity=".55"/>' :
        '<path d="M30 56 C40 50 50 58 48 66 C46 72 36 72 32 68 C28 64 26 60 30 56Z" fill="#8E8077" opacity=".45"/>';
      const crat = luna ? [[44, 46, 6], [74, 38, 4.5], [68, 72, 8], [40, 76, 4.5], [86, 60, 3.5], [56, 58, 3], [30, 60, 3.5], [60, 88, 4]]
        : [[46, 38, 5.5], [72, 46, 7.5], [52, 74, 6.5], [82, 70, 4], [34, 58, 4], [64, 26, 4], [60, 58, 3], [42, 90, 3.5], [88, 48, 3]];
      cuerpo = '<g ' + R + '>' + mares + crat.map(c => crater(c[0], c[1], c[2], osc, claro)).join('') + '</g>';
      break;
    }
    case 'marte':
      cuerpo = '<g ' + R + '>' +
        '<path d="M20 52 C32 42 46 52 58 48 C70 44 76 54 90 50 L100 58 L20 66 Z" fill="#8E2E16" opacity=".5"/>' +
        '<path d="M30 76 C42 70 54 80 66 76 C78 72 86 80 96 78 L96 96 L30 96 Z" fill="#8E2E16" opacity=".45"/>' +
        '<path d="M36 64 C46 60 58 66 72 62" stroke="#6E2210" stroke-width="2.4" fill="none" opacity=".6" stroke-linecap="round"/>' +
        '<ellipse cx="58" cy="21" rx="15" ry="5.5" fill="#FFF6F0" opacity=".95"/>' +
        (fino ? crater(42, 36, 4, '#7A2A12', '#FFC0A0') + crater(78, 68, 3.5, '#7A2A12', '#FFC0A0') + crater(70, 36, 2.6, '#7A2A12', '#FFC0A0') +
          '<path d="M74 30 L80 28 L84 32" stroke="#C25A36" stroke-width="2" fill="none" opacity=".7"/>' : '') +
        '</g>';
      break;
    case 'jupiter':
      cuerpo = '<g ' + R + '>' +
        bandaSVG(22, 28, '#E7C29A', 0.9, 1.5, 0) + bandaSVG(32, 39, '#C98F5A', 0.9, 2.2, 1) + bandaSVG(42, 46, '#FBF0DC', 0.9, 1.6, 2) +
        bandaSVG(50, 60, '#B9774A', 0.85, 2.6, 3) + bandaSVG(64, 68, '#FBF0DC', 0.8, 1.6, 4) + bandaSVG(72, 80, '#C98F5A', 0.85, 2.2, 5) +
        bandaSVG(84, 89, '#E7C29A', 0.85, 1.4, 6) + bandaSVG(92, 100, '#B9774A', 0.7, 2, 7) +
        '<ellipse cx="76" cy="70" rx="11" ry="6.5" fill="#F2B090"/><ellipse cx="76" cy="70" rx="8.5" ry="4.8" fill="#C9472C"/><ellipse cx="74.5" cy="69" rx="4" ry="2.2" fill="#E2774F"/>' +
        (fino ? '<path d="M30 56 C36 52 42 58 48 55 M58 36 C64 34 70 38 76 36" stroke="#FBF0DC" stroke-width="1.6" fill="none" opacity=".7"/>' : '') +
        '</g>';
      break;
    case 'saturno': {
      const anillo = (mitad) => {
        const sw = mitad === 'atras' ? 1 : 0;
        const arco = (rx, ry) => 'M' + (60 - rx) + ' 60 A' + rx + ' ' + ry + ' 0 0 ' + sw + ' ' + (60 + rx) + ' 60';
        return '<g transform="rotate(-16 60 60)">' +
          '<path d="' + arco(58, 15.5) + '" stroke="#C8AC6E" stroke-width="4" fill="none" opacity=".85"/>' +
          '<path d="' + arco(53, 14) + '" stroke="#F1E2B4" stroke-width="5" fill="none"/>' +
          '<path d="' + arco(47.5, 12.4) + '" stroke="#D9C084" stroke-width="2.4" fill="none" opacity=".9"/>' +
          (fino ? '<path d="' + arco(44, 11.4) + '" stroke="#FFF6DA" stroke-width="2" fill="none" opacity=".7"/>' : '') + '</g>';
      };
      detras = (a.halo ? '<circle cx="60" cy="60" r="50" fill="url(#' + halo + ')" opacity=".6"/>' : '') + anillo('atras');
      cuerpo = '<g ' + R + '>' + bandaSVG(30, 36, '#E3C27E', 0.75, 1.2, 0) + bandaSVG(42, 48, '#F7E7BC', 0.8, 1.2, 1) + bandaSVG(52, 60, '#D7B46A', 0.7, 1.4, 2) +
        bandaSVG(66, 72, '#F7E7BC', 0.7, 1.2, 3) + bandaSVG(78, 86, '#C9A35E', 0.6, 1.2, 4) +
        '<path d="M14 70 A58 15 0 0 0 108 54" stroke="#6E5420" stroke-width="5" fill="none" opacity=".28" transform="rotate(-16 60 60)"/></g>';
      delante = anillo('delante');
      break;
    }
    case 'urano':
      detras = '<path d="M60 4 A10 56 0 0 0 60 116" stroke="#E6FBFA" stroke-width="2" fill="none" opacity=".5" transform="rotate(-8 60 60)"/>' + detras;
      cuerpo = '<g ' + R + '>' + bandaSVG(34, 40, '#EFFFFE', 0.3, 1, 0) + bandaSVG(70, 78, '#3196A8', 0.3, 1, 2) + '<ellipse cx="60" cy="24" rx="18" ry="6" fill="#F2FFFE" opacity=".35"/></g>';
      delante = '<path d="M60 4 A10 56 0 0 1 60 116" stroke="#F2FFFE" stroke-width="2.4" fill="none" opacity=".8" transform="rotate(-8 60 60)"/>';
      break;
    case 'neptuno':
      cuerpo = '<g ' + R + '>' + bandaSVG(30, 36, '#A9C1FF', 0.4, 1.4, 0) + bandaSVG(56, 66, '#2442C8', 0.6, 2, 1) + bandaSVG(80, 88, '#3355D6', 0.45, 1.6, 2) +
        '<ellipse cx="46" cy="50" rx="9" ry="5.5" fill="#101B6E" opacity=".85"/>' +
        (fino ? '<path d="M44 42 C50 40 56 42 60 40" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".85"/><path d="M66 70 C72 68 78 70 84 68" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".75"/>' : '') + '</g>';
      break;
    case 'venus':
      cuerpo = '<g ' + R + '>' +
        '<path d="M14 40 C30 30 44 46 62 38 C80 30 92 44 106 36" stroke="#FFF4D6" stroke-width="7" fill="none" opacity=".75"/>' +
        '<path d="M14 58 C30 50 48 66 64 58 C80 50 92 62 106 56" stroke="#E2A855" stroke-width="8" fill="none" opacity=".6"/>' +
        '<path d="M18 76 C36 70 50 84 66 76 C80 70 90 80 102 76" stroke="#FFF4D6" stroke-width="6" fill="none" opacity=".6"/>' +
        (fino ? '<path d="M24 88 C40 84 54 94 70 90 C80 88 88 92 96 90" stroke="#E2A855" stroke-width="5" fill="none" opacity=".5"/><path d="M30 26 C40 22 52 28 62 24" stroke="#FFF4D6" stroke-width="4" fill="none" opacity=".6"/>' : '') +
        '</g>';
      break;
    case 'pluton':
      cuerpo = '<g ' + R + '><path d="M62 82 C46 70 44 58 52 54 C57 51 61 55 62 58 C63 55 67 51 72 54 C80 58 78 70 62 82 Z" fill="#F8ECDC" opacity=".9"/>' +
        crater(40, 44, 4, '#7A5A44', '#F8ECDC') + '</g>';
      break;
    case 'sol': {
      const corona = idSVG('sh'), nucleo = idSVG('sn');
      defs += '<radialGradient id="' + corona + '"><stop offset=".5" stop-color="#FFD54A" stop-opacity=".9"/><stop offset=".7" stop-color="#FFB02E" stop-opacity=".35"/><stop offset="1" stop-color="#FF8A1F" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="' + nucleo + '" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="#FFFBE0"/><stop offset=".45" stop-color="#FFD84A"/><stop offset="1" stop-color="#FF8A1F"/></radialGradient>';
      let rayos = '';
      for (let i = 0; i < 16; i++) {
        const ang = i * Math.PI / 8, larg = i % 2 ? 52 : 59;
        const x1 = 60 + Math.cos(ang - 0.1) * 43, y1 = 60 + Math.sin(ang - 0.1) * 43;
        const x2 = 60 + Math.cos(ang) * larg, y2 = 60 + Math.sin(ang) * larg;
        const x3 = 60 + Math.cos(ang + 0.1) * 43, y3 = 60 + Math.sin(ang + 0.1) * 43;
        rayos += '<path d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' L' + x3.toFixed(1) + ' ' + y3.toFixed(1) + ' Z" fill="' + (i % 2 ? '#FFC23A' : '#FFA41F') + '"/>';
      }
      detras = '<circle cx="60" cy="60" r="60" fill="url(#' + corona + ')"/><g class="sol-rayos">' + rayos + '</g>';
      cuerpo = '<circle cx="60" cy="60" r="40" fill="url(#' + nucleo + ')"/>' + (fino ? '<g ' + R + '>' +
        [[44, 70, 6], [74, 46, 4], [70, 78, 3], [52, 44, 3], [84, 66, 3.5], [36, 54, 2.5]].map(c => '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#FF9A1F" opacity=".35"/>').join('') + '</g>' : '');
      break;
    }
    default: break;
  }
  const radio = 40;
  const rim = id === 'sol' ? '' : '<path d="M24 52 A37 37 0 0 1 52 23" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".38"/>';
  return '<svg class="astro astro-' + id + '" viewBox="0 0 120 120" aria-hidden="true"><defs>' + defs + '</defs>' + detras +
    '<circle cx="60" cy="60" r="' + radio + '" fill="url(#' + g + ')"/>' + cuerpo +
    (id === 'sol' ? '' : '<circle cx="60" cy="60" r="' + radio + '" fill="url(#' + sombra + ')"/>') + rim +
    '<ellipse cx="45" cy="38" rx="10" ry="5.5" fill="#fff" opacity="' + (id === 'sol' ? '.4' : '.2') + '" transform="rotate(-32 45 38)"/>' +
    delante + '</svg>';
}

/* Planeta "girando tumbado" o "de pie" (pregunta de Urano): eje dibujado */
function planetaEjeSVG(tumbado) {
  const eje = tumbado ? '<path d="M8 60 L112 60" stroke="#FF5DA2" stroke-width="4" stroke-dasharray="6 5"/><path d="M104 52 L114 60 L104 68" stroke="#FF5DA2" stroke-width="4" fill="none" stroke-linecap="round"/>'
    : '<path d="M60 8 L60 112" stroke="#FF5DA2" stroke-width="4" stroke-dasharray="6 5"/><path d="M52 16 L60 6 L68 16" stroke="#FF5DA2" stroke-width="4" fill="none" stroke-linecap="round"/>';
  return planetaSVG('urano').replace('</svg>', eje + '</svg>');
}

/* Fases de la Luna: llena, nueva, creciente (iluminada a la derecha), menguante (a la izquierda) */
function lunaFaseSVG(fase) {
  const luz = '#F4F1D8', sombra = '#4A4373';
  let iluminada = '';
  if (fase === 'llena') iluminada = '<circle cx="60" cy="60" r="40" fill="' + luz + '"/>';
  else if (fase === 'creciente') iluminada = '<path d="M60 20 A40 40 0 0 1 60 100 A22 40 0 0 0 60 20 Z" fill="' + luz + '"/>';
  else if (fase === 'menguante') iluminada = '<path d="M60 20 A40 40 0 0 0 60 100 A22 40 0 0 1 60 20 Z" fill="' + luz + '"/>';
  else if (fase === 'cuarto') iluminada = '<path d="M60 20 A40 40 0 0 1 60 100 Z" fill="' + luz + '"/>';
  return '<svg class="astro luna-fase" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="40" fill="' + sombra + '" stroke="#8C84C2" stroke-width="2"/>' +
    iluminada + (fase === 'llena' ? '<circle cx="48" cy="48" r="7" fill="#DCD8B8"/><circle cx="72" cy="70" r="9" fill="#DCD8B8"/><circle cx="74" cy="44" r="4" fill="#DCD8B8"/>' : '') + '</svg>';
}

/* ---------- La nave de Pipo: crece con una pieza por mundo ---------- */
function naveSVG(piezas, colorId, op) {
  op = op || {};
  const tiene = id => piezas.indexOf(id) >= 0;
  const color = (COLORES_NAVE.find(c => c.id === colorId) || COLORES_NAVE[0]).hex;
  const borde = tono(color, -0.22);
  const p = Guardado.p;
  const colorPipo = ((COLORES_PIPO.find(c => c.id === (p && p.pipo.color)) || COLORES_PIPO[0]).hex);
  const sil = 'fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-dasharray="7 6"';
  const parte = (id, dibujo, silueta) => tiene(id) ? '<g class="pieza pieza-' + id + '">' + dibujo + '</g>' : (op.siluetas ? '<g class="hueco-pieza" data-pieza="' + id + '">' + silueta + '</g>' : '');
  let s = '<svg class="nave-svg" viewBox="0 0 200 300" aria-hidden="true">';
  // Paneles solares (detrás)
  s += parte('panel',
    '<rect x="6" y="128" width="40" height="64" rx="5" fill="#2D5BD6" stroke="#1B3A9C" stroke-width="3"/><path d="M6 150 H46 M6 170 H46 M26 128 V192" stroke="#7FA1FF" stroke-width="2"/>' +
    '<rect x="154" y="128" width="40" height="64" rx="5" fill="#2D5BD6" stroke="#1B3A9C" stroke-width="3"/><path d="M154 150 H194 M154 170 H194 M174 128 V192" stroke="#7FA1FF" stroke-width="2"/>' +
    '<path d="M46 160 H62 M138 160 H154" stroke="#9C9CB0" stroke-width="5"/>',
    '<rect x="6" y="128" width="40" height="64" rx="5" ' + sil + '/><rect x="154" y="128" width="40" height="64" rx="5" ' + sil + '/>');
  // Propulsores laterales
  s += parte('propulsores',
    '<rect x="44" y="180" width="22" height="66" rx="11" fill="#E9E4FF" stroke="#9B7BF7" stroke-width="3"/><path d="M44 236 h22 l-4 14 h-14 z" fill="#6B4FD0"/>' +
    '<rect x="134" y="180" width="22" height="66" rx="11" fill="#E9E4FF" stroke="#9B7BF7" stroke-width="3"/><path d="M134 236 h22 l-4 14 h-14 z" fill="#6B4FD0"/>',
    '<rect x="44" y="180" width="22" height="66" rx="11" ' + sil + '/><rect x="134" y="180" width="22" height="66" rx="11" ' + sil + '/>');
  // Alas
  s += parte('alas',
    '<path d="M64 186 L30 248 L68 238 Z" fill="#FF5DA2" stroke="#D93A80" stroke-width="3" stroke-linejoin="round"/><path d="M136 186 L170 248 L132 238 Z" fill="#FF5DA2" stroke="#D93A80" stroke-width="3" stroke-linejoin="round"/>',
    '<path d="M64 186 L30 248 L68 238 Z" ' + sil + '/><path d="M136 186 L170 248 L132 238 Z" ' + sil + '/>');
  // Motor y llama
  s += parte('motor',
    '<path d="M74 246 h52 l8 22 h-68 z" fill="#5A5A78" stroke="#3B3B55" stroke-width="3" stroke-linejoin="round"/>' +
    '<g class="llama"><path d="M78 268 Q100 316 122 268 Z" fill="#FF9F43"/><path d="M88 268 Q100 300 112 268 Z" fill="#FFE58A"/></g>',
    '<path d="M74 246 h52 l8 22 h-68 z" ' + sil + '/>');
  // Cuerpo (siempre)
  s += '<path d="M100 40 C138 76 142 150 134 246 L66 246 C58 150 62 76 100 40 Z" fill="' + color + '" stroke="' + borde + '" stroke-width="4"/>';
  // Escudo térmico (banda inferior)
  s += parte('escudo', '<path d="M66 222 H134 L134 246 H66 Z" fill="#FFC93C" stroke="#D99A00" stroke-width="3"/><path d="M76 222 V246 M92 222 V246 M108 222 V246 M124 222 V246" stroke="#D99A00" stroke-width="2"/>',
    '<path d="M66 222 H134 L134 246 H66 Z" ' + sil + '/>');
  // Luces
  s += parte('luces', ['#FF5DA2', '#3FB2F2', '#2FD18E', '#FFC93C'].map((c, i) => '<circle class="luz" style="--i:' + i + '" cx="' + (76 + i * 16) + '" cy="206" r="5" fill="' + c + '"/>').join(''),
    [0, 1, 2, 3].map(i => '<circle cx="' + (76 + i * 16) + '" cy="206" r="5" ' + sil + '/>').join(''));
  // Ventana con Pipo
  s += parte('ventana',
    '<circle cx="100" cy="140" r="30" fill="#3FB2F2" stroke="#1C84C2" stroke-width="6"/><circle cx="100" cy="148" r="20" fill="' + colorPipo + '"/>' +
    '<circle cx="93" cy="144" r="6" fill="#fff"/><circle cx="107" cy="144" r="6" fill="#fff"/><circle cx="94" cy="145" r="3" fill="#2A1E5C"/><circle cx="108" cy="145" r="3" fill="#2A1E5C"/>' +
    '<path d="M93 154 Q100 160 107 154" stroke="#2A1E5C" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M84 124 Q90 118 98 118" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>',
    '<circle cx="100" cy="140" r="30" ' + sil + '/>');
  // Radar
  s += parte('radar', '<path d="M138 104 Q160 92 168 112 Z" fill="#E9E4FF" stroke="#9B7BF7" stroke-width="3"/><path d="M146 106 L136 116" stroke="#9B7BF7" stroke-width="4"/><circle cx="160" cy="104" r="3" fill="#FF5DA2"/>',
    '<path d="M138 104 Q160 92 168 112 Z" ' + sil + '/>');
  // Punta
  s += parte('punta', '<path d="M100 40 C116 54 126 72 130 90 L70 90 C74 72 84 54 100 40 Z" fill="#FF5DA2" stroke="#D93A80" stroke-width="3"/>',
    '<path d="M100 40 C116 54 126 72 130 90 L70 90 C74 72 84 54 100 40 Z" ' + sil + '/>');
  // Antena
  s += parte('antena', '<path d="M100 42 L100 12" stroke="#9C9CB0" stroke-width="5" stroke-linecap="round"/><circle class="antena-luz" cx="100" cy="10" r="8" fill="#FFC93C"/>',
    '<path d="M100 42 L100 12" ' + sil + '/><circle cx="100" cy="10" r="8" ' + sil + '/>');
  return s + '</svg>';
}

/* ---------- Dinero: monedas de 1 y 2 euros, billetes de 5, 10 y 20 ---------- */
function dineroSVG(valor) {
  if (valor === 1 || valor === 2) {
    const exterior = valor === 1 ? '#E1B740' : '#D8DDE6';
    const interior = valor === 1 ? '#D8DDE6' : '#E1B740';
    const g = idSVG('mg');
    return '<svg class="dinero moneda m' + valor + '" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="' + g + '" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
      '<circle cx="50" cy="50" r="46" fill="' + exterior + '" stroke="' + tono(exterior, -0.3) + '" stroke-width="3"/>' +
      '<circle cx="50" cy="50" r="31" fill="' + interior + '" stroke="' + tono(interior, -0.25) + '" stroke-width="2"/>' +
      '<text x="50" y="62" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="34" fill="#2A1E5C">' + valor + '€</text>' +
      '<circle cx="50" cy="50" r="46" fill="url(#' + g + ')"/></svg>';
  }
  const colores = { 5: ['#C9D6CF', '#7C9A8C'], 10: ['#F2B0A0', '#C05A45'], 20: ['#A9C5EE', '#3E6DB5'] };
  const c = colores[valor] || colores[5];
  return '<svg class="dinero billete b' + valor + '" viewBox="0 0 160 84" aria-hidden="true">' +
    '<rect x="3" y="3" width="154" height="78" rx="10" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="4"/>' +
    '<rect x="12" y="12" width="136" height="60" rx="6" fill="none" stroke="' + c[1] + '" stroke-width="2" stroke-dasharray="5 4" opacity=".6"/>' +
    '<circle cx="120" cy="42" r="18" fill="' + c[1] + '" opacity=".25"/>' +
    '<text x="62" y="58" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="40" fill="#2A1E5C">' + valor + '€</text></svg>';
}

/* ---------- Reloj de agujas ---------- */
function relojSVG(h, m, op) {
  op = op || {};
  const angH = ((h % 12) * 30 + m * 0.5) * Math.PI / 180;
  const angM = m * 6 * Math.PI / 180;
  let numeros = '';
  for (let i = 1; i <= 12; i++) {
    const a = i * Math.PI / 6;
    numeros += '<text x="' + (60 + Math.sin(a) * 38).toFixed(1) + '" y="' + (60 - Math.cos(a) * 38 + 5.5).toFixed(1) + '" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="15" fill="#2A1E5C">' + i + '</text>';
  }
  let marcas = '';
  for (let i = 0; i < 60; i += 5) {
    const a = i * 6 * Math.PI / 180;
    marcas += '<circle cx="' + (60 + Math.sin(a) * 50).toFixed(1) + '" cy="' + (60 - Math.cos(a) * 50).toFixed(1) + '" r="1.6" fill="#9B7BF7"/>';
  }
  // Minutos alrededor de la esfera (nivel de 7 a 8 años): 5, 10, 15...
  let minutos = '';
  if (op.minutos) {
    for (let i = 0; i < 60; i += 5) {
      const a = i * 6 * Math.PI / 180;
      minutos += '<text class="min-txt" x="' + (60 + Math.sin(a) * 67).toFixed(1) + '" y="' + (60 - Math.cos(a) * 67 + 3.6).toFixed(1) + '" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="10" fill="#E2368A">' + String(i).padStart(2, '0') + '</text>';
    }
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const a = i * 6 * Math.PI / 180;
      marcas += '<circle cx="' + (60 + Math.sin(a) * 50.5).toFixed(1) + '" cy="' + (60 - Math.cos(a) * 50.5).toFixed(1) + '" r=".8" fill="#C9B8FF"/>';
    }
  }
  const xh = 60 + Math.sin(angH) * 24, yh = 60 - Math.cos(angH) * 24;
  const xm = 60 + Math.sin(angM) * 36, ym = 60 - Math.cos(angM) * 36;
  return '<svg class="reloj-svg' + (op.minutos ? ' con-minutos' : '') + (op.verMinutos ? ' ver-min' : '') + '" viewBox="' + (op.minutos ? '-18 -18 156 156' : '0 0 120 120') + '" aria-hidden="true">' +
    (op.minutos ? '<circle cx="60" cy="60" r="77" class="min-aro" fill="#FFF0F7" opacity="0"/>' + minutos : '') +
    '<circle cx="60" cy="60" r="56" fill="#fff" stroke="' + (op.borde || '#9B7BF7') + '" stroke-width="6"/>' + marcas + numeros +
    '<line class="aguja-m" x1="60" y1="60" x2="' + xm.toFixed(1) + '" y2="' + ym.toFixed(1) + '" stroke="#FF5DA2" stroke-width="4.5" stroke-linecap="round"/>' +
    '<line class="aguja-h" x1="60" y1="60" x2="' + xh.toFixed(1) + '" y2="' + yh.toFixed(1) + '" stroke="#2A1E5C" stroke-width="7" stroke-linecap="round"/>' +
    '<circle cx="60" cy="60" r="5" fill="#2A1E5C"/></svg>';
}

/* ---------- Objetos que se miden en cubos (se estiran a lo largo) ---------- */
function objetoMedirSVG(tipo, color) {
  const c = color || '#FF9F43';
  switch (tipo) {
    case 'lapiz':
      return '<svg class="medible" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="3" width="84" height="14" fill="' + c + '"/><rect x="0" y="3" width="8" height="14" fill="#FF8FB8"/><rect x="8" y="3" width="4" height="14" fill="#C9C9D6"/><path d="M84 3 L100 10 L84 17 Z" fill="#F4D7A8"/><path d="M95 8 L100 10 L95 12 Z" fill="#2A1E5C"/></svg>';
    case 'gusano':
      return '<svg class="medible" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="2" width="100" height="16" rx="8" fill="' + c + '"/><rect x="0" y="9" width="100" height="2" fill="#fff" opacity=".35"/></svg>';
    case 'tubo':
      return '<svg class="medible" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="2" width="100" height="16" rx="4" fill="' + c + '"/><rect x="0" y="4" width="100" height="4" fill="#fff" opacity=".35"/></svg>';
    default:
      return '<svg class="medible" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="2" width="100" height="16" rx="8" fill="' + c + '"/></svg>';
  }
}

/* Roca lunar (para la misión de la Luna) */
function rocaSVG(variante) {
  const formas = [
    'M14 60 C10 40 26 22 46 20 C66 18 84 30 88 50 C92 70 76 84 52 84 C30 84 18 76 14 60 Z',
    'M12 56 C14 34 34 18 56 22 C78 26 90 44 86 64 C82 82 60 88 40 84 C22 80 10 72 12 56 Z',
    'M18 66 C8 48 22 26 42 24 C54 22 60 14 74 22 C90 30 92 56 80 72 C68 88 30 86 18 66 Z'
  ];
  const d = formas[(variante || 0) % formas.length];
  return '<svg class="roca" viewBox="0 0 100 100" aria-hidden="true"><path d="' + d + '" fill="#B9B5CF" stroke="#7E78A3" stroke-width="4"/>' +
    '<circle cx="40" cy="48" r="7" fill="#9A95B8"/><circle cx="62" cy="62" r="5" fill="#9A95B8"/><path d="M30 38 Q40 30 52 32" stroke="#E6E3F3" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';
}
