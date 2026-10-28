// The search demo on the homepage: real Toque screenshots, moved by the page so it stays smooth and sharp on any
// screen. The query is typed as live text over the search field. On its own it loops "something warm and comforting";
// a query bubble (bubbles.js) can ask it to search for that query instead and show that query's real results.
(function () {
  var demo = document.getElementById("demo");
  if (!demo) return;
  function $(c) { return demo.querySelector(c); }
  var home = $(".d-home"), field = $(".d-field"), text = $(".d-text"), kb = $(".d-kb"),
      results = $(".d-results"), list = $(".d-list"), touch = $(".d-touch");
  var DEFAULT = "something warm and comforting", LABEL = demo.getAttribute("aria-label");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Results screenshots: the default one is in the page; a bubble's loads when it's wanted.
  var cache = {};
  cache[DEFAULT] = { ready: Promise.resolve(list) };
  function slug(q) { return q.toLowerCase().replace(/\$/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function get(q, low) {
    var e = cache[q];
    if (e) return e;
    var img = new Image();
    img.alt = "";
    img.className = "d-list";
    if (low) img.fetchPriority = "low";
    img.src = "img/demo/q/" + slug(q) + ".webp";
    e = cache[q] = { ready: new Promise(function (ok, no) { img.onload = function () { ok(img); }; img.onerror = no; }) };
    e.ready.catch(function () { if (cache[q] === e) delete cache[q]; });
    return e;
  }
  function decoded(img) { return img.decode ? img.decode().then(function () { return img; }, function () { return img; }) : Promise.resolve(img); }
  function show(img) { if (img !== list) { list.replaceWith(img); list = img; } list.style.transform = ""; }
  function label(q) {
    demo.setAttribute("aria-label", q === DEFAULT ? LABEL : "Typing “" + q + "” into Toque and getting the places nearby that serve it");
  }

  // Idle prefetch: up to four bubbles' results, one at a time, once the page has settled and only while the hero is in
  // view; never on Save-Data or a 2G connection. Hover, focus and touch fetch at once (prefetch(q, true)).
  var conn = navigator.connection || {}, frugal = conn.saveData || /2g/.test(conn.effectiveType || "");
  var idleQueue = [], idleLeft = 4, settled = false, fetching = false, visible = false, wakers = [];
  function prefetch(q, now) {
    if (cache[q]) return;
    if (now) { get(q); return; }
    if (frugal || idleLeft <= 0 || idleQueue.indexOf(q) >= 0) return;
    idleQueue.push(q);
    pump();
  }
  function pump() {
    if (!settled || fetching || !visible || idleLeft <= 0 || !idleQueue.length) return;
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 300); };
    fetching = true;
    idle(function () {
      fetching = false;
      if (!visible) return; // pump() runs again when the hero is back in view
      var q = idleQueue.shift();
      if (cache[q]) return pump();
      idleLeft--;
      fetching = true;
      get(q, true).ready.then(next, next);
    }, { timeout: 4000 });
  }
  function next() { fetching = false; pump(); }
  function settle() { setTimeout(function () { settled = true; pump(); }, 2500); }
  if (document.readyState === "complete") settle(); else window.addEventListener("load", settle);

  new IntersectionObserver(function (e) {
    visible = e[0].isIntersecting;
    if (visible) { wakers.splice(0).forEach(function (f) { f(); }); pump(); }
  }).observe(demo);

  // Without motion: a bubble swaps straight to its results.
  if (reduce) {
    results.style.transform = "none";
    var latest = 0;
    window.toqueDemo = {
      prefetch: prefetch,
      play: function (q) {
        var n = ++latest;
        label(q);
        get(q).ready.then(decoded).then(function (img) { if (n === latest) show(img); }, function () {});
        return new Promise(function () {}); // the bubble stays marked until another is tapped
      }
    };
    return;
  }

  // Each run has a token. A new run cancels the old one's animations and timers at once, holding everything where it
  // was, and starts from there.
  var token = 0, cancels = [], running = [], ABORT = {};
  function noop() {}
  function guard(p, t) {
    return new Promise(function (ok, no) {
      if (t !== token) return no(ABORT);
      function stop() { no(ABORT); }
      function drop() { var i = cancels.indexOf(stop); if (i >= 0) cancels.splice(i, 1); }
      cancels.push(stop);
      p.then(function (v) { drop(); if (t === token) ok(v); else no(ABORT); },
             function (e) { drop(); no(t === token ? e : ABORT); });
    });
  }
  function interrupt() {
    token++;
    running.splice(0).forEach(function (a) {
      try { a.commitStyles(); } catch (e) {}
      a.cancel();
    });
    touch.getAnimations().forEach(function (a) { a.cancel(); });
    cancels.splice(0).forEach(function (f) { f(); });
  }
  function wait(ms, t) {
    return guard(new Promise(function (r) { setTimeout(r, ms); }), t).then(function () {
      if (!visible) return guard(new Promise(function (r) { wakers.push(r); }), t);
    });
  }
  function move(el, to, ms, easing, t) {
    var a = el.animate([{ transform: getComputedStyle(el).transform }, { transform: to }],
                       { duration: ms, easing: easing, fill: "forwards" });
    running.push(a);
    return guard(a.finished, t).then(function () {
      el.style.transform = to;
      var i = running.indexOf(a);
      if (i >= 0) running.splice(i, 1);
      a.cancel();
    });
  }
  function tap(x, y, t) {
    touch.style.left = x + "%";
    touch.style.top = y + "%";
    return guard(touch.animate([
      { opacity: 0, transform: "translate(-50%, -50%) scale(.6)" },
      { opacity: 1, transform: "translate(-50%, -50%) scale(1)", offset: .35 },
      { opacity: 0, transform: "translate(-50%, -50%) scale(1.15)" }
    ], { duration: 480, easing: "ease-out" }).finished, t);
  }
  function type(s) {
    text.textContent = s;
    field.classList.toggle("filled", s.length > 0);
  }

  var IOS = "cubic-bezier(.25, .9, .3, 1)", SCROLL = "cubic-bezier(.3, .1, .15, 1)";
  // Pause after each typed character of the default query; other queries get a similar rhythm.
  var GAPS = [85, 75, 80, 70, 90, 75, 80, 70, 150, 85, 75, 80, 140, 80, 75, 140, 85, 75, 80, 70, 85, 75, 80, 70, 75, 80, 70, 90, 80];
  function gap(q, i) {
    if (q === DEFAULT) return GAPS[i] || 80;
    return q[i] === " " || q[i + 1] === " " ? 135 : 68 + (q.charCodeAt(i) * 7) % 25;
  }

  var kbUp = false, resultsIn = false;

  // Back to the home screen with an empty field, from wherever the last run was cut off. A keyboard that is up (or on
  // its way up) on the home screen stays up, so a new query just replaces the old one.
  function rewind(t) {
    var moves = [];
    type("");
    if (resultsIn) {
      field.classList.remove("on");
      moves.push(move(results, "translateX(100%)", 420, IOS, t), move(home, "translateX(0)", 420, IOS, t),
                 move(kb, "translateY(100%)", 300, IOS, t));
    } else if (kbUp) {
      moves.push(move(kb, "translateY(0)", 240, IOS, t));
    } else {
      field.classList.remove("on");
      moves.push(move(kb, "translateY(100%)", 240, IOS, t), move(home, "translateX(0)", 240, IOS, t),
                 move(results, "translateX(100%)", 240, IOS, t));
    }
    return Promise.all(moves).then(function () { resultsIn = false; list.style.transform = ""; });
  }

  async function play(q, t, asked) {
    var want = get(q); // start loading now; the typing gives it time
    label(q);
    await rewind(t);
    if (!kbUp) {
      await wait(asked ? 200 : 1100, t);
      await tap(50, 23.7, t);
      field.classList.add("on", "idle");
      kbUp = true;
      await move(kb, "translateY(0)", 420, IOS, t);
    }
    await wait(asked ? 250 : 450, t);
    field.classList.remove("idle");
    for (var i = 0; i < q.length; i++) { type(q.slice(0, i + 1)); await wait(gap(q, i), t); }
    field.classList.add("idle");
    await wait(asked ? 420 : 650, t);
    // If the results aren't here yet, hold on the typed query, caret blinking, until they are (and are decoded).
    show(await guard(want.ready.then(decoded), t));
    field.classList.remove("idle");
    await tap(86.8, 88.9, t);
    kbUp = false;
    resultsIn = true;
    await Promise.all([
      move(kb, "translateY(100%)", 380, "cubic-bezier(.4, 0, .9, .6)", t),
      move(home, "translateX(-30%)", 560, IOS, t),
      move(results, "translateX(0)", 560, IOS, t)
    ]);
    // Scroll to the end of the list in two flicks; how far depends on how long this query's results are.
    var end = Math.max(0, 1 - demo.clientHeight * list.naturalWidth / (demo.clientWidth * list.naturalHeight)) * 100;
    await wait(900, t);
    if (end > 4) {
      await move(list, "translateY(" + (-end * .47).toFixed(2) + "%)", 1300, SCROLL, t);
      await wait(650, t);
      await move(list, "translateY(" + (-end).toFixed(2) + "%)", 1500, SCROLL, t);
    }
    await wait(asked ? 3600 : 1800, t);
    field.classList.remove("on");
    type("");
    resultsIn = false;
    await Promise.all([
      move(results, "translateX(100%)", 520, IOS, t),
      move(home, "translateX(0)", 520, IOS, t)
    ]);
    list.style.transform = "";
    await wait(500, t);
  }

  // The loop: the default query, unless a bubble asked for another. A click cuts in at once; the latest one wins.
  var asked = null, done = null;
  function finish(f) { if (f) f(); }
  async function loop() {
    for (;;) {
      var t = token, q = asked || DEFAULT, end = done;
      asked = done = null;
      try {
        await play(q, t, !!end);
        finish(end);
        if (end) await wait(1800, t); // a moment on the home screen before the loop carries on
      } catch (e) {
        finish(end);
        if (e !== ABORT && t === token) { // the results didn't load: put the keyboard away and carry on
          interrupt();
          kbUp = resultsIn = false;
          await rewind(token).catch(noop);
          await new Promise(function (r) { setTimeout(r, 1000); });
        }
      }
    }
  }

  window.toqueDemo = {
    prefetch: prefetch,
    // Search for q now. Resolves when that run is over: finished, failed or replaced by a newer one.
    play: function (q) {
      get(q);
      finish(done);
      return new Promise(function (r) { asked = q; done = r; interrupt(); });
    }
  };

  results.style.transform = "translateX(100%)";
  kb.style.transform = "translateY(100%)";
  home.style.transform = "translateX(0)";
  Promise.all(Array.prototype.map.call(demo.querySelectorAll("img"), decoded)).then(loop);
})();
