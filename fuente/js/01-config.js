'use strict';
/* =========================================================
   PIPO Y LOS PLANETAS 3 — Aventura por el sistema solar
   Matemáticas, ciencia y vida práctica para niños de 5 a 7 años.
   Un único archivo: sin librerías, sin anuncios, sin compras
   y sin recoger datos. Voces naturales grabadas dentro del archivo.

   Índice del código (cada parte está en su propio bloque):
    0. Frases de Pipo (generado) y audio silencioso
    1. Configuración y datos (este bloque)
    2. Utilidades
    3. Guardado con perfiles (localStorage) y migración de la v2
    4. Sonido (música por mundo y efectos con Web Audio)
    5. Voz (clips naturales + voz del dispositivo de reserva)
    6. Mascota (Pipo en SVG)
    7. Dibujos: planetas, nave, monedas, relojes...
    8. Interfaz común (iconos, mano guía, avisos, confeti)
    9. Motor del juego: plan de nivel, dominio, pistas
   10. Actividades de matemáticas (una por habilidad)
   11. Ciencia: descubre el planeta, preguntas y álbum de cartas
   12. Pantallas: inicio, perfiles, prueba inicial, mapa y mundo
   13. Premios: resultado, despegue, nave, armario, misiones, logros
   14. Pausa, descanso y zona de padres
   15. Pruebas automáticas (index.html?test=1)
   16. Arranque y eventos globales
   ========================================================= */

/* =========================================================
   1. CONFIGURACIÓN Y DATOS
   ========================================================= */
const VERSION = '3.0';
const CLAVE_GUARDADO = 'pipo-planetas-v3';
const ACIERTOS_PARA_SUBIR = 3;    // aciertos seguidos a la primera para subir la dificultad de una habilidad
const DIFICULTAD_MAX = 2;         // grados internos 0 (fácil), 1 (medio) y 2 (difícil)
const HISTORIAL = 10;             // intentos que se recuerdan por habilidad (para el dominio)
const DOMINIO_OK = 0.8;           // 80 % a la primera en los últimos 10 = dominada
const ESTRELLAS_ACIERTO = 1;      // estrellas (la "moneda" del juego) por reto terminado
const ESTRELLAS_DIA = 3;          // regalo al volver otro día
const ESTRELLAS_ASTEROIDE = 2;
const ESTRELLAS_CASA = 5;
const ESTRELLAS_COFRE = 10;
const ESTRELLAS_MISION_DIA = 2;
const ESPERA_AYUDA_MS = 9000;     // silencio antes de que Pipo vuelva a explicar
const MAX_PERFILES = 4;
const MAX_PARECIDAS = 2;          // preguntas "parecidas" que se pueden añadir a un nivel tras una demostración
const REDUCIR_MOVIMIENTO = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const MODO_PRUEBA = /[?&]test=1/.test(location.search);

/* ---------- Los 6 tipos de nivel de cada mundo ----------
   retos: preguntas del nivel · delta: ajuste de dificultad · repaso: parte de preguntas de mundos anteriores */
const TIPOS_NIVEL = [
  { id: 'aprende', icono: '💡', retos: 6, delta: -1, repaso: 0, frase: 'nivel_aprende' },
  { id: 'practica', icono: '🎯', retos: 8, delta: 0, repaso: 0.25, frase: 'nivel_practica' },
  { id: 'mision', icono: null, retos: 8, delta: 0, repaso: 0, frase: null },
  { id: 'descubre', icono: '🔭', retos: 4, delta: 0, repaso: 0, frase: 'nivel_descubre' },
  { id: 'reto', icono: '⚡', retos: 8, delta: 1, repaso: 0.25, frase: 'nivel_reto', menosAyuda: true },
  { id: 'proyecto', icono: null, retos: 10, delta: 0, repaso: 0.2, frase: null }
];
const NOMBRE_TIPO = { aprende: 'Aprende', practica: 'Practica', mision: 'Misión', descubre: 'Descubre', reto: 'Reto', proyecto: 'Gran misión', casa: 'Reto en casa', palabras: 'Palabras' };

/* ---------- Los 10 mundos, en el orden del viaje ----------
   Salimos de casa (la Tierra), visitamos a los vecinos (Luna, Marte, Venus y Mercurio),
   viajamos hacia los gigantes (Júpiter, Saturno, Urano y Neptuno) y terminamos en el Sol.
   El mapa dibuja el sistema solar en su orden real; el número de cada planeta es el orden del viaje. */
const MUNDOS = [
  {
    id: 'tierra', nombre: 'Tierra', edad: 5, tema: 'Números hasta 10, más y menos, formas',
    habs: ['contar', 'dame', 'fogonazo', 'dedos', 'tocaNumero', 'grupoNumero', 'comparar', 'formas', 'buscaTodas'],
    aprende: ['contar', 'tocaNumero', 'formas'],
    mision: { id: 'mochila', icono: '🎒', habs: ['mochila', 'contar', 'grupoNumero'], nombre: 'La mochila del astronauta' },
    proyecto: { icono: '🏗️', nombre: 'La base de lanzamiento' },
    casa: { icono: '🔵', nombre: 'Busca 5 cosas redondas en casa' },
    pieza: 'punta', cartas: ['tierra', 'astronauta'],
    musica: { escala: 'mayor', tono: 0, tempo: 92, semilla: 11 }
  },
  {
    id: 'luna', nombre: 'Luna', edad: 5, tema: 'Hasta 20, sumar hasta 10 y series',
    habs: ['numero20', 'marcos', 'sumas', 'llenar', 'patrones'],
    aprende: ['marcos', 'sumas', 'patrones'],
    mision: { id: 'rocas', icono: '🧺', habs: ['rocas', 'llenar', 'marcos'], nombre: 'Rocas lunares' },
    proyecto: { icono: '🛖', nombre: 'Una base en la Luna' },
    casa: { icono: '🌙', nombre: 'Mirar la Luna por la noche' },
    pieza: 'ventana', cartas: ['luna', 'cohete'],
    musica: { escala: 'pentatonica', tono: -3, tempo: 84, semilla: 23 }
  },
  {
    id: 'marte', nombre: 'Marte', edad: 5, tema: 'Restar hasta 10, antes y después, medir',
    habs: ['revienta', 'quitar', 'secuencias', 'medir', 'largo'],
    aprende: ['revienta', 'secuencias', 'medir'],
    mision: { id: 'robot', icono: '📏', habs: ['medir', 'largo', 'quitar'], nombre: 'El robot explorador' },
    proyecto: { icono: '🏠', nombre: 'Una casa en Marte' },
    casa: { icono: '✋', nombre: 'Medir la cama con palmos' },
    pieza: 'alas', cartas: ['marte', 'robot'],
    musica: { escala: 'mixolidia', tono: 2, tempo: 98, semilla: 37 }
  },
  {
    id: 'venus', nombre: 'Venus', edad: 6, tema: 'Hasta 50: decenas, saltos, pares e impares',
    habs: ['numero50', 'decenas', 'haceNumero', 'saltos', 'pares'],
    aprende: ['decenas', 'saltos', 'pares'],
    mision: { id: 'cajas', icono: '📦', habs: ['haceNumero', 'decenas', 'saltos'], nombre: 'Cajas de diez' },
    proyecto: { icono: '🎈', nombre: 'El globo explorador' },
    casa: { icono: '🫘', nombre: 'Hacer montones de diez' },
    pieza: 'motor', cartas: ['venus', 'lucero'],
    musica: { escala: 'lidia', tono: 4, tempo: 90, semilla: 41 }
  },
  {
    id: 'mercurio', nombre: 'Mercurio', edad: 6, tema: 'Sumar y restar hasta 20, el reloj y los días',
    habs: ['dobles', 'descomponer', 'sumas20', 'restas20', 'reloj', 'dias', 'ordenar'],
    aprende: ['dobles', 'reloj', 'dias'],
    mision: { id: 'horario', icono: '⏰', habs: ['reloj', 'dias', 'ordenar'], nombre: 'El horario de la nave' },
    proyecto: { icono: '🛡️', nombre: 'El escudo contra el calor' },
    casa: { icono: '🕰️', nombre: 'Mirar la hora con un adulto' },
    pieza: 'escudo', cartas: ['mercurio', 'orbita'],
    musica: { escala: 'mayor', tono: 7, tempo: 108, semilla: 53 }
  },
  {
    id: 'jupiter', nombre: 'Júpiter', edad: 6, tema: 'Hasta 100, mayor y menor, dinero y problemas',
    habs: ['tabla100', 'numero100', 'signos', 'contarDinero', 'pagar', 'problema'],
    aprende: ['tabla100', 'signos', 'contarDinero'],
    mision: { id: 'tienda', icono: '🛒', habs: ['pagar', 'contarDinero', 'problema'], nombre: 'La tienda espacial' },
    proyecto: { icono: '🛰️', nombre: 'Rescatar la sonda' },
    casa: { icono: '🪙', nombre: 'Jugar a las tiendas' },
    pieza: 'antena', cartas: ['jupiter', 'mancha'],
    musica: { escala: 'mixolidia', tono: -5, tempo: 88, semilla: 61 }
  },
  {
    id: 'saturno', nombre: 'Saturno', edad: 7, tema: 'Mitades, repartos, cuerpos, simetría y la media hora',
    habs: ['mitad', 'repartir', 'cuerpos', 'simetria', 'relojMedia'],
    aprende: ['mitad', 'cuerpos', 'relojMedia'],
    mision: { id: 'comida', icono: '🍪', habs: ['repartir', 'mitad', 'dobles'], nombre: 'La comida de la tripulación' },
    proyecto: { icono: '🏙️', nombre: 'La estación de los anillos' },
    casa: { icono: '🍎', nombre: 'Repartir la merienda' },
    pieza: 'luces', cartas: ['saturno', 'anillos'],
    musica: { escala: 'pentatonica', tono: 3, tempo: 94, semilla: 71 }
  },
  {
    id: 'urano', nombre: 'Urano', edad: 7, tema: 'Dos cifras, el cambio, gráficas, peso y capacidad',
    habs: ['sumaDecenas', 'restaDecenas', 'cambio', 'grafica', 'balanza', 'capacidad'],
    aprende: ['sumaDecenas', 'grafica', 'balanza'],
    mision: { id: 'carga', icono: '⚖️', habs: ['carga', 'balanza', 'cambio'], nombre: 'Cargar el cohete' },
    proyecto: { icono: '🔭', nombre: 'El telescopio gigante' },
    casa: { icono: '🥛', nombre: 'Comparar vasos de agua' },
    pieza: 'propulsores', cartas: ['urano', 'gigantes'],
    musica: { escala: 'dorica', tono: -2, tempo: 80, semilla: 83 }
  },
  {
    id: 'neptuno', nombre: 'Neptuno', edad: 7, tema: 'Grupos iguales, problemas de dos pasos y lógica',
    habs: ['grupos', 'problema2', 'sobra', 'sudoku', 'robot'],
    aprende: ['grupos', 'sobra', 'robot'],
    mision: { id: 'mapa', icono: '🗺️', habs: ['robot', 'sudoku', 'grupos'], nombre: 'El mapa estelar' },
    proyecto: { icono: '📡', nombre: 'Rescatar el satélite' },
    casa: { icono: '🧭', nombre: 'Guiar a un adulto con órdenes' },
    pieza: 'radar', cartas: ['neptuno', 'pluton'],
    musica: { escala: 'dorica', tono: 5, tempo: 100, semilla: 97 }
  },
  {
    id: 'sol', nombre: 'Sol', edad: 7, tema: 'El orden de los planetas y el gran desafío final',
    habs: ['ordenPlanetas', 'tamanos', 'repaso'],
    aprende: ['ordenPlanetas', 'tamanos'],
    mision: { id: 'viaje', icono: '☀️', habs: ['ordenPlanetas', 'tamanos', 'ciencia'], nombre: 'El viaje al Sol' },
    proyecto: { icono: '🏆', nombre: 'El gran desafío final' },
    casa: { icono: '👤', nombre: 'Mirar tu sombra' },
    pieza: 'panel', cartas: ['sol', 'estrellas'],
    musica: { escala: 'lidia', tono: 0, tempo: 104, semilla: 101 }
  }
];
const IDX_MUNDO = {};
MUNDOS.forEach((m, i) => { IDX_MUNDO[m.id] = i; });

/* Habilidad principal de cada mundo para la prueba inicial */
const PRUEBA_HABS = { tierra: ['contar', 'tocaNumero'], luna: ['sumas', 'marcos'], marte: ['quitar', 'secuencias'], venus: ['decenas', 'saltos'], mercurio: ['sumas20', 'reloj'] };

/* ---------- Habilidades: nombre para la zona de padres y consejo para casa ---------- */
const HABILIDADES = {
  contar: { nombre: 'Contar objetos (hasta 10)', casa: 'Contad juntos escalones, cucharas o juguetes, tocando cada uno.' },
  dame: { nombre: 'Dar una cantidad', casa: 'Pídele «dame 4 pinzas» y comprobad juntos.' },
  mochila: { nombre: 'Dar una cantidad (misión)', casa: 'Que prepare su mochila: 2 lápices, 3 cuentos…' },
  fogonazo: { nombre: 'Ver cantidades de un vistazo', casa: 'Jugad con dados: ¿cuántos puntos sin contar?' },
  dedos: { nombre: 'Cantidades con los dedos', casa: 'Enseñad números con los dedos y que diga cuántos son.' },
  tocaNumero: { nombre: 'Reconocer números hasta 10', casa: 'Buscad números en portales, matrículas o el ascensor.' },
  grupoNumero: { nombre: 'Asociar número y cantidad', casa: 'Escribid un número y que ponga esa cantidad de piezas.' },
  comparar: { nombre: 'Más, menos o igual', casa: '¿Quién tiene más uvas en el plato? Comparad contando.' },
  formas: { nombre: 'Formas planas', casa: 'Buscad círculos, triángulos y cuadrados por la calle.' },
  buscaTodas: { nombre: 'Encontrar formas iguales', casa: 'Clasificad piezas o galletas por su forma.' },
  numero20: { nombre: 'Reconocer números hasta 20', casa: 'Buscad números del 11 al 20 en el calendario.' },
  marcos: { nombre: 'Números hasta 20 con cajas de diez', casa: 'Usad una huevera de 10 huecos para contar hasta 20.' },
  sumas: { nombre: 'Sumar hasta 10', casa: 'Juntad dos grupos de juguetes y contad cuántos hay.' },
  rocas: { nombre: 'Sumar hasta 10 (misión)', casa: 'Juntad piedras o castañas de dos montones.' },
  llenar: { nombre: 'Completar 5 y 10', casa: '¿Cuántos faltan para llenar la huevera de 10?' },
  patrones: { nombre: 'Series', casa: 'Haced collares o filas de colores que se repiten.' },
  revienta: { nombre: 'Restar quitando', casa: 'Pon 7 galletas, comed 2: ¿cuántas quedan?' },
  quitar: { nombre: 'Restar mirando', casa: 'Tapad algunas piezas con la mano: ¿cuántas quedan a la vista?' },
  secuencias: { nombre: 'Antes y después', casa: 'Contad hacia delante y hacia atrás al subir escaleras.' },
  medir: { nombre: 'Medir con unidades', casa: 'Medid la mesa con palmos o un juguete con clips.' },
  largo: { nombre: 'Más largo y más corto', casa: 'Ordenad cordones, lápices o zapatos del más largo al más corto.' },
  numero50: { nombre: 'Reconocer números hasta 50', casa: 'Leed los números de las páginas de un cuento.' },
  decenas: { nombre: 'Decenas y unidades', casa: 'Agrupad legumbres de 10 en 10 y contad decenas.' },
  haceNumero: { nombre: 'Formar números con decenas', casa: 'Con montones de 10 y sueltas, formad el número de vuestra casa.' },
  saltos: { nombre: 'Contar de 2 en 2, de 5 en 5 y de 10 en 10', casa: 'Contad calcetines de 2 en 2 o dedos de 5 en 5.' },
  pares: { nombre: 'Pares e impares', casa: '¿Todos los calcetines tienen pareja? Probad con distintas cantidades.' },
  dobles: { nombre: 'Dobles', casa: 'Dados o fichas de dominó: el doble es lo mismo dos veces.' },
  descomponer: { nombre: 'Descomponer números (parejas que suman)', casa: '¿De cuántas formas podemos repartir 8 canicas en dos manos?' },
  sumas20: { nombre: 'Sumar hasta 20 (hacer diez)', casa: 'Para 8 + 5: completa el 10 y suma lo que sobra.' },
  restas20: { nombre: 'Restar hasta 20', casa: 'Contad hacia atrás en una recta dibujada con tiza.' },
  reloj: { nombre: 'Leer el reloj (en punto)', casa: 'Mirad un reloj de agujas a la hora de comer y cenar.' },
  dias: { nombre: 'Días de la semana: ayer, hoy y mañana', casa: 'Cada mañana: ¿qué día es hoy? ¿y mañana?' },
  ordenar: { nombre: 'Ordenar en el tiempo', casa: 'Contad la rutina del día: ¿qué hacemos primero?' },
  tabla100: { nombre: 'Tabla del 100', casa: 'Imprimid una tabla del 100 y jugad a encontrar números.' },
  numero100: { nombre: 'Reconocer números hasta 100', casa: 'Leed números de dos cifras en precios y portales.' },
  signos: { nombre: 'Mayor, menor e igual (> < =)', casa: 'Jugad a las cartas: ¿quién tiene el número mayor?' },
  contarDinero: { nombre: 'Contar dinero', casa: 'Contad juntos las monedas de la hucha.' },
  pagar: { nombre: 'Pagar una cantidad exacta', casa: 'Que pague él con monedas algo pequeño.' },
  problema: { nombre: 'Problemas de un paso', casa: 'Inventad problemas con la compra o los juguetes.' },
  mitad: { nombre: 'La mitad', casa: 'Partid la fruta por la mitad: ¿cuánto le toca a cada uno?' },
  repartir: { nombre: 'Repartir en partes iguales', casa: 'Repartid cartas o galletas: uno para ti, uno para mí…' },
  cuerpos: { nombre: 'Cuerpos geométricos (esfera, cubo, cilindro, cono)', casa: 'Buscad pelotas, dados, latas y cucuruchos en casa.' },
  simetria: { nombre: 'Simetría', casa: 'Doblad un papel con pintura y mirad cómo sale igual a los dos lados.' },
  relojMedia: { nombre: 'Leer el reloj (y media)', casa: 'Señalad las medias horas en un reloj de agujas.' },
  sumaDecenas: { nombre: 'Sumas de dos cifras sin llevar', casa: 'Sumad decenas y unidades por separado.' },
  restaDecenas: { nombre: 'Restas de dos cifras sin llevar', casa: 'Restad decenas y unidades por separado.' },
  cambio: { nombre: 'Calcular el cambio', casa: 'Jugad a las tiendas: si pagas 10 € y cuesta 7 €, ¿cuánto te devuelven?' },
  grafica: { nombre: 'Leer gráficas y pictogramas', casa: 'Haced una gráfica de las frutas que hay en casa.' },
  balanza: { nombre: 'Peso con la balanza', casa: 'Sopesad dos objetos: ¿cuál pesa más?' },
  capacidad: { nombre: 'Capacidad', casa: 'Llenad vasos con agua: ¿cuál tiene más?' },
  carga: { nombre: 'Sumar para llegar a un número (misión)', casa: 'Llenad una bolsa con objetos hasta un peso aproximado.' },
  grupos: { nombre: 'Grupos iguales (iniciación a multiplicar)', casa: 'Contad ruedas de coches o patas de sillas de grupo en grupo.' },
  problema2: { nombre: 'Problemas de dos pasos', casa: 'Problemas con dos cosas que pasan: suben y bajan del autobús.' },
  sobra: { nombre: 'Lógica: ¿cuál sobra?', casa: 'Juntad 4 objetos y que diga cuál no va con los demás y por qué.' },
  sudoku: { nombre: 'Sudoku de dibujos (4×4)', casa: 'Sudokus de 4×4 con colores o dibujos.' },
  robot: { nombre: 'Programar un robot (orientación)', casa: 'Guía a alguien con órdenes: adelante, izquierda, derecha.' },
  ordenPlanetas: { nombre: 'Orden de los planetas', casa: 'Repasad el orden con la rima de los planetas.' },
  tamanos: { nombre: 'Tamaño de los planetas', casa: 'Comparad planetas con frutas: Júpiter sandía, la Tierra uva…' },
  repaso: { nombre: 'Repaso de todo', casa: 'Jugad a lo que más le cueste.' },
  palabras: { nombre: 'Leer palabras del espacio', casa: 'Leed juntos palabras cortas en mayúsculas.' },
  ciencia: { nombre: 'Ciencia del sistema solar', casa: 'Mirad el álbum de cartas y contadlo con vuestras palabras.' }
};

/* Pictograma de cada actividad (apoyo visual de la consigna, sin texto) */
const PICTOS = {
  contar: '👆🔢', dame: '🍪➡️😋', mochila: '🎒', fogonazo: '👀⚡', dedos: '🖐️❓', tocaNumero: '👂🔢', grupoNumero: '🔢🔍',
  comparar: '⚖️', formas: '👂🔷', buscaTodas: '🔍🔷', numero20: '👂🔢', marcos: '🔟➕', sumas: '➕', rocas: '🪨➕', llenar: '🚀❓',
  patrones: '🔁❓', revienta: '🎈💥', quitar: '🤖➖', secuencias: '🚂❓', medir: '📏', largo: '📏↔️', numero50: '👂🔢',
  decenas: '🔟🔢', haceNumero: '🔟➕', saltos: '🦘🔢', pares: '🧦🧦', dobles: '🦋', descomponer: '🧩➕', sumas20: '🔟➕',
  restas20: '➖', reloj: '🕒', dias: '📅', ordenar: '1️⃣2️⃣3️⃣', tabla100: '💯❓', numero100: '👂💯', signos: '🐊',
  contarDinero: '💶❓', pagar: '💶➡️', problema: '👂❓', mitad: '½', repartir: '🍪👥', cuerpos: '🧊⚽', simetria: '🦋🪞',
  relojMedia: '🕧', sumaDecenas: '🔟➕', restaDecenas: '🔟➖', cambio: '💶↩️', grafica: '📊', balanza: '⚖️', capacidad: '🥛',
  carga: '🚀⚖️', grupos: '👜✖️', problema2: '👂❓', sobra: '🤔', sudoku: '🧩', robot: '🤖🚩', ordenPlanetas: '☀️🪐',
  tamanos: '🪐↕️', repaso: '🔁', palabras: '🔤', ciencia: '🔭'
};

/* Voces de Pipo: tres naturales (grabadas en el archivo) y la del dispositivo */
const VOCES_PIPO = [
  { id: 'lola', nombre: 'Lola', icono: '🦊', detalle: 'Voz natural de mujer' },
  { id: 'bruno', nombre: 'Bruno', icono: '🐻', detalle: 'Voz natural de hombre' },
  { id: 'cosmo', nombre: 'Cosmo', icono: '🧑‍🚀', detalle: 'Voz natural, grave y alegre' },
  { id: 'sistema', nombre: 'Tablet', icono: '📱', detalle: 'Voz del dispositivo' }
];

/* Avatares de los perfiles: cada uno tiene un apodo que Pipo dice en voz alta */
const AVATARES = [
  { e: '🦊', id: 'zorro', apodo: 'Zorrito' }, { e: '🐻', id: 'oso', apodo: 'Osito' }, { e: '🐼', id: 'panda', apodo: 'Pandita' },
  { e: '🐯', id: 'tigre', apodo: 'Tigrito' }, { e: '🐸', id: 'rana', apodo: 'Ranita' }, { e: '🐰', id: 'conejo', apodo: 'Conejito' },
  { e: '🦁', id: 'leon', apodo: 'Leoncito' }, { e: '🐨', id: 'koala', apodo: 'Koala' }, { e: '🦄', id: 'unicornio', apodo: 'Unicornio' },
  { e: '🐙', id: 'pulpo', apodo: 'Pulpito' }, { e: '🐵', id: 'mono', apodo: 'Monito' }, { e: '🐧', id: 'pinguino', apodo: 'Pingüinito' }
];

/* Objetos para contar (tienen frase grabada: "¿Cuántas estrellas hay?" y su nombre en singular y plural) */
const OBJETOS = [
  { id: 'estrella', e: '⭐', g: 'f' }, { id: 'cohete', e: '🚀', g: 'm' }, { id: 'luna', e: '🌙', g: 'f' },
  { id: 'manzana', e: '🍎', g: 'f' }, { id: 'pez', e: '🐠', g: 'm' }, { id: 'mariposa', e: '🦋', g: 'f' },
  { id: 'globo', e: '🎈', g: 'm' }, { id: 'galleta', e: '🍪', g: 'f' }, { id: 'patito', e: '🐥', g: 'm' },
  { id: 'flor', e: '🌸', g: 'f' }
];
const OBJ = {};
OBJETOS.concat([
  { id: 'roca', e: '🪨', g: 'f' }, { id: 'robot', e: '🤖', g: 'm' }, { id: 'astronauta', e: '🧑‍🚀', g: 'm' },
  { id: 'linterna', e: '🔦', g: 'f' }, { id: 'calcetin', e: '🧦', g: 'm' }, { id: 'zumo', e: '🧃', g: 'm' }
]).forEach(o => { OBJ[o.id] = o; });
/* Objetos de la mochila del astronauta (misión de la Tierra) */
const OBJETOS_MOCHILA = ['manzana', 'linterna', 'calcetin', 'zumo', 'galleta'];
/* Objetos de los problemas orales (frases "Pipo tiene… / ¿Cuántas tiene ahora?") */
const OBJETOS_PROBLEMA = ['estrella', 'cohete', 'galleta', 'roca', 'globo'];

/* Dibujos para las series */
const PATRON_SETS = [
  ['🍎', '🍌', '🍐', '🍓', '🍊'],
  ['⭐', '🌙', '🚀', '☀️', '☁️'],
  ['🐶', '🐱', '🐸', '🐰', '🐻'],
  ['🟥', '🟦', '🟨', '🟩', '🟪']
];

/* Formas geométricas */
const FORMAS = ['circulo', 'cuadrado', 'triangulo', 'rectangulo', 'estrella', 'corazon', 'rombo', 'ovalo'];
const FORMAS_BUSCA = ['circulo', 'cuadrado', 'triangulo', 'estrella', 'corazon', 'rectangulo'];
const COLORES_FORMA = ['#FF5DA2', '#3FB2F2', '#FFC93C', '#2FD18E', '#9B7BF7', '#FF9F43'];

/* Orden real de los planetas desde el Sol y de mayor a menor tamaño (datos aprobados) */
const ORDEN_SOL = ['mercurio', 'venus', 'tierra', 'marte', 'jupiter', 'saturno', 'urano', 'neptuno'];
const ORDEN_TAMANO = ['jupiter', 'saturno', 'urano', 'neptuno', 'tierra', 'venus', 'marte', 'mercurio'];

/* Pegatinas coleccionables (misiones, retos en casa, cofres y asteroides) */
const PEGATINAS = [
  { id: 'pulpo', e: '🐙' }, { id: 'dino', e: '🦖' }, { id: 'unicornio', e: '🦄' }, { id: 'ballena', e: '🐳' },
  { id: 'cohete', e: '🚀' }, { id: 'ovni', e: '🛸' }, { id: 'robot', e: '🤖' }, { id: 'marciano', e: '👽' },
  { id: 'tierra', e: '🌍' }, { id: 'luna', e: '🌙' }, { id: 'sol', e: '🌞' }, { id: 'arcoiris', e: '🌈' },
  { id: 'leon', e: '🦁' }, { id: 'panda', e: '🐼' }, { id: 'pinguino', e: '🐧' }, { id: 'tortuga', e: '🐢' },
  { id: 'mariposa', e: '🦋' }, { id: 'zorro', e: '🦊' }, { id: 'dragon', e: '🐲' }, { id: 'rana', e: '🐸' },
  { id: 'helado', e: '🍦' }, { id: 'donut', e: '🍩' }, { id: 'globo', e: '🎈' }, { id: 'fugaz', e: '🌠' },
  { id: 'saturno', e: '🪐' }, { id: 'telescopio', e: '🔭' }, { id: 'satelite', e: '🛰️' }, { id: 'cometa', e: '☄️' },
  { id: 'astronauta', e: '👩‍🚀' }, { id: 'galaxia', e: '🌌' }, { id: 'volcan', e: '🌋' }, { id: 'brujula', e: '🧭' },
  { id: 'microscopio', e: '🔬' }, { id: 'iman', e: '🧲' }, { id: 'diamante', e: '💎' }, { id: 'trofeo', e: '🏆' }
];

/* Armario de Pipo: se compra con estrellas */
const COLORES_PIPO = [
  { id: 'menta', hex: '#3DDC97', precio: 0 }, { id: 'celeste', hex: '#43B7F5', precio: 5 },
  { id: 'chicle', hex: '#FF7AB6', precio: 5 }, { id: 'naranja', hex: '#FF9F43', precio: 8 },
  { id: 'lila', hex: '#A98BFA', precio: 10 }, { id: 'sol', hex: '#FFD23F', precio: 12 },
  { id: 'turquesa', hex: '#1FC8C8', precio: 15 }, { id: 'coral', hex: '#FF6B6B', precio: 18 },
  { id: 'galaxia', hex: '#5B4BDB', precio: 25 }, { id: 'oro', hex: '#E8B530', precio: 30 }
];
const ACCESORIOS = [
  { id: 'ninguno', precio: 0 }, { id: 'lazo', precio: 6 }, { id: 'gafas', precio: 8 }, { id: 'flor', precio: 8 },
  { id: 'gorra', precio: 10 }, { id: 'fiesta', precio: 12 }, { id: 'pajarita', precio: 14 }, { id: 'corona', precio: 15 },
  { id: 'casco', precio: 20 }, { id: 'auriculares', precio: 22 }, { id: 'chistera', precio: 26 }
];

/* La nave: una pieza por cada gran misión terminada */
const PIEZAS_NAVE = ['punta', 'ventana', 'alas', 'motor', 'escudo', 'antena', 'luces', 'propulsores', 'radar', 'panel'];
const COLORES_NAVE = [
  { id: 'blanca', hex: '#F4F1FF', precio: 0 }, { id: 'roja', hex: '#FF6B6B', precio: 10 },
  { id: 'azul', hex: '#43B7F5', precio: 10 }, { id: 'verde', hex: '#3DDC97', precio: 12 },
  { id: 'morada', hex: '#A98BFA', precio: 15 }, { id: 'dorada', hex: '#FFD23F', precio: 20 }
];

/* Rangos de la tripulación (según los mundos terminados). Nombres válidos para niñas y niños. */
const RANGOS = [
  { id: 'cadete', mundos: 0, icono: '🔰', nombre: 'Cadete' },
  { id: 'astronauta', mundos: 2, icono: '⭐', nombre: 'Astronauta' },
  { id: 'piloto', mundos: 4, icono: '🌟', nombre: 'Piloto' },
  { id: 'navegante', mundos: 6, icono: '🧭', nombre: 'Navegante' },
  { id: 'comandante', mundos: 8, icono: '🎖️', nombre: 'Comandante' },
  { id: 'leyenda', mundos: 10, icono: '👑', nombre: 'Leyenda del espacio' }
];

/* Misiones del día: se eligen 3 cada día */
const MISIONES_DIA = [
  { id: 'nivel1', icono: '🎯', meta: 1, frase: 'md_nivel1', nombre: 'Terminar un nivel' },
  { id: 'niveles2', icono: '🏁', meta: 2, frase: 'md_niveles2', nombre: 'Terminar dos niveles' },
  { id: 'primera5', icono: '⚡', meta: 5, frase: 'md_primera5', nombre: '5 aciertos a la primera' },
  { id: 'carta', icono: '🃏', meta: 1, frase: 'md_carta', nombre: 'Escuchar una carta del álbum' },
  { id: 'tres', icono: '🌟', meta: 1, frase: 'md_tres', nombre: 'Un nivel con 3 estrellas' },
  { id: 'repaso', icono: '🔁', meta: 1, frase: 'md_repaso', nombre: 'Repetir un nivel ya terminado' }
];
const LLAVES_COFRE = 3;   // días con las 3 misiones hechas para abrir el cofre de la semana

/* Medallas: se ven en la zona de padres (al niño le llega un aviso con el icono) */
const LOGROS = [
  { id: 'acierto1', icono: '🎯', nombre: 'Primer acierto', test: p => p.stats.aciertos >= 1 },
  { id: 'aciertos50', icono: '🥉', nombre: '50 aciertos', test: p => p.stats.aciertos >= 50 },
  { id: 'aciertos200', icono: '🥈', nombre: '200 aciertos', test: p => p.stats.aciertos >= 200 },
  { id: 'aciertos500', icono: '🥇', nombre: '500 aciertos', test: p => p.stats.aciertos >= 500 },
  { id: 'seguidas5', icono: '🔥', nombre: '5 seguidas a la primera', test: p => p.stats.mejorRacha >= 5 },
  { id: 'seguidas15', icono: '☄️', nombre: '15 seguidas a la primera', test: p => p.stats.mejorRacha >= 15 },
  { id: 'nivel1', icono: '🚩', nombre: 'Primer nivel', test: p => p.stats.niveles >= 1 },
  { id: 'niveles30', icono: '🏁', nombre: '30 niveles', test: p => p.stats.niveles >= 30 },
  { id: 'mundo1', icono: '🌍', nombre: 'Primer mundo', test: p => mundosTerminados(p) >= 1 },
  { id: 'mundo5', icono: '🪐', nombre: '5 mundos', test: p => mundosTerminados(p) >= 5 },
  { id: 'mundo10', icono: '☀️', nombre: 'Todo el sistema solar', test: p => mundosTerminados(p) >= 10 },
  { id: 'tresEstrellas', icono: '🌟', nombre: 'Un nivel con 3 estrellas', test: p => contarTresEstrellas(p) >= 1 },
  { id: 'tresEstrellas20', icono: '✨', nombre: '20 niveles con 3 estrellas', test: p => contarTresEstrellas(p) >= 20 },
  { id: 'cartas5', icono: '🃏', nombre: '5 cartas del espacio', test: p => p.cartas.length >= 5 },
  { id: 'cartas20', icono: '📚', nombre: 'Álbum de cartas completo', test: p => p.cartas.length >= CARTAS.length },
  { id: 'casa3', icono: '🏠', nombre: '3 retos en casa', test: p => retosCasaHechos(p) >= 3 },
  { id: 'casa10', icono: '🏡', nombre: 'Los 10 retos en casa', test: p => retosCasaHechos(p) >= 10 },
  { id: 'nave5', icono: '🛠️', nombre: 'Media nave construida', test: p => p.piezas.length >= 5 },
  { id: 'nave10', icono: '🛸', nombre: 'Nave completa', test: p => p.piezas.length >= 10 },
  { id: 'dias3', icono: '☀️', nombre: '3 días de juego', test: p => p.dias.total >= 3 },
  { id: 'dias10', icono: '🌈', nombre: '10 días de juego', test: p => p.dias.total >= 10 },
  { id: 'cofre1', icono: '🧰', nombre: 'Primer cofre de la semana', test: p => p.stats.cofres >= 1 },
  { id: 'pegatinas12', icono: '📒', nombre: '12 pegatinas', test: p => p.pegatinas.length >= 12 },
  { id: 'estilo', icono: '🎨', nombre: 'Primer look para Pipo', test: p => p.tienda.colores.length + p.tienda.accesorios.length > 2 },
  { id: 'lector', icono: '🔤', nombre: 'Palabras del explorador', test: p => (p.stats.palabras || 0) >= 1 },
  { id: 'calma', icono: '🌬️', nombre: 'Respirar con Pipo', test: p => (p.stats.respiros || 0) >= 1 }
];

/* Ánimos centrados en el esfuerzo (ids de frases grabadas) */
const ELOGIOS = ['si', 'muy_bien', 'genial', 'eso_es', 'bravo', 'fenomenal', 'que_bien_piensas', 'lo_conseguiste', 'te_fijaste', 'increible'];
const ELOGIOS_CONTAR = ['bien_contado', 'si', 'eso_es', 'muy_bien'];
const ELOGIOS_PENSAR = ['que_bien_piensas', 'genial', 'muy_bien', 'fenomenal', 'eso_es', 'lo_conseguiste'];
const ANIMOS = ['casi', 'prueba_otra', 'fijate'];

/* Palabras del explorador (minijuego de lectura, a partir del mundo 4) */
const PALABRAS = [
  { id: 'sol', t: 'SOL', n: 1 }, { id: 'luna', t: 'LUNA', n: 1 }, { id: 'nave', t: 'NAVE', n: 1 }, { id: 'marte', t: 'MARTE', n: 1 },
  { id: 'venus', t: 'VENUS', n: 1 }, { id: 'robot', t: 'ROBOT', n: 1 }, { id: 'tierra', t: 'TIERRA', n: 2 }, { id: 'cohete', t: 'COHETE', n: 2 },
  { id: 'cometa', t: 'COMETA', n: 2 }, { id: 'planeta', t: 'PLANETA', n: 2 }, { id: 'estrella', t: 'ESTRELLA', n: 2 }, { id: 'saturno', t: 'SATURNO', n: 2 },
  { id: 'orbita', t: 'ÓRBITA', n: 3 }, { id: 'satelite', t: 'SATÉLITE', n: 3 }, { id: 'gravedad', t: 'GRAVEDAD', n: 3 }, { id: 'astronauta', t: 'ASTRONAUTA', n: 3 },
  { id: 'jupiter', t: 'JÚPITER', n: 3 }, { id: 'neptuno', t: 'NEPTUNO', n: 3 }
];
