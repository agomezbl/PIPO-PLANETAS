# Pipo y los Planetas 🚀

Aventura por el sistema solar para aprender **matemáticas, ciencia y cosas prácticas** (la hora, el dinero, las medidas, los días de la semana). Para niños de **5 a 8 años**, pensada para tablet y móvil, y también funciona en el ordenador.

**Jugar:** https://agomezbl.github.io/PIPO-PLANETAS/

## Versión 4

- **Tres niveles por edad que se eligen al empezar**: de 5 a 6, de 6 a 7 y de 7 a 8 años. Los 10 planetas, la ciencia, las cartas y la nave son iguales para todos; lo que cambia son las matemáticas de cada planeta. Los padres pueden cambiar el nivel en cualquier momento sin perder nada.
- **Contenido nuevo para 7 y 8 años**: números hasta 1000 (centenas, decenas y unidades), comparar números grandes, series con saltos, **sumar y restar llevando** en columnas, **tablas de multiplicar**, problemas de multiplicar y repartir, **fracciones** (medios, tercios y cuartos, y fracción de una cantidad), **el reloj con minutos** (y cuarto, menos cuarto, de 5 en 5, reloj digital) y **problemas largos** de dos pasos hasta 100.
- **Dibujos propios** en lugar de emojis: más de 200 ilustraciones hechas para el juego (objetos, animales, frutas, iconos de niveles, pegatinas…), iguales en todos los dispositivos.
- **Planetas más espectaculares**: atmósferas, sombras, nubes, bandas, cráteres, anillos y un cielo que cambia de color en cada planeta.
- **Más fácil de usar**: el mapa es un camino numerado del 1 al 10 que cabe en la pantalla; cada planeta muestra sus 6 niveles en un camino; y un **botón grande de jugar** lleva directamente al siguiente nivel pendiente. Sin prueba inicial: basta con elegir el nivel.

## Todo lo que incluye

- **10 mundos en el orden del viaje**: Tierra, Luna, Marte, Venus, Mercurio, Júpiter, Saturno, Urano, Neptuno y el Sol.
- **6 niveles por mundo + un reto en casa** (60 niveles): Aprende, Practica, Misión, Descubre, Reto y Gran misión.
- **Matemáticas de 5 a 8 años**: contar, números hasta 1000, sumar y restar (también llevando), dobles y mitades, repartir, multiplicar, fracciones, mayor y menor, series, formas y cuerpos, simetría, medir, peso y capacidad, gráficas, el reloj, los días, el dinero y el cambio, problemas, sudokus y programar un robot.
- **Ciencia**: los datos de cada planeta, preguntas de explorador, un álbum con 20 cartas y una rima original para recordar el orden de los planetas.
- **Tres voces naturales grabadas** (Lola, Bruno y Cosmo) y la voz del dispositivo como reserva. Pipo lo dice todo en voz alta: el niño no necesita leer.
- **Se adapta solo**: dificultad por habilidad según la edad, repaso de lo que más cuesta y ayudas escalonadas (repetir más despacio, pista visual y demostración paso a paso). El error nunca se castiga.
- **Muy motivador, sin trampas**: estrellas, rangos, una nave que se construye pieza a pieza, armario de Pipo, misiones del día, cofre de la semana, medallas y asteroides sorpresa. Sin anuncios, sin compras, sin enlaces externos y sin recoger datos.
- **Hasta 4 exploradores** en el mismo dispositivo, cada uno con su nivel y su progreso.
- **Zona de padres** (mantener pulsado ⚙️ 3 segundos + una multiplicación): nivel por edad, qué se aprende en cada planeta, progreso por habilidad, errores frecuentes, consejos para practicar en casa, voz, volúmenes, límite de tiempo (20 min por defecto), mayúsculas o minúsculas, abrir mundos y reiniciar.
- Conserva el progreso de las versiones anteriores.
- Todo en un único archivo (`index.html`). Funciona sin conexión una vez cargado.

## Pruebas automáticas

Abrir `index.html?test=1`. Comprueban, entre otras cosas, 200 ejercicios de cada actividad en cada grado de dificultad, que todas las frases existen y están grabadas, que los números grandes y las horas se dicen bien, los datos de ciencia, los 60 niveles de cada nivel por edad, los dibujos, una partida completa simulada, el guardado y que cada actividad se puede jugar tocando la pantalla.

## Cómo está hecho

- `fuente/` contiene el código por partes (estilos, HTML y JavaScript numerado) y `herramientas/` los programas que lo montan:
  - `herramientas/frases.py`: todas las frases que dice Pipo.
  - `herramientas/construir.py voces`: graba las frases con Kokoro TTS (modelo con licencia Apache 2.0).
  - `herramientas/construir.py html`: junta todo en `index.html`.
- `version2/index.html`: copia de la versión 2.
