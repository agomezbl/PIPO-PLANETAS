/* =========================================================
   15. PRUEBAS AUTOMÁTICAS (abrir index.html?test=1)
   - 200 retos por actividad y grado: respuesta entre las opciones, sin repetidas,
     sin negativos ni fuera de rango, varias soluciones aceptadas.
   - Frases: todas existen, en español y con plurales correctos.
   - Datos de ciencia iguales a la lista aprobada.
   - Los 3 niveles por edad tienen sus 60 niveles con actividades válidas.
   - Los 60 niveles se desbloquean en orden; partida completa simulada;
     guardado y recuperación del progreso.
   - Cada actividad se juega de verdad en pantalla (acierto y camino de pistas).
   ========================================================= */
const Pruebas = {
  vozMuda: false,
  sinGuardar: false,
  rapido: false,
  frasesQueFaltan: {},
  errores: [],
  resultados: [],

  revisarFrases(partes) {
    partes.forEach(id => { if (typeof FRASES === 'undefined' || !FRASES[id]) this.frasesQueFaltan[id] = (this.frasesQueFaltan[id] || 0) + 1; });
  },

  /* Planeta donde se practica una habilidad (en el primer nivel por edad que la tenga) */
  mundoDe(hab) {
    for (let n = 0; n < NIVELES.length; n++) {
      const b = NIVELES[n].id;
      for (let i = 0; i < MUNDOS.length; i++) { const c = cur(i, b); if (c.habs.concat(c.mision, c.aprende).indexOf(hab) >= 0) return i; }
    }
    return 0;
  },

  ok(nombre, condicion, detalle) {
    this.resultados.push({ nombre: nombre, ok: !!condicion, detalle: condicion ? '' : (detalle || '') });
    return !!condicion;
  },

  /* ---------- 1. Generadores ---------- */
  probarGeneradores() {
    const habs = Object.keys(ACTIVIDADES).concat(['ciencia']);
    let total = 0;
    const fallos = [];
    const revisarIds = (lista, q, campo) => aplanar([lista || []]).forEach(id => { if (!FRASES[id]) fallos.push(q.hab + ' ' + campo + ': falta la frase ' + id); });
    habs.forEach(hab => {
      for (let dif = 0; dif <= 2; dif++) {
        Azar.sembrar(1000 + dif * 7 + hab.length * 131);
        for (let k = 0; k < 200; k++) {
          total++;
          let q;
          const mundo = hab === 'ciencia' ? azar(0, 9) : this.mundoDe(hab);
          try { q = crearReto(hab, dif, { mundo: mundo, tipo: 'practica' }); } catch (e) { fallos.push(hab + ' d' + dif + ': excepción ' + e.message); break; }
          q.hab = q.hab || hab;
          if (!q.firma) fallos.push(hab + ': sin firma');
          if (!Array.isArray(q.instr) || !q.instr.length) fallos.push(hab + ': sin consigna');
          revisarIds(q.instr, q, 'instr'); revisarIds(q.refuerzo, q, 'refuerzo'); revisarIds(q.explica, q, 'explica'); revisarIds(q.ensenar, q, 'ensenar');
          if (typeof q.pintar !== 'function') fallos.push(hab + ': sin pintar');
          if (q.opciones) {
            const vistos = new Set(q.opciones.map(String));
            if (vistos.size !== q.opciones.length) fallos.push(hab + ' d' + dif + ': opciones repetidas ' + q.opciones.join(','));
            const buenas = q.opciones.filter(o => Juego.esCorrecta(o, q));
            if (q.validas) { if (!buenas.length) fallos.push(hab + ': ninguna opción válida'); }
            else if (buenas.length !== 1) fallos.push(hab + ' d' + dif + ': respuestas correctas entre las opciones = ' + buenas.length + ' (' + q.opciones.join(',') + ' / ' + q.respuesta + ')');
            q.opciones.forEach(o => { if (typeof o === 'number' && (o < 0 || Math.floor(o) !== o)) fallos.push(hab + ': opción no válida ' + o); });
          }
          if (q.validas) q.validas.forEach(v => { if (hab !== 'carga' && !Juego.esCorrecta(v, q)) fallos.push(hab + ': solución válida rechazada ' + v); });
          if (hab === 'carga' && !q.validas.length) fallos.push('carga: sin solución');
          if (typeof q.respuesta === 'number') {
            if (q.respuesta < 0 || Math.floor(q.respuesta) !== q.respuesta) fallos.push(hab + ': respuesta no válida ' + q.respuesta);
            if (q.rango && (q.respuesta < q.rango[0] || q.respuesta > q.rango[1])) fallos.push(hab + ' d' + dif + ': respuesta fuera de rango ' + q.respuesta);
          }
          if (fallos.length > 40) break;
        }
      }
    });
    Azar.sembrar(0);
    this.ok('Generadores: ' + total + ' retos (' + habs.length + ' actividades × 3 grados × 200)', !fallos.length, fallos.slice(0, 8).join(' | '));
  },

  /* ---------- 2. Frases y concordancia ---------- */
  probarFrases() {
    const ids = Object.keys(FRASES);
    const raras = ids.filter(id => !FRASES[id] || !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ¡¿.,;:!?…'"\-\s()]+$/.test(FRASES[id]));
    this.ok('Frases: ' + ids.length + ' textos en español, sin cifras ni vacíos', !raras.length, raras.slice(0, 6).join(', '));
    const pl = [
      [cant(1, 'estrella'), ['una', 'o_estrella_s']], [cant(3, 'estrella'), ['n3', 'o_estrella_p']],
      [cant(1, 'cohete'), ['un', 'o_cohete_s']], [cant(2, 'pez'), ['n2', 'o_pez_p']], [eurosDe(1), ['un', 'euro']], [eurosDe(7), ['n7', 'euros']],
      [dichoHora(1, 0), ['es_la', 'h1_00']], [dichoHora(3, 30), ['son_las', 'h3_30']], [explicaResta(3, 2), ['n3', 'menos', 'n2', 'es', 'n1']]
    ];
    const malos = pl.filter(x => JSON.stringify(x[0]) !== JSON.stringify(x[1]));
    this.ok('Plurales y género ("una estrella", "un euro", "es la una")', !malos.length, malos.map(x => x[0].join(' ')).join(' | '));
    this.ok('Textos de plural en las frases', FRASES.o_estrella_s === 'estrella.' && FRASES.o_pez_p === 'peces.' && FRASES.dame_1 === 'Dame una galleta.' && FRASES.h1_00 === 'la una en punto.', '');
    // Números grandes: se componen con las centenas (nivel de 7 a 8 años)
    const t1 = Voz.texto(['toca_el', N(342)]), t2 = Voz.texto([N(105)]), t3 = Voz.texto(['son_las'].concat(horaHablada(3, 45)));
    this.ok('Números hasta 1000 y horas con minutos se dicen bien', JSON.stringify(N(342)) === '["cc300","n42"]' && N(300) === 'n300' && N(1000) === 'n1000' && N(100) === 'n100' &&
      t1 === 'Toca el trescientos cuarenta y dos.' && t2 === 'ciento cinco.' && t3 === 'Son las cuatro menos cuarto.', [t1, t2, t3].join(' | '));
    const sinVoz = [];
    VOCES_PIPO.filter(v => v.id !== 'sistema').forEach(v => {
      const paquete = Voz.clips(v.id);
      if (!paquete) { sinVoz.push(v.id + ': sin audio'); return; }
      const faltan = ids.filter(id => !paquete[id]);
      if (faltan.length) sinVoz.push(v.id + ': faltan ' + faltan.length + ' (' + faltan.slice(0, 4).join(',') + ')');
    });
    this.ok('Voces grabadas: Lola, Bruno y Cosmo tienen todas las frases', !sinVoz.length, sinVoz.join(' | '));
  },

  /* ---------- 3. Ciencia ---------- */
  probarCiencia() {
    const aprobadoSol = ['mercurio', 'venus', 'tierra', 'marte', 'jupiter', 'saturno', 'urano', 'neptuno'];
    const aprobadoTam = ['jupiter', 'saturno', 'urano', 'neptuno', 'tierra', 'venus', 'marte', 'mercurio'];
    this.ok('Orden de los planetas desde el Sol (aprobado)', JSON.stringify(ORDEN_SOL) === JSON.stringify(aprobadoSol));
    this.ok('Orden por tamaño (aprobado)', JSON.stringify(ORDEN_TAMANO) === JSON.stringify(aprobadoTam));
    const fallos = [];
    MUNDOS.forEach(m => {
      (HECHOS_MUNDO[m.id] || []).forEach(h => { if (!FRASES[h[0]]) fallos.push('falta ' + h[0]); });
      const preg = PREGUNTAS_MUNDO[m.id] || [];
      if (preg.length < 4) fallos.push(m.id + ': menos de 4 preguntas');
      preg.forEach(x => {
        if (!FRASES['q_' + x.q]) fallos.push('falta q_' + x.q);
        if (!FRASES[x.dato]) fallos.push('falta ' + x.dato);
        if (x.tipo === 'foto' && x.ops.indexOf(x.resp) < 0) fallos.push(x.q + ': respuesta fuera de opciones');
      });
      const cartas = CARTAS.filter(c => c.mundo === IDX_MUNDO[m.id]);
      if (cartas.length !== 2) fallos.push(m.id + ': ' + cartas.length + ' cartas');
    });
    CARTAS.forEach(c => c.hechos.forEach(h => { if (!FRASES[h]) fallos.push('carta ' + c.id + ': falta ' + h); }));
    // Las frases de datos solo dicen lo aprobado: comprobación de algunas claves
    const claves = [['f_jupiter_1', 'más grande'], ['f_mercurio_2', 'más pequeño'], ['f_venus_1', 'más caliente'], ['f_neptuno_1', 'más lejano'], ['f_marte_2', 'volcán más grande'], ['f_pluton', 'planeta enano'], ['f_sol_1', 'estrella'], ['f_luna_1', 'satélite'], ['f_urano_1', 'tumbado'], ['f_saturno_1', 'hielo y roca']];
    claves.forEach(c => { if ((FRASES[c[0]] || '').indexOf(c[1]) < 0) fallos.push(c[0] + ' no dice "' + c[1] + '"'); });
    const lunas = Object.keys(FRASES).filter(k => /^f_/.test(k) && /lunas/.test(FRASES[k]));
    if (lunas.length) fallos.push('se dan números de lunas: ' + lunas.join(','));
    this.ok('Ciencia: datos, preguntas y 20 cartas coinciden con la lista aprobada', !fallos.length, fallos.slice(0, 6).join(' | '));
  },

  /* ---------- 4. Planes de nivel ---------- */
  probarPlanes() {
    const fallos = [];
    const p = Guardado.p, antes = p.banda;
    NIVELES.forEach(n => {
      p.banda = n.id;
      MUNDOS.forEach((m, i) => {
        const c = cur(i);
        if (!c || !c.tema || c.aprende.length < 2 || c.mision.length < 3) fallos.push(n.id + '/' + m.id + ': plan incompleto');
        c.habs.concat(c.aprende, c.mision).forEach(h => {
          if (h !== 'ciencia' && h !== 'repaso' && !ACTIVIDADES[h]) fallos.push(n.id + '/' + m.id + ': actividad desconocida ' + h);
          if (!HABILIDADES[h]) fallos.push('sin nombre para los padres: ' + h);
          if (EDAD_HAB[h] === undefined) fallos.push('sin edad: ' + h);
        });
        c.aprende.forEach(h => { const q = crearReto(h, 0, { mundo: i }); if (!q.ensenar && !q.demo && !q.pista) fallos.push(n.id + '/' + m.id + ': ' + h + ' no se puede enseñar'); });
        if (c.misionFrase && !FRASES[c.misionFrase]) fallos.push('falta ' + c.misionFrase);
        TIPOS_NIVEL.forEach(t => {
          if (t.id === 'descubre') return;
          for (let k = 0; k < 12; k++) {
            const plan = planNivel(i, t.id);
            if (plan.length !== t.retos) fallos.push(n.id + '/' + m.id + '/' + t.id + ': ' + plan.length + ' retos');
            plan.forEach(h => { if (h !== 'ciencia' && !ACTIVIDADES[h]) fallos.push(m.id + '/' + t.id + ': habilidad desconocida ' + h); });
          }
        });
      });
    });
    // Todas las actividades se usan en algún nivel
    const usadas = {};
    NIVELES.forEach(n => MUNDOS.forEach((m, i) => { const c = cur(i, n.id); c.habs.concat(c.aprende, c.mision).forEach(h => { usadas[h] = true; }); }));
    Object.keys(ACTIVIDADES).filter(h => h !== 'palabras' && !usadas[h]).forEach(h => fallos.push('actividad sin usar: ' + h));
    p.banda = antes;
    this.ok('Planes de los 3 niveles por edad × 60 niveles (actividades válidas, todas usadas)', !fallos.length, fallos.slice(0, 6).join(' | '));
    // Dificultad de partida según la edad
    const d = (banda, h) => Guardado.difInicial({ banda: banda, libres: 0 }, h);
    this.ok('Dificultad inicial según el nivel por edad', d('a', 'sumas') === 0 && d('b', 'sumas') === 1 && d('c', 'sumas') === 2 && d('c', 'sumaDecenas') === 1 && d('c', 'tablas') === 0 && d('a', 'grupos') === 0,
      [d('a', 'sumas'), d('b', 'sumas'), d('c', 'sumas'), d('c', 'sumaDecenas'), d('c', 'tablas')].join(','));
  },

  /* ---------- 4b. Dibujos propios ---------- */
  probarDibujos() {
    const sinDibujo = Object.keys(EMOJI_ICO).filter(e => !ICO[EMOJI_ICO[e]]);
    const simbolos = $$('#spriteIconos symbol').length;
    const caja = crear('div', '', '<span class="emo">⭐🚀🦊</span> hola');
    document.body.appendChild(caja);
    Iconos.convertir(caja);
    const ok = caja.querySelectorAll('.ico-d').length === 3 && caja.textContent.indexOf('hola') >= 0;
    caja.remove();
    this.ok('Dibujos propios: ' + Object.keys(ICO).length + ' dibujos y ' + Object.keys(EMOJI_ICO).length + ' emojis sustituidos', !sinDibujo.length && simbolos === Object.keys(ICO).length && ok, sinDibujo.join(',') + ' símbolos=' + simbolos + ' conversión=' + ok);
  },

  /* ---------- 5. Partida completa simulada (lógica) ---------- */
  probarPartidaCompleta() {
    const fallos = [];
    const p = Guardado.crearPerfil({ avatar: 'oso', banda: 'a', voz: 'bruno' });
    if (!p) { this.ok('Partida simulada', false, 'no se pudo crear el perfil'); return; }
    MUNDOS.forEach((m, i) => {
      if (!Mapa.desbloqueado(i)) fallos.push('mundo ' + (i + 1) + ' no se desbloquea');
      Mundo.idx = i;
      TIPOS_NIVEL.forEach((t, k) => {
        if (!Mundo.nivelAbierto(k)) fallos.push(m.id + '/' + t.id + ' cerrado a su hora');
        if (k + 1 < TIPOS_NIVEL.length && Mundo.nivelAbierto(k + 1) && i >= p.libres) fallos.push(m.id + '/' + TIPOS_NIVEL[k + 1].id + ' abierto antes de tiempo');
        if (t.id === 'descubre') Ciencia.darCarta(CARTAS.find(c => c.mundo === i && !c.extra).id);
        const res = rango(1, t.retos).map(x => x !== 2 || k % 2 === 0);
        const r = Premios.registrar(i, t.id, res);
        if (r.est < 1 || r.est > 3) fallos.push('estrellas raras ' + r.est);
      });
      if (!mundoTerminado(p, i)) fallos.push(m.id + ' no terminado');
      Casa.mundo = i;
      registroMundo(p, m.id).casa = 'hecho';
    });
    if (p.piezas.length !== 10) fallos.push('piezas de la nave: ' + p.piezas.length);
    if (p.cartas.length !== CARTAS.length) fallos.push('cartas: ' + p.cartas.length);
    if (rangoDe(p) !== RANGOS.length - 1) fallos.push('rango final: ' + rangoDe(p));
    if (p.desbloqueados !== 10) fallos.push('mundos desbloqueados: ' + p.desbloqueados);
    if (contarTresEstrellas(p) < 1) fallos.push('sin niveles de 3 estrellas');
    Logros.comprobar();
    if (p.logros.length < 10) fallos.push('pocas medallas: ' + p.logros.length);
    this.ok('Partida completa simulada: 60 niveles en orden, 10 piezas, 20 cartas, rango final', !fallos.length, fallos.slice(0, 6).join(' | '));
    // Guardado y recuperación
    const antes = JSON.stringify(p);
    Pruebas.sinGuardar = false;
    Guardado.guardar();
    Guardado.cargar();
    const despues = Guardado.datos.perfiles.find(x => x.id === p.id);
    this.ok('Guardado y recuperación del progreso (localStorage)', !!despues && JSON.stringify(despues) === antes, despues ? 'el perfil cambió al recargar' : 'perfil perdido');
    // Datos antiguos o rotos no rompen el juego
    try {
      const r = Guardado.repararPerfil({ id: 'x', edad: 'abc', avatar: '🦊', habs: { contar: { dif: 9, hist: [1] }, roto: 5 }, pipo: { color: 'nada' } });
      const v3a = Guardado.repararPerfil({ id: 'y', edad: 7, pruebaHecha: false }), v3b = Guardado.repararPerfil({ id: 'z', edad: 5 }), v4 = Guardado.repararPerfil({ id: 'w', banda: 'c' });
      this.ok('Datos guardados antiguos o rotos se reparan (y los perfiles de la versión 3 reciben su nivel)', r.banda === 'a' && r.edad === undefined && r.avatar === 'zorro' && r.habs.contar.dif === 2 && !r.habs.roto && r.pipo.color === 'menta' &&
        v3a.banda === 'b' && v3a.pruebaHecha && v3b.banda === 'a' && v4.banda === 'c');
      const q = Guardado.crearPerfil({ avatar: 'leon', banda: 'c', voz: 'lola' });
      Guardado.p.habs.sumas = { dif: 2, hist: [], n: 0, ok: 0, seguidas: 2, ultima: null, t: 0 };
      Guardado.cambiarNivel(Guardado.p, 'a');
      this.ok('Cambiar de nivel en la zona de padres recoloca la dificultad', !!q && Guardado.p.banda === 'a' && Guardado.p.habs.sumas.dif === 0, JSON.stringify(Guardado.p.habs.sumas));
    } catch (e) { this.ok('Datos guardados antiguos o rotos se reparan', false, e.message); }
  },

  /* ---------- 6. Juego real en pantalla ---------- */
  async jugarReto(hab, dif, modo) {
    const mundo = hab === 'ciencia' ? 0 : this.mundoDe(hab);
    let terminado = false;
    Juego.empezar(mundo, 'practica', { modo: 'nivel', plan: [{ hab: hab, dif: dif }], alFinal: () => { terminado = true; } });
    await esperar(60);
    const q = Juego.reto;
    if (!q) return 'sin reto';
    if (!$('#escena').children.length) return 'escena vacía';
    if (modo === 'fallos') {
      // Respuestas equivocadas: ánimo -> pista -> demostración
      for (let k = 0; k < 3; k++) {
        const malas = $$('#p-juego .elegible').filter(b => !b.disabled && !b.classList.contains('apagado') && !Juego.esCorrecta(b.dataset.valor, q));
        if (!malas.length) break;
        malas[0].click();
        await esperar(40);
      }
    }
    // Contestar bien (como lo haría un niño); tras una demostración llega una pregunta parecida
    let ultimo = null;
    for (let intento = 0; intento < 120 && !terminado; intento++) {
      const actual = Juego.reto;
      if (!Juego.bloqueado && actual && (actual !== ultimo || intento % 10 === 0)) {
        ultimo = actual;
        if (actual.resolverPrueba) actual.resolverPrueba();
        else {
          const b = $$('#p-juego .elegible').find(x => Juego.esCorrecta(x.dataset.valor, actual));
          if (b) { b.disabled = false; b.click(); }
        }
      }
      await esperar(50);
    }
    if (!terminado) return 'no terminó (' + (Juego.estado ? Juego.estado.resultados.length : '?') + ' resultados)';
    if (modo === 'fallos') {
      if (Juego.estado.resultados[0] !== false) return 'tras fallar no se marcó como reto con ayuda';
      if (hab !== 'ciencia' && Juego.plan.length < 2) return 'no se añadió la pregunta parecida';
    }
    return null;
  },

  async probarEnPantalla() {
    const fallos = [];
    const habs = Object.keys(ACTIVIDADES).concat(['ciencia']);
    let jugados = 0;
    for (const hab of habs) {
      for (let dif = 0; dif <= 2; dif++) {
        Azar.sembrar(77 + dif + hab.length * 13);
        const r = await this.jugarReto(hab, dif, 'bien');
        jugados++;
        if (r) fallos.push(hab + ' d' + dif + ': ' + r);
      }
    }
    this.ok('Juego en pantalla: ' + jugados + ' retos resueltos tocando como un niño', !fallos.length, fallos.slice(0, 8).join(' | '));
    const fallos2 = [];
    const conOpciones = habs.filter(h => { const q = crearReto(h, 1, { mundo: this.mundoDe(h) }); return h !== 'descomponer' && !q.accion && !q.validas && q.opciones && q.opciones.length >= 3; });
    for (const hab of conOpciones) {
      Azar.sembrar(5 + hab.length);
      const r = await this.jugarReto(hab, 1, 'fallos');
      if (r) fallos2.push(hab + ': ' + r);
    }
    this.ok('Camino de ayudas (fallo → pista → demostración → pregunta parecida) en ' + conOpciones.length + ' actividades', !fallos2.length, fallos2.slice(0, 6).join(' | '));
    Azar.sembrar(0);
  },

  /* Nivel completo con premio, despegue y vuelta al mapa */
  async probarFlujoNivel() {
    let fin = false;
    const p = Guardado.p;
    try {
      p.desbloqueados = 10;
      Juego.empezar(0, 'aprende');
      for (let k = 0; k < 400 && UI.pantalla === 'p-juego'; k++) {
        const q = Juego.reto;
        if (q && !Juego.bloqueado) {
          if (q.resolverPrueba) q.resolverPrueba();
          else { const b = $$('#p-juego .elegible').find(x => Juego.esCorrecta(x.dataset.valor, q)); if (b) b.click(); }
        }
        await esperar(60);
      }
      fin = UI.pantalla === 'p-premio';
      this.ok('Flujo completo: nivel → premio', fin, 'pantalla final: ' + UI.pantalla);
      $('#btnPremioSeguir').hidden = false;
      $('#btnPremioSeguir').click();
      await esperar(200);
      this.ok('Flujo completo: premio → planeta', UI.pantalla === 'p-mundo', 'pantalla: ' + UI.pantalla);
      Mapa.abrir({});
      await esperar(100);
      this.ok('Mapa del viaje con 10 mundos', $$('#mapaNodos .planeta').length === 10);
      $('#btnSeguirViaje').click();
      await esperar(120);
      this.ok('Botón grande del mapa: directo al siguiente nivel', UI.pantalla === 'p-juego' && Juego.tipo && Juego.tipo.id === 'practica', 'pantalla: ' + UI.pantalla);
      Juego.salir();
      await esperar(120);
      this.ok('Salir de un nivel lleva a la pantalla del planeta', UI.pantalla === 'p-mundo' && $$('#mundoCamino .nivel').length === 6 && !$('#btnJugarNivel').hidden, 'pantalla: ' + UI.pantalla);
      this.ok('En pantalla se ven dibujos propios (no emojis)', $$('#p-mundo .ico-d').length >= 6, 'dibujos: ' + $$('#p-mundo .ico-d').length);
      Mapa.abrir({});
      await esperar(80);
      Album.abrir(); await esperar(50);
      this.ok('Álbum con 20 cartas', $$('#albumRejilla .casilla').length === 20);
      Taller.abrir(); await esperar(50);
      this.ok('Taller (armario y nave)', $$('#tiendaItems .item').length > 5);
      Padres.abrir(); await esperar(50);
      ['progreso', 'perfil', 'ajustes', 'ayuda'].forEach(s => { Padres.seccion = s; Padres.pintar(); });
      this.ok('Zona de padres (4 secciones)', $('#padresContenido').innerHTML.length > 500);
      Padres.cerrar();
    } catch (e) {
      this.ok('Flujo completo', false, e.message);
    }
  },

  async ejecutar() {
    const caja = $('#resultadoPruebas');
    caja.hidden = false;
    caja.innerHTML = '<h2>Pruebas automáticas…</h2>';
    const copia = (() => { try { return window.localStorage.getItem(CLAVE_GUARDADO); } catch (e) { return null; } })();
    this.vozMuda = true;
    this.rapido = true;
    window.addEventListener('error', ev => this.errores.push(String(ev.message)));
    const errOriginal = console.error;
    console.error = (...a) => { this.errores.push(a.join(' ')); errOriginal.apply(console, a); };
    const t0 = Date.now();
    try {
      Guardado.datos = Guardado.porDefecto();
      Guardado.crearPerfil({ avatar: 'zorro', banda: 'c', voz: 'lola' });
      this.probarFrases();
      this.probarCiencia();
      this.probarGeneradores();
      this.probarPlanes();
      this.probarDibujos();
      this.probarPartidaCompleta();
      Guardado.datos = Guardado.porDefecto();
      Guardado.crearPerfil({ avatar: 'panda', banda: 'b', voz: 'cosmo' });
      await this.probarEnPantalla();
      await this.probarFlujoNivel();
    } catch (e) {
      this.ok('Las pruebas terminan sin excepciones', false, e.message + ' ' + (e.stack || '').split('\n')[1]);
    }
    const faltan = Object.keys(this.frasesQueFaltan);
    this.ok('Todo lo que dice Pipo existe en las frases grabadas', !faltan.length, faltan.slice(0, 10).join(', '));
    this.ok('Sin errores de JavaScript durante las pruebas', !this.errores.length, this.errores.slice(0, 5).join(' | '));
    try { if (copia === null) window.localStorage.removeItem(CLAVE_GUARDADO); else window.localStorage.setItem(CLAVE_GUARDADO, copia); } catch (e) { /* nada */ }
    const bien = this.resultados.filter(r => r.ok).length;
    const seg = ((Date.now() - t0) / 1000).toFixed(1);
    window.__resultadoPruebas = { bien: bien, total: this.resultados.length, resultados: this.resultados, segundos: seg };
    caja.innerHTML = '<h2>' + (bien === this.resultados.length ? '✅' : '❌') + ' ' + bien + ' / ' + this.resultados.length + ' pruebas superadas (' + seg + ' s)</h2><ul>' +
      this.resultados.map(r => '<li class="' + (r.ok ? 'ok' : 'mal') + '">' + (r.ok ? '✔' : '✘') + ' ' + escapar(r.nombre) + (r.detalle ? '<br><small>' + escapar(r.detalle) + '</small>' : '') + '</li>').join('') +
      '</ul><button class="btn-texto-pp" type="button" onclick="location.href=location.pathname">Salir de las pruebas</button>';
    Guardado.cargar();
  }
};
