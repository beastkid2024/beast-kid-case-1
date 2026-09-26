/* =========================================================================
 * audio.js — generated sound: SFX + a moody noir music bed + per-scene
 * ambient variation. Everything is synthesized with Web Audio; zero audio
 * files. Respects the mute toggle, initializes on first user gesture
 * (browser autoplay policy). All failures are silent by design.
 * ========================================================================= */
(function (root) {
  "use strict";

  var ctx = null;
  var noiseBuf = null;
  var moodNodes = null;   // per-scene ambient
  var musicTimer = null;   // noir chord loop
  var muted = false;
  try { muted = root.localStorage && root.localStorage.getItem("bk_muted") === "1"; } catch (e) {}

  function ensure() {
    if (!ctx) {
      try {
        var AC = root.AudioContext || root.webkitAudioContext;
        if (AC) ctx = new AC();
      } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === "suspended") { ctx.resume(); }
    return ctx;
  }

  function getNoiseBuf(c) {
    if (noiseBuf) return noiseBuf;
    try {
      var len = c.sampleRate * 2;
      var buf = c.createBuffer(1, len, c.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      noiseBuf = buf;
    } catch (e) { noiseBuf = null; }
    return noiseBuf;
  }

  function tone(freq, dur, type, vol, when) {
    if (muted) return;
    var c = ensure();
    if (!c) return;
    try {
      var t = c.currentTime + (when || 0);
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + dur + 0.05);
    } catch (e) {}
  }

  /* ---- noir music bed: slow Am–Dm–F–E pad loop + low bass ---- */
  var CHORDS = [
    [110.00, 220.00, 261.63, 329.63],  // Am
    [146.83, 293.66, 349.23, 293.66],  // Dm
    [174.61, 349.23, 440.00, 349.23],  // F
    [164.81, 329.63, 415.30, 329.63]   // E
  ];
  var CHORD_SECS = 6;

  function playChord(freqs) {
    var c = ensure();
    if (!c || muted) return;
    try {
      var t = c.currentTime + 0.05;
      var dur = CHORD_SECS + 1.5;
      for (var i = 0; i < freqs.length; i++) {
        var o = c.createOscillator();
        var g = c.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(freqs[i], t);
        // slow noir swell
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.030, t + 1.8);
        g.gain.setValueAtTime(0.030, t + dur - 1.5);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(c.destination);
        o.start(t); o.stop(t + dur + 0.1);
      }
      // low bass root
      var b = c.createOscillator();
      var bg = c.createGain();
      b.type = "sine";
      b.frequency.setValueAtTime(freqs[0] / 2, t);
      bg.gain.setValueAtTime(0.0001, t);
      bg.gain.exponentialRampToValueAtTime(0.045, t + 1.2);
      bg.gain.setValueAtTime(0.045, t + dur - 1.5);
      bg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      b.connect(bg); bg.connect(c.destination);
      b.start(t); b.stop(t + dur + 0.1);
    } catch (e) {}
  }

  function startMusic() {
    if (muted || musicTimer) return;
    var c = ensure();
    if (!c) return;
    var idx = 0;
    function next() {
      if (muted) return;
      playChord(CHORDS[idx % CHORDS.length]);
      idx++;
      musicTimer = setTimeout(next, CHORD_SECS * 1000);
    }
    next();
  }

  function stopMusic() {
    if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
  }

  /* ---- per-scene ambient moods (all generated, all quiet) ---- */
  var MOODS = {
    title:     { hum: [[55, 0.010]] },
    beach:     { hum: [[45, 0.008]], noise: { type: "lowpass", freq: 420, gain: 0.020 }, lfo: { rate: 0.12, depth: 0.010 } },
    station:   { hum: [[50, 0.007]] },
    railway:   { hum: [[80, 0.010]], noise: { type: "bandpass", freq: 600, q: 0.8, gain: 0.008 } },
    car:       { hum: [[60, 0.006]], noise: { type: "lowpass", freq: 300, gain: 0.006 } },
    map:       { hum: [[55, 0.010]] },
    deduction: { hum: [[55, 0.010]] },
    results:   { hum: [[55, 0.008]] }
  };

  function setMood(name) {
    stopMood();
    if (muted) return;
    var c = ensure();
    if (!c) return;
    var mood = MOODS[name] || MOODS.title;
    try {
      var nodes = { oscs: [], gains: [], lfo: null };
      (mood.hum || []).forEach(function (h) {
        var o = c.createOscillator();
        var g = c.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(h[0], c.currentTime);
        g.gain.setValueAtTime(0.0001, c.currentTime);
        g.gain.exponentialRampToValueAtTime(h[1], c.currentTime + 2.0);
        o.connect(g); g.connect(c.destination);
        o.start();
        nodes.oscs.push(o); nodes.gains.push(g);
      });
      if (mood.noise) {
        var nb = getNoiseBuf(c);
        if (nb) {
          var src = c.createBufferSource();
          src.buffer = nb; src.loop = true;
          var f = c.createBiquadFilter();
          f.type = mood.noise.type;
          f.frequency.setValueAtTime(mood.noise.freq, c.currentTime);
          if (mood.noise.q) f.Q.setValueAtTime(mood.noise.q, c.currentTime);
          var ng = c.createGain();
          ng.gain.setValueAtTime(0.0001, c.currentTime);
          ng.gain.exponentialRampToValueAtTime(mood.noise.gain, c.currentTime + 2.5);
          src.connect(f); f.connect(ng); ng.connect(c.destination);
          src.start();
          nodes.oscs.push(src); nodes.gains.push(ng);
          if (mood.lfo) {
            var lfo = c.createOscillator();
            var lg = c.createGain();
            lfo.type = "sine";
            lfo.frequency.setValueAtTime(mood.lfo.rate, c.currentTime);
            lg.gain.setValueAtTime(mood.lfo.depth, c.currentTime);
            lfo.connect(lg); lg.connect(ng.gain);
            lfo.start();
            nodes.lfo = lfo;
          }
        }
      }
      moodNodes = nodes;
    } catch (e) {}
  }

  function stopMood() {
    if (!moodNodes) return;
    var nodes = moodNodes;
    moodNodes = null;
    try {
      var t = ctx ? ctx.currentTime : 0;
      nodes.gains.forEach(function (g) {
        try { g.gain.linearRampToValueAtTime(0.0001, t + 0.5); } catch (e) {}
      });
      setTimeout(function () {
        nodes.oscs.forEach(function (o) { try { o.stop(); } catch (e) {} });
        if (nodes.lfo) { try { nodes.lfo.stop(); } catch (e) {} }
      }, 650);
    } catch (e) {}
  }

  var AudioFX = {
    get muted() { return muted; },

    toggleMute: function () {
      muted = !muted;
      try { if (root.localStorage) root.localStorage.setItem("bk_muted", muted ? "1" : "0"); } catch (e) {}
      if (muted) { stopMood(); stopMusic(); }
      return muted;
    },

    unlock: function () { ensure(); },           // call on first tap/click
    click: function () { tone(620, 0.06, "triangle", 0.10); },
    clue:  function () {                          // little "discovery" chime
      tone(523.25, 0.12, "sine", 0.14);
      tone(783.99, 0.18, "sine", 0.12, 0.10);
    },
    paper: function () { tone(220, 0.08, "sawtooth", 0.05); tone(330, 0.06, "sawtooth", 0.04, 0.05); },
    snap:  function () {                           // evidence locks into place
      tone(880, 0.07, "triangle", 0.12);
      tone(1174.66, 0.12, "triangle", 0.10, 0.06);
    },
    wrong: function () { tone(196, 0.16, "sine", 0.10); tone(155.56, 0.2, "sine", 0.09, 0.08); },
    success: function () {                       // case solved
      tone(392, 0.15, "sine", 0.14);
      tone(523.25, 0.15, "sine", 0.14, 0.12);
      tone(659.25, 0.25, "sine", 0.14, 0.24);
      tone(783.99, 0.35, "sine", 0.12, 0.36);
    },

    /** noir music bed + per-scene mood; safe to leave running, mute stops it */
    startAmbient: function () {
      startMusic();
      setMood("title");
    },
    setMood: setMood,
    stopAmbient: function () {
      stopMood();
      stopMusic();
    }
  };

  root.AudioFX = AudioFX;
})(typeof window !== "undefined" ? window : this);
