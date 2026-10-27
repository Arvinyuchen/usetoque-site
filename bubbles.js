// The query bubbles beside the hero phone: CSS springs them in and keeps them bobbing; this swaps one bubble at a time
// for another query, so more of what people ask Toque gets shown. Every query here is one the app answers well today.
(function () {
  var stage = document.querySelector(".stage"), box = document.querySelector(".bubbles");
  if (!stage || !box) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var bubbles = Array.prototype.slice.call(box.querySelectorAll(".bubble > span"));
  // The ones in the page show first; these wait their turn. Narrow screens show only a few bubbles, so the queries in
  // the hidden ones take turns too.
  var all = bubbles.map(function (el) { return el.textContent; }).concat([
    "dan dan noodles", "spicy noodles under $20", "gluten-free pasta", "vegetarian dumplings",
    "mild butter chicken", "tacos", "bibimbap", "spicy fried chicken"]);
  var cursor = bubbles.length;
  var SPRING = "cubic-bezier(.34, 1.36, .54, 1)";
  var recent = [];

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function shown(el) { return el.getClientRects().length > 0; }
  function next() {
    var onScreen = bubbles.filter(shown).map(function (el) { return el.textContent; });
    for (var n = 0; n < all.length; n++) {
      var q = all[cursor++ % all.length];
      if (onScreen.indexOf(q) < 0) return q;
    }
    return all[0];
  }

  // Pause everything while the hero is off screen, like the phone demos.
  var visible = false, wake = null;
  new IntersectionObserver(function (e) {
    visible = e[0].isIntersecting;
    stage.classList.toggle("still", !visible);
    if (visible && wake) { wake(); wake = null; }
  }).observe(stage);
  function whenVisible() { return visible ? Promise.resolve() : new Promise(function (r) { wake = r; }); }

  function swap(el) {
    var out = el.animate([
      { opacity: 1, transform: "none" },
      { opacity: 0, transform: "translateY(-6px) scale(.9)" }
    ], { duration: 380, easing: "cubic-bezier(.4, 0, 1, 1)", fill: "forwards" });
    return out.finished.then(function () {
      el.textContent = next();
      var back = el.animate([
        { opacity: 0, transform: "translateY(10px) scale(.84)" },
        { opacity: 1, transform: "none" }
      ], { duration: 900, easing: SPRING });
      out.cancel();
      return back.finished;
    });
  }

  async function loop() {
    await wait(3400); // let the entrance finish
    for (;;) {
      await whenVisible();
      // Any bubble on screen at this width, but not one just swapped (the last two when there are plenty).
      var on = bubbles.filter(shown);
      var pool = on.filter(function (el) { return recent.indexOf(el) < 0; });
      if (!pool.length) pool = on;
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
