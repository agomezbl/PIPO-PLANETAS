/* =========================================================
   14. PAUSA, DESCANSO Y ZONA DE PADRES
   ========================================================= */
const Pausa = {
  abrir(silencio) {
    Mano.ocultar();
    $('#c-pausa').hidden = false;
    Mascota.actualizarTodas();
    this.pintarMusica();
    if (!silencio) Voz.decir(['pausa']);
  },
  cerrar() { $('#c-pausa').hidden = true; },
  pintarMusica() { $('#btnMusicaPausa').classList.toggle('apagada', !Guardado.datos.ajustes.musica); },
  alternarMusica() {
    const a = Guardado.datos.ajustes;
    a.musica = !a.musica;
    Sonido.actualizarMusica();
    Guardado.guardar();
    this.pintarMusica();
  }
};

/* Límite de tiempo (por defecto 20 minutos): Pipo propone descansar, sin culpa */
const Descanso = {
  toca() {
    const min = Guardado.datos.ajustes.descansoMin;
    return min > 0 && Sesion.ms >= min * 60000;
  },
  abrir(despues) {
    this.despues = despues;
    const estricto = Guardado.datos.ajustes.descansoEstricto;
    Mano.ocultar();
    $('#c-descanso').hidden = false;
    Mascota.actualizarTodas();
    const slot = $('#c-descanso .pipo-slot');
    Mascota.estado(slot, 'estirar', true);
    $('#btnSeguirJugando').hidden = estricto;
    $('#descansoNota').hidden = !estricto;
    $('#btnDescansoPadres').hidden = !estricto;
    Voz.decir(estricto ? ['descanso1', 'tiempo_fin'] : ['descanso1', 'descanso2']);
  },
  cerrar() { $('#c-descanso').hidden = true; },
  descansar() {
    this.cerrar();
    Sesion.reiniciar();
    Voz.decir(['hasta_luego']);
    Inicio.abrir();
    const slot = $('#p-inicio .pipo-slot');
    Mascota.estado(slot, 'dormir', true);
    setTimeout(() => Mascota.estado(slot, 'dormir', false), 6000);
  },
  seguir() {
    this.cerrar();
    // Cinco minutos más y vuelve a proponerlo
    Sesion.ms = Math.max(0, (Guardado.datos.ajustes.descansoMin - 5) * 60000);
    const f = this.despues; this.despues = null;
    if (f) f();
  }
};

/* ----- Zona de padres: mantener pulsado 3 s + una operación de adultos ----- */
const Padres = {
  abierto: false,
  seccion: 'progreso',
  respuesta: 0,

  pedirAcceso() {
    const a = azar(6, 9), b = azar(6, 9);
    this.respuesta = a * b;
    const c = $('#padresContenido');
    Mano.ocultar();
    $('#c-padres').hidden = false;
    c.innerHTML = '<div class="pp-acceso"><p>Para entrar, resuelve:</p><p class="pp-operacion">' + a + ' × ' + b + ' = ?</p>' +
      '<input id="ppRespuesta" class="pp-input" type="number" inputmode="numeric" autocomplete="off" aria-label="Resultado">' +
      '<button id="ppEntrar" class="btn-texto-pp" type="button">Entrar</button><p class="pp-nota" id="ppError" hidden>No es correcto. Inténtalo de nuevo.</p></div>';
    const inp = $('#ppRespuesta');
    const entrar = () => {
      if (Number(inp.value) === this.respuesta) { this.abrir(); return; }
      $('#ppError').hidden = false;
      inp.value = '';
    };
    $('#ppEntrar').addEventListener('click', entrar);
    inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') entrar(); });
    setTimeout(() => { try { inp.focus(); } catch (e) { /* sin foco */ } }, 100);
    Voz.callar();
  },

  abrir() {
    this.abierto = true;
    $('#c-padres').hidden = false;
    // Un adulto ha entrado: el descanso estricto se levanta
    if (!$('#c-descanso').hidden) { Sesion.reiniciar(); Descanso.cerrar(); }
    this.pintar();
  },

  cerrar() {
    this.abierto = false;
    $('#c-padres').hidden = true;
    Guardado.guardar();
    Sonido.aplicarVolumen();
    Sonido.actualizarMusica();
    if (UI.pantalla === 'p-mapa') Mapa.abrir({});
    else if (UI.pantalla === 'p-mundo') Mundo.abrir(Mundo.idx);
  },

  pintar() {
    const c = $('#padresContenido');
    const p = Guardado.p;
    const secciones = [['progreso', '📊 Progreso'], ['perfil', '🧒 Perfil'], ['ajustes', '⚙️ Ajustes'], ['ayuda', 'ℹ️ Ayuda']];
    let h = '<div class="pp-pestanas">' + secciones.map(s => '<button class="seg' + (this.seccion === s[0] ? ' activo' : '') + '" data-sec="' + s[0] + '" type="button">' + s[1] + '</button>').join('') + '</div>';
    if (Guardado.datos.perfiles.length) {
      h += '<div class="pp-fila pp-perfiles"><span>Explorador:</span><div class="segmentos">' + Guardado.datos.perfiles.map(x => '<button class="seg' + (x.id === p.id ? ' activo' : '') + '" data-perfil="' + x.id + '" type="button">' + avatarDe(x).e + ' ' + escapar(x.nombre || avatarDe(x).apodo) + '</button>').join('') +
        (Guardado.datos.perfiles.length < MAX_PERFILES ? '<button class="seg" data-accion="nuevo" type="button">＋ Nuevo</button>' : '') + '</div></div>';
    }
    if (!p) h += '<p>Todavía no hay ningún explorador. Crea uno desde la pantalla de inicio.</p>';
    else if (this.seccion === 'progreso') h += this.htmlProgreso(p);
    else if (this.seccion === 'perfil') h += this.htmlPerfil(p);
    else if (this.seccion === 'ajustes') h += this.htmlAjustes();
    else h += this.htmlAyuda();
    if (!Guardado.disponible) h += '<p class="pp-aviso">Este navegador no permite guardar el progreso (modo privado o almacenamiento bloqueado). Se perderá al cerrar.</p>';
    c.innerHTML = h;
    this.enlazar();
  },

  htmlProgreso(p) {
    const total = p.stats.intentos ? Math.round(100 * p.stats.primera / Math.max(1, p.stats.aciertos)) : 0;
    let h = '<div class="pp-resumen">' +
      '<div class="pp-dato"><b>' + mundosTerminados(p) + '/10</b>mundos terminados</div>' +
      '<div class="pp-dato"><b>' + p.stats.niveles + '</b>niveles jugados</div>' +
      '<div class="pp-dato"><b>' + total + '%</b>aciertos a la primera</div>' +
      '<div class="pp-dato"><b>' + Math.round(p.stats.minutos) + ' min</b>tiempo jugado</div>' +
      '<div class="pp-dato"><b>' + p.dias.total + '</b>días de juego</div>' +
      '<div class="pp-dato"><b>' + p.cartas.length + '/' + CARTAS.length + '</b>cartas del álbum</div></div>';
    // Recomendaciones: las habilidades que más cuestan
    const conDatos = Object.keys(p.habs).filter(k => HABILIDADES[k] && p.habs[k].hist.length >= 3).map(k => ({ k: k, d: dominio(p.habs[k]) })).sort((a, b) => a.d - b.d);
    const flojas = conDatos.filter(x => x.d < DOMINIO_OK).slice(0, 3);
    h += '<h3 class="pp-sub">Qué practicar en casa</h3>';
    h += flojas.length ? '<ul class="pp-lista">' + flojas.map(x => '<li><b>' + HABILIDADES[x.k].nombre + '</b> (' + Math.round(x.d * 100) + '%): ' + HABILIDADES[x.k].casa + '</li>').join('') + '</ul>' : '<p class="pp-nota">Aún no hay suficientes datos o todo va muy bien. ¡Seguid jugando!</p>';
    const errores = Object.keys(p.errores || {}).filter(k => HABILIDADES[k]).sort((a, b) => p.errores[b] - p.errores[a]).slice(0, 5);
    if (errores.length) h += '<h3 class="pp-sub">Errores más frecuentes</h3><ul class="pp-lista">' + errores.map(k => '<li>' + HABILIDADES[k].nombre + ': ' + p.errores[k] + ' retos con ayuda</li>').join('') + '</ul>';
    // Tabla de dominio por mundo
    h += '<h3 class="pp-sub">Dominio por habilidad</h3><p class="pp-nota">Dominada = 80 % de aciertos a la primera en los últimos 10 intentos.</p><table class="pp-tabla"><tr><th>Mundo</th><th>Habilidad</th><th>Dominio</th><th>Grado</th></tr>';
    MUNDOS.forEach((m, i) => {
      const c = cur(i, nivelDe(p));
      const habs = c.habs.concat(c.mision).filter((x, j, a) => a.indexOf(x) === j && HABILIDADES[x] && x !== 'repaso');
      habs.forEach((k, j) => {
        const hh = p.habs[k];
        const d = dominio(hh);
        h += '<tr><td>' + (j === 0 ? (i + 1) + '. ' + m.nombre : '') + '</td><td>' + HABILIDADES[k].nombre + '</td><td>' + (d === null ? '—' : Math.round(d * 100) + '%' + (dominada(hh) ? ' ✅' : '')) + '</td><td>' + (hh ? ['fácil', 'medio', 'difícil'][hh.dif] : '—') + '</td></tr>';
      });
    });
    h += '</table>';
    h += '<h3 class="pp-sub">Medallas</h3><div class="pp-medallas">' + LOGROS.map(l => '<span class="pp-medalla' + (p.logros.indexOf(l.id) >= 0 ? ' si' : '') + '">' + l.icono + ' ' + l.nombre + '</span>').join('') + '</div>';
    h += '<h3 class="pp-sub">Retos en casa</h3><div class="pp-casas">' + MUNDOS.map(m => {
      const hecho = p.mundos[m.id] && p.mundos[m.id].casa === 'hecho';
      return '<div class="pp-fila"><span>' + m.casa.icono + ' ' + m.nombre + ': ' + m.casa.nombre + '</span>' + (hecho ? '<b>✅ Hecho</b>' : '<button class="btn-texto-pp" data-casa="' + m.id + '" type="button">Marcar hecho</button>') + '</div>';
    }).join('') + '</div>';
    return h;
  },

  htmlPerfil(p) {
    const a = Guardado.datos.ajustes;
    let h = '<div class="pp-seccion"><div class="pp-fila"><label for="ppNombre">Nombre (lo verán los adultos; Pipo usa el apodo del animal)</label><input id="ppNombre" class="pp-input" type="text" maxlength="24" value="' + escapar(p.nombre) + '" placeholder="' + avatarDe(p).apodo + '"></div>';
    h += '<div class="pp-fila"><span>Animal</span><div class="segmentos">' + AVATARES.map(x => '<button class="seg seg-emo' + (x.id === p.avatar ? ' activo' : '') + '" data-avatar="' + x.id + '" type="button" aria-label="' + x.apodo + '">' + x.e + '</button>').join('') + '</div></div>';
    const nv = NIVEL[nivelDe(p)];
    h += '<div class="pp-fila pp-fila-nivel"><span>Nivel</span><div class="segmentos">' + NIVELES.map(n => '<button class="seg seg-nivel' + (n.id === nv.id ? ' activo' : '') + '" data-banda="' + n.id + '" type="button" style="--c:' + n.color + '">' + n.edades + ' años</button>').join('') + '</div></div>' +
      '<p class="pp-nota"><b>' + nv.nombre + ':</b> ' + nv.resumen + ' Al cambiar de nivel se conserva todo lo conseguido; si queréis empezar el viaje desde la Tierra, usad «Reiniciar el progreso».</p>';
    h += '<div class="pp-fila"><span>Voz de Pipo</span><div class="pp-voces">' + VOCES_PIPO.map(v => '<button class="tarjeta-voz' + (p.voz === v.id ? ' elegida' : '') + '" data-voz="' + v.id + '" type="button"><span class="tv-emo">' + v.icono + '</span><span class="tv-nombre">' + v.nombre + '</span><span class="tv-sistema">' + escapar(Voz.describir(v.id)) + '</span></button>').join('') + '</div></div></div>';
    h += '<div class="pp-seccion"><h3>Mundos</h3><p class="pp-nota">Mundos abiertos enteros: ' + p.libres + '. Mundo más lejano disponible: ' + p.desbloqueados + '.</p>' +
      '<div class="pp-fila"><span>Abrir hasta el mundo</span><div class="segmentos">' + MUNDOS.map((m, i) => '<button class="seg" data-abrir="' + (i + 1) + '" type="button">' + (i + 1) + '</button>').join('') + '</div></div>' +
      '<h3 class="pp-sub">Qué se aprende en cada planeta (' + nv.edades + ' años)</h3><ul class="pp-lista pp-temas">' + MUNDOS.map((m, i) => '<li><b>' + (i + 1) + '. ' + m.nombre + ':</b> ' + cur(i, nv.id).tema + '</li>').join('') + '</ul></div>';
    h += '<div class="pp-seccion"><h3>Borrar</h3><div class="pp-fila"><button class="btn-texto-pp btn-peligro" data-accion="reiniciar" type="button">Reiniciar el progreso de ' + escapar(p.nombre || avatarDe(p).apodo) + '</button>' +
      '<button class="btn-texto-pp btn-peligro" data-accion="borrar" type="button">Borrar este perfil</button></div><p class="pp-nota">Hay que pulsar dos veces para confirmar.</p></div>';
    return h;
  },

  htmlAjustes() {
    const a = Guardado.datos.ajustes;
    const interruptor = (clave, txt) => '<div class="pp-fila"><span>' + txt + '</span><button class="interruptor" role="switch" aria-checked="' + (a[clave] ? 'true' : 'false') + '" data-interruptor="' + clave + '" type="button" aria-label="' + txt + '"></button></div>';
    const deslizador = (clave, txt) => '<div class="pp-fila"><label for="pp-' + clave + '">' + txt + '</label><input id="pp-' + clave + '" type="range" min="0" max="1" step="0.05" value="' + a[clave] + '" data-rango="' + clave + '"></div>';
    let h = '<div class="pp-seccion"><h3>Sonido</h3>' + interruptor('musica', 'Música') + deslizador('volMusica', 'Volumen de la música') + deslizador('volEfectos', 'Volumen de los efectos') + deslizador('volVoz', 'Volumen de la voz') +
      '<div class="pp-fila"><span>Velocidad de la voz del dispositivo</span><div class="segmentos">' + [[0.8, 'Lenta'], [1, 'Normal'], [1.15, 'Rápida']].map(v => '<button class="seg' + (a.velocidad === v[0] ? ' activo' : '') + '" data-velocidad="' + v[0] + '" type="button">' + v[1] + '</button>').join('') + '</div></div>' +
      interruptor('subtitulos', 'Subtítulos (texto de lo que dice Pipo)') + '</div>';
    h += '<div class="pp-seccion"><h3>Juego</h3>' + interruptor('ayudas', 'Ayuda automática si se queda parado') +
      '<div class="pp-fila"><span>Tiempo de juego antes del descanso</span><div class="segmentos">' + [0, 10, 15, 20, 30, 45].map(v => '<button class="seg' + (a.descansoMin === v ? ' activo' : '') + '" data-descanso="' + v + '" type="button">' + (v ? v + ' min' : 'Sin límite') + '</button>').join('') + '</div></div>' +
      interruptor('descansoEstricto', 'Descanso obligatorio (hace falta un adulto para seguir)') +
      interruptor('lectura', 'Palabras del explorador (lectura, desde el mundo 4)') +
      '<div class="pp-fila"><span>Letras para leer</span><div class="segmentos"><button class="seg' + (a.mayusculas ? ' activo' : '') + '" data-mayus="1" type="button">MAYÚSCULAS</button><button class="seg' + (!a.mayusculas ? ' activo' : '') + '" data-mayus="0" type="button">minúsculas</button></div></div></div>';
    return h;
  },

  htmlAyuda() {
    return '<div class="pp-seccion"><h3>Cómo funciona</h3><ul class="pp-lista">' +
      '<li>Tres niveles por edad: de 5 a 6, de 6 a 7 y de 7 a 8 años. Se elige al crear el explorador y se puede cambiar en «Perfil». Los planetas, la ciencia y los premios son los mismos; cambian las matemáticas.</li>' +
      '<li>10 mundos en el orden del viaje: Tierra, Luna, Marte, Venus, Mercurio, Júpiter, Saturno, Urano, Neptuno y el Sol. Cada uno tiene 6 niveles (Aprende, Practica, Misión, Descubre, Reto y Gran misión) y un reto para hacer en casa.</li>' +
      '<li>El botón grande de jugar del mapa lleva directamente al siguiente nivel pendiente.</li>' +
      '<li>La dificultad se adapta sola: sube tras 3 aciertos seguidos a la primera y baja tras un error.</li>' +
      '<li>Ayudas escalonadas: Pipo repite más despacio, luego da una pista visual y, si hace falta, lo resuelve paso a paso y propone una pregunta parecida.</li>' +
      '<li>El progreso se guarda en este navegador y en este dispositivo. Si borráis los datos del navegador, se pierde.</li>' +
      '<li>Sin anuncios, sin compras, sin enlaces externos y sin enviar datos a ningún sitio.</li>' +
      '<li>Las voces Lola, Bruno y Cosmo están grabadas dentro del archivo (Kokoro TTS, licencia Apache 2.0). «Tablet» usa la voz del dispositivo.</li></ul>' +
      '<p class="pp-nota">Versión ' + VERSION + ' · Pruebas automáticas: añadir ?test=1 a la dirección.</p></div>';
  },

  enlazar() {
    const c = $('#padresContenido');
    const a = Guardado.datos.ajustes;
    const p = Guardado.p;
    $$('[data-sec]', c).forEach(b => b.addEventListener('click', () => { this.seccion = b.dataset.sec; this.pintar(); }));
    $$('[data-perfil]', c).forEach(b => b.addEventListener('click', () => { Guardado.elegirPerfil(b.dataset.perfil); Mascota.actualizarTodas(); Misiones.preparar(); this.pintar(); }));
    $$('[data-accion="nuevo"]', c).forEach(b => b.addEventListener('click', () => { this.abierto = false; $('#c-padres').hidden = true; Nuevo.abrir(); }));
    $$('[data-casa]', c).forEach(b => b.addEventListener('click', () => {
      const i = IDX_MUNDO[b.dataset.casa];
      Casa.mundo = i;
      Casa.confirmar();
      this.pintar();
    }));
    const nombre = $('#ppNombre', c);
    if (nombre) nombre.addEventListener('input', () => { p.nombre = nombre.value.slice(0, 24); Guardado.guardarLuego(); });
    $$('[data-avatar]', c).forEach(b => b.addEventListener('click', () => { p.avatar = b.dataset.avatar; Guardado.guardar(); this.pintar(); }));
    $$('[data-banda]', c).forEach(b => b.addEventListener('click', () => { Guardado.cambiarNivel(p, b.dataset.banda); UI.aviso('🎓', NIVEL[p.banda].nombre); this.pintar(); }));
    $$('[data-voz]', c).forEach(b => b.addEventListener('click', () => { p.voz = b.dataset.voz; Guardado.guardar(); Voz.avisar(); Voz.probar(p.voz); this.pintar(); }));
    $$('[data-abrir]', c).forEach(b => b.addEventListener('click', () => { Guardado.abrirHasta(p, Number(b.dataset.abrir) - 1); UI.aviso('🔓', 'Abierto hasta el mundo ' + b.dataset.abrir); this.pintar(); }));
    $$('[data-accion="reiniciar"], [data-accion="borrar"]', c).forEach(b => b.addEventListener('click', () => {
      if (!b.classList.contains('confirmar')) { b.classList.add('confirmar'); b.textContent = '¿Seguro? Pulsa otra vez'; return; }
      if (b.dataset.accion === 'reiniciar') Guardado.reiniciarPerfil(p);
      else Guardado.borrarPerfil(p.id);
      Mascota.actualizarTodas();
      if (!Guardado.datos.perfiles.length) { this.abierto = false; $('#c-padres').hidden = true; Inicio.abrir(); return; }
      this.pintar();
    }));
    $$('[data-interruptor]', c).forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.interruptor;
      a[k] = !a[k];
      b.setAttribute('aria-checked', a[k] ? 'true' : 'false');
      if (k === 'musica') Sonido.actualizarMusica();
      Guardado.guardar();
    }));
    $$('[data-rango]', c).forEach(inp => inp.addEventListener('input', () => { a[inp.dataset.rango] = Number(inp.value); Sonido.aplicarVolumen(); Guardado.guardarLuego(); }));
    $$('[data-velocidad]', c).forEach(b => b.addEventListener('click', () => { a.velocidad = Number(b.dataset.velocidad); Guardado.guardar(); this.pintar(); }));
    $$('[data-descanso]', c).forEach(b => b.addEventListener('click', () => { a.descansoMin = Number(b.dataset.descanso); Guardado.guardar(); this.pintar(); }));
    $$('[data-mayus]', c).forEach(b => b.addEventListener('click', () => { a.mayusculas = b.dataset.mayus === '1'; Guardado.guardar(); this.pintar(); }));
  }
};
