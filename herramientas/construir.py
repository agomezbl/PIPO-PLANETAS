# -*- coding: utf-8 -*-
"""
Construye index.html de Pipo y los Planetas 3.

  python3 herramientas/construir.py voces   -> graba (con Kokoro TTS) las frases que falten, en caché
  python3 herramientas/construir.py html    -> une estilos, cuerpo, código y voces en index.html

La caché de voz vive fuera del repositorio (variable PIPO_CACHE o carpeta por defecto).
Si una frase ya está grabada en el index.html anterior con el mismo texto, se reutiliza.
"""
import base64, hashlib, io, json, os, re, subprocess, sys, wave

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, 'herramientas'))
import frases  # noqa: E402

# Caché de voz y modelo Kokoro (model.onnx + voices.npz): fuera de git, configurables
CACHE = os.environ.get('PIPO_CACHE', os.path.join(RAIZ, '.cache-voz'))
MODELO = os.environ.get('PIPO_TTS', os.path.join(RAIZ, '.tts'))
VOCES = [('lola', 'ef_dora', 0.92), ('bruno', 'em_alex', 0.92), ('cosmo', 'em_santa', 0.92)]
KBPS = os.environ.get('PIPO_KBPS', '24k')


def clave(voz, velocidad, texto):
    return hashlib.sha1(('%s|%s|%s' % (voz, velocidad, texto)).encode('utf-8')).hexdigest()[:16]


def recortar(muestras, sr):
    """Quita el silencio del principio y del final (deja 50 ms)."""
    import numpy as np
    a = np.abs(muestras)
    umbral = max(1e-4, a.max() * 0.02)
    idx = np.where(a > umbral)[0]
    if not len(idx):
        return muestras
    pad = int(sr * 0.05)
    return muestras[max(0, idx[0] - pad): min(len(muestras), idx[-1] + pad)]


def grabar_voces(solo=None):
    import numpy as np
    from kokoro_onnx import Kokoro
    k = Kokoro(os.path.join(MODELO, 'model.onnx'), os.path.join(MODELO, 'voices.npz'))
    for voz, kv, vel in VOCES:
        if solo and voz != solo:
            continue
        carpeta = os.path.join(CACHE, voz)
        os.makedirs(carpeta, exist_ok=True)
        pendientes = [(fid, t) for fid, t in frases.F.items() if not os.path.exists(os.path.join(carpeta, clave(kv, vel, t) + '.wav'))]
        print(voz, 'pendientes:', len(pendientes), flush=True)
        for i, (fid, texto) in enumerate(pendientes):
            muestras, sr = k.create(texto, voice=kv, speed=vel, lang='es')
            muestras = recortar(np.asarray(muestras, dtype=np.float32), sr)
            pcm = (np.clip(muestras, -1, 1) * 32767).astype('<i2').tobytes()
            ruta = os.path.join(carpeta, clave(kv, vel, texto) + '.wav')
            with wave.open(ruta + '.tmp', 'wb') as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm)
            os.replace(ruta + '.tmp', ruta)
            if i % 25 == 0:
                print(voz, i, '/', len(pendientes), fid, flush=True)


def mp3_de(voz, kv, vel, texto):
    """MP3 (bytes) de una frase, con caché."""
    base = os.path.join(CACHE, voz, clave(kv, vel, texto))
    mp3 = base + '.' + KBPS + '.mp3'
    if os.path.exists(mp3):
        return open(mp3, 'rb').read()
    wav = base + '.wav'
    if not os.path.exists(wav):
        return None
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-ar', '24000', '-codec:a', 'libmp3lame',
                    '-b:a', KBPS, mp3], check=True)
    return open(mp3, 'rb').read()


def leer(ruta):
    with open(os.path.join(RAIZ, ruta), encoding='utf-8') as fh:
        return fh.read()


def construir_html():
    frases.escribir()
    css = leer('fuente/estilos.css') + '\n' + leer('fuente/estilos-v3.css')
    cuerpo = leer('fuente/cuerpo.html')
    carpeta = os.path.join(RAIZ, 'fuente', 'js')
    js = '\n'.join(leer(os.path.join('fuente', 'js', n)) for n in sorted(os.listdir(carpeta)) if n.endswith('.js'))
    paquetes = []
    faltan = {}
    tam = {}
    for voz, kv, vel in VOCES:
        datos = {}
        for fid, texto in frases.F.items():
            b = mp3_de(voz, kv, vel, texto)
            if b is None:
                faltan.setdefault(voz, []).append(fid)
                continue
            datos[fid] = base64.b64encode(b).decode('ascii')
        tam[voz] = sum(len(v) for v in datos.values())
        if datos:
            paquetes.append('<script type="application/json" id="voz-%s">%s</script>' % (voz, json.dumps(datos, separators=(',', ':'))))
    html = ('<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">\n'
            '<meta name="theme-color" content="#24185A">\n'
            '<meta name="apple-mobile-web-app-capable" content="yes">\n'
            '<meta name="mobile-web-app-capable" content="yes">\n'
            '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'
            '<meta name="apple-mobile-web-app-title" content="Pipo">\n'
            '<meta name="description" content="Pipo y los Planetas: aventura por el sistema solar para aprender matemáticas y ciencia (5 a 7 años).">\n'
            '<title>Pipo y los Planetas</title>\n'
            '<link rel="icon" href="data:image/svg+xml,' + ICONO + '">\n'
            '<link rel="apple-touch-icon" href="data:image/svg+xml,' + ICONO + '">\n'
            '<style>\n' + css + '\n</style>\n</head>\n<body>\n' + cuerpo +
            '\n<script>\n' + js + '\n</script>\n' + '\n'.join(paquetes) + '\n</body>\n</html>\n')
    with open(os.path.join(RAIZ, 'index.html'), 'w', encoding='utf-8') as fh:
        fh.write(html)
    print('index.html:', round(len(html.encode('utf-8')) / 1e6, 2), 'MB', {k: round(v / 1e6, 2) for k, v in tam.items()})
    for voz, lista in faltan.items():
        print('AVISO: faltan', len(lista), 'frases en', voz, lista[:12])


ICONO = ("%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%2324185A'/%3E"
         "%3Ccircle cx='50' cy='56' r='30' fill='%233DDC97'/%3E%3Cellipse cx='40' cy='52' rx='8' ry='10' fill='white'/%3E"
         "%3Cellipse cx='60' cy='52' rx='8' ry='10' fill='white'/%3E%3Ccircle cx='41' cy='54' r='4.5' fill='%232A1E5C'/%3E"
         "%3Ccircle cx='61' cy='54' r='4.5' fill='%232A1E5C'/%3E%3Cpath d='M42 68 Q50 75 58 68' stroke='%232A1E5C' stroke-width='3.5' fill='none' stroke-linecap='round'/%3E"
         "%3Cpath d='M38 30 L30 14 M62 30 L70 14' stroke='%23179E66' stroke-width='4' stroke-linecap='round'/%3E"
         "%3Ccircle cx='29' cy='12' r='6' fill='%23FFC93C'/%3E%3Ccircle cx='71' cy='12' r='6' fill='%23FF5DA2'/%3E%3C/svg%3E")

if __name__ == '__main__':
    orden = sys.argv[1] if len(sys.argv) > 1 else 'html'
    if orden == 'voces':
        grabar_voces(sys.argv[2] if len(sys.argv) > 2 else None)
    else:
        construir_html()
