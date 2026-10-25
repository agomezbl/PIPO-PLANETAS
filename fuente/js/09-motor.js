/* =========================================================
   9. MOTOR DEL JUEGO, DIBUJO DE ESCENAS Y PISTAS
   - Cada nivel tiene un plan de 6 a 10 retos (habilidades del mundo + repaso).
   - Dificultad por habilidad: 3 aciertos seguidos a la primera -> sube un grado;
     un fallo -> baja un grado para la próxima vez.
   - Ayuda escalonada: 1) ánimo y repetir más despacio, 2) pista visual,
     3) demostración resuelta y, después, una pregunta parecida.
   - El error nunca se castiga: no se pierde nada y la voz siempre anima.
   ========================================================= */
const Sesion = {
  ms: 0,           // tiempo de juego acumulado desde el último descanso
  reiniciar() { this.ms = 0; }
};

/* ---------- Plan de un nivel ---------- */
function habsAnteriores(mundoIdx) {
  const lista = [];
  for (let i = 0; i < mundoIdx; i++) {
    MUNDOS[i].habs.forEach(h => { if (h !== 'repaso' && lista.indexOf(h) < 0) lista.push(h); });
  }
  return lista;
}

/* Elige habilidades de repaso: más probabilidad para las que más cuestan */
function elegirRepaso(pool, cuantas) {
  const p = Guardado.p;
  const pesos = pool.map(h => {
    const d = dominio(p && p.habs[h]);
    return d === null ? 1.4 : 1 + 3 * (1 - d);
  });
  const elegidas = [];
  const disponibles = pool.slice();
  for (let k = 0; k < cuantas && disponibles.length; k++) {
    const total = disponibles.reduce((s, h) => s + pesos[pool.indexOf(h)], 0);
    let x = rnd() * total;
    let idx = 0;
    for (; idx < disponibles.length - 1; idx++) {
      x -= pesos[pool.indexOf(disponibles[idx])];
      if (x <= 0) break;
    }
    elegidas.push(disponibles[idx]);
    disponibles.splice(idx, 1);
    if (!disponibles.length && k + 1 < cuantas) disponibles.push.apply(disponibles, pool);
  }
  return elegidas;
}

/* Reparte una lista para que no se repita la misma habilidad seguida */
function intercalar(lista) {
  const r = lista.slice();
  for (let i = 1; i < r.length; i++) {
    if (r[i] === r[i - 1]) {
      for (let j = i + 1; j < r.length; j++) {
        if (r[j] !== r[i - 1] && (j + 1 >= r.length || r[j + 1] !== r[i]) ) { const t = r[i]; r[i] = r[j]; r[j] = t; break; }
      }
    }
  }
  return r;
}

function llenar(base, n) {
  const r = [];
  let bolsa = [];
  while (r.length < n) {
    if (!bolsa.length) bolsa = barajar(base);
    r.push(bolsa.shift());
  }
  return r;
}

/* Devuelve la lista de habilidades del nivel */
function planNivel(mundoIdx, tipoId) {
  const m = MUNDOS[mundoIdx];
  const tipo = TIPOS_NIVEL.find(t => t.id === tipoId);
  const n = tipo.retos;
  let plan;
  const esSol = m.id === 'sol';
  const previas = habsAnteriores(mundoIdx);
  if (tipoId === 'aprende') {
    // Bloques: cada habilidad nueva dos veces seguidas (primero guiada)
    plan = [];
    m.aprende.forEach(h => { plan.push(h, h); });
    while (plan.length < n) plan.push(elegir(m.aprende));
    plan = plan.slice(0, n);
    return plan;
  }
  if (tipoId === 'mision') {
    const hs = m.mision.habs;
    plan = [];
    for (let i = 0; i < n; i++) plan.push(i % 2 === 0 ? hs[0] : hs[1 + ((i >> 1) % (hs.length - 1))]);
    return plan;
  }
  let base = m.habs.filter(h => h !== 'repaso');
  if (tipoId === 'proyecto') base = base.concat(m.mision.habs.filter(h => base.indexOf(h) < 0));
  if (esSol && tipoId === 'proyecto') {
    // Gran desafío final: una habilidad de cada mundo y el orden de los planetas
    const una = MUNDOS.slice(0, 9).map(w => elegirRepaso(w.habs, 1)[0]);
    plan = barajar(una).concat(['ordenPlanetas']);
    return plan.slice(0, n);
  }
  if (esSol) {
    const nRep = Math.round(n * 0.5);
    plan = llenar(base, n - nRep).concat(elegirRepaso(previas, nRep).concat(['ciencia']).slice(0, nRep));
    return intercalar(barajar(plan)).slice(0, n);
  }
  const nRep = previas.length ? Math.round(n * tipo.repaso) : 0;
  plan = llenar(base, n - nRep).concat(elegirRepaso(previas, nRep));
  return intercalar(barajar(plan));
}

/* Dificultad con la que sale una habilidad en un nivel */
function difPara(hab, tipoId, esRepaso) {
  const h = Guardado.hab(hab);
  const tipo = TIPOS_NIVEL.find(t => t.id === tipoId) || { delta: 0 };
  return limitar(h.dif + (esRepaso ? 0 : tipo.delta), 0, DIFICULTAD_MAX);
}

/* Crea un reto de una habilidad */
function crearReto(hab, dif, ctx) {
  ctx = ctx || {};
  if (hab === 'ciencia') return Ciencia.retoPregunta(ctx.mundo !== undefined ? ctx.mundo : null, dif, ctx.pregunta);
  const fn = ACTIVIDADES[hab];
  if (!fn) throw new Error('Actividad desconocida: ' + hab);
  return fn(dif, ctx);
}

/* ----- Dibujo de escenas ----- */
const Render = {
  conteo: 0,   // cuántos objetos ha contado el niño tocando

  limpiar() {
    $('#escena').innerHTML = '';
    const resp = $('#respuestas');
    resp.innerHTML = '';
    resp.className = 'respuestas';
    this.conteo = 0;
  },

  /* Botón de respuesta con un número (o texto corto) */
  botonNumero(valor, texto) {
    const b = crear('button', 'btn opcion elegible', '<span>' + (texto !== undefined ? texto : valor) + '</span>');
    b.type = 'button';
    b.dataset.valor = String(valor);
    b.setAttribute('aria-label', String(texto !== undefined ? texto : valor));
    b.addEventListener('click', () => Juego.responder(String(valor), b));
    return b;
  },

  /* Botón de respuesta con un dibujo (emoji o SVG) */
  botonEmoji(valor, emoji, etiqueta) {
    const b = crear('button', 'btn opcion elegible', /^</.test(emoji) ? emoji : '<span class="emo">' + emoji + '</span>');
    b.type = 'button';
    b.dataset.valor = String(valor);
    b.setAttribute('aria-label', etiqueta || String(valor));
    b.addEventListener('click', () => Juego.responder(String(valor), b));
    return b;
  },

  /* Carta grande dentro de la escena (números, formas, grupos) */
  carta(valor, html, nombre) {
    const b = crear('button', 'btn opcion carta elegible', html);
    b.type = 'button';
    b.dataset.valor = String(valor);
    b.setAttribute('aria-label', nombre || String(valor));
    b.addEventListener('click', () => Juego.responder(String(valor), b));
    return b;
  },

  /* Contenedor de cartas que se ajusta al hueco */
  cartas(aspecto, maximo) {
    const c = crear('div', 'cartas');
    c.dataset.ajustar = 'cartas';
    c.dataset.aspecto = aspecto || 1;
    c.dataset.max = maximo || 210;
    return c;
  },

  /* Un objeto que se puede tocar para contarlo (o solo mirar) */
  objeto(emoji, contable) {
    const b = crear(contable ? 'button' : 'span', 'obj' + (contable ? '' : ' no-contable'), '<span class="obj-e">' + emoji + '</span><span class="obj-num"></span>');
    if (contable) {
      b.type = 'button';
      b.setAttribute('aria-label', 'objeto');
      b.addEventListener('click', () => this.tocarObjeto(b));
    } else {
      b.setAttribute('aria-hidden', 'true');
    }
    return b;
  },

  /* Rejilla de objetos. op: { contable, disperso, max } */
  rejilla(emojis, op) {
    op = op || {};
    const r = crear('div', 'rejilla');
    r.dataset.ajustar = 'rejilla';
    if (op.max) r.dataset.max = op.max;
    const objs = emojis.map(e => this.objeto(e, op.contable !== false));
    if (op.disperso) {
      const huecos = Math.ceil(emojis.length * 1.6);
      r.dataset.n = huecos;
      const sitios = barajar(rango(0, huecos - 1)).slice(0, emojis.length).sort((a, b) => a - b);
      let k = 0;
      for (let i = 0; i < huecos; i++) {
        if (sitios.indexOf(i) >= 0) {
          const o = objs[k++];
          const e = o.querySelector('.obj-e');
          e.style.setProperty('--dx', azar(-14, 14) + '%');
          e.style.setProperty('--dy', azar(-14, 14) + '%');
          e.style.setProperty('--rot', azar(-16, 16) + 'deg');
          r.appendChild(o);
        } else {
          r.appendChild(crear('span', 'hueco-vacio'));
        }
      }
    } else {
      objs.forEach(o => r.appendChild(o));
    }
    return r;
  },

  /* El niño toca un objeto: se marca con su número y Pipo lo dice */
  tocarObjeto(b) {
    if (b.classList.contains('se-va') || Pistas.contando || Juego.bloqueado) return;
    Juego.ultimoToque = Date.now();
    let n = Number(b.dataset.n || 0);
    if (!n) {
      this.conteo++;
      n = this.conteo;
      this.marcar(b, n);
    }
    b.classList.remove('rebote');
    void b.offsetWidth;
    b.classList.add('rebote');
    Sonido.efecto('contar', n);
    if (n <= 100) Voz.decir(N(n));
  },

  marcar(b, n) {
    b.dataset.n = String(n);
    b.classList.add('contado');
    const num = b.querySelector('.obj-num');
    if (num) num.textContent = n;
  },

  desmarcar(b) {
    delete b.dataset.n;
    b.classList.remove('contado');
  },

  /* Ecuación dibujada debajo de la escena: [a, '+', b, '=', '?'] */
  ecuacion(partes) {
    return crear('div', 'ecuacion', partes.map(x => {
      if (x === '+') return '<span class="signo-mas">+</span>';
      if (x === '−' || x === '-') return '<span class="signo-menos">−</span>';
      if (x === '×') return '<span class="signo-por">×</span>';
      if (x === '?') return '<span class="q">?</span>';
      return '<span>' + x + '</span>';
    }).join(''));
  },

  /* Recalcula los tamaños de todo lo que hay en la escena */
  ajustar() {
    $$('#escena [data-ajustar]').forEach(el => {
      const tipo = el.dataset.ajustar;
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      if (tipo === 'rejilla') {
        const n = Number(el.dataset.n) || el.children.length || 1;
        const hueco = 6;
        const m = medirRejilla(W, H, n, 1, hueco);
        const lado = Math.min(m.alto, Number(el.dataset.max) || 150);
        el.style.setProperty('--cols', m.cols);
        el.style.setProperty('--cw', lado + 'px');
        el.style.setProperty('--ch', lado + 'px');
        el.style.setProperty('--g', hueco + 'px');
      } else if (tipo === 'cartas') {
        const n = el.children.length || 1;
        const aspecto = Number(el.dataset.aspecto) || 1;
        const hueco = limitar(Math.min(W, H) * 0.05, 8, 20);
        const m = medirRejilla(W, H, n, aspecto, hueco);
        const alto = Math.min(m.alto, Number(el.dataset.max) || 210);
        el.style.setProperty('--cols', m.cols);
        el.style.setProperty('--ch', alto + 'px');
        el.style.setProperty('--cw', (alto * aspecto) + 'px');
        el.style.setProperty('--g', hueco + 'px');
      } else if (tipo === 'tren') {
        const vagones = el.children.length - 1;
        const s = Math.min((W - 6) / (0.9 + 1.1 * vagones), H * 0.62, 130);
        el.style.setProperty('--s', s + 'px');
      } else if (tipo === 'fila') {
        const n = el.children.length;
        const enUna = Math.min((W - 4) / (n + 0.12 * (n - 1)), H * 0.8, 120);
        const cols = Math.ceil(n / 2);
        const enDos = Math.min((W - 4) / (cols + 0.12 * (cols - 1)), (H - 8) / 2.12, 120);
        const usarUna = enUna >= 54 || enUna >= enDos;
        const s = usarUna ? enUna : enDos;
        const c = usarUna ? n : cols;
        el.style.setProperty('--s', s + 'px');
        el.style.maxWidth = (c * s + (c - 1) * s * 0.12 + 3) + 'px';
      } else if (tipo === 'marcos') {
        const marcos = el.children.length || 1;
        const s = Math.min((W - 8) / 5, (H - 10) / (marcos * 2 + (marcos - 1) * 0.3), 130);
        el.style.setProperty('--s', s + 'px');
      } else if (tipo === 'dispersa') {
        const piezas = $$('.forma-suelta', el);
        let huecos = Number(el.dataset.huecos) || piezas.length;
        let m = medirRejilla(W, H, huecos, 1, 0);
        const compacta = Math.min(W / m.cols, H / m.filas) * 0.84 < 64 && huecos > piezas.length;
        if (compacta) { huecos = piezas.length; m = medirRejilla(W, H, huecos, 1, 0); }
        const orden = piezas.map(b => Number(b.dataset.hueco)).sort((a, b) => a - b);
        const cw = W / m.cols, ch = H / m.filas;
        const s = limitar(Math.min(cw, ch) * 0.84, 56, 150);
        el.style.setProperty('--s', s + 'px');
        piezas.forEach(b => {
          const h = compacta ? orden.indexOf(Number(b.dataset.hueco)) : Number(b.dataset.hueco);
          const c = h % m.cols, f = Math.floor(h / m.cols);
          const hx = Math.max(0, (cw - s) / 2 * 0.8), hy = Math.max(0, (ch - s) / 2 * 0.8);
          b.style.left = ((c + 0.5) * cw + Number(b.dataset.jx) * hx) + 'px';
          b.style.top = ((f + 0.5) * ch + Number(b.dataset.jy) * hy) + 'px';
        });
      } else if (tipo === 'cuadrado') {
        const zona = el.parentNode;
        const lado = Math.min(zona.clientWidth, zona.clientHeight) * 0.92;
        el.style.width = el.style.height = Math.min(lado, Number(el.dataset.max) || 340) + 'px';
      } else if (tipo === 'escala') {
        // Contenido de tamaño fijo (ancho x alto en data-w / data-h) que se escala para caber
        const w = Number(el.dataset.w) || 400, h = Number(el.dataset.h) || 300;
        const zona = el.parentNode;
        const k = Math.min(zona.clientWidth / w, zona.clientHeight / h, Number(el.dataset.maxk) || 1.6);
        el.style.setProperty('--k', k.toFixed(3));
      }
    });
  }
};

/* ----- Pistas visuales y habladas ----- */
const Pistas = {
  contando: false,
  vivo(tk) { return tk === Juego.token; },

  /* Contamos juntos: se marcan los objetos uno a uno mientras Pipo cuenta */
  async contar(tk, objs, op) {
    this.contando = true;
    try {
      await this.contarJuntos(tk, objs, op || {});
    } finally {
      this.contando = false;
    }
  },

  async contarJuntos(tk, objs, op) {
    if (op.intro !== null) await Voz.decir(op.intro || ['juntos']);
    if (!this.vivo(tk)) return;
    objs.forEach(o => Render.desmarcar(o));
    if (op.previos) op.previos.forEach(o => Render.desmarcar(o));
    let n = op.desde || 0;
    if (op.previos && op.previos.length) {
      op.previos.forEach((o, k) => Render.marcar(o, k + 1));
      n = op.previos.length;
      if (op.marcoPrevio) op.marcoPrevio.classList.add('leyendo');
      await Voz.decir(['caja_diez', 'seguimos_diez']);
      if (op.marcoPrevio) op.marcoPrevio.classList.remove('leyendo');
      if (!this.vivo(tk)) return;
    }
    const paso = op.paso || 1;
    for (let i = 0; i < objs.length; i++) {
      n += paso;
      Render.marcar(objs[i], n);
      objs[i].classList.remove('rebote');
      void objs[i].offsetWidth;
      objs[i].classList.add('rebote');
      Sonido.efecto('contar', i + 1);
      const t0 = Date.now();
      await Promise.race([Voz.decir(N(n)), esperar(T(1500))]);
      if (!this.vivo(tk)) return;
      const pasado = Date.now() - t0;
      if (pasado < 420) await esperar(T(420 - pasado));
      if (!this.vivo(tk)) return;
    }
    Render.conteo = Math.max(Render.conteo, n);
    if (op.cierre !== null) await Voz.decir(op.cierre || ['ultimo_numero']);
  },

  /* Señala una serie de elementos mientras Pipo dice algo de cada uno */
  async leer(tk, pasos, cierre, intro) {
    if (intro) await Voz.decir(intro);
    if (!this.vivo(tk)) return;
    for (let i = 0; i < pasos.length; i++) {
      const p = pasos[i];
      if (p.el) p.el.classList.add('leyendo');
      if (p.antes) p.antes();
      if (p.partes) await Promise.race([Voz.decir(p.partes), esperar(T(4000))]);
      else await esperar(T(650));
      if (p.el) p.el.classList.remove('leyendo');
      if (!this.vivo(tk)) return;
      await esperar(T(120));
      if (!this.vivo(tk)) return;
    }
    if (cierre) await Voz.decir(cierre);
  },

  /* Tira de ayuda en la parte de arriba de la escena */
  tira(html) {
    const escena = $('#escena');
    let t = $('.pista-tira', escena);
    if (!t) {
      t = crear('div', 'pista-tira');
      escena.insertBefore(t, escena.firstChild);
    }
    t.innerHTML = html;
    Render.ajustar();
    return t;
  },

  /* Quita de la escena una opción incorrecta que aún esté disponible */
  quitarUna() {
    const q = Juego.reto;
    const vivas = $$('#p-juego .elegible').filter(b => !b.classList.contains('apagado') && !Juego.esCorrecta(b.dataset.valor, q));
    if (vivas.length > 1) {
      const b = elegir(vivas);
      b.classList.add('apagado');
      b.disabled = true;
    }
  }
};

/* ----- Motor del juego ----- */
const Juego = {
  mundo: 0,
  tipo: null,
  plan: [],
  i: 0,
  reto: null,
  estado: null,
  token: 0,          // cambia en cada pregunta: las pistas en marcha se detienen solas
  bloqueado: false,
  pausado: false,
  tInicio: 0,
  tPausa: 0,
  msPausa: 0,
  ultimoToque: 0,
  finInstruccion: 0,
  nivelAyuda: 0,
  relojAyuda: null,
  firmas: [],
  modo: 'nivel',     // 'nivel' | 'prueba' | 'palabras'

  /* Empieza un nivel de un mundo (o una lista de retos ya hecha, para la prueba inicial y las palabras) */
  empezar(mundoIdx, tipoId, op) {
    op = op || {};
    const p = Guardado.p;
    this.mundo = mundoIdx;
    this.tipo = TIPOS_NIVEL.find(t => t.id === tipoId) || { id: tipoId, retos: (op.plan || []).length, delta: 0, repaso: 0 };
    this.modo = op.modo || 'nivel';
    const plan = op.plan || planNivel(mundoIdx, tipoId);
    this.plan = plan.map(x => typeof x === 'string' ? { hab: x } : x);
    this.plan.forEach(x => {
      x.repaso = MUNDO_DE_HAB[x.hab] < mundoIdx && MUNDOS[mundoIdx].habs.indexOf(x.hab) < 0 && x.hab !== 'ciencia';
      if (x.dif === undefined) x.dif = difPara(x.hab, this.tipo.id, x.repaso);
    });
    this.i = -1;
    this.firmas = [];
    this.estado = { resultados: [], fallosSeguidos: 0, parecidas: 0, vistosNivel: {}, racha: 0, alFinal: op.alFinal || null, parar: op.parar || null };
    this.pausado = false;
    this.bloqueado = false;
    this.tInicio = Date.now();
    this.msPausa = 0;
    p.stats.partidas++;
    const m = MUNDOS[mundoIdx];
    $('#p-juego').style.setProperty('--tema', ASTROS[m.id] ? ASTROS[m.id].c2 : '#9B7BF7');
    $('#p-juego').dataset.tipo = this.tipo.id;
    Sonido.tema(m.musica);
    UI.mostrar('p-juego');
    this.pintarProgreso();
    this.vigilarAyuda();
    this.siguiente(true);
  },

  enTarea() {
    return UI.pantalla === 'p-juego' && !this.bloqueado && !this.pausado;
  },

  /* Depósito del cohete (o piezas de la gran misión): una celda por reto */
  pintarProgreso() {
    const cont = $('#combustible');
    const proyecto = this.tipo.id === 'proyecto';
    const icono = proyecto ? MUNDOS[this.mundo].proyecto.icono : null;
    let h = '<span class="tubo">';
    for (let i = 0; i < this.plan.length; i++) {
      const r = this.estado.resultados[i];
      const clase = r === undefined ? '' : (r ? ' llena' : ' llena ayuda');
      h += '<span class="celda-fuel' + clase + (proyecto ? ' pieza' : '') + '">' + (proyecto ? '<span class="emo">' + icono + '</span>' : SVG_ESTRELLA) + '</span>';
    }
    h += '</span><span class="cohete-mini emo">' + (proyecto ? icono : '🚀') + '</span>';
    cont.innerHTML = h;
    cont.classList.toggle('muchas', this.plan.length > 8);
    cont.classList.toggle('lleno', this.estado.resultados.length >= this.plan.length);
  },

  /* Siguiente reto del plan */
  siguiente(conIntro) {
    this.i++;
    if (this.i >= this.plan.length || (this.estado.parar && this.estado.parar(this.estado.resultados))) { this.terminar(); return; }
    this.token++;
    const tk = this.token;
    const paso = this.plan[this.i];
    const ctx = { mundo: this.mundo, tipo: this.tipo.id, nivel: this.i, pregunta: paso.pregunta };
    let q = null;
    for (let intento = 0; intento < 20; intento++) {
      q = crearReto(paso.hab, paso.dif, ctx);
      if (this.firmas.indexOf(q.firma) < 0) break;
    }
    q.hab = paso.hab;
    q.dif = paso.dif;
    this.firmas.push(q.firma);
    if (this.firmas.length > 12) this.firmas.shift();
    this.reto = q;
    this.estado.fallos = 0;
    this.estado.pista = false;
    this.estado.demo = false;
    this.bloqueado = false;
    this.nivelAyuda = 0;
    this.finInstruccion = Date.now() + 60000;   // hasta que acabe de hablar no cuenta la espera

    Render.limpiar();
    Mano.ocultar();
    $('#p-juego').classList.toggle('sin-respuestas', !!q.sinRespuestas);
    q.pintar($('#escena'), $('#respuestas'));
    Render.ajustar();
    requestAnimationFrame(() => Render.ajustar());
    setTimeout(() => Render.ajustar(), 120);
    UI.picto(PICTOS[paso.hab] || '');
    Voz.precargar((q.instr || []).concat(q.refuerzo || []));

    const p = Guardado.p;
    const intro = [];
    if (conIntro) {
      if (this.modo === 'nivel') {
        const m = MUNDOS[this.mundo];
        if (this.tipo.id === 'mision') intro.push('mision_' + m.mision.id);
        else if (this.tipo.id === 'proyecto') intro.push('proyecto_' + m.id);
        else if (m.id === 'sol' && this.tipo.id === 'practica') intro.push('nivel_repaso');
        else if (this.tipo.frase && this.tipo.id !== 'descubre') intro.push(this.tipo.frase);
      }
    }
    if (paso.parecida) intro.push('otra_parecida');
    // En "Aprende", la primera vez de cada habilidad Pipo enseña antes de preguntar
    const primeraVezNivel = !this.estado.vistosNivel[paso.hab];
    this.estado.vistosNivel[paso.hab] = true;
    const guiado = this.tipo.id === 'aprende' && primeraVezNivel;
    if (guiado && q.ensenar) intro.push.apply(intro, q.ensenar);

    Voz.instruccion = q.instr;
    const hablar = q.hablar ? q.hablar(tk, intro) : Voz.decir(intro.concat(q.instr || []), { instruccion: true });
    Promise.resolve(hablar).then(() => {
      if (tk !== this.token) return;
      Voz.instruccion = q.instr;
      this.finInstruccion = Date.now();
      const guia = q.demo || q.pista;
      if (guiado && guia && !q.sinGuia) {
        // Guiado: Pipo lo enseña primero (no cuenta como ayuda) y luego lo hace el niño
        Promise.resolve(guia.call(q, tk, true)).then(() => { if (tk === this.token) { this.finInstruccion = Date.now(); if (q.foco) Mano.señalar(q.foco(), { vueltas: 1 }); } });
      } else if (!p.vistos[paso.hab] && q.foco) {
        Mano.señalar(q.foco(), { vueltas: 1 });
      }
      if (!p.vistos[paso.hab]) { p.vistos[paso.hab] = true; Guardado.guardarLuego(); }
    });
  },

  /* ----- Ayuda si el niño se queda parado ----- */
  vigilarAyuda() {
    clearInterval(this.relojAyuda);
    this.relojAyuda = setInterval(() => this.revisarAyuda(), 1000);
  },

  revisarAyuda() {
    if (UI.pantalla !== 'p-juego') { clearInterval(this.relojAyuda); return; }
    if (!Guardado.datos.ajustes.ayudas || this.bloqueado || this.pausado || Pistas.contando) return;
    if (Voz.fuentes.length || Voz.finActual) return;
    const q = this.reto;
    if (!q) return;
    const quieto = Date.now() - Math.max(this.ultimoToque, this.finInstruccion);
    if (quieto < ESPERA_AYUDA_MS + this.nivelAyuda * 5000) return;
    this.nivelAyuda++;
    this.finInstruccion = Date.now() + 2000;
    const tk = this.token;
    if (this.nivelAyuda === 1) {
      Voz.decir(q.instr, { lento: true }).then(() => { if (tk === this.token) this.finInstruccion = Date.now(); });
      if (q.foco) Mano.señalar(q.foco(), { vueltas: 1 });
    } else if (this.nivelAyuda === 2 && q.pista && !this.tipo.menosAyuda) {
      Guardado.p.stats.ayudas++;
      this.estado.pista = true;
      Promise.resolve(q.pista(tk, true)).then(() => { if (tk === this.token) this.finInstruccion = Date.now(); });
    }
  },

  /* Botón 🔊: repite la consigna y señala dónde mirar */
  repetir() {
    const q = this.reto;
    if (UI.pantalla === 'p-juego' && q && !this.bloqueado) {
      this.ultimoToque = Date.now();
      if (q.alRepetir) { q.alRepetir(); return; }
      Voz.repetir();
      if (q.foco) Mano.señalar(q.foco(), { vueltas: 1 });
      return;
    }
    Voz.repetir();
  },

  /* ¿Es correcto este valor? (admite varias respuestas válidas) */
  esCorrecta(valor, q) {
    q = q || this.reto;
    if (!q) return false;
    if (q.validar) return !!q.validar(valor);
    return String(valor) === String(q.respuesta);
  },

  responder(valor, boton) {
    if (this.bloqueado || this.pausado) return;
    const q = this.reto;
    this.ultimoToque = Date.now();
    if (q.antesDeResponder && !q.antesDeResponder()) return;
    if (this.esCorrecta(valor, q)) this.acierto(boton);
    else this.fallo(boton);
  },

  acierto(boton) {
    if (this.bloqueado) return;
    this.bloqueado = true;
    this.token++;
    const tk = this.token;
    Mano.ocultar();
    const e = this.estado;
    const q = this.reto;
    const p = Guardado.p;
    const primera = e.fallos === 0 && !e.pista;

    p.stats.aciertos++;
    p.stats.intentos++;
    let sube = null;
    if (this.modo !== 'prueba') sube = Guardado.registrarIntento(q.hab, primera);
    if (primera) {
      p.stats.primera++;
      p.stats.racha++;
      e.racha++;
      p.stats.mejorRacha = Math.max(p.stats.mejorRacha, p.stats.racha);
      e.fallosSeguidos = 0;
      Misiones.sumar('primera5', 1);
    } else {
      p.stats.racha = 0;
      e.racha = 0;
      e.fallosSeguidos++;
    }
    if (this.modo === 'nivel') p.estrellas += ESTRELLAS_ACIERTO;
    e.resultados.push(primera);
    Guardado.guardar();

    // Celebración inmediata (corta)
    $$('#p-juego .elegible.guiado').forEach(b => b.classList.remove('guiado'));
    if (boton) boton.classList.add('correcto');
    Sonido.efecto('acierto');
    Mascota.animar('feliz');
    const c = UI.centro(boton || $('#escena'));
    Confeti.lanzar(c.x, c.y, primera ? 30 : 18, false);
    const hueco = $$('#combustible .celda-fuel')[e.resultados.length - 1];
    UI.estrellaVuela(boton || $('#escena'), hueco, () => {
      if (hueco) { hueco.classList.add('llena'); if (!primera) hueco.classList.add('ayuda'); }
      if (e.resultados.length >= this.plan.length) $('#combustible').classList.add('lleno');
      Sonido.efecto('estrella');
      UI.actualizarEstrellas();
    });

    // Refuerzo: ánimo + la respuesta dicha en voz alta
    let partes;
    if (!primera) partes = ['asi_se_aprende'];
    else if (e.racha === 5) partes = ['racha5'];
    else if (e.racha === 3) partes = ['racha3'];
    else partes = [elegir(q.elogios || ELOGIOS)];
    partes = partes.concat(q.refuerzo || []);
    if (this.tipo.id === 'proyecto' && e.resultados.length % 3 === 0 && e.resultados.length < this.plan.length) partes.push('pieza_lista');
    if (sube === 'sube' && this.modo === 'nivel') partes.push('reto');
    Logros.comprobar();
    if (q.alAcertar) q.alAcertar();

    const habla = Promise.race([Voz.decir(partes), esperar(T(8000))]);
    Promise.all([habla, esperar(T(1100))]).then(() => {
      if (tk !== this.token || this.pausado) return;
      this.avanzar();
    });
  },

  /* Tras un reto: ¿hace falta un momento de calma? */
  avanzar() {
    const e = this.estado;
    if (e.fallosSeguidos >= 3 && this.i + 1 < this.plan.length && this.modo === 'nivel') {
      e.fallosSeguidos = 0;
      Calma.abrir();
      return;
    }
    this.siguiente(false);
  },

  /* Baja un grado la dificultad del resto del nivel */
  facilitar() {
    for (let k = this.i + 1; k < this.plan.length; k++) {
      const x = this.plan[k];
      x.dif = Math.max(0, x.dif - 1);
      Guardado.bajarDif(x.hab);
    }
    Guardado.guardar();
  },

  /* Un error: nunca se pierde nada. op.sinApagar: no se apaga el elemento (acciones); op.pista: ayuda propia */
  fallo(boton, op) {
    op = op || {};
    const e = this.estado;
    const q = this.reto;
    const p = Guardado.p;
    e.fallos++;
    p.stats.racha = 0;
    e.racha = 0;
    p.stats.intentos++;
    if (e.fallos === 1 && this.modo !== 'prueba') Guardado.bajarDif(q.hab);
    Guardado.guardar();

    if (boton && !op.sinApagar) {
      boton.classList.add('apagado');
      boton.disabled = true;
    }
    Sonido.efecto('suave');
    Mascota.animar('pensar');
    Mano.ocultar();
    this.nivelAyuda = 2;   // ya hay ayuda: la espera no repite lo mismo

    if (this.modo === 'prueba') {
      // En la prueba inicial no se dan pistas: se apunta y se sigue
      this.bloqueado = true;
      this.token++;
      const tk = this.token;
      e.resultados.push(false);
      Voz.decir(['no_pasa_nada']).then(() => { if (tk === this.token) this.siguiente(false); });
      return;
    }

    this.token++;
    const tk = this.token;
    const fin = () => { if (tk === this.token) this.finInstruccion = Date.now(); };
    const vivas = $$('#p-juego .elegible').filter(b => !b.classList.contains('apagado'));
    const limiteDemo = this.tipo.menosAyuda ? 2 : 3;
    if (e.fallos >= limiteDemo || (vivas.length <= 1 && !q.accion)) {
      this.demostrar(tk).then(fin);
    } else if (e.fallos === 1) {
      // 1.ª ayuda: ánimo y repetir la consigna más despacio
      const animo = op.pista ? null : [elegir(ANIMOS)];
      const r = op.pista ? Promise.resolve(op.pista(tk)) : Voz.decir(animo).then(() => (tk === this.token ? Voz.decir(q.instr || [], { lento: true }) : null));
      Promise.resolve(r).then(() => { if (tk === this.token && q.foco) Mano.señalar(q.foco(), { vueltas: 1 }); fin(); });
    } else {
      // 2.ª ayuda: pista visual
      e.pista = true;
      p.stats.ayudas++;
      if (q.pista) Promise.resolve(q.pista(tk)).then(fin);
      else Voz.decir([elegir(ANIMOS)]).then(fin);
    }
  },

  /* 3.ª ayuda: demostración resuelta y, luego, una pregunta parecida */
  demostrar(tk) {
    const e = this.estado;
    const q = this.reto;
    e.demo = true;
    e.pista = true;
    Guardado.p.stats.demos++;
    if (e.parecidas < MAX_PARECIDAS && this.modo === 'nivel' && q.hab !== 'ciencia') {
      e.parecidas++;
      this.plan.splice(this.i + 1, 0, { hab: q.hab, dif: Math.max(0, q.dif - 1), parecida: true, repaso: false });
      this.pintarProgreso();
    }
    const hecho = q.demo ? Promise.resolve(q.demo(tk)) :
      Voz.decir(['mira_como'].concat(q.explica || [])).then(() => { if (tk === this.token) this.guiar(); });
    return hecho.then(() => {
      if (tk !== this.token) return null;
      this.guiar();
      return Voz.decir(q.accion ? ['ahora_tu'] : ['es_este']);
    });
  },

  /* Resalta la respuesta correcta con un brillo suave */
  guiar() {
    const q = this.reto;
    if (q.guiar) { q.guiar(); return; }
    let marcado = false;
    $$('#p-juego .elegible').forEach(b => {
      if (!marcado && this.esCorrecta(b.dataset.valor, q)) { b.classList.add('guiado'); b.disabled = false; b.classList.remove('apagado'); marcado = true; }
      else if (!b.classList.contains('apagado')) { b.classList.add('apagado'); b.disabled = true; }
    });
  },

  terminar() {
    this.bloqueado = true;
    clearInterval(this.relojAyuda);
    Voz.instruccion = null;
    const ms = Math.min(Date.now() - this.tInicio - this.msPausa, 15 * 60000);
    Sesion.ms += Math.max(0, ms);
    const p = Guardado.p;
    p.stats.minutos += Math.max(0, ms) / 60000;
    const res = this.estado.resultados;
    Guardado.guardar();
    if (this.estado.alFinal) { this.estado.alFinal(res); return; }
    Premios.finNivel(this.mundo, this.tipo.id, res);
  },

  pausar(silencio) {
    if (this.pausado || UI.pantalla !== 'p-juego') return;
    this.pausado = true;
    this.tPausa = Date.now();
    this.token++;
    Voz.callar();
    Mano.ocultar();
    Pausa.abrir(silencio);
  },

  reanudar() {
    if (!this.pausado) return;
    this.pausado = false;
    this.msPausa += Date.now() - this.tPausa;
    if (this.bloqueado) {
      this.token++;
      this.avanzar();
      return;
    }
    this.token++;
    this.nivelAyuda = 0;
    const tk = this.token;
    const q = this.reto;
    if (q.alReanudar) { q.alReanudar(tk); return; }
    Voz.decir(q.instr || []).then(() => { if (tk === this.token) this.finInstruccion = Date.now(); });
  },

  /* Salir a mitad de nivel (desde la pausa): no se pierde lo ganado */
  salir() {
    this.pausado = false;
    this.token++;
    this.bloqueado = true;
    clearInterval(this.relojAyuda);
    Voz.callar();
    const ms = Math.min(Date.now() - this.tInicio - this.msPausa, 15 * 60000);
    Sesion.ms += Math.max(0, ms);
    Guardado.p.stats.minutos += Math.max(0, ms) / 60000;
    Guardado.guardar();
    if (this.modo === 'nivel' || this.modo === 'palabras') Mundo.abrir(this.mundo);
    else Mapa.abrir();
  }
};

/* Capa de calma: respirar juntos o pasar a algo más fácil */
const Calma = {
  abrir() {
    Mano.ocultar();
    const capa = $('#c-calma');
    capa.hidden = false;
    $('#calmaCirculo').classList.remove('respirando');
    $('#calmaBotones').hidden = false;
    Mascota.actualizarTodas();
    Voz.decir(['respira_propuesta']);
  },
  async respirar() {
    $('#calmaBotones').hidden = true;
    const circulo = $('#calmaCirculo');
    circulo.classList.add('respirando');
    for (let k = 0; k < 2; k++) {
      await Promise.all([Voz.decir(['respira_in']), esperar(T(2600))]);
      await Promise.all([Voz.decir(['respira_out']), esperar(T(2600))]);
    }
    circulo.classList.remove('respirando');
    Guardado.p.stats.respiros = (Guardado.p.stats.respiros || 0) + 1;
    Juego.facilitar();
    await Voz.decir(['respira_bien']);
    this.cerrar();
  },
  facil() {
    Juego.facilitar();
    Voz.decir(['mas_facil']);
    this.cerrar();
  },
  cerrar() {
    $('#c-calma').hidden = true;
    Logros.comprobar();
    Juego.siguiente(false);
  }
};
