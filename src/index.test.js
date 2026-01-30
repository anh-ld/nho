import { afterEach, beforeEach, expect, it } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { JSDOM } from "jsdom";

// Build a browser-like global environment for Bun/jsdom so the custom element code can run.
const { window } = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });

globalThis.window = window;
globalThis.document = window.document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.customElements = window.customElements;
globalThis.Node = window.Node;
globalThis.navigator = window.navigator;
globalThis.requestAnimationFrame = window.requestAnimationFrame || ((cb) => setTimeout(() => cb(Date.now()), 16));
globalThis.cancelAnimationFrame = window.cancelAnimationFrame || ((id) => clearTimeout(id));

expect.extend(matchers);

const { Nho } = await import("./index.js");

const tick = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

class ChildElement extends Nho {
  render(h) {
    return h`<p>${this.props.count}</p>`;
  }
}

class ParentElement extends Nho {
  setup() {
    this.state = this.reactive({ count: 1 });
  }

  increase() {
    this.state.count++;
  }

  render(h) {
    return h`
      <div>
        <p>Count: ${this.state.count}</p>
        <button onclick=${this.increase}>Increase</button>
        ${Array.from(Array(this.state.count), (_, index) => index + 1).map(
          (v) => h`<child-element p:count=${v}></child-element>`,
        )}
      </div>
    `;
  }
}

class EffectElement extends Nho {
  setup() {
    this.state = this.reactive({ count: 0 });
    this.changes = [];

    this.effect(
      () => this.state.count,
      (prev, next) => {
        this.changes.push([prev, next]);
      },
    );
  }

  increment() {
    this.state.count += 1;
  }

  render(h) {
    return h`<button onclick=${this.increment}>${this.state.count}</button>`;
  }
}

class RefElement extends Nho {
  setup() {
    this.buttonRef = this.ref(null);
    this.state = this.reactive({ label: "Click me" });
  }

  updateLabel() {
    this.state.label = "Clicked";
  }

  render(h) {
    return h`<section>
      <button ref=${this.buttonRef} onclick=${this.updateLabel}>${this.state.label}</button>
    </section>`;
  }
}

class SwapElement extends Nho {
  setup() {
    this.state = this.reactive({ paragraph: true });
  }

  toggle() {
    this.state.paragraph = !this.state.paragraph;
  }

  render(h) {
    return this.state.paragraph ? h`<p>Paragraph</p>` : h`<span>Span</span>`;
  }
}

class StableChild extends Nho {
  renderCount = 0;

  render(h) {
    this.renderCount += 1;
    return h`<p>Stable ${this.props.value}</p>`;
  }
}

class StableParent extends Nho {
  setup() {
    this.state = this.reactive({ noise: 0 });
  }

  bumpNoise() {
    this.state.noise += 1;
  }

  render(h) {
    return h`<div>
      <stable-child p:value=${1}></stable-child>
      <span data-noise=${this.state.noise}>${this.state.noise}</span>
    </div>`;
  }
}

class AttributeElement extends Nho {
  setup() {
    this.state = this.reactive({ title: 'X " onclick="alert(1) Y', note: "A&B <tag>" });
  }

  render(h) {
    return h`<div title=${this.state.title} data-note=${this.state.note}></div>`;
  }
}

class RegexChild extends Nho {
  render(h) {
    return h`<span>${this.props.value}</span>`;
  }
}

class RegexParent extends Nho {
  setup() {
    this.state = this.reactive({ value: "ok", clicks: 1 });
    this.childRef = this.ref(null);
  }

  bump() {
    this.state.clicks += 1;
  }

  render(h) {
    return h`<div>
      <regex-child ref=${this.childRef} onclick=${this.bump} p:value=${this.state.value}></regex-child>
      <em>${this.state.clicks}</em>
    </div>`;
  }
}

class RegexCasesElement extends Nho {
  setup() {
    this.state = this.reactive({ clicks: 0 });
    this.users = [{ id: 1 }];
    this.nodeRef = this.ref(null);
  }

  handleClick() {
    this.state.clicks += 1;
  }

  render(h) {
    return h`<section>
      <a data-kind="match" onclick=${this.handleClick}>Match</a>
      <custom-element p:users=${this.users}></custom-element>
      <div ref=${this.nodeRef}></div>
      <a data-kind="nomatch" on=${"nope"}>No match</a>
      <custom-element goop:luck=${"nope"}></custom-element>
      <div reference=${"nope"}></div>
      <em>${this.state.clicks}</em>
    </section>`;
  }
}

class LifecycleElement extends Nho {
  setup() {
    this.calls = [];
    this.state = this.reactive({ count: 0 });
  }

  onMounted() {
    this.calls.push("mounted");
  }

  onUpdated() {
    this.calls.push("updated");
  }

  onUnmounted() {
    this.calls.push("unmounted");
  }

  increment() {
    this.state.count += 1;
  }

  render(h) {
    return h`<div><span>${this.state.count}</span></div>`;
  }
}

class StyleElement extends Nho {
  setup() {
    this.state = this.reactive({ count: 0 });
  }

  bump() {
    this.state.count += 1;
  }

  render(h) {
    return h`<div><p>${this.state.count}</p></div>`;
  }
}

class AttributeToggleElement extends Nho {
  setup() {
    this.state = this.reactive({ enabled: true });
  }

  toggle() {
    this.state.enabled = !this.state.enabled;
  }

  render(h) {
    return h`<div ${this.state.enabled ? 'data-active="yes"' : ""}></div>`;
  }
}

class EventSwapElement extends Nho {
  setup() {
    this.state = this.reactive({ a: 0, b: 0, mode: "a" });
  }

  incA() {
    this.state.a += 1;
  }

  incB() {
    this.state.b += 1;
  }

  toggle() {
    this.state.mode = this.state.mode === "a" ? "b" : "a";
  }

  render(h) {
    return h`<div><button onclick=${this.state.mode === "a" ? this.incA : this.incB}>Swap</button></div>`;
  }
}

class TextUpdateElement extends Nho {
  setup() {
    this.state = this.reactive({ text: "Alpha" });
  }

  setBeta() {
    this.state.text = "Beta";
  }

  render(h) {
    return h`<p>${this.state.text}</p>`;
  }
}

class ArrayRenderElement extends Nho {
  setup() {
    this.state = this.reactive({ items: ["a", "b"] });
  }

  addItem() {
    this.state.items = [...this.state.items, "c"];
  }

  render(h) {
    return h`<ul>${this.state.items.map((item) => h`<li>${item}</li>`)}</ul>`;
  }
}

class PropUpdateChild extends Nho {
  renderCount = 0;

  render(h) {
    this.renderCount += 1;
    return h`<span>${this.props.value}</span>`;
  }
}

class PropUpdateParent extends Nho {
  setup() {
    this.state = this.reactive({ value: 1 });
  }

  setValue(value) {
    this.state.value = value;
  }

  render(h) {
    return h`<div><prop-update-child p:value=${this.state.value}></prop-update-child></div>`;
  }
}

customElements.define("parent-element", ParentElement);
customElements.define("child-element", ChildElement);
customElements.define("effect-element", EffectElement);
customElements.define("ref-element", RefElement);
customElements.define("swap-element", SwapElement);
customElements.define("stable-child", StableChild);
customElements.define("stable-parent", StableParent);
customElements.define("attribute-element", AttributeElement);
customElements.define("regex-child", RegexChild);
customElements.define("regex-parent", RegexParent);
customElements.define("regex-cases", RegexCasesElement);
customElements.define("lifecycle-element", LifecycleElement);
customElements.define("style-element", StyleElement);
customElements.define("attribute-toggle", AttributeToggleElement);
customElements.define("event-swap", EventSwapElement);
customElements.define("text-update", TextUpdateElement);
customElements.define("array-render", ArrayRenderElement);
customElements.define("prop-update-child", PropUpdateChild);
customElements.define("prop-update-parent", PropUpdateParent);

const mount = (tagName) => {
  const element = document.createElement(tagName);
  document.body.appendChild(element);
  return element;
};

beforeEach(() => {
  document.body.innerHTML = "";
  Nho._c.length = 0;
  Nho.style = `
      p {
        color: red;
      }
    `;
});

afterEach(() => {
  document.body.innerHTML = "";
});

it("should render the custom element", () => {
  const element = mount("parent-element");
  expect(element).toBeInTheDocument();
  expect(element.shadowRoot.querySelector("p")).toHaveTextContent("Count: 1");
  const styleTag = element.shadowRoot.querySelector("style");
  expect(styleTag).toHaveTextContent("color: red;");
});

it("should handle events and batch updates", async () => {
  const element = mount("parent-element");
  const content = element.shadowRoot.querySelector("p");
  const button = element.shadowRoot.querySelector("button");

  button.click();
  button.click();
  await tick();

  expect(content).toHaveTextContent("Count: 3");
});

it("should render child elements, sync props and remove stale nodes", async () => {
  const element = mount("parent-element");
  const button = element.shadowRoot.querySelector("button");
  const getChild = () => element.shadowRoot.querySelectorAll("child-element");

  expect(getChild().length).toBe(1);

  button.click();
  await tick();
  expect(getChild().length).toBe(2);
  expect(getChild()[1].shadowRoot).toHaveTextContent("2");

  element.state.count = 0;
  await tick();
  expect(getChild().length).toBe(0);
});

it("should run effects only when tracked values change", async () => {
  const element = mount("effect-element");

  expect(element.changes).toEqual([]);

  element.increment();
  await tick();
  expect(element.changes).toEqual([[0, 1]]);

  element.state.count = 1;
  await tick();
  expect(element.changes).toHaveLength(1);

  element.state.count = 2;
  await tick();
  expect(element.changes).toEqual([
    [0, 1],
    [1, 2],
  ]);
});

it("should bind refs and keep handler context intact", async () => {
  const element = mount("ref-element");
  const button = element.shadowRoot.querySelector("button");

  expect(element.buttonRef.current).toBe(button);
  expect(button).toHaveTextContent("Click me");

  button.click();
  await tick();

  expect(button).toHaveTextContent("Clicked");
  expect(element.buttonRef.current).toBe(button);
});

it("should skip child re-render when props stay the same", async () => {
  const element = mount("stable-parent");
  const child = element.shadowRoot.querySelector("stable-child");
  const initialRenderCount = child.renderCount;

  element.bumpNoise();
  await tick();

  expect(child.renderCount).toBe(initialRenderCount);
  expect(element.shadowRoot.querySelector("span[data-noise]")).toHaveTextContent("1");
});

it("should replace nodes when tag changes", async () => {
  const element = mount("swap-element");
  const initialNode = element.shadowRoot.querySelector("p, span");

  expect(initialNode.tagName).toBe("P");

  element.toggle();
  await tick();

  const swappedNode = element.shadowRoot.querySelector("p, span");
  expect(swappedNode.tagName).toBe("SPAN");
  expect(swappedNode).not.toBe(initialNode);
});

it("should serialize attribute values safely", () => {
  const element = mount("attribute-element");
  const node = element.shadowRoot.querySelector("div");

  expect(node.getAttribute("title")).toBe('X " onclick="alert(1) Y');
  expect(node.hasAttribute("onclick")).toBe(false);
  expect(node.getAttribute("data-note")).toBe("A&B <tag>");
});

it("should cache prop, event, and ref bindings", async () => {
  const element = mount("regex-parent");
  const child = element.shadowRoot.querySelector("regex-child");
  const text = element.shadowRoot.querySelector("em");

  expect(child.shadowRoot).toHaveTextContent("ok");
  expect(element.childRef.current).toBe(child);
  expect(text).toHaveTextContent("1");
  child.click();
  await tick();

  expect(text).toHaveTextContent("2");
});

it("should match only prop, event, and ref patterns", async () => {
  const element = mount("regex-cases");
  const matchLink = element.shadowRoot.querySelector('a[data-kind="match"]');
  const noMatchLink = element.shadowRoot.querySelector('a[data-kind="nomatch"]');
  const text = element.shadowRoot.querySelector("em");
  const referenceNode = element.shadowRoot.querySelector("div[reference]");
  expect(element.nodeRef.current).toBe(element.shadowRoot.querySelector("div"));
  expect(referenceNode.getAttribute("reference")).toBe("nope");

  matchLink.click();
  await tick();
  expect(text).toHaveTextContent("1");

  noMatchLink.click();
  await tick();
  expect(text).toHaveTextContent("1");
});

it("should run lifecycle hooks at expected times", async () => {
  const element = mount("lifecycle-element");
  expect(element.calls).toEqual(["updated", "mounted"]);

  element.increment();
  await tick();
  expect(element.calls).toEqual(["updated", "mounted", "updated"]);

  element.state.count = 1;
  await tick();
  expect(element.calls).toEqual(["updated", "mounted", "updated"]);

  document.body.removeChild(element);
  expect(element.calls).toEqual(["updated", "mounted", "updated", "unmounted"]);
});

it("should reuse style node and update its contents", async () => {
  const element = mount("style-element");
  const styleNode = element.shadowRoot.querySelector("style");
  expect(styleNode).toBeInTheDocument();
  expect(styleNode).toHaveTextContent("color: red;");

  Nho.style = "p { color: blue; }";
  element.bump();
  await tick();

  const nextStyleNode = element.shadowRoot.querySelector("style");
  expect(nextStyleNode).toBe(styleNode);
  expect(nextStyleNode).toHaveTextContent("color: blue;");
});

it("should remove attributes when no longer rendered", async () => {
  const element = mount("attribute-toggle");
  const node = element.shadowRoot.querySelector("div");
  expect(node.getAttribute("data-active")).toBe("yes");

  element.toggle();
  await tick();
  expect(node.hasAttribute("data-active")).toBe(false);
});

it("should swap event handlers when render output changes", async () => {
  const element = mount("event-swap");
  const button = element.shadowRoot.querySelector("button");

  button.onclick();
  await tick();
  expect(element.state.a).toBe(1);
  expect(element.state.b).toBe(0);

  element.toggle();
  await tick();
  button.onclick();
  await tick();

  expect(element.state.a).toBe(1);
  expect(element.state.b).toBe(1);
});

it("should update text nodes when state changes", async () => {
  const element = mount("text-update");
  const text = element.shadowRoot.querySelector("p");
  expect(text).toHaveTextContent("Alpha");

  element.setBeta();
  await tick();
  expect(text).toHaveTextContent("Beta");
});

it("should render and update arrays of child nodes", async () => {
  const element = mount("array-render");
  const getItems = () => element.shadowRoot.querySelectorAll("li");
  expect(getItems().length).toBe(2);
  expect(getItems()[0]).toHaveTextContent("a");
  expect(getItems()[1]).toHaveTextContent("b");

  element.addItem();
  await tick();
  expect(getItems().length).toBe(3);
  expect(getItems()[2]).toHaveTextContent("c");
});

it("should update child components when props change", async () => {
  const element = mount("prop-update-parent");
  const child = element.shadowRoot.querySelector("prop-update-child");
  const initialRenderCount = child.renderCount;

  element.setValue(2);
  await tick();
  expect(child.renderCount).toBeGreaterThan(initialRenderCount);
  expect(child.shadowRoot).toHaveTextContent("2");
});
