/* =========================================================
   10d. ACTIVIDADES DEL NIVEL DE 7 A 8 AÑOS (versión 4)
   Números hasta 1000, series, sumar y restar llevando, tablas,
   problemas de multiplicar y repartir, fracciones, el reloj con
   minutos y problemas largos. Todas siguen el mismo contrato que
   las demás: consigna hablada, dibujo, pista, demostración y
   respuesta con botones o con el teclado numérico.
   ========================================================= */

/* Opciones con errores típicos para números grandes */
function opcionesGrandes(r, min, max, total, tipicos) {
  const lista = [];
  const anadir = v => { if (v >= min && v <= max && v !== r && lista.indexOf(v) < 0) lista.push(v); };
  (tipicos || []).forEach(anadir);
  [10, -10, 1, -1, 100, -100, 2, -2, 20, -20].forEach(d => anadir(r + d));
  return barajar(lista.slice(0, total + 1)).slice(0, total - 1).concat([r]).sort((a, b) => a - b);
}

/* Cifras de un número en columnas (centenas, decenas, unidades) */
function cifrasDe(n, cols) {
  const s = String(n);
  return rango(0, cols - 1).map(i => { const k = s.length - cols + i; return k >= 0 ? s[k] : ''; });
}

/* Tabla de valor posicional: C D U */
function tablaCDU(n) {
  const s = String(n).padStart(3, ' ');
  const cab = ['C', 'D', 'U'];
  return '<span class="cdu">' + cab.map((c, i) => '<span class="cdu-col cdu-' + c.toLowerCase() + '"><i>' + c + '</i><b>' + (s[i] === ' ' ? '' : s[i]) + '</b></span>').join('') + '</span>';
}

/* Placa de cien (10 x 10) para el material de base diez */
function placaHTML() { return '<span class="placa100 obj"><span class="obj-num"></span></span>'; }
function bloques1000HTML(c, d, u) {
  return '<div class="bloques1000">' +
    (c ? '<div class="b1000-placas" style="grid-template-columns:repeat(' + Math.min(c, 3) + ', 92px)">' + rango(1, c).map(() => placaHTML()).join('') + '</div>' : '') +
    (d ? '<div class="b10-barras">' + rango(1, d).map(() => barraDiezHTML()).join('') + '</div>' : '') +
    (u ? '<div class="b10-cubos">' + rango(1, u).map(() => cuboHTML()).join('') + '</div>' : '') + '</div>';
}

/* Reto con teclado en dificultad alta (para quien ya domina las opciones) */
function aTeclado(q, n, foco) {
  q.opciones = undefined;
  q.foco = foco || (() => [$('#escena .teclado')]);
  return conTeclado(q, n);
}

/* =================== CENTENAS, DECENAS Y UNIDADES =================== */
ACTIVIDADES.centenas = function (dif) {
  let c, d, u;
  if (dif === 0) { c = azar(1, 5); d = rnd() < 0.4 ? 0 : azar(1, 4); u = 0; }
  else if (dif === 1) { c = azar(1, 6); d = azar(0, 5); u = azar(1, 9); }
  else { c = azar(2, 9); d = azar(0, 9); u = azar(0, 9); }
  const n = c * 100 + d * 10 + u;
  const tipicos = [c * 100 + u * 10 + d, d * 100 + c * 10 + u, c * 10 + d * 100 + u, c * 100 + d + u * 10];
  const opciones = opcionesGrandes(n, 100, 999, 3, tipicos);
  const contar = (tk, intro, cierre) => {
    Pistas.contando = true;
    const fin = () => { Pistas.contando = false; };
    return Pistas.contarJuntos(tk, $$('#escena .placa100'), { intro: intro, paso: 100, cierre: null })
      .then(() => (tk === Juego.token && d ? Pistas.contarJuntos(tk, $$('#escena .barra10'), { intro: null, desde: c * 100, paso: 10, cierre: null }) : null))
      .then(() => (tk === Juego.token && u ? Pistas.contarJuntos(tk, $$('#escena .cubo1'), { intro: null, desde: c * 100 + d * 10, cierre: null }) : null))
      .then(() => (tk === Juego.token ? Voz.decir(cierre) : null))
      .then(fin, fin);
  };
  const explica = [N(c * 100)].concat(d ? [N(d * 10)] : [], u ? [N(u)] : [], ['son', N(n)]);
  const q = {
    firma: 'ce' + n,
    respuesta: n,
    opciones: opciones,
    rango: [100, 999],
    instr: ['que_numero_forman'],
    refuerzo: [N(n)],
    ensenar: ['placa_cien'],
    explica: explica,
    pintar(esc, resp) {
      const filas = Math.ceil(c / 3);
      const ancho = 40 + Math.min(c, 3) * 98 + (d ? 30 + d * 27 : 0) + (u ? 30 + 78 : 0);
      const lz = lienzo(Math.max(ancho, 300), Math.max(filas * 98, 210) + 24, 'centenas');
      lz.l.innerHTML = bloques1000HTML(c, d, u);
      esc.appendChild(lz.zona);
      if (resp) botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .bloques1000'), $('#respuestas')]; },
    pista() {
      Pistas.tira('<span class="tira-cien">' + (c * 100) + '</span><span>+</span><span class="tira-dec">' + (d * 10) + '</span><span>+</span><span class="tira-uni">' + u + '</span>');
      Pistas.quitarUna();
      return Voz.decir(['orden_cifras']);
    },
    demo(tk) { return contar(tk, ['de_cien'], ['aqui_hay', N(n)]); }
  };
  if (dif === 2) return aTeclado(q, n, () => [$('#escena .bloques1000'), $('#escena .teclado')]);
  return q;
};

/* =================== LEER Y ESCRIBIR NÚMEROS HASTA 1000 =================== */
ACTIVIDADES.numero1000 = function (dif) {
  let n;
  if (dif === 0) n = 10 * azar(10, 99);
  else n = azar(101, 999);
  if (dif === 2) {
    return conTeclado({
      firma: 'w1000-' + n,
      respuesta: n,
      rango: [100, 999],
      instr: ['escribe_numero', N(n)],
      refuerzo: [N(n)],
      explica: [N(n)],
      pintar(esc) { esc.appendChild(crear('div', 'oreja-grande emo', '👂')); },
      foco() { return [$('#escena .teclado')]; },
      pista() {
        Pistas.tira(tablaCDU(n));
        return Voz.decir(['orden_cifras', 'escribe_numero', N(n)]);
      }
    }, n);
  }
  const s = String(n);
  const tipicos = [Number(s[0] + s[2] + s[1]), Number(s[1] + s[0] + s[2]), Number(s[2] + s[1] + s[0]), n + 100, n - 100, n + 10];
  const opciones = barajar(opcionesGrandes(n, 100, 999, dif === 0 ? 3 : 4, tipicos));
  const instr = ['toca_el', N(n)];
  return {
    firma: 'n1000-' + n + '-' + opciones.join(','),
    respuesta: n,
    opciones: opciones,
    rango: [100, 999],
    sinRespuestas: true,
    instr: instr,
    refuerzo: [N(n)],
    ensenar: ['orden_cifras'],
    explica: [N(n)],
    pintar(esc) {
      const zona = crear('div', 'zona');
      const c = Render.cartas(1.25, 260);
      c.classList.add('cartas-grandes');
      opciones.forEach(v => c.appendChild(Render.carta(v, '<span class="num-largo">' + v + '</span>', String(v))));
      zona.appendChild(c);
      esc.appendChild(zona);
    },
    foco() { return [$('#escena .cartas')]; },
    pista() {
      Pistas.tira(tablaCDU(n));
      Pistas.quitarUna();
      return Voz.decir(instr);
    }
  };
};

/* =================== COMPARAR NÚMEROS HASTA 1000 =================== */
ACTIVIDADES.mayor1000 = function (dif) {
  let a, b;
  const c = azar(1, 9);
  if (dif === 0) { a = azar(1, 9) * 100 + azar(0, 99); do { b = azar(1, 9) * 100 + azar(0, 99); } while (Math.floor(b / 100) === Math.floor(a / 100)); }
  else if (dif === 1) { a = c * 100 + azar(0, 99); do { b = c * 100 + azar(0, 99); } while (Math.floor(b / 10) === Math.floor(a / 10)); }
  else {
    const d = azar(0, 9);
    a = c * 100 + d * 10 + azar(0, 9);
    b = rnd() < 0.2 ? a : c * 100 + d * 10 + azar(0, 9);
    if (rnd() < 0.3) { const s = String(a); b = Number(s[0] + s[2] + s[1]); }   // mismas cifras en otro orden
  }
  const resp = a < b ? '<' : (a > b ? '>' : '=');
  const frase = a < b ? 'menor_que' : (a > b ? 'mayor_que' : 'igual_a');
  return {
    firma: 'm1000-' + a + '-' + b,
    respuesta: resp,
    opciones: ['<', '=', '>'],
    rango: [100, 999],
    instr: ['que_signo'],
    refuerzo: [N(a), frase, N(b)],
    ensenar: ['mira_centenas'],
    explica: ['mira_centenas', N(a), frase, N(b)],
    pintar(esc, respC) {
      const caja = crear('div', 'signos signos-grandes');
      caja.innerHTML = '<div class="sg-num">' + a + '<div class="sg-barras" hidden>' + tablaCDU(a) + '</div></div><div class="sg-hueco"><span class="emo">🐊</span></div><div class="sg-num">' + b + '<div class="sg-barras" hidden>' + tablaCDU(b) + '</div></div>';
      esc.appendChild(caja);
      ['<', '=', '>'].forEach(s => respC.appendChild(Render.botonNumero(s, '<span class="signo-txt">' + s.replace('<', '&lt;').replace('>', '&gt;') + '</span>')));
    },
    foco() { return [$('#escena .sg-hueco'), $('#respuestas')]; },
    pista() {
      $$('#escena .sg-barras').forEach(x => { x.hidden = false; });
      Render.ajustar();
      Pistas.quitarUna();
      return Voz.decir(['mira_centenas', 'que_signo']);
    }
  };
};

/* =================== SERIES DE NÚMEROS =================== */
ACTIVIDADES.seriesNum = function (dif) {
  const pasos = [[2, 5, 10], [3, 4, 5, 10, 20, -2, -5, -10], [20, 50, 100, -10, -20, -50, -100, 4, 3]][dif];
  const k = elegir(pasos);
  const largo = 6;
  const tope = dif === 2 ? 1000 : 100;
  const ak = Math.abs(k);
  let ini = k > 0 ? azar(0, tope - ak * (largo - 1)) : azar(ak * (largo - 1), tope);
  if (dif === 0) ini = Math.floor(ini / ak) * ak;
  else if (ak >= 20) ini = Math.floor(ini / 10) * 10;
  if (k < 0 && ini - ak * (largo - 1) < 0) ini += 10;
  const serie = rango(0, largo - 1).map(i => ini + k * i);
  if (serie.some(v => v < 0 || v > tope)) return ACTIVIDADES.seriesNum(dif);
  const hueco = azar(dif === 0 ? 2 : 1, largo - 1);
  const r = serie[hueco];
  const opciones = opcionesGrandes(r, 0, tope, 3, [r + 1, r - 1, r + k, r - k, r + 10]);
  const frase = (k > 0 ? 'sube_' : 'baja_') + ak;
  const mostrarSaltos = () => { $$('#escena .salto').forEach(s => s.classList.add('visible')); };
  return {
    firma: 'sn' + serie.join(',') + '-' + hueco,
    respuesta: r,
    opciones: opciones,
    rango: [0, tope],
    instr: ['que_falta'],
    refuerzo: [frase],
    ensenar: ['mira_saltos'],
    explica: [frase].concat(serie.slice(0, hueco + 1).map(v => N(v))),
    pintar(esc, resp) {
      const lz = lienzo(760, 210, 'serie-num');
      lz.l.innerHTML = serie.map((v, i) => (i ? '<span class="salto">' + (k > 0 ? '+' : '−') + ak + '</span>' : '') +
        '<span class="sn-carta' + (i === hueco ? ' hueco' : '') + '" data-i="' + i + '">' + (i === hueco ? '?' : v) + '</span>').join('');
      esc.appendChild(lz.zona);
      botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .serie-num'), $('#respuestas')]; },
    pista() {
      mostrarSaltos();
      Pistas.quitarUna();
      return Voz.decir(['mira_saltos', frase]);
    },
    demo(tk) {
      mostrarSaltos();
      const pasos = serie.slice(0, hueco + 1).map((v, i) => ({
        el: $('#escena .sn-carta[data-i="' + i + '"]'),
        partes: [N(v)],
        antes: i === hueco ? () => { const c = $('#escena .sn-carta.hueco'); if (c) { c.textContent = v; c.classList.add('resuelto'); } } : null
      }));
      return Pistas.leer(tk, pasos, null, ['mira_como', frase]);
    }
  };
};

/* =================== SUMAR Y RESTAR LLEVANDO (en columnas) =================== */
function cuentaHTML(a, b, signo, cols) {
  const cab = ['C', 'D', 'U'].slice(3 - cols);
  const fila = (cls, celdas, izq) => '<div class="co-fila ' + cls + '"><span class="co-signo">' + (izq || '') + '</span>' +
    celdas.map((x, i) => '<span class="co-c co-c' + (cols - i) + '">' + x + '</span>').join('') + '</div>';
  return '<div class="col-op" style="--cols:' + cols + '">' +
    fila('co-cab', cab.map(c => '<i class="cab-' + c.toLowerCase() + '">' + c + '</i>')) +
    fila('co-llevo', cab.map(() => '<i></i>')) +
    fila('co-a', cifrasDe(a, cols).map(x => '<b>' + x + '</b>')) +
    fila('co-b', cifrasDe(b, cols).map(x => '<b>' + x + '</b>'), signo) +
    '<div class="co-raya"></div>' +
    fila('co-res', cab.map(() => '<i class="co-hueco"></i>')) + '</div>';
}
/* Escribe una cifra en el resultado o en la fila de "me llevo" */
function ponerCifra(fila, col, v) {
  const el = $('#escena .co-' + fila + ' .co-c' + col + ' i');
  if (!el) return;
  el.textContent = v;
  el.classList.add('puesta');
}
function focoColumna(col) { const c = $('#escena .col-op'); if (c) c.dataset.foco = col || ''; }

ACTIVIDADES.sumaLlevar = function (dif) {
  let a, b;
  for (let k = 0; k < 300; k++) {
    if (dif === 0) { a = azar(12, 88); b = azar(2, 9); }
    else if (dif === 1) { a = azar(15, 79); b = azar(12, 99 - a); }
    else if (rnd() < 0.5) { a = azar(35, 98); b = azar(25, 98); }
    else { a = azar(101, 899); b = azar(12, 89); }
    if (b < 1) continue;
    const ua = a % 10, ub = b % 10;
    const daTens = Math.floor(a / 10) % 10, dbTens = Math.floor(b / 10) % 10;
    if (ua + ub < 10) continue;                       // siempre hay que llevar en las unidades
    if (dif < 2 && a + b > 99) continue;
    if (dif === 2 && a > 100 && daTens + dbTens + 1 >= 10) continue;   // con centenas: solo se lleva una vez
    if (dif === 2 && a < 100 && a + b < 100) continue;
    break;
  }
  const r = a + b;
  const cols = r >= 100 || a >= 100 ? 3 : 2;
  const ua = a % 10, ub = b % 10, su = ua + ub;
  const da = Math.floor(a / 10) % 10, db = Math.floor(b / 10) % 10, sd = da + db + 1;
  const pegado = (Math.floor(a / 10) + Math.floor(b / 10)) * 100 + su;   // error típico: escribir "doce" sin llevar
  const opciones = opcionesGrandes(r, 0, 999, 3, [r - 10, pegado, r + 10, r - 1]);
  const q = {
    firma: 'sl' + a + '+' + b,
    respuesta: r,
    opciones: opciones,
    rango: [0, 999],
    instr: [N(a), 'mas', N(b), 'cuanto_es'],
    refuerzo: [N(a), 'mas', N(b), 'son', N(r)],
    ensenar: ['sumamos_unidades', 'diez_unidades', 'nos_llevamos'],
    explica: ['sumamos_unidades', N(ua), 'mas', N(ub), 'son', N(su), 'nos_llevamos', 'ahora_decenas', 'en_total', N(r)],
    pintar(esc, resp) {
      const lz = lienzo(420, 380, 'llevar');
      lz.l.innerHTML = cuentaHTML(a, b, '+', cols);
      esc.appendChild(lz.zona);
      if (resp) botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .col-op'), $('#respuestas')]; },
    pista() {
      focoColumna(1);
      ponerCifra('llevo', 2, '1');
      Pistas.tira('<span class="tira-uni">' + ua + ' + ' + ub + ' = ' + su + '</span><span>→</span><span class="tira-dec">10</span><span>+</span><span class="tira-uni">' + (su - 10) + '</span>');
      Pistas.quitarUna();
      return Voz.decir(['sumamos_unidades', N(ua), 'mas', N(ub), 'son', N(su), 'diez_unidades', 'nos_llevamos']);
    },
    demo(tk) {
      const pasos = [
        { el: $('#escena .col-op'), antes: () => focoColumna(1), partes: ['sumamos_unidades', N(ua), 'mas', N(ub), 'son', N(su)] },
        { el: $('#escena .col-op'), antes: () => { ponerCifra('res', 1, su % 10); ponerCifra('llevo', 2, '1'); }, partes: ['diez_unidades', 'nos_llevamos'] },
        { el: $('#escena .col-op'), antes: () => focoColumna(2), partes: ['ahora_decenas', N(da), 'mas', N(db), 'mas', N(1), 'son', N(sd)] },
        { el: $('#escena .col-op'), antes: () => { ponerCifra('res', 2, sd % 10); if (sd >= 10) ponerCifra('llevo', 3, '1'); }, partes: sd >= 10 ? ['diez_decenas'] : null }
      ];
      return Pistas.leer(tk, pasos, null, ['mira_como']).then(() => {
        if (tk !== Juego.token) return null;
        if (cols === 3) { focoColumna(3); ponerCifra('res', 3, Math.floor(r / 100)); }
        else focoColumna(0);
        return Voz.decir(['en_total', N(r)]);
      });
    }
  };
  if (dif === 2) return aTeclado(q, r, () => [$('#escena .col-op'), $('#escena .teclado')]);
  return q;
};

ACTIVIDADES.restaLlevar = function (dif) {
  let a, b;
  for (let k = 0; k < 300; k++) {
    if (dif === 0) { a = azar(20, 95); b = azar(2, 9); }
    else if (dif === 1) { a = azar(30, 98); b = azar(11, a - 10); }
    else { a = azar(110, 980); b = azar(12, 89); }
    const ua = a % 10, ub = b % 10;
    const da = Math.floor(a / 10) % 10, db = Math.floor(b / 10) % 10;
    if (ua >= ub) continue;                 // siempre hay que llevar en las unidades
    if (da - 1 < db) continue;              // solo una llevada
    if (dif === 1 && a - b < 10) continue;
    break;
  }
  const r = a - b;
  const cols = a >= 100 ? 3 : 2;
  const ua = a % 10, ub = b % 10, da = Math.floor(a / 10) % 10, db = Math.floor(b / 10) % 10;
  const ru = ua + 10 - ub, rd = da - 1 - db;
  const alReves = (Math.floor(a / 10) - Math.floor(b / 10)) * 10 + (ub - ua);   // error típico: restar al revés en las unidades
  const opciones = opcionesGrandes(r, 0, 999, 3, [alReves, r + 10, r - 10, r + 1]);
  const romper = () => {
    const d = $('#escena .co-a .co-c2 b'), u = $('#escena .co-a .co-c1 b');
    if (d && !d.classList.contains('tachado')) { d.classList.add('tachado'); d.insertAdjacentHTML('afterend', '<sup class="nueva">' + (da - 1) + '</sup>'); }
    if (u && !u.classList.contains('con-diez')) { u.classList.add('con-diez'); u.insertAdjacentHTML('beforebegin', '<sup class="diez">1</sup>'); }
  };
  const q = {
    firma: 'rl' + a + '-' + b,
    respuesta: r,
    opciones: opciones,
    rango: [0, 999],
    instr: [N(a), 'menos', N(b), 'cuanto_es'],
    refuerzo: [N(a), 'menos', N(b), sonEs(r), N(r)],
    ensenar: ['restamos_unidades', 'no_hay_bastantes', 'rompemos_decena'],
    explica: ['no_hay_bastantes', 'rompemos_decena', 'en_total', N(r)],
    pintar(esc, resp) {
      const lz = lienzo(420, 380, 'llevar');
      lz.l.innerHTML = cuentaHTML(a, b, '−', cols);
      esc.appendChild(lz.zona);
      if (resp) botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .col-op'), $('#respuestas')]; },
    pista() {
      focoColumna(1);
      romper();
      Pistas.tira('<span class="tira-uni">' + (ua + 10) + ' − ' + ub + ' = ' + ru + '</span><span class="tira-dec">' + (da - 1) + ' − ' + db + ' = ' + rd + '</span>');
      Pistas.quitarUna();
      return Voz.decir(['no_hay_bastantes', 'rompemos_decena']);
    },
    demo(tk) {
      const op = $('#escena .col-op');
      const pasos = [
        { el: op, antes: () => focoColumna(1), partes: ['restamos_unidades', N(ua), 'menos', N(ub), 'no_hay_bastantes'] },
        { el: op, antes: romper, partes: ['rompemos_decena'] },
        { el: op, antes: null, partes: [N(ua + 10), 'menos', N(ub), sonEs(ru), N(ru)] },
        { el: op, antes: () => { ponerCifra('res', 1, ru); focoColumna(2); }, partes: ['ahora_restamos_decenas', N(da - 1), 'menos', N(db), sonEs(rd), N(rd)] }
      ];
      return Pistas.leer(tk, pasos, null, ['mira_como']).then(() => {
        if (tk !== Juego.token) return null;
        if (rd || cols === 3) ponerCifra('res', 2, rd);
        if (cols === 3) { focoColumna(3); ponerCifra('res', 3, Math.floor(r / 100)); } else focoColumna(0);
        return Voz.decir(['en_total', N(r)]);
      });
    }
  };
  if (dif === 2) return aTeclado(q, r, () => [$('#escena .col-op'), $('#escena .teclado')]);
  return q;
};

/* =================== TABLAS DE MULTIPLICAR =================== */
ACTIVIDADES.tablas = function (dif) {
  const tablas = [[2, 5, 10], [2, 3, 4, 5, 10], [3, 4, 6, 7, 8, 9]][dif];
  const k = elegir(tablas);
  const i = azar(dif === 0 ? 1 : 2, 10);
  const r = k * i;
  const opciones = opcionesGrandes(r, 0, 100, dif === 0 ? 3 : 4, [r + k, r - k, r + i, r - i, r + 1]);
  const obj = elegir(['estrella', 'manzana', 'flor', 'galleta', 'pez', 'globo']);
  const e = OBJ[obj].e;
  const contarFilas = (tk, intro, cierre) => Pistas.contar(tk, $$('#escena .tb-fila'), { intro: intro, paso: k, cierre: cierre });
  const q = {
    firma: 'tb' + k + 'x' + i,
    respuesta: r,
    opciones: opciones,
    rango: [0, 100],
    instr: [N(k), 'por', N(i), 'cuanto_es'],
    refuerzo: [N(k), 'por', N(i), sonEs(r), N(r)],
    ensenar: ['multiplicar_es'],
    explica: ['tabla_del', N(k)].concat(rango(1, i).map(x => N(k * x)), [N(k), 'por', N(i), sonEs(r), N(r)]),
    pintar(esc, resp) {
      const lz = lienzo(84 + k * 58, Math.max(i * 60, 120), 'tablas');
      const filas = crear('div', 'tb-filas' + (dif === 2 ? ' tapadas' : ''));
      for (let f = 0; f < i; f++) filas.appendChild(crear('div', 'tb-fila obj', '<span class="obj-num"></span>' + rango(1, k).map(() => '<span class="emo tb-obj">' + e + '</span>').join('')));
      lz.l.appendChild(filas);
      esc.appendChild(lz.zona);
      esc.appendChild(Render.ecuacion([k, '×', i, '=', '?']));
      if (resp) botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .tb-filas'), $('#respuestas')]; },
    pista(tk) {
      const f = $('#escena .tb-filas');
      if (f) f.classList.remove('tapadas');
      Pistas.quitarUna();
      return contarFilas(tk, ['contamos_filas'], [N(k), 'por', N(i), 'cuanto_es']);
    },
    demo(tk) {
      const f = $('#escena .tb-filas');
      if (f) f.classList.remove('tapadas');
      return contarFilas(tk, ['mira_como', 'contamos_filas'], [N(k), 'por', N(i), sonEs(r), N(r)]);
    }
  };
  if (dif === 2) return aTeclado(q, r, () => [$('#escena .ecuacion'), $('#escena .teclado')]);
  return q;
};

/* =================== PROBLEMAS DE MULTIPLICAR Y DE REPARTIR =================== */
const CONTENEDORES = [
  { id: 'bolsas', e: '👜', g: 'f' }, { id: 'cajas', e: '📦', g: 'f' }, { id: 'cestas', e: '🧺', g: 'f' },
  { id: 'naves', e: '🛸', g: 'f' }, { id: 'platos', e: '🍽️', g: 'm' }
];
ACTIVIDADES.multiplicar = function (dif) {
  const repartir = dif > 0 && rnd() < 0.4;
  const k = repartir ? azar(2, dif === 2 ? 6 : 5) : (dif === 0 ? elegir([2, 5, 10]) : (dif === 1 ? azar(2, 5) : azar(3, 9)));
  const g = repartir ? azar(2, 4) : azar(2, dif === 2 ? 9 : 5);
  const t = g * k;
  const obj = elegir(['estrella', 'manzana', 'galleta', 'pez', 'flor', 'globo', 'roca']);
  const o = OBJ[obj];
  const cont = repartir ? null : elegir(CONTENEDORES);
  let instr, resp, explica, opciones;
  if (!repartir) {
    instr = ['hay', N(g), 'c_' + cont.id, cont.g === 'f' ? 'en_cada_una' : 'en_cada_uno'].concat(cant(k, obj), ['cuantos_' + obj]);
    resp = t;
    explica = [N(g), 'grupos_de', N(k)].concat([N(g), 'por', N(k), sonEs(t), N(t)]);
    opciones = opcionesGrandes(t, 1, 100, 3, [t + k, t - k, g + k, t + g]);
  } else {
    instr = ['repartimos', N(t), 'o_' + obj + '_p', 'entre', N(g), 'o_astronauta_p', o.g === 'f' ? 'cuantas_cada' : 'cuantos_cada'];
    resp = k;
    explica = ['reparte_grupos', N(g), 'por', N(k), sonEs(t), N(t)];
    opciones = opcionesCercanas(k, 1, 12, 3);
  }
  const verDentro = dif < 2;
  const q = {
    firma: (repartir ? 'dv' : 'mu') + g + 'x' + k + obj,
    respuesta: resp,
    opciones: opciones,
    rango: [1, 100],
    instr: instr,
    refuerzo: repartir ? [N(k)] : [N(t)],
    ensenar: repartir ? ['una_cada'] : ['multiplicar_es'],
    explica: explica,
    pintar(esc, respC) {
      const cols = g <= 3 ? g : Math.ceil(g / 2), filas = Math.ceil(g / cols);
      const lz = repartir ? lienzo(680, 380, 'multi') : lienzo(cols * 168 + 10, filas * (verDentro ? 220 : 170) + 10, 'multi');
      const zona = lz.l;
      if (!repartir) {
        const c = crear('div', 'mu-grupos');
        for (let i = 0; i < g; i++) {
          c.appendChild(crear('div', 'mu-grupo obj', '<span class="obj-num"></span><span class="emo mu-cont">' + cont.e + '</span>' +
            (verDentro ? '<span class="mu-dentro' + (k === 10 ? ' diez' : '') + '">' + rango(1, k).map(() => '<span class="emo">' + o.e + '</span>').join('') + '</span>'
              : '<span class="mu-etiqueta">' + k + '<span class="emo">' + o.e + '</span></span>')));
        }
        zona.appendChild(c);
      } else {
        zona.innerHTML = '<div class="dv-pila">' + rango(1, t).map(() => '<span class="emo">' + o.e + '</span>').join('') + '</div>' +
          '<div class="dv-platos">' + rango(1, g).map(i => '<div class="dv-plato obj"><span class="obj-num"></span><span class="emo dv-quien">' + ['🧑‍🚀', '👩‍🚀', '👨‍🚀', '🤖'][(i - 1) % 4] + '</span><span class="dv-dentro"></span></div>').join('') + '</div>';
      }
      esc.appendChild(lz.zona);
      esc.appendChild(Render.ecuacion(repartir ? [t, '÷', g, '=', '?'] : [g, '×', k, '=', '?']));
      if (respC) botonesNumero(respC, opciones);
    },
    foco() { return [$('#escena .lienzo.multi'), $('#respuestas')]; },
    pista(tk) {
      Pistas.quitarUna();
      if (repartir) { q.repartirTodo(); return Voz.decir(['una_cada'].concat(instr.slice(-1))); }
      if (!verDentro) $$('#escena .mu-grupo').forEach(x => x.insertAdjacentHTML('beforeend', '<span class="mu-dentro">' + rango(1, k).map(() => '<span class="emo">' + o.e + '</span>').join('') + '</span>'));
      Render.ajustar();
      return Pistas.contar(tk, $$('#escena .mu-grupo'), { intro: ['cuenta_grupos'], paso: k, cierre: instr.slice(-1) });
    },
    demo(tk) {
      if (repartir) { q.repartirTodo(); return Voz.decir(['mira_como', 'una_cada'].concat([N(t), 'entre', N(g), sonEs(k), N(k)])); }
      return Pistas.contar(tk, $$('#escena .mu-grupo'), { intro: ['mira_como', 'cuenta_grupos'], paso: k, cierre: ['en_total', N(t)] });
    },
    repartirTodo() {
      const pila = $('#escena .dv-pila');
      if (!pila || pila.classList.contains('repartida')) return;
      pila.classList.add('repartida');
      $$('#escena .dv-dentro').forEach(d => { d.innerHTML = rango(1, k).map(() => '<span class="emo">' + o.e + '</span>').join(''); });
      Render.ajustar();
    }
  };
  if (dif === 2 && !repartir) return aTeclado(q, resp, () => [$('#escena .lienzo.multi'), $('#escena .teclado')]);
  return q;
};

/* =================== FRACCIONES =================== */
const FRACCIONES = { 0: ['1/2', '1/3', '1/4'], 1: ['1/2', '1/3', '1/4', '2/3', '3/4', '2/4'], 2: ['1/2', '1/3', '1/4', '2/3', '3/4', '2/4'] };
function fracHTML(f) { const p = f.split('/'); return '<span class="frac"><b>' + p[0] + '</b><i></i><b>' + p[1] + '</b></span>'; }
function fraseFrac(f) { return 'fr_' + f.replace('/', '_'); }

/* Dibujo de una fracción: pizza (círculo), barra o cuadrado. op.desigual = partes que no son iguales */
function fraccionSVG(f, forma, op) {
  op = op || {};
  const p = f.split('/').map(Number), k = p[0], n = p[1];
  const lleno = op.color || '#FF9F43', vacio = '#FFF3DC', borde = '#7A4A1E';
  let h = '';
  let partes = rango(1, n).map(() => 1 / n);
  if (op.desigual) partes = n === 2 ? [0.68, 0.32] : (n === 3 ? [0.5, 0.25, 0.25] : [0.4, 0.2, 0.2, 0.2]);
  if (forma === 'pizza') {
    let a0 = -Math.PI / 2;
    h += '<circle cx="60" cy="60" r="54" fill="#E9B872"/>';
    partes.forEach((fr, i) => {
      const a1 = a0 + fr * 2 * Math.PI;
      const x0 = 60 + 48 * Math.cos(a0), y0 = 60 + 48 * Math.sin(a0), x1 = 60 + 48 * Math.cos(a1), y1 = 60 + 48 * Math.sin(a1);
      h += '<path class="fr-parte" d="M60 60 L' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A48 48 0 ' + (fr > 0.5 ? 1 : 0) + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Z" fill="' + (i < k ? lleno : vacio) + '" stroke="' + borde + '" stroke-width="2.5" stroke-linejoin="round"/>';
      a0 = a1;
    });
  } else if (forma === 'barra') {
    let x = 6;
    partes.forEach((fr, i) => {
      const w = fr * 108;
      h += '<rect class="fr-parte" x="' + x.toFixed(1) + '" y="34" width="' + w.toFixed(1) + '" height="52" fill="' + (i < k ? lleno : vacio) + '" stroke="' + borde + '" stroke-width="2.5"/>';
      x += w;
    });
  } else {
    // cuadrado: medios y cuartos en rejilla, tercios en franjas
    if (n === 4 && !op.desigual) {
      [[8, 8], [60, 8], [8, 60], [60, 60]].forEach((c, i) => { h += '<rect class="fr-parte" x="' + c[0] + '" y="' + c[1] + '" width="52" height="52" fill="' + (i < k ? lleno : vacio) + '" stroke="' + borde + '" stroke-width="2.5"/>'; });
    } else {
      let y = 8;
      partes.forEach((fr, i) => {
        const hh = fr * 104;
        h += '<rect class="fr-parte" x="8" y="' + y.toFixed(1) + '" width="104" height="' + hh.toFixed(1) + '" fill="' + (i < k ? lleno : vacio) + '" stroke="' + borde + '" stroke-width="2.5"/>';
        y += hh;
      });
    }
  }
  return '<svg class="fraccion-svg" viewBox="0 0 120 120" aria-hidden="true">' + h + '</svg>';
}

ACTIVIDADES.fracciones = function (dif) {
  const lista = FRACCIONES[dif];
  const f = elegir(lista);
  const n = Number(f.split('/')[1]), k = Number(f.split('/')[0]);
  const forma = elegir(['pizza', 'barra', 'cuadrado']);
  const modo = dif === 0 ? elegir(['lee', 'elige']) : (dif === 1 ? elegir(['lee', 'elige']) : 'elige');
  const explica = ['partido_en', N(n), 'partes_iguales', 'pintamos', k === 1 ? 'una' : N(k), fraseFrac(f)];
  const otras = barajar(lista.filter(x => x !== f && (dif > 0 || x.split('/')[1] !== f.split('/')[1])));
  if (modo === 'lee') {
    const opciones = barajar([f].concat(otras.slice(0, dif === 0 ? 2 : 3)));
    return {
      firma: 'frl' + f + forma + opciones.join(','),
      respuesta: f,
      opciones: opciones,
      instr: ['que_parte'],
      refuerzo: [fraseFrac(f)],
      ensenar: ['iguales_importa'],
      explica: explica,
      pintar(esc, resp) {
        const zona = crear('div', 'zona');
        const d = crear('div', 'fraccion-grande', fraccionSVG(f, forma));
        d.dataset.ajustar = 'cuadrado';
        d.dataset.max = 280;
        zona.appendChild(d);
        esc.appendChild(zona);
        opciones.forEach(v => resp.appendChild(Render.botonNumero(v, fracHTML(v))));
      },
      foco() { return [$('#escena .fraccion-grande'), $('#respuestas')]; },
      pista() {
        $$('#escena .fr-parte').forEach(p => p.classList.add('marcada'));
        Pistas.tira('<span>' + n + ' = ' + rango(1, n).map(() => '▢').join(' ') + '</span>');
        Pistas.quitarUna();
        return Voz.decir(['partido_en', N(n), 'partes_iguales', 'que_parte']);
      }
    };
  }
  // Elegir el dibujo correcto entre varios (en el nivel difícil, uno tiene partes desiguales)
  const dibujos = [{ f: f, forma: forma, ok: true }];
  otras.slice(0, 2).forEach(x => dibujos.push({ f: x, forma: elegir(['pizza', 'barra', 'cuadrado']) }));
  if (dif === 2) dibujos[dibujos.length - 1] = { f: f, forma: elegir(['pizza', 'barra']), desigual: true };
  const orden = barajar(dibujos.map((d, i) => i));
  const instr = ['toca_dibujo_con', fraseFrac(f), 'pintado'];
  return {
    firma: 'fre' + f + orden.join('') + dibujos.map(d => d.f + d.forma).join(','),
    respuesta: 'ok',
    opciones: orden.map(i => (dibujos[i].ok ? 'ok' : 'no' + i)),
    sinRespuestas: true,
    instr: instr,
    refuerzo: [fraseFrac(f)],
    ensenar: ['iguales_importa'],
    explica: explica,
    pintar(esc) {
      const zona = crear('div', 'zona');
      const c = Render.cartas(1, 240);
      orden.forEach(i => {
        const d = dibujos[i];
        c.appendChild(Render.carta(d.ok ? 'ok' : 'no' + i, fraccionSVG(d.f, d.forma, { desigual: d.desigual }), d.ok ? f : 'otro'));
      });
      zona.appendChild(c);
      esc.appendChild(zona);
      esc.appendChild(crear('div', 'fr-objetivo', fracHTML(f)));
    },
    foco() { return [$('#escena .cartas')]; },
    pista() {
      Pistas.quitarUna();
      return Voz.decir(['iguales_importa'].concat(instr));
    }
  };
};

/* Fracción de una cantidad: la mitad, un tercio, un cuarto */
ACTIVIDADES.fraccionDe = function (dif) {
  const den = dif === 0 ? 2 : elegir([2, 3, 4]);
  const cada = dif === 0 ? azar(2, 6) : (dif === 1 ? azar(2, 5) : azar(4, 10));
  const n = den * cada;
  const intro = den === 2 ? 'la_mitad_de' : (den === 3 ? 'tercio_de' : 'cuarto_de');
  const obj = elegir(['manzana', 'galleta', 'estrella', 'flor', 'pez']);
  const e = OBJ[obj].e;
  const opciones = opcionesCercanas(cada, 1, 40, 3);
  const instr = [intro, N(n), 'cuanto_es'];
  const repartir = () => {
    const z = $('#escena .fd-zona');
    if (!z || z.classList.contains('repartida')) return;
    z.classList.add('repartida');
    z.innerHTML = '<div class="fd-grupos">' + rango(1, den).map(() => '<div class="fd-grupo obj"><span class="obj-num"></span>' + rango(1, cada).map(() => '<span class="emo">' + e + '</span>').join('') + '</div>').join('') + '</div>';
    Render.ajustar();
  };
  return {
    firma: 'fd' + den + '-' + n + obj,
    respuesta: cada,
    opciones: opciones,
    rango: [1, 40],
    instr: instr,
    refuerzo: [intro, N(n), sonEs(cada), N(cada)],
    ensenar: ['reparte_grupos'],
    explica: ['reparte_grupos', intro, N(n), sonEs(cada), N(cada)],
    pintar(esc, resp) {
      const zona = crear('div', 'zona fd-zona');
      const r = Render.rejilla(rango(1, n).map(() => e), { contable: false, max: 96 });
      zona.appendChild(r);
      esc.appendChild(zona);
      esc.appendChild(crear('div', 'fr-objetivo', fracHTML('1/' + den) + '<span class="fr-de">de ' + n + '</span>'));
      botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .fd-zona'), $('#respuestas')]; },
    pista() { repartir(); Pistas.quitarUna(); return Voz.decir(['reparte_grupos'].concat(instr)); },
    demo(tk) {
      repartir();
      return Voz.decir(['mira_como', 'reparte_grupos']).then(() => (tk === Juego.token ? Pistas.contar(tk, $$('#escena .fd-grupo .emo').slice(0, cada), { intro: null, cierre: [intro, N(n), sonEs(cada), N(cada)] }) : null));
    }
  };
};

/* =================== EL RELOJ CON MINUTOS =================== */
function horaHablada(h, m) { const hh = m >= 35 ? (h % 12) + 1 : h; return ['hh_' + hh, 'm_' + String(m).padStart(2, '0')]; }
function dichoMin(h, m) { const hh = m >= 35 ? (h % 12) + 1 : h; return [hh === 1 ? 'es_la' : 'son_las'].concat(horaHablada(h, m)); }
function textoMin(h, m) { return h + ':' + String(m).padStart(2, '0'); }
ACTIVIDADES.relojMinutos = function (dif) {
  const vecina = h => ((h + elegir([-1, 1]) + 11) % 12) + 1;
  const h = azar(1, 12);
  const m = dif === 0 ? elegir([15, 45, 15, 45, 30, 0]) : 5 * azar(1, 11);
  const lista = [[h, m]];
  const anadir = par => { if (par[1] >= 0 && par[1] < 60 && !lista.some(x => x[0] === par[0] && x[1] === par[1])) lista.push(par); };
  if (m !== 0 && m !== 30) anadir([h, 60 - m]);
  if (m >= 35) anadir([(h % 12) + 1, m]);                    // error típico: leer la hora siguiente
  anadir([h, (m + (dif === 0 ? 15 : 5)) % 60]);
  const hm = Math.round(m / 5) || 12;
  if (dif === 2 && hm !== h) anadir([hm, (h * 5) % 60]);    // agujas cambiadas
  anadir([vecina(h), m]);
  while (lista.length < 3) anadir([azar(1, 12), dif === 0 ? elegir([0, 15, 30, 45]) : 5 * azar(0, 11)]);
  const horas = barajar(lista.slice(0, 3));
  const modo = dif === 2 ? elegir(['digital', 'lee']) : elegir(['elige', 'lee']);
  const clave = textoMin(h, m);
  const instr = modo === 'elige' ? ['toca_reloj'].concat(horaHablada(h, m)) : (modo === 'digital' ? ['misma_hora'] : ['que_hora']);
  const verMin = dif === 0;
  const mostrarMinutos = () => { $$('#escena .reloj-svg').forEach(s => s.classList.add('ver-min', 'agujas-marcadas')); };
  return {
    firma: 'rm' + modo + clave + horas.map(x => textoMin(x[0], x[1])).join(','),
    respuesta: clave,
    opciones: horas.map(x => textoMin(x[0], x[1])),
    sinRespuestas: modo !== 'lee',
    instr: instr,
    refuerzo: dichoMin(h, m),
    ensenar: ['aguja_minutos', 'cada_cinco'],
    explica: ['aguja_minutos'].concat(dichoMin(h, m)),
    pintar(esc, resp) {
      const zona = crear('div', 'zona');
      if (modo === 'lee') {
        const r = crear('div', 'reloj-grande', relojSVG(h, m, { minutos: true, verMinutos: verMin }));
        r.dataset.ajustar = 'cuadrado';
        r.dataset.max = 320;
        zona.appendChild(r);
        horas.forEach(x => resp.appendChild(Render.botonNumero(textoMin(x[0], x[1]), '<span class="hora-dig">' + textoMin(x[0], x[1]) + '</span>')));
      } else {
        if (modo === 'digital') zona.appendChild(crear('div', 'reloj-digital', '<span>' + clave + '</span>'));
        const c = Render.cartas(1, 230);
        horas.forEach(x => c.appendChild(Render.carta(textoMin(x[0], x[1]), relojSVG(x[0], x[1], { minutos: true, verMinutos: verMin }), textoMin(x[0], x[1]))));
        zona.appendChild(c);
      }
      esc.appendChild(zona);
    },
    foco() { return [modo === 'lee' ? $('#escena .reloj-grande') : $('#escena .cartas'), $('#respuestas')]; },
    pista() {
      mostrarMinutos();
      Pistas.quitarUna();
      return Voz.decir(['aguja_minutos', 'cada_cinco'].concat(m >= 35 ? ['pasada_media'] : [], instr));
    },
    demo(tk) {
      mostrarMinutos();
      const pasos = [];
      const limite = m >= 35 ? 60 - m : m;
      for (let v = 5; v <= limite; v += 5) pasos.push({ el: null, partes: [N(v)] });
      return Pistas.leer(tk, pasos, null, ['mira_como', 'aguja_minutos']).then(() => (tk === Juego.token ? Voz.decir((m >= 35 ? ['pasada_media'] : []).concat(dichoMin(h, m))) : null));
    }
  };
};

/* =================== PROBLEMAS LARGOS (hasta 100) =================== */
ACTIVIDADES.problemaLargo = function (dif) {
  const tipo = elegir(dif === 0 ? ['comparar', 'dos'] : ['dos', 'nave', 'regala', 'comparar']);
  const max = dif === 0 ? 50 : 100;
  const obj = tipo === 'nave' ? 'astronauta' : elegir(OBJETOS_PROBLEMA);
  let a, b, c = 0, r;
  for (let k = 0; k < 200; k++) {
    a = azar(12, max - 10);
    if (tipo === 'comparar') { b = azar(5, a - 3); r = a - b; break; }
    b = azar(5, Math.min(40, max - a));
    c = azar(4, Math.min(a + b - 2, 45));
    r = a + b - c;
    if (r >= 2 && a + b <= max && c !== b) break;
  }
  const e = OBJ[obj].e;
  let p1, p2, p3, pregunta, explica, iconos;
  if (tipo === 'comparar') {
    p1 = ['pipo_tiene'].concat(cant(a, obj)); p2 = ['lia_tiene', N(b)]; p3 = null; pregunta = ['mas_tiene_' + obj];
    explica = [N(a), 'menos', N(b), sonEs(r), N(r)];
    iconos = ['🐸', '👧'];
  } else {
    const nave = tipo === 'nave';
    p1 = (nave ? ['en_nave_hay'] : ['pipo_tiene']).concat(cant(a, obj));
    p2 = tipo === 'regala' ? ['le_dan', N(b), 'mas_fin'] : [nave ? 'suben' : 'gana', N(b)];
    p3 = tipo === 'regala' ? ['regala', N(c)] : [nave ? 'bajan' : 'gasta', N(c)];
    pregunta = [nave ? 'cuantos_ahora' : (tipo === 'regala' ? 'le_quedan_' + obj : 'ahora_tiene_' + obj)];
    explica = ['piensa_pasos', N(a), 'mas', N(b), sonEs(a + b), N(a + b), N(a + b), 'menos', N(c), sonEs(r), N(r)];
    iconos = [nave ? '🛸' : '🐸'];
  }
  const opciones = opcionesGrandes(r, 0, 100, 4, tipo === 'comparar' ? [a + b, r + 10, r - 10] : [a + b, a + b + c, r + 10, r - 10]);
  const pasosTxt = tipo === 'comparar'
    ? '<div class="p2-paso"><span class="emo">' + iconos[0] + '</span><b>' + a + '</b></div><div class="p2-paso suben"><span class="emo">' + iconos[1] + '</span><b>' + b + '</b></div><div class="p2-paso q"><span class="emo">' + e + '</span><b>?</b></div>'
    : '<div class="p2-paso"><span class="emo">' + iconos[0] + '</span><b>' + a + '</b></div><div class="p2-paso suben"><span class="emo">⬆️</span><b>+' + b + '</b></div>' +
      '<div class="p2-paso bajan"><span class="emo">⬇️</span><b>−' + c + '</b></div><div class="p2-paso q"><span class="emo">' + e + '</span><b>?</b></div>';
  const todo = p1.concat(p2, p3 || [], pregunta);
  const q = {
    firma: 'pl' + tipo + a + '-' + b + '-' + c + obj,
    respuesta: r,
    opciones: opciones,
    rango: [0, 100],
    instr: todo,
    refuerzo: [N(r)],
    ensenar: ['piensa_pasos'],
    explica: explica,
    pintar(esc, resp) {
      const caja = crear('div', 'problema2-esc problema-largo');
      caja.innerHTML = pasosTxt;
      esc.appendChild(caja);
      $$('.p2-paso .emo', caja).forEach(x => { if (x.textContent === '🐸') x.innerHTML = '<span class="mini-pipo">' + Mascota.html() + '</span>'; });
      if (resp) botonesNumero(resp, opciones);
    },
    hablar(tk, intro) {
      const pasos = $$('#escena .p2-paso');
      const ver = i => { if (pasos[i]) pasos[i].classList.add('visible'); };
      let cadena = Voz.decir(intro.concat(p1)).then(() => { if (tk !== Juego.token) return null; ver(1); return Voz.decir(p2); });
      if (p3) cadena = cadena.then(() => { if (tk !== Juego.token) return null; ver(2); return Voz.decir(p3); });
      return cadena.then(() => { if (tk !== Juego.token) return null; ver(pasos.length - 1); return Voz.decir(pregunta, { instruccion: true }); });
    },
    alRepetir() { $$('#escena .p2-paso').forEach(p => p.classList.add('visible')); Voz.decir(todo); },
    alReanudar(tk) { $$('#escena .p2-paso').forEach(p => p.classList.add('visible')); Voz.decir(pregunta).then(() => { if (tk === Juego.token) Juego.finInstruccion = Date.now(); }); },
    foco() { return [$('#escena .problema2-esc'), $('#respuestas')]; },
    pista() {
      $$('#escena .p2-paso').forEach(p => p.classList.add('visible'));
      Pistas.tira(tipo === 'comparar' ? '<span>' + a + ' − ' + b + ' = ?</span>' : '<span>' + a + ' + ' + b + ' = ' + (a + b) + '</span><span>' + (a + b) + ' − ' + c + ' = ?</span>');
      Pistas.quitarUna();
      return Voz.decir(['piensa_pasos'].concat(pregunta));
    }
  };
  if (dif === 2) return aTeclado(q, r, () => [$('#escena .problema2-esc'), $('#escena .teclado')]);
  return q;
};
