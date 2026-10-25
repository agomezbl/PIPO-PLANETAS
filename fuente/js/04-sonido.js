/* =========================================================
   4. SONIDO: música de fondo y efectos generados con Web Audio
   El audio SOLO se crea dentro del primer toque del usuario
   (botón "¡Jugar!"), como exigen Safari y Chrome.
   ========================================================= */
const PASOS_MUSICA = 64;        // 8 compases de 8 corcheas
const DO5 = 523.25;
const frec = semitonos => DO5 * Math.pow(2, semitonos / 12);

/* Melodía (semitonos desde Do5, duración en corcheas). Progresión Do - Lam - Fa - Sol */
const MELODIA = [
  [[4, 2], [7, 2], [12, 3], [11, 1]], [[9, 2], [7, 2], [4, 4]], [[5, 2], [9, 2], [12, 2], [9, 2]], [[7, 2], [4, 2], [2, 4]],
  [[4, 2], [7, 2], [12, 2], [14, 2]], [[12, 2], [9, 2], [7, 4]], [[5, 2], [4, 2], [2, 2], [5, 2]], [[4, 2], [2, 2], [0, 4]]
];
const ACORDES = [[-12, -8, -5], [-15, -12, -8], [-19, -15, -12], [-17, -13, -10]];   // Do, Lam, Fa, Sol
const BAJOS = [-24, -27, -31, -29];

/* Escalas (semitonos) y progresiones de acordes (grados de la escala) de cada mundo */
const ESCALAS = {
  mayor: { notas: [0, 2, 4, 5, 7, 9, 11], prog: [0, 5, 3, 4] },
  pentatonica: { notas: [0, 2, 4, 7, 9], prog: [0, 5, 3, 4], base: [0, 2, 4, 5, 7, 9, 11] },
  lidia: { notas: [0, 2, 4, 6, 7, 9, 11], prog: [0, 1, 0, 4] },
  mixolidia: { notas: [0, 2, 4, 5, 7, 9, 10], prog: [0, 6, 3, 0] },
  dorica: { notas: [0, 2, 3, 5, 7, 9, 10], prog: [0, 3, 0, 6] }
};
const RITMOS = [[2, 2, 2, 2], [2, 1, 1, 2, 2], [3, 1, 2, 2], [2, 2, 4], [1, 1, 2, 1, 1, 2], [4, 2, 2]];

/* Compone 8 compases (64 corcheas) de música tranquila: melodía, acordes y bajo.
   Usa su propio generador con semilla: cada mundo suena siempre igual. */
function componerMusica(escalaId, semilla) {
  const esc = ESCALAS[escalaId] || ESCALAS.mayor;
  const acordesDe = esc.base || esc.notas;
  let s = (semilla || 1) >>> 0;
  const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const nota = (grado, lista) => {
    const n = lista.length;
    const o = Math.floor(grado / n);
    return lista[((grado % n) + n) % n] + 12 * o;
  };
  const eventos = [];
  for (let p = 0; p < PASOS_MUSICA; p++) eventos.push([]);
  // La melodía se mueve por los grados de la escala (alrededor de Do5)
  const n = esc.notas.length;
  let grado = n; // una octava por encima de la tónica grave = Do5
  for (let c = 0; c < 8; c++) {
    const gAcorde = esc.prog[c % 4];
    const raiz = nota(gAcorde, acordesDe);
    const triada = [nota(gAcorde, acordesDe), nota(gAcorde + 2, acordesDe), nota(gAcorde + 4, acordesDe)];
    eventos[c * 8].push({ tipo: 'acorde', notas: triada.map(x => x - 12) });
    eventos[c * 8].push({ tipo: 'bajo', s: raiz - 24 });
    eventos[c * 8 + 4].push({ tipo: 'bajo', s: raiz - 24 + 7 });
    const ritmo = c === 7 ? [2, 2, 4] : RITMOS[Math.floor(r() * RITMOS.length)];
    let paso = c * 8;
    ritmo.forEach((d, k) => {
      if (c === 7 && k === ritmo.length - 1) {
        grado = n;   // acaba en la tónica
      } else if (k === 0) {
        // En el tiempo fuerte: una nota del acorde cercana
        const opciones = triada.map(t => t + 12);
        const actual = nota(grado, esc.notas);
        let mejor = opciones[0];
        opciones.forEach(o => { if (Math.abs(o - actual) < Math.abs(mejor - actual)) mejor = o; });
        let gBusca = grado;
        for (let t = -3; t <= 3; t++) { if (nota(grado + t, esc.notas) === mejor) { gBusca = grado + t; break; } }
        grado = gBusca;
      } else {
        grado += Math.floor(r() * 5) - 2;
      }
      grado = limitar(grado, n - 2, n * 2 + 1);
      if (r() > 0.1 || k === 0) eventos[paso].push({ tipo: 'mel', s: nota(grado, esc.notas), d: d });
      paso += d;
    });
  }
  return eventos;
}

const Sonido = {
  ctx: null,
  temaActual: null,
  maestro: null,
  gMusica: null,
  gEfectos: null,
  gVoz: null,
  busMusica: null,
  ruido: null,
  agachado: false,
  sonandoMusica: false,
  reloj: null,
  paso: 0,
  proxima: 0,
  eventos: null,
  octavo: 60 / 92 / 2,  // duración de una corchea (cambia con el tempo de cada mundo)
  transporte: 0,        // semitonos: cada mundo suena en otro tono
  ecoNodo: null,

  /* Crea el contexto de audio. Debe llamarse dentro de un gesto del usuario */
  iniciar() {
    this.desbloquearIOS();
    if (this.ctx) { this.reanudar(); return; }
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (!Contexto) return;
    try {
      // iOS 17+: que el sonido funcione aunque el interruptor de silencio esté puesto
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
    } catch (e) { /* no disponible */ }
    try {
      this.ctx = new Contexto();
    } catch (e) {
      this.ctx = null;
      return;
    }
    const ctx = this.ctx;
    const compresor = ctx.createDynamicsCompressor();
    compresor.threshold.value = -14;
    compresor.ratio.value = 4;
    compresor.connect(ctx.destination);
    this.maestro = ctx.createGain();
    this.maestro.gain.value = 1;
    this.maestro.connect(compresor);

    // Música: bus -> filtro suave -> volumen de música -> maestro (con un eco espacial)
    this.gMusica = ctx.createGain();
    this.gMusica.gain.value = 0;
    this.gMusica.connect(this.maestro);
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 2600;
    filtro.connect(this.gMusica);
    this.busMusica = ctx.createGain();
    this.busMusica.connect(filtro);
    const eco = ctx.createDelay(1.5);
    eco.delayTime.value = this.octavo * 3;
    this.ecoNodo = eco;
    const retro = ctx.createGain();
    retro.gain.value = 0.28;
    const mezclaEco = ctx.createGain();
    mezclaEco.gain.value = 0.35;
    this.busMusica.connect(eco);
    eco.connect(retro);
    retro.connect(eco);
    eco.connect(mezclaEco);
    mezclaEco.connect(filtro);

    this.gEfectos = ctx.createGain();
    this.gEfectos.connect(this.maestro);

    // Voz de Pipo: va directa, sin filtro ni eco
    this.gVoz = ctx.createGain();
    this.gVoz.connect(this.maestro);

    // Ruido blanco para soplidos y cohetes
    const largo = Math.floor(ctx.sampleRate * 0.8);
    this.ruido = ctx.createBuffer(1, largo, ctx.sampleRate);
    const canal = this.ruido.getChannelData(0);
    for (let i = 0; i < largo; i++) canal[i] = Math.random() * 2 - 1;

    // Desbloqueo de audio en iOS: un sonido vacío dentro del gesto
    const vacio = ctx.createBuffer(1, 1, 22050);
    const fuente = ctx.createBufferSource();
    fuente.buffer = vacio;
    fuente.connect(ctx.destination);
    fuente.start(0);

    this.prepararMusica();
    this.aplicarVolumen();
    this.reanudar();
  },

  /* En iPad/iPhone con iOS antiguo, sonar un <audio> silencioso dentro del toque hace que
     el sonido funcione aunque el interruptor de silencio esté puesto */
  desbloquearIOS() {
    if (this.iosHecho || typeof SILENCIO_MP3 === 'undefined') return;
    this.iosHecho = true;
    try {
      const a = new window.Audio('data:audio/mpeg;base64,' + SILENCIO_MP3);
      a.setAttribute('playsinline', '');
      a.volume = 0.01;
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* sin elemento de audio */ }
  },

  reanudar() {
    if (this.ctx && this.ctx.state !== 'running' && this.ctx.state !== 'closed') {
      const p = this.ctx.resume();
      if (p && p.catch) p.catch(() => {});
    }
  },
  suspender() {
    if (this.ctx && this.ctx.state === 'running') {
      const p = this.ctx.suspend();
      if (p && p.catch) p.catch(() => {});
    }
  },

  aplicarVolumen() {
    if (!this.ctx) return;
    const a = Guardado.datos.ajustes;
    const t = this.ctx.currentTime;
    // Mientras habla Pipo la música baja mucho: la voz debe oírse limpia (pauta de logopedia)
    const musica = a.musica ? a.volMusica * 0.32 * (this.agachado ? 0.18 : 1) : 0;
    this.gMusica.gain.setTargetAtTime(musica, t, 0.12);
    this.gEfectos.gain.setTargetAtTime(a.volEfectos * 0.75, t, 0.03);
    this.gVoz.gain.setTargetAtTime(limitar(a.volVoz, 0, 1) * 1.1, t, 0.03);
  },

  /* Baja la música mientras habla Pipo, para que se le entienda bien */
  agachar(si) {
    if (this.agachado === si) return;
    this.agachado = si;
    this.aplicarVolumen();
  },

  /* Una nota con envolvente suave */
  nota(f, inicio, dur, op) {
    op = op || {};
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = op.tipo || 'sine';
    o.frequency.setValueAtTime(f, inicio);
    if (op.hasta) o.frequency.exponentialRampToValueAtTime(op.hasta, inicio + dur);
    const vol = op.vol || 0.2;
    const ataque = op.ataque || 0.01;
    g.gain.setValueAtTime(0.0001, inicio);
    g.gain.exponentialRampToValueAtTime(vol, inicio + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, inicio + dur);
    o.connect(g);
    g.connect(op.destino || this.gEfectos);
    o.start(inicio);
    o.stop(inicio + dur + 0.05);
  },

  /* Ruido filtrado (soplido de cohete, apertura de regalo) */
  soplido(inicio, dur, desde, hasta, vol) {
    const ctx = this.ctx;
    const s = ctx.createBufferSource();
    s.buffer = this.ruido;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(desde, inicio);
    f.frequency.exponentialRampToValueAtTime(hasta, inicio + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, inicio);
    g.gain.exponentialRampToValueAtTime(vol, inicio + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, inicio + dur);
    s.connect(f); f.connect(g); g.connect(this.gEfectos);
    s.start(inicio);
    s.stop(inicio + dur + 0.05);
  },

  /* Efectos de sonido diferenciados */
  efecto(nombre, arg) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + 0.01;
    switch (nombre) {
      case 'toque':
        this.nota(620, t, 0.09, { vol: 0.18, hasta: 860 });
        break;
      case 'contar': {
        // Cada número suena un poco más agudo (escala mayor desde Sol4)
        const escala = [0, 2, 4, 5, 7, 9, 11];
        const i = Math.max(0, (arg || 1) - 1);
        const semis = escala[i % 7] + 12 * Math.floor(i / 7) - 5;
        this.nota(frec(semis), t, 0.35, { vol: 0.22, tipo: 'triangle' });
        this.nota(frec(semis + 24), t, 0.12, { vol: 0.05 });
        break;
      }
      case 'acierto':
        [0, 4, 7, 12].forEach((s, k) => this.nota(frec(s), t + k * 0.075, 0.3, { vol: 0.17, tipo: 'triangle' }));
        this.nota(frec(24), t + 0.3, 0.4, { vol: 0.05 });
        break;
      case 'estrella':
        for (let k = 0; k < 5; k++) this.nota(frec(elegir([19, 21, 24, 26, 28, 31])), t + k * 0.045, 0.18, { vol: 0.06 });
        break;
      case 'moneda':
        this.nota(987.77, t, 0.08, { vol: 0.14, tipo: 'triangle' });
        this.nota(1318.5, t + 0.08, 0.3, { vol: 0.14, tipo: 'triangle' });
        break;
      case 'suave':
        // "Hmm" amable: dos notas graves, muy flojitas, nada agresivo
        this.nota(392, t, 0.22, { vol: 0.09, ataque: 0.04 });
        this.nota(349.23, t + 0.17, 0.32, { vol: 0.07, ataque: 0.04 });
        break;
      case 'nivel':
        [0, 4, 7, 12, 16].forEach((s, k) => this.nota(frec(s), t + k * 0.11, 0.35, { vol: 0.15, tipo: 'triangle' }));
        [0, 4, 7].forEach(s => this.nota(frec(s), t + 0.6, 1.2, { vol: 0.07, tipo: 'triangle', ataque: 0.05 }));
        this.nota(frec(24), t + 0.6, 1, { vol: 0.04 });
        break;
      case 'cohete':
        this.soplido(t, 0.75, 300, 2400, 0.22);
        this.nota(220, t, 0.7, { vol: 0.05, hasta: 660, tipo: 'triangle' });
        break;
      case 'regalo':
        this.soplido(t, 0.3, 1800, 500, 0.18);
        [12, 16, 19, 24].forEach((s, k) => this.nota(frec(s), t + 0.12 + k * 0.06, 0.3, { vol: 0.1, tipo: 'triangle' }));
        break;
      case 'desbloquear':
        this.nota(400, t, 0.5, { vol: 0.12, hasta: 1200 });
        for (let k = 0; k < 4; k++) this.nota(frec(24 + k * 3), t + 0.35 + k * 0.05, 0.2, { vol: 0.05 });
        break;
      case 'comprar':
        this.efecto('moneda');
        for (let k = 0; k < 6; k++) this.nota(frec(elegir([24, 26, 28, 31])), t + 0.2 + k * 0.05, 0.18, { vol: 0.05 });
        break;
      case 'no':
        this.nota(523.25, t, 0.16, { vol: 0.07, ataque: 0.03 });
        this.nota(466.16, t + 0.13, 0.24, { vol: 0.06, ataque: 0.03 });
        break;
      case 'pagina':
        this.nota(520, t, 0.1, { vol: 0.1, hasta: 760 });
        break;
      case 'pop':
        this.soplido(t, 0.12, 2500, 900, 0.3);
        this.nota(880, t, 0.12, { vol: 0.12, hasta: 220 });
        break;
      case 'coger':
        this.nota(500, t, 0.08, { vol: 0.12, hasta: 700 });
        break;
      case 'soltar':
        this.nota(700, t, 0.12, { vol: 0.14, hasta: 420, tipo: 'triangle' });
        break;
      case 'nam':
        for (let k = 0; k < 3; k++) this.soplido(t + k * 0.13, 0.08, 1200, 600, 0.16);
        break;
      case 'despegue':
        this.soplido(t, 2.2, 150, 1800, 0.3);
        this.nota(90, t, 2.2, { vol: 0.12, hasta: 400, tipo: 'triangle' });
        break;
      case 'tapar':
        this.soplido(t, 0.35, 600, 300, 0.12);
        break;
      case 'robot':
        this.nota(330, t, 0.09, { vol: 0.1, tipo: 'square', hasta: 300 });
        this.nota(440, t + 0.1, 0.09, { vol: 0.08, tipo: 'square' });
        break;
      case 'tic':
        this.nota(1500, t, 0.03, { vol: 0.08, tipo: 'square' });
        break;
      case 'moneda2':
        this.nota(1318.5, t, 0.06, { vol: 0.12, tipo: 'triangle' });
        this.nota(1760, t + 0.05, 0.2, { vol: 0.1, tipo: 'triangle' });
        break;
      case 'carta':
        this.soplido(t, 0.25, 900, 2600, 0.12);
        [12, 19, 24].forEach((s, k) => this.nota(frec(s), t + 0.1 + k * 0.07, 0.35, { vol: 0.08, tipo: 'triangle' }));
        break;
      case 'rango':
        [0, 4, 7, 12, 16, 19, 24].forEach((s, k) => this.nota(frec(s), t + k * 0.09, 0.45, { vol: 0.12, tipo: 'triangle' }));
        break;
      case 'estrellaGrande':
        this.nota(frec(12), t, 0.5, { vol: 0.16, tipo: 'triangle' });
        this.nota(frec(19), t + 0.06, 0.5, { vol: 0.1, tipo: 'triangle' });
        for (let k = 0; k < 6; k++) this.nota(frec(elegir([24, 28, 31, 36])), t + 0.1 + k * 0.04, 0.2, { vol: 0.05 });
        break;
      default:
        break;
    }
  },

  /* ----- Música de fondo en bucle (programador con anticipación) ----- */
  prepararMusica() {
    // Convierte la partitura en una lista de eventos por paso (0..63)
    this.eventos = [];
    for (let p = 0; p < PASOS_MUSICA; p++) this.eventos.push([]);
    MELODIA.forEach((compas, c) => {
      let paso = c * 8;
      compas.forEach(nota => {
        if (nota[0] !== null) this.eventos[paso].push({ tipo: 'mel', s: nota[0], d: nota[1] });
        paso += nota[1];
      });
      const ac = c % 4;
      this.eventos[c * 8].push({ tipo: 'acorde', notas: ACORDES[ac] });
      this.eventos[c * 8].push({ tipo: 'bajo', s: BAJOS[ac] });
      this.eventos[c * 8 + 4].push({ tipo: 'bajo', s: BAJOS[ac] + 7 });
    });
  },

  /* Cada mundo tiene su propia canción: escala, tempo y melodía distintos (compuesta con una semilla fija) */
  tema(musica) {
    const m = musica || null;
    const clave = m ? (m.escala + m.semilla + m.tono + m.tempo) : 'base';
    if (clave === this.temaActual) return;
    this.temaActual = clave;
    this.transporte = m ? (m.tono || 0) : 0;
    this.octavo = 60 / ((m && m.tempo) || 92) / 2;
    if (m) this.eventos = componerMusica(m.escala, m.semilla);
    else this.prepararMusica();
    if (this.ecoNodo && this.ctx) this.ecoNodo.delayTime.setTargetAtTime(this.octavo * 3, this.ctx.currentTime, 0.2);
  },

  iniciarMusica() {
    if (!this.ctx || this.sonandoMusica) return;
    this.sonandoMusica = true;
    this.paso = 0;
    this.proxima = this.ctx.currentTime + 0.15;
    this.reloj = setInterval(() => this.programar(), 90);
  },

  pararMusica() {
    this.sonandoMusica = false;
    clearInterval(this.reloj);
    this.reloj = null;
  },

  programar() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const ahora = this.ctx.currentTime;
    if (this.proxima < ahora) this.proxima = ahora + 0.05;   // tras una pausa del navegador
    while (this.proxima < ahora + 0.35) {
      this.tocarPaso(this.paso, this.proxima);
      this.paso = (this.paso + 1) % PASOS_MUSICA;
      this.proxima += this.octavo;
    }
  },

  tocarPaso(paso, t) {
    const destino = this.busMusica;
    const tr = this.transporte, o = this.octavo;
    this.eventos[paso].forEach(ev => {
      if (ev.tipo === 'mel') {
        this.nota(frec(ev.s + tr), t, ev.d * o * 0.95, { vol: 0.16, tipo: 'triangle', ataque: 0.03, destino: destino });
      } else if (ev.tipo === 'acorde') {
        ev.notas.forEach(s => this.nota(frec(s + tr), t, o * 8, { vol: 0.05, ataque: 0.35, destino: destino }));
      } else if (ev.tipo === 'bajo') {
        this.nota(frec(ev.s + tr), t, o * 3, { vol: 0.13, tipo: 'triangle', ataque: 0.02, destino: destino });
      }
    });
    // Destellos espaciales al azar, muy suaves
    if (paso % 2 === 1 && Math.random() < 0.12) {
      this.nota(frec(elegir([24, 28, 31, 36]) + tr), t, 0.5, { vol: 0.025, destino: destino });
    }
  },

  /* Activa o desactiva la música según los ajustes */
  actualizarMusica() {
    if (!this.ctx) return;
    if (Guardado.datos.ajustes.musica) this.iniciarMusica(); else this.pararMusica();
    this.aplicarVolumen();
  }
};

