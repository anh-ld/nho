/* one shared window: bun runs every test file in one process, so per-file JSDOMs would fight over globalThis */

import { expect } from "bun:test";
import { JSDOM } from "jsdom";

const { window } = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });

globalThis.window = window;
globalThis.document = window.document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.customElements = window.customElements;
globalThis.Node = window.Node;
globalThis.NodeFilter = window.NodeFilter;
globalThis.navigator = window.navigator;
/* jsdom has no rAF without pretendToBeVisual. nothing here needs frame pacing, only "later than microtasks" */
globalThis.requestAnimationFrame = window.requestAnimationFrame || ((cb) => setTimeout(() => cb(Date.now()), 0));
globalThis.cancelAnimationFrame = window.cancelAnimationFrame || ((id) => clearTimeout(id));

/* the only two jest-dom matchers this suite used, minus its eight-package tree */
expect.extend({
  toBeInTheDocument: (el) => ({
    pass: !!el && el.ownerDocument === el.getRootNode({ composed: true }),
    message: () => "expected element to be in the document",
  }),
  toHaveTextContent: (el, want) => ({
    /* jest-dom collapses whitespace and matches a substring */
    pass: el.textContent.replace(/\s+/g, " ").trim().includes(want),
    message: () => `expected "${el.textContent}" to contain "${want}"`,
  }),
});

/* two frames: one for the scheduled update, one for anything it schedules in turn */
export const tick = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
