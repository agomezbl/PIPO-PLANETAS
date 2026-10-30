/* =========================================================
   7b. DIBUJOS PROPIOS EN LUGAR DE EMOJIS (versión 4)
   Cada emoji del juego tiene aquí su dibujo en SVG (64 x 64).
   Se guardan una sola vez como <symbol> y se usan con <use>,
   así cien estrellas en pantalla pesan muy poco.
   Un vigilante (MutationObserver) cambia automáticamente cualquier
   emoji conocido que aparezca en pantalla por su dibujo: el resto
   del código puede seguir escribiendo '⭐' y se verá el dibujo.
   ========================================================= */
const ICO = {};
(function () {
  const f = n => n.toFixed(1);
  const est = (cx, cy, R, r, puntas) => {
    puntas = puntas || 5;
    let d = '';
    for (let i = 0; i < puntas * 2; i++) {
      const a = i * Math.PI / puntas, rr = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + f(cx + rr * Math.sin(a)) + ' ' + f(cy - rr * Math.cos(a));
    }
    return d + 'Z';
  };
  const ojos = (x1, x2, y, r) => '<circle cx="' + x1 + '" cy="' + y + '" r="' + r + '" fill="#2A1E5C"/><circle cx="' + x2 + '" cy="' + y + '" r="' + r + '" fill="#2A1E5C"/>' +
    '<circle cx="' + f(x1 + r * 0.35) + '" cy="' + f(y - r * 0.4) + '" r="' + f(r * 0.4) + '" fill="#fff"/><circle cx="' + f(x2 + r * 0.35) + '" cy="' + f(y - r * 0.4) + '" r="' + f(r * 0.4) + '" fill="#fff"/>';
  const boca = (x, y, w) => '<path d="M' + (x - w) + ' ' + y + ' Q' + x + ' ' + f(y + w * 0.9) + ' ' + (x + w) + ' ' + y + '" stroke="#2A1E5C" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  const mejillas = (x1, x2, y) => '<ellipse cx="' + x1 + '" cy="' + y + '" rx="4" ry="2.6" fill="#FF6F91" opacity=".5"/><ellipse cx="' + x2 + '" cy="' + y + '" rx="4" ry="2.6" fill="#FF6F91" opacity=".5"/>';
  const brillo = (x, y, rx, ry, rot) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity=".5" transform="rotate(' + (rot === undefined ? -30 : rot) + ' ' + x + ' ' + y + ')"/>';
  // Bola con volumen: color, sombra suave abajo a la derecha (y un poco más oscura si se da otro color)
  const bola = (cx, cy, r, c, osc) => '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (osc || c) + '"/>' +
    (osc ? '<circle cx="' + f(cx - r * 0.07) + '" cy="' + f(cy - r * 0.07) + '" r="' + f(r * 0.93) + '" fill="' + c + '"/>' : '') +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#g-sombra)"/>';
  const cuadro = (c, osc) => '<rect x="10" y="10" width="44" height="44" rx="9" fill="' + c + '"/><path d="M10 40 L54 40 L54 45 A9 9 0 0 1 45 54 L19 54 A9 9 0 0 1 10 45Z" fill="' + osc + '"/>' + brillo(20, 19, 6, 3);

  /* ---------- objetos para contar ---------- */
  ICO.estrella = '<path d="' + est(32, 35, 25, 12) + '" fill="#FFB31A" stroke="#FFB31A" stroke-width="7" stroke-linejoin="round"/>' +
    '<path d="' + est(31, 33, 20, 9.5) + '" fill="#FFD84D" stroke="#FFD84D" stroke-width="4" stroke-linejoin="round"/>' + brillo(25, 24, 4, 2.2);
  ICO.cohete = '<g transform="rotate(42 32 32)"><path d="M32 4 C42 12 44 26 42 44 L22 44 C20 26 22 12 32 4Z" fill="#F4F1FF"/><path d="M32 4 C42 12 44 26 42 44 L34 44 C37 28 37 14 32 4Z" fill="#D6CCF5"/>' +
    '<path d="M32 4 C37 8 39.5 12 40.8 17 L23.2 17 C24.5 12 27 8 32 4Z" fill="#FF5D73"/><circle cx="32" cy="27" r="6" fill="#3FB2F2" stroke="#5B4BDB" stroke-width="2.5"/>' +
    '<path d="M22 32 L12 44 L12 50 L22 45Z" fill="#FF5D73"/><path d="M42 32 L52 44 L52 50 L42 45Z" fill="#E2405A"/><path d="M25 44 L39 44 L36 50 L28 50Z" fill="#9B8FC9"/>' +
    '<path d="M28 50 C27 56 30 60 32 63 C34 60 37 56 36 50Z" fill="#FF9F43"/><path d="M30 50 C30 54 31 57 32 59 C33 57 34 54 34 50Z" fill="#FFE26B"/>' + brillo(28, 26, 2, 1.2) + '</g>';
  ICO.luna = '<path d="M36 6 A26 26 0 1 0 58 44 A21 21 0 0 1 36 6Z" fill="#FFC93C"/>' +
    '<circle cx="22" cy="24" r="3" fill="#F0A92A" opacity=".7"/><circle cx="18" cy="38" r="4" fill="#F0A92A" opacity=".6"/><circle cx="30" cy="44" r="2.4" fill="#F0A92A" opacity=".6"/>';
  ICO.manzana = '<path d="M32 18 C24 12 10 14 9 30 C8 46 20 60 27 58 C30 57 31 56 32 56 C33 56 34 57 37 58 C44 60 56 46 55 30 C54 14 40 12 32 18Z" fill="#FF4B4B"/>' +
    '<path d="M55 30 C54 46 44 60 37 58 C34 57 33 56 32 56 C38 52 48 42 49 26 C52 27 55 28 55 30Z" fill="#D92D3A"/>' +
    '<path d="M32 18 C32 12 33 8 36 5" stroke="#7A4A1E" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M34 12 C38 4 48 5 50 8 C46 13 38 14 34 12Z" fill="#3DBE6B"/>' + brillo(19, 27, 5, 3);
  ICO.pez = '<path d="M8 32 C14 18 34 14 46 26 L58 18 L56 32 L58 46 L46 38 C34 50 14 46 8 32Z" fill="#FF9F43"/>' +
    '<path d="M20 20 C23 26 23 38 20 44" stroke="#fff" stroke-width="5" fill="none" opacity=".9"/><path d="M33 18 C36 26 36 38 33 46" stroke="#fff" stroke-width="5" fill="none" opacity=".9"/>' +
    '<path d="M8 32 C14 46 34 50 46 38 L46 34 C34 44 16 42 8 32Z" fill="#E7782A"/><path d="M28 16 L34 8 L40 18Z" fill="#3FB2F2"/>' + '<circle cx="15" cy="29" r="3.4" fill="#2A1E5C"/><circle cx="16" cy="28" r="1.2" fill="#fff"/>';
  ICO.mariposa = '<path d="M31 30 C24 10 6 6 6 20 C6 30 16 34 28 34Z" fill="#FF6FB5"/><path d="M33 30 C40 10 58 6 58 20 C58 30 48 34 36 34Z" fill="#B07CFF"/>' +
    '<path d="M29 34 C16 34 8 42 12 50 C16 58 26 50 30 38Z" fill="#FF9FD0"/><path d="M35 34 C48 34 56 42 52 50 C48 58 38 50 34 38Z" fill="#CBA8FF"/>' +
    '<circle cx="16" cy="20" r="4" fill="#FFE26B"/><circle cx="48" cy="20" r="4" fill="#FFE26B"/><circle cx="18" cy="45" r="2.6" fill="#fff" opacity=".8"/><circle cx="46" cy="45" r="2.6" fill="#fff" opacity=".8"/>' +
    '<rect x="29.5" y="20" width="5" height="32" rx="2.5" fill="#2A1E5C"/><path d="M31 21 C29 15 26 12 23 11 M33 21 C35 15 38 12 41 11" stroke="#2A1E5C" stroke-width="2" fill="none" stroke-linecap="round"/>';
  ICO.globo = '<path d="M32 46 C30 50 34 54 30 58 C28 61 31 63 33 62" stroke="#9B8FC9" stroke-width="1.8" fill="none"/>' +
    '<path d="M32 4 C46 4 54 15 54 26 C54 38 42 46 32 46 C22 46 10 38 10 26 C10 15 18 4 32 4Z" fill="#FF4B6E"/>' +
    '<path d="M54 26 C54 38 42 46 32 46 C40 42 48 34 48 22 C48 16 46 12 44 9 C50 13 54 19 54 26Z" fill="#D9294F"/><path d="M29 45 L35 45 L36 50 L28 50Z" fill="#D9294F"/>' + brillo(22, 16, 4.5, 7, 25);
  ICO.galleta = bola(32, 32, 26, '#E8A85A', '#C98536') + '<circle cx="32" cy="32" r="21" fill="#F2BD72"/>' +
    '<circle cx="22" cy="24" r="4" fill="#6B3A1E"/><circle cx="38" cy="20" r="3.4" fill="#6B3A1E"/><circle cx="42" cy="36" r="4.2" fill="#6B3A1E"/><circle cx="26" cy="40" r="3.6" fill="#6B3A1E"/><circle cx="33" cy="31" r="2.6" fill="#6B3A1E"/>' + brillo(24, 16, 4, 2);
  ICO.patito = '<ellipse cx="34" cy="44" rx="22" ry="15" fill="#FFD23F"/><path d="M56 44 C56 53 46 59 34 59 C24 59 16 55 13 48 C22 54 42 54 52 40Z" fill="#F5B300"/>' +
    '<circle cx="26" cy="24" r="14" fill="#FFD23F"/><path d="M38 38 C44 34 50 36 52 42 C46 42 42 44 38 38Z" fill="#F5B300"/>' +
    '<path d="M10 24 C6 23 3 25 2 27 C5 29 9 29 12 28Z" fill="#FF8C1A"/>' + '<circle cx="22" cy="21" r="3" fill="#2A1E5C"/><circle cx="23" cy="20" r="1" fill="#fff"/><ellipse cx="18" cy="28" rx="3" ry="2" fill="#FF8C9A" opacity=".6"/>' +
    '<path d="M26 10 C26 6 29 5 30 7 C30 4 34 5 32 9" stroke="#F5B300" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  ICO.flor = [0, 72, 144, 216, 288].map(a => '<ellipse cx="32" cy="15" rx="10" ry="13" fill="#FF7AB6" transform="rotate(' + a + ' 32 32)"/>').join('') +
    [36, 108, 180, 252, 324].map(a => '<ellipse cx="32" cy="18" rx="5" ry="8" fill="#FFA5CF" transform="rotate(' + a + ' 32 32)"/>').join('') +
    '<circle cx="32" cy="32" r="10" fill="#FFC93C"/><circle cx="32" cy="32" r="10" fill="url(#g-sombra)"/><circle cx="29" cy="29" r="2" fill="#fff" opacity=".7"/>';
  ICO.roca = '<path d="M8 44 L14 22 L30 10 L48 14 L58 32 L52 52 L28 56 Z" fill="#A49BB5"/><path d="M30 10 L48 14 L58 32 L38 30 Z" fill="#C3BBD3"/>' +
    '<path d="M14 22 L30 10 L38 30 L22 34Z" fill="#B5ADC6"/><path d="M8 44 L22 34 L38 30 L58 32 L52 52 L28 56Z" fill="#8A819C"/><circle cx="40" cy="44" r="3" fill="#756C88"/><circle cx="24" cy="46" r="2" fill="#756C88"/>';
  ICO.robot = '<rect x="30" y="4" width="4" height="10" fill="#8C86A8"/><circle cx="32" cy="5" r="4" fill="#FF5D73"/>' +
    '<rect x="10" y="14" width="44" height="34" rx="10" fill="#A9C4E8"/><rect x="10" y="38" width="44" height="10" rx="5" fill="#86A6D4"/>' +
    '<rect x="16" y="20" width="32" height="17" rx="7" fill="#2A1E5C"/><circle cx="25" cy="28" r="4.5" fill="#5BF0C2"/><circle cx="39" cy="28" r="4.5" fill="#5BF0C2"/>' +
    '<rect x="4" y="24" width="6" height="12" rx="3" fill="#86A6D4"/><rect x="54" y="24" width="6" height="12" rx="3" fill="#86A6D4"/>' +
    '<rect x="18" y="50" width="28" height="10" rx="4" fill="#86A6D4"/><rect x="24" y="53" width="16" height="3" rx="1.5" fill="#FFC93C"/>' + brillo(17, 18, 3, 1.6);
  ICO.astronauta = '<rect x="16" y="40" width="32" height="22" rx="11" fill="#F4F1FF" stroke="#9B8FC9" stroke-width="2"/><rect x="26" y="46" width="12" height="8" rx="2" fill="#FF5D73"/>' +
    '<circle cx="32" cy="26" r="20" fill="#F4F1FF" stroke="#9B8FC9" stroke-width="2"/><path d="M52 26 A20 20 0 0 1 14 34 A22 22 0 0 0 48 18Z" fill="#D6CCF5"/>' +
    '<rect x="17" y="16" width="30" height="20" rx="10" fill="#3B2E7E"/><path d="M21 22 C24 19 30 18 34 19" stroke="#8EC9FF" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/><circle cx="41" cy="30" r="2" fill="#8EC9FF" opacity=".7"/>';
  ICO.linterna = '<path d="M44 26 L62 12 L62 60 L44 46Z" fill="#FFF3A8" opacity=".85"/><rect x="4" y="29" width="30" height="14" rx="5" fill="#3FB2F2"/><rect x="4" y="38" width="30" height="5" rx="2.5" fill="#1E86C8"/>' +
    '<path d="M32 27 L45 23 L45 49 L32 45Z" fill="#5B4BDB"/><rect x="12" y="32" width="9" height="5" rx="2" fill="#FFC93C"/>';
  ICO.calcetin = '<path d="M20 4 L42 4 L42 36 C42 44 38 50 30 56 C24 60 10 60 8 52 C6 46 12 42 18 40 L20 36Z" fill="#FF6F91"/>' +
    '<rect x="20" y="4" width="22" height="8" fill="#fff"/><rect x="20" y="16" width="22" height="5" fill="#FFC93C"/><rect x="20" y="26" width="22" height="5" fill="#FFC93C"/>' +
    '<path d="M8 52 C10 60 24 60 30 56 C26 54 22 50 20 46 C14 46 8 48 8 52Z" fill="#E04E78"/>';
  ICO.zumo = '<rect x="16" y="16" width="32" height="44" rx="5" fill="#FF9F43"/><rect x="16" y="16" width="32" height="10" rx="4" fill="#FFC93C"/>' +
    '<path d="M38 16 L42 2 L46 3" stroke="#3FB2F2" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="32" cy="42" r="9" fill="#FFE26B"/><path d="M32 33 C35 30 38 31 38 31" stroke="#3DBE6B" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<rect x="40" y="26" width="8" height="34" rx="3" fill="#E7782A" opacity=".6"/>';

  /* ---------- frutas, cielo y animales de las series ---------- */
  ICO.platano = '<path d="M10 20 C10 44 30 58 54 50 C56 48 56 46 54 45 C34 50 20 38 18 18Z" fill="#FFD23F"/><path d="M18 18 C20 38 34 50 54 45 C40 46 28 40 22 24Z" fill="#F5B300"/>' +
    '<path d="M10 20 L12 12 L18 14 L18 18Z" fill="#7A4A1E"/><path d="M54 45 L58 47 L56 51 L54 50Z" fill="#7A4A1E"/>';
  ICO.pera = '<path d="M32 12 C24 12 24 22 22 30 C18 36 12 40 12 48 C12 58 22 61 32 61 C42 61 52 58 52 48 C52 40 46 36 42 30 C40 22 40 12 32 12Z" fill="#B7DE4B"/>' +
    '<path d="M52 48 C52 58 42 61 32 61 C42 56 46 46 44 34 C48 38 52 42 52 48Z" fill="#8FC23A"/><path d="M32 12 C32 8 33 5 35 3" stroke="#7A4A1E" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M34 8 C38 3 46 4 47 6 C44 10 38 10 34 8Z" fill="#3DBE6B"/>' + brillo(22, 44, 3.5, 6, 20);
  ICO.fresa = '<path d="M32 60 C20 52 8 38 10 24 C11 16 20 14 32 16 C44 14 53 16 54 24 C56 38 44 52 32 60Z" fill="#FF3B5C"/>' +
    '<path d="M54 24 C56 38 44 52 32 60 C40 48 46 36 46 18 C50 18 53 20 54 24Z" fill="#D41F42"/>' +
    [[20, 26], [30, 24], [40, 26], [24, 36], [36, 36], [30, 46], [44, 34], [18, 44]].map(p => '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="1.4" ry="2" fill="#FFE26B"/>').join('') +
    '<path d="M18 16 L24 6 L28 14 L32 4 L36 14 L40 6 L46 16 C40 20 24 20 18 16Z" fill="#3DBE6B"/>';
  ICO.naranja = bola(32, 34, 25, '#FF9F2E', '#E7782A') + '<circle cx="32" cy="34" r="25" fill="url(#g-poros)" opacity=".25"/>' +
    '<path d="M32 9 L32 5" stroke="#7A4A1E" stroke-width="3" stroke-linecap="round"/><path d="M33 8 C37 2 46 3 47 6 C43 10 37 11 33 8Z" fill="#3DBE6B"/>' + brillo(22, 24, 5, 3);
  ICO.sol = '<g fill="#FFB31A">' + rango(0, 11).map(i => '<path d="M30 3 L34 3 L33 13 L31 13Z" transform="rotate(' + (i * 30) + ' 32 32)"/>').join('') + '</g>' +
    bola(32, 32, 17, '#FFD23F', '#FFB31A') + '<circle cx="26" cy="30" r="2" fill="#2A1E5C"/><circle cx="38" cy="30" r="2" fill="#2A1E5C"/>' + boca(32, 36, 5) + mejillas(22, 42, 36);
  ICO.nube = '<path d="M16 48 C6 48 4 36 12 32 C10 22 22 16 28 22 C32 12 48 12 50 24 C60 24 62 38 54 42 C56 48 52 50 48 50 L16 50Z" fill="#F4F7FF"/>' +
    '<path d="M54 42 C56 48 52 50 48 50 L16 50 C10 50 6 47 5 42 C12 46 40 46 54 40Z" fill="#C9D3EE"/>';
  ICO.cuadrado_rojo = cuadro('#FF5D73', '#D9294F');
  ICO.cuadrado_azul = cuadro('#3FB2F2', '#1E86C8');
  ICO.cuadrado_amarillo = cuadro('#FFD23F', '#F0A92A');
  ICO.cuadrado_verde = cuadro('#2FD18E', '#1AA86E');
  ICO.cuadrado_lila = cuadro('#A98BFA', '#7B5BE0');
  ICO.circulo_rojo = bola(32, 32, 24, '#FF5D73') + brillo(24, 22, 6, 3.5);
  ICO.circulo_azul = bola(32, 32, 24, '#3FB2F2') + brillo(24, 22, 6, 3.5);
  ICO.circulo_amarillo = bola(32, 32, 24, '#FFD23F') + brillo(24, 22, 6, 3.5);
  ICO.circulo_verde = bola(32, 32, 24, '#2FD18E') + brillo(24, 22, 6, 3.5);

  /* ---------- caras de animales (avatares y series) ---------- */
  const cara = (c, osc) => '<circle cx="32" cy="35" r="22" fill="' + c + '"/><path d="M54 35 A22 22 0 0 1 14 47 A24 24 0 0 0 50 26Z" fill="' + osc + '" opacity=".55"/>';
  ICO.zorro = '<path d="M8 6 L26 18 L14 32Z" fill="#FF8C2E"/><path d="M56 6 L38 18 L50 32Z" fill="#FF8C2E"/><path d="M12 12 L22 19 L15 27Z" fill="#FFE2C4"/><path d="M52 12 L42 19 L49 27Z" fill="#FFE2C4"/>' +
    '<path d="M32 58 C18 58 8 46 8 34 C8 22 18 16 32 16 C46 16 56 22 56 34 C56 46 46 58 32 58Z" fill="#FF8C2E"/>' +
    '<path d="M32 58 C24 58 16 52 14 44 C20 46 26 42 32 42 C38 42 44 46 50 44 C48 52 40 58 32 58Z" fill="#FFF4E8"/>' +
    ojos(23, 41, 34, 3.4) + '<ellipse cx="32" cy="46" rx="4" ry="3" fill="#2A1E5C"/>' + boca(32, 50, 3) + mejillas(17, 47, 41);
  ICO.oso = '<circle cx="13" cy="16" r="9" fill="#A86B3C"/><circle cx="51" cy="16" r="9" fill="#A86B3C"/><circle cx="13" cy="16" r="5" fill="#E3A87A"/><circle cx="51" cy="16" r="5" fill="#E3A87A"/>' +
    cara('#A86B3C', '#7A4A1E') + '<ellipse cx="32" cy="44" rx="11" ry="8.5" fill="#E8C29C"/>' + ojos(23, 41, 32, 3.4) + '<ellipse cx="32" cy="40" rx="4.5" ry="3.2" fill="#2A1E5C"/>' + boca(32, 45, 3.5) + mejillas(17, 47, 40);
  ICO.panda = '<circle cx="13" cy="15" r="9" fill="#2A2A3C"/><circle cx="51" cy="15" r="9" fill="#2A2A3C"/>' + cara('#FFFFFF', '#D8D4EA') +
    '<ellipse cx="22" cy="33" rx="7" ry="8.5" fill="#2A2A3C" transform="rotate(-25 22 33)"/><ellipse cx="42" cy="33" rx="7" ry="8.5" fill="#2A2A3C" transform="rotate(25 42 33)"/>' +
    '<circle cx="23" cy="33" r="3" fill="#fff"/><circle cx="41" cy="33" r="3" fill="#fff"/><circle cx="23.5" cy="33.5" r="1.8" fill="#2A1E5C"/><circle cx="40.5" cy="33.5" r="1.8" fill="#2A1E5C"/>' +
    '<ellipse cx="32" cy="42" rx="4" ry="3" fill="#2A2A3C"/>' + boca(32, 46, 3) + mejillas(15, 49, 42);
  ICO.tigre = '<circle cx="14" cy="16" r="8" fill="#FF9F2E"/><circle cx="50" cy="16" r="8" fill="#FF9F2E"/><circle cx="14" cy="16" r="4" fill="#FFE2C4"/><circle cx="50" cy="16" r="4" fill="#FFE2C4"/>' +
    cara('#FF9F2E', '#E7782A') + '<path d="M32 14 L29 22 L35 22Z M12 30 L20 32 L12 35Z M52 30 L44 32 L52 35Z M14 42 L21 41 L15 46Z M50 42 L43 41 L49 46Z" fill="#2A1E5C"/>' +
    '<ellipse cx="32" cy="45" rx="11" ry="8" fill="#FFF4E8"/>' + ojos(23, 41, 33, 3.4) + '<path d="M28 40 L36 40 L32 44Z" fill="#FF6F91"/>' + boca(32, 47, 3);
  ICO.rana = '<ellipse cx="32" cy="40" rx="27" ry="20" fill="#3DCB6F"/><path d="M59 40 C59 51 47 60 32 60 C17 60 5 51 5 40 C14 52 50 52 59 40Z" fill="#26A957"/>' +
    '<circle cx="18" cy="20" r="11" fill="#3DCB6F"/><circle cx="46" cy="20" r="11" fill="#3DCB6F"/><circle cx="18" cy="19" r="7" fill="#fff"/><circle cx="46" cy="19" r="7" fill="#fff"/>' +
    '<circle cx="19" cy="20" r="4" fill="#2A1E5C"/><circle cx="47" cy="20" r="4" fill="#2A1E5C"/><circle cx="20.5" cy="18.5" r="1.4" fill="#fff"/><circle cx="48.5" cy="18.5" r="1.4" fill="#fff"/>' +
    '<path d="M16 40 Q32 54 48 40" stroke="#1E7A42" stroke-width="3" fill="none" stroke-linecap="round"/>' + mejillas(13, 51, 40);
  ICO.conejo = '<ellipse cx="22" cy="14" rx="7" ry="14" fill="#F4F1FF" transform="rotate(-10 22 14)"/><ellipse cx="42" cy="14" rx="7" ry="14" fill="#F4F1FF" transform="rotate(10 42 14)"/>' +
    '<ellipse cx="22" cy="15" rx="3.5" ry="10" fill="#FFB3CC" transform="rotate(-10 22 15)"/><ellipse cx="42" cy="15" rx="3.5" ry="10" fill="#FFB3CC" transform="rotate(10 42 15)"/>' +
    cara('#F4F1FF', '#C9C0E6') + ojos(23, 41, 36, 3.4) + '<path d="M29 42 L35 42 L32 45Z" fill="#FF6F91"/>' + boca(32, 48, 3) + mejillas(17, 47, 43) +
    '<rect x="29" y="48" width="6" height="5" rx="1.5" fill="#fff" stroke="#C9C0E6" stroke-width="1"/>';
  ICO.leon = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => '<circle cx="32" cy="9" r="9" fill="#E7782A" transform="rotate(' + a + ' 32 34)"/>').join('') +
    '<circle cx="32" cy="34" r="22" fill="#E7782A"/>' + '<circle cx="32" cy="35" r="18" fill="#FFC14D"/><circle cx="18" cy="20" r="5" fill="#FFC14D"/><circle cx="46" cy="20" r="5" fill="#FFC14D"/>' +
    '<ellipse cx="32" cy="43" rx="9" ry="6.5" fill="#FFF0D0"/>' + ojos(25, 39, 32, 3) + '<path d="M28 39 L36 39 L32 43Z" fill="#7A4A1E"/>' + boca(32, 46, 3) + mejillas(19, 45, 40);
  ICO.koala = '<circle cx="11" cy="22" r="11" fill="#9C9CB0"/><circle cx="53" cy="22" r="11" fill="#9C9CB0"/><circle cx="11" cy="22" r="6" fill="#F0D5E0"/><circle cx="53" cy="22" r="6" fill="#F0D5E0"/>' +
    cara('#B5B5C8', '#8A8AA0') + ojos(23, 41, 32, 3.2) + '<ellipse cx="32" cy="41" rx="6" ry="8" fill="#3A3550"/>' + brillo(30, 37, 1.6, 2.6, 0) + boca(32, 51, 3) + mejillas(17, 47, 42);
  ICO.unicornio = '<path d="M32 2 L37 18 L27 18Z" fill="#FFD23F"/><path d="M29 12 L35 10 M28 15 L36 13" stroke="#F0A92A" stroke-width="1.6"/>' +
    '<path d="M16 20 L14 6 L24 16Z" fill="#F4F1FF"/><path d="M48 20 L50 6 L40 16Z" fill="#F4F1FF"/>' + cara('#F4F1FF', '#D6CCF5') +
    '<path d="M44 14 C54 16 58 26 54 38 C52 30 48 26 44 26 C48 22 46 18 44 14Z" fill="#FF7AB6"/><path d="M40 16 C48 18 50 26 48 34 C46 28 42 24 38 24Z" fill="#A98BFA"/>' +
    ojos(23, 39, 36, 3.2) + '<ellipse cx="31" cy="47" rx="9" ry="6" fill="#FFD6E8"/><circle cx="28" cy="47" r="1.3" fill="#C26A92"/><circle cx="34" cy="47" r="1.3" fill="#C26A92"/>' + mejillas(16, 45, 42);
  ICO.pulpo = '<path d="M10 36 C10 14 54 14 54 36 L54 40 L10 40Z" fill="#B07CFF"/>' +
    [12, 20, 28, 36, 44, 52].map((x, i) => '<path d="M' + (x - 4) + ' 38 C' + (x - 4) + ' 50 ' + (x + (i % 2 ? 4 : -4)) + ' 52 ' + (x + (i % 2 ? 2 : -2)) + ' 60 C' + (x + 6) + ' 54 ' + (x + 4) + ' 46 ' + (x + 4) + ' 38Z" fill="#9B66F0"/>').join('') +
    '<path d="M10 36 C10 14 54 14 54 36 C54 30 46 22 32 22 C20 22 12 28 10 36Z" fill="#C9A3FF" opacity=".7"/>' + ojos(24, 40, 31, 3.8) + boca(32, 38, 3.5) + mejillas(17, 47, 36);
  ICO.mono = '<circle cx="9" cy="32" r="8" fill="#A86B3C"/><circle cx="55" cy="32" r="8" fill="#A86B3C"/><circle cx="9" cy="32" r="4.5" fill="#F2C9A0"/><circle cx="55" cy="32" r="4.5" fill="#F2C9A0"/>' +
    cara('#A86B3C', '#7A4A1E') + '<path d="M32 22 C26 18 16 22 16 32 C16 36 18 38 20 40 C18 46 22 56 32 56 C42 56 46 46 44 40 C46 38 48 36 48 32 C48 22 38 18 32 22Z" fill="#F2C9A0"/>' +
    ojos(25, 39, 32, 3.2) + '<circle cx="29.5" cy="42" r="1.4" fill="#7A4A1E"/><circle cx="34.5" cy="42" r="1.4" fill="#7A4A1E"/>' + boca(32, 47, 5);
  ICO.pinguino = '<ellipse cx="32" cy="35" rx="23" ry="25" fill="#2E3150"/><ellipse cx="32" cy="48" rx="14" ry="11" fill="#FFFFFF"/>' +
    '<path d="M32 22 C26 14 14 17 15 29 C16 39 24 42 32 42 C40 42 48 39 49 29 C50 17 38 14 32 22Z" fill="#FFFFFF"/>' + ojos(25, 39, 29, 3) +
    '<path d="M28 34 L36 34 L32 39Z" fill="#FFA62E"/>' + mejillas(19, 45, 35) + '<path d="M20 60 L28 56 L28 61Z M44 60 L36 56 L36 61Z" fill="#FFA62E"/>';
  ICO.perro = '<path d="M10 14 C4 22 6 38 14 40 L20 22Z" fill="#7A4A1E"/><path d="M54 14 C60 22 58 38 50 40 L44 22Z" fill="#7A4A1E"/>' + cara('#E3B27A', '#B57F45') +
    '<ellipse cx="40" cy="30" rx="7" ry="6" fill="#B57F45" opacity=".6"/><ellipse cx="32" cy="45" rx="10" ry="7.5" fill="#FFF0D8"/>' + ojos(24, 40, 32, 3.2) +
    '<ellipse cx="32" cy="41" rx="4.5" ry="3.2" fill="#2A1E5C"/>' + boca(32, 46, 3.5) + '<path d="M30 49 C30 54 34 54 34 49Z" fill="#FF6F91"/>';
  ICO.gato = '<path d="M10 8 L26 18 L12 30Z" fill="#9C9CB0"/><path d="M54 8 L38 18 L52 30Z" fill="#9C9CB0"/><path d="M13 13 L22 19 L15 25Z" fill="#FFC7DA"/><path d="M51 13 L42 19 L49 25Z" fill="#FFC7DA"/>' +
    cara('#B5B5C8', '#8A8AA0') + '<path d="M32 15 L30 22 M27 16 L27 21 M37 16 L37 21" stroke="#8A8AA0" stroke-width="2.4" stroke-linecap="round"/>' + ojos(23, 41, 34, 3.4) +
    '<path d="M29 41 L35 41 L32 44Z" fill="#FF6F91"/>' + boca(32, 47, 3) + '<path d="M6 40 L18 42 M6 46 L18 45 M58 40 L46 42 M58 46 L46 45" stroke="#6E6A84" stroke-width="1.4" stroke-linecap="round"/>';

  /* ---------- iconos de niveles, misiones y menús ---------- */
  ICO.bombilla = '<path d="M32 4 C18 4 10 14 10 24 C10 34 18 38 21 46 L43 46 C46 38 54 34 54 24 C54 14 46 4 32 4Z" fill="#FFD23F"/>' +
    '<path d="M54 24 C54 34 46 38 43 46 L36 46 C40 36 48 30 47 18 C46 12 44 9 42 7 C49 10 54 17 54 24Z" fill="#F5B300"/>' +
    '<path d="M26 40 L29 26 L32 32 L35 26 L38 40" stroke="#F08A1C" stroke-width="2.4" fill="none" stroke-linejoin="round"/>' +
    '<rect x="21" y="46" width="22" height="6" rx="2" fill="#9C9CB0"/><rect x="22" y="52" width="20" height="5" rx="2" fill="#8A819C"/><rect x="26" y="57" width="12" height="4" rx="2" fill="#6E6A84"/>' + brillo(21, 17, 5, 3);
  ICO.diana = bola(32, 32, 28, '#FF4B6E') + '<circle cx="32" cy="32" r="21" fill="#fff"/><circle cx="32" cy="32" r="14" fill="#FF4B6E"/><circle cx="32" cy="32" r="7" fill="#fff"/><circle cx="32" cy="32" r="3" fill="#FF4B6E"/>' +
    '<path d="M32 32 L56 8" stroke="#5B4BDB" stroke-width="4" stroke-linecap="round"/><path d="M50 4 L58 2 L60 10 L56 8Z" fill="#2FD18E"/><path d="M52 6 L60 6 L58 12Z" fill="#26A957"/>';
  ICO.telescopio = '<path d="M30 36 L18 60 M34 36 L46 60 M32 36 L32 60" stroke="#6E6A84" stroke-width="4" stroke-linecap="round"/>' +
    '<rect x="8" y="22" width="42" height="14" rx="5" fill="#5B4BDB" transform="rotate(-24 29 29)"/><rect x="40" y="10" width="14" height="20" rx="4" fill="#3FB2F2" transform="rotate(-24 47 20)"/>' +
    '<rect x="4" y="32" width="10" height="9" rx="3" fill="#A98BFA" transform="rotate(-24 9 36)"/><circle cx="32" cy="33" r="4.5" fill="#FFC93C"/>' + '<path d="' + est(56, 50, 6, 2.6) + '" fill="#FFD23F"/>';
  ICO.rayo = '<path d="M38 2 L12 36 L28 36 L22 62 L52 24 L35 24 L44 2Z" fill="#FFD23F" stroke="#F5A31A" stroke-width="3" stroke-linejoin="round"/><path d="M38 6 L18 33 L24 33" stroke="#FFF3A8" stroke-width="3" fill="none" stroke-linecap="round"/>';
  ICO.mochila = '<path d="M22 12 C22 4 42 4 42 12" stroke="#B5462A" stroke-width="4" fill="none"/><rect x="10" y="12" width="44" height="48" rx="14" fill="#FF6B4B"/>' +
    '<rect x="16" y="34" width="32" height="20" rx="6" fill="#E2483B"/><rect x="16" y="34" width="32" height="6" rx="3" fill="#FFC93C"/><rect x="29" y="38" width="6" height="6" rx="2" fill="#FFF3A8"/>' +
    '<path d="M18 14 L18 26 M46 14 L46 26" stroke="#B5462A" stroke-width="3" stroke-linecap="round"/>' + brillo(20, 20, 4, 2);
  ICO.cesta = '<path d="M14 26 C14 8 50 8 50 26" stroke="#B57F45" stroke-width="5" fill="none"/><path d="M6 26 L58 26 L52 58 L12 58Z" fill="#E3A35C"/>' +
    '<path d="M9 36 L55 36 M11 46 L53 46" stroke="#B57F45" stroke-width="3"/><path d="M20 26 L22 58 M32 26 L32 58 M44 26 L42 58" stroke="#B57F45" stroke-width="3"/><rect x="4" y="22" width="56" height="8" rx="4" fill="#C98A45"/>';
  ICO.regla = '<rect x="4" y="22" width="56" height="20" rx="4" fill="#FFC93C" transform="rotate(-20 32 32)"/>' +
    '<g transform="rotate(-20 32 32)" stroke="#7A4A1E" stroke-width="2">' + rango(0, 10).map(i => '<path d="M' + (8 + i * 4.8) + ' 22 L' + (8 + i * 4.8) + ' ' + (i % 2 ? 28 : 32) + '"/>').join('') + '</g>';
  ICO.caja = '<path d="M6 20 L32 8 L58 20 L32 32Z" fill="#E8B872"/><path d="M6 20 L32 32 L32 60 L6 48Z" fill="#D69A4E"/><path d="M58 20 L32 32 L32 60 L58 48Z" fill="#C2863E"/>' +
    '<path d="M19 14 L45 26 L45 36 L39 33 L39 23 L13 11Z" fill="#F4D49E"/>';
  ICO.despertador = '<path d="M10 10 L20 4 M54 10 L44 4" stroke="#FF5D73" stroke-width="6" stroke-linecap="round"/><path d="M16 56 L12 62 M48 56 L52 62" stroke="#5B4BDB" stroke-width="4" stroke-linecap="round"/>' +
    bola(32, 34, 25, '#FF5D73', '#D9294F') + '<circle cx="32" cy="34" r="19" fill="#fff"/><path d="M32 20 L32 34 L42 40" stroke="#2A1E5C" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="32" cy="34" r="2.6" fill="#2A1E5C"/>';
  ICO.carrito = '<path d="M4 10 L12 10 L18 40 L52 40 L58 18 L15 18" stroke="#5B4BDB" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
    '<path d="M16 20 L56 20 L51 37 L19 37Z" fill="#3FB2F2"/><circle cx="22" cy="50" r="5" fill="#2A1E5C"/><circle cx="48" cy="50" r="5" fill="#2A1E5C"/><circle cx="22" cy="50" r="2" fill="#fff"/><circle cx="48" cy="50" r="2" fill="#fff"/>' +
    '<rect x="22" y="10" width="10" height="10" rx="2" fill="#FF9F43"/><circle cx="42" cy="13" r="6" fill="#2FD18E"/>';
  ICO.balanza = '<rect x="30" y="10" width="4" height="44" fill="#8A819C"/><rect x="18" y="54" width="28" height="6" rx="3" fill="#6E6A84"/><path d="M8 16 L56 16" stroke="#6E6A84" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M10 16 L4 34 M10 16 L16 34 M54 16 L48 34 M54 16 L60 34" stroke="#8A819C" stroke-width="1.6"/><path d="M2 34 L18 34 C18 42 2 42 2 34Z" fill="#FFC93C"/><path d="M46 34 L62 34 C62 42 46 42 46 34Z" fill="#FFC93C"/><circle cx="32" cy="10" r="4" fill="#FFC93C"/>';
  ICO.mapa = '<path d="M4 14 L22 8 L42 14 L60 8 L60 52 L42 58 L22 52 L4 58Z" fill="#FFF0C8"/><path d="M22 8 L22 52 L42 58 L42 14Z" fill="#F4DFA6"/>' +
    '<path d="M10 44 C18 36 24 40 30 32 C36 24 44 30 50 20" stroke="#FF5D73" stroke-width="3" fill="none" stroke-dasharray="4 4" stroke-linecap="round"/><path d="M46 16 L54 24 M54 16 L46 24" stroke="#E2405A" stroke-width="3.5" stroke-linecap="round"/>';
  ICO.grua = '<rect x="12" y="10" width="6" height="48" fill="#FFC93C"/><path d="M12 10 L60 10 L60 15 L18 15" fill="#FFC93C"/><path d="M15 10 L30 2" stroke="#F0A92A" stroke-width="3"/><path d="M50 15 L50 30" stroke="#6E6A84" stroke-width="2"/>' +
    '<rect x="44" y="30" width="12" height="10" rx="2" fill="#FF6B4B"/><rect x="4" y="54" width="24" height="6" rx="2" fill="#6E6A84"/><rect x="30" y="44" width="10" height="16" rx="2" fill="#3FB2F2"/><rect x="40" y="50" width="14" height="10" rx="2" fill="#2FD18E"/>';
  ICO.cupula = '<path d="M6 50 C6 26 58 26 58 50Z" fill="#BEE8FF"/><path d="M14 44 C14 34 24 30 32 30" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>' +
    '<rect x="2" y="50" width="60" height="8" rx="3" fill="#9C9CB0"/><rect x="26" y="40" width="12" height="10" rx="5" fill="#5B4BDB"/><path d="M50 30 L50 18 L58 22 L50 26" fill="#FF5D73" stroke="#6E6A84" stroke-width="1.5"/>';
  ICO.casa = '<path d="M6 30 L32 8 L58 30" stroke="#E2405A" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 30 L32 13 L52 30 L52 58 L12 58Z" fill="#FFE6B8"/>' +
    '<path d="M52 30 L52 58 L42 58 L42 22Z" fill="#F4D49E"/><rect x="26" y="40" width="12" height="18" rx="2" fill="#B57F45"/><rect x="16" y="34" width="8" height="8" rx="1.5" fill="#3FB2F2"/><rect x="44" y="12" width="6" height="12" fill="#B5462A"/>';
  ICO.escudo = '<path d="M32 4 L56 12 C56 34 48 50 32 60 C16 50 8 34 8 12Z" fill="#3FB2F2"/><path d="M32 4 L56 12 C56 34 48 50 32 60Z" fill="#1E86C8"/>' +
    '<path d="' + est(32, 30, 13, 6) + '" fill="#FFD23F" stroke="#FFD23F" stroke-width="2" stroke-linejoin="round"/>';
  ICO.satelite = '<rect x="2" y="24" width="20" height="14" rx="2" fill="#3FB2F2" transform="rotate(-30 12 31)"/><rect x="42" y="26" width="20" height="14" rx="2" fill="#3FB2F2" transform="rotate(-30 52 33)"/>' +
    '<path d="M6 30 L18 24 M8 34 L20 28 M46 36 L58 30 M44 32 L56 26" stroke="#1E86C8" stroke-width="1.4"/>' +
    '<rect x="24" y="22" width="16" height="20" rx="4" fill="#C9C0E6" transform="rotate(-30 32 32)"/><circle cx="32" cy="32" r="4" fill="#FFC93C"/><path d="M38 16 L44 8 M40 18 C46 16 48 12 46 6" stroke="#8A819C" stroke-width="2" fill="none"/>';
  ICO.estacion = '<rect x="4" y="28" width="56" height="8" rx="4" fill="#9C9CB0"/><circle cx="32" cy="32" r="14" fill="#E9E4FF"/><circle cx="32" cy="32" r="8" fill="#3FB2F2"/>' +
    '<rect x="2" y="16" width="12" height="32" rx="2" fill="#5B4BDB"/><rect x="50" y="16" width="12" height="32" rx="2" fill="#5B4BDB"/><path d="M8 18 L8 46 M56 18 L56 46" stroke="#9B8FE8" stroke-width="1.5"/>' + brillo(28, 28, 3, 1.6);
  ICO.antena = '<path d="M14 18 C14 40 40 50 52 40 Z" fill="#E9E4FF"/><path d="M14 18 C22 34 36 42 52 40" stroke="#C9C0E6" stroke-width="3" fill="none"/><path d="M30 34 L46 18" stroke="#6E6A84" stroke-width="3"/><circle cx="47" cy="17" r="4" fill="#FF5D73"/>' +
    '<path d="M26 44 L22 58 L42 58 L36 44" fill="#8A819C"/><path d="M50 8 C54 10 56 12 57 16 M52 4 C58 6 61 10 62 16" stroke="#3FB2F2" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  ICO.trofeo = '<path d="M14 8 L50 8 L48 30 C46 38 40 42 32 42 C24 42 18 38 16 30Z" fill="#FFC93C"/><path d="M50 8 L48 30 C46 38 40 42 32 42 C38 38 42 30 42 8Z" fill="#F0A92A"/>' +
    '<path d="M14 12 C4 12 4 26 16 28 M50 12 C60 12 60 26 48 28" stroke="#FFC93C" stroke-width="4" fill="none"/><rect x="28" y="42" width="8" height="8" fill="#F0A92A"/><rect x="18" y="50" width="28" height="9" rx="3" fill="#B57F45"/>' +
    '<path d="' + est(32, 24, 8, 3.6) + '" fill="#FFF3A8"/>';
  ICO.letras = '<rect x="4" y="22" width="24" height="24" rx="5" fill="#FF5D73"/><rect x="22" y="10" width="24" height="24" rx="5" fill="#3FB2F2"/><rect x="36" y="32" width="24" height="24" rx="5" fill="#2FD18E"/>' +
    '<text x="16" y="41" font-family="Fredoka, sans-serif" font-weight="700" font-size="17" fill="#fff" text-anchor="middle">A</text><text x="34" y="29" font-family="Fredoka, sans-serif" font-weight="700" font-size="17" fill="#fff" text-anchor="middle">B</text><text x="48" y="51" font-family="Fredoka, sans-serif" font-weight="700" font-size="17" fill="#fff" text-anchor="middle">C</text>';
  ICO.mano = '<path d="M26 60 C18 58 12 50 10 40 L8 30 C8 26 13 25 15 29 L18 36 L18 10 C18 5 25 5 25 10 L25 26 L26 22 C26 18 32 18 32 22 L33 27 L34 24 C34 20 40 20 40 25 L41 29 L42 27 C43 23 49 24 49 28 L49 44 C49 54 42 60 34 60Z" fill="#FFD5B0" stroke="#C98A5E" stroke-width="2.4" stroke-linejoin="round"/>';
  ICO.manoAbierta = '<path d="M20 60 C14 56 10 48 10 40 L8 22 C8 18 14 18 14 22 L16 32 L16 10 C16 6 22 6 22 10 L23 28 L25 6 C25 2 31 2 31 6 L31 28 L34 8 C34 4 40 4 40 8 L38 30 L44 22 C46 18 52 20 50 25 L42 42 C40 52 34 60 26 60Z" fill="#FFD5B0" stroke="#C98A5E" stroke-width="2.4" stroke-linejoin="round"/>';
  ICO.judias = '<ellipse cx="22" cy="24" rx="11" ry="8" fill="#F4E3C4" transform="rotate(-30 22 24)"/><ellipse cx="42" cy="22" rx="11" ry="8" fill="#E8CFA3" transform="rotate(20 42 22)"/><ellipse cx="32" cy="42" rx="12" ry="8.5" fill="#F4E3C4" transform="rotate(10 32 42)"/>' +
    '<ellipse cx="14" cy="46" rx="9" ry="6.5" fill="#E8CFA3" transform="rotate(-40 14 46)"/><ellipse cx="50" cy="44" rx="9" ry="6.5" fill="#F4E3C4" transform="rotate(40 50 44)"/>';
  ICO.reloj = '<rect x="14" y="2" width="36" height="60" rx="8" fill="#B57F45"/><circle cx="32" cy="24" r="15" fill="#FFF8EC"/><path d="M32 14 L32 24 L39 28" stroke="#2A1E5C" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M32 42 L32 52" stroke="#FFC93C" stroke-width="2.5"/><circle cx="32" cy="54" r="4" fill="#FFC93C"/>';
  ICO.moneda = bola(32, 32, 26, '#FFC93C', '#F0A92A') + '<circle cx="32" cy="32" r="19" fill="none" stroke="#F0A92A" stroke-width="3"/><text x="32" y="41" font-family="Fredoka, sans-serif" font-weight="700" font-size="24" fill="#C47F0C" text-anchor="middle">€</text>' + brillo(22, 20, 5, 3);
  ICO.vaso = '<path d="M14 8 L50 8 L46 58 L18 58Z" fill="#E6F6FF"/><path d="M16 24 L48 24 L46 58 L18 58Z" fill="#FFFFFF"/><path d="M16 24 L48 24 L47 34 C38 30 26 38 17 34Z" fill="#F4F7FF"/>' +
    '<path d="M14 8 L50 8 L46 58 L18 58Z" fill="none" stroke="#9FD7F5" stroke-width="3" stroke-linejoin="round"/>' + brillo(22, 40, 2, 10, 0);
  ICO.brujula = bola(32, 32, 27, '#5B4BDB') + '<circle cx="32" cy="32" r="21" fill="#FFF8EC"/><path d="M32 12 L37 32 L32 52 L27 32Z" fill="#E2405A"/><path d="M32 32 L37 32 L32 52 L27 32Z" fill="#3FB2F2"/><circle cx="32" cy="32" r="3" fill="#2A1E5C"/>';
  ICO.sombra = '<circle cx="32" cy="20" r="12" fill="#5B4BDB"/><path d="M10 60 C10 42 20 34 32 34 C44 34 54 42 54 60Z" fill="#5B4BDB"/>';
  ICO.portapapeles = '<rect x="10" y="8" width="44" height="54" rx="7" fill="#B57F45"/><rect x="15" y="14" width="34" height="44" rx="4" fill="#FFF8EC"/><rect x="22" y="4" width="20" height="10" rx="4" fill="#9C9CB0"/>' +
    '<path d="M20 26 L24 30 L30 22 M20 38 L24 42 L30 34" stroke="#2FD18E" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 27 L44 27 M34 39 L44 39 M20 50 L44 50" stroke="#C9C0E6" stroke-width="3" stroke-linecap="round"/>';
  ICO.libreta = '<rect x="10" y="4" width="44" height="56" rx="6" fill="#3FB2F2"/><rect x="10" y="4" width="10" height="56" rx="4" fill="#1E86C8"/><rect x="26" y="14" width="22" height="14" rx="3" fill="#fff"/>' +
    '<path d="' + est(37, 21, 5, 2.2) + '" fill="#FFC93C"/><path d="M26 38 L48 38 M26 46 L44 46" stroke="#BDE4FB" stroke-width="3" stroke-linecap="round"/>';
  ICO.herramientas = '<path d="M14 50 L40 24" stroke="#8A819C" stroke-width="7" stroke-linecap="round"/><path d="M36 14 C40 6 52 6 56 12 L48 16 L50 22 L56 22 C54 30 44 32 38 28Z" fill="#9C9CB0"/>' +
    '<path d="M50 50 L24 24" stroke="#FF9F43" stroke-width="7" stroke-linecap="round"/><path d="M12 12 L22 8 L30 16 L26 26 L16 22Z" fill="#6E6A84"/><rect x="8" y="46" width="12" height="12" rx="3" fill="#5B4BDB" transform="rotate(45 14 52)"/>';
  ICO.paleta = '<path d="M32 6 C14 6 4 18 4 32 C4 48 18 58 30 58 C36 58 36 52 34 48 C32 44 34 40 40 40 L48 40 C56 40 60 34 60 28 C60 14 46 6 32 6Z" fill="#FFE6B8"/>' +
    '<circle cx="18" cy="26" r="5" fill="#FF5D73"/><circle cx="30" cy="16" r="5" fill="#FFC93C"/><circle cx="44" cy="18" r="5" fill="#2FD18E"/><circle cx="17" cy="42" r="5" fill="#3FB2F2"/><circle cx="50" cy="30" r="4" fill="#A98BFA"/>';
  ICO.corona = '<path d="M6 20 L18 34 L32 12 L46 34 L58 20 L54 50 L10 50Z" fill="#FFC93C" stroke="#FFC93C" stroke-width="3" stroke-linejoin="round"/><path d="M10 50 L54 50 L53 56 L11 56Z" fill="#F0A92A"/>' +
    '<circle cx="6" cy="18" r="4" fill="#FFC93C"/><circle cx="32" cy="10" r="4" fill="#FFC93C"/><circle cx="58" cy="18" r="4" fill="#FFC93C"/><circle cx="32" cy="38" r="5" fill="#FF5D73"/><circle cx="18" cy="42" r="3.5" fill="#3FB2F2"/><circle cx="46" cy="42" r="3.5" fill="#2FD18E"/>';
  ICO.carta = '<rect x="18" y="6" width="34" height="48" rx="6" fill="#A98BFA" transform="rotate(12 35 30)"/><rect x="10" y="10" width="34" height="48" rx="6" fill="#fff" stroke="#5B4BDB" stroke-width="3"/>' +
    '<circle cx="27" cy="30" r="9" fill="#3FB2F2"/><path d="M19 30 C22 26 26 32 35 27" stroke="#2FD18E" stroke-width="3" fill="none"/><path d="' + est(27, 48, 5, 2.2) + '" fill="#FFC93C"/>';
  ICO.cadete = '<path d="M14 6 L32 16 L50 6 L50 30 L32 40 L14 30Z" fill="#2FD18E"/><path d="M14 30 L32 40 L50 30 L50 50 L32 60 L14 50Z" fill="#FFC93C"/>';
  ICO.estrellaBrillante = '<path d="' + est(32, 34, 25, 12) + '" fill="#FFB31A" stroke="#FFB31A" stroke-width="7" stroke-linejoin="round"/><path d="' + est(31, 33, 18, 8.5) + '" fill="#FFF3A8" stroke="#FFF3A8" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M54 6 L56 12 L62 14 L56 16 L54 22 L52 16 L46 14 L52 12Z M10 44 L11.5 48 L16 49.5 L11.5 51 L10 55 L8.5 51 L4 49.5 L8.5 48Z" fill="#FFE26B"/>';
  ICO.chispas = '<path d="M32 4 L36 26 L58 30 L36 34 L32 58 L28 34 L6 30 L28 26Z" fill="#FFD23F"/><path d="M52 6 L54 12 L60 14 L54 16 L52 22 L50 16 L44 14 L50 12Z M12 44 L14 49 L19 51 L14 53 L12 58 L10 53 L5 51 L10 49Z" fill="#FF9FD0"/>';
  ICO.medalla = '<path d="M18 2 L28 2 L36 26 L26 26Z" fill="#3FB2F2"/><path d="M46 2 L36 2 L28 26 L38 26Z" fill="#FF5D73"/>' + bola(32, 42, 18, '#FFC93C', '#F0A92A') + '<path d="' + est(32, 42, 10, 4.6) + '" fill="#FFF3A8"/>';
  ICO.saturno = '<ellipse cx="32" cy="34" rx="30" ry="9" fill="none" stroke="#D9C17A" stroke-width="5" transform="rotate(-18 32 34)"/>' + bola(32, 33, 17, '#F6D88C', '#D9AE5A') +
    '<path d="M2 34 A30 9 0 0 0 62 34" stroke="#EDDDA6" stroke-width="5" fill="none" transform="rotate(-18 32 34)"/><path d="M8 34 A24 6.5 0 0 0 56 34" stroke="#FFF3D0" stroke-width="1.6" fill="none" opacity=".8" transform="rotate(-18 32 34)"/>';
  ICO.planeta = ICO.saturno;
  ICO.regalo = '<rect x="8" y="26" width="48" height="34" rx="5" fill="#FF6FB5"/><rect x="4" y="18" width="56" height="12" rx="4" fill="#FF8AC5"/><rect x="28" y="18" width="8" height="42" fill="#FFC93C"/>' +
    '<path d="M32 18 C26 6 12 8 16 16 C18 20 28 18 32 18 C36 18 46 20 48 16 C52 8 38 6 32 18Z" fill="#FFC93C"/><rect x="8" y="30" width="48" height="5" fill="#E04E9B" opacity=".5"/>';
  ICO.llave = '<circle cx="18" cy="22" r="13" fill="#FFC93C"/><circle cx="18" cy="22" r="5" fill="#2A1E5C" opacity=".35"/><path d="M27 31 L56 60" stroke="#FFC93C" stroke-width="8" stroke-linecap="round"/><path d="M44 48 L50 42 M50 54 L56 48" stroke="#FFC93C" stroke-width="6" stroke-linecap="round"/>';
  ICO.cofre = '<path d="M6 28 C6 12 58 12 58 28Z" fill="#B5462A"/><rect x="6" y="28" width="52" height="30" rx="4" fill="#D96A3A"/><rect x="6" y="26" width="52" height="5" fill="#FFC93C"/>' +
    '<path d="M18 14 L18 58 M46 14 L46 58" stroke="#FFC93C" stroke-width="4"/><rect x="27" y="30" width="10" height="12" rx="2" fill="#FFE26B"/><circle cx="32" cy="35" r="2" fill="#7A4A1E"/>';
  ICO.altavoz = '<path d="M8 24 L20 24 L34 12 L34 52 L20 40 L8 40Z" fill="#5B4BDB"/><path d="M42 22 C46 26 46 38 42 42 M48 16 C56 24 56 40 48 48" stroke="#5B4BDB" stroke-width="4" fill="none" stroke-linecap="round"/>';
  ICO.dormir = '<text x="14" y="50" font-family="Fredoka, sans-serif" font-weight="700" font-size="30" fill="#A98BFA">Z</text><text x="36" y="34" font-family="Fredoka, sans-serif" font-weight="700" font-size="22" fill="#C9B8FF">z</text><text x="50" y="18" font-family="Fredoka, sans-serif" font-weight="700" font-size="15" fill="#E2D8FF">z</text>';
  ICO.viento = '<path d="M6 24 L38 24 C46 24 48 14 42 12 C38 10 34 14 36 18 M6 36 L48 36 C56 36 58 46 52 48 C48 50 44 46 46 42 M10 48 L30 48" stroke="#3FB2F2" stroke-width="5" fill="none" stroke-linecap="round"/>';
  ICO.sonrisa = bola(32, 32, 26, '#FFD23F', '#F0A92A') + ojos(23, 41, 28, 3.6) + boca(32, 38, 9) + mejillas(16, 48, 38);

  /* ---------- cosas de las actividades ---------- */
  ICO.helado = '<path d="M20 30 L44 30 L32 62Z" fill="#E8B872"/><path d="M22 34 L40 34 M25 42 L38 42 M28 50 L36 50" stroke="#C98536" stroke-width="2"/>' +
    '<circle cx="32" cy="20" r="14" fill="#FF9FD0"/><circle cx="22" cy="28" r="8" fill="#FF9FD0"/><circle cx="42" cy="28" r="8" fill="#FF9FD0"/><circle cx="32" cy="6" r="4" fill="#FF4B6E"/>' + brillo(27, 14, 4, 2.4);
  ICO.osito = ICO.oso;
  ICO.yoyo = bola(30, 34, 22, '#FF5D73', '#D9294F') + '<circle cx="30" cy="34" r="8" fill="#FFC93C"/><path d="M30 34 L54 4" stroke="#6E6A84" stroke-width="2"/><circle cx="54" cy="4" r="3" fill="#6E6A84"/>';
  ICO.libros = '<rect x="6" y="40" width="50" height="12" rx="3" fill="#3FB2F2"/><rect x="10" y="28" width="46" height="12" rx="3" fill="#FF5D73"/><rect x="4" y="16" width="44" height="12" rx="3" fill="#2FD18E"/>' +
    '<path d="M10 22 L40 22 M16 34 L48 34 M12 46 L48 46" stroke="#fff" stroke-width="2" opacity=".6"/>';
  ICO.donut = '<circle cx="32" cy="34" r="26" fill="#E8A85A"/><path d="M8 30 C10 16 22 8 32 8 C42 8 54 16 56 30 C52 34 50 28 46 32 C42 36 38 30 32 34 C26 30 22 36 18 32 C14 28 12 34 8 30Z" fill="#FF8AC5"/>' +
    '<circle cx="32" cy="32" r="8" fill="#fff"/><circle cx="32" cy="32" r="8" fill="url(#g-agujero)"/><path d="M20 16 L23 18 M40 14 L42 17 M48 22 L45 24 M16 26 L19 25 M30 14 L33 14" stroke="#FFF3A8" stroke-width="2.4" stroke-linecap="round"/>';
  ICO.cometa = '<path d="M30 4 L52 26 L30 48 L8 26Z" fill="#FF5D73"/><path d="M30 4 L52 26 L30 26Z" fill="#FFC93C"/><path d="M8 26 L30 48 L30 26Z" fill="#3FB2F2"/>' +
    '<path d="M30 48 C28 54 34 56 32 62" stroke="#6E6A84" stroke-width="2" fill="none"/><path d="M26 54 L22 52 L24 56Z M34 58 L38 56 L36 60Z" fill="#2FD18E"/>';
  ICO.balon = '<clipPath id="cl-balon"><circle cx="32" cy="32" r="26"/></clipPath><circle cx="32" cy="32" r="26" fill="#fff"/><g clip-path="url(#cl-balon)" fill="#2A2A3C">' +
    '<path d="M32 22 L41 28 L38 39 L26 39 L23 28Z"/><path d="M27 2 L37 2 L39 10 L32 14 L25 10Z"/><path d="M58 22 L62 32 L56 38 L50 32 L52 24Z"/><path d="M48 52 L52 60 L42 62 L40 54 L44 48Z"/>' +
    '<path d="M16 52 L24 48 L24 56 L18 62 L10 58Z"/><path d="M2 26 L10 22 L14 30 L10 38 L2 36Z"/></g><path d="M32 14 L32 22 M41 28 L50 32 M38 39 L44 48 M26 39 L24 48 M23 28 L14 30" stroke="#2A2A3C" stroke-width="2"/>' +
    '<circle cx="32" cy="32" r="26" fill="url(#g-sombra)"/>';
  ICO.cera = '<g transform="rotate(35 32 32)"><rect x="24" y="14" width="16" height="44" rx="3" fill="#FF5D73"/><path d="M24 14 L32 2 L40 14Z" fill="#FF5D73"/><rect x="24" y="24" width="16" height="22" fill="#fff" opacity=".85"/><rect x="24" y="28" width="16" height="3" fill="#D9294F"/></g>';
  ICO.coco = bola(32, 34, 25, '#8A5A34', '#6B3F22') + '<circle cx="26" cy="22" r="3" fill="#4A2A14"/><circle cx="36" cy="22" r="3" fill="#4A2A14"/><circle cx="31" cy="30" r="3" fill="#4A2A14"/>';
  ICO.sandia = '<path d="M4 22 C4 44 18 58 32 58 C46 58 60 44 60 22Z" fill="#2FB25A"/><path d="M8 22 C8 40 20 53 32 53 C44 53 56 40 56 22Z" fill="#E8FFD8"/><path d="M11 22 C11 38 22 50 32 50 C42 50 53 38 53 22Z" fill="#FF4B5C"/>' +
    [[20, 30], [32, 34], [44, 30], [26, 40], [38, 40]].map(p => '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="1.6" ry="2.6" fill="#2A1E5C"/>').join('');
  ICO.calabaza = '<path d="M32 12 L34 4" stroke="#3DBE6B" stroke-width="4" stroke-linecap="round"/><ellipse cx="20" cy="36" rx="14" ry="20" fill="#F08A1C"/><ellipse cx="44" cy="36" rx="14" ry="20" fill="#F08A1C"/><ellipse cx="32" cy="36" rx="14" ry="22" fill="#FF9F2E"/>' +
    '<path d="M24 32 L28 28 L30 34Z M40 32 L36 28 L34 34Z M22 42 Q32 50 42 42" fill="#7A3A0E" stroke="#7A3A0E" stroke-width="2" stroke-linejoin="round"/>';
  ICO.pluma = '<path d="M50 6 C30 8 14 26 12 50 L16 50 C20 34 32 20 50 6Z" fill="#A98BFA"/><path d="M50 6 C46 26 34 42 16 50 C24 30 36 16 50 6Z" fill="#C9B8FF"/><path d="M50 6 L8 58" stroke="#5B4BDB" stroke-width="2.4" stroke-linecap="round"/>';
  ICO.baloncesto = bola(32, 32, 26, '#FF8C2E', '#E06A12') + '<path d="M6 32 L58 32 M32 6 L32 58 M14 13 C24 24 24 40 14 51 M50 13 C40 24 40 40 50 51" stroke="#7A3A0E" stroke-width="2.4" fill="none"/>';
  ICO.dado = '<rect x="8" y="8" width="48" height="48" rx="10" fill="#FFFFFF" stroke="#D8D4EA" stroke-width="3"/><circle cx="21" cy="21" r="4.5" fill="#FF5D73"/><circle cx="43" cy="21" r="4.5" fill="#FF5D73"/><circle cx="32" cy="32" r="4.5" fill="#FF5D73"/><circle cx="21" cy="43" r="4.5" fill="#FF5D73"/><circle cx="43" cy="43" r="4.5" fill="#FF5D73"/>';
  ICO.hielo = '<path d="M10 22 L32 10 L54 22 L54 46 L32 58 L10 46Z" fill="#BEE8FF"/><path d="M10 22 L32 34 L54 22 L32 10Z" fill="#E6F6FF"/><path d="M32 34 L54 22 L54 46 L32 58Z" fill="#9FD7F5"/>' + brillo(22, 20, 4, 2);
  ICO.lata = '<rect x="14" y="10" width="36" height="46" rx="4" fill="#FF5D73"/><ellipse cx="32" cy="10" rx="18" ry="5" fill="#C9C0E6"/><ellipse cx="32" cy="56" rx="18" ry="5" fill="#D9294F"/><rect x="14" y="24" width="36" height="16" fill="#FFF3A8"/><circle cx="32" cy="32" r="5" fill="#FF9F43"/>';
  ICO.rollo = '<rect x="10" y="12" width="40" height="44" rx="4" fill="#FFFFFF" stroke="#D8D4EA" stroke-width="2"/><ellipse cx="30" cy="12" rx="20" ry="6" fill="#F4F1FF" stroke="#D8D4EA" stroke-width="2"/><ellipse cx="30" cy="12" rx="6" ry="2.4" fill="#C9B8A0"/><path d="M50 30 L58 32 L58 58 L50 56" fill="#F4F1FF" stroke="#D8D4EA" stroke-width="2"/>';
  ICO.pila = '<rect x="18" y="12" width="28" height="46" rx="5" fill="#2FD18E"/><rect x="26" y="6" width="12" height="7" rx="2" fill="#9C9CB0"/><rect x="18" y="36" width="28" height="22" rx="5" fill="#2A2A3C"/><path d="M28 22 L36 22 M32 18 L32 26" stroke="#fff" stroke-width="3" stroke-linecap="round"/>';
  ICO.cocodrilo = '<path d="M4 38 C4 26 16 22 30 24 L58 18 C62 18 62 24 58 26 L36 34 L58 40 C62 42 60 48 56 48 L28 46 C16 48 4 48 4 38Z" fill="#3DCB6F"/>' +
    '<path d="M36 34 L58 26 L56 30 L52 28 L50 32 L46 30 L44 33Z M36 34 L58 40 L54 38 L52 42 L48 39 L46 43 L42 40Z" fill="#fff"/><circle cx="20" cy="22" r="7" fill="#3DCB6F"/><circle cx="21" cy="21" r="4" fill="#fff"/><circle cx="22" cy="21" r="2.2" fill="#2A1E5C"/>' +
    '<path d="M8 40 C14 44 24 44 30 42" stroke="#26A957" stroke-width="2" fill="none"/>';
  ICO.oreja = '<path d="M40 54 C36 60 26 60 24 52 C22 46 26 44 24 38 C18 32 14 26 16 18 C18 8 28 4 36 6 C46 8 52 18 50 28 C48 38 44 46 40 54Z" fill="#FFD5B0" stroke="#C98A5E" stroke-width="2.4"/>' +
    '<path d="M28 20 C30 14 38 12 42 18 C46 24 40 30 36 32 C32 34 34 40 32 42" stroke="#C98A5E" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M52 10 C56 14 58 18 58 22 M54 4 C60 10 63 16 63 22" stroke="#3FB2F2" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  ICO.nina = '<path d="M12 30 C10 12 22 6 32 6 C42 6 54 12 52 30 L54 48 L46 44 L46 30 L18 30 L18 44 L10 48Z" fill="#7A4A1E"/>' +
    '<circle cx="32" cy="32" r="17" fill="#FFD5B0"/><path d="M15 28 C18 16 26 14 32 14 C38 14 46 16 49 28 C42 22 30 20 15 28Z" fill="#7A4A1E"/>' +
    ojos(26, 38, 33, 2.6) + boca(32, 40, 3.5) + mejillas(21, 43, 38) + '<rect x="18" y="49" width="28" height="13" rx="6" fill="#FF6FB5"/><circle cx="50" cy="20" r="5" fill="#FFC93C"/>';
  ICO.ovni = '<ellipse cx="32" cy="24" rx="14" ry="12" fill="#BEE8FF"/><circle cx="32" cy="24" r="6" fill="#2FD18E"/><circle cx="30" cy="22" r="1.6" fill="#2A1E5C"/><circle cx="35" cy="22" r="1.6" fill="#2A1E5C"/>' +
    '<ellipse cx="32" cy="36" rx="28" ry="10" fill="#9B8FE8"/><ellipse cx="32" cy="33" rx="28" ry="7" fill="#C9C0F5"/><circle cx="14" cy="38" r="2.6" fill="#FFC93C"/><circle cx="32" cy="42" r="2.6" fill="#FFC93C"/><circle cx="50" cy="38" r="2.6" fill="#FFC93C"/>' +
    '<path d="M22 46 L16 60 L48 60 L42 46Z" fill="#FFF3A8" opacity=".55"/>';
  ICO.cometaEspacio = '<path d="M60 4 C46 10 30 20 22 30 L34 42 C44 34 54 18 60 4Z" fill="#9FD7F5" opacity=".75"/><path d="M50 8 C40 16 30 24 26 32 L32 38 C38 32 46 22 50 8Z" fill="#E6F6FF" opacity=".8"/>' +
    bola(22, 42, 14, '#A49BB5', '#756C88') + '<circle cx="18" cy="40" r="3" fill="#756C88"/><circle cx="26" cy="48" r="2" fill="#756C88"/>';
  ICO.flechaArriba = '<path d="M32 4 L58 32 L42 32 L42 60 L22 60 L22 32 L6 32Z" fill="#2FD18E" stroke="#1AA86E" stroke-width="3" stroke-linejoin="round"/>';
  ICO.flechaAbajo = '<path d="M32 60 L58 32 L42 32 L42 4 L22 4 L22 32 L6 32Z" fill="#FF6F91" stroke="#E04E78" stroke-width="3" stroke-linejoin="round"/>';
  ICO.pizza = '<path d="M32 60 L6 12 C20 4 44 4 58 12Z" fill="#FFD27A"/><path d="M6 12 C20 4 44 4 58 12 L55 18 C42 11 22 11 9 18Z" fill="#E3A35C"/>' +
    '<circle cx="30" cy="24" r="5" fill="#E2483B"/><circle cx="42" cy="22" r="4" fill="#E2483B"/><circle cx="32" cy="40" r="4" fill="#E2483B"/><circle cx="22" cy="20" r="2" fill="#3DBE6B"/>';
  ICO.bolso = '<path d="M20 24 C20 8 44 8 44 24" stroke="#B5462A" stroke-width="4" fill="none"/><path d="M8 24 L56 24 L52 58 L12 58Z" fill="#FF8C5A"/><path d="M8 24 L56 24 L54 34 L10 34Z" fill="#FFB08A"/><circle cx="32" cy="34" r="3.6" fill="#FFC93C"/>';
  ICO.plato = '<ellipse cx="32" cy="38" rx="28" ry="14" fill="#E9E4FF"/><ellipse cx="32" cy="36" rx="20" ry="9" fill="#FFFFFF"/><path d="M6 14 L6 30 M10 14 L10 30 M14 14 L14 30 M10 30 L10 52" stroke="#9C9CB0" stroke-width="2.4" stroke-linecap="round"/><path d="M56 14 C50 18 50 28 56 30 L56 52" stroke="#9C9CB0" stroke-width="3" fill="none" stroke-linecap="round"/>';
  ICO.por = '<path d="M14 14 L50 50 M50 14 L14 50" stroke="#5B4BDB" stroke-width="10" stroke-linecap="round"/>';
  ICO.tierra = bola(32, 32, 27, '#3FA4F5', '#1B6FC2') + '<path d="M14 22 C20 14 28 16 30 22 C32 28 26 30 28 36 C30 42 22 46 18 42 C12 36 10 28 14 22Z" fill="#3DBE6B"/><path d="M38 12 C46 10 54 18 52 24 C50 28 44 26 40 22 C36 18 34 14 38 12Z M40 38 C46 34 54 38 52 46 C50 52 42 54 38 50 C34 46 36 40 40 38Z" fill="#3DBE6B"/>' + brillo(22, 16, 5, 2.6);
  ICO.dino = '<path d="M14 58 L16 44 C10 40 8 30 14 24 C18 18 26 20 28 26 L30 34 C36 32 44 32 50 38 C56 44 60 50 62 56 C56 52 52 50 48 50 L46 58 L40 58 L40 50 L26 50 L26 58Z" fill="#3DCB6F"/>' +
    '<path d="M28 26 C26 14 30 6 40 6 C50 6 54 12 52 18 C50 22 44 22 40 22 L34 24Z" fill="#3DCB6F"/><circle cx="43" cy="12" r="2.6" fill="#2A1E5C"/><path d="M44 18 L50 17" stroke="#26A957" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M32 34 L34 28 L38 33 L40 27 L44 33 L47 29 L49 36" fill="#FFC93C"/><path d="M20 40 C22 44 22 46 20 48" stroke="#26A957" stroke-width="2" fill="none"/>';
  ICO.ballena = '<path d="M4 38 C4 22 22 16 38 20 C50 23 56 30 56 36 L62 30 L60 42 L62 52 L54 44 C48 52 34 56 22 54 C10 52 4 46 4 38Z" fill="#43A5F5"/><path d="M6 42 C12 50 34 52 50 44 C40 52 20 54 10 48Z" fill="#BEE8FF"/>' +
    '<circle cx="18" cy="34" r="2.6" fill="#2A1E5C"/><path d="M22 10 C22 6 26 4 28 8 C30 4 34 6 32 10 M27 8 L27 18" stroke="#9FD7F5" stroke-width="2.6" fill="none" stroke-linecap="round"/>' + mejillas(14, 26, 40);
  ICO.marciano = '<path d="M32 6 C46 6 56 16 56 30 C56 46 42 58 32 58 C22 58 8 46 8 30 C8 16 18 6 32 6Z" fill="#7EE07A"/><path d="M56 30 C56 46 42 58 32 58 C44 50 50 38 48 18 C53 22 56 26 56 30Z" fill="#5BC657"/>' +
    '<ellipse cx="22" cy="32" rx="8" ry="11" fill="#2A1E5C" transform="rotate(-25 22 32)"/><ellipse cx="42" cy="32" rx="8" ry="11" fill="#2A1E5C" transform="rotate(25 42 32)"/><circle cx="20" cy="28" r="2.4" fill="#fff"/><circle cx="40" cy="28" r="2.4" fill="#fff"/>' + boca(32, 48, 4);
  ICO.arcoiris = ['#FF5D73', '#FF9F43', '#FFD23F', '#2FD18E', '#3FB2F2', '#A98BFA'].map((c, i) => '<path d="M' + (6 + i * 4) + ' 50 A' + (26 - i * 4) + ' ' + (26 - i * 4) + ' 0 0 1 ' + (58 - i * 4) + ' 50" stroke="' + c + '" stroke-width="4.4" fill="none"/>').join('') +
    '<ellipse cx="10" cy="52" rx="9" ry="5" fill="#fff"/><ellipse cx="54" cy="52" rx="9" ry="5" fill="#fff"/>';
  ICO.tortuga = '<ellipse cx="54" cy="40" rx="8" ry="7" fill="#7EE07A"/><circle cx="56" cy="38" r="1.8" fill="#2A1E5C"/><path d="M14 50 L12 58 L20 58 Z M40 50 L42 58 L34 58Z" fill="#7EE07A"/>' +
    '<path d="M6 48 C6 28 18 18 30 18 C42 18 50 28 50 48Z" fill="#3DBE6B"/><path d="M14 46 L20 30 L30 26 L40 30 L44 46 M20 30 L22 46 M40 30 L36 46 M30 26 L30 46" stroke="#26A957" stroke-width="2.4" fill="none"/><rect x="4" y="46" width="48" height="5" rx="2.5" fill="#FFC93C"/>';
  ICO.dragon = '<path d="M10 58 C10 40 18 30 30 28 L34 16 L40 24 L46 14 L48 26 C56 30 58 40 54 48 C50 56 40 58 30 58Z" fill="#FF6B4B"/><path d="M30 28 C18 18 14 8 22 4 C24 12 30 18 36 22Z" fill="#FFC93C"/>' +
    '<circle cx="42" cy="36" r="3" fill="#2A1E5C"/><circle cx="43" cy="35" r="1" fill="#fff"/><path d="M48 46 L54 46" stroke="#B5462A" stroke-width="2.4" stroke-linecap="round"/><path d="M14 50 C20 46 26 48 30 52" stroke="#FFC93C" stroke-width="3" fill="none"/>';
  ICO.fugaz = '<path d="M6 58 L32 32" stroke="#FFE26B" stroke-width="5" stroke-linecap="round" opacity=".55"/><path d="M14 58 L34 38 M6 50 L28 28" stroke="#FF9FD0" stroke-width="3" stroke-linecap="round" opacity=".55"/>' +
    '<path d="' + est(42, 22, 19, 9) + '" fill="#FFC93C" stroke="#FFC93C" stroke-width="4" stroke-linejoin="round"/>';
  ICO.galaxia = '<circle cx="32" cy="32" r="28" fill="#2A1E5C"/><path d="M32 32 C40 24 52 30 48 40 C44 50 26 52 18 42 C10 32 18 14 32 12 C46 10 58 22 56 34" stroke="#A98BFA" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<path d="M32 32 C26 36 20 30 24 26 C28 22 36 24 38 30" stroke="#FF9FD0" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="32" cy="32" r="4" fill="#FFF3A8"/><circle cx="14" cy="18" r="1.4" fill="#fff"/><circle cx="50" cy="50" r="1.4" fill="#fff"/>';
  ICO.volcan = '<path d="M4 60 L22 22 L42 22 L60 60Z" fill="#8A5A34"/><path d="M42 22 L60 60 L40 60 L32 30Z" fill="#6B3F22"/><path d="M22 22 L42 22 L38 30 C34 26 30 32 26 28Z" fill="#FF6B4B"/>' +
    '<path d="M26 18 C20 10 24 2 32 6 C38 0 46 8 40 16" fill="#FF9F43"/><circle cx="20" cy="8" r="3" fill="#FFC93C"/><circle cx="46" cy="6" r="2.4" fill="#FFC93C"/>';
  ICO.microscopio = '<rect x="10" y="54" width="44" height="6" rx="3" fill="#6E6A84"/><path d="M24 54 C24 44 30 40 38 40" stroke="#8A819C" stroke-width="5" fill="none"/><rect x="26" y="6" width="12" height="30" rx="4" fill="#5B4BDB" transform="rotate(-20 32 21)"/>' +
    '<rect x="16" y="40" width="26" height="5" rx="2" fill="#9C9CB0"/><circle cx="40" cy="38" r="5" fill="#3FB2F2"/><rect x="30" y="2" width="10" height="6" rx="2" fill="#2A1E5C" transform="rotate(-20 35 5)"/>';
  ICO.iman = '<path d="M10 8 L24 8 L24 34 C24 40 40 40 40 34 L40 8 L54 8 L54 34 C54 50 42 58 32 58 C22 58 10 50 10 34Z" fill="#FF4B6E"/><rect x="10" y="8" width="14" height="10" fill="#E6E2F6"/><rect x="40" y="8" width="14" height="10" fill="#E6E2F6"/>';
  ICO.diamante = '<path d="M18 8 L46 8 L58 24 L32 58 L6 24Z" fill="#7FD8FF"/><path d="M6 24 L58 24 L32 58Z" fill="#43B7F5"/><path d="M18 8 L26 24 L32 8 L38 24 L46 8" stroke="#BEE8FF" stroke-width="2" fill="none"/><path d="M26 24 L32 58 L38 24" stroke="#BEE8FF" stroke-width="1.6" fill="none"/>' + brillo(20, 16, 3, 1.6);
  ICO.arbol = '<rect x="28" y="40" width="8" height="20" rx="2" fill="#8A5A34"/><circle cx="32" cy="24" r="18" fill="#3DBE6B"/><circle cx="20" cy="32" r="12" fill="#2FB25A"/><circle cx="44" cy="32" r="12" fill="#2FB25A"/>' + brillo(26, 16, 5, 3);
  ICO.coche = '<path d="M6 40 L10 28 C12 24 16 22 20 22 L40 22 C46 22 50 26 52 30 L58 32 C60 34 60 38 60 42 L60 46 L4 46 L4 42Z" fill="#FF5D73"/><path d="M16 30 L20 24 L30 24 L30 30Z M34 24 L42 24 C46 24 48 28 49 30 L34 30Z" fill="#BEE8FF"/>' +
    '<circle cx="18" cy="46" r="7" fill="#2A1E5C"/><circle cx="46" cy="46" r="7" fill="#2A1E5C"/><circle cx="18" cy="46" r="3" fill="#C9C0E6"/><circle cx="46" cy="46" r="3" fill="#C9C0E6"/>';
  ICO.corazon = '<path d="M32 56 C14 44 4 34 4 22 C4 12 12 6 20 6 C26 6 30 10 32 14 C34 10 38 6 44 6 C52 6 60 12 60 22 C60 34 50 44 32 56Z" fill="#FF4B6E"/>' + brillo(16, 18, 5, 3);
  ICO.huevo = '<path d="M32 4 C44 4 54 24 54 38 C54 52 44 60 32 60 C20 60 10 52 10 38 C10 24 20 4 32 4Z" fill="#FFF6E2"/><path d="M54 38 C54 52 44 60 32 60 C42 54 48 44 46 26 C51 30 54 34 54 38Z" fill="#F2E2C2"/>' + brillo(22, 22, 4, 7, 20);
  ICO.pollito = '<path d="M14 40 C14 28 22 22 32 22 C42 22 50 28 50 40 C50 52 42 58 32 58 C22 58 14 52 14 40Z" fill="#FFD23F"/><path d="M8 40 L16 34 L22 40 L28 34 L32 40 L36 34 L42 40 L48 34 L56 40 L56 50 C50 60 14 60 8 50Z" fill="#FFF6E2"/>' +
    '<circle cx="26" cy="32" r="2.4" fill="#2A1E5C"/><circle cx="38" cy="32" r="2.4" fill="#2A1E5C"/><path d="M29 36 L35 36 L32 40Z" fill="#FF8C1A"/>';
  ICO.gallina = '<path d="M14 36 C14 22 24 16 34 18 C46 20 54 30 52 42 C50 54 40 60 30 58 C20 56 14 48 14 36Z" fill="#FFFFFF"/><path d="M52 42 C50 54 40 60 30 58 C40 52 46 42 44 30 C50 32 53 36 52 42Z" fill="#E6E2F6"/>' +
    '<path d="M24 18 C22 10 28 8 30 12 C32 6 38 8 36 14 C40 12 42 16 38 19Z" fill="#FF4B5C"/><circle cx="26" cy="28" r="2.6" fill="#2A1E5C"/><path d="M14 30 L6 33 L14 36Z" fill="#FF8C1A"/><path d="M16 38 C14 44 18 46 20 42" fill="#FF4B5C"/>';
  ICO.brote = '<path d="M32 60 L32 30" stroke="#3DBE6B" stroke-width="5" stroke-linecap="round"/><path d="M32 36 C20 36 12 28 12 18 C24 18 32 24 32 36Z" fill="#3DCB6F"/><path d="M32 30 C42 30 52 22 52 12 C40 12 32 18 32 30Z" fill="#2FB25A"/><rect x="18" y="54" width="28" height="8" rx="4" fill="#8A5A34"/>';
  ICO.girasol = '<path d="M32 62 L32 36" stroke="#3DBE6B" stroke-width="5"/><path d="M32 50 C24 50 18 44 18 38 C26 38 32 42 32 50Z" fill="#3DCB6F"/>' +
    rango(0, 11).map(i => '<ellipse cx="32" cy="10" rx="5" ry="9" fill="#FFC93C" transform="rotate(' + (i * 30) + ' 32 24)"/>').join('') + '<circle cx="32" cy="24" r="9" fill="#7A4A1E"/>';

  /* ---------- más dibujos: pictogramas, familias de «¿cuál sobra?», rutinas y ciencia ---------- */
  const txt = (t, c, tam, y) => '<text x="32" y="' + (y || 44) + '" font-family="Fredoka, sans-serif" font-weight="700" font-size="' + (tam || 34) + '" fill="' + c + '" text-anchor="middle">' + t + '</text>';
  const ficha = (c, osc) => '<rect x="6" y="8" width="52" height="50" rx="14" fill="' + osc + '"/><rect x="6" y="6" width="52" height="47" rx="14" fill="' + c + '"/>';
  ICO.interrogacion = ficha('#A98BFA', '#7B5BE0') + txt('?', '#fff', 40, 45);
  ICO.sumar = ficha('#FF5DA2', '#D93A80') + '<path d="M32 16 L32 44 M18 30 L46 30" stroke="#fff" stroke-width="8" stroke-linecap="round"/>';
  ICO.restar = ficha('#3FB2F2', '#1C84C2') + '<path d="M18 30 L46 30" stroke="#fff" stroke-width="8" stroke-linecap="round"/>';
  ICO.flechaDer = '<path d="M6 24 L36 24 L36 10 L60 32 L36 54 L36 40 L6 40Z" fill="#2FD18E" stroke="#1AA86E" stroke-width="3" stroke-linejoin="round"/>';
  ICO.flechasLado = '<path d="M4 32 L20 18 L20 26 L44 26 L44 18 L60 32 L44 46 L44 38 L20 38 L20 46Z" fill="#FF9F43" stroke="#E7782A" stroke-width="3" stroke-linejoin="round"/>';
  ICO.flechasAlto = '<g transform="rotate(90 32 32)">' + ICO.flechasLado + '</g>';
  ICO.devolver = '<path d="M26 10 L6 26 L26 42 L26 32 C40 30 50 36 54 50 C58 30 46 18 26 20Z" fill="#3FB2F2" stroke="#1C84C2" stroke-width="3" stroke-linejoin="round"/>';
  ICO.repetir = '<path d="M14 30 C14 18 24 12 34 12 L34 4 L48 16 L34 28 L34 20 C28 20 22 24 22 30Z M50 34 C50 46 40 52 30 52 L30 60 L16 48 L30 36 L30 44 C36 44 42 40 42 34Z" fill="#2FD18E" stroke="#1AA86E" stroke-width="2.4" stroke-linejoin="round"/>';
  ICO.ojos = '<ellipse cx="20" cy="32" rx="14" ry="18" fill="#fff" stroke="#2A1E5C" stroke-width="3"/><ellipse cx="44" cy="32" rx="14" ry="18" fill="#fff" stroke="#2A1E5C" stroke-width="3"/><circle cx="24" cy="34" r="7" fill="#2A1E5C"/><circle cx="48" cy="34" r="7" fill="#2A1E5C"/><circle cx="26" cy="31" r="2.4" fill="#fff"/><circle cx="50" cy="31" r="2.4" fill="#fff"/>';
  ICO.numeros = ficha('#5B4BDB', '#3E2FB0') + '<text x="32" y="40" font-family="Fredoka, sans-serif" font-weight="700" font-size="20" fill="#fff" text-anchor="middle">123</text>';
  ICO.diez = ficha('#9B7BF7', '#6B4FD0') + txt('10', '#fff', 26, 40);
  ICO.cien = ficha('#FF5D73', '#D9294F') + txt('100', '#fff', 20, 39);
  ICO.lupa = '<circle cx="26" cy="26" r="17" fill="#BEE8FF" stroke="#5B4BDB" stroke-width="6"/><path d="M38 38 L56 56" stroke="#5B4BDB" stroke-width="9" stroke-linecap="round"/>' + brillo(20, 20, 5, 3);
  ICO.rombo = '<path d="M32 4 L58 32 L32 60 L6 32Z" fill="#3FB2F2"/><path d="M32 4 L58 32 L32 60Z" fill="#1E86C8"/>';
  ICO.esfera = bola(32, 32, 27, '#FFFFFF', '#E6E2F6') + '<circle cx="32" cy="32" r="27" fill="none" stroke="#9B7BF7" stroke-width="4"/><path d="M32 14 L32 32 L44 38" stroke="#2A1E5C" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="32" cy="32" r="3" fill="#FF5DA2"/>';
  ICO.calendario = '<rect x="6" y="10" width="52" height="48" rx="8" fill="#fff" stroke="#D8D4EA" stroke-width="2"/><path d="M6 18 A8 8 0 0 1 14 10 L50 10 A8 8 0 0 1 58 18 L58 24 L6 24Z" fill="#FF5D73"/>' +
    '<rect x="16" y="4" width="5" height="12" rx="2.5" fill="#6E6A84"/><rect x="43" y="4" width="5" height="12" rx="2.5" fill="#6E6A84"/>' + txt('17', '#2A1E5C', 24, 50);
  ICO.grafico = '<rect x="6" y="6" width="52" height="52" rx="8" fill="#fff" stroke="#D8D4EA" stroke-width="2"/><rect x="14" y="34" width="9" height="18" rx="2" fill="#FF5DA2"/><rect x="28" y="20" width="9" height="32" rx="2" fill="#3FB2F2"/><rect x="42" y="28" width="9" height="24" rx="2" fill="#2FD18E"/>';
  ICO.canguro = '<path d="M14 56 C10 44 14 30 26 28 C30 20 30 12 36 8 C40 6 44 8 44 12 L48 6 L50 14 C54 16 54 22 50 24 L42 24 C42 32 46 38 46 46 L56 56 L44 56 L36 48 L28 56Z" fill="#E3A35C"/>' +
    '<path d="M28 34 C24 40 26 46 32 48" stroke="#C98536" stroke-width="2.4" fill="none"/><circle cx="44" cy="15" r="2" fill="#2A1E5C"/><path d="M14 52 C8 48 4 50 2 54" stroke="#E3A35C" stroke-width="5" fill="none" stroke-linecap="round"/>';
  ICO.puzle = '<path d="M8 14 L24 14 C22 6 34 6 32 14 L48 14 L48 28 C56 26 56 38 48 36 L48 52 L32 52 C34 44 22 44 24 52 L8 52 L8 36 C16 38 16 26 8 28Z" fill="#2FD18E" stroke="#1AA86E" stroke-width="2.4" stroke-linejoin="round"/>';
  ICO.pensar = bola(32, 32, 26, '#FFD23F', '#F0A92A') + ojos(23, 41, 26, 3.2) + '<path d="M24 40 L40 38" stroke="#2A1E5C" stroke-width="3" stroke-linecap="round"/><path d="M40 48 C44 44 50 46 50 52 C50 56 46 58 42 56" fill="#FFC14D" stroke="#F0A92A" stroke-width="2"/>';
  ICO.tren = '<rect x="6" y="18" width="28" height="28" rx="5" fill="#FF5D73"/><rect x="10" y="22" width="12" height="10" rx="2" fill="#BEE8FF"/><rect x="34" y="28" width="24" height="18" rx="4" fill="#3FB2F2"/><rect x="40" y="18" width="7" height="10" fill="#6E6A84"/>' +
    '<circle cx="14" cy="50" r="5.5" fill="#2A1E5C"/><circle cx="28" cy="50" r="5.5" fill="#2A1E5C"/><circle cx="46" cy="50" r="5.5" fill="#2A1E5C"/><circle cx="44" cy="10" r="4" fill="#E6E2F6"/><circle cx="52" cy="6" r="3" fill="#E6E2F6"/>';
  ICO.bandera = '<rect x="12" y="6" width="5" height="54" rx="2.5" fill="#6E6A84"/><path d="M17 8 C30 4 36 16 54 10 L54 34 C36 40 30 28 17 32Z" fill="#FF4B5C"/>';
  ICO.meta = '<rect x="12" y="6" width="5" height="54" rx="2.5" fill="#6E6A84"/><path d="M17 8 L54 8 L54 36 L17 36Z" fill="#fff" stroke="#2A2A3C" stroke-width="2"/>' +
    [[17, 8], [35.5, 8], [26, 17], [45, 17], [17, 26.5], [35.5, 26.5]].map(c => '<rect x="' + c[0] + '" y="' + c[1] + '" width="9.25" height="9.5" fill="#2A2A3C"/>').join('');
  ICO.espejo = '<ellipse cx="32" cy="26" rx="18" ry="22" fill="#B57F45"/><ellipse cx="32" cy="26" rx="13" ry="17" fill="#BEE8FF"/><path d="M24 18 L30 12 M24 26 L36 14" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><rect x="29" y="46" width="6" height="12" fill="#B57F45"/><rect x="20" y="56" width="24" height="5" rx="2.5" fill="#B57F45"/>';
  ICO.billete = '<rect x="4" y="14" width="56" height="36" rx="6" fill="#7EC8A0"/><rect x="9" y="19" width="46" height="26" rx="4" fill="none" stroke="#4E9E74" stroke-width="2"/><circle cx="32" cy="32" r="9" fill="#BDE9CF"/>' + txt('€', '#2E7A52', 14, 37);
  ICO.personas = '<circle cx="22" cy="20" r="9" fill="#FF9F43"/><path d="M8 54 C8 40 14 32 22 32 C30 32 36 40 36 54Z" fill="#FF9F43"/><circle cx="42" cy="22" r="9" fill="#3FB2F2"/><path d="M28 56 C28 42 34 34 42 34 C50 34 56 42 56 56Z" fill="#3FB2F2"/>';
  ICO.rico = bola(32, 32, 26, '#FFD23F', '#F0A92A') + '<path d="M20 26 Q23 22 26 26 M38 26 Q41 22 44 26" stroke="#2A1E5C" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M20 36 Q32 50 44 36Z" fill="#7A3A0E"/><path d="M34 40 C36 48 42 50 44 46 C44 42 40 40 34 40Z" fill="#FF6F91"/>';
  ICO.pum = '<path d="' + est(32, 32, 28, 15, 8) + '" fill="#FF9F43"/><path d="' + est(32, 32, 18, 9, 8) + '" fill="#FFE26B"/>';
  ICO.movil = '<rect x="16" y="4" width="32" height="56" rx="7" fill="#2A2A3C"/><rect x="19" y="10" width="26" height="40" rx="3" fill="#3FB2F2"/><circle cx="32" cy="55" r="2.6" fill="#9C9CB0"/>';
  const medal = (c, o, n) => '<path d="M18 2 L28 2 L36 26 L26 26Z" fill="#3FB2F2"/><path d="M46 2 L36 2 L28 26 L38 26Z" fill="#FF5D73"/>' + bola(32, 42, 18, c, o) + txt(n, '#fff', 20, 49);
  ICO.oro = medal('#FFC93C', '#F0A92A', '1');
  ICO.plata = medal('#C9C9D6', '#9C9CB0', '2');
  ICO.bronce = medal('#E3A35C', '#B57F45', '3');
  ICO.fuego = '<path d="M32 60 C16 60 8 48 10 36 C12 26 20 22 22 12 C28 18 30 24 30 28 C34 22 36 16 36 6 C48 14 56 28 54 40 C52 52 44 60 32 60Z" fill="#FF6B4B"/><path d="M32 60 C24 60 20 52 22 46 C24 40 28 38 30 32 C34 38 36 42 36 46 C40 42 42 44 42 48 C42 54 38 60 32 60Z" fill="#FFC93C"/>';
  ICO.chincheta = '<path d="M32 4 C20 4 12 13 12 24 C12 38 32 60 32 60 C32 60 52 38 52 24 C52 13 44 4 32 4Z" fill="#FF4B5C"/><circle cx="32" cy="24" r="8" fill="#fff"/>';
  ICO.buzon = '<rect x="8" y="22" width="48" height="30" rx="14" fill="#3FB2F2"/><rect x="30" y="52" width="6" height="10" fill="#6E6A84"/><rect x="16" y="32" width="18" height="5" rx="2.5" fill="#1C84C2"/><path d="M44 22 L44 8 L54 12 L44 16" fill="#FF4B5C"/>';
  // Ropa, comida y vehículos (familias de «¿cuál sobra?»)
  ICO.camiseta = '<path d="M20 6 L8 14 L4 28 L14 30 L16 24 L16 58 L48 58 L48 24 L50 30 L60 28 L56 14 L44 6 C42 12 36 14 32 14 C28 14 22 12 20 6Z" fill="#43B7F5"/><path d="M20 6 C22 12 28 14 32 14 C36 14 42 12 44 6 L40 6 C38 10 34 10 32 10 C30 10 26 10 24 6Z" fill="#1E86C8"/>';
  ICO.pantalon = '<path d="M14 6 L50 6 L54 58 L38 58 L32 24 L26 58 L10 58Z" fill="#3E63C8"/><rect x="14" y="6" width="36" height="7" fill="#2E4CA8"/><path d="M32 13 L32 22" stroke="#2E4CA8" stroke-width="2"/>';
  ICO.vestido = '<path d="M24 4 L26 14 L20 24 L8 58 L56 58 L44 24 L38 14 L40 4 L34 4 C34 8 30 8 30 4Z" fill="#FF6FB5"/><path d="M20 24 L44 24 L42 30 L22 30Z" fill="#E04E9B"/>';
  ICO.gorra = '<path d="M8 40 C8 22 20 12 34 12 C48 12 56 24 56 40Z" fill="#FF5D73"/><path d="M4 40 L60 40 L60 44 C46 48 18 48 4 44Z" fill="#D9294F"/><path d="M40 40 L62 40 L62 46 L40 46Z" fill="#B5203A"/><circle cx="34" cy="12" r="3" fill="#D9294F"/>';
  ICO.uvas = [[24, 24], [38, 24], [18, 36], [32, 36], [46, 36], [24, 48], [38, 48], [31, 58]].map(c => '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="7.5" fill="#9B66F0"/><circle cx="' + (c[0] - 2) + '" cy="' + (c[1] - 2) + '" r="2" fill="#C9A3FF"/>').join('') +
    '<path d="M31 18 L33 6" stroke="#7A4A1E" stroke-width="3" stroke-linecap="round"/><path d="M33 10 C38 4 46 6 48 9 C44 12 38 13 33 10Z" fill="#3DBE6B"/>';
  ICO.cerezas = '<path d="M18 46 C22 30 30 14 40 6 M46 42 C44 28 42 16 40 6" stroke="#3DBE6B" stroke-width="3" fill="none" stroke-linecap="round"/>' + bola(18, 48, 11, '#FF3B5C', '#D41F42') + bola(46, 44, 11, '#FF3B5C', '#D41F42') + '<path d="M40 6 C46 2 54 4 56 8 C50 12 44 10 40 6Z" fill="#3DBE6B"/>';
  ICO.queso = '<path d="M4 44 L36 10 L60 26 L60 52 L4 52Z" fill="#FFD23F"/><path d="M4 44 L60 26 L60 52 L4 52Z" fill="#FFC14D"/><circle cx="20" cy="46" r="4" fill="#F0A92A"/><circle cx="42" cy="40" r="5" fill="#F0A92A"/><circle cx="52" cy="48" r="2.6" fill="#F0A92A"/><circle cx="36" cy="24" r="3" fill="#F0A92A"/>';
  ICO.zanahoria = '<path d="M14 54 L40 22 C46 16 54 20 50 28 Z" fill="#FF8C2E"/><path d="M22 44 L28 46 M30 34 L36 36 M38 26 L43 28" stroke="#E06A12" stroke-width="2" stroke-linecap="round"/><path d="M46 22 C44 12 48 6 52 6 C52 12 50 18 48 22 M48 24 C54 16 60 16 62 18 C58 22 54 24 50 26" fill="#3DBE6B"/>';
  ICO.maiz = '<path d="M32 4 C42 4 46 18 46 32 C46 46 40 56 32 56 C24 56 18 46 18 32 C18 18 22 4 32 4Z" fill="#FFD23F"/>' + [12, 20, 28, 36, 44].map(y => '<path d="M21 ' + y + ' L43 ' + y + '" stroke="#F0A92A" stroke-width="1.6"/>').join('') +
    '<path d="M32 6 L32 54 M26 6 L25 52 M38 6 L39 52" stroke="#F0A92A" stroke-width="1.4"/><path d="M20 30 C10 40 12 56 26 62 C22 52 22 42 24 34Z M44 30 C54 40 52 56 38 62 C42 52 42 42 40 34Z" fill="#3DBE6B"/>';
  ICO.brocoli = '<path d="M28 60 L30 36 L34 36 L36 60Z" fill="#7EE07A"/><circle cx="20" cy="28" r="12" fill="#2FB25A"/><circle cx="44" cy="28" r="12" fill="#2FB25A"/><circle cx="32" cy="18" r="13" fill="#3DCB6F"/><circle cx="32" cy="32" r="10" fill="#26A957"/>';
  ICO.bici = '<circle cx="16" cy="42" r="12" fill="none" stroke="#2A1E5C" stroke-width="4"/><circle cx="48" cy="42" r="12" fill="none" stroke="#2A1E5C" stroke-width="4"/>' +
    '<path d="M16 42 L26 24 L42 24 L48 42 M26 24 L32 42 L42 24 M32 42 L16 42" stroke="#FF5D73" stroke-width="4" fill="none" stroke-linejoin="round"/><path d="M22 20 L30 20 M42 24 L40 14 L46 12" stroke="#2A1E5C" stroke-width="4" stroke-linecap="round" fill="none"/>';
  ICO.autobus = '<rect x="4" y="12" width="56" height="36" rx="8" fill="#FFC93C"/><rect x="8" y="17" width="12" height="12" rx="2" fill="#BEE8FF"/><rect x="24" y="17" width="12" height="12" rx="2" fill="#BEE8FF"/><rect x="40" y="17" width="14" height="12" rx="2" fill="#BEE8FF"/>' +
    '<rect x="4" y="36" width="56" height="5" fill="#F0A92A"/><circle cx="16" cy="50" r="6" fill="#2A1E5C"/><circle cx="48" cy="50" r="6" fill="#2A1E5C"/>';
  ICO.bomberos = '<rect x="4" y="22" width="40" height="26" rx="4" fill="#FF4B5C"/><path d="M44 28 L54 28 L60 38 L60 48 L44 48Z" fill="#FF4B5C"/><path d="M46 30 L53 30 L57 37 L46 37Z" fill="#BEE8FF"/>' +
    '<path d="M6 16 L40 10 M6 22 L40 16 M12 15 L12 21 M22 13 L22 19 M32 11 L32 17" stroke="#C9C0E6" stroke-width="3" stroke-linecap="round"/><circle cx="14" cy="50" r="6" fill="#2A1E5C"/><circle cx="50" cy="50" r="6" fill="#2A1E5C"/><rect x="20" y="8" width="8" height="4" fill="#3FB2F2"/>';
  ICO.sarten = '<circle cx="26" cy="34" r="22" fill="#4A4560"/><circle cx="26" cy="34" r="17" fill="#5E5978"/><path d="M46 28 L62 22" stroke="#B57F45" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M14 32 C12 24 20 20 26 22 C32 18 40 24 38 32 C40 40 30 44 24 42 C16 44 12 38 14 32Z" fill="#fff"/><circle cx="26" cy="32" r="6" fill="#FFC93C"/>';
  ICO.cuenco = '<path d="M4 28 L60 28 C60 44 48 56 32 56 C16 56 4 44 4 28Z" fill="#3FB2F2"/><path d="M4 28 L60 28 C60 34 46 36 32 36 C18 36 4 34 4 28Z" fill="#FFF3DC"/><circle cx="22" cy="31" r="3" fill="#E3A35C"/><circle cx="34" cy="30" r="3" fill="#E3A35C"/><circle cx="44" cy="32" r="2.6" fill="#E3A35C"/><path d="M48 26 L58 8" stroke="#9C9CB0" stroke-width="4" stroke-linecap="round"/>';
  ICO.colegio = '<path d="M4 28 L32 10 L60 28Z" fill="#FF5D73"/><rect x="8" y="28" width="48" height="30" fill="#FFE6B8"/><rect x="26" y="40" width="12" height="18" rx="2" fill="#B57F45"/><rect x="12" y="34" width="9" height="9" rx="1.5" fill="#3FB2F2"/><rect x="43" y="34" width="9" height="9" rx="1.5" fill="#3FB2F2"/><circle cx="32" cy="22" r="4" fill="#FFF"/><path d="M32 4 L32 10 L40 7Z" fill="#2FD18E"/>';
  ICO.bellota = '<path d="M14 26 C14 14 50 14 50 26 L50 30 L14 30Z" fill="#8A5A34"/><path d="M18 30 L46 30 C46 46 40 58 32 60 C24 58 18 46 18 30Z" fill="#E3A35C"/><path d="M32 16 L33 6" stroke="#6B3F22" stroke-width="4" stroke-linecap="round"/>';
  ICO.hoja = '<path d="M8 56 C8 28 26 8 56 8 C56 38 36 56 8 56Z" fill="#3DCB6F"/><path d="M8 56 C20 40 32 28 46 18" stroke="#26A957" stroke-width="3" fill="none" stroke-linecap="round"/>';
  ICO.nino = '<circle cx="32" cy="30" r="17" fill="#FFD5B0"/><path d="M15 26 C16 14 26 10 32 10 C40 10 48 14 49 26 C42 20 26 18 15 26Z" fill="#7A4A1E"/>' + ojos(26, 38, 31, 2.6) + boca(32, 38, 3.5) + mejillas(21, 43, 36) + '<rect x="18" y="47" width="28" height="15" rx="6" fill="#3FB2F2"/>';
  const cieloSol = (c1, c2, y) => '<rect x="4" y="6" width="56" height="52" rx="10" fill="' + c1 + '"/><circle cx="32" cy="' + y + '" r="11" fill="' + c2 + '"/><rect x="4" y="40" width="56" height="18" rx="0" fill="#3DBE6B"/><path d="M4 48 L60 48 L60 50 A8 8 0 0 1 52 58 L12 58 A8 8 0 0 1 4 50Z" fill="#26A957"/>';
  ICO.amanecer = cieloSol('#FFD8A8', '#FFB31A', 40);
  ICO.atardecer = cieloSol('#A06BD8', '#FF7A3C', 42) + '<rect x="12" y="26" width="8" height="16" fill="#3A2F6E"/><rect x="40" y="22" width="10" height="20" fill="#3A2F6E"/>';
  ICO.lunaLlena = bola(32, 32, 26, '#F4F4F8', '#C9C9D6') + '<circle cx="24" cy="24" r="5" fill="#C9C9D6"/><circle cx="40" cy="38" r="7" fill="#C9C9D6"/><circle cx="26" cy="42" r="3" fill="#C9C9D6"/>';
  ICO.lluvia = ICO.nube.replace(/fill="#F4F7FF"/, 'fill="#C9D3EE"').replace(/fill="#C9D3EE"\/>$/, 'fill="#9FAAD0"/>') + '<path d="M20 54 L16 62 M34 54 L30 62 M48 54 L44 62" stroke="#3FB2F2" stroke-width="4" stroke-linecap="round"/>';
  ICO.gota = '<path d="M32 4 C40 18 52 30 52 42 C52 53 43 60 32 60 C21 60 12 53 12 42 C12 30 24 18 32 4Z" fill="#3FB2F2"/>' + brillo(24, 40, 3, 6, 15);
  ICO.espiral = '<path d="M32 32 C36 28 40 34 36 38 C30 44 22 36 26 28 C32 18 46 22 46 34 C46 48 28 52 20 44 C10 34 16 14 32 12 C48 10 58 26 54 40" stroke="#9B7BF7" stroke-width="5" fill="none" stroke-linecap="round"/>';
  ICO.frio = bola(32, 32, 26, '#7FD8FF', '#43B7F5') + '<circle cx="23" cy="28" r="3.2" fill="#2A1E5C"/><circle cx="41" cy="28" r="3.2" fill="#2A1E5C"/><path d="M20 42 L24 38 L28 42 L32 38 L36 42 L40 38 L44 42" stroke="#2A1E5C" stroke-width="2.6" fill="none"/><path d="M8 12 L14 18 M56 12 L50 18" stroke="#BEE8FF" stroke-width="3" stroke-linecap="round"/>';
  ICO.gafasSol = '<path d="M4 24 L60 24" stroke="#2A2A3C" stroke-width="4" stroke-linecap="round"/><path d="M8 24 L28 24 L26 38 C25 42 13 42 11 38Z M36 24 L56 24 L53 38 C51 42 39 42 38 38Z" fill="#2A2A3C"/><path d="M14 28 L20 28 M41 28 L47 28" stroke="#9B8FE8" stroke-width="2.4" stroke-linecap="round"/>';
  ICO.paraguas = '<path d="M4 32 C4 16 18 6 32 6 C46 6 60 16 60 32 C56 28 50 28 46 32 C42 28 36 28 32 32 C28 28 22 28 18 32 C14 28 8 28 4 32Z" fill="#FF5DA2"/><path d="M32 6 C26 14 24 22 25 30 M32 6 C38 14 40 22 39 30" stroke="#D93A80" stroke-width="2" fill="none"/>' +
    '<path d="M32 30 L32 54 C32 60 24 60 24 54" stroke="#6E6A84" stroke-width="4" fill="none" stroke-linecap="round"/>';
  ICO.banador = '<path d="M18 6 L22 6 C24 18 40 18 42 6 L46 6 L46 24 C46 30 42 34 42 40 L52 58 L40 58 C38 50 34 46 32 46 C30 46 26 50 24 58 L12 58 L22 40 C22 34 18 30 18 24Z" fill="#FF6F91"/><circle cx="28" cy="30" r="3" fill="#FFF3A8"/><circle cx="38" cy="36" r="3" fill="#FFF3A8"/>';
  ICO.banera = '<path d="M4 30 L60 30 L56 46 C54 52 48 56 42 56 L22 56 C16 56 10 52 8 46Z" fill="#E6F6FF" stroke="#9FD7F5" stroke-width="3"/><path d="M8 30 L8 12 C8 6 16 6 18 12" stroke="#9C9CB0" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<circle cx="24" cy="24" r="6" fill="#fff" stroke="#BEE8FF" stroke-width="2"/><circle cx="36" cy="20" r="8" fill="#fff" stroke="#BEE8FF" stroke-width="2"/><circle cx="48" cy="25" r="5" fill="#fff" stroke="#BEE8FF" stroke-width="2"/><path d="M16 56 L14 62 M48 56 L50 62" stroke="#9C9CB0" stroke-width="4" stroke-linecap="round"/>';
  ICO.anillo = '<circle cx="32" cy="40" r="18" fill="none" stroke="#FFC93C" stroke-width="7"/><path d="M24 22 L32 10 L40 22 L32 28Z" fill="#7FD8FF"/><path d="M24 22 L40 22 L32 28Z" fill="#43B7F5"/>';
  ICO.corazonAzul = ICO.corazon.replace('#FF4B6E', '#3FB2F2');
  ICO.pinza = ICO.manoAbierta;
  ICO.esponja = '<rect x="6" y="18" width="52" height="30" rx="8" fill="#FFD23F"/><rect x="6" y="38" width="52" height="10" rx="5" fill="#2FD18E"/>' + [[16, 26], [28, 30], [42, 24], [50, 32], [22, 34]].map(c => '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="2.4" fill="#F0A92A"/>').join('');
  ICO.pulgarArriba = '<path d="M20 28 L30 8 C34 6 38 8 36 16 L34 26 L50 26 C56 26 56 32 52 34 C56 36 54 42 50 42 C54 44 52 50 48 50 C50 54 46 58 42 58 L22 58Z" fill="#FFD5B0" stroke="#C98A5E" stroke-width="2.4" stroke-linejoin="round"/><rect x="6" y="26" width="14" height="34" rx="4" fill="#3FB2F2"/>';
  ICO.pulgarAbajo = '<g transform="rotate(180 32 32)">' + ICO.pulgarArriba.replace('#3FB2F2', '#FF5D73') + '</g>';
}());

/* Emoji -> dibujo. Los que no están en la lista se siguen viendo como emoji. */
const EMOJI_ICO = {
  '⭐': 'estrella', '🌟': 'estrellaBrillante', '🚀': 'cohete', '🌙': 'luna', '🍎': 'manzana', '🐠': 'pez', '🐟': 'pez', '🦋': 'mariposa', '🎈': 'globo',
  '🍪': 'galleta', '🐥': 'patito', '🌸': 'flor', '🪨': 'roca', '🤖': 'robot', '🧑‍🚀': 'astronauta', '👩‍🚀': 'astronauta', '👨‍🚀': 'astronauta',
  '🔦': 'linterna', '🧦': 'calcetin', '🧃': 'zumo', '🍌': 'platano', '🍐': 'pera', '🍓': 'fresa', '🍊': 'naranja', '☀️': 'sol', '☀': 'sol', '🌞': 'sol',
  '☁️': 'nube', '☁': 'nube', '🐶': 'perro', '🐱': 'gato', '🟥': 'cuadrado_rojo', '🟦': 'cuadrado_azul', '🟨': 'cuadrado_amarillo', '🟩': 'cuadrado_verde', '🟪': 'cuadrado_lila',
  '🔴': 'circulo_rojo', '🔵': 'circulo_azul', '🟡': 'circulo_amarillo', '🟢': 'circulo_verde',
  '🦊': 'zorro', '🐻': 'oso', '🐼': 'panda', '🐯': 'tigre', '🐸': 'rana', '🐰': 'conejo', '🦁': 'leon', '🐨': 'koala', '🦄': 'unicornio', '🐙': 'pulpo', '🐵': 'mono', '🐧': 'pinguino',
  '💡': 'bombilla', '🎯': 'diana', '🔭': 'telescopio', '⚡': 'rayo', '🎒': 'mochila', '🧺': 'cesta', '📏': 'regla', '📦': 'caja', '⏰': 'despertador', '🛒': 'carrito',
  '⚖️': 'balanza', '⚖': 'balanza', '🗺️': 'mapa', '🗺': 'mapa', '🏗️': 'grua', '🏗': 'grua', '🛖': 'cupula', '🏠': 'casa', '🏡': 'casa', '🛡️': 'escudo', '🛡': 'escudo',
  '🛰️': 'satelite', '🛰': 'satelite', '🏙️': 'estacion', '🏙': 'estacion', '📡': 'antena', '🏆': 'trofeo', '🔤': 'letras', '✋': 'manoAbierta', '🖐️': 'manoAbierta', '👆': 'mano',
  '🫘': 'judias', '🕰️': 'reloj', '🕰': 'reloj', '🪙': 'moneda', '🥛': 'vaso', '🧭': 'brujula', '👤': 'sombra', '📋': 'portapapeles', '📒': 'libreta', '🛠️': 'herramientas', '🛠': 'herramientas',
  '🎨': 'paleta', '👑': 'corona', '🃏': 'carta', '🔰': 'cadete', '✨': 'chispas', '🎖️': 'medalla', '🎖': 'medalla', '🪐': 'saturno', '🎁': 'regalo', '🔑': 'llave', '🧰': 'cofre',
  '😴': 'dormir', '🌬️': 'viento', '🌬': 'viento', '🙂': 'sonrisa',
  '🍦': 'helado', '🧸': 'osito', '🪀': 'yoyo', '📚': 'libros', '🍩': 'donut', '🪁': 'cometa', '⚽': 'balon', '🖍️': 'cera', '🖍': 'cera', '🥥': 'coco', '🍉': 'sandia',
  '🎃': 'calabaza', '🪶': 'pluma', '🏀': 'baloncesto', '🎲': 'dado', '🧊': 'hielo', '🥫': 'lata', '🧻': 'rollo', '🔋': 'pila', '🐊': 'cocodrilo', '👂': 'oreja',
  '👧': 'nina', '🛸': 'ovni', '☄️': 'cometaEspacio', '☄': 'cometaEspacio', '⬆️': 'flechaArriba', '⬆': 'flechaArriba', '⬇️': 'flechaAbajo', '⬇': 'flechaAbajo',
  '🍕': 'pizza', '👜': 'bolso', '🍽️': 'plato', '🍽': 'plato', '✖️': 'por', '✖': 'por', '🌍': 'tierra', '🌎': 'tierra', '🦖': 'dino', '🐳': 'ballena', '👽': 'marciano',
  '🌈': 'arcoiris', '🐢': 'tortuga', '🐲': 'dragon', '🌠': 'fugaz', '🌌': 'galaxia', '🌋': 'volcan', '🔬': 'microscopio', '🧲': 'iman', '💎': 'diamante',
  '❓': 'interrogacion', '➕': 'sumar', '➖': 'restar', '➡️': 'flechaDer', '➡': 'flechaDer', '↔️': 'flechasLado', '↔': 'flechasLado', '↕️': 'flechasAlto', '↕': 'flechasAlto',
  '↩️': 'devolver', '↩': 'devolver', '🔁': 'repetir', '🔄': 'repetir', '👀': 'ojos', '🔢': 'numeros', '🔟': 'diez', '💯': 'cien', '🔍': 'lupa', '🔷': 'rombo', '🕒': 'esfera', '🕧': 'esfera',
  '📅': 'calendario', '📊': 'grafico', '🦘': 'canguro', '🧩': 'puzle', '🤔': 'pensar', '🚂': 'tren', '🚩': 'bandera', '🏁': 'meta', '🪞': 'espejo', '💶': 'billete', '👥': 'personas',
  '😋': 'rico', '💥': 'pum', '📱': 'movil', '🔊': 'altavoz', '🥇': 'oro', '🥈': 'plata', '🥉': 'bronce', '🔥': 'fuego', '📍': 'chincheta', '📭': 'buzon',
  '👕': 'camiseta', '👖': 'pantalon', '👗': 'vestido', '🧢': 'gorra', '🍇': 'uvas', '🍒': 'cerezas', '🧀': 'queso', '🥕': 'zanahoria', '🌽': 'maiz', '🥦': 'brocoli',
  '🚲': 'bici', '🚌': 'autobus', '🚒': 'bomberos', '🍳': 'sarten', '🥣': 'cuenco', '🏫': 'colegio', '🌰': 'bellota', '🌿': 'hoja', '🧒': 'nino', '🌅': 'amanecer', '🌇': 'atardecer',
  '🌕': 'lunaLlena', '🌧️': 'lluvia', '🌧': 'lluvia', '💧': 'gota', '💨': 'viento', '🌀': 'espiral', '🥶': 'frio', '🕶️': 'gafasSol', '🕶': 'gafasSol', '☂️': 'paraguas', '☂': 'paraguas',
  '🩱': 'banador', '🛁': 'banera', '💍': 'anillo', '💙': 'corazonAzul', '🤏': 'pinza', '🧽': 'esponja', '👍': 'pulgarArriba', '👎': 'pulgarAbajo',
  '🌳': 'arbol', '🚗': 'coche', '❤️': 'corazon', '❤': 'corazon', '🥚': 'huevo', '🐣': 'pollito', '🐔': 'gallina', '🌱': 'brote', '🌻': 'girasol'
};

const Iconos = {
  regex: null,
  vigilante: null,
  /* SVG de un dibujo por su nombre */
  html(id, clase) { return ICO[id] ? '<svg class="ico-d' + (clase ? ' ' + clase : '') + '" viewBox="0 0 64 64" aria-hidden="true"><use href="#i-' + id + '"></use></svg>' : ''; },
  /* SVG de un emoji (o el propio emoji si no hay dibujo) */
  de(emoji, clase) { const id = EMOJI_ICO[emoji] || EMOJI_ICO[String(emoji).replace(/️/g, '')]; return id ? this.html(id, clase) : emoji; },

  iniciar() {
    if (this.regex) return;
    const defs = '<radialGradient id="g-sombra" cx=".35" cy=".3" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2A1E5C" stop-opacity=".3"/></radialGradient>' +
      '<radialGradient id="g-agujero"><stop offset=".6" stop-color="#C98536" stop-opacity="0"/><stop offset="1" stop-color="#C98536" stop-opacity=".6"/></radialGradient>' +
      '<pattern id="g-poros" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r=".9" fill="#B5530E"/></pattern>' +
      Object.keys(ICO).map(id => '<symbol id="i-' + id + '" viewBox="0 0 64 64">' + ICO[id] + '</symbol>').join('');
    const cont = document.createElement('div');
    cont.innerHTML = '<svg id="spriteIconos" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>' + defs + '</defs></svg>';
    document.body.insertBefore(cont.firstChild, document.body.firstChild);
    const claves = Object.keys(EMOJI_ICO).sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    this.regex = new RegExp('(' + claves.join('|') + ')️?', 'g');
    this.convertir(document.body);
    if (window.MutationObserver) {
      this.vigilante = new MutationObserver(lista => {
        for (let i = 0; i < lista.length; i++) {
          const m = lista[i];
          if (m.type === 'characterData') this.convertirTexto(m.target);
          else for (let j = 0; j < m.addedNodes.length; j++) this.convertir(m.addedNodes[j]);
        }
      });
      this.vigilante.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  },

  /* Cambia los emojis conocidos de un trozo de la página por sus dibujos */
  convertir(nodo) {
    if (!nodo || !this.regex) return;
    if (nodo.nodeType === 3) { this.convertirTexto(nodo); return; }
    if (nodo.nodeType !== 1 || this.saltar(nodo)) return;
    const textos = [];
    const w = document.createTreeWalker(nodo, NodeFilter.SHOW_TEXT, null);
    let t;
    while ((t = w.nextNode())) if (/[←-⯿\uD83C-\uD83E]/.test(t.data)) textos.push(t);
    textos.forEach(x => this.convertirTexto(x));
  },
  saltar(el) {
    for (let e = el; e && e !== document.body; e = e.parentNode) {
      if (e.nodeType !== 1) continue;
      const n = e.nodeName;
      if (n === 'SCRIPT' || n === 'STYLE' || n === 'TEXTAREA' || n === 'INPUT' || n === 'OPTION' || n === 'svg' || n === 'SVG' || n === 'text') return true;
      if (e.classList && e.classList.contains('sin-dibujos')) return true;
    }
    return false;
  },
  convertirTexto(t) {
    const padre = t.parentNode;
    if (!padre || !t.data || this.saltar(padre)) return;
    this.regex.lastIndex = 0;
    if (!this.regex.test(t.data)) return;
    this.regex.lastIndex = 0;
    const html = escapar(t.data).replace(this.regex, (m, e) => this.de(e));
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    padre.replaceChild(tpl.content, t);
  }
};
