#!/bin/bash
# Bundle three.js inline so the page makes zero external requests -> ./index.html
set -e
cd "$(dirname "$0")"
npm install --no-save three@0.160.0 esbuild >/dev/null
./build.sh
node_modules/.bin/esbuild all.js --bundle --minify --format=esm --target=es2022 --legal-comments=none --charset=ascii --log-level=warning --outfile=bundle.js
python3 - <<'PY'
t = open('src/template.html').read()
j = open('bundle.js').read().replace('</script', '<\\/script')
marker = '<script type="module">\n/*__JS__*/'
open('index.html', 'w').write(t.replace(marker, '<script type="module">\n' + j) if marker in t else t.replace('/*__JS__*/', j))
PY
ls -l index.html
