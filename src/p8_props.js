// ───────────────────────── p8: recognisable props (rounded soft goods, real food shapes, Mac-like desktop) ─────────────────────────
// Rule of this file: every object is built from simple parts but with the silhouette people read first
// (a bowl with a dome of rice, a kimchi piece with pale ribs, a toilet with a lid). y arguments are the BOTTOM of the object.

const RBG = new Map(), UNIT_SPH = new THREE.SphereGeometry(1, 14, 10);
const pcm = (c, r = 0.6, m = 0) => (typeof c === 'object' ? c : cm(c, r, m));
// rounded box: pillows, cushions, duvets, appliance bodies
function rbox(P, w, h, d, rad, color, x, y, z, o = {}) {
  const k = [w, h, d, rad].join(); let g = RBG.get(k); if (!g) { g = new RoundedBoxGeometry(w, h, d, 3, Math.min(rad, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)); RBG.set(k, g); }
  const m = new THREE.Mesh(g, pcm(color, o.r ?? 0.9, o.m ?? 0)); m.position.set(x, y + h / 2, z);
  m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0); m.castShadow = !!o.cast; m.receiveShadow = true; (P || scene).add(m); return m;
}
// ellipsoid (centre y)
function el(P, rx, ry, rz, color, x, y, z, o = {}) { const m = new THREE.Mesh(UNIT_SPH, pcm(color, o.r ?? 0.6, o.m ?? 0)); m.scale.set(rx, ry, rz); m.position.set(x, y, z); m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0); m.receiveShadow = true; P.add(m); return m; }
// cylinder (bottom y), optional tilt
function ci(P, rt, rb, h, color, x, y, z, o = {}) { const m = cyl(rt, rb, h, pcm(color, o.r ?? 0.5, o.m ?? 0), x, y, z, { parent: P, cast: false, seg: o.seg || 16 }); m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0); if (o.cy !== undefined) m.position.y = o.cy; return m; }
const bb = (P, w, h, d, color, x, y, z, o = {}) => { const m = box(w, h, d, pcm(color, o.r ?? 0.6, o.m ?? 0), x, y, z, { parent: P, cast: false }); m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0); return m; };

// ---------- food ----------
// a cut piece of napa-cabbage kimchi: red paste layers with pale ribs, yellow-green leaf tip, sesame
function kimchiPiece(P, x, y, z, ry = 0, s = 1) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(s); P.add(g);
  el(g, 0.06, 0.016, 0.034, 0xb92a16, 0, 0.016, 0, { r: 0.45 }); el(g, 0.052, 0.006, 0.03, 0xf0e3a4, 0, 0.027, 0, { r: 0.5 }); el(g, 0.05, 0.014, 0.028, 0xd13a1f, 0.002, 0.036, 0, { r: 0.45 });
  el(g, 0.04, 0.004, 0.02, 0xf4eab6, -0.004, 0.048, 0, { r: 0.5 }); el(g, 0.018, 0.012, 0.026, 0xcdd872, 0.056, 0.02, 0, { r: 0.6 });
  for (let i = 0; i < 5; i++) el(g, 0.004, 0.0025, 0.004, 0xf5ecd0, -0.03 + i * 0.016, 0.05, ((i * 5) % 3 - 1) * 0.008);
  return g;
}
// a large salted-and-pasted napa half (used on the roof): layered red / cream bands
function kimchiNapa(P, x, y, z, ry = 0, len = 0.42) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; P.add(g); const a = len / 2;
  for (let i = 0; i < 5; i++) { const red = i % 2 === 0; el(g, a - i * 0.008, red ? 0.026 : 0.009, 0.07 - i * 0.004, red ? [0xb92a16, 0xc8341c, 0xd13a1f][i / 2 | 0] : 0xeee0a0, (i % 2 ? 0.004 : -0.004), 0.026 + i * 0.03, (i % 2 ? 0.004 : -0.004), { r: red ? 0.45 : 0.55 }); }
  el(g, 0.075, 0.07, 0.07, 0x9fc457, a + 0.01, 0.07, 0, { r: 0.7 }); el(g, 0.06, 0.05, 0.075, 0xc4d36a, a - 0.02, 0.1, 0.005, { r: 0.7 });
  for (let i = 0; i < 9; i++) el(g, 0.005, 0.003, 0.005, 0xf5ecd0, -a * 0.6 + i * a * 0.14, 0.152, ((i * 7) % 5 - 2) * 0.012);
  return g;
}
// plain salted napa half (cut face), garlic, radish
function napaRaw(P, x, y, z, ry = 0) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; P.add(g); el(g, 0.2, 0.06, 0.08, 0x9fc457, 0, 0.06, 0, { r: 0.7 }); el(g, 0.19, 0.045, 0.065, 0xefe6a6, 0, 0.1, 0, { r: 0.6 }); for (let i = -3; i <= 3; i++) bb(g, 0.34, 0.004, 0.006, 0xf9f3cc, 0, 0.138, i * 0.014); return g; }
function garlic(P, x, y, z) { el(P, 0.028, 0.026, 0.028, 0xf1ead8, x, y + 0.026, z, { r: 0.7 }); el(P, 0.006, 0.014, 0.006, 0xe4d8b8, x, y + 0.058, z, { r: 0.7 }); }
function scallionBunch(P, x, y, z, ry = 0) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; P.add(g); for (let i = 0; i < 7; i++) { ci(g, 0.006, 0.006, 0.12, 0xf4f4e4, -0.1, 0, (i - 3) * 0.011, { rz: Math.PI / 2, cy: 0.007 }); ci(g, 0.008, 0.006, 0.18, 0x3f9a3a, 0.04, 0, (i - 3) * 0.011, { rz: Math.PI / 2, cy: 0.008 }); } return g; }

// ---------- soft goods ----------
const kitchenSet = {};
// ======================= dining table =======================
{
  const G = grp(-3.2, Y1 + 0.77, -7.4), white = 0xf4f1ea, steel = 0xd6dbde;
  const plate = (x, z, r, c = white, sx = 1) => { const p = ci(G, r, r * 0.8, 0.014, cm(c, 0.25), x, 0, z); p.scale.x = sx; return p; };
  const bowl = (x, z, r, c = white) => ci(G, r, r * 0.55, 0.045, cm(c, 0.25), x, 0, z);
  // place settings: steel rice bowl with a dome of rice, long flat spoon + chopsticks laid on the table to the right of the bowl
  const setting = (x, z, ry) => {
    const S = grp(x, 0, z, ry, G);
    ci(S, 0.062, 0.038, 0.06, cm(steel, 0.25, 0.7), 0, 0, 0); ci(S, 0.064, 0.064, 0.006, cm(0xc3c8cc, 0.3, 0.7), 0, 0.058, 0); el(S, 0.058, 0.034, 0.058, 0xfbfaf4, 0, 0.064, 0, { r: 0.5 });
    bb(S, 0.007, 0.003, 0.15, cm(steel, 0.25, 0.7), 0.15, 0, 0.0); el(S, 0.017, 0.004, 0.03, cm(steel, 0.25, 0.7), 0.15, 0.003, -0.085);
    bb(S, 0.005, 0.005, 0.22, cm(steel, 0.25, 0.7), 0.177, 0, 0.03, { ry: 0.02 }); bb(S, 0.005, 0.005, 0.22, cm(steel, 0.25, 0.7), 0.189, 0, 0.03, { ry: -0.015 });
    ci(S, 0.03, 0.026, 0.07, cm(0xcfe6ea, 0.1), -0.13, 0, -0.02, { seg: 14 }).material = cm(0xcfe6ea, 0.1); // water glass (opaque pale glass reads fine at this size)
  };
  setting(-0.5, -0.27, Math.PI); setting(0.5, -0.27, Math.PI); setting(-0.5, 0.27, 0); setting(0.5, 0.27, 0);
  // jjigae (stew) in a black earthenware ttukbaegi on a wooden trivet
  { const z = -0.3; bb(G, 0.2, 0.015, 0.2, 0x8a6a4a, 0, 0, z, { r: 0.7 }); ci(G, 0.082, 0.056, 0.085, cm(0x2a211c, 0.5), 0, 0.015, z, { seg: 20 }); ci(G, 0.088, 0.088, 0.012, cm(0x1d1713, 0.45), 0, 0.093, z, { seg: 20 });
    ci(G, 0.074, 0.074, 0.003, cm(0xc4301c, 0.3), 0, 0.099, z, { seg: 20 }); bb(G, 0.05, 0.02, 0.02, 0x1d1713, 0.1, 0.07, z); bb(G, 0.05, 0.02, 0.02, 0x1d1713, -0.1, 0.07, z);
    for (const [a, b] of [[-0.02, 0.0], [0.025, 0.02], [0.0, -0.03]]) bb(G, 0.024, 0.018, 0.024, 0xf3eedc, a, 0.098, z + b, { ry: a * 20 });
    for (let i = 0; i < 5; i++) ci(G, 0.012, 0.012, 0.004, 0x4fa23a, -0.04 + i * 0.02, 0.102, z + ((i * 3) % 4 - 1.5) * 0.015); el(G, 0.014, 0.01, 0.014, 0xc9a45a, 0.03, 0.105, z - 0.03); }
  // kimchi on an oval plate
  { const x = -0.27, z = 0.15; plate(x, z, 0.1, white, 1.25); kimchiPiece(G, x - 0.045, 0.014, z, 0.2); kimchiPiece(G, x + 0.05, 0.014, z + 0.015, -0.3); kimchiPiece(G, x, 0.05, z - 0.02, 0.1); }
  // gyeran-mari: rolled omelette slices
  { const x = 0.27, z = 0.15; plate(x, z, 0.1, 0xe9f0f2, 1.2); for (let i = 0; i < 5; i++) { const sx = x - 0.08 + i * 0.04; bb(G, 0.036, 0.03, 0.05, 0xf2c43a, sx, 0.014, z - 0.01, { r: 0.5 }); bb(G, 0.02, 0.031, 0.03, 0xe0a52a, sx, 0.0141, z - 0.01, { r: 0.5 }); bb(G, 0.036, 0.003, 0.012, 0x4fa23a, sx, 0.044, z + 0.0); } }
  // kongnamul (seasoned bean sprouts) heap in a bowl
  { const x = -0.27, z = -0.15; bowl(x, z, 0.075, 0xe6eef0); for (let i = 0; i < 16; i++) { const a = i * 2.4; ci(G, 0.003, 0.003, 0.07, cm(0xeee0a0, 0.6), x + Math.cos(a) * 0.025, 0.045 + (i % 4) * 0.006, z + Math.sin(a) * 0.025, { rz: Math.PI / 2 - 0.5 + (i % 5) * 0.25, ry: a, seg: 5 }); }
    for (let i = 0; i < 4; i++) el(G, 0.005, 0.003, 0.005, 0xc4301c, x - 0.02 + i * 0.012, 0.07, z + (i % 2 ? 0.01 : -0.01)); }
  // sigeumchi (spinach) in a bowl
  { const x = 0.27, z = -0.15; bowl(x, z, 0.075, 0xe6eef0); for (let i = 0; i < 4; i++) el(G, 0.03, 0.017, 0.022, 0x2e6a2a, x + Math.cos(i * 1.6) * 0.022, 0.058, z + Math.sin(i * 1.6) * 0.022, { ry: i, r: 0.7 }); for (let i = 0; i < 5; i++) el(G, 0.004, 0.003, 0.004, 0xf4ecd0, x - 0.02 + i * 0.01, 0.075, z); }
  // grilled mackerel on an oval plate
  { const x = 0, z = 0.33; plate(x, z, 0.1, 0xf2efe8, 1.45); el(G, 0.1, 0.024, 0.036, 0xb4a07e, x, 0.036, z, { r: 0.5 }); el(G, 0.1, 0.01, 0.026, 0x4d5d60, x, 0.054, z - 0.006, { r: 0.4 }); el(G, 0.03, 0.022, 0.03, 0xa4906c, x + 0.105, 0.036, z, { r: 0.5 }); el(G, 0.004, 0.004, 0.004, 0x111111, x + 0.115, 0.044, z - 0.02);
    const tail = bb(G, 0.004, 0.04, 0.05, 0xa4906c, x - 0.115, 0.016, z); tail.rotation.z = 0.2; for (let i = 0; i < 5; i++) bb(G, 0.004, 0.003, 0.06, 0x85775a, x - 0.06 + i * 0.03, 0.058, z, { ry: 0.5 }); bb(G, 0.05, 0.03, 0.03, 0xf0d84a, x + 0.14, 0.012, z + 0.06, { r: 0.7 }); }
  // soju bottles + two shot glasses, tissue box
  for (const z of [-0.02, 0.05]) { ci(G, 0.03, 0.03, 0.13, cm(0x3f8f50, 0.2), 0.64, 0, z); ci(G, 0.013, 0.03, 0.03, cm(0x3f8f50, 0.2), 0.64, 0.13, z); ci(G, 0.013, 0.013, 0.05, cm(0x3f8f50, 0.2), 0.64, 0.16, z); ci(G, 0.0305, 0.0305, 0.055, cm(0xeef3f0, 0.4), 0.64, 0.03, z); ci(G, 0.0308, 0.0308, 0.014, cm(0x3a7ad0, 0.4), 0.64, 0.05, z); }
  for (const z of [-0.12, 0.12]) { ci(G, 0.022, 0.017, 0.05, cm(0xdfeef0, 0.1), 0.64, 0, z); }
  bb(G, 0.22, 0.1, 0.11, 0xf4f0e0, -0.64, 0, 0.0, { r: 0.8, ry: 0.2 }); bb(G, 0.12, 0.002, 0.003, 0xcfd8dc, -0.64, 0.1, 0.0, { ry: 0.2 });
}

// ======================= dining chairs (backrest on the far side from the table) =======================
[[-3.7, -8.0, Math.PI], [-2.7, -8.0, Math.PI], [-3.7, -6.8, 0], [-2.7, -6.8, 0]].forEach(([x, z, r]) => {
  const g = grp(x, Y1, z, r), wood = 0xc9a77a;
  rbox(g, 0.42, 0.045, 0.4, 0.02, wood, 0, 0.42, 0, { r: 0.6 }); rbox(g, 0.38, 0.03, 0.36, 0.015, 0x8fa28a, 0, 0.465, 0, { r: 0.95 });
  for (const [a, b] of [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]]) ci(g, 0.017, 0.013, 0.42, cm(0xa88556, 0.6), a, 0, b, { seg: 8 });
  for (const a of [-0.18, 0.18]) ci(g, 0.016, 0.016, 0.5, cm(0xa88556, 0.6), a, 0.45, 0.18, { seg: 8 });
  rbox(g, 0.4, 0.07, 0.03, 0.012, wood, 0, 0.86, 0.19, { r: 0.6 }); rbox(g, 0.4, 0.07, 0.03, 0.012, wood, 0, 0.74, 0.19, { r: 0.6 }); rbox(g, 0.4, 0.07, 0.03, 0.012, wood, 0, 0.62, 0.19, { r: 0.6 });
});

// ======================= living room: sofa, coffee table, TV console =======================
{
  const sofa2 = grp(1.6, Y1, -6.1), fab = 0x5b6b73, fab2 = 0x66777f;
  rbox(sofa2, 2.2, 0.26, 0.9, 0.05, 0x4d5b62, 0, 0.1, 0, { r: 0.95 }); for (const x of [-0.95, 0.95]) ci(sofa2, 0.025, 0.02, 0.1, cm(0x3a2c22, 0.6), x, 0, 0.0, { seg: 8 });
  for (const x of [-0.7, 0, 0.7]) { rbox(sofa2, 0.66, 0.15, 0.62, 0.06, fab2, x, 0.36, -0.1, { r: 0.95 }); rbox(sofa2, 0.64, 0.42, 0.2, 0.07, fab, x, 0.46, 0.3, { r: 0.95, rx: -0.14 }); }
  for (const x of [-1.04, 1.04]) rbox(sofa2, 0.2, 0.58, 0.92, 0.08, 0x516169, x, 0.1, 0.0, { r: 0.95 });
  rbox(sofa2, 0.5, 0.42, 0.14, 0.06, 0xd9a24a, -0.6, 0.5, 0.0, { r: 1, rz: 0.2, rx: -0.2 }); rbox(sofa2, 0.46, 0.4, 0.13, 0.06, 0xcfd6c6, 0.52, 0.5, 0.02, { r: 1, rz: -0.15, rx: -0.2 });
  rbox(sofa2, 0.98, 0.06, 0.5, 0.025, 0xc0b8a8, 0.1, 0.51, -0.18, { r: 1, ry: 0.12 }); rbox(sofa2, 0.5, 0.05, 0.4, 0.025, 0xc0b8a8, -0.3, 0.55, -0.08, { r: 1, ry: -0.3 }); // throw blanket, folded and crumpled
  // coffee table: tea set, tangerines, remote, phone, books
  const T0 = Y1 + 0.42, ct = new THREE.Group(); ct.position.set(1.6, T0, -7.9); scene.add(ct);
  ci(ct, 0.04, 0.035, 0.085, 0xffffff, -0.28, 0, 0.08, { r: 0.3 }); el(ct, 0.02, 0.012, 0.006, 0xffffff, -0.325, 0.045, 0.08, { r: 0.3 }); ci(ct, 0.036, 0.036, 0.004, cm(0x8a6a4a, 0.8), -0.28, 0, 0.08);
  el(ct, 0.07, 0.055, 0.07, 0xc9d6d0, 0.28, 0.062, -0.06, { r: 0.3 }); ci(ct, 0.03, 0.04, 0.02, cm(0xc9d6d0, 0.3), 0.28, 0.1, -0.06); el(ct, 0.012, 0.01, 0.012, 0xb5c4bd, 0.28, 0.132, -0.06); bb(ct, 0.07, 0.014, 0.014, 0xc9d6d0, 0.36, 0.07, -0.06, { rz: 0.5 }); // teapot
  ci(ct, 0.03, 0.022, 0.05, cm(0xe9f0f0, 0.3), 0.18, 0, 0.1); ci(ct, 0.03, 0.03, 0.002, cm(0xb5651d, 0.3), 0.18, 0.05, 0.1);
  ci(ct, 0.11, 0.08, 0.02, cm(0xf1efe8, 0.3), 0.0, 0, 0.0, { seg: 20 }); for (let i = 0; i < 4; i++) { el(ct, 0.034, 0.03, 0.034, 0xf08a1c, Math.cos(i * 1.6) * 0.04, 0.045, Math.sin(i * 1.6) * 0.04); el(ct, 0.01, 0.004, 0.012, 0x4f9a3a, Math.cos(i * 1.6) * 0.04, 0.076, Math.sin(i * 1.6) * 0.04); }
  { const rm = grp(-0.02, 0, -0.17, 0.3, ct); bb(rm, 0.05, 0.018, 0.17, 0x23262a, 0, 0, 0); for (let i = 0; i < 4; i++) bb(rm, 0.012, 0.004, 0.012, [0xc0392b, 0xeeeeee, 0x3a86c6, 0xeeeeee][i], 0, 0.0185, -0.06 + i * 0.03); } // remote
  bb(ct, 0.075, 0.008, 0.15, 0x15171a, 0.12, 0, -0.17, { ry: -0.25, r: 0.3 }); bb(ct, 0.065, 0.001, 0.13, 0x3a5a8a, 0.12, 0.0085, -0.17, { ry: -0.25 }); // phone
  bb(ct, 0.2, 0.028, 0.27, 0x2f5d8a, -0.2, 0, -0.12, { ry: 0.12, r: 0.8 }); bb(ct, 0.19, 0.022, 0.26, 0xf2ead6, -0.2, 0.028, -0.12, { ry: 0.12, r: 0.9 }); bb(ct, 0.17, 0.02, 0.23, 0xc0392b, -0.19, 0.05, -0.11, { ry: 0.3, r: 0.8 });
  // TV console details (doors, handles, devices); the TV itself stays where it was
  const tc = new THREE.Group(); tc.position.set(1.6, Y1, -10.6); scene.add(tc); const cz = 0.205;
  bb(tc, 0.006, 0.44, 0.004, 0xa39a86, -0.45, 0.03, cz); bb(tc, 0.006, 0.44, 0.004, 0xa39a86, 0.0, 0.03, cz); bb(tc, 0.006, 0.44, 0.004, 0xa39a86, 0.45, 0.03, cz);
  for (const x of [-0.06, 0.06, -0.5, 0.5, -0.39, 0.39]) bb(tc, 0.012, 0.1, 0.012, 0x3a342c, x, 0.2, cz + 0.004, { m: 0.5 });
  bb(tc, 1.0, 0.055, 0.1, 0x1b1c1f, 0, 0.5, 0.1, { r: 0.3 }); bb(tc, 0.94, 0.004, 0.006, 0x4a4d52, 0, 0.55, 0.152); // soundbar
  bb(tc, 0.22, 0.04, 0.16, 0x16181b, -0.7, 0.5, 0.02, { r: 0.4 }); el(tc, 0.004, 0.004, 0.004, 0x5cff8a, -0.62, 0.52, 0.1); // set-top box with LED
  bb(tc, 0.16, 0.035, 0.12, 0xf4f4f2, -0.7, 0.54, 0.02, { r: 0.5 }); for (const a of [-0.05, 0, 0.05]) bb(tc, 0.006, 0.14, 0.006, 0xf4f4f2, -0.7 + a, 0.575, -0.03, { rz: a * 2 }); // wifi router
  ci(tc, 0.05, 0.04, 0.09, cm(0xb4623c, 0.8), 0.72, 0.5, 0.0); el(tc, 0.1, 0.09, 0.09, 0x3f7d46, 0.72, 0.65, 0.0); el(tc, 0.07, 0.07, 0.07, 0x4f9a56, 0.76, 0.7, 0.01); // small plant
  bb(tc, 0.2, 0.05, 0.14, 0x2f5d8a, 0.5, 0.5, 0.06, { ry: 0.1 }); bb(tc, 0.18, 0.04, 0.13, 0xe0b84a, 0.5, 0.55, 0.06, { ry: -0.1 }); bb(tc, 0.12, 0.012, 0.05, 0x23262a, 0.2, 0.5, 0.1, { ry: 0.3 }); // books, game controller
}

// ======================= kitchen counter =======================
{
  const cT = Y1 + 0.9, K = new THREE.Group(); K.position.set(0, cT, KZ); scene.add(K);
  // rice cooker: white body, dome lid, display, handle
  { const x = -4.62; rbox(K, 0.3, 0.2, 0.28, 0.05, 0xf3f1ea, x, 0, 0.0, { r: 0.4 }); el(K, 0.15, 0.07, 0.14, 0xf8f6f0, x, 0.2, 0.0, { r: 0.35 }); bb(K, 0.09, 0.02, 0.012, 0x16181b, x, 0.12, 0.14); el(K, 0.004, 0.004, 0.004, 0xff6a3a, x - 0.03, 0.13, 0.148); bb(K, 0.1, 0.02, 0.03, 0xe8e6de, x, 0.25, 0.0); ci(K, 0.016, 0.016, 0.03, cm(0xc9cdd0, 0.3, 0.6), x, 0.27, 0.0); bb(K, 0.2, 0.006, 0.006, 0x16181b, x, 0.07, 0.142); }
  // electric kettle
  { const x = -4.2; ci(K, 0.075, 0.08, 0.2, cm(0xdfe3e6, 0.25, 0.6), x, 0, 0.0); ci(K, 0.03, 0.075, 0.03, cm(0x23262a, 0.4), x, 0.2, 0.0); bb(K, 0.02, 0.17, 0.02, 0x23262a, x + 0.095, 0.03, 0.0); bb(K, 0.04, 0.04, 0.02, 0x23262a, x + 0.08, 0.2, 0.0); bb(K, 0.02, 0.02, 0.05, 0xdfe3e6, x - 0.09, 0.17, 0.0, { m: 0.6 }); }
  // dish rack with plates, bowls, a cup
  { const x = -3.15, z = 0.02; bb(K, 0.46, 0.012, 0.3, 0x9aa1a6, x, 0, z, { m: 0.7, r: 0.4 }); bb(K, 0.46, 0.008, 0.008, 0x9aa1a6, x, 0.06, z + 0.14, { m: 0.7 }); bb(K, 0.46, 0.008, 0.008, 0x9aa1a6, x, 0.06, z - 0.14, { m: 0.7 });
    for (let i = 0; i < 5; i++) ci(K, 0.11, 0.11, 0.008, cm(0xf4f1ea, 0.25), x - 0.17 + i * 0.045, 0, z - 0.02, { rz: Math.PI / 2, cy: 0.125 });
    ci(K, 0.05, 0.03, 0.06, cm(0xe6eef0, 0.2), x + 0.1, 0.012, z + 0.08, { rx: Math.PI }); ci(K, 0.03, 0.03, 0.07, cm(0xe9f0f0, 0.2), x + 0.18, 0.012, z + 0.08); }
  // cutting board, knife, onion, scallions
  { const x = -1.6, z = 0.04; bb(K, 0.42, 0.02, 0.27, 0xc9a06a, x, 0, z, { r: 0.7, ry: 0.05 }); bb(K, 0.18, 0.004, 0.032, 0xcfd3d6, x + 0.0, 0.02, z + 0.06, { m: 0.8, r: 0.25, ry: 0.35 }); bb(K, 0.1, 0.016, 0.026, 0x2a2420, x - 0.12, 0.02, z + 0.1, { ry: 0.35 }); el(K, 0.04, 0.032, 0.04, 0xd9a5a0, x + 0.1, 0.052, z - 0.05, { ry: 0.5 }); scallionBunch(K, x - 0.06, 0.02, z - 0.06, 0.1); for (let i = 0; i < 6; i++) ci(K, 0.011, 0.011, 0.01, 0x4fa23a, x + 0.0 + i * 0.016, 0.02, z + 0.0); }
  // knife block and utensil crock with ladle / spatula / wooden spoon
  rbox(K, 0.12, 0.2, 0.09, 0.012, 0x7a5a3a, -0.9, 0, -0.1, { r: 0.6 }); for (let i = 0; i < 3; i++) bb(K, 0.02, 0.05, 0.008, 0x23262a, -0.94 + i * 0.04, 0.2, -0.08);
  ci(K, 0.05, 0.045, 0.14, cm(0xe6e0d2, 0.4), -0.66, 0, -0.14); ci(K, 0.006, 0.006, 0.26, cm(0x8a6a3a, 0.7), -0.67, 0.08, -0.14, { rz: 0.22 }); el(K, 0.025, 0.004, 0.03, cm(0xcfd3d6, 0.3, 0.7), -0.718, 0.318, -0.14, { rz: 0.22 }); ci(K, 0.006, 0.006, 0.26, cm(0x23262a, 0.5), -0.65, 0.08, -0.14, { rz: -0.18 }); bb(K, 0.05, 0.004, 0.06, 0x23262a, -0.6, 0.33, -0.14, { rz: -0.18 });
  // spice jars, oil, soy sauce next to the hob
  [[-2.95, 0xf4efe0], [-2.88, 0xc4301c], [-2.81, 0x8a6a3a]].forEach(([x, c], i) => { ci(K, 0.03, 0.03, 0.08, cm(0xdceaec, 0.1), x, 0, -0.18); ci(K, 0.026, 0.026, 0.06, cm(c, 0.7), x, 0.004, -0.18); ci(K, 0.032, 0.032, 0.014, cm(0x2a2a2a, 0.5), x, 0.08, -0.18); });
  ci(K, 0.04, 0.04, 0.2, cm(0xd4a82a, 0.2), -2.7, 0, -0.17); ci(K, 0.012, 0.04, 0.04, cm(0xd4a82a, 0.2), -2.7, 0.2, -0.17); ci(K, 0.012, 0.012, 0.03, cm(0xc0392b, 0.5), -2.7, 0.24, -0.17); // cooking oil
  // hob: pot supports + two knobs, and hanging utensils on the wall rail
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.78; bb(K, 0.02, 0.02, 0.06, 0x16181b, -2.2 + Math.cos(a) * 0.12, 0.012, Math.sin(a) * 0.12, { ry: a, m: 0.5 }); }
  for (const x of [-2.4, -2.0]) ci(K, 0.018, 0.018, 0.02, cm(0x16181b, 0.4, 0.4), x, -0.02, 0.27, { rx: Math.PI / 2 });
  bb(K, 0.9, 0.014, 0.014, 0xcfd3d6, -1.35, 0.45, -0.29, { m: 0.8, r: 0.3 }); for (const [x, h] of [[-1.7, 0.28], [-1.5, 0.3], [-1.3, 0.26], [-1.1, 0.29]]) { bb(K, 0.006, h, 0.006, 0x9aa1a6, x, 0.45 - h, -0.29, { m: 0.8 }); }
  el(K, 0.03, 0.04, 0.008, cm(0xcfd3d6, 0.3, 0.7), -1.7, 0.14, -0.29); bb(K, 0.045, 0.06, 0.006, 0x23262a, -1.5, 0.12, -0.29); el(K, 0.025, 0.04, 0.01, cm(0x23262a, 0.4), -1.3, 0.16, -0.29);
}

// ======================= bathroom: toilet =======================
{
  const T = grp(4.35, Y1, -10.55), wh = 0xfafafa;
  ci(T, 0.13, 0.15, 0.2, cm(wh, 0.15), 0, 0, 0.04); el(T, 0.19, 0.12, 0.27, cm(wh, 0.15), 0, 0.34, 0.0); // pedestal + bowl
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.028, 8, 28), cm(0xf2f2ee, 0.25)); ring.rotation.x = -Math.PI / 2; ring.scale.set(0.95, 1.38, 1); ring.position.set(0, 0.47, 0.06); T.add(ring); // seat
  el(T, 0.15, 0.012, 0.19, cm(0x9ec7d6, 0.05), 0, 0.455, 0.07, { r: 0.05 }); // water
  rbox(T, 0.36, 0.05, 0.05, 0.02, 0xf4f4f0, 0, 0.5, -0.17, { r: 0.25 }); const lid = rbox(T, 0.33, 0.025, 0.38, 0.015, 0xf4f4f0, 0, 0.52, -0.13, { r: 0.25 }); lid.rotation.x = -1.65; lid.position.set(0, 0.69, -0.135);
  rbox(T, 0.4, 0.4, 0.17, 0.04, wh, 0, 0.4, -0.25, { r: 0.15 }); rbox(T, 0.42, 0.04, 0.19, 0.02, 0xf2f2ee, 0, 0.79, -0.25, { r: 0.15 });
  ci(T, 0.02, 0.02, 0.012, cm(0xcfd3d6, 0.3, 0.7), 0.0, 0.83, -0.25); ci(T, 0.016, 0.016, 0.012, cm(0xcfd3d6, 0.3, 0.7), 0.06, 0.83, -0.25);
  ci(T, 0.05, 0.05, 0.1, cm(0xf6f2e8, 0.9), 0.13, 0.83, -0.25); ci(T, 0.018, 0.018, 0.101, cm(0xb89868, 0.9), 0.13, 0.83, -0.25); // spare roll
  // brush + holder, small bin
  const B = grp(4.66, Y1, -10.15); ci(B, 0.045, 0.04, 0.12, cm(0xdfe5e8, 0.3), 0, 0, 0); ci(B, 0.006, 0.006, 0.3, cm(0x8a8d90, 0.4), 0, 0.02, 0); el(B, 0.022, 0.03, 0.022, cm(0x2e3236, 0.9), 0, 0.34, 0);
  ci(scene, 0.09, 0.08, 0.26, cm(0xd9d4c8, 0.6), 3.92, Y1, -10.35, { seg: 14 });
}

// ======================= 2F: bed, bedside, desk, chair, Mac-style monitor =======================
{
  const B2 = new THREE.Group(); B2.position.set(0, Y2 + 0.48, 0); scene.add(B2); // mattress top
  const duv = 0x6f86a6, lin = 0xdbe3ec;
  rbox(B2, 1.86, 0.15, 1.18, 0.07, duv, 0.43, 0, -9.22, { r: 1, ry: 0.04 }); // main duvet, dragged toward the foot
  const roll = ci(B2, 0.07, 0.07, 1.62, cm(duv, 1), 0.38, 0, -9.78, { rz: Math.PI / 2, seg: 14, cy: 0.1 }); roll.rotation.y = 0.05; // folded-back top edge
  rbox(B2, 1.7, 0.012, 0.18, 0.005, lin, 0.4, 0.145, -9.64, { r: 1, ry: 0.05 }); // pale lining showing at the fold
  el(B2, 0.42, 0.06, 0.3, duv, 0.95, 0.165, -9.1, { r: 1, ry: 0.5 }); el(B2, 0.36, 0.05, 0.26, duv, -0.05, 0.16, -9.25, { r: 1, ry: -0.3 }); // lumps where it bunches
  rbox(B2, 0.6, 0.06, 0.52, 0.03, duv, 1.26, 0.04, -8.98, { r: 1, ry: 0.6, rz: -0.2 }); // corner flipped over the side
  rbox(B2, 1.6, 0.32, 0.05, 0.02, duv, 0.43, -0.3, -8.64, { r: 1, ry: 0.03 }); // overhang at the foot of the bed
  // pillows: not squared up. one leaning, one half slipped off, a small cushion on top
  rbox(B2, 0.64, 0.14, 0.4, 0.07, 0xfaf8f2, -0.12, 0, -10.38, { r: 1, ry: 0.14, rz: -0.07 }); rbox(B2, 0.62, 0.14, 0.4, 0.07, 0xe6e2da, 0.8, 0.0, -10.26, { r: 1, ry: -0.42, rz: 0.1 });
  rbox(B2, 0.42, 0.12, 0.42, 0.06, 0xd9a24a, 0.33, 0.1, -9.98, { r: 1, ry: 0.7, rx: 0.12 });
  { const b = el(B2, 0.07, 0.07, 0.06, 0xa87a54, 0.18, 0.2, -10.2, { r: 1 }); el(B2, 0.03, 0.03, 0.02, 0xa87a54, 0.12, 0.26, -10.2, { r: 1 }); el(B2, 0.03, 0.03, 0.02, 0xa87a54, 0.24, 0.26, -10.2, { r: 1 }); el(B2, 0.03, 0.025, 0.02, 0xe6cfa8, 0.18, 0.19, -10.14, { r: 1 }); el(B2, 0.07, 0.08, 0.06, 0xa87a54, 0.18, 0.1, -10.2, { r: 1 }); } // plush bear
  bb(B2, 0.2, 0.03, 0.28, 0xf4ecd8, 0.9, 0.17, -9.35, { ry: 0.4, r: 0.8 }); bb(B2, 0.205, 0.012, 0.285, 0x2f5d8a, 0.9, 0.17, -9.35, { ry: 0.4, r: 0.7 }); // open-face-down book
  // bedside tables
  { const t = Y2 + 0.5; bb(scene, 0.07, 0.008, 0.15, 0x15171a, 1.72, t, -10.6, { ry: 0.3, r: 0.3 }); ci(scene, 0.03, 0.028, 0.065, cm(0xdfeef2, 0.05), 1.92, t, -10.55); ci(scene, 0.026, 0.026, 0.04, cm(0x9ed0e6, 0.05), 1.92, t, -10.55); ci(scene, 0.04, 0.04, 0.05, cm(0xe8e4dc, 0.4), 1.82, t, -10.78); el(scene, 0.018, 0.018, 0.004, 0xfff3c4, 1.82, t + 0.03, -10.752); bb(scene, 0.15, 0.04, 0.2, 0x7a3a2a, 1.68, t, -10.78, { r: 0.8 }); bb(scene, 0.13, 0.03, 0.18, 0xe9e0c8, 1.69, t + 0.04, -10.78, { r: 0.8 });
    ci(scene, 0.03, 0.028, 0.065, cm(0xdfeef2, 0.05), -1.12, t, -10.52); bb(scene, 0.12, 0.012, 0.12, 0xf4f0e0, -0.92, t, -10.5, { r: 0.9 }); }
  // plush slippers next to the bed, pushed in different directions
  rbox(scene, 0.11, 0.06, 0.26, 0.03, 0xe8b6c0, -0.82, Y2 + 0.014, -9.0, { r: 1, ry: 0.3 }); rbox(scene, 0.11, 0.06, 0.26, 0.03, 0xe8b6c0, -0.62, Y2 + 0.014, -8.74, { r: 1, ry: -0.7 });
}
// Mac-style desktop: original wallpaper and icons, a Finder-like window, a Dock-like bar
function macScreenTex() {
  return ctex(1280, 800, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#1d2a6b'); bg.addColorStop(0.45, '#8a3a9a'); bg.addColorStop(0.8, '#e6607a'); bg.addColorStop(1, '#f6a652'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(0, h * (0.55 + k * 0.1)); for (let x = 0; x <= w; x += 40) g.lineTo(x, h * (0.55 + k * 0.1) + Math.sin(x / 170 + k * 1.7) * 42); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fillStyle = `rgba(255,255,255,${0.06 + k * 0.03})`; g.fill(); }
    // menu bar
    g.fillStyle = 'rgba(255,255,255,0.32)'; g.fillRect(0, 0, w, 30); g.fillStyle = '#12141a'; g.font = '700 17px sans-serif'; g.textBaseline = 'middle'; g.fillText('Finder', 56, 16); g.font = '16px sans-serif'; ['File', 'Edit', 'View', 'Go', 'Window', 'Help'].forEach((t, i) => g.fillText(t, 130 + i * 64, 16));
    g.fillStyle = '#12141a'; g.beginPath(); g.arc(26, 15, 7, 0, 7); g.fill(); g.fillText('Fri 9:41', w - 100, 16); g.strokeStyle = '#12141a'; g.lineWidth = 2; g.strokeRect(w - 150, 9, 26, 13); g.fillRect(w - 148, 11, 17, 9); for (let i = 1; i < 4; i++) { g.beginPath(); g.arc(w - 190, 22, i * 5, -2.3, -0.84); g.stroke(); }
    // Finder-like window
    const wx = 250, wy = 120, ww = 780, wh = 470; g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(wx + 8, wy + 14, ww, wh); g.fillStyle = '#f5f5f7'; g.beginPath(); g.roundRect(wx, wy, ww, wh, 14); g.fill();
    g.fillStyle = '#e4e4e8'; g.beginPath(); g.roundRect(wx, wy, 190, wh, [14, 0, 0, 14]); g.fill(); g.fillStyle = '#ececf0'; g.fillRect(wx + 190, wy, ww - 190, 46);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(wx + 24 + i * 24, wy + 24, 8, 0, 7); g.fill(); });
    g.fillStyle = '#2a2d35'; g.font = '700 18px sans-serif'; g.fillText('Seoul House', wx + 360, wy + 24);
    g.font = '600 13px sans-serif'; g.fillStyle = '#7a7d86'; g.fillText('Favorites', wx + 20, wy + 80); g.font = '16px sans-serif'; ['Recents', 'Applications', 'Desktop', 'Documents', 'Downloads', 'Pictures'].forEach((t, i) => { g.fillStyle = i === 3 ? 'rgba(60,110,230,0.2)' : 'rgba(0,0,0,0)'; g.fillRect(wx + 10, wy + 98 + i * 40, 170, 34); g.fillStyle = '#3b6fe0'; g.fillRect(wx + 22, wy + 108 + i * 40, 14, 14); g.fillStyle = '#2a2d35'; g.fillText(t, wx + 46, wy + 116 + i * 40); });
    const items = [['Photos', 'f'], ['Plans', 'f'], ['Render.png', 'p'], ['Notes.txt', 't'], ['Tour', 'f'], ['Menu.pdf', 'd']];
    items.forEach(([n, k], i) => { const ix = wx + 240 + (i % 3) * 170, iy = wy + 90 + Math.floor(i / 3) * 170;
      if (k === 'f') { g.fillStyle = '#5fb0f5'; g.beginPath(); g.roundRect(ix, iy + 10, 90, 70, 8); g.fill(); g.fillStyle = '#7cc2ff'; g.beginPath(); g.roundRect(ix, iy, 40, 22, 6); g.fill(); g.fillStyle = '#4aa0ec'; g.fillRect(ix, iy + 24, 90, 56); }
      else { g.fillStyle = '#ffffff'; g.strokeStyle = '#c9ccd4'; g.lineWidth = 2; g.beginPath(); g.moveTo(ix + 10, iy); g.lineTo(ix + 62, iy); g.lineTo(ix + 82, iy + 22); g.lineTo(ix + 82, iy + 84); g.lineTo(ix + 10, iy + 84); g.closePath(); g.fill(); g.stroke(); g.fillStyle = k === 'p' ? '#f2a35a' : '#b9bdc7'; if (k === 'p') { g.fillRect(ix + 18, iy + 34, 56, 40); g.fillStyle = '#5fb0f5'; g.fillRect(ix + 18, iy + 34, 56, 18); } else for (let l = 0; l < 4; l++) g.fillRect(ix + 20, iy + 30 + l * 12, 50, 4); }
      g.fillStyle = '#2a2d35'; g.font = '15px sans-serif'; g.textAlign = 'center'; g.fillText(n, ix + 42, iy + 108); g.textAlign = 'left'; });
    // sticky note
    g.save(); g.translate(1060, 260); g.rotate(0.05); g.fillStyle = '#ffe97a'; g.fillRect(0, 0, 150, 150); g.fillStyle = '#6a5a10'; g.font = '700 20px sans-serif'; g.fillText('to do', 16, 34); g.font = '18px sans-serif'; g.fillText('- buy eggs', 16, 70); g.fillText('- kimchi jjigae', 16, 98); g.fillText('- call mom', 16, 126); g.restore();
    // disk icon
    g.fillStyle = '#d6d9df'; g.beginPath(); g.roundRect(w - 130, 70, 86, 62, 10); g.fill(); g.fillStyle = '#9aa0ac'; g.fillRect(w - 118, 118, 62, 6); g.fillStyle = '#fff'; g.font = '15px sans-serif'; g.textAlign = 'center'; g.fillText('Disk', w - 87, 156); g.textAlign = 'left';
    // dock
    const dx = 300, dw = 680, dy = h - 96; g.fillStyle = 'rgba(255,255,255,0.32)'; g.beginPath(); g.roundRect(dx, dy, dw, 80, 22); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 2; g.stroke();
    ['#4aa0f0', '#f2a33a', '#3ec46a', '#e85a7a', '#9a6af0', '#f4d03a', '#2fc4c0', '#e8e8ec', '#6a7080'].forEach((c, i) => { const ix = dx + 22 + i * 70; const gr = g.createLinearGradient(ix, dy + 10, ix, dy + 62); gr.addColorStop(0, c); gr.addColorStop(1, '#00000044'); g.fillStyle = c; g.beginPath(); g.roundRect(ix, dy + 12, 54, 54, 13); g.fill(); g.fillStyle = gr; g.globalAlpha = 0.25; g.fillRect(ix, dy + 12, 54, 54); g.globalAlpha = 1; g.fillStyle = 'rgba(255,255,255,0.85)'; if (i % 3 === 0) { g.beginPath(); g.arc(ix + 27, dy + 39, 13, 0, 7); g.fill(); } else if (i % 3 === 1) g.fillRect(ix + 15, dy + 26, 24, 24); else { g.beginPath(); g.moveTo(ix + 27, dy + 22); g.lineTo(ix + 42, dy + 54); g.lineTo(ix + 12, dy + 54); g.closePath(); g.fill(); } });
  });
}
function macDesk() {
  const D = new THREE.Group(); D.position.set(2.7, Y2 + 0.78, -10.5); scene.add(D); const al = cm(0xc9ccd0, 0.3, 0.8);
  rbox(D, 0.66, 0.4, 0.025, 0.012, 0xd7d9dd, 0, 0.1, 0.0, { r: 0.3, m: 0.7 }); // thin silver display shell
  const tex = macScreenTex(); const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.36), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(0, 0.31, 0.0135); D.add(scr);
  bb(D, 0.66, 0.06, 0.02, 0xdfe1e4, 0, 0.1, 0.013, { r: 0.35 }); // chin
  bb(D, 0.07, 0.18, 0.018, al, 0, 0.0, -0.03, { rx: 0.0 }); rbox(D, 0.24, 0.012, 0.18, 0.006, 0xc9ccd0, 0, 0, -0.05, { m: 0.8, r: 0.3 }); // stand
  rbox(D, 0.4, 0.014, 0.13, 0.006, 0xeceef0, 0, 0, 0.24, { r: 0.35 }); for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++) bb(D, 0.026, 0.003, 0.02, 0x2a2d33, -0.17 + c * 0.031, 0.014, 0.2 + r * 0.022, { r: 0.5 }); // keyboard
  rbox(D, 0.06, 0.02, 0.1, 0.01, 0xeceef0, 0.34, 0, 0.26, { r: 0.35 }); // mouse
  bb(D, 0.28, 0.006, 0.18, 0x23262a, 0.22, 0, 0.25, { r: 0.9 }); // desk mat under mouse
  ci(D, 0.035, 0.035, 0.08, cm(0xf4efe4, 0.4), -0.52, 0, 0.18); ci(D, 0.03, 0.03, 0.002, cm(0x3a2418, 0.2), -0.52, 0.078, 0.18); // coffee mug
  ci(D, 0.07, 0.08, 0.012, cm(0x23262a, 0.5), -0.5, 0, -0.08); ci(D, 0.01, 0.01, 0.2, cm(0x23262a, 0.5), -0.5, 0.012, -0.08); el(D, 0.07, 0.03, 0.05, cm(0x23262a, 0.5), -0.44, 0.22, -0.08, { rz: 0.3 }); // desk lamp
  // headphones hanging over the monitor corner
  const hp = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.009, 6, 20, Math.PI), cm(0x2a2d33, 0.5)); hp.position.set(0.5, 0.2, 0.15); hp.rotation.z = 0.0; D.add(hp); ci(D, 0.036, 0.036, 0.022, cm(0x2a2d33, 0.6), 0.425, 0.12, 0.15, { rz: Math.PI / 2 }); ci(D, 0.036, 0.036, 0.022, cm(0x2a2d33, 0.6), 0.575, 0.12, 0.15, { rz: Math.PI / 2 });
  return D;
}
macDesk();
// proper swivel office chair (five-star base, gas lift, tilted mesh back, armrests), a hoodie thrown over it
{
  const C = grp(2.78, Y2, -9.62, 0.28), dk = cm(0x2a2e33, 0.6), grey = 0x3a4047;
  for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; const leg = bb(C, 0.3, 0.03, 0.05, dk, Math.cos(a) * 0.15, 0.05, Math.sin(a) * 0.15, { ry: -a }); ci(C, 0.028, 0.028, 0.035, cm(0x111214, 0.5), Math.cos(a) * 0.29, 0.0, Math.sin(a) * 0.29, { seg: 10 }); }
  ci(C, 0.035, 0.035, 0.32, cm(0x8a8d90, 0.3, 0.7), 0, 0.08, 0); ci(C, 0.05, 0.05, 0.08, dk, 0, 0.38, 0);
  rbox(C, 0.5, 0.09, 0.48, 0.045, grey, 0, 0.42, 0, { r: 0.9 }); rbox(C, 0.46, 0.46, 0.075, 0.035, grey, 0, 0.52, 0.22, { r: 0.9, rx: -0.14 }); rbox(C, 0.3, 0.14, 0.06, 0.03, grey, 0, 0.97, 0.265, { r: 0.9, rx: -0.14 });
  ci(C, 0.012, 0.012, 0.26, dk, 0, 0.5, 0.2, { rx: -0.14 });
  for (const x of [-0.27, 0.27]) { bb(C, 0.025, 0.2, 0.03, dk, x, 0.46, 0.0); rbox(C, 0.06, 0.035, 0.28, 0.016, 0x16181b, x, 0.66, -0.02, { r: 0.7 }); }
  rbox(C, 0.4, 0.34, 0.1, 0.045, 0x7a8f9a, 0, 0.78, 0.32, { r: 1, rx: -0.2, rz: 0.05 }); rbox(C, 0.1, 0.3, 0.08, 0.035, 0x7a8f9a, -0.22, 0.54, 0.34, { r: 1, rz: 0.12 }); rbox(C, 0.1, 0.26, 0.08, 0.035, 0x7a8f9a, 0.24, 0.62, 0.33, { r: 1, rz: -0.2 });
}

// ======================= rooftop (3F): kimjang table, napa on a tarp, pots on the landing =======================
{
  // flowerpots: moved off the stair slope onto the flat roof next to the stairwell exit
  [[-5.4, -9.45, 0xf2c230], [-4.8, -9.55, 0xb55fd0], [-4.2, -9.45, 0xe86b3a]].forEach(([x, z, c]) => { ci(scene, 0.17, 0.13, 0.26, cm(0xb4623c, 0.7), x, Y3, z); ci(scene, 0.175, 0.175, 0.02, cm(0xa4552f, 0.7), x, Y3 + 0.25, z); const b = el(scene, 0.2, 0.15, 0.2, cm(c, 0.8), x, Y3 + 0.4, z); });
  // table (pyeong top at Y3+0.42, centred -0.8, -8.8): basin of kimchi, board with salted napa, paste bowl, tub, garlic/ginger, gloves
  const Ty = Y3 + 0.42, P = new THREE.Group(); P.position.set(-0.8, Ty, -8.8); scene.add(P);
  const red = cm(0xd2331b, 0.35);
  ci(P, 0.34, 0.28, 0.17, red, -0.55, 0, 0.0, { seg: 24 }); ci(P, 0.35, 0.35, 0.02, red, -0.55, 0.16, 0.0, { seg: 24 }); // red rubber basin (다라이)
  ci(P, 0.31, 0.31, 0.01, cm(0xa5240f, 0.4), -0.55, 0.15, 0.0, { seg: 24 }); // inside shadow
  [[-0.7, -0.08, 0.3], [-0.4, -0.1, -0.2], [-0.62, 0.12, 1.2], [-0.42, 0.1, 0.5], [-0.55, 0.0, 2.0]].forEach(([x, z, r], i) => kimchiPiece(P, x, 0.16 + (i > 3 ? 0.04 : 0), z, r, 1.5));
  // board with halved salted napa, daikon, garlic, ginger
  bb(P, 0.52, 0.025, 0.34, 0xc9a06a, 0.25, 0, -0.2, { r: 0.7 }); napaRaw(P, 0.22, 0.025, -0.25, 0.1); napaRaw(P, 0.3, 0.025, -0.12, -0.1);
  ci(P, 0.04, 0.012, 0.22, cm(0xf2f0e4, 0.5), 0.12, 0.0, 0.18, { rz: Math.PI / 2 - 0.1, cy: 0.04 }); ci(P, 0.025, 0.012, 0.06, cm(0x62a048, 0.6), 0.0, 0.0, 0.17, { rz: Math.PI / 2, cy: 0.03 });
  garlic(P, 0.38, 0, 0.14); garlic(P, 0.43, 0, 0.19); garlic(P, 0.36, 0, 0.21); el(P, 0.05, 0.02, 0.025, 0xd9b27a, 0.5, 0.02, 0.1, { ry: 0.4 }); el(P, 0.04, 0.02, 0.02, 0xd9b27a, 0.52, 0.02, 0.14, { ry: -0.5 }); scallionBunch(P, 0.2, 0, 0.35, 0.3);
  // seasoning paste in a steel bowl with a spatula
  ci(P, 0.13, 0.09, 0.07, cm(0xd3d8dc, 0.25, 0.7), 0.78, 0, 0.3, { seg: 20 }); el(P, 0.115, 0.05, 0.115, 0xb02312, 0.78, 0.062, 0.3, { r: 0.35 }); for (let i = 0; i < 6; i++) el(P, 0.01, 0.005, 0.01, 0xf5ecd0, 0.74 + i * 0.016, 0.108, 0.3 + (i % 2) * 0.02); bb(P, 0.18, 0.006, 0.03, 0x8a6a3a, 0.88, 0.1, 0.36, { rz: 0.2, ry: 0.3 });
  // packed kimchi tub + lid, red rubber gloves, soju and cups
  rbox(P, 0.3, 0.2, 0.22, 0.02, 0xeaf0ee, 0.8, 0, -0.28, { r: 0.3 }); el(P, 0.13, 0.04, 0.09, 0xc2301c, 0.8, 0.19, -0.28, { r: 0.4 }); kimchiPiece(P, 0.76, 0.2, -0.28, 0.4, 1.0); rbox(P, 0.31, 0.02, 0.23, 0.01, 0x2f7d57, 0.45, 0.0, 0.48, { r: 0.4, ry: 0.3 });
  for (const [x, z, r] of [[-0.1, 0.45, 0.3], [-0.2, 0.5, -0.4]]) { const gl = new THREE.Group(); gl.position.set(x, 0, z); gl.rotation.y = r; P.add(gl); rbox(gl, 0.12, 0.02, 0.2, 0.01, 0xd9231c, 0, 0, 0, { r: 0.4 }); for (let i = 0; i < 4; i++) rbox(gl, 0.022, 0.016, 0.09, 0.008, 0xd9231c, -0.045 + i * 0.03, 0.0, -0.14, { r: 0.4 }); }
  for (const z of [0.1, 0.16]) { ci(P, 0.03, 0.03, 0.13, cm(0x3f8f50, 0.2), 0.95, 0, z + 0.2); ci(P, 0.0305, 0.0305, 0.055, cm(0xeef3f0, 0.4), 0.95, 0.03, z + 0.2); }
}
// kimchi stuffing on a blue tarp: napa halves in rows, each layered with red paste (replaces the red "chips")
{
  const g = grp(3.6, Y3, -7.6), tarp = cm(0x2f6aa8, 0.9); rbox(g, 1.7, 0.02, 1.3, 0.008, tarp, 0, 0, 0, { r: 1 });
  [[-0.38, -0.34], [0.38, -0.34], [-0.38, 0.0], [0.38, 0.0], [-0.38, 0.34], [0.38, 0.34]].forEach(([x, z], i) => kimchiNapa(g, x, 0.02, z, (i % 2 ? 0.08 : -0.06) + (i === 3 ? 0.5 : 0), 0.52));
  ci(g, 0.2, 0.17, 0.2, cm(0xd2331b, 0.35), 0.0, 0.02, 0.57, { seg: 20 }); el(g, 0.18, 0.05, 0.18, 0xb02312, 0.0, 0.22, 0.57, { r: 0.35 });
}
