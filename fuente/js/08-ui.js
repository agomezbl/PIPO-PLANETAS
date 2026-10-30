/* =========================================================
   8. INTERFAZ COMÚN: iconos, cielo, cambio de pantalla,
      subtítulos, avisos, confeti y estrellas que vuelan
   ========================================================= */
const SVG_ESTRELLA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4l2.95 6.07 6.65.86-4.9 4.6 1.27 6.6L12 17.3l-5.97 3.23 1.27-6.6-4.9-4.6 6.65-.86z"/></svg>';

const ICONOS = {
  jugar: '<svg viewBox="0 0 24 24"><path d="M8 4.8v14.4c0 .8.9 1.3 1.6.8l10.4-7.2c.6-.4.6-1.2 0-1.6L9.6 4c-.7-.5-1.6 0-1.6.8z" fill="currentColor"/></svg>',
  pausa: '<svg viewBox="0 0 24 24"><rect x="5.5" y="4.5" width="4.6" height="15" rx="1.8" fill="currentColor"/><rect x="13.9" y="4.5" width="4.6" height="15" rx="1.8" fill="currentColor"/></svg>',
  altavoz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9.3h3.6L12 5v14l-4.9-4.3H3.5z" fill="currentColor"/><path d="M15.6 9a4.2 4.2 0 0 1 0 6"/><path d="M18.4 6.2a8.2 8.2 0 0 1 0 11.6"/></svg>',
  mapa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"><path d="M3.5 6.3l5.6-2 5.8 2 5.6-2v13.4l-5.6 2-5.8-2-5.6 2z"/><path d="M9.1 4.3v13.4M14.9 6.3v13.4"/></svg>',
  atras: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5L7.5 12l7 7"/></svg>',
  musica: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17.5V5.8l10.5-2.3v11.8"/><circle cx="6.4" cy="17.6" r="2.7" fill="currentColor"/><circle cx="16.9" cy="15.4" r="2.7" fill="currentColor"/></svg>',
  voz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9.3h3.6L12 5v14l-4.9-4.3H3.5z" fill="currentColor"/><path d="M15.6 9a4.2 4.2 0 0 1 0 6"/><path d="M18.4 6.2a8.2 8.2 0 0 1 0 11.6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 12.6l4.6 4.6L19.4 7"/></svg>',
  cerrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  candado: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><rect x="5" y="10.5" width="14" height="10" rx="2.6" fill="currentColor" stroke="none"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/></svg>',
  engranaje: (() => {
    let dientes = '';
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      dientes += '<path d="M' + (12 + Math.cos(a) * 6.4).toFixed(2) + ' ' + (12 + Math.sin(a) * 6.4).toFixed(2) +
        'L' + (12 + Math.cos(a) * 9.6).toFixed(2) + ' ' + (12 + Math.sin(a) * 9.6).toFixed(2) + '"/>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">' + dientes +
      '<circle cx="12" cy="12" r="6.3" stroke-width="2.6"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/></svg>';
  })(),
  estrella: SVG_ESTRELLA,
  flecha: '<svg viewBox="0 0 48 32"><path d="M4 16h34M28 6l12 10-12 10" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  siguiente: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 5l7 7-7 7"/></svg>',
  borrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5h11v14H9l-6-7z" fill="currentColor" fill-opacity=".18"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg>',
  mas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  menos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  arriba: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5.5 11.5L12 5l6.5 6.5"/></svg>',
  abajo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5.5 12.5L12 19l6.5-6.5"/></svg>',
  izquierda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11.5 5.5L5 12l6.5 6.5"/></svg>',
  derecha: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12.5 5.5L19 12l-6.5 6.5"/></svg>',
  reloj: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="12" r="8.6"/><path d="M12 7.5V12l3 2"/></svg>'
};

/* Pinta los iconos en los elementos con data-icono */
function pintarIconos(raiz) {
  $$('[data-icono]', raiz).forEach(el => { el.innerHTML = ICONOS[el.dataset.icono] || ''; });
}

/* Estrellitas del fondo */
function crearCielo() {
  const cielo = $('#cielo');
  let html = '';
  for (let i = 0; i < 70; i++) {
    const t = (Math.random() * 2.6 + 1).toFixed(1);
    html += '<i style="left:' + (Math.random() * 100).toFixed(2) + '%;top:' + (Math.random() * 100).toFixed(2) + '%;--t:' + t +
      'px;--o:' + (Math.random() * 0.6 + 0.3).toFixed(2) + ';--d:' + (Math.random() * 3 + 2).toFixed(1) + 's;--r:-' + (Math.random() * 5).toFixed(1) + 's"></i>';
  }
  cielo.innerHTML = html;
}

/* Gráfico de una forma geométrica en SVG */
function formaSVG(id, color, giro, escala, soloContorno) {
  const borde = soloContorno ? color : tono(color, -0.28);
  const relleno = soloContorno ? 'none' : color;
  const extra = soloContorno ? ' stroke-dasharray="9 7"' : '';
  const estilo = ' fill="' + relleno + '" stroke="' + borde + '" stroke-width="' + (soloContorno ? 6 : 4) + '" stroke-linejoin="round"' + extra;
  let figura = '';
  switch (id) {
    case 'circulo': figura = '<circle cx="50" cy="50" r="40"' + estilo + '/>'; break;
    case 'cuadrado': figura = '<rect x="14" y="14" width="72" height="72" rx="5"' + estilo + '/>'; break;
    case 'triangulo': figura = '<path d="M50 9 L92 85 L8 85 Z"' + estilo + '/>'; break;
    case 'rectangulo': figura = '<rect x="5" y="25" width="90" height="50" rx="5"' + estilo + '/>'; break;
    case 'rombo': figura = '<path d="M50 5 L86 50 L50 95 L14 50 Z"' + estilo + '/>'; break;
    case 'ovalo': figura = '<ellipse cx="50" cy="50" rx="29" ry="43"' + estilo + '/>'; break;
    case 'corazon': figura = '<path d="M50 88 C22 68 6 52 6 33 C6 18 17 8 30 8 C40 8 46 14 50 22 C54 14 60 8 70 8 C83 8 94 18 94 33 C94 52 78 68 50 88 Z"' + estilo + '/>'; break;
    case 'estrella': {
      let d = '';
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 44 : 19;
        const a = -Math.PI / 2 + i * Math.PI / 5;
        d += (i ? 'L' : 'M') + (50 + Math.cos(a) * r).toFixed(1) + ' ' + (53 + Math.sin(a) * r).toFixed(1) + ' ';
      }
      figura = '<path d="' + d + 'Z"' + estilo + '/>';
      break;
    }
    default: break;
  }
  const t = 'rotate(' + (giro || 0) + ' 50 50) translate(50 50) scale(' + (escala || 1) + ') translate(-50 -50)';
  return '<svg class="forma" viewBox="0 0 100 100" aria-hidden="true"><g transform="' + t + '">' + figura + '</g></svg>';
}

/* Fila de puntos (apoyo visual para cantidades) */
function puntosHTML(n) {
  let h = '<span class="puntos">';
  for (let i = 0; i < n; i++) h += '<i></i>';
  return h + '</span>';
}

/* Mini marco de diez para las pistas de números grandes */
function miniMarcoHTML(n) {
  let h = '<span class="mini-marco">';
  for (let i = 0; i < 10; i++) h += '<i class="' + (i < n ? 'si' : '') + '"></i>';
  return h + '</span>';
}

const UI = {
  pantalla: null,

  mostrar(id) {
    $$('.pantalla').forEach(p => p.classList.toggle('activa', p.id === id));
    this.pantalla = id;
    $('#btnRepetir').hidden = (id === 'p-inicio');
    document.body.dataset.pantalla = id;
    if (['p-inicio', 'p-perfiles', 'p-nuevo', 'p-mapa', 'p-album', 'p-taller'].indexOf(id) >= 0) this.tema(null);
    this.ocultarSubtitulo();
    Mano.ocultar();
    Mascota.hablar(false);
  },

  /* Color del cielo según el planeta en el que estamos */
  tema(id) { document.body.dataset.tema = id || ''; },

  subtitulo(texto) {
    const s = $('#subtitulo');
    s.textContent = texto;
    s.hidden = false;
    clearTimeout(this.tSub);
    this.tSub = setTimeout(() => { s.hidden = true; }, limitar(1800 + texto.length * 70, 2500, 9000));
  },
  ocultarSubtitulo() {
    clearTimeout(this.tSub);
    $('#subtitulo').hidden = true;
  },

  /* Aviso breve arriba, solo con iconos y números (el niño aún no lee) */
  aviso(icono, texto) {
    const a = $('#aviso');
    a.innerHTML = '<span class="aviso-ico">' + icono + '</span>' + (texto ? '<span>' + texto + '</span>' : '');
    a.classList.add('visible');
    clearTimeout(this.tAviso);
    this.tAviso = setTimeout(() => a.classList.remove('visible'), 2600);
  },

  actualizarEstrellas() {
    const p = Guardado.p;
    $$('.hudEstrellas').forEach(el => { el.textContent = p ? p.estrellas : 0; });
  },

  /* Pictograma de la consigna junto a Pipo */
  picto(emoji) {
    const p = $('#picto');
    if (!p) return;
    p.textContent = emoji || '';
    p.classList.toggle('visible', !!emoji);
  },

  /* Centro de un elemento en la pantalla */
  centro(el) {
    if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  },

  /* Una estrella vuela desde el botón acertado hasta su hueco en la barra */
  estrellaVuela(desde, hasta, alLlegar) {
    if (REDUCIR_MOVIMIENTO || !desde || !hasta || !document.body.animate) { alLlegar(); return; }
    const a = this.centro(desde), b = this.centro(hasta);
    const e = crear('div', 'estrella-vuela', SVG_ESTRELLA);
    document.body.appendChild(e);
    const anim = e.animate([
      { transform: 'translate(' + (a.x - 24) + 'px,' + (a.y - 24) + 'px) scale(1.3)', opacity: 1 },
      { transform: 'translate(' + ((a.x + b.x) / 2 - 24) + 'px,' + (Math.min(a.y, b.y) - 90) + 'px) scale(1.6) rotate(140deg)', opacity: 1, offset: 0.45 },
      { transform: 'translate(' + (b.x - 24) + 'px,' + (b.y - 24) + 'px) scale(.7) rotate(300deg)', opacity: 1 }
    ], { duration: 750, easing: 'cubic-bezier(.5,0,.5,1)' });
    let hecho = false;
    const terminar = () => { if (hecho) return; hecho = true; e.remove(); alLlegar(); };
    anim.onfinish = terminar;
    setTimeout(terminar, 1000);
  }
};

/* ----- Confeti en un lienzo ----- */
const Confeti = {
  piezas: [],
  activo: false,
  ctx: null,

  lanzar(x, y, cuantas, fuerte) {
    if (REDUCIR_MOVIMIENTO) return;
    const lienzo = $('#confeti');
    if (!this.ctx) this.ctx = lienzo.getContext('2d');
    if (!this.ctx) return;
    const colores = ['#FFC93C', '#FF5DA2', '#2FD18E', '#3FB2F2', '#9B7BF7', '#FFFFFF'];
    for (let i = 0; i < cuantas; i++) {
      const ang = Math.random() * Math.PI * 2;
      const vel = (fuerte ? 7 : 4.5) + Math.random() * (fuerte ? 8 : 5);
      this.piezas.push({
        x: x, y: y,
        vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel - (fuerte ? 6 : 4),
        giro: Math.random() * 6, vg: (Math.random() - 0.5) * 0.4,
        tam: 6 + Math.random() * 7, color: elegir(colores),
        forma: Math.random() < 0.3 ? 'c' : 'r', vida: 0, max: 70 + Math.random() * 40
      });
    }
    if (!this.activo) {
      this.activo = true;
      this.ajustar();
      requestAnimationFrame(() => this.cuadro());
    }
  },

  ajustar() {
    const lienzo = $('#confeti');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    lienzo.width = Math.round(window.innerWidth * dpr);
    lienzo.height = Math.round(window.innerHeight * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  },

  cuadro() {
    const c = this.ctx;
    c.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.piezas = this.piezas.filter(p => p.vida < p.max && p.y < window.innerHeight + 40);
    this.piezas.forEach(p => {
      p.vida++;
      p.vy += 0.32;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.giro += p.vg;
      c.save();
      c.globalAlpha = Math.max(0, 1 - p.vida / p.max);
      c.translate(p.x, p.y);
      c.rotate(p.giro);
      c.fillStyle = p.color;
      if (p.forma === 'c') { c.beginPath(); c.arc(0, 0, p.tam / 2, 0, Math.PI * 2); c.fill(); } else c.fillRect(-p.tam / 2, -p.tam / 4, p.tam, p.tam / 2);
      c.restore();
    });
    if (this.piezas.length) requestAnimationFrame(() => this.cuadro());
    else { this.activo = false; c.clearRect(0, 0, window.innerWidth, window.innerHeight); }
  }
};

/* ----- Mano guía: enseña dónde tocar en lugar de explicarlo con palabras ----- */
const Mano = {
  token: 0,

  ocultar() {
    this.token++;
    const m = $('#mano');
    if (m) { m.hidden = true; m.classList.remove('tocando'); }
  },

  /* Coloca la punta del dedo sobre el centro de un elemento */
  colocar(el) {
    const m = $('#mano');
    const r = el.getBoundingClientRect();
    m.style.left = (r.left + r.width / 2) + 'px';
    m.style.top = (r.top + r.height / 2) + 'px';
  },

  /* Recorre una lista de elementos señalándolos con un toque. Devuelve una promesa. */
  async señalar(elementos, op) {
    op = op || {};
    const lista = (elementos || []).filter(e => e && e.isConnected && e.getBoundingClientRect().width > 0);
    if (!lista.length) return;
    this.token++;
    const tk = this.token;
    const m = $('#mano');
    m.classList.add('sin-transicion');
    this.colocar(lista[0]);
    m.hidden = false;
    void m.offsetWidth;
    m.classList.remove('sin-transicion');
    const vueltas = op.vueltas || 1;
    const hayCapa = () => !!document.querySelector('.capa:not([hidden])') && !lista.some(e => e.closest('.capa'));
    for (let v = 0; v < vueltas; v++) {
      for (let i = 0; i < lista.length; i++) {
        if (tk !== this.token) return;
        if (hayCapa()) { this.ocultar(); return; }
        this.colocar(lista[i]);
        await esperar(REDUCIR_MOVIMIENTO ? 150 : 520);
        if (tk !== this.token) return;
        m.classList.remove('tocando');
        void m.offsetWidth;
        m.classList.add('tocando');
        await esperar(op.pausa || 700);
      }
    }
    if (tk === this.token) {
      await esperar(300);
      if (tk === this.token) this.ocultar();
    }
  }
};

