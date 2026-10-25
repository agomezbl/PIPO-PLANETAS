/* =========================================================
   12. PANTALLAS: inicio, perfiles, nuevo explorador, prueba inicial,
       mapa del sistema solar y pantalla de cada mundo
   ========================================================= */

/* Día de juego: racha sin castigo (nunca se pierde nada por no jugar) */
function registrarDia() {
  const p = Guardado.p;
  if (!p) return false;
  const hoy = hoyISO();
  if (p.dias.ultimo === hoy) return false;
  const nuevo = !!p.dias.ultimo;
  if (p.dias.ultimo && diasEntre(p.dias.ultimo, hoy) === 1) p.dias.racha++;
  else p.dias.racha = 1;
  p.dias.ultimo = hoy;
  p.dias.total++;
  if (nuevo) p.estrellas += ESTRELLAS_DIA;
  Guardado.guardar();
  return nuevo;
}

/* Botón que hay que mantener pulsado (zona de padres, retos en casa) */
function mantenerPulsado(btn, ms, alCompletar) {
  let t0 = 0, raf = null, tocando = false;
  const anillo = btn.querySelector('.anillo-carga circle');
  const pintar = f => { if (anillo) anillo.style.strokeDashoffset = String(289.03 * (1 - f)); };
  const cancelar = () => { tocando = false; cancelAnimationFrame(raf); pintar(0); btn.classList.remove('cargando-pulsado'); };
  const paso = () => {
    if (!tocando) return;
    const f = Math.min(1, (Date.now() - t0) / ms);
    pintar(f);
    if (f >= 1) { cancelar(); alCompletar(); return; }
    raf = requestAnimationFrame(paso);
  };
  btn.addEventListener('pointerdown', ev => { ev.preventDefault(); tocando = true; t0 = Date.now(); btn.classList.add('cargando-pulsado'); raf = requestAnimationFrame(paso); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(e => btn.addEventListener(e, cancelar));
  btn.addEventListener('contextmenu', ev => ev.preventDefault());
  pintar(0);
}

/* ----- Inicio ----- */
const Inicio = {
  listo: false,
  pendiente: false,
  abrir() {
    UI.mostrar('p-inicio');
    Mascota.actualizarTodas();
  },
  marcarListo() {
    this.listo = true;
    const b = $('#btnJugar');
    if (b) b.classList.remove('cargando');
    if (this.pendiente) { this.pendiente = false; this.continuar(); }
  },
  jugar() {
    Sonido.iniciar();          // dentro del toque: desbloquea el audio en iPad/iPhone
    Sonido.actualizarMusica();
    Voz.avisar();
    Sonido.efecto('toque');
    if (!this.listo) { this.pendiente = true; return; }
    this.continuar();
  },
  continuar() {
    const d = Guardado.datos;
    if (!d.perfiles.length) { Nuevo.abrir(); return; }
    if (d.perfiles.length > 1) { Perfiles.abrir(); return; }
    Guardado.elegirPerfil(d.perfiles[0].id);
    entrarConPerfil();
  }
};

/* Al elegir perfil: saludo, prueba inicial si hace falta y mapa */
function entrarConPerfil() {
  const p = Guardado.p;
  Mascota.actualizarTodas();
  UI.actualizarEstrellas();
  const nuevoDia = registrarDia();
  Misiones.preparar();
  if (!p.pruebaHecha) { Prueba.empezar(); return; }
  Mapa.abrir({ saludo: true, nuevoDia: nuevoDia });
}

/* ----- ¿Quién juega? ----- */
const Perfiles = {
  abrir() {
    UI.mostrar('p-perfiles');
    Mascota.actualizarTodas();
    this.pintar();
    Voz.decir(['quien_juega']);
  },
  pintar() {
    const lista = $('#perfilesLista');
    lista.innerHTML = '';
    Guardado.datos.perfiles.forEach(p => {
      const a = avatarDe(p);
      const b = crear('button', 'tarjeta-perfil', '<span class="tp-avatar emo">' + a.e + '</span><span class="tp-nombre">' + escapar(p.nombre || a.apodo) + '</span><span class="tp-edad">' + RANGOS[rangoDe(p)].icono + ' ' + mundosTerminados(p) + '/10</span>');
      b.type = 'button';
      b.setAttribute('aria-label', 'Jugar como ' + (p.nombre || a.apodo));
      b.addEventListener('click', () => {
        Guardado.elegirPerfil(p.id);
        Sonido.efecto('toque');
        Voz.decir(['hola_' + a.apodo.toLowerCase().replace('ü', 'u')]);
        entrarConPerfil();
      });
      lista.appendChild(b);
    });
    if (Guardado.datos.perfiles.length < MAX_PERFILES) {
      const mas = crear('button', 'tarjeta-perfil nuevo', '<span class="tp-avatar"><span class="ico">' + ICONOS.mas + '</span></span>');
      mas.type = 'button';
      mas.setAttribute('aria-label', 'Nuevo explorador');
      mas.addEventListener('click', () => { Sonido.efecto('toque'); Nuevo.abrir(); });
      lista.appendChild(mas);
    }
  }
};

/* ----- Nuevo explorador: animal, edad y voz ----- */
const Nuevo = {
  paso: 0,
  datos: null,
  abrir() {
    this.paso = 0;
    this.datos = { avatar: null, edad: 5, voz: 'lola' };
    UI.mostrar('p-nuevo');
    Mascota.actualizarTodas();
    Voz.decir(['nuevo_explorador']);
    this.pintar();
  },
  atras() {
    if (this.paso > 0) { this.paso--; this.pintar(); return; }
    if (Guardado.datos.perfiles.length) Perfiles.abrir(); else Inicio.abrir();
  },
  pintar() {
    $$('#pasosNuevo i').forEach((x, i) => x.classList.toggle('si', i <= this.paso));
    const cuerpo = $('#nuevoCuerpo');
    cuerpo.innerHTML = '';
    cuerpo.className = 'nuevo-cuerpo paso' + this.paso;
    if (this.paso === 0) {
      $('#nuevoIcono').textContent = '🐾';
      AVATARES.forEach(a => {
        const b = crear('button', 'opcion-avatar' + (this.datos.avatar === a.id ? ' elegida' : ''), '<span class="emo">' + a.e + '</span>');
        b.type = 'button';
        b.setAttribute('aria-label', a.apodo);
        b.addEventListener('click', () => {
          this.datos.avatar = a.id;
          Sonido.efecto('estrella');
          Voz.decir(['hola_' + a.apodo.toLowerCase().replace('ü', 'u')]);
          $$('.opcion-avatar', cuerpo).forEach(x => x.classList.toggle('elegida', x === b));
          setTimeout(() => { if (this.paso === 0) { this.paso = 1; this.pintar(); } }, 900);
        });
        cuerpo.appendChild(b);
      });
      Voz.decir(['elige_cara'], { cola: true });
    } else if (this.paso === 1) {
      $('#nuevoIcono').textContent = '🎂';
      [5, 6, 7].forEach(e => {
        const b = crear('button', 'opcion-edad btn', '<b>' + e + '</b><span class="velas">' + '🕯️'.repeat(e) + '</span>');
        b.type = 'button';
        b.setAttribute('aria-label', e + ' años');
        b.addEventListener('click', () => {
          this.datos.edad = e;
          Sonido.efecto('toque');
          Voz.decir([N(e)]);
          setTimeout(() => { if (this.paso === 1) { this.paso = 2; this.pintar(); } }, 700);
        });
        cuerpo.appendChild(b);
      });
      Voz.decir(['cuantos_anos']);
    } else {
      $('#nuevoIcono').innerHTML = ICONOS.altavoz;
      const tarjetas = crear('div', 'voz-tarjetas');
      VOCES_PIPO.filter(v => v.id !== 'sistema').forEach(v => {
        const b = crear('button', 'tarjeta-voz' + (this.datos.voz === v.id ? ' elegida' : ''), '<span class="tv-emo">' + v.icono + '</span><span class="tv-nombre">' + v.nombre + '</span><span class="tv-altavoz ico">' + ICONOS.altavoz + '</span>');
        b.type = 'button';
        b.setAttribute('aria-label', 'Voz ' + v.nombre);
        b.addEventListener('click', () => {
          this.datos.voz = v.id;
          $$('.tarjeta-voz', tarjetas).forEach(x => x.classList.toggle('elegida', x === b));
          Voz.probar(v.id);
        });
        tarjetas.appendChild(b);
      });
      cuerpo.appendChild(tarjetas);
      const ok = boton('btn btn-grande btn-ok btn-fin-nuevo', '<span class="ico">' + ICONOS.check + '</span>', 'Listo', () => this.terminar());
      cuerpo.appendChild(ok);
      Voz.decir(['elige_voz']);
    }
  },
  terminar() {
    const p = Guardado.crearPerfil(this.datos);
    if (!p) { Perfiles.abrir(); return; }
    Sonido.efecto('desbloquear');
    entrarConPerfil();
  }
};

/* ----- Prueba inicial (6 y 7 años): ¿por qué planeta empezamos? ----- */
const Prueba = {
  plan: [],
  empezar() {
    const p = Guardado.p;
    if (p.edad <= 5) { Guardado.aplicarPrueba(p, 0); Mapa.abrir({ primeraVez: true }); return; }
    const mundos = p.edad >= 7 ? ['tierra', 'luna', 'marte', 'marte', 'venus', 'venus', 'mercurio', 'mercurio'] : ['tierra', 'tierra', 'luna', 'luna', 'marte', 'marte'];
    const usados = {};
    this.plan = mundos.map(id => {
      const habs = PRUEBA_HABS[id];
      usados[id] = (usados[id] || 0);
      const hab = habs[usados[id]++ % habs.length];
      return { hab: hab, dif: 1, mundoPrueba: IDX_MUNDO[id] };
    });
    this.maximo = p.edad >= 7 ? 5 : 3;
    Voz.decir(['prueba_intro']).then(() => {
      Juego.empezar(0, 'prueba', {
        modo: 'prueba',
        plan: this.plan,
        parar: res => this.fallidos(res) >= 2,
        alFinal: res => this.fin(res)
      });
    });
  },
  fallidos(res) { return res.filter(x => !x).length; },
  fin(res) {
    // Mundos superados seguidos desde el principio (todas sus preguntas a la primera)
    let inicio = 0;
    for (let m = 0; m < this.maximo; m++) {
      const idx = this.plan.map((x, i) => (x.mundoPrueba === m ? i : -1)).filter(i => i >= 0);
      if (!idx.length) continue;
      if (idx.every(i => res[i] === true)) inicio = m + 1; else break;
    }
    inicio = Math.min(inicio, this.maximo);
    Guardado.aplicarPrueba(Guardado.p, inicio);
    Voz.decir(['prueba_fin']);
    Mapa.abrir({ primeraVez: true });
  }
};

/* ----- Mapa del sistema solar (en su orden real) ----- */
const ORDEN_MAPA = ['sol', 'mercurio', 'venus', 'tierra', 'luna', 'marte', 'jupiter', 'saturno', 'urano', 'neptuno'];
const TAM_MAPA = { sol: 2.2, mercurio: 0.7, venus: 0.85, tierra: 0.9, luna: 0.55, marte: 0.8, jupiter: 1.35, saturno: 1.25, urano: 1.05, neptuno: 1.05 };
const Mapa = {
  abierto: false,
  temporizadorAyuda: null,

  desbloqueado(i) {
    const p = Guardado.p;
    return i < p.desbloqueados || i < p.libres + 1;
  },
  /* Mundo que toca jugar ahora: el primero desbloqueado sin terminar */
  actual() {
    const p = Guardado.p;
    // Primero el mundo de la aventura (los mundos abiertos por la prueba se pueden visitar, pero no "tocan")
    for (let i = p.libres; i < MUNDOS.length; i++) if (this.desbloqueado(i) && !mundoTerminado(p, i)) return i;
    for (let i = 0; i < MUNDOS.length; i++) if (this.desbloqueado(i) && !mundoTerminado(p, i)) return i;
    return MUNDOS.length - 1;
  },

  abrir(op) {
    op = op || {};
    const p = Guardado.p;
    if (!p) { Inicio.abrir(); return; }
    UI.mostrar('p-mapa');
    Sonido.tema(null);
    Mascota.actualizarTodas();
    UI.actualizarEstrellas();
    $('#mapaAvatar').textContent = avatarDe(p).e;
    const r = RANGOS[rangoDe(p)];
    $('#rangoIco').textContent = r.icono;
    $('#chipRango').setAttribute('aria-label', 'Rango: ' + r.nombre);
    $('#chipRango').title = r.nombre;
    $('#viajeCuenta').textContent = mundosTerminados(p) + '/10';
    Misiones.pintarInsignia();
    this.pintar();
    requestAnimationFrame(() => this.centrar());
    const frases = [];
    if (op.saludo) frases.push(p.stats.partidas ? 'hola_otra_vez' : 'hola_pipo');
    if (op.nuevoDia) { frases.push('dia_nuevo', 'regalo_estrellas'); setTimeout(() => UI.aviso('⭐', '+' + ESTRELLAS_DIA), 600); }
    if (op.primeraVez || !p.introVista) { frases.push('mapa_intro'); p.introVista = true; Guardado.guardarLuego(); }
    if (op.despertar !== undefined) frases.push('planeta_nuevo');
    frases.push('toca_planeta');
    Voz.decir(frases).then(() => { if (UI.pantalla === 'p-mapa') this.señalarActual(); });
    if (op.despertar !== undefined) this.animarDespertar(op.despertar);
    if (!MODO_PRUEBA && rnd() < 0.22) setTimeout(() => Asteroide.lanzar(), 4000);
  },

  señalarActual() {
    const n = $('#mapaNodos .planeta.actual');
    if (n) Mano.señalar([n], { vueltas: 1 });
  },

  pintar() {
    const p = Guardado.p;
    const cont = $('#mapaNodos');
    cont.innerHTML = '';
    const actual = this.actual();
    ORDEN_MAPA.forEach(id => {
      const i = IDX_MUNDO[id];
      const abierto = this.desbloqueado(i);
      const hecho = mundoTerminado(p, i);
      const est = estrellasMundo(p, id);
      const b = crear('button', 'planeta nodo-' + id + (abierto ? '' : ' bloqueado') + (hecho ? ' hecho' : '') + (i === actual ? ' actual' : ''));
      b.type = 'button';
      b.dataset.i = i;
      b.style.setProperty('--tam', TAM_MAPA[id]);
      b.setAttribute('aria-label', MUNDOS[i].nombre + (abierto ? '' : ' (dormido)'));
      b.innerHTML = '<span class="planeta-cuerpo">' + planetaSVG(id, { mini: true }) + '</span>' +
        '<span class="planeta-num">' + (i + 1) + '</span>' +
        (abierto ? '' : '<span class="planeta-insignia candado">' + ICONOS.candado + '</span>') +
        (hecho ? '<span class="planeta-insignia hecho">' + ICONOS.check + '</span>' : '') +
        '<span class="planeta-nombre">' + MUNDOS[i].nombre + '</span>' +
        (est ? '<span class="planeta-est">' + SVG_ESTRELLA + est + '</span>' : '');
      b.addEventListener('click', () => this.tocar(i, b));
      cont.appendChild(b);
    });
    this.distribuir();
  },

  /* Coloca los planetas en una pista horizontal (tumbado) o vertical (de pie) con sus órbitas */
  distribuir() {
    const zona = $('#mapaZona'), pista = $('#mapaPista');
    const W = zona.clientWidth, H = zona.clientHeight;
    if (!W || !H) return;
    const horizontal = W >= H;
    const base = limitar((horizontal ? H : W) * 0.22, 92, 130);
    const paso = base * 1.32;
    const largo = Math.max(horizontal ? W : H, base * 1.2 + paso * 9 + base);
    const ancho = horizontal ? H : W;
    pista.style.width = (horizontal ? largo : W) + 'px';
    pista.style.height = (horizontal ? H : largo) + 'px';
    pista.classList.toggle('vertical', !horizontal);
    const solC = -base * 0.55;   // el Sol asoma por el borde
    const pos = {};
    let k = 0;
    ORDEN_MAPA.forEach(id => {
      let a, b;
      if (id === 'sol') { a = solC; b = ancho / 2; }
      else if (id === 'luna') { const t = pos.tierra; a = t.a + base * 0.5; b = t.b - base * 0.85 * (horizontal ? 1 : -1); }
      else { k++; a = base * 0.8 + k * paso; b = ancho / 2 + Math.sin(k * 1.3) * ancho * 0.16; }
      pos[id] = { a: a, b: b };
    });
    const nodos = $$('#mapaNodos .planeta');
    nodos.forEach(n => {
      const id = ORDEN_MAPA[nodos.indexOf(n)];
      const s = base * TAM_MAPA[id];
      n.style.setProperty('--s', s + 'px');
      const P = pos[id];
      n.style.left = (horizontal ? P.a : P.b) + 'px';
      n.style.top = (horizontal ? P.b : P.a) + 'px';
    });
    // Órbitas (arcos centrados en el Sol) y ruta del viaje
    const svg = $('#mapaOrbitas');
    const sx = horizontal ? solC : ancho / 2, sy = horizontal ? ancho / 2 : solC;
    let h = '';
    ORDEN_MAPA.forEach(id => {
      if (id === 'sol' || id === 'luna') return;
      const P = pos[id];
      const px = horizontal ? P.a : P.b, py = horizontal ? P.b : P.a;
      const r = Math.sqrt((px - sx) * (px - sx) + (py - sy) * (py - sy));
      h += '<circle cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="' + r.toFixed(1) + '" class="orbita-mapa"/>';
    });
    const p = Guardado.p;
    const hechos = MUNDOS.map((m, i) => i).filter(i => mundoTerminado(p, i));
    const ruta = [];
    for (let i = 0; i < MUNDOS.length && (i === 0 || mundoTerminado(p, i - 1) || i - 1 < p.libres); i++) ruta.push(pos[MUNDOS[i].id]);
    if (ruta.length > 1) {
      let d = '';
      ruta.forEach((P, i) => {
        const x = horizontal ? P.a : P.b, y = horizontal ? P.b : P.a;
        d += (i ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      });
      h += '<path d="' + d + '" class="ruta-viaje"/>';
    }
    svg.setAttribute('width', pista.style.width.replace('px', ''));
    svg.setAttribute('height', pista.style.height.replace('px', ''));
    svg.innerHTML = h;
    this.horizontal = horizontal;
    this.hechos = hechos.length;
    // Nave de Pipo junto al mundo actual
    const nave = $('#naveMapa');
    const actual = $('#mapaNodos .planeta.actual');
    nave.innerHTML = naveSVG(p.piezas, p.nave.color);
    if (actual) {
      nave.style.left = (parseFloat(actual.style.left) + (horizontal ? 0 : base * 0.9)) + 'px';
      nave.style.top = (parseFloat(actual.style.top) - (horizontal ? base * 0.95 : 0)) + 'px';
    }
  },

  centrar() {
    const zona = $('#mapaZona');
    const n = $('#mapaNodos .planeta.actual');
    if (!n) return;
    const x = parseFloat(n.style.left), y = parseFloat(n.style.top);
    if (this.horizontal) zona.scrollLeft = Math.max(0, x - zona.clientWidth / 2);
    else zona.scrollTop = Math.max(0, y - zona.clientHeight / 2);
  },

  tocar(i, b) {
    Mano.ocultar();
    if (!this.desbloqueado(i)) {
      Sonido.efecto('no');
      b.classList.remove('dormido-toque'); void b.offsetWidth; b.classList.add('dormido-toque');
      Voz.decir(['planeta_duerme', 'prueba_este']).then(() => this.señalarActual());
      return;
    }
    Sonido.efecto('toque');
    Mundo.abrir(i);
  },

  animarDespertar(i) {
    const n = $('#mapaNodos .planeta[data-i="' + i + '"]');
    if (!n) return;
    n.classList.add('despierta');
    Sonido.efecto('desbloquear');
    const c = UI.centro(n);
    Confeti.lanzar(c.x, c.y, 50, true);
  }
};

/* ----- Asteroide sorpresa: cruza la pantalla y regala estrellas ----- */
const Asteroide = {
  lanzar() {
    if (!['p-mapa', 'p-mundo'].includes(UI.pantalla) || $('.asteroide')) return;
    const b = crear('button', 'asteroide estrella-fugaz', '<span class="emo">☄️</span>');
    b.type = 'button';
    b.setAttribute('aria-label', 'Asteroide de estrellas');
    b.addEventListener('click', () => {
      if (b.classList.contains('cogida')) return;
      b.classList.add('cogida');
      const p = Guardado.p;
      p.estrellas += ESTRELLAS_ASTEROIDE;
      Guardado.guardar();
      UI.actualizarEstrellas();
      Sonido.efecto('estrellaGrande');
      const c = UI.centro(b);
      Confeti.lanzar(c.x, c.y, 40, true);
      UI.aviso('☄️', '+' + ESTRELLAS_ASTEROIDE + ' ⭐');
      setTimeout(() => b.remove(), 600);
    });
    b.addEventListener('animationend', () => { if (!b.classList.contains('cogida')) b.remove(); });
    $('#app').appendChild(b);
    Voz.decir(['asteroide']);
  }
};

/* ----- Pantalla de un mundo: los 6 niveles, el reto en casa y las palabras ----- */
const ICONOS_NIVEL = { aprende: '💡', practica: '🎯', descubre: '🔭', reto: '⚡' };
const Mundo = {
  idx: 0,
  abrir(i, op) {
    op = op || {};
    this.idx = i;
    const m = MUNDOS[i];
    const p = Guardado.p;
    const reg = registroMundo(p, m.id);
    UI.mostrar('p-mundo');
    Sonido.tema(m.musica);
    Mascota.actualizarTodas();
    UI.actualizarEstrellas();
    $('#p-mundo').style.setProperty('--tema', ASTROS[m.id].c2);
    $('#mundoTitulo').innerHTML = '<span class="num-viaje">' + (i + 1) + '</span>' + m.nombre;
    $('#mundoPlaneta').innerHTML = planetaSVG(m.id) + '<span class="mundo-pipo pipo-slot" data-slot="mundo"></span>';
    Mascota.actualizarTodas();
    this.pintar();
    const frases = [];
    if (!reg.visto) { frases.push('mundo_' + m.id); reg.visto = true; Guardado.guardarLuego(); }
    frases.push('toca_brilla');
    Voz.decir(frases).then(() => { if (UI.pantalla === 'p-mundo') { const s = $('#mundoCamino .nivel.siguiente'); if (s) Mano.señalar([s], { vueltas: 1 }); } });
    if (!MODO_PRUEBA && rnd() < 0.12) setTimeout(() => Asteroide.lanzar(), 5000);
  },
  nivelAbierto(tipoIdx) {
    const p = Guardado.p;
    const m = MUNDOS[this.idx];
    if (tipoIdx === 0 || this.idx < p.libres) return true;
    return nivelHecho(p, m.id, TIPOS_NIVEL[tipoIdx - 1].id);
  },
  pintar() {
    const p = Guardado.p;
    const m = MUNDOS[this.idx];
    const camino = $('#mundoCamino');
    camino.innerHTML = '';
    let siguiente = -1;
    TIPOS_NIVEL.forEach((t, k) => {
      const abierto = this.nivelAbierto(k);
      const reg = (p.mundos[m.id] && p.mundos[m.id].niveles[t.id]) || null;
      const est = reg ? reg.mejor : 0;
      if (abierto && !est && siguiente < 0) siguiente = k;
      const icono = t.id === 'mision' ? m.mision.icono : (t.id === 'proyecto' ? m.proyecto.icono : ICONOS_NIVEL[t.id]);
      const b = crear('button', 'nivel tipo-' + t.id + (abierto ? '' : ' bloqueado') + (est ? ' hecho' : ''));
      b.type = 'button';
      b.style.setProperty('--k', k);
      b.setAttribute('aria-label', NOMBRE_TIPO[t.id] + (abierto ? '' : ' (cerrado)'));
      b.innerHTML = '<span class="nivel-ico emo">' + icono + '</span>' +
        (abierto ? '' : '<span class="nivel-candado">' + ICONOS.candado + '</span>') +
        '<span class="nivel-estrellas">' + [1, 2, 3].map(x => '<i class="' + (x <= est ? 'si' : '') + '">' + SVG_ESTRELLA + '</i>').join('') + '</span>' +
        '<span class="nivel-nombre">' + NOMBRE_TIPO[t.id] + '</span>';
      b.addEventListener('click', () => this.tocarNivel(k, b));
      camino.appendChild(b);
    });
    if (siguiente >= 0) camino.children[siguiente].classList.add('siguiente');
    // Extras: reto en casa y palabras del explorador
    const extras = $('#mundoExtras');
    extras.innerHTML = '';
    const reg = registroMundo(p, m.id);
    const casa = boton('btn btn-extra btn-casa' + (reg.casa === 'hecho' ? ' hecho' : ''), '<span class="emo">🏠</span><span class="emo extra-mini">' + m.casa.icono + '</span>' + (reg.casa === 'hecho' ? '<span class="extra-check">' + ICONOS.check + '</span>' : ''), 'Reto en casa', () => Casa.abrir(this.idx));
    extras.appendChild(casa);
    if (this.idx >= 3 && Guardado.datos.ajustes.lectura && p.edad >= 6) {
      extras.appendChild(boton('btn btn-extra btn-palabras', '<span class="emo">🔤</span>', 'Palabras del explorador', () => Palabras.empezar(this.idx)));
    }
  },
  tocarNivel(k, b) {
    Mano.ocultar();
    if (!this.nivelAbierto(k)) {
      Sonido.efecto('no');
      b.classList.remove('dormido-toque'); void b.offsetWidth; b.classList.add('dormido-toque');
      Voz.decir(['nivel_cerrado']).then(() => { const s = $('#mundoCamino .nivel.siguiente'); if (s) Mano.señalar([s], { vueltas: 1 }); });
      return;
    }
    Sonido.efecto('toque');
    const t = TIPOS_NIVEL[k];
    const p = Guardado.p;
    if (nivelHecho(p, MUNDOS[this.idx].id, t.id)) Misiones.sumar('repaso', 1);
    if (t.id === 'descubre') Descubre.empezar(this.idx);
    else Juego.empezar(this.idx, t.id);
  }
};

/* ----- Reto en casa ----- */
const Casa = {
  mundo: 0,
  abrir(i) {
    this.mundo = i;
    const m = MUNDOS[i];
    const p = Guardado.p;
    const hecho = registroMundo(p, m.id).casa === 'hecho';
    $('#casaIcono').textContent = m.casa.icono;
    $('#casaTexto').textContent = FRASES['casa_' + m.id].replace('Reto en casa: ', '');
    $('#btnCasaHecho').hidden = hecho;
    Mano.ocultar();
    $('#c-casa').hidden = false;
    Voz.decir(['casa_' + m.id].concat(hecho ? ['casa_hecho'] : ['casa_adulto']));
  },
  oir() { const m = MUNDOS[this.mundo]; Voz.decir(['casa_' + m.id]); },
  cerrar() { $('#c-casa').hidden = true; Voz.callar(); },
  confirmar() {
    const m = MUNDOS[this.mundo];
    const p = Guardado.p;
    const reg = registroMundo(p, m.id);
    if (reg.casa === 'hecho') return;
    reg.casa = 'hecho';
    p.estrellas += ESTRELLAS_CASA;
    const pegatina = Premios.pegatinaNueva();
    Guardado.guardar();
    $('#c-casa').hidden = true;
    UI.actualizarEstrellas();
    Sonido.efecto('nivel');
    Confeti.lanzar(window.innerWidth / 2, window.innerHeight / 2, 90, true);
    Voz.decir(['casa_hecho', 'toma_estrellas']);
    if (pegatina) Premios.mostrarPegatina(pegatina);
    Logros.comprobar();
    Mundo.pintar();
  }
};

/* ----- Palabras del explorador (lectura, opcional) ----- */
const Palabras = {
  empezar(i) {
    const p = Guardado.p;
    const dif = p.edad >= 7 ? 1 : 0;
    const plan = rango(1, 6).map(k => ({ hab: 'palabras', dif: Math.min(2, dif + (k > 3 ? 1 : 0)) }));
    Voz.decir(['palabras_intro']).then(() => {
      Juego.empezar(i, 'palabras', {
        modo: 'palabras',
        plan: plan,
        alFinal: res => {
          p.stats.palabras = (p.stats.palabras || 0) + 1;
          p.estrellas += res.length;
          Guardado.guardar();
          Logros.comprobar();
          Premios.finNivel(i, 'palabras', res);
        }
      });
    });
  }
};
