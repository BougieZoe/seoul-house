// ───────────────────────── interaction state ─────────────────────────
const S = {
  door: true, fridge: false, tv: false, shower: false, ondol: false, flush: 0,
  f1: null, f2: null, bath: null, lamp: null,   // null = automatic (on when dark)
  ramen: 'none',                               // none | have | cooking | ready | bowl | eaten
  cookT: 0, seated: false, sleeping: false, showerLvl: 0, fog: 0, ate: 0,
};
const ROOMS = {};
function room(name, key, x, y, z, color, dist, intensity) {
  const l = plight(name, x, y, z, color, dist);
  const m = new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: color, emissiveIntensity: 0, roughness: 0.5 });
  const f = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 20), m); f.position.set(x, y + 0.2, z); scene.add(f);
  ROOMS[name] = { light: l, mat: m, key, I: intensity };
  return l;
}
const bcache = new Map();
function cm(color, rough = 0.7, metal = 0) { const k = color + '_' + rough + '_' + metal; if (!bcache.has(k)) bcache.set(k, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })); return bcache.get(k); }
function bx(p, w, h, d, color, x, y, z, o = {}) { return box(w, h, d, typeof color === 'object' ? color : cm(color, o.r ?? 0.7), x, y, z, Object.assign({ parent: p, cast: false }, o)); }
function addColO(x0, x1, z0, z1, y0, y1) { const c = { x0, x1, z0, z1, y0, y1, off: false }; COLS.push(c); return c; }

// ───────────────────────── steam / water particles ─────────────────────────
function makeSteam(x, y, z, count, spread, rise, size, speed, tint, parent = scene) {
  const g = new THREE.BufferGeometry(); const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count * 4; i++) seeds[i] = Math.random();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  const u = { uTime: WU.uTime, uAmt: { value: 0 }, uRise: { value: rise }, uSpread: { value: spread }, uSpeed: { value: speed }, uSize: { value: size }, uScale: PU.uScale, uTint: { value: new THREE.Vector3(tint, tint, tint) } };
  const m = new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false,
    vertexShader: `attribute vec4 aSeed; uniform float uTime,uRise,uSpread,uSpeed,uSize,uScale,uAmt; varying float vA;
    void main(){ float life = fract(uTime*uSpeed + aSeed.w);
      vec3 p = vec3((aSeed.x-0.5)*uSpread, life*uRise, (aSeed.z-0.5)*uSpread);
      p.x += sin(life*5.0 + aSeed.y*6.28)*0.04*uRise*life; p.z += cos(life*4.0 + aSeed.x*6.28)*0.03*uRise*life;
      vec4 mv = modelViewMatrix*vec4(p,1.0); gl_Position = projectionMatrix*mv;
      gl_PointSize = uSize*(0.5+life*1.4)*uScale/max(-mv.z,0.1);
      vA = (1.0-life)*smoothstep(0.0,0.12,life)*uAmt; }`,
    fragmentShader: `uniform vec3 uTint; varying float vA; void main(){ float d = length(gl_PointCoord-0.5)*2.0; float a = smoothstep(1.0,0.0,d)*vA*0.38; if(a<0.004) discard; gl_FragColor = vec4(uTint,a);
#include <colorspace_fragment>
}`,
  });
  const p = new THREE.Points(g, m); p.position.set(x, y, z); p.frustumCulled = false; p.renderOrder = 5; parent.add(p);
  return { points: p, u };
}
function makeDrops(x, y, z, count, spread, fall, speed) {
  const g = new THREE.BufferGeometry(); const seeds = new Float32Array(count * 4); for (let i = 0; i < count * 4; i++) seeds[i] = Math.random();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  const u = { uTime: WU.uTime, uAmt: { value: 0 }, uFall: { value: fall }, uSpread: { value: spread }, uSpeed: { value: speed } };
  const m = new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false,
    vertexShader: `attribute vec4 aSeed; uniform float uTime,uFall,uSpread,uSpeed,uAmt; varying float vA;
    void main(){ float life = fract(uTime*uSpeed + aSeed.w);
      vec3 p = vec3((aSeed.x-0.5)*uSpread*(0.3+life), -life*life*uFall, (aSeed.z-0.5)*uSpread*(0.3+life));
      vec4 mv = modelViewMatrix*vec4(p,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = 2.2; vA = uAmt*step(life,0.98); }`,
    fragmentShader: `varying float vA; void main(){ if(vA<0.01) discard; gl_FragColor = vec4(0.78,0.9,1.0,0.7);
#include <colorspace_fragment>
}`,
  });
  const p = new THREE.Points(g, m); p.position.set(x, y, z); p.frustumCulled = false; p.renderOrder = 5; scene.add(p);
  return { points: p, u };
}

// ───────────────────────── the house shell ─────────────────────────
const HX0 = -6, HX1 = 6, HZ0 = -11, HZ1 = -2, WT = 0.25;
const IX0 = -5.875, IX1 = 5.875, IZ0 = -10.875, IZ1 = -2.125;
const Y1 = 0.1, Y2 = 3.1, Y3 = 6.1;
function glassPane(axis, c, h) {
  const w = h.a1 - h.a0, hh = h.b1 - h.b0, ac = (h.a0 + h.a1) / 2, yc = (h.b0 + h.b1) / 2;
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), M.glassStd);
  if (axis === 'x') gl.position.set(ac, yc, c); else { gl.position.set(c, yc, ac); gl.rotation.y = Math.PI / 2; }
  scene.add(gl);
  const fr = (ww, hh2, aa, yy) => { if (axis === 'x') bx(scene, ww, hh2, 0.07, M.frame, aa, yy, c, { recv: false }); else bx(scene, 0.07, hh2, ww, M.frame, c, yy, aa, { recv: false }); };
  fr(w, 0.06, ac, h.b1 - 0.06); fr(w, 0.06, ac, h.b0); fr(0.06, hh, h.a0 + 0.03, h.b0); fr(0.06, hh, h.a1 - 0.03, h.b0); fr(0.04, hh, ac, h.b0);
  if (axis === 'x') bx(scene, w + 0.12, 0.04, 0.34, M.plaster, ac, h.b0 - 0.02, c, { recv: false }); else bx(scene, 0.34, 0.04, w + 0.12, M.plaster, c, h.b0 - 0.02, ac, { recv: false });
}
function wallRun(axis, c, a0, a1, y0, y1, out, holes = []) {
  const p = M.plaster, b = M.brick, wm = [p, p, p, p, p, p];
  if (out) { wm[{ '+x': 0, '-x': 1, '+z': 4, '-z': 5 }[out]] = b; wm[2] = b; }
  const piece = (a, q, u, v) => {
    if (q - a < 0.01 || v - u < 0.01) return;
    if (axis === 'x') box(q - a, v - u, WT, wm, (a + q) / 2, u, c, { col: [u, v], tile: [1.05, 0.52], cast: true });
    else box(WT, v - u, q - a, wm, c, u, (a + q) / 2, { col: [u, v], tile: [1.05, 0.52], cast: true });
  };
  let cur = a0; const hs = holes.slice().sort((a, b2) => a.a0 - b2.a0);
  for (const h of hs) { piece(cur, h.a0, y0, y1); piece(h.a0, h.a1, y0, h.b0); piece(h.a0, h.a1, h.b1, y1); cur = h.a1; if (h.g) glassPane(axis, c, h); }
  piece(cur, a1, y0, y1);
}
// 1F outer walls
wallRun('x', -2, -6, 6, 0, Y2, '+z', [{ a0: -0.55, a1: 0.55, b0: 0, b1: 2.2 }, { a0: -4.8, a1: -2.4, b0: 0.9, b1: 2.2, g: 1 }, { a0: 1.9, a1: 3.5, b0: 0.9, b1: 2.2, g: 1 }]);
wallRun('x', -11, -6, 6, 0, Y2, '-z', [{ a0: -4.6, a1: -3.0, b0: 1.1, b1: 2.2, g: 1 }]);
wallRun('z', -6, -11, -2, 0, Y2, '-x', [{ a0: -8.2, a1: -5.0, b0: 0.9, b1: 2.2, g: 1 }]);
wallRun('z', 6, -11, -2, 0, Y2, '+x', [{ a0: -10.4, a1: -9.3, b0: 1.6, b1: 2.3, g: 1 }]);
// 2F outer walls
wallRun('x', -2, -6, 6, Y2, Y3, '+z', [{ a0: -3.2, a1: -0.6, b0: Y2, b1: 5.3 }, { a0: 1.0, a1: 3.4, b0: 4.0, b1: 5.3, g: 1 }]);
wallRun('x', -11, -6, 6, Y2, Y3, '-z', [{ a0: -1.9, a1: 1.9, b0: 4.3, b1: 5.4, g: 1 }]);
wallRun('z', -6, -11, -2, Y2, Y3, '-x', [{ a0: -9.5, a1: -6.0, b0: 4.0, b1: 5.3, g: 1 }]);
wallRun('z', 6, -11, -2, Y2, Y3, '+x', [{ a0: -7.0, a1: -4.0, b0: 4.0, b1: 5.3, g: 1 }]);
// bathroom partitions
wallRun('z', 3.6, -10.875, -8.85, 0, Y2 - 0.2, null, [{ a0: -10.3, a1: -9.4, b0: 0, b1: 2.1 }]);
wallRun('x', -8.85, 3.6, 6, 0, Y2 - 0.2, null, []);
// floors and slabs
box(12, 0.1, 9, M.ceiling, 0, 0, -6.5, { cast: false });
box(11.7, 0.02, 8.75, M.wood, 0, Y1 - 0.02 + 0.02, -6.5, { cast: false, tile: [1.2, 1.2] });
const floorWood = M.wood;
function slabY(x0, x1, z0, z1, y) { box(x1 - x0, 0.2, z1 - z0, M.ceiling, (x0 + x1) / 2, y - 0.2, (z0 + z1) / 2, { cast: true }); box(x1 - x0 - 0.1, 0.02, z1 - z0 - 0.1, y === Y2 ? floorWood : M.roof, (x0 + x1) / 2, y, (z0 + z1) / 2, { cast: false, tile: y === Y2 ? [1.2, 1.2] : [1.5, 1.5] }); }
slabY(-6, 3.7, -11, -2, Y2); slabY(3.7, 6, -11, -8.6, Y2);
slabY(-3.7, 6, -11, -2, Y3); slabY(-6, -3.7, -11, -8.6, Y3); slabY(-6, -5.8, -8.6, -2, Y3);
surf(IX0, IX1, IZ0, -1.875, Y1);
surf(-5.875, 3.7, -10.875, -1.875, Y2); surf(3.7, 5.875, -10.875, -8.6, Y2);
surf(-3.7, 6, -11, -2, Y3); surf(-6, -3.7, -11, -8.6, Y3); surf(-6, -5.8, -8.6, -2, Y3);
// special floors: entry tile, bathroom tile
box(3.8, 0.02, 1.25, M.tile2, 0, Y1 + 0.006, -2.76, { cast: false, tile: [0.6, 0.6] });
box(2.15, 0.02, 1.9, M.tile, 4.8, Y1 + 0.006, -9.925, { cast: false, tile: [0.6, 0.6] });
// balcony, canopy, parapet
box(8.4, 0.2, 1.5, M.concrete, 0, Y2 - 0.2, -1.1, { cast: true }); surf(-4.2, 4.2, -1.875, -0.4, Y2);
box(8.4, 0.03, 1.5, M.tile2, 0, Y2, -1.1, { cast: false, tile: [0.6, 0.6] });
box(8.4, 0.05, 0.05, M.frame, 0, Y2 + 1.05, -0.4, { col: [Y2, Y2 + 1.1] }); box(0.05, 1.05, 1.5, M.frame, -4.2, Y2, -1.1, { col: [Y2, Y2 + 1.1] }); box(0.05, 1.05, 1.5, M.frame, 4.2, Y2, -1.1, { col: [Y2, Y2 + 1.1] });
for (let i = 0; i <= 16; i++) bx(scene, 0.03, 1.0, 0.03, M.frame, -4.2 + i * 0.525, Y2, -0.4, { recv: false });
for (const x of [-3.4, 3.0]) { cyl(0.18, 0.14, 0.3, cm(0xb4623c), x, Y2, -0.8, { cast: false }); sph(0.25, cm(0x3f7d46, 0.9), x, Y2 + 0.2, -0.8, { seg: 8 }); }
box(0.9, 0.7, 0.35, acMat, 3.3, Y2, -1.1, { cast: false });
// 2F sliding door panel (half open) + front door canopy lamp
{ const g = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.1), M.glassStd); g.position.set(-1.25, Y2 + 1.1, -1.99); scene.add(g); bx(scene, 0.05, 2.1, 0.06, M.frame, -0.6, Y2, -1.99); bx(scene, 0.05, 2.1, 0.06, M.frame, -1.9, Y2, -1.99); }
// roof parapet with colliders
{
  const ph = 0.95, pm = [M.brick];
  box(12.3, ph, 0.25, M.brick, 0, Y3, -2.0, { col: [Y3, Y3 + ph], cast: false }); box(12.3, ph, 0.25, M.brick, 0, Y3, -11.0, { col: [Y3, Y3 + ph], cast: false });
  box(0.25, ph, 9, M.brick, -6, Y3, -6.5, { col: [Y3, Y3 + ph], cast: false }); box(0.25, ph, 9, M.brick, 6, Y3, -6.5, { col: [Y3, Y3 + ph], cast: false });
  box(12.5, 0.06, 0.4, M.concrete, 0, Y3 + ph, -2.0, { cast: false }); box(12.5, 0.06, 0.4, M.concrete, 0, Y3 + ph, -11.0, { cast: false }); box(0.4, 0.06, 9.2, M.concrete, -6, Y3 + ph, -6.5, { cast: false }); box(0.4, 0.06, 9.2, M.concrete, 6, Y3 + ph, -6.5, { cast: false });
}
// ───────────────────────── stairs ─────────────────────────
function stairs(x0, x1, zS, zE, yS, yE, n, base) {
  const rise = (yE - yS) / n, dz = (zE - zS) / n;
  for (let i = 0; i < n; i++) { const top = yS + (i + 1) * rise; box(x1 - x0, top - base, Math.abs(dz), M.wood, (x0 + x1) / 2, base, zS + (i + 0.5) * dz, { cast: false, tile: [1.2, 1.2] }); }
  RAMPS.push({ x0, x1, zA: zS, yA: yS, zB: zE, yB: yE });
}
stairs(3.7, 5.8, -2.4, -8.6, Y1, Y2, 16, 0); stairs(-5.8, -3.7, -2.4, -8.6, Y2, Y3, 16, Y2);
function handrail(x, zS, yS, zE, yE) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1), M.frame); const a = new THREE.Vector3(x, yS + 0.95, zS), b = new THREE.Vector3(x, yE + 0.95, zE); r.position.copy(a).add(b).multiplyScalar(0.5); r.scale.z = a.distanceTo(b); r.lookAt(b); scene.add(r); }
handrail(3.78, -2.4, Y1, -8.6, Y2); handrail(-3.78, -2.4, Y2, -8.6, Y3);
addCol(3.6, 3.72, -8.6, -3.4, 0, 3.2); addCol(3.6, 3.72, -8.6, -2.2, Y2, Y2 + 1.1);
addCol(-3.72, -3.6, -8.6, -3.4, Y2, Y3 + 0.95); addCol(-3.72, -3.6, -3.4, -2.2, Y3, Y3 + 0.95); addCol(-5.8, -3.6, -2.3, -2.1, Y3, Y3 + 0.95);

// ───────────────────────── front door (swings; open by default) ─────────────────────────
const doorPivot = new THREE.Group(); doorPivot.position.set(-0.55, Y1, -2); scene.add(doorPivot);
box(1.1, 2.1, 0.06, cm(0x4a3a30, 0.6), 0.55, 0, 0, { parent: doorPivot, cast: true });
bx(doorPivot, 0.04, 0.04, 0.12, M.steel, 0.95, 1.0, 0.06); bx(doorPivot, 0.3, 0.5, 0.01, cm(0x9ab0bd, 0.2), 0.55, 1.2, 0.035);
const doorCol = addColO(-0.55, 0.55, -2.04, -1.96, 0, 2.2);
let doorAng = 1.75;
// ───────────────────────── lights (real lights live in rooms) ─────────────────────────
room('living', 'f1', 1.6, 2.55, -6.4, 16774118, 11, 20);
room('kitchen', 'f1', -3.2, 2.55, -8.6, 16774118, 10, 17);
room('bath', 'bath', 4.8, 2.5, -9.9, 15990783, 5.5, 7);
room('bed', 'f2', 0.4, 5.5, -7.0, 16773878, 11, 16);
plight('bedside', -0.9, 4.0, -10.3, 0xffb86b, 5);
plight('tv', 1.6, 1.4, -8.8, 0x6aa0ff, 5.5);
plight('roof', 0, 7.1, -6.5, 0xffc27a, 9);

// ───────────────────────── 1F: entry, kitchen, living ─────────────────────────
const wd = (c) => cm(c, 0.6);
// entry: shoe cabinet + shoes + mat
bx(scene, 1.0, 1.0, 0.36, wd(0xd8cfc0), -1.9, Y1, -2.35, { col: true });
bx(scene, 1.2, 0.012, 0.8, cm(0x364a58, 1), 0, Y1 + 0.03, -2.95);
[[-0.7, -3.3, 0.3, 0xf2f2f2], [-0.45, -3.2, -0.5, 0x2a2a2a], [0.5, -2.9, 0.1, 0xc9a77a]].forEach(([x, z, r, c]) => { const s = bx(scene, 0.12, 0.09, 0.3, c, x, Y1 + 0.02, z, { r: 0.6 }); s.rotation.y = r; });
bx(scene, 0.12, 0.09, 0.3, 0x2a4a8a, 0.9, Y1, -3.4, { r: 0.5 });
// kitchen run on the north wall
const KZ = -10.55;
// (fridge body is built hollow in p7_life.js; its collider is fridgeCol below)
bx(scene, 4.5, 0.86, 0.6, 0xe8e3d8, -2.85, Y1, KZ - 0.0, { col: true, cast: true }); // base cabinets
bx(scene, 4.55, 0.04, 0.64, 0x4b4f55, -2.85, Y1 + 0.86, KZ, { r: 0.4 });          // counter top
bx(scene, 0.5, 0.02, 0.4, 0xaab2b8, -3.8, Y1 + 0.9, KZ, { r: 0.2 }); bx(scene, 0.03, 0.22, 0.03, M.steel, -3.8, Y1 + 0.9, KZ - 0.22);
bx(scene, 0.62, 0.02, 0.5, 0x18191b, -2.2, Y1 + 0.9, KZ, { r: 0.3 });             // hob
const burnerMat = new THREE.MeshStandardMaterial({ color: 0x223a66, emissive: 0x4aa3ff, emissiveIntensity: 0, roughness: 0.4 });
const burner = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 6, 20), burnerMat); burner.rotation.x = Math.PI / 2; burner.position.set(-2.2, Y1 + 0.925, KZ); scene.add(burner);
bx(scene, 0.7, 0.14, 0.45, M.steel, -2.2, Y1 + 1.75, KZ - 0.05, { r: 0.3 }); bx(scene, 0.22, 0.6, 0.22, M.steel, -2.2, Y1 + 1.9, KZ - 0.12, { r: 0.3 });
bx(scene, 1.3, 0.7, 0.36, 0xece6da, -1.0, Y1 + 1.5, KZ - 0.12, { col: false }); // pantry cupboard (ramen lives here)
bx(scene, 0.02, 0.6, 0.01, 0x8a8174, -1.0, Y1 + 1.55, KZ + 0.07);
// fridge door (swings)
const fridgeDoor = new THREE.Group(); fridgeDoor.position.set(-5.75, Y1, KZ + 0.42); scene.add(fridgeDoor);
box(0.7, 1.86, 0.06, cm(0xf0f2f2, 0.3), 0.35, 0, 0, { parent: fridgeDoor, cast: false }); bx(fridgeDoor, 0.03, 0.6, 0.04, M.steel, 0.62, 0.8, 0.05);
const fridgeInside = new THREE.MeshStandardMaterial({ color: 0xf6f8f8, emissive: 0xfff6dd, emissiveIntensity: 0, roughness: 0.6 });
const fridgeCol = addColO(-5.75, -5.05, KZ - 0.3, KZ + 0.4, 0, 1.9);
// pot on the stove
const pot = new THREE.Group(); pot.position.set(-2.2, Y1 + 0.92, KZ); scene.add(pot);
cyl(0.15, 0.14, 0.16, M.steel, 0, 0, 0, { parent: pot, cast: false, seg: 18 });
const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.02, 18), M.steel); lid.position.y = 0.17; pot.add(lid);
bx(pot, 0.16, 0.02, 0.03, M.dark, 0.22, 0.12, 0);
const potWater = new THREE.Mesh(new THREE.CircleGeometry(0.13, 18), cm(0xd7c28a, 0.2)); potWater.rotation.x = -Math.PI / 2; potWater.position.y = 0.12; pot.add(potWater);
pot.visible = false;
// dining table, chairs, bowl
bx(scene, 1.5, 0.05, 0.82, 0xd6b88e, -3.2, Y1 + 0.72, -7.4, { r: 0.5, col: false }); [[-0.65, -0.34], [0.65, -0.34], [-0.65, 0.34], [0.65, 0.34]].forEach(([a, b]) => bx(scene, 0.05, 0.72, 0.05, 0x8a6a4a, -3.2 + a, Y1, -7.4 + b));
addCol(-3.95, -2.45, -7.82, -6.98, 0, 0.8);
const bowl = new THREE.Group(); bowl.position.set(-3.2, Y1 + 0.745, -7.4); scene.add(bowl);
{ const bm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.08, 0.1, 18), cm(0xf4efe4, 0.3)); bm.position.y = 0.05; bowl.add(bm);
  const br = new THREE.Mesh(new THREE.CircleGeometry(0.12, 18), cm(0xc0391b, 0.3)); br.rotation.x = -Math.PI / 2; br.position.y = 0.095; bowl.add(br);
  const nd = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.03, 6, 14), cm(0xe8c96a, 0.7)); nd.rotation.x = Math.PI / 2; nd.position.y = 0.105; bowl.add(nd);
  const egg = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), cm(0xfff3c4, 0.5)); egg.position.set(0.05, 0.11, 0.03); egg.scale.y = 0.6; bowl.add(egg);
  const ch = bx(bowl, 0.012, 0.01, 0.14, 0x3a3a3a, 0.14, 0.11, 0.0); ch.rotation.y = 0.2; const ch2 = bx(bowl, 0.012, 0.01, 0.14, 0x3a3a3a, 0.16, 0.11, 0.0); ch2.rotation.y = 0.12; }
bowl.visible = false;
// living: rug, sofa, table, TV
bx(scene, 2.8, 0.02, 1.9, 0x8d5a4a, 1.6, Y1 + 0.014, -8.1, { r: 1 });
const sofa = grp(1.6, Y1, -6.1);
addCol(0.45, 2.75, -6.6, -5.55, 0, 1.0);
bx(scene, 1.0, 0.04, 0.55, 0xb08a5c, 1.6, Y1 + 0.38, -7.9, { r: 0.5 }); for (const [a, b] of [[-0.45, -0.22], [0.45, -0.22], [-0.45, 0.22], [0.45, 0.22]]) bx(scene, 0.04, 0.38, 0.04, 0x6a4a2a, 1.6 + a, Y1, -7.9 + b);
bx(scene, 1.8, 0.5, 0.4, 0xcdbfa8, 1.6, Y1, -10.6, { col: true, cast: true });
const tvMat = new THREE.ShaderMaterial({
  uniforms: { uTime: WU.uTime, uOn: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `varying vec2 vUv; uniform float uTime, uOn;
  void main(){ vec2 uv = vUv; float t = floor(uTime*0.5); float k = fract(sin(t*12.9898)*43758.5453);
    vec3 c = 0.5+0.5*cos(6.28318*(k+vec3(0.,.33,.67)+uv.y*0.4+0.15*sin(uTime+uv.x*5.)));
    c *= 0.5+0.5*(sin(uv.x*3.+uTime*0.7+k*6.)*0.5+0.5);
    c *= step(0.1,uv.y)*step(uv.y,0.9)*0.9+0.1; c *= 0.92+0.08*sin(uv.y*380.);
    gl_FragColor = vec4(mix(vec3(0.02,0.02,0.025), c, uOn),1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}`,
});
bx(scene, 1.4, 0.8, 0.05, 0x111214, 1.6, Y1 + 0.9, -10.82, { r: 0.4 });
const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.7), tvMat); tvScreen.position.set(1.6, Y1 + 1.3, -10.79); scene.add(tvScreen);
bx(scene, 0.04, 0.4, 0.2, 0x222222, 1.6, Y1 + 0.5, -10.7);
// floor lamp, plant
{ cyl(0.02, 0.02, 1.5, M.dark, 3.15, Y1, -6.0, { cast: false }); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.26, 14, 1, true), new THREE.MeshStandardMaterial({ color: 0xf1e3c4, emissive: 0xffc980, emissiveIntensity: 0.0, side: THREE.DoubleSide })); sh.position.set(3.15, Y1 + 1.55, -6.0); scene.add(sh); NIGHT_HOOKS.push((n) => { sh.material.emissiveIntensity = (S.f1 ?? n > 0.4) ? 0.9 : 0.05; }); }
cyl(0.2, 0.15, 0.4, cm(0xb4623c), 0.2, Y1, -10.4, { cast: false }); sph(0.38, cm(0x3f7d46, 0.9), 0.2, Y1 + 0.35, -10.4, { seg: 8 });
// thermostat (보일러) and light switch panels
const thermoMat = new THREE.MeshStandardMaterial({ color: 0x1b2a1f, emissive: 0x5cff8a, emissiveIntensity: 0.3 });
bx(scene, 0.16, 0.1, 0.02, thermoMat, 1.45, Y1 + 1.25, -2.15); bx(scene, 0.08, 0.12, 0.015, 0xf2efe6, -1.15, Y1 + 1.2, -2.15);
bx(scene, 0.08, 0.12, 0.015, 0xf2efe6, 3.0, Y2 + 1.2, -10.82); bx(scene, 0.08, 0.12, 0.015, 0xf2efe6, 3.45, Y1 + 1.2, -8.97 - 0.0);

// ───────────────────────── bathroom ─────────────────────────
bx(scene, 0.4, 0.4, 0.62, 0xfafafa, 4.35, Y1, -10.55, { r: 0.2, col: true }).visible = false; // collider only; the toilet itself is built in p8
bx(scene, 0.55, 0.12, 0.42, 0xfafafa, 4.1, Y1 + 0.78, -9.2, { r: 0.2, col: true }); bx(scene, 0.2, 0.78, 0.2, 0xfafafa, 4.1, Y1, -9.22, { r: 0.3 }); bx(scene, 0.03, 0.14, 0.03, M.steel, 4.1, Y1 + 0.9, -9.3);
bx(scene, 0.04, 2.1, 1.2, cm(0xcfe8f0, 0.1), 4.88, Y1, -10.28, { cast: false }).material = new THREE.MeshStandardMaterial({ color: 0xcfe8f0, transparent: true, opacity: 0.25, roughness: 0.1 });
bx(scene, 0.03, 0.03, 0.4, M.steel, 5.55, Y1 + 1.95, -10.72); bx(scene, 0.12, 0.03, 0.12, M.steel, 5.55, Y1 + 1.95, -10.5);
bx(scene, 0.03, 1.5, 0.03, M.steel, 5.8, Y1 + 0.6, -10.8); bx(scene, 0.4, 0.02, 0.5, 0xb8c2c8, 5.5, Y1, -10.55, { r: 0.4 });
// mirror (true reflection), steam fog layer in front
let mirror;
try { const { Reflector } = await import('three/addons/objects/Reflector.js'); mirror = new Reflector(new THREE.PlaneGeometry(0.8, 0.9), { textureWidth: 512, textureHeight: 512, color: 0xaab8c0, clipBias: 0.003 }); }
catch (e) { mirror = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9), new THREE.MeshStandardMaterial({ color: 0x8aa0aa, metalness: 1, roughness: 0.08 })); }
mirror.position.set(4.1, Y1 + 1.65, -8.99); mirror.rotation.y = Math.PI; scene.add(mirror);
bx(scene, 0.86, 0.96, 0.03, M.frame, 4.1, Y1 + 1.2, -8.96, { recv: false });
const mirrorFog = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9), new THREE.MeshBasicMaterial({ color: 0xe6eef2, transparent: true, opacity: 0, depthWrite: false }));
mirrorFog.position.set(4.1, Y1 + 1.65, -9.01); mirrorFog.rotation.y = Math.PI; scene.add(mirrorFog);
const showerDrops = makeDrops(5.55, Y1 + 1.93, -10.5, 260, 0.35, 1.9, 1.4);
const showerSteam = makeSteam(4.8, Y1 + 0.6, -10.0, 40, 1.6, 1.8, 0.9, 0.12, 0.92);
const potSteam = makeSteam(-2.2, Y1 + 1.1, KZ, 26, 0.25, 0.9, 0.45, 0.35, 0.92);
const bowlSteam = makeSteam(-3.2, Y1 + 0.88, -7.4, 18, 0.18, 0.55, 0.26, 0.32, 0.95);
const kitchenSteam = makeSteam(-2.2, Y1 + 1.7, KZ + 0.1, 30, 0.6, 1.0, 0.7, 0.14, 0.9);

// ───────────────────────── 2F: bedroom ─────────────────────────
bx(scene, 2.0, 0.28, 2.1, 0x8a6a4a, 0.4, Y2, -9.7, { r: 0.6, col: [Y2, Y2 + 0.6] });
bx(scene, 1.9, 0.2, 2.0, 0xf4efe6, 0.4, Y2 + 0.28, -9.7, { r: 1 }); bx(scene, 2.0, 0.55, 0.12, 0x6e5238, 0.4, Y2, -10.8, { r: 0.6 });
bx(scene, 0.45, 0.5, 0.4, 0xc9a77a, -1.0, Y2, -10.65, { col: true }); bx(scene, 0.45, 0.5, 0.4, 0xc9a77a, 1.8, Y2, -10.65, { col: true });
const lampShade = new THREE.MeshStandardMaterial({ color: 0xf3e0bd, emissive: 0xffa84a, emissiveIntensity: 0, roughness: 0.8 });
bx(scene, 0.14, 0.2, 0.14, 0x333333, -1.0, Y2 + 0.5, -10.65); const ls = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.2, 12), lampShade); ls.position.set(-1.0, Y2 + 0.8, -10.65); scene.add(ls);
bx(scene, 2.4, 0.02, 1.8, 0xb9c2a8, 0.4, Y2 + 0.014, -8.4, { r: 1 });
bx(scene, 1.4, 0.04, 0.7, 0xd6b88e, 2.7, Y2 + 0.74, -10.45, { col: false }); bx(scene, 0.05, 0.74, 0.65, 0x555555, 2.1, Y2, -10.45); bx(scene, 0.05, 0.74, 0.65, 0x555555, 3.3, Y2, -10.45); addCol(2.0, 3.4, -10.8, -10.1, Y2, Y2 + 0.8);
bx(scene, 0.6, 2.2, 1.6, 0xe7e1d4, -5.55, Y2, -7.2, { col: true, cast: true }); bx(scene, 0.02, 1.9, 0.7, 0xcdc5b4, -5.24, Y2 + 0.15, -7.55); bx(scene, 0.02, 1.9, 0.7, 0xcdc5b4, -5.24, Y2 + 0.15, -6.85);
bx(scene, 0.9, 0.02, 0.9, 0x4a4036, -1.8, Y2 + 0.014, -4.5, { r: 1 }); // yoga mat style rug
// roof furniture
{
  const rx = 2.5, rz = -4.5;
  bx(scene, 1.3, 0.05, 0.8, 0xc9a77a, rx, Y3 + 0.72, rz, { r: 0.6 }); for (const [a, b] of [[-0.55, -0.32], [0.55, -0.32], [-0.55, 0.32], [0.55, 0.32]]) bx(scene, 0.05, 0.72, 0.05, 0x6a4a2a, rx + a, Y3, rz + b); addCol(rx - 0.65, rx + 0.65, rz - 0.4, rz + 0.4, Y3, Y3 + 0.8);
  for (const [x, z, r] of [[rx - 0.5, rz + 0.8, Math.PI], [rx + 0.5, rz + 0.8, Math.PI], [rx - 0.5, rz - 0.8, 0], [rx + 0.5, rz - 0.8, 0]]) { const g = grp(x, Y3, z, r); bx(g, 0.4, 0.04, 0.4, 0x2f6b8f, 0, 0.43, 0); bx(g, 0.4, 0.4, 0.04, 0x2f6b8f, 0, 0.45, 0.18); for (const [a, b] of [[-.17, -.17], [.17, -.17], [-.17, .17], [.17, .17]]) bx(g, 0.03, 0.43, 0.03, 0x333333, a, 0, b); }
  const teaMat = cm(0xf3d9a0, 0.5); bx(scene, 0.12, 0.1, 0.12, 0xfff2d6, rx - 0.2, Y3 + 0.77, rz, { r: 0.5 }); bx(scene, 0.12, 0.1, 0.12, 0xfff2d6, rx + 0.2, Y3 + 0.77, rz + 0.1, { r: 0.5 });
  // water tank, AC units, satellite dish, planter boxes (lettuce), laundry rack
  cyl(0.8, 0.8, 1.5, tankMat, 4.8, Y3, -10.0, { col: true, seg: 14 }); box(1.0, 0.7, 0.45, acMat, -4.9, Y3, -10.4, { col: true, cast: true }); box(1.0, 0.7, 0.45, acMat, -3.7, Y3, -10.4, { col: true, cast: true });
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 6, 0, Math.PI * 2, 0, 0.9), cm(0xdddddd, 0.4)); dish.position.set(5.3, Y3 + 1.2, -3.0); dish.rotation.set(-1.0, 0.3, 0); scene.add(dish); cyl(0.03, 0.03, 1.1, M.dark, 5.3, Y3, -3.1, { cast: false });
  for (const x of [-2.5, -1.4, -0.3]) { bx(scene, 0.9, 0.3, 0.45, 0x8a5a3a, x, Y3, -10.3, { col: true, r: 0.9 }); bx(scene, 0.8, 0.1, 0.38, 0x4a8a3a, x, Y3 + 0.3, -10.3, { r: 1 }); }
  const rackM = M.steel; for (const x of [-2.0, 0.4]) { bx(scene, 0.04, 1.3, 0.04, rackM, x, Y3, -6.2); bx(scene, 0.04, 1.3, 0.04, rackM, x, Y3, -4.8); } bx(scene, 2.5, 0.03, 0.03, rackM, -0.8, Y3 + 1.25, -6.2); bx(scene, 2.5, 0.03, 0.03, rackM, -0.8, Y3 + 1.25, -4.8);
  const cloth = [[-1.8, 0xf2f2ee, 0.7], [-1.2, 0x6f9fd0, 0.9], [-0.6, 0xe8b6c0, 0.6], [0.0, 0xf5f0d8, 0.8]]; cloth.forEach(([x, c, h]) => { const cl = bx(scene, 0.45, h, 0.02, c, x, Y3 + 1.25 - h, -6.2, { r: 1 }); cl.userData.sway = 1; TICKERS.push((dt, t) => { cl.rotation.z = Math.sin(t * 1.6 + x * 3) * (0.05 + WU.uRain.value * 0.0 + (S.windy || 0) * 0.15); }); });
  // string lights
  const bulbM = new THREE.MeshStandardMaterial({ color: 0xfff1cf, emissive: 0xffd08a, emissiveIntensity: 0 }); NIGHT_MATS.push({ m: bulbM, k: 2.5 });
  const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector3(lerp(-5.6, 5.6, t), Y3 + 2.4 - Math.sin(t * Math.PI) * 0.35, -6.5)); }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat)); pts.forEach((p, i) => { if (i % 1 === 0) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), bulbM); b.position.copy(p); b.position.y -= 0.08; scene.add(b); } });
  cyl(0.04, 0.04, 2.5, M.steel, -5.6, Y3, -6.5, { cast: false, seg: 6 }); cyl(0.04, 0.04, 2.5, M.steel, 5.6, Y3, -6.5, { cast: false, seg: 6 });
}

// ───────────────────────── interactions (all text via T()) ─────────────────────────
const V = (x, y, z) => new THREE.Vector3(x, y, z);
addInteract({ pos: V(0, 1.1, -2.05), r: 2.0, label: () => T(S.door ? 'door_close' : 'door_open'), act() { S.door = !S.door; sfx('door'); toast(T(S.door ? 'door_t1' : 'door_t0')); } });
addInteract({ pos: V(-1.15, 1.25, -2.15), r: 1.6, label: () => T('sw1'), act() { const on = S.f1 ?? WORLD.dark > 0.45; S.f1 = !on; S.bath = S.f1; sfx('click'); } });
addInteract({ pos: V(3.0, Y2 + 1.25, -10.8), r: 1.8, label: () => T('sw2'), act() { const on = S.f2 ?? WORLD.dark > 0.45; S.f2 = !on; sfx('click'); } });
addInteract({ pos: V(-1.0, Y2 + 0.8, -10.65), r: 1.9, label: () => T('lamp'), act() { const on = S.lamp ?? false; S.lamp = !on; sfx('click'); } });
addInteract({ pos: V(1.45, 1.25, -2.15), r: 1.6, label: () => T(S.ondol ? 'ondol_off' : 'ondol_on'), act() { S.ondol = !S.ondol; sfx('click'); toast(T(S.ondol ? 'ondol_t1' : 'ondol_t0')); } });
addInteract({ pos: V(-5.4, 1.1, -10.1), r: 1.9, label: () => T(S.fridge ? 'fr_close' : 'fr_open'), act() { S.fridge = !S.fridge; sfx('click'); if (S.fridge) toast(T('fr_t')); } });
addInteract({ pos: V(-1.0, 1.9, -10.3), r: 1.9, label: () => T(S.ramen === 'none' || S.ramen === 'eaten' ? 'cup_take' : 'cup_have'),
  act() { if (S.ramen === 'none' || S.ramen === 'eaten') { S.ramen = 'have'; sfx('click'); toast(T('cup_t1')); } else toast(T('cup_t2')); } });
addInteract({ pos: V(-2.2, 1.0, -10.0), r: 1.9,
  label: () => T({ none: 'st_none', have: 'st_have', cooking: 'st_cooking', ready: 'st_ready', bowl: 'st_idle', eaten: 'st_none' }[S.ramen]),
  act() {
    if (S.ramen === 'none' || S.ramen === 'eaten') toast(T('st_t0'));
    else if (S.ramen === 'have') { S.ramen = 'cooking'; S.cookT = 0; sfx('click'); toast(T('st_t1')); }
    else if (S.ramen === 'ready') { S.ramen = 'bowl'; sfx('slosh'); toast(T('st_t3')); }
  } });
addInteract({ pos: V(-3.2, 0.95, -7.4), r: 1.9, enabled: () => S.ramen === 'bowl', label: () => T('eat'), act() { S.ramen = 'eaten'; S.ate = 1; sfx('slurp'); toast(T('eat_t')); } });
addInteract({ pos: V(1.6, 1.0, -10.5), r: 4.0, label: () => T(S.tv ? 'tv_off' : 'tv_on'), act() { S.tv = !S.tv; sfx('click'); } });
addInteract({ pos: V(1.6, 0.6, -6.1), r: 1.7, enabled: () => !S.seated, label: () => T('sit'), act() { seatOn(1.6, -6.15, Y1 + 0.42, 0); } });
addInteract({ pos: V(5.4, 1.4, -10.3), r: 1.7, label: () => T(S.shower ? 'sh_off' : 'sh_on'), act() { S.shower = !S.shower; sfx('click'); if (S.shower) toast(T('sh_t')); } });
addInteract({ pos: V(4.35, 0.6, -10.4), r: 1.5, label: () => T('flush'), act() { S.flush = 3; sfx('flush'); } });
addInteract({ pos: V(4.1, 1.1, -9.3), r: 1.4, label: () => T('wash'), act() { sfx('water'); toast(T('wash_t')); } });
addInteract({ pos: V(0.4, Y2 + 0.5, -9.2), r: 2.2, label: () => T('sleep'), act() { goSleep(); } });
addInteract({ pos: V(2.7, Y2 + 0.9, -10.3), r: 1.7, label: () => T('pc'), act() { toast(T('pc_t')); } });

