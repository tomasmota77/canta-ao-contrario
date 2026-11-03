/* Pontuação: semelhança espectral (mel) + DTW */
(() => {
  "use strict";
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit;
      if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) { let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) { const a = i + k, b = a + len / 2;
          const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } }
    }
  }
  function features(clip) {
    const f = Math.max(1, Math.round(clip.rate / 16000));
    const n = Math.floor(clip.data.length / f), x = new Float32Array(n);
    for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k < f; k++) s += clip.data[i * f + k]; x[i] = s / f; }
    const fs = clip.rate / f, N = 512, hop = Math.round(fs * 0.01), B = 24;
    const mel = (h) => 2595 * Math.log10(1 + h / 700), imel = (m) => 700 * (Math.pow(10, m / 2595) - 1);
    const lo = mel(80), hi = mel(Math.min(7000, fs / 2 - 100));
    const edges = []; for (let i = 0; i < B + 2; i++) edges.push(Math.floor(imel(lo + (hi - lo) * i / (B + 1)) / fs * N));
    const win = new Float32Array(N); for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1));
    const raw = [], energy = [], re = new Float64Array(N), im = new Float64Array(N);
    for (let s = 0; s + N <= n; s += hop) {
      let e = 0;
      for (let i = 0; i < N; i++) { re[i] = x[s + i] * win[i]; im[i] = 0; e += x[s + i] * x[s + i]; }
      fft(re, im);
      const v = new Float32Array(B);
      for (let b = 0; b < B; b++) {
        const a = edges[b], c = edges[b + 1], z = Math.max(edges[b + 2], c + 1); let sum = 0;
        for (let k = a; k < z; k++) { const w = k < c ? (k - a) / Math.max(1, c - a) : (z - k) / Math.max(1, z - c); sum += w * (re[k] * re[k] + im[k] * im[k]); }
        v[b] = sum;
      }
      raw.push(v); energy.push(10 * Math.log10(e / N + 1e-10));
    }
    let peakBand = 0; for (const v of raw) for (let b = 0; b < B; b++) if (v[b] > peakBand) peakBand = v[b];
    const floor = peakBand * 3e-5 + 1e-12;
    const frames = raw.map((v) => v.map((y) => Math.log(y + floor)));
    let mx = -Infinity; for (const e of energy) if (e > mx) mx = e;
    let a = 0, z = energy.length - 1;
    while (a < z && energy[a] < mx - 30) a++;
    while (z > a && energy[z] < mx - 30) z--;
    let fr = frames.slice(a, z + 1);
    const mean = new Float32Array(B);
    for (const v of fr) for (let b = 0; b < B; b++) mean[b] += v[b] / fr.length;
    fr = fr.map((v) => v.map((y, b) => y - mean[b]));
    const MAXF = 250;
    if (fr.length > MAXF) {
      const out = [], r = fr.length / MAXF;
      for (let i = 0; i < MAXF; i++) {
        const s0 = Math.floor(i * r), s1 = Math.max(s0 + 1, Math.floor((i + 1) * r)), v = new Float32Array(B);
        for (let j = s0; j < s1; j++) for (let b = 0; b < B; b++) v[b] += fr[j][b] / (s1 - s0);
        out.push(v);
      }
      fr = out;
    }
    return { frames: fr, seconds: (z - a + 1) * hop / fs };
  }
  function cosDist(p, q) { let d = 0, a = 0, b = 0; for (let i = 0; i < p.length; i++) { d += p[i] * q[i]; a += p[i] * p[i]; b += q[i] * q[i]; } return 1 - d / (Math.sqrt(a * b) + 1e-9); }
  function dtw(A, Bf) {
    const n = A.length, m = Bf.length, INF = 1e18;
    let prev = new Float64Array(m + 1).fill(INF), cur = new Float64Array(m + 1); prev[0] = 0;
    for (let i = 1; i <= n; i++) {
      cur[0] = INF;
      for (let j = 1; j <= m; j++) { const c = cosDist(A[i - 1], Bf[j - 1]); cur[j] = Math.min(prev[j - 1] + 2 * c, prev[j] + c, cur[j - 1] + c); }
      const t = prev; prev = cur; cur = t;
    }
    return prev[m] / (n + m);
  }
  function similarity(c1, c2) {
    const f1 = features(c1), f2 = features(c2);
    if (f1.frames.length < 5 || f2.frames.length < 5) return 0;
    const d = dtw(f1.frames, f2.frames);
    let s = Math.min(1, Math.max(0, (0.6 - d) / 0.4));
    const r = Math.min(f1.seconds, f2.seconds) / Math.max(f1.seconds, f2.seconds);
    s *= 0.65 + 0.35 * r;
    return Math.round(100 * Math.pow(s, 0.85));
  }
  window.CAC_similarity = similarity;
})();
