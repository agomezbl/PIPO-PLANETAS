/* =========================================================
   12. PANTALLAS: inicio, perfiles, nuevo explorador (con su nivel),
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
      const nv = NIVEL[nivelDe(p)];
      const b = crear('button', 'tarjeta-perfil', '<span class="tp-avatar emo">' + a.e + '</span><span class="tp-nombre">' + escapar(p.nombre || a.apodo) + '</span>' +
        '<span class="tp-nivel" style="--c:' + nv.color + '">' + nv.edades + '</span><span class="tp-edad">' + RANGOS[rangoDe(p)].icono + ' ' + mundosTerminados(p) + '/10</span>');
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

/* ----- Nuevo explorador: animal, nivel por edad y voz ----- */
const MUESTRA_NIVEL = {
  a: '<b>3 + 2</b><span class="emo">🍎🍎🍎</span>',
  b: '<b>38 + 5</b><span class="emo">🕰️🪙</span>',
  c: '<b>7 × 8</b><span class="frac-mini">½</span><b>1000</b>'
};
const RESUMEN_CORTO = { a: 'Contar, sumar y restar', b: 'Hasta 100, reloj y dinero', c: 'Tablas, llevadas y fracciones' };
const Nuevo = {
  paso: 0,
  datos: null,
  abrir() {
    this.paso = 0;
    this.datos = { avatar: null, banda: null, voz: 'lola' };
    UI.mostrar('p-nuevo');
    Mascota.actualizarTodas();
    Voz.decir(['nuevo_explorador']);
    this.pintar();
  },
  atras() {
    if (this.paso > 0) { this.paso--; this.pintar(); return; }
    if (Guardado.datos.perfiles.length) Perfiles.abrir(); else Inicio.abrir();
  },
  avanzar(paso, ms) { setTimeout(() => { if (this.paso === paso && UI.pantalla === 'p-nuevo') { this.paso = paso + 1; this.pintar(); } }, ms); },
  pintar() {
    $$('#pasosNuevo i').forEach((x, i) => x.classList.toggle('si', i <= this.paso));
    const cuerpo = $('#nuevoCuerpo');
    cuerpo.innerHTML = '';
    cuerpo.className = 'nuevo-cuerpo paso' + this.paso;
    if (this.paso === 0) {
      $('#nuevoIcono').innerHTML = Iconos.html('zorro');
      AVATARES.forEach(a => {
        const b = crear('button', 'opcion-avatar' + (this.datos.avatar === a.id ? ' elegida' : ''), '<span class="emo">' + a.e + '</span>');
        b.type = 'button';
        b.setAttribute('aria-label', a.apodo);
        b.addEventListener('click', () => {
          this.datos.avatar = a.id;
          Sonido.efecto('estrella');
          Voz.decir(['hola_' + a.apodo.toLowerCase().replace('ü', 'u')]);
          $$('.opcion-avatar', cuerpo).forEach(x => x.classList.toggle('elegida', x === b));
          this.avanzar(0, 900);
        });
        cuerpo.appendChild(b);
      });
      Voz.decir(['elige_cara'], { cola: true });
    } else if (this.paso === 1) {
      $('#nuevoIcono').innerHTML = Iconos.html('cohete');
      const caja = crear('div', 'niveles-tarjetas');
      NIVELES.forEach(n => {
        const b = crear('button', 'tarjeta-nivel' + (this.datos.banda === n.id ? ' elegida' : ''),
          '<span class="tn-edad">' + n.edades + '</span><span class="tn-anos">años</span><span class="tn-muestra">' + MUESTRA_NIVEL[n.id] + '</span><span class="tn-texto">' + RESUMEN_CORTO[n.id] + '</span>');
        b.type = 'button';
        b.style.setProperty('--c', n.color);
        b.setAttribute('aria-label', n.nombre + ': ' + RESUMEN_CORTO[n.id]);
        b.addEventListener('click', () => {
          this.datos.banda = n.id;
          Sonido.efecto('toque');
          Voz.decir([n.frase]);
          $$('.tarjeta-nivel', caja).forEach(x => x.classList.toggle('elegida', x === b));
          this.avanzar(1, 1100);
        });
        caja.appendChild(b);
      });
      cuerpo.appendChild(caja);
      cuerpo.appendChild(crear('p', 'nota-adulto', 'Adulto: elegid el nivel por lo que ya sabe. Se puede cambiar en la zona de padres (⚙️ mantenido 3 segundos).'));
      Voz.decir(['elige_nivel']);
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

/* Curva suave que pasa por una lista de puntos (para dibujar caminos) */
function curvaPor(pts) {
  if (pts.length < 2) return '';
  let d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ' C' + c1[0].toFixed(1) + ' ' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ' ' + c2[1].toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
  }
  return d;
}

/* Coloca un lienzo de tamaño fijo dentro de una zona: lo escala para que quepa
   (en vertical, se ajusta al ancho y se desplaza si es más alto) */
function escalarLienzo(zona, lienzoEl, w, h, vertical) {
  const W = zona.clientWidth, H = zona.clientHeight;
  if (!W || !H) return 1;
  let k = vertical ? Math.min(W / w, H * 1.9 / h, 1.25) : Math.min(W / w, H / h, 1.35);
  if (vertical && h * k < H) k = Math.min(W / w, H / h, 1.25);
  lienzoEl.style.width = w + 'px';
  lienzoEl.style.height = h + 'px';
  lienzoEl.style.transform = 'scale(' + k + ')';
  const marco = lienzoEl.parentNode;
  marco.style.width = (w * k) + 'px';
  marco.style.height = (h * k) + 'px';
  return k;
}

/* Forma del camino según la pantalla: tumbada, casi cuadrada (tablet de pie) o de pie (móvil, con desplazamiento) */
function elegirForma(zona, H, T, V) {
  const r = zona.clientWidth / Math.max(1, zona.clientHeight);
  if (r >= 1.15) return H;
  if (r >= 0.8 && zona.clientWidth >= 560) return T;
  return V;
}

/* Siguiente nivel pendiente de un mundo (o -1 si están todos hechos) */
function siguienteNivel(p, i) {
  const m = MUNDOS[i];
  for (let k = 0; k < TIPOS_NIVEL.length; k++) if (!nivelHecho(p, m.id, TIPOS_NIVEL[k].id)) return k;
  return -1;
}
/* Icono de un tipo de nivel en un mundo */
function iconoNivel(i, tipoId) {
  const m = MUNDOS[i];
  return tipoId === 'mision' ? m.mision.icono : (tipoId === 'proyecto' ? m.proyecto.icono : ICONOS_NIVEL[tipoId] || '🔤');
}
/* Empieza un nivel (desde el mapa, el botón grande o la pantalla del mundo) */
function jugarNivel(i, k) {
  const t = TIPOS_NIVEL[k];
  Mundo.idx = i;
  if (t.id === 'descubre') Descubre.empezar(i);
  else Juego.empezar(i, t.id);
}

/* ----- Mapa del viaje: los 10 planetas en el orden de la aventura ----- */
const TAM_MAPA = { tierra: 135, luna: 95, marte: 115, venus: 122, mercurio: 100, jupiter: 165, saturno: 160, urano: 128, neptuno: 128, sol: 185 };
/* En horizontal, la esquina de abajo a la derecha queda libre para el botón grande de jugar */
const MAPA_H = { w: 1000, h: 620, pos: [[95, 172], [262, 190], [432, 160], [600, 188], [765, 168], [918, 178], [760, 452], [562, 470], [366, 448], [150, 450]] };
/* Pantallas casi cuadradas (tablet de pie): serpiente de 3 en 3 y el Sol al final */
const MAPA_T = { w: 760, h: 1000, pos: [[130, 140], [380, 160], [630, 140], [630, 410], [380, 400], [130, 420], [140, 680], [385, 670], [630, 690], [370, 890]] };
const MAPA_V = { w: 600, h: 1300, pos: [[165, 105], [435, 215], [165, 330], [435, 445], [165, 560], [420, 690], [180, 820], [435, 945], [165, 1060], [400, 1185]] };
const Mapa = {
  abierto: false,
  vertical: false,

  desbloqueado(i) {
    const p = Guardado.p;
    return i < p.desbloqueados || i < p.libres + 1;
  },
  /* Mundo que toca jugar ahora: el primero desbloqueado sin terminar */
  actual() {
    const p = Guardado.p;
    for (let i = p.libres; i < MUNDOS.length; i++) if (this.desbloqueado(i) && !mundoTerminado(p, i)) return i;
    for (let i = 0; i < MUNDOS.length; i++) if (this.desbloqueado(i) && !mundoTerminado(p, i)) return i;
    return MUNDOS.length - 1;
  },

  abrir(op) {
    op = op || {};
    const p = Guardado.p;
    if (!p) { Inicio.abrir(); return; }
    UI.mostrar('p-mapa');
    UI.tema(null);
    Sonido.tema(null);
    Mascota.actualizarTodas();
    UI.actualizarEstrellas();
    $('#mapaAvatar').innerHTML = Iconos.de(avatarDe(p).e);
    const r = RANGOS[rangoDe(p)];
    $('#rangoIco').innerHTML = Iconos.de(r.icono);
    $('#chipRango').setAttribute('aria-label', 'Rango: ' + r.nombre);
    $('#chipRango').title = r.nombre;
    const nv = NIVEL[nivelDe(p)];
    $('#chipNivel').textContent = nv.edades;
    $('#chipNivel').style.setProperty('--c', nv.color);
    $('#chipNivel').title = nv.nombre;
    Misiones.pintarInsignia();
    this.pintar();
    requestAnimationFrame(() => { this.distribuir(); this.centrar(); });
    const frases = [];
    if (op.saludo) frases.push(p.stats.partidas ? 'hola_otra_vez' : 'hola_pipo');
    if (op.nuevoDia) { frases.push('dia_nuevo', 'regalo_estrellas'); setTimeout(() => UI.aviso('⭐', '+' + ESTRELLAS_DIA), 600); }
    if (op.primeraVez || !p.introVista) { frases.push('mapa_intro'); p.introVista = true; Guardado.guardarLuego(); }
    if (op.despertar !== undefined) frases.push('planeta_nuevo');
    frases.push('toca_brilla');
    Voz.decir(frases).then(() => { if (UI.pantalla === 'p-mapa') this.señalarActual(); });
    if (op.despertar !== undefined) this.animarDespertar(op.despertar);
    if (!MODO_PRUEBA && rnd() < 0.22) setTimeout(() => Asteroide.lanzar(), 4000);
  },

  señalarActual() {
    const b = $('#btnSeguirViaje');
    if (b && !b.hidden) Mano.señalar([b], { vueltas: 1 });
  },

  pintar() {
    const p = Guardado.p;
    const cont = $('#mapaNodos');
    cont.innerHTML = '';
    const actual = this.actual();
    MUNDOS.forEach((m, i) => {
      const id = m.id;
      const abierto = this.desbloqueado(i);
      const hecho = mundoTerminado(p, i);
      const est = estrellasMundo(p, id);
      const b = crear('button', 'planeta nodo-' + id + (abierto ? '' : ' bloqueado') + (hecho ? ' hecho' : '') + (i === actual ? ' actual' : ''));
      b.type = 'button';
      b.dataset.i = i;
      b.style.setProperty('--s', TAM_MAPA[id] + 'px');
      b.setAttribute('aria-label', (i + 1) + '. ' + m.nombre + (abierto ? '' : ' (dormido)'));
      b.innerHTML = '<span class="planeta-cuerpo">' + planetaSVG(id, { mini: true }) + '</span>' +
        '<span class="planeta-num">' + (i + 1) + '</span>' +
        (abierto ? '' : '<span class="planeta-insignia candado">' + ICONOS.candado + '</span>') +
        (hecho ? '<span class="planeta-insignia hecho">' + ICONOS.check + '</span>' : '') +
        '<span class="planeta-nombre">' + m.nombre + (est ? '<span class="planeta-est">' + SVG_ESTRELLA + est + '</span>' : '') + '</span>';
      b.addEventListener('click', () => this.tocar(i, b));
      cont.appendChild(b);
    });
    // Botón grande: seguir la aventura donde se quedó
    const k = siguienteNivel(p, actual);
    const fab = $('#btnSeguirViaje');
    fab.hidden = false;
    $('#seguirIco').innerHTML = Iconos.de(k >= 0 ? iconoNivel(actual, TIPOS_NIVEL[k].id) : '🪐');
    fab.setAttribute('aria-label', 'Seguir la aventura: ' + MUNDOS[actual].nombre + (k >= 0 ? ', ' + NOMBRE_TIPO[TIPOS_NIVEL[k].id] : ''));
    this.distribuir();
  },

  /* Coloca los planetas en el camino (dos filas en horizontal, zigzag en vertical) */
  distribuir() {
    const zona = $('#mapaZona'), lz = $('#mapaLienzo');
    if (!zona.clientWidth) return;
    const L = elegirForma(zona, MAPA_H, MAPA_T, MAPA_V);
    this.vertical = L === MAPA_V;
    escalarLienzo(zona, lz, L.w, L.h, this.vertical);
    zona.classList.toggle('vertical', this.vertical);
    const nodos = $$('#mapaNodos .planeta');
    nodos.forEach((n, i) => { n.style.left = L.pos[i][0] + 'px'; n.style.top = L.pos[i][1] + 'px'; });
    const p = Guardado.p;
    let hechos = 0;
    while (hechos < MUNDOS.length && (mundoTerminado(p, hechos) || hechos < p.libres)) hechos++;
    const svg = $('#mapaRuta');
    svg.setAttribute('viewBox', '0 0 ' + L.w + ' ' + L.h);
    svg.setAttribute('width', L.w);
    svg.setAttribute('height', L.h);
    svg.innerHTML = '<path d="' + curvaPor(L.pos) + '" class="ruta-fondo"/>' + '<path d="' + curvaPor(L.pos) + '" class="ruta-puntos"/>' +
      (hechos ? '<path d="' + curvaPor(L.pos.slice(0, Math.min(hechos + 1, L.pos.length))) + '" class="ruta-hecha"/>' : '');
    // Nave de Pipo junto al mundo actual
    const nave = $('#naveMapa');
    const a = this.actual();
    nave.innerHTML = naveSVG(p.piezas, p.nave.color);
    const s = TAM_MAPA[MUNDOS[a].id];
    nave.style.left = (L.pos[a][0] + s * 0.55) + 'px';
    nave.style.top = (L.pos[a][1] - s * 0.62) + 'px';
  },

  centrar() {
    const zona = $('#mapaZona');
    const n = $('#mapaNodos .planeta.actual');
    if (!n || !this.vertical) return;
    const r = n.getBoundingClientRect(), z = zona.getBoundingClientRect();
    zona.scrollTop = Math.max(0, zona.scrollTop + r.top - z.top - zona.clientHeight / 2 + r.height / 2);
  },

  tocar(i, b) {
    Mano.ocultar();
    if (!this.desbloqueado(i)) {
      Sonido.efecto('no');
      b.classList.remove('dormido-toque'); void b.offsetWidth; b.classList.add('dormido-toque');
      Voz.decir(['planeta_duerme', 'prueba_este']).then(() => { const a = $('#mapaNodos .planeta.actual'); if (a) Mano.señalar([a], { vueltas: 1 }); });
      return;
    }
    Sonido.efecto('toque');
    Mundo.abrir(i);
  },

  /* Botón grande: directo al siguiente nivel pendiente */
  seguir() {
    Mano.ocultar();
    const p = Guardado.p;
    const i = this.actual();
    const k = siguienteNivel(p, i);
    Sonido.efecto('toque');
    if (k < 0) { Mundo.abrir(i); return; }
    jugarNivel(i, k);
  },

  animarDespertar(i) {
    const n = $('#mapaNodos .planeta[data-i="' + i + '"]');
    if (!n) return;
    n.classList.add('despierta');
    Sonido.efecto('desbloquear');
    setTimeout(() => { const c = UI.centro(n); Confeti.lanzar(c.x, c.y, 50, true); }, 200);
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

/* ----- Pantalla de un mundo: el planeta, sus 6 niveles en un camino, el reto en casa y las palabras ----- */
const ICONOS_NIVEL = { aprende: '💡', practica: '🎯', descubre: '🔭', reto: '⚡' };
const MUNDO_H = { w: 1040, h: 540, planeta: [215, 270, 340], pos: [[470, 150], [665, 125], [860, 160], [770, 392], [590, 418], [415, 385]] };
const MUNDO_T = { w: 760, h: 900, planeta: [400, 190, 330], pos: [[140, 470], [380, 500], [620, 470], [530, 725], [330, 760], [130, 720]] };
const MUNDO_V = { w: 600, h: 1000, planeta: [300, 150, 250], pos: [[150, 335], [450, 440], [150, 550], [450, 660], [150, 770], [430, 880]] };
const Mundo = {
  idx: 0,
  abrir(i, op) {
    op = op || {};
    this.idx = i;
    const m = MUNDOS[i];
    const p = Guardado.p;
    const reg = registroMundo(p, m.id);
    UI.mostrar('p-mundo');
    UI.tema(m.id);
    Sonido.tema(m.musica);
    UI.actualizarEstrellas();
    $('#mundoTitulo').innerHTML = '<span class="num-viaje">' + (i + 1) + '</span>' + m.nombre;
    $('#mundoPlaneta').innerHTML = planetaSVG(m.id) + '<span class="mundo-pipo pipo-slot tocable" data-slot="mundo"></span>';
    Mascota.actualizarTodas();
    this.pintar();
    requestAnimationFrame(() => this.distribuir());
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
      const nombre = t.id === 'mision' ? nombreMision(this.idx) : NOMBRE_TIPO[t.id];
      const b = crear('button', 'nivel tipo-' + t.id + (abierto ? '' : ' bloqueado') + (est ? ' hecho' : ''));
      b.type = 'button';
      b.dataset.k = k;
      b.setAttribute('aria-label', (k + 1) + '. ' + nombre + (abierto ? '' : ' (cerrado)'));
      b.innerHTML = '<span class="nivel-disco"><span class="nivel-ico emo">' + iconoNivel(this.idx, t.id) + '</span><span class="nivel-num">' + (k + 1) + '</span>' +
        (abierto ? '' : '<span class="nivel-candado">' + ICONOS.candado + '</span>') + '</span>' +
        '<span class="nivel-estrellas">' + [1, 2, 3].map(x => '<i class="' + (x <= est ? 'si' : '') + '">' + SVG_ESTRELLA + '</i>').join('') + '</span>' +
        '<span class="nivel-nombre">' + NOMBRE_TIPO[t.id] + '</span>';
      b.addEventListener('click', () => this.tocarNivel(k, b));
      camino.appendChild(b);
    });
    if (siguiente >= 0) camino.children[siguiente].classList.add('siguiente');
    this.siguiente = siguiente;
    // Extras: reto en casa y palabras del explorador
    const extras = $('#mundoExtras');
    extras.innerHTML = '';
    const reg = registroMundo(p, m.id);
    extras.appendChild(boton('btn btn-extra btn-casa' + (reg.casa === 'hecho' ? ' hecho' : ''), '<span class="emo">' + m.casa.icono + '</span><span class="extra-txt">En casa</span>' + (reg.casa === 'hecho' ? '<span class="extra-check">' + ICONOS.check + '</span>' : ''), 'Reto en casa', () => Casa.abrir(this.idx)));
    if (this.idx >= 3 && Guardado.datos.ajustes.lectura && nivelDe(p) !== 'a') {
      extras.appendChild(boton('btn btn-extra btn-palabras', '<span class="emo">🔤</span><span class="extra-txt">Palabras</span>', 'Palabras del explorador', () => Palabras.empezar(this.idx)));
    }
    const fab = $('#btnJugarNivel');
    fab.hidden = siguiente < 0;
    if (siguiente >= 0) {
      $('#jugarNivelIco').innerHTML = Iconos.de(iconoNivel(this.idx, TIPOS_NIVEL[siguiente].id));
      fab.setAttribute('aria-label', 'Jugar: ' + NOMBRE_TIPO[TIPOS_NIVEL[siguiente].id]);
    }
    this.distribuir();
  },
  distribuir() {
    const zona = $('#mundoZona'), lz = $('#mundoLienzo');
    if (!zona || !zona.clientWidth) return;
    const L = elegirForma(zona, MUNDO_H, MUNDO_T, MUNDO_V);
    const vertical = L === MUNDO_V;
    escalarLienzo(zona, lz, L.w, L.h, vertical);
    zona.classList.toggle('vertical', vertical);
    const pl = $('#mundoPlaneta');
    pl.style.left = L.planeta[0] + 'px';
    pl.style.top = L.planeta[1] + 'px';
    pl.style.setProperty('--s', L.planeta[2] + 'px');
    $$('#mundoCamino .nivel').forEach((n, k) => { n.style.left = L.pos[k][0] + 'px'; n.style.top = L.pos[k][1] + 'px'; });
    const p = Guardado.p, m = MUNDOS[this.idx];
    let hechos = 0;
    while (hechos < TIPOS_NIVEL.length && nivelHecho(p, m.id, TIPOS_NIVEL[hechos].id)) hechos++;
    const svg = $('#mundoRuta');
    svg.setAttribute('viewBox', '0 0 ' + L.w + ' ' + L.h);
    svg.setAttribute('width', L.w);
    svg.setAttribute('height', L.h);
    const pts = L.pos;
    svg.innerHTML = '<path d="' + curvaPor(pts) + '" class="ruta-fondo"/><path d="' + curvaPor(pts) + '" class="ruta-puntos"/>' +
      (hechos ? '<path d="' + curvaPor(pts.slice(0, Math.min(hechos + 1, pts.length))) + '" class="ruta-hecha"/>' : '');
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
    jugarNivel(this.idx, k);
  },
  jugarSiguiente() {
    if (this.siguiente === undefined || this.siguiente < 0) return;
    Mano.ocultar();
    Sonido.efecto('toque');
    jugarNivel(this.idx, this.siguiente);
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
    const dif = nivelDe(p) === 'c' ? 2 : (nivelDe(p) === 'b' ? 1 : 0);
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
