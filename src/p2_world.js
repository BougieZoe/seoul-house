// ───────────────────────── sky dome (GLSL) ─────────────────────────
const skyU = {
  uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uMoonDir: { value: new THREE.Vector3(-0.4, 0.7, -0.5).normalize() },
  uZenith: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uSunCol: { value: new THREE.Color() },
  uCloudCol: { value: new THREE.Color() }, uNight: { value: 0 }, uCloud: { value: 0 }, uTime: WU.uTime,
};
const sky = new THREE.Mesh(new THREE.SphereGeometry(800, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `
  varying vec3 vDir;
  uniform vec3 uSunDir, uMoonDir, uZenith, uHorizon, uSunCol, uCloudCol; uniform float uNight, uCloud, uTime;
  float hash(vec2 p){ p=fract(p*vec2(443.897,441.423)); p+=dot(p,p+19.19); return fract(p.x*p.y); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
  float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+vec2(11.3,7.7); a*=.5; } return v; }
  void main(){
    vec3 d = normalize(vDir);
    float h = clamp(d.y,0.,1.);
    vec3 col = mix(uHorizon, uZenith, pow(h,0.55));
    col = mix(col, uHorizon, exp(-max(d.y,0.)*9.)*0.5);
    float clear = 1.-uCloud;
    float sd = max(dot(d,uSunDir),0.);
    col += uSunCol*(pow(sd,900.)*6. + pow(sd,40.)*0.35 + pow(sd,5.)*0.12)*clear;
    float md = max(dot(d,uMoonDir),0.);
    col += vec3(0.85,0.9,1.0)*smoothstep(0.9993,0.9997,md)*uNight*clear*1.2;
    col += vec3(0.5,0.6,0.9)*pow(md,60.)*0.12*uNight*clear;
    if(d.y>0.0){
      vec3 id = floor(d*220.); float r = fract(sin(dot(id,vec3(12.9898,78.233,37.719)))*43758.5453);
      float tw = 0.6+0.4*sin(uTime*2.+r*40.);
      col += vec3(1.)*step(0.9965,r)*smoothstep(0.0,0.2,d.y)*uNight*clear*tw*0.9;
      vec2 cp = d.xz/(d.y+0.18)*1.3 + vec2(uTime*0.006, uTime*0.003);
      float n = fbm(cp);
      float cov = mix(0.62,0.2,uCloud);
      float c = smoothstep(cov, cov+0.25, n);
      float fade = smoothstep(0.0,0.15,d.y);
      vec3 cc = uCloudCol*(0.72+0.28*smoothstep(0.3,0.9,n));
      col = mix(col, cc, c*fade*(0.5+0.5*uCloud));
    }
    gl_FragColor = vec4(col,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`,
}));
sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

// ───────────────────────── lights ─────────────────────────
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(IS_TOUCH ? 1024 : 2048, IS_TOUCH ? 1024 : 2048);
const sc = sun.shadow.camera; sc.left = -34; sc.right = 34; sc.top = 34; sc.bottom = -34; sc.near = 1; sc.far = 160;
sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.04;
scene.add(sun); scene.add(sun.target);
const hemi = new THREE.HemisphereLight(0xbcd4ff, 0x6b6a60, 0.6); scene.add(hemi);
function plight(name, x, y, z, color, dist = 10) {
  const l = new THREE.PointLight(color, 0, dist, 2); l.position.set(x, y, z); scene.add(l); LIGHTS[name] = l; return l;
}
const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff1cf, emissive: 0xffd89a, emissiveIntensity: 0, roughness: 0.4 });
NIGHT_MATS.push({ m: lampMat, k: 3 });

// ───────────────────────── facades for neighbours ─────────────────────────
function facade(kind, seed, litP) {
  const r = mulberry(seed), cw = 64, ch = 64, cols = 4, rows = 3, W = cw * cols, H = ch * rows;
  const brickCols = ['#9b5b44', '#8e4f3b', '#a46650', '#86493a'];
  const stuccoCols = ['#d9d0bf', '#cdc4b4', '#dccfc0', '#c7c9c2'];
  const baseC = kind === 'brick' ? brickCols[Math.floor(r() * 4)] : stuccoCols[Math.floor(r() * 4)];
  const map = ctex(W, H, (g) => {
    g.fillStyle = baseC; g.fillRect(0, 0, W, H);
    if (kind === 'brick') { for (let y = 0; y < H; y += 8) for (let x = -(y / 8 % 2) * 8; x < W; x += 16) { g.fillStyle = `hsla(${8 + r() * 8},${35 + r() * 14}%,${28 + r() * 12}%,.55)`; g.fillRect(x + 1, y + 1, 14, 6); } }
    else speckle(g, W, H, 3000, 0.14, false);
    for (let cy = 0; cy < rows; cy++) for (let cx = 0; cx < cols; cx++) {
      const x = cx * cw + 12, y = cy * ch + 14;
      g.fillStyle = '#ece8de'; g.fillRect(x - 3, y - 3, 46, 40);
      const gr = g.createLinearGradient(0, y, 0, y + 34); gr.addColorStop(0, '#5f7d94'); gr.addColorStop(1, '#2b3c4b');
      g.fillStyle = gr; g.fillRect(x, y, 40, 34);
      g.fillStyle = '#ece8de'; g.fillRect(x + 19, y, 2, 34);
    }
    g.fillStyle = 'rgba(0,0,0,.16)'; for (let cy = 1; cy <= rows; cy++) g.fillRect(0, cy * ch - 3, W, 3);
  });
  const emi = ctex(W, H, (g) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    const pal = ['#ffd596', '#ffe6bd', '#ffc983', '#a9c9ff', '#ffefd6'];
    for (let cy = 0; cy < rows; cy++) for (let cx = 0; cx < cols; cx++) if (r() < litP) {
      g.fillStyle = pal[Math.floor(r() * pal.length)]; g.fillRect(cx * cw + 12, cy * ch + 14, 40, 34);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(cx * cw + 12 + (r() < 0.5 ? 0 : 20), cy * ch + 14, 20, 34);
    }
  });
  emi.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshStandardMaterial({ map, emissiveMap: emi, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.9 });
  m.userData.tile = [12.8, 9.3]; NIGHT_MATS.push({ m, k: 1.0 });
  return m;
}
const FAC = [facade('brick', 11, 0.45), facade('stucco', 12, 0.4), facade('brick', 13, 0.35), facade('stucco', 14, 0.5), facade('brick', 15, 0.5), facade('stucco', 16, 0.3)];
const tankMat = mat(0xdfe6ea, 0.6), acMat = mat(0xd9dcdc, 0.6);
function bld(x0, x1, z0, z1, floors, fi) {
  const h = floors * 3.1, w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  box(w, h, d, FAC[fi % FAC.length], cx, 0, cz, { col: true, cast: true });
  box(w + 0.3, 0.25, d + 0.3, M.concrete, cx, h, cz, { cast: false });
  for (const [sx, sz, pw, pd] of [[0, d / 2, w, 0.2], [0, -d / 2, w, 0.2], [w / 2, 0, 0.2, d], [-w / 2, 0, 0.2, d]]) box(pw, 0.6, pd, M.concrete, cx + sx, h + 0.25, cz + sz, { cast: false });
  if (fi % 2 === 0) cyl(0.9, 0.9, 1.6, tankMat, cx + w * 0.2, h + 0.25, cz - d * 0.15, { cast: false, seg: 12 });
  if (fi % 3 === 1) box(1.2, 0.8, 0.6, acMat, cx - w * 0.2, h + 0.25, cz + d * 0.2, { cast: false });
}
// west row, east row (the alley side of every villa is its facade)
bld(-17, -8.6, -12, 3.6, 3, 0); bld(-28, -17.4, -12, 4, 4, 1); bld(-40, -28.4, -12, 3, 2, 2); bld(-56, -40.4, -12, 3.8, 3, 3); bld(-70, -56.4, -12, 3, 4, 4);
bld(8.6, 18, -12, 3.2, 4, 3); bld(18.4, 30, -12, 4, 3, 0); bld(30.4, 44, -12, 3.4, 2, 5); bld(44.4, 60, -12, 3.8, 3, 2); bld(60.4, 74, -12, 3, 4, 1);
// back row behind the house
for (const [a, b, f] of [[-60, -42, 4], [-41.6, -20, 5], [-19.6, -2, 4], [-1.6, 16, 6], [16.4, 38, 4], [38.4, 62, 5]]) bld(a, b, -34, -12.6, f, f + 1);
// across the alley
const SHOPS = [
  { x0: -60, x1: -44, f: 4, sign: '세탁소', bg: '#1f5ea8', fg: '#fff' },
  { x0: -43.6, x1: -30, f: 5, sign: '분식', bg: '#c9372c', fg: '#fff3d6' },
  { x0: -29.6, x1: -18, f: 4, sign: '약국', bg: '#1d8a4c', fg: '#fff' },
  { x0: -17.6, x1: -6, f: 5, sign: '미용실', bg: '#6b4a9c', fg: '#fff' },
  { x0: -5.6, x1: 6, f: 4, sign: '카페 · 겨울', bg: '#33271f', fg: '#f4d9a8' },
  { x0: 6.4, x1: 22, f: 4, sign: '24시 편의점', bg: '#1b4fa3', fg: '#fff' },
  { x0: 22.4, x1: 34, f: 5, sign: '치킨', bg: '#e0a21a', fg: '#2a1a10' },
  { x0: 34.4, x1: 46, f: 4, sign: '부동산', bg: '#2d6e66', fg: '#fff' },
  { x0: 46.4, x1: 60, f: 5, sign: '고깃집', bg: '#8c2a22', fg: '#ffe9c8' },
];
SHOPS.forEach((s, i) => {
  bld(s.x0, s.x1, 12.6, 25, s.f, i + 2);
  const cx = (s.x0 + s.x1) / 2, w = s.x1 - s.x0 - 1.2;
  const emi = new THREE.MeshStandardMaterial({ color: 0x1a1f24, emissive: 0xffd9a0, emissiveIntensity: 0, roughness: 0.2 });
  NIGHT_MATS.push({ m: emi, k: 0.9 });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, 2.2), emi); glass.position.set(cx, 1.5, 12.57); glass.rotation.y = Math.PI; scene.add(glass);
  const st = signTex(s.sign, s.fg, s.bg, 512, 128, s.sign.length > 5 ? 62 : 80);
  const sm = new THREE.MeshStandardMaterial({ map: st, emissiveMap: st, emissive: 0xffffff, emissiveIntensity: 0.35, roughness: 0.6 });
  NIGHT_MATS.push({ m: sm, k: 1.0, base: 0.35 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w, 6), 1.5), sm); sign.position.set(cx, 3.55, 12.55); sign.rotation.y = Math.PI; scene.add(sign);
  box(w + 0.4, 0.15, 1.1, M.dark, cx, 2.7, 12.05, { cast: false }); // awning
});

// ───────────────────────── ground, alley, sidewalks ─────────────────────────
const SURF = []; // walkable flat surfaces {x0,x1,z0,z1,y}
const RAMPS = []; // {x0,x1,z0,z1, zA,yA,zB,yB}
function surf(x0, x1, z0, z1, y) { SURF.push({ x0, x1, z0, z1, y }); }
const city = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), M.concrete); city.rotation.x = -Math.PI / 2; city.position.y = -0.03; city.receiveShadow = true; scene.add(city);
slab(140, 4.8, M.asphalt, 0, 0, 8.6, 0.03);
slab(140, 1.05, M.paver, 0, 0, 5.675, 0.12, { cast: false }); slab(140, 1.0, M.paver, 0, 0, 11.5, 0.12, { cast: false });
slab(140, 0.35, M.tactile, 0, 0.12, 5.9, 0.005); slab(140, 0.35, M.tactile, 0, 0.12, 11.3, 0.005);
surf(-70, 70, 5.15, 6.2, 0.12); surf(-70, 70, 11, 12.6, 0.12);
// painted lines and manholes
const paint = new THREE.MeshStandardMaterial({ color: 0xe8e6dc, roughness: 0.9 });
for (let x = -52; x < 60; x += 4) slab(1.6, 0.12, paint, x, 0.03, 8.6, 0.004, { cast: false });
for (let i = 0; i < 6; i++) slab(0.5, 4.4, paint, 24 + i * 0.9, 0.03, 8.6, 0.004, { cast: false }); // crosswalk by the convenience store
for (const x of [-9, 14, -32]) cyl(0.42, 0.42, 0.01, M.dark, x, 0.03, 8.1 + (x % 2 ? 0.6 : 0), { cast: false });

// yard
slab(16, 6.9, M.paver, 0, 0, 1.58, 0.06, { cast: false }); surf(-8, 8, -1.875, 5.0, 0.06);
slab(5.4, 3.6, M.grass, -5.0, 0.06, 2.9, 0.02, { cast: false }); slab(3.2, 2.4, M.grass, 6.4, 0.06, 3.4, 0.02, { cast: false });
// low wall and open gate
const wallM = M.brick;
function lowWall(x0, x1, z0, z1) { const w = x1 - x0, d = z1 - z0; box(w, 1.1, d, wallM, (x0 + x1) / 2, 0, (z0 + z1) / 2, { col: [0, 1.1] }); box(w + 0.06, 0.08, d + 0.06, M.concrete, (x0 + x1) / 2, 1.1, (z0 + z1) / 2, { cast: false }); }
lowWall(-8, -1.4, 4.85, 5.15); lowWall(1.4, 8, 4.85, 5.15); lowWall(-8.15, -7.85, -1.875, 4.85); lowWall(7.85, 8.15, -1.875, 4.85);
box(0.3, 1.5, 0.3, M.concrete, -1.4, 0, 5, { col: true }); box(0.3, 1.5, 0.3, M.concrete, 1.4, 0, 5, { col: true });
for (const sx of [-1, 1]) { const leaf = box(0.06, 1.15, 1.35, M.frame, sx * 1.45, 0.1, 4.3, { col: [0, 1.2], cast: false }); }
const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.2), new THREE.MeshStandardMaterial({ map: signTex('42', '#222', '#e8e1d0', 128, 64, 44), roughness: 0.6 })); plate.position.set(-1.4, 1.2, 5.16); scene.add(plate);

// ───────────────────────── trees: ginkgo with real leaf cards ─────────────────────────
const leafTex = ctex(64, 64, (g) => {
  g.translate(32, 60); g.beginPath(); g.moveTo(0, 0); g.lineTo(-27, -33); g.quadraticCurveTo(-19, -55, -3, -51); g.lineTo(0, -41); g.lineTo(3, -51); g.quadraticCurveTo(19, -55, 27, -33); g.closePath();
  const gr = g.createRadialGradient(0, 0, 4, 0, -30, 34); gr.addColorStop(0, '#d9ad1c'); gr.addColorStop(1, '#fbe14a'); g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(140,92,0,.45)'; g.lineWidth = 1; for (let a = -26; a <= 26; a += 5) { g.beginPath(); g.moveTo(0, 0); g.lineTo(a * 0.95, -34 - 12 * Math.cos(a / 26 * 1.5)); g.stroke(); }
  g.strokeStyle = '#8a6a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 6); g.lineTo(0, 0); g.stroke();
});
leafTex.wrapS = leafTex.wrapT = THREE.ClampToEdgeWrapping;
const leafMat = new THREE.MeshStandardMaterial({ map: leafTex, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.75 });
leafMat.onBeforeCompile = (sh) => {
  sh.uniforms.uTimeL = WU.uTime; sh.uniforms.uWindL = WU.uWind;
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTimeL; uniform float uWindL;')
    .replace('#include <begin_vertex>', `#include <begin_vertex>
    { vec3 ip = instanceMatrix[3].xyz; float ph = ip.x*0.9 + ip.z*0.7 + ip.y*1.3;
      transformed.x += sin(uTimeL*(1.4+uWindL*2.0) + ph) * 0.05 * (0.3+uWindL);
      transformed.y += cos(uTimeL*(1.1+uWindL*1.5) + ph*1.3) * 0.04 * (0.3+uWindL); }`);
};
leafMat.customProgramCacheKey = () => 'leafsway';
leafMat.userData.refl = 0.15;
const leafPalette = [0xf2cf3a, 0xe8bd2a, 0xd9a21f, 0xe6c63a, 0xc9b92a, 0xb7b02a].map((c) => new THREE.Color(c));
const barkMat = mat(0x5a4a3d, 0.95);
const _o = new THREE.Object3D(), _c = new THREE.Color();
function ginkgo(x, z, s = 1) {
  const g = grp(x, 0.12, z); cyl(0.2 * s, 0.27 * s, 3.6 * s, barkMat, 0, 0, 0, { parent: g, seg: 8 }); addCol(x - 0.3, x + 0.3, z - 0.3, z + 0.3, 0, 4);
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28 + rnd(), l = (1.5 + rnd() * 0.8) * s; const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * s, 0.07 * s, l, 5), barkMat); b.position.set(Math.cos(a) * l * 0.32, 3.9 * s + l * 0.3, Math.sin(a) * l * 0.32); b.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); g.add(b); }
  const N = IS_TOUCH ? 380 : 700; const crown = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.34, 0.34), leafMat, N);
  for (let i = 0; i < N; i++) {
    let px, py, pz, d; do { px = rnd() * 2 - 1; py = rnd() * 2 - 1; pz = rnd() * 2 - 1; d = px * px + py * py + pz * pz; } while (d > 1 || d < 0.25);
    _o.position.set(px * 2.2 * s, 5.0 * s + py * 1.9 * s, pz * 2.2 * s); _o.rotation.set((rnd() - 0.5) * 2.4, rnd() * 6.28, (rnd() - 0.5) * 2.4); _o.scale.setScalar((0.8 + rnd() * 0.9) * s); _o.updateMatrix(); crown.setMatrixAt(i, _o.matrix);
    _c.copy(leafPalette[Math.floor(rnd() * leafPalette.length)]).multiplyScalar(0.8 + 0.3 * (py + 1) / 2); crown.setColorAt(i, _c);
  }
  crown.castShadow = true; crown.receiveShadow = false; crown.frustumCulled = true; g.add(crown);
  const M2 = IS_TOUCH ? 60 : 130, fl = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.3, 0.3), leafMat, M2);
  for (let i = 0; i < M2; i++) { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 2.9 * s; _o.position.set(Math.cos(a) * r, 0.025 + rnd() * 0.03, Math.sin(a) * r); _o.rotation.set(-Math.PI / 2 + (rnd() - 0.5) * 0.2, 0, rnd() * 6.28, 'YXZ'); _o.scale.setScalar(0.7 + rnd() * 0.5); _o.updateMatrix(); fl.setMatrixAt(i, _o.matrix); _c.copy(leafPalette[Math.floor(rnd() * 4)]).multiplyScalar(0.7 + rnd() * 0.25); fl.setColorAt(i, _c); }
  fl.receiveShadow = true; g.add(fl);
  return g;
}
for (const x of [-6.2, 9.8, -21, 22, -35, 37, -49, 51]) ginkgo(x, 5.75, 0.95 + rnd() * 0.25);
for (const x of [-11, 13, -27, 29, -43, 45]) ginkgo(x, 11.55, 0.95 + rnd() * 0.25);
// persimmon (감나무) in the yard: bare crown, orange fruit
{
  const g = grp(-5, 0.08, 2.7); cyl(0.12, 0.2, 2.4, barkMat, 0, 0, 0, { parent: g, seg: 8 }); addCol(-5.25, -4.75, 2.45, 2.95, 0, 3);
  const leafs = std({ color: 0xa8552a, roughness: 0.9, flatShading: true }, true);
  for (let i = 0; i < 6; i++) { const a = i * 1.05; const br = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 1.3, 5), barkMat); br.position.set(Math.cos(a) * 0.4, 2.7, Math.sin(a) * 0.4); br.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); g.add(br); }
  for (let i = 0; i < 7; i++) { const a = i * 0.9; const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 + rnd() * 0.25, 0), leafs); m.position.set(Math.cos(a) * 0.9, 2.5 + rnd() * 0.9, Math.sin(a) * 0.9); m.castShadow = true; g.add(m); }
  const fruit = new THREE.MeshStandardMaterial({ color: 0xf0801a, emissive: 0x7a2c00, emissiveIntensity: 0.25, roughness: 0.5 });
  for (let i = 0; i < 26; i++) { const a = rnd() * 6.28, r = 0.4 + rnd() * 1.3; const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), fruit); m.position.set(Math.cos(a) * r, 2.1 + rnd() * 1.3, Math.sin(a) * r); g.add(m); }
}

// ───────────────────────── street furniture ─────────────────────────
const POLES = []; for (let x = -52.5; x <= 59.5; x += 14) POLES.push(x);
const woodPole = mat(0x6d625a, 0.9);
POLES.forEach((x) => { cyl(0.13, 0.17, 9, woodPole, x, 0, 6.35, { seg: 8, cast: false }); box(1.6, 0.1, 0.1, woodPole, x, 8.2, 6.35, { cast: false }); box(1.1, 0.1, 0.1, woodPole, x, 7.6, 6.35, { cast: false }); addCol(x - 0.18, x + 0.18, 6.17, 6.53, 0, 3); });
box(0.7, 0.9, 0.6, M.dark, 3.5, 6.4, 6.75, { cast: false }); // transformer
const wireMat = new THREE.LineBasicMaterial({ color: 0x15171a });
for (let i = 0; i < POLES.length - 1; i++) for (const [dz, y] of [[-0.7, 8.2], [0, 8.2], [0.7, 8.2], [-0.45, 7.6], [0.45, 7.6]]) {
  const pts = []; for (let k = 0; k <= 12; k++) { const t = k / 12; pts.push(new THREE.Vector3(lerp(POLES[i], POLES[i + 1], t), y - Math.sin(t * Math.PI) * 0.6 - (dz > 0 ? 0.1 : 0), 6.35 + dz)); }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));
}
function streetLamp(x) { cyl(0.05, 0.07, 6.2, M.steel, x, 0.12, 5.55, { seg: 8, cast: false }); box(1.2, 0.08, 0.1, M.steel, x, 6.3, 5.7, { cast: false, parent: scene }); const h = box(0.5, 0.14, 0.26, lampMat, x, 6.18, 6.2, { cast: false }); }
streetLamp(-4.5); streetLamp(11);
plight('lamp1', -4.5, 6.0, 6.1, 0xffd9a0, 22); plight('lamp2', 11, 6.0, 6.1, 0xffd9a0, 22);

function car(x, z, color, ry = 0) {
  const g = grp(x, 0, z, ry); const body = mat(color, 0.35, { metalness: 0.4 }); body.userData.refl = 0.9;
  box(4.3, 0.7, 1.8, body, 0, 0.32, 0, { parent: g }); box(2.3, 0.62, 1.6, body, -0.1, 1.0, 0, { parent: g });
  box(2.31, 0.5, 1.62, new THREE.MeshStandardMaterial({ color: 0x1b2630, roughness: 0.1, metalness: 0.5 }), -0.1, 1.04, 0, { parent: g, cast: false });
  for (const [a, b] of [[1.3, 0.85], [-1.3, 0.85], [1.3, -0.85], [-1.3, -0.85]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 14), M.dark); w.rotation.x = Math.PI / 2; w.position.set(a, 0.34, b); g.add(w); }
  const hl = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffeecc, emissiveIntensity: 0 }); NIGHT_MATS.push({ m: hl, k: 0.6 });
  box(0.06, 0.16, 1.3, hl, 2.17, 0.5, 0, { parent: g, cast: false });
  box(0.06, 0.12, 1.3, new THREE.MeshStandardMaterial({ color: 0x700, emissive: 0xff1100, emissiveIntensity: 0.15 }), -2.17, 0.55, 0, { parent: g, cast: false });
  const rx = Math.abs(Math.cos(ry)) > 0.5; addCol(x - (rx ? 2.2 : 0.95), x + (rx ? 2.2 : 0.95), z - (rx ? 0.95 : 2.2), z + (rx ? 0.95 : 2.2), 0, 1.5);
}
car(-18, 10.1, 0xe9ebec); car(-9.5, 10.0, 0x24344d, Math.PI); car(31, 10.2, 0x7b8086);
// vending machine (interactive) beside the convenience store
{
  const g = grp(9.2, 0.12, 11.55); box(1.0, 1.9, 0.8, mat(0x1f5aa8, 0.4), 0, 0, 0, { parent: g, col: false });
  const fm = new THREE.MeshStandardMaterial({ color: 0x223, emissive: 0xfff0d0, emissiveIntensity: 0.55 }); NIGHT_MATS.push({ m: fm, k: 0.8, base: 0.55 });
  const front = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.2), fm); front.position.set(0, 1.15, -0.41); front.rotation.y = Math.PI; g.add(front);
  addCol(8.65, 9.75, 11.15, 11.95, 0.1, 2);
  addInteract({ pos: new THREE.Vector3(9.2, 1.2, 11.2), r: 2.2, label: () => T('vend'), act() { toast(T('vend_t')); sfx('click'); } });
}
// recycling bins (분리수거) and a laundry-free bicycle
for (const [i, c] of [0x2b7bd1, 0x3a9b4a, 0xe0b52a].entries()) box(0.7, 1.0, 0.6, mat(c, 0.6), -9.6 + i * 0.8, 0.12, 5.6, { col: true });
{
  const g = grp(7.0, 0.06, 0.2, 0.2); const ring = new THREE.TorusGeometry(0.34, 0.025, 6, 20);
  for (const x of [-0.5, 0.5]) { const w = new THREE.Mesh(ring, M.dark); w.position.set(x, 0.34, 0); g.add(w); }
  box(1.0, 0.04, 0.04, mat(0xc0392b, 0.5), 0, 0.5, 0, { parent: g, cast: false }); box(0.04, 0.5, 0.04, mat(0xc0392b, 0.5), -0.2, 0.3, 0, { parent: g, cast: false });
}
// onggi jars (장독대), flower pots (chrysanthemums) in the yard
for (const [x, z, s] of [[6.6, 0.1, 1], [7.3, 0.4, 0.8], [7.0, 0.9, 0.65]]) { const j = new THREE.Mesh(new THREE.SphereGeometry(0.32 * s, 14, 10), mat(0x6b3f27, 0.6)); j.scale.y = 1.15; j.position.set(x, 0.06 + 0.34 * s, z); j.castShadow = true; scene.add(j); cyl(0.2 * s, 0.2 * s, 0.07, mat(0x4d2c1b, 0.6), x, 0.06 + 0.68 * s, z, { cast: false }); }
for (const [x, z, c] of [[-2.8, 3.6, 0xf2c230], [-1.9, 4.2, 0xb55fd0], [2.4, 4.4, 0xf2c230], [3.1, 3.8, 0xe86b3a], [-7.2, 0.6, 0xe86b3a]]) { cyl(0.2, 0.15, 0.3, mat(0xb4623c, 0.7), x, 0.06, z, { cast: false }); const b = sph(0.26, mat(c, 0.8), x, 0.28, z, { seg: 8 }); b.scale.y = 0.7; }
// AC outdoor units on the facade side + laundry pole are built with the house

// ───────────────────────── far skyline: apartments, hills, tower ─────────────────────────
const aptMat = facade('stucco', 31, 0.5); aptMat.userData.tile = [12.8, 9.3];
for (let i = 0; i < 46; i++) {
  const a = rnd() * 6.283, r = 140 + rnd() * 150, fl = 9 + Math.floor(rnd() * 16), w = 24 + rnd() * 22, d = 14 + rnd() * 6;
  const x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.abs(z - 9) < 40 && Math.abs(x) < 100) continue;
  const m = new THREE.Mesh(boxGeo(w, fl * 3.1, d, 12.8, 9.3), aptMat); m.position.set(x, fl * 1.55, z); m.rotation.y = rnd() * 3; scene.add(m);
}
{ // hills ring
  const seg = 160, pos = [], idx = [];
  for (let i = 0; i <= seg; i++) { const a = i / seg * Math.PI * 2; const n = Math.sin(a * 3) * 0.5 + Math.sin(a * 7 + 1) * 0.3 + Math.sin(a * 13 + 2) * 0.2; const hgt = 30 + (n + 1) * 70; for (const [r, y] of [[560, -5], [520, hgt]]) pos.push(Math.cos(a) * r, y, Math.sin(a) * r); }
  for (let i = 0; i < seg; i++) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x4d5a52, roughness: 1, side: THREE.DoubleSide, flatShading: true })); scene.add(m);
}
{ // a lit tower on a far hill (남산타워-like silhouette)
  const hill = new THREE.Mesh(new THREE.ConeGeometry(150, 95, 24), new THREE.MeshStandardMaterial({ color: 0x46564a, roughness: 1, flatShading: true })); hill.position.set(70, 30, -330); scene.add(hill);
  const tm = new THREE.MeshStandardMaterial({ color: 0xd7d9dc, roughness: 0.5, emissive: 0xfff2d0, emissiveIntensity: 0 }); NIGHT_MATS.push({ m: tm, k: 0.8 });
  const t = new THREE.Group(); t.position.set(70, 77, -330);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 4.2, 70, 12), tm); shaft.position.y = 35; t.add(shaft);
  const pod = new THREE.Mesh(new THREE.CylinderGeometry(9, 7, 7, 16), tm); pod.position.y = 60; t.add(pod);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.7, 30, 6), tm); ant.position.y = 83; t.add(ant);
  const blink = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2a1a })); blink.position.y = 98; t.add(blink);
  TICKERS.push((dt, time) => { blink.visible = Math.sin(time * 3) > 0; }); scene.add(t);
}

