/* =========================================================
   16. ARRANQUE Y EVENTOS GLOBALES
   ========================================================= */
function ajustarAltura() {
  document.documentElement.style.setProperty('--app-h', window.innerHeight + 'px');
}

let temporizadorReajuste = null;
function reajustar() {
  clearTimeout(temporizadorReajuste);
  temporizadorReajuste = setTimeout(() => {
    ajustarAltura();
    Render.ajustar();
    if (UI.pantalla === 'p-mapa') { Mapa.distribuir(); Mapa.centrar(); }
    if (UI.pantalla === 'p-album') Album.ajustar();
    if (Confeti.activo) Confeti.ajustar();
  }, 120);
}

function alClic(sel, fn) {
  const el = $(sel);
  if (el) el.addEventListener('click', fn);
}

function enlazarEventos() {
  alClic('#btnJugar', () => Inicio.jugar());
  alClic('.btn-volver-inicio', () => Inicio.abrir());
  alClic('#btnNuevoAtras', () => Nuevo.atras());
  alClic('#btnPerfil', () => { Sonido.efecto('toque'); Perfiles.abrir(); });
  alClic('#btnMisiones', () => { Sonido.efecto('toque'); Misiones.abrir(); });
  alClic('#btnMisionesCerrar', () => Misiones.cerrar());
  alClic('#btnAlbum', () => { Sonido.efecto('toque'); Album.abrir(); });
  alClic('#btnTaller', () => { Sonido.efecto('toque'); Taller.abrir(); });
  $$('.btn-volver').forEach(b => b.addEventListener('click', () => { Sonido.efecto('toque'); Mapa.abrir({}); }));
  $$('#p-album .pestana').forEach(b => b.addEventListener('click', () => Album.cambiar(b.dataset.tab)));
  $$('#p-taller .pestana').forEach(b => b.addEventListener('click', () => Taller.cambiar(b.dataset.tab)));
  alClic('#btnMundoVolver', () => { Sonido.efecto('toque'); Mapa.abrir({}); });
  alClic('#btnDescubreSalir', () => Descubre.salir());
  alClic('#btnDescubreSeguir', () => { Sonido.efecto('toque'); Mano.ocultar(); Descubre.siguiente(); });
  alClic('#btnPausa', () => Juego.pausar());
  alClic('#btnSeguir', () => { Pausa.cerrar(); Voz.decir(['seguimos']).then(() => Juego.reanudar()); });
  alClic('#btnIrMapa', () => { Pausa.cerrar(); Juego.salir(); });
  alClic('#btnMusicaPausa', () => Pausa.alternarMusica());
  alClic('#btnRegalo', () => Premios.abrirRegalo());
  alClic('#btnPremioSeguir', () => { Sonido.efecto('toque'); Premios.seguir(); });
  alClic('#btnRespirar', () => Calma.respirar());
  alClic('#btnMasFacil', () => Calma.facil());
  alClic('#btnDescansar', () => Descanso.descansar());
  alClic('#btnSeguirJugando', () => Descanso.seguir());
  alClic('#btnCerrarPadres', () => Padres.cerrar());
  alClic('#btnCasaOir', () => Casa.oir());
  alClic('#btnCasaCerrar', () => Casa.cerrar());
  alClic('#btnRepetir', () => {
    if (UI.pantalla === 'p-juego') Juego.repetir();
    else Voz.repetir();
  });
  mantenerPulsado($('#btnPadres'), 3000, () => Padres.pedirAcceso());
  mantenerPulsado($('#btnDescansoPadres'), 3000, () => Padres.pedirAcceso());
  mantenerPulsado($('#btnCasaHecho'), 3000, () => Casa.confirmar());

  // Cosquillas a Pipo
  document.addEventListener('click', ev => {
    const slot = ev.target.closest && ev.target.closest('.pipo-slot.tocable');
    if (slot) Mascota.cosquillas(slot);
  });

  window.addEventListener('resize', reajustar);
  window.addEventListener('orientationchange', reajustar);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', reajustar);

  // Si la tablet se bloquea o se cambia de aplicación: pausa y silencio
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      Voz.callar();
      if (UI.pantalla === 'p-juego' && !Juego.pausado) Juego.pausar(true);
      Sonido.suspender();
    } else {
      Sonido.reanudar();
    }
  });

  // Evita el zoom accidental con dos dedos o doble toque (iOS)
  document.addEventListener('gesturestart', ev => ev.preventDefault());
  document.addEventListener('dblclick', ev => ev.preventDefault());
}

function iniciarApp() {
  Guardado.cargar();
  pintarIconos(document);
  crearCielo();
  Voz.iniciar();
  enlazarEventos();
  ajustarAltura();
  Inicio.abrir();
  const listo = () => {
    Inicio.marcarListo();
    Voz.avisar();
    if (MODO_PRUEBA) setTimeout(() => Pruebas.ejecutar(), 300);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', listo);
  else listo();
}

iniciarApp();
