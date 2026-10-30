/* =========================================================
   11. CIENCIA: descubre el planeta, preguntas y álbum de cartas
   Solo se usan los datos aprobados (ver herramientas/frases.py, bloque "ciencia").
   ========================================================= */

/* Cartas del álbum: la del planeta se gana en "Descubre"; la extra, en la gran misión */
const CARTAS = [
  { id: 'tierra', astro: 'tierra', nombre: 'La Tierra', hechos: ['f_tierra_1', 'f_tierra_2', 'f_tierra_3'], mundo: 0 },
  { id: 'astronauta', emoji: '🧑‍🚀', nombre: 'Astronauta', hechos: ['f_astronauta'], mundo: 0, extra: true },
  { id: 'luna', astro: 'luna', nombre: 'La Luna', hechos: ['f_luna_1', 'f_luna_2', 'f_luna_4'], mundo: 1 },
  { id: 'cohete', emoji: '🚀', nombre: 'Cohete', hechos: ['f_luna_3'], mundo: 1, extra: true },
  { id: 'marte', astro: 'marte', nombre: 'Marte', hechos: ['f_marte_1', 'f_marte_2', 'f_marte_4'], mundo: 2 },
  { id: 'robot', emoji: '🤖', nombre: 'Robot explorador', hechos: ['f_marte_3'], mundo: 2, extra: true },
  { id: 'venus', astro: 'venus', nombre: 'Venus', hechos: ['f_venus_1', 'f_venus_3'], mundo: 3 },
  { id: 'lucero', emoji: '🌅', nombre: 'Venus al amanecer', hechos: ['f_venus_2'], mundo: 3, extra: true },
  { id: 'mercurio', astro: 'mercurio', nombre: 'Mercurio', hechos: ['f_mercurio_1', 'f_mercurio_2', 'f_mercurio_3'], mundo: 4 },
  { id: 'orbita', emoji: '🔄', nombre: 'La órbita', hechos: ['f_orbita', 'f_tierra_4'], mundo: 4, extra: true },
  { id: 'jupiter', astro: 'jupiter', nombre: 'Júpiter', hechos: ['f_jupiter_1', 'f_jupiter_3'], mundo: 5 },
  { id: 'mancha', emoji: '🌀', nombre: 'La Gran Mancha Roja', hechos: ['f_jupiter_2'], mundo: 5, extra: true },
  { id: 'saturno', astro: 'saturno', nombre: 'Saturno', hechos: ['f_saturno_2', 'f_saturno_3'], mundo: 6 },
  { id: 'anillos', emoji: '💍', nombre: 'Los anillos', hechos: ['f_saturno_1'], mundo: 6, extra: true },
  { id: 'urano', astro: 'urano', nombre: 'Urano', hechos: ['f_urano_1', 'f_urano_2'], mundo: 7 },
  { id: 'gigantes', emoji: '🪐', nombre: 'Rocosos y gigantes', hechos: ['f_gigantes'], mundo: 7, extra: true },
  { id: 'neptuno', astro: 'neptuno', nombre: 'Neptuno', hechos: ['f_neptuno_1', 'f_neptuno_2'], mundo: 8 },
  { id: 'pluton', astro: 'pluton', nombre: 'Plutón', hechos: ['f_pluton'], mundo: 8, extra: true },
  { id: 'sol', astro: 'sol', nombre: 'El Sol', hechos: ['f_sol_1', 'f_sol_2', 'f_sol_3'], mundo: 9 },
  { id: 'estrellas', emoji: '✨', nombre: 'Las estrellas', hechos: ['f_estrellas'], mundo: 9, extra: true }
];

/* Datos que se cuentan en "Descubre" (en orden), con su dibujo */
const HECHOS_MUNDO = {
  tierra: [['f_tierra_1', 'tierra', '🏡'], ['f_tierra_2', 'tierra', '💧'], ['f_tierra_3', 'tierra', '🌞🌙'], ['f_tierra_4', 'orbita', ''], ['f_astronauta', null, '🧑‍🚀']],
  luna: [['f_luna_1', 'luna', '🌍'], ['f_luna_2', 'fases', ''], ['f_luna_3', null, '🚀'], ['f_luna_4', 'luna', '🦘']],
  marte: [['f_marte_1', 'marte', '🟥'], ['f_marte_2', 'marte', '🌋'], ['f_marte_3', null, '🤖'], ['f_marte_4', 'orden', 'marte']],
  venus: [['f_venus_1', 'venus', '☁️🔥'], ['f_venus_2', null, '🌅'], ['f_venus_3', 'orden', 'venus']],
  mercurio: [['f_mercurio_1', 'orden', 'mercurio'], ['f_mercurio_2', 'mercurio', '🤏'], ['f_mercurio_3', 'mercurio', '💨'], ['f_orbita', 'orbita', '']],
  jupiter: [['f_jupiter_1', 'jupiter', '🎈'], ['f_jupiter_2', 'jupiter', '🌀'], ['f_jupiter_3', 'orden', 'jupiter']],
  saturno: [['f_saturno_1', 'saturno', '🧊'], ['f_saturno_2', 'saturno', '🛁'], ['f_saturno_3', 'saturno', '🥈']],
  urano: [['f_urano_1', 'eje', ''], ['f_urano_2', 'urano', '🥶'], ['f_gigantes', 'orden', 'urano']],
  neptuno: [['f_neptuno_1', 'orden', 'neptuno'], ['f_neptuno_2', 'neptuno', '💨'], ['f_pluton', 'pluton', '']],
  sol: [['f_sol_1', 'sol', '💡'], ['f_sol_2', 'orden', 'sol'], ['f_sol_3', 'sol', '🕶️'], ['f_estrellas', null, '✨']]
};

/* Preguntas de explorador: 'vf' (¿es verdad?) o 'foto' (elegir el dibujo) */
const PREGUNTAS_MUNDO = {
  tierra: [
    { q: 'tierra_vivimos', tipo: 'foto', ops: ['tierra', 'marte', 'jupiter'], resp: 'tierra', dato: 'f_tierra_1' },
    { q: 'tierra_agua', tipo: 'vf', resp: true, vis: 'tierra', dato: 'f_tierra_2' },
    { q: 'tierra_apaga', tipo: 'vf', resp: false, vis: 'sol', dato: 'f_tierra_3' },
    { q: 'tierra_traje', tipo: 'foto', ops: ['🧑‍🚀', '🩱', '☂️'], resp: '🧑‍🚀', dato: 'f_astronauta' },
    { q: 'tierra_ano', tipo: 'vf', resp: true, vis: 'tierra', dato: 'f_tierra_4' }
  ],
  luna: [
    { q: 'luna_planeta', tipo: 'vf', resp: false, vis: 'luna', dato: 'f_luna_1' },
    { q: 'luna_llena', tipo: 'foto', ops: ['fase:llena', 'fase:creciente', 'fase:menguante'], resp: 'fase:llena', dato: 'f_luna_2' },
    { q: 'luna_cohete', tipo: 'foto', ops: ['🚀', '🚗', '🚲'], resp: '🚀', dato: 'f_luna_3' },
    { q: 'luna_salto', tipo: 'vf', resp: true, vis: 'luna', dato: 'f_luna_4' },
    { q: 'luna_satelite', tipo: 'foto', ops: ['luna', 'sol', 'marte'], resp: 'luna', dato: 'f_luna_1' }
  ],
  marte: [
    { q: 'marte_rojo', tipo: 'foto', ops: ['marte', 'neptuno', 'tierra'], resp: 'marte', dato: 'f_marte_1' },
    { q: 'marte_volcan', tipo: 'vf', resp: true, vis: 'marte', dato: 'f_marte_2' },
    { q: 'marte_quien', tipo: 'foto', ops: ['🤖', '🐶', '🧒'], resp: '🤖', dato: 'f_marte_3' },
    { q: 'marte_orden', tipo: 'vf', resp: true, vis: 'marte', dato: 'f_marte_4' }
  ],
  venus: [
    { q: 'venus_caliente', tipo: 'vf', resp: true, vis: 'venus', dato: 'f_venus_1' },
    { q: 'venus_mercurio', tipo: 'vf', resp: false, vis: 'mercurio', dato: 'f_venus_1' },
    { q: 'venus_brilla', tipo: 'vf', resp: true, vis: 'venus', dato: 'f_venus_2' },
    { q: 'venus_entre', tipo: 'foto', ops: ['venus', 'marte', 'jupiter'], resp: 'venus', dato: 'f_venus_3' }
  ],
  mercurio: [
    { q: 'mercurio_cerca', tipo: 'foto', ops: ['mercurio', 'neptuno', 'tierra'], resp: 'mercurio', dato: 'f_mercurio_1' },
    { q: 'mercurio_grande', tipo: 'vf', resp: false, vis: 'mercurio', dato: 'f_mercurio_2' },
    { q: 'mercurio_rapido', tipo: 'vf', resp: true, vis: 'mercurio', dato: 'f_mercurio_3' },
    { q: 'mercurio_pequeno', tipo: 'foto', ops: ['mercurio', 'jupiter', 'saturno'], resp: 'mercurio', dato: 'f_mercurio_2' }
  ],
  jupiter: [
    { q: 'jupiter_grande', tipo: 'foto', ops: ['jupiter', 'tierra', 'marte'], resp: 'jupiter', dato: 'f_jupiter_1' },
    { q: 'jupiter_tormenta', tipo: 'vf', resp: true, vis: 'jupiter', dato: 'f_jupiter_2' },
    { q: 'jupiter_roca', tipo: 'vf', resp: false, vis: 'jupiter', dato: 'f_jupiter_1' },
    { q: 'jupiter_mancha', tipo: 'foto', ops: ['jupiter', 'venus', 'urano'], resp: 'jupiter', dato: 'f_jupiter_2' }
  ],
  saturno: [
    { q: 'saturno_anillos', tipo: 'foto', ops: ['saturno', 'marte', 'tierra'], resp: 'saturno', dato: 'f_saturno_1' },
    { q: 'saturno_hielo', tipo: 'vf', resp: true, vis: 'saturno', dato: 'f_saturno_1' },
    { q: 'saturno_flota', tipo: 'vf', resp: true, vis: 'saturno', dato: 'f_saturno_2' },
    { q: 'saturno_jupiter', tipo: 'vf', resp: false, vis: 'saturno', dato: 'f_saturno_3' }
  ],
  urano: [
    { q: 'urano_gira', tipo: 'foto', ops: ['eje:tumbado', 'eje:depie'], resp: 'eje:tumbado', dato: 'f_urano_1' },
    { q: 'urano_color', tipo: 'foto', ops: ['urano', 'marte', 'venus'], resp: 'urano', dato: 'f_urano_2' },
    { q: 'urano_calor', tipo: 'vf', resp: false, vis: 'urano', dato: 'f_urano_2' },
    { q: 'urano_lejos', tipo: 'vf', resp: true, vis: 'urano', dato: 'f_gigantes' }
  ],
  neptuno: [
    { q: 'neptuno_lejos', tipo: 'foto', ops: ['neptuno', 'mercurio', 'tierra'], resp: 'neptuno', dato: 'f_neptuno_1' },
    { q: 'neptuno_viento', tipo: 'vf', resp: true, vis: 'neptuno', dato: 'f_neptuno_2' },
    { q: 'neptuno_pluton', tipo: 'vf', resp: true, vis: 'pluton', dato: 'f_pluton' },
    { q: 'neptuno_rojo', tipo: 'vf', resp: false, vis: 'neptuno', dato: 'f_neptuno_2' }
  ],
  sol: [
    { q: 'sol_estrella', tipo: 'vf', resp: true, vis: 'sol', dato: 'f_sol_1' },
    { q: 'sol_mirar', tipo: 'vf', resp: false, vis: 'sol', dato: 'f_sol_3' },
    { q: 'sol_luz', tipo: 'foto', ops: ['sol', 'luna', 'neptuno'], resp: 'sol', dato: 'f_sol_1' },
    { q: 'sol_vueltas', tipo: 'vf', resp: true, vis: 'tierra', dato: 'f_sol_2' }
  ]
};

/* Dibujo de una opción de foto: planeta, fase de la Luna, eje de Urano o emoji */
function dibujoOpcion(op) {
  if (op.indexOf('fase:') === 0) return lunaFaseSVG(op.slice(5));
  if (op.indexOf('eje:') === 0) return planetaEjeSVG(op.slice(4) === 'tumbado');
  if (ASTROS[op]) return '<span class="pl-dibujo">' + planetaSVG(op) + '</span><small class="pl-nombre">' + ASTROS[op].nombre + '</small>';
  return '<span class="emo emo-carta">' + op + '</span>';
}

/* Fila con el orden real de los planetas (y uno resaltado) */
function filaOrdenHTML(resaltado) {
  return '<div class="fila-orden"><span class="mini-sol' + (resaltado === 'sol' ? ' resaltado' : '') + '">' + planetaSVG('sol') + '</span>' +
    ORDEN_SOL.map(id => '<span class="mini-pl' + (id === resaltado ? ' resaltado' : '') + '">' + planetaSVG(id) + '</span>').join('') + '</div>';
}
function orbitaHTML() {
  return '<div class="orbita-dib"><span class="orb-anillo"></span><span class="orb-sol">' + planetaSVG('sol') + '</span><span class="orb-brazo"><span class="orb-tierra">' + planetaSVG('tierra') + '</span></span></div>';
}
function dibujoHecho(h) {
  const vis = h[1], extra = h[2];
  if (vis === 'orden') return filaOrdenHTML(extra);
  if (vis === 'orbita') return orbitaHTML();
  if (vis === 'fases') return '<div class="fases">' + ['llena', 'menguante', 'nueva', 'creciente'].map(f => lunaFaseSVG(f)).join('') + '</div>';
  if (vis === 'eje') return '<div class="hecho-astro">' + planetaEjeSVG(true) + '</div>';
  return (vis ? '<div class="hecho-astro">' + planetaSVG(vis) + '</div>' : '') + (extra ? '<div class="hecho-emoji emo">' + extra + '</div>' : '');
}

const Ciencia = {
  /* Reto de pregunta de ciencia (para "Descubre", la misión del Sol y el repaso) */
  retoPregunta(mundoIdx, dif, preg) {
    let mundoId;
    if (!preg) {
      const p = Guardado.p;
      let candidatos = [];
      const tope = mundoIdx === null || mundoIdx === undefined || MUNDOS[mundoIdx].id === 'sol' ? Math.max(1, (p ? p.desbloqueados : 1)) : mundoIdx + 1;
      const desde = mundoIdx !== null && mundoIdx !== undefined && MUNDOS[mundoIdx].id !== 'sol' ? mundoIdx : 0;
      for (let i = desde; i < Math.min(tope, MUNDOS.length); i++) candidatos = candidatos.concat(PREGUNTAS_MUNDO[MUNDOS[i].id].map(x => ({ x: x, m: MUNDOS[i].id })));
      const e = elegir(candidatos);
      preg = e.x;
      mundoId = e.m;
    }
    const q = {
      firma: 'ci' + preg.q,
      hab: 'ciencia',
      instr: preg.tipo === 'vf' ? ['q_' + preg.q, 'verdad_o_no'] : ['q_' + preg.q],
      explica: [preg.dato],
      mundo: mundoId
    };
    if (preg.tipo === 'vf') {
      q.respuesta = preg.resp ? 'si' : 'no';
      q.opciones = ['si', 'no'];
      q.refuerzo = [preg.resp ? 'es_verdad' : 'no_es_verdad'];
      q.pintar = function (esc, resp) {
        const zona = crear('div', 'zona');
        zona.appendChild(crear('div', 'vf-dibujo', '<div class="hecho-astro">' + planetaSVG(preg.vis) + '</div><span class="vf-interroga">?</span>'));
        esc.appendChild(zona);
        resp.appendChild(Render.botonEmoji('si', '<span class="emo">👍</span>', 'Es verdad'));
        resp.appendChild(Render.botonEmoji('no', '<span class="emo">👎</span>', 'No es verdad'));
        resp.classList.add('resp-vf');
      };
      q.foco = () => [$('#respuestas')];
      q.pista = () => Voz.decir([preg.dato, 'verdad_o_no']);
    } else {
      q.respuesta = preg.resp;
      q.opciones = preg.ops.slice();
      q.refuerzo = ASTROS[preg.resp] ? ['p_' + preg.resp] : [];
      q.sinRespuestas = true;
      const orden = barajar(preg.ops);
      q.pintar = function (esc) {
        const zona = crear('div', 'zona');
        const c = Render.cartas(0.85, 230);
        orden.forEach(op => { const b = Render.carta(op, dibujoOpcion(op), 'opción'); b.classList.add('planeta-carta'); c.appendChild(b); });
        zona.appendChild(c);
        esc.appendChild(zona);
      };
      q.foco = () => [$('#escena .cartas')];
      q.pista = () => { Pistas.quitarUna(); return Voz.decir([preg.dato].concat(q.instr)); };
    }
    return q;
  },

  /* Preguntas de un mundo para "Descubre" */
  planPreguntas(mundoIdx, n) {
    return barajar(PREGUNTAS_MUNDO[MUNDOS[mundoIdx].id]).slice(0, n).map(x => ({ hab: 'ciencia', pregunta: x, dif: 1 }));
  },

  /* Da una carta (si no la tenía). Devuelve true si es nueva. */
  darCarta(id) {
    const p = Guardado.p;
    if (!id || p.cartas.indexOf(id) >= 0) return false;
    p.cartas.push(id);
    Guardado.guardar();
    return true;
  }
};

/* ----- Nivel "Descubre": Pipo cuenta los datos del planeta y luego hace preguntas ----- */
const Descubre = {
  mundo: 0,
  paso: 0,
  token: 0,
  esperaFlecha: null,

  empezar(mundoIdx) {
    this.mundo = mundoIdx;
    this.paso = -1;
    this.token++;
    const m = MUNDOS[mundoIdx];
    UI.tema(m.id);
    Sonido.tema(m.musica);
    $('#p-descubre').style.setProperty('--tema', ASTROS[m.id] ? ASTROS[m.id].c2 : '#9B7BF7');
    UI.mostrar('p-descubre');
    Mascota.actualizarTodas();
    const tk = this.token;
    Voz.decir(['nivel_descubre', 'escucha_dato']).then(() => { if (tk === this.token) this.siguiente(); });
    this.pintarPuntos();
  },

  pintarPuntos() {
    const lista = HECHOS_MUNDO[MUNDOS[this.mundo].id];
    $('#descubrePuntos').innerHTML = lista.map((h, i) => '<i class="' + (i <= this.paso ? 'si' : '') + '"></i>').join('');
  },

  siguiente() {
    const lista = HECHOS_MUNDO[MUNDOS[this.mundo].id];
    clearTimeout(this.esperaFlecha);
    this.paso++;
    this.pintarPuntos();
    const btn = $('#btnDescubreSeguir');
    btn.classList.remove('latiendo');
    btn.disabled = true;
    if (this.paso >= lista.length) { this.terminarHechos(); return; }
    const h = lista[this.paso];
    const cont = $('#descubreDibujo');
    cont.innerHTML = dibujoHecho(h);
    cont.classList.remove('entra'); void cont.offsetWidth; cont.classList.add('entra');
    Sonido.efecto('pagina');
    const tk = ++this.token;
    Voz.instruccion = [h[0]];
    Voz.decir([h[0]], { instruccion: true }).then(() => {
      if (tk !== this.token) return;
      btn.disabled = false;
      btn.classList.add('latiendo');
      this.esperaFlecha = setTimeout(() => { if (tk === this.token && UI.pantalla === 'p-descubre') { Voz.decir(['toca_seguir']); Mano.señalar([btn], { vueltas: 1 }); } }, 7000);
    });
  },

  async terminarHechos() {
    const m = MUNDOS[this.mundo];
    const tk = ++this.token;
    if (m.id === 'sol') {
      // La rima de los planetas, con la fila del sistema solar
      $('#descubreDibujo').innerHTML = filaOrdenHTML(null);
      await Voz.decir(['rima_intro']);
      const minis = $$('#descubreDibujo .mini-pl');
      for (let i = 0; i < 4; i++) {
        if (tk !== this.token) return;
        minis.forEach((x, k) => x.classList.toggle('resaltado', Math.floor(k / 2) === i));
        await Voz.decir(['rima_' + (i + 1)]);
      }
    }
    if (tk !== this.token) return;
    const carta = CARTAS.find(c => c.mundo === this.mundo && !c.extra);
    const nueva = Ciencia.darCarta(carta && carta.id);
    if (nueva) {
      await Premios.mostrarCarta(carta);
      if (tk !== this.token) return;
    }
    await Voz.decir(['ahora_preguntas']);
    if (tk !== this.token) return;
    Juego.empezar(this.mundo, 'descubre', { plan: Ciencia.planPreguntas(this.mundo, 4) });
  },

  salir() {
    this.token++;
    clearTimeout(this.esperaFlecha);
    Voz.callar();
    Mundo.abrir(this.mundo);
  }
};

/* ----- Álbum: cartas del espacio y pegatinas ----- */
const Album = {
  pestana: 'cartas',
  abrir(pestana) {
    this.pestana = pestana || 'cartas';
    UI.mostrar('p-album');
    this.pintar();
    Voz.decir([this.pestana === 'cartas' ? 'album' : 'pegatinas']);
  },
  cambiar(p) { this.pestana = p; Sonido.efecto('pagina'); this.pintar(); },
  pintar() {
    const p = Guardado.p;
    $$('#p-album .pestana').forEach(b => b.classList.toggle('activa', b.dataset.tab === this.pestana));
    const rej = $('#albumRejilla');
    rej.innerHTML = '';
    rej.className = 'coleccion ' + this.pestana;
    if (this.pestana === 'cartas') {
      $('#albumCuenta').textContent = p.cartas.length + '/' + CARTAS.length;
      CARTAS.forEach(c => {
        const tiene = p.cartas.indexOf(c.id) >= 0;
        const b = crear('button', 'casilla carta-album' + (tiene ? '' : ' secreta'), '<span class="ca-dibujo">' + (c.astro ? planetaSVG(c.astro) : '<span class="emo">' + c.emoji + '</span>') + '</span><span class="ca-nombre">' + (tiene ? c.nombre : '?') + '</span>');
        b.type = 'button';
        b.setAttribute('aria-label', tiene ? c.nombre : 'Carta secreta');
        b.addEventListener('click', () => this.tocarCarta(c, tiene, b));
        rej.appendChild(b);
      });
    } else {
      $('#albumCuenta').textContent = p.pegatinas.length + '/' + PEGATINAS.length;
      PEGATINAS.forEach(s => {
        const tiene = p.pegatinas.indexOf(s.id) >= 0;
        const b = crear('button', 'casilla' + (tiene ? '' : ' secreta'), '<span class="pegatina">' + (tiene ? '<span class="emo">' + s.e + '</span>' : '?') + '</span>');
        b.type = 'button';
        b.setAttribute('aria-label', tiene ? 'pegatina' : 'pegatina secreta');
        b.addEventListener('click', () => { b.classList.remove('rebote'); void b.offsetWidth; b.classList.add('rebote'); Sonido.efecto(tiene ? 'estrella' : 'no'); if (!tiene) Voz.decir(['album_secreto']); });
        rej.appendChild(b);
      });
    }
    requestAnimationFrame(() => this.ajustar());
  },
  /* Todas las casillas caben sin desplazarse (tamaño según la pantalla) */
  ajustar() {
    const cont = $('#albumRejilla');
    const W = cont.clientWidth - 8, H = cont.clientHeight - 8;
    if (!W || !H) return;
    const aspecto = this.pestana === 'cartas' ? 0.78 : 1;
    const m = medirRejilla(W, H, cont.children.length, aspecto, 10);
    const alto = Math.min(m.alto, this.pestana === 'cartas' ? 190 : 132);
    cont.style.setProperty('--cols', m.cols);
    cont.style.setProperty('--ch', alto + 'px');
    cont.style.setProperty('--cw', (alto * aspecto) + 'px');
    cont.style.setProperty('--g', '10px');
  },
  tocarCarta(c, tiene, b) {
    b.classList.remove('rebote'); void b.offsetWidth; b.classList.add('rebote');
    if (!tiene) { Sonido.efecto('no'); Voz.decir(['album_secreto']); return; }
    Sonido.efecto('carta');
    $$('.carta-album.leyendo').forEach(x => x.classList.remove('leyendo'));
    b.classList.add('leyendo');
    Voz.decir(c.hechos).then(() => b.classList.remove('leyendo'));
    const p = Guardado.p;
    p.stats.cartasOidas++;
    Misiones.sumar('carta', 1);
    Guardado.guardarLuego();
  }
};
