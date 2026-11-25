import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ───────────────────────── core setup ─────────────────────────
const IS_TOUCH = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;
if (IS_TOUCH) document.body.classList.add('touch');
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rnd = mulberry(20261117);

// paint the intro card first, then do the heavy world build (otherwise the page looks frozen/blank while it builds)
await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30)));
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: !IS_TOUCH, powerPreference: 'high-performance' }); }
catch (e) { $('nogl').style.display = 'flex'; $('intro').style.display = 'none'; throw e; }
renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); $('nogl').style.display = 'flex'; });
renderer.domElement.addEventListener('webglcontextrestored', () => { $('nogl').style.display = 'none'; });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, IS_TOUCH ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xcfe0ee, 0.002);
const camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, 0.05, 900);
camera.rotation.order = 'YXZ';
scene.add(camera);

// shared uniforms: time, and the three weather amounts every surface reads
const WU = { uTime: { value: 0 }, uWet: { value: 0 }, uRain: { value: 0 }, uSnow: { value: 0 }, uWind: { value: 0.3 } };
const PU = { uScale: { value: 600 } }; // point-size scale, refreshed on resize

// Canvas signs use the system Korean/CJK fonts (no web-font download, so the page works offline and loads fast).

// ───────────────────────── world registries ─────────────────────────
const COLS = [];          // 2D colliders with a height range
const INTERACT = [];      // things you can press E on
const LIGHTS = {};        // interior point lights, filled in by the interior
const NIGHT_MATS = [];    // materials whose emissive follows night
const NIGHT_HOOKS = [];   // functions(nightT) run every frame
const TICKERS = [];       // functions(dt, t) run every frame
function addCol(x0, x1, z0, z1, y0 = 0, y1 = 3) { COLS.push({ x0, x1, z0, z1, y0, y1 }); }
function addInteract(o) { INTERACT.push(Object.assign({ r: 1.7, label: () => '互动', act() {}, enabled: () => true }, o)); }

// ───────────────────────── textures (all drawn, no downloads) ─────────────────────────
function ctex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return t;
}
function speckle(g, w, h, n, a, light) {
  for (let i = 0; i < n; i++) { const v = light ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${Math.random() * a})`; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); }
}
const TEX = {};
TEX.brick = ctex(500, 248, (g, w, h) => {
  g.fillStyle = '#b8ad9e'; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 8; r++) { const off = (r % 2) * 50; for (let c = -1; c < 6; c++) { g.fillStyle = `hsl(${6 + Math.random() * 10} ${38 + Math.random() * 16}% ${26 + Math.random() * 14}%)`; g.fillRect(c * 100 + off + 2, r * 31 + 2, 96, 27); } }
  speckle(g, w, h, 1800, 0.18, false); speckle(g, w, h, 900, 0.1, true);
});
TEX.wood = ctex(512, 512, (g, w, h) => {
  const n = 10, ph = h / n;
  for (let i = 0; i < n; i++) { let x = -Math.random() * 200; while (x < w) { const len = 180 + Math.random() * 220; g.fillStyle = `hsl(${32 + Math.random() * 4} 38% ${62 + Math.random() * 8}%)`; g.fillRect(x + 1, i * ph + 1, len - 2, ph - 2); for (let k = 0; k < 5; k++) { g.fillStyle = `rgba(90,55,25,${0.05 + Math.random() * 0.06})`; g.fillRect(x + 2, i * ph + 4 + Math.random() * (ph - 8), len - 4, 1); } x += len; } }
});
TEX.tile = ctex(256, 256, (g) => {
  g.fillStyle = '#cfd5d8'; g.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 4; r++) { const off = (r % 2) * 64; for (let c = -1; c < 3; c++) { g.fillStyle = '#f4f6f6'; g.fillRect(c * 128 + off + 2, r * 64 + 2, 124, 60); } }
});
TEX.tile2 = ctex(256, 256, (g) => {
  g.fillStyle = '#6c7478'; g.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { g.fillStyle = `hsl(200 6% ${52 + Math.random() * 6}%)`; g.fillRect(c * 128 + 3, r * 128 + 3, 122, 122); }
  speckle(g, 256, 256, 500, 0.12, true);
});
TEX.asphalt = ctex(512, 512, (g, w, h) => {
  g.fillStyle = '#3b3d41'; g.fillRect(0, 0, w, h); speckle(g, w, h, 5000, 0.28, true); speckle(g, w, h, 3000, 0.25, false);
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) { g.beginPath(); let x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (Math.random() - 0.5) * 60; y += (Math.random() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); }
});
TEX.paver = ctex(256, 256, (g) => {
  g.fillStyle = '#6f6c66'; g.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { g.fillStyle = `hsl(35 5% ${60 + Math.random() * 8}%)`; g.fillRect(c * 64 + 2, r * 64 + 2, 60, 60); }
  speckle(g, 256, 256, 600, 0.12, false);
});
TEX.tactile = ctex(128, 128, (g) => {
  g.fillStyle = '#e2b81a'; g.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = '#c99d0a'; g.beginPath(); g.arc(16 + x * 32, 16 + y * 32, 7, 0, 6.3); g.fill(); }
});
TEX.roof = ctex(256, 256, (g, w, h) => {
  g.fillStyle = '#3f7a66'; g.fillRect(0, 0, w, h); speckle(g, w, h, 2500, 0.18, true); speckle(g, w, h, 2500, 0.2, false);
});
TEX.grass = ctex(256, 256, (g, w, h) => {
  g.fillStyle = '#6d7a4a'; g.fillRect(0, 0, w, h); speckle(g, w, h, 3000, 0.25, true); speckle(g, w, h, 3000, 0.3, false);
});
function signTex(text, fg, bg, w = 512, h = 128, fs = 76) {
  return ctex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg;
    g.font = `700 ${fs}px "Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo","PingFang SC",sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 4);
  });
}

// ───────────────────────── weather-aware materials ─────────────────────────
// Adds wetness, rain ripples and snow cover to a standard material (up-facing surfaces only).
const WX_GLSL = `
varying vec3 vWP;
uniform float uTime; uniform float uWet; uniform float uRain; uniform float uSnow;
float wh21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float wn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); float a=wh21(i), b=wh21(i+vec2(1.0,0.0)), c=wh21(i+vec2(0.0,1.0)), d=wh21(i+vec2(1.0,1.0)); return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }
float wRing(vec2 p, float cell, float speed, float maxR, float seed){
  vec2 q = p/cell; vec2 id = floor(q); vec2 f = fract(q)-0.5;
  float h = wh21(id+seed); float t = fract(uTime*speed + h*7.0);
  vec2 o = vec2(wh21(id+seed+3.1), wh21(id+seed+7.7))-0.5; f -= o*0.5;
  float r = length(f)*cell; float R = t*maxR;
  float ring = smoothstep(0.018, 0.0, abs(r - R)) + 0.5*smoothstep(0.014, 0.0, abs(r - R*0.62));
  float dot0 = smoothstep(0.03, 0.0, r) * smoothstep(0.12, 0.0, t);
  return (ring*(1.0-t)*(1.0-t) + dot0*1.5) * step(h, 0.62);
}
float wRipple(vec2 p){
  return wRing(p, 0.55, 0.9, 0.2, 0.0) + 0.8*wRing(p, 0.8, 0.7, 0.3, 11.0) + 0.6*wRing(p, 0.35, 1.3, 0.12, 23.0);
}`;
function patchWeather(mat) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = WU.uTime; sh.uniforms.uWet = WU.uWet; sh.uniforms.uRain = WU.uRain; sh.uniforms.uSnow = WU.uSnow;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + WX_GLSL)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      {
        vec3 wUp = normalize((viewMatrix * vec4(0.0,1.0,0.0,0.0)).xyz);
        float up = clamp(dot(normal, wUp), 0.0, 1.0);
        float flatA = smoothstep(0.5, 0.95, up);
        float pud = smoothstep(0.38, 0.62, wn(vWP.xz*0.28)*0.65 + wn(vWP.xz*1.1)*0.35);
        float wetA = uWet * (0.3 + 0.7*flatA);
        diffuseColor.rgb *= 1.0 - 0.38*wetA*(0.5+0.5*pud);
        roughnessFactor = mix(roughnessFactor, 0.05, clamp(wetA*flatA*(0.25+0.9*pud), 0.0, 1.0));
        float wRp = wRipple(vWP.xz) * uRain * flatA;
        diffuseColor.rgb += wRp * (0.2 + 0.35*pud);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.55,0.62,0.7), wetA*flatA*pud*0.22);
        float sn = smoothstep(0.55, 0.85, up) * uSnow * (0.88 + 0.12*wh21(floor(vWP.xz*7.0)));
        sn = clamp(sn, 0.0, 1.0);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.92,0.95,1.0), sn);
        roughnessFactor = mix(roughnessFactor, 0.9, sn);
      }`);
  };
  mat.customProgramCacheKey = () => 'wx2';
  return mat;
}
const std = (o, wx, tile) => { const m = new THREE.MeshStandardMaterial(o); if (wx) patchWeather(m); if (tile) m.userData.tile = tile; return m; };
const M = {
  brick: std({ map: TEX.brick, roughness: 0.92 }, true, [1.05, 0.52]),
  plaster: std({ color: 0xf1ebdf, roughness: 0.95 }),
  ceiling: std({ color: 0xf6f3ec, roughness: 1 }),
  wood: std({ map: TEX.wood, roughness: 0.55 }, false, [1.2, 1.2]),
  tile: std({ map: TEX.tile, roughness: 0.35 }, false, [0.6, 0.6]),
  tile2: std({ map: TEX.tile2, roughness: 0.6 }, false, [0.6, 0.6]),
  asphalt: std({ map: TEX.asphalt, roughness: 0.95 }, true, [4, 4]),
  paver: std({ map: TEX.paver, roughness: 0.9 }, true, [1, 1]),
  tactile: std({ map: TEX.tactile, roughness: 0.8 }, true, [0.3, 0.3]),
  roof: std({ map: TEX.roof, roughness: 0.85 }, true, [1.5, 1.5]),
  grass: std({ map: TEX.grass, roughness: 1 }, true, [2, 2]),
  concrete: std({ color: 0xa5a39d, roughness: 0.95 }, true),
  dark: std({ color: 0x24272b, roughness: 0.7 }, true),
  steel: std({ color: 0x8b9298, roughness: 0.35, metalness: 0.7 }, true),
  white: std({ color: 0xf4f4f0, roughness: 0.5 }),
  frame: std({ color: 0x2f3438, roughness: 0.5, metalness: 0.3 }, true),
  glassStd: new THREE.MeshStandardMaterial({ color: 0xbfe0ee, transparent: true, opacity: 0.22, roughness: 0.05, depthWrite: false }),
};
M.asphalt.userData.refl = 0.6; M.paver.userData.refl = 0.6; M.concrete.userData.refl = 0.5; M.tactile.userData.refl = 0.5; M.glassStd.userData.refl = 1; M.steel.userData.refl = 0.9; M.frame.userData.refl = 0.5; M.tile.userData.refl = 0.35; M.tile2.userData.refl = 0.3;
const mat = (hex, rough = 0.8, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: hex, roughness: rough }, extra));
const matW = (hex, rough = 0.85) => std({ color: hex, roughness: rough }, true);

// ───────────────────────── geometry helpers ─────────────────────────
// Box whose UVs are in world metres, so a 1.05 m brick tile stays 1.05 m on any wall.
function boxGeo(w, h, d, sx = 1, sy = sx) {
  const g = new THREE.BoxGeometry(w, h, d); const uv = g.attributes.uv;
  const dims = [[d, h, sx, sy], [d, h, sx, sy], [w, d, sx, sx], [w, d, sx, sx], [w, h, sx, sy], [w, h, sx, sy]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * dims[f][0] / dims[f][2], uv.getY(k) * dims[f][1] / dims[f][3]); }
  return g;
}
function planeGeo(w, d, sx = 1, sy = sx) { // flat on the ground
  const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / sx, uv.getY(i) * d / sy);
  return g;
}
// y is the BOTTOM of the box. col: true or [y0,y1] adds a collider (axis-aligned, unrotated parents only).
function box(w, h, d, material, x, y, z, o = {}) {
  const mm = Array.isArray(material) ? material[0] : material;
  const t = o.tile || mm.userData.tile || [1, 1];
  const m = new THREE.Mesh(boxGeo(w, h, d, t[0], t[1]), material);
  m.position.set(x, y + h / 2, z);
  if (o.ry) m.rotation.y = o.ry;
  m.castShadow = o.cast ?? (Math.max(w, h, d) > 0.6); m.receiveShadow = o.recv ?? true;
  (o.parent || scene).add(m);
  if (o.col) { const sw = o.ry && Math.abs(Math.sin(o.ry)) > 0.7; const hw = (sw ? d : w) / 2, hd = (sw ? w : d) / 2; const [c0, c1] = o.col === true ? [y, y + h] : o.col; const pp = o.parent && o.parent !== scene ? o.parent.position : { x: 0, y: 0, z: 0 }; addCol(pp.x + x - hw, pp.x + x + hw, pp.z + z - hd, pp.z + z + hd, pp.y + c0, pp.y + c1); }
  return m;
}
function cyl(rt, rb, h, material, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, o.seg || 20), material);
  m.position.set(x, y + h / 2, z); m.castShadow = o.cast ?? (h > 0.6); m.receiveShadow = true;
  (o.parent || scene).add(m);
  if (o.col) { const r = Math.max(rt, rb); addCol(x - r, x + r, z - r, z + r, y, y + h); }
  return m;
}
function sph(r, material, x, y, z, o = {}) { // y is the bottom
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, o.seg || 16, o.seg ? Math.max(6, o.seg / 2) : 10), material);
  m.position.set(x, y + r, z); m.castShadow = o.cast ?? false; m.receiveShadow = true; (o.parent || scene).add(m); return m;
}
function grp(x, y, z, ry = 0, parent = scene) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; }
function slab(w, d, material, x, y, z, th = 0.02, o = {}) { return box(w, th, d, material, x, y, z, Object.assign({ cast: false }, o)); }

