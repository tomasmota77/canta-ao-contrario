(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const MAX_SECONDS = 15;
  const SITE = "tomasmota77.github.io/canta-ao-contrario";
  const CAP = window.Capacitor;
  const NATIVE = !!(CAP && CAP.isNativePlatform && CAP.isNativePlatform());
  const PLUG = (CAP && CAP.Plugins) || {};
  const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  /* ---------- línguas ---------- */
  const I18N = window.I18N, PH = window.PH, LANGS = window.LANGS;
  let LANG = "pt";
  function t(key, vars) {
    let str = (I18N[LANG] && I18N[LANG][key]) || I18N.pt[key] || key;
    if (vars) for (const k in vars) str = str.split("{" + k + "}").join(String(vars[k]));
    return str;
  }
  function detectLang() {
    const saved = store.get("cac-lang");
    if (saved && I18N[saved]) return saved;
    const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    for (const raw of list) {
      const l = String(raw).toLowerCase();
      if (l === "pt-br") return "pt-BR";
      const base = l.split("-")[0];
      if (I18N[base]) return base;
    }
    return "en";
  }
  function applyStatic() {
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    document.title = t("docTitle");
    root.lang = LANG;
    const L = LANGS.find((x) => x[0] === LANG);
    $("lang-code").textContent = L ? L[1] : LANG.toUpperCase();
    $("privacy-link").href = "privacy.html?lang=" + encodeURIComponent(LANG);
  }
  function setLang(code, quiet) {
    LANG = I18N[code] ? code : "en";
    store.set("cac-lang", LANG);
    PHRASES = PH[LANG] || PH.en;
    pIdx = 0;
    applyStatic();
    if (!quiet) { if (S.mode) render(); if (!$("setup").hidden) renderSetup(); }
  }
  function openLangSheet() {
    const list = $("langlist"); list.innerHTML = "";
    LANGS.forEach(([code, , name]) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "micopt"; b.textContent = name;
      b.setAttribute("aria-pressed", String(code === LANG));
      b.addEventListener("click", () => { sfx("tap"); setLang(code); $("langsheet").hidden = true; });
      list.append(b);
    });
    $("langsheet").hidden = false;
  }

  const ICON = {
    rec: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="currentColor"/></svg>',
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" fill="currentColor"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5.2v13.6a1 1 0 0 1-1.5.86l-11-6.8a1 1 0 0 1 0-1.72l11-6.8A1 1 0 0 1 16 5.2z" fill="currentColor"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    retry: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4.5H9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    yes: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    no: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>',
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',
    people: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.4" fill="currentColor"/><path d="M2.5 19.5c.6-3.6 3.2-5.6 6.5-5.6s5.9 2 6.5 5.6" fill="currentColor"/><circle cx="17" cy="9" r="2.7" fill="currentColor" opacity=".55"/><path d="M15.8 14.2c2.9-.3 5.2 1.4 5.7 4.8h-4.4" fill="currentColor" opacity=".55"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4l8 7v8.5a.5.5 0 0 1-.5.5H15v-6H9v6H4.5a.5.5 0 0 1-.5-.5z" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  };
  const PLAYER_COLORS = ["#FF5B2E", "#7C78FF", "#FFE14A", "#3DDC97", "#FF8FC7", "#4CC9F0", "#B79CFF", "#FFA24C"];

  let PHRASES = [];
  let pIdx = 0;
  const reverseText = (s) => Array.from(s).reverse().join("").toLowerCase().replace(/^./, (c) => c.toUpperCase());

  /* ---------- estado ---------- */
  // Sozinho: 1 gravar, 2 ouvir ao contrário, 3 imitar, 4 resultado
  // Adivinha: 1 gravar, 2 passar, 3 ouvir, 4 imitar, 5 adivinhar, 6 revelar, 7 fim
  const S = { mode: null, step: 1, score: null, orig: null, origrev: null, imit: null, result: null, players: [], round: 0, rpp: Number(store.get("cac-rpp")) || 1, revealing: false };

  function buzz(ms) {
    if (NATIVE && PLUG.Haptics) { try { PLUG.Haptics.impact({ style: (ms || 8) > 15 ? "MEDIUM" : "LIGHT" }); } catch (e) {} return; }
    try { navigator.vibrate && navigator.vibrate(ms || 8); } catch (e) {}
  }
  let toastT = 0;
  function toast(msg, ms) {
    const el = $("toast"); el.textContent = msg; el.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, ms || 4000);
  }

  /* ---------- áudio ---------- */
  let ctx = null, analyser = null, freq = null;
  function audio() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = ctx.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.75;
      freq = new Uint8Array(analyser.frequencyBinCount);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function decode(arr) {
    const c = audio();
    return new Promise((res, rej) => { const p = c.decodeAudioData(arr, res, rej); if (p && p.then) p.then(res, rej); });
  }
  // Mistura para mono, corta o silêncio no início e no fim e normaliza o volume.
  function toMono(buf) {
    const len = Math.min(buf.length, Math.floor(buf.sampleRate * MAX_SECONDS));
    let out = new Float32Array(len);
    for (let ch = 0; ch < buf.numberOfChannels; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) out[i] += d[i] / buf.numberOfChannels; }
    let peak = 0; for (let i = 0; i < len; i++) { const a = Math.abs(out[i]); if (a > peak) peak = a; }
    if (peak > 0.01) {
      const rate = buf.sampleRate, win = Math.round(rate * 0.02), thr = peak * 0.08;
      let first = -1, last = -1;
      for (let s = 0; s + win <= len; s += win) {
        let m = 0; for (let i = s; i < s + win; i++) { const a = Math.abs(out[i]); if (a > m) m = a; }
        if (m > thr) { if (first < 0) first = s; last = s + win; }
      }
      if (first >= 0) {
        const pad = Math.round(rate * 0.12);
        const a = Math.max(0, first - pad), z = Math.min(len, last + pad);
        if (z - a > rate * 0.3) out = out.slice(a, z);
      }
      const g = 0.95 / peak; for (let i = 0; i < out.length; i++) out[i] *= g;
    }
    return { data: out, rate: buf.sampleRate, peak };
  }
  function reversed(c) { const n = c.data.length, r = new Float32Array(n); for (let i = 0; i < n; i++) r[i] = c.data[n - 1 - i]; return { data: r, rate: c.rate }; }
  function toBuffer(clip) { const c = audio(); const b = c.createBuffer(1, clip.data.length, clip.rate); b.getChannelData(0).set(clip.data); return b; }

  /* ---------- efeitos sonoros ---------- */
  let soundOn = store.get("cac-sound") !== "0";
  let noiseBuf = null;
  function tone(f, at, dur, type, gain, f2) {
    const c = audio(), o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, at);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, at + dur);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain || 0.08, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(c.destination); o.start(at); o.stop(at + dur + 0.05);
  }
  function noise(at, dur, gain, freqHz, type) {
    const c = audio();
    if (!noiseBuf) { noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = noiseBuf; f.type = type || "bandpass"; f.frequency.value = freqHz || 1000;
    g.gain.setValueAtTime(gain, at); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(at); s.stop(at + dur + 0.05);
  }
  function sfx(name) {
    if (!soundOn || rec) return;
    const c = audio(), n = c.currentTime + 0.01;
    if (name === "tap") tone(1100, n, 0.05, "sine", 0.035, 1500);
    if (name === "go") { tone(520, n, 0.09, "triangle", 0.06, 780); tone(780, n + 0.07, 0.1, "triangle", 0.05, 1040); }
    if (name === "drum") {
      const N = 26;
      for (let i = 0; i < N; i++) { const at = n + 1.3 * (1 - Math.pow(1 - i / N, 1.7)); noise(at, 0.06, 0.1 + i * 0.008, 650 + i * 12); }
      noise(n + 1.38, 0.9, 0.22, 5000, "highpass"); tone(120, n + 1.36, 0.45, "sine", 0.3, 55);
    }
    if (name === "win") [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, n + i * 0.08, 0.25, "triangle", 0.08));
    if (name === "lose") { tone(392, n, 0.2, "sawtooth", 0.03, 370); tone(311, n + 0.22, 0.45, "sawtooth", 0.03, 233); }
    if (name === "fanfare") [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, n + i * 0.11, i === 6 ? 0.7 : 0.22, "triangle", 0.09));
  }

  /* ---------- confettis ---------- */
  let confettiRun = 0;
  function confetti(count) {
    if (reduceMotion) return;
    const cv = $("confetti"), dpr = window.devicePixelRatio || 1, W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.hidden = false;
    const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = ["#FF5B2E", "#2E2BF5", "#FFE14A", "#FFFFFF", "#3DDC97", "#FF8FC7"];
    const ps = [];
    for (let i = 0; i < (count || 140); i++) {
      ps.push({ x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.45, vx: (Math.random() - 0.5) * 14, vy: -6 - Math.random() * 12,
        w: 6 + Math.random() * 6, h: 10 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[i % cols.length] });
    }
    const id = ++confettiRun, t0 = performance.now();
    const frame = (now) => {
      if (id !== confettiRun) return;
      const el = (now - t0) / 1000;
      g.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - Math.max(0, el - 2) / 1);
        g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2))); g.restore();
      }
      if (el < 3) requestAnimationFrame(frame); else { g.clearRect(0, 0, W, H); cv.hidden = true; }
    };
    requestAnimationFrame(frame);
  }

  /* ---------- anel animado ---------- */
  let ringMode = "idle", ringProgress = 0;
  function drawRing() {
    const cv = $("ring"), dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const g = cv.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const fg = getComputedStyle(root).getPropertyValue("--fg").trim() || "#000";
    const cx = W / 2, cy = H / 2, r0 = W * 0.27;
    g.strokeStyle = fg; g.lineCap = "round";
    if (ringMode !== "idle" && analyser) {
      analyser.getByteFrequencyData(freq);
      const N = 56;
      g.lineWidth = 3.2;
      for (let i = 0; i < N; i++) {
        const k = (i * 11) % N, bin = 2 + Math.floor((k < N / 2 ? k : N - 1 - k) * 1.6);
        const v = freq[bin] / 255, a = (i / N) * Math.PI * 2 - Math.PI / 2, len = 3 + v * W * 0.17;
        g.globalAlpha = 0.35 + v * 0.65;
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * (r0 + 10), cy + Math.sin(a) * (r0 + 10));
        g.lineTo(cx + Math.cos(a) * (r0 + 10 + len), cy + Math.sin(a) * (r0 + 10 + len));
        g.stroke();
      }
      g.globalAlpha = 1; g.lineWidth = 3;
      g.beginPath(); g.arc(cx, cy, r0 + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringProgress); g.stroke();
    }
    g.globalAlpha = 0.18; g.lineWidth = 3;
    g.beginPath(); g.arc(cx, cy, r0 + 3, 0, Math.PI * 2); g.stroke();
    g.globalAlpha = 1;
  }
  function loop() { drawRing(); if (ringMode !== "idle") requestAnimationFrame(loop); }
  function ringStart(mode) { const was = ringMode; ringMode = mode; $("app").classList.remove("idle"); if (was === "idle") requestAnimationFrame(loop); }
  function ringStop() { ringMode = "idle"; ringProgress = 0; $("app").classList.add("idle"); drawRing(); }

  /* ---------- reprodução ---------- */
  let slow = store.get("cac-slow") === "1";
  let playing = null;
  function stopPlay() {
    if (!playing) return;
    const p = playing; playing = null;
    try { p.src.onended = null; p.src.stop(); } catch (e) {}
    clearInterval(p.timer);
    ringStop(); render();
  }
  function play(key) {
    const same = playing && playing.key === key;
    stopPlay(); if (same) return;
    const clip = S[key]; if (!clip) return;
    buzz();
    const c = audio();
    const b = toBuffer(clip);
    const src = c.createBufferSource(); src.buffer = b;
    const rate = key === "origrev" && slow ? 0.75 : 1;
    src.playbackRate.value = rate;
    src.connect(analyser); analyser.connect(c.destination);
    const t0 = c.currentTime + 0.02, D = b.duration / rate;
    const p = { key, src, timer: 0 };
    playing = p;
    p.timer = setInterval(() => { ringProgress = Math.min(1, Math.max(0, (c.currentTime - t0) / D)); }, 30);
    src.onended = () => { if (playing === p) { try { analyser.disconnect(); } catch (e) {} stopPlay(); } };
    src.start(t0);
    ringStart("play"); render();
  }

  /* ---------- gravação ---------- */
  const pol = document.permissionsPolicy || document.featurePolicy;
  let micOK = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  try { if (micOK && pol && pol.allowsFeature && !pol.allowsFeature("microphone")) micOK = false; } catch (e) {}

  // Explica o microfone antes do pedido do sistema (só na primeira vez).
  async function ensureMicIntro() {
    if (store.get("cac-mic-intro") === "1") return true;
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const st = await navigator.permissions.query({ name: "microphone" });
        if (st.state === "granted") { store.set("cac-mic-intro", "1"); return true; }
      }
    } catch (e) {}
    return new Promise((res) => {
      const wrap = $("micintro"), ok = $("micintro-ok");
      wrap.hidden = false; ok.focus();
      const done = (v) => { wrap.hidden = true; ok.onclick = null; wrap.onclick = null; if (v) store.set("cac-mic-intro", "1"); res(v); };
      ok.onclick = () => done(true);
      wrap.onclick = (e) => { if (e.target === wrap) done(false); };
    });
  }

  let rec = null;
  async function toggleMic() {
    if (rec) { if (rec.mr.state === "recording") rec.mr.stop(); return; }
    stopPlay(); audio();
    if (!(await ensureMicIntro())) return;
    buzz(12);
    let stream;
    try { stream = await openMic(); }
    catch (e) { micOK = false; render(); toast(t("noMic"), 6000); return; }
    let mr;
    try { mr = new MediaRecorder(stream); } catch (e) { stream.getTracks().forEach((tr) => tr.stop()); micOK = false; render(); return; }
    try { analyser.disconnect(); } catch (e) {}
    const node = ctx.createMediaStreamSource(stream); node.connect(analyser);
    const chunks = [], t0 = performance.now();
    rec = { mr, timer: 0 };
    rec.timer = setInterval(() => {
      const s = (performance.now() - t0) / 1000;
      ringProgress = s / MAX_SECONDS;
      $("hint").textContent = "0:" + String(Math.floor(s)).padStart(2, "0");
      if (s >= MAX_SECONDS && mr.state === "recording") mr.stop();
    }, 100);
    mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    mr.onstop = () => {
      clearInterval(rec.timer); rec = null;
      stream.getTracks().forEach((tr) => tr.stop());
      try { node.disconnect(); } catch (e) {}
      ringStop();
      ingest(new Blob(chunks, { type: mr.mimeType || "audio/webm" }));
    };
    mr.start();
    ringStart("rec"); render();
    $("hint").textContent = "0:00";
  }

  async function ingest(blob) {
    stopPlay();
    const slot = S.step === 1 ? "orig" : "imit";
    try {
      const clip = toMono(await decode(await blob.arrayBuffer()));
      if (clip.data.length < clip.rate * 0.3) throw new Error("short");
      if (!(blob instanceof File) && clip.peak < 0.02) { render(); toast(t("heardNothing"), 5000); openMicSheet(); return; }
      buzz(20);
      if (slot === "orig") {
        S.orig = clip; S.origrev = reversed(clip); S.imit = S.result = null; S.score = null;
        if (S.mode === "duo") { go(2); sfx("go"); return; }
        go(2); setTimeout(() => { if (S.step === 2) play("origrev"); }, 450);
      } else if (S.mode === "duo") {
        S.imit = clip; S.result = reversed(clip);
        go(5); setTimeout(() => { if (S.step === 5) play("result"); }, 450);
      } else {
        S.imit = clip; S.result = reversed(clip);
        let n = 0; try { n = window.CAC_similarity(S.orig, S.result); } catch (e) {}
        S.score = n; go(4); countUp(n); saveBest(n);
        if (n >= 70) { sfx("win"); confetti(n >= 85 ? 180 : 90); }
        setTimeout(() => { if (S.step === 4) play("result"); }, 900);
      }
    } catch (e) {
      render();
      toast(e && e.message === "short" ? t("tooShort") : t("cantRead"));
    }
  }

  /* ---------- botões ---------- */
  function bigButton(kind, label, onClick) {
    const file = kind === "rec" && !micOK;
    const el = document.createElement(file ? "label" : "button");
    if (!file) el.type = "button";
    el.className = "big"; el.setAttribute("aria-label", label);
    el.innerHTML = ICON[kind];
    if (file) {
      const inp = document.createElement("input");
      inp.type = "file"; inp.accept = "audio/*"; inp.id = "rec-file"; inp.setAttribute("aria-label", label);
      inp.addEventListener("click", () => { stopPlay(); audio(); buzz(); });
      inp.addEventListener("change", () => { const f = inp.files && inp.files[0]; inp.value = ""; if (f) ingest(f); });
      el.append(inp);
    } else el.addEventListener("click", onClick);
    return el;
  }
  function mini(icon, label, onClick, on) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "mini" + (on ? " on" : "");
    b.innerHTML = '<span class="disc">' + ICON[icon] + "</span><span></span>";
    b.lastChild.textContent = label;
    b.addEventListener("click", () => { sfx("tap"); onClick(); });
    return b;
  }

  /* ---------- render ---------- */
  const VERDICT = (n) => t(n >= 85 ? "v5" : n >= 70 ? "v4" : n >= 55 ? "v3" : n >= 40 ? "v2" : "v1");
  let lastPhraseMode = "fwd";
  function go(step) { S.step = step; buzz(); render(); }

  const THEME = { rec: "#FF5B2E", listen: "#2E2BF5", result: "#FFE14A", dark: "#170A05" };
  function setPhase(ph) {
    root.dataset.phase = ph;
    try { document.querySelector('meta[name="theme-color"]').content = THEME[ph]; } catch (e) {}
    if (NATIVE && PLUG.StatusBar) { try { PLUG.StatusBar.setStyle({ style: ph === "listen" || ph === "dark" ? "DARK" : "LIGHT" }); } catch (e) {} }
  }
  const isPlaying = (k) => playing && playing.key === k;
  const pName = (i) => (S.players[i] && S.players[i].name) || t("player", { n: i + 1 });
  const totalRounds = () => S.players.length * S.rpp;

  function render() {
    if (!S.mode) return;
    const duo = S.mode === "duo", st = S.step;
    const phase = duo ? { 1: "rec", 2: "dark", 3: "listen", 4: "rec", 5: "result", 6: "dark", 7: "result" }[st] : { 1: "rec", 2: "listen", 3: "rec", 4: "result" }[st];
    setPhase(phase);
    const dots = $("dots");
    if (!duo) {
      if (dots.children.length !== 4) dots.innerHTML = "<i></i>".repeat(4);
      dots.querySelectorAll("i").forEach((d, i) => { d.className = i + 1 === st ? "now" : i + 1 < st ? "done" : ""; });
    }
    $("dots").hidden = duo; $("tally").hidden = !duo || st === 7;
    if (duo) $("tally").innerHTML = "<small>" + t("round") + "</small>" + Math.min(S.round + 1, totalRounds()) + "<i>/</i>" + totalRounds();
    $("home-btn").hidden = !!rec;
    $("left").innerHTML = ""; $("right").innerHTML = ""; $("big-slot").innerHTML = ""; $("hint").innerHTML = "";
    $("rank").hidden = true; $("share-btn").hidden = true; $("speed").hidden = true;
    if (duo) renderDuo(); else renderSolo();
  }

  function setWords(kicker, title) {
    const k = $("kicker"), ph = $("phrase");
    k.hidden = !kicker; k.textContent = kicker || "";
    ph.hidden = false;
    if (ph.textContent !== title) { ph.textContent = title; ph.classList.remove("flip"); void ph.offsetWidth; ph.classList.add("flip"); }
    lastPhraseMode = "duo";
    $("shuffle").hidden = true; $("score").hidden = true;
  }
  function showSpeed() {
    const b = $("speed"); b.hidden = !!rec;
    b.setAttribute("aria-pressed", String(slow));
    $("speed-label").textContent = slow ? "0.75×" : "1×";
  }
  function choiceRow(items) {
    const row = document.createElement("div"); row.className = "choices";
    items.forEach(([cls, icon, label, fn]) => {
      const c = document.createElement("button"); c.type = "button"; c.className = "choice " + cls;
      c.innerHTML = ICON[icon] + "<span></span>"; c.lastChild.textContent = label;
      c.addEventListener("click", fn); row.append(c);
    });
    return row;
  }

  function renderDuo() {
    const st = S.step, N = S.players.length, a = S.round % N, b = (S.round + 1) % N;
    const left = $("left"), right = $("right"), slot = $("big-slot"), hint = $("hint");
    if (st === 1) {
      setWords(t("secret", { p: pName(a) }), t("recAnything"));
      slot.append(bigButton(rec ? "stop" : "rec", rec ? t("stop") : t("rec"), toggleMic));
      if (!rec) hint.textContent = t("cantHear", { p: pName(b) });
    }
    if (st === 2) {
      setWords(t("passK"), pName(b));
      slot.append(bigButton("next", t("ready"), () => { sfx("go"); go(3); }));
      left.append(mini("retry", t("rerecord"), () => { S.orig = S.origrev = null; go(1); }));
      hint.textContent = t("tapReady");
    }
    if (st === 3) {
      setWords(pName(b), t("listenBack"));
      showSpeed();
      slot.append(bigButton(isPlaying("origrev") ? "stop" : "back", t("listenRev"), () => play("origrev")));
      right.append(mini("next", t("imitate"), () => { stopPlay(); go(4); }));
      hint.textContent = isPlaying("origrev") ? t("playingRev") : t("listenAny");
    }
    if (st === 4) {
      setWords(pName(b), t("nowImitate"));
      slot.append(bigButton(rec ? "stop" : "rec", rec ? t("stop") : t("rec"), toggleMic));
      if (!rec) {
        showSpeed();
        left.append(mini("back", t("listen"), () => play("origrev"), isPlaying("origrev")));
        hint.textContent = isPlaying("origrev") ? t("playingRev") : micOK ? t("tapRec") : t("pickAudio");
      }
    }
    if (st === 5) {
      setWords(t("guessK", { p: pName(b) }), t("whatWas"));
      slot.append(bigButton(isPlaying("result") ? "stop" : "play", t("listenImit"), () => play("result")));
      left.append(mini("retry", t("imitateAgain"), () => { stopPlay(); S.imit = S.result = null; go(4); }));
      right.append(mini("eye", t("reveal"), reveal));
      hint.textContent = isPlaying("result") ? t("yourImitRev") : t("sayAloud");
    }
    if (st === 6) {
      if (S.revealing) { setWords(t("itWas"), "…"); $("phrase").classList.add("pulse"); return; }
      $("phrase").classList.remove("pulse");
      setWords(t("itWas"), t("gotIt"));
      $("share-btn").hidden = false;
      slot.append(bigButton(isPlaying("orig") ? "stop" : "play", t("listenOrig"), () => play("orig")));
      hint.append(choiceRow([["no", "no", t("miss"), () => endRound(false)], ["yes", "yes", t("hit"), () => endRound(true)]]));
    }
    if (st === 7) {
      const top = Math.max(...S.players.map((p) => p.score));
      const winners = S.players.filter((p) => p.score === top);
      if (top === 0) setWords("", t("nobody"));
      else if (winners.length > 1) setWords(t("tie"), winners.map((p) => p.name).join(" & "));
      else setWords(t("winner"), winners[0].name);
      const rank = $("rank"); rank.innerHTML = ""; rank.hidden = false;
      S.players.map((p, i) => ({ ...p, i })).sort((x, y) => y.score - x.score).forEach((p) => {
        const li = document.createElement("li");
        const nm = document.createElement("span"); nm.className = "rk-name";
        const dot = document.createElement("i"); dot.style.background = PLAYER_COLORS[p.i % PLAYER_COLORS.length];
        nm.append(dot, p.name);
        const sc = document.createElement("b"); sc.textContent = String(p.score);
        if (p.score === top && top > 0) li.className = "top";
        li.append(nm, sc); rank.append(li);
      });
      slot.append(bigButton("retry", t("playAgain"), () => { sfx("go"); startDuo(); }));
      left.append(mini("people", t("players"), () => showSetup()));
      right.append(mini("home", t("home"), () => showHome()));
    }
  }

  function reveal() {
    stopPlay();
    S.step = 6; S.revealing = true; render(); buzz(15);
    sfx("drum");
    setTimeout(() => {
      if (S.step !== 6) return;
      S.revealing = false; render(); buzz(25);
      setTimeout(() => { if (S.step === 6) play("orig"); }, 150);
    }, soundOn ? 1450 : 700);
  }

  function endRound(hit) {
    stopPlay();
    const N = S.players.length, b = (S.round + 1) % N;
    if (hit) { S.players[b].score++; sfx("win"); confetti(120); buzz(30); toast(t("pointFor", { p: pName(b) }), 2200); }
    else { sfx("lose"); buzz(10); toast(t("noPoint"), 2200); }
    S.round++;
    S.orig = S.origrev = S.imit = S.result = null;
    if (S.round >= totalRounds()) { S.step = 7; render(); setTimeout(() => { sfx("fanfare"); confetti(220); }, 250); }
    else go(1);
  }

  function renderSolo() {
    const st = S.step;
    const phrase = PHRASES[pIdx];
    const mode = st === 1 ? "fwd" : "rev";
    const ph = $("phrase");
    const txt = mode === "fwd" ? phrase : reverseText(phrase);
    if (ph.textContent !== txt) {
      ph.textContent = txt;
      if (mode !== lastPhraseMode) { ph.classList.remove("flip"); void ph.offsetWidth; ph.classList.add("flip"); }
    }
    lastPhraseMode = mode;
    ph.hidden = st === 4;
    $("kicker").textContent = [t("sayThis"), t("soundsLike"), t("nowImitate"), ""][st - 1];
    $("kicker").hidden = st === 4;
    $("shuffle").hidden = st !== 1 || !!rec;
    $("score").hidden = st !== 4;
    const left = $("left"), right = $("right"), slot = $("big-slot"), hint = $("hint");
    if (st === 1 || st === 3) {
      slot.append(bigButton(rec ? "stop" : "rec", rec ? t("stop") : t("rec"), toggleMic));
      if (st === 3 && !rec) { showSpeed(); left.append(mini("back", t("listen"), () => play("origrev"), isPlaying("origrev"))); }
      if (!rec) hint.textContent = isPlaying("origrev") ? t("playingRev") : micOK ? t("tapRec") : t("pickAudio");
    }
    if (st === 2) {
      showSpeed();
      slot.append(bigButton(isPlaying("origrev") ? "stop" : "back", t("listenRev"), () => play("origrev")));
      left.append(mini("play", t("original"), () => play("orig"), isPlaying("orig")));
      right.append(mini("next", t("imitate"), () => { stopPlay(); go(3); }));
      hint.textContent = isPlaying("origrev") ? t("playingRev") : isPlaying("orig") ? t("playingOrig") : t("listenAny");
    }
    if (st === 4) {
      $("share-btn").hidden = false;
      slot.append(bigButton(isPlaying("result") ? "stop" : "play", t("resultAria"), () => play("result")));
      left.append(mini("play", t("original"), () => play("orig"), isPlaying("orig")));
      right.append(mini("retry", t("retry"), () => { stopPlay(); S.imit = S.result = null; S.score = null; go(3); }));
      const nb = document.createElement("button");
      nb.type = "button"; nb.className = "pill"; nb.textContent = t("newPhrase");
      nb.addEventListener("click", () => { sfx("tap"); restart(); shuffle(); });
      hint.append(nb);
    }
  }

  function restart() { stopPlay(); S.orig = S.origrev = S.imit = S.result = null; S.score = null; go(1); }

  /* ---------- ecrãs: início, preparação, jogo ---------- */
  function showOnly(id) {
    ["home", "setup", "app"].forEach((x) => { $(x).hidden = x !== id; });
  }
  function showHome() {
    if (rec) return;
    stopPlay();
    S.mode = null;
    showOnly("home");
    setPhase("dark");
  }
  function startSolo() {
    audio(); buzz(); sfx("go");
    S.mode = "solo"; S.step = 1; S.score = null;
    S.orig = S.origrev = S.imit = S.result = null;
    lastPhraseMode = "start";
    showOnly("app");
    render(); drawRing();
  }
  function startDuo() {
    audio(); buzz();
    S.mode = "duo"; S.step = 1; S.round = 0; S.revealing = false;
    S.players.forEach((p) => { p.score = 0; });
    S.orig = S.origrev = S.imit = S.result = null;
    lastPhraseMode = "start";
    showOnly("app");
    render(); drawRing();
  }

  let setupNames = (() => {
    try { const p = JSON.parse(store.get("cac-players") || "null"); if (Array.isArray(p) && p.length >= 2) return p.slice(0, 8).map(String); } catch (e) {}
    return ["", ""];
  })();
  function saveNames() { store.set("cac-players", JSON.stringify(setupNames)); }
  function showSetup() {
    if (rec) return;
    stopPlay(); audio();
    S.mode = null;
    showOnly("setup");
    setPhase("dark");
    renderSetup();
  }
  function renderSetup() {
    const list = $("players"); list.innerHTML = "";
    setupNames.forEach((name, i) => {
      const row = document.createElement("div"); row.className = "player-row";
      const dot = document.createElement("span"); dot.className = "pdot"; dot.style.background = PLAYER_COLORS[i % PLAYER_COLORS.length];
      const inp = document.createElement("input");
      inp.type = "text"; inp.maxLength = 16; inp.id = "pname-" + i; inp.value = name;
      inp.placeholder = t("player", { n: i + 1 }); inp.setAttribute("aria-label", t("player", { n: i + 1 }));
      inp.autocomplete = "off"; inp.enterKeyHint = "next";
      inp.addEventListener("input", () => { setupNames[i] = inp.value; saveNames(); });
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { const nx = $("pname-" + (i + 1)); if (nx) nx.focus(); else inp.blur(); } });
      row.append(dot, inp);
      if (setupNames.length > 2) {
        const x = document.createElement("button"); x.type = "button"; x.className = "x"; x.innerHTML = ICON.x;
        x.setAttribute("aria-label", t("removePlayer"));
        x.addEventListener("click", () => { sfx("tap"); setupNames.splice(i, 1); saveNames(); renderSetup(); });
        row.append(x);
      }
      list.append(row);
    });
    $("add-player").hidden = setupNames.length >= 8;
    document.querySelectorAll("#rounds-seg button").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.r) === S.rpp)));
  }
  $("add-player").addEventListener("click", () => {
    if (setupNames.length >= 8) return;
    sfx("tap"); setupNames.push(""); saveNames(); renderSetup();
    const last = $("pname-" + (setupNames.length - 1)); if (last) last.focus();
  });
  document.querySelectorAll("#rounds-seg button").forEach((b) => b.addEventListener("click", () => {
    sfx("tap"); S.rpp = Number(b.dataset.r); store.set("cac-rpp", String(S.rpp)); renderSetup();
  }));
  $("setup-go").addEventListener("click", () => {
    S.players = setupNames.map((n, i) => ({ name: n.trim() || t("player", { n: i + 1 }), score: 0 }));
    sfx("go"); startDuo();
  });
  $("setup-back").addEventListener("click", () => { sfx("tap"); showHome(); });

  $("start-duo").addEventListener("click", () => { sfx("tap"); showSetup(); });
  $("start-solo").addEventListener("click", startSolo);
  $("home-btn").addEventListener("click", () => { sfx("tap"); showHome(); });
  $("speed").addEventListener("click", () => {
    slow = !slow; store.set("cac-slow", slow ? "1" : "0"); sfx("tap");
    if (isPlaying("origrev")) { stopPlay(); play("origrev"); } else render();
  });

  const HELP = {
    solo: [["#FF5B2E", "h_s1"], ["#2E2BF5", "h_s2"], ["#FF5B2E", "h_s3"], ["#170A05", "h_s4"]],
    duo: [["#FF5B2E", "h_d1"], ["#2E2BF5", "h_d2"], ["#FF5B2E", "h_d3"], ["#170A05", "h_d4"]],
  };
  function fillHelp() {
    const ol = $("help-list"); ol.innerHTML = "";
    HELP[S.mode === "solo" ? "solo" : "duo"].forEach(([c, k], i) => {
      const li = document.createElement("li"), b = document.createElement("b");
      b.style.background = c; b.textContent = String(i + 1);
      li.append(b, t(k)); ol.append(li);
    });
    $("sound-on").checked = soundOn;
  }
  function shuffle() {
    let n; do { n = Math.floor(Math.random() * PHRASES.length); } while (n === pIdx && PHRASES.length > 1);
    pIdx = n; buzz();
    const ph = $("phrase"); ph.textContent = ""; render();
    ph.classList.remove("flip"); void ph.offsetWidth; ph.classList.add("flip");
  }
  $("shuffle").addEventListener("click", () => { sfx("tap"); shuffle(); });

  function countUp(n) {
    $("verdict").textContent = VERDICT(n);
    const t0 = performance.now(), D = 1100, el = $("score-num");
    const tick = (now) => {
      const f = Math.min(1, Math.max(0, (now - t0) / D)), e = 1 - Math.pow(1 - f, 4);
      el.textContent = String(Math.round(n * e));
      if (f < 1) requestAnimationFrame(tick);
    };
    el.textContent = "0"; requestAnimationFrame(tick);
  }
  function readBest() { return Number(store.get("cac-best") || 0); }
  function saveBest(n) {
    const b = readBest();
    if (n > b) { store.set("cac-best", String(n)); $("best").textContent = b ? t("newBest") : ""; }
    else $("best").textContent = t("best", { n: b });
  }

  /* ---------- vídeo para partilhar ---------- */
  let shareJob = null, shareBlob = null;
  function pickMime() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return "";
    const list = ['video/mp4;codecs="avc1.42E01E,mp4a.40.2"', "video/mp4;codecs=avc1,mp4a", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    return list.find((m) => MediaRecorder.isTypeSupported(m)) || "";
  }
  function wrapText(g, text, maxW) {
    const words = String(text).split(/\s+/), lines = []; let line = "";
    for (const w of words) { const test = line ? line + " " + w : w; if (g.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; }
    if (line) lines.push(line);
    return lines;
  }
  async function openShare() {
    stopPlay();
    const cv = $("share-canvas");
    if (!cv.captureStream || !window.MediaRecorder || !(window.AudioContext || window.webkitAudioContext)) { toast(t("noVideo")); return; }
    $("sharesheet").hidden = false; $("share-go").disabled = true; shareBlob = null;
    $("share-status").textContent = t("making", { p: 0 });
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) {}
    const c = audio();
    const segs = [["orig", t("vOrig"), "#FF5B2E", "#170A05"], ["origrev", t("vRev"), "#2E2BF5", "#FFFFFF"], ["result", t("vResult"), "#FFE14A", "#170A05"]].filter((s) => S[s[0]]);
    const dest = c.createMediaStreamDestination();
    const an = c.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = 0.7;
    const fr = new Uint8Array(an.frequencyBinCount);
    const out = c.createGain(); out.gain.value = 0.9;
    an.connect(dest); an.connect(out); out.connect(c.destination);
    const GAP = 0.9, srcs = [];
    let at = c.currentTime + 0.6;
    const timeline = segs.map(([key, label, bg, fg]) => {
      const b = toBuffer(S[key]);
      const s = c.createBufferSource(); s.buffer = b; s.connect(an); s.start(at); srcs.push(s);
      const seg = { key, label, bg, fg, start: at, end: at + b.duration };
      at = seg.end + GAP;
      return seg;
    });
    const tEnd = timeline[timeline.length - 1].end + 1.2, tBegin = c.currentTime;
    const g = cv.getContext("2d"), W = cv.width, H = cv.height;
    const stream = cv.captureStream(30);
    dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
    const mime = pickMime();
    let mr;
    try { mr = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 3000000 } : undefined); }
    catch (e) { try { mr = new MediaRecorder(stream); } catch (e2) { $("sharesheet").hidden = true; toast(t("noVideo")); return; } }
    const chunks = [];
    mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    const job = { mr, srcs, raf: 0, cancelled: false, nodes: [an, out, dest] };
    shareJob = job;
    const phraseFwd = S.mode === "solo" ? PHRASES[pIdx] : "";
    const draw = () => {
      if (job.cancelled) return;
      const now = c.currentTime;
      let i = timeline.findIndex((s) => now < s.end + GAP);
      if (i < 0) i = timeline.length - 1;
      const seg = timeline[i], inSeg = now >= seg.start && now <= seg.end;
      g.fillStyle = seg.bg; g.fillRect(0, 0, W, H);
      g.fillStyle = seg.fg; g.textBaseline = "alphabetic"; g.textAlign = "left";
      g.globalAlpha = 0.7; g.font = '600 30px "Funnel Sans", system-ui, sans-serif';
      g.fillText(t("docTitle").toUpperCase(), 60, 110);
      g.globalAlpha = 1;
      g.font = '800 92px "Funnel Display", system-ui, sans-serif';
      wrapText(g, seg.label, W - 120).forEach((ln, k) => g.fillText(ln, 60, 250 + k * 92));
      if (phraseFwd) {
        g.globalAlpha = 0.75; g.font = '600 40px "Funnel Sans", system-ui, sans-serif';
        const txt = seg.key === "orig" ? "“" + phraseFwd + "”" : "“" + reverseText(phraseFwd) + "”";
        wrapText(g, txt, W - 120).slice(0, 3).forEach((ln, k) => g.fillText(ln, 60, 470 + k * 52));
        g.globalAlpha = 1;
      }
      // visualizador
      an.getByteFrequencyData(fr);
      const cx = W / 2, cy = 820, r0 = 150;
      g.beginPath(); g.arc(cx, cy, r0, 0, Math.PI * 2); g.fillStyle = seg.fg === "#FFFFFF" ? "#FFFFFF" : "#170A05"; g.fill();
      g.strokeStyle = seg.fg; g.lineCap = "round"; g.lineWidth = 9;
      const N = 60;
      for (let k = 0; k < N; k++) {
        const kk = (k * 11) % N, bin = 2 + Math.floor((kk < N / 2 ? kk : N - 1 - kk) * 1.5);
        const v = inSeg ? fr[bin] / 255 : 0, a = (k / N) * Math.PI * 2 - Math.PI / 2, len = 8 + v * 150;
        g.globalAlpha = 0.4 + v * 0.6;
        g.beginPath(); g.moveTo(cx + Math.cos(a) * (r0 + 26), cy + Math.sin(a) * (r0 + 26)); g.lineTo(cx + Math.cos(a) * (r0 + 26 + len), cy + Math.sin(a) * (r0 + 26 + len)); g.stroke();
      }
      g.globalAlpha = 1;
      const prog = inSeg ? (now - seg.start) / (seg.end - seg.start) : now > seg.end ? 1 : 0;
      g.lineWidth = 10; g.strokeStyle = seg.bg;
      g.beginPath(); g.arc(cx, cy, r0 - 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog); g.stroke();
      // passos
      timeline.forEach((s, k) => {
        g.globalAlpha = k === i ? 1 : 0.3; g.fillStyle = seg.fg;
        const w = k === i ? 90 : 26, x = W / 2 - (timeline.length * 26 + 64 + (timeline.length - 1) * 14) / 2 + timeline.slice(0, k).reduce((acc, _, j) => acc + (j === i ? 90 : 26) + 14, 0);
        g.beginPath(); if (g.roundRect) g.roundRect(x, 1120, w, 18, 9); else g.rect(x, 1120, w, 18); g.fill();
      });
      g.globalAlpha = 1;
      if (S.mode === "solo" && S.score != null && i === timeline.length - 1) {
        g.textAlign = "right"; g.font = '800 64px "Funnel Display", system-ui, sans-serif';
        g.fillText(t("ptsN", { n: S.score }), W - 60, 1070); g.textAlign = "left";
      }
      g.globalAlpha = 0.6; g.textAlign = "center"; g.font = '600 28px "Funnel Sans", system-ui, sans-serif';
      g.fillText(SITE, W / 2, 1215); g.globalAlpha = 1; g.textAlign = "left";
      const pct = Math.min(99, Math.round(((now - tBegin) / (tEnd - tBegin)) * 100));
      $("share-status").textContent = t("making", { p: Math.max(0, pct) });
      if (now >= tEnd) { if (mr.state === "recording") mr.stop(); return; }
      job.raf = requestAnimationFrame(draw);
    };
    mr.onstop = () => {
      job.nodes.forEach((n) => { try { n.disconnect(); } catch (e) {} });
      if (job.cancelled) return;
      shareBlob = new Blob(chunks, { type: (mr.mimeType || mime || "video/webm").split(";")[0] });
      $("share-status").textContent = t("videoReady");
      $("share-go").disabled = false; $("share-go").focus();
      sfx("win");
    };
    mr.start(250);
    draw();
  }
  function cancelShare() {
    if (shareJob) {
      shareJob.cancelled = true; cancelAnimationFrame(shareJob.raf);
      shareJob.srcs.forEach((s) => { try { s.stop(); } catch (e) {} });
      try { if (shareJob.mr.state === "recording") shareJob.mr.stop(); } catch (e) {}
      shareJob.nodes.forEach((n) => { try { n.disconnect(); } catch (e) {} });
      shareJob = null;
    }
    $("sharesheet").hidden = true;
  }
  function blobToBase64(blob) {
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = rej; r.readAsDataURL(blob); });
  }
  async function doShare() {
    if (!shareBlob) return;
    const ext = shareBlob.type.includes("mp4") ? "mp4" : "webm";
    const name = "canta-ao-contrario-" + Date.now() + "." + ext;
    if (NATIVE && PLUG.Filesystem && PLUG.Share) {
      try {
        const data = await blobToBase64(shareBlob);
        const w = await PLUG.Filesystem.writeFile({ path: name, data, directory: "CACHE" });
        await PLUG.Share.share({ title: t("docTitle"), text: t("shareText"), files: [w.uri] });
        return;
      } catch (e) { if (e && /cancel/i.test(String(e.message || e))) return; }
    }
    const file = new File([shareBlob], name, { type: shareBlob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: t("docTitle"), text: t("shareText") }); return; }
      catch (e) { if (e && e.name === "AbortError") return; }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(shareBlob); a.download = name;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    toast(t("savedVideo"));
  }
  $("share-btn").addEventListener("click", () => { sfx("tap"); openShare(); });
  $("share-go").addEventListener("click", doShare);
  $("share-cancel").addEventListener("click", () => { sfx("tap"); cancelShare(); });

  /* ---------- escolha do microfone ---------- */
  let micId = store.get("cac-mic") || "";
  let callMode = store.get("cac-call") === "1";
  $("mic-call").checked = callMode;
  function constraints(id) {
    const a = { echoCancellation: callMode, noiseSuppression: callMode, autoGainControl: true };
    if (id) a.deviceId = { exact: id };
    return { audio: a };
  }
  async function openMic(id) {
    const want = id === undefined ? micId : id;
    try { return await navigator.mediaDevices.getUserMedia(constraints(want)); }
    catch (e) {
      if (want && (e.name === "OverconstrainedError" || e.name === "NotFoundError" || e.name === "NotReadableError")) {
        micId = ""; store.set("cac-mic", "");
        return navigator.mediaDevices.getUserMedia(constraints(""));
      }
      throw e;
    }
  }
  const NAMES = { "speakerphone": "speaker", "headset earpiece": "earpiece", "default": "auto" };
  function niceName(d, i) {
    if (!d.deviceId) return [t("auto"), ""];
    const l = (d.label || "").trim(), k = l.toLowerCase();
    for (const key in NAMES) if (k === key || k.startsWith(key)) return [t(NAMES[key]), l];
    return [l || t("micN", { n: i + 1 }), ""];
  }
  let test = null;
  function stopTest() {
    if (!test) return;
    cancelAnimationFrame(test.raf);
    test.stream.getTracks().forEach((tr) => tr.stop());
    try { test.node.disconnect(); } catch (e) {}
    test = null;
  }
  async function startTest(id) {
    stopTest();
    let stream;
    try { stream = await openMic(id); } catch (e) { return false; }
    const c = audio(), node = c.createMediaStreamSource(stream), an = c.createAnalyser();
    an.fftSize = 1024; node.connect(an);
    const buf = new Float32Array(an.fftSize);
    const job = { stream, node, raf: 0 };
    test = job;
    const tick = () => {
      if (test !== job) return;
      an.getFloatTimeDomainData(buf);
      let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
      const v = Math.min(1, Math.sqrt(s / buf.length) * 6);
      const bar = document.querySelector('.micopt[aria-pressed="true"] .meter i');
      if (bar) bar.style.width = Math.round(v * 100) + "%";
      job.raf = requestAnimationFrame(tick);
    };
    tick();
    return true;
  }
  async function openMicSheet() {
    if (rec) return;
    stopPlay();
    if (!(await ensureMicIntro())) return;
    $("micsheet").hidden = false;
    const list = $("miclist");
    list.textContent = "";
    if (!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices)) { list.textContent = t("noPicker"); return; }
    const ok = await startTest(micId);
    if (!ok) { list.textContent = t("noMic2"); return; }
    const devs = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "audioinput");
    const seen = new Set();
    const opts = [{ deviceId: "", label: "default" }].concat(devs.filter((d) => d.deviceId && d.deviceId !== "default" && d.deviceId !== "communications"));
    opts.forEach((d, i) => {
      if (seen.has(d.deviceId)) return; seen.add(d.deviceId);
      const [name, sub] = niceName(d, i);
      const b = document.createElement("button");
      b.type = "button"; b.className = "micopt";
      b.setAttribute("aria-pressed", String(d.deviceId === micId));
      const top = document.createElement("span"); top.textContent = name;
      if (sub && sub !== name) { const sm = document.createElement("small"); sm.textContent = " · " + sub; top.append(sm); }
      const m = document.createElement("span"); m.className = "meter"; m.innerHTML = "<i></i>";
      b.append(top, m);
      b.addEventListener("click", async () => {
        micId = d.deviceId; store.set("cac-mic", micId);
        list.querySelectorAll(".micopt").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        buzz(); await startTest(micId);
      });
      list.append(b);
    });
    if (!list.querySelector('[aria-pressed="true"]') && list.firstChild) list.firstChild.setAttribute("aria-pressed", "true");
  }
  function closeMicSheet() { stopTest(); $("micsheet").hidden = true; }
  $("mic").addEventListener("click", () => { $("sheet").hidden = true; openMicSheet(); });
  $("mic-ok").addEventListener("click", closeMicSheet);
  $("micsheet").addEventListener("click", (e) => { if (e.target === $("micsheet")) closeMicSheet(); });
  $("mic-call").addEventListener("change", (e) => { callMode = e.target.checked; store.set("cac-call", callMode ? "1" : "0"); if (test) startTest(micId); });
  $("mic").hidden = !micOK;

  /* ---------- ajuda, língua, sons ---------- */
  const openHelp = () => { sfx("tap"); fillHelp(); $("sheet").hidden = false; $("sheet-ok").focus(); };
  $("home-help").addEventListener("click", openHelp);
  $("help").addEventListener("click", openHelp);
  $("sheet-ok").addEventListener("click", () => { sfx("tap"); $("sheet").hidden = true; });
  $("sheet").addEventListener("click", (e) => { if (e.target === $("sheet")) $("sheet").hidden = true; });
  $("sound-on").addEventListener("change", (e) => { soundOn = e.target.checked; store.set("cac-sound", soundOn ? "1" : "0"); sfx("tap"); });
  $("lang-btn").addEventListener("click", () => { sfx("tap"); openLangSheet(); });
  $("langsheet").addEventListener("click", (e) => { if (e.target === $("langsheet")) $("langsheet").hidden = true; });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    $("sheet").hidden = true; $("langsheet").hidden = true;
    if (!$("micsheet").hidden) closeMicSheet();
    if (!$("sharesheet").hidden) cancelShare();
  });
  setInterval(() => { if (!$("home").hidden && !document.hidden) $("flipword").classList.toggle("rev"); }, 2600);
  window.addEventListener("resize", drawRing);
  // Botão "voltar" do Android na app nativa.
  if (NATIVE && PLUG.App && PLUG.App.addListener) {
    PLUG.App.addListener("backButton", () => {
      const open = ["sharesheet", "micsheet", "langsheet", "sheet", "micintro"].find((id) => !$(id).hidden);
      if (open) { if (open === "sharesheet") cancelShare(); else if (open === "micsheet") closeMicSheet(); else $(open).hidden = true; return; }
      if (!$("home").hidden) { if (PLUG.App.exitApp) PLUG.App.exitApp(); return; }
      showHome();
    });
  }
  // Instala o modo sem internet (só no site).
  if (!NATIVE && "serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
  }

  setLang(detectLang(), true);
  showHome();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawRing);
})();
