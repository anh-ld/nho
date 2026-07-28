/* one shared window: bun runs every test file in one process, so per-file JSDOMs would fight over globalThis */

import { expect } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { JSDOM } from "jsdom";

const { window } = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });

globalThis.window = window;
globalThis.document = window.document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.customElements = window.customElements;
globalThis.Node = window.Node;
globalThis.NodeFilter = window.NodeFilter;
globalThis.navigator = window.navigator;
globalThis.requestAnimationFrame = window.requestAnimationFrame || ((cb) => setTimeout(() => cb(Date.now()), 16));
globalThis.cancelAnimationFrame = window.cancelAnimationFrame || ((id) => clearTimeout(id));

expect.extend(matchers);

/* two frames: one for the scheduled update, one for anything it schedules in turn */
export const tick = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
