// The map demo on the homepage: map captures at four zoom levels, zoomed by the page, with the app's own bars,
// filter panel and card (cropped from real screenshots) laid over them. The zoom frames are bare captures (no Apple
// Maps logo or Legal link), so the bottom bands carry Apple's attribution, cropped from real captures of the normal
// map, at a fixed size and in the app's place: bottom left, above the tab bar. The card rests above it, never over it.
(function () {
  var demo = document.getElementById("mapdemo");
  if (!demo) return;
  function $(c) { return demo.querySelector(c); }
  function $$(c) { return Array.prototype.slice.call(demo.querySelectorAll(c)); }
  var rungs = $$(".m-zoom img"), touch = $(".d-touch");
  var city = $(".m-f-city"), street = $(".m-f-street"), filtered = $(".m-f-filtered");
  var bandsCity = $$(".m-band.m-city"), bandsStreet = $$(".m-band.m-street");
  var locate = $(".m-locate"), badge = $(".m-badge"), pin = $(".m-pin");
  var panel = $(".m-panel"), panelOpen = $(".m-p-open"), panelBars = $(".m-p-bars"), card = $(".m-card");
  // Each capture's latitude span relative to the first: 0.40, 0.09, 0.02 and 0.005 degrees.
  var K = [1, 0.40 / 0.09, 0.40 / 0.02, 0.40 / 0.005];

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    [filtered, pin].forEach(function (el) { el.style.opacity = 1; });
    card.style.transform = "none";
    city.style.opacity = 0;
    return;
  }

  var IOS = "cubic-bezier(.25, .9, .3, 1)";
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function run(el, frames, ms, easing) {
    var a = el.animate(frames, { duration: ms, easing: easing || IOS, fill: "forwards" });
    return a.finished.then(function () {
      var last = frames[frames.length - 1];
      for (var k in last) if (k !== "offset") el.style[k] = last[k];
      a.cancel();
    });
  }
  function fade(el, to, ms) { return run(el, [{ opacity: getComputedStyle(el).opacity }, { opacity: to }], ms || 250, "ease"); }
  function tap(x, y) {
    touch.style.left = x + "%";
    touch.style.top = y + "%";
    return touch.animate([
      { opacity: 0, transform: "translate(-50%, -50%) scale(.6)" },
      { opacity: 1, transform: "translate(-50%, -50%) scale(1)", offset: .35 },
      { opacity: 0, transform: "translate(-50%, -50%) scale(1.15)" }
    ], { duration: 480, easing: "ease-out" }).finished;
  }

  // Draws the zoom at Z (1 = the whole city, K[3] = Braddon). The next capture fades in, edges feathered, while it is
  // still smaller than the screen, so nothing is ever shown much larger than it was captured.
  function draw(Z) {
    var shown = 0;
    for (var i = 0; i < rungs.length; i++) {
      var s = Z / K[i], o = 1;
      if (i > 0) o = Math.min(1, Math.max(0, (s - 0.42) / 0.25));
      rungs[i].style.transform = "scale(" + s + ")";
      rungs[i].style.opacity = o;
      if (o > 0) shown = i;
    }
    // Hide what is fully covered, so the browser doesn't paint it.
    for (var j = 0; j < rungs.length; j++) rungs[j].style.visibility = (j < shown - 1) ? "hidden" : "visible";
    var t = Math.min(1, Math.max(0, (Z / K[3] - 0.42) / 0.25));
    bandsStreet.forEach(function (b) { b.style.opacity = t; });
  }
  function ease(p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function zoom(from, to, ms) {
    return new Promise(function (done) {
      var t0 = null, a = Math.log(from), b = Math.log(to);
      function step(now) {
        if (t0 === null) t0 = now;
        var p = Math.min(1, (now - t0) / ms);
        draw(Math.exp(a + (b - a) * ease(p)));
        if (p < 1) requestAnimationFrame(step); else done();
      }
      requestAnimationFrame(step);
    });
  }

  var visible = false, wake = null;
  new IntersectionObserver(function (e) {
    visible = e[0].isIntersecting;
    if (visible && wake) { wake(); wake = null; }
  }).observe(demo);
  function whenVisible() { return visible ? Promise.resolve() : new Promise(function (r) { wake = r; }); }

  function reset() {
    draw(1);
    city.style.opacity = 1;
    [street, filtered, locate, badge, pin, panel, panelOpen, panelBars].forEach(function (el) { el.style.opacity = 0; });
    panel.style.transform = "";
    card.style.transform = "translateY(175%)";
  }

  async function cycle() {
    reset();
    await whenVisible();
    await wait(1400);
    await tap(49.4, 49.5);
    await fade(city, 0, 250);
    await zoom(1, K[3], 2400);
    await fade(street, 1, 300);
    await wait(1000);

    await tap(92.3, 9.45);
    fade(locate, 1, 150);
    await run(panel, [{ opacity: 0, transform: "scale(.92)" }, { opacity: 1, transform: "scale(1)" }], 420, "cubic-bezier(.34, 1.25, .5, 1)");
    await wait(600);
    await tap(80.4, 19.25);
    fade(badge, 1, 250);
    await fade(panelOpen, 1, 250);
    await wait(900);
    await tap(74.9, 27.8);
    fade(filtered, 1, 250);
    await fade(panelBars, 1, 250);
    await wait(1100);

    await tap(28, 40.7);
    run(panel, [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.95)" }], 300, "ease-in");
    fade(locate, 0, 200);
    fade(pin, 1, 220);
    await run(card, [{ transform: "translateY(175%)" }, { transform: "translateY(0)" }], 460, IOS);
    await wait(2400);

    run(card, [{ transform: "translateY(0)" }, { transform: "translateY(175%)" }], 360, "cubic-bezier(.4, 0, .9, .6)");
    await fade(pin, 0, 220);
    await wait(250);
    fade(badge, 0, 250);
    fade(street, 0, 250);
    await fade(filtered, 0, 250);
    await zoom(K[3], 1, 2200);
    await fade(city, 1, 300);
    await wait(400);
  }

  function start() {
    var imgs = $$("img");
    imgs.forEach(function (im) { im.loading = "eager"; });
    Promise.all(imgs.map(function (im) { return im.decode ? im.decode().catch(function () {}) : Promise.resolve(); }))
      .then(async function () { for (;;) await cycle(); });
  }
  // Load the frames only when the demo is getting close.
  new IntersectionObserver(function (e, io) {
    if (e[0].isIntersecting) { io.disconnect(); start(); }
  }, { rootMargin: "800px 0px" }).observe(demo);
  draw(1);
})();
