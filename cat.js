// Shared zombie cat engine for the timer app (index.html) and the player (player/index.html).
//
// - Clips: every mood has one or more loops, every mood change one or more transition clips.
//   Variants are drawn from a shuffle bag: random order, but each one comes up equally often.
//   Extras are single clips of a mood that only play when asked for (cat.playOnce).
// - Mood machine: changes wait for the end of the running clip and follow the shortest chain of
//   transitions, so the animation never jumps.
// - Scene: graveyard picture, cat, cut-out front rim on top (hides the clips' hard bottom edge).

// ---- Clip list ------------------------------------------------------------------------------
// Keys of `transitions` are "from>to". File names without extension, relative to the clip folder.
const CLIPS = {
  loops: {
    neutral:   ["neutral_loop"],
    happy:     ["happy_loop"],
    notamused: ["notamused_loop", "notamused_eye", "notamused_grim"],
    angry:     ["angry_loop"],
  },
  // Clips that start and end in a mood's pose but are only played on request.
  extras: {
    neutral_look: "neutral",
  },
  transitions: {
    "neutral>happy":     ["neutral_to_happy"],
    "happy>neutral":     ["happy_to_neutral"],
    "neutral>notamused": ["neutral_to_notamused"],
    "notamused>neutral": ["notamused_to_neutral"],
    "notamused>angry":   ["notamused_to_angry"],
    "angry>notamused":   ["angry_to_notamused"],
  },
};

const MOODS = Object.keys(CLIPS.loops);
const EDGES = Object.keys(CLIPS.transitions).map(k => k.split(">"));

// Shortest chain of transitions from one mood to another (BFS).
function moodPath(from, to) {
  const prev = { [from]: null };
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === to) break;
    for (const [a, b] of EDGES) if (a === cur && !(b in prev)) { prev[b] = cur; queue.push(b); }
  }
  const steps = [];
  for (let m = to; m in prev && prev[m] !== null; m = prev[m]) steps.unshift([prev[m], m]);
  return steps;
}

// Shuffle bag: hands out every item once in random order, then reshuffles. Over time all items come
// up equally often, and none is missing for long. A new round never starts with the item that
// ended the previous one, so nothing plays twice in a row.
function createBag(items) {
  let bag = [];
  let last = null;
  return function draw() {
    if (!bag.length) {
      bag = [...items];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      if (bag.length > 1 && bag[bag.length - 1] === last) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    last = bag.pop();
    return last;
  };
}

const bags = {};
function pickVariant(key, list) {
  if (list.length === 1) return list[0];
  bags[key] ??= createBag(list);
  return bags[key]();
}

const easeInOutCubic = p => p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;

// ---- Mood machine ---------------------------------------------------------------------------
// options: clipBase (folder URL with trailing slash), container (element for the hidden <video>s),
// speed, chainSpeed (factor for multi-step chains and hurried changes), mood (start mood),
// onTransitionEnd(from, to), onChange() (called whenever the clip, mood or target changes).
function createCat(options) {
  const opts = { speed: 1.5, chainSpeed: 2, mood: "neutral", ...options };
  const videos = {};
  let mood = opts.mood;
  let target = mood;
  let active = null;         // <video> whose frames are shown
  let activeName = null;
  let transitioning = false;
  let awaitingStart = false;
  let hurry = false;         // calming down: play everything faster until the target is reached
  let pendingOnce = null;    // extra clip to play at the end of the current loop cycle
  let speed = opts.speed;

  const all = [...Object.values(CLIPS.loops).flat(), ...Object.values(CLIPS.transitions).flat(),
    ...Object.keys(CLIPS.extras)];
  for (const name of all) {
    const v = document.createElement("video");
    v.src = `${opts.clipBase}${name}.webm`;
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    opts.container.appendChild(v);
    videos[name] = v;
    v.addEventListener("ended", () => {
      if (v !== active) return;
      if (transitioning) {
        const [from, to] = transitionOf(name);
        mood = to;
        opts.onTransitionEnd?.(from, to);
      }
      next();
    });
  }

  function transitionOf(name) {
    const key = Object.keys(CLIPS.transitions).find(k => CLIPS.transitions[k].includes(name));
    return key.split(">");
  }

  function show(name, rate, loop) {
    const v = videos[name];
    const old = active;
    active = v;
    activeName = name;
    v.loop = loop;
    // Until the seek to 0 has landed, the element may still hold a frame from its last run.
    awaitingStart = v.readyState > 0;   // a fresh element has no old frame to wait out
    v.addEventListener("seeked", () => { if (active === v) awaitingStart = false; }, { once: true });
    v.currentTime = 0;
    v.playbackRate = rate;
    v.play().catch(() => {});
    if (old && old !== v) old.pause();
    opts.onChange?.();
  }

  function next() {
    if (target === mood) {
      transitioning = false;
      hurry = false;
      if (pendingOnce) {
        const once = pendingOnce;
        pendingOnce = null;
        show(once, speed, false);
        return;
      }
      // A single loop repeats seamlessly by itself; with variants every cycle draws from the bag.
      const loops = CLIPS.loops[mood];
      show(pickVariant(`loop:${mood}`, loops), speed, keepLooping());
    } else {
      const steps = moodPath(mood, target);
      transitioning = true;
      const [a, b] = steps[0];
      show(pickVariant(`${a}>${b}`, CLIPS.transitions[`${a}>${b}`]),
        speed * (hurry || steps.length > 1 ? opts.chainSpeed : 1), false);
    }
  }

  // Whether the running loop may simply repeat: only a single loop with nothing else pending.
  function keepLooping() {
    return target === mood && CLIPS.loops[mood].length === 1 && !pendingOnce;
  }

  // Changes wait for the end of the current loop or transition, so the animation never jumps.
  function setMood(m) {
    if (!MOODS.includes(m)) return;
    target = m;
    if (pendingOnce && CLIPS.extras[pendingOnce] !== m) pendingOnce = null;
    if (!transitioning && active) active.loop = keepLooping();
    opts.onChange?.();
  }

  // Play an extra clip of the current mood once, at the end of the running loop cycle.
  function playOnce(name) {
    if (CLIPS.extras[name] !== target) return false;
    pendingOnce = name;
    if (!transitioning && active) active.loop = false;
    opts.onChange?.();
    return true;
  }

  // Calm down quickly: speed up the clip that is playing right now and every step until the target.
  function hurryTo(m) {
    setMood(m);
    if (target === mood && !transitioning) return;
    hurry = true;
    if (active) active.playbackRate = speed * opts.chainSpeed;
  }

  function setSpeed(s) {
    speed = s;
    if (active) active.playbackRate = hurry ? s * opts.chainSpeed : s;
  }

  // The video to draw now, or null while a freshly switched clip has not reached its start yet.
  function frame() {
    const v = active;
    return v && v.readyState >= 2 && !v.seeking && !awaitingStart ? v : null;
  }

  // Start right after the caller has received the returned object (onChange may already use it).
  queueMicrotask(next);

  return {
    setMood, hurryTo, playOnce, setSpeed, frame, videos,
    get pendingOnce() { return pendingOnce; },
    get mood() { return mood; },
    get target() { return target; },
    get clip() { return activeName; },
    get settling() { return awaitingStart; },
  };
}

// ---- Graveyard scene ------------------------------------------------------------------------
// Scene pixels: the picture is 1672x941; the cat clip (640x640) is drawn at cat.x/y/size.
const SCENE = { width: 1672, height: 941, cat: { x: 610, y: 452, size: 460 } };

function createScene(assetBase) {
  const bg = new Image(); bg.src = `${assetBase}scene_bg.jpg`;
  const fg = new Image(); fg.src = `${assetBase}scene_fg.png`;

  // Cat layer: last valid video frame, darkened towards the bottom as if inside the dark hole.
  const catLayer = document.createElement("canvas");
  catLayer.width = catLayer.height = 640;
  const catCtx = catLayer.getContext("2d");
  const shade = catCtx.createLinearGradient(0, 380, 0, 640);
  shade.addColorStop(0, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(0,0,0,0.55)");
  let haveFrame = false;

  return {
    get ready() { return bg.complete && fg.complete; },
    // Keep the last good frame, so a clip switch never shows an empty or stale picture.
    updateCat(video) {
      if (!video) return;
      catCtx.globalCompositeOperation = "copy";
      catCtx.drawImage(video, 0, 0, 640, 640);
      catCtx.globalCompositeOperation = "source-atop";
      catCtx.fillStyle = shade;
      catCtx.fillRect(0, 0, 640, 640);
      haveFrame = true;
    },
    // yOffset moves the cat up (negative) or down inside the grave.
    draw(ctx, yOffset) {
      const c = SCENE.cat;
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(bg, 0, 0);
      if (haveFrame) ctx.drawImage(catLayer, c.x, c.y + yOffset, c.size, c.size);
      ctx.drawImage(fg, 0, 0);
    },
  };
}

// ---- Bobbing --------------------------------------------------------------------------------
// The cat drifts between random heights with cubic ease-in-out, independent of the clips.
// Above 36 px up the clips' cut-off bottom edge would show over the rim, so "up" stays below.
const BOB = { up: 32, down: 28, minDur: 1.5, maxDur: 3.5 };

function createBob() {
  let bob = { from: 0, to: 0, start: 0, dur: 1 };
  return function bobOffset(now) {
    let p = (now - bob.start) / (bob.dur * 1000);
    if (p >= 1) {
      // Next target: a random height, at least a third of the range away so every move is visible.
      const range = BOB.up + BOB.down;
      let to;
      do to = -BOB.up + Math.random() * range; while (Math.abs(to - bob.to) < range / 3);
      bob = { from: bob.to, to, start: now, dur: BOB.minDur + Math.random() * (BOB.maxDur - BOB.minDur) };
      p = 0;
    }
    return bob.from + (bob.to - bob.from) * easeInOutCubic(p);
  };
}
