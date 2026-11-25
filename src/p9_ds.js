// ===== Street, shops, music, voice and basket layer (ported onto the readable names used in p1-p8) =====

/* =====================================================================
   SEOUL HOUSE — DETAIL PASS
   Added 2026-11-20. This block lives in the same module scope as the
   scene, so it reuses the original builders and state directly.
   ===================================================================== */

/* ---------- helpers ---------- */
function shBox(g, w, h, d, col, x, y, z, o) {
  return bx(g, w, h, d, col, x, y, z, o || {});
}
function shCyl(g, rt, rb, h, col, x, y, z, o) {
  o = o || {};
  return cyl(rt, rb, h, cm(col, o.r == null ? 0.5 : o.r), x, y, z, Object.assign({ parent: g, seg: o.seg || 16, cast: o.cast !== false }, o));
}
function shSph(g, r, col, x, y, z, o) {
  o = o || {};
  return sph(r, cm(col, o.r == null ? 0.55 : o.r), x, y, z, Object.assign({ parent: g, seg: o.seg || 16 }, o));
}
function shPlane(g, w, h, tex, x, y, z, ry) {
  var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
  m.position.set(x, y, z);
  if (ry) m.rotation.y = ry;
  g.add(m);
  return m;
}








































function shSojuBottle(g, x, y, z, s) {
  s = s || 1;
  var glass = 0x2f7d50;
  shCyl(g, 0.03 * s, 0.034 * s, 0.18 * s, glass, x, y, z, { r: 0.12, seg: 16 });
  shCyl(g, 0.012 * s, 0.022 * s, 0.055 * s, glass, x, y + 0.18 * s, z, { r: 0.12, seg: 12 });
  shCyl(g, 0.013 * s, 0.013 * s, 0.022 * s, 0x1b2430, x, y + 0.235 * s, z, { seg: 12 });
  shCyl(g, 0.031 * s, 0.035 * s, 0.006 * s, 0x9c7b3c, x, y + 0.182 * s, z, { seg: 16 });
  var lab = new THREE.Mesh(new THREE.PlaneGeometry(0.048 * s, 0.062 * s), new THREE.MeshStandardMaterial({ map: signTex("\uD55C\uAC15 25\u00B0", "#0B3D25", "#F6F2E4", 256, 160, 34), roughness: 0.55 }));
  lab.position.set(x, y + 0.085 * s, z + 0.0355 * s);
  g.add(lab);
  return g;
}
function shSojuGlass(g, x, y, z) {
  shCyl(g, 0.026, 0.022, 0.055, 0xdde7ea, x, y, z, { r: 0.05, seg: 14 });
  shCyl(g, 0.023, 0.02, 0.035, 0xb9d2c9, x, y + 0.006, z, { r: 0.05, seg: 14 });
}

















































































































































































































































































































/* =====================================================================
   SEOUL HOUSE — STREET SOCIAL PASS
   Voice for the neighbours, sponsored shelf w/ purchase links, a
   procedural "his music" loop, and the rooftop kimjang corner.
   ===================================================================== */

var SH_T = {
  voice_on: ["Voice guide: on", "\uC74C\uC131 \uC548\uB0B4: \uCF1C\uC9D0", "\u8BED\u97F3\u5BFC\u89C8\uFF1A\u5F00", "\u97F3\u58F0\u30AC\u30A4\u30C9\uFF1A\u30AA\u30F3"],
  voice_off: ["Voice guide: off", "\uC74C\uC131 \uC548\uB0B4: \uAEBC\uC9D0", "\u8BED\u97F3\u5BFC\u89C8\uFF1A\u5173", "\u97F3\u58F0\u30AC\u30A4\u30C9\uFF1A\u30AA\u30D5"],
  music_on: ["Music: on", "\uC74C\uC545: \uCF1C\uC9D0", "\u97F3\u4E50\uFF1A\u5F00", "\u97F3\u697D\uFF1A\u30AA\u30F3"],
  music_off: ["Music: off", "\uC74C\uC545: \uAEBC\uC9D0", "\u97F3\u4E50\uFF1A\u5173", "\u97F3\u697D\uFF1A\u30AA\u30D5"],
  shop_view: ["See the product", "\uC81C\uD488 \uBCF4\uAE30", "\u770B\u770B\u5546\u54C1", "\u5546\u54C1\u3092\u898B\u308B"],
  buy: ["Buy now", "\uAD6C\uB9E4\uD558\uAE30", "\u7ACB\u5373\u8D2D\u4E70", "\u8CFC\u5165\u3059\u308B"],
  close: ["Close", "\uB2EB\uAE30", "\u5173\u95ED", "\u9589\u3058\u308B"],
  note: [
    "Opens a shopping search in a new tab. Replace the link with your affiliate URL.",
    "\uC0C8 \uD0ED\uC73C\uB85C \uC1FC\uD551 \uAC80\uC0C9\uC774 \uC5F4\uB9BD\uB2C8\uB2E4. \uC81C\uD734 \uB9C1\uD06C\uB85C \uAD50\uCCB4\uD558\uC138\uC694.",
    "\u5728\u65B0\u6807\u7B7E\u9875\u6253\u5F00\u8D2D\u7269\u641C\u7D22\uFF0C\u8BF7\u66FF\u6362\u4E3A\u4F60\u7684\u63A8\u5E7F\u94FE\u63A5\u3002",
    "\u65B0\u3057\u3044\u30BF\u30D6\u3067\u8D2D\u5165\u691C\u7D22\u3092\u958B\u304D\u307E\u3059\u3002\u30A2\u30D5\u30A3\u30EA\u30A8\u30A4\u30C8\u30EA\u30F3\u30AF\u306B\u5DEE\u3057\u66FF\u3048\u3066\u304F\u3060\u3055\u3044\u3002",
  ],
  music_toast: [
    "Now playing: \uAC70\uB9AC\uC5D0\uC11C (street version)",
    "\uC9C0\uAE08 \uC7AC\uC0DD: \uAC70\uB9AC\uC5D0\uC11C (\uAC70\uB9AC \uBC84\uC804)",
    "\u6B63\u5728\u64AD\u653E\uFF1A\u300A\u5728\u8857\u4E0A\u300B\uFF08\u8857\u5934\u7248\uFF09",
    "\u518D\u751F\u4E2D\uFF1A\u300C\u8857\u3067\u300D\uFF08\u8857\u30D0\u30FC\u30B8\u30E7\u30F3\uFF09",
  ],
  kimjang: ["Kimjang day", "\uAE40\uC7A5 \uB0A0", "\u814C\u6CE1\u83DC\u65E5", "\u30AD\u30E0\u30B8\u30E3\u30F3\u306E\u65E5"],
  kimjang_t: [
    "Napa cabbage, coarse salt, gochugaru. The whole roof smells like winter.",
    "\uBC30\uCD94, \uCC9C\uC77C\uC5FC, \uACE0\uCD94\uAC00\uB8E8. \uC625\uC0C1 \uC804\uCCB4\uAC00 \uACA8\uC6B8 \uB0C4\uC0C8\uAC00 \uB0A9\uB2C8\uB2E4.",
    "\u5927\u767D\u83DC\u3001\u7C97\u76D0\u3001\u8FA3\u6912\u7C89\u3002\u6574\u4E2A\u5C4B\u9876\u90FD\u662F\u51AC\u5929\u7684\u5473\u9053\u3002",
    "\u767D\u83DC\u3001\u7C97\u76D0\u3001\u30B3\u30C1\u30E5\u30AB\u30EB\u3002\u5C4B\u4E0A\u306F\u51AC\u306E\u5302\u3044\u3067\u3044\u3063\u3071\u3044\u3067\u3059\u3002",
  ],
  talk: ["Say hello", "\uC778\uC0AC\uD558\uAE30", "\u6253\u62DB\u547C", "\u3042\u3044\u3055\u3064\u3059\u308B"],
};
function shTr(k) {
  var a = SH_T[k];
  if (!a) return k;
  var i = ["en", "ko", "zh", "ja"].indexOf(LANG);
  return a[i < 0 ? 0 : i] || a[0];
}
function shNum(a, b, c) {
  return new THREE.Vector3(a, b, c);
}

/* ---------------- menu entries ---------------- */
var shVoiceOn = true,
  shPersist = function (k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) {}
  };
try {
  shVoiceOn = localStorage.getItem("seoul-voice") !== "0";
} catch (e) {}
var shMenu = $("menu"),
  shVoiceBtn = document.createElement("button"),
  shMusicBtn = document.createElement("button");
shVoiceBtn.type = "button";
shVoiceBtn.className = "row";
shVoiceBtn.id = "shvoice";
shMusicBtn.type = "button";
shMusicBtn.className = "row";
shMusicBtn.id = "shmusic";
var shMuteEl = $("mute");
if (shMuteEl && shMuteEl.nextSibling) {
  shMenu.insertBefore(shMusicBtn, shMuteEl.nextSibling);
  shMenu.insertBefore(shVoiceBtn, shMusicBtn);
} else {
  shMenu.appendChild(shVoiceBtn);
  shMenu.appendChild(shMusicBtn);
}
shVoiceBtn.innerHTML = "<b></b>";
shMusicBtn.innerHTML = "<b></b>";
function shMenuLabels() {
  shVoiceBtn.firstChild.textContent = shTr(shVoiceOn ? "voice_on" : "voice_off");
  shMusicBtn.firstChild.textContent = shTr(shMusic.on ? "music_on" : "music_off");
  shVoiceBtn.setAttribute("aria-pressed", String(shVoiceOn));
  shMusicBtn.setAttribute("aria-pressed", String(shMusic.on));
}
langHooks.push(shMenuLabels);
shVoiceBtn.addEventListener("click", function () {
  shVoiceOn = !shVoiceOn;
  shPersist("seoul-voice", shVoiceOn ? "1" : "0");
  if (!shVoiceOn && "speechSynthesis" in window) {
    try {
      speechSynthesis.cancel();
    } catch (e) {}
  }
  shMenuLabels();
  sfx("click");
  toast(shTr(shVoiceOn ? "voice_on" : "voice_off"));
});
shMusicBtn.addEventListener("click", function () {
  shMusicToggle();
});

/* ---------------- text-to-speech ---------------- */
var shVoices = [];
function shLoadVoices() {
  if (!("speechSynthesis" in window)) return;
  try {
    shVoices = speechSynthesis.getVoices() || [];
  } catch (e) {
    shVoices = [];
  }
}
if ("speechSynthesis" in window) {
  shLoadVoices();
  window.speechSynthesis.addEventListener("voiceschanged", shLoadVoices);
}
function shKoVoice() {
  var ko = shVoices.filter(function (v) {
    return /^ko/i.test(v.lang) || /korean/i.test(v.name);
  });
  return (
    ko.filter(function (v) {
      return /yuna|sora|google|premium|neural|enhanced/i.test(v.name);
    })[0] ||
    ko[0] ||
    null
  );
}
var shSpeechBusy = false;
function ttsSay(t) {
  if (!shVoiceOn || !("speechSynthesis" in window)) return;
  var line = typeof t === "string" ? t : t.ko || t.en || "";
  if (!line) return;
  try {
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(line);
    u.lang = "ko-KR";
    u.rate = 0.94;
    u.pitch = 1.02;
    u.volume = 1;
    var v = shKoVoice();
    if (v) u.voice = v;
    u.onstart = function () {
      shSpeechBusy = true;
      shDuck(true);
    };
    u.onend = function () {
      shSpeechBusy = false;
      shDuck(false);
    };
    u.onerror = function () {
      shSpeechBusy = false;
      shDuck(false);
    };
    speechSynthesis.speak(u);
  } catch (e) {}
}
/* richer street small talk */
if (typeof TALK !== "undefined") {
  TALK.push(
    { ko: "\uC774 \uACF5\uAE30 \uC88B\uC9C0 \uC54A\uC544\uC694?", en: "Nice air today, isn't it?", zh: "今天空气不错吧？", ja: "今日は空気がいいですね。" },
    { ko: "\uC800 \uC9D1 \uC0C8\uB85C \uC774\uC0AC\uC640\uC124\uC5B4\uC694?", en: "Did someone new move into that house?", zh: "那家搬来新邻居了吗？", ja: "あの家、新しい人が引っ越してきたの？" },
    { ko: "\uAE40\uC7A5 \uD558\uB7EC \uC625\uC0C1\uC5D0 \uC62C\uB77C\uAC00\uC694.", en: "I am heading up to the roof for kimjang.", zh: "我上楼顶做泡菜。", ja: "屋上でキムジャンをしてきます。" },
    {
      ko: "\uC800 \uCEE4\uD53C \uC9D1 \uC544\uC138\uC694? \uC6D0\uB450 \uB9DB\uC788\uB354\uB77C\uAD6C\uC694.",
      en: "Have you tried that cafe? The coffee is good.",
      zh: "那家咖啡店去过吗？咖啡很好喝。",
      ja: "あのカフェ、行きました？コーヒーがおいしいですよ。",
    },
    { ko: "\uBD88\uBE5B \uCF1C\uC838\uC11C \uC88B\uB124\uC694.", en: "The lights are on. It looks cozy.", zh: "灯亮了，看起来好温暖。", ja: "明かりがついて、あたたかそうですね。" },
    { ko: "\uB0B4\uC77C\uB3C4 \uB9D1\uC744 \uAC83 \uAC19\uC544\uC694.", en: "Looks clear again tomorrow.", zh: "明天好像也是晴天。", ja: "明日も晴れそうですね。" },
  );
}

/* ---------------- sponsored shelf ---------------- */
var SH_PRODUCTS = {
  soju: {
    q: "\uD55C\uAC15 \uC18C\uC8FC",
    price: "\u20A91,800",
    name: { ko: "\uD55C\uAC15 25\u00B0", en: "Hangang 25\u00B0 soju", zh: "汉江25°烧酒", ja: "ハンガン25°焼酎" },
    desc: {
      ko: "\uB0C9\uC7A5\uACE0 \uC548\uC758 \uADF8 \uBCD1. \uC625\uC0C1\uC5D0\uC11C \uD55C \uC794.",
      en: "The green bottle in the fridge. One glass on the roof.",
      zh: "冰箱里那瓶绿的。上楼顶喝一杯。",
      ja: "冷蔵庫の緑の一本。屋上で一杯。",
    },
    svg: '<svg viewBox="0 0 64 64"><rect x="27" y="4" width="10" height="8" rx="2" fill="#1b2430"/><rect x="24" y="12" width="16" height="7" fill="#2f7d50"/><path d="M25 19h14v33a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z" fill="#2f7d50"/><rect x="25" y="32" width="14" height="14" fill="#f6f2e4"/><text x="32" y="42" font-size="7" text-anchor="middle" fill="#0b3d25" font-family="sans-serif">\uD55C\uAC15</text></svg>',
  },
  ramen: {
    q: "\uB77C\uBA74 \uB610\uB294 \uB77C\uBA74",
    price: "\u20A91,200",
    name: { ko: "\uC5BC\uD070 \uB77C\uBA74", en: "Spicy ramyeon", zh: "辣味拉面", ja: "ピリ辛ラーメン" },
    desc: {
      ko: "\uAC00\uC2A4\uB808\uC778\uC9C0 \uC704\uC758 \uADF8 \uBD09\uC9C0. 8\uCD08\uBA74 \uB05D.",
      en: "The red packet by the stove. Eight seconds to boil.",
      zh: "灶台边那包红的。八秒就开。",
      ja: "コンロのそばの赤い袋。8秒で完成。",
    },
    svg: '<svg viewBox="0 0 64 64"><rect x="14" y="10" width="36" height="46" rx="3" fill="#c0392b"/><rect x="14" y="10" width="36" height="10" fill="#8f2418"/><circle cx="32" cy="34" r="12" fill="#f5d76e"/><circle cx="32" cy="34" r="8" fill="#e07b39"/><path d="M22 50h20" stroke="#f6e6c8" stroke-width="3"/></svg>',
  },
  bibimbap: {
    q: "\uBE44\uBE94\uBC25 \uBC00\uD0A4\uD2B8",
    price: "\u20A96,900",
    name: { ko: "\uC0C8\uBCA5 \uBE44\uBE94\uBC25", en: "Bibimbap kit", zh: "拌饭料理包", ja: "ビビンバキット" },
    desc: {
      ko: "\uBC25\uC5D0 \uB098\uBB3C \uC11E\uC5B4\uC11C \uBE44\uBC84\uB9AC\uAE30. \uB0C9\uC7A5\uACE0 \uC55E\uCE78.",
      en: "Rice, vegetables, gochujang. Stir it all together.",
      zh: "米饭、蔬菜、辣酱，拌一拌。",
      ja: "ご飯とナムルとコチュジャンを混ぜるだけ。",
    },
    svg: '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="34" rx="22" ry="15" fill="#efe9dc"/><ellipse cx="32" cy="32" rx="19" ry="12" fill="#f7f2e6"/><circle cx="26" cy="29" r="4" fill="#e07b39"/><circle cx="35" cy="27" r="3.6" fill="#5a7a34"/><circle cx="38" cy="34" r="3.4" fill="#b5483b"/><circle cx="28" cy="36" r="3.2" fill="#e0a33c"/><path d="M12 34h6M46 34h6" stroke="#c9c2b4" stroke-width="2"/></svg>',
  },
};
function shShopUrl(p) {
  return "https://search.shopping.naver.com/search/all?query=" + encodeURIComponent(p.q);
}

var shShopEl = document.createElement("div");
shShopEl.id = "shopcard";
shShopEl.setAttribute("role", "dialog");
shShopEl.setAttribute("aria-label", "Product");
shShopEl.innerHTML =
  '<div class="sh-top"><span class="sh-kicker">SEOUL PICK</span><button type="button" id="shclose" aria-label="close">\u00D7</button></div>' +
  '<div class="sh-main"><div class="sh-thumb" id="shthumb"></div><div class="sh-info"><b id="shname"></b><div id="shprice"></div><p id="shdesc"></p></div></div>' +
  '<a id="shbuy" target="_blank" rel="noopener noreferrer"></a><div id="shnote"></div>';
document.body.appendChild(shShopEl);
var shStyle = document.createElement("style");
shStyle.textContent = [
  "#shopcard{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translate(-50%,20px);width:min(420px,92vw);z-index:70;padding:14px 16px 12px;border-radius:18px;border:1px solid rgba(242,238,228,.18);background:rgba(16,19,23,.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#f2eee4;box-shadow:0 18px 50px rgba(0,0,0,.45);opacity:0;pointer-events:none;transition:opacity .22s ease,transform .22s ease;font-family:var(--font-body)}",
  "#shopcard.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}",
  "#shopcard .sh-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}",
  "#shopcard .sh-kicker{font-size:.68rem;letter-spacing:.18em;color:#e9a64d;font-weight:700}",
  "#shopcard #shclose{appearance:none;border:0;background:transparent;color:rgba(242,238,228,.6);font-size:1.5rem;line-height:1;cursor:pointer;padding:2px 6px}",
  "#shopcard .sh-main{display:flex;gap:14px;align-items:center}",
  "#shopcard .sh-thumb{width:64px;height:64px;flex:0 0 64px;border-radius:14px;background:rgba(255,255,255,.06);display:grid;place-items:center;padding:8px}",
  "#shopcard .sh-thumb svg{width:100%;height:100%}",
  "#shopcard .sh-info{flex:1;min-width:0}",
  "#shopcard .sh-info b{display:block;font-size:1.02rem;font-weight:700}",
  "#shopcard #shprice{color:#e9a64d;font-weight:700;font-size:.92rem;margin-top:2px}",
  "#shopcard #shdesc{margin:6px 0 0;font-size:.82rem;line-height:1.5;color:rgba(242,238,228,.72)}",
  "#shopcard #shbuy{display:block;margin-top:12px;text-align:center;text-decoration:none;padding:11px 12px;border-radius:12px;background:#e9a64d;color:#17130c;font-weight:800;letter-spacing:.02em}",
  "#shopcard #shnote{margin-top:8px;font-size:.68rem;line-height:1.4;color:rgba(242,238,228,.45)}",
  "#shvoice[aria-pressed=true] b,#shmusic[aria-pressed=true] b{color:#e9a64d}",
].join("\n");
document.head.appendChild(shStyle);
var shShopOpen = false;
function shOpenShop(key, from) {
  var p = SH_PRODUCTS[key];
  if (!p) return;
  var i = ["en", "ko", "zh", "ja"].indexOf(LANG);
  if (i < 0) i = 0;
  $("shthumb").innerHTML = p.svg;
  $("shname").textContent = p.name[["en", "ko", "zh", "ja"][i]] || p.name.ko;
  $("shprice").textContent = p.price;
  $("shdesc").textContent = p.desc[["en", "ko", "zh", "ja"][i]] || p.desc.ko;
  var b = $("shbuy");
  b.textContent = shTr("buy") + "  \u2192";
  b.href = shShopUrl(p);
  $("shnote").textContent = shTr("note");
  shShopEl.classList.add("on");
  shShopOpen = true;
  sfx("ding");
}
function shCloseShop() {
  shShopEl.classList.remove("on");
  shShopOpen = false;
}
$("shclose").addEventListener("click", function (e) {
  e.stopPropagation();
  shCloseShop();
});
shShopEl.addEventListener("pointerdown", function (e) {
  e.stopPropagation();
});
shShopEl.addEventListener("click", function (e) {
  e.stopPropagation();
});
addEventListener("keydown", function (e) {
  if (e.key === "Escape" && shShopOpen) shCloseShop();
});
langHooks.push(function () {
  if (shShopOpen) shCloseShop();
});

/* build the three sponsored items inside the fridge (top shelf) */
(function shShelf() {
  var g = grp(-5.4, Y1, KZ + 0.05);
  var y = 1.252,
    z = 0; /* local to fridge group */
  /* soju */
  shSojuBottle(g, -0.22, y, z, 1.06);
  shBox(g, 0.055, 0.012, 0.055, 0xd8cfc0, -0.22, y, z, { r: 0.8, cast: false });
  /* ramen packet */
  shBox(g, 0.15, 0.19, 0.07, 0xd9d3c7, -0.02, y, z, { r: 0.8 });
  var rl = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.16), new THREE.MeshStandardMaterial({ map: signTex("\uC5BC\uD070 \uB77C\uBA74", "#c0392b", "#f7e7c8", 320, 380, 58), roughness: 0.6 }));
  rl.position.set(-0.02, y + 0.095, z + 0.037);
  g.add(rl);
  shBox(g, 0.13, 0.016, 0.05, 0xe9e3d2, -0.02, y + 0.19, z, { r: 0.8 });
  /* bibimbap kit */
  shCyl(g, 0.085, 0.07, 0.055, 0xefeadd, 0.19, y, z, { r: 0.5, seg: 20 });
  shCyl(g, 0.075, 0.075, 0.012, 0xf6f1e4, 0.19, y + 0.03, z, { seg: 20, cast: false });
  [
    [-0.03, 0.012, 0xe07b39],
    [0.02, 0.018, 0x5a7a34],
    [0.035, -0.02, 0xb5483b],
    [-0.02, -0.025, 0xe0a33c],
  ].forEach(function (v) {
    shBox(g, 0.03, 0.012, 0.03, v[2], 0.19 + v[0], y + 0.045, z + v[1], { r: 0.8, cast: false });
  });
  shBox(g, 0.17, 0.012, 0.13, 0xd8d2c4, 0.19, y + 0.058, z + 0.12, { r: 0.8 }).rotation.x = -0.35;
  /* labels + hotspots */
  [
    ["soju", -0.22],
    ["ramen", -0.02],
    ["bibimbap", 0.19],
  ].forEach(function (p) {
    addInteract({
      pos: new THREE.Vector3(-5.4 + p[1], 1.42, -10.14),
      r: 0.62,
      enabled: function () {
        return S.fridge;
      },
      label: function () {
        return shTr("shop_view");
      },
      act: function () {
        shOpenShop(p[0]);
      },
    });
  });
  /* small LED promo strip under the shelf */
  var led = new THREE.MeshStandardMaterial({ color: 0xfff1cf, emissive: 0xffe6b0, emissiveIntensity: 0.35 });
  var l = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.018), led);
  l.position.set(-5.4, 1.247, -10.2);
  scene.add(l);
})();







































































































/* ---------------- lighting repairs ---------------- */
(function shLightFix() {
  scene.updateMatrixWorld(true);
  /* stair treads were emitting a hot amber (1.17) -> the whole house glowed */
  var stairMat = null,
    steps = [],
    lamps = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.material || !o.material.emissive) return;
    var m = o.material;
    if (m.color && m.color.getHex() === 0xffffff && m.emissive.getHex() === 0xffb36c) {
      if (!stairMat) {
        stairMat = m.clone();
        stairMat.color.setHex(0xe7e0d2);
        stairMat.emissive.setHex(0x2a1a10);
        stairMat.emissiveIntensity = 0.02;
        stairMat.roughness = 0.82;
      }
      o.material = stairMat;
      lamps.push(o);
      var g = o.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
      if (bb.max.y - bb.min.y > 0.22 && bb.max.x - bb.min.x > 1.4 && bb.max.z - bb.min.z < 0.7) steps.push(bb);
    }
  });
  /* wooden tread caps + a thin warm nosing instead of a glowing block */
  steps.forEach(function (bb) {
    var w = bb.max.x - bb.min.x,
      d = bb.max.z - bb.min.z;
    shBox(scene, w - 0.02, 0.03, d + 0.005, 0x6e4e33, (bb.min.x + bb.max.x) / 2, bb.max.y - 0.012, (bb.min.z + bb.max.z) / 2, { r: 0.85 });
    var strip = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.14, 0.012), new THREE.MeshStandardMaterial({ color: 0xffe7bd, emissive: 0xffc98a, emissiveIntensity: 0.16, roughness: 0.5, transparent: true, opacity: 0.85 }));
    strip.position.set((bb.min.x + bb.max.x) / 2, bb.max.y + 0.004, bb.min.z + 0.012);
    scene.add(strip);
  });
  /* fridge lamp: soften, cool, and add a small point light that respects the door */
  var fridgeGlow = new THREE.PointLight(0xdcebff, 0, 1.1, 2);
  fridgeGlow.position.set(-5.4, 1.72, -10.35);
  scene.add(fridgeGlow);
  TICKERS.push(function (n) {
    var target = S.fridge ? 1.15 : 0;
    fridgeGlow.intensity = lerp(fridgeGlow.intensity, target, Math.min(1, n * 6));
  });
})();

/* ---------------- procedural street music ---------------- */
var shMusic = { on: false, gain: null, timer: null, beat: 0, next: 0 };
var SH_CHORDS = [
  [60, 64, 67, 71],
  [57, 60, 64, 67],
  [53, 57, 60, 64],
  [55, 59, 62, 65],
];
function shAudioReady() {
  if (!AC) {
    try {
      initAudio();
    } catch (e) {}
  }
  if (AC && AC.state === "suspended") {
    try {
      AC.resume();
    } catch (e) {}
  }
  if (AC && !tv.bus) {
    try {
      tvEnsureBus();
    } catch (e) {}
  }
  return !!AC;
}
function shPad(freq, t, dur, gain) {
  var o = AC.createOscillator(),
    o2 = AC.createOscillator(),
    g = AC.createGain(),
    f = AC.createBiquadFilter();
  o.type = "triangle";
  o2.type = "sine";
  o.frequency.value = freq;
  o2.frequency.value = freq * 1.004;
  o.detune.value = -4;
  o2.detune.value = 5;
  f.type = "lowpass";
  f.frequency.value = 900;
  f.Q.value = 0.4;
  g.gain.setValueAtTime(1e-4, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.25);
  g.gain.linearRampToValueAtTime(1e-4, t + dur);
  o.connect(f);
  o2.connect(f);
  f.connect(g);
  g.connect(shMusic.gain);
  o.start(t);
  o2.start(t);
  o.stop(t + dur + 0.1);
  o2.stop(t + dur + 0.1);
}
function shBass(freq, t, dur) {
  var o = AC.createOscillator(),
    g = AC.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.setValueAtTime(1e-4, t);
  g.gain.linearRampToValueAtTime(0.1, t + 0.04);
  g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
  o.connect(g);
  g.connect(shMusic.gain);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function shBrush(t, amp) {
  var o = AC.createBufferSource();
  o.buffer = gr;
  var f = AC.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 5200;
  f.Q.value = 0.8;
  var g = AC.createGain();
  g.gain.setValueAtTime(1e-4, t);
  g.gain.linearRampToValueAtTime(amp, t + 0.012);
  g.gain.exponentialRampToValueAtTime(1e-4, t + 0.16);
  o.connect(f);
  f.connect(g);
  g.connect(shMusic.gain);
  o.start(t);
  o.stop(t + 0.2);
}
function shBell(freq, t, dur, amp) {
  var o = AC.createOscillator(),
    o2 = AC.createOscillator(),
    g = AC.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  o2.type = "triangle";
  o2.frequency.value = freq * 2.01;
  g.gain.setValueAtTime(1e-4, t);
  g.gain.linearRampToValueAtTime(amp, t + 0.012);
  g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
  o.connect(g);
  o2.connect(g);
  g.connect(shMusic.gain);
  o.start(t);
  o2.start(t);
  o.stop(t + dur + 0.05);
  o2.stop(t + dur + 0.05);
}
function shMusicTick() {
  if (!shMusic.on || !AC || !shMusic.gain) return;
  var spb = 60 / 74,
    now = AC.currentTime;
  while (shMusic.next < now + 0.7) {
    var b = shMusic.beat % 32,
      t = shMusic.next;
    if (b % 8 === 0) {
      var chord = SH_CHORDS[Math.floor(b / 8) % 4];
      chord.forEach(function (nt, ix) {
        shPad(mhz(nt), t, spb * 3.6, 0.028 - ix * 0.003);
      });
      shBass(mhz(chord[0] - 24), t, spb * 2.4);
    }
    if (b % 8 === 5) shPad(mhz(SH_CHORDS[Math.floor(b / 8) % 4][2] + 12), t, spb * 1.4, 0.014);
    if (b % 2 === 1) shBrush(t, b % 4 === 1 ? 0.014 : 0.008);
    if (b === 2 || b === 10 || b === 18 || b === 26) shBell(mhz([72, 74, 76, 79, 81][(shMusic.beat >> 3) % 5]), t, spb * 1.8, 0.05);
    if (b === 14) shBell(mhz(79), t, spb * 2.2, 0.035);
    shMusic.next += spb / 2;
    shMusic.beat++;
  }
}
function shMusicStart() {
  if (!shAudioReady()) return false;
  if (shMusic.gain) return true;
  shMusic.gain = AC.createGain();
  shMusic.gain.gain.value = 0;
  shMusic.gain.connect(master);
  shMusic.gain.gain.setTargetAtTime(0.42, AC.currentTime, 0.9);
  shMusic.next = AC.currentTime + 0.08;
  shMusic.beat = 0;
  shMusic.timer = setInterval(shMusicTick, 120);
  shMusic.on = true;
  return true;
}
function shMusicStop() {
  shMusic.on = false;
  if (shMusic.timer) {
    clearInterval(shMusic.timer);
    shMusic.timer = null;
  }
  if (shMusic.gain && AC) {
    var g = shMusic.gain;
    shMusic.gain = null;
    g.gain.setTargetAtTime(0, AC.currentTime, 0.4);
    setTimeout(function () {
      try {
        g.disconnect();
      } catch (e) {}
    }, 1600);
  }
}
function shMusicToggle() {
  if (shMusic.on) {
    shMusicStop();
    toast(shTr("music_off"));
  } else if (shMusicStart()) {
    toast(shTr("music_toast"));
  }
  shMenuLabels();
  sfx("click");
}
function shDuck(down) {
  if (!shMusic.gain || !AC) return;
  shMusic.gain.gain.setTargetAtTime(down ? 0.08 : 0.42, AC.currentTime, 0.25);
}

/* ---------------- small fixes elsewhere ---------------- */
(function shClock() {
  /* the flat '12' disc floated; give it a real housing + rim */
  shCyl(scene, 0.185, 0.185, 0.03, 0x2e2b27, 0.3, 1.985, IZ0 + 0.006, { r: 0.6, seg: 24, cast: false });
  var ring = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.012, 6, 28), cm(0x8a7f6c, 0.45));
  ring.position.set(0.3, 2.0, IZ0 + 0.023);
  scene.add(ring);
})();













/* ---------------- startup ---------------- */
Object.assign(window.__seoul || {}, {
  SHOP: shOpenShop,
  MUSIC: function () {
    shMusicToggle();
  },
  SPEAK: ttsSay,
  VOICE: function (v) {
    shVoiceOn = v;
    shMenuLabels();
  },
});
shMenuLabels();
shMusic.on = false;
/* music starts only from the menu (autoplay policies) */
















































/* ---------------- kimjang prep table ---------------- */
function shNapaCabbage(x, y, z, s, ry) {
  /* a whole napa cabbage: tight layered leaves, pale stem, green tips */
  var g = grp(x, y, z, ry || 0);
  var cols = [0xf3efdf, 0xe9eacd, 0xd3ddb2, 0xb6cb97, 0x94b274];
  for (var i = 0; i < 5; i++) {
    var r = (0.13 - i * 0.019) * s;
    var b = sph(r, cm(cols[i], 0.85), 0, 0, 0, { parent: g, seg: 14 });
    b.position.y = (0.015 + i * 0.022) * s;
    b.scale.set(0.72, 0.55, 1.28);
  }
  /* outer leaf tips peeling out at the top */
  for (var k = 0; k < 3; k++) {
    var t = sph(0.075 * s, cm(0x7e9e58, 0.85), 0, 0, 0, { parent: g, seg: 12 });
    t.position.set((k - 1) * 0.055 * s, 0.03 * s, -0.1 * s);
    t.scale.set(0.55, 0.18, 1.05);
    t.rotation.x = -0.5 + k * 0.18;
  }
  /* pale cut root */
  shCyl(g, 0.038 * s, 0.045 * s, 0.05 * s, 0xefe8d4, 0, 0, 0.12 * s, { r: 0.8, seg: 10, cast: false });
  return g;
}




















































/* ---------------- rooftop water tank detail ---------------- */
(function shTank() {
  var x = 4.8,
    z = -10.0;
  /* metal bands + hatch + ladder + pipe */
  [6.5, 7.0, 7.5].forEach(function (y) {
    var b = new THREE.Mesh(new THREE.TorusGeometry(0.79, 0.025, 6, 28), cm(0x9aa3a8, 0.35));
    b.position.set(x, y, z);
    b.rotation.x = Math.PI / 2;
    scene.add(b);
  });
  shCyl(scene, 0.19, 0.19, 0.05, 0x9aa3a8, x, 7.58, z, { r: 0.35, m: 0.6, seg: 18, cast: false });
  shCyl(scene, 0.21, 0.21, 0.02, 0x7e878c, x, 7.63, z, { r: 0.4, m: 0.6, seg: 18, cast: false });
  /* ladder on the south face */
  [-0.18, 0.18].forEach(function (dx) {
    shBox(scene, 0.035, 1.55, 0.035, 0x8b9298, x + dx, 6.1, z + 0.8, { r: 0.35, m: 0.6 });
  });
  for (var i = 0; i < 6; i++) shBox(scene, 0.36, 0.025, 0.03, 0x8b9298, x, 6.28 + i * 0.24, z + 0.8, { r: 0.4, m: 0.6, cast: false });
  /* down pipe */
  shCyl(scene, 0.045, 0.045, 2.0, 0x8b9298, x + 0.55, 6.1, z + 0.35, { r: 0.4, m: 0.4, seg: 10 });
  shCyl(scene, 0.06, 0.06, 0.06, 0x8b9298, x + 0.55, 6.1, z + 0.35, { r: 0.4, m: 0.4, seg: 10 });
  /* label */
  var lab = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.18), new THREE.MeshStandardMaterial({ map: signTex("\uBB3C\uD0F1\uD06C 500L", "#1f3b52", "#e8eef2", 320, 120, 30), roughness: 0.7 }));
  lab.position.set(x, 7.15, z + 0.8);
  scene.add(lab);
})();

/* ---------------- fan poster + now-playing pill ---------------- */
(function shFanBits() {
  /* framed fan poster on the 2F west wall */
  var g = grp(-5.82, Y2 + 1.02, -6.4, Math.PI / 2);
  shBox(g, 0.62, 0.86, 0.04, 0x2a2119, 0, 0, 0, { r: 0.6, cast: false });
  var art = ctex(512, 720, function (c, w, h) {
    var sky = c.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#1b2b4a");
    sky.addColorStop(0.55, "#7c4a70");
    sky.addColorStop(1, "#e5a06a");
    c.fillStyle = sky;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(255,255,255,.9)";
    for (var i = 0; i < 40; i++) {
      c.globalAlpha = 0.4 + Math.random() * 0.5;
      c.fillRect(Math.random() * w, Math.random() * h * 0.6, 2, 2);
    }
    c.globalAlpha = 1;
    /* silhouette on a street */
    c.fillStyle = "#141018";
    c.beginPath();
    c.ellipse(w * 0.5, h * 0.34, 34, 40, 0, 0, 6.28);
    c.fill();
    c.fillRect(w * 0.5 - 52, h * 0.38, 104, 200);
    c.fillRect(w * 0.5 - 70, h * 0.38, 20, 150);
    c.fillRect(w * 0.5 + 50, h * 0.38, 20, 150);
    c.fillStyle = "#0c0a0e";
    c.fillRect(0, h * 0.77, w, h * 0.23);
    c.fillStyle = "#e9a64d";
    c.font = '700 62px "Gowun Batang","Noto Serif KR",serif';
    c.textAlign = "center";
    c.fillText("\uAC70\uB9AC\uC5D0\uC11C", w / 2, h * 0.92);
    c.fillStyle = "rgba(255,255,255,.75)";
    c.font = '400 22px "Noto Sans KR",sans-serif';
    c.fillText("SEOUL, 2026", w / 2, h * 0.97);
  });
  var p = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.78), new THREE.MeshBasicMaterial({ map: art }));
  p.position.set(0, 0, 0.022);
  g.add(p);
  /* now playing pill */
  var np = document.createElement("div");
  np.id = "nowplay";
  np.innerHTML = '<span class="eq"><i></i><i></i><i></i></span><span class="np-t">\uAC70\uB9AC\uC5D0\uC11C</span><span class="np-s">\u00B7 street version</span>';
  document.body.appendChild(np);
  var st = document.createElement("style");
  st.textContent = [
    "#nowplay{position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));display:flex;align-items:center;gap:8px;z-index:55;padding:8px 12px;border-radius:999px;border:1px solid rgba(242,238,228,.18);background:rgba(13,16,20,.72);backdrop-filter:blur(10px);color:#f2eee4;font-size:.78rem;opacity:0;transform:translateY(8px);transition:opacity .35s,transform .35s;pointer-events:none}",
    "#nowplay.on{opacity:1;transform:none}",
    "#nowplay .np-t{font-weight:700;color:#e9a64d}",
    "#nowplay .np-s{color:rgba(242,238,228,.55);font-size:.72rem}",
    "#nowplay .eq{display:flex;gap:2px;align-items:flex-end;height:13px}",
    "#nowplay .eq i{width:3px;background:#e9a64d;border-radius:1px;height:5px;animation:eq .9s ease-in-out infinite}",
    "#nowplay .eq i:nth-child(2){animation-delay:.15s;height:10px}",
    "#nowplay .eq i:nth-child(3){animation-delay:.3s;height:7px}",
    "@keyframes eq{0%,100%{height:4px}50%{height:12px}}",
    "body.touring #nowplay{opacity:0}",
  ].join("\n");
  document.head.appendChild(st);
  var npEl = np;
  TICKERS.push(function () {
    var on = shMusic.on && !document.hidden;
    npEl.classList.toggle("on", !!on);
    npEl.style.display = on ? "flex" : "none";
    npEl.querySelector(".np-t").textContent = (function () {
      var a = ["\uAC70\uB9AC\uC5D0\uC11C", "On the street", "\u5728\u8857\u4e0a", "\u8857\u3067"];
      var i = ["en", "ko", "zh", "ja"].indexOf(LANG);
      return a[i < 0 ? 0 : i];
    })();
  });
})();

/* ---------------- porch light: mount it on the wall ---------------- */
(function shPorchLamp() {
  scene.updateMatrixWorld(true);
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry || o.geometry.type !== "SphereGeometry" || !o.material || !o.material.color) return;
    if (o.material.color.getHex() !== 0xfff4d8) return;
    var p = o.getWorldPosition(new THREE.Vector3());
    if (Math.abs(p.x - 0.95) < 0.2 && Math.abs(p.y - 2.4) < 0.2 && Math.abs(p.z + 1.74) < 0.2) {
      o.position.z = -2.03;
    }
  });
  /* bracket + shade */
  shBox(scene, 0.03, 0.03, 0.22, M.dark, 0.95, 2.37, -1.92, { r: 0.4 });
  shCyl(scene, 0.03, 0.05, 0.09, 0x2b2b2b, 0.95, 2.46, -2.0, { r: 0.5, seg: 12, cast: false });
})();

/* =====================================================================
   SEOUL STREET — 7-ELEVEN, stalls, faces, jump, small details
   ===================================================================== */
var SHOPX0 = 8.2,
  SHOPX1 = 21.0,
  SHOPZ0 = 12.66,
  SHOPZ1 = 18.15,
  SHOPY = 0.12,
  SHOPH = 3.02;
var SHOPDOOR0 = 12.25,
  SHOPDOOR1 = 14.15;

/* hide the old window + sign planes exactly on this shop */
(function shHideOldShopfront() {
  scene.updateMatrixWorld(true);
  var hide = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    if (bb.max.x > SHOPX0 - 1 && bb.min.x < SHOPX1 + 1 && bb.max.z > 12.4 && bb.min.z < 12.85 && bb.max.y > 0 && bb.min.y < 3.6 && bb.max.z - bb.min.z < 3.2) {
      hide.push(o);
    }
  });
  hide.forEach(function (o) {
    o.visible = false;
  });
  /* the building mass filling this shop: hide the giant block, keep an upper facade */
  var big = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry || o.geometry.type !== "BoxGeometry") return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    var h = bb.max.y - bb.min.y;
    if (h > 6 && bb.max.x > SHOPX0 && bb.min.x < SHOPX1 && bb.min.z < 18.3 && bb.max.z > 18.0) big.push(o);
  });
  big.forEach(function (o) {
    o.visible = false;
  });
  /* new upper facade above the store (stucco + windows) */
  shBox(scene, SHOPX1 - SHOPX0, 9.2, 0.22, 0xcfc8ba, (SHOPX0 + SHOPX1) / 2, 3.15, SHOPZ0 - 0.12, { r: 0.95, cast: false });
  for (var row = 0; row < 4; row++)
    for (var col = 0; col < 6; col++) {
      var wx = SHOPX0 + 1.1 + col * 2.2,
        wy = 4.35 + row * 1.95;
      shBox(scene, 1.15, 1.35, 0.06, 0xe9e5da, wx, wy, SHOPZ0 - 0.25, { r: 0.85, cast: false });
      shBox(scene, 1.0, 1.2, 0.02, 0x1d2b3d, wx, wy + 0.07, SHOPZ0 - 0.29, { r: 0.4, cast: false });
      shBox(scene, 0.02, 1.2, 0.02, 0xe9e5da, wx, wy + 0.07, SHOPZ0 - 0.3, { r: 0.6, cast: false });
    }
  shBox(scene, SHOPX1 - SHOPX0, 0.3, 1.2, 0xbeb7a8, (SHOPX0 + SHOPX1) / 2, 12.35, SHOPZ0 - 0.4, { r: 0.9, cast: false });
})();

/* ---------------- store shell + stock ---------------- */
(function shStore7() {
  var cx = (SHOPX0 + SHOPX1) / 2,
    cz = (SHOPZ0 + SHOPZ1) / 2;
  /* room */
  box(SHOPX1 - SHOPX0, 0.02, SHOPZ1 - SHOPZ0, cm(0xbfc2bc, 0.92), cx, SHOPY, cz, { cast: false });
  box(SHOPX1 - SHOPX0, 0.06, SHOPZ1 - SHOPZ0, cm(0xc8c2b4, 0.95), cx, SHOPH, cz, { cast: false });
  shBox(scene, 0.12, SHOPH, SHOPZ1 - SHOPZ0, 0xcfc8b8, SHOPX0, SHOPY, cz, { r: 0.92 });
  shBox(scene, 0.12, SHOPH, SHOPZ1 - SHOPZ0, 0xcfc8b8, SHOPX1, SHOPY, cz, { r: 0.92 });
  shBox(scene, SHOPX1 - SHOPX0, SHOPH, 0.12, 0xc7c0b1, cx, SHOPY, SHOPZ1, { r: 0.92 });
  shBox(scene, SHOPX1 - SHOPX0, 0.16, 0.05, 0x8e959b, cx, SHOPY, SHOPZ0 - 0.01, { r: 0.5 });
  /* storefront frame + glass */
  [SHOPX0, SHOPDOOR0, SHOPDOOR1, SHOPX1].forEach(function (x) {
    shBox(scene, 0.08, 2.62, 0.12, 0x7f868c, x, SHOPY, SHOPZ0, { r: 0.4, m: 0.3 });
  });
  shBox(scene, SHOPX1 - SHOPX0, 0.12, 0.14, 0x7f868c, cx, SHOPH - 0.18, SHOPZ0, { r: 0.4, m: 0.3 });
  shBox(scene, SHOPDOOR0 - SHOPX0, 2.5, 0.03, M.glassStd, (SHOPX0 + SHOPDOOR0) / 2, SHOPY + 0.05, SHOPZ0, { cast: false });
  shBox(scene, SHOPX1 - SHOPDOOR1, 2.5, 0.03, M.glassStd, (SHOPDOOR1 + SHOPX1) / 2, SHOPY + 0.05, SHOPZ0, { cast: false });
  /* open sliding doors */
  [[SHOPDOOR0 + 0.45], [SHOPDOOR1 - 0.45]].forEach(function (d) {
    shBox(scene, 0.9, 2.25, 0.035, M.glassStd, d[0], SHOPY + 0.07, SHOPZ0 + 0.05, { cast: false });
    shBox(scene, 0.04, 2.29, 0.055, 0x7f868c, d[0] - 0.45, SHOPY + 0.05, SHOPZ0 + 0.05, { r: 0.4, m: 0.3 });
    shBox(scene, 0.04, 2.29, 0.055, 0x7f868c, d[0] + 0.45, SHOPY + 0.05, SHOPZ0 + 0.05, { r: 0.4, m: 0.3 });
    shBox(scene, 0.94, 0.04, 0.055, 0x7f868c, d[0], SHOPY + 2.29, SHOPZ0 + 0.05, { r: 0.4, m: 0.3 });
  });
  box(1.5, 0.012, 0.7, cm(0x3e474e, 0.9), 13.2, SHOPY + 0.006, 13.05, { cast: false });
  /* 7-ELEVEN sign */
  var sign = ctex(1400, 260, function (g, w, h) {
    g.fillStyle = "#f7f4ea";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#e4572e";
    g.fillRect(0, 0, w, 44);
    g.fillStyle = "#f68b1f";
    g.fillRect(0, h - 40, w, 40);
    g.fillStyle = "#00754a";
    g.fillRect(0, 44, w, 22);
    g.fillStyle = "#0b3d2c";
    g.font = '900 150px "Arial Black","Helvetica Neue",sans-serif';
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("7-ELEVEN", w / 2, h * 0.53);
  });
  var sgn = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 1.6), new THREE.MeshStandardMaterial({ map: sign, emissiveMap: sign, emissive: 0xffffff, emissiveIntensity: 0.45, roughness: 0.6 }));
  sgn.position.set(13.2, 3.5, SHOPZ0 - 0.04);
  scene.add(sgn);
  /* interior lights */
  var LED = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff8ee, emissiveIntensity: 0.42, roughness: 0.5 });
  [10.4, 13.2, 16.0, 18.8].forEach(function (x) {
    var panel = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.45), LED);
    panel.rotation.x = Math.PI / 2;
    panel.position.set(x, SHOPH - 0.05, 15.2);
    scene.add(panel);
    var pl = new THREE.PointLight(0xfff7ee, 1.8, 7.4, 2);
    pl.position.set(x, 2.55, 15.0);
    scene.add(pl);
  });
  /* back wall: four drink fridges */
  [9.65, 12.45, 15.25, 18.05].forEach(function (fx, fi) {
    var z = 17.85;
    /* fridge shell: back + sides + top + bottom, open at the front */
    shBox(scene, 2.62, 2.35, 0.08, 0xe4e0d6, fx, SHOPY, z + 0.33, { r: 0.5 });
    shBox(scene, 0.08, 2.35, 0.72, 0xe4e0d6, fx - 1.28, SHOPY, z, { r: 0.5 });
    shBox(scene, 0.08, 2.35, 0.72, 0xe4e0d6, fx + 1.28, SHOPY, z, { r: 0.5 });
    shBox(scene, 2.62, 0.08, 0.72, 0xe4e0d6, fx, SHOPY + 2.28, z, { r: 0.5 });
    shBox(scene, 2.62, 0.08, 0.72, 0xe4e0d6, fx, SHOPY, z, { r: 0.5 });
    shBox(scene, 2.42, 2.02, 0.02, new THREE.MeshStandardMaterial({ color: 0xdceef7, transparent: true, opacity: 0.18, roughness: 0.05, depthWrite: false }), fx, SHOPY + 0.15, z - 0.33, { cast: false });
    for (var s2 = 0; s2 < 4; s2++) {
      var sy = SHOPY + 0.35 + s2 * 0.5;
      shBox(scene, 2.4, 0.025, 0.52, 0xd6dde1, fx, sy, z - 0.06, { r: 0.5, cast: false });
      for (var k = 0; k < 8; k++) {
        var px = fx - 1.0 + k * 0.285,
          py = sy + 0.026;
        var kind = (fi + s2 + k) % 4;
        if (kind === 0) shCyl(scene, 0.042, 0.048, 0.16, [0x3b7dd8, 0xd94a3b, 0xf0b429, 0x4aa564][k % 4], px, py, z - 0.1, { seg: 10, r: 0.4, cast: false });
        else if (kind === 1) shBox(scene, 0.085, 0.15, 0.075, [0x8a5a2b, 0xe8e4d8, 0x2b6ca3][k % 3], px, py, z - 0.1, { r: 0.55, cast: false });
        else if (kind === 2) shBox(scene, 0.068, 0.13, 0.07, [0xd94a3b, 0xf0b429, 0x7a4aa5][k % 3], px, py, z - 0.1, { r: 0.55, cast: false });
        else shCyl(scene, 0.036, 0.04, 0.13, 0xe8e4d8, px, py, z - 0.1, { seg: 10, r: 0.3, cast: false });
      }
    }
    var fl = new THREE.PointLight(0xf0f9ff, 0.8, 1.6, 2);
    fl.position.set(fx, 2.1, z - 0.4);
    scene.add(fl);
  });
  /* left wall: ramen shelves */
  for (var rl = 0; rl < 4; rl++) {
    var ry = SHOPY + 0.35 + rl * 0.5;
    shBox(scene, 0.5, 0.03, 3.6, 0xd9d3c5, SHOPX0 + 0.32, ry, 15.2, { r: 0.5, cast: false });
    for (var ri = 0; ri < 12; ri++) {
      var rz = 13.5 + ri * 0.29;
      shBox(scene, 0.24, 0.18, 0.22, [0xd6422a, 0xf0b429, 0x1b4fa3, 0x3c3f42][ri % 4], SHOPX0 + 0.34, ry + 0.03, rz, { r: 0.6, cast: false });
      var lb = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.12), new THREE.MeshStandardMaterial({ map: signTex(ri % 2 ? "\uC2E0\uB77C\uBA74" : "\uC9C4\uB77C\uBA74", "#c0392b", "#f7e7c8", 220, 140, 34), roughness: 0.7 }));
      lb.rotation.y = Math.PI / 2;
      lb.position.set(SHOPX0 + 0.47, ry + 0.13, rz);
      scene.add(lb);
    }
  }
  /* right wall: snacks */
  for (var sl = 0; sl < 4; sl++) {
    var sy2 = SHOPY + 0.4 + sl * 0.48;
    shBox(scene, 0.5, 0.03, 3.2, 0xd9d3c5, SHOPX1 - 0.32, sy2, 15.4, { r: 0.5, cast: false });
    for (var si = 0; si < 10; si++) {
      var szz = 14.0 + si * 0.29;
      shBox(scene, 0.22, 0.17, 0.2, [0x8a5a2b, 0xe4572e, 0xf0b429, 0x4aa564, 0x6a4a9c][si % 5], SHOPX1 - 0.34, sy2 + 0.03, szz, { r: 0.6, cast: false });
    }
  }
  /* centre display table (drinks / promo) */
  shBox(scene, 2.0, 0.06, 1.0, 0xd8d2c2, cx, SHOPY + 0.9, 15.7, { r: 0.7 });
  [
    [-0.85, -0.4],
    [0.85, -0.4],
    [-0.85, 0.4],
    [0.85, 0.4],
  ].forEach(function (l) {
    shBox(scene, 0.05, 0.9, 0.05, 0x9a9384, cx + l[0], SHOPY, 15.7 + l[1], { r: 0.6 });
  });
  for (var d2 = 0; d2 < 10; d2++) {
    var dx = cx - 0.8 + (d2 % 5) * 0.4,
      dz = 15.7 + (d2 < 5 ? -0.22 : 0.22);
    shCyl(scene, 0.05, 0.055, 0.18, [0x3b7dd8, 0xd94a3b, 0xf0b429, 0x4aa564, 0xe8e4d8][d2 % 5], dx, SHOPY + 0.96, dz, { seg: 10, r: 0.4, cast: false });
    shCyl(scene, 0.052, 0.052, 0.02, 0xffffff, dx, SHOPY + 1.14, dz, { seg: 10, r: 0.4, cast: false });
  }
  addCol(cx - 1.1, cx + 1.1, 15.1, 16.3, SHOPY, SHOPY + 1.1);
  /* ice-cream chest freezer near the door */
  shBox(scene, 2.0, 0.82, 0.9, 0xf2f0ea, 10.2, SHOPY, 13.65, { r: 0.6 });
  shBox(scene, 1.9, 0.03, 0.8, new THREE.MeshStandardMaterial({ color: 0xdff0f5, transparent: true, opacity: 0.35, roughness: 0.1 }), 10.2, SHOPY + 0.82, 13.65, { cast: false });
  shBox(scene, 1.9, 0.62, 0.78, 0xe9eef1, 10.2, SHOPY + 0.1, 13.65, { r: 0.5, cast: false });
  for (var ic = 0; ic < 8; ic++) shBox(scene, 0.14, 0.1, 0.14, [0xf6d7a7, 0xd7e8f6, 0xe7c6e0][ic % 3], 9.5 + ic * 0.2, SHOPY + 0.65, 13.65, { r: 0.6, cast: false });
  addCol(9.2, 11.2, 13.2, 14.1, SHOPY, SHOPY + 1.1);
  /* hot food warmer + kimbap */
  shBox(scene, 2.0, 1.0, 0.8, 0xe9e5da, 16.6, SHOPY, 13.55, { r: 0.6 });
  shBox(scene, 1.9, 0.62, 0.62, 0xf7f5ee, 16.6, SHOPY + 0.25, 13.55, { r: 0.5 });
  shBox(scene, 1.84, 0.04, 0.56, new THREE.MeshStandardMaterial({ color: 0xfff4d8, emissive: 0xffd79a, emissiveIntensity: 0.32 }), 16.6, SHOPY + 0.88, 13.55, { cast: false });
  for (var kb = 0; kb < 5; kb++) shBox(scene, 0.24, 0.06, 0.26, 0xd8a24a, 15.85 + kb * 0.31, SHOPY + 0.72, 13.55, { r: 0.7, cast: false });
  addCol(15.6, 17.6, 13.15, 13.95, SHOPY, SHOPY + 1.2);
  /* coffee + hot water corner */
  shBox(scene, 1.8, 1.35, 0.75, 0x30353a, 18.7, SHOPY, 13.55, { r: 0.4, m: 0.2 });
  shBox(scene, 0.55, 0.3, 0.4, 0xe8e6e0, 18.45, SHOPY + 1.35, 13.55, { r: 0.5 });
  shBox(scene, 0.13, 0.24, 0.13, 0xe4572e, 18.75, SHOPY + 0.7, 13.36, { r: 0.7, cast: false });
  shBox(scene, 0.1, 0.45, 0.1, 0xe8e6e0, 18.95, SHOPY + 0.7, 13.4, { r: 0.5 });
  for (var cp = 0; cp < 3; cp++) shCyl(scene, 0.035, 0.03, 0.09, [0xffffff, 0xe4572e, 0x2b6ca3][cp], 18.35 + cp * 0.2, SHOPY + 1.66, 13.55, { seg: 10, r: 0.4, cast: false });
  addCol(17.7, 19.7, 13.15, 13.95, SHOPY, SHOPY + 1.5);
  /* hanging aisle signs */
  [
    ["Ramen \u00B7 Snacks", "#c0392b", "#fff", 10.2],
    ["Drinks \u00B7 Coffee", "#1b4fa3", "#fff", 16.4],
  ].forEach(function (a) {
    var t = ctex(700, 150, function (g, w, h) {
      g.fillStyle = a[1];
      g.fillRect(0, 0, w, h);
      g.fillStyle = a[2];
      g.font = '700 62px "Noto Sans KR",sans-serif';
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(a[0], w / 2, h / 2);
    });
    var m = new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 0.18, roughness: 0.7 });
    var b = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.47), m);
    b.position.set(a[3], 2.55, 15.3);
    scene.add(b);
    shBox(scene, 0.02, 0.35, 0.02, 0x6e7478, a[3] - 1.05, 2.2, 15.3, { r: 0.5, cast: false });
    shBox(scene, 0.02, 0.35, 0.02, 0x6e7478, a[3] + 1.05, 2.2, 15.3, { r: 0.5, cast: false });
  });
  /* baskets */
  shBox(scene, 0.62, 0.42, 0.46, 0x2b6ca3, 14.95, SHOPY, 13.3, { r: 0.7 });
  shBox(scene, 0.57, 0.34, 0.41, 0x3b7dd8, 14.95, SHOPY + 0.02, 13.3, { r: 0.7 });
  addCol(14.6, 15.3, 13.0, 13.6, SHOPY, SHOPY + 0.6);
  /* counter */
  shBox(scene, 2.6, 0.98, 0.8, 0xefebe2, 19.0, SHOPY, 16.5, { r: 0.6 });
  shBox(scene, 2.65, 0.06, 0.84, 0x3b4045, 19.0, SHOPY + 0.98, 16.5, { r: 0.4 });
  shBox(scene, 0.36, 0.28, 0.24, 0x2e3338, 19.75, SHOPY + 1.04, 16.4, { r: 0.3 });
  var pos = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.17), new THREE.MeshBasicMaterial({ map: signTex("POS  \uACB0\uC81C", "#123b2a", "#b7f0d0", 320, 200, 52) }));
  pos.position.set(19.75, SHOPY + 1.2, 16.31);
  scene.add(pos);
  addCol(17.6, 20.4, 16.05, 16.95, SHOPY, SHOPY + 1.1);
  /* entrance welcome mat */
  box(1.4, 0.012, 0.55, cm(0x3e474e, 0.9), 13.2, SHOPY + 0.007, 13.05, { cast: false });
})();

/* ---------------- shopping state + basket UI ---------------- */
var SH_ITEMS = {
  ramen: { ko: "\uC2E0\uB77C\uBA74 \uBA40\uD2F0\uD329", en: "Shin ramyeon 5-pack", zh: "辛拉面五连包", ja: "辛ラーメン5袋", price: 4200 },
  drink: { ko: "\uC0C8\uB85C\uC6B4 \uC74C\uB8CC", en: "Chilled drink", zh: "冰饮", ja: "冷たい飲み物", price: 1800 },
  snack: { ko: "\uACFC\uC790 \uD55C \uBD09", en: "Snack", zh: "零食", ja: "お菓子", price: 2200 },
  kimbap: { ko: "\uC0BC\uAC01\uAE40\uBC25", en: "Triangle kimbap", zh: "三角饭团", ja: "三角キンパ", price: 3500 },
  ice: { ko: "\uC544\uC774\uC2A4\uD06C\uB9BC", en: "Ice cream", zh: "冰淇淋", ja: "アイス", price: 1500 },
  coffee: { ko: "\uB530\uB73B\uD55C \uCEE4\uD53C", en: "Hot coffee", zh: "热咖啡", ja: "ホットコーヒー", price: 1200 },
  cooked: { ko: "\uB04F\uC740 \uB77C\uBA74", en: "Cooked ramyeon", zh: "煮好的拉面", ja: "調理済みラーメン", price: 0 },
};
var SHOP = { basket: false, items: [], cooked: false };
function shShopTr(k) {
  var p = SH_ITEMS[k];
  if (!p) return k;
  var i = ["en", "ko", "zh", "ja"].indexOf(LANG);
  return p[["en", "ko", "zh", "ja"][i < 0 ? 0 : i]] || p.ko;
}
var shBasket = document.createElement("div");
shBasket.id = "basket";
shBasket.innerHTML =
  '<div class="bk-top"><span class="bk-ico">\uD83E\uDDFA</span><b id="bktitle">\uC7A5\uBC14\uAD6C\uB2C8</b><span id="bktotal"></span></div><ul id="bklist"></ul><div id="bkhint"></div>';
document.body.appendChild(shBasket);
var shBkStyle = document.createElement("style");
shBkStyle.textContent = [
  "#basket{position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));width:min(280px,82vw);z-index:58;padding:12px 14px;border-radius:16px;border:1px solid rgba(242,238,228,.2);background:rgba(13,16,20,.86);backdrop-filter:blur(10px);color:#f2eee4;font-size:.8rem;transform:translateY(16px);opacity:0;pointer-events:none;transition:.3s}",
  "#basket.on{opacity:1;transform:none;pointer-events:auto}",
  "#basket .bk-top{display:flex;align-items:center;gap:8px;margin-bottom:8px}",
  "#basket .bk-ico{font-size:1.1rem}",
  "#basket #bktitle{font-weight:800;letter-spacing:.02em}",
  "#basket #bktotal{margin-left:auto;color:#e9a64d;font-weight:800}",
  "#basket ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;max-height:150px;overflow:auto}",
  "#basket li{display:flex;justify-content:space-between;gap:8px;color:rgba(242,238,228,.8)}",
  "#basket li b{color:#f2eee4;font-weight:600}",
  "#basket #bkhint{margin-top:8px;font-size:.7rem;color:rgba(242,238,228,.5)}",
].join("\n");
document.head.appendChild(shBkStyle);
function shBasketRender() {
  var n = SHOP.items.length,
    total = SHOP.items.reduce(function (a, k) {
      return a + SH_ITEMS[k].price;
    }, 0);
  shBasket.classList.toggle("on", SHOP.basket && n > 0);
  var counts = {};
  SHOP.items.forEach(function (k) {
    counts[k] = (counts[k] || 0) + 1;
  });
  $("bklist").innerHTML = Object.keys(counts)
    .map(function (k) {
      return "<li><b>" + shShopTr(k) + (counts[k] > 1 ? " \u00D7" + counts[k] : "") + "</b><span>\u20A9" + (SH_ITEMS[k].price * counts[k]).toLocaleString() + "</span></li>";
    })
    .join("");
  $("bktotal").textContent = "\u20A9" + total.toLocaleString();
  $("bkhint").textContent = shTr("pay_hint");
  $("bktitle").textContent = shTr("basket");
}
/* street strings */
SH_T.basket = ["Basket", "\uC7A5\uBC14\uAD6C\uB2C8", "\u8D2D\u7269\u7BEE", "\u30AB\u30B4"];
SH_T.pay_hint = ["Go to the counter (E) to pay", "\uCE74\uC6B4\uD130\uC5D0\uC11C E\uB85C \uACB0\uC81C", "\u53BB\u6536\u94F6\u53F0\u6309 E \u7ED3\u8D26", "\u30EC\u30B8\u3067E\u3067\u4F1A\u8A08"];
SH_T.need_basket = [
  "Take a basket first \u2014 by the door",
  "\uBA3C\uC800 \uBB38 \uC606 \uC7A5\uBC14\uAD6C\uB2C8\uB97C \uB4DC\uC138\uC694",
  "\u5148\u62FF\u95E8\u53E3\u7684\u8D2D\u7269\u7BEE",
  "\u307E\u305A\u30C9\u30A2\u6A2A\u306E\u30AB\u30B4\u3092\u53D6\u3063\u3066",
];
SH_T.added = ["Added to the basket", "\uC7A5\uBC14\uAD6C\uB2C8\uC5D0 \uB2F4\uC558\uC5B4\uC694", "\u5DF2\u653E\u5165\u8D2D\u7269\u7BEE", "\u30AB\u30B4\u306B\u5165\u308C\u305F"];
SH_T.cook = [
  "Boiling water... done. Ramyeon is ready.",
  "\uB730\uC740 \uBB3C\uC5D0 \uB123\uC558\uC5B4\uC694. \uB77C\uBA74 \uC644\uC131!",
  "\u5F00\u6C34\u6CE1\u597D\u4E86\uFF0C\u62C9\u9762\u5B8C\u6210\uFF01",
  "\u71B1\u6E6F\u3067\u4F5C\u308A\u307E\u3057\u305F\u3002\u5B8C\u6210\uFF01",
];
SH_T.need_ramen = [
  "No ramyeon in the basket",
  "\uC7A5\uBC14\uAD6C\uB2C8\uC5D0 \uB77C\uBA74\uC774 \uC5C6\uC5B4\uC694",
  "\u7BEE\u5B50\u91CC\u8FD8\u6CA1\u6709\u62C9\u9762",
  "\u30AB\u30B4\u306B\u30E9\u30FC\u30E1\u30F3\u304C\u306A\u3044",
];
SH_T.empty = ["The basket is empty", "\uC7A5\uBC14\uAD6C\uB2C8\uAC00 \uBE44\uC5C8\uC5B4\uC694", "\u8D2D\u7269\u7BEE\u662F\u7A7A\u7684", "\u30AB\u30B4\u306F\u7A7A\u3067\u3059"];
SH_T.paid = [
  "Paid \u20A9%s. Thank you!",
  "\u20A9%s \uACB0\uC81C \uC644\uB8CC. \uAC10\uC0AC\uD569\uB2C8\uB2E4!",
  "\u5DF2\u652F\u4ED8 \u20A9%s\uFF0C\u8C22\u8C22\uFF01",
  "\u20A9%s \u304A\u652F\u6255\u3044\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\uFF01",
];
SH_T.clerk_hi = [
  "Welcome to 7-Eleven!",
  "\uc5b4\uc11c \uc624\uc138\uc694, 7\u2011ELEVEN\uc785\ub2c8\ub2e4!",
  "\u6B22\u8FCE\u5149\u4E34 7-ELEVEN\uFF01",
  "\u3054\u6765\u5E97\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\uFF01",
];
function shToast(k, a) {
  var s = shTr(k);
  if (a != null) s = s.replace("%s", a);
  toast(s);
}
function shTakeBasket(force) {
  if (SHOP.basket && !force) return true;
  SHOP.basket = true;
  shBasketRender();
  sfx("ding");
  if (!force) toast(shTr("basket"));
  return true;
}
function shAddItem(k) {
  if (!SHOP.basket) {
    shTakeBasket(true);
  }
  SHOP.items.push(k);
  shBasketRender();
  sfx("click");
  shToast("added");
}
function shCookRamen() {
  var i = SHOP.items.indexOf("ramen");
  if (i < 0) {
    shToast("need_ramen");
    return;
  }
  SHOP.items.splice(i, 1);
  SHOP.items.push("cooked");
  SHOP.cooked = true;
  shBasketRender();
  sfx("slosh");
  shToast("cook");
  setTimeout(function () {
    sfx("ding");
  }, 800);
}
function shPay() {
  if (!SHOP.items.length) {
    shToast("empty");
    return;
  }
  var total = SHOP.items.reduce(function (a, k) {
    return a + SH_ITEMS[k].price;
  }, 0);
  shToast("paid", total.toLocaleString());
  ttsSay("\uAC10\uC0AC\uD569\uB2C8\uB2E4. \uC548\uB155\uD788 \uAC00\uC138\uC694.");
  sfx("ding");
  SHOP.items = [];
  SHOP.cooked = false;
  shBasketRender();
  SHOP.basket = false;
  setTimeout(function () {
    shBasket.classList.remove("on");
  }, 1200);
}
/* hotspots in the store */
addInteract({
  pos: new THREE.Vector3(14.95, 1.05, 13.3),
  r: 1.2,
  label: function () {
    return shTr("basket");
  },
  act: function () {
    shTakeBasket();
  },
});
addInteract({
  pos: new THREE.Vector3(8.85, 1.25, 15.2),
  r: 1.7,
  label: function () {
    return shShopTr("ramen");
  },
  act: function () {
    shAddItem("ramen");
  },
});
addInteract({
  pos: new THREE.Vector3(13.9, 1.35, 17.1),
  r: 1.8,
  label: function () {
    return shShopTr("drink");
  },
  act: function () {
    shAddItem("drink");
  },
});
addInteract({
  pos: new THREE.Vector3(20.4, 1.3, 15.2),
  r: 1.7,
  label: function () {
    return shShopTr("snack");
  },
  act: function () {
    shAddItem("snack");
  },
});
addInteract({
  pos: new THREE.Vector3(16.6, 1.15, 13.95),
  r: 1.5,
  label: function () {
    return shShopTr("kimbap");
  },
  act: function () {
    shAddItem("kimbap");
  },
});
addInteract({
  pos: new THREE.Vector3(10.2, 1.1, 13.95),
  r: 1.4,
  label: function () {
    return shShopTr("ice");
  },
  act: function () {
    shAddItem("ice");
  },
});
addInteract({
  pos: new THREE.Vector3(18.6, 1.4, 13.95),
  r: 1.4,
  label: function () {
    return shShopTr("coffee");
  },
  act: function () {
    shAddItem("coffee");
  },
});
addInteract({
  pos: new THREE.Vector3(18.9, 1.35, 14.3),
  r: 1.2,
  label: function () {
    return shTr("cook");
  },
  act: function () {
    shCookRamen();
  },
});
addInteract({
  pos: new THREE.Vector3(19.0, 1.2, 16.1),
  r: 1.5,
  label: function () {
    return shTr("pay");
  },
  act: function () {
    shPay();
  },
});
addInteract({
  pos: new THREE.Vector3(19.6, 1.35, 16.9),
  r: 1.7,
  label: function () {
    return shTr("talk");
  },
  act: function () {
    var l = [SH_T.clerk_hi[1], "\uC624\uB298 \uB77C\uBA74 \uD560\uC778\uC774\uC5D0\uC694.", "\uB0B4\uC77C \uB3C4\uC2DC\uB77D\uB3C4 \uC7AC\uACE0 \uB4E4\uC5B4\uC654\uC694."];
    var t = l[Math.floor(Math.random() * l.length)];
    toast(t);
    ttsSay(t);
    sfx("click");
  },
});

/* clerk + shoppers */
addPerson({ at: [19.6, 16.9], yaw: Math.PI, jacket: 0x1b4fa3, pants: 0x1f2530, skin: 0xe8c39e, hair: 0x1b1b1b, h: 1.78 });
addPerson({ at: [11.4, 16.6], yaw: 0.05, jacket: 0x8a5a2b, pants: 0x2b2b2b, h: 1.68, bag: 0x6a4a2c });
addPerson({ at: [20.1, 14.9], yaw: -Math.PI / 2, jacket: 0xd9b44a, pants: 0x333333, h: 1.63, pack: 0x3b4a63 });

/* ---------------- NPC faces / OOTD ---------------- */
function shFacePass() {
  scene.updateMatrixWorld(true);
  PEOPLE.forEach(function (p, idx) {
    var g = p.g;
    if (!g || g.userData.shFace) return;
    g.userData.shFace = 1;
    var head = null;
    for (var i = 0; i < g.children.length; i++) {
      var c = g.children[i];
      if (c.isMesh && c.geometry && c.geometry.type === "SphereGeometry") {
        head = c;
        break;
      }
    }
    if (!head) return;
    head.scale.set(0.9, 0.96, 0.92);
    if (head.material && head.material.color) head.material.color.setHex(0xe9c6a6);
    var hy = 1.6;
    /* eyes: dark almond, same as hero */
    [-0.045, 0.045].forEach(function (ex) {
      sph(0.022, cm(0xf8f4ea, 0.5), ex, hy + 0.02, 0.095, { parent: g, seg: 10 });
      sph(0.012, cm(0x241a14, 0.4), ex, hy + 0.02, 0.106, { parent: g, seg: 8 });
      sph(0.006, cm(0xffffff, 0.25), ex - 0.004, hy + 0.026, 0.108, { parent: g, seg: 6 });
      var lid = shBox(g, 0.052, 0.006, 0.006, 0x3a2a20, ex, hy + 0.045, 0.1, { r: 0.5, cast: false });
      lid.rotation.z = ex < 0 ? 0.08 : -0.08;
    });
    /* thin brows */
    [-0.048, 0.048].forEach(function (bx) {
      var b = shBox(g, 0.042, 0.007, 0.007, 0x3a2a20, bx, hy + 0.073, 0.1, { r: 0.6, cast: false });
      b.rotation.z = bx < 0 ? 0.1 : -0.1;
    });
    /* nose, mouth, ears, jaw */
    shBox(g, 0.018, 0.045, 0.02, 0xdcae8a, 0, hy - 0.005, 0.105, { r: 0.7, cast: false });
    shBox(g, 0.042, 0.007, 0.006, 0xb07a70, 0, hy - 0.065, 0.102, { r: 0.6, cast: false });
    [-0.112, 0.112].forEach(function (ex) {
      sph(0.022, cm(0xe9c6a6, 0.7), ex, hy, 0, { parent: g, seg: 8 });
    });
    sph(0.09, cm(0xe9c6a6, 0.7), 0, hy - 0.085, 0.03, { parent: g, seg: 12 }).scale.set(1, 0.5, 0.8);
    /* side-part fringe + sideburn */
    shBox(g, 0.16, 0.035, 0.05, 0x2a1a12, 0, hy + 0.085, 0.075, { r: 0.8, cast: false }).rotation.z = 0.05;
    shBox(g, 0.03, 0.09, 0.04, 0x2a1a12, -0.11, hy + 0.02, 0.03, { r: 0.8, cast: false });
    shBox(g, 0.03, 0.09, 0.04, 0x2a1a12, 0.11, hy + 0.02, 0.03, { r: 0.8, cast: false });
  });
}
shFacePass();

/* ---------------- jump ---------------- */
var shJump = document.createElement("button");
shJump.id = "jump";
shJump.type = "button";
shJump.textContent = "\u2191";
document.body.appendChild(shJump);
var jstyle = document.createElement("style");
jstyle.textContent =
  "#jump{position:fixed;right:max(18px,env(safe-area-inset-right,0px));bottom:calc(118px + env(safe-area-inset-bottom,0px));width:56px;height:56px;border-radius:50%;border:1px solid rgba(242,238,228,.25);background:rgba(13,16,20,.55);color:#f2eee4;font-size:1.3rem;display:none;place-items:center;z-index:56;backdrop-filter:blur(8px)}body.touch #jump{display:grid}";
document.head.appendChild(jstyle);
function shTryJump() {
  if (!window.__seoul || !window.__seoul.P) return;
  var P = window.__seoul.P;
  var gy = __seoul.surfaceY(P.x, P.z, P.y);
  if (Math.abs(P.y - gy) < 0.08) {
    P.vy = 4.6;
    P.y += 0.03;
  }
}
addEventListener(
  "keydown",
  function (e) {
    if (e.code === "Space" && !e.repeat) {
      e.preventDefault();
      shTryJump();
    }
  },
  true,
);
shJump.addEventListener("pointerdown", function (e) {
  e.stopPropagation();
  e.preventDefault();
  shTryJump();
});

/* ---------------- 2F fitness ---------------- */
(function shFitness() {
  var y = Y2;
  shBox(scene, 0.72, 0.012, 1.85, 0xc9b6de, 3.55, y + 0.01, -5.55, { r: 0.95, cast: false });
  shBox(scene, 0.68, 0.006, 1.8, 0xd9cbe8, 3.55, y + 0.022, -5.55, { r: 0.95, cast: false });
  var rm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.8, 14), cm(0xb9a5d0, 0.9));
  rm.rotation.z = Math.PI / 2;
  rm.position.set(2.65, y + 0.13, -5.85);
  scene.add(rm);
  shBox(scene, 0.03, 0.015, 0.8, 0x2b2b2b, 2.65, y + 0.24, -5.85, { r: 0.6, cast: false });
  [
    [2.5, -4.6],
    [2.72, -4.6],
  ].forEach(function (d) {
    shCyl(scene, 0.03, 0.03, 0.16, 0x3a3f45, d[0], y + 0.0, d[1], { seg: 8, cast: false });
    shCyl(scene, 0.065, 0.065, 0.05, 0x3a3f45, d[0], y + 0.0, d[1] - 0.09, { seg: 10, cast: false });
    shCyl(scene, 0.065, 0.065, 0.05, 0x3a3f45, d[0], y + 0.0, d[1] + 0.09, { seg: 10, cast: false });
  });
  var kb = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.13, 14), cm(0xe86a9a, 0.7));
  kb.position.set(2.65, y + 0.0655, -5.1);
  scene.add(kb);
  var kbh = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 6, 12), cm(0xe86a9a, 0.7));
  kbh.position.set(2.65, y + 0.2155, -5.1);
  kbh.rotation.x = Math.PI / 2;
  scene.add(kbh);
  var fr = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.6, 14), cm(0x7fc7b8, 0.8));
  fr.rotation.z = Math.PI / 2;
  fr.position.set(2.65, y + 0.075, -5.45);
  scene.add(fr);
  shCyl(scene, 0.035, 0.032, 0.2, 0x9ad4e8, 3.05, y, -4.35, { seg: 12, cast: false });
  shBox(scene, 0.02, 0.01, 0.55, 0xc9b6de, 3.0, y + 0.012, -4.1, { r: 0.8, cast: false }).rotation.y = 0.5;
  [
    [3.2, -4.9],
    [3.45, -4.9],
  ].forEach(function (s) {
    shBox(scene, 0.1, 0.05, 0.24, 0xf2efe8, s[0], y + 0.02, s[1], { r: 0.9 }).rotation.y = 0.15;
  });
  addInteract({
    pos: new THREE.Vector3(3.55, Y2 + 0.3, -5.55),
    r: 1.4,
    label: function () {
      return shTr("stretch");
    },
    act: function () {
      toast(shTr("stretch_t"));
      sfx("click");
    },
  });
})();

/* ---------------- rooftop extras ---------------- */
(function shRoofBits() {
  var y = Y3;
  var reel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16), cm(0x2b6ca3, 0.6));
  reel.rotation.z = Math.PI / 2;
  reel.position.set(-5.4, y + 0.35, -4.4);
  scene.add(reel);
  var hose = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 6, 18), cm(0x1f4d2e, 0.8));
  hose.position.set(-5.2, y + 0.05, -4.0);
  hose.rotation.x = Math.PI / 2;
  scene.add(hose);
  shCyl(scene, 0.03, 0.03, 0.5, 0x8b9298, -5.4, y, -4.4, { seg: 8 });
  shBox(scene, 0.55, 0.35, 0.4, 0xe8e2d5, -4.3, y, -8.0, { r: 0.85 });
  shBox(scene, 0.5, 0.03, 0.36, 0xb5c9d8, -4.3, y + 0.3, -8.0, { r: 0.8, cast: false });
  shBox(scene, 0.4, 0.03, 0.4, 0x8b6a46, -3.9, y + 0.45, -5.2, { r: 0.8 });
  [
    [-0.16, -0.16],
    [0.16, -0.16],
    [-0.16, 0.16],
    [0.16, 0.16],
  ].forEach(function (l) {
    shBox(scene, 0.03, 0.45, 0.03, 0x6e4e33, -3.9 + l[0], y, -5.2 + l[1], { r: 0.7 });
  });
  shBox(scene, 0.4, 0.42, 0.03, 0x8b6a46, -3.9, y + 0.45, -5.4, { r: 0.8 });
  shBox(scene, 0.6, 0.2, 0.24, 0x9a6a44, -2.9, y + 0.12, -8.3, { r: 0.85 });
  for (var s = 0; s < 7; s++) shBox(scene, 0.012, 0.26, 0.012, 0x4f7a34, -3.12 + s * 0.075, y + 0.3, -8.3, { r: 0.7, cast: false });
  shCyl(scene, 0.02, 0.02, 1.7, M.steel, -5.6, y + 1.0, -10.2, { r: 0.4, seg: 6 });
  for (var a = 0; a < 3; a++) shBox(scene, 0.5, 0.02, 0.02, M.steel, -5.6, y + 1.7 + a * 0.1, -10.2, { r: 0.4, cast: false }).rotation.y = a * 0.4;
  var dish = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.05, 0.14, 18), cm(0xe8e6e0, 0.6));
  dish.position.set(5.6, y + 1.2, -10.3);
  dish.rotation.x = Math.PI / 2.4;
  scene.add(dish);
  for (var d = 0; d < 4; d++) shBox(scene, 0.4, 0.012, 0.04, 0x6e7478, -1.0, y + 0.012, -7.0 + d * 0.1, { r: 0.6, cast: false });
})();

SH_T.stretch = [
  "Stretch on the mat",
  "\uC694\uAC00 \uB9E4\uD2B8\uC5D0\uC11C \uC2A4\uD2B8\uB808\uCE58",
  "\u5728\u745C\u4F3D\u57AB\u4E0A\u4F38\u5C55",
  "\u30E8\u30AC\u30DE\u30C3\u30C8\u3067\u4F38\u3070\u3059",
];
SH_T.stretch_t = [
  "Five slow breaths. Shoulders down.",
  "\uCC9C\uCC9C\uD788 \uB2E4\uC12F \uD638\uD761. \uC5B4\uAE68 \uD798\uBE7C\uC138\uC694.",
  "\u6162\u6162\u547C\u5438\u4E94\u6B21\uFF0C\u80A9\u8180\u653E\u677E\u3002",
  "\u3086\u3063\u304F\u308A5\u56DE\u547C\u5438\u3002\u80A9\u3092\u4E0B\u3052\u3066\u3002",
];
SH_T.pay = ["Pay", "\uACB0\uC81C\uD558\uAE30", "\u7ED3\u8D26", "\u4F1A\u8A08"];
SH_T.talk = ["Talk", "\uB300\uD654\uD558\uAE30", "\u4EA4\u8C08", "\u8A71\u3059"];
SH_T.cook = ["Hot water", "\uB730\uB294 \uBB3C", "\u70ED\u6C34", "\u71B1\u6E29"];
shBasketRender();

/* street facade + store wall colliders */
addCol(-70, SHOPDOOR0, 12.32, 12.72, 0, 4);
addCol(SHOPDOOR1, 70, 12.32, 12.72, 0, 4);
addCol(SHOPX0 - 0.2, SHOPX0 + 0.05, 12.6, SHOPZ1, 0, 3.1);
addCol(SHOPX1 - 0.05, SHOPX1 + 0.2, 12.6, SHOPZ1, 0, 3.1);
addCol(SHOPX0, SHOPX1, SHOPZ1 - 0.1, SHOPZ1 + 0.2, 0, 3.1);

/* =====================================================================
   PHASE A — 7-ELEVEN brand, food, price tags, staff, door chime
   ===================================================================== */
(function shBrandStore() {
  var G = "#00754a",
    O = "#f68b1f",
    R = "#e4572e";
  var cx = (SHOPX0 + SHOPX1) / 2;
  /* fascia stripes outside + inside back wall */
  [
    [2.78, G, 0.12],
    [2.9, O, 0.06],
    [2.72, R, 0.05],
  ].forEach(function (b) {
    shBox(scene, SHOPX1 - SHOPX0, b[2], 0.05, parseInt(b[1].slice(1), 16), cx, b[0], SHOPZ0 - 0.055, { r: 0.5, cast: false });
    shBox(scene, SHOPX1 - SHOPX0, b[2], 0.05, parseInt(b[1].slice(1), 16), cx, b[0], SHOPZ1 - 0.09, { r: 0.5, cast: false });
  });
  /* storefront promo posters (outside) */
  function poster(x, y, z, w, h, tex, ry) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.22, roughness: 0.7 }));
    m.position.set(x, y, z);
    m.rotation.y = ry || 0;
    scene.add(m);
    return m;
  }
  var pR = ctex(420, 600, function (g, w, h) {
    g.fillStyle = "#f7f3e8";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#e4572e";
    g.fillRect(0, 0, w, 96);
    g.fillStyle = "#fff";
    g.font = '800 64px "Noto Sans KR",sans-serif';
    g.textAlign = "center";
    g.fillText("\uB77C\uBA74", w / 2, 70);
    g.fillStyle = "#1f2430";
    g.font = '900 176px "Arial Black",sans-serif';
    g.fillText("2+1", w / 2, 300);
    g.fillStyle = "#00754a";
    g.font = '700 48px "Noto Sans KR",sans-serif';
    g.fillText("\uC2E0\uB77C\uBA74 \u00B7 \uC9C4\uB77C\uBA74", w / 2, 390);
    g.fillStyle = "#6b655d";
    g.font = '400 34px "Noto Sans KR",sans-serif';
    g.fillText("11.20 ~ 12.03", w / 2, 470);
    g.fillStyle = "#e4572e";
    g.fillRect(40, 520, w - 80, 44);
  });
  var pC = ctex(420, 600, function (g, w, h) {
    g.fillStyle = "#2a1d15";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#e9a64d";
    g.font = '800 66px "Gowun Batang",serif';
    g.textAlign = "center";
    g.fillText("\uCEE4\uD53C", w / 2, 110);
    g.fillStyle = "#fff";
    g.font = '900 150px "Arial Black",sans-serif';
    g.fillText("1,200", w / 2, 300);
    g.fillStyle = "#e9a64d";
    g.font = '700 44px "Noto Sans KR",sans-serif';
    g.fillText("\uB530\uB73B\uD55C \uC544\uBA54\uB9AC\uCE74\uB178", w / 2, 390);
    g.fillStyle = "#f7f3e8";
    g.fillRect(60, 440, w - 120, 3);
    g.fillStyle = "#bdb3a4";
    g.font = '400 32px "Noto Sans KR",sans-serif';
    g.fillText("7-ELEVEN COFFEE", w / 2, 510);
  });
  var pI = ctex(420, 600, function (g, w, h) {
    g.fillStyle = "#eaf4ff";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#1b4fa3";
    g.fillRect(0, 0, w, 90);
    g.fillStyle = "#fff";
    g.font = '800 58px "Noto Sans KR",sans-serif';
    g.textAlign = "center";
    g.fillText("\uC544\uC774\uC2A4\uD06C\uB9BC", w / 2, 66);
    g.fillStyle = "#e4572e";
    g.font = '900 168px "Arial Black",sans-serif';
    g.fillText("1+1", w / 2, 290);
    g.fillStyle = "#2a3b52";
    g.font = '700 40px "Noto Sans KR",sans-serif';
    g.fillText("\uB9DB\uBCC4\uB85C \uACE8\uB77C \uB2F4\uC73C\uC138\uC694", w / 2, 380);
    g.strokeStyle = "#1b4fa3";
    g.lineWidth = 10;
    g.beginPath();
    g.arc(w / 2, 470, 64, 0, 6.28);
    g.stroke();
  });
  poster(9.4, 1.45, SHOPZ0 - 0.02, 0.78, 1.1, pR, Math.PI);
  poster(18.4, 1.45, SHOPZ0 - 0.02, 0.78, 1.1, pI, Math.PI);
  /* price strips */
  var PT = {};
  function ptex(t) {
    if (!PT[t]) PT[t] = signTex(t, "#ffffff", "#1f2430", 220, 90, 40);
    return PT[t];
  }
  function strip(x, y, z, ry, w, t) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.075), new THREE.MeshStandardMaterial({ map: ptex(t), roughness: 0.7 }));
    m.position.set(x, y, z);
    m.rotation.y = ry;
    scene.add(m);
  }
  [
    ["1,200", "2,500", "1+1", "3,500"],
    ["1,800", "2,200", "1+1", "4,200"],
  ].forEach(function (row, ri) {
    row.forEach(function (t, ti) {
      strip(SHOPX0 + 0.55, 0.53 + ti * 0.5, 13.75 + ri * 0.2, Math.PI / 2, 0.5, t);
      strip(SHOPX1 - 0.55, 0.55 + ti * 0.48, 14.2 + ri * 0.2, -Math.PI / 2, 0.5, t);
    });
  });
  /* 1+1 hanging mobile */
  var mob = ctex(500, 260, function (g, w, h) {
    g.fillStyle = "#f7f3e8";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#e4572e";
    g.fillRect(0, 0, w, 60);
    g.fillStyle = "#fff";
    g.font = '700 44px "Noto Sans KR",sans-serif';
    g.textAlign = "center";
    g.fillText("\uD589\uC0AC \uC548\uB0B4", w / 2, 44);
    g.fillStyle = "#1f2430";
    g.font = '900 120px "Arial Black",sans-serif';
    g.fillText("1+1", w / 2, 190);
    g.fillStyle = "#00754a";
    g.font = '700 34px "Noto Sans KR",sans-serif';
    g.fillText("\uB9CE\uC740 \uC0C1\uD488", w / 2, 230);
  });
  var mm = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.47), new THREE.MeshStandardMaterial({ map: mob, emissiveMap: mob, emissive: 0xffffff, emissiveIntensity: 0.15, roughness: 0.7 }));
  mm.position.set(15.1, 2.42, 15.6);
  mm.rotation.y = Math.PI;
  mm.scale.set(0.78, 0.78, 1);
  scene.add(mm);
  shBox(scene, 0.012, 0.3, 0.012, 0x6e7478, 15.1, 2.5, 15.6, { r: 0.5, cast: false });
  /* hot-food warmer: glass + food + labels */
  var wfz = 13.24;
  shBox(scene, 1.86, 2.0, 0.03, M.frame, 16.6, SHOPY + 0.15, 13.24, { r: 0.4 });
  shBox(scene, 1.76, 1.9, 0.02, new THREE.MeshStandardMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.18, roughness: 0.05, depthWrite: false }), 16.6, SHOPY + 0.2, 13.22, { cast: false });
  [
    [-0.9, 0.45],
    [0.9, 0.45],
    [-0.9, 1.1],
    [0.9, 1.1],
  ].forEach(function (f) {
    shBox(scene, 0.04, 2.0, 0.04, 0x9aa0a4, 16.6 + f[0], SHOPY + 0.15, 13.23, { r: 0.4, m: 0.4 });
  });
  shBox(scene, 0.24, 0.035, 0.035, 0x9aa0a4, 16.6, SHOPY + 1.15, 13.18, { r: 0.4, m: 0.4 });
  var hotT = signTex("\uAE40\uBC25 \u00B7 \uD578\uB3C4\uADF8 \u00B7 \uB9CC\uB450", "#fff", "#e4572e", 420, 90, 44);
  poster(16.6, SHOPY + 1.52, 13.2, 0.9, 0.19, hotT, Math.PI);
  for (var hd = 0; hd < 6; hd++) shBox(scene, 0.19, 0.055, 0.15, [0x2f6b3a, 0xa8552f, 0xe8dcc2][hd % 3], 15.95 + hd * 0.26, SHOPY + 0.72, 13.43, { r: 0.7, cast: false });
  for (var hs = 0; hs < 4; hs++) shBox(scene, 0.26, 0.07, 0.08, 0x9b5a3a, 15.9 + hs * 0.4, SHOPY + 0.95, 13.36, { r: 0.6, cast: false });
  /* coffee menu + cups */
  var cmenu = ctex(500, 420, function (g, w, h) {
    g.fillStyle = "#221a14";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#e9a64d";
    g.font = '800 54px "Gowun Batang",serif';
    g.textAlign = "center";
    g.fillText("COFFEE", w / 2, 76);
    g.fillStyle = "#fff";
    g.font = '600 30px "Noto Sans KR",sans-serif';
    [
      ["\uC544\uBA54\uB9AC\uCE74\uB178", "1,200"],
      ["\uCE74\uD398\uB77C\uB5BC", "1,500"],
      ["\uBC14\uB2D0\uB77C", "1,800"],
      ["\uB530\uB73B\uD55C \uCD08\uCF5C\uB9BF", "2,000"],
    ].forEach(function (r, i) {
      g.textAlign = "left";
      g.fillText(r[0], 56, 170 + i * 62);
      g.textAlign = "right";
      g.fillStyle = "#e9a64d";
      g.fillText("\u20A9" + r[1], w - 56, 170 + i * 62);
      g.fillStyle = "#fff";
    });
  });
  poster(18.9, 2.18, 13.19, 0.62, 0.52, cmenu, Math.PI);
  for (var cu = 0; cu < 5; cu++) shCyl(scene, 0.035, 0.03, 0.08, 0xffffff, 18.15 + cu * 0.1, SHOPY + 1.7, 13.55, { seg: 10, r: 0.4, cast: false });
  /* ice-cream freezer branding */
  var iceT = signTex("7-ELEVEN  ICE CREAM", "#eaf4ff", "#1b4fa3", 600, 110, 46);
  poster(10.2, SHOPY + 0.56, 13.19, 0.9, 0.16, iceT, Math.PI);
  /* floor decal at entrance */
  var dec = ctex(512, 512, function (g, w, h) {
    g.fillStyle = "rgba(0,0,0,0)";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#00754a";
    g.lineWidth = 26;
    g.beginPath();
    g.arc(w / 2, h / 2, 200, 0, 6.28);
    g.stroke();
    g.fillStyle = "#00754a";
    g.font = '900 150px "Arial Black",sans-serif';
    g.textAlign = "center";
    g.fillText("7", w / 2, 250);
    g.fillStyle = "#e4572e";
    g.fillRect(150, 320, 212, 26);
    g.fillStyle = "#f68b1f";
    g.fillRect(150, 356, 212, 18);
  });
  var fl = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshStandardMaterial({ map: dec, transparent: true, roughness: 0.9, depthWrite: false }));
  fl.rotation.x = -Math.PI / 2;
  fl.position.set(13.2, SHOPY + 0.015, 13.15);
  scene.add(fl);
  /* staff apron + name tag + cap */
  shBox(scene, 0.36, 0.56, 0.035, 0x00754a, 19.6, SHOPY + 0.95, 16.65, { r: 0.85 });
  shBox(scene, 0.36, 0.09, 0.038, 0xe4572e, 19.6, SHOPY + 1.42, 16.66, { r: 0.8, cast: false });
  var tag = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.05), new THREE.MeshStandardMaterial({ map: signTex("\uC9C0\uC740", "#ffffff", "#00754a", 220, 90, 44), roughness: 0.8 }));
  tag.position.set(19.6, SHOPY + 1.5, 16.66);
  tag.rotation.y = Math.PI;
  scene.add(tag);
  shBox(scene, 0.24, 0.06, 0.24, 0x00754a, 19.6, SHOPY + 1.72, 16.9, { r: 0.85 });
  shBox(scene, 0.28, 0.02, 0.28, 0x00623f, 19.6, SHOPY + 1.69, 16.9, { r: 0.85, cast: false });
  /* model PICK endcap on the centre table */
  var px = 13.2,
    pz = 16.15;
  shBox(scene, 0.9, 0.55, 0.45, 0x00754a, px, SHOPY + 0.95, pz, { r: 0.75 });
  shBox(scene, 0.86, 0.06, 0.42, 0xe4572e, px, SHOPY + 1.48, pz, { r: 0.7 });
  var pickT = ctex(600, 300, function (g, w, h) {
    g.fillStyle = "#0b1f1a";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#e9a64d";
    g.font = '800 48px "Noto Sans KR",sans-serif';
    g.textAlign = "center";
    g.fillText("\uBAA8\uB378 PICK", w / 2, 82);
    g.fillStyle = "#fff";
    g.font = '600 28px "Noto Sans KR",sans-serif';
    g.fillText("\uC624\uB298\uC758 \uD55C \uC794", w / 2, 136);
    g.fillStyle = "#00754a";
    g.fillRect(60, 180, w - 120, 4);
    g.fillStyle = "#bfe8d4";
    g.font = '500 24px "Noto Sans KR",sans-serif';
    g.fillText("\uD55C\uAC15 25\u00B0 \u00B7 \uC5BC\uD070 \uB77C\uBA74 \u00B7 \uBE44\uBE94\uBC25", w / 2, 228);
  });
  poster(px, SHOPY + 1.98, pz, 0.9, 0.42, pickT, Math.PI);
  shSojuBottle(scene, px - 0.22, SHOPY + 1.5, pz, 1.0);
  shBox(scene, 0.16, 0.2, 0.08, 0xc0392b, px, SHOPY + 1.5, pz, { r: 0.75 });
  shCyl(scene, 0.09, 0.075, 0.06, 0xefeadd, px + 0.22, SHOPY + 1.5, pz, { seg: 16, r: 0.5, cast: false });
  shBox(scene, 0.04, 0.03, 0.04, 0x9b5a3a, px + 0.22, SHOPY + 1.56, pz, { r: 0.6, cast: false });
  addInteract({
    pos: new THREE.Vector3(px - 0.22, SHOPY + 1.75, pz + 0.3),
    r: 0.85,
    label: function () {
      return shTr("shop_view");
    },
    act: function () {
      shOpenShop("soju");
    },
  });
  addInteract({
    pos: new THREE.Vector3(px, SHOPY + 1.75, pz + 0.3),
    r: 0.85,
    label: function () {
      return shTr("shop_view");
    },
    act: function () {
      shOpenShop("ramen");
    },
  });
  addInteract({
    pos: new THREE.Vector3(px + 0.22, SHOPY + 1.75, pz + 0.3),
    r: 0.85,
    label: function () {
      return shTr("shop_view");
    },
    act: function () {
      shOpenShop("bibimbap");
    },
  });
  /* two more shoppers */
  var s1 = addPerson({ at: [12.0, 16.9], yaw: 0.1, jacket: 0x3d5a80, pants: 0x22262c, h: 1.75, bag: 0x6a4a2c });
  var s2 = addPerson({ at: [19.4, 15.1], yaw: -1.2, jacket: 0xb5483b, pants: 0x2b2b2b, h: 1.62, scarf: 0xe8d8c0 });
  shFacePass();
  /* automatic door chime */
  var wasIn = false;
  TICKERS.push(function () {
    var inNow = P.x > SHOPDOOR0 && P.x < SHOPDOOR1 && P.z > SHOPZ0 + 0.18 && P.z < SHOPZ1;
    if (inNow && !wasIn) {
      sfx("ding");
      ttsSay("\uc5b4\uc11c \uc624\uc138\uc694.");
      toast(shTr("welcome"));
    }
    wasIn = inNow;
  });
  /* category banners */
  function banner(txt, bg, fg, x, y, z, ry, w, h) {
    var t = ctex(900, 180, function (g, W, H) {
      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);
      g.fillStyle = fg;
      g.font = '800 78px "Noto Sans KR",sans-serif';
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(txt, W / 2, H / 2);
    });
    var b = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 0.16, roughness: 0.7 }));
    b.position.set(x, y, z);
    b.rotation.y = ry;
    scene.add(b);
  }
  banner("\uC74C\uB8CC \u00B7 DRINKS", "#1b4fa3", "#fff", 13.2, 2.46, SHOPZ1 - 0.13, Math.PI, 7.6, 0.42);
  banner("\uB77C\uBA74 \u00B7 RAMEN", "#c0392b", "#fff", SHOPX0 + 0.07, 2.15, 15.2, Math.PI / 2, 2.6, 0.4);
  banner("\uACFC\uC790 \u00B7 SNACKS", "#e0a21a", "#2a1a10", SHOPX1 - 0.07, 2.15, 15.3, -Math.PI / 2, 2.4, 0.4);
  banner("HOT FOOD \u00B7 \uAE40\uBC25", "#2f6b3a", "#fff", 16.6, 2.02, 13.18, Math.PI, 1.7, 0.34);
  /* no umbrellas indoors */
  TICKERS.push(function () {
    PEOPLE.forEach(function (p) {
      if (!p.g || !p.umb) return;
      var wp = p.g.position;
      if (wp.x > SHOPX0 && wp.x < SHOPX1 && wp.z > SHOPZ0 && wp.z < SHOPZ1) p.umb.visible = false;
    });
  });
  SH_T.welcome = ["Welcome in", "\uC5B4\uC11C \uC624\uC138\uC694", "\u6B22\u8FCE\u5149\u4E34", "\u3044\u3089\u3063\u3057\u3083\u3044"];
})();

/* =====================================================================
   PHASE C — hero characters (faces, hair, build, OOTD)
   ===================================================================== */
function shHero(x, z, ry, o) {
  o = o || {};
  var g = grp(x, 0.03, z, ry);
  var s = (o.h || 1.8) / 1.8;
  g.scale.setScalar(s);
  var skin = o.skin || 0xe8c39e,
    hair = o.hair || 0x1b1712;
  var coat = o.coat || 0x2b3a55,
    inner = o.inner || 0xf2ede1,
    pants = o.pants || 0x2b2f36,
    shoe = o.shoe || 0x1a1a1a;
  /* legs + shoes */
  [-0.1, 0.1].forEach(function (dx) {
    shBox(g, 0.145, 0.82, 0.15, pants, dx, 0.04, 0, { r: 0.85 });
    shBox(g, 0.15, 0.055, 0.26, shoe, dx, 0.0, 0.045, { r: 0.75 });
  });
  /* waist + torso, tapered */
  shBox(g, 0.34, 0.2, 0.21, coat, 0, 0.84, 0, { r: 0.85 });
  shBox(g, 0.46, 0.46, 0.25, coat, 0, 1.0, 0, { r: 0.85 });
  shBox(g, 0.4, 0.1, 0.24, inner, 0, 1.38, 0, { r: 0.8 });
  /* collar / turtleneck */
  shBox(g, 0.2, 0.09, 0.2, inner, 0, 1.47, 0, { r: 0.8 });
  /* coat lapels + buttons + belt */
  shBox(g, 0.08, 0.34, 0.015, o.lapel || 0x1f2a3d, -0.075, 1.12, 0.125, { r: 0.8, cast: false }).rotation.z = 0.16;
  shBox(g, 0.08, 0.34, 0.015, o.lapel || 0x1f2a3d, 0.075, 1.12, 0.125, { r: 0.8, cast: false }).rotation.z = -0.16;
  [1.18, 1.08, 0.98].forEach(function (y) {
    shCyl(g, 0.011, 0.011, 0.012, 0x2b2b2b, 0, y, 0.13, { seg: 6, cast: false });
  });
  shBox(g, 0.34, 0.03, 0.23, 0x3a2a1c, 0, 0.86, 0, { r: 0.7, cast: false });
  /* arms + hands */
  [-0.245, 0.245].forEach(function (dx, i) {
    var a = shBox(g, 0.1, 0.46, 0.13, coat, dx, 1.03, 0, { r: 0.85 });
    a.rotation.z = i ? -0.06 : 0.06;
    var f = shBox(g, 0.095, 0.34, 0.12, coat, dx + (i ? 0.02 : -0.02), 0.68, 0.01, { r: 0.85 });
    f.rotation.z = i ? 0.02 : -0.02;
    sph(0.045, cm(skin, 0.7), dx + (i ? 0.02 : -0.02), 0.56, 0.02, { parent: g, seg: 10 });
  });
  /* neck + head */
  shCyl(g, 0.038, 0.045, 0.08, skin, 0, 1.5, 0, { seg: 10, cast: false });
  var head = sph(0.112, cm(skin, 0.7), 0, 1.56, 0.005, { parent: g, seg: 18 });
  head.scale.set(1, 1.14, 0.96);
  sph(0.094, cm(skin, 0.7), 0, 1.535, 0.026, { parent: g, seg: 16 }).scale.set(1, 0.72, 0.9);
  /* ears */
  [-0.108, 0.108].forEach(function (dx) {
    sph(0.022, cm(skin, 0.7), dx, 1.635, 0, { parent: g, seg: 8 });
  });
  /* eyes */
  [-0.045, 0.045].forEach(function (dx) {
    sph(0.022, cm(0xf8f4ea, 0.5), dx, 1.668, 0.099, { parent: g, seg: 10 });
    sph(0.013, cm(o.eye || 0x2a1d17, 0.4), dx, 1.668, 0.11, { parent: g, seg: 8 });
    sph(0.004, cm(0xffffff, 0.3), dx - 0.004, 1.674, 0.115, { parent: g, seg: 5 });
    sph(0.004, cm(0xffffff, 0.3), dx - 0.004, 1.675, 0.114, { parent: g, seg: 5 });
  });
  /* brows, nose, mouth */
  [-0.048, 0.048].forEach(function (dx) {
    var b = shBox(g, 0.045, 0.009, 0.01, o.brow || 0x241a14, dx, 1.708, 0.1, { r: 0.6, cast: false });
    b.rotation.z = dx < 0 ? 0.1 : -0.1;
  });
  shBox(g, 0.024, 0.055, 0.035, cm(skin, 0.7), 0, 1.626, 0.108, { r: 0.7, cast: false });
  shBox(g, 0.05, 0.012, 0.01, o.mouth || 0x9e5a55, 0, 1.568, 0.106, { r: 0.7, cast: false });
  /* hair styles */
  if (o.style === "long") {
    sph(0.123, cm(hair, 0.9), 0, 1.665, -0.005, { parent: g, seg: 16 }).scale.set(1, 0.95, 1.02);
    shBox(g, 0.19, 0.055, 0.06, cm(hair, 0.9), 0, 1.72, 0.09, { r: 0.9, cast: false }).rotation.z = 0.08;
    shBox(g, 0.055, 0.5, 0.14, cm(hair, 0.9), -0.125, 1.39, -0.03, { r: 0.9 });
    shBox(g, 0.055, 0.5, 0.14, cm(hair, 0.9), 0.125, 1.39, -0.03, { r: 0.9 });
    shBox(g, 0.22, 0.26, 0.05, cm(hair, 0.9), 0, 1.42, -0.1, { r: 0.9 });
  } else if (o.style === "bob") {
    sph(0.126, cm(hair, 0.9), 0, 1.675, -0.005, { parent: g, seg: 16 }).scale.set(1, 1.0, 1.03);
    shBox(g, 0.2, 0.22, 0.14, cm(hair, 0.9), 0, 1.58, -0.03, { r: 0.9 });
    shBox(g, 0.16, 0.07, 0.09, cm(hair, 0.9), 0, 1.72, 0.07, { r: 0.9, cast: false });
  } else if (o.style === "beanie") {
    sph(0.128, cm(o.beanie || 0x556b8a, 0.9), 0, 1.695, -0.005, { parent: g, seg: 16 }).scale.set(1, 0.9, 1.03);
    shBox(g, 0.28, 0.06, 0.28, cm(o.beanie || 0x556b8a, 0.9), 0, 1.6, 0, { r: 0.9, cast: false });
  } else if (o.style === "gray") {
    sph(0.12, cm(hair, 0.9), 0, 1.675, -0.01, { parent: g, seg: 16 }).scale.set(1, 0.95, 1.02);
    shBox(g, 0.19, 0.06, 0.07, cm(hair, 0.9), 0, 1.735, 0.085, { r: 0.9, cast: false });
    /* stubble */
    shBox(g, 0.15, 0.055, 0.02, 0x8a7a6a, 0, 1.545, 0.105, { r: 0.9, cast: false });
  } else {
    sph(0.12, cm(hair, 0.9), 0, 1.67, -0.005, { parent: g, seg: 18 }).scale.set(1, 0.92, 1.01);
    shBox(g, 0.19, 0.06, 0.07, cm(hair, 0.9), 0, 1.725, 0.08, { r: 0.9, cast: false }).rotation.z = 0.05;
    shBox(g, 0.035, 0.05, 0.06, cm(hair, 0.9), 0.085, 1.7, 0.06, { r: 0.9, cast: false });
  }
  /* glasses / scarf / bag */

  if (o.scarf) {
    shCyl(g, 0.075, 0.085, 0.07, cm(o.scarf, 0.9), 0, 1.45, 0, { seg: 12, cast: false });
    shBox(g, 0.09, 0.2, 0.05, cm(o.scarf, 0.9), -0.05, 1.3, 0.11, { r: 0.9, cast: false }).rotation.z = 0.1;
  }
  if (o.bag) {
    shBox(g, 0.18, 0.28, 0.09, cm(o.bag, 0.85), 0.24, 1.0, 0.02, { r: 0.85 });
    shBox(g, 0.02, 0.34, 0.02, cm(o.bag, 0.85), 0.16, 1.28, 0.02, { r: 0.8, cast: false });
  }
  /* simple idle breathing */
  var ph = Math.random() * 6;
  TICKERS.push(function (n, t) {
    g.position.y = 0.03 + Math.sin(t * 1.6 + ph) * 0.004;
  });
  return g;
}
(function shCast() {
  var H = [
    ["\u7684\u5b50", -4.8, 10.7, Math.PI * 0.98, { h: 1.84, coat: 0x1e2b45, inner: 0x101418, lapel: 0x16203a, pants: 0x23272e, shoe: 0x141414, style: "part", glasses: true, hair: 0x15100c }],
    ["\u6b63\u6d25", 12.0, 15.0, Math.PI * 0.95, { h: 1.8, coat: 0xb08a5a, inner: 0xf2ede1, pants: 0x3b4a63, shoe: 0xede8de, style: "part", hair: 0x2a1d14 }],
    ["\u5927\u53d4", -8.6, 7.6, Math.PI * 0.1, { h: 1.79, coat: 0x6b6b66, inner: 0x3a3a38, pants: 0x2f2f30, style: "gray", hair: 0x6b6560, glasses: true }],
    ["\u667a\u6167", -10.5, 9.4, Math.PI * 0.9, { h: 1.68, coat: 0xc9b39b, inner: 0xf4eee3, pants: 0x4a3b32, shoe: 0x2a2420, style: "long", hair: 0x3a2318, scarf: 0xb5483b, bag: 0x6a4a2c }],
    ["\u5bd2\u661f", 28.0, 8.4, -Math.PI * 0.2, { h: 1.66, coat: 0x2a2a2e, inner: 0x111111, pants: 0x1e2b3a, style: "bob", hair: 0x161210, bag: 0x8a2b2b }],
    ["\u6c5f\u6e56", 39.5, 9.2, Math.PI * 0.1, { h: 1.82, coat: 0x3e5a47, inner: 0xe8e2d4, pants: 0x2b2b2b, shoe: 0x1a1a1a, style: "beanie", beanie: 0x2e3b4a, hair: 0x1b1712 }],
  ];
  H.forEach(function (a, i) {
    var g = shHero(a[1], a[2], a[3], a[4]);
    var lines = [
      [
        "\uC548\uB155\uD558\uC138\uC694. \uC624\uB298 \uB0A0\uC528 \uC88B\uB124\uC694.",
        "Hello. Nice weather today.",
        "\u4F60\u597D\uFF0C\u4ECA\u5929\u5929\u6C14\u771F\u597D\u3002",
        "\u3053\u3093\u306B\u3061\u306F\u3002\u3044\u3044\u5929\u6C17\u3067\u3059\u306D\u3002",
      ],
      [
        "\uC800 \uCEE4\uD53C\uC9D1 \uC544\uC138\uC694? \uC6D0\uB450 \uB9DB\uC788\uC5B4\uC694.",
        "Have you tried that cafe?",
        "\u90A3\u5BB6\u5496\u5561\u5E97\u53BB\u8FC7\u5417\uFF1F",
        "\u3042\u306E\u30AB\u30D5\u30A7\u3001\u884C\u304D\u307E\u3057\u305F\uFF1F",
      ],
      [
        "\uC774 \uB3D9\uB124 \uC624\uB798\uB41C \uC9D1\uC774 \uB9CE\uC544\uC694.",
        "This neighbourhood has such old houses.",
        "\u8FD9\u4E2A\u5C0F\u533A\u6709\u5F88\u591A\u8001\u623F\u5B50\u3002",
        "\u3053\u306E\u8857\u306B\u306F\u53E4\u3044\u5BB6\u304C\u591A\u3044\u3067\u3059\u306D\u3002",
      ],
      [
        "\uC0C8\uB85C \uC774\uC0AC\uC640\uC168\uC5B4\uC694? \uD658\uC601\uD574\uC694.",
        "New here? Welcome.",
        "\u65B0\u642C\u6765\u7684\u5417\uFF1F\u6B22\u8FCE\u3002",
        "\u5F15\u3063\u8D8A\u3057\u3066\u304D\u305F\u3093\u3067\u3059\u304B\uFF1F",
      ],
      [
        "\uC800\uB3C4 \uADF8 \uAC00\uC218 \uC88B\uC544\uD574\uC694.",
        "I like that singer too.",
        "\u6211\u4E5F\u559C\u6B22\u90A3\u4F4D\u6B4C\u624B\u3002",
        "\u79C1\u3082\u3042\u306E\u6B4C\u624B\u3001\u597D\u304D\u3067\u3059\u3002",
      ],
      [
        "\uBCA4\uC154\uB294 \uC5B4\uB514 \uC788\uC5B4\uC694? \uC0AC\uC9C4 \uCC0D\uC744\uAC8C\uC694.",
        "Where's the bench? Let's take a photo.",
        "\u957F\u6905\u5728\u54EA\uFF1F\u62CD\u5F20\u7167\u5427\u3002",
        "\u30D9\u30F3\u30C1\u306F\u3069\u3053\uFF1F\u5199\u771F\u3092\u64AE\u308A\u307E\u3057\u3087\u3046\u3002",
      ],
    ];
    addInteract({
      pos: new THREE.Vector3(a[1], 1.35, a[2]),
      r: 1.7,
      label: function () {
        return shTr("talk");
      },
      act: function () {
        var l = lines[i % lines.length],
          k = ["en", "ko", "zh", "ja"].indexOf(LANG);
        toast(l[1] + "  \u00B7  " + l[k < 0 ? 1 : k]);
        ttsSay(l[0]);
        sfx("click");
      },
    });
  });
})();

/* =====================================================================
   PHASE D — extra interactions + tiny fixes
   ===================================================================== */
(function shExtraD() {
  /* photo spot at the gate: flash + shutter */
  var flash = document.createElement("div");
  flash.id = "shflash";
  document.body.appendChild(flash);
  var css = document.createElement("style");
  css.textContent = "#shflash{position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:80;transition:opacity .08s ease} #shflash.on{opacity:.85;transition:none}";
  document.head.appendChild(css);
  function photo() {
    flash.classList.add("on");
    setTimeout(function () {
      flash.classList.remove("on");
    }, 120);
    sfx("click");
    toast(shTr("photo_t"));
    ttsSay("\uC0AC\uC9C4 \uCC0D\uC558\uC5B4\uC694.");
  }
  addInteract({
    pos: new THREE.Vector3(0, 1.2, -2.15),
    r: 1.3,
    label: function () {
      return shTr("photo");
    },
    act: photo,
  });
  /* 2F fan lightstick on the desk */
  var ls = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.34, 14), cm(0xefe9dc, 0.4));
  ls.position.set(4.55, Y2 + 0.86, -10.2);
  scene.add(ls);
  var tip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 10), new THREE.MeshStandardMaterial({ color: 0xf7e6b8, emissive: 0xf0b429, emissiveIntensity: 0.2, roughness: 0.4 }));
  tip.position.set(4.55, Y2 + 1.21, -10.2);
  scene.add(tip);
  var on = false;
  addInteract({
    pos: new THREE.Vector3(4.55, Y2 + 1.1, -10.05),
    r: 1.0,
    label: function () {
      return shTr("lightstick");
    },
    act: function () {
      on = !on;
      tip.material.emissiveIntensity = on ? 2.2 : 0.2;
      tip.material.color.setHex(on ? 0xfff0c8 : 0xf7e6b8);
      sfx("click");
      toast(shTr(on ? "lightstick_on" : "lightstick_off"));
      if (on) ttsSay("\uC0AC\uB791\uD574\uC694!");
    },
  });
  /* roof hose water */
  addInteract({
    pos: new THREE.Vector3(-5.2, 1.0, -4.2),
    r: 1.2,
    label: function () {
      return shTr("hose");
    },
    act: function () {
      sfx("water");
      toast(shTr("hose_t"));
      shToast("added");
    },
  });
  /* strings */
  SH_T.photo = ["Take a photo", "\uC0AC\uC9C4 \uCC0D\uAE30", "\u62CD\u7167", "\u5199\u771F\u3092\u64AE\u308B"];
  SH_T.photo_t = [
    "Click. One photo at the gate.",
    "\uCCA0\uCE74. \uB300\uBB38 \uC55E\uC5D0\uC11C \uD55C \uC7A5.",
    "\u5361\u55E7\uFF0C\u5728\u5927\u95E8\u53E3\u62CD\u4E86\u4E00\u5F20\u3002",
    "\u30AB\u30B7\u30E3\u3002\u9580\u306E\u524D\u3067\u4E00\u679A\u3002",
  ];
  SH_T.lightstick = ["Fan lightstick", "\uC751\uC6D0 \uB78C\uB4E4\uC774", "\u5E94\u63F4\u706F\u68D2", "\u30DA\u30F3\u30E9\u30A4\u30C8"];
  SH_T.lightstick_on = ["Lightstick on", "\uC751\uC6D0\uBD09 \uCF1C\uC9D0", "\u5E94\u63F4\u68D2\u4EAE\u4E86", "\u30E9\u30A4\u30C8\u30B9\u30C6\u30A3\u30C3\u30AF\u70B9\u706F"];
  SH_T.lightstick_off = ["Lightstick off", "\uC751\uC6D0\uBD09 \uAEBC\uC9D0", "\u5E94\u63F4\u68D2\u7184\u4E86", "\u30E9\u30A4\u30C8\u30B9\u30C6\u30A3\u30C3\u30AF\u6D88\u706F"];
  SH_T.hose = ["Water the plants", "\uBB3C \uC8FC\uAE30", "\u6D47\u6C34", "\u6C34\u3084\u308A"];
  SH_T.hose_t = [
    "Water on. The scallions are happy.",
    "\uBB3C \uD2BC\uB2E4. \uD30C\uAC00 \uC88B\uC544\uD574\uC694.",
    "\u6D47\u6C34\u4E86\uFF0C\u8471\u5F88\u5F00\u5FC3\u3002",
    "\u6C34\u3092\u3084\u308A\u307E\u3057\u305F\u3002",
  ];
  /* indoor: no rain/snow points, no umbrellas in any shop */
  TICKERS.push(function () {
    var inside = P.z > 12.7;
    scene.traverse(function (o) {
      if (o.isPoints) o.visible = !inside;
    });
    PEOPLE.forEach(function (p) {
      if (p.g && p.umb && p.g.position.z > 12.6) p.umb.visible = false;
    });
  });
})();

/* =====================================================================
   PHASE B2 — open the shopfronts (cafe first), no carts blocking them
   ===================================================================== */
(function shCafe() {
  var X0 = -5.6,
    X1 = 6.0,
    Z0 = 12.66,
    Z1 = 17.3,
    Y = 0.12,
    H = 3.05;
  scene.updateMatrixWorld(true);
  var hide = [],
    HIDE = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    if (bb.max.x > X0 - 1 && bb.min.x < X1 + 1 && bb.max.z > 12.4 && bb.min.z < 12.9 && bb.min.y < 3.8 && bb.max.y > 0 && bb.max.z - bb.min.z < 3.2) hide.push(o);
    if (g.type === "BoxGeometry" && bb.max.y - bb.min.y > 6 && bb.max.x > X0 && bb.min.x < X1 && bb.min.z < 17.6 && bb.max.z > 17.2) HIDE.push(o);
  });
  hide.concat(HIDE).forEach(function (o) {
    o.visible = false;
  });
  /* upper facade */
  shBox(scene, X1 - X0, 9.2, 0.22, 0xcfc8ba, (X0 + X1) / 2, 3.15, 12.54, { r: 0.95, cast: false });
  for (var row = 0; row < 4; row++)
    for (var col = 0; col < 4; col++) {
      var wx = X0 + 1.4 + col * 2.7,
        wy = 4.35 + row * 1.95;
      shBox(scene, 1.2, 1.35, 0.06, 0xe9e5da, wx, wy, 12.41, { r: 0.85, cast: false });
      shBox(scene, 1.05, 1.2, 0.02, 0x1d2b3d, wx, wy + 0.07, 12.37, { r: 0.4, cast: false });
    }
  /* room */
  box(X1 - X0, 0.02, Z1 - Z0, cm(0x9a6a44, 0.9), (X0 + X1) / 2, Y, (Z0 + Z1) / 2, { cast: false });
  box(X1 - X0, 0.06, Z1 - Z0, cm(0xd8cfc0, 0.95), (X0 + X1) / 2, H, (Z0 + Z1) / 2, { cast: false });
  shBox(scene, 0.12, H, Z1 - Z0, 0xcfc4b2, X0, Y, (Z0 + Z1) / 2, { r: 0.9 });
  shBox(scene, 0.12, H, Z1 - Z0, 0xcfc4b2, X1, Y, (Z0 + Z1) / 2, { r: 0.9 });
  shBox(scene, X1 - X0, H, 0.12, 0xbfb4a2, (X0 + X1) / 2, Y, Z1, { r: 0.9 });
  /* glass front + open door (gap -1..1) */
  [
    [X0, -1.05],
    [1.05, X1],
  ].forEach(function (r) {
    shBox(scene, r[1] - r[0], 2.55, 0.03, new THREE.MeshStandardMaterial({ color: 0xd8e8ee, transparent: true, opacity: 0.18, roughness: 0.06, depthWrite: false }), (r[0] + r[1]) / 2, Y + 0.05, Z0, { cast: false });
  });
  [X0, -1.05, 1.05, X1].forEach(function (x) {
    shBox(scene, 0.08, 2.7, 0.1, 0x3b3b3b, x, Y, Z0, { r: 0.5, m: 0.3 });
  });
  shBox(scene, X1 - X0, 0.12, 0.14, 0x3b3b3b, (X0 + X1) / 2, H - 0.2, Z0, { r: 0.5, m: 0.3 });
  /* counter + espresso + pastry */
  shBox(scene, 3.4, 1.02, 0.8, 0x6e4e33, 3.4, Y, 15.4, { r: 0.7 });
  shBox(scene, 3.5, 0.06, 0.86, 0xd8c8ac, 3.4, Y + 1.02, 15.4, { r: 0.6 });
  shBox(scene, 0.6, 0.42, 0.42, 0x2b2b2b, 4.0, Y + 1.08, 15.2, { r: 0.4 });
  shBox(scene, 0.5, 0.22, 0.36, 0xbfc4c7, 4.0, Y + 1.5, 15.2, { r: 0.5 });
  shBox(scene, 0.7, 0.08, 0.45, 0xe9e4d8, 2.2, Y + 1.08, 15.2, { r: 0.6, cast: false });
  for (var c = 0; c < 4; c++) shCyl(scene, 0.04, 0.036, 0.1, 0xf7f2e6, 2.0 + c * 0.2, Y + 1.14, 15.25, { seg: 10, cast: false });
  shBox(scene, 1.4, 0.55, 0.55, 0xd8c8ac, 2.6, Y + 1.5, 16.9, { r: 0.7 }); /* menu board */
  var menu = signTex("\uC544\uBA54\uB9AC\uCE74\uB178 2,500\n\uCE74\uD398\uB77C\uB5BC 3,000\n\uBC14\uB2D0\uB77C 3,500", "#f7f3e8", "#2a1d15", 600, 420, 46);
  var mb = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.95), new THREE.MeshStandardMaterial({ map: menu, roughness: 0.8 }));
  mb.visible = false;
  /* tables + chairs */
  [
    [-3.2, 14.4],
    [-3.2, 16.2],
    [0.2, 16.5],
  ].forEach(function (t) {
    shCyl(scene, 0.42, 0.42, 0.05, 0xd8c8ac, t[0], Y + 0.78, t[1], { seg: 20, r: 0.6 });
    shCyl(scene, 0.03, 0.03, 0.76, 0x3b3b3b, t[0], Y + 0.04, t[1], { seg: 8 });
    shCyl(scene, 0.2, 0.2, 0.03, 0x3b3b3b, t[0], Y + 0.02, t[1], { seg: 12, cast: false });
    [
      [-0.55, 0],
      [0.55, 0],
    ].forEach(function (c) {
      shCyl(scene, 0.19, 0.19, 0.05, 0x8b6a46, t[0] + c[0], Y + 0.43, t[1], { seg: 14, r: 0.7 });
      shBox(scene, 0.36, 0.38, 0.04, 0x8b6a46, t[0] + c[0], Y + 0.46, t[1] - c[0] * 0.6, { r: 0.7 });
    });
    shCyl(scene, 0.05, 0.045, 0.08, 0xf7f2e6, t[0], Y + 0.84, t[1], { seg: 10, cast: false });
  });
  /* pendant lights */
  [-3.2, 0.2].forEach(function (x) {
    shCyl(scene, 0.008, 0.008, 0.7, 0x2b2b2b, x, Y + 2.35, 15.2, { seg: 6, cast: false });
    shBox(scene, 0.34, 0.16, 0.34, 0xe9a64d, x, Y + 2.15, 15.2, { r: 0.7 });
    var pl = new THREE.PointLight(0xffd9a0, 2.6, 4.5, 2);
    pl.position.set(x, Y + 2.0, 15.2);
    scene.add(pl);
  });
  /* ceiling lights */
  [
    [-2.4, 14.2],
    [1.8, 15.6],
  ].forEach(function (l) {
    shBox(scene, 0.9, 0.04, 0.3, new THREE.MeshStandardMaterial({ color: 0xfff8ee, emissive: 0xfff8ee, emissiveIntensity: 0.9 }), l[0], Y + 2.88, l[1], { cast: false });
    var pl = new THREE.PointLight(0xfff4e8, 3.2, 6.5, 2);
    pl.position.set(l[0], Y + 2.7, l[1]);
    scene.add(pl);
  });
  /* barista + guests */
  addPerson({ at: [3.4, 16.4], yaw: Math.PI, jacket: 0x2a1d15, pants: 0x111111, h: 1.7, hat: 0x2a1d15 });
  addPerson({ at: [-3.2, 15.4], yaw: Math.PI / 2, jacket: 0xb5483b, pants: 0x2b2b2b, h: 1.65 });
  addPerson({ at: [0.2, 15.6], yaw: -Math.PI / 2, jacket: 0x3d5a80, pants: 0x22262c, h: 1.78 });
  shFacePass();
  /* interactions */
  addInteract({
    pos: new THREE.Vector3(3.4, Y + 1.3, 14.6),
    r: 1.6,
    label: function () {
      return shTr("buy_coffee");
    },
    act: function () {
      shBuyStall("\uC544\uBA54\uB9AC\uCE74\uB178", "2,500", "\uB530\uB73B\uD55C \uCEE4\uD53C \uB098\uC654\uC2B5\uB2C8\uB2E4.");
    },
  });
  addInteract({
    pos: new THREE.Vector3(-3.2, Y + 0.9, 14.4),
    r: 1.3,
    label: function () {
      return shTr("sit_cafe");
    },
    act: function () {
      toast(shTr("sit_cafe_t"));
      sfx("click");
    },
  });
  /* colliders + door */
  addCol(X0 - 1, X0 + 0.1, 12.5, Z1, 0, 3.2);
  addCol(X1 - 0.1, X1 + 1, 12.5, Z1, 0, 3.2);
  addCol(X0, X1, Z1 - 0.1, Z1 + 0.2, 0, 3.2);
  addCol(-5.6, -1.05, 12.32, 12.7, 0, 4);
  addCol(1.05, 6.0, 12.32, 12.7, 0, 4);
  addCol(1.6, 5.2, 14.9, 15.9, Y, Y + 1.2);
})();
SH_T.sit_cafe = ["Sit by the window", "\uCC3D\uAC00 \uCABD\uC5D0 \uC549\uAE30", "\u5750\u5728\u7A97\u8FB9", "\u7A93\u969B\u306B\u5EA7\u308B"];
SH_T.sit_cafe_t = [
  "You take the window seat. Coffee is coming.",
  "\uCC3D\uAC00 \uC790\uB9AC\uC5D0 \uC549\uC558\uB2E4. \uCEE4\uD53C\uAC00 \uAE08\uBC29 \uB098\uC640\uC694.",
  "\u4F60\u5750\u5230\u4E86\u7A97\u8FB9\uFF0C\u5496\u5561\u5F88\u5FEB\u5C31\u6765\u3002",
  "\u7A93\u969B\u306E\u5E2D\u306B\u5EA7\u3063\u305F\u3002\u30B3\u30FC\u30D2\u30FC\u3092\u6301\u3063\u3066\u304D\u307E\u3059\u3002",
];

(function shChicken() {
  var X0 = 22.4,
    X1 = 34.0,
    Z0 = 12.66,
    Z1 = 17.2,
    Y = 0.12,
    H = 3.05;
  scene.updateMatrixWorld(true);
  var hide = [],
    HIDE = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    if (bb.max.x > X0 - 1 && bb.min.x < X1 + 1 && bb.max.z > 12.4 && bb.min.z < 12.9 && bb.min.y < 3.8 && bb.max.y > 0 && bb.max.z - bb.min.z < 3.2) hide.push(o);
    if (g.type === "BoxGeometry" && bb.max.y - bb.min.y > 6 && bb.max.x > X0 && bb.min.x < X1 && bb.min.z < 17.5 && bb.max.z > 17.1) HIDE.push(o);
  });
  hide.concat(HIDE).forEach(function (o) {
    o.visible = false;
  });
  shBox(scene, X1 - X0, 9.2, 0.22, 0xcfc8ba, (X0 + X1) / 2, 3.15, 12.54, { r: 0.95, cast: false });
  for (var row = 0; row < 4; row++)
    for (var col = 0; col < 4; col++) {
      var wx = X0 + 1.4 + col * 2.4,
        wy = 4.35 + row * 1.95;
      shBox(scene, 1.15, 1.35, 0.06, 0xe9e5da, wx, wy, 12.41, { r: 0.85, cast: false });
      shBox(scene, 1.0, 1.2, 0.02, 0x1d2b3d, wx, wy + 0.07, 12.37, { r: 0.4, cast: false });
    }
  box(X1 - X0, 0.02, Z1 - Z0, cm(0x6e4e33, 0.9), (X0 + X1) / 2, Y, (Z0 + Z1) / 2, { cast: false });
  box(X1 - X0, 0.06, Z1 - Z0, cm(0xc8bfae, 0.95), (X0 + X1) / 2, H, (Z0 + Z1) / 2, { cast: false });
  shBox(scene, 0.12, H, Z1 - Z0, 0xbfb4a2, X0, Y, (Z0 + Z1) / 2, { r: 0.9 });
  shBox(scene, 0.12, H, Z1 - Z0, 0xbfb4a2, X1, Y, (Z0 + Z1) / 2, { r: 0.9 });
  shBox(scene, X1 - X0, H, 0.12, 0xb5aa98, (X0 + X1) / 2, Y, Z1, { r: 0.9 });
  [
    [X0, 27.0],
    [29.0, X1],
  ].forEach(function (r) {
    shBox(scene, r[1] - r[0], 2.55, 0.03, new THREE.MeshStandardMaterial({ color: 0xd8e8ee, transparent: true, opacity: 0.16, roughness: 0.06, depthWrite: false }), (r[0] + r[1]) / 2, Y + 0.05, Z0, { cast: false });
  });
  [X0, 27, 29, X1].forEach(function (x) {
    shBox(scene, 0.08, 2.7, 0.1, 0x2b2b2b, x, Y, Z0, { r: 0.5, m: 0.3 });
  });
  /* tables, chicken + beer */
  [
    [24.5, 14.6],
    [24.5, 16.4],
    [31.6, 14.6],
    [31.6, 16.4],
  ].forEach(function (t) {
    shBox(scene, 0.9, 0.05, 0.9, 0xd8c8ac, t[0], Y + 0.76, t[1], { r: 0.7 });
    shCyl(scene, 0.035, 0.035, 0.76, 0x3b3b3b, t[0], Y + 0.02, t[1], { seg: 8 });
    shCyl(scene, 0.22, 0.22, 0.03, 0x3b3b3b, t[0], Y + 0.01, t[1], { seg: 12, cast: false });
    shBox(scene, 0.42, 0.06, 0.3, 0xe9e4d8, t[0], Y + 0.82, t[1], { r: 0.6, cast: false });
    for (var c = 0; c < 5; c++) shBox(scene, 0.07, 0.05, 0.06, 0xc98a3c, t[0] - 0.16 + c * 0.08, Y + 0.86, t[1] - 0.05, { r: 0.6, cast: false });
    shCyl(scene, 0.035, 0.035, 0.12, 0xe8d6a8, t[0] + 0.25, Y + 0.82, t[1] + 0.2, { seg: 8, cast: false });
    shCyl(scene, 0.035, 0.035, 0.12, 0xe8d6a8, t[0] - 0.1, Y + 0.82, t[1] + 0.28, { seg: 8, cast: false });
    [
      [-0.62, 0],
      [0.62, 0],
    ].forEach(function (s) {
      shCyl(scene, 0.19, 0.19, 0.05, 0x8b6a46, t[0] + s[0], Y + 0.43, t[1], { seg: 12, r: 0.7 });
    });
  });
  /* fryer counter + neon */
  shBox(scene, 3.2, 1.0, 0.75, 0x3a2a1e, 29.8, Y, 15.6, { r: 0.7 });
  shBox(scene, 3.3, 0.06, 0.8, 0xd8c8ac, 29.8, Y + 1.0, 15.6, { r: 0.6 });
  shBox(scene, 0.55, 0.4, 0.4, 0x8b9298, 30.6, Y + 1.06, 15.5, { r: 0.4 });
  shBox(scene, 0.5, 0.5, 0.45, 0x2b2b2b, 28.9, Y + 1.06, 15.5, { r: 0.4 });
  shBox(scene, 4.0, 0.5, 0.12, new THREE.MeshStandardMaterial({ color: 0xc0392b, emissive: 0xc0392b, emissiveIntensity: 1.1 }), 28.2, 2.55, 16.9, { cast: false });
  var neon = signTex("\uCE58\uD0A8 \u00B7 \uB9E5\uC8FC", "#FFF3D6", "#C0392B", 700, 140, 72);
  var nm = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.55), new THREE.MeshStandardMaterial({ map: neon, emissiveMap: neon, emissive: 0xffffff, emissiveIntensity: 1.0, roughness: 0.5 }));
  nm.position.set(28.2, 2.55, 16.82);
  nm.rotation.y = Math.PI;
  scene.add(nm);
  var pl = new THREE.PointLight(0xffd9a0, 3.4, 7.0, 2);
  pl.position.set(28.2, 2.5, 15.2);
  scene.add(pl);
  addPerson({ at: [29.8, 16.4], yaw: Math.PI, jacket: 0xe4572e, pants: 0x1f1f1f, h: 1.72, hat: 0xc0392b });
  addPerson({ at: [24.5, 15.4], yaw: Math.PI / 2, jacket: 0x2b4a63, h: 1.74 });
  addPerson({ at: [31.6, 15.4], yaw: -Math.PI / 2, jacket: 0x5b2a6a, h: 1.66, scarf: 0xe8d8c0 });
  shFacePass();
  addInteract({
    pos: new THREE.Vector3(29.8, Y + 1.3, 14.9),
    r: 1.7,
    label: function () {
      return shTr("order_chicken");
    },
    act: function () {
      shBuyStall("\uD6C4\uB77C\uC774\uB4DC \uCE58\uD0A8 + \uB9E5\uC8FC", "18,000", "\uCE58\uD0A8 \uD558\uB098, \uB9E5\uC8FC \uB450 \uBCD1 \uB4DC\uB9BD\uB2C8\uB2E4.");
    },
  });
  addCol(X0 - 1, X0 + 0.1, 12.5, Z1, 0, 3.2);
  addCol(X1 - 0.1, X1 + 1, 12.5, Z1, 0, 3.2);
  addCol(X0, X1, Z1 - 0.1, Z1 + 0.2, 0, 3.2);
  addCol(22.4, 27, 12.32, 12.7, 0, 4);
  addCol(29, 34, 12.32, 12.7, 0, 4);
})();
SH_T.order_chicken = ["Order chicken + beer", "\uCE58\uD0A8 \uC8FC\uBB38", "\u70B9\u70B8\u9E21+\u5564\u9152", "\u30C1\u30AD\u30F3\u3092\u6CE8\u6587"];
/* kill weather particles inside shops */
TICKERS.push(function () {
  var inside = P.z > 12.7;
  scene.traverse(function (o) {
    if (o.material && o.material.uniforms && o.material.uniforms.uAmt) o.visible = !inside;
  });
});

(function shBunsik() {
  var X0 = -43.6,
    X1 = -30.0,
    Z0 = 12.66,
    Z1 = 17.2,
    Y = 0.12,
    H = 3.05;
  scene.updateMatrixWorld(true);
  var hide = [],
    HIDE = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    if (bb.max.x > X0 - 1 && bb.min.x < X1 + 1 && bb.max.z > 12.4 && bb.min.z < 12.9 && bb.min.y < 3.8 && bb.max.y > 0 && bb.max.z - bb.min.z < 3.2) hide.push(o);
    if (g.type === "BoxGeometry" && bb.max.y - bb.min.y > 6 && bb.max.x > X0 && bb.min.x < X1 && bb.min.z < 17.5 && bb.max.z > 17.1) HIDE.push(o);
  });
  hide.concat(HIDE).forEach(function (o) {
    o.visible = false;
  });
  shBox(scene, X1 - X0, 9.2, 0.22, 0xcfc8ba, (X0 + X1) / 2, 3.15, 12.54, { r: 0.95, cast: false });
  box(X1 - X0, 0.02, Z1 - Z0, cm(0xb9b2a2, 0.9), (X0 + X1) / 2, Y, (Z0 + Z1) / 2, { cast: false });
  box(X1 - X0, 0.06, Z1 - Z0, cm(0xc8bfae, 0.95), (X0 + X1) / 2, H, (Z0 + Z1) / 2, { cast: false });
  shBox(scene, 0.12, H, Z1 - Z0, 0xb9b2a2, X0, Y, (Z0 + Z1) / 2, { r: 0.9 });
  shBox(scene, 0.12, H, Z1 - Z0, 0xb9b2a2, X1, Y, (Z0 + Z1) / 2, { r: 0.9 });
  shBox(scene, X1 - X0, H, 0.12, 0xada392, (X0 + X1) / 2, Y, Z1, { r: 0.9 });
  var cx = (X0 + X1) / 2;
  [
    [X0, cx - 1.4],
    [cx + 1.4, X1],
  ].forEach(function (r) {
    shBox(scene, r[1] - r[0], 2.55, 0.03, new THREE.MeshStandardMaterial({ color: 0xd8e8ee, transparent: true, opacity: 0.15, roughness: 0.06, depthWrite: false }), (r[0] + r[1]) / 2, Y + 0.05, Z0, { cast: false });
  });
  [X0, cx - 1.4, cx + 1.4, X1].forEach(function (x) {
    shBox(scene, 0.08, 2.7, 0.1, 0x2b2b2b, x, Y, Z0, { r: 0.5, m: 0.3 });
  });
  shBox(scene, X1 - X0, 0.12, 0.14, 0x2b2b2b, cx, H - 0.2, Z0, { r: 0.5, m: 0.3 });
  /* stainless counter + pots + stools */
  shBox(scene, 7.0, 1.0, 0.8, 0x9aa0a4, cx, Y, 15.6, { r: 0.3, m: 0.4 });
  shBox(scene, 7.1, 0.06, 0.86, 0xdde2e4, cx, Y + 1.0, 15.6, { r: 0.3, m: 0.4 });
  [
    [cx - 1.9, 0xe4572e],
    [cx - 0.4, 0x6b3a22],
    [cx + 1.2, 0xe4572e],
  ].forEach(function (p) {
    shCyl(scene, 0.3, 0.28, 0.24, 0x2b2b2b, p[0], Y + 1.06, 15.55, { seg: 16, r: 0.6 });
    shCyl(scene, 0.27, 0.27, 0.04, p[1], p[0], Y + 1.24, 15.55, { seg: 16, r: 0.8 });
  });
  for (var i = 0; i < 5; i++) {
    shCyl(scene, 0.17, 0.17, 0.05, 0xc0392b, cx - 2.4 + i * 0.9, Y + 0.52, 14.3, { seg: 12, r: 0.7 });
    shCyl(scene, 0.025, 0.025, 0.5, 0x3b3b3b, cx - 2.4 + i * 0.9, Y + 0.02, 14.3, { seg: 6 });
  }
  /* menu + steam + vendor */
  var mt = signTex("\uBD84\uC2DD", "#FFF6E0", "#C0392B", 400, 300, 120);
  var mm = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.8), new THREE.MeshStandardMaterial({ map: mt, roughness: 0.8 }));
  mm.position.set(cx, 2.2, Z1 - 0.09);
  mm.rotation.y = Math.PI;
  scene.add(mm);
  [
    [cx - 3.4, 14.2],
    [cx + 3.4, 14.2],
  ].forEach(function (l) {
    shBox(scene, 1.2, 0.04, 0.3, new THREE.MeshStandardMaterial({ color: 0xfff8ee, emissive: 0xfff8ee, emissiveIntensity: 0.9 }), l[0], Y + 2.88, l[1], { cast: false });
    var lp = new THREE.PointLight(0xfff2dc, 3.0, 6.5, 2);
    lp.position.set(l[0], Y + 2.7, l[1]);
    scene.add(lp);
  });
  addPerson({ at: [cx, Y + 0.12, 16.5], yaw: Math.PI, jacket: 0xc0392b, pants: 0x2b2b2b, h: 1.66, hat: 0xe4572e });
  addPerson({ at: [cx - 2.4, Y + 0.12, 14.3], yaw: Math.PI / 2, jacket: 0x2b4a63, h: 1.72 });
  addPerson({ at: [cx + 2.4, Y + 0.12, 14.3], yaw: -Math.PI / 2, jacket: 0x8a5a2b, h: 1.62 });
  shFacePass();
  addInteract({
    pos: new THREE.Vector3(cx, Y + 1.3, 14.9),
    r: 1.8,
    label: function () {
      return shTr("buy_stall");
    },
    act: function () {
      shBuyStall("\uB5A1\uBCF6\uC774 \uD55C \uCEE5", "3,500", "\uB5A1\uBCF6\uC774 \uD55C \uCEE5, \uB610 \uC8FC\uC138\uC694.");
    },
  });
  var pl = new THREE.PointLight(0xfff2d8, 2.6, 6.5, 2);
  pl.position.set(cx, Y + 2.6, 15.4);
  scene.add(pl);
  addCol(cx - 3.5, cx + 3.5, 15.15, 16.05, Y, Y + 1.2);
  addCol(X0 - 1, X0 + 0.1, 12.5, Z1, 0, 3.2);
  addCol(X1 - 0.1, X1 + 1, 12.5, Z1, 0, 3.2);
  addCol(X0, X1, Z1 - 0.1, Z1 + 0.2, 0, 3.2);
  addCol(X0, cx - 1.4, 12.32, 12.7, 0, 4);
  addCol(cx + 1.4, X1, 12.32, 12.7, 0, 4);
})();
/* face indoor NPCs toward the street door */
(function shFaceFront() {
  PEOPLE.forEach(function (p) {
    if (!p.g) return;
    if (p.g.position.z > 12.9) {
      p.g.rotation.y = Math.PI;
      if (p.umb) p.umb.visible = false;
    }
  });
})();

(function shAllShops() {
  var Y = 0.12,
    H = 3.05,
    Z0 = 12.66,
    Z1 = 17.0;
  var list = [
    [-60, -44, "\uC138\uD0C1\uC18C", "#1f5ea8"],
    [-29.6, -18, "\uC57D\uAD6D", "#1d8a4c"],
    [-17.6, -6, "\uBBF8\uC6A9\uC2E4", "#6b4a9c"],
    [34.4, 46, "\uBD80\uB3D9\uC0B0", "#2d6e66"],
    [46.4, 60, "\uACE0\uAE43\uC9D1", "#8c2a22"],
  ];
  function shell(x0, x1, accent, name, theme) {
    var cx = (x0 + x1) / 2;
    var hide = [],
      big = [];
    scene.traverse(function (o) {
      if (!o.isMesh || !o.geometry) return;
      var g = o.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
      if (bb.max.x > x0 - 1 && bb.min.x < x1 + 1 && bb.max.z > 12.4 && bb.min.z < 12.9 && bb.min.y < 3.8 && bb.max.y > 0 && bb.max.z - bb.min.z < 3.2) hide.push(o);
      if (g.type === "BoxGeometry" && bb.max.y - bb.min.y > 6 && bb.max.x > x0 && bb.min.x < x1 && bb.min.z < 17.4 && bb.max.z > 17.0) big.push(o);
    });
    hide.concat(big).forEach(function (o) {
      o.visible = false;
    });
    shBox(scene, x1 - x0, 9.2, 0.22, 0xcfc8ba, cx, 3.15, 12.54, { r: 0.95, cast: false });
    box(x1 - x0, 0.02, Z1 - Z0, cm(theme === "salon" ? 0x9a7a5a : 0xb9b2a2, 0.9), cx, Y, (Z0 + Z1) / 2, { cast: false });
    box(x1 - x0, 0.06, Z1 - Z0, cm(0xc8bfae, 0.95), cx, H, (Z0 + Z1) / 2, { cast: false });
    shBox(scene, 0.12, H, Z1 - Z0, 0xb9b2a2, x0, Y, (Z0 + Z1) / 2, { r: 0.9 });
    shBox(scene, 0.12, H, Z1 - Z0, 0xb9b2a2, x1, Y, (Z0 + Z1) / 2, { r: 0.9 });
    shBox(scene, x1 - x0, H, 0.12, 0xada392, cx, Y, Z1, { r: 0.9 });
    var d0 = cx - 1.4,
      d1 = cx + 1.4;
    [
      [x0, d0],
      [d1, x1],
    ].forEach(function (r) {
      shBox(scene, r[1] - r[0], 2.55, 0.03, new THREE.MeshStandardMaterial({ color: 0xd8e8ee, transparent: true, opacity: 0.16, roughness: 0.06, depthWrite: false }), (r[0] + r[1]) / 2, Y + 0.05, Z0, { cast: false });
    });
    [x0, d0, d1, x1].forEach(function (x) {
      shBox(scene, 0.08, 2.7, 0.1, 0x2b2b2b, x, Y, Z0, { r: 0.5, m: 0.3 });
    });
    shBox(scene, x1 - x0, 0.12, 0.14, 0x2b2b2b, cx, H - 0.2, Z0, { r: 0.5, m: 0.3 });
    var t = signTex(name, "#fff", accent, 600, 180, 84);
    var sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.7), new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 0.4, roughness: 0.7 }));
    sg.position.set(cx, 2.45, Z1 - 0.08);
    sg.rotation.y = Math.PI;
    scene.add(sg);
    /* counter + lights + two tables */
    shBox(scene, 2.6, 0.95, 0.7, 0x8b6a46, cx + 2.4, Y, 15.6, { r: 0.7 });
    shBox(scene, 2.7, 0.05, 0.76, 0xd8c8ac, cx + 2.4, Y + 0.95, 15.6, { r: 0.6 });
    [
      [cx - 2.6, 14.4],
      [cx - 2.6, 16.2],
    ].forEach(function (p) {
      shBox(scene, 0.8, 0.05, 0.8, 0xd8c8ac, p[0], Y + 0.74, p[1], { r: 0.7 });
      shCyl(scene, 0.03, 0.03, 0.74, 0x3b3b3b, p[0], Y + 0.02, p[1], { seg: 8 });
      shBox(scene, 0.4, 0.35, 0.04, 0x8b6a46, p[0], Y + 0.45, p[1] - 0.45, { r: 0.7 });
      shBox(scene, 0.4, 0.35, 0.04, 0x8b6a46, p[0], Y + 0.45, p[1] + 0.45, { r: 0.7 });
    });
    [
      [cx - 2.4, 14.6],
      [cx + 2.0, 15.2],
    ].forEach(function (l) {
      var pl = new THREE.PointLight(0xfff4e6, 9, 8, 2);
      pl.position.set(l[0], 2.7, l[1]);
      scene.add(pl);
      shBox(scene, 1.4, 0.03, 0.3, new THREE.MeshStandardMaterial({ color: 0xfff8ee, emissive: 0xfff8ee, emissiveIntensity: 0.9 }), l[0], 2.9, l[1], { cast: false });
    });
    /* theme props */
    if (theme === "laundry") {
      for (var i = 0; i < 4; i++) {
        shBox(scene, 0.75, 1.0, 0.7, 0xf0eee8, x0 + 1.0 + i * 0.95, Y, Z1 - 0.6, { r: 0.5 });
        shCyl(scene, 0.22, 0.22, 0.03, 0x2b4a63, x0 + 1.0 + i * 0.95, Y + 0.55, Z1 - 0.98, { seg: 18, cast: false }).rotation.x = Math.PI / 2;
      }
    } else if (theme === "pharmacy") {
      for (var pj = 0; pj < 3; pj++) shBox(scene, 1.6, 1.8, 0.35, 0xf4f2ec, x0 + 1.2 + pj * 1.9, Y, Z1 - 0.55, { r: 0.7 });
      shBox(scene, 0.5, 0.5, 0.1, new THREE.MeshStandardMaterial({ color: 0x2f8a4c, emissive: 0x2f8a4c, emissiveIntensity: 0.6 }), cx, 2.8, Z0 - 0.04, { cast: false });
    } else if (theme === "salon") {
      for (var k = 0; k < 3; k++) {
        var mir = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.2), new THREE.MeshStandardMaterial({ color: 0xdfe9ee, metalness: 0.6, roughness: 0.1 }));
        mir.position.set(x0 + 1.6 + k * 1.7, 1.6, Z1 - 0.1);
        mir.rotation.y = Math.PI;
        scene.add(mir);
        shBox(scene, 0.55, 0.1, 0.55, 0x2b2b2b, x0 + 1.6 + k * 1.7, Y + 0.5, Z1 - 0.7, { r: 0.6 });
      }
    } else if (theme === "realestate") {
      shBox(scene, 1.6, 1.2, 0.05, 0xd8c8ac, x0 + 1.4, 1.2, Z1 - 0.12, { r: 0.7 });
      for (var m = 0; m < 6; m++) shBox(scene, 0.22, 0.3, 0.01, 0xffffff, x0 + 0.9 + (m % 3) * 0.45, 1.45 - Math.floor(m / 3) * 0.38, Z1 - 0.16, { r: 0.8, cast: false });
    } else {
      for (var b = 0; b < 3; b++) {
        shBox(scene, 0.7, 0.06, 0.5, 0x2b2b2b, x0 + 1.5 + b * 1.6, Y + 0.75, Z1 - 1.1, { r: 0.6 });
        for (var bq = 0; bq < 4; bq++) shBox(scene, 0.05, 0.04, 0.05, 0xe8e4d8, x0 + 1.5 + b * 1.6 - 0.2 + (bq % 2) * 0.2, Y + 0.8, Z1 - 1.1 - 0.1 + Math.floor(bq / 2) * 0.15, { r: 0.5, cast: false });
        shCyl(scene, 0.08, 0.08, 1.2, 0x9aa0a4, x0 + 1.5 + b * 1.6, Y + 1.9, Z1 - 1.1, { seg: 8, cast: false });
      }
    }
    addPerson({ at: [cx + 2.4, Y + 0.12, 16.4], yaw: Math.PI, jacket: accent, pants: 0x2b2b2b, h: 1.7 });
    addPerson({ at: [cx - 2.6, Y + 0.12, 15.2], yaw: Math.PI / 2, jacket: 0x3d5a80, h: 1.66 });
    addInteract({
      pos: new THREE.Vector3(cx + 2.4, Y + 1.2, 14.8),
      r: 1.6,
      label: function () {
        return shTr("talk");
      },
      act: function () {
        toast(name);
        ttsSay("\uC5B4\uC11C \uC624\uC138\uC694.");
      },
    });
    addCol(x0 - 1, x0 + 0.1, 12.5, Z1, 0, 3.2);
    addCol(x1 - 0.1, x1 + 1, 12.5, Z1, 0, 3.2);
    addCol(x0, x1, Z1 - 0.1, Z1 + 0.2, 0, 3.2);
    addCol(x0, d0, 12.32, 12.7, 0, 4);
    addCol(d1, x1, 12.32, 12.7, 0, 4);
  }
  list.forEach(function (s) {
    shell(s[0], s[1], s[3], s[2], s[3] === 0x1f5ea8 ? "laundry" : s[0] === -29.6 ? "pharmacy" : s[0] === -17.6 ? "salon" : s[0] === 34.4 ? "realestate" : "bbq");
  });
  shFacePass();
})();

(function shClearStoreDoor() {
  scene.updateMatrixWorld(true);
  var hide = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    var cx = (bb.min.x + bb.max.x) / 2,
      cz = (bb.min.z + bb.max.z) / 2;
    if (cx > 11.2 && cx < 15.2 && cz > 9.6 && cz < 12.35 && bb.max.y < 2.2) hide.push(o);
  });
  hide.forEach(function (o) {
    o.visible = false;
  });
  /* drop colliders that cover the shop volume or the approach */
  var C = __seoul.COLS || [];
  for (var i = C.length - 1; i >= 0; i--) {
    var c = C[i];
    var inStore = c.x0 >= 6 && c.x1 <= 22.5 && c.z0 >= 12.5;
    var inPath = c.x1 > 11.8 && c.x0 < 14.8 && c.z1 > 9.8 && c.z0 < 12.45;
    if (inStore || inPath) C.splice(i, 1);
  }
})();

(function shFixEntrances() {
  scene.updateMatrixWorld(true);
  var hide = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    var cx = (bb.min.x + bb.max.x) / 2,
      cz = (bb.min.z + bb.max.z) / 2;
    /* tree trunk + canopy right in front of 7-Eleven door */
    if (cx > 12.2 && cx < 14.4 && cz > 9.2 && cz < 12.15) hide.push(o);
    /* railings / benches in front of cafe door */
    if (cx > -1.9 && cx < 1.9 && cz > 9.2 && cz < 12.35 && bb.max.y < 2.2) hide.push(o);
  });
  hide.forEach(function (o) {
    o.visible = false;
  });
  var C = __seoul.COLS || [];
  for (var i = C.length - 1; i >= 0; i--) {
    var c = C[i];
    /* building-mass colliders (hidden meshes, huge vertical extent) */
    if (c.y1 > 6 && c.z0 > 12.3) {
      C.splice(i, 1);
      continue;
    }
    /* approach paths to cafe + store */
    if (c.z0 > 9.0 && c.z1 < 12.6 && c.y1 < 5 && ((c.x1 > 11.6 && c.x0 < 14.8) || (c.x1 > -2.2 && c.x0 < 2.2))) C.splice(i, 1);
  }
})();
TICKERS.push(function () {
  var inside = P.z > 12.7;
  scene.traverse(function (o) {
    if ((o.isPoints || o.isLineSegments || o.isLine) && o.geometry && o.geometry.attributes && o.geometry.attributes.position && o.geometry.attributes.position.count > 40) o.visible = !inside;
  });
});
(function shOpenAllDoors() {
  var doors = [
    [-1.05, 1.05],
    [27.0, 29.0],
    [-38.4, -35.2],
    [12.25, 14.15],
  ];
  var C = __seoul.COLS || [];
  for (var i = C.length - 1; i >= 0; i--) {
    var c = C[i];
    for (var d = 0; d < doors.length; d++) {
      var a = doors[d][0],
        b = doors[d][1];
      if (c.x1 > a && c.x0 < b && c.z0 > 11.4 && c.z1 < 13.4) {
        C.splice(i, 1);
        break;
      }
    }
  }
  scene.updateMatrixWorld(true);
  var hide = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    var cx = (bb.min.x + bb.max.x) / 2,
      cz = (bb.min.z + bb.max.z) / 2;
    for (var d = 0; d < doors.length; d++) {
      if (cx > doors[d][0] - 0.8 && cx < doors[d][1] + 0.8 && cz > 9.0 && cz < 12.6 && bb.max.y < 2.4) {
        hide.push(o);
        break;
      }
    }
  });
  hide.forEach(function (o) {
    o.visible = false;
  });
})();
(function shIndoorWeather() {
  /* inside a shop the sky is forced clear, but the player's weather choice is remembered and applied on exit */
  var wasIn = null,
    wanted = null;
  var realSet = setWeather;
  setWeather = function (w) {
    if (wasIn) {
      wanted = w;
      sfx("click");
      return;
    }
    realSet(w);
  };
  TICKERS.push(function () {
    var inside = P.z > 12.7;
    if (inside === wasIn) return;
    wasIn = inside;
    if (inside) {
      wanted = __seoul.WX.target;
      __seoul.WX.target = "clear";
    } else if (wanted) {
      __seoul.WX.target = wanted;
      wanted = null;
    }
  });
})();

(function shShopLights() {
  var spots = [
    [14.6, 15.0, 4],
    [3.4, 15.0, 4],
    [-3.2, 15.0, 4],
    [28.0, 15.0, 4],
    [-36.8, 15.0, 4],
  ];
  spots.forEach(function (s) {
    for (var i = 0; i < 2; i++) {
      var pl = new THREE.PointLight(0xfff4e6, 7.5, 8.5, 2);
      pl.position.set(s[0] + (i ? 2.2 : -2.2), 2.75, s[1] + (i ? 0.8 : -0.8));
      scene.add(pl);
      shBox(scene, 1.6, 0.03, 0.28, new THREE.MeshStandardMaterial({ color: 0xfff8ee, emissive: 0xfff8ee, emissiveIntensity: 0.9 }), s[0] + (i ? 2.2 : -2.2), 2.92, s[1] + (i ? 0.8 : -0.8), { cast: false });
    }
  });
})();

(function shKoreanSkyline() {
  scene.updateMatrixWorld(true);
  var kill = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    var cz = (bb.min.z + bb.max.z) / 2;
    /* only the near shop row, above the shopfront, leaving signs + interiors */
    if (bb.min.y > 3.12 && bb.min.z > 12.3 && bb.max.z < 21.5 && cz < 20.0 && bb.max.x > -70 && bb.min.x < 70) kill.push(o);
  });
  kill.forEach(function (o) {
    o.visible = false;
  });
  /* low parapet + rooftop gardens along the shop row */
  for (var x = -58; x <= 58; x += 4) {
    shBox(scene, 3.9, 0.16, 0.3, 0xb9ae9c, x, 3.18, 12.62, { r: 0.9, cast: false });
  }
})();

(function shAwnings() {
  scene.updateMatrixWorld(true);
  var hide = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    if (bb.min.z > 11.4 && bb.max.z < 12.35 && bb.min.y > 2.4 && bb.max.y < 3.0 && bb.max.x - bb.min.x > 3) hide.push(o);
  });
  hide.forEach(function (o) {
    o.visible = false;
  });
  var shops = [
    [-60, -44, "\uC138\uD0C1", "#F2E8D5"],
    [-43.6, -30, "\uBD84\uC2DD", "#E4572E"],
    [-29.6, -18, "\uC57D\uAD6D", "#3E7D5A"],
    [-17.6, -6, "\uBBF8\uC6A9\uC2E4", "#8A6AA8"],
    [-5.6, 6, "\uCE74\uD398", "#E8D8BE"],
    [6.4, 22, "24\uC2DC", "#1B4FA3"],
    [22.4, 34, "\uCE58\uD0A8", "#C0392B"],
    [34.4, 46, "\uBD80\uB3D9\uC0B0", "#2D6E66"],
    [46.4, 60, "\uACE0\uAE43\uC9D1", "#8C2A22"],
  ];
  shops.forEach(function (s) {
    var x0 = s[0],
      x1 = s[1],
      cx = (x0 + x1) / 2,
      w = x1 - x0 - 1.6;
    if (w < 2) return;
    /* deep fabric awning with scalloped edge */
    var aw = shBox(scene, w, 0.06, 1.15, s[3], cx, 2.62, 12.25, { r: 0.9 });
    aw.rotation.x = -0.1;
    for (var k = 0; k < Math.floor(w / 0.45); k++) shBox(scene, 0.44, 0.1, 0.02, 0xf7f0e4, cx - w / 2 + 0.22 + k * 0.45, 2.56, 11.68, { r: 0.8, cast: false });
    /* slim vertical sign at one edge */
    var t = signTex(s[2], "#FFF8EA", s[3], 180, 620, 64);
    var sign = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 1.15), new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 0.55, roughness: 0.6 }));
    sign.position.set(cx + w / 2 - 0.25, 3.35, 12.3);
    scene.add(sign);
    /* warm sconce under awning */
    sph(0.035, new THREE.MeshStandardMaterial({ color: 0xffe8c0, emissive: 0xffcf8a, emissiveIntensity: 1.5 }), cx - w / 2 + 0.6, 2.5, 11.9, { seg: 8 });
    var pl = new THREE.PointLight(0xffd9a0, 1.8, 3.2, 2);
    pl.position.set(cx - w / 2 + 0.6, 2.44, 11.8);
    scene.add(pl);
  });
})();

(function shStreetDetail() {
  var shops = [
    [-60, -44, "#1f5ea8"],
    [-43.6, -30, "#C0392B"],
    [-29.6, -18, "#1d8a4c"],
    [-17.6, -6, "#6b4a9c"],
    [-5.6, 6, "#E8D8BE"],
    [6.4, 22, "#1b4fa3"],
    [22.4, 34, "#C0392B"],
    [34.4, 46, "#2D6E66"],
    [46.4, 60, "#8C2A22"],
  ];
  shops.forEach(function (s) {
    var x0 = s[0],
      x1 = s[1],
      cx = (x0 + x1) / 2,
      w = Math.min(x1 - x0 - 2, 10);
    if (w < 3) return;
    /* one low upper storey with small warm windows */
    shBox(scene, w, 1.25, 0.5, 0xcfc6b6, cx, 3.2, 12.62, { r: 0.9, cast: false });
    shBox(scene, w + 0.2, 0.12, 0.62, 0xb5aa98, cx, 4.45, 12.62, { r: 0.9, cast: false });
    for (var wx = cx - w / 2 + 1.0; wx < cx + w / 2 - 0.6; wx += 2.0) {
      shBox(scene, 0.9, 0.72, 0.05, 0x25303a, wx, 3.55, 12.36, { r: 0.5, cast: false });
      shBox(scene, 0.82, 0.64, 0.02, new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffc978, emissiveIntensity: 0.55 }), wx, 3.59, 12.33, { cast: false });
      shBox(scene, 0.02, 0.64, 0.02, 0xcfc6b6, wx, 3.59, 12.32, { r: 0.6, cast: false });
    }
    /* A-frame menu board on the pavement */
    var bx = cx - 1.0,
      bz = 11.95;
    var ax = shBox(scene, 0.52, 0.72, 0.05, 0x2b2b2b, bx, 0.12, bz, { r: 0.6 });
    ax.rotation.x = -0.18;
    var tx = signTex("\uC601\uC5C5\uC911", "#FFF8EA", "#2a1d15", 300, 420, 54);
    var bd = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.58), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.8 }));
    bd.position.set(bx, 0.48, bz - 0.04);
    bd.rotation.x = -0.18;
    scene.add(bd);
  });
})();
(function shSecondFloor() {
  var shops = [
    [-60, -44],
    [-43.6, -30],
    [-29.6, -18],
    [-17.6, -6],
    [-5.6, 6],
    [6.4, 22],
    [22.4, 34],
    [34.4, 46],
    [46.4, 60],
  ];
  shops.forEach(function (s, idx) {
    var x0 = s[0],
      x1 = s[1],
      cx = (x0 + x1) / 2,
      w = Math.min(x1 - x0 - 2, 10);
    if (w < 3) return;
    /* window sills + small planter boxes */
    for (var wx = cx - w / 2 + 1.0; wx < cx + w / 2 - 0.6; wx += 2.0) {
      shBox(scene, 1.0, 0.06, 0.18, 0xe8e1d2, wx, 3.47, 12.33, { r: 0.8, cast: false });
      if (((wx * 10) | 0) % 2 === 0) {
        shBox(scene, 0.5, 0.18, 0.16, 0x9a6a44, wx, 3.52, 12.3, { r: 0.8 });
        for (var p = 0; p < 3; p++) shBox(scene, 0.015, 0.18, 0.015, 0x4f7a34, wx - 0.14 + p * 0.14, 3.68, 12.3, { r: 0.7, cast: false });
      }
    }
    /* AC units + downlights */
    shBox(scene, 0.5, 0.36, 0.26, 0xe9e6de, cx + w / 2 - 1.4, 3.95, 12.28, { r: 0.6 });
    shBox(scene, 0.4, 0.28, 0.02, 0x9aa0a4, cx + w / 2 - 1.4, 3.99, 12.14, { r: 0.5, cast: false });
    sph(0.035, new THREE.MeshStandardMaterial({ color: 0xffe8c8, emissive: 0xffd49a, emissiveIntensity: 1.2 }), cx - w / 2 + 0.5, 4.32, 12.3, { seg: 8 });
    /* thin 2F sign band per shop */
    var t = signTex(idx % 2 ? "2F" : "\uC0AC\uBB34\uC2E4", "#FFF8EA", "#2B2B2B", 300, 120, 54);
    var sb = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.35), new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 0.2, roughness: 0.8 }));
    sb.position.set(cx - w / 2 + 0.9, 4.06, 12.3);
    scene.add(sb);
  });
})();

(function shSkyClean() {
  scene.updateMatrixWorld(true);
  var kill = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    var w = bb.max.x - bb.min.x,
      d = bb.max.z - bb.min.z;
    var low = bb.min.y;
    if (low < 2.2) return;
    /* floating slabs / leftover roofs crossing the shop row */
    if (bb.min.z < 21.0 && bb.max.z > 12.4 && low > 3.4 && (w > 7 || d > 7)) {
      kill.push(o);
      return;
    }
    /* any thin plate hovering directly above the street */
    if (low > 5 && bb.min.z < 20 && bb.max.z > 12.4 && bb.max.y - bb.min.y < 1.2) {
      kill.push(o);
    }
  });
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    if (bb.min.y > 4.0 && bb.max.y < 5.2 && bb.min.z > 12.0 && bb.max.z < 12.9 && bb.max.x - bb.min.x < 5) kill.push(o);
  });
  kill.forEach(function (o) {
    o.visible = false;
  });
})();

(function shFloatClean() {
  scene.updateMatrixWorld(true);
  var kill = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    /* anything hovering over the low street, except the far skyline */
    if (bb.min.y > 4.15 && bb.min.z < 21.2 && bb.max.z > 12.15 && bb.max.y < 16) kill.push(o);
  });
  kill.forEach(function (o) {
    o.visible = false;
  });
})();

(function shSingleStorey() {
  scene.updateMatrixWorld(true);
  var kill = [];
  scene.traverse(function (o) {
    var g = o.geometry;
    if (!g) return;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    var cz = (bb.min.z + bb.max.z) / 2;
    /* second-floor band, windows, sills, planters, AC */
    if (bb.min.y > 3.3 && cz > 12.0 && cz < 13.6 && bb.max.x - bb.min.x < 12) {
      kill.push(o);
      return;
    }
    /* all wires/lines above the shopfront */
    if ((o.isLine || o.isLineSegments) && bb.min.y > 3.8) kill.push(o);
    if (bb.min.y > 3.35 && bb.min.z > 11.5 && bb.max.z < 21.5 && bb.max.x - bb.min.x > 1.2) kill.push(o);
  });
  kill.forEach(function (o) {
    o.visible = false;
  });
})();

(function shBeamClean() {
  scene.updateMatrixWorld(true);
  var kill = [];
  scene.traverse(function (o) {
    if (!o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    var w = bb.max.x - bb.min.x,
      d = bb.max.z - bb.min.z,
      h = bb.max.y - bb.min.y;
    /* all wires/lines */
    if (o.isLine || o.isLineSegments || o.type === "Line" || o.type === "LineSegments") {
      kill.push(o);
      return;
    }
    /* long, thin floating beams over the street block (not the house) */
    if (bb.min.y > 2.6 && bb.min.z > 8.0 && (w > 7 || d > 7) && h < 0.9) kill.push(o);
  });
  kill.forEach(function (o) {
    o.visible = false;
  });
})();

(function shWallClean() {
  scene.updateMatrixWorld(true);
  var kill = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    var h = bb.max.y - bb.min.y;
    /* tall blank facade slabs left over above the single-storey shops */
    if (h > 4 && bb.min.y > 2.8 && bb.min.y < 3.5 && bb.min.z > 12.2 && bb.max.z < 13.1) kill.push(o);
  });
  kill.forEach(function (o) {
    o.visible = false;
  });
})();

(function shInteriorLife() {
  /* cafe: trays, cups, tissues, coat on chair */
  function cup(x, y, z) {
    shCyl(scene, 0.035, 0.03, 0.08, 0xf7f2e6, x, y, z, { seg: 10, cast: false });
  }
  [
    [-3.2, 14.4],
    [-3.2, 16.2],
    [0.2, 16.5],
  ].forEach(function (t) {
    shBox(scene, 0.35, 0.015, 0.26, 0x3b3b3b, t[0] + 0.12, 1.03, t[1] + 0.05, { r: 0.5, cast: false });
    cup(t[0] + 0.16, 1.04, t[1] + 0.02);
    cup(t[0] + 0.22, 1.04, t[1] + 0.12);
    shBox(scene, 0.16, 0.08, 0.12, 0xe9e4d8, t[0] - 0.15, 1.03, t[1] + 0.1, { r: 0.7, cast: false });
  });
  shBox(scene, 0.06, 0.42, 0.24, 0x8a2b2b, 3.4, 1.3, 15.1, { r: 0.8, cast: false });
  /* bunsik: steel bowls, tissue box, side dishes */
  var bx = -36.8;
  for (var i = 0; i < 4; i++) {
    shCyl(scene, 0.12, 0.1, 0.06, 0xdde2e4, bx - 2.2 + i * 0.5, 1.1, 14.4, { seg: 14, cast: false });
    shCyl(scene, 0.035, 0.03, 0.1, 0xf7f2e6, bx - 2.2 + i * 0.5, 1.16, 14.55, { seg: 10, cast: false });
  }
  shBox(scene, 0.22, 0.1, 0.13, 0xf2e8d5, bx - 2.6, 1.1, 14.85, { r: 0.7 });
  /* chicken: beer bottles + tissue + ashtray */
  [
    [24.5, 14.6],
    [31.6, 16.4],
  ].forEach(function (t) {
    shCyl(scene, 0.04, 0.04, 0.24, 0x2e5b2e, t[0] + 0.2, 1.0, t[1] + 0.18, { seg: 10, cast: false });
    shBox(scene, 0.16, 0.08, 0.12, 0xe9e4d8, t[0] - 0.18, 1.0, t[1] + 0.12, { r: 0.7, cast: false });
  });
})();

(function shCeilings() {
  scene.updateMatrixWorld(true);
  var ceilings = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    var w = bb.max.x - bb.min.x,
      d = bb.max.z - bb.min.z,
      cy = (bb.min.y + bb.max.y) / 2;
    if (cy > 2.85 && cy < 3.2 && w > 4 && d > 2.2 && bb.min.z > 12.4) ceilings.push(o);
  });
  ceilings.forEach(function (o) {
    o.material = new THREE.MeshStandardMaterial({ color: 0xede6d8, emissive: 0x8a7a62, emissiveIntensity: 0.18, roughness: 0.9 });
  });
  /* slim cream eave along each shopfront */
  for (var x = -58; x < 60; x += 4) {
    shBox(scene, 3.95, 0.08, 0.75, 0xe6decd, x, 2.95, 12.28, { r: 0.85, cast: false });
  }
})();

(function shPerf() {
  var S = scene,
    pls = [];
  S.traverse(function (o) {
    if (o.isPointLight) pls.push(o);
  });
  /* keep the 6 strongest/most useful lights, drop the rest */
  pls.sort(function (a, b) {
    return b.intensity * b.distance - a.intensity * a.distance;
  });
  pls.slice(6).forEach(function (l) {
    if (l.position && l.position.z > 12 && l.parent) l.parent.remove(l);
  });
  pls.slice(0, 6).forEach(function (l) {
    l.castShadow = false;
    l.distance = Math.min(l.distance || 12, 14);
  });
})();

(function shProducts() {
  function lab(txt, bg, fg, w, h, x, y, z, ry) {
    var t = signTex(txt, fg, bg, Math.round(w * 500), Math.round(h * 500), Math.round(h * 330));
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t }));
    m.position.set(x, y, z);
    m.rotation.y = Math.PI;
    m.scale.set(1.15, 1.15, 1);
    scene.add(m);
    return m;
  }
  /* 7-Eleven centre table: banana milk, soju, cup ramen, triangle kimbap, chips */
  var bx = 13.2,
    bz = 15.7,
    ty = 1.02;
  shBox(scene, 0.09, 0.16, 0.09, 0xf2d24a, bx - 0.7, ty, bz - 0.1, { r: 0.7, cast: false });
  lab("BANANA", "#F2D24A", "#5a3a12", 0.08, 0.05, bx - 0.7, ty + 0.09, bz - 0.055, 0);
  shCyl(scene, 0.028, 0.035, 0.24, 0x2f6b3a, bx - 0.5, ty, bz + 0.22, { seg: 10, cast: false });
  lab("SOJU", "#2f6b3a", "#fff", 0.06, 0.04, bx - 0.5, ty + 0.16, bz + 0.255, 0);
  shCyl(scene, 0.065, 0.06, 0.12, 0xf7f2e6, bx + 0.45, ty, bz - 0.15, { seg: 14, cast: false });
  shCyl(scene, 0.067, 0.067, 0.015, 0xe4572e, bx + 0.45, ty + 0.12, bz - 0.15, { seg: 14, cast: false });
  lab("CUP\nRAMEN", "#E4572E", "#fff", 0.11, 0.08, bx + 0.45, ty + 0.065, bz - 0.21, 0);
  var tri = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.09, 0.05, 3), cm(0x1e3b2a, 0.7));
  tri.position.set(bx + 0.72, ty + 0.025, bz + 0.1);
  tri.rotation.x = Math.PI / 2;
  scene.add(tri);
  lab("KIMBAP", "#1e3b2a", "#fff", 0.1, 0.04, bx + 0.72, ty + 0.05, bz + 0.15, 0);
  shBox(scene, 0.14, 0.18, 0.03, 0xe0a21a, bx - 0.15, ty, bz - 0.3, { r: 0.7, cast: false });
  lab("CHIPS", "#E0A21A", "#5a2a10", 0.12, 0.06, bx - 0.15, ty + 0.09, bz - 0.28, 0);
  /* hot warmer: hotdog + buns */
  shCyl(scene, 0.028, 0.028, 0.22, 0xb5522e, 16.1, 1.02, 13.42, { seg: 10, cast: false }).rotation.z = Math.PI / 2;
  shBox(scene, 0.16, 0.09, 0.1, 0xe8c07a, 16.55, 1.0, 13.42, { r: 0.8, cast: false });
  lab("HOT DOG", "#C0392B", "#fff", 0.3, 0.07, 16.4, 1.32, 13.2, 0);
  /* cafe: croissant, cake, cups */
  [
    [-3.2, 14.4],
    [-3.2, 16.2],
  ].forEach(function (t, i) {
    var y = 1.0;
    var cr = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.09, 0.045, 3), cm(0xc98a3c, 0.8));
    cr.position.set(t[0] - 0.1, y + 0.04, t[1] + 0.05);
    cr.rotation.z = Math.PI / 2;
    scene.add(cr);
    shBox(scene, 0.14, 0.09, 0.14, 0xf2e3c8, t[0] + 0.18, y, t[1] - 0.05, { r: 0.8, cast: false });
    shBox(scene, 0.14, 0.02, 0.14, 0xd9a0a8, t[0] + 0.18, y + 0.09, t[1] - 0.05, { r: 0.8, cast: false });
    lab(i ? "CAKE" : "CROISSANT", "#F7F2E6", "#6a4a2c", 0.4, 0.08, t[0], y + 0.18, t[1] - 0.2, 0);
  });
  /* chicken: fried pieces, radish, beer */
  [
    [24.5, 14.6],
    [31.6, 16.4],
  ].forEach(function (t) {
    var y = 0.82;
    for (var k = 0; k < 5; k++) shBox(scene, 0.08, 0.06, 0.07, 0xc98a3c, t[0] - 0.15 + k * 0.08, y + 0.04, t[1] - 0.05, { r: 0.7, cast: false });
    shCyl(scene, 0.05, 0.045, 0.05, 0xf2e3c8, t[0] + 0.22, y + 0.02, t[1] + 0.12, { seg: 10, cast: false });
    lab("CHICKEN", "#C0392B", "#fff", 0.55, 0.08, t[0], y + 0.24, t[1] + 0.25, 0);
    shCyl(scene, 0.03, 0.03, 0.2, 0x2e5b2e, t[0] - 0.25, y + 0.02, t[1] + 0.22, { seg: 8, cast: false });
  });
  /* bunsik: tteokbokki pot, fishcake skewers, kimbap */
  var tx = -36.8;
  shCyl(scene, 0.28, 0.26, 0.12, 0xb3311f, tx - 1.0, 1.06, 15.55, { seg: 18, cast: false });
  for (var r = 0; r < 8; r++) shCyl(scene, 0.025, 0.025, 0.09, 0xe4572e, tx - 1.18 + Math.random() * 0.36, 1.18, 15.4 + Math.random() * 0.3, { seg: 8, cast: false });
  for (var f = 0; f < 4; f++) {
    shCyl(scene, 0.008, 0.008, 0.4, 0x9a7b4a, tx + 0.5 + f * 0.1, 1.06, 15.4, { seg: 6, cast: false });
    shBox(scene, 0.06, 0.12, 0.02, 0xe9d9ae, tx + 0.5 + f * 0.1, 1.3, 15.4, { r: 0.7, cast: false });
  }
  for (var kb = 0; kb < 3; kb++) {
    var km = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 12), cm(0x1e3b2a, 0.8));
    km.rotation.z = Math.PI / 2;
    km.position.set(tx + 0.15 + kb * 0.14, 1.1, 15.7);
    scene.add(km);
  }
  lab("TTEOKBOKKI", "#B3311F", "#fff", 0.5, 0.08, tx - 1.0, 1.36, 15.3, 0);
  /* hide the big green PICK endcap blocking the centre table */
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    var cx = (bb.min.x + bb.max.x) / 2,
      cz = (bb.min.z + bb.max.z) / 2,
      cy = (bb.min.y + bb.max.y) / 2;
    if (cx > 12.5 && cx < 13.9 && cz > 15.8 && cz < 16.5 && cy > 1.0 && cy < 2.1) o.visible = false;
  });
  var l1 = new THREE.PointLight(0xfff4e6, 4.5, 9, 2);
  l1.position.set(13.2, 2.6, 15.0);
  scene.add(l1);
  var l2 = new THREE.PointLight(0xffe8c8, 3.0, 7, 2);
  l2.position.set(-2.5, 2.6, 15.0);
  scene.add(l2);
})();

(function shSurfaceProps() {
  scene.updateMatrixWorld(true);
  var tops = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    var g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    var bb = g.boundingBox;
    if (!bb) return;
    var e = o.matrixWorld.elements,
      mn = [1e9, 1e9, 1e9],
      mx = [-1e9, -1e9, -1e9];
    [bb.min.x, bb.max.x].forEach(function (x) {
      [bb.min.y, bb.max.y].forEach(function (y) {
        [bb.min.z, bb.max.z].forEach(function (z) {
          var wx = e[0] * x + e[4] * y + e[8] * z + e[12],
            wy = e[1] * x + e[5] * y + e[9] * z + e[13],
            wz = e[2] * x + e[6] * y + e[10] * z + e[14];
          mn[0] = Math.min(mn[0], wx);
          mn[1] = Math.min(mn[1], wy);
          mn[2] = Math.min(mn[2], wz);
          mx[0] = Math.max(mx[0], wx);
          mx[1] = Math.max(mx[1], wy);
          mx[2] = Math.max(mx[2], wz);
        });
      });
    });
    var w = mx[0] - mn[0],
      d = mx[2] - mn[2],
      top = mx[1],
      cx = (mn[0] + mx[0]) / 2,
      cz = (mn[2] + mx[2]) / 2;
    if (top > 0.7 && top < 1.3 && w > 0.45 && w < 3.6 && d > 0.35 && d < 1.2 && cz > 13 && cz < 17.2 && mx[1] - mn[1] < 0.25) tops.push({ x: cx, z: cz, y: top, w: w, d: d });
  });
  /* de-duplicate near-identical tops */
  var use = [];
  tops.sort(function (a, b) {
    return a.z - b.z;
  });
  tops.forEach(function (t) {
    for (var i = 0; i < use.length; i++) {
      if (Math.abs(use[i].x - t.x) < 0.4 && Math.abs(use[i].z - t.z) < 0.4) return;
    }
    use.push(t);
  });
  use = use.slice(0, 14);
  function cup(x, y, z) {
    shCyl(scene, 0.07, 0.062, 0.012, 0xede8de, x, y, z, { seg: 14, cast: false });
    shCyl(scene, 0.04, 0.035, 0.055, 0xf7f2e6, x, y + 0.012, z, { seg: 12, cast: false });
  }
  function bowl(x, y, z) {
    shCyl(scene, 0.07, 0.048, 0.05, 0xf4efe4, x, y, z, { seg: 14, cast: false });
    shCyl(scene, 0.014, 0.014, 0.11, 0xe9e4d8, x + 0.09, y, z, { seg: 6, cast: false });
  }
  function bottle(x, y, z) {
    shCyl(scene, 0.03, 0.035, 0.18, 0x2f6b3a, x, y, z, { seg: 10, cast: false });
    shCyl(scene, 0.012, 0.012, 0.05, 0x2f6b3a, x, y + 0.18, z, { seg: 8, cast: false });
  }
  use.forEach(function (t, i) {
    var x = t.x,
      z = t.z,
      y = t.y + 0.004;
    if (t.w > 1.2) {
      cup(x - 0.25, y, z);
      bowl(x + 0.15, y, z);
      if (i % 2) bottle(x + 0.42, y, z);
    } else {
      cup(x - 0.1, y, z);
      if (i % 3 === 0) bowl(x + 0.14, y, z);
    }
  });
  window.__surfaceTops = use.length;
})();

(function () {
  if (typeof shFacePass === "function") shFacePass();
})();

(function shReplaceCrowd() {
  var palette = [
    { coat: 0x1e2b45, inner: 0x101418, pants: 0x23272e, style: "part", hair: 0x15100c },
    { coat: 0xb08a5a, inner: 0xf2ede1, pants: 0x3b4a63, style: "part", hair: 0x2a1d14 },
    { coat: 0x6b6b66, inner: 0x3a3a38, pants: 0x2f2f30, style: "gray", hair: 0x6b6560 },
    { coat: 0xc9b39b, inner: 0xf4eee3, pants: 0x4a3b32, style: "long", hair: 0x3a2318 },
    { coat: 0x2a2a2e, inner: 0x111111, pants: 0x1e2b3a, style: "bob", hair: 0x161210 },
    { coat: 0x3e5a47, inner: 0xe8e2d4, pants: 0x2b2b2b, style: "beanie", hair: 0x1b1712 },
  ];
  var pairs = [];
  PEOPLE.forEach(function (p, i) {
    var g = p.g;
    if (!g) return;
    var o = palette[i % palette.length];
    var h = shHero(g.position.x, g.position.z, g.rotation.y, {
      h: 1.66 + ((i * 7) % 12) * 0.012,
      coat: o.coat,
      inner: o.inner,
      pants: o.pants,
      style: o.style,
      hair: o.hair,
      shoe: 0xede8de,
    });
    g.visible = false;
    var legs = [],
      arms = [];
    h.traverse(function (o) {
      if (!o.isMesh || !o.geometry) return;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      var bb = o.geometry.boundingBox,
        hh = bb.max.y - bb.min.y;
      if (hh > 0.4 && o.position.y < 0.9 && Math.abs(o.position.x) < 0.22) legs.push({ o: o, bz: o.position.z });
      else if (hh > 0.3 && o.position.y > 0.85 && Math.abs(o.position.x) > 0.16) arms.push({ o: o, bz: o.position.z });
    });
    pairs.push({ g: g, h: h, legs: legs, arms: arms, ph: i * 1.7 });
  });
  if (TICKERS)
    TICKERS.push(function () {
      for (var i = 0; i < pairs.length; i++) {
        var a = pairs[i];
        var t = performance.now() * 0.001;
        a.h.position.set(a.g.position.x, a.g.position.y + 0.03 + Math.abs(Math.sin(t * 5.5 + i)) * 0.022, a.g.position.z);
        a.h.rotation.y = a.g.rotation.y + Math.PI / 2;
        a.h.rotation.z = Math.sin(t * 5.5 + i) * 0.018;
        var sw = Math.sin(t * 6 + a.ph) * 0.08;
        if (a.legs[0]) a.legs[0].o.position.z = a.legs[0].bz + sw;
        if (a.legs[1]) a.legs[1].o.position.z = a.legs[1].bz - sw;
        if (a.arms[0]) a.arms[0].o.position.z = a.arms[0].bz - sw * 0.7;
        if (a.arms[1]) a.arms[1].o.position.z = a.arms[1].bz + sw * 0.7;
      }
    });
})();

(function () {
  [-38, -22, -8, 8, 22, 36, 48].forEach(function (x) {
    var l = new THREE.PointLight(0xffe3c0, 5.0, 13, 2);
    l.position.set(x, 2.65, 15.3);
    scene.add(l);
  });
  var s = new THREE.PointLight(0xfff2dd, 3.2, 20, 2);
  s.position.set(0, 4.2, 6);
  scene.add(s);
  var h1 = new THREE.PointLight(0xffe8d0, 0, 16, 2);
  h1.position.set(0, 2.6, -1.0);
  scene.add(h1);
  var h2 = new THREE.PointLight(0xffe8d0, 0, 10, 2);
  h2.position.set(0, 2.2, 9.5);
  scene.add(h2);
  var h3 = new THREE.PointLight(0xffe8d0, 0, 18, 2);
  h3.position.set(-2.2, 2.55, -6.5);
  scene.add(h3);
  var h4 = new THREE.PointLight(0xffe8d0, 0, 18, 2);
  h4.position.set(2.2, 2.55, -8.5);
  scene.add(h4);
  window.__houseLamps = [h1, h2, h3, h4];
})();

(function () {
  var lamps = window.__houseLamps || [];
  var on = false;
  function apply(v) {
    lamps.forEach(function (l) {
      l.intensity = v ? 7.0 : 0;
    });
  }
  var c = null;
  (window.__seoul.INTERACT || []).forEach(function (x) {
    try {
      var t = typeof x.label === "function" ? x.label() : x.label;
      if (String(t).indexOf("一楼开关灯") >= 0) c = x;
    } catch (e) {}
  });
  if (c) {
    var orig = c.act;
    c.act = function () {
      if (orig) orig();
      on = !on;
      apply(on);
      toast(on ? "1층 불 켜짐" : "1층 불 꺼짐");
    };
  }
  window.__setHouseLamp = function (v) {
    on = !!v;
    apply(on);
  };
})();

(function () {
  if (document.getElementById("duskbtn")) return;
  var st = document.createElement("style");
  st.textContent =
    "#wx button:not(.on){background:#1b2430cc!important;color:#fff!important;border-color:#ffffff44!important}#wx button.on{background:#f0b45a!important;color:#241a10!important;border-color:#fff!important}";
  document.head.appendChild(st);
  var b = document.createElement("button");
  b.id = "duskbtn";
  b.type = "button";
  b.title = "Dusk";
  b.setAttribute("aria-label", "Dusk");
  b.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17a6 6 0 0 1 12 0"/><path d="M2 17h20M12 6v3M4.5 10l2 2M19.5 10l-2 2"/></svg>';
  b.className = "ic";
  document.getElementById("wx").appendChild(b);
  var tex = ctex(64, 512, function (g, w, h) {
    var gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#2a2a4f");
    gr.addColorStop(0.4, "#6a4a72");
    gr.addColorStop(0.7, "#c06a6e");
    gr.addColorStop(0.9, "#ff9e6b");
    gr.addColorStop(1, "#ffd2a6");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });
  var dome = new THREE.Mesh(new THREE.IcosahedronGeometry(180, 3), new THREE.MeshBasicMaterial({ map: tex, side: 2, transparent: true, opacity: 0.7, depthWrite: false, fog: false, depthTest: true }));
  dome.visible = false;
  scene.add(dome);
  function set(on) {
    dome.visible = on;
    b.style.background = on ? "#f0b45a" : "#1b2430cc";
    b.style.color = on ? "#241a10" : "#fff";
  }
  b.addEventListener("click", function (e) {
    e.stopPropagation();
    set(!dome.visible);
  });
  addEventListener(
    "keyup",
    function (e) {
      if (e.code === "Digit5") {
        set(!dome.visible);
        return;
      }
      if (/^Digit[1-4]$/.test(e.code)) set(false);
    },
    true,
  );
  var wx = document.getElementById("wx");
  function one(i) {
    var bs = [...wx.querySelectorAll("button")];
    bs.forEach(function (x, k) {
      x.setAttribute("aria-pressed", k === i ? "true" : "false");
      x.classList.toggle("on", k === i);
    });
  }
  var target = 0;
  wx.addEventListener(
    "click",
    function (e) {
      set(false);
      var t = e.target.closest("button");
      if (t) {
        var i = [...wx.querySelectorAll("button")].indexOf(t);
        target = i;
        setTimeout(function () {
          one(i);
        }, 40);
      }
    },
    true,
  );
  setInterval(function () {
    var on = [...wx.querySelectorAll("button")].filter(function (x) {
      return x.getAttribute("aria-pressed") === "true";
    });
    if (on.length > 1) one(target);
  }, 300);
  addEventListener(
    "keyup",
    function (e) {
      var m = /^Digit([1-4])$/.exec(e.code);
      if (m) {
        target = +m[1] - 1;
        setTimeout(function () {
          one(target);
        }, 0);
        setTimeout(function () {
          one(target);
        }, 220);
      }
    },
    true,
  );
})();
