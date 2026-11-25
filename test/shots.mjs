import { open } from './harness.mjs';
// usage: node shots.mjs html outprefix  -> several viewpoints
const views = JSON.parse(process.argv[4] || '[]');
const t = await open(process.argv[2], { width: 900, height: 700 });
await t.page.evaluate('__seoul.start()'); await t.sleep(800);
for (const v of views) {
  await t.page.evaluate((v) => { const s = __seoul; Object.assign(s.P, { x: v.x, z: v.z, y: v.y, yaw: v.yaw, pitch: v.pitch ?? -0.1, vy: 0 }); if (v.fridge) s.S.fridge = true; s.WORLD.hour = s.WORLD.hourTarget = v.hour ?? 14; }, v);
  await t.sleep(1200); await t.page.screenshot({ path: `${process.argv[3]}_${v.n}.png` });
}
console.log(t.errors.filter((e) => !/404/.test(e))); await t.close();
