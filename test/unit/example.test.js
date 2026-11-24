import { expect, it } from "bun:test";
import { tick } from "./env.js";

await import("../../example/main.js");

const $ = (element, selector) => element.shadowRoot.querySelector(selector);
const $$ = (element, selector) => [...element.shadowRoot.querySelectorAll(selector)];
const text = (element, selector) => $(element, selector)?.textContent.trim();

const mount = async () => {
  document.body.innerHTML = "";
  document.body.style.overflow = "";

  const app = document.createElement("shop-app");
  app.setAttribute("currency", "€");
  document.body.append(app);
  await tick();

  return app;
};

const click = async (element, selector) => {
  $(element, selector).click();
  await tick();
};

const row = (app, index = 0) => $$(app, "product-row")[index];
const drawer = (app) => $(app, "cart-drawer");

const openCart = async (app) => {
  await click(app, ".cart-button");
  return drawer(app);
};

it("should list every product, priced in the host's currency attribute", async () => {
  const app = await mount();

  expect($$(app, "product-row").length).toBe(8);
  expect(text(row(app), ".price")).toBe("€18.00");
});

it("should filter while typing, and say so when nothing matches", async () => {
  const app = await mount();
  const search = $(app, ".search");

  search.value = "lamp";
  search.dispatchEvent(new window.Event("input"));
  await tick();
  expect($$(app, "product-row").length).toBe(1);
  expect(text(row(app), ".name")).toBe("Sky Lamp");

  search.value = "zzz";
  search.dispatchEvent(new window.Event("input"));
  await tick();
  expect($$(app, "product-row").length).toBe(0);
  expect(text(app, ".empty")).toBe('No products match "zzz".');
});

it("should add from a row and count it in the row, the header and the title", async () => {
  const app = await mount();

  await click(row(app), ".add");
  await click(row(app), ".add");

  expect(text(row(app), ".add")).toBe("In cart · 2");
  expect(text(app, ".badge")).toBe("2");
  expect(document.title).toBe("(2) Nho shop");
});

it("should open the cart focused and lock the page, then undo both on close", async () => {
  const app = await mount();
  const cart = await openCart(app);

  expect(cart.shadowRoot.activeElement).toBe($(cart, ".close"));
  expect(document.body.style.overflow).toBe("hidden");

  await click(cart, ".close");
  expect(drawer(app)).toBe(null);
  expect(document.body.style.overflow).toBe("");
});

it("should close the cart on Escape, and stop listening once closed", async () => {
  const app = await mount();
  const escape = () => document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape" }));

  await openCart(app);
  escape();
  await tick();
  expect(drawer(app)).toBe(null);

  /* a leaked listener would call onclose on a removed element and throw here */
  escape();
  await tick();
  expect(drawer(app)).toBe(null);
});

it("should total the cart, step quantities, and drop a line at zero", async () => {
  const app = await mount();

  await click(row(app), ".add");
  await click(row(app, 1), ".add");
  const cart = await openCart(app);

  expect(text(cart, ".cart-total")).toBe("€30.00");

  await click(cart, ".line .stepper button:last-child");
  expect(text(cart, ".line-total")).toBe("€36.00");
  expect(text(cart, ".cart-total")).toBe("€48.00");

  await click(cart, ".line:last-child .stepper button");
  expect($$(cart, ".line").length).toBe(1);
});

it("should check out, show the message, and clear it on the next open", async () => {
  const app = await mount();
  let cart = await openCart(app);

  expect($(cart, ".checkout").disabled).toBe(true);
  expect(text(cart, ".empty-cart")).toBe("Your cart is empty.");

  await click(cart, ".close");
  await click(row(app), ".add");
  cart = await openCart(app);
  await click(cart, ".checkout");
  expect(text(cart, ".message")).toBe("Order placed. Thanks!");
  expect(text(app, ".badge")).toBe("0");

  await click(cart, ".close");
  cart = await openCart(app);
  expect($(cart, ".message")).toBe(null);
});
