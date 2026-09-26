/* =========================================================================
 * game.js — "Beast Kid: Case Files — Case #1: The Somerton Man"
 * Point-and-click detective game. Vanilla JS, no dependencies.
 * ========================================================================= */
(function () {
  "use strict";

  var D = window.BK_DATA;
  var $ = function (s) { return document.querySelector(s); };
  var PORTAL_ART = window.BK_PORTAL_ART || { scenes: {}, npcs: {}, title: null };

  /* Scoring: thoroughness-based. No speed bonus. */
  var CLUE_PTS = 100;
  var INSIGHT_PTS = 50;
  var MATCH_PTS = 150;
  var HINT_COST = 50;
  var BEST_KEY = "bk_case1_best";

  var currentMood = "title";   // per-scene audio mood, updated in showScreen

  /* ------------------------------ state -------------------------------- */
  function freshState() {
    return {
      clues: {},          // clueId -> true
      notes: [],          // {text}
      asked: {},          // "npc:index" -> true (dialogue asked once)
      placed: {},         // clueId -> theoryId (deduction board matches)
      wrongDrops: 0,      // wrong drag attempts on the deduction board
      scenes: ["beach", "station", "railway"],
      screen: "title",
      scene: null,
      score: 0,
      hints: 0,
      elapsed: 0,         // seconds of active play
      timerId: null,
      finished: false,
      theory: null
    };
  }
  var state = freshState();

  /* ---------------------------- helpers -------------------------------- */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function clueCount() { return Object.keys(state.clues).length; }
  function topicCount() { return Object.keys(state.asked).length; }
  function fmtTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
  }

  function toast(msg, ms) {
    var root = $("#toast-root");
    // cap stacked toasts (rapid chip placement piles them over the board)
    while (root.children.length >= 3) root.removeChild(root.firstChild);
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = msg;
    root.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 400);
    }, ms || 3400);
  }

  function dismissToasts() {
    var root = $("#toast-root");
    while (root.firstChild) root.removeChild(root.firstChild);
  }

  function openModal(html) {
    var root = $("#modal-root");
    root.innerHTML = '<div class="modal-back"><div class="modal">' + html + "</div></div>";
    root.classList.add("open");
    var back = root.querySelector(".modal-back");
    back.addEventListener("click", function (e) {
      if (e.target === back) closeModal();
    });
  }
  function closeModal() {
    var root = $("#modal-root");
    root.classList.remove("open");
    root.innerHTML = "";
  }

  /* ------------------------------ HUD ---------------------------------- */
  function updateHUD() {
    $("#hud-clues").textContent = clueCount() + "/" + Object.keys(D.CLUES).length;
    $("#hud-time").textContent = fmtTime(state.elapsed);
    $("#hud-score").textContent = state.score;
    var muteBtn = $("#btn-mute");
    muteBtn.textContent = window.AudioFX.muted ? "\uD83D\uDD07" : "\uD83D\uDD0A";
    muteBtn.setAttribute("aria-label", window.AudioFX.muted ? "Unmute" : "Mute");
  }

  function startTimer() {
    stopTimer();
    state.timerId = setInterval(function () {
      state.elapsed++;
      $("#hud-time").textContent = fmtTime(state.elapsed);
    }, 1000);
  }
  function stopTimer() {
    if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  }

  function showScreen(name) {
    state.screen = name;
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) screens[i].classList.add("hidden");
    $("#screen-" + name).classList.remove("hidden");
    $("#hud").classList.toggle("hidden", name === "title" || name === "results");
    currentMood = name === "scene" ? (state.scene || "title") : name;
    if (window.AudioFX && window.AudioFX.setMood) {
      try { window.AudioFX.setMood(currentMood); } catch (e) {}
    }
    window.scrollTo(0, 0);
  }

  /* --------------------------- title / intro ---------------------------- */
  var introIdx = 0;
  function renderIntro() {
    var c = D.INTRO[introIdx];
    $("#intro-kicker").textContent = c.kicker;
    $("#intro-title").textContent = c.title;
    $("#intro-text").textContent = c.text;
    $("#intro-count").textContent = (introIdx + 1) + " / " + D.INTRO.length;
    $("#btn-intro-back").disabled = introIdx === 0;
    $("#btn-intro-next").textContent = introIdx === D.INTRO.length - 1 ? "Open the case file \u2192" : "Next \u2192";
  }

  function beginInvestigation() {
    window.AudioFX.unlock();
    window.AudioFX.click();
    showScreen("intro");
    introIdx = 0;
    renderIntro();
  }

  function finishIntro() {
    window.AudioFX.click();
    state.startTime = Date.now();
    startTimer();
    window.Platform.gameplayStart();   // active gameplay begins
    window.AudioFX.startAmbient();
    renderMap();
    showScreen("map");
  }

  /* -------------------------------- map --------------------------------- */
  function renderMap() {
    var wrap = $("#map-cards");
    wrap.innerHTML = "";
    D.SCENE_ORDER.forEach(function (sid) {
      var sc = D.SCENES[sid];
      var locked = state.scenes.indexOf(sid) === -1;
      var found = sc.hotspots.filter(function (h) { return state.clues[h.clue]; }).length;
      var card = document.createElement("button");
      card.className = "map-card" + (locked ? " locked" : "");
      card.innerHTML =
        '<div class="map-card-name">' + esc(sc.name) + "</div>" +
        '<div class="map-card-sub">' + esc(sc.sub) + "</div>" +
        (locked
          ? '<div class="map-card-lock">\uD83D\uDD12 Locked \u2014 follow the evidence</div>'
          : '<div class="map-card-progress">' + found + "/" + sc.hotspots.length + " clues</div>");
      if (!locked) {
        card.addEventListener("click", function () {
          window.AudioFX.click();
          openScene(sid);
        });
      } else {
        card.addEventListener("click", function () {
          toast("This location is locked. Keep following the evidence.");
        });
      }
      wrap.appendChild(card);
    });

    var n = clueCount(), need = D.CLUES_TO_UNLOCK_DEDUCTION;
    var btn = $("#btn-deduction");
    btn.disabled = n < need;
    btn.innerHTML = n >= need
      ? "\uD83E\uDDEC Open the deduction board"
      : "\uD83E\uDDEC Deduction board (" + n + "/" + need + " clues needed)";
  }

  /* ------------------------------- scene -------------------------------- */
  function renderSceneArt(sid) {
    var sc = D.SCENES[sid];
    var wrap = $("#scene-art");
    var url = PORTAL_ART.scenes && PORTAL_ART.scenes[sid];
    if (url) {
      // Illustrated noir background layered under the SVG hotspot markers.
      // onerror is the safety net: a missing file falls back to the SVG scene.
      wrap.innerHTML = "";
      var img = document.createElement("img");
      img.className = "scene-bg";
      img.alt = "";
      img.draggable = false;
      img.addEventListener("error", function () { wrap.innerHTML = sc.art; });
      img.src = url;
      wrap.appendChild(img);
    } else {
      wrap.innerHTML = sc.art;   // inline SVG fallback
    }
  }

  function openScene(sid) {
    state.scene = sid;
    var sc = D.SCENES[sid];
    window.Platform.gameplayStart();

    renderSceneArt(sid);
    $("#scene-name").textContent = sc.name;
    $("#scene-sub").textContent = sc.sub;
    $("#scene-blurb").textContent = sc.blurb;

    // hotspots
    var layer = $("#hotspot-layer");
    layer.innerHTML = "";
    sc.hotspots.forEach(function (hs) {
      if (hs.requires && !state.clues[hs.requires]) return;   // chained clue
      var found = !!state.clues[hs.clue];
      var b = document.createElement("button");
      b.className = "hotspot" + (found ? " found" : "");
      b.style.left = hs.x + "%";
      b.style.top = hs.y + "%";
      b.setAttribute("aria-label", hs.label);
      b.dataset.hs = hs.id;
      b.innerHTML = "<span>" + (found ? "\u2713" : "?") + "</span>";
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        onHotspot(hs);
      });
      layer.appendChild(b);
    });

    // NPC talk chips
    var talk = $("#talk-row");
    talk.innerHTML = "";
    (sc.npcs || []).forEach(function (nid) {
      var npc = D.NPCS[nid];
      var b = document.createElement("button");
      b.className = "talk-chip";
      b.dataset.npc = nid;
      b.innerHTML = "\uD83D\uDCAC Talk: " + esc(npc.name);
      b.addEventListener("click", function () { openNPC(nid); });
      talk.appendChild(b);
    });

    showScreen("scene");
    updateHUD();
  }

  function pulseHotspot(hsId) {
    var el = document.querySelector('[data-hs="' + hsId + '"]');
    if (el) {
      el.classList.add("pulse");
      setTimeout(function () { el.classList.remove("pulse"); }, 2600);
    }
  }

  function onHotspot(hs) {
    window.AudioFX.click();
    var clue = D.CLUES[hs.clue];
    if (state.clues[hs.clue]) {
      toast("<b>" + esc(clue.name) + ".</b> " + esc(clue.flavor));
      return;
    }
    // award the clue
    state.clues[hs.clue] = true;
    state.score += CLUE_PTS;
    window.AudioFX.clue();
    openModal(
      '<div class="clue-head"><span class="clue-icon">' + clue.icon + '</span>' +
      '<h3>' + esc(clue.name) + "</h3></div>" +
      "<p>" + esc(clue.desc) + "</p>" +
      '<div class="clue-points">+' + CLUE_PTS + ' pts \u00B7 added to your journal</div>' +
      '<button class="btn primary" id="m-ok">Continue investigating</button>'
    );
    $("#m-ok").addEventListener("click", function () {
      window.AudioFX.click();
      closeModal();
      openScene(state.scene);   // re-render: hotspot turns to checkmark
      updateHUD();
    });
    updateHUD();
  }

  /* ------------------------------ dialogue ------------------------------ */
  function openNPC(nid) {
    window.AudioFX.click();
    var npc = D.NPCS[nid];
    var portrait = "";
    var purl = PORTAL_ART.npcs && PORTAL_ART.npcs[nid];
    if (purl) {
      portrait = '<img class="npc-portrait" alt="" draggable="false">';
    }
    var topics = npc.topics.map(function (t, i) {
      var ok = !t.requires || state.clues[t.requires];
      var asked = !!state.asked[nid + ":" + i];
      return { t: t, i: i, ok: ok, asked: asked };
    });
    var html =
      '<div class="npc-head">' + portrait +
      '<div class="npc-titles"><h3>' + esc(npc.name) + '</h3><div class="npc-role">' + esc(npc.role) + "</div></div></div>" +
      '<p class="npc-intro">' + esc(npc.intro) + "</p>" +
      '<div class="topics">' +
      topics.map(function (o) {
        if (!o.ok) {
          return '<button class="btn topic locked" disabled>\uD83D\uDD12 ' + esc(o.t.q) + "<small>Find more evidence first</small></button>";
        }
        return '<button class="btn topic" data-i="' + o.i + '">' + esc(o.t.q) +
          (o.asked ? " <small>\u2713 asked</small>" : "") + "</button>";
      }).join("") +
      "</div>" +
      '<button class="btn" id="m-ok">Leave</button>';
    openModal(html);
    if (purl) {
      var img = document.querySelector("#modal-root .npc-portrait");
      if (img) {
        img.addEventListener("error", function () { img.remove(); });
        img.src = purl;
      }
    }
    $("#m-ok").addEventListener("click", function () { window.AudioFX.click(); closeModal(); });
    var btns = document.querySelectorAll("#modal-root .topic:not(.locked)");
    for (var k = 0; k < btns.length; k++) {
      (function (b) {
        b.addEventListener("click", function () {
          answerTopic(nid, parseInt(b.dataset.i, 10));
        });
      })(btns[k]);
    }
  }

  function answerTopic(nid, i) {
    window.AudioFX.paper();
    var npc = D.NPCS[nid];
    var t = npc.topics[i];
    var key = nid + ":" + i;
    var first = !state.asked[key];
    state.asked[key] = true;

    var effects = "";
    if (first) {
      if (t.note) {
        state.notes.push({ text: t.note });
        state.score += INSIGHT_PTS;
        effects += '<div class="fx">\uD83D\uDCDD Insight noted (+' + INSIGHT_PTS + " pts)</div>";
      }
      if (t.unlockScene && state.scenes.indexOf(t.unlockScene) === -1) {
        state.scenes.push(t.unlockScene);
        effects += '<div class="fx big">\uD83D\uDCCD New location unlocked: ' + esc(D.SCENES[t.unlockScene].name) + "</div>";
        window.AudioFX.clue();
      }
      if (t.hintScene) {
        effects += '<div class="fx">\uD83D\uDCA1 Worth a look: ' + esc(D.SCENES[t.hintScene].name) + "</div>";
      }
    }

    openModal(
      '<div class="npc-head"><h3>' + esc(npc.name) + "</h3></div>" +
      '<p class="q">\u201C' + esc(t.q) + "\u201D</p>" +
      '<p class="a">' + esc(t.a) + "</p>" +
      effects +
      '<button class="btn primary" id="m-ok">' + (t.unlockScene && first ? "Go to the map" : "Back") + "</button>"
    );
    $("#m-ok").addEventListener("click", function () {
      window.AudioFX.click();
      closeModal();
      if (t.unlockScene && first) { renderMap(); showScreen("map"); }
      else { openScene(state.scene); }
      updateHUD();
    });
    updateHUD();
  }

  /* ------------------------------ journal ------------------------------- */
  function openJournal() {
    window.AudioFX.paper();
    var ids = Object.keys(D.CLUES).filter(function (id) { return state.clues[id]; });
    var html = "<h3>\uD83D\uDCCB Detective\u2019s journal</h3>";
    html += '<div class="j-sec"><b>Clues ' + ids.length + "/" + Object.keys(D.CLUES).length + "</b></div>";
    html += ids.length
      ? ids.map(function (id) {
          var c = D.CLUES[id];
          return '<div class="j-clue"><span class="j-icon">' + c.icon + '</span><div><b>' + esc(c.name) + "</b><p>" + esc(c.desc) + "</p></div></div>";
        }).join("")
      : "<p class='j-empty'>No clues yet. Tap the glowing <b>?</b> markers in each location.</p>";
    if (state.notes.length) {
      html += '<div class="j-sec"><b>Insights</b></div>' + state.notes.map(function (n) {
        return '<div class="j-note">\uD83D\uDCDD ' + esc(n.text) + "</div>";
      }).join("");
    }
    $("#journal-body").innerHTML = html;
    $("#journal").classList.add("open");
  }
  function closeJournal() { $("#journal").classList.remove("open"); }

  /* -------------------------------- hint -------------------------------- */
  function nextHintTarget() {
    // 1) unlock guidance first: scrap found but car still locked -> Lawson
    if (state.clues.scrap && state.scenes.indexOf("car") === -1) {
      return { kind: "npc", scene: "station", npc: "lawson", msg: "Det. Sgt. Lawson at the <b>police station</b> is hunting a book. Ask him about \u2018Tamam Shud\u2019." };
    }
    // 2) chained-clue guidance: rubaiyat's back cover, suitcase's folded coat
    if (state.clues.rubaiyat && !state.clues.code) {
      return { kind: "npc", scene: "car", npc: null, msg: "That book has more to tell \u2014 take a closer look at its <b>back cover</b>." };
    }
    if (state.clues.suitcase && !state.clues.coat) {
      return { kind: "npc", scene: "railway", npc: null, msg: "There\u2019s more folded into that <b>suitcase</b> than a name. Look again." };
    }
    // 2) first unfound, reachable hotspot in scene order
    for (var s = 0; s < D.SCENE_ORDER.length; s++) {
      var sid = D.SCENE_ORDER[s];
      if (state.scenes.indexOf(sid) === -1) continue;
      var sc = D.SCENES[sid];
      for (var h = 0; h < sc.hotspots.length; h++) {
        var hs = sc.hotspots[h];
        if (hs.requires && !state.clues[hs.requires]) continue;
        if (!state.clues[hs.clue]) return { kind: "hotspot", scene: sid, hs: hs };
      }
    }
    return null;
  }

  function grantHint() {
    var t = nextHintTarget();
    state.hints++;
    if (!t) {
      toast("You\u2019ve found every clue. Time for the <b>deduction board</b>.");
      return;
    }
    if (t.kind === "npc") { toast("\uD83D\uDCA1 " + t.msg); return; }
    if (state.scene === t.scene) {
      toast("\uD83D\uDCA1 Look closely at the <b>" + esc(t.hs.label.toLowerCase()) + "</b>\u2026");
      pulseHotspot(t.hs.id);
    } else {
      toast("\uD83D\uDCA1 A clue waits at the <b>" + esc(D.SCENES[t.scene].name) + "</b>. Open the map to travel.");
    }
  }

  function onHintButton() {
    window.AudioFX.click();
    if (window.Platform.isCrazyGames) {
      // Rewarded ad flow: user-initiated, reward ONLY on adFinished.
      var btn = $("#btn-hint");
      btn.disabled = true;
      toast("Loading hint\u2026");
      window.Platform.rewardedAd(function (ok) {
        btn.disabled = false;
        if (ok) { grantHint(); }
        else { toast("The ad couldn\u2019t load. Try again in a moment \u2014 the button still works."); }
      });
    } else {
      // itch.io / local: free hint, small score cost, never a dead button.
      state.score = Math.max(0, state.score - HINT_COST);
      updateHUD();
      grantHint();
    }
  }

  /* ------------------------- deduction: drag puzzle --------------------- */
  var selectedChip = null;   // tap-to-place selection

  function theoryById(id) {
    for (var i = 0; i < D.THEORIES.length; i++) {
      if (D.THEORIES[i].id === id) return D.THEORIES[i];
    }
    return null;
  }

  /** slots still required: found supporting clues not yet matched */
  function requiredSlots() {
    var req = [];
    D.THEORIES.forEach(function (th) {
      th.supports.forEach(function (cid) {
        if (state.clues[cid] && !state.placed[cid]) req.push(cid);
      });
    });
    return req;
  }
  function deductionDone() { return requiredSlots().length === 0; }

  function openDeduction() {
    if (clueCount() < D.CLUES_TO_UNLOCK_DEDUCTION) return;
    window.AudioFX.click();
    window.Platform.gameplayStop();          // natural break -> midgame ad slot
    toast("The board is set. One last look at the evidence\u2026");
    window.Platform.midgameAd().then(function () {
      renderDeduction();
      showScreen("deduction");
    });
  }

  function clearSelection() {
    selectedChip = null;
    var sels = document.querySelectorAll(".ev-chip.selected");
    for (var i = 0; i < sels.length; i++) sels[i].classList.remove("selected");
  }

  function toggleSelect(chip) {
    if (chip.classList.contains("selected")) { clearSelection(); return; }
    clearSelection();
    chip.classList.add("selected");
    selectedChip = chip;
    toast("Selected <b>" + esc(chip.getAttribute("data-name")) + "</b> \u2014 now tap the theory it supports.");
  }

  function wireChip(chip, clueId, clueName) {
    var startX = 0, startY = 0, ghost = null, dragging = false, pid = null, justDragged = false;
    chip.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      pid = e.pointerId;
      startX = e.clientX; startY = e.clientY;
      dragging = false;
      try { chip.setPointerCapture(pid); } catch (err) {}
    });
    chip.addEventListener("pointermove", function (e) {
      if (pid === null || e.pointerId !== pid) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (!dragging && Math.sqrt(dx * dx + dy * dy) > 10) {
        dragging = true;
        ghost = chip.cloneNode(true);
        ghost.className = "ev-chip drag-ghost";
        ghost.style.left = e.clientX + "px";
        ghost.style.top = e.clientY + "px";
        document.body.appendChild(ghost);
        chip.style.opacity = "0.35";
        clearSelection();
      }
      if (dragging && ghost) {
        ghost.style.left = e.clientX + "px";
        ghost.style.top = e.clientY + "px";
        var el = document.elementFromPoint(e.clientX, e.clientY);
        var card = el && el.closest ? el.closest(".theory-card") : null;
        var hots = document.querySelectorAll(".theory-card.drop-hover");
        for (var i = 0; i < hots.length; i++) hots[i].classList.remove("drop-hover");
        if (card) card.classList.add("drop-hover");
      }
    });
    function endDrag(e) {
      if (pid === null) return;
      if (e.pointerId !== undefined && e.pointerId !== pid) return;
      pid = null;
      var hots = document.querySelectorAll(".theory-card.drop-hover");
      for (var i = 0; i < hots.length; i++) hots[i].classList.remove("drop-hover");
      if (dragging) {
        justDragged = true;
        setTimeout(function () { justDragged = false; }, 50);
        var el = document.elementFromPoint(e.clientX, e.clientY);
        var card = el && el.closest ? el.closest(".theory-card") : null;
        if (ghost) { ghost.remove(); ghost = null; }
        chip.style.opacity = "";
        dragging = false;
        if (card) attemptPlace(clueId, card.getAttribute("data-theory"));
      }
    }
    chip.addEventListener("pointerup", endDrag);
    chip.addEventListener("pointercancel", function () {
      pid = null; dragging = false;
      if (ghost) { ghost.remove(); ghost = null; }
      chip.style.opacity = "";
    });
    // tap / keyboard: click only fires as a tap when it wasn't a drag
    chip.addEventListener("click", function () {
      if (justDragged) return;
      toggleSelect(chip);
    });
  }

  function attemptPlace(clueId, theoryId) {
    var th = theoryById(theoryId);
    if (!th) return;
    if (state.placed[clueId]) { toast("Already matched on the board."); return; }
    if (th.supports.indexOf(clueId) === -1) {
      // wrong fit (including decoys): feedback, correctable, no score change
      state.wrongDrops++;
      window.AudioFX.wrong();
      var card = document.querySelector('.theory-card[data-theory="' + theoryId + '"]');
      if (card) {
        card.classList.add("shake");
        setTimeout(function () { card.classList.remove("shake"); }, 450);
      }
      toast("That doesn\u2019t fit <b>" + esc(th.title) + "</b> \u2014 re-read what the theory claims, and try another.");
      renderDeduction();   // refresh the wrong-drop counter
      return;
    }
    state.placed[clueId] = theoryId;
    state.score += MATCH_PTS;
    window.AudioFX.snap();
    clearSelection();
    renderDeduction();
    updateHUD();
    if (deductionDone()) {
      toast("\u2705 The board is complete \u2014 every link matched. Close the case!");
    } else {
      toast("\u2705 <b>" + esc(D.CLUES[clueId].name) + "</b> locks in (+" + MATCH_PTS + ").");
    }
  }

  function updateDedProgress() {
    var totalReq = 0, doneReq = 0;
    D.THEORIES.forEach(function (th) {
      th.supports.forEach(function (cid) {
        if (state.clues[cid]) { totalReq++; if (state.placed[cid]) doneReq++; }
      });
    });
    $("#ded-progress").textContent =
      "Evidence matched: " + doneReq + "/" + totalReq + " links \u00B7 " +
      clueCount() + "/" + Object.keys(D.CLUES).length + " clues \u00B7 " +
      state.notes.length + " insights \u00B7 " +
      state.wrongDrops + " misplaced drop" + (state.wrongDrops === 1 ? "" : "s");
    var btn = $("#btn-close-case");
    var done = totalReq > 0 && doneReq === totalReq;
    btn.disabled = !done;
    btn.textContent = done ? "\u2705 Close the case" : "\uD83D\uDD12 Close the case (" + doneReq + "/" + totalReq + " links)";
  }

  function renderDeduction() {
    clearSelection();
    var pool = $("#evidence-pool");
    pool.innerHTML = '<p class="pool-label">Your evidence \u2014 drag each clue onto the theory it supports (or tap a clue, then tap a theory)</p>';
    Object.keys(D.CLUES).forEach(function (cid) {
      if (!state.clues[cid] || state.placed[cid]) return;
      var c = D.CLUES[cid];
      var chip = document.createElement("button");
      chip.className = "ev-chip";
      chip.setAttribute("data-clue", cid);
      chip.setAttribute("data-name", c.name);
      chip.innerHTML = esc(c.icon) + " " + esc(c.name);
      pool.appendChild(chip);
      wireChip(chip, cid, c.name);
    });

    var wrap = $("#theory-cards");
    wrap.innerHTML = "";
    D.THEORIES.forEach(function (th) {
      var card = document.createElement("div");
      card.className = "theory-card";
      card.setAttribute("data-theory", th.id);
      var slots = th.supports.map(function (cid) {
        var c = D.CLUES[cid];
        if (state.placed[cid]) {
          return '<li class="ev-slot filled">\u2713 ' + esc(c.icon) + " " + esc(c.name) + "</li>";
        }
        if (!state.clues[cid]) {
          return '<li class="ev-slot missing">\u00B7 undiscovered evidence</li>';
        }
        return '<li class="ev-slot">Drop a clue here</li>';
      }).join("");
      card.innerHTML =
        "<h4>" + esc(th.title) + "</h4><p>" + esc(th.desc) + "</p>" +
        '<ul class="ev-slots">' + slots + "</ul>";
      card.addEventListener("click", function () {
        if (selectedChip) {
          var cid = selectedChip.getAttribute("data-clue");
          clearSelection();
          attemptPlace(cid, th.id);
        }
      });
      wrap.appendChild(card);
    });
    updateDedProgress();
  }

  /* --------------------------- best persistence ------------------------- */
  function saveBest(stars, rank, allClues) {
    try {
      var prev = null;
      try { prev = JSON.parse(window.localStorage.getItem(BEST_KEY) || "null"); } catch (e) {}
      var best = { stars: stars, score: state.score, rank: rank, allClues: allClues };
      if (!(prev && (prev.stars > stars || (prev.stars === stars && prev.score >= state.score)))) {
        window.localStorage.setItem(BEST_KEY, JSON.stringify(best));
      }
    } catch (e) {}
  }
  function showBest() {
    var el = $("#best-line");
    try {
      var b = JSON.parse(window.localStorage.getItem(BEST_KEY) || "null");
      if (b && b.stars) {
        el.textContent = "Your best: " + "\u2605".repeat(b.stars) + "\u2606".repeat(3 - b.stars) +
          " \u00B7 " + b.score + " pts (" + b.rank + ")" + (b.allClues ? " \u00B7 \uD83D\uDD0E all 13 clues" : "");
        el.classList.remove("hidden");
        return;
      }
    } catch (e) {}
    el.classList.add("hidden");
  }

  /* ------------------------------ results ------------------------------- */
  function closeCase() {
    if (!deductionDone()) return;
    state.finished = true;
    stopTimer();
    dismissToasts();              // never leave a stale toast over the results screen

    var clues = clueCount();
    var notes = state.notes.length;
    var topics = topicCount();
    var matched = Object.keys(state.placed).length;

    var rank = D.RANKS.filter(function (r) { return state.score >= r.min; })[0].title;

    // stars: thoroughness + deduction accuracy
    var stars = 1;
    if (clues === 13 && state.wrongDrops <= 1 && topics >= 7) stars = 3;
    else if (clues >= 11 && state.wrongDrops <= 3) stars = 2;

    var allClues = clues === Object.keys(D.CLUES).length;
    $("#res-rank").textContent = rank;
    $("#res-stars").textContent = "\u2605".repeat(stars) + "\u2606".repeat(3 - stars);
    var badge = $("#res-badge");
    if (allClues) {
      badge.textContent = "\uD83D\uDD0E True Detective \u2014 all " + clues + " clues found";
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }

    $("#res-board").innerHTML = D.THEORIES.map(function (th) {
      var items = th.supports.filter(function (cid) { return state.placed[cid]; })
        .map(function (cid) { return "<li>\u2713 " + esc(D.CLUES[cid].name) + "</li>"; }).join("");
      var missing = th.supports.filter(function (cid) { return !state.placed[cid]; }).length;
      return '<div class="res-theory-block"><b>' + esc(th.title) + "</b><ul>" + items +
        (missing ? "<li><i>" + missing + " link" + (missing > 1 ? "s" : "") + " undiscovered</i></li>" : "") +
        "</ul></div>";
    }).join("");

    $("#res-score").innerHTML =
      "<li>Clues found: <b>" + clues + " \u00D7 " + CLUE_PTS + " = " + (clues * CLUE_PTS) + "</b></li>" +
      "<li>Insights noted: <b>" + notes + " \u00D7 " + INSIGHT_PTS + " = " + (notes * INSIGHT_PTS) + "</b></li>" +
      "<li>Witnesses questioned: <b>" + topics + " topics</b></li>" +
      "<li>Evidence matched: <b>" + matched + " \u00D7 " + MATCH_PTS + " = " + (matched * MATCH_PTS) + "</b></li>" +
      "<li>Misplaced drops: <b>" + state.wrongDrops + "</b></li>" +
      (state.hints ? "<li>Hints used: <b>" + state.hints + " \u00D7 \u2212" + HINT_COST + " = \u2212" + (state.hints * HINT_COST) + "</b></li>" : "") +
      "<li>Time on the case: <b>" + fmtTime(state.elapsed) + "</b> (no bonus \u2014 thorough beats fast)</li>" +
      "<li class='total'>Final score: <b>" + state.score + "</b></li>";

    saveBest(stars, rank, allClues);
    window.Platform.gameplayStop();
    window.Platform.happyTime();
    window.AudioFX.success();
    showScreen("results");   // results mood keeps the music bed playing softly
    updateHUD();
  }

  /* ------------------------------- pause -------------------------------- */
  function openPause() {
    window.AudioFX.click();
    window.Platform.gameplayStop();
    stopTimer();
    $("#pause-menu").classList.add("open");
  }
  function closePause(resume) {
    $("#pause-menu").classList.remove("open");
    if (resume && !state.finished && (state.screen === "map" || state.screen === "scene")) {
      window.Platform.gameplayStart();
      startTimer();
    }
    window.AudioFX.click();
  }

  /* -------------------------------- boot -------------------------------- */
  function init() {
    window.Platform.loadingStart();

    // Illustrated title keyart (art-stream file); HTML logo stays overlaid.
    if (PORTAL_ART.title) {
      var tk = document.createElement("img");
      tk.alt = "";
      tk.draggable = false;
      tk.addEventListener("error", function () { tk.remove(); });
      tk.src = PORTAL_ART.title;
      $("#title-keyart").appendChild(tk);
    }

    $("#btn-begin").addEventListener("click", beginInvestigation);
    $("#btn-how").addEventListener("click", function () {
      window.AudioFX.click();
      openModal(
        "<h3>How to play</h3>" +
        "<p>\uD83D\uDD0D <b>Search</b> each location \u2014 tap the glowing <b>?</b> markers to collect clues.</p>" +
        "<p>\uD83D\uDCAC <b>Question</b> witnesses and police. Some answers only unlock once you hold the right evidence.</p>" +
        "<p>\uD83D\uDCCB Your <b>journal</b> keeps every clue and insight.</p>" +
        "<p>\uD83E\uDDEC At <b>8 of 13 clues</b>, the deduction board opens: match every clue to the theory it supports, then close the case.</p>" +
        "<p>There are no dead ends \u2014 you can always keep investigating.</p>" +
        '<button class="btn primary" id="m-ok">Got it</button>'
      );
      $("#m-ok").addEventListener("click", function () { window.AudioFX.click(); closeModal(); });
    });

    $("#btn-intro-next").addEventListener("click", function () {
      if (introIdx < D.INTRO.length - 1) { introIdx++; window.AudioFX.click(); renderIntro(); }
      else { finishIntro(); }
    });
    $("#btn-intro-back").addEventListener("click", function () {
      if (introIdx > 0) { introIdx--; window.AudioFX.click(); renderIntro(); }
    });

    $("#btn-map").addEventListener("click", function () {
      window.AudioFX.click();
      window.Platform.gameplayStart();
      renderMap();
      showScreen("map");
    });
    $("#btn-deduction").addEventListener("click", openDeduction);
    $("#btn-close-case").addEventListener("click", function () {
      window.AudioFX.click();
      closeCase();
    });

    $("#btn-journal").addEventListener("click", openJournal);
    $("#journal-close").addEventListener("click", function () { window.AudioFX.click(); closeJournal(); });
    $("#btn-hint").addEventListener("click", onHintButton);
    $("#btn-pause").addEventListener("click", openPause);
    $("#btn-mute").addEventListener("click", function () {
      window.AudioFX.unlock();
      var m = window.AudioFX.toggleMute();
      if (!m) { window.AudioFX.startAmbient(); window.AudioFX.setMood(currentMood); }
      updateHUD();
    });

    $("#btn-resume").addEventListener("click", function () { closePause(true); });
    $("#btn-restart").addEventListener("click", function () {
      window.AudioFX.click();
      openModal(
        "<h3>Restart the case?</h3>" +
        "<p>Every clue, insight and point of score will be lost, and the Somerton Man file will be reopened from the beginning.</p>" +
        '<div class="btn-row">' +
        '<button class="btn" id="m-restart-no">Keep investigating</button>' +
        '<button class="btn primary" id="m-restart-yes">Restart case</button>' +
        "</div>"
      );
      $("#m-restart-no").addEventListener("click", function () { window.AudioFX.click(); closeModal(); });
      $("#m-restart-yes").addEventListener("click", function () {
        $("#pause-menu").classList.remove("open");
        location.reload();
      });
    });
    $("#btn-pause-how").addEventListener("click", function () {
      window.AudioFX.click();
      $("#btn-how").click();
    });
    $("#btn-again").addEventListener("click", function () { location.reload(); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeModal();
        closeJournal();
        if ($("#pause-menu").classList.contains("open")) closePause(true);
      }
    });
    document.addEventListener("pointerdown", function () { window.AudioFX.unlock(); }, { once: true });

    // Hint button label depends on portal: rewarded ad vs free hint.
    if (window.Platform.isCrazyGames) {
      $("#btn-hint").innerHTML = "\uD83D\uDCA1 Hint (\uD83D\uDCFA ad)";
      $("#btn-hint").title = "Watch a short ad for a hint";
    } else {
      $("#btn-hint").innerHTML = "\uD83D\uDCA1 Hint (\u2212" + HINT_COST + ")";
      $("#btn-hint").title = "Get a hint (costs " + HINT_COST + " points)";
    }

    updateHUD();
    showBest();
    showScreen("title");
    window.Platform.loadingDone();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
