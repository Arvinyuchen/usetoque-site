// The query bubbles beside the hero phone. CSS springs them in and keeps them bobbing; this swaps one bubble at a time
// for another query, so more of what people ask Toque gets shown, and makes each one a button: tapping it has the
// phone demo (demo.js) search for that query and show its real results. Every query here has been run in the app,
// and its results are the screenshot in img/demo/q/.
(function () {
  var stage = document.querySelector(".stage"), box = document.querySelector(".bubbles");
  if (!stage || !box) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var demo = window.toqueDemo;

  var bubbles = Array.prototype.slice.call(box.querySelectorAll(".bubble > button"));
  // The ones in the page show first; these wait their turn. Narrow screens show only a few bubbles, so the queries in
  // the hidden ones take turns too.
  var all = bubbles.map(function (el) { return el.textContent; }).concat([
    "dan dan noodles", "spicy noodles under $20", "vegetarian dumplings", "mild butter chicken", "tacos",
    "spicy fried chicken"]);
  var cursor = bubbles.length;
  var SPRING = "cubic-bezier(.34, 1.36, .54, 1)";
  var recent = [], active = null, clicks = 0;

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function shown(el) { return el.getClientRects().length > 0; }
  function name(el) { el.setAttribute("aria-label", "Show results for " + el.textContent); }
  function next() {
    var onScreen = bubbles.filter(shown).map(function (el) { return el.textContent; });
    for (var n = 0; n < all.length; n++) {
      var q = all[cursor++ % all.length];
      if (onScreen.indexOf(q) < 0) return q;
    }
    return all[0];
  }
  function warm(el) { if (demo && shown(el)) demo.prefetch(el.textContent, false); }

  // Tap a bubble: the phone searches for it. The bubble stays marked, and isn't swapped out, until that search is over.
  function setActive(el) {
    if (active) active.classList.remove("on");
    active = el;
    if (el) el.classList.add("on");
  }
  bubbles.forEach(function (el) {
    name(el);
    function soon() { if (demo) demo.prefetch(el.textContent, true); }
    el.addEventListener("pointerenter", soon);
    el.addEventListener("pointerdown", soon);
    el.addEventListener("focus", soon);
    el.addEventListener("click", function () {
      if (!demo) return;
      var mine = ++clicks;
      setActive(el);
      demo.play(el.textContent).then(function () { if (mine === clicks) setActive(null); });
    });
  });
  bubbles.forEach(warm);

  // Pause everything while the hero is off screen, like the phone demos.
  var visible = false, wake = null;
  new IntersectionObserver(function (e) {
    visible = e[0].isIntersecting;
    stage.classList.toggle("still", !visible);
    if (visible && wake) { wake(); wake = null; }
  }).observe(stage);
  function whenVisible() { return visible ? Promise.resolve() : new Promise(function (r) { wake = r; }); }

  if (reduce) return;

  function swap(el) {
    var out = el.animate([
      { opacity: 1, transform: "none" },
      { opacity: 0, transform: "translateY(-6px) scale(.9)" }
    ], { duration: 380, easing: "cubic-bezier(.4, 0, 1, 1)", fill: "forwards" });
    return out.finished.then(function () {
      el.textContent = next();
      name(el);
      warm(el);
      var back = el.animate([
        { opacity: 0, transform: "translateY(10px) scale(.84)" },
        { opacity: 1, transform: "none" }
      ], { duration: 900, easing: SPRING });
      out.cancel();
      return back.finished;
    });
  }

  // Once per visit, a soft tap ripple on one bubble, to say they can be tapped.
  var nudged = false;
  try { nudged = sessionStorage.getItem("toque-nudged") === "1"; } catch (e) {}
  function nudge() {
    if (nudged || clicks) return;
    var el = bubbles.filter(shown)[0];
    if (!el) return;
    nudged = true;
    try { sessionStorage.setItem("toque-nudged", "1"); } catch (e) {}
    el.classList.add("nudge");
    setTimeout(function () { el.classList.remove("nudge"); }, 1600);
  }

  async function loop() {
    await wait(2700); // let the entrance finish
    await whenVisible();
    nudge();
    await wait(1400);
    for (;;) {
      await whenVisible();
      // Any bubble on screen at this width, but not one just swapped (the last two when there are plenty), not the
      // one whose search is playing, and not one under the pointer or keyboard focus.
      var on = bubbles.filter(shown);
      var free = on.filter(function (el) { return el !== active && !el.matches(":hover") && el !== document.activeElement; });
      var pool = free.filter(function (el) { return recent.indexOf(el) < 0; });
      if (!pool.length) pool = free;
      if (pool.length) {
        var el = pool[Math.floor(Math.random() * pool.length)];
        recent.push(el);
        while (recent.length > (on.length > 4 ? 2 : 1)) recent.shift();
        await swap(el);
      }
      await wait(2400);
    }
  }
  loop();
})();
