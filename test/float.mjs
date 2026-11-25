import { open } from './harness.mjs';
const t = await open(process.argv[2], { width: 600, height: 400 }); await t.sleep(800);
const out = await t.page.evaluate(() => {
  const s = __seoul; const V = s.camera.position.constructor; const meshes = [];
  s.scene.updateMatrixWorld(true);
  s.scene.traverse((m) => { if (!m.isMesh || !m.geometry || !m.visible) return; let p = m.parent, vis = true; while (p) { if (!p.visible) { vis = false; break; } p = p.parent; } if (!vis) return; const g = m.geometry; if (!g.boundingBox) g.computeBoundingBox(); const b = g.boundingBox; if (!b) return;
    let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9; for (const x of [b.min.x,b.max.x]) for (const y of [b.min.y,b.max.y]) for (const z of [b.min.z,b.max.z]) { const v = new V(x,y,z).applyMatrix4(m.matrixWorld); x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);y0=Math.min(y0,v.y);y1=Math.max(y1,v.y);z0=Math.min(z0,v.z);z1=Math.max(z1,v.z);} 
    if (!isFinite(x0)) return; meshes.push({ m, x0,x1,y0,y1,z0,z1 }); });
  const res = [];
  for (const a of meshes) { const w = a.x1-a.x0, h = a.y1-a.y0, d = a.z1-a.z0; if (h > 1.2 || w > 1.6 || d > 1.6) continue; if (a.x1-a.x0 < 0.005 && a.z1-a.z0 < 0.005) continue; if (Math.abs(a.x0)>30||a.z0>25||a.z0<-14) continue;
    const cx=(a.x0+a.x1)/2, cz=(a.z0+a.z1)/2; let ok = false;
    for (const b of meshes) { if (b===a) continue; if (cx>=b.x0-0.03&&cx<=b.x1+0.03&&cz>=b.z0-0.03&&cz<=b.z1+0.03 && Math.abs(b.y1-a.y0)<0.06) { ok = true; break; } }
    if (!ok) { const fl = s.surfaceY(cx, cz, a.y0+0.3); if (Math.abs(fl - a.y0) < 0.06) ok = true; }
    if (!ok) res.push([cx.toFixed(2), a.y0.toFixed(2), cz.toFixed(2), (w).toFixed(2), h.toFixed(2), a.m.geometry.type.replace('Geometry','')].join(' ')); }
  return res;
});
console.log(out.length); console.log(out.filter(r=>{const [x,y,z]=r.split(' ').map(parseFloat); return y<7.5 && z<12.5 && z>-11.5 && x>-8 && x<8;}).join('\n'));
await t.close();
