// ───────────────────────── detail pass: interior ─────────────────────────
function artTex(kind) {
  return ctex(128, 160, (g, w, h) => {
    const pal = [['#e8d9c0', '#c0562f', '#2f4b6e', '#d9a441'], ['#dfe6e3', '#2f5d52', '#8fb3a4', '#f2efe6'], ['#1f2a44', '#f4d27a', '#c9553a', '#e9e2d0']][kind % 3];
    g.fillStyle = pal[0]; g.fillRect(0, 0, w, h);
    if (kind % 3 === 0) { g.fillStyle = pal[1]; g.fillRect(14, 20, 50, 70); g.fillStyle = pal[2]; g.fillRect(50, 60, 60, 80); g.fillStyle = pal[3]; g.beginPath(); g.arc(88, 38, 20, 0, 6.3); g.fill(); }
    else if (kind % 3 === 1) { g.fillStyle = pal[1]; g.beginPath(); g.moveTo(0, 120); g.lineTo(40, 60); g.lineTo(70, 100); g.lineTo(100, 50); g.lineTo(128, 110); g.lineTo(128, 160); g.lineTo(0, 160); g.fill(); g.fillStyle = pal[2]; g.beginPath(); g.arc(90, 30, 14, 0, 6.3); g.fill(); }
    else { g.fillStyle = pal[3]; g.beginPath(); g.arc(64, 50, 26, 0, 6.3); g.fill(); g.fillStyle = '#0c0f18'; g.beginPath(); g.moveTo(14, 130); g.quadraticCurveTo(64, 70, 114, 130); g.lineTo(114, 140); g.lineTo(14, 140); g.fill(); g.fillRect(30, 140, 68, 14); }
  });
}
function framePic(x, y, z, ry, w, h, kind) {
  const g = grp(x, y, z, ry); const fr = new THREE.Mesh(new THREE.BoxGeometry(w + 0.07, h + 0.07, 0.03), cm(0x3b2c22, 0.6)); g.add(fr);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: artTex(kind), roughness: 0.8 })); pl.position.z = 0.017; g.add(pl);
}
function rugTex(a, b, c) {
  return ctex(256, 160, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.strokeStyle = b; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20); g.lineWidth = 2; g.strokeRect(22, 22, w - 44, h - 44); g.fillStyle = c; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(30 + i * 32, h / 2); g.lineTo(46 + i * 32, h / 2 - 18); g.lineTo(62 + i * 32, h / 2); g.lineTo(46 + i * 32, h / 2 + 18); g.fill(); } speckle(g, w, h, 1200, 0.1, false); });
}
function rug(x, y, z, w, d, a, b, c) { const t = rugTex(a, b, c); const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.012, d), new THREE.MeshStandardMaterial({ map: t, roughness: 1 })); m.position.set(x, y + 0.006, z); m.receiveShadow = true; scene.add(m); }
function curtain(x, y, z, w, h, ry, color = 0xefe8d8, op = 0.8) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color, transparent: true, opacity: op, side: THREE.DoubleSide, roughness: 1, depthWrite: false })); m.position.set(x, y, z); m.rotation.y = ry; scene.add(m);
  TICKERS.push((dt, t) => { m.rotation.z = Math.sin(t * 0.9 + x) * 0.012 * (0.3 + WX.windy) * (S.door ? 1 : 0.3); });
}
// skirting boards
for (const [y, a, b] of [[Y1, 0, 0], [Y2, 0, 0]]) {
  const m = M.white;
  box(11.75, 0.1, 0.03, m, 0, y + 0.0, IZ0 + 0.015, { cast: false }); box(0.03, 0.1, 8.75, m, IX0 + 0.015, y, -6.5, { cast: false }); box(0.03, 0.1, 8.75, m, IX1 - 0.015, y, -6.5, { cast: false });
  box(5.3, 0.1, 0.03, m, -3.25, y, IZ1 - 0.015, { cast: false }); box(5.3, 0.1, 0.03, m, 3.25, y, IZ1 - 0.015, { cast: false });
}
// kitchen: backsplash tile, pendant lamp, appliances and small things
box(4.6, 0.7, 0.02, M.tile, -2.85, Y1 + 0.9, IZ0 + 0.012, { cast: false, tile: [0.4, 0.4] });
{
  const pm = new THREE.MeshStandardMaterial({ color: 0xf2e6c8, emissive: 0xffc27a, emissiveIntensity: 0, side: THREE.DoubleSide }); NIGHT_HOOKS.push(() => { pm.emissiveIntensity = (S.f1 ?? WORLD.dark > 0.45) ? 1.1 : 0.05; });
  cyl(0.01, 0.01, 0.9, M.dark, -3.2, Y1 + 1.85, -7.4, { cast: false, seg: 4 }); const sh = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.22, 16, 1, true), pm); sh.position.set(-3.2, Y1 + 1.8, -7.4); scene.add(sh);
}
{ // rice cooker, kettle, cutting board, knife block, mugs, spice jars, dish rack, fruit bowl
  const KZc = -10.55, top = Y1 + 0.9;
  const rc = grp(-0.85, top, KZc, 0); cyl(0.17, 0.17, 0.3, cm(0xf2f2f0, 0.4), 0, 0, 0, { parent: rc, cast: false }); sph(0.17, cm(0xf2f2f0, 0.4), 0, 0.28, 0, { parent: rc, seg: 12 }).scale.y = 0.45;
  const led = new THREE.MeshStandardMaterial({ color: 0x300, emissive: 0xff3a2a, emissiveIntensity: 1.2 }); bx(rc, 0.06, 0.03, 0.02, led, 0, 0.12, 0.17);
  cyl(0.09, 0.11, 0.18, M.steel, -4.55, top, KZc, { cast: false }); bx(scene, 0.32, 0.02, 0.2, 0xc9a77a, -3.0, top + 0.01, KZc + 0.1, { r: 0.6 }); bx(scene, 0.12, 0.2, 0.1, 0x2a2a2a, -1.55, top + 0.01, KZc - 0.05);
  [[-4.3, 0xf2f2f2], [-4.18, 0xd9a24a]].forEach(([x, c]) => cyl(0.04, 0.035, 0.09, cm(c, 0.5), x, top + 0.01, KZc + 0.18, { cast: false }));
  for (let i = 0; i < 4; i++) cyl(0.03, 0.03, 0.1, cm([0xb23a2a, 0xe0b84a, 0x3b7a4a, 0xdddddd][i], 0.6), -1.55 + i * 0.09, top + 0.01, KZc - 0.24, { cast: false });
  bx(scene, 0.5, 0.03, 0.34, M.steel, -3.9, top + 0.15, KZc + 0.08, { r: 0.3 }); for (let i = 0; i < 4; i++) cyl(0.07, 0.07, 0.02, cm(0xf4efe4, 0.3), -4.05 + i * 0.1, top + 0.2, KZc + 0.08, { cast: false });
  const fb = cyl(0.17, 0.1, 0.07, cm(0x8d6a4a, 0.6), -4.7, top, KZc + 0.12, { cast: false }); for (let i = 0; i < 4; i++) sph(0.055, cm(0xf0801a, 0.5), -4.78 + (i % 2) * 0.1, top + 0.06 + (i > 1 ? 0.05 : 0), KZc + 0.1 + (i > 1 ? 0.03 : -0.03), { seg: 8 });
  bx(scene, 0.4, 0.3, 0.03, 0x3a3a3a, -0.75, Y1 + 1.35 + 0.0, IZ0 + 0.03, { cast: false }); // clock plate
  const ck = new THREE.Mesh(new THREE.CircleGeometry(0.16, 20), new THREE.MeshStandardMaterial({ map: signTex('12', '#222', '#f4f1e8', 64, 64, 28), roughness: 0.6 })); ck.position.set(0.3, Y1 + 2.0, IZ0 + 0.02); scene.add(ck);
}
// entry: slippers, coat hooks with puffer jackets, umbrella stand, parcel
[[-2.0, -3.0, 0.2, 0xd36a7a], [-1.8, -3.12, -0.1, 0x6a8fd3], [-2.1, -3.2, 0.1, 0xb8b8b8]].forEach(([x, z, r, c]) => { const sl = bx(scene, 0.1, 0.05, 0.26, c, x, Y1 + 0.02, z, { r: 0.8 }); sl.rotation.y = r; });
bx(scene, 0.8, 0.03, 0.04, 0x5a4a3d, -1.9, Y1 + 1.55, IZ1 - 0.05); bx(scene, 0.4, 0.7, 0.16, 0x2a3a52, -2.1, Y1 + 0.85, IZ1 - 0.12, { r: 0.9 }); bx(scene, 0.38, 0.62, 0.16, 0xc8b78a, -1.7, Y1 + 0.9, IZ1 - 0.12, { r: 0.9 });
cyl(0.09, 0.09, 0.5, cm(0x6a6a70, 0.5), -1.15, Y1, -2.4, { cast: false }); cyl(0.012, 0.012, 0.7, cm(0x2a3a8a, 0.6), -1.17, Y1 + 0.2, -2.4, { cast: false }); cyl(0.012, 0.012, 0.7, cm(0xc0392b, 0.6), -1.12, Y1 + 0.2, -2.38, { cast: false });
bx(scene, 0.4, 0.28, 0.3, 0xb89868, 1.4, Y1, -2.55, { r: 0.9 }); bx(scene, 0.4, 0.015, 0.04, 0xd9cdb5, 1.4, Y1 + 0.28, -2.55);
bx(scene, 0.3, 0.2, 0.03, 0x222, 0.95, Y1 + 1.5, IZ1 - 0.03, { r: 0.4 }); // interphone
// living: shelf with books, art, blanket, remote, speaker, cushions on the floor
{
  const sh = grp(3.1, Y1, -10.7); bx(sh, 0.5, 1.9, 0.3, 0xb89868, 0, 0, 0, { r: 0.7, col: true });
  for (let r = 0; r < 5; r++) for (let i = 0; i < 6; i++) { const c = [0xc0392b, 0x2f5d8a, 0xe0b84a, 0x3b7a4a, 0xeeeeee, 0x6a4a8a][(r * 3 + i) % 6]; bx(sh, 0.05, 0.22 - (i % 3) * 0.02, 0.2, c, -0.18 + i * 0.07, 0.32 + r * 0.36, 0.02, { r: 0.8 }); }
}
framePic(0.55, Y1 + 1.55, IZ0 + 0.03, 0, 0.5, 0.65, 0); framePic(2.75, Y1 + 1.6, IZ0 + 0.03, 0, 0.45, 0.6, 1); framePic(IX0 + 0.03, Y1 + 1.5, -3.6, Math.PI / 2, 0.55, 0.7, 2);
bx(scene, 0.2, 0.3, 0.2, 0x2a2a2a, 0.4, Y1, -10.2);
[[0.3, -7.2, 0xd9a24a], [0.7, -7.5, 0x8f5a4a]].forEach(([x, z, c]) => { const cu = cyl(0.22, 0.22, 0.1, cm(c, 1), x, Y1 + 0.03, z, { cast: false, seg: 14 }); });
rug(1.6, Y1 + 0.022, -8.1, 2.6, 1.7, '#8d5a4a', '#e9d8b4', '#d9a24a'); rug(0.4, Y2 + 0.022, -8.4, 2.3, 1.6, '#6e7f6a', '#e9e2d0', '#d0a24a'); rug(0, Y1 + 0.022, -2.95, 1.1, 0.7, '#2f4a5a', '#d9cdb5', '#e0a65a');
curtain(2.7, Y1 + 1.55, IZ1 - 0.1, 2.0, 1.5, 0, 0xefe8d8, 0.55); curtain(-3.8, Y1 + 1.65, IZ0 + 0.1, 1.9, 1.3, Math.PI, 0xf4efe2, 0.5); curtain(IX0 + 0.1, Y1 + 1.55, -6.6, 3.3, 1.5, Math.PI / 2, 0xefe8d8, 0.55); curtain(-3.6, Y1 + 1.55, IZ1 - 0.1, 2.5, 1.5, 0, 0xefe8d8, 0.55);
// bathroom: towels, bottles, mat, slippers, toilet roll, basket
bx(scene, 0.7, 0.03, 0.04, M.steel, 5.2, Y1 + 1.2, IZ0 + 0.1); bx(scene, 0.3, 0.55, 0.03, 0x6aa0c8, 5.0, Y1 + 0.65, IZ0 + 0.12, { r: 1 }); bx(scene, 0.3, 0.5, 0.03, 0xf1efe8, 5.4, Y1 + 0.7, IZ0 + 0.12, { r: 1 });
[[5.74, 0xe8b6c0, 0.2], [5.78, 0x6aa0c8, 0.26], [5.7, 0xf2f2f2, 0.18]].forEach(([x, c, h], i) => cyl(0.03, 0.03, h, cm(c, 0.3), x, Y1 + 1.0, -10.2 + i * 0.08, { cast: false }));
bx(scene, 0.55, 0.02, 0.38, 0x8fb3c8, 4.1, Y1 + 0.022, -9.55, { r: 1 }); bx(scene, 0.1, 0.05, 0.26, 0xe0e0e0, 4.0, Y1 + 0.022, -9.9, { r: 0.8 }); bx(scene, 0.1, 0.05, 0.26, 0xe0e0e0, 4.15, Y1 + 0.022, -9.95, { r: 0.8 });
cyl(0.045, 0.04, 0.1, cm(0xf2f2f2, 0.3), 4.2, Y1 + 0.9, -9.12, { cast: false }); bx(scene, 0.01, 0.12, 0.01, 0x3a8a6a, 4.19, Y1 + 0.98, -9.12); bx(scene, 0.01, 0.12, 0.01, 0xd36a7a, 4.21, Y1 + 0.98, -9.12);
cyl(0.1, 0.1, 0.1, cm(0xf5f5f5, 0.8), 3.85, Y1 + 0.55, -10.5, { cast: false }); cyl(0.2, 0.18, 0.4, cm(0xc9a77a, 0.8), 3.95, Y1, -8.95 - 0.1, { cast: false });
// bedroom: bookshelf, fairy lights, desk things, laundry basket, standing mirror, art, curtains
{
  const sh = grp(-5.55, Y2, -9.6); bx(sh, 0.3, 1.6, 0.9, 0xc9a77a, 0, 0, 0, { r: 0.7, col: true });
  for (let r = 0; r < 4; r++) for (let i = 0; i < 8; i++) bx(sh, 0.2, 0.2 + (i % 3) * 0.03, 0.05, [0xc0392b, 0x2f5d8a, 0xe0b84a, 0x3b7a4a, 0xeeeeee, 0x6a4a8a][(r + i) % 6], 0.03, 0.28 + r * 0.36, -0.38 + i * 0.1);
  const bm = new THREE.MeshStandardMaterial({ color: 0xfff1cf, emissive: 0xffd08a, emissiveIntensity: 0 }); NIGHT_MATS.push({ m: bm, k: 2.2 });
  for (let i = 0; i <= 14; i++) { const t = i / 14; const b = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), bm); b.position.set(lerp(-1.8, 1.8, t), Y2 + 2.05 - Math.sin(t * Math.PI) * 0.22, IZ0 + 0.1); scene.add(b); }
  cyl(0.2, 0.17, 0.4, cm(0xc9a77a, 0.9), -4.7, Y2, -10.3, { cast: false }); bx(scene, 0.45, 0.35, 0.02, 0xe8b6c0, -4.7, Y2 + 0.35, -10.3, { r: 1 });
  const mr = bx(scene, 0.5, 1.5, 0.03, 0xb8c4cc, -4.0, Y2, -10.7, { r: 0.1 }); mr.rotation.x = -0.1; bx(scene, 0.56, 1.56, 0.02, 0x3a2c22, -4.0, Y2, -10.72, { r: 0.6 }).rotation.x = -0.1;
  bx(scene, 0.22, 0.02, 0.3, 0xe0d8c4, 2.2, Y2 + 0.77, -10.3); cyl(0.08, 0.08, 0.08, cm(0x3f7d46, 0.9), 3.2, Y2 + 0.78, -10.62, { cast: false });
  framePic(-1.0, Y2 + 1.55, IZ0 + 0.03, 0, 0.45, 0.6, 2); framePic(1.8, Y2 + 1.5, IZ0 + 0.03, 0, 0.5, 0.65, 0); framePic(IX1 - 0.03, Y2 + 1.55, -9.7, -Math.PI / 2, 0.5, 0.65, 1);
  curtain(0, Y2 + 1.85, IZ0 + 0.1, 3.9, 1.3, Math.PI, 0xe8e0d0, 0.55); curtain(2.2, Y2 + 1.6, IZ1 - 0.1, 2.5, 1.4, 0, 0xe8e0d0, 0.55); curtain(-3.05, Y2 + 1.1, IZ1 - 0.1, 0.55, 2.2, 0, 0xe8e0d0, 0.85); curtain(-0.75, Y2 + 1.1, IZ1 - 0.1, 0.55, 2.2, 0, 0xe8e0d0, 0.85);
  curtain(IX0 + 0.1, Y2 + 1.7, -7.75, 3.6, 1.5, Math.PI / 2, 0xe8e0d0, 0.55);
}
// balcony: drying rack with clothes, sandals, broom, crates
{
  const rk = grp(-2.6, Y2, -1.1); for (const x of [-0.5, 0.5]) { bx(rk, 0.03, 1.1, 0.03, M.steel, x, 0, -0.25); bx(rk, 0.03, 1.1, 0.03, M.steel, x, 0, 0.25); } bx(rk, 1.1, 0.03, 0.03, M.steel, 0, 1.1, -0.25); bx(rk, 1.1, 0.03, 0.03, M.steel, 0, 1.1, 0.25);
  [[-0.35, 0xf2f2ee, 0.6], [-0.05, 0x6f9fd0, 0.8], [0.3, 0xe8b6c0, 0.5]].forEach(([x, c, h]) => { const cl = bx(rk, 0.3, h, 0.02, c, x, 1.1 - h, 0.25, { r: 1 }); TICKERS.push((dt, t) => { cl.rotation.z = Math.sin(t * 1.7 + x * 4) * (0.04 + WX.windy * 0.1); }); });
  bx(scene, 0.1, 0.04, 0.26, 0x3a3a3a, 0.8, Y2 + 0.02, -1.0); bx(scene, 0.1, 0.04, 0.26, 0x3a3a3a, 0.95, Y2 + 0.02, -1.05); bx(scene, 0.4, 0.3, 0.3, 0xb89868, 3.6, Y2, -0.8, { r: 0.9 }); cyl(0.015, 0.015, 1.2, cm(0x8a6a3a, 0.8), 3.9, Y2, -0.65, { cast: false });
}
// ───────────────────────── detail pass: house exterior and yard ─────────────────────────
box(12.2, 0.14, 0.08, M.concrete, 0, Y2 - 0.1, -1.85, { cast: false }); box(0.1, 6.0, 0.1, M.concrete, 5.9, 0, -1.84, { cast: false }); cyl(0.05, 0.05, 6.0, cm(0x777b80, 0.5, 0.4), 5.78, 0.1, -1.78, { cast: false, seg: 8 });
box(0.4, 0.5, 0.18, M.dark, -2.65, 1.2, -1.78, { cast: false }); box(0.3, 0.4, 0.16, cm(0xb4b8bb, 0.5), -3.15, 1.2, -1.78, { cast: false }); cyl(0.02, 0.02, 1.2, cm(0xd9b41a, 0.5), -3.15, 0.1, -1.76, { cast: false, seg: 6 });
{ const sc = new THREE.MeshStandardMaterial({ color: 0xfff4d8, emissive: 0xffd08a, emissiveIntensity: 0 }); NIGHT_MATS.push({ m: sc, k: 2.5 }); const l = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), sc); l.position.set(0.95, 2.4, -1.74); scene.add(l); box(0.12, 0.2, 0.06, M.dark, 0.95, 2.3, -1.82, { cast: false }); }
for (let i = 0; i < 5; i++) slab(0.7, 0.5, M.concrete, 0.04 * i - 0.04, 0.06, 4.1 - i * 1.2, 0.025, { cast: false });
{ const lan = grp(-3.4, 0.08, 1.9); bx(lan, 0.4, 0.12, 0.4, 0x8a8d90, 0, 0, 0, { r: 0.9 }); bx(lan, 0.14, 0.45, 0.14, 0x8a8d90, 0, 0.12, 0, { r: 0.9 }); bx(lan, 0.34, 0.22, 0.34, 0x8a8d90, 0, 0.57, 0, { r: 0.9 }); bx(lan, 0.46, 0.1, 0.46, 0x77797c, 0, 0.79, 0, { r: 0.9 }); addCol(-3.6, -3.2, 1.7, 2.1, 0, 0.9); }
{ const bn = grp(3.5, 0.08, 1.3); bx(bn, 1.4, 0.06, 0.5, 0xc9a77a, 0, 0.38, 0, { r: 0.6 }); for (const x of [-0.6, 0.6]) bx(bn, 0.06, 0.38, 0.4, 0x8a6a4a, x, 0, 0); bx(bn, 1.1, 0.05, 0.4, 0x6a8fa8, 0, 0.44, 0, { r: 1 }); addCol(2.8, 4.2, 1.05, 1.55, 0, 0.5); }
bx(scene, 1.2, 0.3, 0.45, 0x8a5a3a, 6.7, 0.06, 4.4, { col: true, r: 0.9 }); bx(scene, 1.1, 0.1, 0.38, 0x4a8a3a, 6.7, 0.36, 4.4, { r: 1 }); // lettuce planter
bx(scene, 0.4, 0.3, 0.3, 0xc0392b, -1.4, 1.05, 5.0 + 0.2, { r: 0.5 }); bx(scene, 0.34, 0.02, 0.01, 0x111, -1.4, 1.2, 5.37);
// ───────────────────────── detail pass: rooftop ─────────────────────────
{
  const pyeong = grp(-0.8, Y3, -8.8); bx(pyeong, 2.0, 0.1, 1.2, 0xc9a77a, 0, 0.32, 0, { r: 0.6 }); for (const [a, b] of [[-0.9, -0.5], [0.9, -0.5], [-0.9, 0.5], [0.9, 0.5]]) bx(pyeong, 0.08, 0.32, 0.08, 0x8a6a4a, a, 0, b); addCol(-1.8, 0.2, -9.4, -8.2, Y3, Y3 + 0.45);
  for (let i = 0; i < 6; i++) { const s = grp(-5.4 + 0.0, Y3 + 1.2, -3.5 - i * 0.18); for (let k = 0; k < 4; k++) bx(s, 0.04, 0.12, 0.03, 0xc0261c, 0, -k * 0.13, 0, { r: 0.5 }); }
  cyl(0.25, 0.2, 0.3, cm(0x2f7a4a, 0.7), 3.9, Y3, -5.4, { cast: false }); cyl(0.25, 0.2, 0.3, cm(0xc0392b, 0.7), 4.3, Y3, -5.0, { cast: false });
  const hose = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 6, 22), cm(0x3a8a5a, 0.6)); hose.rotation.x = -Math.PI / 2; hose.position.set(5.2, Y3 + 0.05, -4.5); scene.add(hose);
  bx(scene, 0.55, 0.12, 0.4, 0x7a6a5a, -3.2, Y3 + 0.0, -5.0, { r: 1 }); bx(scene, 0.4, 0.08, 0.28, 0xd8c4a8, -3.2, Y3 + 0.12, -5.0, { r: 1 });
}

// ───────────────────────── detail pass: street ─────────────────────────
const FACS = [[-17, -8.6, 3.6, 3], [-28, -17.4, 4, 4], [-40, -28.4, 3, 2], [-56, -40.4, 3.8, 3], [8.6, 18, 3.2, 4], [18.4, 30, 4, 3], [30.4, 44, 3.4, 2], [44.4, 60, 3.8, 3]];
FACS.forEach(([x0, x1, z1, fl], bi) => {
  for (let k = 0; k < 3; k++) { const x = x0 + 1 + rnd() * (x1 - x0 - 2), f = 1 + Math.floor(rnd() * (fl - 1) + 0.5); box(0.8, 0.55, 0.35, acMat, x, f * 3.1 + 0.5, z1 + 0.18, { cast: false }); cyl(0.02, 0.02, f * 3.1 + 0.5, cm(0x9a9ea2, 0.5), x + 0.3, 0, z1 + 0.05, { cast: false, seg: 5 }); }
  box(x1 - x0 - 0.6, 0.06, 0.55, cm([0x3a6a8a, 0x8a3a3a, 0x4a7a4a][bi % 3], 0.8), (x0 + x1) / 2, 2.55, z1 + 0.25, { cast: false });
});
SHOPS.forEach((s, i) => { const cx = (s.x0 + s.x1) / 2; for (let k = 0; k < 2; k++) box(0.8, 0.55, 0.35, acMat, cx + (k ? 3 : -3.2), 7 + k * 3.1, 12.45, { cast: false }); cyl(0.04, 0.04, 1.4, cm(0x6a6e72, 0.5), cx - 5, 12.9 - 12.9 + 0.12, 12.4, { cast: false, seg: 5 }); });
function vsign(text, x, y, bg, fg) {
  const n = text.length, hgt = 0.42 * n + 0.2;
  const tx = ctex(128, 92 * n + 20, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = '700 72px "Noto Sans KR","Malgun Gothic",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; for (let i = 0; i < n; i++) g.fillText(text[i], w / 2, 56 + i * 92); });
  const mt = new THREE.MeshStandardMaterial({ map: tx, emissiveMap: tx, emissive: 0xffffff, emissiveIntensity: 0.5, roughness: 0.6 }); NIGHT_MATS.push({ m: mt, k: 1.3, base: 0.5 });
  box(0.1, hgt, 0.8, [mt, mt, M.dark, M.dark, M.dark, M.dark], x, y, 12.15, { cast: false, tile: [0.8, hgt] });
}
vsign('호프', -52, 6.2, '#b02a2a', '#fff3d0'); vsign('노래방', -37, 6.0, '#6b2a9c', '#fff'); vsign('치과', -22, 6.4, '#1d6aa8', '#fff'); vsign('네일', 12, 6.4, '#c43a7a', '#fff'); vsign('학원', 40, 6.4, '#2d6e66', '#fff'); vsign('PC방', 53, 6.0, '#1a1a2a', '#6ae0ff');
{ const gm = new THREE.MeshStandardMaterial({ color: 0x14532d, emissive: 0x39ff7a, emissiveIntensity: 0 }); NIGHT_MATS.push({ m: gm, k: 2.2, base: 0.5 }); box(0.1, 0.7, 0.2, gm, -24, 5.0, 12.4, { cast: false }); box(0.1, 0.2, 0.7, gm, -24, 5.25, 12.4, { cast: false }); }
{ const st = ctex(32, 64, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#d33', '#fff', '#36c', '#fff'][i % 4]; g.fillRect(0, i * 8, 32, 8); } }); st.repeat.set(1, 1); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.8, 12), new THREE.MeshStandardMaterial({ map: st, emissiveMap: st, emissive: 0xffffff, emissiveIntensity: 0.3 })); b.position.set(-12, 2.2, 12.3); scene.add(b); TICKERS.push((dt) => { st.offset.y -= dt * 0.35; }); }
// signs, post box, trash bags, gutters, road patches, yellow curb line
{ const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.3), new THREE.MeshStandardMaterial({ map: signTex('새솔길 42', '#ffffff', '#1c5aa6', 256, 80, 40), roughness: 0.5 })); sg.position.set(3.5, 4.2, 6.5); scene.add(sg); }
box(0.5, 1.1, 0.4, cm(0xc0262c, 0.5), 7.3, 0.12, 5.6, { col: true }); box(0.4, 0.04, 0.02, M.dark, 7.3, 1.0, 5.4, { cast: false });
for (const [x, z, c] of [[-7.3, 5.5, 0xcfe4ee], [-7.0, 5.7, 0xcfe4ee], [-7.6, 5.6, 0xe8e0c0], [-6.9, 5.4, 0xcfe4ee]]) { const b = sph(0.22, cm(c, 0.5), x, 0.12, z, { seg: 8 }); b.scale.set(1, 0.9, 1); }
for (let x = -54; x <= 56; x += 7) { slab(0.7, 0.25, M.dark, x, 0.03, 6.4, 0.008, { cast: false }); slab(0.7, 0.25, M.dark, x + 3, 0.03, 10.9, 0.008, { cast: false }); }
{ const pm = mat(0x2e3033, 1); for (const [x, z, w, d] of [[-30, 8.2, 3.5, 1.4], [-4, 9.3, 2.4, 1.0], [18, 7.6, 3.0, 1.2], [40, 8.9, 4.0, 1.3], [-48, 9.0, 2.0, 1.4], [8, 8.0, 1.6, 0.8]]) slab(w, d, pm, x, 0.028, z, 0.006, { cast: false }); slab(130, 0.1, mat(0xe3b81c, 0.9), 0, 0.03, 6.3, 0.006, { cast: false }); for (let x = -50; x < 56; x += 6) slab(0.1, 2.4, paint, x, 0.03, 9.8, 0.004, { cast: false }); }
for (const [x, z, r, c] of [[16.5, 11.55, 0.3, 0xd9c7a0], [-1.5, 11.7, -0.2, 0x7a8aa0]]) { const g = grp(x, 0.12, z, r); box(1.3, 0.22, 0.35, cm(c, 0.5), 0, 0.35, 0, { parent: g, cast: true }); box(0.4, 0.5, 0.4, cm(c, 0.5), 0.4, 0.45, 0, { parent: g }); const w1 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 10), M.dark); w1.rotation.x = Math.PI / 2; w1.position.set(0.5, 0.22, 0); g.add(w1); const w2 = w1.clone(); w2.position.x = -0.5; g.add(w2); addCol(x - 0.7, x + 0.7, z - 0.4, z + 0.4, 0.1, 1.3); }
// pojangmacha (street food stall) across the alley
{
  const px = 41, pz = 11.85, g = grp(px, 0.12, pz); box(2.2, 0.9, 0.7, cm(0x8a8d90, 0.5, 0.3), 0, 0, 0.0, { parent: g, col: false }); addCol(px - 1.1, px + 1.1, pz - 0.35, pz + 0.35, 0.1, 1.1);
  for (const [a, b] of [[-1.2, -0.5], [1.2, -0.5], [-1.2, 0.55], [1.2, 0.55]]) box(0.05, 2.2, 0.05, M.dark, a, 0, b, { parent: g, cast: false });
  const tarp = box(2.8, 0.05, 1.5, cm(0xe8801a, 0.8), 0, 2.2, 0.0, { parent: g, cast: false }); tarp.rotation.x = 0.1;
  const bm = new THREE.MeshStandardMaterial({ color: 0xfff1cf, emissive: 0xffc27a, emissiveIntensity: 0 }); NIGHT_MATS.push({ m: bm, k: 2.6, base: 0.2 }); for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), bm); b.position.set(-1.2 + i * 0.4, 2.1, -0.65); g.add(b); }
  cyl(0.25, 0.22, 0.3, M.steel, -0.5, 0.9, 0, { parent: g, cast: false }); cyl(0.2, 0.2, 0.2, cm(0xc0392b, 0.6), 0.4, 0.9, 0.0, { parent: g, cast: false });
  for (const x of [-0.7, 0, 0.7]) cyl(0.17, 0.17, 0.5, cm(0x3b6a9a, 0.6), px + x, 0.12, pz - 0.9, { cast: false });
  makeSteam(px - 0.5, 1.15, pz, 22, 0.3, 1.0, 0.5, 0.3, 0.95).u.uAmt.value = 0.8;
}

// ───────────────────────── people ─────────────────────────
const PEOPLE = [];
const skinC = [0xf0c8a4, 0xe6b48c, 0xd8a37a], hairC = [0x1a1410, 0x2a1c14, 0x3a2a1e, 0x6a6a6a];
function person(o) {
  const g = new THREE.Group(); const s = (o.h || 1.7) / 1.7; g.scale.setScalar(s);
  const jk = cm(o.jacket, 0.8), pn = cm(o.pants ?? 0x222831, 0.85), sk = cm(o.skin ?? skinC[Math.floor(Math.random() * 3)], 0.7), hr = cm(o.hair ?? hairC[Math.floor(Math.random() * 4)], 0.9);
  const legs = [], arms = [];
  for (const z of [-0.1, 0.1]) { const p = new THREE.Group(); p.position.set(0, 0.86, z); const m = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.86, 0.16), pn); m.position.y = -0.43; m.castShadow = true; p.add(m); const sh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.17), cm(o.shoe ?? 0x20242a, 0.7)); sh.position.set(0.05, -0.83, 0); p.add(sh); g.add(p); legs.push(p); }
  const tw = o.puffy ? 0.3 : 0.24; const torso = new THREE.Mesh(new THREE.BoxGeometry(tw, 0.62, 0.46), jk); torso.position.y = 1.17; torso.castShadow = true; g.add(torso);
  if (o.puffy) { for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(tw + 0.02, 0.03, 0.48), cm(0x000000, 1)); r.material = new THREE.MeshStandardMaterial({ color: 0x000, transparent: true, opacity: 0.18 }); r.position.y = 0.97 + i * 0.17; g.add(r); } }
  for (const z of [-0.28, 0.28]) { const p = new THREE.Group(); p.position.set(0, 1.42, z); const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), jk); m.position.y = -0.3; p.add(m); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), sk); hd.position.y = -0.62; p.add(hd); g.add(p); arms.push(p); }
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 9), sk); head.position.y = 1.6; head.castShadow = true; g.add(head);
  if (o.hat) { const hat = new THREE.Mesh(new THREE.SphereGeometry(0.135, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2), cm(o.hat, 0.9)); hat.position.y = 1.6; g.add(hat); }
  else { const hair = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 7), hr); hair.scale.set(1, 0.85, 1); hair.position.set(-0.015, 1.63, 0); g.add(hair); }
  if (o.scarf) { const sc = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.045, 6, 12), cm(o.scarf, 0.9)); sc.rotation.x = Math.PI / 2; sc.position.y = 1.47; g.add(sc); }
  if (o.pack) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.32), cm(o.pack, 0.8)); b.position.set(-0.2, 1.2, 0); g.add(b); }
  if (o.bag) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.3, 0.22), cm(o.bag, 0.8)); b.position.set(0.05, 0.62, 0.34); g.add(b); }
  const umb = new THREE.Group(); { const cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.22, 10, 1, true), new THREE.MeshStandardMaterial({ color: o.umb ?? 0x2a3a6a, roughness: 0.7, side: THREE.DoubleSide })); cone.position.y = 0.11; umb.add(cone); const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 5), M.dark); hd.position.y = -0.2; umb.add(hd); umb.position.set(0.02, 2.05, 0.0); umb.visible = false; g.add(umb); }
  scene.add(g);
  return { g, legs, arms, umb, s, ph: Math.random() * 6 };
}
const NPC_ID = { v: 0 };
function addPerson(o) {
  const p = person(o); Object.assign(p, { pts: o.pts, i: 0, dir: 1, speed: o.speed ?? 1.2, pause: o.pause ?? 0, wait: 0, static: !o.pts, sit: !!o.sit, umbSnow: !!o.umbSnow, yaw: o.yaw ?? 0, y: o.y ?? 0.03, stat: o.stat });
  if (o.pts) { const k = o.start !== undefined ? o.start : Math.random(); const a = o.pts[0], b = o.pts[1]; p.g.position.set(lerp(a[0], b[0], k), p.y, lerp(a[1], b[1], k)); p.i = 1; }
  else { p.g.position.set(o.at[0], p.y, o.at[1]); p.g.rotation.y = p.yaw; if (p.sit) { p.legs.forEach((l) => { l.rotation.z = 1.45; }); p.g.position.y = p.y - 0.39 * p.s; p.arms.forEach((a) => { a.rotation.z = 0.7; }); } }
  p.it = { pos: new THREE.Vector3(), r: 2.1, label: () => T('hi'), enabled: () => true, act() { const w = WX.rain > 0.4 ? TALK_RAIN : WX.snow > 0.5 ? TALK_SNOW : WORLD.night > 0.6 && Math.random() < 0.5 ? TALK_NIGHT : TALK[Math.floor(Math.random() * TALK.length)]; toast(say(w)); if (typeof ttsSay === 'function') ttsSay(w); p.wait = 3.5; p.face = true; sfx('click'); } };
  INTERACT.push(p.it); PEOPLE.push(p); return p;
}
function dogFor(owner) {
  const d = new THREE.Group(); const fur = cm(0xb98a56, 0.9);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.18), fur); b.position.y = 0.3; d.add(b); const h = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.15, 0.14), fur); h.position.set(0.26, 0.4, 0); d.add(h);
  const ears = [-0.06, 0.06].map((z) => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.04), cm(0x6a4a2a, 0.9)); e.position.set(0.25, 0.5, z); d.add(e); return e; });
  const legs = []; for (const [x, z] of [[0.15, -0.06], [0.15, 0.06], [-0.15, -0.06], [-0.15, 0.06]]) { const p = new THREE.Group(); p.position.set(x, 0.22, z); const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.05), fur); m.position.y = -0.11; p.add(m); d.add(p); legs.push(p); }
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.04), fur); tail.position.set(-0.28, 0.4, 0); tail.rotation.z = 0.6; d.add(tail); scene.add(d);
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3)); const line = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0xc0262c })); line.frustumCulled = false; scene.add(line);
  owner.dog = { d, legs, tail, line, ph: 0 };
}
// the cast
addPerson({ pts: [[-52, 6.8], [52, 6.8]], speed: 1.35, jacket: 0x1f2430, pants: 0x14171c, scarf: 0xb02a2a, bag: 0x3a2a1e, h: 1.74 });
addPerson({ pts: [[56, 7.0], [-56, 7.0]], speed: 1.15, jacket: 0x7a8f9e, pants: 0x3a4a5a, pack: 0xc9553a, hat: 0x2a2a30, h: 1.66, umbSnow: true, umb: 0xc0392b });
addPerson({ pts: [[8, 8.7], [32, 8.7]], speed: 0.8, pause: 5, jacket: 0x8c4a6a, puffy: true, pants: 0x3a3030, hat: 0xd9c9a0, bag: 0x2f6a4a, h: 1.55, umb: 0xb02a6a });
{ const w = addPerson({ pts: [[-32, 6.9], [-4, 6.9]], speed: 1.0, pause: 3, jacket: 0xd9c9a0, puffy: true, pants: 0x2a3a4a, scarf: 0x2f6a4a, h: 1.7 }); dogFor(w); }
addPerson({ pts: [[-42, 8.5], [-12, 8.5]], speed: 1.0, pause: 6, jacket: 0xc9553a, puffy: true, pants: 0x2a2a30, scarf: 0xf2f2ee, h: 1.68, umb: 0x2a3a6a, start: 0.2 });
addPerson({ pts: [[-42.9, 8.9], [-12.9, 8.9]], speed: 1.0, pause: 6, jacket: 0x34495e, pants: 0x1c1f24, hat: 0x34495e, h: 1.78, umb: 0x2a2a30, start: 0.2 });
addPerson({ pts: [[-62, 8.3], [62, 8.3]], speed: 2.9, jacket: 0x2a7ab0, pants: 0x111418, hat: 0xe8e8e8, h: 1.72 });
addPerson({ pts: [[26.6, 6.7], [26.6, 11.2]], speed: 1.2, pause: 4, jacket: 0x3a6a4a, pants: 0x20242a, scarf: 0xe0b84a, pack: 0x2a2a30, h: 1.64, umb: 0xe0b84a, umbSnow: true });
addPerson({ at: [9.2, 10.7], yaw: -Math.PI / 2, jacket: 0x5a3a2a, puffy: true, pants: 0x2a2a30, scarf: 0xc0392b, h: 1.7, stat: 'vend' });
addPerson({ at: [-3.2, 11.45], yaw: -Math.PI / 2, jacket: 0xe8d0b0, pants: 0x2a3a4a, h: 1.62, sit: true, y: 0.12, stat: 'cafe' });
addPerson({ at: [-2.5, 12.1], yaw: Math.PI, jacket: 0x34495e, puffy: true, pants: 0x1c1f24, h: 1.76, sit: true, y: 0.12, stat: 'cafe' });
addPerson({ at: [2.6, 11.45], yaw: -Math.PI / 2, jacket: 0xb02a6a, puffy: true, pants: 0x20242a, h: 1.66, sit: true, y: 0.12, stat: 'cafe' });
addPerson({ at: [41, 12.35], yaw: -Math.PI / 2, jacket: 0xe8e0d0, pants: 0x2a2a30, hat: 0xe8e0d0, h: 1.68, y: 0.12, stat: 'vendor' });
addPerson({ at: [40.4, 11.2], yaw: Math.PI / 2 + 3.14, jacket: 0x2a3a52, puffy: true, pants: 0x14171c, h: 1.78, sit: true, y: 0.12, stat: 'stool' });
for (const tx of [-3.2, 2.6]) { cyl(0.32, 0.32, 0.03, M.dark, tx, 0.12 + 0.72, 12.1, { cast: false }); cyl(0.03, 0.03, 0.72, M.dark, tx, 0.12, 12.1, { cast: false }); cyl(0.17, 0.17, 0.03, cm(0xc9a77a, 0.6), tx, 0.12 + 0.43, 11.45, { cast: false }); cyl(0.02, 0.02, 0.43, M.dark, tx, 0.12, 11.45, { cast: false }); addCol(tx - 0.3, tx + 0.3, 11.8, 12.4, 0.1, 0.9); }
cyl(0.17, 0.17, 0.03, cm(0xc9a77a, 0.6), -2.5 + 0.18, 0.12 + 0.43, 12.1, { cast: false });
const _pv = new THREE.Vector3();
function updatePeople(dt, t) {
  const rainy = WX.rain > 0.4, snowy = WX.snow > 0.5, cold = rainy || snowy;
  for (const p of PEOPLE) {
    p.umb.visible = rainy || (snowy && p.umbSnow);
    const g = p.g; p.it.pos.set(g.position.x, 1.35 * p.s, g.position.z);
    const dxp = P.x - g.position.x, dzp = P.z - g.position.z, dp = Math.hypot(dxp, dzp);
    if (p.static) {
      if (dp < 4 && P.y < 1.5) { const ty = Math.atan2(-dzp, dxp); let da = ty - g.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); if (!p.sit || p.stat === 'stool') g.rotation.y += da * Math.min(1, dt * 2); }
      const br = Math.sin(t * 1.6 + p.ph) * 0.012; p.arms[0].rotation.z = p.sit ? 0.7 + br : br; p.arms[1].rotation.z = p.sit ? 0.7 - br : -br; if (p.stat === 'vend') p.arms[0].rotation.z = 1.7 + Math.sin(t * 0.7) * 0.15; continue;
    }
    if (p.wait > 0) {
      p.wait -= dt; p.legs[0].rotation.z = lerp(p.legs[0].rotation.z, 0, 0.2); p.legs[1].rotation.z = lerp(p.legs[1].rotation.z, 0, 0.2);
      if (p.face) { const ty = Math.atan2(-dzp, dxp); let da = ty - g.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); g.rotation.y += da * Math.min(1, dt * 4); } else { p.arms[0].rotation.z = 1.4; p.arms[1].rotation.z = 0.2; }
      if (p.wait <= 0) p.face = false; if (p.dog) dogUpdate(p, dt, t, 0); continue;
    }
    const tg = p.pts[p.i], dx = tg[0] - g.position.x, dz = tg[1] - g.position.z, d = Math.hypot(dx, dz);
    if (d < 0.2) { p.i += p.dir; if (p.i >= p.pts.length || p.i < 0) { p.dir *= -1; p.i += p.dir * 2; p.wait = p.pause * (0.6 + Math.random() * 0.8); } continue; }
    let f = rainy ? 1.25 : snowy ? 0.82 : 1; const ux = dx / d, uz = dz / d; const ahead = (dxp * ux + dzp * uz); if (dp < 2.0 && ahead > 0) f *= clamp((dp - 0.75) / 1.1, 0, 1);
    const sp = p.speed * f; g.position.x += ux * sp * dt; g.position.z += uz * sp * dt; g.position.y = p.y;
    const ty = Math.atan2(-uz, ux); let da = ty - g.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); g.rotation.y += da * Math.min(1, dt * 6);
    p.ph += dt * sp * 4.4; const sw = Math.sin(p.ph) * (p.speed > 2 ? 0.95 : 0.6); p.legs[0].rotation.z = sw; p.legs[1].rotation.z = -sw; p.arms[0].rotation.z = -sw * 0.7; p.arms[1].rotation.z = sw * 0.7; g.position.y += Math.abs(Math.sin(p.ph)) * 0.02;
    if (p.dog) dogUpdate(p, dt, t, sp);
  }
}
function dogUpdate(p, dt, t, sp) {
  const d = p.dog, g = p.g, h = g.rotation.y; const ox = Math.cos(h), oz = -Math.sin(h);
  const tx = g.position.x + ox * 1.5 + Math.sin(t * 0.8) * 0.2 * -oz, tz = g.position.z + oz * 1.5 + Math.sin(t * 0.8) * 0.2 * ox;
  d.d.position.x = lerp(d.d.position.x || tx, tx, Math.min(1, dt * 3)); d.d.position.z = lerp(d.d.position.z || tz, tz, Math.min(1, dt * 3)); d.d.position.y = 0.03;
  d.d.rotation.y = h; d.ph += dt * (sp > 0.05 ? 9 : 0); d.legs.forEach((l, i) => { l.rotation.z = Math.sin(d.ph + (i % 2) * 3.1) * 0.7; }); d.tail.rotation.z = 0.6 + Math.sin(t * 9) * 0.4;
  const a = d.line.geometry.attributes.position; a.setXYZ(0, g.position.x + ox * 0.2, 0.8, g.position.z + oz * 0.2 + 0.28); a.setXYZ(1, d.d.position.x - ox * 0.2, 0.35, d.d.position.z); a.needsUpdate = true;
}
