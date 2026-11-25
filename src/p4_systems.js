// ───────────────────────── weather particles (GLSL) ─────────────────────────
const INSIDE_GLSL = `bool insideHouse(vec3 p){ return p.x>-6.2 && p.x<6.2 && p.z>-11.2 && p.z<-1.8 && p.y<6.3; }`;
const PRE = { uTime: WU.uTime, uCam: { value: new THREE.Vector3() }, uAmt: { value: 0 }, uScale: PU.uScale };
function seeded(n, k) { const a = new Float32Array(n * k); for (let i = 0; i < a.length; i++) a[i] = Math.random(); return a; }
// rain: streaks
const RN = IS_TOUCH ? 3500 : 7000;
const rainGeo = new THREE.BufferGeometry(); {
  const s = seeded(RN, 3), seed = new Float32Array(RN * 6), end = new Float32Array(RN * 2), pos = new Float32Array(RN * 6);
  for (let i = 0; i < RN; i++) for (let v = 0; v < 2; v++) { for (let k = 0; k < 3; k++) seed[(i * 2 + v) * 3 + k] = s[i * 3 + k]; end[i * 2 + v] = v; }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); rainGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3)); rainGeo.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
}
const rain = new THREE.LineSegments(rainGeo, new THREE.ShaderMaterial({
  uniforms: PRE, transparent: true, depthWrite: false,
  vertexShader: `${INSIDE_GLSL}
  attribute vec3 aSeed; attribute float aEnd; uniform float uTime, uAmt; uniform vec3 uCam; varying float vA;
  void main(){ vec3 SIZE = vec3(34.,22.,34.); vec3 s = aSeed*SIZE; s.y -= uTime*(15.0+aSeed.x*4.0);
    vec3 p = uCam + (mod(s - uCam, SIZE) - SIZE*0.5); p.y += aEnd*0.6; p.x += aEnd*0.09;
    vA = uAmt*(1.0-smoothstep(9.0,16.0,length(p-uCam)))*0.55; if(insideHouse(p)) vA = 0.0;
    gl_Position = projectionMatrix*viewMatrix*vec4(p,1.0); }`,
  fragmentShader: `varying float vA; void main(){ if(vA<0.01) discard; gl_FragColor = vec4(0.78,0.85,0.95,vA);
#include <colorspace_fragment>
}`,
}));
rain.frustumCulled = false; rain.renderOrder = 6; scene.add(rain);
// snow flakes and ginkgo leaves share one point shader
function pointFall(count, size, fall, sway, kind) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seeded(count, 4), 4));
  const m = new THREE.ShaderMaterial({
    uniforms: Object.assign({ uSize: { value: size }, uFall: { value: fall }, uSway: { value: sway } }, PRE), transparent: true, depthWrite: false,
    vertexShader: `${INSIDE_GLSL}
    attribute vec4 aSeed; uniform float uTime, uAmt, uSize, uFall, uSway, uScale; uniform vec3 uCam; varying float vA; varying vec3 vC; varying float vRot;
    void main(){ vec3 SIZE = vec3(30.,14.,30.); vec3 s = aSeed.xyz*SIZE; s.y -= uTime*uFall*(0.6+aSeed.w*0.8);
      vec3 p = uCam + (mod(s - uCam, SIZE) - SIZE*0.5);
      p.x += sin(uTime*0.7+aSeed.y*6.28)*uSway; p.z += cos(uTime*0.6+aSeed.x*6.28)*uSway;
      vec4 mv = viewMatrix*vec4(p,1.0); gl_Position = projectionMatrix*mv;
      gl_PointSize = max(2.0, uSize*(0.6+aSeed.w*0.8)*uScale/max(-mv.z,0.1));
      vA = uAmt*(1.0-smoothstep(10.0,15.0,length(p-uCam))); if(insideHouse(p)) vA = 0.0;
      vC = mix(vec3(0.93,0.74,0.16), vec3(0.88,0.5,0.1), aSeed.w); vRot = aSeed.y*6.28+uTime*(1.0+aSeed.x); }`,
    fragmentShader: `varying float vA; varying vec3 vC; varying float vRot;
    void main(){ if(vA<0.01) discard; vec2 c = gl_PointCoord-0.5;
      ${kind === 'snow' ? 'float d = length(c)*2.0; float a = smoothstep(1.0,0.2,d)*vA; if(a<0.02) discard; gl_FragColor = vec4(0.96,0.98,1.0,a);' : 'float cs=cos(vRot), sn=sin(vRot); vec2 q = vec2(cs*c.x - sn*c.y, sn*c.x + cs*c.y); float d = abs(q.x)*1.9 + abs(q.y)*3.2; if(d>1.0) discard; gl_FragColor = vec4(vC, vA);'}
      #include <colorspace_fragment>
}`,
  });
  const p = new THREE.Points(g, m); p.frustumCulled = false; p.renderOrder = 6; scene.add(p); return p;
}
const snow = pointFall(IS_TOUCH ? 2500 : 5000, 0.05, 1.3, 0.5, 'snow');
const leaves = pointFall(IS_TOUCH ? 220 : 420, 0.1, 0.9, 1.2, 'leaf');

// ───────────────────────── world state: weather, time, lights ─────────────────────────
const WX = { target: 'clear', rain: 0, snow: 0, cover: 0, wet: 0, cloud: 0.08, windy: 0.2 };
const WORLD = { hour: 13, hourTarget: 13, night: 0, dark: 0, alt: 1 };
const C = (r, g, b) => new THREE.Color().setRGB(r, g, b);
const sm = smooth;
function approach(v, t, rate) { return v < t ? Math.min(t, v + rate) : Math.max(t, v - rate); }
const cNight = [C(0.004, 0.008, 0.03), C(0.09, 0.08, 0.13)], cDusk = [C(0.12, 0.14, 0.32), C(0.9, 0.38, 0.2)], cDay = [C(0.1, 0.3, 0.72), C(0.55, 0.72, 0.92)];
const _z = new THREE.Color(), _h = new THREE.Color(), _t = new THREE.Color();
const sunDir = new THREE.Vector3(), tmpV = new THREE.Vector3();
let wdt = 0.016;
function updateWorld(dt, t) {
  // weather amounts glide toward their targets
  const wr = WX.target === 'rain' ? 1 : 0, ws = WX.target === 'snow' ? 1 : 0;
  // real elapsed time (not the 0.05 s-capped frame step) so a slow phone still clears the sky in a few seconds
  const dw = wdt;
  WX.rain = approach(WX.rain, wr, dw * (wr ? 0.35 : 0.9)); WX.snow = approach(WX.snow, ws, dw * (ws ? 0.3 : 0.9));
  WX.cloud = approach(WX.cloud, wr ? 0.9 : ws ? 0.82 : 0.08, dw * (wr || ws ? 0.3 : 0.5));
  WX.wet = approach(WX.wet, Math.max(wr, ws * 0.5), dw * (WX.wet < Math.max(wr, ws * 0.5) ? 0.3 : 0.07));
  WX.cover = approach(WX.cover, ws, dw * (ws ? 0.05 : 0.1));
  WX.windy = approach(WX.windy, WX.target === 'clear' ? 0.25 : 1, dw * 0.4); S.windy = WX.windy;
  WU.uWet.value = WX.wet; WU.uRain.value = WX.rain; WU.uSnow.value = WX.cover;
  const cl = WX.cloud;
  // time of day
  WORLD.hour = approach(WORLD.hour, WORLD.hourTarget, dt * 4.5);
  const a = (WORLD.hour - 6) / 12 * Math.PI, alt = Math.sin(a) * 0.68; WORLD.alt = alt;
  sunDir.set(Math.cos(a), Math.sin(a) * 0.68, 0.38).normalize();
  const dayw = sm(0.0, 0.3, alt), duskw = sm(-0.3, 0.0, alt);
  _z.copy(cNight[0]).lerp(cDusk[0], duskw).lerp(cDay[0], dayw); _h.copy(cNight[1]).lerp(cDusk[1], duskw).lerp(cDay[1], dayw);
  const lum = _h.r * 0.3 + _h.g * 0.6 + _h.b * 0.1; _t.setRGB(lum * 0.92, lum * 0.97, lum * 1.03);
  _z.lerp(_t, cl * 0.82 * (0.4 + 0.6 * dayw) + cl * 0.18); _h.lerp(_t, cl * 0.8);
  skyU.uZenith.value.copy(_z); skyU.uHorizon.value.copy(_h);
  skyU.uSunDir.value.copy(sunDir); skyU.uCloud.value = cl;
  WORLD.night = 1 - sm(-0.12, 0.12, alt); skyU.uNight.value = WORLD.night;
  WORLD.dark = clamp(WORLD.night + cl * 0.55 * (1 - WORLD.night), 0, 1);
  skyU.uSunCol.value.setRGB(1, 0.55, 0.3).lerp(C(1, 0.96, 0.88), sm(0.05, 0.5, alt));
  skyU.uCloudCol.value.copy(_h).multiplyScalar(1.12).lerp(C(0.92, 0.94, 0.97), dayw * 0.75).multiplyScalar(0.55 + 0.45 * Math.max(dayw, 0.15) - 0.22 * cl);
  scene.fog.color.copy(_h).lerp(C(0.02, 0.03, 0.06), WORLD.night * 0.35); scene.background = null;
  scene.fog.density = 0.0024 + WX.rain * 0.0065 + WX.snow * 0.011 + WORLD.night * 0.0006;
  // sun / moon
  if (alt > 0) { sun.color.setRGB(1, 0.62, 0.38).lerp(C(1, 0.96, 0.9), sm(0.04, 0.45, alt)); sun.intensity = 3.4 * sm(0, 0.22, alt) * (1 - 0.82 * cl); tmpV.copy(sunDir); }
  else { sun.color.setRGB(0.55, 0.65, 1); sun.intensity = 0.55 * (1 - sm(-0.2, 0, alt)) * (1 - 0.6 * cl); tmpV.copy(skyU.uMoonDir.value); }
  sun.position.copy(camera.position).addScaledVector(tmpV, 90); sun.position.y = Math.max(sun.position.y, 20); sun.target.position.copy(camera.position);
  hemi.color.setRGB(0.55, 0.7, 1).lerp(C(0.8, 0.88, 1), dayw); hemi.groundColor.setRGB(0.2, 0.2, 0.25).lerp(C(0.42, 0.4, 0.34), dayw);
  hemi.intensity = lerp(0.3, 0.95, dayw) + 0.28 * cl * dayw + WX.cover * 0.15;
  renderer.toneMappingExposure = 1.0 + WX.cover * 0.1;
  // emissives and lamps follow darkness
  for (const n of NIGHT_MATS) n.m.emissiveIntensity = n.base !== undefined ? lerp(n.base, n.k, WORLD.dark) : n.k * WORLD.dark;
  NIGHT_HOOKS.forEach((f) => f(WORLD.dark));
  const lamp = sm(0.3, 0.75, WORLD.dark);
  LIGHTS.lamp1.intensity = LIGHTS.lamp2.intensity = 14 * lamp; LIGHTS.roof.intensity = 8 * sm(0.5, 0.95, WORLD.dark);
  for (const k in ROOMS) {
    const r = ROOMS[k]; const auto = WORLD.dark > 0.45;
    const on = k === 'bath' ? (S.bath ?? S.f1 ?? auto) : (S[r.key] ?? auto);
    r.light.intensity = approach(r.light.intensity, on ? r.I : 0, dt * r.I * 3); r.mat.emissiveIntensity = (r.light.intensity / r.I) * 2.2;
  }
  const lampOn = S.lamp ?? false; LIGHTS.bedside.intensity = approach(LIGHTS.bedside.intensity, lampOn ? 5 : 0, dt * 30); lampShade.emissiveIntensity = LIGHTS.bedside.intensity / 9 * 1.6;
  const k = (Math.sin(Math.floor(t * 0.5) * 12.9898) * 43758.5453) % 1; LIGHTS.tv.color.setHSL(0.08 + 0.04 * Math.sin(t * 0.4), 0.7, 0.6);
  LIGHTS.tv.intensity = approach(LIGHTS.tv.intensity, S.tv ? 6 + Math.sin(t * 9) * 1.2 : 0, dt * 30); tvMat.uniforms.uOn.value = approach(tvMat.uniforms.uOn.value, S.tv ? 1 : 0, dt * 8);
  // underfloor heating glows faintly
  M.wood.emissive.setRGB(1, 0.45, 0.15); M.wood.emissiveIntensity = approach(M.wood.emissiveIntensity, S.ondol ? 0.1 : 0, dt * 0.15); thermoMat.emissiveIntensity = S.ondol ? 1.1 : 0.25;
  // precipitation
  PRE.uCam.value.copy(camera.position);
  rain.visible = WX.rain > 0.01; rain.material.uniforms.uAmt.value = WX.rain;
  snow.visible = WX.snow > 0.01; snow.material.uniforms.uAmt.value = WX.snow;
  const lf = (1 - Math.max(WX.rain, WX.snow)) * (WORLD.night < 0.7 ? 1 : 0.4); leaves.visible = lf > 0.02; leaves.material.uniforms.uAmt.value = lf * 0.95;
  // buttons
  document.querySelectorAll('#wx button').forEach((b) => { const w = b.dataset.wx; b.setAttribute('aria-pressed', String(w ? WX.target === w : WORLD.hourTarget > 17 || WORLD.hourTarget < 6)); });
}
function setWeather(w) { WX.target = w; sfx('click'); toast(T('wx_t_' + w)); }
function toggleNight() { WORLD.hourTarget = (WORLD.hourTarget > 17 || WORLD.hourTarget < 6) ? 13 : 22; sfx('click'); }

// ───────────────────────── kitchen / shower / TV state machine ─────────────────────────
function updateScene(dt, t) {
  // cooking
  if (S.ramen === 'have' || S.ramen === 'none' || S.ramen === 'eaten') { pot.visible = false; }
  if (S.ramen === 'cooking') { pot.visible = true; S.cookT += dt; if (S.cookT > 8) { S.ramen = 'ready'; sfx('ding'); toast(T('st_t2')); } }
  if (S.ramen === 'ready') pot.visible = true;
  const hot = S.ramen === 'cooking' || S.ramen === 'ready';
  burnerMat.emissiveIntensity = hot ? 2.2 + Math.sin(t * 22) * 0.4 : 0;
  lid.position.y = 0.17 + (S.ramen === 'cooking' && S.cookT > 4 ? Math.abs(Math.sin(t * 28)) * 0.012 : 0);
  potSteam.u.uAmt.value = approach(potSteam.u.uAmt.value, hot ? clamp(S.cookT / 4, 0, 1) : 0, dt * 0.6);
  kitchenSteam.u.uAmt.value = approach(kitchenSteam.u.uAmt.value, hot ? clamp(S.cookT / 8, 0, 1) * 0.8 : 0, dt * 0.2);
  bowl.visible = S.ramen === 'bowl'; bowlSteam.u.uAmt.value = approach(bowlSteam.u.uAmt.value, S.ramen === 'bowl' ? 0.9 : 0, dt * 1.2);
  // shower, mirror fog, flush
  if (S.shower && Math.hypot(P.x - 5.4, P.z + 10.2) > 5 && P.y < 2) { S.shower = false; toast(T('sh_auto')); }
  S.showerLvl = approach(S.showerLvl, S.shower ? 1 : 0, dt * 1.5); S.fog = approach(S.fog, S.shower ? 1 : 0, dt * (S.shower ? 0.2 : 0.025));
  showerDrops.u.uAmt.value = S.showerLvl; showerSteam.u.uAmt.value = S.fog * 0.85 + S.showerLvl * 0.15; mirrorFog.material.opacity = S.fog * 0.88;
  const nearShower = Math.hypot(P.x - 5.2, P.z + 10.0) < 2.2 && P.y < 2;
  $('vig').style.opacity = String(nearShower ? S.fog * 0.55 : 0);
  if (S.flush > 0) S.flush -= dt;
  // fridge, front door, TV
  fridgeDoor.rotation.y = lerp(fridgeDoor.rotation.y, S.fridge ? -1.9 : 0, Math.min(1, dt * 7)); fridgeInside.emissiveIntensity = S.fridge ? 0.22 : 0;
  doorAng = lerp(doorAng, S.door ? 1.75 : 0, Math.min(1, dt * 5)); doorPivot.rotation.y = doorAng; doorCol.off = doorAng > 0.9;
  // door "draft": curtains none; interior doorway wind sway handled by laundry tickers
}

// ───────────────────────── life: a street cat and a delivery scooter ─────────────────────────
const cat = new THREE.Group(); scene.add(cat);
{
  const fur = cm(0xd8883a, 0.9), white = cm(0xf3ead8, 0.9);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.2), fur); b.position.y = 0.26; b.castShadow = true; cat.add(b);
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), fur); h.position.set(0.3, 0.33, 0); cat.add(h);
  for (const z of [-0.05, 0.05]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 4), fur); e.position.set(0.31, 0.43, z); cat.add(e); }
  for (const [x, z] of [[0.18, -0.07], [0.18, 0.07], [-0.18, -0.07], [-0.18, 0.07]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.05), z * x > 0 ? fur : white); l.position.set(x, 0.08, z); cat.add(l); }
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.35, 6), fur); tail.position.set(-0.32, 0.33, 0); tail.rotation.z = 0.9; cat.add(tail); cat.userData.tail = tail;
  const eyeM = new THREE.MeshBasicMaterial({ color: 0x1a1a1a }); for (const z of [-0.04, 0.04]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 4), eyeM); e.position.set(0.39, 0.35, z); cat.add(e); }
}
cat.position.set(3.5, 0.12, 6.9);
const catS = { tx: 3.5, tz: 6.9, wait: 2, sit: false };
const catIt = { pos: new THREE.Vector3(), r: 1.9, label: () => T('cat'), enabled: () => true, act() { sfx('meow'); sfx('purr'); catS.wait = 6; toast(T('cat_t')); } };
INTERACT.push(catIt);
const moped = new THREE.Group(); scene.add(moped);
{
  box(1.5, 0.3, 0.45, cm(0x1d2a44, 0.5), 0, 0.35, 0, { parent: moped, cast: true }); box(0.5, 0.5, 0.4, cm(0x1d2a44, 0.5), 0.55, 0.5, 0, { parent: moped });
  const w1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12), M.dark); w1.rotation.x = Math.PI / 2; w1.position.set(0.65, 0.28, 0); moped.add(w1); const w2 = w1.clone(); w2.position.x = -0.65; moped.add(w2);
  box(0.55, 0.55, 0.55, cm(0xc9372c, 0.6), -0.75, 0.75, 0, { parent: moped, cast: true });
  box(0.35, 0.7, 0.35, cm(0x2c3a50, 0.8), -0.1, 0.65, 0, { parent: moped, cast: true }); sph(0.14, cm(0xe8e8e8, 0.4), -0.1, 1.3, 0, { parent: moped });
  const hlm = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2cc, emissiveIntensity: 2 }); box(0.08, 0.12, 0.2, hlm, 0.82, 0.8, 0, { parent: moped });
}
const MP = { x: -90, dir: 1, wait: 18 }; moped.visible = false;
function updateLife(dt, t) {
  // cat wanders in the alley, sits, and looks at you when you get close
  const dxp = P.x - cat.position.x, dzp = P.z - cat.position.z, near = Math.hypot(dxp, dzp) < 2.6;
  if (catS.wait > 0) { catS.wait -= dt; catS.sit = true; if (near) cat.rotation.y = lerp(cat.rotation.y, Math.atan2(-dzp, dxp), 0.05); }
  else {
    catS.sit = false; const dx = catS.tx - cat.position.x, dz = catS.tz - cat.position.z, d = Math.hypot(dx, dz);
    if (d < 0.2) { catS.wait = 3 + Math.random() * 5; catS.tx = THREE.MathUtils.clamp(cat.position.x + (Math.random() - 0.5) * 10, -12, 12); catS.tz = 6.6 + Math.random() * 3.4; }
    else { cat.position.x += dx / d * dt * 0.9; cat.position.z += dz / d * dt * 0.9; let ry = Math.atan2(-dz, dx), da = ry - cat.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); cat.rotation.y += da * Math.min(1, dt * 5); }
  }
  cat.userData.tail.rotation.x = Math.sin(t * 2.5) * 0.4; cat.scale.y = catS.sit ? 0.82 : 1;
  cat.position.y = cat.position.z < 6.2 ? 0.12 : 0.02; catIt.pos.set(cat.position.x, 0.3, cat.position.z);
  // delivery scooter crossing the alley now and then
  MP.wait -= dt;
  if (MP.wait <= 0) { moped.visible = true; MP.x += MP.dir * 11 * dt; moped.position.set(MP.x, 0.03, MP.dir > 0 ? 9.6 : 7.6); moped.rotation.y = MP.dir > 0 ? 0 : Math.PI; if (Math.abs(MP.x) > 92) { moped.visible = false; MP.dir *= -1; MP.x = MP.dir * -90; MP.wait = 30 + Math.random() * 40; } }
  scooterSound(moped.visible ? Math.hypot(moped.position.x - P.x, moped.position.z - P.z) : 999);
}

// ───────────────────────── audio (all synthesized) ─────────────────────────
let AC = null, master, outBus, inBus, lpOut, noiseBuf, A = {}, muted = false;
function loopNoise(type, f, q, bus, gain = 0) {
  const s = AC.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.loopStart = Math.random() * 2; const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const g = AC.createGain(); g.gain.value = gain; s.connect(fl); fl.connect(g); g.connect(bus); s.start(); return { g, fl };
}
function initAudio() {
  if (AC) return; try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; return; }
  noiseBuf = AC.createBuffer(1, AC.sampleRate * 3, AC.sampleRate); const d = noiseBuf.getChannelData(0); let b0 = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.97 * b0 + 0.03 * w; d[i] = w * 0.6 + b0 * 4; }
  master = AC.createGain(); master.gain.value = 0.8; master.connect(AC.destination);
  lpOut = AC.createBiquadFilter(); lpOut.type = 'lowpass'; lpOut.frequency.value = 16000; outBus = AC.createGain(); outBus.connect(lpOut); lpOut.connect(master);
  inBus = AC.createGain(); inBus.connect(master);
  A.rain = loopNoise('bandpass', 3200, 0.5, outBus); A.wind = loopNoise('lowpass', 420, 0.7, outBus); A.city = loopNoise('lowpass', 160, 0.7, outBus); A.hush = loopNoise('lowpass', 1100, 0.4, outBus);
  A.shower = loopNoise('bandpass', 4200, 0.45, inBus); A.boil = loopNoise('highpass', 2500, 0.5, inBus); A.tv = loopNoise('bandpass', 850, 1.6, inBus); A.hum = loopNoise('lowpass', 140, 2, inBus, 0.012);
  const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 70; const og = AC.createGain(); og.gain.value = 0; const of = AC.createBiquadFilter(); of.type = 'lowpass'; of.frequency.value = 500; o.connect(of); of.connect(og); og.connect(outBus); o.start(); A.moped = { o, g: og };
}
const sfxAt = () => AC.currentTime;
function burst(dur, type, f, q, vol, bus, sweep) {
  const s = AC.createBufferSource(); s.buffer = noiseBuf; s.loopStart = Math.random() * 2; s.loop = true; const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = AC.createGain(); const t0 = sfxAt();
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.04, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  if (sweep) fl.frequency.exponentialRampToValueAtTime(sweep, t0 + dur); s.connect(fl); fl.connect(g); g.connect(bus || master); s.start(t0); s.stop(t0 + dur + 0.05);
}
function tone(f0, f1, dur, vol, type = 'sine', bus) {
  const o = AC.createOscillator(); o.type = type; const g = AC.createGain(); const t0 = sfxAt(); o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(g); g.connect(bus || master); o.start(t0); o.stop(t0 + dur + 0.05);
}
function sfx(name) {
  if (!AC) return;
  try {
    switch (name) {
      case 'click': tone(1500, 900, 0.05, 0.12, 'square'); break;
      case 'door': burst(0.35, 'lowpass', 320, 0.8, 0.5); tone(180, 120, 0.4, 0.06, 'sawtooth'); break;
      case 'ding': tone(1320, 1320, 0.5, 0.15); tone(1760, 1760, 0.35, 0.08); break;
      case 'slosh': burst(0.7, 'bandpass', 700, 1, 0.35, inBus, 300); break;
      case 'slurp': for (let i = 0; i < 3; i++) setTimeout(() => AC && burst(0.35, 'bandpass', 1200, 3, 0.3, inBus, 400), i * 480); break;
      case 'flush': burst(2.2, 'bandpass', 900, 0.8, 0.45, inBus, 250); break;
      case 'water': burst(1.0, 'bandpass', 3500, 0.5, 0.25, inBus); break;
      case 'meow': tone(520, 900, 0.18, 0.16, 'triangle'); setTimeout(() => AC && tone(900, 480, 0.35, 0.13, 'triangle'), 170); break;
      case 'purr': for (let i = 0; i < 14; i++) setTimeout(() => AC && burst(0.05, 'lowpass', 220, 1, 0.12), i * 85); break;
      case 'birds': for (let i = 0; i < 6; i++) setTimeout(() => AC && (tone(3200 + Math.random() * 800, 4200 + Math.random() * 600, 0.1, 0.05, 'sine', outBus), tone(4400, 3000, 0.08, 0.04, 'sine', outBus)), i * 220 + Math.random() * 120); break;
      case 'step': burst(0.07, 'lowpass', P.y > 0.15 && inHouse() ? 700 : 1600, 0.9, inHouse() ? 0.22 : 0.16, inHouse() ? inBus : outBus); break;
      case 'crunch': burst(0.1, 'highpass', 2200, 0.7, 0.18, outBus); break;
    }
  } catch (e) { /* audio is optional */ }
}
function scooterSound(dist) { if (!AC) return; const v = clamp(1 - dist / 70, 0, 1); A.moped.g.gain.setTargetAtTime(v * v * 0.1, AC.currentTime, 0.1); A.moped.o.frequency.setTargetAtTime(62 + v * 28, AC.currentTime, 0.2); }
function inHouse() { return P.x > -5.9 && P.x < 5.9 && P.z > -10.9 && P.z < -2.1 && P.y < 5.9; }
function updateAudio(dt, t) {
  if (!AC) return; const T = AC.currentTime, ih = inHouse();
  const open = S.door ? 0.55 : 0.12, cut = ih ? 650 + open * 3500 : 16000, vol = ih ? 0.5 + open * 0.8 : 1;
  lpOut.frequency.setTargetAtTime(cut, T, 0.12); outBus.gain.setTargetAtTime(vol, T, 0.2);
  A.rain.g.gain.setTargetAtTime(WX.rain * 0.38, T, 0.3); A.wind.g.gain.setTargetAtTime(0.03 + WX.windy * 0.11 * (0.6 + 0.4 * Math.sin(t * 0.4)), T, 0.3);
  A.city.g.gain.setTargetAtTime(0.12 + WORLD.night * 0.03, T, 0.5); A.hush.g.gain.setTargetAtTime(WX.snow * 0.05 + WX.cover * 0.02, T, 0.5);
  const hereShower = Math.hypot(P.x - 5.2, P.z + 10) < 7 && P.y < 2 ? 1 : 0.35; A.shower.g.gain.setTargetAtTime(S.showerLvl * 0.22 * hereShower, T, 0.2);
  A.boil.g.gain.setTargetAtTime(S.ramen === 'cooking' && S.cookT > 3 ? (0.04 + 0.05 * Math.abs(Math.sin(t * 13))) * (ih ? 1 : 0.2) : 0, T, 0.1);
  A.tv.g.gain.setTargetAtTime(0, T, 0.08); tvAudio(T, ih);
  master.gain.setTargetAtTime(muted ? 0 : 0.8, T, 0.05);
}

// ───────────────────────── UI helpers ─────────────────────────
let toastTimer = 0;
function toast(msg) { const el = $('toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('on'), 2800); }

// ───────────────────────── player, input, collision ─────────────────────────
const P = { x: 0, z: 8.2, y: 0.02, vy: 0, yaw: 0, pitch: 0, vx: 0, vz: 0, walk: 0, step: 0, eye: 1.62 };
let started = false;
const keys = new Set(); const joy = { x: 0, y: 0, id: null }; let lookId = null, locked = false, dragging = false;
function blocked(x, z) {
  const r = 0.3;
  for (let i = 0; i < COLS.length; i++) {
    const c = COLS[i]; if (c.off || P.y + 0.4 >= c.y1 || P.y + 1.7 <= c.y0) continue;
    const dx = x - clamp(x, c.x0, c.x1), dz = z - clamp(z, c.z0, c.z1); if (dx * dx + dz * dz < r * r) return true;
  }
  return false;
}
function surfaceY(x, z, cy) {
  let best = 0; const lim = cy + 0.45;
  for (const s of SURF) if (x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1 && s.y <= lim && s.y > best) best = s.y;
  for (const r of RAMPS) { const z0 = Math.min(r.zA, r.zB), z1 = Math.max(r.zA, r.zB); if (x >= r.x0 && x <= r.x1 && z >= z0 && z <= z1) { const y = r.yA + (z - r.zA) / (r.zB - r.zA) * (r.yB - r.yA); if (y <= lim && y > best) best = y; } }
  return best;
}
function look(dx, dy, k = 0.0023) { P.yaw -= dx * k; P.pitch = clamp(P.pitch - dy * k, -1.4, 1.4); }
function stand() { if (!S.seated) return; S.seated = false; P.z = -4.6; P.y = surfaceY(P.x, P.z, 0.2); }
function seatOn(x, z, y, yaw) { S.seated = true; P.x = x; P.z = z; P.y = Y1; P.yaw = yaw; P.vx = P.vz = 0; toast(T('sit_t')); }
function goSleep() {
  if (S.sleeping) return; S.sleeping = true; stand();
  const f = $('fade'); f.textContent = T('sleep_a'); f.style.opacity = '1';
  setTimeout(() => { P.x = 2.0; P.z = -8.3; P.y = Y2; P.yaw = Math.PI / 2; P.pitch = 0; WORLD.hour = 6.7; WORLD.hourTarget = 6.7; S.shower = false; f.textContent = T('sleep_b'); sfx('birds'); }, 1700);
  setTimeout(() => { f.style.opacity = '0'; S.sleeping = false; toast(T('sleep_t')); }, 3600);
}
addEventListener('keydown', (e) => {
  if (e.repeat) { if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); return; }
  keys.add(e.code); if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
  if (!started) return;
  if (e.code === 'KeyE') doInteract();
  if (TOUR.active) { if (e.code === 'ArrowRight') tourNext(); if (e.code === 'ArrowLeft') tourPrev(); if (e.code === 'Escape') tourEnd(false); }
  if (e.code === 'Digit1') setWeather('clear'); if (e.code === 'Digit2') setWeather('rain'); if (e.code === 'Digit3') setWeather('snow'); if (e.code === 'Digit4') toggleNight();
  if (S.seated && ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown'].includes(e.code)) stand();
});
addEventListener('keyup', (e) => keys.delete(e.code)); addEventListener('blur', () => keys.clear());
const cv = renderer.domElement;
cv.addEventListener('click', () => { if (started && !IS_TOUCH && !locked) { try { cv.requestPointerLock && cv.requestPointerLock(); } catch (e) { /* drag-look still works */ } } });
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === cv; });
cv.addEventListener('pointerdown', (e) => { if (!started) return; if (e.pointerType === 'touch') { if (lookId === null) lookId = e.pointerId; } else dragging = true; cv.setPointerCapture && cv.setPointerCapture(e.pointerId); });
addEventListener('pointerup', (e) => { if (e.pointerId === lookId) lookId = null; if (e.pointerType !== 'touch') dragging = false; if (e.pointerId === joy.id) { joy.id = null; joy.x = joy.y = 0; $('joy').firstElementChild.style.transform = ''; } });
addEventListener('pointermove', (e) => {
  if (!started) return;
  if (e.pointerType === 'touch') { if (e.pointerId === lookId) look(e.movementX || 0, e.movementY || 0, 0.004); else if (e.pointerId === joy.id) setJoy(e); }
  else if (locked) look(e.movementX, e.movementY); else if (dragging) look(e.movementX, e.movementY);
});
const joyEl = $('joy');
function setJoy(e) { const r = joyEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = e.clientX - cx, dy = e.clientY - cy; const m = Math.hypot(dx, dy), R = 50; if (m > R) { dx *= R / m; dy *= R / m; } joy.x = dx / R; joy.y = -dy / R; joyEl.firstElementChild.style.transform = `translate(${dx}px,${dy}px)`; }
joyEl.addEventListener('pointerdown', (e) => { joy.id = e.pointerId; joyEl.setPointerCapture(e.pointerId); setJoy(e); e.stopPropagation(); });
$('act').addEventListener('pointerdown', (e) => { e.stopPropagation(); doInteract(); });
document.querySelectorAll('#wx button').forEach((b) => b.addEventListener('click', () => { if (b.dataset.wx) setWeather(b.dataset.wx); else toggleNight(); }));
$('mute').addEventListener('click', () => { muted = !muted; $('mute').setAttribute('aria-pressed', String(muted)); $('mute').textContent = T(muted ? 'snd_off' : 'snd_on'); });
$('go').addEventListener('click', () => { started = true; initAudio(); if (AC && AC.state === 'suspended') AC.resume(); $('intro').style.display = 'none'; toast(T('enter_t')); });
$('loading').remove();

// interaction targeting
let focus = null; const _e = new THREE.Vector3(), _d = new THREE.Vector3(), _f = new THREE.Vector3();
function updateFocus() {
  focus = null; if (!started || S.sleeping || TOUR.active) { $('prompt').classList.remove('on'); $('act').classList.remove('on'); return; }
  if (S.seated) { focus = { label: () => T('stand'), act: stand }; }
  else {
    _e.set(P.x, P.y + P.eye, P.z); camera.getWorldDirection(_f); let best = 1e9;
    for (const it of INTERACT) {
      if (!it.enabled()) continue; const d = _e.distanceTo(it.pos); if (d > it.r || Math.abs(it.pos.y - (P.y + 1.0)) > 2.2) continue;
      _d.copy(it.pos).sub(_e).normalize(); const dot = _d.dot(_f); if (d > 0.9 && dot < 0.45) continue;
      const sc = d * (2.2 - dot); if (sc < best) { best = sc; focus = it; }
    }
  }
  const on = !!focus; $('prompt').classList.toggle('on', on); $('act').classList.toggle('on', on);
  if (on) { const l = focus.label(); $('prompt').lastElementChild.textContent = l; $('act').textContent = l; }
}
function doInteract() { if (focus && started && !S.sleeping) focus.act(); }

// ───────────────────────── frame loop ─────────────────────────
let last = performance.now(), simT = 0;
function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); PU.uScale.value = renderer.domElement.height / (2 * Math.tan(camera.fov * Math.PI / 360)); }
addEventListener('resize', resize); resize();
function frame(now) {
  wdt = Math.max(0, Math.min(0.5, (now - last) / 1000)); const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; simT += dt; WU.uTime.value = simT;
  // movement
  const touring = tourUpdate(dt);
  if (started && !S.sleeping && !S.seated && !touring) {
    let f = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) + joy.y;
    let r = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0) + joy.x;
    if (keys.has('ArrowLeft')) P.yaw += dt * 1.8; if (keys.has('ArrowRight')) P.yaw -= dt * 1.8;
    const m = Math.hypot(f, r); if (m > 1) { f /= m; r /= m; }
    const run = keys.has('ShiftLeft') || keys.has('ShiftRight') || Math.hypot(joy.x, joy.y) > 0.92, sp = run ? 5.4 : 2.9;
    const tx = (-Math.sin(P.yaw) * f + Math.cos(P.yaw) * r) * sp, tz = (-Math.cos(P.yaw) * f - Math.sin(P.yaw) * r) * sp;
    P.vx = lerp(P.vx, tx, Math.min(1, dt * 10)); P.vz = lerp(P.vz, tz, Math.min(1, dt * 10));
    const nx = P.x + P.vx * dt, nz = P.z + P.vz * dt;
    if (!blocked(nx, P.z)) P.x = nx; else P.vx = 0; if (!blocked(P.x, nz)) P.z = nz; else P.vz = 0;
    P.x = clamp(P.x, -68, 68); P.z = clamp(P.z, -9.9 - 40, 18.2);
    const spd = Math.hypot(P.vx, P.vz); P.walk += spd * dt; P.step += spd * dt;
    if (P.step > (run ? 1.5 : 1.05)) { P.step = 0; sfx(WX.cover > 0.5 && !inHouse() ? 'crunch' : 'step'); }
  }
  if (!touring) { const ty = surfaceY(P.x, P.z, P.y);
    if (ty >= P.y) P.y = lerp(P.y, ty, Math.min(1, dt * 16)); else { P.vy -= 20 * dt; P.y = Math.max(ty, P.y + P.vy * dt); if (P.y === ty) P.vy = 0; }
    if (ty >= P.y - 0.001) P.vy = 0; }
  const eyeT = S.seated ? 1.05 : 1.62; P.eye = lerp(P.eye, eyeT, Math.min(1, dt * 6));
  const bob = Math.sin(P.walk * 7.5) * 0.025 * Math.min(1, Math.hypot(P.vx, P.vz));
  camera.position.set(P.x, P.y + P.eye + bob, P.z); camera.rotation.set(P.pitch, P.yaw, 0);
  sky.position.copy(camera.position);
  WU.uWind.value = WX.windy; updateWorld(dt, simT); updateEnv(dt); updateScene(dt, simT); updateLife(dt, simT); updatePeople(dt, simT); TICKERS.forEach((f) => f(dt, simT)); if (started) qualityTick(dt);
  updateFocus(); updateAudio(dt, simT);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
window.__seoul = { S, P, WX, WORLD, setWeather, toggleNight, camera, scene, renderer, goSleep, INTERACT, COLS, blocked, surfaceY, start() { started = true; $('intro').style.display = 'none'; } };
requestAnimationFrame(frame);

