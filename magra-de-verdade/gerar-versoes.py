from pathlib import Path
import re

dist = Path(__file__).resolve().parent / 'dist'
source = (dist / 'index.html').read_text()
source = re.sub(r'src="([^"/][^"]*\.webp)"', r'src="/\1"', source)

pitch = Path(__file__).with_name('pos-pitch-escura.html').read_text()
marker = '<span id="vturb-pitch-marker" class="esconder" aria-hidden="true"></span>'
source = source.replace('</main>', marker + '\n' + pitch + '</main>')
integration = Path(__file__).with_name('vturb-head.html').read_text()
source = source.replace('</head>', integration + '</head>', 1)
source = source.replace('</body>', '  <script src="/pos-pitch.js" defer></script>\n</body>')
source = source.replace('</head>', '  <link rel="stylesheet" href="/pos-pitch.css">\n</head>')

for slug in ('pv-escura', 'pv-clara'):
    page = source
    if slug == 'pv-clara':
        light_pitch = Path(__file__).with_name('pos-pitch-clara.html').read_text()
        page = page.replace(pitch, light_pitch, 1)
        page = page.replace(
            'Esse Iogurte é um fazedor de milagres, sério. Eu experimentei esse tal Iogurte por 7 dias e já perdi quase todas as minhas roupas',
            'Eu estou usando o protocolo e em 7 dias e já perdi quase todas as minhas roupas kkk',
            1,
        )
        page = page.replace('<html lang="pt-BR">', '<html lang="pt-BR" data-theme="light">')
        page = page.replace('content="#0b0b0b"', 'content="#ffffff"')
        page = page.replace(
            'color-scheme:dark;--bg:#0b0b0b;--surface:#151515;--line:#292929;--text:#f7f5f2;--muted:#b1ada8;--accent:#d9e9b8',
            'color-scheme:light;--bg:#ffffff;--surface:#f5f5f5;--line:#dedede;--text:#161616;--muted:#575757;--accent:#46562c',
        )
        page = page.replace('.video-note{', '.video-note{color:#f7f5f2;')
        page = page.replace('color:#ff6686', 'color:#c52250')
    target = dist / 'aline-freitas-emag' / slug / 'index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(page)
