import { expect, it } from "bun:test";
import { tick } from "./env.js";

let offline = false;

/* the demo fetches its catalogue on mount, so stub the network before it loads */
globalThis.fetch = async () => {
  if (offline) throw new Error("offline");

  return {
    json: async () => Array.from({ length: 20 }, (_, i) => ({ id: i + 1, title: `T${i + 1}`, body: `B${i + 1}` })),
  };
};

await import("../../example/main.js");

const $ = (element, selector) => element.shadowRoot.querySelector(selector);
const text = (element, selector) => $(element, selector)?.textContent.trim();

const mount = async () => {
  document.body.innerHTML = "";

  const app = document.createElement("shop-app");
  document.body.append(app);

  /* one tick for the mount, one for the fetch that resolves during it */
  await tick();
  await tick();

  return app;
};

/* overlays stay mounted through their leave animation, so waiting on the timer is part of closing. the longest is CART_EXIT, 240ms */
const settle = async (ms = 260) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
  await tick();
};

const addFirstProduct = async (app) => {
  $($(app, "product-card"), ".card-add").click();
  await tick();
};

const openQuickView = async (app) => {
  $($(app, "product-card"), ".card").click();
  await tick();

  return $(app, "quick-view");
};

it("should load products, and not hang on Loading when the fetch fails", async () => {
  const app = await mount();

  expect(app.state.isLoading).toBe(false);
  expect(app.shadowRoot.querySelectorAll("product-card").length).toBe(8);

  offline = true;
  const broken = await mount();

  expect(broken.state.isLoading).toBe(false);
  expect(broken.shadowRoot.querySelectorAll("product-card").length).toBe(0);
  offline = false;
});

it("should show a line total per row, not the unit price", async () => {
  const app = await mount();
  const { price } = app.state.products[0];

  await addFirstProduct(app);
  await addFirstProduct(app);

  const drawer = $(app, "cart-drawer");

  expect(text(drawer, ".cart-item-price")).toBe(`$${(price * 2).toFixed(2)}`);
  expect(text(drawer, ".cart-total span:last-child")).toBe(`$${(price * 2).toFixed(2)}`);
  expect(text(app, ".cart-count")).toBe("2");
});

it("should lock the page scroll while an overlay is open and restore it after", async () => {
  const app = await mount();

  expect($(app, ".page").style.overflow).toBe("");

  $(app, ".cart-button").click();
  await tick();
  expect($(app, ".page").style.overflow).toBe("hidden");

  $($(app, "cart-drawer"), ".icon-button").click();
  await settle();
  expect($(app, "cart-drawer")).toBe(null);
  expect($(app, ".page").style.overflow).toBe("auto");

  await openQuickView(app);
  expect($(app, ".page").style.overflow).toBe("hidden");
});

it("should focus the close button and reset the quantity on every quick view open", async () => {
  const app = await mount();
  let quick = await openQuickView(app);

  expect(quick.shadowRoot.activeElement).toBe($(quick, ".quick-close"));

  $(quick, ".qty-control button:last-child").click();
  await tick();
  expect(text(quick, ".qty-control span")).toBe("2");

  $(quick, ".quick-close").click();
  await settle();
  quick = await openQuickView(app);

  expect(text(quick, ".qty-control span")).toBe("1");
});

it("should add the chosen quantity, then increment and remove from the drawer", async () => {
  const app = await mount();
  const quick = await openQuickView(app);

  $(quick, ".qty-control button:last-child").click();
  await tick();
  $(quick, ".buy-button").click();
  await settle();

  expect(app.state.cart[0].qty).toBe(2);
  expect($(app, "quick-view")).toBe(null);

  const drawer = $(app, "cart-drawer");

  $(drawer, ".qty-control button:last-child").click();
  await tick();
  expect(app.state.cart[0].qty).toBe(3);

  $(drawer, ".remove-button").click();
  await settle();
  expect(app.state.cart.length).toBe(0);
  expect(text($(app, "cart-drawer"), ".empty-cart")).toBe("Your cart is empty.");
});

it("should confirm the add on the card itself, then fall back to the idle label", async () => {
  const app = await mount();
  const card = $(app, "product-card");

  expect(text(card, ".card-add")).toBe("Add to cart");

  await addFirstProduct(app);
  expect(text(card, ".card-add")).toBe("Added");
  expect($(card, ".card-add").className).toContain("added");
});

it("should check out, then clear the message on the next open", async () => {
  const app = await mount();

  await addFirstProduct(app);

  $($(app, "cart-drawer"), ".checkout-button").click();
  await tick();
  expect(text($(app, "cart-drawer"), ".cart-message")).toContain("Order placed");
  expect(app.state.cart.length).toBe(0);

  $($(app, "cart-drawer"), ".icon-button").click();
  await settle();
  $(app, ".cart-button").click();
  await tick();

  expect($($(app, "cart-drawer"), ".cart-message")).toBe(null);
});
