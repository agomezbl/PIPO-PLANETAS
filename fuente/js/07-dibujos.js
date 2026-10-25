/* =========================================================
   7. DIBUJOS EN SVG
   Planetas, fases de la Luna, la nave de Pipo, monedas y billetes,
   relojes y objetos para medir. Todo dibujado aquí: sin imágenes externas.
   ========================================================= */
let contadorSVG = 0;
const idSVG = base => base + (++contadorSVG);

/* Datos de dibujo de cada cuerpo del sistema solar */
const ASTROS = {
  mercurio: { nombre: 'Mercurio', c1: '#C9BCAF', c2: '#7D6E63' },
  venus: { nombre: 'Venus', c1: '#FBE3A6', c2: '#D99A4A' },
  tierra: { nombre: 'Tierra', c1: '#56A8F5', c2: '#1B4F9C' },
  luna: { nombre: 'Luna', c1: '#EEEEF4', c2: '#9C9CB0' },
  marte: { nombre: 'Marte', c1: '#F08A5D', c2: '#A8361E' },
  jupiter: { nombre: 'Júpiter', c1: '#F1DDBA', c2: '#B9774A' },
  saturno: { nombre: 'Saturno', c1: '#F6E2A8', c2: '#C49A4C' },
  urano: { nombre: 'Urano', c1: '#C7F7F5', c2: '#4FB7C7' },
  neptuno: { nombre: 'Neptuno', c1: '#7FA1FF', c2: '#1E3BB8' },
  sol: { nombre: 'Sol', c1: '#FFF6B0', c2: '#FF8A1F' },
  pluton: { nombre: 'Plutón', c1: '#E8CFB4', c2: '#9E7A5E' }
};

/* Un planeta en un lienzo de 120 x 120 (círculo de radio 40 en el centro).
   op.mini = sin detalles finos (para el mapa en pantallas pequeñas) */
function planetaSVG(id, op) {
  op = op || {};
  const a = ASTROS[id] || ASTROS.tierra;
  const g = idSVG('pg'), sombra = idSVG('ps'), recorte = idSVG('pc');
  let defs = '<radialGradient id="' + g + '" cx="36%" cy="32%" r="75%"><stop offset="0" stop-color="' + a.c1 + '"/><stop offset="1" stop-color="' + a.c2 + '"/></radialGradient>' +
    '<radialGradient id="' + sombra + '" cx="30%" cy="28%" r="85%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#10003C" stop-opacity=".45"/></radialGradient>' +
    '<clipPath id="' + recorte + '"><circle cx="60" cy="60" r="40"/></clipPath>';
  let detras = '', cuerpo = '', delante = '';
  const R = 'clip-path="url(#' + recorte + ')"';

  switch (id) {
    case 'tierra':
      cuerpo = '<g ' + R + '>' +
        '<path d="M30 40 C38 30 50 32 54 40 C58 48 50 52 52 60 C54 68 44 74 38 68 C30 60 24 50 30 40 Z" fill="#3DBE6B"/>' +
        '<path d="M64 26 C74 22 88 30 90 40 C92 48 82 50 76 46 C70 42 60 34 64 26 Z" fill="#3DBE6B"/>' +
        '<path d="M66 62 C74 58 86 64 88 74 C90 84 80 92 72 88 C64 84 60 70 66 62 Z" fill="#2E9E58"/>' +
        (op.mini ? '' : '<path d="M26 78 C34 74 40 80 36 86" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".75"/>' +
          '<path d="M58 50 C66 46 74 50 72 54" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>' +
          '<ellipse cx="60" cy="21" rx="16" ry="5" fill="#fff" opacity=".9"/>') +
        '</g>';
      break;
    case 'luna':
    case 'mercurio': {
      const crat = id === 'luna'
        ? [[44, 44, 8], [72, 40, 5], [66, 70, 10], [40, 74, 5], [84, 62, 4], [54, 58, 3]]
        : [[46, 40, 6], [70, 46, 8], [52, 72, 7], [80, 70, 4], [36, 60, 4], [64, 26, 4]];
      const osc = id === 'luna' ? '#A9A9BE' : '#6E5F55', claro = id === 'luna' ? '#F7F7FB' : '#D8CDC2';
      cuerpo = '<g ' + R + '>' + crat.map(c => '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + osc + '" opacity=".75"/>' +
        (op.mini ? '' : '<path d="M' + (c[0] - c[2] * 0.7) + ' ' + (c[1] + c[2] * 0.5) + ' A' + c[2] + ' ' + c[2] + ' 0 0 0 ' + (c[0] + c[2] * 0.8) + ' ' + (c[1] + c[2] * 0.4) + '" stroke="' + claro + '" stroke-width="1.6" fill="none" opacity=".8"/>')).join('') + '</g>';
      break;
    }
    case 'marte':
      cuerpo = '<g ' + R + '>' +
        '<path d="M24 52 C36 44 48 54 58 50 C68 46 74 56 86 52 L96 60 L20 66 Z" fill="#B5462A" opacity=".55"/>' +
        '<path d="M34 76 C44 72 54 80 66 76 C76 72 84 80 92 78 L92 92 L30 92 Z" fill="#9C3A22" opacity=".5"/>' +
        '<ellipse cx="60" cy="22" rx="13" ry="5" fill="#fff" opacity=".85"/>' +
        (op.mini ? '' : '<circle cx="44" cy="38" r="4" fill="#9C3A22" opacity=".6"/><circle cx="76" cy="66" r="3" fill="#9C3A22" opacity=".6"/>') +
        '</g>';
      break;
    case 'jupiter':
      cuerpo = '<g ' + R + '>' +
        '<rect x="0" y="30" width="120" height="7" fill="#C98F5A" opacity=".8"/>' +
        '<rect x="0" y="42" width="120" height="5" fill="#F7EBD3" opacity=".8"/>' +
        '<rect x="0" y="52" width="120" height="9" fill="#B9774A" opacity=".75"/>' +
        '<rect x="0" y="66" width="120" height="5" fill="#F7EBD3" opacity=".7"/>' +
        '<rect x="0" y="76" width="120" height="8" fill="#C98F5A" opacity=".75"/>' +
        '<ellipse cx="74" cy="72" rx="9" ry="5.5" fill="#C1442E" stroke="#F2B090" stroke-width="1.5"/>' +
        '</g>';
      break;
    case 'saturno': {
      const anillo = (mitad) => {
        // Elipse inclinada; se pinta la mitad de atrás antes del planeta y la de delante después
        const d = mitad === 'atras' ? 'M2 60 A58 15 0 0 1 118 60' : 'M2 60 A58 15 0 0 0 118 60';
        return '<g transform="rotate(-16 60 60)"><path d="' + d + '" stroke="#E9D9A6" stroke-width="7" fill="none"/>' +
          '<path d="' + d.replace(/A58 15/, 'A58 15') + '" stroke="#C8AC6E" stroke-width="2" fill="none" transform="translate(0 -1)"/>' +
          (op.mini ? '' : '<path d="M12 60 ' + (mitad === 'atras' ? 'A48 11 0 0 1 108 60' : 'A48 11 0 0 0 108 60') + '" stroke="#F6EBC8" stroke-width="3" fill="none" opacity=".8"/>') +
          '</g>';
      };
      detras = anillo('atras');
      cuerpo = '<g ' + R + '><rect x="0" y="40" width="120" height="6" fill="#D7B46A" opacity=".7"/><rect x="0" y="54" width="120" height="8" fill="#F3E2B0" opacity=".7"/><rect x="0" y="70" width="120" height="6" fill="#D7B46A" opacity=".6"/></g>';
      delante = anillo('delante');
      break;
    }
    case 'urano':
      detras = '<ellipse cx="60" cy="60" rx="9" ry="54" stroke="#DDF7F6" stroke-width="2.5" fill="none" opacity=".7" transform="rotate(-8 60 60)"/>';
      cuerpo = '<g ' + R + '><rect x="0" y="36" width="120" height="4" fill="#E2FBFA" opacity=".35"/><rect x="0" y="74" width="120" height="5" fill="#3EA2B4" opacity=".3"/></g>';
      break;
    case 'neptuno':
      cuerpo = '<g ' + R + '><rect x="0" y="34" width="120" height="5" fill="#9DB6FF" opacity=".45"/><rect x="0" y="62" width="120" height="7" fill="#3355D6" opacity=".55"/>' +
        '<ellipse cx="46" cy="52" rx="8" ry="5" fill="#16257A" opacity=".8"/>' +
        (op.mini ? '' : '<path d="M60 46 C66 44 74 46 78 44" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".8"/>') + '</g>';
      break;
    case 'venus':
      cuerpo = '<g ' + R + '>' +
        '<path d="M18 44 C34 36 46 50 62 42 C78 34 90 46 104 40" stroke="#FCEBC4" stroke-width="6" fill="none" opacity=".75"/>' +
        '<path d="M16 64 C32 56 48 70 64 62 C80 54 92 66 104 60" stroke="#E8B465" stroke-width="7" fill="none" opacity=".6"/>' +
        '<path d="M22 82 C38 76 50 88 66 80 C80 74 90 84 100 80" stroke="#FCEBC4" stroke-width="5" fill="none" opacity=".6"/>' +
        '</g>';
      break;
    case 'pluton':
      cuerpo = '<g ' + R + '><path d="M62 82 C46 70 44 58 52 54 C57 51 61 55 62 58 C63 55 67 51 72 54 C80 58 78 70 62 82 Z" fill="#F6E8D6" opacity=".9"/>' +
        '<circle cx="40" cy="44" r="5" fill="#8A6A52" opacity=".6"/></g>';
      break;
    case 'sol': {
      const halo = idSVG('sh');
      defs += '<radialGradient id="' + halo + '"><stop offset=".55" stop-color="#FFD54A" stop-opacity=".75"/><stop offset="1" stop-color="#FF9F43" stop-opacity="0"/></radialGradient>';
      let rayos = '';
      for (let i = 0; i < 12; i++) {
        const ang = i * Math.PI / 6;
        const x1 = 60 + Math.cos(ang - 0.12) * 44, y1 = 60 + Math.sin(ang - 0.12) * 44;
        const x2 = 60 + Math.cos(ang) * 58, y2 = 60 + Math.sin(ang) * 58;
        const x3 = 60 + Math.cos(ang + 0.12) * 44, y3 = 60 + Math.sin(ang + 0.12) * 44;
        rayos += '<path d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' L' + x3.toFixed(1) + ' ' + y3.toFixed(1) + ' Z" fill="#FFB020"/>';
      }
      detras = '<circle cx="60" cy="60" r="60" fill="url(#' + halo + ')"/><g class="sol-rayos">' + rayos + '</g>';
      cuerpo = op.mini ? '' : '<g ' + R + '><circle cx="44" cy="70" r="6" fill="#FFB020" opacity=".35"/><circle cx="74" cy="46" r="4" fill="#FFB020" opacity=".35"/><circle cx="70" cy="78" r="3" fill="#FFF6B0" opacity=".5"/></g>';
      break;
    }
    default: break;
  }
  const radio = 40;
  return '<svg class="astro astro-' + id + '" viewBox="0 0 120 120" aria-hidden="true"><defs>' + defs + '</defs>' + detras +
    '<circle cx="60" cy="60" r="' + radio + '" fill="url(#' + g + ')"/>' + cuerpo +
    (id === 'sol' ? '' : '<circle cx="60" cy="60" r="' + radio + '" fill="url(#' + sombra + ')"/>') +
    '<ellipse cx="46" cy="40" rx="11" ry="6" fill="#fff" opacity="' + (id === 'sol' ? '.35' : '.22') + '" transform="rotate(-30 46 40)"/>' +
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
  const xh = 60 + Math.sin(angH) * 24, yh = 60 - Math.cos(angH) * 24;
  const xm = 60 + Math.sin(angM) * 36, ym = 60 - Math.cos(angM) * 36;
  return '<svg class="reloj-svg" viewBox="0 0 120 120" aria-hidden="true">' +
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
