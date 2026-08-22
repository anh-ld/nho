/* the published bundles, in a real browser. everything else runs on jsdom against src/ */

/* .e2e.js is load-bearing: bun test globs *.test.*, so renaming puts a browser in every unit run */

import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "bun:test";

let server;
let wv;

/* headless webkit throttles rAF to ~20fps, slow first frame: never sleep a fixed amount */
const poll = async (expression, want) => {
  let got;

  for (let i = 0; i < 100; i++) {
    /* unbuilt subtree throws: retry, not fail */
    got = await wv.evaluate(expression).catch(() => undefined);

    if (got === want) break;

    await Bun.sleep(20);
  }

  return got;
};

/* the lib renders into a shadow root, so no query reaches it from the document */
const el = (path) => `document.querySelector('${path.join("').shadowRoot.querySelector('")}')`;

const LABEL = el(["counter-app", "count-label", "#label"]);

const open = async (page) => {
  await wv.navigate(`http://localhost:${server.port}/test/e2e/${page}`);

  if (!(await poll("window.ready", 1))) throw new Error(`${page} never signalled ready`);
};

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    /* loopback only: the repo root is the document root */
    hostname: "127.0.0.1",
    development: false,
    fetch: async (req) => {
      const file = Bun.file(new URL(`../..${new URL(req.url).pathname}`, import.meta.url));

      /* else a forgotten build feeds bun's 500 html page to <script>, symptom "never signalled ready" */
      return (await file.exists()) ? new Response(file) : new Response("not found", { status: 404 });
    },
  });
});

afterAll(() => server?.stop(true));

/* one webview per test: a failed navigation leaves the next reporting "navigation already pending" */
beforeEach(() => {
  wv = new Bun.WebView({ headless: true });
});

afterEach(() => {
  try {
    wv?.close();
  } catch {}
});

it("esm bundle renders", async () => {
  await open("esm.html");

  expect(await poll(`${LABEL}.textContent`, "0")).toBe("0");
});

it("esm bundle applies Nho.style into the shadow root", async () => {
  await open("esm.html");

  const color = `getComputedStyle(${LABEL}).color`;

  expect(await poll(color, "rgb(1, 2, 3)")).toBe("rgb(1, 2, 3)");
});

it("esm bundle updates on click", async () => {
  await open("esm.html");

  await wv.evaluate(`${el(["counter-app", "#bump"])}.click()`);

  expect(await poll(`${LABEL}.textContent`, "1")).toBe("1");
});

it("umd bundle exposes nho.Nho", async () => {
  await open("umd.html");

  expect(await wv.evaluate("typeof window.nho.Nho")).toBe("function");
  expect(await poll(`${el(["umd-app", "#label"])}.textContent`, "umd ok")).toBe("umd ok");
});
