import { afterEach, beforeEach, describe, expect, it } from "bun:test";
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

customElements.define("parent-element", ParentElement);
customElements.define("child-element", ChildElement);
customElements.define("effect-element", EffectElement);
customElements.define("ref-element", RefElement);
customElements.define("swap-element", SwapElement);
customElements.define("stable-child", StableChild);
customElements.define("stable-parent", StableParent);

const mount = (tagName) => {
  const element = document.createElement(tagName);
  document.body.appendChild(element);
  return element;
};

describe("test the library", () => {
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
});
