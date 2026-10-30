# -*- coding: utf-8 -*-
"""
Frases de Pipo (versión 3).
Cada frase tiene un identificador que usa el juego y el texto que se graba con voz natural.
Ejecutar este archivo genera fuente/js/00-frases.js (const FRASES = {...}).
Reglas: frases cortas, una idea cada vez, números escritos con letras.
"""
import json, os, collections

F = collections.OrderedDict()

def f(clave, texto):
    assert clave not in F, 'frase repetida: ' + clave
    F[clave] = texto

# ---------------------------------------------------------------- números
UNIDADES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
            'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
            'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']
DECENAS = {30: 'treinta', 40: 'cuarenta', 50: 'cincuenta', 60: 'sesenta', 70: 'setenta', 80: 'ochenta', 90: 'noventa'}

def palabra(n):
    if n < 30:
        return UNIDADES[n]
    if n == 100:
        return 'cien'
    d, u = (n // 10) * 10, n % 10
    return DECENAS[d] + ('' if u == 0 else ' y ' + UNIDADES[u])

def cap(t):
    return t[0].upper() + t[1:]

for n in range(0, 101):
    f('n%d' % n, cap(palabra(n)) + '.')
f('un', 'un')
f('una', 'una')
# Centenas (versión 4, nivel de 7 a 8 años): "Trescientos." y "trescientos" para componer 342 = trescientos + cuarenta y dos
CIENTOS = {100: 'ciento', 200: 'doscientos', 300: 'trescientos', 400: 'cuatrocientos', 500: 'quinientos',
           600: 'seiscientos', 700: 'setecientos', 800: 'ochocientos', 900: 'novecientos'}
for c, t in CIENTOS.items():
    if c > 100:
        f('n%d' % c, cap(t) + '.')
    f('cc%d' % c, t)
f('n1000', 'Mil.')

# Toca el número (frase completa hasta 20; a partir de ahí se compone "Toca el" + número)
for n in range(0, 21):
    f('toca_n%d' % n, 'Toca el %s.' % palabra(n))
f('toca_el', 'Toca el')
for n in range(1, 11):
    f('donde_n%d' % n, '¿Dónde hay %s?' % palabra(n))
for n in range(1, 11):
    f('dame_%d' % n, 'Dame una galleta.' if n == 1 else 'Dame %s galletas.' % palabra(n))
for n in range(1, 6):
    f('revienta_%d' % n, 'Revienta un globo.' if n == 1 else 'Revienta %s globos.' % palabra(n))

# ---------------------------------------------------------------- objetos
OBJ = [  # id, singular, plural, género, pregunta
    ('estrella', 'estrella', 'estrellas', 'f'), ('cohete', 'cohete', 'cohetes', 'm'), ('luna', 'luna', 'lunas', 'f'),
    ('manzana', 'manzana', 'manzanas', 'f'), ('pez', 'pez', 'peces', 'm'), ('mariposa', 'mariposa', 'mariposas', 'f'),
    ('globo', 'globo', 'globos', 'm'), ('galleta', 'galleta', 'galletas', 'f'), ('patito', 'patito', 'patitos', 'm'),
    ('flor', 'flor', 'flores', 'f'), ('roca', 'roca', 'rocas', 'f'), ('robot', 'robot', 'robots', 'm'),
    ('astronauta', 'astronauta', 'astronautas', 'm'), ('linterna', 'linterna', 'linternas', 'f'),
    ('calcetin', 'calcetín', 'calcetines', 'm'), ('zumo', 'zumo', 'zumos', 'm'),
]
for oid, sing, plur, g in OBJ:
    f('o_%s_s' % oid, sing + '.')
    f('o_%s_p' % oid, plur + '.')
    f('cuantos_%s' % oid, ('¿Cuántas %s hay?' if g == 'f' else '¿Cuántos %s hay?') % plur)

f('tip_toca_f', 'Tócalas para contar.')
f('tip_toca_m', 'Tócalos para contar.')

# ---------------------------------------------------------------- palabras para componer
f('mas', 'más')
f('menos', 'menos')
f('son', 'son')
f('es', 'es')
f('y', 'y')
f('mas_fin', 'más.')
f('igual_a', 'es igual a')
f('mayor_que', 'es mayor que')
f('menor_que', 'es menor que')
f('cuanto_es', '¿Cuánto es?')
f('en_total', 'En total:')
f('euro', 'euro.')
f('euros', 'euros.')
f('kilos', 'kilos.')
f('por', 'por')
f('grupos_de', 'grupos de')
f('grupo_de', 'grupo de')

# ---------------------------------------------------------------- bienvenida, perfiles y mapa
f('hola_pipo', '¡Hola! Soy Pipo.')
f('hola_otra_vez', '¡Hola otra vez!')
f('hola', '¡Hola!')
f('vamos_jugar', '¡Vamos a jugar!')
f('quien_juega', '¿Quién va a jugar?')
f('nuevo_explorador', '¡Alguien nuevo en la nave!')
f('elige_cara', 'Elige tu animal.')
f('cuantos_anos', '¿Cuántos años tienes?')
f('elige_voz', '¿Con qué voz hablo?')
f('prueba_voz', '¡Hola! Así hablo yo.')
for a in ['Zorrito', 'Osito', 'Pandita', 'Tigrito', 'Ranita', 'Conejito', 'Leoncito', 'Koala', 'Unicornio', 'Pulpito', 'Monito', 'Pingüinito']:
    clave = a.lower().replace('ü', 'u')
    f('hola_' + clave, '¡Hola, %s!' % a)
f('prueba_intro', 'Antes de despegar, un juego para ver qué sabes.')
f('prueba_fin', '¡Muy bien! Ya sé por dónde empezamos.')
f('mapa_intro', 'Este es el sistema solar. Cada planeta es una aventura.')
f('toca_planeta', 'Toca el planeta que brilla.')
f('planeta_duerme', 'Ese planeta está dormido.')
f('prueba_este', 'Prueba este.')
f('planeta_nuevo', '¡Un planeta nuevo!')
f('toca_brilla', 'Toca lo que brilla.')
f('nivel_cerrado', 'Primero, termina el que brilla.')
MUNDO_LLEGADA = {
    'tierra': '¡Empezamos en la Tierra, nuestra casa!', 'luna': '¡Ya estamos en la Luna!', 'marte': '¡Ya estamos en Marte!',
    'venus': '¡Ya estamos en Venus!', 'mercurio': '¡Ya estamos en Mercurio!', 'jupiter': '¡Ya estamos en Júpiter!',
    'saturno': '¡Ya estamos en Saturno!', 'urano': '¡Ya estamos en Urano!', 'neptuno': '¡Ya estamos en Neptuno!',
    'sol': '¡Ya estamos cerca del Sol!'}
for k, v in MUNDO_LLEGADA.items():
    f('mundo_' + k, v)

# ---------------------------------------------------------------- tipos de nivel, misiones y grandes misiones
f('nivel_aprende', '¡Vamos a aprender algo nuevo!')
f('nivel_practica', '¡A practicar!')
f('nivel_descubre', '¡Vamos a descubrir este planeta!')
f('nivel_reto', '¡Un reto! Esta vez, con menos ayuda.')
f('nivel_repaso', '¡Repasamos un poco de todo!')
MISIONES = {
    'mochila': 'Preparamos la mochila del astronauta.', 'rocas': 'Recogemos rocas lunares.', 'robot': 'Ayudamos al robot explorador.',
    'cajas': 'Guardamos las cosas en cajas de diez.', 'horario': 'Hacemos el horario de la nave.', 'tienda': '¡Vamos a la tienda espacial!',
    'comida': 'Repartimos la comida de la tripulación.', 'carga': 'Cargamos el cohete sin pasarnos de peso.',
    'mapa': 'Navegamos con el mapa de las estrellas.', 'viaje': 'Preparamos el gran viaje hacia el Sol.'}
for k, v in MISIONES.items():
    f('mision_' + k, v)
PROYECTOS = {
    'tierra': '¡Gran misión! Construimos la base de lanzamiento.', 'luna': '¡Gran misión! Construimos una base en la Luna.',
    'marte': '¡Gran misión! Construimos una casa en Marte.', 'venus': '¡Gran misión! Arreglamos el globo explorador de Venus.',
    'mercurio': '¡Gran misión! Montamos el escudo contra el calor.', 'jupiter': '¡Gran misión! Rescatamos una sonda perdida.',
    'saturno': '¡Gran misión! Construimos una estación junto a los anillos.', 'urano': '¡Gran misión! Arreglamos el telescopio gigante.',
    'neptuno': '¡Gran misión! Rescatamos un satélite perdido.', 'sol': '¡El gran desafío final! Un poco de todo lo que has aprendido.'}
for k, v in PROYECTOS.items():
    f('proyecto_' + k, v)
f('pieza_lista', '¡Una pieza más!')
f('proyecto_listo', '¡Lo hemos construido!')
CASA = {
    'tierra': 'Reto en casa: busca cinco cosas redondas.',
    'luna': 'Reto en casa: esta noche, mira la Luna con un adulto. ¿Qué forma tiene?',
    'marte': 'Reto en casa: mide tu cama con palmos.',
    'venus': 'Reto en casa: haz montones de diez con garbanzos o pinzas.',
    'mercurio': 'Reto en casa: mira un reloj con un adulto a la hora de cenar.',
    'jupiter': 'Reto en casa: juega a las tiendas con monedas de verdad.',
    'saturno': 'Reto en casa: reparte la merienda en partes iguales.',
    'urano': 'Reto en casa: llena vasos con agua. ¿Cuál tiene más?',
    'neptuno': 'Reto en casa: guía a un adulto con órdenes: adelante, izquierda, derecha.',
    'sol': 'Reto en casa: sal con un adulto y mira tu sombra. ¡Nunca mires al Sol!'}
for k, v in CASA.items():
    f('casa_' + k, v)
f('casa_adulto', 'Cuando lo hagas, un adulto mantiene pulsado el botón verde.')
f('casa_hecho', '¡Reto en casa conseguido!')

# ---------------------------------------------------------------- premios, colección y nave
f('nivel_hecho', '¡Nivel completado!')
f('estrellas_1', '¡Una estrella!')
f('estrellas_2', '¡Dos estrellas!')
f('estrellas_3', '¡Tres estrellas! ¡Perfecto!')
f('despegue', '¡Tres, dos, uno… despegamos!')
f('mundo_completado', '¡Planeta completado!')
f('sistema_completado', '¡Has recorrido todo el sistema solar! ¡Eres una leyenda del espacio!')
f('pieza_nave', '¡Una pieza nueva para la nave!')
f('nuevo_rango', '¡Subes de rango!')
for r, nombre in [('astronauta', 'astronauta'), ('piloto', 'piloto'), ('navegante', 'navegante'), ('comandante', 'comandante'), ('leyenda', 'leyenda del espacio')]:
    f('rango_' + r, '¡Ahora eres %s!' % nombre)
f('carta_nueva', '¡Una carta nueva para tu álbum!')
f('pegatina_nueva', '¡Una pegatina nueva!')
f('toma_estrellas', '¡Y estrellas para ti!')
f('medalla', '¡Una medalla nueva!')
f('toca_regalo', 'Toca el regalo.')
f('album', 'Este es tu álbum. Toca una carta para escucharla.')
f('album_secreto', 'Esa carta todavía es un secreto.')
f('pegatinas', 'Estas son tus pegatinas.')
f('taller', 'Aquí puedes vestir a Pipo y pintar tu nave.')
f('nave_mira', 'Esta es tu nave. Cada planeta te da una pieza.')
f('que_guapo', '¡Qué guapo estoy!')
f('me_encanta', '¡Me encanta!')
f('mas_estrellas', 'Necesitas más estrellas.')
f('juega_ganar', 'Juega para ganar más.')

# ---------------------------------------------------------------- misiones del día, cofre, asteroide
f('md_titulo', 'Misiones de hoy.')
f('md_hecha', '¡Misión del día cumplida!')
f('md_todas', '¡Todas las misiones de hoy! Una llave para el cofre.')
f('md_nivel1', 'Termina un nivel.')
f('md_niveles2', 'Termina dos niveles.')
f('md_primera5', 'Acierta cinco a la primera.')
f('md_carta', 'Escucha una carta del álbum.')
f('md_tres', 'Consigue tres estrellas en un nivel.')
f('md_repaso', 'Repite un nivel que ya hiciste.')
f('cofre_listo', '¡El cofre de la semana está listo! Tócalo.')
f('cofre_falta', 'Consigue llaves para abrir el cofre.')
f('asteroide', '¡Un asteroide de estrellas! ¡Tócalo!')
f('regalo_estrellas', '¡Te regalo tres estrellas!')
f('dia_nuevo', '¡Qué bien que vuelves!')

# ---------------------------------------------------------------- pausa, descanso, calma
f('pausa', 'Pausa.')
f('seguimos', '¡Seguimos!')
f('descanso1', '¡Qué bien has jugado!')
f('descanso2', '¿Descansamos un poquito?')
f('tiempo_fin', 'Por hoy hemos jugado mucho. ¡Hasta mañana!')
f('hasta_luego', '¡Hasta luego!')
f('respira_propuesta', '¿Respiramos juntos un momento?')
f('respira_in', 'Toma aire despacito…')
f('respira_out', '…y suéltalo poco a poco.')
f('respira_bien', '¡Muy bien! Ahora vamos con calma.')
f('mas_facil', 'Vamos con algo un poco más fácil.')
f('jiji', '¡Jijijí! ¡Cosquillas!')

# ---------------------------------------------------------------- ánimos y ayudas
for k, v in [('si', '¡Sí!'), ('muy_bien', '¡Muy bien!'), ('genial', '¡Genial!'), ('bien_contado', '¡Bien contado!'),
             ('te_fijaste', '¡Qué bien te has fijado!'), ('lo_conseguiste', '¡Lo has conseguido!'), ('eso_es', '¡Eso es!'),
             ('bravo', '¡Bravo!'), ('fenomenal', '¡Fenomenal!'), ('que_bien_piensas', '¡Qué bien lo has pensado!'),
             ('increible', '¡Increíble!'), ('racha3', '¡Tres seguidas! ¡Sigue así!'), ('racha5', '¡Cinco seguidas! ¡Eres una estrella!'),
             ('asi_se_aprende', '¡Eso es! Así se aprende.'),
             ('casi', '¡Casi!'), ('prueba_otra', 'Prueba otra vez.'), ('fijate', 'Fíjate bien.'), ('escucha_otra', 'Escucha otra vez.'),
             ('no_pasa_nada', 'No pasa nada. Equivocarse ayuda a aprender.'),
             ('juntos', 'Vamos a contarlo juntos.'), ('ultimo_numero', 'El último número dice cuántos hay.'),
             ('mira', '¡Mira!'), ('mira_como', 'Mira cómo se hace.'), ('es_este', '¡Es este! Tócalo.'), ('ahora_tu', 'Ahora, tú.'),
             ('otra_parecida', 'Ahora, una parecida.'), ('reto', '¡Ahora, un pequeño reto!'), ('dilo_tu', '¡Dilo tú!'),
             ('toca_verde', 'Cuando acabes, toca el botón verde.'), ('cual', '¿Cuál?')]:
    f(k, v)

# ---------------------------------------------------------------- Tierra
f('dame_listo', 'Luego, toca el botón verde.')
f('dame_demasiadas', '¡Uy! Son demasiadas.')
f('dame_faltan', 'Faltan algunas.')
f('nam', '¡Ñam, ñam!')
f('dame_quita', 'Toca una para quitarla.')
f('mete', 'Mete')
f('en_mochila', 'en la mochila.')
f('mochila_lista', '¡Mochila lista!')
f('mira_rapido', '¡Mira rápido!')
f('cuantos_habia', '¿Cuántos había?')
f('cuantos_dedos', '¿Cuántos dedos hay?')
f('donde_mas', '¿Dónde hay más?')
f('donde_menos', '¿Dónde hay menos?')
f('si_igual', 'Si hay igual, toca el igual.')
f('cuenta_lados', 'Contamos cada lado.')
f('aqui_hay', 'Aquí hay')
f('son_iguales', 'Hay los mismos. Son iguales.')
f('hacemos_parejas', 'Hacemos parejas, uno con uno.')
FORMAS_ES = [('circulo', 'el círculo', 'todos los círculos'), ('cuadrado', 'el cuadrado', 'todos los cuadrados'),
             ('triangulo', 'el triángulo', 'todos los triángulos'), ('rectangulo', 'el rectángulo', 'todos los rectángulos'),
             ('estrella', 'la estrella', 'todas las estrellas'), ('corazon', 'el corazón', 'todos los corazones'),
             ('rombo', 'el rombo', 'todos los rombos'), ('ovalo', 'el óvalo', 'todos los óvalos')]
for fid, uno, todos in FORMAS_ES:
    f('toca_' + fid, 'Toca %s.' % uno)
    f('busca_' + fid, 'Busca %s.' % todos)
f('mira_forma', '¡Mira! Es así.')
f('lados_triangulo', 'El triángulo tiene tres lados.')
f('lados_cuadrado', 'El cuadrado tiene cuatro lados iguales.')
f('lados_rectangulo', 'El rectángulo tiene dos lados largos y dos cortos.')
f('circulo_redondo', 'El círculo es redondo y no tiene esquinas.')

# ---------------------------------------------------------------- Luna
f('cuantos_total', '¿Cuántos hay en total?')
f('caja_diez', 'Esta caja tiene diez.')
f('seguimos_diez', 'Seguimos desde el diez.')
f('junta', 'Juntamos los dos grupos.')
f('junta_rocas', 'Juntamos las rocas de las dos cestas.')
f('cuantos_ahora', '¿Cuántos hay ahora?')
f('cuantas_rocas_ahora', '¿Cuántas rocas hay ahora?')
f('faltan_llenar', '¿Cuántos faltan para llenarlo?')
f('llegar_diez', '¿Cuántos faltan para llegar a diez?')
f('que_va_despues', '¿Qué va después?')
f('que_falta_serie', '¿Qué dibujo falta?')

# ---------------------------------------------------------------- Marte
f('cuantos_quedan', '¿Cuántos quedan?')
f('se_van_robots', 'Algunos robots se van a explorar.')
f('que_falta', '¿Qué número falta?')
f('cuenta_atras', '¡Cuenta atrás!')
f('va_antes', '¿Qué número va justo antes?')
f('va_despues', '¿Qué número va justo después?')
f('cuantos_cubos', '¿Cuántos cubos mide?')
f('contamos_cubos', 'Contamos los cubos.')
f('toca_largo', 'Toca el más largo.')
f('toca_corto', 'Toca el más corto.')
f('empieza_igual', 'Fíjate dónde empieza y dónde acaba cada uno.')

# ---------------------------------------------------------------- Venus
f('barra_diez', 'Cada barra tiene diez.')
f('de_diez', 'Contamos de diez en diez.')
f('y_sueltos', 'Y ahora, los sueltos.')
f('haz_numero', 'Haz el número')
f('usa_barras', 'Usa barras de diez y cubos sueltos.')
f('te_pasas', 'Te has pasado. Quita alguno.')
f('falta_poco', 'Aún falta. Pon más.')
f('de_dos', 'Contamos de dos en dos.')
f('de_cinco', 'Contamos de cinco en cinco.')
f('par_o_impar', '¿Es par o impar?')
f('es_par', 'Todos tienen pareja: es par.')
f('es_impar', 'Uno se queda sin pareja: es impar.')

# ---------------------------------------------------------------- Mercurio
f('doble_q', '¿Cuántas hay en las dos alas?')
f('doble_es', 'El doble es lo mismo dos veces.')
f('y_uno_mas', 'y uno más:')
f('elige_dos', 'Elige dos números que sumen')
f('faltan_para', '¿Cuántos faltan para')
f('hay_mas_formas', '¡Hay más de una forma de hacerlo!')
f('hacemos_diez', 'Primero llenamos el diez.')
f('saltamos_atras', 'Saltamos hacia atrás.')
for h in range(1, 13):
    nombre = 'la una' if h == 1 else 'las ' + palabra(h)
    f('h%d_00' % h, nombre + ' en punto.')
    f('h%d_30' % h, nombre + ' y media.')
f('son_las', 'Son')
f('es_la', 'Es')
f('que_hora', '¿Qué hora es?')
f('toca_reloj', 'Toca el reloj que marca')
f('aguja_corta', 'La aguja corta dice la hora.')
f('aguja_arriba', 'Si la aguja larga mira arriba, es en punto.')
f('aguja_abajo', 'Si la aguja larga mira abajo, es y media.')
for d in ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']:
    f('d_' + d.replace('é', 'e').replace('á', 'a'), cap(d) + '.')
f('hoy_es', 'Hoy es')
f('manana_q', '¿Qué día será mañana?')
f('ayer_q', '¿Qué día fue ayer?')
f('manana_sera', 'Mañana será')
f('ayer_fue', 'Ayer fue')
f('semana_siete', 'La semana tiene siete días.')
f('ordena', 'Toca los dibujos en orden. ¿Qué pasa primero?')
f('primero', 'Primero.')
f('despues', 'Después.')
f('al_final', 'Al final.')

# ---------------------------------------------------------------- Júpiter
f('escribe_numero', 'Escribe el número')
f('que_signo', '¿Qué signo va en medio?')
f('cocodrilo', 'El cocodrilo siempre abre la boca hacia el número más grande.')
f('cuantos_euros', '¿Cuántos euros hay?')
f('cuesta', 'Cuesta')
f('paga_justo', 'Paga justo lo que cuesta.')
f('falta_dinero', 'Falta dinero.')
f('sobra_dinero', 'Te has pasado. Quita alguna moneda.')
f('pipo_tiene', 'Pipo tiene')
f('le_dan', 'Le dan')
f('regala', 'Regala')
f('lia_tiene', 'Lía tiene')
for oid, sing, plur, g in OBJ:
    if oid in ('estrella', 'cohete', 'galleta', 'roca', 'globo'):
        a = 'as' if g == 'f' else 'os'
        f('ahora_tiene_' + oid, '¿Cuánt%s %s tiene ahora?' % (a, plur))
        f('le_quedan_' + oid, '¿Cuánt%s %s le quedan?' % (a, plur))
        f('mas_tiene_' + oid, '¿Cuánt%s %s más tiene Pipo?' % (a, plur))

# ---------------------------------------------------------------- Saturno
f('cuanto_mitad', '¿Cuánto es la mitad?')
f('reparte_dos', 'Repartimos entre dos, igual para cada uno.')
f('la_mitad_de', 'La mitad de')
f('reparte', 'Reparte las galletas entre los astronautas.')
f('una_cada', 'Una para cada uno, por turnos.')
f('cuantas_cada', '¿Cuántas le tocan a cada uno?')
f('todos_igual', '¿Todos tienen lo mismo? Mira bien.')
for cid, txt in [('esfera', 'Toca la esfera.'), ('cubo', 'Toca el cubo.'), ('cilindro', 'Toca el cilindro.'), ('cono', 'Toca el cono.'), ('piramide', 'Toca la pirámide.')]:
    f('toca_' + cid, txt)
f('que_forma', '¿Qué forma tiene?')
f('esfera_es', 'La esfera es redonda por todas partes, como una pelota.')
f('cubo_es', 'El cubo tiene seis caras cuadradas, como un dado.')
f('cilindro_es', 'El cilindro es como una lata.')
f('cono_es', 'El cono es como un cucurucho de helado.')
f('piramide_es', 'La pirámide tiene caras de triángulo.')
f('simetria_q', '¿Qué mitad completa el dibujo?')
f('como_espejo', 'Tiene que ser igual, como en un espejo.')

# ---------------------------------------------------------------- Urano
f('primero_decenas', 'Primero las decenas, después las unidades.')
f('pagas_con', 'Pagas con')
f('cuanto_devuelven', '¿Cuánto te devuelven?')
f('contamos_desde', 'Contamos desde el precio hasta lo que pagas.')
f('de_que_mas', '¿De qué hay más?')
f('de_que_menos', '¿De qué hay menos?')
f('cuantos_mas_barra', '¿Cuántos más hay en la barra más alta que en la más baja?')
f('pesa_mas', '¿Qué pesa más?')
f('pesa_menos', '¿Qué pesa menos?')
f('baja_pesa', 'El lado que baja es el que pesa más.')
f('mas_pesado', '¿Cuál es el más pesado de todos?')
f('cuantos_cubos_pesa', '¿Cuántos cubos pesa?')
f('equilibrio', 'Si la balanza está recta, pesan lo mismo.')
f('mas_agua', '¿Cuál tiene más agua?')
f('menos_agua', '¿Cuál tiene menos agua?')
f('cuantos_vasos', '¿Cuántos vasos llenan la jarra?')
f('aguanta', 'El cohete aguanta')
f('elige_cajas', 'Elige cajas que sumen justo eso.')
f('pesa_demasiado', '¡Uy! Pesa demasiado.')
f('cabe_mas', 'Aún cabe más.')

# ---------------------------------------------------------------- Neptuno
f('cuenta_grupos', 'Contamos de grupo en grupo.')
f('en_nave_hay', 'En la nave hay')
f('suben', 'Suben')
f('bajan', 'Bajan')
f('gana', 'Gana')
f('gasta', 'Gasta')
f('cual_sobra', '¿Cuál no va con los demás?')
f('este_no_va', 'Este no va con los demás.')
f('sudoku_regla', 'En cada fila y en cada columna, cada dibujo sale una vez.')
f('cual_falta', '¿Cuál falta aquí?')
f('lleva_robot', 'Lleva al robot hasta la bandera.')
f('toca_flechas', 'Toca las flechas y luego el botón verde.')
f('arriba', 'Arriba.')
f('abajo', 'Abajo.')
f('izquierda', 'Izquierda.')
f('derecha', 'Derecha.')
f('choca', '¡Uy! Hay una roca.')
f('no_llega', 'Aún no ha llegado. Añade más flechas.')
f('llego', '¡Ha llegado!')

# ---------------------------------------------------------------- Sol: planetas y rima
for pid, nombre in [('mercurio', 'Mercurio.'), ('venus', 'Venus.'), ('tierra', 'La Tierra.'), ('marte', 'Marte.'), ('jupiter', 'Júpiter.'),
                    ('saturno', 'Saturno.'), ('urano', 'Urano.'), ('neptuno', 'Neptuno.'), ('sol', 'El Sol.'), ('luna', 'La Luna.'), ('pluton', 'Plutón.')]:
    f('p_' + pid, nombre)
f('cual_cerca_sol', '¿Qué planeta está más cerca del Sol?')
f('cual_lejos_sol', '¿Qué planeta está más lejos del Sol?')
f('ordena_planetas', 'Toca los planetas en orden, empezando por el más cercano al Sol.')
f('cual_grande', '¿Qué planeta es más grande?')
f('cual_pequeno', '¿Qué planeta es más pequeño?')
f('ordena_tamano', 'Toca los planetas del más grande al más pequeño.')
f('rima_intro', 'Escucha la rima de los planetas.')
f('rima_1', 'Mercurio está cerquita del Sol; Venus brilla y guarda el calor.')
f('rima_2', 'La Tierra es mi casa, mi hogar; Marte es rojo y lo vamos a explorar.')
f('rima_3', 'Júpiter es el gigante mayor; Saturno lleva anillos alrededor.')
f('rima_4', 'Urano gira tumbado de lado, y Neptuno, el último, azul y helado.')

# ---------------------------------------------------------------- ciencia: datos de cada planeta (solo datos aprobados)
HECHOS = collections.OrderedDict([
    ('tierra_1', 'La Tierra es nuestro hogar. Es el único planeta con vida que conocemos.'),
    ('tierra_2', 'La mayor parte de la Tierra está cubierta de agua.'),
    ('tierra_3', 'La Tierra gira sobre sí misma. Por eso hay día y noche.'),
    ('tierra_4', 'La Tierra tarda un año en dar una vuelta alrededor del Sol. Ese camino se llama órbita.'),
    ('astronauta', 'Los astronautas viajan al espacio. Necesitan aire, agua, comida y un traje espacial.'),
    ('luna_1', 'La Luna no es un planeta: es el satélite de la Tierra. Da vueltas a nuestro alrededor.'),
    ('luna_2', 'Parece que la Luna cambia de forma: llena, menguante, nueva y creciente.'),
    ('luna_3', 'En mil novecientos sesenta y nueve, unos astronautas llegaron a la Luna en un cohete.'),
    ('luna_4', 'En la Luna hay menos gravedad, la fuerza que nos sujeta al suelo. ¡Allí se salta más alto!'),
    ('marte_1', 'Marte es el planeta rojo. Su suelo tiene un polvo rojizo.'),
    ('marte_2', 'En Marte está el volcán más grande del sistema solar.'),
    ('marte_3', 'Unos robots exploradores recorren Marte y nos mandan fotos.'),
    ('marte_4', 'Marte va justo después de la Tierra, contando desde el Sol.'),
    ('venus_1', 'Venus es el planeta más caliente, porque sus nubes espesas guardan el calor.'),
    ('venus_2', 'Venus se ve muy brillante en el cielo al amanecer o al anochecer.'),
    ('venus_3', 'Venus es el segundo planeta desde el Sol, entre Mercurio y la Tierra.'),
    ('mercurio_1', 'Mercurio es el planeta más cercano al Sol.'),
    ('mercurio_2', 'Mercurio es el planeta más pequeño del sistema solar.'),
    ('mercurio_3', 'Mercurio da la vuelta al Sol muy rápido.'),
    ('orbita', 'Una órbita es el camino que sigue un planeta alrededor del Sol.'),
    ('jupiter_1', 'Júpiter es el planeta más grande. Es un gigante de gas.'),
    ('jupiter_2', 'Júpiter tiene una tormenta enorme, la Gran Mancha Roja. ¡Es más grande que la Tierra!'),
    ('jupiter_3', 'Júpiter es el primero de los cuatro planetas gigantes.'),
    ('saturno_1', 'Saturno es famoso por sus anillos. Están hechos de hielo y roca.'),
    ('saturno_2', 'Saturno es muy grande, pero tan ligero que flotaría en una bañera gigante.'),
    ('saturno_3', 'Saturno es el segundo planeta más grande, después de Júpiter.'),
    ('urano_1', 'Urano gira tumbado, de lado, como una pelota que rueda.'),
    ('urano_2', 'Urano es azul verdoso y muy, muy frío.'),
    ('gigantes', 'Los cuatro planetas cercanos al Sol son rocosos. Los cuatro lejanos son gigantes.'),
    ('neptuno_1', 'Neptuno es el planeta más lejano del Sol.'),
    ('neptuno_2', 'Neptuno es azul y tiene los vientos más fuertes del sistema solar.'),
    ('pluton', 'Más allá de Neptuno está Plutón. Es un planeta enano.'),
    ('sol_1', 'El Sol es una estrella. Nos da luz y calor.'),
    ('sol_2', 'Todos los planetas dan vueltas alrededor del Sol.'),
    ('sol_3', 'Nunca hay que mirar el Sol directamente: puede dañar los ojos.'),
    ('estrellas', 'Las estrellas del cielo son soles muy, muy lejanos.'),
])
for k, v in HECHOS.items():
    f('f_' + k, v)

PREGUNTAS = collections.OrderedDict([
    ('tierra_vivimos', '¿En qué planeta vivimos?'),
    ('tierra_agua', 'La mayor parte de la Tierra está cubierta de agua.'),
    ('tierra_apaga', 'Hay día y noche porque el Sol se apaga.'),
    ('tierra_traje', '¿Qué necesita un astronauta en el espacio?'),
    ('tierra_ano', 'La Tierra tarda un año en dar una vuelta al Sol.'),
    ('luna_planeta', 'La Luna es un planeta.'),
    ('luna_llena', 'Toca la Luna llena.'),
    ('luna_cohete', '¿En qué llegaron los astronautas a la Luna?'),
    ('luna_salto', 'En la Luna se salta más alto.'),
    ('luna_satelite', '¿Cuál es el satélite de la Tierra?'),
    ('marte_rojo', '¿Cuál es el planeta rojo?'),
    ('marte_volcan', 'En Marte está el volcán más grande del sistema solar.'),
    ('marte_quien', '¿Quién recorre Marte ahora?'),
    ('marte_orden', 'Marte va justo después de la Tierra.'),
    ('venus_caliente', 'Venus es el planeta más caliente.'),
    ('venus_mercurio', 'Mercurio es más caliente que Venus.'),
    ('venus_brilla', 'Venus brilla en el cielo al amanecer o al anochecer.'),
    ('venus_entre', '¿Qué planeta está entre Mercurio y la Tierra?'),
    ('mercurio_cerca', '¿Qué planeta está más cerca del Sol?'),
    ('mercurio_grande', 'Mercurio es el planeta más grande.'),
    ('mercurio_rapido', 'Mercurio da la vuelta al Sol muy rápido.'),
    ('mercurio_pequeno', '¿Cuál es el planeta más pequeño?'),
    ('jupiter_grande', '¿Cuál es el planeta más grande?'),
    ('jupiter_tormenta', 'La Gran Mancha Roja es una tormenta.'),
    ('jupiter_roca', 'Júpiter es un planeta pequeño de roca.'),
    ('jupiter_mancha', '¿Qué planeta tiene la Gran Mancha Roja?'),
    ('saturno_anillos', '¿Qué planeta es famoso por sus anillos?'),
    ('saturno_hielo', 'Los anillos de Saturno son de hielo y roca.'),
    ('saturno_flota', 'Saturno flotaría en una bañera gigante.'),
    ('saturno_jupiter', 'Saturno es más grande que Júpiter.'),
    ('urano_gira', '¿Cómo gira Urano?'),
    ('urano_color', '¿Qué planeta es azul verdoso?'),
    ('urano_calor', 'Urano es muy caliente.'),
    ('urano_lejos', 'Urano está más lejos del Sol que Saturno.'),
    ('neptuno_lejos', '¿Qué planeta está más lejos del Sol?'),
    ('neptuno_viento', 'En Neptuno hay vientos muy fuertes.'),
    ('neptuno_pluton', 'Plutón es un planeta enano.'),
    ('neptuno_rojo', 'Neptuno es rojo.'),
    ('sol_estrella', 'El Sol es una estrella.'),
    ('sol_mirar', 'Se puede mirar el Sol directamente.'),
    ('sol_luz', '¿Qué nos da luz y calor?'),
    ('sol_vueltas', 'La Tierra da vueltas alrededor del Sol.'),
])
for k, v in PREGUNTAS.items():
    f('q_' + k, v)
f('verdad_o_no', '¿Es verdad?')
f('es_verdad', '¡Es verdad!')
f('no_es_verdad', 'No es verdad.')
f('escucha_dato', 'Escucha con atención.')
f('ahora_preguntas', 'Ahora, unas preguntas de explorador.')
f('toca_seguir', 'Toca la flecha para seguir.')

# ---------------------------------------------------------------- palabras del explorador
f('palabras_intro', '¡Palabras del explorador! Escucha y toca la palabra.')
f('toca_palabra', 'Toca la palabra:')
for w, t in [('sol', 'Sol.'), ('luna', 'Luna.'), ('nave', 'Nave.'), ('marte', 'Marte.'), ('venus', 'Venus.'), ('robot', 'Robot.'),
             ('tierra', 'Tierra.'), ('cohete', 'Cohete.'), ('cometa', 'Cometa.'), ('planeta', 'Planeta.'), ('estrella', 'Estrella.'),
             ('saturno', 'Saturno.'), ('orbita', 'Órbita.'), ('satelite', 'Satélite.'), ('gravedad', 'Gravedad.'),
             ('astronauta', 'Astronauta.'), ('jupiter', 'Júpiter.'), ('neptuno', 'Neptuno.')]:
    f('w_' + w, t)

# ================================================================ VERSIÓN 4
# ---------------------------------------------------------------- niveles por edad
f('elige_nivel', 'Elige tu nivel.')
f('nivel_56', 'De cinco a seis años.')
f('nivel_67', 'De seis a siete años.')
f('nivel_78', 'De siete a ocho años.')
f('a_jugar', '¡A jugar!')
f('mision_provisiones', 'Preparamos las provisiones del viaje.')
f('mision_rocas100', 'Contamos rocas lunares de cien en cien.')
f('mision_revision', 'Revisamos la carga de la nave.')

# ---------------------------------------------------------------- números hasta mil
f('placa_cien', 'Cada placa tiene cien.')
f('de_cien', 'Contamos de cien en cien.')
f('que_numero_forman', '¿Qué número forman?')
f('orden_cifras', 'Primero las centenas, luego las decenas y al final las unidades.')
f('mira_centenas', 'Primero miramos las centenas. Si son iguales, miramos las decenas.')
f('mira_saltos', 'Mira cuánto salta cada vez.')
for k in [2, 3, 4, 5, 10, 20, 50, 100]:
    f('sube_%d' % k, 'Salta de %s en %s.' % (palabra(k), palabra(k)))
    f('baja_%d' % k, 'Baja de %s en %s.' % (palabra(k), palabra(k)))

# ---------------------------------------------------------------- sumar y restar llevando
f('sumamos_unidades', 'Primero sumamos las unidades.')
f('diez_unidades', 'Diez unidades hacen una decena.')
f('nos_llevamos', 'Nos llevamos una a las decenas.')
f('ahora_decenas', 'Ahora sumamos las decenas.')
f('diez_decenas', 'Diez decenas hacen una centena.')
f('restamos_unidades', 'Primero restamos las unidades.')
f('no_hay_bastantes', 'No hay bastantes unidades.')
f('rompemos_decena', 'Cambiamos una decena por diez unidades.')
f('ahora_restamos_decenas', 'Ahora restamos las decenas.')

# ---------------------------------------------------------------- multiplicar y dividir
f('tabla_del', 'La tabla del')
f('veces', 'veces')
f('filas_de', 'filas de')
f('contamos_filas', 'Contamos fila a fila.')
f('orden_igual', 'El orden no importa: el resultado es el mismo.')
f('hay', 'Hay')
for k, t in [('bolsas', 'bolsas.'), ('cajas', 'cajas.'), ('naves', 'naves.'), ('platos', 'platos.'), ('cestas', 'cestas.')]:
    f('c_' + k, t)
f('en_cada_una', 'En cada una hay')
f('en_cada_uno', 'En cada uno hay')
f('repartimos', 'Repartimos')
f('entre', 'entre')
f('cuantos_cada', '¿Cuántos le tocan a cada uno?')
f('multiplicar_es', 'Multiplicar es sumar el mismo número varias veces.')

# ---------------------------------------------------------------- fracciones
f('que_parte', '¿Qué parte está pintada?')
for k, t in [('1_2', 'Un medio.'), ('1_3', 'Un tercio.'), ('1_4', 'Un cuarto.'), ('2_3', 'Dos tercios.'), ('3_4', 'Tres cuartos.'), ('2_4', 'Dos cuartos.')]:
    f('fr_' + k, t)
f('toca_dibujo_con', 'Toca el dibujo con')
f('pintado', 'pintado.')
f('partido_en', 'Está partido en')
f('partes_iguales', 'partes iguales.')
f('pintamos', 'Pintamos')
f('iguales_importa', 'Las partes tienen que ser iguales.')
f('tercio_de', 'Un tercio de')
f('cuarto_de', 'Un cuarto de')
f('reparte_grupos', 'Repartimos en grupos iguales.')

# ---------------------------------------------------------------- el reloj con minutos
for h in range(1, 13):
    f('hh_%d' % h, 'la una' if h == 1 else 'las ' + palabra(h))
for m, t in [(0, 'en punto.'), (5, 'y cinco.'), (10, 'y diez.'), (15, 'y cuarto.'), (20, 'y veinte.'), (25, 'y veinticinco.'), (30, 'y media.'),
             (35, 'menos veinticinco.'), (40, 'menos veinte.'), (45, 'menos cuarto.'), (50, 'menos diez.'), (55, 'menos cinco.')]:
    f('m_%02d' % m, t)
f('aguja_minutos', 'La aguja larga marca los minutos.')
f('cada_cinco', 'De un número al siguiente pasan cinco minutos.')
f('pasada_media', 'Después de la media, decimos la hora siguiente menos los minutos que faltan.')
f('misma_hora', '¿Qué reloj marca la misma hora?')

# ---------------------------------------------------------------- problemas largos
f('piensa_pasos', 'Lo hacemos paso a paso.')


def escribir():
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ruta = os.path.join(raiz, 'fuente', 'js', '00-frases.js')
    with open(ruta, 'w', encoding='utf-8') as fh:
        fh.write('/* =========================================================\n'
                 '   0. FRASES DE PIPO (generado por herramientas/frases.py: no editar a mano)\n'
                 '   Cada id se graba con voz natural; el texto sirve también para subtítulos\n'
                 '   y para la voz del dispositivo.\n'
                 '   ========================================================= */\n')
        fh.write('const FRASES = ' + json.dumps(F, ensure_ascii=False, indent=0).replace('\n', ' ') + ';\n')
    return ruta


if __name__ == '__main__':
    r = escribir()
    total = sum(len(t) for t in F.values())
    print(len(F), 'frases,', total, 'caracteres ->', r)
