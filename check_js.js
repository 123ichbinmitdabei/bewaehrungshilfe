// Extracts the inline <script> body from index.html and runs a syntax check.
// Usage: node check_js.js
const fs = require("fs");
const vm = require("vm");
const html = fs.readFileSync(__dirname + "/index.html", "utf8");
const open = html.indexOf("<script>");
const close = html.lastIndexOf("</script>");
if (open === -1 || close === -1) { console.error("No <script> block found"); process.exit(2); }
const js = html.slice(open + "<script>".length, close);
try {
  new vm.Script(js, { filename: "index.html.inline.js" });
  console.log("OK: inline script parses (" + js.length + " chars)");
} catch (e) {
  console.error("PARSE ERROR:", e.message);
  // Try to locate line
  const m = /index\.html\.inline\.js:(\d+)/.exec(e.stack || "");
  if (m) {
    const lineInScript = parseInt(m[1], 10);
    const before = html.slice(0, open).split("\n").length - 1;
    console.error("≈ index.html line " + (before + lineInScript));
  }
  process.exit(1);
}
