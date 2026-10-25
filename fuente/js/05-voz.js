/* =========================================================
   5. VOZ DE PIPO
   - Por defecto: frases grabadas con voz natural (dentro del archivo),
     reproducidas con Web Audio. Suenan igual en cualquier tablet y sin conexión.
   - Frases cortas (máx. 6 palabras) y una consigna cada vez.
   - Reserva: voz del dispositivo (speechSynthesis), eligiendo primero las
     voces "naturales/neuronales" y sin forzar el tono (eso sonaba robótico).
   ========================================================= */
const Voz = {
  token: 0,                 // cambia al callar: lo pendiente se descarta
  cadena: Promise.resolve(),
  fuentes: [],              // clips sonando ahora mismo
  buffers: {},              // clips ya decodificados (voz:id -> AudioBuffer)
  paquetes: {},             // clips en base64 de cada voz (se leen la primera vez que hacen falta)
  pendientes: {},           // decodificaciones en curso
  instruccion: null,        // lo que repite el botón de repetir
  ultima: null,
  finActual: null,
  relojFin: null,
  // Voz del dispositivo
  soportada: !!(window.speechSynthesis && typeof window.speechSynthesis.speak === 'function' && window.SpeechSynthesisUtterance),
  vozSistema: null,
  vocesEs: [],
  revisada: false,
  utterance: null,

  /* ----- Arranque: busca las voces del dispositivo (solo para el modo "Tablet") ----- */
  iniciar() {
    if (!this.soportada) { this.revisada = true; return; }
    const cargar = () => this.cargarVoces();
    try {
      if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', cargar);
      else window.speechSynthesis.onvoiceschanged = cargar;
    } catch (e) { /* sin evento */ }
    this.cargarVoces();
    let intentos = 0;
    const sondeo = setInterval(() => {
      intentos++;
      this.cargarVoces();
      if (this.vocesEs.length || intentos >= 16) { clearInterval(sondeo); this.revisada = true; this.avisar(); }
    }, 250);
  },

  cargarVoces() {
    let lista = [];
    try { lista = window.speechSynthesis.getVoices() || []; } catch (e) { lista = []; }
    const puntuar = v => {
      let p = 0;
      // Las voces neuronales ("Natural", "Online", "Google", "Mejorada"...) suenan humanas
      if (/(natural|neural|online|google|premium|enhanced|mejorad|siri)/i.test(v.name)) p += 6;
      if (/^es[-_]ES/i.test(v.lang)) p += 2;
      else if (/^es[-_](MX|US|419)/i.test(v.lang)) p += 1;
      if (v.localService) p += 1;
      if (/(eloquence|compact|grandma|grandpa|rocko|shelley|sandy|reed|eddy|flo\b)/i.test(v.name)) p -= 4;
      return p;
    };
    this.vocesEs = lista.filter(v => /^es([-_]|$)/i.test(v.lang || '')).sort((a, b) => puntuar(b) - puntuar(a));
    this.vozSistema = this.vocesEs[0] || null;
    if (this.vocesEs.length) { this.revisada = true; this.avisar(); }
  },

  /* Clips grabados de una voz: están en un bloque <script type="application/json" id="voz-..."> */
  clips(modo) {
    if (modo in this.paquetes) return this.paquetes[modo];
    let datos = null;
    const el = document.getElementById('voz-' + modo);
    try {
      if (el && el.textContent.length > 2) datos = JSON.parse(el.textContent);
    } catch (e) { datos = null; }
    // Mientras la página aún se está cargando, no se da por perdida la voz
    if (datos || document.readyState !== 'loading') this.paquetes[modo] = datos;
    return datos;
  },

  /* ¿Hay clips grabados para el modo elegido? */
  hayClips(modo) {
    return modo !== 'sistema' && !!this.clips(modo) && !!(Sonido.ctx);
  },

  /* Voz elegida por el niño que juega ahora */
  elegida() {
    if (this.forzada) return this.forzada;
    const p = Guardado.p;
    return (p && p.voz) || 'lola';
  },

  /* Prueba una voz (selector de voces): dice "¡Hola! Así hablo yo." con esa voz */
  probar(id) {
    this.callar();
    this.forzada = id;
    const fin = () => { if (this.forzada === id) this.forzada = null; };
    return this.decir(['prueba_voz']).then(fin, fin);
  },

  modo() {
    const m = this.elegida();
    if (m !== 'sistema' && this.hayClips(m)) return m;
    // Si la voz elegida no está, se usa otra voz grabada antes que la del dispositivo
    const otra = ['lola', 'bruno', 'cosmo'].find(v => this.hayClips(v));
    return otra || 'sistema';
  },

  /* Texto de unas partes (para subtítulos y para la voz del dispositivo) */
  texto(partes) {
    const ids = partes.filter(id => typeof FRASES !== 'undefined' && FRASES[id]);
    const textos = ids.map(id => FRASES[id]);
    return textos.map((t, i) => {
      const sig = textos[i + 1];
      if (sig && /^[a-záéíóúñü]/.test(sig) && /\.$/.test(t)) t = t.slice(0, -1);
      if (i > 0 && /^(n\d+|o_)/.test(ids[i])) t = t.charAt(0).toLowerCase() + t.slice(1);
      return t;
    }).join(' ');
  },

  necesitaSubtitulos() {
    if (Guardado.datos.ajustes.subtitulos) return true;
    if (this.modo() !== 'sistema') return false;
    return !this.soportada || (this.revisada && this.vocesEs.length === 0);
  },

  /* Aviso en el botón de repetir cuando no hay ninguna voz posible */
  avisar() {
    const aviso = $('#avisoVoz');
    if (!aviso) return;
    const sinVoz = this.modo() === 'sistema' && (!this.soportada || (this.revisada && this.vocesEs.length === 0));
    aviso.hidden = !sinVoz;
  },

  /* Dice una o varias frases (ids). op.cola = true: espera a lo anterior en vez de cortarlo.
     op.instruccion = true: es lo que repetirá el botón 🔊. Devuelve una promesa. */
  decir(partes, op) {
    op = op || {};
    if (!partes) return Promise.resolve();
    if (!Array.isArray(partes)) partes = [partes];
    partes = partes.filter(Boolean);
    if (MODO_PRUEBA) Pruebas.revisarFrases(partes);
    if (!partes.length) return Promise.resolve();
    if (op.instruccion) this.instruccion = partes;
    if (!op.cola) this.callar();
    const tk = this.token;
    this.cadena = this.cadena.then(() => this.reproducir(partes, tk, op));
    return this.cadena;
  },

  repetir(op) {
    const p = this.instruccion || this.ultima;
    if (p) return this.decir(p, op);
    return Promise.resolve();
  },

  /* Corta lo que esté sonando y descarta lo pendiente */
  callar() {
    this.token++;
    this.fuentes.forEach(f => { try { f.stop(); } catch (e) { /* ya parada */ } });
    this.fuentes = [];
    clearTimeout(this.relojFin);
    if (this.finActual) { const f = this.finActual; this.finActual = null; f(); }
    if (this.soportada) { try { window.speechSynthesis.cancel(); } catch (e) { /* nada */ } }
    this.cadena = Promise.resolve();
    Mascota.hablar(false);
    Sonido.agachar(false);
  },

  /* Decodifica (una vez) un clip grabado */
  buffer(modo, id) {
    const clave = modo + ':' + id;
    if (this.buffers[clave]) return Promise.resolve(this.buffers[clave]);
    if (this.pendientes[clave]) return this.pendientes[clave];
    const paquete = this.clips(modo);
    const b64 = paquete && paquete[id];
    if (!b64 || !Sonido.ctx) return Promise.resolve(null);
    const p = new Promise(resolver => {
      let hecho = false;
      const fin = buf => {
        if (hecho) return;
        hecho = true;
        delete this.pendientes[clave];
        if (buf) {
          // Memoria limitada en tablets antiguas: si hay muchos clips decodificados, se empieza de nuevo
          if (Object.keys(this.buffers).length > 260) this.buffers = {};
          this.buffers[clave] = buf;
        }
        resolver(buf || null);
      };
      try {
        // Forma con callbacks: funciona también en Safari antiguos
        const r = Sonido.ctx.decodeAudioData(base64ABuffer(b64), buf => fin(buf), () => fin(null));
        if (r && r.then) r.then(fin, () => fin(null));
      } catch (e) { fin(null); }
      setTimeout(() => fin(null), 4000);
    });
    this.pendientes[clave] = p;
    return p;
  },

  /* Prepara por adelantado los clips que se van a usar enseguida */
  precargar(partes) {
    const modo = this.modo();
    if (modo === 'sistema') return;
    (partes || []).forEach(id => { if (id) this.buffer(modo, id); });
  },

  async reproducir(partes, tk, op) {
    op = op || {};
    const tasa = op.lento ? 0.9 : 1;
    const hueco = op.lento ? 0.32 : 0.14;
    if (tk !== this.token) return;
    if (MODO_PRUEBA && Pruebas.vozMuda) { this.ultima = partes; return; }
    this.ultima = partes;
    if (this.necesitaSubtitulos()) UI.subtitulo(this.texto(partes));
    const modo = this.modo();
    if (modo === 'sistema') return this.hablarSistema(this.texto(partes), tk, tasa);

    const bufs = [];
    for (let i = 0; i < partes.length; i++) bufs.push(await this.buffer(modo, partes[i]));
    if (tk !== this.token) return;
    if (bufs.some(b => !b)) return this.hablarSistema(this.texto(partes), tk, tasa);   // falta algún clip

    const ctx = Sonido.ctx;
    Sonido.reanudar();
    let t = ctx.currentTime + 0.04;
    const inicio = t;
    bufs.forEach((b, i) => {
      const f = ctx.createBufferSource();
      f.buffer = b;
      if (tasa !== 1) f.playbackRate.value = tasa;
      f.connect(Sonido.gVoz);
      f.start(t);
      this.fuentes.push(f);
      t += b.duration / tasa + (i < bufs.length - 1 ? hueco : 0);
    });
    Mascota.hablar(true);
    Sonido.agachar(true);
    await new Promise(resolver => {
      this.finActual = resolver;
      this.relojFin = setTimeout(resolver, (t - inicio) * 1000 + 60);
    });
    this.finActual = null;
    if (tk === this.token) {
      this.fuentes = [];
      Mascota.hablar(false);
      Sonido.agachar(false);
    }
  },

  /* Voz del dispositivo: tono natural, ritmo tranquilo */
  hablarSistema(texto, tk, tasa) {
    const a = Guardado.datos.ajustes;
    if (!texto) return Promise.resolve();
    if (!this.soportada || (this.revisada && this.vocesEs.length === 0)) {
      UI.subtitulo(texto);
      Mascota.hablar(true);
      return esperar(limitar(600 + texto.length * 55, 1000, 5000)).then(() => { if (tk === this.token) Mascota.hablar(false); });
    }
    return new Promise(resolver => {
      let terminado = false;
      const fin = () => {
        if (terminado) return;
        terminado = true;
        clearTimeout(guardia);
        if (tk === this.token) { Mascota.hablar(false); Sonido.agachar(false); }
        resolver();
      };
      let u;
      try { u = new window.SpeechSynthesisUtterance(texto); } catch (e) { UI.subtitulo(texto); resolver(); return; }
      if (this.vozSistema) { u.voice = this.vozSistema; u.lang = this.vozSistema.lang; } else { u.lang = 'es-ES'; }
      u.pitch = 1;
      u.rate = limitar(0.92 * a.velocidad * (tasa || 1), 0.6, 1.3);
      u.volume = limitar(a.volVoz, 0, 1);
      u.onstart = () => { if (tk === this.token) { Mascota.hablar(true); Sonido.agachar(true); } };
      u.onend = fin;
      u.onerror = ev => { if (ev && ev.error !== 'interrupted' && ev.error !== 'canceled') UI.subtitulo(texto); fin(); };
      this.utterance = u;   // evita que el navegador la descarte antes de tiempo
      const guardia = setTimeout(fin, 2500 + texto.length * 90);
      Mascota.hablar(true);
      try {
        window.speechSynthesis.speak(u);
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      } catch (e) { UI.subtitulo(texto); fin(); }
    });
  },

  /* Descripción para la zona de padres */
  describir(id) {
    if (id !== 'sistema') return this.clips(id) ? 'Voz natural grabada' : 'No disponible en este archivo';
    if (!this.soportada) return 'Este navegador no puede hablar';
    return this.vozSistema ? this.vozSistema.name : 'Sin voces en español';
  }
};

