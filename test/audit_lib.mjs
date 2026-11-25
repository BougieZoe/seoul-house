// Generic fridge audit that works on both the v3 reference and new builds (same fridge position).
// "Item meshes" = meshes whose emissive == color (the frm() materials). New builds additionally group meshes under userData.item groups.
export async function fridgeAudit(page) {
  return page.evaluate(() => {
    const s = __seoul, near = (a, b) => Math.abs(a - b) < 0.02; let body = null, door = null;
    s.scene.traverse((o) => { if (o.isGroup && near(o.position.x, -5.4) && near(o.position.y, 0.1) && near(o.position.z, -10.5)) body = o; if (o.isGroup && near(o.position.x, -5.75) && near(o.position.y, 0.1) && near(o.position.z, -10.13)) door = o; });
    if (!body || !door) return { error: 'fridge groups not found' };
    const isStruct = (m) => { let o = m; while (o) { if (o.userData && o.userData.structure) return true; o = o.parent; } return false; };
    const isItem = (m) => !isStruct(m) && m.isMesh && m.material && m.material.emissive && m.material.color && m.material.emissive.getHex() === m.material.color.getHex() && m.material.color.getHex() !== 0;
    const itemOf = (m) => { let o = m; while (o) { if (o.userData && o.userData.item) return o.userData.item; o = o.parent; } return null; };
    const wb = (m, base) => { m.updateWorldMatrix(true, false); const g = m.geometry; if (!g.boundingBox) g.computeBoundingBox(); const b = g.boundingBox, e = m.matrixWorld.elements; const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
      for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) { const w = [e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]]; for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], w[i] - base[i]); mx[i] = Math.max(mx[i], w[i] - base[i]); } } return { mn, mx, m }; };
    const f = (a) => a.map((v) => +v.toFixed(3)); const out = { body: {}, door: {} };
    // ---- body ----
    const bp = [body.position.x, body.position.y, body.position.z]; const meshes = []; body.traverse((m) => { if (isItem(m)) meshes.push(wb(m, bp)); });
    const shelves = [[0.52, 0.532], [0.86, 0.872], [1.14, 1.152], [1.40, 1.42]]; const outside = [], cross = [], pairs = [];
    for (const it of meshes) { const { mn, mx } = it; if (mn[0] < -0.301 - 0.004 || mx[0] > 0.301 + 0.004 || mn[2] < -0.31 - 0.004 || mx[2] > 0.26 + 0.004) outside.push({ id: itemOf(it.m), mn: f(mn), mx: f(mx) });
      for (const [bot, top] of shelves) if (mn[1] < bot - 0.004 && mx[1] > top + 0.004 && mn[1] > bot - 0.45) cross.push({ shelf: bot, mn: f(mn), mx: f(mx) }); }
    for (let i = 0; i < meshes.length; i++) for (let j = i + 1; j < meshes.length; j++) { const a = meshes[i], b = meshes[j]; const ia = itemOf(a.m), ib = itemOf(b.m); if (ia && ia === ib) continue;
      const ox = Math.min(a.mx[0], b.mx[0]) - Math.max(a.mn[0], b.mn[0]), oy = Math.min(a.mx[1], b.mx[1]) - Math.max(a.mn[1], b.mn[1]), oz = Math.min(a.mx[2], b.mx[2]) - Math.max(a.mn[2], b.mn[2]); if (ox < 0.004 || oy < 0.004 || oz < 0.004) continue;
      const cax = (a.mn[0] + a.mx[0]) / 2, caz = (a.mn[2] + a.mx[2]) / 2, cbx = (b.mn[0] + b.mx[0]) / 2, cbz = (b.mn[2] + b.mx[2]) / 2; const concentric = Math.hypot(cax - cbx, caz - cbz) < 0.012; if (!ia && concentric) continue;
      pairs.push({ ia, ib, a: [f(a.mn), f(a.mx)], b: [f(b.mn), f(b.mx)] }); }
    out.body = { itemMeshes: meshes.length, outsideCavity: outside.length, crossesShelf: cross.length, interpenetrating: pairs.length, samples: { outside, pairs } };
    // ---- door inner shelves (local z < 0) ----
    const dp = [door.position.x, door.position.y, door.position.z]; const dm = []; door.traverse((m) => { if (isItem(m) && m.getWorldPosition) { const w = wb(m, [0, 0, 0]); const lz = (w.mn[2] + w.mx[2]) / 2 - dp[2]; if (true) dm.push({ m, mn: w.mn, mx: w.mx }); } });
    out.door = { itemMeshes: dm.length };
    return out;
  });
}
