// ───────────────────────── reflections: sky → environment map ─────────────────────────
const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(sky.geometry, sky.material));
let envRT = null, envSig = '', envT = 1;
function updateEnv(dt) {
  envT += dt; const sig = `${Math.floor(WORLD.hour * 5)}|${Math.floor(WX.cloud * 8)}|${Math.floor(WORLD.night * 8)}`;
  if (sig === envSig || envT < 0.7) return; envSig = sig; envT = 0;
  try { const rt = pmrem.fromScene(envScene, 0, 1, 2000); if (envRT) envRT.dispose(); envRT = rt; scene.environment = rt.texture; } catch (e) { /* reflections are optional */ }
}
scene.traverse((o) => { if (!o.isMesh && !o.isInstancedMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m && m.isMeshStandardMaterial) m.envMapIntensity = m.userData.refl ?? 0.1; }); });

// ───────────────────────── adaptive resolution (keeps phones smooth) ─────────────────────────
let qAcc = 0, qN = 0, qPR = renderer.getPixelRatio(); const qMax = Math.min(window.devicePixelRatio || 1, IS_TOUCH ? 1.5 : 2);
let qHigh = false;
const QL = { en: ['Quality: auto', 'Quality: high'], ko: ['화질: 자동', '화질: 높음'], zh: ['画质：自动', '画质：高'], ja: ['画質：自動', '画質：高'] };
function qualLabel() { const l = (typeof LANG !== 'undefined' && QL[LANG]) ? LANG : 'en'; return QL[l][qHigh ? 1 : 0]; }
(function () { const b = document.getElementById('qual'); if (!b) return; b.textContent = qualLabel(); b.addEventListener('click', () => { qHigh = !qHigh; b.setAttribute('aria-pressed', String(qHigh)); b.textContent = qualLabel(); if (qHigh) { qPR = qMax; renderer.setPixelRatio(qPR); resize(); } }); if (typeof langHooks !== 'undefined') langHooks.push(() => { b.textContent = qualLabel(); }); })();
function qualityTick(dt) {
  if (qHigh) return;
  qAcc += dt; qN++; if (qAcc < 2.5) return; const ms = qAcc / qN * 1000;
  if (ms > 40 && qPR > 0.85) { qPR = Math.max(0.85, qPR - 0.15); renderer.setPixelRatio(qPR); resize(); }
  else if (ms < 22 && qPR < qMax) { qPR = Math.min(qMax, qPR + 0.15); renderer.setPixelRatio(qPR); resize(); }
  qAcc = 0; qN = 0;
}

// ───────────────────────── room tour ─────────────────────────
const rampA = (z) => 0.1 + (-2.4 - z) / 6.2 * 3, rampB = (z) => 3.1 + (-2.4 - z) / 6.2 * 3;
const E = 1.62;
// [x, z, floorY, lookX, lookY, lookZ, stopKey, onEnter]
const ROUTE = [
  [0, 10.3, 0.0, 0, 2.6, -3, 'street', () => { WX.target = 'clear'; WORLD.hourTarget = 13; S.tv = false; S.shower = false; }],
  [0, 7.0, 0.0], [0, 3.6, 0.06, 0, 2.3, -2, 'yard'], [0, 0.6, 0.06], [0, -1.3, 0.1],
  [0, -3.5, 0.1, -1.9, 0.9, -2.45, 'entry'],
  [0.6, -5.2, 0.1, 1.6, 1.0, -10.6, 'living', () => { S.tv = true; S.ondol = true; }],
  [-1.3, -8.6, 0.1, -3.2, 1.0, -10.6, 'kitchen', () => { S.tv = false; S.ramen = 'cooking'; S.cookT = 3; S.fridge = true; }],
  [-0.8, -5.3, 0.1], [1.4, -6.2, 0.1], [2.8, -8.0, 0.1], [2.8, -9.85, 0.1], [4.2, -9.85, 0.1],
  [4.6, -10.0, 0.1, 4.1, 1.6, -8.95, 'bath', () => { S.fridge = false; S.ramen = 'none'; S.shower = true; S.fog = 0.7; }],
  [4.2, -9.85, 0.1, null, null, null, null, () => { S.shower = false; }], [2.8, -9.85, 0.1], [3.0, -3.8, 0.1], [4.3, -2.95, 0.1],
  [4.7, -4.0, rampA(-4.0)], [4.7, -6.0, rampA(-6.0)], [4.7, -8.3, rampA(-8.3)], [4.7, -9.4, 3.1],
  [2.4, -8.0, 3.1, 0.4, 3.7, -9.8, 'bed'],
  [1.0, -6.0, 3.1], [-1.9, -4.5, 3.1], [-1.9, -1.4, 3.1, 0.0, 2.2, 9.0, 'balcony'],
  [-1.9, -3.4, 3.1], [-4.5, -2.95, 3.1], [-4.7, -4.0, rampB(-4.0)], [-4.7, -6.0, rampB(-6.0)], [-4.7, -8.3, rampB(-8.3)], [-4.7, -9.6, 6.1], [-1.0, -8.0, 6.1, 70, 70, -320, 'roof', () => { WORLD.hourTarget = 17.4; }],
  [1.0, -4.6, 6.1, 0.0, 3.0, 12.0, 'dusk', () => { WORLD.hourTarget = 18.9; }],
];
const TOUR = { active: false, wp: [], stops: [], i: 0, hold: 0, from: null, cur: null, len: 0, u: 0, fast: false, stopNo: -1 };
(function build() {
  ROUTE.forEach((r, k) => {
    const [x, z, f, lx, ly, lz, key, on] = r; const w = { x, z, f, key, on, yaw: 0, pitch: 0 };
    if (lx !== undefined && lx !== null) { const dx = lx - x, dz = lz - z; w.yaw = Math.atan2(-dx, -dz); w.pitch = Math.atan2(ly - (f + E), Math.hypot(dx, dz)); w.look = true; }
    TOUR.wp.push(w);
  });
  TOUR.wp.forEach((w, k) => { if (!w.look) { const n = TOUR.wp[Math.min(k + 1, TOUR.wp.length - 1)], p = TOUR.wp[Math.max(k - 1, 0)]; let dx = n.x - w.x, dz = n.z - w.z; if (Math.hypot(dx, dz) < 0.01) { dx = w.x - p.x; dz = w.z - p.z; } w.yaw = Math.atan2(-dx, -dz); w.pitch = Math.abs(n.f - w.f) > 0.05 ? 0.12 : 0; } });
  TOUR.wp.forEach((w, k) => { if (w.key) TOUR.stops.push(k); });
  const dots = $('tdots'); TOUR.stops.forEach(() => dots.appendChild(document.createElement('i')));
})();
function angLerp(a, b, t) { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * t; }
function tourShow(k) {
  const w = TOUR.wp[k]; if (!w || !w.key) return; TOUR.stopNo = TOUR.stops.indexOf(k);
  $('tt').textContent = T('t_' + w.key); $('td').textContent = T('d_' + w.key); $('tourbar').classList.add('on');
  [...$('tdots').children].forEach((d, i) => d.classList.toggle('on', i === TOUR.stopNo));
  $('tnext').textContent = T(TOUR.stopNo === TOUR.stops.length - 1 ? 'tour_exit' : 'tour_next');
}
function tourArrive(k) { const w = TOUR.wp[k]; if (w.on) w.on(); if (w.key) { TOUR.hold = w.key === 'street' ? 7 : w.key === 'dusk' ? 11 : 7.5; tourShow(k); } }
function tourStart() {
  TOUR.active = true; document.body.classList.add('touring'); $('tourbtn').setAttribute('aria-pressed', 'true'); stand();
  S.door = true; S.shower = false; S.sleeping = false; TOUR.i = 0; TOUR.cur = Object.assign({}, TOUR.wp[0]); TOUR.from = null; TOUR.fast = false; tourArrive(0);
}
function tourEnd(finished) {
  if (!TOUR.active) return; TOUR.active = false; document.body.classList.remove('touring'); $('tourbar').classList.remove('on'); $('tourbtn').setAttribute('aria-pressed', 'false');
  const c = TOUR.cur; P.x = c.x; P.z = c.z; P.y = c.f; P.yaw = c.yaw; P.pitch = c.pitch; P.vx = P.vz = 0; S.shower = false; if (finished) toast(T('tour_end'));
}
function tourNext() {
  if (!TOUR.active) return; if (TOUR.stopNo === TOUR.stops.length - 1 && TOUR.hold > 0) return tourEnd(true);
  if (TOUR.hold > 0) TOUR.hold = 0.01; else TOUR.fast = true; $('tourbar').classList.remove('on');
}
function tourPrev() {
  if (!TOUR.active) return; const cur = TOUR.stopNo; const to = TOUR.stops[Math.max(0, (TOUR.hold > 0 ? cur - 1 : cur - 1))]; const f = $('fade'); f.textContent = ''; f.style.transition = 'opacity 0.3s'; f.style.opacity = '1';
  setTimeout(() => { TOUR.i = to; TOUR.cur = Object.assign({}, TOUR.wp[to]); TOUR.from = null; TOUR.fast = false; tourArrive(to); f.style.opacity = '0'; setTimeout(() => { f.style.transition = ''; }, 350); }, 320);
}
function tourUpdate(dt) {
  if (!TOUR.active) return false; const c = TOUR.cur; let moving = false;
  if (TOUR.hold > 0) {
    TOUR.hold -= dt; if (TOUR.hold <= 0) { if (TOUR.stopNo === TOUR.stops.length - 1) { tourEnd(true); return false; } $('tourbar').classList.remove('on'); TOUR.from = null; TOUR.i++; }
  } else {
    if (!TOUR.from) { TOUR.from = Object.assign({}, c); const t = TOUR.wp[TOUR.i]; TOUR.len = Math.max(0.05, Math.hypot(t.x - c.x, t.z - c.z, (t.f - c.f) * 1.4)); TOUR.u = 0; }
    const t = TOUR.wp[TOUR.i], sp = (TOUR.fast ? 7 : 2.5); TOUR.u = Math.min(1, TOUR.u + sp * dt / TOUR.len); const u = TOUR.u, e = TOUR.fast ? u : u * u * (3 - 2 * u) * 0.35 + u * 0.65;
    c.x = lerp(TOUR.from.x, t.x, u); c.z = lerp(TOUR.from.z, t.z, u); c.f = lerp(TOUR.from.f, t.f, u); c.yaw = angLerp(TOUR.from.yaw, t.yaw, smooth(0, 1, e)); c.pitch = lerp(TOUR.from.pitch, t.pitch, smooth(0, 1, e)); moving = true;
    if (u >= 1) { TOUR.from = null; if (t.key) TOUR.fast = false; tourArrive(TOUR.i); if (!t.key && TOUR.i < TOUR.wp.length - 1) TOUR.i++; else if (!t.key) { tourEnd(true); return false; } }
  }
  const sway = TOUR.hold > 0 ? Math.sin(simT * 0.5) * 0.035 : 0;
  P.x = c.x; P.z = c.z; P.y = c.f; P.yaw = c.yaw + sway; P.pitch = c.pitch + (TOUR.hold > 0 ? Math.sin(simT * 0.37) * 0.012 : 0); P.eye = E; P.vx = moving ? 1 : 0; P.vz = 0; if (moving) P.walk += 2.4 * dt * 0.6;
  return true;
}
langHooks.push(() => { if (TOUR.active && TOUR.stopNo >= 0) tourShow(TOUR.stops[TOUR.stopNo]); });
$('tnext').addEventListener('click', tourNext); $('tprev').addEventListener('click', tourPrev); $('texit').addEventListener('click', () => tourEnd(false));
$('tourbtn').addEventListener('click', () => { if (!started) return; TOUR.active ? tourEnd(false) : tourStart(); });
$('tourgo').addEventListener('click', () => { started = true; initAudio(); if (AC && AC.state === 'suspended') AC.resume(); $('intro').style.display = 'none'; tourStart(); });
// language buttons (HUD + intro card)
document.querySelectorAll('#lang button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
{ const row = $('lang2'); [['en', 'English'], ['ko', '한국어'], ['zh', '中文'], ['ja', '日本語']].forEach(([l, n]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = n; b.dataset.lang = l; b.addEventListener('click', () => { setLang(l); row.querySelectorAll('button').forEach((x) => { x.setAttribute('aria-pressed', String(x.dataset.lang === LANG)); }); }); row.appendChild(b); });
  langHooks.push(() => row.querySelectorAll('button').forEach((x) => { x.setAttribute('aria-pressed', String(x.dataset.lang === LANG)); })); }
{ const mb = $('menubtn'), mn = $('menu'); const setM = (on) => { mn.classList.toggle('on', on); mb.setAttribute('aria-expanded', String(on)); document.body.classList.toggle('menu-open', on); };
  mb.addEventListener('click', (e) => { e.stopPropagation(); setM(!mn.classList.contains('on')); });
  document.addEventListener('pointerdown', (e) => { if (!mn.contains(e.target) && e.target !== mb && !mb.contains(e.target)) setM(false); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setM(false); });
  $('tourbtn').addEventListener('click', () => setM(false)); }
applyLang();
Object.assign(window.__seoul, { TOUR, tourUpdate, tourStart, tourNext, tourPrev, tourEnd, setLang, PEOPLE, tv, tvMat });


// ready: enable the buttons, drop the loading line, pause audio while the tab is hidden
$('go').disabled = false; $('tourgo').disabled = false; 
document.addEventListener('visibilitychange', () => { if (!AC) return; try { if (document.hidden) AC.suspend(); else if (started && !muted) AC.resume(); } catch (e) { /* audio is optional */ } });
