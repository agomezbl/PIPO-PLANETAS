/* =========================================================
   3. GUARDADO (localStorage, con try/catch por si no está disponible)
   - Ajustes de sonido comunes a toda la familia.
   - Un perfil por niño, con su propio progreso, voz y colección.
   - Si había partida de la versión 2, se convierte en el primer perfil.
   ========================================================= */

/* Mundo donde aparece por primera vez cada habilidad */
const MUNDO_DE_HAB = {};
MUNDOS.forEach((m, i) => {
  m.habs.concat(m.mision.habs, m.aprende).forEach(h => { if (!(h in MUNDO_DE_HAB)) MUNDO_DE_HAB[h] = i; });
});
MUNDO_DE_HAB.palabras = 3;
MUNDO_DE_HAB.ciencia = 0;
MUNDO_DE_HAB.repaso = 9;

const Guardado = {
  disponible: true,
  datos: null,
  temporizador: null,

  ajustesPorDefecto() {
    return {
      musica: true,
      volMusica: 0.35,
      volVoz: 1,
      volEfectos: 0.8,
      velocidad: 1,           // solo para la voz del dispositivo
      subtitulos: false,
      ayudas: true,           // Pipo vuelve a explicar si el niño se queda parado
      descansoMin: 20,        // 0 = sin límite
      descansoEstricto: false,// si es true, al llegar al tiempo hace falta un adulto para seguir
      mayusculas: true,       // lectura en MAYÚSCULAS o en minúsculas
      lectura: true           // minijuego de palabras (a partir del mundo 4)
    };
  },

  porDefecto() {
    return { v: 3, ajustes: this.ajustesPorDefecto(), perfiles: [], actual: null, creado: hoyISO() };
  },

  perfilPorDefecto() {
    return {
      id: '',
      nombre: '',
      avatar: 'zorro',
      edad: 5,
      voz: 'lola',
      estrellas: 0,
      desbloqueados: 1,      // mundos que se pueden visitar
      libres: 0,             // mundos abiertos enteros (por la prueba inicial o por los padres)
      pruebaHecha: false,
      mundos: {},            // progreso por mundo: niveles, reto en casa
      habs: {},              // dominio por habilidad
      cartas: [],
      pegatinas: [],
      piezas: [],
      tienda: { colores: ['menta'], accesorios: ['ninguno'], naves: ['blanca'] },
      pipo: { color: 'menta', acc: 'ninguno' },
      nave: { color: 'blanca' },
      vistos: {},            // actividades ya explicadas con la mano guía
      stats: { aciertos: 0, primera: 0, intentos: 0, racha: 0, mejorRacha: 0, partidas: 0, minutos: 0, ayudas: 0, niveles: 0, cofres: 0, cartasOidas: 0, palabras: 0, respiros: 0, demos: 0 },
      errores: {},           // fallos por habilidad (para la zona de padres)
      logros: [],
      dias: { ultimo: null, racha: 0, total: 0 },
      misiones: { fecha: null, lista: [], todas: false },
      semana: { id: null, llaves: 0, abierto: false },
      rango: 0,
      introVista: false,
      migradoV2: false,
      creado: hoyISO()
    };
  },

  nuevoId() {
    return 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  },

  cargar() {
    this.datos = this.porDefecto();
    try {
      const texto = window.localStorage.getItem(CLAVE_GUARDADO);
      if (texto) {
        const g = JSON.parse(texto);
        if (g && typeof g === 'object') {
          this.datos.ajustes = fusionar(this.ajustesPorDefecto(), g.ajustes || {});
          this.datos.perfiles = Array.isArray(g.perfiles) ? g.perfiles.map(p => this.repararPerfil(p)).filter(Boolean).slice(0, MAX_PERFILES) : [];
          this.datos.actual = g.actual || null;
          this.datos.creado = g.creado || hoyISO();
        }
      } else {
        this.migrarV2();
      }
      // Prueba de escritura: en algunos modos privados getItem funciona pero setItem falla
      window.localStorage.setItem(CLAVE_GUARDADO + '-prueba', '1');
      window.localStorage.removeItem(CLAVE_GUARDADO + '-prueba');
      this.disponible = true;
    } catch (e) {
      this.disponible = false;
    }
    if (!this.datos.perfiles.some(p => p.id === this.datos.actual)) {
      this.datos.actual = this.datos.perfiles.length ? this.datos.perfiles[0].id : null;
    }
  },

  /* Completa un perfil guardado con los campos nuevos y corrige valores imposibles */
  repararPerfil(g) {
    if (!g || typeof g !== 'object' || !g.id) return null;
    const p = fusionar(this.perfilPorDefecto(), g);
    p.id = String(g.id);
    p.nombre = String(p.nombre || '').slice(0, 24);
    p.edad = limitar(Number(p.edad) || 5, 5, 7);
    p.estrellas = limitar(Number(p.estrellas) || 0, 0, 99999);
    p.desbloqueados = limitar(p.desbloqueados | 0, 1, MUNDOS.length);
    p.libres = limitar(p.libres | 0, 0, MUNDOS.length);
    if (!VOCES_PIPO.some(v => v.id === p.voz)) p.voz = 'lola';
    const av = AVATARES.find(a => a.id === p.avatar || a.e === p.avatar);
    p.avatar = av ? av.id : AVATARES[0].id;
    p.pegatinas = p.pegatinas.filter(id => PEGATINAS.some(x => x.id === id));
    p.piezas = p.piezas.filter(id => PIEZAS_NAVE.indexOf(id) >= 0);
    p.cartas = p.cartas.filter(id => typeof id === 'string');
    if (!COLORES_PIPO.some(c => c.id === p.pipo.color)) p.pipo.color = 'menta';
    if (!ACCESORIOS.some(c => c.id === p.pipo.acc)) p.pipo.acc = 'ninguno';
    if (!COLORES_NAVE.some(c => c.id === p.nave.color)) p.nave.color = 'blanca';
    ['colores', 'accesorios', 'naves'].forEach(k => { if (!Array.isArray(p.tienda[k])) p.tienda[k] = []; });
    if (p.tienda.colores.indexOf('menta') < 0) p.tienda.colores.unshift('menta');
    if (p.tienda.accesorios.indexOf('ninguno') < 0) p.tienda.accesorios.unshift('ninguno');
    if (p.tienda.naves.indexOf('blanca') < 0) p.tienda.naves.unshift('blanca');
    Object.keys(p.habs).forEach(k => {
      const h = p.habs[k];
      if (!h || typeof h !== 'object' || !Array.isArray(h.hist)) { delete p.habs[k]; return; }
      h.dif = limitar(h.dif | 0, 0, DIFICULTAD_MAX);
    });
    return p;
  },

  /* La versión 2 guardaba una sola partida: pasa a ser el primer perfil */
  migrarV2() {
    let v2 = null;
    try { v2 = JSON.parse(window.localStorage.getItem('pipo-planetas-v2') || 'null'); } catch (e) { v2 = null; }
    if (!v2 || typeof v2 !== 'object') return;
    const p = this.perfilPorDefecto();
    p.id = this.nuevoId();
    p.migradoV2 = true;
    p.pruebaHecha = true;   // venía jugando a la versión 2: empieza por la Tierra (los padres pueden repetir la prueba)
    if (typeof v2.estrellas === 'number') p.estrellas = Math.max(0, Math.min(v2.estrellas, 500));
    if (Array.isArray(v2.pegatinas)) p.pegatinas = v2.pegatinas.filter(id => PEGATINAS.some(x => x.id === id));
    if (v2.tienda) {
      if (Array.isArray(v2.tienda.colores)) p.tienda.colores = v2.tienda.colores.filter(id => COLORES_PIPO.some(c => c.id === id));
      if (Array.isArray(v2.tienda.accesorios)) p.tienda.accesorios = v2.tienda.accesorios.filter(id => ACCESORIOS.some(c => c.id === id));
      if (p.tienda.colores.indexOf('menta') < 0) p.tienda.colores.unshift('menta');
      if (p.tienda.accesorios.indexOf('ninguno') < 0) p.tienda.accesorios.unshift('ninguno');
    }
    if (v2.pipo) {
      if (COLORES_PIPO.some(c => c.id === v2.pipo.color)) p.pipo.color = v2.pipo.color;
      if (ACCESORIOS.some(c => c.id === v2.pipo.acc)) p.pipo.acc = v2.pipo.acc;
    }
    if (v2.dias) p.dias = fusionar(p.dias, v2.dias);
    if (v2.stats) {
      ['aciertos', 'primera', 'intentos', 'mejorRacha', 'partidas', 'minutos', 'ayudas'].forEach(k => {
        if (typeof v2.stats[k] === 'number') p.stats[k] = v2.stats[k];
      });
    }
    if (v2.ajustes) {
      const a = this.datos.ajustes;
      ['musica', 'volMusica', 'volVoz', 'volEfectos', 'velocidad', 'subtitulos', 'ayudas'].forEach(k => {
        if (k in v2.ajustes && typeof v2.ajustes[k] === typeof a[k]) a[k] = v2.ajustes[k];
      });
      if (typeof v2.ajustes.descansoMin === 'number') a.descansoMin = v2.ajustes.descansoMin;
      if (VOCES_PIPO.some(v => v.id === v2.ajustes.voz)) p.voz = v2.ajustes.voz;
    }
    this.datos.perfiles.push(p);
    this.datos.actual = p.id;
  },

  /* Perfil que está jugando ahora */
  get p() {
    const d = this.datos;
    return d.perfiles.find(x => x.id === d.actual) || d.perfiles[0] || null;
  },

  crearPerfil(op) {
    op = op || {};
    if (this.datos.perfiles.length >= MAX_PERFILES) return null;
    const p = this.perfilPorDefecto();
    p.id = this.nuevoId();
    p.avatar = AVATARES.some(a => a.id === op.avatar) ? op.avatar : AVATARES[this.datos.perfiles.length % AVATARES.length].id;
    p.nombre = String(op.nombre || '').slice(0, 24);
    p.edad = limitar(Number(op.edad) || 5, 5, 7);
    if (VOCES_PIPO.some(v => v.id === op.voz)) p.voz = op.voz;
    p.pruebaHecha = p.edad <= 5;   // con 5 años se empieza por la Tierra, sin prueba
    this.datos.perfiles.push(p);
    this.datos.actual = p.id;
    this.guardar();
    return p;
  },

  elegirPerfil(id) {
    if (this.datos.perfiles.some(p => p.id === id)) {
      this.datos.actual = id;
      this.guardar();
    }
  },

  borrarPerfil(id) {
    this.datos.perfiles = this.datos.perfiles.filter(p => p.id !== id);
    if (this.datos.actual === id) this.datos.actual = this.datos.perfiles.length ? this.datos.perfiles[0].id : null;
    this.guardar();
  },

  /* Resultado de la prueba inicial: se abren enteros los mundos anteriores al de inicio */
  aplicarPrueba(p, mundoInicio) {
    const i = limitar(mundoInicio | 0, 0, MUNDOS.length - 1);
    p.pruebaHecha = true;
    p.libres = Math.max(p.libres, i);
    p.desbloqueados = Math.max(p.desbloqueados, i + 1);
    this.guardar();
  },

  /* Los padres pueden abrir mundos (nunca se cierra lo ya conseguido) */
  abrirHasta(p, n) {
    p.libres = Math.max(p.libres, limitar(n, 0, MUNDOS.length));
    p.desbloqueados = Math.max(p.desbloqueados, Math.min(MUNDOS.length, p.libres + 1));
    this.guardar();
  },

  /* Borra el progreso de un perfil (se conservan nombre, avatar, edad y voz) */
  reiniciarPerfil(p) {
    const nuevo = this.perfilPorDefecto();
    ['id', 'nombre', 'avatar', 'edad', 'voz', 'creado'].forEach(k => { nuevo[k] = p[k]; });
    nuevo.pruebaHecha = nuevo.edad <= 5;
    const i = this.datos.perfiles.indexOf(p);
    if (i >= 0) this.datos.perfiles[i] = nuevo;
    this.guardar();
    return nuevo;
  },

  /* Guarda enseguida */
  guardar() {
    clearTimeout(this.temporizador);
    this.temporizador = null;
    if (MODO_PRUEBA && Pruebas.sinGuardar) return;
    try {
      window.localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(this.datos));
      this.disponible = true;
    } catch (e) {
      this.disponible = false;
    }
  },

  /* Guarda un poco después (para cambios rápidos como los deslizadores) */
  guardarLuego() {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.guardar(), 400);
  },

  /* ---------- Dominio por habilidad ---------- */
  difInicial(p, hab) {
    const w = MUNDO_DE_HAB[hab] || 0;
    if (w < p.libres) return (p.edad >= 7 && w < 3) ? 2 : 1;
    return 0;
  },

  hab(id) {
    const p = this.p;
    if (!p.habs[id]) p.habs[id] = { dif: this.difInicial(p, id), hist: [], n: 0, ok: 0, seguidas: 0, ultima: null, t: 0 };
    return p.habs[id];
  },

  /* Apunta un reto terminado: primera = acertado a la primera y sin pista. Devuelve 'sube' si sube de grado. */
  registrarIntento(id, primera) {
    const h = this.hab(id);
    h.n++;
    if (primera) h.ok++;
    h.hist.push(primera ? 1 : 0);
    if (h.hist.length > HISTORIAL) h.hist.shift();
    h.ultima = hoyISO();
    h.t = Date.now();
    if (primera) {
      h.seguidas++;
      if (h.seguidas >= ACIERTOS_PARA_SUBIR && h.dif < DIFICULTAD_MAX) { h.dif++; h.seguidas = 0; return 'sube'; }
    } else {
      h.seguidas = 0;
      const p = this.p;
      p.errores[id] = (p.errores[id] || 0) + 1;
    }
    return null;
  },

  /* Un fallo en el primer intento baja un grado (para la próxima pregunta de esa habilidad) */
  bajarDif(id) {
    const h = this.hab(id);
    if (h.dif > 0) h.dif--;
    h.seguidas = 0;
  }
};

/* Dominio de una habilidad (0 a 1) y si está dominada */
function dominio(h) {
  if (!h || !h.hist.length) return null;
  return h.hist.reduce((s, x) => s + x, 0) / h.hist.length;
}
function dominada(h) {
  return !!h && h.hist.length >= 6 && dominio(h) >= DOMINIO_OK;
}
function avatarDe(p) {
  return AVATARES.find(a => a.id === (p && p.avatar)) || AVATARES[0];
}
