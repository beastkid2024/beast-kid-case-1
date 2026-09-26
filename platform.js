/* =========================================================================
 * platform.js — CrazyGames SDK (v3) adapter + standalone fallback
 * -------------------------------------------------------------------------
 * INTEGRATION POINT — how the CrazyGames SDK gets into the page:
 *   CrazyGames injects their official SDK script into the game page on
 *   THEIR portal during/after submission (this is how their HTML5 pipeline
 *   works — the game code itself only needs to call window.CrazyGames.SDK).
 *   Nothing is bundled here and no script URL is guessed.
 *
 * Every method below is guarded: when the game runs on itch.io, locally,
 * or anywhere outside CrazyGames, window.CrazyGames is undefined and every
 * call safely no-ops. The SAME build therefore works on both portals with
 * zero changes.
 *
 * Verified against CrazyGames SDK v3 docs (Sept 2026):
 *   - game.gameplayStart()  — entering/resuming active gameplay
 *   - game.gameplayStop()   — menus, pauses, breaks (NOT tab blur; CG handles)
 *   - game.sdkGameLoadingStart/Stop() — asset loading signals
 *   - game.happyTime()      — positive player moment (boosts ad yield)
 *   - ad.requestAd("midgame", {adStarted, adFinished, adError})
 *   - ad.requestAd("rewarded", {adStarted, adFinished, adError})
 *     * grant rewarded items ONLY on adFinished; adError = no reward
 *     * midgame ads only at natural gameplay breaks, never mid-action
 * ========================================================================= */
(function (root) {
  "use strict";

  function getSDK() {
    try {
      return root.CrazyGames && root.CrazyGames.SDK ? root.CrazyGames.SDK : null;
    } catch (e) {
      return null;
    }
  }

  var Platform = {
    /** true when actually running inside the CrazyGames portal */
    get isCrazyGames() {
      return !!getSDK();
    },

    /** call once during boot */
    loadingStart: function () {
      var sdk = getSDK();
      if (sdk && sdk.game && sdk.game.sdkGameLoadingStart) {
        try { sdk.game.sdkGameLoadingStart(); } catch (e) {}
      }
    },

    /** call once boot is complete */
    loadingDone: function () {
      var sdk = getSDK();
      if (sdk && sdk.game && sdk.game.sdkGameLoadingStop) {
        try { sdk.game.sdkGameLoadingStop(); } catch (e) {}
      }
    },

    /** player entered or resumed active gameplay */
    gameplayStart: function () {
      var sdk = getSDK();
      if (sdk && sdk.game && sdk.game.gameplayStart) {
        try { sdk.game.gameplayStart(); } catch (e) {}
      }
    },

    /** player hit a break: pause menu, map, deduction board, results */
    gameplayStop: function () {
      var sdk = getSDK();
      if (sdk && sdk.game && sdk.game.gameplayStop) {
        try { sdk.game.gameplayStop(); } catch (e) {}
      }
    },

    /** positive moment — called when the case is solved */
    happyTime: function () {
      var sdk = getSDK();
      if (sdk && sdk.game && sdk.game.happyTime) {
        try { sdk.game.happyTime(); } catch (e) {}
      }
    },

    /**
     * Midgame ad at a NATURAL break (we call it before the deduction board).
     * Returns a Promise that always resolves — the game continues whether
     * the ad played, errored, was blocked, or the SDK is absent.
     */
    midgameAd: function () {
      var sdk = getSDK();
      return new Promise(function (resolve) {
        if (!sdk || !sdk.ad || !sdk.ad.requestAd) { resolve(); return; }
        var done = false;
        function finish() { if (!done) { done = true; resolve(); } }
        try {
          sdk.ad.requestAd("midgame", {
            adStarted: function () {},
            adFinished: finish,
            adError: finish
          });
          // Safety net: never hang the game on an ad callback.
          setTimeout(finish, 15000);
        } catch (e) { finish(); }
      });
    },

    /**
     * Rewarded ad, ALWAYS user-initiated (the "watch ad for a hint" button).
     * cb(true)  -> adFinished: grant the reward.
     * cb(false) -> adError / no SDK: NEVER grant; caller shows a message.
     */
    rewardedAd: function (cb) {
      var sdk = getSDK();
      if (!sdk || !sdk.ad || !sdk.ad.requestAd) { cb(false); return; }
      var settled = false;
      function no(e)  { if (!settled) { settled = true; cb(false); } }
      function yes()  { if (!settled) { settled = true; cb(true); } }
      try {
        sdk.ad.requestAd("rewarded", {
          adStarted: function () {},
          adFinished: yes,
          adError: no
        });
        setTimeout(no, 15000);
      } catch (e) { no(e); }
    }
  };

  root.Platform = Platform;
})(typeof window !== "undefined" ? window : this);
