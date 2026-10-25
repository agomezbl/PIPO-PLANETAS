# Pipo y los Planetas 🚀

Aventura por el sistema solar para aprender **matemáticas, ciencia y cosas prácticas** (la hora, el dinero, las medidas, los días de la semana). Para niños de **5 a 7 años**, pensada para tablet y móvil, y también funciona en el ordenador.

**Jugar:** https://agomezbl.github.io/PIPO-PLANETAS/

## Versión 3

- **10 mundos en el orden del viaje**: Tierra, Luna, Marte, Venus, Mercurio, Júpiter, Saturno, Urano, Neptuno y el Sol. El mapa dibuja el sistema solar en su orden real.
- **6 niveles por mundo + un reto en casa** (60 niveles): Aprende, Practica, Misión, Descubre, Reto y Gran misión.
- **Matemáticas de 5 a 7 años**: contar, números hasta 100, sumar y restar (también de dos cifras), dobles y mitades, repartir, grupos iguales, mayor y menor, series, formas y cuerpos, simetría, medir, peso y capacidad, gráficas, el reloj, los días, el dinero y el cambio, problemas de uno y dos pasos, sudokus y programar un robot.
- **Ciencia**: los datos de cada planeta, preguntas de explorador, un álbum con 20 cartas y una rima original para recordar el orden de los planetas.
- **Tres voces naturales grabadas** (Lola, Bruno y Cosmo) y la voz del dispositivo como reserva. Pipo lo dice todo en voz alta: el niño no necesita leer.
- **Se adapta solo**: prueba inicial para 6 y 7 años, dificultad por habilidad, repaso de lo que más cuesta y ayudas escalonadas (repetir más despacio, pista visual y demostración paso a paso). El error nunca se castiga.
- **Muy motivador, sin trampas**: estrellas, rangos, una nave que se construye pieza a pieza, armario de Pipo, misiones del día, cofre de la semana, medallas y asteroides sorpresa. Sin anuncios, sin compras, sin enlaces externos y sin recoger datos.
- **Hasta 4 exploradores** en el mismo dispositivo, cada uno con su progreso.
- **Zona de padres** (mantener pulsado ⚙️ 3 segundos + una multiplicación): progreso por habilidad, errores frecuentes, consejos para practicar en casa, voz, volúmenes, límite de tiempo (20 min por defecto), mayúsculas o minúsculas, abrir mundos y reiniciar.
- Conserva el progreso de la versión 2 (pegatinas, estrellas y ropa de Pipo).
- Todo en un único archivo (`index.html`). Funciona sin conexión una vez cargado.

## Pruebas automáticas

Abrir `index.html?test=1`. Comprueban, entre otras cosas, 200 ejercicios de cada actividad en cada grado de dificultad, que todas las frases existen y están grabadas, los datos de ciencia, que los 60 niveles se desbloquean en orden, una partida completa simulada, el guardado y que cada actividad se puede jugar tocando la pantalla.

## Cómo está hecho

- `fuente/` contiene el código por partes (estilos, HTML y JavaScript numerado) y `herramientas/` los programas que lo montan:
  - `herramientas/frases.py`: todas las frases que dice Pipo.
  - `herramientas/construir.py voces`: graba las frases con Kokoro TTS (modelo con licencia Apache 2.0).
  - `herramientas/construir.py html`: junta todo en `index.html`.
- `version2/index.html`: copia de la versión anterior.
