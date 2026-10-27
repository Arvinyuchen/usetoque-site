// The search demo on the homepage: real Toque screenshots, moved by the page
// so it stays smooth and sharp on any screen.
(function () {
  var demo = document.getElementById("demo");
  if (!demo) return;
  function $(c) { return demo.querySelector(c); }
  var home = $(".d-home"), field = $(".d-field"), caret = $(".d-caret"), kb = $(".d-kb"),
      results = $(".d-results"), list = $(".d-list"), touch = $(".d-touch");
  var FRAMES = 30;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    results.style.transform = "none";
    return;
  }

  function frame(i) { field.style.backgroundPosition = "0 " + (i / (FRAMES - 1) * 100) + "%"; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function move(el, from, to, ms, easing) {
    var a = el.animate([{ transform: from }, { transform: to }], { duration: ms, easing: easing, fill: "forwards" });
    return a.finished.then(function () { el.style.transform = to; a.cancel(); });
  }
  function tap(x, y) {
    touch.style.left = x + "%";
    touch.style.top = y + "%";
    return touch.animate([
      { opacity: 0, transform: "translate(-50%, -50%) scale(.6)" },
      { opacity: 1, transform: "translate(-50%, -50%) scale(1)", offset: .35 },
      { opacity: 0, transform: "translate(-50%, -50%) scale(1.15)" }
    ], { duration: 480, easing: "ease-out" }).finished;
  }

  var visible = false, wake = null;
  new IntersectionObserver(function (e) {
    visible = e[0].isIntersecting;
    if (visible && wake) { wake(); wake = null; }
  }).observe(demo);
  function whenVisible() { return visible ? Promise.resolve() : new Promise(function (r) { wake = r; }); }

  var IOS = "cubic-bezier(.25, .9, .3, 1)";
  // Pause after each typed character of "something warm and comforting".
  var gaps = [85, 75, 80, 70, 90, 75, 80, 70, 150, 85, 75, 80, 140, 80, 75, 140, 85, 75, 80, 70, 85, 75, 80, 70, 75, 80, 70, 90, 80];

  function reset() {
    home.style.transform = "";
    results.style.transform = "";
    list.style.transform = "";
    kb.style.transform = "";
    field.style.opacity = 0;
    caret.style.opacity = 0;
    frame(0);
  }

  async function cycle() {
    reset();
    await whenVisible();
    await wait(1100);
    await tap(50, 23.7);
    field.style.opacity = 1;
    caret.style.opacity = 1;
    await move(kb, "translateY(100%)", "translateY(0)", 420, IOS);
    await wait(450);
    caret.style.opacity = 0;
    for (var i = 1; i < FRAMES; i++) { frame(i); await wait(gaps[i - 1] || 80); }
    await wait(650);
    await tap(86.8, 88.9);
    await Promise.all([
      move(kb, "translateY(0)", "translateY(100%)", 380, "cubic-bezier(.4, 0, .9, .6)"),
      move(home, "translateX(0)", "translateX(-30%)", 560, IOS),
      move(results, "translateX(100%)", "translateX(0)", 560, IOS)
    ]);
    await wait(900);
    await move(list, "translateY(0)", "translateY(-17%)", 1300, "cubic-bezier(.3, .1, .15, 1)");
    await wait(650);
    await move(list, "translateY(-17%)", "translateY(-36%)", 1500, "cubic-bezier(.3, .1, .15, 1)");
    await wait(1800);
    field.style.opacity = 0;
    await Promise.all([
      move(results, "translateX(0)", "translateX(100%)", 520, IOS),
      move(home, "translateX(-30%)", "translateX(0)", 520, IOS)
    ]);
    await wait(500);
  }

  var imgs = Array.prototype.slice.call(demo.querySelectorAll("img"));
  var sprite = new Image();
  sprite.src = "img/demo/field.jpg";
  imgs.push(sprite);
  Promise.all(imgs.map(function (im) { return im.decode ? im.decode().catch(function () {}) : Promise.resolve(); }))
    .then(async function () { for (;;) await cycle(); });
})();
