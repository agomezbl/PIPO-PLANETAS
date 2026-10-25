/* =========================================================
   10. ACTIVIDADES DE MATEMÁTICAS
   Cada actividad recibe la dificultad (0, 1 o 2) y el contexto del nivel, y devuelve
   un reto: { firma, respuesta | validar, opciones, instr, refuerzo, explica, pintar(),
   foco(), pista(), demo(), resolverPrueba() ... }.
   - instr: frases de la consigna (lo que repite el botón 🔊)
   - explica: frases de la demostración resuelta (3.ª ayuda)
   - opciones / validas: datos para las pruebas automáticas
   Las actividades "de acción" (dar galletas, pagar, programar el robot...) avisan
   al motor con Juego.acierto() / Juego.fallo().
   ========================================================= */

/* Números que los peques suelen confundir */
const CONFUSOS = { 6: 9, 9: 6, 2: 5, 5: 2, 1: 7, 7: 1, 3: 8, 8: 3 };

/* Posiciones de "dado" para reconocer cantidades de un vistazo */
const DADO = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function dadoHTML(n, emoji) {
  let h;
  if (n <= 6) {
    h = '<span class="dado" style="--dc:3;--df:3;--de:.24">';
    for (let i = 0; i < 9; i++) h += '<span>' + (DADO[n].indexOf(i) >= 0 ? emoji : '') + '</span>';
  } else {
    h = '<span class="dado" style="--dc:5;--df:2;--de:.18">';
    for (let i = 0; i < 10; i++) h += '<span>' + (i < n ? emoji : '') + '</span>';
  }
  return h + '</span>';
}

/* Mano dibujada con n dedos levantados (índice, corazón, anular, meñique y, el 5.º, el pulgar) */
function manoSVG(n, espejo) {
  const dedos = [{ x: 60, y: 10, h: 72 }, { x: 82, y: 4, h: 78 }, { x: 104, y: 12, h: 70 }, { x: 125, y: 28, h: 56 }];
  let arriba = '', abajo = '';
  dedos.forEach((d, i) => {
    if (i < n) arriba += '<rect class="dedo" data-i="' + i + '" x="' + d.x + '" y="' + d.y + '" width="19" height="' + d.h + '" rx="9.5"/>';
    else abajo += '<rect class="dedo-doblado" x="' + d.x + '" y="58" width="19" height="26" rx="9.5"/>';
  });
  const pulgar = n >= 5
    ? '<rect class="dedo" data-i="4" x="44" y="62" width="20" height="62" rx="10" transform="rotate(-34 54 122)"/>'
    : '<rect class="dedo-doblado" x="46" y="94" width="19" height="34" rx="9.5" transform="rotate(-62 55 111)"/>';
  return '<svg class="mano-dedos" viewBox="0 0 160 160" aria-hidden="true"><g' + (espejo ? ' transform="translate(160 0) scale(-1 1)"' : '') + '>' +
    (n >= 5 ? pulgar : '') + arriba +
    '<rect class="palma" x="52" y="60" width="96" height="88" rx="32"/>' + abajo + (n >= 5 ? '' : pulgar) + '</g></svg>';
}

/* Hace que un elemento se pueda arrastrar con el dedo (o tocar para moverlo) */
function arrastrable(el, op) {
  let ini = null, movido = false, id = null;
  el.addEventListener('pointerdown', ev => {
    if (Juego.bloqueado || Juego.pausado) return;
    ini = { x: ev.clientX, y: ev.clientY };
    movido = false;
    id = ev.pointerId;
    try { el.setPointerCapture(id); } catch (e) { /* sin captura */ }
    el.classList.add('agarrado');
  });
  el.addEventListener('pointermove', ev => {
    if (!ini || ev.pointerId !== id) return;
    const dx = ev.clientX - ini.x, dy = ev.clientY - ini.y;
    if (!movido && Math.sqrt(dx * dx + dy * dy) > 10) { movido = true; Sonido.efecto('coger'); }
    if (movido) {
      // Si el elemento está dentro de un lienzo escalado, el desplazamiento se corrige
      const lz = el.closest('.lienzo');
      const k = (lz && Number(lz.style.getPropertyValue('--k'))) || 1;
      el.style.transform = 'translate(' + (dx / k) + 'px,' + (dy / k) + 'px) scale(1.15)';
    }
  });
  const terminar = ev => {
    if (!ini) return;
    const fueMovido = movido;
    ini = null;
    el.classList.remove('agarrado');
    el.style.transform = '';
    if (fueMovido) op.alSoltar(ev.clientX, ev.clientY);
    else op.alTocar();
  };
  el.addEventListener('pointerup', terminar);
  el.addEventListener('pointercancel', () => { ini = null; el.classList.remove('agarrado'); el.style.transform = ''; });
  // Teclado (Enter/Espacio)
  el.addEventListener('click', ev => { if (ev.detail === 0) op.alTocar(); });
}

function dentro(el, x, y) {
  const r = el.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

/* "Un cohete", "tres estrellas"... (concordancia correcta en español) */
function cant(n, objId) {
  const o = OBJ[objId] || { g: 'm' };
  return n === 1 ? [o.g === 'f' ? 'una' : 'un', 'o_' + objId + '_s'] : [N(n), 'o_' + objId + '_p'];
}
function eurosDe(n) { return n === 1 ? ['un', 'euro'] : [N(n), 'euros']; }
function sonEs(n) { return n === 1 ? 'es' : 'son'; }
function explicaSuma(a, b) { return [N(a), 'mas', N(b), sonEs(a + b), N(a + b)]; }
function explicaResta(a, b) { return [N(a), 'menos', N(b), sonEs(a - b), N(a - b)]; }

/* Botón verde de "listo" para las actividades de hacer */
function botonListo(alTocar) {
  const b = crear('button', 'btn opcion btn-listo', '<span class="ico">' + ICONOS.check + '</span>');
  b.type = 'button';
  b.setAttribute('aria-label', 'Listo');
  b.addEventListener('click', () => { if (!Juego.bloqueado && !Juego.pausado) alTocar(b); });
  return b;
}

/* Lienzo de tamaño fijo que se escala para caber en la escena (escenas complejas) */
function lienzo(w, h, clase) {
  const zona = crear('div', 'zona zona-lienzo');
  const l = crear('div', 'lienzo ' + (clase || ''));
  l.dataset.ajustar = 'escala';
  l.dataset.w = w;
  l.dataset.h = h;
  l.style.width = w + 'px';
  l.style.height = h + 'px';
  zona.appendChild(l);
  return { zona: zona, l: l };
}

/* Reto de opciones genérico: botones de respuesta abajo (o a la derecha) */
function botonesNumero(resp, opciones, textos) {
  opciones.forEach((v, i) => resp.appendChild(Render.botonNumero(v, textos ? textos[i] : undefined)));
}

/* "Toca el número N" entre varias cartas */
function genTocaNumero(min, max, cuantas, conPuntos, confusos, dosCifras) {
  const n = azar(min, max);
  let opciones;
  if (dosCifras) {
    opciones = barajar(opcionesDosCifras(n, min, max, cuantas));
  } else {
    opciones = [n];
    const pareja = CONFUSOS[n];
    if (confusos && pareja !== undefined && pareja >= min && pareja <= max) opciones.push(pareja);
    const resto = barajar(rango(min, max).filter(v => opciones.indexOf(v) < 0));
    while (opciones.length < cuantas && resto.length) opciones.push(resto.shift());
    opciones = barajar(opciones);
  }
  const instr = n <= 20 ? ['toca_n' + n] : ['toca_el', N(n)];
  return {
    firma: 'n' + n + '-' + opciones.join(','),
    respuesta: n,
    opciones: opciones,
    rango: [min, max],
    sinRespuestas: true,
    instr: instr,
    refuerzo: [N(n)],
    explica: [N(n)],
    pintar(esc) {
      const zona = crear('div', 'zona');
      const c = Render.cartas(0.82, 250);
      opciones.forEach(v => c.appendChild(Render.carta(v, '<span>' + v + '</span>' + (conPuntos && v <= 10 ? puntosHTML(v) : ''), String(v))));
      zona.appendChild(c);
      esc.appendChild(zona);
    },
    foco() { return [$('#escena .cartas')]; },
    pista() {
      Pistas.quitarUna();
      if (n > 10 && n <= 20) {
        Pistas.tira('<span>' + n + '</span>' + miniMarcoHTML(10) + miniMarcoHTML(n - 10));
      } else if (n > 20) {
        const d = Math.floor(n / 10), u = n % 10;
        Pistas.tira('<span>' + n + '</span><span class="tira-dec">' + '▮'.repeat(d) + '</span><span class="tira-uni">' + '•'.repeat(u) + '</span>');
      } else {
        $$('#escena .carta').forEach(b => {
          if (!b.querySelector('.puntos')) b.insertAdjacentHTML('beforeend', puntosHTML(Number(b.dataset.valor)));
        });
        Render.ajustar();
      }
      return Voz.decir(instr);
    }
  };
}

/* Dar una cantidad: galletas a Pipo o cosas a la mochila */
function genDar(dif, op) {
  const r = [[1, 4], [3, 7], [5, 10]][dif];
  const n = azar(r[0], r[1]);
  const objId = op.obj;
  const emoji = OBJ[objId].e;
  const total = Math.min(12, n + azar(2, 3));
  let rejPila = null, rejDestino = null, destino = null, pila = null;
  const enDestino = () => $$('.cosa', rejDestino);
  const renumerar = () => {
    enDestino().forEach((g, i) => Render.marcar(g, i + 1));
    $$('.cosa', rejPila).forEach(g => Render.desmarcar(g));
  };
  const instr = op.instr(n);
  const q = {
    firma: op.id + n + objId,
    respuesta: n,
    rango: [1, 10],
    accion: true,
    instr: instr.concat(Guardado.p && Guardado.p.vistos[op.id] ? [] : ['dame_listo']),
    refuerzo: [N(n)],
    elogios: ELOGIOS_CONTAR,
    explica: ['juntos'],
    mover(g, alDestino) {
      if (Juego.bloqueado) return;
      Juego.ultimoToque = Date.now();
      $$('.sobra', rejDestino).forEach(x => x.classList.remove('sobra'));
      if (alDestino) {
        rejDestino.appendChild(g);
        renumerar();
        const k = enDestino().length;
        Sonido.efecto('contar', k);
        Voz.decir(N(k));
      } else {
        rejPila.appendChild(g);
        renumerar();
        Sonido.efecto('soltar');
      }
      Render.ajustar();
    },
    pintar(esc, resp) {
      const caja = crear('div', 'dame');
      pila = crear('div', 'plato');
      rejPila = crear('div', 'rejilla');
      rejPila.dataset.ajustar = 'rejilla';
      rejPila.dataset.max = 104;
      rejPila.dataset.n = total;
      for (let i = 0; i < total; i++) {
        const g = crear('button', 'obj cosa galleta', '<span class="obj-e">' + emoji + '</span><span class="obj-num"></span>');
        g.type = 'button';
        g.setAttribute('aria-label', objId);
        arrastrable(g, {
          alTocar: () => q.mover(g, g.parentNode === rejPila),
          alSoltar: (x, y) => {
            if (g.parentNode === rejPila && dentro(destino, x, y)) q.mover(g, true);
            else if (g.parentNode === rejDestino && dentro(pila, x, y)) q.mover(g, false);
          }
        });
        rejPila.appendChild(g);
      }
      pila.appendChild(rejPila);
      destino = crear('div', 'cuenco' + (op.mochila ? ' mochila' : ''));
      destino.innerHTML = op.mochila ? '<div class="cuenco-pipo emo mochila-ico">🎒</div>' : '<div class="cuenco-pipo">' + Mascota.html() + '</div>';
      rejDestino = crear('div', 'rejilla');
      rejDestino.dataset.ajustar = 'rejilla';
      rejDestino.dataset.max = 104;
      rejDestino.dataset.n = total;
      destino.appendChild(rejDestino);
      caja.appendChild(pila);
      caja.appendChild(crear('div', 'dame-flecha', ICONOS.flecha));
      caja.appendChild(destino);
      esc.appendChild(caja);
      resp.appendChild(botonListo(b => q.comprobar(b)));
    },
    comprobar(boton) {
      const k = enDestino().length;
      if (k === n) {
        if (!op.mochila) { enDestino().forEach((g, i) => setTimeout(() => g.classList.add('comida'), i * 90)); Sonido.efecto('nam'); }
        Juego.acierto(boton);
        return;
      }
      Juego.fallo(boton, { sinApagar: true, pista: tk => q.pistaCantidad(tk, k) });
    },
    pistaCantidad(tk, k) {
      if (k > n) {
        enDestino().slice(n).forEach(g => g.classList.add('sobra'));
        return Voz.decir(['dame_demasiadas', 'dame_quita']);
      }
      return Voz.decir(['dame_faltan'].concat(instr)).then(() => {
        if (tk === Juego.token) Mano.señalar([$('.cosa', rejPila), destino], { vueltas: 1 });
      });
    },
    foco() { return [$('.cosa', rejPila), destino, $('#respuestas .btn-listo')]; },
    pista(tk) {
      // Siluetas: tantos huecos como cosas hay que dar
      const k = enDestino().length;
      for (let i = k; i < n; i++) {
        const h = crear('span', 'obj hueco-silueta', '<span class="obj-e">' + emoji + '</span><span class="obj-num"></span>');
        rejDestino.appendChild(h);
      }
      Render.ajustar();
      return Voz.decir(['mira'].concat(instr)).then(() => { if (tk === Juego.token) Mano.señalar(q.foco(), { vueltas: 1 }); });
    },
    async demo(tk) {
      await Voz.decir(['mira_como']);
      $$('.hueco-silueta', rejDestino).forEach(h => h.remove());
      while (enDestino().length > 0) { rejPila.appendChild(enDestino()[0]); }
      renumerar();
      for (let i = 0; i < n; i++) {
        if (tk !== Juego.token) return;
        const g = $('.cosa', rejPila);
        rejDestino.appendChild(g);
        renumerar();
        Render.ajustar();
        Sonido.efecto('contar', i + 1);
        await Promise.race([Voz.decir(N(i + 1)), esperar(T(1200))]);
      }
    },
    guiar() { const b = $('#respuestas .btn-listo'); if (b) b.classList.add('guiado'); },
    resolverPrueba() {
      while (enDestino().length > n) q.mover(enDestino()[0], false);
      while (enDestino().length < n) q.mover($('.cosa', rejPila), true);
      q.comprobar($('#respuestas .btn-listo'));
    }
  };
  return q;
}

const ACTIVIDADES = {};

/* =================== TIERRA =================== */

/* ----- Contar objetos tocándolos ----- */
ACTIVIDADES.contar = function (dif) {
  const r = [[1, 5], [3, 8], [5, 10]][dif];
  const n = azar(r[0], r[1]);
  const obj = elegir(OBJETOS);
  const opciones = opcionesCercanas(n, 1, 10, 3);
  return {
    firma: 'c' + n + obj.id,
    respuesta: n,
    opciones: opciones,
    rango: [1, 10],
    instr: ['cuantos_' + obj.id].concat(dif === 0 ? ['tip_toca_' + obj.g] : []),
    refuerzo: [N(n)],
    ensenar: ['ultimo_numero'],
    elogios: ELOGIOS_CONTAR,
    pintar(esc, resp) {
      const zona = crear('div', 'zona');
      zona.appendChild(Render.rejilla(Array(n).fill(obj.e), { disperso: dif === 2 }));
      esc.appendChild(zona);
      botonesNumero(resp, opciones);
    },
    foco() { return $$('#escena .obj').slice(0, 2).concat([$('#respuestas')]); },
    pista(tk) { return Pistas.contar(tk, $$('#escena .obj'), { intro: ['juntos'] }); },
    demo(tk) { return Pistas.contar(tk, $$('#escena .obj'), { intro: ['mira_como'], cierre: ['aqui_hay', N(n)] }); }
  };
};

/* ----- Dar N galletas a Pipo (producir una cantidad) ----- */
ACTIVIDADES.dame = function (dif) {
  return genDar(dif, { id: 'dame', obj: 'galleta', instr: n => ['dame_' + n] });
};

/* ----- Misión: meter cosas en la mochila del astronauta ----- */
ACTIVIDADES.mochila = function (dif) {
  const objId = elegir(OBJETOS_MOCHILA);
  return genDar(dif, { id: 'mochila', obj: objId, mochila: true, instr: n => ['mete'].concat(cant(n, objId), ['en_mochila']) });
};

/* ----- Fogonazo: ver una cantidad un instante (reconocer sin contar) ----- */
ACTIVIDADES.fogonazo = function (dif) {
  const r = [[1, 4], [3, 6], [5, 9]][dif];
  const n = azar(r[0], r[1]);
  const opciones = opcionesCercanas(n, 1, 10, 3);
  const duracion = [2200, 1700, 1500][dif];
  const color = elegir(COLORES_FORMA);
  let carta = null, nube = null;
  const mostrar = () => { if (nube) { nube.classList.add('fuera'); Sonido.efecto('pagina'); } };
  const tapar = () => {
    if (!nube) return;
    nube.classList.remove('fuera');
    Sonido.efecto('tapar');
    $('#respuestas').classList.remove('oculta');
  };
  const q = {
    firma: 'f' + n,
    respuesta: n,
    opciones: opciones,
    rango: [1, 10],
    instr: ['cuantos_habia'],
    refuerzo: [N(n)],
    pintar(esc, resp) {
      const zona = crear('div', 'zona');
      carta = crear('div', 'fogonazo');
      carta.dataset.ajustar = 'cuadrado';
      let h;
      if (n <= 6) {
        h = '<div class="fogonazo-puntos" style="--color:' + color + '">';
        for (let i = 0; i < 9; i++) h += DADO[n].indexOf(i) >= 0 ? '<span class="obj punto"><span class="obj-e"></span><span class="obj-num"></span></span>' : '<span></span>';
      } else {
        h = '<div class="fogonazo-puntos diez" style="--color:' + color + '">';
        for (let i = 0; i < 10; i++) h += i < n ? '<span class="obj punto"><span class="obj-e"></span><span class="obj-num"></span></span>' : '<span class="punto-vacio"></span>';
      }
      carta.innerHTML = h + '</div>';
      nube = crear('div', 'nube', '<span class="emo">☁️</span>');
      carta.appendChild(nube);
      zona.appendChild(carta);
      esc.appendChild(zona);
      resp.classList.add('oculta');
      botonesNumero(resp, opciones);
    },
    hablar(tk, intro) {
      return Voz.decir(intro.concat(['mira_rapido'])).then(() => {
        if (tk !== Juego.token) return null;
        mostrar();
        return esperar(T(duracion)).then(() => {
          if (tk !== Juego.token) return null;
          tapar();
          return Voz.decir(['cuantos_habia'], { instruccion: true });
        });
      });
    },
    alRepetir() {
      const tk = Juego.token;
      Voz.decir(['mira_rapido']).then(() => {
        if (tk !== Juego.token) return;
        mostrar();
        setTimeout(() => { if (tk === Juego.token) { tapar(); Voz.decir(['cuantos_habia']); } }, duracion + 600);
      });
    },
    alReanudar(tk) { q.hablar(tk, []); },
    foco() { return [carta, $('#respuestas')]; },
    pista(tk) {
      mostrar();
      return Pistas.contar(tk, $$('.punto', carta), { intro: ['juntos'] });
    },
    demo(tk) {
      mostrar();
      return Pistas.contar(tk, $$('.punto', carta), { intro: ['mira_como'], cierre: ['aqui_hay', N(n)] });
    }
  };
  return q;
};

/* ----- Dedos: ¿cuántos dedos hay? ----- */
ACTIVIDADES.dedos = function (dif) {
  const r = [[1, 5], [4, 8], [6, 10]][dif];
  const n = azar(r[0], r[1]);
  const opciones = opcionesCercanas(n, 1, 10, 3);
  let manos = null;
  const leerDedos = (tk, intro, cierre) => {
    const dedos = [];
    $$('.mano-dedos', manos).forEach(m => {
      $$('.dedo', m).sort((a, b) => Number(a.dataset.i) - Number(b.dataset.i)).forEach(d => dedos.push(d));
    });
    Pistas.contando = true;
    return Pistas.leer(tk, dedos.map((d, i) => ({ el: d, partes: [N(i + 1)] })), cierre, intro)
      .then(() => { Pistas.contando = false; }, () => { Pistas.contando = false; });
  };
  return {
    firma: 'h' + n,
    respuesta: n,
    opciones: opciones,
    rango: [1, 10],
    instr: ['cuantos_dedos'],
    refuerzo: [N(n)],
    elogios: ELOGIOS_CONTAR,
    pintar(esc, resp) {
      const zona = crear('div', 'zona');
      manos = crear('div', 'manos');
      manos.innerHTML = n <= 5 ? manoSVG(n, false) : manoSVG(5, true) + manoSVG(n - 5, false);
      zona.appendChild(manos);
      esc.appendChild(zona);
      botonesNumero(resp, opciones);
    },
    foco() { return [manos, $('#respuestas')]; },
    pista(tk) { return leerDedos(tk, ['juntos'], ['ultimo_numero']); },
    demo(tk) { return leerDedos(tk, ['mira_como'], ['aqui_hay', N(n)]); }
  };
};

/* ----- Toca el número ----- */
ACTIVIDADES.tocaNumero = function (dif) {
  if (dif === 0) return genTocaNumero(0, 5, 3, true, false);
  if (dif === 1) return genTocaNumero(0, 10, 3, false, false);
  return genTocaNumero(0, 10, 4, false, true);
};

/* ----- Número -> grupo: ¿dónde hay cinco? ----- */
ACTIVIDADES.grupoNumero = function (dif) {
  const max = [5, 8, 10][dif];
  const n = azar(1, max);
  const obj = elegir(OBJETOS);
  const otros = barajar(rango(1, max).filter(v => v !== n && (dif < 2 || Math.abs(v - n) <= 3)));
  const opciones = barajar([n, otros[0], otros[1]]);
  return {
    firma: 'g' + n + obj.id,
    respuesta: n,
    opciones: opciones,
    rango: [1, 10],
    sinRespuestas: true,
    instr: ['donde_n' + n],
    refuerzo: [N(n)],
    pintar(esc) {
      const caja = crear('div', 'numeros-b');
      caja.appendChild(crear('div', 'numero-grande', String(n)));
      const zona = crear('div', 'zona');
      const c = Render.cartas(1.25, 240);
      opciones.forEach(v => c.appendChild(Render.carta(v, dadoHTML(v, obj.e), String(v))));
      zona.appendChild(c);
      caja.appendChild(zona);
      esc.appendChild(caja);
    },
    foco() { return [$('#escena .numero-grande'), $('#escena .cartas')]; },
    pista() {
      Pistas.tira('<span>' + n + '</span><span>=</span>' + puntosHTML(n));
      Pistas.quitarUna();
      return Voz.decir(['donde_n' + n]);
    },
    explica: ['aqui_hay', N(n)]
  };
};

/* ----- Comparar: más, menos o igual ----- */
ACTIVIDADES.comparar = function (dif) {
  const obj = elegir(OBJETOS);
  const max = [5, 8, 10][dif];
  const igual = dif === 2 && rnd() < 0.3;
  let a, b;
  if (igual) {
    a = b = azar(2, max);
  } else {
    do { a = azar(1, max); b = azar(1, max); } while (Math.abs(a - b) < (dif === 0 ? 2 : 1));
  }
  const pide = dif === 0 ? 'mas' : elegir(['mas', 'menos']);
  const respuesta = igual ? 'igual' : (pide === 'mas' ? (a > b ? 'izq' : 'der') : (a < b ? 'izq' : 'der'));
  const instr = [pide === 'mas' ? 'donde_mas' : 'donde_menos'].concat(dif === 2 ? ['si_igual'] : []);
  const elegido = igual ? a : (pide === 'mas' ? Math.max(a, b) : Math.min(a, b));
  const leerPaneles = (tk, intro, cierre) => {
    const paneles = $$('#escena .panel');
    paneles.forEach(p => { const c = p.querySelector('.panel-cuenta'); if (c) c.hidden = false; });
    Render.ajustar();
    return Pistas.leer(tk, [
      { el: paneles[0], partes: ['aqui_hay', N(a)] },
      { el: paneles[1], partes: ['aqui_hay', N(b)] }
    ], cierre, intro);
  };
  return {
    firma: 'm' + a + '-' + b + pide,
    respuesta: respuesta,
    opciones: dif === 2 ? ['izq', 'der', 'igual'] : ['izq', 'der'],
    sinRespuestas: dif < 2,
    instr: instr,
    refuerzo: igual ? ['son_iguales'] : ['aqui_hay', N(elegido)],
    pintar(esc, resp) {
      const comp = crear('div', 'comparar');
      [['izq', a], ['der', b]].forEach(par => {
        const p = crear('button', 'panel elegible');
        p.type = 'button';
        p.dataset.valor = par[0];
        p.setAttribute('aria-label', par[0] === 'izq' ? 'Lado izquierdo' : 'Lado derecho');
        p.appendChild(Render.rejilla(Array(par[1]).fill(obj.e), { contable: false }));
        const cuenta = crear('div', 'panel-cuenta', String(par[1]));
        cuenta.hidden = true;
        p.appendChild(cuenta);
        p.addEventListener('click', () => Juego.responder(par[0], p));
        comp.appendChild(p);
      });
      esc.appendChild(comp);
      if (dif === 2) {
        const bi = crear('button', 'btn opcion elegible btn-igual', '=');
        bi.type = 'button';
        bi.dataset.valor = 'igual';
        bi.setAttribute('aria-label', 'Igual');
        bi.addEventListener('click', () => Juego.responder('igual', bi));
        resp.appendChild(bi);
      }
    },
    foco() { return $$('#escena .panel').concat(dif === 2 ? [$('#respuestas .btn-igual')] : []); },
    pista(tk) { return leerPaneles(tk, ['cuenta_lados'], instr); },
    demo(tk) { return leerPaneles(tk, ['mira_como'], igual ? ['son_iguales'] : null); }
  };
};

/* ----- Toca la forma ----- */
ACTIVIDADES.formas = function (dif) {
  const grupos = [
    ['circulo', 'cuadrado', 'triangulo'],
    ['circulo', 'cuadrado', 'triangulo', 'rectangulo', 'estrella', 'corazon'],
    FORMAS
  ];
  const cuantas = dif === 2 ? 4 : 3;
  const elegidas = barajar(grupos[dif]).slice(0, cuantas);
  const obj = elegir(elegidas);
  const colores = barajar(COLORES_FORMA);
  const giratorias = ['triangulo', 'rectangulo', 'estrella', 'corazon', 'ovalo', 'cuadrado'];
  const giros = elegidas.map(f => (dif === 2 && giratorias.indexOf(f) >= 0) ? azar(-30, 30) : 0);
  const escalas = elegidas.map(() => dif === 2 ? azar(72, 100) / 100 : 1);
  const DESCRIBE = { triangulo: 'lados_triangulo', cuadrado: 'lados_cuadrado', rectangulo: 'lados_rectangulo', circulo: 'circulo_redondo' };
  return {
    firma: 'f' + obj + elegidas.join(''),
    respuesta: obj,
    opciones: elegidas,
    sinRespuestas: true,
    instr: ['toca_' + obj],
    refuerzo: DESCRIBE[obj] && dif === 0 ? [DESCRIBE[obj]] : [],
    explica: DESCRIBE[obj] ? [DESCRIBE[obj]] : ['mira_forma'],
    pintar(esc) {
      const zona = crear('div', 'zona');
      const c = Render.cartas(1, 250);
      elegidas.forEach((f, i) => c.appendChild(Render.carta(f, formaSVG(f, colores[i % colores.length], giros[i], escalas[i]), f)));
      zona.appendChild(c);
      esc.appendChild(zona);
    },
    foco() { return [$('#escena .cartas')]; },
    pista() {
      Pistas.tira(formaSVG(obj, '#9B7BF7', 0, 1, true).replace('class="forma"', 'class="forma forma-pista"'));
      Pistas.quitarUna();
      return Voz.decir(['mira_forma', 'toca_' + obj]);
    }
  };
};

/* ----- Busca todas las formas iguales ----- */
ACTIVIDADES.buscaTodas = function (dif) {
  const sencillas = ['circulo', 'cuadrado', 'triangulo', 'estrella', 'corazon'];
  const objetivo = elegir(dif === 0 ? sencillas : FORMAS_BUSCA);
  const nObj = [2, 3, 4][dif];
  const nOtros = [4, 5, 6][dif];
  const parecidas = { cuadrado: 'rectangulo', rectangulo: 'cuadrado', circulo: 'ovalo' };
  const pool = (dif === 0 ? sencillas : FORMAS_BUSCA).filter(f => f !== objetivo && (dif > 0 || f !== parecidas[objetivo]));
  const piezas = barajar(Array(nObj).fill(objetivo).concat(rango(1, nOtros).map(() => elegir(pool))));
  let encontradas = 0, fallado = false, area = null, marcador = null;
  const q = {
    firma: 'b' + objetivo + nObj,
    respuesta: objetivo,
    accion: true,
    sinRespuestas: true,
    instr: ['busca_' + objetivo],
    refuerzo: [N(nObj)],
    explica: ['mira_forma'],
    pintar(esc) {
      marcador = crear('div', 'marcador-busca');
      for (let i = 0; i < nObj; i++) marcador.appendChild(crear('span', 'hueco-busca', formaSVG(objetivo, '#CFC4F7', 0, 1, true)));
      esc.appendChild(marcador);
      area = crear('div', 'dispersa');
      area.dataset.ajustar = 'dispersa';
      const total = piezas.length;
      const huecos = Math.ceil(total * 1.35);
      area.dataset.huecos = huecos;
      const sitios = barajar(rango(0, huecos - 1)).slice(0, total);
      piezas.forEach((f, i) => {
        const b = crear('button', 'forma-suelta', formaSVG(f, elegir(COLORES_FORMA), dif > 0 && f !== 'circulo' ? azar(-35, 35) : 0, azar(85, 100) / 100));
        b.type = 'button';
        b.dataset.hueco = sitios[i];
        b.dataset.forma = f;
        b.dataset.jx = (rnd() * 2 - 1).toFixed(2);
        b.dataset.jy = (rnd() * 2 - 1).toFixed(2);
        b.setAttribute('aria-label', f);
        b.addEventListener('click', () => q.tocar(b, f));
        area.appendChild(b);
      });
      esc.appendChild(area);
    },
    tocar(b, f) {
      if (Juego.bloqueado || Juego.pausado || b.classList.contains('encontrada')) return;
      Juego.ultimoToque = Date.now();
      if (f === objetivo) {
        encontradas++;
        b.classList.add('encontrada');
        b.classList.remove('guiado');
        const h = $$('.hueco-busca', marcador)[encontradas - 1];
        if (h) h.classList.add('lleno');
        Sonido.efecto('contar', encontradas);
        if (encontradas >= nObj) Juego.acierto(b);
        else Voz.decir(N(encontradas));
        return;
      }
      b.classList.remove('no-es');
      void b.offsetWidth;
      b.classList.add('no-es');
      if (!fallado) {
        fallado = true;
        Juego.fallo(b, { sinApagar: true, pista: tk => q.pista(tk) });
      } else {
        Sonido.efecto('suave');
      }
    },
    foco() { return [area]; },
    pista() {
      Pistas.tira(formaSVG(objetivo, '#9B7BF7', 0, 1, true).replace('class="forma"', 'class="forma forma-pista"'));
      return Voz.decir(['mira_forma', 'busca_' + objetivo]);
    },
    guiar() {
      $$('.forma-suelta', area).forEach(b => { if (!b.classList.contains('encontrada') && b.dataset.forma === objetivo) b.classList.add('guiado'); });
    },
    resolverPrueba() {
      $$('.forma-suelta', area).filter(b => b.dataset.forma === objetivo && !b.classList.contains('encontrada')).forEach(b => q.tocar(b, objetivo));
    }
  };
  return q;
};

/* =================== LUNA =================== */

ACTIVIDADES.numero20 = function (dif) {
  return genTocaNumero(10, [15, 20, 20][dif], [3, 4, 4][dif], false, false);
};

/* ----- Hasta 20 con marcos de diez ----- */
ACTIVIDADES.marcos = function (dif) {
  const r = [[7, 13], [11, 16], [11, 20]][dif];
  const n = azar(r[0], r[1]);
  const obj = elegir(OBJETOS);
  const opciones = opcionesCercanas(n, 1, 20, 3);
  const llenos = n > 10 ? [10, n - 10] : [n];
  const contarMarcos = (tk, intro, cierre) => {
    const ms = $$('#escena .marco');
    if (ms.length > 1) return Pistas.contar(tk, $$('.obj', ms[1]), { intro: intro, previos: $$('.obj', ms[0]), marcoPrevio: ms[0], cierre: cierre });
    return Pistas.contar(tk, $$('.obj', ms[0]), { intro: intro, cierre: cierre });
  };
  return {
    firma: 'v' + n + obj.id,
    respuesta: n,
    opciones: opciones,
    rango: [1, 20],
    instr: ['cuantos_total'],
    refuerzo: [N(n)],
    ensenar: ['caja_diez'],
    elogios: ELOGIOS_CONTAR,
    pintar(esc, resp) {
      const marcos = crear('div', 'marcos');
      marcos.dataset.ajustar = 'marcos';
      llenos.forEach(lleno => {
        const m = crear('div', 'marco');
        for (let i = 0; i < 10; i++) {
          const celda = crear('div', 'celda');
          if (i < lleno) celda.appendChild(Render.objeto(obj.e, true));
          m.appendChild(celda);
        }
        marcos.appendChild(m);
      });
      esc.appendChild(marcos);
      botonesNumero(resp, opciones);
    },
    foco() { return $$('#escena .marco').concat([$('#respuestas')]); },
    pista(tk) { return contarMarcos(tk, ['fijate'], ['cuantos_total']); },
    demo(tk) { return contarMarcos(tk, ['mira_como'], ['aqui_hay', N(n)]); }
  };
};

/* ----- Sumas: juntar dos grupos (también la misión de las rocas) ----- */
function genSuma(dif, op) {
  const lim = [[2, 5], [3, 8], [5, 10]][dif];
  const total = azar(lim[0], lim[1]);
  const a = azar(1, total - 1);
  const b = total - a;
  const obj = op.obj ? OBJ[op.obj] : elegir(OBJETOS);
  const opciones = opcionesCercanas(total, 1, 10, 3);
  return {
    firma: op.id + a + '+' + b,
    respuesta: total,
    opciones: opciones,
    rango: [1, 10],
    instr: op.instr,
    refuerzo: explicaSuma(a, b),
    explica: explicaSuma(a, b),
    pintar(esc, resp) {
      const opc = crear('div', 'operacion' + (op.cestas ? ' cestas' : ''));
      const g1 = crear('div', 'grupo');
      g1.appendChild(Render.rejilla(Array(a).fill(obj.e), { max: dif === 2 ? 70 : 110 }));
      const g2 = crear('div', 'grupo');
      g2.appendChild(Render.rejilla(Array(b).fill(obj.e), { max: dif === 2 ? 70 : 110 }));
      g1.style.flexGrow = Math.max(a, 3);
      g2.style.flexGrow = Math.max(b, 3);
      opc.appendChild(g1);
      opc.appendChild(crear('span', 'signo-op', '+'));
      opc.appendChild(g2);
      esc.appendChild(opc);
      esc.appendChild(Render.ecuacion([a, '+', b, '=', '?']));
      botonesNumero(resp, opciones);
    },
    foco() { return $$('#escena .grupo').concat([$('#respuestas')]); },
    pista(tk) { return Pistas.contar(tk, $$('#escena .obj'), { intro: ['juntos'], cierre: op.instr.slice(-1) }); },
    demo(tk) { return Pistas.contar(tk, $$('#escena .obj'), { intro: ['mira_como'], cierre: explicaSuma(a, b) }); }
  };
}
ACTIVIDADES.sumas = function (dif) { return genSuma(dif, { id: 'a', instr: ['junta', 'cuantos_ahora'] }); };
ACTIVIDADES.rocas = function (dif) { return genSuma(dif, { id: 'ro', obj: 'roca', cestas: true, instr: ['junta_rocas', 'cuantas_rocas_ahora'] }); };

/* ----- Llenar: ¿cuántos faltan para 5 o para 10? ----- */
ACTIVIDADES.llenar = function (dif) {
  const tam = dif === 0 ? 5 : 10;
  const k = dif === 0 ? azar(1, 4) : (dif === 1 ? azar(5, 9) : azar(1, 8));
  const resp = tam - k;
  const opciones = opcionesCercanas(resp, 1, tam, 3);
  let marco = null;
  const instr = dif === 2 ? ['llegar_diez'] : ['faltan_llenar'];
  return {
    firma: 'l' + tam + '-' + k,
    respuesta: resp,
    opciones: opciones,
    rango: [1, 10],
    instr: instr,
    refuerzo: [N(k), 'mas', N(resp), 'son', N(tam)],
    explica: [N(k), 'mas', N(resp), 'son', N(tam)],
    pintar(esc, respC) {
      const zona = crear('div', 'marcos llenar');
      zona.dataset.ajustar = 'marcos';
      marco = crear('div', 'marco marco-cohete' + (tam === 5 ? ' cinco' : ''));
      for (let i = 0; i < tam; i++) {
        const celda = crear('div', 'celda');
        if (i < k) celda.appendChild(Render.objeto('⭐', false));
        else celda.appendChild(crear('span', 'obj vacio', '<span class="obj-e"></span><span class="obj-num"></span>'));
        marco.appendChild(celda);
      }
      zona.appendChild(marco);
      esc.appendChild(crear('div', 'cohete-llenar emo', '🚀'));
      esc.appendChild(zona);
      if (dif === 2) esc.appendChild(Render.ecuacion([k, '+', '?', '=', 10]));
      botonesNumero(respC, opciones);
    },
    foco() { return [$$('.vacio', marco)[0], $('#respuestas')]; },
    pista(tk) { return Pistas.contar(tk, $$('.vacio', marco), { intro: ['juntos'], cierre: instr }); },
    demo(tk) { return Pistas.contar(tk, $$('.vacio', marco), { intro: ['mira_como'], cierre: [N(k), 'mas', N(resp), 'son', N(tam)] }); }
  };
};

/* ----- Series: ¿qué va después? (o ¿qué falta?) ----- */
ACTIVIDADES.patrones = function (dif) {
  const set = barajar(elegir(PATRON_SETS));
  let unidad;
  if (dif === 0) unidad = [0, 1];
  else if (dif === 1) unidad = elegir([[0, 0, 1], [0, 1, 1], [0, 1, 2]]);
  else unidad = elegir([[0, 1, 2], [0, 0, 1, 1], [0, 1, 1, 2]]);
  const piezas = unidad.map(i => set[i]);
  const largo = dif === 0 ? azar(4, 5) : (unidad.length === 3 ? azar(5, 7) : azar(6, 7));
  const fila = rango(0, largo).map(i => piezas[i % unidad.length]);
  const hueco = dif === 2 && rnd() < 0.4 ? azar(1, largo - 1) : largo;
  const resp = fila[hueco];
  const distintos = [];
  piezas.forEach(p => { if (distintos.indexOf(p) < 0) distintos.push(p); });
  const extra = set.filter(p => distintos.indexOf(p) < 0);
  let opciones = distintos.slice();
  while (opciones.length < 3 && extra.length) opciones.push(extra.shift());
  opciones = barajar(opciones.slice(0, 3));
  if (opciones.indexOf(resp) < 0) opciones[0] = resp;
  const instr = hueco === largo ? ['que_va_despues'] : ['que_falta_serie'];
  const marcar = (tk, intro, cierre) => {
    const pats = $$('#escena .pat');
    pats.forEach((p, i) => { p.classList.add('u' + (Math.floor(i / unidad.length) % 2)); });
    return Pistas.leer(tk, pats.map(el => ({ el: el })), cierre, intro);
  };
  return {
    firma: 'p' + fila.join('') + hueco,
    respuesta: resp,
    opciones: opciones,
    instr: instr,
    refuerzo: [],
    pintar(esc, respC) {
      const f = crear('div', 'fila');
      f.dataset.ajustar = 'fila';
      fila.forEach((p, i) => f.appendChild(i === hueco ? crear('div', 'pat hueco', '<span>?</span>') : crear('div', 'pat', p)));
      esc.appendChild(f);
      opciones.forEach(p => respC.appendChild(Render.botonEmoji(p, p)));
    },
    foco() { const p = $$('#escena .pat'); return [p[0], p[unidad.length], $('#escena .pat.hueco')]; },
    pista(tk) { return marcar(tk, ['mira'], instr); },
    demo(tk) { return marcar(tk, ['mira_como'], null); }
  };
};

/* =================== MARTE =================== */

/* ----- Restar haciendo: revienta globos y cuenta los que quedan ----- */
ACTIVIDADES.revienta = function (dif) {
  const lim = [[2, 5, 2], [4, 8, 3], [5, 10, 5]][dif];
  const n = azar(lim[0], lim[1]);
  const k = azar(1, Math.min(lim[2], n - 1));
  const quedan = n - k;
  const opciones = opcionesCercanas(quedan, 0, 10, 3);
  let fase = 'reventar', reventados = 0, rej = null;
  const q = {
    firma: 'r' + n + '-' + k,
    respuesta: quedan,
    opciones: opciones,
    rango: [0, 10],
    accion: true,
    instr: ['revienta_' + k],
    refuerzo: explicaResta(n, k),
    explica: explicaResta(n, k),
    antesDeResponder() { return fase === 'contar'; },
    pintar(esc, resp) {
      const zona = crear('div', 'zona');
      rej = crear('div', 'rejilla');
      rej.dataset.ajustar = 'rejilla';
      rej.dataset.max = 130;
      for (let i = 0; i < n; i++) {
        const g = crear('button', 'obj globo', '<span class="obj-e">🎈</span><span class="obj-num"></span>');
        g.type = 'button';
        g.style.setProperty('--h', [0, 200, 280, 140, 320, 240, 170, 300, 220, 350][i % 10] + 'deg');
        g.setAttribute('aria-label', 'globo');
        g.addEventListener('click', () => q.pinchar(g));
        rej.appendChild(g);
      }
      zona.appendChild(rej);
      esc.appendChild(zona);
      resp.classList.add('oculta');
      botonesNumero(resp, opciones);
    },
    pinchar(g) {
      if (Juego.bloqueado || Juego.pausado || fase !== 'reventar' || g.classList.contains('reventado')) return;
      Juego.ultimoToque = Date.now();
      reventados++;
      g.classList.add('reventado');
      Sonido.efecto('pop');
      const c = UI.centro(g);
      Confeti.lanzar(c.x, c.y, 12, false);
      if (reventados < k) { Voz.decir(N(reventados)); return; }
      fase = 'contar';
      $$('.globo', rej).forEach(x => { if (!x.classList.contains('reventado')) x.classList.add('quieto'); });
      $('#escena').appendChild(Render.ecuacion([n, '−', k, '=', '?']));
      Render.ajustar();
      $('#respuestas').classList.remove('oculta');
      q.instr = ['cuantos_quedan'];
      Voz.instruccion = q.instr;
      Juego.finInstruccion = Date.now() + 60000;
      Juego.nivelAyuda = 0;
      const tk = Juego.token;
      Voz.decir([N(reventados), 'cuantos_quedan']).then(() => { if (tk === Juego.token) Juego.finInstruccion = Date.now(); });
    },
    foco() {
      if (fase === 'reventar') return $$('.globo', rej).filter(x => !x.classList.contains('reventado')).slice(0, 2);
      return [$('#respuestas')];
    },
    pista(tk) {
      if (fase === 'reventar') {
        return Voz.decir(['mira', 'revienta_' + k]).then(() => { if (tk === Juego.token) Mano.señalar(q.foco(), { vueltas: 1 }); });
      }
      return Pistas.contar(tk, $$('.globo', rej).filter(x => !x.classList.contains('reventado')), { intro: ['juntos'], cierre: ['cuantos_quedan'] });
    },
    demo(tk) {
      if (fase === 'reventar') {
        const vivos = $$('.globo', rej).filter(x => !x.classList.contains('reventado'));
        return Voz.decir(['mira_como']).then(() => { if (tk === Juego.token) Mano.señalar(vivos.slice(0, k - reventados), { vueltas: 1 }); });
      }
      return Pistas.contar(tk, $$('.globo', rej).filter(x => !x.classList.contains('reventado')), { intro: ['mira_como'], cierre: explicaResta(n, k) });
    },
    guiar() {
      if (fase === 'reventar') $$('.globo', rej).filter(x => !x.classList.contains('reventado')).slice(0, k - reventados).forEach(x => x.classList.add('guiado'));
      else $$('#respuestas .elegible').forEach(b => { if (Number(b.dataset.valor) === quedan) b.classList.add('guiado'); else { b.classList.add('apagado'); b.disabled = true; } });
    },
    resolverPrueba() {
      $$('.globo', rej).filter(x => !x.classList.contains('reventado')).slice(0, k - reventados).forEach(g => q.pinchar(g));
      setTimeout(() => { const b = $$('#respuestas .elegible').find(x => Number(x.dataset.valor) === quedan); if (b) b.click(); }, 50);
    }
  };
  return q;
};

/* ----- Restar mirando: algunos robots se van ----- */
ACTIVIDADES.quitar = function (dif) {
  const lim = [[3, 6, 2], [5, 9, 4], [6, 10, 6]][dif];
  const n = azar(lim[0], lim[1]);
  const k = azar(1, Math.min(lim[2], n - 1));
  const quedan = n - k;
  const opciones = opcionesCercanas(quedan, 0, 10, 3);
  let rej = null;
  const seVan = () => $$('.obj', rej).slice(n - k);
  const quedanEls = () => $$('.obj', rej).slice(0, n - k);
  const irse = () => { seVan().forEach((o, i) => setTimeout(() => o.classList.add('se-va'), i * 140)); Sonido.efecto('robot'); };
  const q = {
    firma: 'q' + n + '-' + k,
    respuesta: quedan,
    opciones: opciones,
    rango: [0, 10],
    instr: ['cuantos_quedan'],
    refuerzo: explicaResta(n, k),
    explica: explicaResta(n, k),
    pintar(esc, resp) {
      const zona = crear('div', 'zona');
      rej = Render.rejilla(Array(n).fill('🤖'), { contable: true, max: 120 });
      zona.appendChild(rej);
      esc.appendChild(zona);
      if (dif === 2) esc.appendChild(Render.ecuacion([n, '−', k, '=', '?']));
      botonesNumero(resp, opciones);
    },
    hablar(tk, intro) {
      return Voz.decir(intro.concat(['se_van_robots'])).then(() => {
        if (tk !== Juego.token) return null;
        irse();
        return esperar(T(900)).then(() => (tk === Juego.token ? Voz.decir(['cuantos_quedan'], { instruccion: true }) : null));
      });
    },
    alReanudar(tk) { Voz.decir(['cuantos_quedan']).then(() => { if (tk === Juego.token) Juego.finInstruccion = Date.now(); }); },
    foco() { return quedanEls().slice(0, 2).concat([$('#respuestas')]); },
    pista(tk) { return Pistas.contar(tk, quedanEls(), { intro: ['juntos'], cierre: ['cuantos_quedan'] }); },
    demo(tk) { return Pistas.contar(tk, quedanEls(), { intro: ['mira_como'], cierre: explicaResta(n, k) }); }
  };
  return q;
};

/* ----- Secuencias: el tren de números, antes y después ----- */
ACTIVIDADES.secuencias = function (dif) {
  const modo = dif === 0 ? 'tren' : elegir(['tren', 'tren', 'antes', 'despues']);
  if (modo === 'antes' || modo === 'despues') {
    const max = dif === 1 ? 10 : 20;
    const x = modo === 'antes' ? azar(1, max) : azar(0, max - 1);
    const resp = modo === 'antes' ? x - 1 : x + 1;
    const opciones = barajar(opcionesCercanas(resp, 0, 20, 3));
    const instr = [modo === 'antes' ? 'va_antes' : 'va_despues'];
    return {
      firma: 'ad' + modo + x,
      respuesta: resp,
      opciones: opciones,
      rango: [0, 20],
      instr: instr,
      refuerzo: [N(resp)],
      explica: modo === 'antes' ? [N(resp), N(x)] : [N(x), N(resp)],
      pintar(esc, respC) {
        const caja = crear('div', 'antes-despues');
        const cajaQ = '<div class="ad-caja hueco"><span>?</span></div>';
        const cajaX = '<div class="ad-caja">' + x + '</div>';
        caja.innerHTML = modo === 'antes' ? cajaQ + '<div class="ad-flecha">' + ICONOS.izquierda + '</div>' + cajaX : cajaX + '<div class="ad-flecha">' + ICONOS.derecha + '</div>' + cajaQ;
        esc.appendChild(caja);
        const recta = crear('div', 'mini-recta');
        const ini = Math.max(0, Math.min(x - 4, max - 8));
        for (let v = ini; v <= Math.min(max, ini + 8); v++) recta.appendChild(crear('span', v === x ? 'marcado' : '', v === resp ? '·' : String(v)));
        recta.hidden = true;
        esc.appendChild(recta);
        botonesNumero(respC, opciones);
      },
      foco() { return [$('#escena .ad-caja.hueco'), $('#respuestas')]; },
      pista() { const r = $('#escena .mini-recta'); if (r) r.hidden = false; Pistas.quitarUna(); return Voz.decir(instr); }
    };
  }
  let k = 5, inicio, paso = 1, falta;
  if (dif === 0) { k = 4; inicio = azar(1, 6); falta = k - 1; }
  else if (dif === 1) { inicio = azar(1, 8); falta = azar(1, k - 1); }
  else if (rnd() < 0.5) { inicio = azar(6, 16); falta = azar(1, k - 1); }
  else { paso = -1; inicio = azar(5, 15); falta = azar(1, k - 1); }
  const nums = rango(0, k - 1).map(i => inicio + i * paso);
  const resp = nums[falta];
  const opciones = opcionesCercanas(resp, 0, 20, 3);
  const instr = (paso < 0 ? ['cuenta_atras'] : []).concat(['que_falta']);
  const leer = (tk, intro, cierre) => {
    const vagones = $$('#escena .vagon');
    return Pistas.leer(tk, nums.map((v, i) => ({ el: vagones[i], partes: [i === falta ? 'cual' : N(v)] })), cierre, intro);
  };
  return {
    firma: 's' + nums.join('-') + '/' + falta,
    respuesta: resp,
    opciones: opciones,
    rango: [0, 20],
    instr: instr,
    refuerzo: [N(resp)],
    pintar(esc, respC) {
      const tren = crear('div', 'tren');
      tren.dataset.ajustar = 'tren';
      const cabeza = crear('span', 'locomotora', paso < 0 ? '🚀' : '🚂');
      if (paso > 0) tren.appendChild(cabeza);
      nums.forEach((v, i) => {
        tren.appendChild(crear('div', 'vagon' + (i === falta ? ' hueco' : ''),
          i === falta ? '<span>?</span>' : '<b>' + v + '</b>' + (dif === 0 ? puntosHTML(v) : '')));
      });
      if (paso < 0) tren.appendChild(cabeza);
      esc.appendChild(tren);
      botonesNumero(respC, opciones);
    },
    foco() { return [$('#escena .vagon.hueco'), $('#respuestas')]; },
    pista(tk) { return leer(tk, ['fijate'], instr); },
    demo(tk) {
      const vagones = $$('#escena .vagon');
      return Pistas.leer(tk, nums.map((v, i) => ({ el: vagones[i], partes: [N(v)] })), null, ['mira_como']);
    }
  };
};

/* ----- Medir con cubos ----- */
ACTIVIDADES.medir = function (dif, ctx) {
  const r = [[2, 5], [3, 8], [4, 9]][dif];
  const L = azar(r[0], r[1]);
  const inicio = dif === 2 ? azar(0, 10 - L) : 0;
  const tipo = ctx && ctx.tipo === 'mision' ? 'tubo' : elegir(['lapiz', 'gusano', 'tubo']);
  const color = elegir(['#FF9F43', '#2FD18E', '#3FB2F2', '#FF5DA2', '#9B7BF7']);
  const opciones = opcionesCercanas(L, 1, 10, 3);
  const totalCubos = dif === 2 ? 10 : L;
  const U = 44;
  const cubosBajo = () => $$('#escena .cubo-medir').filter(c => Number(c.dataset.i) >= inicio && Number(c.dataset.i) < inicio + L);
  return {
    firma: 'me' + L + '-' + inicio + tipo,
    respuesta: L,
    opciones: opciones,
    rango: [1, 10],
    instr: ['cuantos_cubos'],
    refuerzo: [N(L)],
    ensenar: ['contamos_cubos'],
    pintar(esc, resp) {
      const W = Math.max(totalCubos, 6) * U + 40;
      const lz = lienzo(W, 170, 'medir');
      const obj = crear('div', 'medible-caja', objetoMedirSVG(tipo, color) + (tipo === 'tubo' ? '<span class="emo robot-cabeza">🤖</span>' : ''));
      obj.style.left = (20 + inicio * U) + 'px';
      obj.style.width = (L * U) + 'px';
      lz.l.appendChild(obj);
      const fila = crear('div', 'fila-cubos');
      fila.style.left = '20px';
      for (let i = 0; i < totalCubos; i++) {
        const c = crear('div', 'cubo-medir obj', '<span class="obj-num"></span>');
        c.dataset.i = i;
        c.style.left = (i * U) + 'px';
        fila.appendChild(c);
      }
      lz.l.appendChild(fila);
      lz.l.appendChild(crear('div', 'guia-medir', ''));
      $('.guia-medir', lz.l).style.cssText = 'left:' + (20 + inicio * U) + 'px;width:' + (L * U) + 'px';
      esc.appendChild(lz.zona);
      botonesNumero(resp, opciones);
    },
    foco() { return [$('#escena .medible-caja'), $('#escena .fila-cubos'), $('#respuestas')]; },
    pista(tk) { $('#escena .lienzo').classList.add('con-guia'); return Pistas.contar(tk, cubosBajo(), { intro: ['contamos_cubos'], cierre: ['cuantos_cubos'] }); },
    demo(tk) { $('#escena .lienzo').classList.add('con-guia'); return Pistas.contar(tk, cubosBajo(), { intro: ['mira_como'], cierre: ['aqui_hay', N(L)] }); }
  };
};

/* ----- Más largo y más corto ----- */
ACTIVIDADES.largo = function (dif) {
  let largos;
  if (dif === 0) largos = barajar([azar(2, 3), azar(5, 6), azar(8, 9)]);
  else { do { largos = [azar(3, 9), azar(3, 9), azar(3, 9)]; } while (new Set(largos).size < 3); }
  const pide = elegir(['largo', 'corto']);
  const objetivo = pide === 'largo' ? Math.max.apply(null, largos) : Math.min.apply(null, largos);
  const resp = largos.indexOf(objetivo);
  const inicios = largos.map(L => dif === 2 ? azar(0, 10 - L) : 0);
  const colores = barajar(['#FF9F43', '#2FD18E', '#3FB2F2', '#FF5DA2', '#9B7BF7']);
  const tipos = barajar(['lapiz', 'gusano', 'tubo']);
  const U = 40;
  return {
    firma: 'lg' + largos.join('') + pide + inicios.join(''),
    respuesta: resp,
    opciones: [0, 1, 2],
    sinRespuestas: true,
    instr: [pide === 'largo' ? 'toca_largo' : 'toca_corto'],
    refuerzo: [],
    explica: dif === 2 ? ['empieza_igual'] : ['mira'],
    pintar(esc) {
      const lz = lienzo(10 * U + 40, 3 * 86 + 20, 'largos');
      largos.forEach((L, i) => {
        const b = crear('button', 'barra-largo elegible', objetoMedirSVG(tipos[i], colores[i]));
        b.type = 'button';
        b.dataset.valor = String(i);
        b.setAttribute('aria-label', 'objeto ' + (i + 1));
        b.style.top = (10 + i * 86) + 'px';
        b.style.left = (20 + inicios[i] * U) + 'px';
        b.style.width = (L * U) + 'px';
        b.addEventListener('click', () => Juego.responder(String(i), b));
        lz.l.appendChild(b);
      });
      const reglas = crear('div', 'rejilla-medir');
      for (let i = 0; i <= 10; i++) reglas.appendChild(crear('i', '', ''));
      reglas.hidden = true;
      lz.l.insertBefore(reglas, lz.l.firstChild);
      esc.appendChild(lz.zona);
    },
    foco() { return $$('#escena .barra-largo'); },
    pista() {
      const r = $('#escena .rejilla-medir'); if (r) r.hidden = false;
      Pistas.quitarUna();
      return Voz.decir(dif === 2 ? ['empieza_igual', pide === 'largo' ? 'toca_largo' : 'toca_corto'] : [pide === 'largo' ? 'toca_largo' : 'toca_corto']);
    }
  };
};
