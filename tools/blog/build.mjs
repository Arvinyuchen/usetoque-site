// Builds the blog: blog/_src/<slug>/index.md -> blog/<slug>/index.html, plus blog/index.html and blog/feed.xml.
//
//   sh tools/blog/build.sh          (runs this file through npx with a pinned markdown-it; no global install)
//
// A post is a folder under blog/_src/. index.md starts with a front matter block:
//
//   ---
//   title: Where the dishes come from
//   description: One sentence for the listing, the feed and link previews.
//   date: 2026-10-30
//   series: How Toque search works
//   part: 1
//   draft: true            (adds noindex; remove when the post is published)
//   ---
//
// Every other file in the post's folder (figure scripts, images) is copied next to the built page.
// Jekyll on GitHub Pages skips folders that start with "_", so the sources are never served.
// Raw HTML is allowed in the Markdown, for figures. An HTML block ends at the first blank line, so keep figures
// free of blank lines.

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = path.join(ROOT, "blog", "_src");
const OUT = path.join(ROOT, "blog");
const SITE = "https://usetoque.com";
const CSS = "/style.css?v=18";
const BLOG_CSS = "/blog/blog.css?v=1";

// markdown-it comes from the npx cache that build.sh sets up (it is on PATH as <cache>/node_modules/.bin).
function loadMarkdownIt() {
  for (const dir of (process.env.PATH || "").split(path.delimiter)) {
    if (!dir.endsWith(path.join("node_modules", ".bin"))) continue;
    const modules = path.dirname(dir);
    if (fs.existsSync(path.join(modules, "markdown-it"))) return createRequire(path.join(modules, "x.js"))("markdown-it");
  }
  throw new Error("markdown-it not found: run through tools/blog/build.sh");
}
const MarkdownIt = loadMarkdownIt();

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const longDate = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error("missing front matter");
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  meta.draft = meta.draft === "true";
  return { meta, body: text.slice(m[0].length) };
}

function markdown() {
  const md = new MarkdownIt({ html: true, typographer: true, linkify: false });
  // Headings get ids (for links into a post); h2 and h3 only.
  const used = new Set();
  md.core.ruler.push("heading_ids", (state) => {
    const t = state.tokens;
    for (let i = 0; i < t.length; i++) {
      if (t[i].type !== "heading_open" || !["h2", "h3"].includes(t[i].tag)) continue;
      let id = slugify(t[i + 1].content), n = id, k = 2;
      while (used.has(n)) n = `${id}-${k++}`;
      used.add(n);
      t[i].attrSet("id", n);
    }
  });
  // Tables scroll on their own on narrow screens instead of widening the page.
  md.renderer.rules.table_open = () => '<div class="table"><table>\n';
  md.renderer.rules.table_close = () => "</table></div>\n";
  return md;
}

function head({ title, description, url, type, noindex, extra = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ""}<link rel="canonical" href="${url}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="Toque">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="alternate" type="application/atom+xml" title="Toque engineering" href="/blog/feed.xml">
<link rel="stylesheet" href="${CSS}">
<link rel="stylesheet" href="${BLOG_CSS}">
${extra}</head>`;
}

const HEADER = `<header class="site"><div class="wrap">
  <a class="brand" href="/"><picture><source srcset="/img/icon-dark.png" media="(prefers-color-scheme: dark)"><img src="/img/icon-light.png" alt=""></picture>Toque</a>
  <nav class="site"><a href="/support.html">Support</a><a href="/privacy.html">Privacy</a><a class="nav-beta" href="mailto:support@usetoque.com?subject=Toque%20beta&amp;body=Hi%2C%20I%27d%20like%20to%20try%20the%20Toque%20beta.%0A%0AThe%20email%20of%20my%20Apple%20ID%20(for%20TestFlight)%3A%20">Get the beta</a></nav>
</div></header>`;

const FOOTER = `<footer class="site"><div class="wrap">
  <a class="brand" href="/"><picture><source srcset="/img/icon-dark.png" media="(prefers-color-scheme: dark)"><img src="/img/icon-light.png" alt=""></picture>Toque</a>
  <a href="/support.html">Support</a><a href="/privacy.html">Privacy policy</a><span>© 2026 Toque</span>
</div></footer>`;

function postPage(post, html) {
  const { meta } = post;
  const scripts = post.assets.filter((a) => a.endsWith(".js")).map((a) => `<script src="${a}" defer></script>\n`).join("");
  const series = meta.series ? `<span>${esc(meta.series)}${meta.part ? `, part ${esc(meta.part)}` : ""}</span>` : "";
  return `${head({ title: meta.title, description: meta.description, url: `${SITE}/blog/${post.slug}/`, type: "article", noindex: meta.draft, extra: scripts })}
<body class="blog">
${HEADER}

<main class="page"><article class="wrap narrow post">
  <p class="kicker"><a href="/blog/">Engineering</a><time datetime="${meta.date}">${longDate(meta.date)}</time>${series}${meta.draft ? '<span class="draft">Draft</span>' : ""}</p>
  <h1>${esc(meta.title)}</h1>
${html}
</article></main>

${FOOTER}
</body>
</html>
`;
}

function indexPage(posts) {
  const items = posts.map((p) => `  <li>
    <a href="/blog/${p.slug}/"><h2>${esc(p.meta.title)}</h2></a>
    <p class="kicker"><time datetime="${p.meta.date}">${longDate(p.meta.date)}</time>${p.meta.series ? `<span>${esc(p.meta.series)}${p.meta.part ? `, part ${esc(p.meta.part)}` : ""}</span>` : ""}${p.meta.draft ? '<span class="draft">Draft</span>' : ""}</p>
    <p>${esc(p.meta.description)}</p>
  </li>`).join("\n");
  const noindex = posts.length > 0 && posts.every((p) => p.meta.draft);
  return `${head({ title: "Engineering at Toque", description: "How Toque is built: the data, the search and the decisions behind them.", url: `${SITE}/blog/`, type: "website", noindex })}
<body class="blog">
${HEADER}

<main class="page"><div class="wrap narrow">
  <h1>Engineering</h1>
  <p class="lede">How Toque is built: where the data comes from, how search works on the phone, and what we measured along the way.</p>
  <ul class="posts">
${items}
  </ul>
</div></main>

${FOOTER}
</body>
</html>
`;
}

function feed(posts) {
  const updated = posts.length ? posts[0].meta.date : "2026-01-01";
  const entries = posts.map((p) => `  <entry>
    <title>${esc(p.meta.title)}</title>
    <link href="${SITE}/blog/${p.slug}/"/>
    <id>${SITE}/blog/${p.slug}/</id>
    <updated>${p.meta.date}T00:00:00Z</updated>
    <summary>${esc(p.meta.description)}</summary>
  </entry>`).join("\n");
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Toque engineering</title>
  <link href="${SITE}/blog/"/>
  <link rel="self" href="${SITE}/blog/feed.xml"/>
  <id>${SITE}/blog/</id>
  <updated>${updated}T00:00:00Z</updated>
  <author><name>Toque</name></author>
${entries}
</feed>
`;
}

const posts = [];
for (const slug of fs.readdirSync(SRC).sort()) {
  const dir = path.join(SRC, slug);
  if (!fs.statSync(dir).isDirectory() || !fs.existsSync(path.join(dir, "index.md"))) continue;
  const { meta, body } = frontMatter(fs.readFileSync(path.join(dir, "index.md"), "utf8"));
  for (const k of ["title", "description", "date"]) if (!meta[k]) throw new Error(`${slug}: front matter needs ${k}`);
  const assets = fs.readdirSync(dir).filter((f) => f !== "index.md" && !f.startsWith("."));
  posts.push({ slug, meta, body, dir, assets });
}
posts.sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));

for (const post of posts) {
  const out = path.join(OUT, post.slug);
  fs.mkdirSync(out, { recursive: true });
  const html = markdown().render(post.body);
  if (html.includes("\u00b7")) throw new Error(`${post.slug}: uses a middle dot`);
  fs.writeFileSync(path.join(out, "index.html"), postPage(post, html));
  for (const a of post.assets) fs.copyFileSync(path.join(post.dir, a), path.join(out, a));
  const words = post.body.replace(/<[^>]+>/g, " ").replace(/[#*_`>|-]/g, " ").split(/\s+/).filter(Boolean).length;
  console.log(`blog/${post.slug}/index.html  ${words} words (Markdown body, figures' text included)`);
}
fs.writeFileSync(path.join(OUT, "index.html"), indexPage(posts));
fs.writeFileSync(path.join(OUT, "feed.xml"), feed(posts));
console.log(`blog/index.html, blog/feed.xml  ${posts.length} post(s)`);
