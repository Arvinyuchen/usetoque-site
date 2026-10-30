# usetoque.com

The public website for Toque: the landing page, support page and privacy policy. Plain HTML and CSS, served by GitHub Pages at https://usetoque.com.

## Blog (unpublished)

Engineering posts are written in Markdown under `blog/_src/<slug>/index.md` (Jekyll skips folders that start with `_`, so the sources are not served) and built to `blog/<slug>/index.html`, `blog/index.html` and `blog/feed.xml` with `sh tools/blog/build.sh` (Node, markdown-it via npx, nothing installed globally). Commit the built files. Posts with `draft: true` carry `noindex`. Nothing links to `/blog/` yet.
