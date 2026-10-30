/* =================== Ayudas comunes de los mundos 4 a 6 =================== */

/* Barra de diez y cubos sueltos (material de base diez) */
function barraDiezHTML(clase) {
  let h = '<span class="barra10 obj ' + (clase || '') + '"><span class="obj-num"></span>';
  for (let i = 0; i < 10; i++) h += '<i></i>';
  return h + '</span>';
}
function cuboHTML(clase) { return '<span class="cubo1 obj ' + (clase || '') + '"><span class="obj-num"></span></span>'; }
function bloquesHTML(d, u, unidadesPrimero) {
  const barras = '<div class="b10-barras">' + rango(1, d).map(() => barraDiezHTML()).join('') + '</div>';
  const cubos = u ? '<div class="b10-cubos">' + rango(1, u).map(() => cuboHTML()).join('') + '</div>' : '';
  return '<div class="bloques10">' + (unidadesPrimero ? cubos + barras : barras + cubos) + '</div>';
}

/* Teclado numérico grande para escribir números (niños de 6 y 7 años) */
function tecladoNumerico(cont, alAceptar, maxCifras) {
  let valor = '';
  const pantalla = crear('div', 'teclado-pantalla', '<span class="tp-num"></span><span class="tp-cursor"></span>');
  const pad = crear('div', 'teclado');
  const pintar = () => { $('.tp-num', pantalla).textContent = valor; };
  const tecla = (txt, clase, fn, etiqueta) => {
    const b = boton('btn tecla ' + (clase || ''), txt, etiqueta || txt, () => { if (Juego.bloqueado || Juego.pausado) return; Juego.ultimoToque = Date.now(); Sonido.efecto('toque'); fn(); });
    pad.appendChild(b);
    return b;
  };
  [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(n => tecla(String(n), '', () => { if (valor.length < (maxCifras || 3)) { valor += n; pintar(); Voz.decir(N(Number(valor))); } }));
  tecla(ICONOS.borrar, 'tecla-borrar', () => { valor = valor.slice(0, -1); pintar(); }, 'Borrar');
  tecla('0', '', () => { if (valor.length && valor.length < (maxCifras || 3)) { valor += '0'; pintar(); Voz.decir(N(Number(valor))); } });
  const ok = tecla(ICONOS.check, 'tecla-ok btn-listo', () => { if (valor) alAceptar(Number(valor), ok, () => { valor = ''; pintar(); }); }, 'Listo');
  cont.appendChild(pantalla);
  cont.appendChild(pad);
  return { poner(v) { valor = String(v); pintar(); }, ok: ok };
}

/* Reto con teclado: la escena arriba y el teclado al lado o debajo */
function conTeclado(q, n) {
  q.sinRespuestas = true;
  q.accion = true;
  const pintarEscena = q.pintar;
  let tec = null;
  q.pintar = function (esc) {
    const caja = crear('div', 'con-teclado');
    const arriba = crear('div', 'ct-escena');
    pintarEscena.call(q, arriba, crear('div'));
    const abajo = crear('div', 'ct-teclado');
    tec = tecladoNumerico(abajo, (v, b, limpiar) => {
      if (v === n) Juego.acierto(b);
      else { limpiar(); Juego.fallo(b, { sinApagar: true }); }
    }, 3);
    caja.appendChild(arriba);
    caja.appendChild(abajo);
    esc.appendChild(caja);
  };
  q.guiar = function () { if (tec) { tec.poner(n); tec.ok.classList.add('guiado'); } };
  q.resolverPrueba = function () { tec.poner(n); tec.ok.click(); };
  return q;
}

/* =================== VENUS =================== */

ACTIVIDADES.numero50 = function (dif) {
  if (dif === 0) return genTocaNumero(20, 30, 3, false, false, true);
  return genTocaNumero(20, 50, 4, false, false, true);
};

/* ----- Decenas y unidades: ¿cuántos hay? ----- */
ACTIVIDADES.decenas = function (dif) {
  let d, u;
  if (dif === 0) { d = azar(1, 5); u = 0; } else if (dif === 1) { d = azar(1, 4); u = azar(1, 9); } else { d = azar(2, 5); u = azar(1, 9); }
  const n = d * 10 + u;
  const opciones = opcionesDosCifras(n, 10, 59, 3);
  const contar = (tk, intro, cierre) => {
    Pistas.contando = true;
    return Pistas.contarJuntos(tk, $$('#escena .barra10'), { intro: intro, paso: 10, cierre: null })
      .then(() => (tk === Juego.token && u ? Pistas.contarJuntos(tk, $$('#escena .cubo1'), { intro: ['y_sueltos'], desde: d * 10, cierre: cierre }) : (tk === Juego.token ? Voz.decir(cierre || []) : null)))
      .then(() => { Pistas.contando = false; }, () => { Pistas.contando = false; });
  };
  return {
    firma: 'de' + n,
    respuesta: n,
    opciones: opciones,
    rango: [10, 59],
    instr: ['cuantos_total'],
    refuerzo: [N(n)],
    ensenar: ['barra_diez'],
    explica: u ? [N(d * 10), 'y', N(u), 'son', N(n)] : [N(n)],
    pintar(esc, resp) {
      const lz = lienzo(460, 300, 'decenas');
      lz.l.innerHTML = bloquesHTML(d, u, dif === 2);
      esc.appendChild(lz.zona);
      botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .b10-barras'), $('#respuestas')]; },
    pista(tk) { return contar(tk, ['de_diez'], ['cuantos_total']); },
    demo(tk) { return contar(tk, ['mira_como'], ['aqui_hay', N(n)]); }
  };
};

/* ----- Haz el número con barras de diez y cubos ----- */
ACTIVIDADES.haceNumero = function (dif) {
  const r = [[11, 30], [11, 50], [31, 59]][dif];
  const n = azar(r[0], r[1]);
  const d = Math.floor(n / 10), u = n % 10;
  let barras = 0, cubos = 0, area = null, verTotal = false;
  const total = () => barras * 10 + cubos;
  const instr = ['haz_numero', N(n)];
  const q = {
    firma: 'hn' + n,
    respuesta: n,
    validar: v => Number(v) === n,
    rango: [11, 59],
    accion: true,
    instr: instr.concat(Guardado.p && Guardado.p.vistos.haceNumero ? [] : ['usa_barras', 'toca_verde']),
    refuerzo: [N(n)],
    explica: [N(d * 10), 'y', N(u), 'son', N(n)],
    pintarArea() {
      area.innerHTML = '';
      for (let i = 0; i < barras; i++) {
        const b = crear('button', 'pieza-b10', barraDiezHTML());
        b.type = 'button';
        b.setAttribute('aria-label', 'Quitar barra');
        b.addEventListener('click', () => { if (Juego.bloqueado) return; barras--; Sonido.efecto('soltar'); q.pintarArea(); });
        area.appendChild(b);
      }
      for (let i = 0; i < cubos; i++) {
        const c = crear('button', 'pieza-b1', cuboHTML());
        c.type = 'button';
        c.setAttribute('aria-label', 'Quitar cubo');
        c.addEventListener('click', () => { if (Juego.bloqueado) return; cubos--; Sonido.efecto('soltar'); q.pintarArea(); });
        area.appendChild(c);
      }
      const t = $('#escena .hn-total');
      if (t) { t.textContent = total(); t.hidden = !verTotal; }
    },
    pintar(esc, resp) {
      const cab = crear('div', 'hn-cabecera', '<span class="numero-objetivo">' + n + '</span><span class="hn-total" hidden>0</span>');
      esc.appendChild(cab);
      const zona = crear('div', 'zona');
      area = crear('div', 'hn-area');
      zona.appendChild(area);
      esc.appendChild(zona);
      const bBarra = crear('button', 'btn opcion btn-pieza', barraDiezHTML('mini'));
      bBarra.type = 'button';
      bBarra.setAttribute('aria-label', 'Poner una barra de diez');
      bBarra.addEventListener('click', () => { if (Juego.bloqueado || barras >= 9) return; Juego.ultimoToque = Date.now(); barras++; Sonido.efecto('coger'); q.pintarArea(); Voz.decir(N(Math.min(100, total()))); });
      const bCubo = crear('button', 'btn opcion btn-pieza', cuboHTML('mini'));
      bCubo.type = 'button';
      bCubo.setAttribute('aria-label', 'Poner un cubo');
      bCubo.addEventListener('click', () => { if (Juego.bloqueado || cubos >= 19) return; Juego.ultimoToque = Date.now(); cubos++; Sonido.efecto('contar', cubos); q.pintarArea(); Voz.decir(N(Math.min(100, total()))); });
      resp.appendChild(bBarra);
      resp.appendChild(bCubo);
      resp.appendChild(botonListo(b => q.comprobar(b)));
    },
    comprobar(b) {
      const t = total();
      if (t === n) { Juego.acierto(b); return; }
      Juego.fallo(b, { sinApagar: true, pista: () => Voz.decir([t > n ? 'te_pasas' : 'falta_poco']) });
    },
    foco() { return $$('#respuestas .btn-pieza').concat([$('#respuestas .btn-listo')]); },
    pista() {
      verTotal = true;
      q.pintarArea();
      Pistas.tira('<span>' + n + '</span><span>=</span>' + barraDiezHTML('mini') + '<span>×' + d + '</span>' + (u ? cuboHTML('mini') + '<span>×' + u + '</span>' : ''));
      return Voz.decir(['usa_barras'].concat(instr));
    },
    async demo(tk) {
      await Voz.decir(['mira_como']);
      barras = 0; cubos = 0; q.pintarArea();
      for (let i = 0; i < d; i++) { if (tk !== Juego.token) return; barras++; q.pintarArea(); await Promise.race([Voz.decir(N(barras * 10)), esperar(T(1200))]); }
      for (let i = 0; i < u; i++) { if (tk !== Juego.token) return; cubos++; q.pintarArea(); await Promise.race([Voz.decir(N(total())), esperar(T(1200))]); }
    },
    guiar() { const b = $('#respuestas .btn-listo'); if (b) b.classList.add('guiado'); },
    resolverPrueba() { barras = d; cubos = u; q.pintarArea(); q.comprobar($('#respuestas .btn-listo')); }
  };
  return q;
};

/* ----- Contar de 2 en 2, de 5 en 5 y de 10 en 10 ----- */
ACTIVIDADES.saltos = function (dif) {
  let s, inicio, k = 5, falta;
  if (dif === 0) { s = 10; inicio = elegir([0, 10]); k = 4; falta = 3; }
  else if (dif === 1) { s = elegir([5, 2]); inicio = s === 5 ? elegir([0, 5, 10]) : elegir([0, 2, 4]); falta = 4; }
  else { s = elegir([2, 5, 10]); inicio = s === 2 ? azar(1, 8) : (s === 5 ? elegir([5, 10, 15, 20]) : elegir([10, 20, 30])); falta = azar(1, 4); }
  const nums = rango(0, k - 1).map(i => inicio + i * s);
  const resp = nums[falta];
  const cand = [resp, resp + 1, resp - 1, resp + s, resp - s].filter((v, i, a) => v >= 0 && v <= 70 && a.indexOf(v) === i);
  const opciones = [resp].concat(barajar(cand.slice(1)).slice(0, 2)).sort((a, b) => a - b);
  const frase = { 2: 'de_dos', 5: 'de_cinco', 10: 'de_diez' }[s];
  const instr = [frase, falta === k - 1 ? 'que_va_despues' : 'que_falta'];
  const leer = (tk, intro, cierre, conResp) => {
    const cajas = $$('#escena .salto-caja');
    return Pistas.leer(tk, nums.map((v, i) => ({ el: cajas[i], partes: [i === falta && !conResp ? 'cual' : N(v)] })), cierre, intro);
  };
  return {
    firma: 'sa' + nums.join('-') + falta,
    respuesta: resp,
    opciones: opciones,
    rango: [0, 70],
    instr: instr,
    refuerzo: [N(resp)],
    pintar(esc, respC) {
      const lz = lienzo(k * 110 + 20, 230, 'saltos');
      let h = '<svg class="arcos" viewBox="0 0 ' + (k * 110 + 20) + ' 230" aria-hidden="true">';
      for (let i = 0; i < k - 1; i++) {
        const x1 = 65 + i * 110, x2 = x1 + 110;
        h += '<path d="M' + x1 + ' 120 Q' + (x1 + 55) + ' 30 ' + x2 + ' 120" fill="none" stroke="#9B7BF7" stroke-width="5" stroke-dasharray="8 7"/>' +
          '<text x="' + (x1 + 55) + ' " y="62" text-anchor="middle" class="arco-txt">+' + s + '</text>';
      }
      h += '</svg>';
      lz.l.innerHTML = h + nums.map((v, i) => '<div class="salto-caja' + (i === falta ? ' hueco' : '') + '" style="left:' + (20 + i * 110) + 'px">' + (i === falta ? '<span>?</span>' : v) + '</div>').join('') +
        '<span class="canguro emo" style="left:' + (20 + Math.max(0, falta - 1) * 110) + 'px">🦘</span>';
      esc.appendChild(lz.zona);
      botonesNumero(respC, opciones);
    },
    foco() { return [$('#escena .salto-caja.hueco'), $('#respuestas')]; },
    pista(tk) { const a = $('#escena .arcos'); if (a) a.classList.add('visible'); return leer(tk, [frase], instr); },
    demo(tk) { const a = $('#escena .arcos'); if (a) a.classList.add('visible'); return leer(tk, ['mira_como'], null, true); }
  };
};

/* ----- Pares e impares ----- */
ACTIVIDADES.pares = function (dif) {
  const r = [[2, 6], [3, 10], [5, 20]][dif];
  const n = azar(r[0], r[1]);
  const resp = n % 2 === 0 ? 'par' : 'impar';
  let zonaObjs = null;
  const enParejas = () => {
    if (!zonaObjs) return;
    let h = '<div class="parejas">';
    for (let i = 0; i < Math.floor(n / 2); i++) h += '<span class="pareja"><span class="emo">🧦</span><span class="emo">🧦</span></span>';
    if (n % 2) h += '<span class="pareja sola"><span class="emo">🧦</span></span>';
    zonaObjs.innerHTML = h + '</div>';
  };
  return {
    firma: 'pi' + n + dif,
    respuesta: resp,
    opciones: ['par', 'impar'],
    rango: [2, 20],
    instr: ['par_o_impar'],
    refuerzo: [resp === 'par' ? 'es_par' : 'es_impar'],
    ensenar: ['hacemos_parejas'],
    explica: ['hacemos_parejas', resp === 'par' ? 'es_par' : 'es_impar'],
    pintar(esc, respC) {
      const caja = crear('div', 'pares-caja');
      if (dif === 2) caja.appendChild(crear('div', 'numero-grande', String(n)));
      zonaObjs = crear('div', 'zona pares-objs');
      if (dif === 0) enParejas();
      else if (dif === 1) zonaObjs.appendChild(Render.rejilla(Array(n).fill('🧦'), { contable: true, disperso: true, max: 90 }));
      caja.appendChild(zonaObjs);
      esc.appendChild(caja);
      respC.appendChild(Render.botonEmoji('par', '<span class="emo">🧦🧦</span><small>par</small>', 'Par'));
      respC.appendChild(Render.botonEmoji('impar', '<span class="emo">🧦</span><small>impar</small>', 'Impar'));
    },
    foco() { return [zonaObjs, $('#respuestas')]; },
    pista() { enParejas(); Render.ajustar(); return Voz.decir(['hacemos_parejas', 'par_o_impar']); },
    demo() { enParejas(); return Voz.decir(['mira_como', 'hacemos_parejas', resp === 'par' ? 'es_par' : 'es_impar']); }
  };
};

/* =================== MERCURIO =================== */

/* ----- Dobles: las dos alas de la mariposa ----- */
ACTIVIDADES.dobles = function (dif) {
  const a = dif === 0 ? azar(1, 5) : (dif === 1 ? azar(2, 10) : azar(3, 9));
  const b = dif === 2 ? a + 1 : a;
  const t = a + b;
  const opciones = opcionesCercanas(t, 2, 20, dif === 2 ? 4 : 3);
  const explica = dif === 2 ? [N(a), 'mas', N(a), 'son', N(2 * a), 'y_uno_mas', N(t)] : [N(a), 'mas', N(a), 'son', N(t)];
  const ala = (k, lado) => '<div class="ala ' + lado + '">' + dadoHTML(k, '<i class="punto-ala"></i>').replace(/<span>(<i class="punto-ala"><\/i>)<\/span>/g, '<span class="obj pa"><span class="obj-e">$1</span><span class="obj-num"></span></span>') + '</div>';
  return {
    firma: 'do' + a + '-' + b,
    respuesta: t,
    opciones: opciones,
    rango: [2, 20],
    instr: dif === 2 ? ['cuantos_total'] : ['doble_q'],
    refuerzo: explica,
    ensenar: ['doble_es'],
    explica: explica,
    pintar(esc, resp) {
      const lz = lienzo(440, 300, 'mariposa');
      lz.l.innerHTML = ala(a, 'izq') + '<div class="cuerpo-mariposa"></div>' + ala(b, 'der');
      esc.appendChild(lz.zona);
      esc.appendChild(Render.ecuacion([a, '+', b, '=', '?']));
      botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .mariposa'), $('#respuestas')]; },
    pista(tk) { return Pistas.contar(tk, $$('#escena .pa'), { intro: ['juntos'], cierre: ['cuantos_total'] }); },
    demo(tk) { return Pistas.contar(tk, $$('#escena .pa'), { intro: ['mira_como'], cierre: explica }); }
  };
};

/* ----- Descomponer: dos números que suman N, o cuántos faltan ----- */
ACTIVIDADES.descomponer = function (dif) {
  const modo = dif === 0 ? 'faltan' : elegir(['faltan', 'elige']);
  if (modo === 'elige') {
    const N0 = dif === 1 ? azar(6, 10) : azar(10, 15);
    const a = azar(1, N0 - 1);
    let cartas = [a, N0 - a];
    while (cartas.length < 5) { const v = azar(0, N0); cartas.push(v); }
    cartas = barajar(cartas);
    const validas = [];
    for (let i = 0; i < cartas.length; i++) for (let j = i + 1; j < cartas.length; j++) if (cartas[i] + cartas[j] === N0) validas.push(i + '-' + j);
    let sel = [];
    const q = {
      firma: 'dc' + N0 + cartas.join(','),
      validar: v => { const p = String(v).split('-').map(Number); return p.length === 2 && p[0] !== p[1] && cartas[p[0]] + cartas[p[1]] === N0; },
      validas: validas,
      opciones: (() => { const o = []; for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) o.push(i + '-' + j); return o; })(),
      rango: [0, 15],
      accion: true,
      sinRespuestas: true,
      instr: ['elige_dos', N(N0)],
      refuerzo: validas.length > 1 ? ['hay_mas_formas'] : [],
      explica: [N(cartas[Number(validas[0].split('-')[0])]), 'mas', N(cartas[Number(validas[0].split('-')[1])]), 'son', N(N0)],
      pintar(esc) {
        const cab = crear('div', 'objetivo-suma', '<span class="numero-objetivo">' + N0 + '</span>');
        esc.appendChild(cab);
        const zona = crear('div', 'zona');
        const c = Render.cartas(0.82, 200);
        cartas.forEach((v, i) => {
          const b = crear('button', 'btn opcion carta elegible', '<span>' + v + '</span>');
          b.type = 'button';
          b.dataset.i = String(i);
          b.dataset.valor = String(v);
          b.setAttribute('aria-label', String(v));
          b.addEventListener('click', () => q.tocar(b, i));
          c.appendChild(b);
        });
        zona.appendChild(c);
        esc.appendChild(zona);
      },
      tocar(b, i) {
        if (Juego.bloqueado || Juego.pausado) return;
        Juego.ultimoToque = Date.now();
        if (sel.indexOf(i) >= 0) { sel = sel.filter(x => x !== i); b.classList.remove('elegida'); return; }
        sel.push(i);
        b.classList.add('elegida');
        Sonido.efecto('toque');
        Voz.decir(N(cartas[i]));
        if (sel.length === 2) {
          const par = sel.slice().sort((x, y) => x - y).join('-');
          const botones = sel.map(k => $('#escena .carta[data-i="' + k + '"]'));
          sel = [];
          setTimeout(() => {
            botones.forEach(x => x.classList.remove('elegida'));
            if (q.validar(par)) { botones.forEach(x => x.classList.add('correcto')); Juego.acierto(botones[1]); }
            else { botones.forEach(x => { x.classList.remove('no-es'); void x.offsetWidth; x.classList.add('no-es'); }); Juego.fallo(null, { sinApagar: true }); }
          }, 350);
        }
      },
      foco() { return [$('#escena .numero-objetivo'), $('#escena .cartas')]; },
      pista() {
        const p = validas[0].split('-').map(Number);
        $('#escena .carta[data-i="' + p[0] + '"]').classList.add('guiado');
        return Voz.decir(['elige_dos', N(N0)]);
      },
      guiar() { validas[0].split('-').forEach(k => $('#escena .carta[data-i="' + k + '"]').classList.add('guiado')); },
      resolverPrueba() { const p = validas[0].split('-').map(Number); q.tocar($('#escena .carta[data-i="' + p[0] + '"]'), p[0]); q.tocar($('#escena .carta[data-i="' + p[1] + '"]'), p[1]); }
    };
    return q;
  }
  const N0 = [azar(4, 6), azar(7, 10), azar(11, 20)][dif];
  const k = azar(1, N0 - 1);
  const resp = N0 - k;
  const opciones = opcionesCercanas(resp, 1, 20, 3);
  return {
    firma: 'df' + N0 + '-' + k,
    respuesta: resp,
    opciones: opciones,
    rango: [1, 20],
    instr: ['faltan_para', N(N0)],
    refuerzo: [N(k), 'mas', N(resp), 'son', N(N0)],
    explica: [N(k), 'mas', N(resp), 'son', N(N0)],
    pintar(esc, respC) {
      const zona = crear('div', 'zona');
      const r = crear('div', 'rejilla');
      r.dataset.ajustar = 'rejilla';
      r.dataset.max = 80;
      for (let i = 0; i < N0; i++) r.appendChild(i < k ? Render.objeto('⭐', false) : crear('span', 'obj vacio', '<span class="obj-e"></span><span class="obj-num"></span>'));
      if (dif < 2) zona.appendChild(r);
      esc.appendChild(zona);
      esc.appendChild(Render.ecuacion([k, '+', '?', '=', N0]));
      botonesNumero(respC, opciones);
    },
    foco() { return [$('#escena .ecuacion'), $('#respuestas')]; },
    pista(tk) {
      const vacios = $$('#escena .vacio');
      if (vacios.length) return Pistas.contar(tk, vacios, { intro: ['juntos'], cierre: ['faltan_para', N(N0)] });
      Pistas.tira(puntosHTML(k) + '<span>+</span><span class="tira-q">?</span><span>=</span><span>' + N0 + '</span>');
      return Voz.decir(['faltan_para', N(N0)]);
    }
  };
};

/* ----- Sumar hasta 20 haciendo diez ----- */
ACTIVIDADES.sumas20 = function (dif) {
  let a, b;
  if (dif === 0) { a = 10; b = azar(1, 9); }
  else if (dif === 1) { a = elegir([8, 9]); b = azar(11 - a, 9); }
  else { do { a = azar(6, 9); b = azar(3, 9); } while (a + b <= 10 || a + b > 18); }
  const t = a + b;
  const opciones = opcionesCercanas(t, 1, 20, dif === 2 ? 4 : 3);
  const falta10 = 10 - a;
  const explica = a === 10 ? explicaSuma(a, b) : [N(a), 'mas', N(falta10), 'son', 'n10', 'y', N(b - falta10), 'mas_fin', 'en_total', N(t)];
  let marcos = null;
  const hacerDiez = () => {
    if (!marcos || a === 10) return;
    const celdas2 = $$('.marco', marcos)[1];
    const objs2 = $$('.obj', celdas2);
    const celdas1 = $$('.celda', $$('.marco', marcos)[0]);
    for (let i = 0; i < falta10; i++) { const o = objs2[i]; o.classList.add('movido'); celdas1[a + i].appendChild(o); }
  };
  const contar = (tk, intro, cierre) => {
    hacerDiez();
    const ms = $$('#escena .marco');
    return Pistas.contar(tk, $$('.obj', ms[1]), { intro: intro, previos: $$('.obj', ms[0]), marcoPrevio: ms[0], cierre: cierre });
  };
  return {
    firma: 's20' + a + '+' + b,
    respuesta: t,
    opciones: opciones,
    rango: [11, 20],
    instr: [N(a), 'mas', N(b), 'cuanto_es'],
    refuerzo: explicaSuma(a, b),
    ensenar: ['hacemos_diez'],
    explica: explica,
    pintar(esc, resp) {
      marcos = crear('div', 'marcos');
      marcos.dataset.ajustar = 'marcos';
      [[a, '⭐'], [b, '🔵']].forEach(par => {
        const m = crear('div', 'marco');
        for (let i = 0; i < 10; i++) {
          const celda = crear('div', 'celda');
          if (i < par[0]) celda.appendChild(Render.objeto(par[1], true));
          m.appendChild(celda);
        }
        marcos.appendChild(m);
      });
      esc.appendChild(marcos);
      esc.appendChild(Render.ecuacion([a, '+', b, '=', '?']));
      botonesNumero(resp, opciones);
    },
    foco() { return $$('#escena .marco').concat([$('#respuestas')]); },
    pista(tk) { return Voz.decir(['hacemos_diez']).then(() => (tk === Juego.token ? contar(tk, null, ['cuanto_es']) : null)); },
    demo(tk) { return Voz.decir(['mira_como']).then(() => (tk === Juego.token ? contar(tk, null, explica) : null)); }
  };
};

/* Recta numérica: solo el tramo que hace falta (números grandes y fáciles de leer) */
const PASO_RECTA = 50;
function rectaHTML(desde, hasta, marcado) {
  let h = '<div class="recta">';
  for (let v = desde; v <= hasta; v++) h += '<span class="marca' + (v === marcado ? ' marcado' : '') + '" data-v="' + v + '"><b>' + v + '</b></span>';
  return h + '</div>';
}
function lienzoRecta(desde, hasta, marcado, cohete) {
  const lz = lienzo((hasta - desde + 1) * PASO_RECTA + 30, 150, 'recta-lz');
  lz.l.innerHTML = rectaHTML(desde, hasta, marcado) + (cohete ? '<span class="cohete-recta emo" style="left:' + (15 + (marcado - desde) * PASO_RECTA) + 'px">🚀</span>' : '');
  return lz;
}

/* ----- Restar hasta 20 ----- */
ACTIVIDADES.restas20 = function (dif) {
  let a, b;
  if (dif === 0) { a = azar(11, 19); b = azar(1, a - 10); }
  else if (dif === 1) { a = azar(11, 18); b = azar(a - 9, 9); }
  else { a = azar(12, 20); b = azar(3, Math.min(12, a - 1)); }
  const r = a - b;
  const opciones = opcionesCercanas(r, 0, 20, dif === 2 ? 4 : 3);
  const saltar = (tk, intro, cierre) => {
    const marca = v => $('#escena .marca[data-v="' + v + '"]');
    const pasos = [];
    for (let v = a - 1; v >= r; v--) pasos.push({ el: marca(v), partes: [N(v)], antes: (vv => () => { const m = marca(vv); if (m) m.classList.add('saltado'); })(v) });
    Pistas.contando = true;
    return Pistas.leer(tk, pasos, cierre, intro).then(() => { Pistas.contando = false; }, () => { Pistas.contando = false; });
  };
  return {
    firma: 'r20' + a + '-' + b,
    respuesta: r,
    opciones: opciones,
    rango: [0, 20],
    instr: [N(a), 'menos', N(b), 'cuanto_es'],
    refuerzo: explicaResta(a, b),
    explica: explicaResta(a, b),
    pintar(esc, resp) {
      const lz = lienzoRecta(Math.max(0, r - 1), Math.min(20, a + 1), a, true);
      esc.appendChild(lz.zona);
      esc.appendChild(Render.ecuacion([a, '−', b, '=', '?']));
      botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .marca.marcado'), $('#respuestas')]; },
    pista(tk) { return saltar(tk, ['saltamos_atras'], ['cuanto_es']); },
    demo(tk) { return saltar(tk, ['mira_como'], explicaResta(a, b)); }
  };
};

/* ----- El reloj: en punto (Mercurio) y y media (Saturno) ----- */
function fraseHora(h, m) { return 'h' + h + '_' + (m === 0 ? '00' : '30'); }
function dichoHora(h, m) { return [h === 1 ? 'es_la' : 'son_las', fraseHora(h, m)]; }
function textoHora(h, m) { return h + ':' + (m === 0 ? '00' : '30'); }
function genReloj(dif, media) {
  const vecina = h => ((h + elegir([-1, 1]) + 11) % 12) + 1;
  let h = azar(1, 12), m = media && rnd() < 0.6 ? 30 : 0;
  let modo, horas;
  if (!media) {
    if (dif === 0) { modo = 'elige'; horas = barajar([12, 3, 6, 9]).slice(0, 3).map(x => [x, 0]); h = horas[0][0]; m = 0; }
    else if (dif === 1) { modo = elegir(['elige', 'lee']); }
    else { modo = 'elige'; }
  } else {
    if (dif === 0) { modo = 'elige'; m = 30; }
    else if (dif === 1) { modo = elegir(['elige', 'lee']); }
    else { modo = 'lee'; }
  }
  if (!horas) {
    const lista = [[h, m]];
    const anadir = par => { if (!lista.some(x => x[0] === par[0] && x[1] === par[1])) lista.push(par); };
    if (media) { anadir([h, m === 0 ? 30 : 0]); anadir([vecina(h), m]); anadir([vecina(h), m === 0 ? 30 : 0]); }
    else if (dif === 2) { anadir([vecina(h), 0]); anadir([((h + 5) % 12) + 1, 0]); }
    while (lista.length < 3) anadir([azar(1, 12), media ? elegir([0, 30]) : 0]);
    horas = lista.slice(0, 3);
  }
  horas = barajar(horas);
  const clave = textoHora(h, m);
  const instr = modo === 'elige' ? ['toca_reloj', fraseHora(h, m)] : ['que_hora'];
  return {
    firma: 'rl' + modo + clave + horas.map(x => textoHora(x[0], x[1])).join(','),
    respuesta: clave,
    opciones: horas.map(x => textoHora(x[0], x[1])),
    sinRespuestas: modo === 'elige',
    instr: instr,
    refuerzo: dichoHora(h, m),
    ensenar: media ? ['aguja_abajo'] : ['aguja_corta', 'aguja_arriba'],
    explica: ['aguja_corta', m === 0 ? 'aguja_arriba' : 'aguja_abajo'].concat(dichoHora(h, m)),
    pintar(esc, resp) {
      const zona = crear('div', 'zona');
      if (modo === 'elige') {
        const c = Render.cartas(1, 230);
        horas.forEach(x => c.appendChild(Render.carta(textoHora(x[0], x[1]), relojSVG(x[0], x[1]), textoHora(x[0], x[1]))));
        zona.appendChild(c);
      } else {
        const r = crear('div', 'reloj-grande', relojSVG(h, m));
        r.dataset.ajustar = 'cuadrado';
        r.dataset.max = 300;
        zona.appendChild(r);
        horas.forEach(x => resp.appendChild(Render.botonNumero(textoHora(x[0], x[1]), '<span class="hora-dig">' + textoHora(x[0], x[1]) + '</span>')));
      }
      esc.appendChild(zona);
    },
    foco() { return [modo === 'elige' ? $('#escena .cartas') : $('#escena .reloj-grande'), $('#respuestas')]; },
    pista() {
      $$('#escena .reloj-svg').forEach(s => s.classList.add('agujas-marcadas'));
      Pistas.quitarUna();
      return Voz.decir(['aguja_corta', m === 0 ? 'aguja_arriba' : 'aguja_abajo'].concat(instr));
    }
  };
}
ACTIVIDADES.reloj = function (dif) { return genReloj(dif, false); };
ACTIVIDADES.relojMedia = function (dif) { return genReloj(dif, true); };

/* ----- Días de la semana: ayer, hoy y mañana ----- */
const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const DIAS_TXT = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const DIAS_INI = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DIAS_COLOR = ['#FF5DA2', '#FF9F43', '#FFC93C', '#2FD18E', '#3FB2F2', '#9B7BF7', '#E86FD8'];
ACTIVIDADES.dias = function (dif) {
  const pide = dif === 0 ? 'manana' : elegir(['manana', 'ayer']);
  let hoy;
  if (dif === 0) hoy = azar(0, 5);
  else hoy = azar(0, 6);
  const resp = pide === 'manana' ? (hoy + 1) % 7 : (hoy + 6) % 7;
  const instr = ['hoy_es', 'd_' + DIAS[hoy], pide === 'manana' ? 'manana_q' : 'ayer_q'];
  const leerSemana = (tk, intro, cierre) => {
    const celdas = $$('#escena .dia');
    return Pistas.leer(tk, DIAS.map((d, i) => ({ el: celdas[i], partes: ['d_' + d] })), cierre, intro);
  };
  return {
    firma: 'di' + hoy + pide,
    respuesta: resp,
    opciones: rango(0, 6),
    sinRespuestas: true,
    instr: instr,
    refuerzo: [pide === 'manana' ? 'manana_sera' : 'ayer_fue', 'd_' + DIAS[resp]],
    ensenar: ['semana_siete'],
    explica: ['hoy_es', 'd_' + DIAS[hoy], pide === 'manana' ? 'manana_sera' : 'ayer_fue', 'd_' + DIAS[resp]],
    pintar(esc) {
      const semana = crear('div', 'semana');
      DIAS.forEach((d, i) => {
        const b = crear('button', 'dia elegible' + (i === hoy && dif < 2 ? ' hoy' : ''), '<b>' + DIAS_INI[i] + '</b><small>' + DIAS_TXT[i] + '</small>' + (i === hoy && dif < 2 ? '<span class="dia-hoy emo">📍</span>' : ''));
        b.type = 'button';
        b.style.setProperty('--c', DIAS_COLOR[i]);
        b.dataset.valor = String(i);
        b.setAttribute('aria-label', DIAS_TXT[i]);
        b.addEventListener('click', () => Juego.responder(String(i), b));
        semana.appendChild(b);
      });
      esc.appendChild(semana);
    },
    foco() { return [$('#escena .dia.hoy') || $('#escena .semana')]; },
    pista(tk) {
      const celdas = $$('#escena .dia');
      celdas[hoy].classList.add('hoy');
      return leerSemana(tk, ['semana_siete'], instr);
    }
  };
};

/* ----- Ordenar en el tiempo ----- */
const SECUENCIAS = [
  ['☁️', '🌧️', '🌈'], ['🍳', '🍽️', '🧽'], ['🥚', '🐣', '🐥', '🐔'], ['🌰', '🌱', '🌿', '🌻'],
  ['🌅', '☀️', '🌇', '🌙'], ['😴', '🥣', '🎒', '🏫'], ['🧑‍🚀', '🚀', '💨', '🌕']
];
ACTIVIDADES.ordenar = function (dif) {
  let sec;
  if (dif === 0) { sec = elegir(SECUENCIAS); if (sec.length > 3) sec = [sec[0], sec[Math.floor(sec.length / 2)], sec[sec.length - 1]]; }
  else sec = elegir(SECUENCIAS.filter(s => s.length === 4));
  let orden;
  do { orden = barajar(rango(0, sec.length - 1)); } while (orden.every((v, i) => v === i));
  let puestos = 0, fallado = false;
  const nombrePaso = i => (i === 0 ? 'primero' : (i === sec.length - 1 ? 'al_final' : 'despues'));
  const q = {
    firma: 'or' + sec.join('') + orden.join(''),
    respuesta: sec.join(''),
    accion: true,
    sinRespuestas: true,
    instr: ['ordena'],
    refuerzo: [],
    explica: sec.map((s, i) => nombrePaso(i)),
    pintar(esc) {
      const huecos = crear('div', 'orden-huecos');
      sec.forEach((s, i) => huecos.appendChild(crear('div', 'orden-hueco', '<span class="orden-num">' + (i + 1) + '</span>')));
      esc.appendChild(huecos);
      const zona = crear('div', 'zona');
      const c = Render.cartas(1, 200);
      orden.forEach(i => {
        const b = crear('button', 'btn opcion carta orden-carta', '<span class="emo">' + sec[i] + '</span>');
        b.type = 'button';
        b.dataset.i = String(i);
        b.setAttribute('aria-label', 'dibujo');
        b.addEventListener('click', () => q.tocar(b, i));
        c.appendChild(b);
      });
      zona.appendChild(c);
      esc.appendChild(zona);
    },
    tocar(b, i) {
      if (Juego.bloqueado || Juego.pausado || b.classList.contains('puesta')) return;
      Juego.ultimoToque = Date.now();
      if (i === puestos) {
        const hueco = $$('#escena .orden-hueco')[puestos];
        hueco.innerHTML = '<span class="emo">' + sec[i] + '</span>';
        hueco.classList.add('lleno');
        b.classList.add('puesta');
        b.classList.remove('guiado');
        Sonido.efecto('soltar');
        puestos++;
        if (puestos >= sec.length) Juego.acierto(hueco);
        else Voz.decir([nombrePaso(i)]);
        return;
      }
      b.classList.remove('no-es'); void b.offsetWidth; b.classList.add('no-es');
      if (!fallado) { fallado = true; Juego.fallo(null, { sinApagar: true }); } else Sonido.efecto('suave');
    },
    foco() { return [$('#escena .orden-huecos'), $('#escena .cartas')]; },
    pista() { const b = $('#escena .orden-carta[data-i="' + puestos + '"]'); if (b) b.classList.add('guiado'); return Voz.decir(['ordena']); },
    guiar() { const b = $('#escena .orden-carta[data-i="' + puestos + '"]'); if (b) b.classList.add('guiado'); },
    resolverPrueba() { for (let k = puestos; k < sec.length; k++) { const b = $('#escena .orden-carta[data-i="' + k + '"]'); q.tocar(b, k); } }
  };
  return q;
};

/* =================== JÚPITER =================== */

/* ----- La tabla del 100: ¿qué número falta? ----- */
ACTIVIDADES.tabla100 = function (dif) {
  const fila0 = dif === 0 ? azar(0, 4) : azar(0, 7);
  const filaQ = fila0 + 1;
  const col = dif === 0 ? azar(1, 8) : azar(0, 9);
  const n = filaQ * 10 + col + 1;
  const ocultos = [n];
  if (dif >= 1) { if (col > 0) ocultos.push(n - 1); if (col < 9) ocultos.push(n + 1); }
  if (dif === 2) {
    while (ocultos.length < 7) {
      const v = azar(fila0 * 10 + 1, fila0 * 10 + 30);
      if (ocultos.indexOf(v) < 0 && v !== n - 10 && v !== n + 10) ocultos.push(v);
    }
  }
  const opciones = opcionesDosCifras(n, 1, 100, dif === 2 ? 4 : 3);
  const vecinos = () => [n - 10, n - 1, n + 1, n + 10].filter(v => ocultos.indexOf(v) < 0 && v >= fila0 * 10 + 1 && v <= fila0 * 10 + 30 && (Math.abs(v - n) === 10 || Math.floor((v - 1) / 10) === Math.floor((n - 1) / 10)));
  return {
    firma: 't1' + n + dif,
    respuesta: n,
    opciones: opciones,
    rango: [1, 100],
    instr: ['que_falta'],
    refuerzo: [N(n)],
    explica: vecinos().slice(0, 2).map(N).concat([N(n)]),
    pintar(esc, resp) {
      // Ventana de 6 columnas alrededor del número (se ve igual de bien en un móvil)
      const c0 = limitar(col - 2, 0, 4);
      const lz = lienzo(6 * 76 + 12, 3 * 76 + 12, 'tabla100');
      let h = '';
      for (let f = 0; f < 3; f++) for (let c = c0; c < c0 + 6; c++) {
        const v = (fila0 + f) * 10 + c + 1;
        const oculto = ocultos.indexOf(v) >= 0;
        h += '<span class="t100' + (v === n ? ' pregunta' : (oculto ? ' tapado' : '')) + '" data-v="' + v + '" style="left:' + (6 + (c - c0) * 76) + 'px;top:' + (6 + f * 76) + 'px">' + (v === n ? '?' : (oculto ? '' : v)) + '</span>';
      }
      lz.l.innerHTML = h;
      esc.appendChild(lz.zona);
      botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .t100.pregunta'), $('#respuestas')]; },
    pista(tk) {
      const pasos = vecinos().map(v => ({ el: $('#escena .t100[data-v="' + v + '"]'), partes: [N(v)] }));
      return Pistas.leer(tk, pasos, ['que_falta'], ['fijate']);
    }
  };
};

ACTIVIDADES.numero100 = function (dif) {
  if (dif === 0) return genTocaNumero(10, 60, 3, false, false, true);
  if (dif === 1) return genTocaNumero(10, 100, 4, false, false, true);
  const n = azar(11, 99);
  return conTeclado({
    firma: 'w' + n,
    respuesta: n,
    rango: [11, 99],
    instr: ['escribe_numero', N(n)],
    refuerzo: [N(n)],
    explica: [N(n)],
    pintar(esc) { esc.appendChild(crear('div', 'oreja-grande emo', '👂')); },
    foco() { return [$('#escena .teclado')]; },
    pista() {
      const d = Math.floor(n / 10), u = n % 10;
      Pistas.tira('<span class="tira-dec">' + '▮'.repeat(d) + '</span><span class="tira-uni">' + '•'.repeat(u) + '</span>');
      return Voz.decir(['escribe_numero', N(n)]);
    }
  }, n);
};

/* ----- Mayor, menor o igual (el cocodrilo) ----- */
ACTIVIDADES.signos = function (dif) {
  const max = [20, 50, 100][dif];
  let a = azar(1, max), b = azar(1, max);
  if (dif === 2 && rnd() < 0.15) b = a;
  while (a === b && !(dif === 2)) b = azar(1, max);
  const resp = a < b ? '<' : (a > b ? '>' : '=');
  const frase = a < b ? 'menor_que' : (a > b ? 'mayor_que' : 'igual_a');
  const barras = v => '<span class="tira-dec">' + '▮'.repeat(Math.floor(v / 10)) + '</span><span class="tira-uni">' + '•'.repeat(v % 10) + '</span>';
  return {
    firma: 'sg' + a + '-' + b,
    respuesta: resp,
    opciones: ['<', '=', '>'],
    rango: [1, 100],
    instr: ['que_signo'],
    refuerzo: [N(a), frase, N(b)],
    ensenar: ['cocodrilo'],
    explica: ['cocodrilo', N(a), frase, N(b)],
    pintar(esc, respC) {
      const caja = crear('div', 'signos');
      caja.innerHTML = '<div class="sg-num">' + a + '<div class="sg-barras" hidden>' + barras(a) + '</div></div><div class="sg-hueco"><span class="emo">🐊</span></div><div class="sg-num">' + b + '<div class="sg-barras" hidden>' + barras(b) + '</div></div>';
      esc.appendChild(caja);
      ['<', '=', '>'].forEach(s => respC.appendChild(Render.botonNumero(s, '<span class="signo-txt">' + s.replace('<', '&lt;').replace('>', '&gt;') + '</span>')));
    },
    foco() { return [$('#escena .sg-hueco'), $('#respuestas')]; },
    pista() {
      $$('#escena .sg-barras').forEach(x => { x.hidden = false; });
      Pistas.quitarUna();
      return Voz.decir(['cocodrilo', 'que_signo']);
    }
  };
};

/* Dinero: monedas y billetes */
function sumaDinero(lista) { return lista.reduce((s, v) => s + v, 0); }
function dineroAleatorio(valores, min, max) {
  let lista;
  do {
    lista = [];
    const objetivo = azar(min, max);
    let t = 0;
    while (t < objetivo) {
      const v = elegir(valores.filter(x => t + x <= objetivo));
      if (!v) break;
      lista.push(v); t += v;
    }
  } while (sumaDinero(lista) < min || lista.length > 7);
  return lista.sort((x, y) => y - x);
}

/* ----- Contar dinero ----- */
ACTIVIDADES.contarDinero = function (dif) {
  const lista = dif === 0 ? dineroAleatorio([1], 2, 6) : (dif === 1 ? dineroAleatorio([1, 2, 5], 3, 10) : dineroAleatorio([1, 2, 5, 10], 6, 20));
  const t = sumaDinero(lista);
  const opciones = opcionesCercanas(t, 1, 20, 3);
  const contar = (tk, intro, cierre) => {
    let acum = 0;
    const els = $$('#escena .pieza-dinero');
    return Pistas.leer(tk, lista.map((v, i) => { acum += v; return { el: els[i], partes: [N(acum)] }; }), cierre, intro);
  };
  return {
    firma: 'cd' + lista.join('+'),
    respuesta: t,
    opciones: opciones,
    rango: [1, 20],
    instr: ['cuantos_euros'],
    refuerzo: eurosDe(t),
    explica: ['en_total'].concat(eurosDe(t)),
    pintar(esc, resp) {
      const zona = crear('div', 'zona');
      const c = crear('div', 'monedero');
      lista.forEach(v => c.appendChild(crear('span', 'pieza-dinero v' + v, dineroSVG(v))));
      zona.appendChild(c);
      esc.appendChild(zona);
      botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .monedero'), $('#respuestas')]; },
    pista(tk) { return contar(tk, ['fijate'], ['cuantos_euros']); },
    demo(tk) { return contar(tk, ['mira_como'], ['en_total'].concat(eurosDe(t))); }
  };
};

/* ----- Pagar justo lo que cuesta ----- */
const COSAS_TIENDA = ['🍦', '🧸', '🎈', '🪀', '📚', '🧃', '🍩', '🪁', '⚽', '🖍️'];
ACTIVIDADES.pagar = function (dif) {
  const precio = [azar(2, 5), azar(3, 10), azar(6, 20)][dif];
  const cartera = [[1, 1, 1, 1, 1, 2, 2], [1, 1, 1, 1, 2, 2, 2, 5], [1, 1, 1, 1, 2, 2, 2, 5, 5, 10]][dif];
  const cosa = elegir(COSAS_TIENDA);
  let enMesa = [], verTotal = false;
  const instr = ['cuesta'].concat(eurosDe(precio), ['paga_justo']);
  const q = {
    firma: 'pg' + precio + cosa,
    respuesta: precio,
    validar: v => Number(v) === precio,
    rango: [1, 20],
    accion: true,
    instr: instr,
    refuerzo: eurosDe(precio),
    explica: instr,
    pintarMesa() {
      const mesa = $('#escena .mostrador-dinero');
      const cart = $('#escena .cartera');
      mesa.innerHTML = '';
      cart.innerHTML = '';
      const usados = enMesa.slice();
      const libres = cartera.slice();
      usados.forEach(v => libres.splice(libres.indexOf(v), 1));
      usados.forEach((v, i) => {
        const b = crear('button', 'pieza-dinero tocable v' + v, dineroSVG(v));
        b.type = 'button';
        b.setAttribute('aria-label', 'Devolver ' + v + ' euros');
        b.addEventListener('click', () => { if (Juego.bloqueado) return; enMesa.splice(i, 1); Sonido.efecto('soltar'); q.pintarMesa(); });
        mesa.appendChild(b);
      });
      libres.forEach(v => {
        const b = crear('button', 'pieza-dinero tocable v' + v, dineroSVG(v));
        b.type = 'button';
        b.dataset.v = v;
        b.setAttribute('aria-label', 'Pagar ' + v + ' euros');
        b.addEventListener('click', () => { if (Juego.bloqueado) return; Juego.ultimoToque = Date.now(); enMesa.push(v); Sonido.efecto('moneda'); q.pintarMesa(); Voz.decir(N(sumaDinero(enMesa))); });
        cart.appendChild(b);
      });
      const t = $('#escena .total-mesa');
      t.textContent = sumaDinero(enMesa) + ' €';
      t.hidden = !verTotal;
    },
    pintar(esc, resp) {
      const tienda = crear('div', 'tienda-esc');
      tienda.innerHTML = '<div class="producto"><span class="emo">' + cosa + '</span><span class="etiqueta-precio">' + precio + ' €</span></div>' +
        '<div class="mostrador"><div class="mostrador-dinero"></div><span class="total-mesa" hidden></span></div>';
      esc.appendChild(tienda);
      esc.appendChild(crear('div', 'cartera'));
      q.pintarMesa();
      resp.appendChild(botonListo(b => q.comprobar(b)));
    },
    comprobar(b) {
      const t = sumaDinero(enMesa);
      if (t === precio) { Sonido.efecto('comprar'); Juego.acierto(b); return; }
      Juego.fallo(b, { sinApagar: true, pista: () => Voz.decir([t > precio ? 'sobra_dinero' : 'falta_dinero']) });
    },
    foco() { return [$('#escena .etiqueta-precio'), $('#escena .cartera'), $('#respuestas .btn-listo')]; },
    pista() { verTotal = true; q.pintarMesa(); return Voz.decir(instr); },
    async demo(tk) {
      await Voz.decir(['mira_como']);
      enMesa = [];
      verTotal = true;
      q.pintarMesa();
      let resto = precio;
      const disp = cartera.slice().sort((x, y) => y - x);
      for (const v of disp) {
        if (tk !== Juego.token) return;
        if (v <= resto) { enMesa.push(v); resto -= v; q.pintarMesa(); await Promise.race([Voz.decir(N(sumaDinero(enMesa))), esperar(T(1200))]); }
      }
    },
    guiar() { const b = $('#respuestas .btn-listo'); if (b) b.classList.add('guiado'); },
    resolverPrueba() {
      enMesa = [];
      let resto = precio;
      cartera.slice().sort((x, y) => y - x).forEach(v => { if (v <= resto) { enMesa.push(v); resto -= v; } });
      q.pintarMesa();
      q.comprobar($('#respuestas .btn-listo'));
    }
  };
  return q;
};

/* ----- Problemas orales de un paso ----- */
ACTIVIDADES.problema = function (dif) {
  const tipo = elegir(['juntar', 'quitar', 'comparar']);
  const max = dif === 0 ? 10 : 20;
  const obj = elegir(OBJETOS_PROBLEMA);
  let a, b, r;
  if (tipo === 'juntar') { r = azar(dif === 0 ? 3 : 6, max); a = azar(1, r - 1); b = r - a; }
  else { a = azar(dif === 0 ? 3 : 6, max); b = azar(1, a - 1); r = a - b; }
  const partes1 = ['pipo_tiene'].concat(cant(a, obj));
  const partes2 = tipo === 'juntar' ? ['le_dan', N(b), 'mas_fin'] : (tipo === 'quitar' ? ['regala', N(b)] : ['lia_tiene', N(b)]);
  const pregunta = [tipo === 'juntar' ? 'ahora_tiene_' + obj : (tipo === 'quitar' ? 'le_quedan_' + obj : 'mas_tiene_' + obj)];
  const explica = tipo === 'juntar' ? explicaSuma(a, b) : explicaResta(a, b);
  const opciones = opcionesCercanas(r, 0, 20, 4);
  const e = OBJ[obj].e;
  const q = {
    firma: 'pr' + tipo + a + '-' + b + obj,
    respuesta: r,
    opciones: opciones,
    rango: [0, 20],
    instr: partes1.concat(partes2, pregunta),
    refuerzo: explica,
    explica: explica,
    pintar(esc, resp) {
      const caja = crear('div', 'problema-esc tipo-' + tipo);
      const fila = (quien, n, clase) => '<div class="pr-fila ' + (clase || '') + '"><span class="pr-quien emo">' + quien + '</span><div class="pr-objs">' +
        (dif === 2 ? '<span class="pr-num">' + n + '</span><span class="emo pr-mini">' + e + '</span>' : rango(1, n).map(() => '<span class="emo pr-obj">' + e + '</span>').join('')) + '</div></div>';
      if (tipo === 'juntar') caja.innerHTML = fila('🐸', a, 'pipo') + '<div class="pr-signo">+</div>' + fila('🎁', b, 'llegan');
      else if (tipo === 'quitar') caja.innerHTML = fila('🐸', a, 'pipo');
      else caja.innerHTML = fila('🐸', a, 'pipo') + fila('👧', b, 'lia');
      esc.appendChild(caja);
      $$('.pr-quien', caja).forEach(x => { if (x.textContent === '🐸') x.innerHTML = '<span class="mini-pipo">' + Mascota.html() + '</span>'; });
      botonesNumero(resp, opciones);
    },
    hablar(tk, intro) {
      return Voz.decir(intro.concat(partes1)).then(() => {
        if (tk !== Juego.token) return null;
        const llegan = $('#escena .llegan');
        if (llegan) llegan.classList.add('visible');
        if (tipo === 'quitar' && dif < 2) $$('#escena .pr-obj').slice(a - b).forEach((o, i) => setTimeout(() => o.classList.add('regalado'), i * 120));
        const lia = $('#escena .lia');
        if (lia) lia.classList.add('visible');
        return Voz.decir(partes2);
      }).then(() => (tk === Juego.token ? Voz.decir(pregunta, { instruccion: true }) : null));
    },
    alRepetir() { Voz.decir(partes1.concat(partes2, pregunta)); },
    foco() { return [$('#escena .problema-esc'), $('#respuestas')]; },
    pista() {
      const cuenta = tipo === 'juntar' ? [a, '+', b, '=', '?'] : [a, '−', b, '=', '?'];
      $('#escena').appendChild(Render.ecuacion(cuenta));
      $$('#escena .pr-fila').forEach(f => f.classList.add('visible'));
      Render.ajustar();
      Pistas.quitarUna();
      return Voz.decir(pregunta);
    }
  };
  return q;
};
