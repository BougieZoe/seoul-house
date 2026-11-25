// ───────────────────────── p7: lived-in fridge, table setting, TV live concert ─────────────────────────
// Everything here is generic Korean household stuff: brand-free packaging, an original fictional ballad performer.

// ---- fridge item materials: all share a registry so they can "light up" when the door is open ----
const FRM = new Map(), FR_LIST = [];
function frm(c, r = 0.55, o = {}) {
  const k = c + '|' + r + '|' + (o.t || 0) + '|' + (o.m || 0); if (FRM.has(k)) return FRM.get(k);
  const m = new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: o.m || 0, emissive: c, emissiveIntensity: 0, transparent: !!o.t, opacity: o.t || 1 });
  if (o.t) m.depthWrite = false; FRM.set(k, m); FR_LIST.push(m); return m;
}
const fbx = (P, w, h, d, c, x, y, z, o = {}) => bx(P, w, h, d, frm(c, o.r ?? 0.55, o), x, y, z, o);
const fcy = (P, rt, rb, h, c, x, y, z, o = {}) => cyl(rt, rb, h, frm(c, o.r ?? 0.5, o), x, y, z, { parent: P, cast: false, seg: o.seg || 12 });
function fsp(P, r, c, x, y, z, sx = 1, sy = 1, sz = 1, o = {}) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), frm(c, o.r ?? 0.5, o)); m.position.set(x, y, z); m.scale.set(sx, sy, sz); P.add(m); return m; }

// ---- reusable food/drink props (all coordinates local to the parent group; y = bottom) ----
const canBlue = (P, x, y, z) => { fcy(P, 0.032, 0.032, 0.115, 0x3d86c6, x, y, z); fcy(P, 0.0325, 0.0325, 0.04, 0xf2f4f6, x, y + 0.04, z); fcy(P, 0.027, 0.032, 0.008, 0xb8bcc2, x, y + 0.115, z, { m: 0.6 }); };
const soju = (P, x, y, z, lvl = 1) => { fcy(P, 0.03, 0.03, 0.13, 0x3f8f50, x, y, z, { r: 0.25 }); fcy(P, 0.013, 0.03, 0.03, 0x3f8f50, x, y + 0.13, z, { r: 0.25 }); fcy(P, 0.013, 0.013, 0.045, 0x3f8f50, x, y + 0.16, z, { r: 0.25 }); fcy(P, 0.0145, 0.0145, 0.014, 0xd8dcd8, x, y + 0.205, z); fcy(P, 0.0305, 0.0305, 0.055, 0xeef3f0, x, y + 0.03, z); fcy(P, 0.0308, 0.0308, 0.012, 0x3a7ad0, x, y + 0.05, z); };
const petBottle = (P, x, y, z, cap = 0x2f6bd0, h = 0.3) => { fcy(P, 0.04, 0.04, h * 0.82, 0xbfe3f2, x, y, z, { t: 0.55, r: 0.1 }); fcy(P, 0.018, 0.04, h * 0.1, 0xbfe3f2, x, y + h * 0.82, z, { t: 0.55, r: 0.1 }); fcy(P, 0.018, 0.018, h * 0.06, cap, x, y + h * 0.94, z); fcy(P, 0.0405, 0.0405, h * 0.2, 0xffffff, x, y + h * 0.3, z, { t: 0.8 }); };
const sauce = (P, x, y, z, body, cap, h, r = 0.032) => { fcy(P, r, r, h * 0.66, body, x, y, z, { r: 0.35 }); fcy(P, 0.012, r, h * 0.14, body, x, y + h * 0.66, z, { r: 0.35 }); fcy(P, 0.013, 0.013, h * 0.2, body, x, y + h * 0.8, z, { r: 0.35 }); fcy(P, 0.0145, 0.0145, 0.014, cap, x, y + h - 0.012, z); fcy(P, r + 0.0006, r + 0.0006, h * 0.26, 0xf3eee0, x, y + h * 0.18, z); };
const milk = (P, x, y, z) => { fbx(P, 0.07, 0.15, 0.07, 0xf6f6f2, x, y, z); fbx(P, 0.071, 0.03, 0.071, 0x4a8ad0, x, y + 0.05, z); const g = fbx(P, 0.07, 0.04, 0.05, 0xf6f6f2, x, y + 0.15, z); g.rotation.z = 0; };
function tub(P, x, y, z, w, h, d, content, lid, fill = 0.7) {
  fbx(P, w, h, d, 0xeaf3f1, x, y, z, { t: 0.3, r: 0.15 }); fbx(P, w - 0.012, h * fill, d - 0.012, content, x, y + 0.004, z, { r: 0.7 }); fbx(P, w + 0.004, 0.012, d + 0.004, lid, x, y + h, z, { r: 0.4 });
}
function kimchiBowl(P, x, y, z) { // an open glass bowl with a cabbage-kimchi pile and sesame
  fcy(P, 0.085, 0.05, 0.065, 0xdbeee9, x, y, z, { t: 0.35, r: 0.1, seg: 16 });
  for (let i = 0; i < 7; i++) { const a = i * 0.9; fsp(P, 0.03, i % 3 ? 0xc4301c : 0xe0c070, x + Math.cos(a) * 0.03, y + 0.045 + (i % 2) * 0.012, z + Math.sin(a) * 0.03, 1.2, 0.5, 0.9, { r: 0.6 }).rotation.y = a; }
  for (let i = 0; i < 6; i++) fsp(P, 0.004, 0xf3e6c0, x + (i - 3) * 0.012, y + 0.075, z + ((i * 7) % 5 - 2) * 0.01);
}
function napa(P, x, y, z) { fsp(P, 0.045, 0xd4e38c, x, y + 0.09, z, 1, 1.9, 1); fsp(P, 0.04, 0x72a64c, x, y + 0.17, z, 0.9, 0.9, 0.9); }
function scallions(P, x, y, z) { for (let i = 0; i < 6; i++) { const a = (i - 2.5) * 0.012; const w = fcy(P, 0.006, 0.006, 0.12, 0xf4f4e6, x + a, y, z + (i % 2) * 0.01); const g = fcy(P, 0.0075, 0.006, 0.11, 0x4f9a3a, x + a, y + 0.12, z + (i % 2) * 0.01); w.rotation.z = a * 4; g.rotation.z = a * 4; } }
function daikon(P, x, y, z) { const d = fcy(P, 0.03, 0.018, 0.2, 0xf2f0e4, x, y, z); d.rotation.z = Math.PI / 2 - 0.15; d.position.y = y + 0.035; fcy(P, 0.018, 0.008, 0.06, 0x62a048, x - 0.115, y + 0.04, z).rotation.z = Math.PI / 2; }
function eggTray(P, x, y, z) {
  fbx(P, 0.25, 0.018, 0.11, 0xcbbd9d, x, y, z, { r: 0.9 }); const n = [1, 1, 0, 1, 1, 0, 1, 1, 1, 0];
  for (let i = 0; i < 10; i++) { if (!n[i]) continue; fsp(P, 0.021, i % 4 === 0 ? 0xf0e7d4 : 0xc9a074, x - 0.1 + (i % 5) * 0.05, y + 0.032, z - 0.025 + Math.floor(i / 5) * 0.05, 1, 1.28, 1, { r: 0.4 }); }
}
function banchan(P, x, y, z, c) { tub(P, x, y, z, 0.1, 0.05, 0.1, c, 0x2c7a6a, 0.8); }
function fPot(P, x, y, z) { fcy(P, 0.085, 0.085, 0.12, 0xc3c7cb, x, y, z, { m: 0.6, r: 0.3, seg: 16 }); fcy(P, 0.088, 0.088, 0.012, 0xb4b8bc, x, y + 0.12, z, { m: 0.6, r: 0.3, seg: 16 }); fcy(P, 0.012, 0.012, 0.02, 0x222222, x, y + 0.132, z); fbx(P, 0.05, 0.015, 0.02, 0x222222, x + 0.115, y + 0.1, z); fbx(P, 0.05, 0.015, 0.02, 0x222222, x - 0.115, y + 0.1, z); }
function wrappedPlate(P, x, y, z, food) { fcy(P, 0.1, 0.075, 0.018, 0xf1efe8, x, y, z, { seg: 18 }); fsp(P, 0.07, food, x, y + 0.02, z, 1.2, 0.45, 1, { r: 0.7 }); fcy(P, 0.101, 0.101, 0.05, 0xeaf3f6, x, y + 0.015, z, { t: 0.22, r: 0.1, seg: 18 }); }
function foodBox(P, x, y, z, c = 0xe9d9b6) { fbx(P, 0.15, 0.06, 0.12, c, x, y, z, { r: 0.9 }); fbx(P, 0.151, 0.012, 0.121, 0xc0392b, x, y + 0.045, z, { r: 0.9 }); fbx(P, 0.06, 0.012, 0.122, 0xf2c230, x + 0.03, y + 0.052, z, { r: 0.9 }); }
function fruit(P, x, y, z, c, n, sy = 1) { for (let i = 0; i < n; i++) fsp(P, 0.035, c, x + (i % 3) * 0.06 - 0.06, y + 0.035 + Math.floor(i / 3) * 0.05, z + (i % 2) * 0.035, 1, sy, 1, { r: 0.4 }); }

// ---- the real, hollow fridge (replaces the old solid block) ----
const FG = grp(-5.4, Y1, KZ + 0.05);           // body spans local x ±0.35, z ±0.35, height 1.9
const fwhite = cm(0xe6e8e8, 0.35), glass = new THREE.MeshStandardMaterial({ color: 0xcfe6e0, transparent: true, opacity: 0.26, roughness: 0.1, depthWrite: false });
bx(FG, 0.04, 1.9, 0.7, fwhite, -0.33, 0, 0, { cast: true }); bx(FG, 0.04, 1.9, 0.7, fwhite, 0.33, 0, 0, { cast: true });
bx(FG, 0.7, 0.04, 0.7, fwhite, 0, 1.86, 0, { cast: true }); bx(FG, 0.7, 0.06, 0.7, fwhite, 0, 0, 0, { cast: true }); bx(FG, 0.7, 1.8, 0.03, fwhite, 0, 0.06, -0.335);
bx(FG, 0.008, 1.8, 0.64, fridgeInside, -0.305, 0.06, 0); bx(FG, 0.008, 1.8, 0.64, fridgeInside, 0.305, 0.06, 0); bx(FG, 0.62, 1.8, 0.008, fridgeInside, 0, 0.06, -0.31);
bx(FG, 0.62, 0.02, 0.64, fridgeInside, 0, 1.40, 0.0); bx(FG, 0.3, 0.012, 0.06, fridgeInside, 0, 1.84, 0.26); bx(FG, 0.5, 0.012, 0.03, fridgeInside, 0, 0.86 - 0.012, 0.3);
for (const y of [0.52, 0.86, 1.14]) bx(FG, 0.62, 0.012, 0.62, glass, 0, y, 0);
// ---- shelf packer: every item is built at the origin, measured (Box3), then placed row-by-row inside its container ----
// Container bounds + per-item bounding boxes are the "design logic": nothing can overhang a shelf, overlap a neighbour or poke past the wall.
window.__fridge = { items: [], violations: [] };
const FR_GAP = 0.012;
function fitem(id, build) { const g = new THREE.Group(); g.userData.item = id; build(g); g.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(g); return { id, g, b, w: b.max.x - b.min.x, h: b.max.y - b.min.y, d: b.max.z - b.min.z }; }
function fpack(P, tag, y0, clear, R, list) {
  let cx = R.x0, cz = R.z0, rowD = 0, base = null;
  const note = (id, msg) => { window.__fridge.violations.push(tag + ':' + id + ' ' + msg); };
  for (const ent of list) {
    const [id, build, opt = {}] = ent, it = fitem(id, build);
    let px, py, pz;
    if (opt.stack && base) { px = base.cx - (it.b.min.x + it.b.max.x) / 2; px = base.cx + px - base.cx; py = base.top; pz = 0; const ox = base.cx - (it.b.min.x + it.b.max.x) / 2, oz = base.cz - (it.b.min.z + it.b.max.z) / 2; it.g.position.set(ox, py - it.b.min.y, oz); if (it.w > base.w + 0.006 || it.d > base.d + 0.006) note(id, 'stack footprint larger than base'); base = { cx: base.cx, cz: base.cz, w: base.w, d: base.d, top: py + it.h }; }
    else {
      if (cx + it.w > R.x1 + 1e-6) { cx = R.x0; cz += rowD + FR_GAP; rowD = 0; }
      if (cz + it.d > R.z1 + 1e-6) note(id, 'out of room (depth)');
      if (cx + it.w > R.x1 + 1e-6) note(id, 'wider than shelf');
      it.g.position.set(cx - it.b.min.x, y0 + 0.0004 - it.b.min.y, cz - it.b.min.z);
      base = { cx: cx + it.w / 2, cz: cz + it.d / 2, w: it.w, d: it.d, top: y0 + 0.0004 + it.h }; cx += it.w + FR_GAP; rowD = Math.max(rowD, it.d);
    }
    if (it.g.position.y + it.b.max.y > y0 + clear + 1e-6) note(id, 'taller than the gap above');
    P.add(it.g); window.__fridge.items.push({ id, tag, group: it.g });
  }
}
// open glass crisper bin (no opaque lid, so you see the vegetables)
function fbin(P0, cx, w, d, h = 0.4, y = 0.062) { const P = new THREE.Group(); P.userData.structure = true; P0.add(P); fbx(P, w, 0.006, d, 0xd8e6e2, cx, y, 0, { r: 0.3 }); fbx(P, w, h, 0.004, 0xeaf3f1, cx, y, -d / 2 + 0.002, { t: 0.32, r: 0.15 }); fbx(P, w, h, 0.004, 0xeaf3f1, cx, y, d / 2 - 0.002, { t: 0.32, r: 0.15 }); fbx(P, 0.004, h, d, 0xeaf3f1, cx - w / 2 + 0.002, y, 0, { t: 0.32, r: 0.15 }); fbx(P, 0.004, h, d, 0xeaf3f1, cx + w / 2 - 0.002, y, 0, { t: 0.32, r: 0.15 }); fbx(P, w + 0.004, 0.012, 0.012, 0xbdd0cb, cx, y + h - 0.012, d / 2, { r: 0.4 }); }
const U = (n) => Array.from({ length: n }, (_, i) => i);
// crisper drawers (bottom): vegetables left, fruit right
fbin(FG, -0.152, 0.285, 0.56); fbin(FG, 0.152, 0.285, 0.56);
fpack(FG, 'crisperL', 0.069, 0.4, { x0: -0.288, x1: -0.016, z0: -0.272, z1: 0.272 }, [
  ['napa1', (g) => napa(g, 0, 0, 0)], ['napa2', (g) => napa(g, 0, 0, 0)], ['scallions', (g) => scallions(g, 0, 0, 0)],
  ['daikon', (g) => daikon(g, 0, 0, 0)], ['perilla', (g) => { for (let i = 0; i < 5; i++) fbx(g, 0.09, 0.006, 0.07, 0x4f9a3a, 0, i * 0.006, 0, { r: 0.8 }); }],
  ['carrots', (g) => { for (let i = 0; i < 4; i++) { const c = fbx(g, 0.012, 0.07, 0.012, i % 2 ? 0xe0731c : 0x3a9a3a, i * 0.024, 0.0, 0); c.rotation.z = 0.0; } }],
]);
fpack(FG, 'crisperR', 0.069, 0.4, { x0: 0.016, x1: 0.288, z0: -0.272, z1: 0.272 }, [
  ['pears', (g) => fruit(g, 0, 0, 0, 0xd8c070, 4, 1.05)], ['apples', (g) => fruit(g, 0, 0, 0, 0xcf3a30, 4)], ['tangerines', (g) => fruit(g, 0, 0, 0, 0xf08a1c, 5, 0.85)],
  ['plum-tub', (g) => tub(g, 0, 0, 0, 0.11, 0.06, 0.1, 0x6a2a5a, 0x3a6aa8, 0.8)],
]);
// level A (glass top .532): kimchi tubs, leftover stew pot, kimchi bowl
fpack(FG, 'A', 0.532, 0.328, { x0: -0.285, x1: 0.285, z0: -0.292, z1: 0.285 }, [
  ['kimchi-L', (g) => tub(g, 0, 0, 0, 0.22, 0.2, 0.22, 0xc4301c, 0x2f7d57, 0.82)], ['kimchi-S', (g) => tub(g, 0, 0, 0, 0.17, 0.14, 0.17, 0xd9421e, 0x3a6aa8, 0.8)], ['doenjang', (g) => tub(g, 0, 0, 0, 0.12, 0.09, 0.12, 0x6a3a1c, 0xd9c79a, 0.85)],
  ['stew-pot', (g) => fPot(g, 0, 0, 0)], ['kimchi-bowl', (g) => kimchiBowl(g, 0, 0, 0)],
]);
// level B (.872): eggs, tofu, jangs, side dishes
fpack(FG, 'B', 0.872, 0.268, { x0: -0.285, x1: 0.285, z0: -0.292, z1: 0.285 }, [
  ['tofu', (g) => tub(g, 0, 0, 0, 0.13, 0.07, 0.1, 0xf4f0e0, 0x8fd0e8, 0.75)], ['gochujang', (g) => tub(g, 0, 0, 0, 0.13, 0.1, 0.11, 0xb52a1c, 0xb52a1c, 0.9)], ['ssamjang', (g) => tub(g, 0, 0, 0, 0.1, 0.09, 0.1, 0x7a4a24, 0xd9c79a, 0.9)],
  ['eggs', (g) => eggTray(g, 0, 0, 0)],
  ['banchan-brown', (g) => banchan(g, 0, 0, 0, 0x7a5030)], ['banchan-black', (g) => banchan(g, 0, 0, 0, 0x2a2a2a), { stack: true }],
  ['banchan-green', (g) => banchan(g, 0, 0, 0, 0x3f8a3f)], ['banchan-orange', (g) => banchan(g, 0, 0, 0, 0xe08040), { stack: true }],
  ['banchan-yellow', (g) => banchan(g, 0, 0, 0, 0xf0c030)], ['banchan-egg', (g) => banchan(g, 0, 0, 0, 0xe8d070)],
]);
// level C (1.152): beer, milk, covered plate, takeout box, yogurt drinks
fpack(FG, 'C', 1.152, 0.248, { x0: -0.285, x1: 0.285, z0: -0.292, z1: 0.285 }, [
  ['beer-4x2', (g) => { for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) canBlue(g, i * 0.066, 0, r * 0.066); }],
  ['milk1', (g) => milk(g, 0, 0, 0)], ['milk2', (g) => milk(g, 0, 0, 0)],
  ['wrapped-plate', (g) => wrappedPlate(g, 0, 0, 0, 0xb5651d)], ['takeout-box', (g) => foodBox(g, 0, 0, 0)],
  ['yogurt-drinks', (g) => { for (let i = 0; i < 5; i++) { fcy(g, 0.016, 0.018, 0.06, 0xf5eef0, (i % 3) * 0.036, 0, Math.floor(i / 3) * 0.04); fcy(g, 0.0175, 0.0175, 0.012, 0xc32b2b, (i % 3) * 0.036, 0.06, Math.floor(i / 3) * 0.04); } }],
  ['lying-can', (g) => { const c = fcy(g, 0.032, 0.032, 0.115, 0x3d86c6, 0, 0, 0); c.rotation.z = Math.PI / 2; c.position.y = 0.032; }],
]);
// freezer (top, floor top 1.42): dumplings, ice tray, ice-cream bars, frozen rice, meat, laver
fpack(FG, 'F', 1.42, 0.42, { x0: -0.285, x1: 0.285, z0: -0.292, z1: 0.285 }, [
  ['dumplings', (g) => { fbx(g, 0.17, 0.24, 0.05, 0xf4f4f0, 0, 0, 0, { r: 0.7 }); fbx(g, 0.172, 0.06, 0.052, 0xc0392b, 0, 0.09, 0); fbx(g, 0.06, 0.06, 0.054, 0xf2c230, 0, 0.18, 0); }],
  ['ice-tray', (g) => { fbx(g, 0.2, 0.03, 0.1, 0x6aa8d6, 0, 0, 0); for (let i = 0; i < 6; i++) fbx(g, 0.025, 0.02, 0.025, 0xeaf6fb, -0.07 + (i % 3) * 0.06, 0.03, -0.025 + Math.floor(i / 3) * 0.05, { t: 0.7 }); }],
  ['ice-bars', (g) => { for (let i = 0; i < 3; i++) { fbx(g, 0.045, 0.11, 0.016, [0xf2a0b8, 0x7a4a2a, 0xf4f0e0][i], i * 0.05, 0, 0); fbx(g, 0.01, 0.04, 0.008, 0xd9c28a, i * 0.05, 0.11, 0); } }],
  ['frozen-rice', (g) => { for (let i = 0; i < 3; i++) fbx(g, 0.09, 0.05, 0.065, 0xf6f6f0, 0, i * 0.05, 0, { t: 0.85 }); }],
  ['meat', (g) => { fbx(g, 0.15, 0.025, 0.1, 0xf4f4f4, 0, 0, 0, { r: 0.6 }); fbx(g, 0.14, 0.02, 0.09, 0xd96a6a, 0, 0.025, 0, { r: 0.7 }); }],
  ['laver', (g) => { fbx(g, 0.1, 0.16, 0.02, 0x1d3a2a, 0, 0, 0, { r: 0.7 }); fbx(g, 0.06, 0.02, 0.015, 0xd9c22a, 0, 0.1, 0.0025); }],
]);

// ---- fridge door: inner shelves (swing with the door) and outer clutter ----
const DR = fridgeDoor, dmat = frm(0xeaf3f1, 0.2, { t: 0.4 });
for (const y of [0.1, 0.52, 0.88, 1.22]) { bx(DR, 0.62, 0.012, 0.09, dmat, 0.35, y, -0.075); bx(DR, 0.62, y < 0.5 ? 0.09 : 0.05, 0.008, dmat, 0.35, y, -0.118); }
const DRG = { x0: 0.05, x1: 0.65, z0: -0.116, z1: -0.032 };
fpack(DR, 'D1', 0.112, 0.4, DRG, [['pet1', (g) => petBottle(g, 0, 0, 0)], ['pet2', (g) => petBottle(g, 0, 0, 0, 0x2f6bd0, 0.28)], ['soju1', (g) => soju(g, 0, 0, 0)], ['soju2', (g) => soju(g, 0, 0, 0)], ['soju3', (g) => soju(g, 0, 0, 0, 0.5)]]);
fpack(DR, 'D2', 0.532, 0.34, DRG, [['soy', (g) => sauce(g, 0, 0, 0, 0x3a2412, 0x2a2a2a, 0.2, 0.036)], ['oil', (g) => sauce(g, 0, 0, 0, 0xc88a1c, 0xf2c230, 0.17)], ['vinegar', (g) => sauce(g, 0, 0, 0, 0xeaf3f1, 0xcccccc, 0.18)], ['gochugaru-sauce', (g) => sauce(g, 0, 0, 0, 0xc4301c, 0xf0f0f0, 0.17, 0.03)], ['sesame-oil', (g) => sauce(g, 0, 0, 0, 0xf3ecd0, 0xc4301c, 0.16, 0.031)]]);
fpack(DR, 'D3', 0.892, 0.32, DRG, [
  ['jam1', (g) => { fcy(g, 0.04, 0.04, 0.09, 0xb04a2a, 0, 0, 0); fcy(g, 0.041, 0.041, 0.012, 0xe8d8a8, 0, 0.09, 0); }], ['jam2', (g) => { fcy(g, 0.035, 0.035, 0.08, 0x8a2a3a, 0, 0, 0); fcy(g, 0.036, 0.036, 0.012, 0xd8d8d8, 0, 0.08, 0); }],
  ['butter', (g) => fbx(g, 0.1, 0.04, 0.06, 0xf2d24a, 0, 0, 0)],  ['yogurt-door', (g) => { for (let i = 0; i < 5; i++) { fcy(g, 0.016, 0.018, 0.06, 0xf5eef0, i * 0.036, 0, 0); fcy(g, 0.0175, 0.0175, 0.012, 0xc32b2b, i * 0.036, 0.06, 0); } }],
]);
fpack(DR, 'D4', 1.232, 0.4, DRG, [
  ['beer-door', (g) => { for (let i = 0; i < 3; i++) canBlue(g, i * 0.066, 0, 0); }],
  ['tubes', (g) => { for (let i = 0; i < 4; i++) fcy(g, 0.012, 0.012, 0.11, [0x3a9a3a, 0xc0392b, 0xf0c030, 0xeeeeee][i], i * 0.03, 0, 0); }],
  ['cheese-slices', (g) => fbx(g, 0.1, 0.04, 0.05, 0xf4e8c8, 0, 0, 0)],
]);
// outer door: shopping list, delivery-menu magnet, calendar, assorted magnets
{
  const note = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.11), new THREE.MeshStandardMaterial({ map: signTex('장보기: 계란 두부 대파', '#2b3a8a', '#fff6b8', 320, 220, 34), roughness: 0.9 })); note.position.set(0.36, 1.45, 0.0315); DR.add(note); note.rotation.z = 0.04;
  const menu = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.16), new THREE.MeshStandardMaterial({ map: signTex('치킨 배달', '#fff', '#d6422a', 220, 320, 44), roughness: 0.8 })); menu.position.set(0.2, 1.1, 0.0315); DR.add(menu); menu.rotation.z = -0.05;
  const cal = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.15), new THREE.MeshStandardMaterial({ map: signTex('11월', '#c0392b', '#faf7ef', 240, 300, 80), roughness: 0.9 })); cal.position.set(0.5, 1.12, 0.0315); DR.add(cal);
  [[0.36, 1.52, 0xd6422a], [0.3, 1.38, 0x3a86c6], [0.2, 1.19, 0xf2c230], [0.5, 1.2, 0x3a9a3a], [0.56, 1.0, 0xe85a9a], [0.12, 0.7, 0x6a4a8a], [0.45, 0.55, 0xf08a1c]].forEach(([x, y, c]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.01, 12), frm(c, 0.4)); m.rotation.x = Math.PI / 2; m.position.set(x, y, 0.036); DR.add(m); });
}
TICKERS.push(() => { const e = clamp(-fridgeDoor.rotation.y / 1.2, 0, 1) * 0.24; for (const m of FR_LIST) m.emissiveIntensity = e; });

// ---- dining table setting (banchan, rice, soju, spoons) and a ramen bundle ----
{
  const rb = grp(-3.35, Y1 + 0.9, -10.78); for (let i = 0; i < 4; i++) { fbx(rb, 0.14, 0.012, 0.2, 0xc0392b, 0, i * 0.03, 0, { r: 0.7 }).rotation.y = i * 0.12; fbx(rb, 0.06, 0.016, 0.1, 0xf2c230, 0, i * 0.03 + 0.001, 0.02, { r: 0.7 }).rotation.y = i * 0.12; }
}

// ───────────────────────── TV: original live-concert broadcast ─────────────────────────
const TV_LANGS = ['en', 'ko', 'zh', 'ja'];
const LYR = [
  ['비 내리는 골목 끝에', 'At the end of the rainy alley', '雨中小巷的尽头', '雨の路地の突き当たりに', [64, 64, 62, 64, 67, 67, 65, 64], [1, .5, .5, 1, 1, 1, .5, 2.5]],
  ['작은 불빛 하나 켜지면', 'when one small light comes on', '当一盏小灯亮起', '小さな灯りがひとつ灯れば', [67, 69, 67, 64, 64, 67, 65, 64, 62], [1, .5, .5, 1, .5, .5, 1, 1, 2]],
  ['오늘도 나는 걸어요', 'I walk again today', '今天我也在走着', '今日も僕は歩いてる', [64, 64, 65, 67, 69, 67, 65, 64], [1, .5, .5, 1, 1, 1, 1, 2]],
  ['네 이름 불러 보면서', 'calling out your name', '轻轻唤着你的名字', '君の名前を呼びながら', [62, 64, 65, 67, 65, 64, 62, 60], [1, 1, 1, 1, 1, .5, .5, 2]],
  ['겨울이 오기 전에', 'before the winter comes', '在冬天来临之前', '冬が来る前に', [69, 69, 72, 71, 69, 67, 65], [1, 1, 1, 1, 1, 1, 2]],
  ['따뜻한 말 한마디만', 'just one warm word', '只要一句温暖的话', 'あたたかな一言だけ', [71, 71, 69, 67, 67, 69, 67, 64], [1, .5, .5, 1, 1, 1, 1, 2]],
  ['우리 집 창가에 앉아', 'sitting by the window of our home', '坐在我们家的窗边', '僕らの家の窓辺に座って', [69, 67, 65, 67, 69, 72, 71, 69], [1, .5, .5, 1, 1, 1, 1, 2]],
  ['오래오래 기다릴게요', "I'll wait for you, for a long, long time", '我会一直一直等你', 'いつまでも待っています', [67, 69, 67, 64, 64, 67, 65, 62, 60], [1, .5, .5, 1, .5, .5, 1, 1, 2]],
];
const TV_TITLE = ['골목 끝의 불빛', 'The Light at the End of the Alley', '巷尾的灯光', '路地裏の灯り'];
const TV_TOAST = ['On air: a live ballad concert (an original piece).', '방송 중: 라이브 발라드 콘서트 (오리지널 곡)', '正在直播：现场抒情演唱会（原创曲目）', '放送中：ライブ・バラードコンサート（オリジナル曲）'];
const TV_PROG = [[57, 60, 64, 45], [53, 57, 60, 41], [55, 60, 64, 48], [55, 59, 62, 43], [52, 55, 59, 40]]; // Am F C G Em: triad + bass
const CH = { Am: TV_PROG[0], F: TV_PROG[1], C: TV_PROG[2], G: TV_PROG[3], Em: TV_PROG[4] };
const LINE_CH = [['Am', 'F'], ['C', 'G'], ['Am', 'F'], ['G', 'C'], ['F', 'G'], ['Em', 'Am'], ['F', 'C'], ['G', 'C']];
const TV_BEAT = 60 / 66, TV_BAR = TV_BEAT * 4, TV_BARS = 19, TV_TOTAL = TV_BAR * TV_BARS;
const mhz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const VOW = { a: [730, 1090, 2440], i: [270, 2290, 3010], u: [300, 870, 2240], e: [530, 1840, 2480], o: [570, 840, 2410], x: [600, 1200, 2500], w: [300, 1350, 2300] };
const MED2V = ['a', 'e', 'a', 'e', 'x', 'e', 'x', 'e', 'o', 'a', 'e', 'e', 'o', 'u', 'x', 'e', 'i', 'u', 'w', 'w', 'i'];
function syllables(s) { const out = []; for (const ch of s) { const c = ch.charCodeAt(0) - 0xAC00; if (c < 0 || c > 11171) continue; out.push({ v: MED2V[Math.floor((c % 588) / 28)], cons: Math.floor(c / 588) !== 11 }); } return out; }

const tv = { clock: 0, a0: null, bar: 0, prev: false, vocal: [], sing: 0, line: -9, lang: '', bus: null, conv: null };
const tvCv = document.createElement('canvas'); tvCv.width = 640; tvCv.height = 360; const tvCx = tvCv.getContext('2d'); const tvOv = new THREE.CanvasTexture(tvCv); tvOv.colorSpace = THREE.SRGBColorSpace;
function tvDrawOv(line) {
  const g = tvCx, li = TV_LANGS.indexOf(LANG); g.clearRect(0, 0, 640, 360);
  const font = (w, s) => `${w} ${s}px "Noto Sans KR","Noto Sans SC","Noto Sans JP","Malgun Gothic","PingFang SC",sans-serif`;
  g.fillStyle = '#d6322a'; g.beginPath(); g.arc(34, 30, 7, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = font(700, 20); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('LIVE', 48, 31);
  g.textAlign = 'right'; g.fillStyle = 'rgba(255,255,255,0.8)'; g.font = font(500, 16); g.fillText('SEOUL EVENING LIVE', 620, 31);
  g.textAlign = 'center';
  if (line === -1) { g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, 130, 640, 100); g.fillStyle = '#fff'; g.font = font(700, 38); g.fillText(TV_TITLE[1], 320, 168); if (li !== 1) { g.fillStyle = '#f2d98a'; g.font = font(500, 22); g.fillText(TV_TITLE[li], 320, 208); } }
  else if (line >= 0) { g.fillStyle = 'rgba(0,0,0,0.58)'; g.fillRect(0, 262, 640, 98); g.fillStyle = '#fff'; g.font = font(700, 32); g.fillText(LYR[line][1], 320, 296); if (li !== 1) { g.fillStyle = '#f2d98a'; g.font = font(500, 20); g.fillText(LYR[line][li], 320, 336); } }
  else if (line === -2) { g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, 262, 640, 98); g.fillStyle = '#fff'; g.font = font(700, 32); g.fillText('감사합니다 ♪', 320, 296); }
  tvOv.needsUpdate = true;
}
Object.assign(tvMat.uniforms, { uSing: { value: 0 }, uBeat: { value: 0 }, uCheer: { value: 0 }, uZoom: { value: 1 }, uPan: { value: new THREE.Vector2() }, uBlur: { value: 0 }, uOv: { value: tvOv } });
tvMat.fragmentShader = `varying vec2 vUv; uniform float uTime, uOn, uSing, uBeat, uCheer, uZoom, uBlur; uniform vec2 uPan; uniform sampler2D uOv;
float h1(float n){ return fract(sin(n*127.1+3.7)*43758.5453); }
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float sdCap(vec2 p, vec2 a, vec2 b, float r){ vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h)-r; }
float sdEl(vec2 p, vec2 r){ return (length(p/r)-1.)*min(r.x,r.y); }
vec3 bokeh(vec2 p){
  vec3 acc=vec3(0.);
  for(int L=0;L<2;L++){
    float sc = L==0 ? 1.0 : 1.7; vec2 cell = vec2(.11,.13)*sc; vec2 q = p + vec2(float(L)*.37, float(L)*.21);
    vec2 id = floor(q/cell); vec2 f = fract(q/cell)-.5; float r = h2(id+float(L)*13.); vec2 j = vec2(h2(id+7.1), h2(id+3.3))-.5;
    float d = length((f-j*.55)*cell); float rad = (.010+.012*r)*sc*(1.+uBlur*1.8);
    float tw = .55+.45*sin(uTime*(.7+r*2.)+r*40.); float on = step(.25,h2(id+5.)); float g = exp(-d*d/(rad*rad))*tw*on;
    vec3 col = mix(vec3(1.,.62,.25), vec3(1.,.88,.62), h2(id+9.)); acc += col*g*(L==0?1.:.55);
  }
  return acc;
}
vec3 stage(vec2 p){
  vec3 c = mix(vec3(.015,.012,.03), vec3(.09,.05,.09), smoothstep(-.6,1.0,p.y));
  float up = .5+.5*smoothstep(-.5,.8,p.y);
  c += vec3(.10,.18,.45)*exp(-pow((p.x+1.25)/.6,2.))*(.5+.3*sin(uTime*.4))*up;
  c += vec3(.35,.12,.30)*exp(-pow((p.x-1.35)/.6,2.))*(.5+.3*sin(uTime*.5+2.))*up;
  c += bokeh(p)*smoothstep(-.45,-.1,p.y)*.9;
  float w = .06+(1.15-p.y)*.16; float pulse = .92+.08*(1.-uBeat);
  float cone = exp(-pow((p.x-.15)/w,2.)*1.6)*smoothstep(-.55,.3,p.y)*(1.-smoothstep(.9,1.4,p.y))*.55*pulse*(.85+.15*sin(p.y*30.+p.x*8.-uTime*.5));
  c += vec3(1.,.78,.5)*cone;
  c = mix(c, vec3(.03,.025,.035), smoothstep(-.43,-.5,p.y));
  c += vec3(1.,.8,.55)*exp(-(pow((p.x-.15)/.5,2.)+pow((p.y+.5)/.07,2.)))*.7*pulse;
  c += vec3(1.,.8,.5)*exp(-length(p-vec2(.15,1.05))*3.)*.15;
  return c;
}
vec3 singer(vec2 p, vec3 bg){
  vec2 q = p - vec2(.15,0.); float px = .004/uZoom; float spot = exp(-pow(q.x/.30,2.))*.9;
  float neck = sdCap(q, vec2(0.,.30), vec2(0.,.27), .022); float torso = sdCap(q, vec2(0.,.26), vec2(0.,.0), .075); float shl = sdCap(q, vec2(-.07,.24), vec2(.07,.24), .035);
  float legL = sdCap(q, vec2(-.03,.0), vec2(-.04,-.45), .038); float legR = sdCap(q, vec2(.04,.0), vec2(.05,-.45), .038);
  float body = min(min(min(torso, shl), min(legL, legR)), neck);
  float e = clamp(-body/.02,0.,1.);
  vec3 cloth = vec3(.10,.095,.12)*(.4+spot) + vec3(1.,.75,.45)*(1.-e)*.55*spot;
  vec3 col = mix(bg, cloth, smoothstep(px,-px,body));
  vec3 stand = vec3(.25); float st = sdCap(q, vec2(-.10,-.46), vec2(-.10,.33), .0035); col = mix(col, stand*(.4+spot), smoothstep(px,-px,st));
  float mic = sdEl(q-vec2(-.10,.34), vec2(.014,.02)); col = mix(col, vec3(.08), smoothstep(px,-px,mic));
  float head = sdEl(q-vec2(0.,.36), vec2(.052,.064));
  vec3 skin = vec3(.62,.42,.30)*(.25+.95*spot); float hair = smoothstep(.0,.012,(q.y-.375)+.018*sin(q.x*40.)+.014*q.x*q.x*80.);
  skin = mix(skin, vec3(.02,.018,.02), clamp(hair+smoothstep(.03,.05,abs(q.x))*.8*step(.34,q.y),0.,1.));
  vec2 eq = q-vec2(0.,.365); float eyes = min(length(eq-vec2(-.02,0.)), length(eq-vec2(.02,0.)))-.004; skin = mix(skin, vec3(.03), smoothstep(px,-px,eyes)*step(uZoom,6.));
  float mouth = sdEl(q-vec2(0.,.337), vec2(.013,.003+.014*uSing)); skin = mix(skin, vec3(.12,.02,.02), smoothstep(px,-px,mouth));
  col = mix(col, skin, smoothstep(px,-px,head));
  float armL = min(sdCap(q, vec2(-.07,.24), vec2(-.12,.12), .028), sdCap(q, vec2(-.12,.12), vec2(-.21,.13), .022));
  float armR = min(sdCap(q, vec2(.07,.24), vec2(.10,.10), .028), sdCap(q, vec2(.10,.10), vec2(.06,.03), .024));
  vec2 g = q - vec2(.02,.03); float gb = sdEl(g, vec2(.095,.075)); float gn = sdCap(q, vec2(-.03,.08), vec2(-.27,.17), .011);
  vec3 wood = vec3(.45,.21,.07)*(.3+1.2*spot); col = mix(col, vec3(.12,.07,.04)*(.4+spot), smoothstep(px,-px,gn)); col = mix(col, wood, smoothstep(px,-px,gb));
  col = mix(col, vec3(.02), smoothstep(px,-px,length(g-vec2(.025,.0))-.022));
  vec3 sleeve = vec3(.12,.11,.14)*(.4+spot)+vec3(1.,.75,.45)*.25*spot; col = mix(col, sleeve, smoothstep(px,-px,min(armL,armR)));
  return col;
}
vec3 crowd(vec2 p, vec3 c){
  for(int r=0;r<3;r++){
    float fr=float(r); float s=.75+fr*.45; float yb=-.56-fr*.17; float w=.17*s; float id=floor(p.x/w);
    c = mix(vec3(.01,.009,.014), c, smoothstep(yb-.12*s-.004, yb-.12*s+.004, p.y));
    for(int k=-1;k<=1;k++){
      float cid=id+float(k); float hh=h1(cid*3.1+fr*17.); float cx=(cid+.5)*w+(hh-.5)*.06*s; float cy=yb+(h1(cid+fr*5.)-.5)*.03;
      vec2 d0=p-vec2(cx,cy); float head=length(d0)-.052*s; float sh=sdEl(d0+vec2(0.,.10*s), vec2(.105*s,.075*s)); float dd=min(head,sh);
      vec3 col=vec3(.012,.010,.016)+vec3(.18,.12,.08)*smoothstep(.015,0.,abs(head))*.25;
      c=mix(c,col,smoothstep(.004,-.004,dd));
      if(hh>.45){
        float sw=sin(uTime*(1.6+uCheer*2.)+cid*1.7+fr)*.045*(1.+uCheer); vec2 a=vec2(cx+.045*s,cy+.02*s); vec2 b=a+vec2(sw*.5,.13*s);
        float ds=sdCap(p,a,b,.0045*s); vec3 sc = hh>.8 ? vec3(.6,.9,1.) : (hh>.62 ? vec3(1.,.55,.8) : vec3(1.,.95,.7)); float pu=.65+.35*sin(uTime*3.+cid);
        c+=sc*(smoothstep(.003,-.003,ds)*1.2+exp(-ds*ds/(.012*.012*s*s))*.35)*pu;
      }
    }
  }
  return c;
}
void main(){
  vec2 uv=vUv; vec2 p=vec2((uv.x-.5)*1.857,(uv.y-.5))*2.; p+=vec2(sin(uTime*1.1),cos(uTime*1.37))*.004; p=p/uZoom+uPan;
  vec3 c=stage(p); c=singer(p,c); c=crowd(p,c);
  c+=c*c*.25; vec2 vq=uv-.5; c*=1.-dot(vq,vq)*1.1; c+=(h2(uv*vec2(913.,517.)+uTime)-.5)*.02; c*=.93+.07*sin(uv.y*340.);
  vec4 ov=texture2D(uOv,uv); c=mix(c,ov.rgb,ov.a);
  gl_FragColor=vec4(mix(vec3(0.02,0.02,0.025), c, uOn),1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
tvMat.needsUpdate = true;

// ---- audio: warm piano ballad, strings pad, bass, a synthesized sung melody and applause ----
function tvEnsureBus() {
  if (tv.bus || !AC) return;
  tv.bus = AC.createGain(); tv.bus.gain.value = 0; tv.bus.connect(inBus);
  const len = Math.floor(AC.sampleRate * 2.4), ir = AC.createBuffer(2, len, AC.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  tv.conv = AC.createConvolver(); tv.conv.buffer = ir; const wet = AC.createGain(); wet.gain.value = 0.55; tv.bus.connect(tv.conv); tv.conv.connect(wet); wet.connect(inBus);
}
function tvPiano(m, t, d, v) {
  const f = mhz(m), g = AC.createGain(), o1 = AC.createOscillator(), o2 = AC.createOscillator(); o1.type = 'triangle'; o2.type = 'sine'; o1.frequency.value = f; o2.frequency.value = f * 2.001;
  const g2 = AC.createGain(); g2.gain.value = 0.28; o1.connect(g); o2.connect(g2); g2.connect(g);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + d); g.connect(tv.bus);
  o1.start(t); o2.start(t); o1.stop(t + d + 0.05); o2.stop(t + d + 0.05);
}
function tvPad(notes, t, d) {
  const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; const g = AC.createGain(); lp.connect(g); g.connect(tv.bus);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.03, t + 0.9); g.gain.setTargetAtTime(0.0001, t + d - 0.5, 0.35);
  for (const m of notes) for (const dt of [-6, 6]) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mhz(m - 12); o.detune.value = dt; o.connect(lp); o.start(t); o.stop(t + d + 0.5); }
}
function tvSing(midi, vow, cons, t, d) {
  const f = mhz(midi - 12), o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 0.985, t); o.frequency.linearRampToValueAtTime(f, t + 0.07);
  const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = 5.3; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.011, t + Math.min(0.5, d * 0.8)); lfo.connect(lg); lg.connect(o.frequency);
  const out = AC.createGain(); out.gain.setValueAtTime(0.0001, t); out.gain.linearRampToValueAtTime(0.5, t + 0.05); out.gain.setValueAtTime(0.5, t + d * 0.86); out.gain.linearRampToValueAtTime(0.0001, t + d);
  const fm = VOW[vow] || VOW.a; [[0, 1, 8], [1, 0.6, 10], [2, 0.28, 12]].forEach(([i, a, q]) => { const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fm[i]; bp.Q.value = q; const ga = AC.createGain(); ga.gain.value = a * 2.2; o.connect(bp); bp.connect(ga); ga.connect(out); });
  out.connect(tv.bus); o.start(t); lfo.start(t); o.stop(t + d + 0.1); lfo.stop(t + d + 0.1);
  if (cons) { const n = AC.createBufferSource(); n.buffer = noiseBuf; const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2800; bp.Q.value = 1; const ng = AC.createGain(); ng.gain.setValueAtTime(0.0001, t); ng.gain.linearRampToValueAtTime(0.1, t + 0.01); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.07); n.connect(bp); bp.connect(ng); ng.connect(tv.bus); n.start(t, Math.random() * 2); n.stop(t + 0.1); }
}
function tvApplause(t, d) {
  const n = AC.createBufferSource(); n.buffer = noiseBuf; n.loop = true; const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 0.5; const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.5, t + 0.5); for (let k = 0; k < d / 0.08; k++) g.gain.setTargetAtTime(0.22 + Math.random() * 0.3, t + 0.5 + k * 0.08, 0.03); g.gain.setTargetAtTime(0.0001, t + d - 1.2, 0.5);
  n.connect(bp); bp.connect(g); g.connect(tv.bus); n.start(t, Math.random() * 2); n.stop(t + d + 0.3);
  const w = AC.createOscillator(); const wg = AC.createGain(); w.type = 'sine'; w.frequency.setValueAtTime(1900, t + 0.7); w.frequency.linearRampToValueAtTime(2700, t + 1.3); wg.gain.setValueAtTime(0.0001, t + 0.7); wg.gain.linearRampToValueAtTime(0.05, t + 0.8); wg.gain.linearRampToValueAtTime(0.0001, t + 1.4); w.connect(wg); wg.connect(tv.bus); w.start(t + 0.7); w.stop(t + 1.5);
}
function tvScheduleBar(k) { // k = global bar number; song repeats every TV_BARS
  const b = k % TV_BARS, tb = k * TV_BAR, audio = AC && tv.a0 !== null, at = audio ? tv.a0 + tb : 0;
  const chName = b === 0 ? 'Am' : b >= 17 ? 'C' : LINE_CH[Math.floor((b - 1) / 2)][(b - 1) % 2], ch = CH[chName];
  if (audio) {
    const pat = [0, 1, 2, 1, 2, 1, 2, 1]; for (let i = 0; i < 8; i++) tvPiano(ch[pat[i]] + (i === 3 || i === 7 ? 12 : 0), at + i * TV_BEAT / 2, 1.5, 0.11 - (i % 2) * 0.03);
    tvPiano(ch[3], at, 2.2, 0.2); tvPiano(ch[3], at + TV_BEAT * 2, 1.4, 0.12); tvPad([ch[0], ch[1], ch[2]], at, TV_BAR);
  }
  if (b >= 1 && b <= 16 && (b - 1) % 2 === 0) {
    const L = LYR[(b - 1) / 2], sy = syllables(L[0]); let beat = 0;
    for (let i = 0; i < L[4].length && i < sy.length; i++) { const d = L[5][i] * TV_BEAT; tv.vocal.push({ s: tb + beat * TV_BEAT, d: d * 0.95 }); if (audio) tvSing(L[4][i], sy[i].v, sy[i].cons, at + beat * TV_BEAT, d * 0.95); beat += L[5][i]; }
  }
  if (b === 17) { if (audio) { tvPiano(60, at, 4, 0.16); tvPiano(64, at, 4, 0.12); tvPiano(67, at, 4, 0.12); tvPiano(48, at, 4, 0.2); } }
  if (b === 17 && audio) tvApplause(at + TV_BEAT, TV_BAR * 2 - TV_BEAT);
}
const TV_SEQ = [0, 1, 2, 1, 3, 5, 4, 2, 1, 0, 3, 2], TV_SHOTS = [[1, 0, 0, 0], [1.9, 0.15, 0.12, 0.4], [4.2, 0.15, 0.33, 1], [1.7, 0.2, -0.62, 0.3], [3.2, 0.08, 0.08, 0.7], [1.25, -0.25, 0.05, 0]];
function tvVisual(dt, t) {
  if (S.tv && !tv.prev) { tv.noAudio = false; tv.clock = 0; tv.a0 = null; tv.bar = 0; tv.vocal.length = 0; tv.line = -9; toast(TV_TOAST[TV_LANGS.indexOf(LANG)]); }
  if (!S.tv && tv.prev) { tv.a0 = null; if (AC && tv.bus) tv.bus.gain.setTargetAtTime(0, AC.currentTime, 0.05); }
  tv.prev = S.tv; if (!S.tv) { tv.sing = 0; return; }
  if (AC && tv.a0 !== null) tv.clock = AC.currentTime - tv.a0; else tv.clock += dt;
  try {
    if (AC && AC.state === 'running' && !tv.noAudio) { tvEnsureBus(); if (tv.a0 === null) tv.a0 = AC.currentTime - tv.clock + 0.12; }
    while (tv.bar * TV_BAR - tv.clock < 0.9) tvScheduleBar(tv.bar++);
  } catch (e) { tv.noAudio = true; tv.a0 = null; tv.err = String(e && e.message || e); }
  while (tv.vocal.length && tv.vocal[0].s + tv.vocal[0].d < tv.clock - 1) tv.vocal.shift();
  const st = ((tv.clock % TV_TOTAL) + TV_TOTAL) % TV_TOTAL, bar = st / TV_BAR, line = bar < 1 ? -1 : bar < 17 ? Math.floor((bar - 1) / 2) : -2;
  if (line !== tv.line || LANG !== tv.lang) { tv.line = line; tv.lang = LANG; tvDrawOv(line); }
  const active = tv.vocal.some((e) => e.s <= tv.clock && tv.clock < e.s + e.d); tv.sing += ((active ? 1 : 0) - tv.sing) * (1 - Math.exp(-dt * 16));
  const idx = Math.floor(st / 5.5), sh = TV_SHOTS[bar >= 17.3 ? 3 : TV_SEQ[idx % TV_SEQ.length]], prog = (st % 5.5) / 5.5, u = tvMat.uniforms;
  u.uSing.value = tv.sing; u.uBeat.value = (st / TV_BEAT) % 1; u.uCheer.value = bar >= 17.3 ? 1 : 0; u.uZoom.value = sh[0] * (1 + prog * 0.08); u.uPan.value.set(sh[1], sh[2]); u.uBlur.value = sh[3];
}
function tvAudio(T, ih) { if (!AC || !tv.bus) return; const near = (P.y < 2.5 && ih) ? 1 : (ih ? 0.22 : 0.1); tv.bus.gain.setTargetAtTime(S.tv ? 0.55 * near : 0, T, 0.1); }
TICKERS.push(tvVisual);

