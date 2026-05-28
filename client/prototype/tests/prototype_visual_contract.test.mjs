import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const visualDir = path.join(projectRoot, "client", "prototype", "visual");

await test("VisualPrototypeContract - files exist", async () => {
  assert.ok(fs.existsSync(path.join(visualDir, "index.html")), "index.html is missing");
  assert.ok(fs.existsSync(path.join(visualDir, "styles.css")), "styles.css is missing");
  assert.ok(fs.existsSync(path.join(visualDir, "app.js")), "app.js is missing");
  assert.ok(fs.existsSync(path.join(visualDir, "README.md")), "README.md is missing");
});

await test("VisualPrototypeContract - index.html references app structure", async () => {
  const html = fs.readFileSync(path.join(visualDir, "index.html"), "utf8");
  assert.ok(html.includes('<div id="app"'), "Root app container missing");
  assert.ok(html.includes('src="app.js"'), "app.js script tag missing");
  assert.ok(html.includes('href="styles.css"'), "styles.css link missing");
});

await test("VisualPrototypeContract - app.js uses prototype logic", async () => {
  const js = fs.readFileSync(path.join(visualDir, "app.js"), "utf8");
  assert.ok(js.includes('createInitialPrototypeState'), "Missing createInitialPrototypeState");
  assert.ok(js.includes('advancePrototypeScreen'), "Missing advancePrototypeScreen");
  assert.ok(js.includes('buildPrototypeViewModel'), "Missing buildPrototypeViewModel");
  assert.ok(js.includes('sample_scenarios.json'), "Missing sample input reference");
});

await test("VisualPrototypeContract - styles.css has basic layout", async () => {
  const css = fs.readFileSync(path.join(visualDir, "styles.css"), "utf8");
  assert.ok(css.includes('.split-layout'), "Missing split-layout class");
  assert.ok(css.includes('--bg-dark'), "Missing color variables");
});
