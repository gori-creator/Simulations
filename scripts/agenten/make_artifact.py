"""Wandelt einen Build mit Platzhalter-Basis /__B__/ in eine Vorschau mit relativen Pfaden um."""
import json, os, re, shutil, sys

src, out = sys.argv[1], sys.argv[2]
shutil.rmtree(out, ignore_errors=True)
os.makedirs(out)
P = '/__B__/'
files = {}

def rel_link(path, depth):
    # Verzeichnis-Links auf index.html zeigen lassen (mit optionalem #anker)
    path, _, anchor = path.partition('#')
    if path == '' or path.endswith('/'):
        path += 'index.html'
    return ('../' * depth) + path + ('#' + anchor if anchor else '')

def fix_html(html, depth):
    html = re.sub(r'<script>\(function\(\)\{const base = .*?serviceWorker.*?</script>', '', html, flags=re.S)
    html = re.sub(r'<link rel="manifest"[^>]*>', '', html)
    html = re.sub(r'(href|src)="' + re.escape(P) + r'([^"]*)"', lambda m: f'{m.group(1)}="{rel_link(m.group(2), depth)}"', html)
    return html

for root, _, names in os.walk(src):
    for name in names:
        full = os.path.join(root, name)
        rel = os.path.relpath(full, src).replace(os.sep, '/')
        if rel in ('sw.js', 'index.html', '404.html', 'manifest.webmanifest') or rel.endswith(('.ttf', '.woff')) or rel.startswith('icons/icon'):
            continue
        dest = os.path.join(out, rel)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        if rel.endswith('.html'):
            depth = rel.count('/')
            data = fix_html(open(full, encoding='utf-8').read(), depth)
            open(dest, 'w', encoding='utf-8').write(data)
        elif rel.endswith('.css'):
            open(dest, 'w', encoding='utf-8').write(open(full, encoding='utf-8').read().replace(P + '_astro/', './'))
        elif rel.endswith('.js'):
            data = open(full, encoding='utf-8').read().replace('`' + P + '`+e', ' new URL(`../`+e,import.meta.url).href')
            # Bild-Adressen aus import.meta.glob (liegen neben dem Skript)
            data = re.sub('`' + re.escape(P) + '_astro/([^`]+)`', lambda m: 'new URL(`./' + m.group(1) + '`,import.meta.url).href', data)
            assert P not in data, rel
            open(dest, 'w', encoding='utf-8').write(data)
        else:
            shutil.copy(full, dest)
        files[rel] = dest

# Einstiegsseite: deutsche Startseite ohne eigenes Dokument-Gerüst (wird beim Veröffentlichen umhüllt)
home = fix_html(open(os.path.join(src, 'de/index.html'), encoding='utf-8').read(), 0)
home = re.sub(r'<!DOCTYPE html>|</?html[^>]*>|</?head>|</?body>', '', home, flags=re.I)
title = re.search(r'<title>.*?</title>', home).group(0)
home = title + home.replace(title, '', 1)
open(os.path.join(out, 'start.html'), 'w', encoding='utf-8').write(home)

leftover = [r for r, d in files.items() if r.endswith(('.html', '.css')) and P in open(d, encoding='utf-8').read().replace('localhost:4321' + P, '')]
print('files:', len(files), 'leftover base refs:', leftover[:5])
json.dump({k: os.path.relpath(v, out) for k, v in files.items()}, open(os.path.join(out, '..', 'artifact-files.json'), 'w'), indent=0)
