/* =========================================================================
 * data.js — ALL story content for Case #1: The Somerton Man
 * Facts are based on the real 1948 Somerton Man case (Adelaide, Australia),
 * told in a family-friendly, non-graphic way. Scenes are hand-drawn inline
 * SVG (no image files, so the game always loads).
 * UMD-ish: usable in the browser (window.BK_DATA) and in Node tests.
 * ========================================================================= */
(function (root) {
  "use strict";

  /* ------------------------------- CLUES -------------------------------- */
  var CLUES = {
    scrap: {
      name: "The 'Tamam Shud' Scrap", icon: "\uD83D\uDCDC", scene: "beach",
      desc: "In the fob pocket of his trousers: a tiny scrap of paper, torn from a book. Two words are printed on it: TAMAM SHUD \u2014 Persian for \u2018it is ended\u2019.",
      flavor: "The scrap is bagged as evidence. Those two words feel like a message."
    },
    cigarettes: {
      name: "Mismatched Cigarettes", icon: "\uD83D\uDEAC", scene: "beach",
      desc: "An Army Club cigarette packet in his coat pocket \u2014 but inside are seven Kensitas, a dearer brand. A half-smoked cigarette rests on his right collar.",
      flavor: "Army Club packet, Kensitas cigarettes. A man who hides what he smokes?"
    },
    labels: {
      name: "Removed Labels", icon: "\u2702\uFE0F", scene: "beach",
      desc: "Every clothing label has been carefully cut away \u2014 shirt, tie, trousers, even his coat. Someone went to great trouble so this man could not be named.",
      flavor: "No maker\u2019s marks anywhere. Deliberate, patient work with small scissors."
    },
    autopsy: {
      name: "The Coroner\u2019s Report", icon: "\uD83D\uDDC2\uFE0F", scene: "station",
      desc: "No wound. No disease the coroner could name. A full examination finds nothing that explains why a healthy man in his forties simply stopped living.",
      flavor: "Cause of death: unascertained. The coroner has never written those words before."
    },
    bust: {
      name: "The Plaster Bust", icon: "\uD83D\uDDFF", scene: "station",
      desc: "Police made a plaster cast of the man\u2019s head and shoulders, hoping someone would recognise him. Hundreds came to look. Nobody knew his name.",
      flavor: "The bust stares back at you. Somewhere, someone must be missing him."
    },
    suitcase: {
      name: "The Station Suitcase", icon: "\uD83E\uDDF3", scene: "railway",
      desc: "A brown suitcase checked into Adelaide station\u2019s cloakroom on November 30th \u2014 the day before the body was found. The claim ticket was never used.",
      flavor: "One suitcase, checked the day before he died. He planned to come back."
    },
    keane: {
      name: "The Name \u2018T. Keane\u2019", icon: "\uD83C\uDFF7\uFE0F", scene: "railway",
      desc: "Inside the suitcase: neatly folded clothes, every label removed \u2014 but three items are marked \u2018T. Keane\u2019. No missing person of that name is ever found.",
      flavor: "T. Keane. A real name, or another layer of disguise?"
    },
    rubaiyat: {
      name: "The Rubaiyat & The Code", icon: "\uD83D\uDCD6", scene: "car",
      desc: "A rare edition of The Rubaiyat of Omar Khayyam, found in the back of an unlocked car near the beach. Its final page is torn out \u2014 and the scrap in his pocket fits the gap exactly.",
      flavor: "The torn page matches. This book is the heart of the case."
    },
    code: {
      name: "The Handwritten Code", icon: "\uD83D\uDD22", scene: "car",
      desc: "Inside the back cover of the Rubaiyat: five lines of capital letters, struck through and rewritten, in no pattern the experts can name. A cipher \u2014 or a key to one \u2014 written by a hurried hand.",
      flavor: "Five lines of letters. The experts are still arguing about them."
    },
    busticket: {
      name: "The Unused Train Ticket", icon: "\uD83C\uDFAB", scene: "beach",
      desc: "An unused train ticket to Henley Beach, dated December 1st, folded into his trouser pocket. He was planning to travel somewhere \u2014 and never boarded.",
      flavor: "A ticket for a journey never taken."
    },
    shoes: {
      name: "The Sand-free Shoes", icon: "\uD83E\uDD7E", scene: "beach",
      desc: "His shoes are polished to a shine \u2014 and there is no sand on them, between the laces or under the soles. A man who lay down on a beach should have sand on his shoes. Someone brought him here.",
      flavor: "Polished shoes, no sand. He never walked onto this beach."
    },
    dental: {
      name: "Dental Records, No Match", icon: "\uD83E\uDDB7", scene: "station",
      desc: "His dental work is distinctive \u2014 expensive, precise, done by a careful hand. But no dentist in the state recognises it, and no missing-person file matches. It is as if his teeth belong to no one.",
      flavor: "Fine dental work \u2014 and no record of it anywhere."
    },
    coat: {
      name: "The American Coat", icon: "\uD83E\uDDE5", scene: "railway",
      desc: "The overcoat folded in the suitcase is cut in a style sold only in America \u2014 its stitching uses a technique no Australian tailor employs. Whatever name he wore, his wardrobe crossed an ocean.",
      flavor: "An American coat on a man with no name."
    }
  };

  /* ------------------------------- SCENES ------------------------------- */
  /* Hotspot x/y are % positions inside the scene frame.                    */
  var SCENES = {
    beach: {
      name: "Somerton Beach", sub: "Dawn \u00B7 December 1st, 1948",
      blurb: "A cold wind off the water. Against the seawall rests a well-dressed man, as if asleep. He will never wake.",
      hotspots: [
        { id: "hs-scrap", clue: "scrap", x: 47, y: 63, label: "Fob pocket" },
        { id: "hs-cig", clue: "cigarettes", x: 63, y: 50, label: "Coat pocket" },
        { id: "hs-labels", clue: "labels", x: 35, y: 74, label: "His clothing" },
        { id: "hs-shoes", clue: "shoes", x: 72, y: 76, label: "His shoes" },
        { id: "hs-ticket", clue: "busticket", x: 26, y: 58, label: "Trouser pocket" }
      ],
      npcs: ["walker"],
      art:
      '<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs><linearGradient id="sk1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1026"/><stop offset="0.55" stop-color="#233a5e"/><stop offset="1" stop-color="#e8a35c"/></linearGradient>' +
      '<linearGradient id="se1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16324a"/><stop offset="1" stop-color="#0a1a2b"/></linearGradient>' +
      '<radialGradient id="lg1" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffcf7d" stop-opacity="0.85"/><stop offset="1" stop-color="#ffcf7d" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="800" height="300" fill="url(#sk1)"/>' +
      '<circle cx="620" cy="120" r="34" fill="#f5e7c8" opacity="0.9"/>' +
      '<ellipse cx="200" cy="90" rx="90" ry="18" fill="#0b1026" opacity="0.5"/><ellipse cx="420" cy="140" rx="120" ry="20" fill="#0b1026" opacity="0.4"/>' +
      '<rect y="250" width="800" height="90" fill="url(#se1)"/>' +
      '<path d="M0 270 q40 -8 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0" stroke="#3d6a8a" stroke-width="3" fill="none" opacity="0.7"/>' +
      '<path d="M0 295 q50 -10 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0" stroke="#2c4f66" stroke-width="3" fill="none" opacity="0.6"/>' +
      '<rect y="340" width="800" height="160" fill="#232a38"/>' +
      '<rect y="330" width="800" height="26" fill="#3a4356"/><rect y="330" width="800" height="6" fill="#4a5468"/>' +
      '<g opacity="0.95"><ellipse cx="400" cy="420" rx="52" ry="16" fill="#0a0d14"/>' +
      '<path d="M372 418 q-6 -60 22 -84 q10 -8 20 2 q22 30 18 82 z" fill="#10141d"/>' +
      '<circle cx="392" cy="322" r="17" fill="#10141d"/>' +
      '<path d="M360 380 l-34 26 M424 378 l36 22" stroke="#10141d" stroke-width="13" stroke-linecap="round"/></g>' +
      '<rect x="120" y="180" width="10" height="160" fill="#141a26"/><circle cx="125" cy="172" r="14" fill="#ffcf7d"/>' +
      '<ellipse cx="125" cy="172" rx="46" ry="46" fill="url(#lg1)"/>' +
      '<rect x="640" y="380" width="110" height="14" fill="#141a26"/><rect x="648" y="394" width="10" height="40" fill="#141a26"/><rect x="732" y="394" width="10" height="40" fill="#141a26"/>' +
      '</svg>'
    },

    station: {
      name: "Police Station", sub: "Adelaide \u00B7 Case File No. 1948-118",
      blurb: "Detective Sergeant Lawson\u2019s desk. The file on the Somerton Man grows thicker \u2014 and no thinner of mystery.",
      hotspots: [
        { id: "hs-autopsy", clue: "autopsy", x: 30, y: 58, label: "Coroner\u2019s report" },
        { id: "hs-bust", clue: "bust", x: 72, y: 36, label: "Plaster bust" },
        { id: "hs-dental", clue: "dental", x: 52, y: 72, label: "Dental records" }
      ],
      npcs: ["lawson"],
      art:
      '<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs><radialGradient id="dl1" cx="0.5" cy="0.35" r="0.65"><stop offset="0" stop-color="#ffcf7d" stop-opacity="0.5"/><stop offset="1" stop-color="#ffcf7d" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="800" height="500" fill="#12161f"/>' +
      '<rect width="800" height="330" fill="#1a2030"/>' +
      '<rect x="60" y="60" width="200" height="150" fill="#232b3f"/>' +
      '<rect x="60" y="60" width="200" height="150" fill="none" stroke="#39445e" stroke-width="4"/>' +
      '<rect x="80" y="84" width="70" height="90" fill="#d8cdb4" opacity="0.85" transform="rotate(-4 80 84)"/>' +
      '<rect x="160" y="90" width="70" height="90" fill="#cfc39f" opacity="0.8" transform="rotate(3 160 90)"/>' +
      '<rect x="540" y="40" width="200" height="26" fill="#2a3247"/>' +
      '<g><circle cx="640" cy="120" r="26" fill="#c9bfa8"/><path d="M610 150 q30 -14 60 0 l8 44 h-76 z" fill="#c9bfa8"/><rect x="606" y="192" width="68" height="14" fill="#3a2f22"/></g>' +
      '<rect y="330" width="800" height="170" fill="#241a12"/>' +
      '<rect x="150" y="330" width="500" height="26" fill="#31241a"/>' +
      '<g><rect x="212" y="300" width="120" height="34" fill="#e5d9bd" transform="rotate(-3 212 300)"/><rect x="222" y="312" width="100" height="4" fill="#8a7c5c"/><rect x="222" y="320" width="80" height="4" fill="#8a7c5c"/></g>' +
      '<rect x="470" y="230" width="12" height="110" fill="#141a26"/><path d="M440 230 h52 l-8 -26 h-36 z" fill="#1d2536"/>' +
      '<ellipse cx="466" cy="204" rx="18" ry="12" fill="#ffcf7d"/><ellipse cx="466" cy="280" rx="150" ry="120" fill="url(#dl1)"/>' +
      '<circle cx="120" cy="420" r="60" fill="#0d1119" opacity="0.6"/>' +
      '</svg>'
    },

    railway: {
      name: "Railway Station", sub: "Cloakroom \u00B7 November 30th, revisited",
      blurb: "Rows of lockers, a slow clock, and one brown suitcase nobody came back for.",
      hotspots: [
        { id: "hs-suitcase", clue: "suitcase", x: 50, y: 44, label: "Brown suitcase" },
        { id: "hs-keane", clue: "keane", x: 50, y: 66, label: "Search inside", requires: "suitcase" },
        { id: "hs-coat", clue: "coat", x: 63, y: 66, label: "Folded overcoat", requires: "suitcase" }
      ],
      npcs: ["porter"],
      art:
      '<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs><linearGradient id="wl1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2333"/><stop offset="1" stop-color="#111725"/></linearGradient></defs>' +
      '<rect width="800" height="500" fill="url(#wl1)"/>' +
      '<g>' +
      '<rect x="60" y="90" width="140" height="110" fill="#2b3550" stroke="#46536f" stroke-width="3"/><rect x="60" y="210" width="140" height="110" fill="#273049" stroke="#46536f" stroke-width="3"/>' +
      '<rect x="220" y="90" width="140" height="110" fill="#2b3550" stroke="#46536f" stroke-width="3"/><rect x="220" y="210" width="140" height="110" fill="#273049" stroke="#46536f" stroke-width="3"/>' +
      '<rect x="380" y="90" width="140" height="230" fill="#3a2c1e" stroke="#6b543a" stroke-width="4"/>' +
      '<rect x="400" y="180" width="100" height="60" fill="#4a3826" stroke="#6b543a" stroke-width="2"/><circle cx="450" cy="210" r="7" fill="#c9a86a"/>' +
      '<rect x="540" y="90" width="140" height="110" fill="#2b3550" stroke="#46536f" stroke-width="3"/><rect x="540" y="210" width="140" height="110" fill="#273049" stroke="#46536f" stroke-width="3"/>' +
      '</g>' +
      '<circle cx="120" cy="400" r="46" fill="#0e1320" stroke="#46536f" stroke-width="5"/><circle cx="120" cy="400" r="38" fill="#d8d2c0"/>' +
      '<line x1="120" y1="400" x2="120" y2="372" stroke="#1a2030" stroke-width="5" stroke-linecap="round"/><line x1="120" y1="400" x2="140" y2="410" stroke="#1a2030" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="120" cy="400" r="5" fill="#1a2030"/>' +
      '<rect x="600" y="360" width="150" height="16" fill="#2b2419"/><rect x="610" y="376" width="12" height="60" fill="#2b2419"/><rect x="728" y="376" width="12" height="60" fill="#2b2419"/>' +
      '<g opacity="0.9"><circle cx="700" cy="300" r="16" fill="#141a26"/><path d="M682 318 q18 -8 36 0 l6 60 h-48 z" fill="#1d2a3f"/></g>' +
      '</svg>'
    },

    car: {
      name: "The Unlocked Car", sub: "Jetty Road \u00B7 near the beach",
      blurb: "An unlocked car parked near the beach. On the back seat: a book nobody has claimed.",
      locked: true,
      hotspots: [
        { id: "hs-rubaiyat", clue: "rubaiyat", x: 55, y: 55, label: "The book" },
        { id: "hs-code", clue: "code", x: 68, y: 55, label: "Back cover", requires: "rubaiyat" }
      ],
      npcs: [],
      art:
      '<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs><linearGradient id="ns1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070b16"/><stop offset="1" stop-color="#14233a"/></linearGradient>' +
      '<radialGradient id="bg1" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffe9b8" stop-opacity="0.9"/><stop offset="1" stop-color="#ffe9b8" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="800" height="500" fill="url(#ns1)"/>' +
      '<circle cx="140" cy="90" r="26" fill="#f5e7c8" opacity="0.85"/>' +
      '<rect y="380" width="800" height="120" fill="#0d1420"/>' +
      '<g><rect x="140" y="250" width="520" height="110" rx="46" fill="#1c2740"/>' +
      '<rect x="230" y="200" width="340" height="90" rx="40" fill="#233252"/>' +
      '<rect x="260" y="215" width="120" height="60" rx="18" fill="#0d1626"/><rect x="420" y="215" width="120" height="60" rx="18" fill="#0d1626"/>' +
      '<rect x="470" y="222" width="52" height="46" rx="6" fill="#7a5c36" transform="rotate(-8 470 222)"/>' +
      '<rect x="478" y="230" width="36" height="4" fill="#3d2f1c"/><rect x="478" y="238" width="28" height="4" fill="#3d2f1c"/>' +
      '<ellipse cx="470" cy="245" rx="60" ry="40" fill="url(#bg1)"/>' +
      '<circle cx="240" cy="370" r="42" fill="#0a0e18" stroke="#39445e" stroke-width="6"/><circle cx="560" cy="370" r="42" fill="#0a0e18" stroke="#39445e" stroke-width="6"/>' +
      '<rect x="120" y="300" width="34" height="18" rx="8" fill="#ffdf9e" opacity="0.9"/></g>' +
      '<rect x="60" y="120" width="10" height="260" fill="#141a26"/><circle cx="65" cy="112" r="12" fill="#ffcf7d"/><ellipse cx="65" cy="112" rx="40" ry="40" fill="url(#bg1)" opacity="0.7"/>' +
      '</svg>'
    }
  };

  var SCENE_ORDER = ["beach", "station", "railway", "car"];

  /* -------------------------------- NPCS ------------------------------- */
  var NPCS = {
    walker: {
      name: "Morning Walker", scene: "beach", role: "Witness",
      intro: "An older man in a rain-dark coat stops beside you, pulling his hat low against the sea wind.",
      topics: [
        {
          q: "Did you see anything last night?",
          a: "A man was lying by the seawall as the sun went down. I thought he was sleeping \u2014 people doze on the beach. I\u2019m sorry I just walked on.",
          note: "The man was on the beach hours before dawn \u2014 lying still while the evening walkers passed."
        },
        {
          q: "Have the police said anything?",
          a: "Only that he carried no name at all. But I heard an officer mention a suitcase \u2014 left at the railway station cloakroom. Funny place to leave your life, isn\u2019t it?",
          hintScene: "railway"
        },
        {
          q: "What was odd about his shoes?",
          requires: "shoes",
          a: "Polished like he was going to church, and not a grain of sand on them. Now, how does a man lie down on a beach and keep his shoes that clean? I\u2019ll tell you \u2014 he didn\u2019t walk here. Someone laid him down gentle.",
          note: "The walker swears the man was carried to the seawall \u2014 he never walked onto the sand."
        }
      ]
    },
    lawson: {
      name: "Det. Sgt. Lawson", scene: "station", role: "Lead detective",
      intro: "A tired man with ink on his fingers looks up from the case file. \u2018Another look at our nameless friend, eh?\u2019",
      topics: [
        {
          q: "What does \u2018Tamam Shud\u2019 mean?",
          requires: "scrap",
          a: "Persian. \u2018It is ended.\u2019 Torn from a book of poems \u2014 The Rubaiyat of Omar Khayyam. We\u2019re checking every copy in the city. Find the book it was torn from, and we\u2019ll have our first real lead.",
          unlockScene: "car",
          note: "Lawson is hunting a rare book of Persian poetry. If it turns up, the car it was found in matters."
        },
        {
          q: "What do the cigarettes tell you?",
          requires: "cigarettes",
          a: "A man buys an Army Club packet but smokes Kensitas? Either he borrowed the packet \u2014 or he wanted us reading the wrong label. File it under \u2018deliberate\u2019.",
          note: "The mismatched cigarettes look deliberate \u2014 like the removed labels."
        },
        {
          q: "Any idea who he is?",
          a: "Forties, well-kept, strong hands, shoes polished. No wedding ring. Not a drifter \u2014 but beyond that? Nothing. It\u2019s as if he stepped out of nowhere."
        }
      ]
    },
    porter: {
      name: "Station Porter", scene: "railway", role: "Cloakroom attendant",
      intro: "An older man in a railway cap polishes the counter. \u2018That suitcase? Aye, I remember it.\u2019",
      topics: [
        {
          q: "Who checked in this suitcase?",
          requires: "suitcase",
          a: "Yesterday morning. Well-dressed fellow, in a hurry, barely a word. Paid, took no ticket stub I could find later. Never came back for it.",
          note: "The suitcase owner was in a hurry \u2014 and never returned."
        },
        {
          q: "Does the name \u2018T. Keane\u2019 mean anything to you?",
          requires: "keane",
          a: "Never heard it \u2014 and I\u2019ve worked this station twenty years. If that\u2019s his name, he wasn\u2019t from around here.",
          note: "\u2018T. Keane\u2019 matches no local. The name may be false \u2014 or borrowed."
        },
        {
          q: "The coat\u2019s stitching is American, they say. Mean anything?",
          requires: "coat",
          a: "Means he wasn\u2019t from Adelaide, that\u2019s certain. Twenty years I\u2019ve worked this station, and I\u2019ve seen that stitching exactly once \u2014 on a Yank sailor\u2019s jacket, back in the war. Whatever brought him here, he crossed an ocean to get to it.",
          note: "The American stitching points overseas \u2014 the porter has seen it once, on a wartime sailor."
        }
      ]
    }
  };

  /* ------------------------------ THEORIES ------------------------------ */
  /* The deduction board: drag each clue onto the theory it supports.
     Clues listed in no theory's supports are decoys — they bounce back.  */
  var THEORIES = [
    {
      id: "spy",
      title: "A spy on a secret mission",
      desc: "Removed labels, a coded message, the wrong cigarettes in the right packet, a book of Persian poetry \u2014 the tradecraft of a man who could not afford a name.",
      supports: ["rubaiyat", "labels", "cigarettes", "code"]
    },
    {
      id: "farewell",
      title: "He ended his own life",
      desc: "\u2018It is ended.\u2019 No struggle, no panic, a face nobody ever claimed \u2014 a man who put his affairs in order and lay down facing the sea.",
      supports: ["scrap", "autopsy", "bust"]
    },
    {
      id: "meeting",
      title: "He came to meet someone",
      desc: "A suitcase for a short stay, a borrowed name, shoes that never touched the sand \u2014 a man carried to a rendezvous with someone who never came.",
      supports: ["suitcase", "keane", "shoes"]
    }
  ];

  /* -------------------------------- INTRO ------------------------------- */
  var INTRO = [
    {
      kicker: "Adelaide, Australia",
      title: "December 1st, 1948 \u00B7 6:30 AM",
      text: "On Somerton beach, a well-dressed man is found resting against the seawall \u2014 as if asleep. He will never wake. In his pocket: no wallet, no name. Only questions."
    },
    {
      kicker: "The mystery deepens",
      title: "A man with no name",
      text: "Every clothing label has been cut away. In his fob pocket, police find a tiny scrap of paper with two strange words: TAMAM SHUD. The inquest will call it one of Australia\u2019s strangest cases."
    },
    {
      kicker: "Your assignment",
      title: "Detective, the case is yours",
      text: "Search four locations, question the witnesses, and gather at least 8 of the 13 clues. Then face the deduction board \u2014 match every piece of evidence to its theory \u2014 and close the file, if you can."
    }
  ];

  var DATA = {
    CLUES: CLUES,
    SCENES: SCENES,
    SCENE_ORDER: SCENE_ORDER,
    NPCS: NPCS,
    THEORIES: THEORIES,
    INTRO: INTRO,
    CLUES_TO_UNLOCK_DEDUCTION: 8,
    /* Scoring is thoroughness-based: clues (100) + insights (50) + deduction
       matches (150 each) + witnesses questioned. No speed bonus — a careful
       read of the case always outscores a fast skim. Max = 3150. */
    RANKS: [
      { min: 2700, title: "Chief Inspector" },
      { min: 2000, title: "Detective Sergeant" },
      { min: 1300, title: "Constable" },
      { min: 0, title: "Rookie" }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = DATA;
  } else {
    root.BK_DATA = DATA;
  }
})(typeof window !== "undefined" ? window : this);
