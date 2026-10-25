/* =========================================================
   13. PREMIOS: resultado del nivel, regalos, despegue, taller,
       misiones del día, cofre de la semana y medallas
   ========================================================= */
const REGALO_SVG =
  '<svg viewBox="0 0 200 200" aria-hidden="true">' +
  '<g class="caja"><rect x="32" y="92" width="136" height="94" rx="14" fill="#FF5DA2"/>' +
  '<rect x="32" y="92" width="136" height="20" fill="#D93A80" opacity=".35"/>' +
  '<rect x="88" y="92" width="24" height="94" fill="#FFC93C"/>' +
  '<circle cx="62" cy="140" r="7" fill="#fff" opacity=".5"/><circle cx="140" cy="160" r="6" fill="#fff" opacity=".5"/></g>' +
  '<g class="tapa"><rect x="22" y="62" width="156" height="36" rx="12" fill="#FF7AB6"/>' +
  '<rect x="86" y="62" width="28" height="36" fill="#FFD95A"/>' +
  '<path d="M100 63 C82 28 48 34 60 56 C67 66 88 64 100 63 Z" fill="#FFC93C" stroke="#D99A00" stroke-width="3"/>' +
  '<path d="M100 63 C118 28 152 34 140 56 C133 66 112 64 100 63 Z" fill="#FFC93C" stroke="#D99A00" stroke-width="3"/>' +
  '<circle cx="100" cy="63" r="9" fill="#FFC93C" stroke="#D99A00" stroke-width="3"/></g></svg>';

function estrellasDe(res) {
  if (!res.length) return 1;
  const r = res.filter(Boolean).length / res.length;
  return r >= 0.9 ? 3 : (r >= 0.6 ? 2 : 1);
}

const Premios = {
  pendientes: [],
  alSeguir: null,

  pegatinaNueva() {
    const p = Guardado.p;
    const libres = PEGATINAS.filter(s => p.pegatinas.indexOf(s.id) < 0);
    if (!libres.length) return null;
    const s = elegir(libres);
    p.pegatinas.push(s.id);
    return s;
  },

  /* Apunta el resultado de un nivel: estrellas, desbloqueos y regalos (sin pantalla) */
  registrar(mundoIdx, tipoId, res) {
    const p = Guardado.p;
    const m = MUNDOS[mundoIdx];
    const est = estrellasDe(res);
    const regalos = [];
    let completaMundo = false;
    if (tipoId !== 'palabras') {
      const reg = registroMundo(p, m.id);
      const nv = reg.niveles[tipoId] || (reg.niveles[tipoId] = { mejor: 0, veces: 0 });
      const primeraVez = !nv.mejor;
      nv.mejor = Math.max(nv.mejor, est);
      nv.veces++;
      p.stats.niveles++;
      Misiones.sumar('nivel1', 1);
      Misiones.sumar('niveles2', 1);
      if (est === 3) { Misiones.sumar('tres', 1); p.estrellas += 2; }
      if (tipoId === 'mision' && primeraVez) { const s = this.pegatinaNueva(); if (s) regalos.push({ tipo: 'pegatina', s: s }); }
      if (tipoId === 'proyecto' && primeraVez) {
        completaMundo = true;
        if (p.piezas.indexOf(m.pieza) < 0) { p.piezas.push(m.pieza); regalos.push({ tipo: 'pieza', id: m.pieza }); }
        const extra = CARTAS.find(c => c.mundo === mundoIdx && c.extra);
        if (extra && Ciencia.darCarta(extra.id)) regalos.push({ tipo: 'carta', c: extra });
        if (mundoIdx + 1 < MUNDOS.length) p.desbloqueados = Math.max(p.desbloqueados, mundoIdx + 2);
      }
    }
    const rangoNuevo = rangoDe(p);
    if (rangoNuevo > (p.rango || 0)) { p.rango = rangoNuevo; regalos.push({ tipo: 'rango', r: RANGOS[rangoNuevo] }); }
    Guardado.guardar();
    Logros.comprobar();
    return { est: est, regalos: regalos, completaMundo: completaMundo };
  },

  /* Fin de un nivel: se apunta y se enseña el premio */
  finNivel(mundoIdx, tipoId, res) {
    const r = this.registrar(mundoIdx, tipoId, res);
    const m = MUNDOS[mundoIdx];
    const icono = tipoId === 'mision' ? m.mision.icono : (tipoId === 'proyecto' ? m.proyecto.icono : (ICONOS_NIVEL[tipoId] || '🔤'));
    this.resumen = { astro: m.id, icono: icono, ganadas: res.length + (r.est === 3 && tipoId !== 'palabras' ? 2 : 0) };
    this.mostrar(r.est, r.regalos, () => {
      if (r.completaMundo) {
        Despegue.iniciar(() => {
          if (m.id === 'sol') { Final.abrir(); return; }
          Mapa.abrir({ despertar: mundoIdx + 1 });
        });
      } else {
        Mundo.abrir(mundoIdx);
      }
    });
  },

  /* Pantalla de premio: estrellas del nivel y, si hay, un regalo que se abre tocando */
  mostrar(est, regalos, alSeguir) {
    this.pendientes = regalos.slice();
    this.alSeguir = alSeguir;
    UI.mostrar('p-premio');
    Mascota.actualizarTodas();
    const caja = $('#premioEstrellasNivel');
    caja.innerHTML = [1, 2, 3].map(() => '<span class="estrella-slot grande">' + SVG_ESTRELLA + '</span>').join('');
    const reg = $('#btnRegalo');
    reg.innerHTML = REGALO_SVG;
    reg.className = 'regalo';
    reg.hidden = !regalos.length;
    const rev = $('#premioRevelado');
    rev.hidden = true;
    if (!regalos.length && this.resumen) {
      // Sin regalo: el planeta, el nivel y las estrellas ganadas
      rev.hidden = false;
      rev.innerHTML = '<div class="premio-resumen"><div class="pr-planeta">' + planetaSVG(this.resumen.astro) + '<span class="pr-nivel emo">' + this.resumen.icono + '</span></div><div class="premio-estrellas-ganadas">⭐ +' + this.resumen.ganadas + '</div></div>';
    }
    this.resumen = null;
    $('#premioCentro').classList.remove('abierto');
    $('#btnPremioSeguir').hidden = true;
    Sonido.efecto('nivel');
    Confeti.lanzar(window.innerWidth / 2, window.innerHeight * 0.3, 80, true);
    const slots = $$('.estrella-slot', caja);
    slots.forEach((s, i) => { if (i < est) setTimeout(() => { s.classList.add('llena'); Sonido.efecto('estrellaGrande'); }, 500 + i * 450); });
    Voz.decir(['nivel_hecho', 'estrellas_' + est]).then(() => {
      if (UI.pantalla !== 'p-premio') return;
      if (regalos.length) { Voz.decir(['toca_regalo']); Mano.señalar([reg], { vueltas: 1 }); }
      else this.listo();
    });
    UI.actualizarEstrellas();
  },

  listo() {
    const b = $('#btnPremioSeguir');
    b.hidden = false;
    Mascota.animar('feliz');
  },

  abrirRegalo() {
    const reg = $('#btnRegalo');
    if (reg.classList.contains('abierto')) return;
    Mano.ocultar();
    reg.classList.add('abriendo');
    Sonido.efecto('regalo');
    setTimeout(() => {
      reg.classList.add('abierto');
      $('#premioCentro').classList.add('abierto');
      this.revelarSiguiente();
    }, 450);
  },

  async revelarSiguiente() {
    const cont = $('#premioRevelado');
    cont.hidden = false;
    while (this.pendientes.length) {
      const r = this.pendientes.shift();
      cont.innerHTML = '';
      const c = UI.centro(cont);
      Confeti.lanzar(c.x, c.y, 70, true);
      if (r.tipo === 'pegatina') {
        cont.innerHTML = '<div class="pegatina pegatina-premio"><span class="emo">' + r.s.e + '</span></div>';
        Sonido.efecto('estrellaGrande');
        await Voz.decir(['pegatina_nueva']);
      } else if (r.tipo === 'pieza') {
        cont.innerHTML = '<div class="premio-nave">' + naveSVG(Guardado.p.piezas, Guardado.p.nave.color) + '</div>';
        const pieza = $('.pieza-' + r.id, cont);
        if (pieza) pieza.classList.add('nueva');
        Sonido.efecto('desbloquear');
        await Voz.decir(['pieza_nave']);
      } else if (r.tipo === 'carta') {
        cont.innerHTML = cartaGrandeHTML(r.c);
        Sonido.efecto('carta');
        await Voz.decir(['carta_nueva'].concat(r.c.hechos.slice(0, 1)));
      } else if (r.tipo === 'rango') {
        cont.innerHTML = '<div class="premio-rango"><span class="emo">' + r.r.icono + '</span><b>' + r.r.nombre + '</b></div>';
        Sonido.efecto('rango');
        await Voz.decir(['nuevo_rango', 'rango_' + r.r.id]);
      }
      await esperar(500);
    }
    this.listo();
  },

  seguir() {
    Voz.callar();
    const f = this.alSeguir;
    this.alSeguir = null;
    if (!f) return;
    if (Descanso.toca()) Descanso.abrir(f); else f();
  },

  /* Carta nueva en una capa (en "Descubre") */
  mostrarCarta(carta) {
    return new Promise(resolver => {
      const capa = $('#c-carta');
      Mano.ocultar();
      $('#cartaNueva').innerHTML = cartaGrandeHTML(carta);
      capa.hidden = false;
      Sonido.efecto('carta');
      Confeti.lanzar(window.innerWidth / 2, window.innerHeight / 2, 70, true);
      let hecho = false;
      const cerrar = () => { if (hecho) return; hecho = true; capa.hidden = true; capa.removeEventListener('click', cerrar); resolver(); };
      Voz.decir(['carta_nueva']).then(() => setTimeout(cerrar, 900));
      setTimeout(() => capa.addEventListener('click', cerrar), 600);
    });
  },

  mostrarPegatina(s) {
    const capa = $('#c-carta');
    $('#cartaNueva').innerHTML = '<div class="pegatina pegatina-premio"><span class="emo">' + s.e + '</span></div>';
    capa.hidden = false;
    Sonido.efecto('estrellaGrande');
    const cerrar = () => { capa.hidden = true; capa.removeEventListener('click', cerrar); };
    setTimeout(() => capa.addEventListener('click', cerrar), 500);
    setTimeout(cerrar, 3500);
  }
};

function cartaGrandeHTML(c) {
  return '<div class="carta-grande"><div class="cg-dibujo">' + (c.astro ? planetaSVG(c.astro) : '<span class="emo">' + c.emoji + '</span>') + '</div><div class="cg-nombre">' + c.nombre + '</div></div>';
}

/* ----- Despegue del cohete al completar un mundo ----- */
const Despegue = {
  iniciar(alTerminar) {
    const capa = $('#c-despegue');
    Mano.ocultar();
    const cohete = $('#coheteGrande');
    const p = Guardado.p;
    cohete.innerHTML = naveSVG(p.piezas, p.nave.color);
    cohete.classList.remove('vuela');
    capa.hidden = false;
    Voz.decir(['mundo_completado', 'despegue']).then(() => {
      Sonido.efecto('despegue');
      cohete.classList.add('vuela');
      setTimeout(() => {
        capa.hidden = true;
        cohete.classList.remove('vuela');
        alTerminar();
      }, REDUCIR_MOVIMIENTO ? 400 : 1900);
    });
  }
};

/* ----- Gran final: todo el sistema solar recorrido ----- */
const Final = {
  abrir() {
    const capa = $('#c-carta');
    const p = Guardado.p;
    $('#cartaNueva').innerHTML = '<div class="final"><div class="final-trofeo emo">🏆</div><div class="final-nombre">' + escapar(p.nombre || avatarDe(p).apodo) + '</div><div class="final-rango">👑 ' + RANGOS[RANGOS.length - 1].nombre + '</div>' + filaOrdenHTML(null) + '</div>';
    capa.hidden = false;
    Sonido.efecto('rango');
    const lluvia = setInterval(() => Confeti.lanzar(azar(0, window.innerWidth), window.innerHeight * 0.2, 40, true), 700);
    Voz.decir(['sistema_completado']);
    const cerrar = () => { clearInterval(lluvia); capa.hidden = true; capa.removeEventListener('click', cerrar); Mapa.abrir({}); };
    setTimeout(() => capa.addEventListener('click', cerrar), 2500);
  }
};

/* ----- Taller: vestir a Pipo y pintar la nave ----- */
const Taller = {
  pestana: 'colores',
  abrir() {
    UI.mostrar('p-taller');
    UI.actualizarEstrellas();
    this.pintar();
    Voz.decir(['taller']);
  },
  cambiar(t) { this.pestana = t; Sonido.efecto('pagina'); this.pintar(); if (t === 'nave') Voz.decir(['nave_mira']); },
  pintar() {
    const p = Guardado.p;
    $$('#p-taller .pestana').forEach(b => b.classList.toggle('activa', b.dataset.tab === this.pestana));
    const vista = $('#tallerVista');
    vista.className = 'taller-vista ' + (this.pestana === 'nave' ? 'con-nave' : 'con-pipo');
    vista.innerHTML = this.pestana === 'nave' ? '<div class="taller-nave">' + naveSVG(p.piezas, p.nave.color, { siluetas: true }) + '<span class="chip nave-cuenta">' + p.piezas.length + '/10</span></div>' : '<div class="tienda-pipo pipo-slot" data-slot="taller">' + Mascota.html() + '</div>';
    const cont = $('#tiendaItems');
    cont.innerHTML = '';
    let lista, tienda, actual;
    if (this.pestana === 'colores') { lista = COLORES_PIPO; tienda = p.tienda.colores; actual = p.pipo.color; }
    else if (this.pestana === 'accesorios') { lista = ACCESORIOS; tienda = p.tienda.accesorios; actual = p.pipo.acc; }
    else { lista = COLORES_NAVE; tienda = p.tienda.naves; actual = p.nave.color; }
    lista.forEach(it => {
      const tiene = tienda.indexOf(it.id) >= 0;
      let dibujo;
      if (this.pestana === 'colores') dibujo = '<span class="mini">' + Mascota.html({ color: it.id, acc: 'ninguno' }) + '</span>';
      else if (this.pestana === 'accesorios') dibujo = '<span class="mini">' + Mascota.html({ acc: it.id }) + '</span>';
      else dibujo = '<span class="muestra-nave" style="background:' + it.hex + '"></span>';
      const b = crear('button', 'item' + (actual === it.id ? ' equipado' : '') + (!tiene && p.estrellas < it.precio ? ' caro' : ''), dibujo + (tiene ? '' : '<span class="precio"><span class="ico">' + SVG_ESTRELLA + '</span>' + it.precio + '</span>'));
      b.type = 'button';
      b.setAttribute('aria-label', tiene ? 'Elegir' : 'Comprar por ' + it.precio + ' estrellas');
      b.addEventListener('click', () => this.tocar(it, tiene, b));
      cont.appendChild(b);
    });
  },
  tocar(it, tiene, b) {
    const p = Guardado.p;
    const clave = this.pestana === 'colores' ? 'colores' : (this.pestana === 'accesorios' ? 'accesorios' : 'naves');
    if (!tiene) {
      if (p.estrellas < it.precio) {
        b.classList.remove('sin-dinero'); void b.offsetWidth; b.classList.add('sin-dinero');
        Sonido.efecto('no');
        Voz.decir(['mas_estrellas', 'juega_ganar']);
        return;
      }
      p.estrellas -= it.precio;
      p.tienda[clave].push(it.id);
      Sonido.efecto('comprar');
    } else Sonido.efecto('toque');
    if (this.pestana === 'colores') p.pipo.color = it.id;
    else if (this.pestana === 'accesorios') p.pipo.acc = it.id;
    else p.nave.color = it.id;
    Guardado.guardar();
    UI.actualizarEstrellas();
    Mascota.actualizarTodas();
    this.pintar();
    if (this.pestana !== 'nave') { Mascota.animar('feliz'); Voz.decir([elegir(['que_guapo', 'me_encanta'])]); }
    else Voz.decir(['me_encanta']);
    Logros.comprobar();
  }
};

/* ----- Misiones del día y cofre de la semana ----- */
function claveSemana(fecha) {
  const d = fecha || new Date();
  const lunes = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return hoyISO(lunes);
}
const Misiones = {
  preparar() {
    const p = Guardado.p;
    if (!p) return;
    const hoy = hoyISO();
    if (p.misiones.fecha !== hoy) {
      const h = huella(hoy + p.id);
      const lista = MISIONES_DIA.slice().sort((a, b) => huella(a.id + h) - huella(b.id + h)).slice(0, 3);
      p.misiones = { fecha: hoy, lista: lista.map(m => ({ id: m.id, prog: 0, hecha: false })), todas: false };
    }
    const sem = claveSemana();
    if (p.semana.id !== sem) p.semana = { id: sem, llaves: 0, abierto: false };
    Guardado.guardarLuego();
  },
  sumar(id, n) {
    const p = Guardado.p;
    if (!p || !p.misiones.lista) return;
    if (p.misiones.fecha !== hoyISO()) this.preparar();
    const m = p.misiones.lista.find(x => x.id === id);
    if (!m || m.hecha) return;
    const def = MISIONES_DIA.find(x => x.id === id);
    m.prog = Math.min(def.meta, m.prog + n);
    if (m.prog >= def.meta) {
      m.hecha = true;
      p.estrellas += ESTRELLAS_MISION_DIA;
      UI.aviso(def.icono, '+' + ESTRELLAS_MISION_DIA + ' ⭐');
      Sonido.efecto('moneda2');
      if (p.misiones.lista.every(x => x.hecha) && !p.misiones.todas) {
        p.misiones.todas = true;
        p.semana.llaves = Math.min(LLAVES_COFRE, p.semana.llaves + 1);
        setTimeout(() => UI.aviso('🔑', p.semana.llaves + '/' + LLAVES_COFRE), 2800);
      }
    }
    Guardado.guardarLuego();
    this.pintarInsignia();
  },
  pendientes() {
    const p = Guardado.p;
    return p && p.misiones.lista ? p.misiones.lista.filter(x => !x.hecha).length : 0;
  },
  cofreListo() {
    const p = Guardado.p;
    return !!p && p.semana.llaves >= LLAVES_COFRE && !p.semana.abierto;
  },
  pintarInsignia() {
    const b = $('#insigniaMisiones');
    if (!b) return;
    const n = this.pendientes();
    const cofre = this.cofreListo();
    b.hidden = !n && !cofre;
    b.textContent = cofre ? '🎁' : String(n);
  },
  abrir() {
    const p = Guardado.p;
    this.preparar();
    const lista = $('#misionesLista');
    lista.innerHTML = p.misiones.lista.map(m => {
      const def = MISIONES_DIA.find(x => x.id === m.id);
      return '<div class="mision-dia' + (m.hecha ? ' hecha' : '') + '"><span class="md-ico emo">' + def.icono + '</span><span class="md-barra"><i style="width:' + Math.round(100 * m.prog / def.meta) + '%"></i></span><span class="md-estado">' + (m.hecha ? ICONOS.check : m.prog + '/' + def.meta) + '</span></div>';
    }).join('');
    const cofre = $('#cofreSemana');
    const listo = this.cofreListo();
    cofre.innerHTML = '<button class="btn cofre' + (listo ? ' listo' : '') + (p.semana.abierto ? ' abierto' : '') + '" type="button" aria-label="Cofre de la semana"><span class="emo">' + (p.semana.abierto ? '📭' : '🧰') + '</span></button><span class="llaves">' +
      rango(1, LLAVES_COFRE).map(i => '<span class="emo llave' + (i <= p.semana.llaves ? ' si' : '') + '">🔑</span>').join('') + '</span>';
    $('.cofre', cofre).addEventListener('click', () => this.abrirCofre());
    $('#c-misiones').hidden = false;
    const frases = ['md_titulo'].concat(p.misiones.lista.filter(m => !m.hecha).map(m => MISIONES_DIA.find(x => x.id === m.id).frase));
    if (listo) frases.push('cofre_listo');
    Mano.ocultar();
    Voz.decir(frases);
  },
  cerrar() { $('#c-misiones').hidden = true; Voz.callar(); this.pintarInsignia(); },
  abrirCofre() {
    const p = Guardado.p;
    if (!this.cofreListo()) { Sonido.efecto('no'); Voz.decir(['cofre_falta']); return; }
    p.semana.abierto = true;
    p.stats.cofres++;
    p.estrellas += ESTRELLAS_COFRE;
    const s = Premios.pegatinaNueva();
    Guardado.guardar();
    UI.actualizarEstrellas();
    Sonido.efecto('regalo');
    Confeti.lanzar(window.innerWidth / 2, window.innerHeight / 2, 100, true);
    $('#c-misiones').hidden = true;
    Voz.decir(['pegatina_nueva', 'toma_estrellas']);
    if (s) Premios.mostrarPegatina(s);
    Logros.comprobar();
    this.pintarInsignia();
  }
};

/* ----- Medallas ----- */
const Logros = {
  comprobar() {
    const p = Guardado.p;
    if (!p) return;
    const nuevos = LOGROS.filter(l => p.logros.indexOf(l.id) < 0 && l.test(p));
    nuevos.forEach((l, i) => {
      p.logros.push(l.id);
      setTimeout(() => { UI.aviso(l.icono); Sonido.efecto('estrella'); }, 600 + i * 2200);
    });
    if (nuevos.length) Guardado.guardarLuego();
  }
};
