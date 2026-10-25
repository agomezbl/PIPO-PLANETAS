/* =================== SATURNO =================== */

/* ----- La mitad: repartir entre dos ----- */
ACTIVIDADES.mitad = function (dif) {
  const n = 2 * [azar(1, 3), azar(2, 6), azar(3, 10)][dif];
  const m = n / 2;
  const opciones = opcionesCercanas(m, 1, 10, 3);
  const explica = ['la_mitad_de', N(n), 'es', N(m)];
  const repartir = async (tk, intro, cierre) => {
    Pistas.contando = true;
    try {
      await Voz.decir(intro);
      const galletas = $$('#escena .mi-pila .obj');
      const platos = $$('#escena .mi-plato .rejilla');
      for (let i = 0; i < galletas.length; i++) {
        if (tk !== Juego.token) return;
        platos[i % 2].appendChild(galletas[i]);
        Sonido.efecto('soltar');
        Render.ajustar();
        await esperar(T(REDUCIR_MOVIMIENTO ? 80 : 330));
      }
      if (tk === Juego.token) await Voz.decir(cierre);
    } finally { Pistas.contando = false; }
  };
  return {
    firma: 'mi' + n,
    respuesta: m,
    opciones: opciones,
    rango: [1, 10],
    instr: ['reparte_dos', 'cuanto_mitad'],
    refuerzo: explica,
    explica: explica,
    pintar(esc, resp) {
      const caja = crear('div', 'mitad-esc');
      const pila = crear('div', 'mi-pila');
      pila.appendChild(Render.rejilla(Array(n).fill('🍪'), { contable: false, max: 70 }));
      caja.appendChild(pila);
      const platos = crear('div', 'mi-platos');
      ['🧑‍🚀', '👩‍🚀'].forEach(a => {
        const p = crear('div', 'mi-plato', '<span class="emo mi-quien">' + a + '</span>');
        const r = crear('div', 'rejilla');
        r.dataset.ajustar = 'rejilla';
        r.dataset.max = 56;
        r.dataset.n = 10;
        p.appendChild(r);
        platos.appendChild(p);
      });
      caja.appendChild(platos);
      esc.appendChild(caja);
      botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .mi-pila'), $('#escena .mi-platos'), $('#respuestas')]; },
    pista(tk) { return repartir(tk, ['reparte_dos'], ['cuanto_mitad']); },
    demo(tk) { return repartir(tk, ['mira_como'], explica); }
  };
};

/* ----- Repartir en partes iguales ----- */
ACTIVIDADES.repartir = function (dif) {
  const K = [2, azar(2, 3), azar(2, 4)][dif];
  const cada = [azar(2, 3), azar(2, 4), azar(2, 5)][dif];
  const n = K * cada;
  const opciones = opcionesCercanas(cada, 1, 10, 3);
  let fase = 'repartir', avisado = false, platos = [], pila = null;
  const ASTRO = ['🧑‍🚀', '👩‍🚀', '👨‍🚀', '🤖'];
  const q = {
    firma: 'rp' + n + '/' + K,
    respuesta: cada,
    opciones: opciones,
    rango: [1, 10],
    accion: true,
    instr: ['reparte', 'una_cada'],
    refuerzo: [N(cada)],
    explica: ['una_cada', 'cuantas_cada', N(cada)],
    antesDeResponder() { return fase === 'contar'; },
    pintar(esc, resp) {
      const caja = crear('div', 'repartir-esc');
      pila = crear('div', 'rp-pila');
      const rp = crear('div', 'rejilla');
      rp.dataset.ajustar = 'rejilla';
      rp.dataset.max = 64;
      rp.dataset.n = n;
      for (let i = 0; i < n; i++) rp.appendChild(crear('span', 'obj rp-galleta', '<span class="obj-e">🍪</span><span class="obj-num"></span>'));
      pila.appendChild(rp);
      caja.appendChild(pila);
      const fila = crear('div', 'rp-platos');
      platos = [];
      for (let k = 0; k < K; k++) {
        const p = crear('button', 'rp-plato', '<span class="emo rp-quien">' + ASTRO[k] + '</span>');
        p.type = 'button';
        p.setAttribute('aria-label', 'Plato ' + (k + 1));
        const r = crear('div', 'rejilla');
        r.dataset.ajustar = 'rejilla';
        r.dataset.max = 48;
        r.dataset.n = 6;
        p.appendChild(r);
        p.addEventListener('click', ev => { if (ev.target.closest('.rp-galleta')) return; q.dar(k); });
        fila.appendChild(p);
        platos.push(r);
      }
      caja.appendChild(fila);
      esc.appendChild(caja);
      resp.classList.add('oculta');
      botonesNumero(resp, opciones);
    },
    enPila() { return $$('.rp-galleta', pila); },
    dar(k) {
      if (Juego.bloqueado || Juego.pausado || fase !== 'repartir') return;
      const g = q.enPila()[0];
      if (!g) return;
      Juego.ultimoToque = Date.now();
      platos[k].appendChild(g);
      g.addEventListener('click', () => q.devolver(g), { once: true });
      Sonido.efecto('soltar');
      Render.ajustar();
      if (!q.enPila().length) q.revisar();
    },
    devolver(g) {
      if (Juego.bloqueado || fase !== 'repartir') return;
      $('.rejilla', pila).appendChild(g);
      Sonido.efecto('coger');
      Render.ajustar();
    },
    revisar() {
      const cuentas = platos.map(p => $$('.rp-galleta', p).length);
      if (cuentas.every(c => c === cada)) {
        fase = 'contar';
        $('#respuestas').classList.remove('oculta');
        q.instr = ['cuantas_cada'];
        Voz.instruccion = q.instr;
        Juego.nivelAyuda = 0;
        const tk = Juego.token;
        Juego.finInstruccion = Date.now() + 60000;
        Voz.decir(['cuantas_cada']).then(() => { if (tk === Juego.token) Juego.finInstruccion = Date.now(); });
        return;
      }
      if (!avisado) { avisado = true; Juego.fallo(null, { sinApagar: true, pista: () => Voz.decir(['todos_igual']) }); }
      else { Sonido.efecto('suave'); Voz.decir(['todos_igual']); }
    },
    foco() { return fase === 'repartir' ? [pila].concat($$('#escena .rp-plato')) : [$('#respuestas')]; },
    pista(tk) {
      if (fase === 'repartir') return Voz.decir(['una_cada']).then(() => { if (tk === Juego.token) Mano.señalar($$('#escena .rp-plato'), { vueltas: 1 }); });
      return Pistas.contar(tk, $$('.rp-galleta', platos[0]), { intro: ['fijate'], cierre: ['cuantas_cada'] });
    },
    async demo(tk) {
      await Voz.decir(['mira_como']);
      if (fase === 'repartir') {
        $$('.rp-galleta', $('#escena')).forEach(g => $('.rejilla', pila).appendChild(g));
        for (let i = 0; i < n; i++) {
          if (tk !== Juego.token) return;
          platos[i % K].appendChild(q.enPila()[0]);
          Sonido.efecto('soltar');
          Render.ajustar();
          await esperar(T(REDUCIR_MOVIMIENTO ? 60 : 300));
        }
        q.revisar();
      }
      if (tk === Juego.token) await Pistas.contar(tk, $$('.rp-galleta', platos[0]), { intro: null, cierre: ['cuantas_cada'] });
    },
    guiar() {
      if (fase === 'repartir') $$('#escena .rp-plato').forEach(p => p.classList.add('guiado'));
      else $$('#respuestas .elegible').forEach(b => { if (Number(b.dataset.valor) === cada) b.classList.add('guiado'); else { b.classList.add('apagado'); b.disabled = true; } });
    },
    resolverPrueba() {
      $$('.rp-galleta', $('#escena')).forEach(g => $('.rejilla', pila).appendChild(g));
      for (let i = 0; i < n; i++) q.dar(i % K);
      setTimeout(() => { const b = $$('#respuestas .elegible').find(x => Number(x.dataset.valor) === cada); if (b) b.click(); }, 60);
    }
  };
  return q;
};

/* ----- Cuerpos geométricos ----- */
function cuerpoSVG(id, color) {
  const c = color || '#3FB2F2';
  const osc = tono(c, -0.25), cl = tono(c, 0.35);
  switch (id) {
    case 'esfera': {
      const g = idSVG('cg');
      return '<svg class="cuerpo3d" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="' + g + '" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="' + cl + '"/><stop offset="1" stop-color="' + osc + '"/></radialGradient></defs><circle cx="50" cy="52" r="38" fill="url(#' + g + ')"/><ellipse cx="50" cy="52" rx="38" ry="11" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/></svg>';
    }
    case 'cubo':
      return '<svg class="cuerpo3d" viewBox="0 0 100 100" aria-hidden="true"><path d="M22 34 L54 22 L82 32 L50 44 Z" fill="' + cl + '" stroke="' + osc + '" stroke-width="2.5" stroke-linejoin="round"/><path d="M22 34 L50 44 L50 84 L22 72 Z" fill="' + c + '" stroke="' + osc + '" stroke-width="2.5" stroke-linejoin="round"/><path d="M50 44 L82 32 L82 72 L50 84 Z" fill="' + osc + '" stroke="' + osc + '" stroke-width="2.5" stroke-linejoin="round"/></svg>';
    case 'cilindro':
      return '<svg class="cuerpo3d" viewBox="0 0 100 100" aria-hidden="true"><path d="M24 26 L24 74 A26 9 0 0 0 76 74 L76 26 Z" fill="' + c + '" stroke="' + osc + '" stroke-width="2.5"/><path d="M24 26 L24 74 A26 9 0 0 0 50 83 L50 35 A26 9 0 0 1 24 26 Z" fill="' + cl + '" opacity=".5"/><ellipse cx="50" cy="26" rx="26" ry="9" fill="' + cl + '" stroke="' + osc + '" stroke-width="2.5"/></svg>';
    case 'cono':
      return '<svg class="cuerpo3d" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 12 L78 76 A28 9 0 0 1 22 76 Z" fill="' + c + '" stroke="' + osc + '" stroke-width="2.5" stroke-linejoin="round"/><path d="M50 12 L22 76 A28 9 0 0 0 46 84.5 Z" fill="' + cl + '" opacity=".5"/><path d="M22 76 A28 9 0 0 0 78 76" fill="none" stroke="' + osc + '" stroke-width="2.5"/></svg>';
    case 'piramide':
      return '<svg class="cuerpo3d" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 14 L18 70 L48 84 Z" fill="' + cl + '" stroke="' + osc + '" stroke-width="2.5" stroke-linejoin="round"/><path d="M50 14 L48 84 L84 68 Z" fill="' + c + '" stroke="' + osc + '" stroke-width="2.5" stroke-linejoin="round"/></svg>';
    default: return '';
  }
}
const CUERPOS = ['esfera', 'cubo', 'cilindro', 'cono', 'piramide'];
const OBJETOS_CUERPO = { esfera: ['⚽', '🏀', '🍊', '🌍'], cubo: ['🎲', '🧊'], cilindro: ['🥫', '🧻', '🔋'], cono: ['🍦'] };
ACTIVIDADES.cuerpos = function (dif) {
  const modo = dif === 1 ? 'objeto' : 'toca';
  const pool = modo === 'objeto' ? Object.keys(OBJETOS_CUERPO) : (dif === 0 ? ['esfera', 'cubo', 'cilindro', 'cono'] : CUERPOS);
  const elegidos = barajar(pool).slice(0, 3);
  const obj = elegidos[0];
  const opciones = barajar(elegidos);
  const colores = barajar(COLORES_FORMA);
  const real = modo === 'objeto' ? elegir(OBJETOS_CUERPO[obj]) : null;
  const instr = modo === 'objeto' ? ['que_forma'] : ['toca_' + obj];
  return {
    firma: 'cu' + modo + obj + opciones.join('') + (real || ''),
    respuesta: obj,
    opciones: opciones,
    sinRespuestas: modo === 'toca',
    instr: instr,
    refuerzo: [obj + '_es'],
    explica: [obj + '_es'],
    pintar(esc, resp) {
      const zona = crear('div', 'zona');
      if (modo === 'objeto') {
        zona.appendChild(crear('div', 'objeto-real emo', real));
        opciones.forEach((f, i) => resp.appendChild(Render.botonEmoji(f, cuerpoSVG(f, colores[i]), f)));
      } else {
        const c = Render.cartas(1, 230);
        opciones.forEach((f, i) => c.appendChild(Render.carta(f, cuerpoSVG(f, colores[i]), f)));
        zona.appendChild(c);
      }
      esc.appendChild(zona);
    },
    foco() { return [modo === 'objeto' ? $('#escena .objeto-real') : $('#escena .cartas'), $('#respuestas')]; },
    pista() { Pistas.quitarUna(); return Voz.decir([obj + '_es'].concat(instr)); }
  };
};

/* ----- Simetría: ¿qué mitad completa el dibujo? ----- */
ACTIVIDADES.simetria = function (dif) {
  const filas = dif === 0 ? 3 : 4, cols = dif === 0 ? 2 : 3;
  const paleta = ['#FF5DA2', '#3FB2F2', '#FFC93C', '#2FD18E', '#9B7BF7'].slice(0, dif === 2 ? 4 : 2);
  const crearMitad = () => rango(1, filas).map(() => rango(1, cols).map(() => (rnd() < 0.55 ? elegir(paleta) : null)));
  const espejo = m => m.map(f => f.slice().reverse());
  const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  let izq;
  do { izq = crearMitad(); } while (igual(izq, espejo(izq)) || izq.flat().filter(Boolean).length < 3);
  const correcta = espejo(izq);
  const candidatas = [correcta, izq];
  let intento = 0;
  while (candidatas.length < 3 && intento++ < 50) {
    const otra = correcta.map(f => f.slice());
    const r = azar(0, filas - 1), c = azar(0, cols - 1);
    otra[r][c] = otra[r][c] ? null : elegir(paleta);
    if (!candidatas.some(x => igual(x, otra))) candidatas.push(otra);
  }
  const orden = barajar([0, 1, 2]);
  const rejHTML = (m, clase) => '<div class="sim-rej ' + (clase || '') + '" style="--cols:' + cols + ';--filas:' + filas + '">' +
    m.map(f => f.map(c => '<i' + (c ? ' style="background:' + c + '"' : '') + '></i>').join('')).join('') + '</div>';
  return {
    firma: 'si' + JSON.stringify(izq),
    respuesta: 'm0',
    opciones: orden.map(i => 'm' + i),
    sinRespuestas: false,
    instr: ['simetria_q'],
    refuerzo: ['como_espejo'],
    ensenar: ['como_espejo'],
    explica: ['como_espejo'],
    pintar(esc, resp) {
      const C = 64;
      const lz = lienzo(2 * cols * C + 40, filas * C + 8, 'simetria');
      lz.l.style.setProperty('--celda', C + 'px');
      lz.l.innerHTML = rejHTML(izq, 'izq') + '<div class="sim-eje"></div><div class="sim-hueco" style="--cols:' + cols + ';--filas:' + filas + '"><span>?</span></div>';
      esc.appendChild(lz.zona);
      orden.forEach(i => resp.appendChild(Render.botonEmoji('m' + i, rejHTML(candidatas[i], 'mini'), 'opción')));
    },
    foco() { return [$('#escena .sim-eje'), $('#respuestas')]; },
    pista() {
      $('#escena .simetria').classList.add('con-espejo');
      Pistas.quitarUna();
      return Voz.decir(['como_espejo', 'simetria_q']);
    }
  };
};

/* =================== URANO =================== */

/* ----- Sumas y restas de dos cifras (sin llevar) ----- */
function genDosCifras(dif, resta) {
  let a, b;
  for (let k = 0; k < 200; k++) {
    if (dif === 0) { a = 10 * azar(1, 8); b = 10 * azar(1, 9 - a / 10); if (resta) { a = 10 * azar(2, 9); b = 10 * azar(1, a / 10 - 1); } }
    else if (dif === 1) { a = azar(11, 89); b = azar(1, 9); }
    else { a = azar(21, 98); b = azar(11, 88); }
    const da = Math.floor(a / 10), ua = a % 10, db = Math.floor(b / 10), ub = b % 10;
    if (!resta && ua + ub <= 9 && da + db <= 9 && a + b <= 99) break;
    if (resta && ua >= ub && da >= db && a - b >= 1) break;
  }
  const r = resta ? a - b : a + b;
  const da = Math.floor(a / 10), ua = a % 10, db = Math.floor(b / 10), ub = b % 10;
  const sd = resta ? da - db : da + db, su = resta ? ua - ub : ua + ub;
  const op = resta ? 'menos' : 'mas';
  const explica = [N(da * 10), op, N(db * 10), sonEs(sd * 10), N(sd * 10)]
    .concat(ua || ub ? [N(ua), op, N(ub), sonEs(su), N(su)] : [], ['en_total', N(r)]);
  const opciones = opcionesDosCifras(r, 0, 99, 3);
  const q = {
    firma: (resta ? 'rd' : 'sd') + a + '-' + b,
    respuesta: r,
    opciones: opciones,
    rango: [0, 99],
    instr: [N(a), op, N(b), 'cuanto_es'],
    refuerzo: [N(a), op, N(b), sonEs(r), N(r)],
    ensenar: ['primero_decenas'],
    explica: explica,
    pintar(esc, resp) {
      const lz = lienzo(520, 250, 'dos-cifras');
      lz.l.innerHTML = '<div class="dc-num">' + bloquesHTML(da, ua) + '<b>' + a + '</b></div><div class="dc-op">' + (resta ? '−' : '+') + '</div><div class="dc-num">' + bloquesHTML(db, ub) + '<b>' + b + '</b></div>';
      esc.appendChild(lz.zona);
      esc.appendChild(Render.ecuacion([a, resta ? '−' : '+', b, '=', '?']));
      botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .dos-cifras'), $('#respuestas')]; },
    pista() {
      Pistas.tira('<span class="tira-dec">' + (da * 10) + (resta ? ' − ' : ' + ') + (db * 10) + ' = ' + (sd * 10) + '</span><span class="tira-uni">' + ua + (resta ? ' − ' : ' + ') + ub + ' = ' + su + '</span>');
      Pistas.quitarUna();
      return Voz.decir(['primero_decenas']);
    }
  };
  if (dif === 2) {
    const base = q;
    return conTeclado(Object.assign(base, { opciones: undefined, foco() { return [$('#escena .teclado')]; } }), r);
  }
  return q;
}
ACTIVIDADES.sumaDecenas = function (dif) { return genDosCifras(dif, false); };
ACTIVIDADES.restaDecenas = function (dif) { return genDosCifras(dif, true); };

/* ----- El cambio: ¿cuánto te devuelven? ----- */
ACTIVIDADES.cambio = function (dif) {
  const pagas = [5, 10, 20][dif];
  const precio = azar(dif === 2 ? 5 : 1, pagas - 1);
  const c = pagas - precio;
  const cosa = elegir(COSAS_TIENDA);
  const opciones = opcionesCercanas(c, 1, 19, 3);
  const instr = ['cuesta'].concat(eurosDe(precio), ['pagas_con'], eurosDe(pagas), ['cuanto_devuelven']);
  const subir = (tk, intro, cierre) => {
    const marca = v => $('#escena .marca[data-v="' + v + '"]');
    const pasos = [];
    for (let v = precio + 1; v <= pagas; v++) pasos.push({ el: marca(v), partes: [N(v - precio)], antes: (vv => () => { const m = marca(vv); if (m) m.classList.add('saltado'); })(v) });
    Pistas.contando = true;
    return Pistas.leer(tk, pasos, cierre, intro).then(() => { Pistas.contando = false; }, () => { Pistas.contando = false; });
  };
  return {
    firma: 'cb' + precio + '/' + pagas,
    respuesta: c,
    opciones: opciones,
    rango: [1, 19],
    instr: instr,
    refuerzo: [N(pagas), 'menos', N(precio), sonEs(c), N(c)],
    explica: ['contamos_desde', N(pagas), 'menos', N(precio), sonEs(c), N(c)],
    pintar(esc, resp) {
      const t = crear('div', 'tienda-esc cambio');
      t.innerHTML = '<div class="producto"><span class="emo">' + cosa + '</span><span class="etiqueta-precio">' + precio + ' €</span></div>' +
        '<div class="pago"><span class="pieza-dinero">' + dineroSVG(pagas) + '</span></div><div class="devuelta"><span class="emo">🪙</span><span class="q">?</span></div>';
      esc.appendChild(t);
      const lz = lienzoRecta(precio, pagas, precio, false);
      lz.zona.classList.add('recta-cambio');
      lz.zona.hidden = true;
      esc.appendChild(lz.zona);
      botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .etiqueta-precio'), $('#escena .pago'), $('#respuestas')]; },
    pista(tk) { const z = $('#escena .recta-cambio'); z.hidden = false; Render.ajustar(); return subir(tk, ['contamos_desde'], ['cuanto_devuelven']); },
    demo(tk) { const z = $('#escena .recta-cambio'); z.hidden = false; Render.ajustar(); return subir(tk, ['mira_como'], [N(pagas), 'menos', N(precio), sonEs(c), N(c)]); }
  };
};

/* ----- Gráficas y pictogramas ----- */
ACTIVIDADES.grafica = function (dif) {
  const cats = barajar(OBJETOS).slice(0, dif === 0 ? 3 : 4);
  const maxV = dif === 2 ? 10 : 8;
  let vals;
  do { vals = cats.map(() => azar(1, maxV)); } while (new Set(vals).size < vals.length);
  let modo, resp, instr, opciones, refuerzo;
  if (dif === 0) {
    modo = elegir(['mas', 'menos']);
    const v = modo === 'mas' ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
    resp = cats[vals.indexOf(v)].id;
    instr = [modo === 'mas' ? 'de_que_mas' : 'de_que_menos'];
    opciones = cats.map(c => c.id);
    refuerzo = [N(v)];
  } else if (dif === 1) {
    modo = 'cuantos';
    const i = azar(0, cats.length - 1);
    resp = vals[i];
    instr = ['cuantos_' + cats[i].id];
    opciones = opcionesCercanas(resp, 1, 10, 3);
    refuerzo = [N(resp)];
  } else {
    modo = 'diferencia';
    const mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals);
    resp = mx - mn;
    instr = ['cuantos_mas_barra'];
    opciones = opcionesCercanas(resp, 1, 10, 3);
    refuerzo = [N(mx), 'menos', N(mn), sonEs(resp), N(resp)];
  }
  const barras = dif > 0;
  return {
    firma: 'gr' + modo + vals.join('') + cats.map(c => c.id).join(''),
    respuesta: resp,
    opciones: opciones,
    rango: [0, 10],
    instr: instr,
    refuerzo: refuerzo,
    explica: refuerzo,
    pintar(esc, respC) {
      const lz = lienzo(cats.length * 100 + 60, 330, 'grafica');
      let h = '<div class="gr-ejes">';
      for (let v = 1; v <= maxV; v++) h += '<span class="gr-linea" style="bottom:' + (40 + v * 28) + 'px"><b>' + (barras ? v : '') + '</b></span>';
      h += '</div>';
      cats.forEach((c, i) => {
        const x = 60 + i * 100;
        h += '<div class="gr-col" data-cat="' + c.id + '" style="left:' + x + 'px">';
        if (barras) h += '<div class="gr-barra" style="height:' + (vals[i] * 28) + 'px;background:' + COLORES_FORMA[i % COLORES_FORMA.length] + '"></div>';
        else h += '<div class="gr-picto">' + rango(1, vals[i]).map(() => '<span class="emo">' + c.e + '</span>').join('') + '</div>';
        h += '<span class="gr-cat emo">' + c.e + '</span></div>';
      });
      lz.l.innerHTML = h;
      esc.appendChild(lz.zona);
      if (modo === 'mas' || modo === 'menos') cats.forEach(c => respC.appendChild(Render.botonEmoji(c.id, c.e, c.id)));
      else botonesNumero(respC, opciones);
      if (modo === 'cuantos') {
        const col = $('.gr-col[data-cat="' + instr[0].replace('cuantos_', '') + '"]', lz.l);
        if (col) col.classList.add('marcada');
      }
    },
    foco() { return [$('#escena .grafica'), $('#respuestas')]; },
    pista() {
      $('#escena .grafica').classList.add('con-valores');
      $$('#escena .gr-col').forEach((col, i) => col.insertAdjacentHTML('beforeend', '<span class="gr-valor">' + vals[i] + '</span>'));
      Pistas.quitarUna();
      return Voz.decir(instr);
    }
  };
};

/* ----- La balanza ----- */
const COSAS_PESO = [{ e: '🪶', p: 1 }, { e: '🍓', p: 2 }, { e: '🍎', p: 3 }, { e: '🥥', p: 5 }, { e: '🍉', p: 8 }, { e: '🎃', p: 9 }];
function balanzaSVG(izq, der, inclina, op) {
  op = op || {};
  const ang = inclina * 9;
  return '<svg class="balanza-svg" viewBox="0 0 300 200" aria-hidden="true">' +
    '<path d="M150 60 L150 178 M110 180 L190 180" stroke="#6B4FD0" stroke-width="10" stroke-linecap="round"/>' +
    '<g transform="rotate(' + ang + ' 150 60)"><path d="M40 60 L260 60" stroke="#9B7BF7" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M40 60 L22 104 M40 60 L58 104 M260 60 L242 104 M260 60 L278 104" stroke="#CFC4F7" stroke-width="3"/>' +
    '<g transform="rotate(' + (-ang) + ' 40 104)"><path d="M10 104 Q40 128 70 104 Z" fill="#FFC93C" stroke="#D99A00" stroke-width="3"/>' +
    '<foreignObject x="0" y="54" width="80" height="54"><div xmlns="http://www.w3.org/1999/xhtml" class="plato-bal">' + izq + '</div></foreignObject></g>' +
    '<g transform="rotate(' + (-ang) + ' 260 104)"><path d="M230 104 Q260 128 290 104 Z" fill="#FFC93C" stroke="#D99A00" stroke-width="3"/>' +
    '<foreignObject x="220" y="54" width="80" height="54"><div xmlns="http://www.w3.org/1999/xhtml" class="plato-bal">' + der + '</div></foreignObject></g></g>' +
    '<circle cx="150" cy="60" r="9" fill="#6B4FD0"/>' + (op.extra || '') + '</svg>';
}
const CAJAS_MISTERIO = [{ id: 'roja', c: '#FF6B6B' }, { id: 'azul', c: '#3FB2F2' }, { id: 'verde', c: '#2FD18E' }, { id: 'amarilla', c: '#FFC93C' }];
function cajaHTML(c) { return '<span class="caja-mist" style="--c:' + c + '"></span>'; }
ACTIVIDADES.balanza = function (dif) {
  if (dif === 0) {
    const par = barajar(COSAS_PESO).slice(0, 2);
    if (par[0].p === par[1].p) par[1] = COSAS_PESO.find(x => x.p !== par[0].p);
    const pide = elegir(['mas', 'menos']);
    const pesado = par[0].p > par[1].p ? 0 : 1;
    const resp = pide === 'mas' ? pesado : 1 - pesado;
    return {
      firma: 'ba0' + par[0].e + par[1].e + pide,
      respuesta: String(resp),
      opciones: ['0', '1'],
      instr: [pide === 'mas' ? 'pesa_mas' : 'pesa_menos'],
      refuerzo: ['baja_pesa'],
      ensenar: ['baja_pesa'],
      explica: ['baja_pesa'],
      pintar(esc, respC) {
        const lz = lienzo(320, 210, 'balanza');
        lz.l.innerHTML = balanzaSVG('<span class="emo">' + par[0].e + '</span>', '<span class="emo">' + par[1].e + '</span>', pesado === 0 ? -1 : 1);
        esc.appendChild(lz.zona);
        par.forEach((x, i) => respC.appendChild(Render.botonEmoji(String(i), x.e, 'objeto ' + (i + 1))));
      },
      foco() { return [$('#escena .balanza'), $('#respuestas')]; },
      pista() { Pistas.quitarUna(); return Voz.decir(['baja_pesa', pide === 'mas' ? 'pesa_mas' : 'pesa_menos']); }
    };
  }
  if (dif === 1) {
    // Dos balanzas: A pesa más que B y B pesa más que C -> ¿cuál es el más pesado?
    const cajas = barajar(CAJAS_MISTERIO).slice(0, 3);
    const orden = barajar([0, 1, 2]);   // orden[0] el más pesado
    const A = cajas[orden[0]], B = cajas[orden[1]], C = cajas[orden[2]];
    const mostrar = barajar([[A, B], [B, C]]);
    return {
      firma: 'ba1' + cajas.map(c => c.id).join('') + orden.join(''),
      respuesta: A.id,
      opciones: cajas.map(c => c.id),
      instr: ['mas_pesado'],
      refuerzo: ['baja_pesa'],
      explica: ['baja_pesa'],
      pintar(esc, respC) {
        const lz = lienzo(320, 430, 'balanza doble');
        lz.l.innerHTML = mostrar.map(par => {
          const izqPesa = rnd() < 0.5;
          const iz = izqPesa ? par[0] : par[1], de = izqPesa ? par[1] : par[0];
          return '<div class="bal-una">' + balanzaSVG(cajaHTML(iz.c), cajaHTML(de.c), iz === par[0] ? -1 : 1) + '</div>';
        }).join('');
        esc.appendChild(lz.zona);
        cajas.forEach(c => respC.appendChild(Render.botonEmoji(c.id, cajaHTML(c.c), 'caja ' + c.id)));
      },
      foco() { return [$('#escena .balanza'), $('#respuestas')]; },
      pista() { Pistas.quitarUna(); return Voz.decir(['baja_pesa', 'mas_pesado']); }
    };
  }
  const k = azar(2, 8);
  const caja = elegir(CAJAS_MISTERIO);
  const opciones = opcionesCercanas(k, 1, 10, 3);
  return {
    firma: 'ba2' + k + caja.id,
    respuesta: k,
    opciones: opciones,
    rango: [1, 10],
    instr: ['cuantos_cubos_pesa'],
    refuerzo: [N(k)],
    ensenar: ['equilibrio'],
    explica: ['equilibrio', N(k)],
    pintar(esc, respC) {
      const lz = lienzo(320, 210, 'balanza');
      lz.l.innerHTML = balanzaSVG(cajaHTML(caja.c), '<span class="cubitos">' + rango(1, k).map(() => '<i class="obj cubito"><span class="obj-num"></span></i>').join('') + '</span>', 0);
      esc.appendChild(lz.zona);
      botonesNumero(respC, opciones);
    },
    foco() { return [$('#escena .balanza'), $('#respuestas')]; },
    pista(tk) { return Voz.decir(['equilibrio']).then(() => (tk === Juego.token ? Pistas.contar(tk, $$('#escena .cubito'), { intro: null, cierre: ['cuantos_cubos_pesa'] }) : null)); }
  };
};

/* ----- Capacidad: vasos y jarras ----- */
function vasoSVG(nivel, op) {
  op = op || {};
  const y = 150 - nivel * 120;
  return '<svg class="vaso-svg" viewBox="0 0 100 160" aria-hidden="true"><path d="M14 10 L22 150 Q50 156 78 150 L86 10" fill="rgba(255,255,255,.55)" stroke="#9B7BF7" stroke-width="4"/>' +
    '<path d="M' + (14 + (150 - y) / 140 * 0 + 8 * (1 - nivel)) + ' ' + y + ' L' + (86 - 8 * (1 - nivel)) + ' ' + y + ' L78 150 Q50 156 22 150 Z" fill="#43B7F5" opacity=".85"/>' +
    (op.marcas ? rango(1, op.marcas - 1).map(i => '<path d="M70 ' + (150 - i * 120 / op.marcas) + ' L86 ' + (150 - i * 120 / op.marcas) + '" stroke="#6B4FD0" stroke-width="3"/>').join('') : '') + '</svg>';
}
ACTIVIDADES.capacidad = function (dif) {
  if (dif < 2) {
    let niveles;
    do { niveles = [azar(2, 9), azar(2, 9), azar(2, 9)].map(v => v / 10); } while (new Set(niveles).size < 3 || (dif === 0 && Math.min(Math.abs(niveles[0] - niveles[1]), Math.abs(niveles[1] - niveles[2]), Math.abs(niveles[0] - niveles[2])) < 0.2));
    const pide = elegir(['mas', 'menos']);
    const v = pide === 'mas' ? Math.max.apply(null, niveles) : Math.min.apply(null, niveles);
    const resp = niveles.indexOf(v);
    return {
      firma: 'ca' + niveles.join('') + pide,
      respuesta: String(resp),
      opciones: ['0', '1', '2'],
      sinRespuestas: true,
      instr: [pide === 'mas' ? 'mas_agua' : 'menos_agua'],
      refuerzo: [],
      explica: ['fijate'],
      pintar(esc) {
        const zona = crear('div', 'zona');
        const c = Render.cartas(0.66, 260);
        niveles.forEach((nv, i) => c.appendChild(Render.carta(String(i), vasoSVG(nv), 'vaso ' + (i + 1))));
        zona.appendChild(c);
        esc.appendChild(zona);
      },
      foco() { return [$('#escena .cartas')]; },
      pista() { $$('#escena .vaso-svg').forEach(s => s.classList.add('con-regla')); Pistas.quitarUna(); return Voz.decir([pide === 'mas' ? 'mas_agua' : 'menos_agua']); }
    };
  }
  const k = azar(2, 6);
  const opciones = opcionesCercanas(k, 1, 8, 3);
  return {
    firma: 'cav' + k,
    respuesta: k,
    opciones: opciones,
    rango: [1, 8],
    instr: ['cuantos_vasos'],
    refuerzo: [N(k)],
    explica: [N(k)],
    pintar(esc, resp) {
      const zona = crear('div', 'zona');
      zona.innerHTML = '<div class="jarra-esc"><div class="jarra">' + vasoSVG(1, { marcas: k }) + '</div><div class="vasito">' + vasoSVG(1) + '</div></div>';
      esc.appendChild(zona);
      botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .jarra'), $('#respuestas')]; },
    pista() { Pistas.tira(rango(1, k).map(() => '<span class="emo">🥛</span>').join('')); Pistas.quitarUna(); return Voz.decir(['cuantos_vasos']); }
  };
};

/* ----- Misión de Urano: cargar el cohete con el peso justo ----- */
ACTIVIDADES.carga = function (dif) {
  const META = [azar(5, 8), azar(8, 12), azar(12, 20)][dif];
  let pesos, soluciones;
  for (let k = 0; k < 100; k++) {
    pesos = rango(1, dif === 0 ? 4 : 5).map(() => azar(1, 9));
    soluciones = [];
    const n = pesos.length;
    for (let m = 1; m < (1 << n); m++) { let s = 0; for (let i = 0; i < n; i++) if (m & (1 << i)) s += pesos[i]; if (s === META) soluciones.push(m); }
    if (soluciones.length) break;
  }
  let sel = 0;
  const suma = () => pesos.reduce((s, p, i) => s + (sel & (1 << i) ? p : 0), 0);
  const instr = ['aguanta', N(META), 'kilos', 'elige_cajas'];
  const q = {
    firma: 'cg' + META + pesos.join(','),
    respuesta: META,
    validar: v => Number(v) === META,
    validas: soluciones,
    rango: [1, 20],
    accion: true,
    sinRespuestas: false,
    instr: instr,
    refuerzo: [N(META), 'kilos'],
    explica: instr,
    pintar(esc, resp) {
      const lz = lienzo(560, 330, 'carga-esc');
      lz.l.innerHTML = '<div class="carga-cohete"><span class="emo">🚀</span><span class="carga-limite">' + META + ' kg</span><div class="carga-bodega"></div><span class="carga-suma" hidden>0</span></div><div class="carga-cajas"></div>';
      esc.appendChild(lz.zona);
      q.pintarCajas();
      resp.appendChild(botonListo(b => q.comprobar(b)));
    },
    pintarCajas() {
      const zona = $('#escena .carga-cajas'), bodega = $('#escena .carga-bodega');
      zona.innerHTML = ''; bodega.innerHTML = '';
      pesos.forEach((p, i) => {
        const b = crear('button', 'caja-peso' + (sel & (1 << i) ? ' cargada' : ''), '<b>' + p + '</b><small>kg</small>');
        b.type = 'button';
        b.dataset.i = i;
        b.setAttribute('aria-label', p + ' kilos');
        b.addEventListener('click', () => { if (Juego.bloqueado) return; Juego.ultimoToque = Date.now(); sel ^= (1 << i); Sonido.efecto(sel & (1 << i) ? 'coger' : 'soltar'); q.pintarCajas(); });
        (sel & (1 << i) ? bodega : zona).appendChild(b);
      });
      const s = $('#escena .carga-suma'); if (s) s.textContent = suma() + ' kg';
    },
    comprobar(b) {
      const s = suma();
      if (s === META) { Juego.acierto(b); return; }
      Juego.fallo(b, { sinApagar: true, pista: () => Voz.decir([s > META ? 'pesa_demasiado' : 'cabe_mas']) });
    },
    foco() { return [$('#escena .carga-limite'), $('#escena .carga-cajas'), $('#respuestas .btn-listo')]; },
    pista() { $('#escena .carga-suma').hidden = false; return Voz.decir(instr); },
    async demo(tk) { await Voz.decir(['mira_como']); sel = soluciones[0]; q.pintarCajas(); $('#escena .carga-suma').hidden = false; },
    guiar() { const b = $('#respuestas .btn-listo'); if (b) b.classList.add('guiado'); },
    resolverPrueba() { sel = soluciones[0]; q.pintarCajas(); q.comprobar($('#respuestas .btn-listo')); }
  };
  return q;
};

/* =================== NEPTUNO =================== */

/* ----- Grupos iguales (iniciación a multiplicar) ----- */
ACTIVIDADES.grupos = function (dif) {
  const k = dif === 0 ? 2 : (dif === 1 ? elegir([5, 10]) : elegir([2, 5, 10]));
  const g = azar(2, dif === 2 ? 6 : 5);
  const t = g * k;
  const obj = elegir(OBJETOS);
  const opciones = (k === 2 ? opcionesCercanas(t, 2, 20, 3) : [t, t - k, t + k].filter(v => v > 0).sort((a, b) => a - b));
  while (opciones.length < 3) opciones.push(t + 2 * k);
  let pasos = [];
  for (let i = 1; i <= g; i++) pasos.push(N(i * k));
  const explica = [N(g), 'grupos_de', N(k)].concat(pasos, ['en_total', N(t)]);
  return {
    firma: 'gp' + g + 'x' + k + obj.id,
    respuesta: t,
    opciones: opciones.sort((a, b) => a - b),
    rango: [2, 60],
    instr: ['cuantos_' + obj.id],
    refuerzo: [N(g), 'grupos_de', N(k), sonEs(t), N(t)],
    ensenar: ['cuenta_grupos'],
    explica: explica,
    pintar(esc, resp) {
      const zona = crear('div', 'zona');
      const c = crear('div', 'bolsas');
      for (let i = 0; i < g; i++) {
        const b = crear('div', 'bolsa obj', '<span class="obj-num"></span>' + (k === 10 ? '<div class="bolsa-dentro diez">' : '<div class="bolsa-dentro">') + rango(1, k).map(() => '<span class="emo">' + obj.e + '</span>').join('') + '</div>');
        c.appendChild(b);
      }
      zona.appendChild(c);
      esc.appendChild(zona);
      if (dif === 2) esc.appendChild(Render.ecuacion([g, '×', k, '=', '?']));
      botonesNumero(resp, opciones.sort((a, b) => a - b));
    },
    foco() { return [$('#escena .bolsas'), $('#respuestas')]; },
    pista(tk) { return Pistas.contar(tk, $$('#escena .bolsa'), { intro: ['cuenta_grupos'], paso: k, cierre: ['cuantos_' + obj.id] }); },
    demo(tk) { return Pistas.contar(tk, $$('#escena .bolsa'), { intro: ['mira_como'], paso: k, cierre: ['en_total', N(t)] }); }
  };
};

/* ----- Problemas de dos pasos ----- */
ACTIVIDADES.problema2 = function (dif) {
  const max = [10, 15, 20][dif];
  let a, b, c;
  do { a = azar(2, max - 2); b = azar(1, max - a); c = azar(1, a + b - 1); } while (a + b > max);
  const r = a + b - c;
  const nave = rnd() < 0.5;
  const obj = nave ? 'astronauta' : 'estrella';
  const p1 = (nave ? ['en_nave_hay'] : ['pipo_tiene']).concat(cant(a, obj));
  const p2 = [nave ? 'suben' : 'gana', N(b)];
  const p3 = [nave ? 'bajan' : 'gasta', N(c)];
  const pregunta = [nave ? 'cuantos_ahora' : 'ahora_tiene_estrella'];
  const explica = [N(a), 'mas', N(b), sonEs(a + b), N(a + b)].concat([N(a + b), 'menos', N(c), sonEs(r), N(r)]);
  const opciones = opcionesCercanas(r, 0, 20, 4);
  const e = OBJ[obj].e;
  return {
    firma: 'p2' + a + '+' + b + '-' + c + obj,
    respuesta: r,
    opciones: opciones,
    rango: [0, 20],
    instr: p1.concat(p2, p3, pregunta),
    refuerzo: [N(r)],
    explica: explica,
    pintar(esc, resp) {
      const caja = crear('div', 'problema2-esc');
      const icon = nave ? '🛸' : '';
      caja.innerHTML = '<div class="p2-paso"><span class="emo">' + (icon || '⭐') + '</span><b>' + a + '</b></div>' +
        '<div class="p2-paso suben"><span class="emo">⬆️</span><b>+' + b + '</b></div>' +
        '<div class="p2-paso bajan"><span class="emo">⬇️</span><b>−' + c + '</b></div><div class="p2-paso q"><span class="emo">' + e + '</span><b>?</b></div>';
      esc.appendChild(caja);
      botonesNumero(resp, opciones);
    },
    hablar(tk, intro) {
      const pasos = $$('#escena .p2-paso');
      return Voz.decir(intro.concat(p1)).then(() => { if (tk !== Juego.token) return null; pasos[1].classList.add('visible'); return Voz.decir(p2); })
        .then(() => { if (tk !== Juego.token) return null; pasos[2].classList.add('visible'); return Voz.decir(p3); })
        .then(() => { if (tk !== Juego.token) return null; pasos[3].classList.add('visible'); return Voz.decir(pregunta, { instruccion: true }); });
    },
    alRepetir() { $$('#escena .p2-paso').forEach(p => p.classList.add('visible')); Voz.decir(p1.concat(p2, p3, pregunta)); },
    alReanudar(tk) { $$('#escena .p2-paso').forEach(p => p.classList.add('visible')); Voz.decir(pregunta).then(() => { if (tk === Juego.token) Juego.finInstruccion = Date.now(); }); },
    foco() { return [$('#escena .problema2-esc'), $('#respuestas')]; },
    pista() {
      $$('#escena .p2-paso').forEach(p => p.classList.add('visible'));
      Pistas.tira('<span>' + a + ' + ' + b + ' = ' + (a + b) + '</span><span>' + (a + b) + ' − ' + c + ' = ?</span>');
      Pistas.quitarUna();
      return Voz.decir(pregunta);
    }
  };
};

/* ----- Lógica: ¿cuál no va con los demás? ----- */
const FAMILIAS = [
  { n: 0, grupo: ['🐶', '🐱', '🐰', '🐻', '🐸', '🐵'], intruso: ['🍎', '⚽', '🚗'] },
  { n: 0, grupo: ['🚗', '🚌', '🚲', '🚀', '🚂'], intruso: ['🐶', '🍌', '🌸'] },
  { n: 1, grupo: ['🍎', '🍌', '🍐', '🍇', '🍓', '🍊'], intruso: ['🥕', '🌽', '🥦'] },
  { n: 1, grupo: ['👕', '👖', '🧦', '🧢', '👗'], intruso: ['🍩', '🎲', '🔑'] },
  { n: 1, grupo: ['☀️', '⭐', '🌙', '🪐', '☄️'], intruso: ['🐟', '🌳', '🧀'] },
  { n: 2, grupo: ['🍎', '🍓', '🍒', '🚒', '❤️'], intruso: ['🍌', '💙', '🥦'] },
  { n: 2, grupo: ['2', '4', '6', '8', '10', '12'], intruso: ['3', '5', '7', '9'], numeros: true },
  { n: 2, grupo: ['10', '20', '30', '40', '50'], intruso: ['25', '13', '41'], numeros: true }
];
ACTIVIDADES.sobra = function (dif) {
  const fam = elegir(FAMILIAS.filter(f => f.n === dif));
  const items = barajar(fam.grupo).slice(0, 3);
  const intruso = elegir(fam.intruso);
  const todos = barajar(items.concat([intruso]));
  return {
    firma: 'so' + todos.join(''),
    respuesta: intruso,
    opciones: todos,
    sinRespuestas: true,
    instr: ['cual_sobra'],
    refuerzo: ['este_no_va'],
    explica: ['este_no_va'],
    pintar(esc) {
      const zona = crear('div', 'zona');
      const c = Render.cartas(1, 210);
      todos.forEach(x => c.appendChild(Render.carta(x, fam.numeros ? '<span>' + x + '</span>' : '<span class="emo emo-carta">' + x + '</span>', 'opción')));
      zona.appendChild(c);
      esc.appendChild(zona);
    },
    foco() { return [$('#escena .cartas')]; },
    pista() { Pistas.quitarUna(); return Voz.decir(['fijate', 'cual_sobra']); }
  };
};

/* ----- Sudoku de dibujos 4×4 ----- */
const SIMBOLOS_SUDOKU = [['🌍', '🪐', '🌙', '⭐'], ['🔴', '🔵', '🟡', '🟢'], ['🚀', '🛸', '☄️', '🛰️']];
function sudokuAleatorio() {
  let t = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
  const perm = barajar([0, 1, 2, 3]);
  t = t.map(f => f.map(v => perm[v]));
  if (rnd() < 0.5) t = [t[1], t[0], t[2], t[3]];
  if (rnd() < 0.5) t = [t[0], t[1], t[3], t[2]];
  if (rnd() < 0.5) t = [t[2], t[3], t[0], t[1]];
  if (rnd() < 0.5) t = t.map(f => [f[1], f[0], f[2], f[3]]);
  if (rnd() < 0.5) t = t.map(f => [f[0], f[1], f[3], f[2]]);
  if (rnd() < 0.5) t = t[0].map((_, c) => t.map(f => f[c]));
  return t;
}
function valoresVistos(t, ocultas, f, c) {
  const vistos = new Set();
  const visible = (ff, cc) => ocultas.indexOf(ff * 4 + cc) < 0;
  for (let k = 0; k < 4; k++) {
    if (visible(f, k)) vistos.add(t[f][k]);
    if (visible(k, c)) vistos.add(t[k][c]);
  }
  const bf = Math.floor(f / 2) * 2, bc = Math.floor(c / 2) * 2;
  for (let i = bf; i < bf + 2; i++) for (let j = bc; j < bc + 2; j++) if (visible(i, j)) vistos.add(t[i][j]);
  return vistos;
}
ACTIVIDADES.sudoku = function (dif) {
  const sim = elegir(SIMBOLOS_SUDOKU);
  let t, ocultas, objetivo;
  const extra = [2, 5, 8][dif];
  for (let k = 0; k < 300; k++) {
    t = sudokuAleatorio();
    objetivo = azar(0, 15);
    ocultas = [objetivo];
    while (ocultas.length < extra + 1) { const x = azar(0, 15); if (ocultas.indexOf(x) < 0) ocultas.push(x); }
    const f = Math.floor(objetivo / 4), c = objetivo % 4;
    const vistos = valoresVistos(t, ocultas, f, c);
    if (vistos.size !== 3) continue;
    if (dif === 0) {
      // Fácil: la fila sola ya lo resuelve
      const filaVis = [0, 1, 2, 3].filter(cc => ocultas.indexOf(f * 4 + cc) < 0).length;
      if (filaVis !== 3) continue;
    }
    break;
  }
  const f = Math.floor(objetivo / 4), c = objetivo % 4;
  const resp = sim[t[f][c]];
  const regla = !(Guardado.p && Guardado.p.vistos.sudoku);
  return {
    firma: 'su' + JSON.stringify(t) + objetivo + ocultas.length,
    respuesta: resp,
    opciones: sim.slice(),
    instr: (regla ? ['sudoku_regla'] : []).concat(['cual_falta']),
    refuerzo: [],
    ensenar: ['sudoku_regla'],
    explica: ['sudoku_regla'],
    pintar(esc, respC) {
      const lz = lienzo(320, 320, 'sudoku');
      let h = '';
      for (let i = 0; i < 16; i++) {
        const ff = Math.floor(i / 4), cc = i % 4;
        const oculta = ocultas.indexOf(i) >= 0;
        h += '<span class="su-celda' + (i === objetivo ? ' objetivo' : '') + (oculta && i !== objetivo ? ' vacia' : '') + '" data-f="' + ff + '" data-c="' + cc + '">' + (oculta ? (i === objetivo ? '?' : '') : '<span class="emo">' + sim[t[ff][cc]] + '</span>') + '</span>';
      }
      lz.l.innerHTML = h;
      esc.appendChild(lz.zona);
      sim.forEach(s => respC.appendChild(Render.botonEmoji(s, s)));
    },
    foco() { return [$('#escena .su-celda.objetivo'), $('#respuestas')]; },
    pista() {
      $$('#escena .su-celda').forEach(x => { if (Number(x.dataset.f) === f || Number(x.dataset.c) === c) x.classList.add('linea'); });
      Pistas.quitarUna();
      return Voz.decir(['sudoku_regla']);
    }
  };
};

/* ----- Programar el robot en una cuadrícula ----- */
const DIRS = { arriba: [-1, 0], abajo: [1, 0], izquierda: [0, -1], derecha: [0, 1] };
function caminoMasCorto(TAM, ini, fin, rocas) {
  const clave = p => p[0] * 10 + p[1];
  const cola = [[ini, []]];
  const visto = new Set([clave(ini)]);
  while (cola.length) {
    const [p, camino] = cola.shift();
    if (p[0] === fin[0] && p[1] === fin[1]) return camino;
    for (const d of Object.keys(DIRS)) {
      const n = [p[0] + DIRS[d][0], p[1] + DIRS[d][1]];
      if (n[0] < 0 || n[1] < 0 || n[0] >= TAM || n[1] >= TAM || rocas.some(r => r[0] === n[0] && r[1] === n[1]) || visto.has(clave(n))) continue;
      visto.add(clave(n));
      cola.push([n, camino.concat([d])]);
    }
  }
  return null;
}
ACTIVIDADES.robot = function (dif) {
  const TAM = dif === 2 ? 5 : 4;
  let ini, fin, rocas = [], solucion;
  for (let k = 0; k < 200; k++) {
    ini = [azar(0, TAM - 1), azar(0, TAM - 1)];
    if (dif === 0) {
      const d = elegir(Object.keys(DIRS));
      const pasos = azar(1, 3);
      fin = [ini[0] + DIRS[d][0] * pasos, ini[1] + DIRS[d][1] * pasos];
    } else {
      fin = [azar(0, TAM - 1), azar(0, TAM - 1)];
      if (fin[0] === ini[0] || fin[1] === ini[1]) continue;
    }
    if (fin[0] < 0 || fin[1] < 0 || fin[0] >= TAM || fin[1] >= TAM) continue;
    rocas = [];
    if (dif === 2) {
      while (rocas.length < 3) {
        const r = [azar(0, TAM - 1), azar(0, TAM - 1)];
        if ((r[0] === ini[0] && r[1] === ini[1]) || (r[0] === fin[0] && r[1] === fin[1]) || rocas.some(x => x[0] === r[0] && x[1] === r[1])) continue;
        rocas.push(r);
      }
    }
    solucion = caminoMasCorto(TAM, ini, fin, rocas);
    if (!solucion || solucion.length > 7 || solucion.length < 1) continue;
    if (dif === 2) {
      const directo = Math.abs(fin[0] - ini[0]) + Math.abs(fin[1] - ini[1]);
      if (solucion.length === directo && rnd() < 0.7) continue;  // mejor si hay que rodear
    }
    break;
  }
  let programa = [], corriendo = false, pos = ini.slice();
  const esRoca = p => rocas.some(r => r[0] === p[0] && r[1] === p[1]);
  const q = {
    firma: 'ro' + ini + '>' + fin + '/' + rocas.join(';'),
    respuesta: solucion.join(','),
    validar: v => {
      let p = ini.slice();
      for (const d of String(v).split(',').filter(Boolean)) {
        p = [p[0] + DIRS[d][0], p[1] + DIRS[d][1]];
        if (p[0] < 0 || p[1] < 0 || p[0] >= TAM || p[1] >= TAM || esRoca(p)) return false;
      }
      return p[0] === fin[0] && p[1] === fin[1];
    },
    validas: [solucion.join(',')],
    accion: true,
    instr: ['lleva_robot'].concat(Guardado.p && Guardado.p.vistos.robot ? [] : ['toca_flechas']),
    refuerzo: ['llego'],
    explica: solucion,
    colocar() {
      const r = $('#escena .robot-ficha');
      if (r) { r.style.left = (pos[1] * 70 + 6) + 'px'; r.style.top = (pos[0] * 70 + 6) + 'px'; }
    },
    pintarPrograma() {
      const tira = $('#escena .programa');
      tira.innerHTML = programa.map(d => '<span class="paso-prog">' + ICONOS[d] + '</span>').join('') + (programa.length < 10 ? '<span class="paso-prog vacio"></span>' : '');
    },
    pintar(esc, resp) {
      const caja = crear('div', 'robot-esc');
      const lz = lienzo(TAM * 70 + 12, TAM * 70 + 12, 'cuadricula');
      let h = '';
      for (let f = 0; f < TAM; f++) for (let c = 0; c < TAM; c++) h += '<span class="cr-celda" style="left:' + (c * 70 + 6) + 'px;top:' + (f * 70 + 6) + 'px">' + (esRoca([f, c]) ? '<span class="emo">🪨</span>' : '') + '</span>';
      h += '<span class="cr-meta emo" style="left:' + (fin[1] * 70 + 6) + 'px;top:' + (fin[0] * 70 + 6) + 'px">🚩</span><span class="robot-ficha emo">🤖</span>';
      lz.l.innerHTML = h;
      caja.appendChild(lz.zona);
      caja.appendChild(crear('div', 'programa'));
      esc.appendChild(caja);
      q.colocar();
      q.pintarPrograma();
      const flechas = crear('div', 'flechas');
      ['arriba', 'izquierda', 'derecha', 'abajo'].forEach(d => {
        const b = boton('btn opcion flecha-' + d, '<span class="ico">' + ICONOS[d] + '</span>', d, () => {
          if (Juego.bloqueado || corriendo || programa.length >= 10) return;
          Juego.ultimoToque = Date.now();
          programa.push(d);
          Sonido.efecto('tic');
          Voz.decir([d]);
          q.pintarPrograma();
        });
        b.dataset.dir = d;
        flechas.appendChild(b);
      });
      flechas.appendChild(boton('btn opcion btn-borrar-prog', '<span class="ico">' + ICONOS.borrar + '</span>', 'Borrar', () => { if (corriendo || Juego.bloqueado) return; programa.pop(); q.pintarPrograma(); }));
      flechas.appendChild(botonListo(b => q.ejecutar(b)));
      resp.appendChild(flechas);
      resp.classList.add('resp-robot');
    },
    async ejecutar(b) {
      if (corriendo || !programa.length) return;
      corriendo = true;
      const tk = Juego.token;
      pos = ini.slice();
      q.colocar();
      await esperar(T(250));
      for (const d of programa) {
        if (tk !== Juego.token) { corriendo = false; return; }
        const n = [pos[0] + DIRS[d][0], pos[1] + DIRS[d][1]];
        if (n[0] < 0 || n[1] < 0 || n[0] >= TAM || n[1] >= TAM || esRoca(n)) {
          Sonido.efecto('no');
          corriendo = false;
          pos = ini.slice(); setTimeout(() => q.colocar(), 500);
          programa = []; q.pintarPrograma();
          Juego.fallo(b, { sinApagar: true, pista: () => Voz.decir(['choca', 'lleva_robot']) });
          return;
        }
        pos = n;
        q.colocar();
        Sonido.efecto('robot');
        await esperar(T(REDUCIR_MOVIMIENTO ? 120 : 420));
      }
      corriendo = false;
      if (pos[0] === fin[0] && pos[1] === fin[1]) { Juego.acierto(b); return; }
      pos = ini.slice(); setTimeout(() => q.colocar(), 500);
      programa = []; q.pintarPrograma();
      Juego.fallo(b, { sinApagar: true, pista: () => Voz.decir(['no_llega']) });
    },
    foco() { return [$('#escena .robot-ficha'), $('#escena .cr-meta'), $('#respuestas .flechas')]; },
    pista(tk) {
      const primero = $('#respuestas [data-dir="' + solucion[0] + '"]');
      if (primero) primero.classList.add('guiado');
      return Voz.decir([solucion[0]]).then(() => { if (tk === Juego.token && primero) Mano.señalar([primero], { vueltas: 1 }); });
    },
    async demo(tk) {
      await Voz.decir(['mira_como']);
      programa = solucion.slice();
      q.pintarPrograma();
      for (const d of solucion) { if (tk !== Juego.token) return; await Promise.race([Voz.decir([d]), esperar(T(1000))]); }
    },
    guiar() { const b = $('#respuestas .btn-listo'); if (b) b.classList.add('guiado'); },
    resolverPrueba() { programa = solucion.slice(); q.pintarPrograma(); q.ejecutar($('#respuestas .btn-listo')); }
  };
  return q;
};

/* =================== SOL =================== */

/* ----- Orden de los planetas desde el Sol ----- */
function tarjetaPlaneta(id, op) {
  op = op || {};
  const etiqueta = op.nombre === false ? '' : '<small class="pl-nombre">' + ASTROS[id].nombre + '</small>';
  return '<span class="pl-dibujo"' + (op.tam ? ' style="--tam:' + op.tam + '"' : '') + '>' + planetaSVG(id) + '</span>' + etiqueta;
}
function genTocarEnOrden(lista, instr, op) {
  let puestos = 0, fallado = false;
  const q = {
    firma: 'to' + op.id + lista.join(''),
    respuesta: lista.join(','),
    accion: true,
    sinRespuestas: true,
    instr: instr,
    refuerzo: [],
    explica: lista.map(id => 'p_' + id),
    pintar(esc) {
      const pista = crear('div', 'orden-pista' + (op.sol ? ' con-sol' : ''));
      if (op.sol) pista.appendChild(crear('span', 'mini-sol', planetaSVG('sol')));
      lista.forEach((id, i) => pista.appendChild(crear('div', 'orden-hueco pl', '<span class="orden-num">' + (i + 1) + '</span>')));
      esc.appendChild(pista);
      const zona = crear('div', 'zona');
      const c = Render.cartas(0.85, 170);
      barajar(lista).forEach(id => {
        const b = crear('button', 'btn opcion carta orden-carta planeta-carta', tarjetaPlaneta(id, { tam: op.tamanos ? 1 : null }));
        b.type = 'button';
        b.dataset.id = id;
        b.setAttribute('aria-label', ASTROS[id].nombre);
        b.addEventListener('click', () => q.tocar(b, id));
        c.appendChild(b);
      });
      zona.appendChild(c);
      esc.appendChild(zona);
    },
    tocar(b, id) {
      if (Juego.bloqueado || Juego.pausado || b.classList.contains('puesta')) return;
      Juego.ultimoToque = Date.now();
      if (id === lista[puestos]) {
        const hueco = $$('#escena .orden-hueco')[puestos];
        const escala = op.tamanos ? (0.45 + 0.55 * (1 - ORDEN_TAMANO.indexOf(id) / 7)) : 1;
        hueco.innerHTML = '<span class="pl-dibujo" style="--tam:' + escala.toFixed(2) + '">' + planetaSVG(id) + '</span>';
        hueco.classList.add('lleno');
        b.classList.add('puesta');
        b.classList.remove('guiado');
        Sonido.efecto('soltar');
        puestos++;
        if (puestos >= lista.length) Juego.acierto(hueco);
        else Voz.decir(['p_' + id]);
        return;
      }
      b.classList.remove('no-es'); void b.offsetWidth; b.classList.add('no-es');
      if (!fallado) { fallado = true; Juego.fallo(null, { sinApagar: true }); } else Sonido.efecto('suave');
    },
    foco() { return [$('#escena .orden-pista'), $('#escena .cartas')]; },
    pista() {
      const b = $('#escena .orden-carta[data-id="' + lista[puestos] + '"]');
      if (b) b.classList.add('guiado');
      return Voz.decir(op.pistaFrases || instr);
    },
    guiar() { const b = $('#escena .orden-carta[data-id="' + lista[puestos] + '"]'); if (b) b.classList.add('guiado'); },
    resolverPrueba() { for (let k = puestos; k < lista.length; k++) q.tocar($('#escena .orden-carta[data-id="' + lista[k] + '"]'), lista[k]); }
  };
  return q;
}
ACTIVIDADES.ordenPlanetas = function (dif) {
  if (dif === 0) {
    const tres = barajar(ORDEN_SOL).slice(0, 3);
    const pide = elegir(['cerca', 'lejos']);
    const pos = tres.map(id => ORDEN_SOL.indexOf(id));
    const resp = tres[pos.indexOf(pide === 'cerca' ? Math.min.apply(null, pos) : Math.max.apply(null, pos))];
    return {
      firma: 'op0' + tres.join('') + pide,
      respuesta: resp,
      opciones: tres,
      sinRespuestas: true,
      instr: [pide === 'cerca' ? 'cual_cerca_sol' : 'cual_lejos_sol'],
      refuerzo: ['p_' + resp],
      explica: ['rima_1', 'rima_2', 'rima_3', 'rima_4'],
      pintar(esc) {
        const zona = crear('div', 'zona');
        const c = Render.cartas(0.85, 210);
        tres.forEach(id => c.appendChild(Render.carta(id, tarjetaPlaneta(id), ASTROS[id].nombre)));
        zona.appendChild(c);
        esc.appendChild(zona);
      },
      foco() { return [$('#escena .cartas')]; },
      pista() {
        Pistas.tira('<span class="mini-sol">' + planetaSVG('sol') + '</span>' + ORDEN_SOL.map(id => '<span class="mini-pl' + (tres.indexOf(id) >= 0 ? ' resaltado' : '') + '">' + planetaSVG(id) + '</span>').join(''));
        Pistas.quitarUna();
        return Voz.decir([pide === 'cerca' ? 'cual_cerca_sol' : 'cual_lejos_sol']);
      }
    };
  }
  let lista;
  if (dif === 1) { const i = azar(0, 4); lista = elegir([ORDEN_SOL.slice(i, i + 4), barajar(ORDEN_SOL).slice(0, 4)]); lista.sort((a, b) => ORDEN_SOL.indexOf(a) - ORDEN_SOL.indexOf(b)); }
  else lista = ORDEN_SOL.slice();
  return genTocarEnOrden(lista, ['ordena_planetas'], { id: 'sol' + dif, sol: true, pistaFrases: ['rima_1', 'rima_2', 'rima_3', 'rima_4'].slice(0, dif === 2 ? 4 : 2) });
};

/* ----- Tamaños de los planetas ----- */
ACTIVIDADES.tamanos = function (dif) {
  if (dif === 0) {
    const grande = elegir(['jupiter', 'saturno', 'urano', 'neptuno']);
    const peque = elegir(['tierra', 'venus', 'marte', 'mercurio']);
    const par = barajar([grande, peque]);
    const pide = elegir(['grande', 'pequeno']);
    const resp = pide === 'grande' ? grande : peque;
    const revelar = () => $$('#escena .planeta-carta').forEach(b => {
      const id = b.dataset.valor;
      b.querySelector('.pl-dibujo').style.setProperty('--tam', (0.45 + 0.55 * (1 - ORDEN_TAMANO.indexOf(id) / 7)).toFixed(2));
    });
    return {
      firma: 'tm0' + par.join('') + pide,
      respuesta: resp,
      opciones: par,
      sinRespuestas: true,
      instr: [pide === 'grande' ? 'cual_grande' : 'cual_pequeno'],
      refuerzo: ['p_' + resp],
      explica: ['f_gigantes'],
      pintar(esc) {
        const zona = crear('div', 'zona');
        const c = Render.cartas(0.85, 240);
        par.forEach(id => { const b = Render.carta(id, tarjetaPlaneta(id, { tam: 1 }), ASTROS[id].nombre); b.classList.add('planeta-carta'); c.appendChild(b); });
        zona.appendChild(c);
        esc.appendChild(zona);
      },
      foco() { return [$('#escena .cartas')]; },
      pista() { revelar(); return Voz.decir(['f_gigantes', pide === 'grande' ? 'cual_grande' : 'cual_pequeno']); },
      alAcertar() { revelar(); }
    };
  }
  const n = dif === 1 ? 3 : 5;
  let lista;
  do { lista = barajar(ORDEN_TAMANO).slice(0, n); } while (dif === 1 && lista.every(id => ORDEN_TAMANO.indexOf(id) >= 4));
  lista.sort((a, b) => ORDEN_TAMANO.indexOf(a) - ORDEN_TAMANO.indexOf(b));
  return genTocarEnOrden(lista, ['ordena_tamano'], { id: 'tam' + dif, tamanos: true, pistaFrases: ['f_jupiter_1', 'ordena_tamano'] });
};

/* ----- Palabras del explorador (lectura) ----- */
function textoLectura(t) {
  return Guardado.datos.ajustes.mayusculas ? t : t.toLowerCase();
}
ACTIVIDADES.palabras = function (dif) {
  const nivel = dif + 1;
  const pool = PALABRAS.filter(w => w.n === nivel);
  const w = elegir(pool);
  const otras = barajar(PALABRAS.filter(x => x.id !== w.id && Math.abs(x.n - nivel) <= 1)).slice(0, 2);
  const opciones = barajar([w].concat(otras));
  return {
    firma: 'pa' + w.id + opciones.map(x => x.id).join(''),
    respuesta: w.id,
    opciones: opciones.map(x => x.id),
    sinRespuestas: true,
    instr: ['toca_palabra', 'w_' + w.id],
    refuerzo: ['w_' + w.id],
    explica: ['w_' + w.id],
    pintar(esc) {
      const zona = crear('div', 'zona');
      const c = Render.cartas(2.2, 120);
      opciones.forEach(x => c.appendChild(Render.carta(x.id, '<span class="palabra">' + textoLectura(x.t) + '</span>', x.t)));
      zona.appendChild(c);
      esc.appendChild(zona);
    },
    foco() { return [$('#escena .cartas')]; },
    pista() {
      Pistas.quitarUna();
      $$('#escena .carta').forEach(b => { const p = b.querySelector('.palabra'); if (p && b.dataset.valor === w.id) p.innerHTML = '<u>' + p.textContent.charAt(0) + '</u>' + p.textContent.slice(1); });
      return Voz.decir(['toca_palabra', 'w_' + w.id]);
    }
  };
};
