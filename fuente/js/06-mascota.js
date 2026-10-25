/* =========================================================
   6. MASCOTA: Pipo, un marcianito redondo dibujado en SVG
   El color y el complemento se eligen en el armario.
   ========================================================= */

/* Complementos dibujados (mismo sistema de coordenadas que Pipo: 200 x 220) */
function accesorioSVG(id) {
  switch (id) {
    case 'lazo':
      return '<g class="p-acc"><path d="M66 60 L38 44 L40 78 Z" fill="#FF5DA2" stroke="#D93A80" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M66 60 L92 42 L94 76 Z" fill="#FF5DA2" stroke="#D93A80" stroke-width="4" stroke-linejoin="round"/>' +
        '<circle cx="66" cy="60" r="9" fill="#D93A80"/></g>';
    case 'gafas':
      return '<g class="p-acc"><ellipse cx="76" cy="112" rx="25" ry="19" fill="#2A1E5C"/><ellipse cx="124" cy="112" rx="25" ry="19" fill="#2A1E5C"/>' +
        '<path d="M99 108 Q100 102 101 108" stroke="#2A1E5C" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<path d="M62 104 L74 99" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/>' +
        '<path d="M110 104 L122 99" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/></g>';
    case 'flor':
      return '<g class="p-acc">' +
        [0, 72, 144, 216, 288].map(a => {
          const x = 140 + Math.cos(a * Math.PI / 180) * 13, y = 58 + Math.sin(a * Math.PI / 180) * 13;
          return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="10" fill="#fff" stroke="#FFB3D4" stroke-width="3"/>';
        }).join('') +
        '<circle cx="140" cy="58" r="8" fill="#FFC93C"/></g>';
    case 'gorra':
      return '<g class="p-acc"><path d="M58 74 Q58 30 100 30 Q142 30 142 74 Z" fill="#3FB2F2"/>' +
        '<path d="M118 70 Q160 62 176 76 Q156 86 118 80 Z" fill="#1C84C2"/>' +
        '<path d="M70 74 L130 74" stroke="#1C84C2" stroke-width="6" stroke-linecap="round"/>' +
        '<circle cx="100" cy="30" r="7" fill="#FFC93C"/></g>';
    case 'fiesta':
      return '<g class="p-acc"><path d="M74 60 L100 6 L126 60 Z" fill="#FF5DA2" stroke="#D93A80" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M85.2 37 L114.8 37" stroke="#FFC93C" stroke-width="7"/><path d="M80 49 L120 49" stroke="#3FB2F2" stroke-width="7"/>' +
        '<circle cx="100" cy="7" r="9" fill="#FFC93C"/></g>';
    case 'corona':
      return '<g class="p-acc"><path d="M66 58 L70 22 L86 40 L100 14 L114 40 L130 22 L134 58 Z" fill="#FFC93C" stroke="#D99A00" stroke-width="4" stroke-linejoin="round"/>' +
        '<circle cx="100" cy="44" r="6" fill="#FF5DA2"/><circle cx="81" cy="49" r="4.5" fill="#3FB2F2"/><circle cx="119" cy="49" r="4.5" fill="#3FB2F2"/></g>';
    case 'casco':
      return '<g class="p-acc"><circle cx="100" cy="116" r="94" fill="rgba(190,235,255,.18)" stroke="#CFEFFF" stroke-width="6"/>' +
        '<path d="M42 78 Q56 42 92 30" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".75"/>' +
        '<rect x="44" y="190" width="112" height="18" rx="9" fill="#CFEFFF"/></g>';
    case 'auriculares':
      return '<g class="p-acc"><path d="M40 112 Q40 34 100 34 Q160 34 160 112" stroke="#2A1E5C" stroke-width="9" fill="none" stroke-linecap="round"/>' +
        '<rect x="26" y="98" width="26" height="40" rx="12" fill="#FF5DA2" stroke="#D93A80" stroke-width="3"/>' +
        '<rect x="148" y="98" width="26" height="40" rx="12" fill="#FF5DA2" stroke="#D93A80" stroke-width="3"/></g>';
    case 'pajarita':
      return '<g class="p-acc"><path d="M100 178 L72 164 L72 192 Z" fill="#3FB2F2" stroke="#1C84C2" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M100 178 L128 164 L128 192 Z" fill="#3FB2F2" stroke="#1C84C2" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="100" cy="178" r="7" fill="#1C84C2"/></g>';
    case 'chistera':
      return '<g class="p-acc"><rect x="62" y="44" width="76" height="16" rx="6" fill="#2A1E5C"/>' +
        '<rect x="74" y="4" width="52" height="46" rx="6" fill="#2A1E5C"/>' +
        '<rect x="74" y="34" width="52" height="9" fill="#FF5DA2"/></g>';
    default:
      return '';
  }
}

const Mascota = {
  /* Devuelve el HTML de Pipo con el aspecto indicado (o el guardado) */
  html(aspecto) {
    const d = (Guardado.p && Guardado.p.pipo) || { color: 'menta', acc: 'ninguno' };
    aspecto = aspecto || {};
    const colorId = aspecto.color || d.color;
    const accId = aspecto.acc || d.acc;
    const color = (COLORES_PIPO.find(c => c.id === colorId) || COLORES_PIPO[0]).hex;
    const oscuro = tono(color, -0.25);
    const sinAntenas = ['gorra', 'fiesta', 'casco', 'chistera'].indexOf(accId) >= 0;
    const antenas = sinAntenas ? '' :
      '<g class="p-antenas">' +
      '<path d="M80 54 Q72 32 60 24" stroke="' + oscuro + '" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<path d="M120 54 Q128 32 140 24" stroke="' + oscuro + '" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<circle cx="58" cy="21" r="10" fill="#FFC93C"/><circle cx="55" cy="18" r="3.5" fill="#fff" opacity=".85"/>' +
      '<circle cx="142" cy="21" r="10" fill="#FF5DA2"/><circle cx="139" cy="18" r="3.5" fill="#fff" opacity=".85"/></g>';
    return '<div class="pipo"><div class="pipo-mov">' +
      '<svg viewBox="0 0 200 220" aria-hidden="true" focusable="false">' +
      '<ellipse cx="100" cy="212" rx="54" ry="7" fill="rgba(10,0,40,.28)"/>' +
      antenas +
      '<ellipse cx="72" cy="198" rx="21" ry="11" fill="' + oscuro + '"/>' +
      '<ellipse cx="128" cy="198" rx="21" ry="11" fill="' + oscuro + '"/>' +
      '<g class="p-brazo p-brazo-i"><ellipse cx="34" cy="134" rx="15" ry="25" fill="' + color + '" transform="rotate(24 34 134)"/></g>' +
      '<g class="p-brazo p-brazo-d"><ellipse cx="166" cy="134" rx="15" ry="25" fill="' + color + '" transform="rotate(-24 166 134)"/></g>' +
      '<path d="M100 46 C152 46 172 86 172 130 C172 174 142 198 100 198 C58 198 28 174 28 130 C28 86 48 46 100 46 Z" fill="' + color + '"/>' +
      '<ellipse cx="100" cy="156" rx="46" ry="32" fill="#fff" opacity=".22"/>' +
      '<ellipse cx="68" cy="76" rx="18" ry="9" fill="#fff" opacity=".35" transform="rotate(-28 68 76)"/>' +
      '<g class="p-ojos">' +
      '<ellipse cx="76" cy="112" rx="19" ry="23" fill="#fff"/><ellipse cx="124" cy="112" rx="19" ry="23" fill="#fff"/>' +
      '<circle cx="79" cy="116" r="11" fill="#2A1E5C"/><circle cx="121" cy="116" r="11" fill="#2A1E5C"/>' +
      '<circle cx="83" cy="111" r="4.2" fill="#fff"/><circle cx="125" cy="111" r="4.2" fill="#fff"/></g>' +
      '<ellipse cx="54" cy="142" rx="10" ry="6" fill="#FF5DA2" opacity=".45"/>' +
      '<ellipse cx="146" cy="142" rx="10" ry="6" fill="#FF5DA2" opacity=".45"/>' +
      '<path class="p-sonrisa" d="M84 148 Q100 164 116 148" stroke="#2A1E5C" stroke-width="5.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse class="p-boca" cx="100" cy="154" rx="12" ry="10" fill="#7A1F48"/>' +
      accesorioSVG(accId) +
      '<g class="p-zzz" fill="#fff" font-family="Fredoka, sans-serif" font-weight="700"><text x="150" y="60" font-size="26">z</text><text x="166" y="38" font-size="20">z</text></g>' +
      '</svg></div></div>';
  },

  /* Repinta todos los huecos donde aparece Pipo */
  actualizarTodas() {
    $$('.pipo-slot').forEach(slot => { slot.innerHTML = this.html(); });
  },

  /* Pipos visibles ahora mismo (pantalla activa y capas abiertas) */
  visibles() {
    return $$('.pantalla.activa .pipo-slot > .pipo, .capa:not([hidden]) .pipo-slot > .pipo');
  },

  hablar(si) {
    this.visibles().forEach(p => p.classList.toggle('hablando', !!si));
    const ondas = $('#ondasJuego');
    if (ondas) ondas.classList.toggle('activa', !!si);
  },

  /* Animación breve: 'feliz' o 'pensar' */
  animar(tipo) {
    this.visibles().forEach(p => {
      p.classList.remove('feliz', 'pensar');
      void p.offsetWidth;   // reinicia la animación
      p.classList.add(tipo);
      setTimeout(() => p.classList.remove(tipo), 1100);
    });
  },

  /* Cosquillas: al tocar a Pipo se ríe y salta (con pausa para que no se convierta en el juego) */
  cosquillas(slot) {
    const ahora = Date.now();
    if (ahora - (this.ultimaRisa || 0) < 2500) return;
    this.ultimaRisa = ahora;
    const p = slot && slot.querySelector('.pipo');
    if (!p) return;
    p.classList.remove('feliz');
    void p.offsetWidth;
    p.classList.add('feliz');
    setTimeout(() => p.classList.remove('feliz'), 1100);
    Sonido.efecto('estrella');
    if (!Voz.fuentes.length && !Juego.enTarea()) Voz.decir('jiji');
  },

  /* Estados que duran (estirarse, dormir) en un hueco concreto */
  estado(slot, clase, activo) {
    const p = slot && slot.querySelector('.pipo');
    if (p) p.classList.toggle(clase, !!activo);
  }
};

