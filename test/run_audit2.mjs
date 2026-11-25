import { open } from './harness.mjs'; import { fridgeAudit } from './audit_lib.mjs';
const t = await open(process.argv[2], { width: 800, height: 600 }); await t.page.evaluate('__seoul.start()'); await t.sleep(1500);
const r = await fridgeAudit(t.page); const v = await t.page.evaluate(() => window.__fridge ? { n: __fridge.items.length, v: __fridge.violations } : null);
console.log(JSON.stringify({ body: { itemMeshes: r.body.itemMeshes, outsideCavity: r.body.outsideCavity, crossesShelf: r.body.crossesShelf, interpenetrating: r.body.interpenetrating }, outside: r.body.samples.outside, pairs: r.body.samples.pairs.map(p=>[p.ia,p.ib,p.a,p.b]), packer: v })); console.log('errors', t.errors.filter((e) => !/404/.test(e))); await t.close();
