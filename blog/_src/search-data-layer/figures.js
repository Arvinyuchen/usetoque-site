// Figures for "Where the data comes from". Plain JavaScript, no libraries. Without JavaScript, figure 1 is a still
// wall of searches, figure 2 is a complete picture without its highlights, and figure 4 shows its text summary.
(function () {
  document.documentElement.classList.add("js");

  // A segmented control's white thumb: move(button) slides it under that button, move(null) fades it out. Appearing,
  // it fades in where it is rather than sliding over from the last button.
  function thumbOf(kinds) {
    const thumb = document.createElement("span");
    thumb.className = "thumb";
    thumb.setAttribute("aria-hidden", "true");
    kinds.prepend(thumb);
    return (b) => {
      if (!b) return kinds.classList.remove("thumbed");
      const appearing = !kinds.classList.contains("thumbed");
      if (appearing) thumb.style.transition = "none";
      thumb.style.width = `${b.offsetWidth}px`;
      thumb.style.transform = `translateX(${b.offsetLeft}px)`;
      if (appearing) { void thumb.offsetWidth; thumb.style.transition = ""; }
      kinds.classList.add("thumbed");
    };
  }

  // Figure 1: every search in the evaluation set, packed around a search field. One types itself in every few
  // seconds, and a tag in the field names its kind.
  // The evaluation set's categories, in the three groups the figure shows. Its searches in Chinese are left out of this post.
  const GROUP = { dish: "name", venue: "name", mod: "filter", place: "filter", neg: "filter", mood: "open", cuisine: "open" };
  const GROUPS = { name: "Names", filter: "Filters", open: "Open-ended" };
  const among = (p, group) => GROUP[p.dataset.kind] === group;
  function searches(fig) {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pills = [...fig.querySelectorAll(".p")];
    const typed = fig.querySelector(".typed");
    const kindTag = fig.querySelector(".field .kind");
    // Each row is doubled so it can drift in a seamless loop; the copy is hidden from screen readers.
    if (!still) {
      for (const row of fig.querySelectorAll(".wrow")) {
        const copy = document.createElement("span");
        copy.className = "copy";
        copy.setAttribute("aria-hidden", "true");
        for (const p of row.children) copy.appendChild(p.cloneNode(true));
        row.appendChild(copy);
      }
      fig.classList.add("drift");
    }
    const rows = [...fig.querySelectorAll(".wrow")];
    const wall = fig.querySelector(".wall");
    let typing = 0, timer = 0, visible = false, lastKind = "", filter = "", locked = "";
    const recent = [];
    function type(text) {
      clearInterval(typing);
      fig.classList.add("filled");
      if (still) { typed.textContent = text; return; }
      const chars = Array.from(text);
      let n = 0;
      typed.textContent = "";
      fig.classList.add("typing");
      typing = setInterval(() => {
        typed.textContent += chars[n++];
        if (n >= chars.length) { clearInterval(typing); fig.classList.remove("typing"); }
      }, 55);
    }
    function pick(p) {
      kindTag.textContent = GROUPS[GROUP[p.dataset.kind]];
      fig.querySelectorAll(".p.on").forEach((x) => x.classList.remove("on"));
      p.classList.add("on");
      lastKind = GROUP[p.dataset.kind];
      recent.push(p.textContent);
      if (recent.length > 40) recent.shift();
      type(p.textContent);
    }
    // The next search is one the reader can see: wholly inside the clear middle of the wall, not in the field's row
    // or the faint top and bottom rows, of the picked kind if there is one, else preferably of another kind than the
    // last, and not shown lately.
    function tick() {
      const w = wall.getBoundingClientRect();
      const within = (margin) => {
        const left = w.left + w.width * margin, right = w.right - w.width * margin, out = [];
        for (const [i, row] of rows.entries()) {
          if (i === 0 || i === 3 || i === rows.length - 1) continue;
          for (const p of row.querySelectorAll(".p")) {
            const r = p.getBoundingClientRect();
            if (r.left >= left && r.right <= right && (!filter || among(p, filter))) out.push(p);
          }
        }
        return out;
      };
      // With a kind picked, its searches may all be off to the sides; then look across the whole wall.
      let seen = within(0.18);
      if (!seen.length && filter) seen = within(0.04);
      const fresh = seen.filter((p) => !recent.includes(p.textContent));
      const pool = fresh.filter((p) => GROUP[p.dataset.kind] !== lastKind);
      const from = filter ? (fresh.length ? fresh : seen) : pool.length ? pool : fresh.length ? fresh : seen;
      if (from.length) pick(from[Math.floor(Math.random() * from.length)]);
    }
    function start() { if (!still && !timer) { tick(); timer = setInterval(tick, 3400); } }
    function stop() { clearInterval(timer); timer = 0; }
    // The kinds under the wall: hovering one (or tapping it, which sticks) keeps only its searches clear, and the
    // thumb follows the kind being shown.
    const kinds = fig.querySelector(".kinds");
    const kindButtons = [...kinds.querySelectorAll("button")];
    const move = thumbOf(kinds);
    const place = () => move(kindButtons.find((x) => x.dataset.k === filter));
    function show(group) {
      filter = group;
      fig.classList.toggle("filtering", !!group);
      for (const p of fig.querySelectorAll(".p")) p.classList.toggle("kin", among(p, group));
      kindButtons.forEach((b) => {
        b.classList.toggle("cur", b.dataset.k === group);
        b.setAttribute("aria-pressed", String(b.dataset.k === locked));
      });
      place();
    }
    for (const b of kindButtons) {
      b.addEventListener("mouseenter", () => show(b.dataset.k));
      b.addEventListener("click", () => {
        locked = locked === b.dataset.k ? "" : b.dataset.k;
        show(locked || b.dataset.k);
        if (locked) tick();
      });
    }
    kinds.addEventListener("mouseleave", () => show(locked));
    new ResizeObserver(place).observe(kinds);
    new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
      fig.classList.toggle("still", !visible);
      if (!visible) return stop();
      setTimeout(() => visible && start(), 700);
    }, { threshold: 0.4 }).observe(fig);
  }

  // Figure 2: menu, two models, dish record. The picture is complete without this script; hovering, focusing or tapping
  // an answer in the record only lights the words it came from, in the menu and in the structure model's tree.
  function flow(fig) {
    const rows = [...fig.querySelectorAll(".ans")];
    const marks = (attr) => [...fig.querySelectorAll(`[${attr}]`)];
    let current = null;
    function show(row) {
      current = row;
      const m = row ? row.dataset.m.split(" ") : [], n = row ? row.dataset.n.split(" ") : [];
      for (const el of marks("data-m")) if (!el.classList.contains("ans")) el.classList.toggle("hit", m.includes(el.dataset.m));
      for (const el of marks("data-n")) if (!el.classList.contains("ans")) el.classList.toggle("hit", n.includes(el.dataset.n));
      rows.forEach((r) => r.classList.toggle("on", r === row));
    }
    for (const r of rows) {
      if (!r.dataset.m) continue;
      r.addEventListener("mouseenter", () => show(r));
      r.addEventListener("focus", () => show(r));
      r.addEventListener("click", () => show(current === r ? null : r));
      r.addEventListener("mouseleave", () => { if (document.activeElement !== r) show(null); });
      r.addEventListener("blur", () => show(null));
    }
  }

  // Figure 4: the dish graph around one canonical dish. Numbers are menu dishes labelled with each id
  // (pipeline/data/dish-labels.json on toque main after the #364 fixes, 30 October 2026; the same on label-rerun).
  // TODO(rerun): recount after the Kaggle relabel lands.
  const DISHES = {
    xlb: {
      name: "xiao long bao", n: 18, cuisine: "Shanghainese", broad: "Chinese",
      parent: ["dumplings", 38], family: ["dumplings", 398],
      side: [], sibs: [["jiaozi", "Northern Chinese", 59], ["gyoza", "Japanese", 47], ["dim sim", "Australian", 39]],
      note: "A child of plain dumplings. Spellings include xlb, xiaolongbao and 灌汤包, so each of them points at the same canonical dish."
    },
    ramen: {
      name: "tonkotsu ramen", n: 13, cuisine: "Japanese", broad: "Japanese",
      parent: ["ramen", 106], family: ["noodle soup", 539], broth: "tonkotsu",
      side: [], sibs: [["laksa", "Malaysian", 99], ["pho", "Vietnamese", 53], ["wonton noodle soup", "Cantonese", 10]],
      note: "A child of ramen with a broth component. The broth is read from the menu text by a regular expression, never by the model."
    },
    dandan: {
      name: "dan dan noodles", n: 5, cuisine: "Sichuan", broad: "Chinese",
      parent: null, family: ["sauced noodles", 43],
      side: [["near", "tantanmen", "Japanese ramen"]],
      sibs: [["mazesoba", "Japanese", 7], ["scallion oil noodles", "Shanghainese", 4], ["chilli oil noodles", "Sichuan", 2]],
      note: "Tantanmen is the same idea under another name, in another family. Only 5 menu dishes are labelled dan dan noodles: it is a rare dish here, which is why the neighbours matter."
    },
    souvlaki: {
      name: "souvlaki", n: 8, cuisine: "Greek", broad: "Greek",
      parent: null, family: ["kebab", 647],
      side: [["counterpart", "doner kebab", "Turkish, 201"], ["counterpart", "shawarma", "Lebanese, 8"]],
      sibs: [["shish kebab", "Middle Eastern", 111], ["satay", "Malaysian", 100], ["seekh kebab", "Indian", 91]],
      note: "Doner kebab and shawarma are the dish other cuisines serve in its place. Canberra has 8 souvlaki and 201 doner kebabs on its menus."
    },
    claypot: {
      name: "claypot", n: 75, cuisine: "Cantonese", broad: "Chinese",
      parent: null, family: ["hot pot", 101], firm: true,
      side: [],
      sibs: [["hot pot", "Chinese", 8], ["shabu shabu", "Japanese", 6], ["mala xiang guo", "Sichuan", 4]],
      note: "Marked firm: menus often call a claypot a hot pot (“Seafood Hot Pot”), so the label wins over the words in the name. Fixing this relabelled 49 menu texts."
    }
  };

  const NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function node(svg, x, y, w, title, sub, focus) {
    const g = el("g", { class: "node" + (focus ? " focus" : "") }, svg);
    const h = sub ? 44 : 30;
    el("rect", { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 10 }, g);
    el("text", { x, y: sub ? y - 3 : y + 4.5, "text-anchor": "middle", "font-weight": focus ? 600 : 500 }, g, title);
    if (sub) el("text", { x, y: y + 14, "text-anchor": "middle", class: "sub" }, g, sub);
    return { x, y, w, h };
  }


  function line(svg, d, cls) { el("path", { d, class: "edge " + (cls || "") }, svg); }
  function label(svg, x, y, text) { el("text", { x, y, class: "elabel" }, svg, text); }

  function draw(fig, key) {
    const d = DISHES[key];
    const box = fig.querySelector(".canvas");
    const narrow = box.clientWidth < 540;
    const svg = el("svg", { role: "img", "aria-label": summary(d) });
    box.replaceChildren(svg);
    const cuisineSub = d.broad !== d.cuisine ? `rolls up to ${d.broad}` : "a broad cuisine";
    const side = d.side.map((s) => [s[1], `${s[0] === "near" ? "same dish" : "counterpart"}: ${s[2]}`, s[0] === "near" ? "near" : "equiv"]);
    if (d.broth) side.push([`broth: ${d.broth}`, "a component", ""]);
    let H;
    if (!narrow) {
      const cx = 320, fy = 140;
      const parent = d.parent ? node(svg, cx, 40, 180, d.parent[0], `${d.parent[1]} on menus`) : null;
      const cuisine = node(svg, 540, 40, 170, d.cuisine, cuisineSub);
      const focus = node(svg, cx, fy, 210, d.name, `${d.n} on menus`, true);
      if (parent) { line(svg, `M${cx},${fy - 22} V${62}`); label(svg, cx + 8, 92, "is a"); }
      line(svg, `M${cx + 105},${fy - 12} L${cuisine.x - 85},${cuisine.y + 8}`);
      label(svg, 440, 82, "cuisine");
      side.forEach((s, i) => {
        const y = fy + (i - (side.length - 1) / 2) * 54 + (side.length > 1 ? 18 : 10);
        node(svg, 540, y, 170, s[0], s[1]);
        line(svg, `M${cx + 105},${fy + 6} C${cx + 125},${fy + 6} ${455 - 20},${y} 455,${y}`, s[2]);
      });
      const fam = node(svg, cx, 250, 210, `family: ${d.family[0]}`, `${d.family[1]} menu dishes`);
      line(svg, `M${cx},${fy + 22} V${fam.y - 22}`); label(svg, cx + 8, 200, "family");
      const xs = [110, 320, 530];
      line(svg, `M${cx},${fam.y + 22} V305 M${xs[0]},305 H${xs[2]} ${xs.map((x) => `M${x},305 V318`).join(" ")}`);
      label(svg, cx + 8, 298, "also in the family");
      d.sibs.forEach((s, i) => node(svg, xs[i], 340, 190, s[0], `${s[1]}, ${s[2]}`));
      H = 370;
      svg.setAttribute("viewBox", `0 0 640 ${H}`);
    } else {
      const cx = 170, fy = 112;
      let parent = null, cuisine;
      if (d.parent) { parent = node(svg, 88, 30, 150, d.parent[0], `${d.parent[1]} on menus`); cuisine = node(svg, 252, 30, 150, d.cuisine, cuisineSub); }
      else cuisine = node(svg, cx, 30, 180, d.cuisine, cuisineSub);
      const focus = node(svg, cx, fy, 230, d.name, `${d.n} on menus`, true);
      if (parent) { line(svg, `M88,52 V${fy - 22}`); label(svg, 94, 76, "is a"); }
      line(svg, `M${cuisine.x},52 V${fy - 22}`); label(svg, cuisine.x + 6, 76, "cuisine");
      let y = fy;
      side.forEach((s, i) => {
        y = fy + 66 + i * 54;
        node(svg, cx, y, 230, s[0], s[1]);
        line(svg, `M${cx + 115},${fy} H${328} V${y} H${cx + 115}`, s[2]);
      });
      const famY = y + 70;
      const fam = node(svg, cx, famY, 230, `family: ${d.family[0]}`, `${d.family[1]} menu dishes`);
      line(svg, `M${cx - 115},${fy} H12 V${famY} H${cx - 115}`); label(svg, 16, famY - 8, "family");
      const spine = 72, sx = 195;
      let last = famY;
      d.sibs.forEach((s, i) => {
        last = famY + 64 + i * 52;
        node(svg, sx, last, 210, s[0], `${s[1]}, ${s[2]}`);
        line(svg, `M${spine},${last} H${sx - 105}`);
      });
      line(svg, `M${spine},${famY + 22} V${last}`);
      H = last + 30;
      svg.setAttribute("viewBox", `0 0 340 ${H}`);
    }
    fig.querySelector(".facts").textContent = d.note;
  }

  function summary(d) {
    const bits = [`${d.name}: ${d.n} menu dishes, ${d.cuisine} cuisine`];
    if (d.parent) bits.push(`a kind of ${d.parent[0]}`);
    bits.push(`in the ${d.family[0]} family with ${d.sibs.map((s) => s[0]).join(", ")}`);
    d.side.forEach((s) => bits.push(`${s[0] === "near" ? "same dish as" : "counterpart"} ${s[1]}`));
    return bits.join("; ");
  }

  function graph() {
    const fig = document.getElementById("fig-graph");
    if (!fig) return;
    const tabs = fig.querySelector(".tabs");
    let current = "xlb";
    for (const b of tabs.querySelectorAll("button")) {
      b.addEventListener("click", () => {
        current = b.dataset.dish;
        tabs.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        draw(fig, current);
      });
    }
    fig.querySelector(".noscript").remove();
    tabs.hidden = false;
    draw(fig, current);
    let w = fig.clientWidth;
    window.addEventListener("resize", () => { if (fig.clientWidth !== w) { w = fig.clientWidth; draw(fig, current); } });
  }

  function ready() { document.querySelectorAll(".fig-wall").forEach(searches); document.querySelectorAll(".fig-flow").forEach(flow); graph(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
})();
