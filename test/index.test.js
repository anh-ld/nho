import { beforeEach, expect, it } from "bun:test";
import { tick } from "./env.js";

const { Nho } = await import("../src/index.js");

class ChildElement extends Nho {
  render(h) {
    this.renderCount = (this.renderCount || 0) + 1;

    return h`<p>${this.props.count}</p>`;
  }
}

class ParentElement extends Nho {
  setup() {
    this.state = { count: 1 };
  }

  increase() {
    this.setState({ count: this.state.count + 1 });
  }

  render(h) {
    return h`
      <div>
        <p>Count: ${this.state.count}</p>
        <button onclick=${this.increase}>increase</button>
        <child-element count=${this.state.count}></child-element>
      </div>
    `;
  }
}

class RefElement extends Nho {
  setup() {
    this.state = { label: "Click me" };
    this.buttonRef = this.ref();
  }

  click() {
    this.setState({ label: "Clicked" });
    this.seen = this.buttonRef.current;
  }

  render(h) {
    return h`<button ref=${this.buttonRef} onclick=${this.click}>${this.state.label}</button>`;
  }
}

class AttributeElement extends Nho {
  setup() {
    this.state = { title: 'X " onclick="alert(1) Y', note: "A&B <tag>" };
  }

  render(h) {
    return h`<div title=${this.state.title} data-note=${this.state.note}></div>`;
  }
}

class AttributeToggleElement extends Nho {
  setup() {
    this.state = { active: "yes" };
  }

  render(h) {
    return h`<div data-active=${this.state.active} class="box ${this.state.active}"></div>`;
  }
}

class EventSwapElement extends Nho {
  setup() {
    this.state = { mode: "a", a: 0, b: 0 };
  }

  incA() {
    this.setState({ a: this.state.a + 1 });
  }

  incB() {
    this.setState({ b: this.state.b + 1 });
  }

  render(h) {
    let handler = { a: this.incA, b: this.incB }[this.state.mode] || null;

    return h`<button onclick=${handler}>go</button>`;
  }
}

class LifecycleElement extends Nho {
  setup() {
    this.calls = [];
    this.state = { count: 0 };
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

  render(h) {
    return h`<p>${this.state.count}</p>`;
  }
}

class ListElement extends Nho {
  setup() {
    this.state = { items: ["a", "b"] };
  }

  render(h) {
    return h`<ul>${this.state.items.map((item) => h`<li>${item}</li>`)}</ul>`;
  }
}

class MixedListElement extends Nho {
  setup() {
    this.state = { items: ["a"] };
  }

  render(h) {
    return h`<ul>${this.state.items.map((item) => (item.n ? h`<li>${item.n}</li>` : item))}</ul>`;
  }
}

class BranchElement extends Nho {
  setup() {
    this.state = { on: true, name: "kim" };
  }

  render(h) {
    return h`<div>${this.state.on ? h`<em>on ${this.state.name}</em>` : h`<s>off</s>`}</div>`;
  }
}

class FragmentElement extends Nho {
  render(h) {
    return h`<p>one</p><p>two</p>`;
  }
}

class NestedPropChild extends Nho {
  render(h) {
    return h`<i>${this.props.item.n}${this.props.label}</i>`;
  }
}

class NestedPropParent extends Nho {
  setup() {
    this.state = { items: [{ n: 1 }], tag: "x" };
  }

  render(h) {
    return h`
      <div>
        <nested-prop-child item=${this.state.items[0]} label="a${this.state.items[0].n}-${this.state.tag}b">
        </nested-prop-child>
      </div>
    `;
  }
}

class BooleanTextElement extends Nho {
  render(h) {
    return h`<p>a${true}b${false}c${null}d${undefined}e${0}</p>`;
  }
}

class FalsyAttributeElement extends Nho {
  setup() {
    this.state = { disabled: true };
  }

  render(h) {
    return h`<button disabled=${this.state.disabled}>${this.state.disabled && "off"}</button>`;
  }
}

class CallbackChild extends Nho {
  render(h) {
    /* html lowercases attribute names, so onBuy arrives as onbuy */
    return h`<button onclick=${() => this.props.onbuy("shoe")}>buy</button>`;
  }
}

class CallbackParent extends Nho {
  setup() {
    this.state = { bought: "" };
  }

  buy(item) {
    this.setState({ bought: item });
  }

  render(h) {
    return h`<div><callback-child onBuy=${this.buy}></callback-child></div>`;
  }
}

class CollidingChild extends Nho {
  render(h) {
    return h`<button onclick=${this.props.onclose}>x</button>`;
  }
}

class CollidingParent extends Nho {
  setup() {
    this.state = { closed: 0 };
  }

  close() {
    this.setState({ closed: this.state.closed + 1 });
  }

  render(h) {
    return h`<div><colliding-child onClose=${this.close}></colliding-child></div>`;
  }
}

class FalsyPropChild extends Nho {
  render(h) {
    return h`<i>${typeof this.props.flag}</i>`;
  }
}

class FalsyPropParent extends Nho {
  render(h) {
    return h`<div><falsy-prop-child flag=${false}></falsy-prop-child></div>`;
  }
}

class TrailingEqualsElement extends Nho {
  render(h) {
    return h`<p title=${"t"}>n=${1} a=${2}</p>`;
  }
}

class RawTextElement extends Nho {
  render(h) {
    return h`<p>${"<b>bold</b>"}</p>`;
  }
}

class HostAttributeElement extends Nho {
  render(h) {
    return h`<p>[${this.props.count}]</p>`;
  }
}

class EffectElement extends Nho {
  setup() {
    this.state = { count: 0, other: 0 };
    this.seen = [];

    this.effect(
      () => this.state.count,
      (before, after) => this.seen.push(`${before}->${after}`),
    );
  }

  render(h) {
    return h`<p>${this.state.count}-${this.state.other}</p>`;
  }
}

class TableElement extends Nho {
  setup() {
    this.state = { n: 1 };
  }

  render(h) {
    return h`<table><tbody><tr><td>${this.state.n}</td></tr></tbody></table>`;
  }
}

class SvgElement extends Nho {
  render(h) {
    return h`<svg viewBox="0 0 10 10"><circle r=${5}></circle></svg>`;
  }
}

class SetupCountElement extends Nho {
  setup() {
    this.setupCount = (this.setupCount || 0) + 1;
    this.state = { count: 0 };
  }

  render(h) {
    return h`<p>${this.state.count}</p>`;
  }
}

customElements.define("parent-element", ParentElement);
customElements.define("child-element", ChildElement);
customElements.define("ref-element", RefElement);
customElements.define("attribute-element", AttributeElement);
customElements.define("attribute-toggle", AttributeToggleElement);
customElements.define("event-swap", EventSwapElement);
customElements.define("lifecycle-element", LifecycleElement);
customElements.define("list-element", ListElement);
customElements.define("mixed-list", MixedListElement);
customElements.define("branch-element", BranchElement);
customElements.define("fragment-element", FragmentElement);
customElements.define("nested-prop-child", NestedPropChild);
customElements.define("nested-prop-parent", NestedPropParent);
customElements.define("boolean-text", BooleanTextElement);
customElements.define("falsy-attribute", FalsyAttributeElement);
customElements.define("callback-child", CallbackChild);
customElements.define("callback-parent", CallbackParent);
customElements.define("colliding-child", CollidingChild);
customElements.define("colliding-parent", CollidingParent);
customElements.define("falsy-prop-child", FalsyPropChild);
customElements.define("falsy-prop-parent", FalsyPropParent);
customElements.define("trailing-equals", TrailingEqualsElement);
customElements.define("raw-text", RawTextElement);
customElements.define("host-attribute", HostAttributeElement);
customElements.define("effect-element", EffectElement);
customElements.define("table-element", TableElement);
customElements.define("svg-element", SvgElement);
customElements.define("setup-count", SetupCountElement);

const mount = (tagName, markup) => {
  if (markup) {
    document.body.insertAdjacentHTML("beforeend", markup);

    return document.body.lastElementChild;
  }

  const element = document.createElement(tagName);
  document.body.appendChild(element);

  return element;
};

beforeEach(() => {
  document.body.innerHTML = "";
  Nho.style = "p { color: red; }";
});

it("should render the custom element", () => {
  const element = mount("parent-element");

  expect(element).toBeInTheDocument();
  expect(element.shadowRoot.querySelector("p")).toHaveTextContent("Count: 1");
  expect(element.shadowRoot.querySelector("style")).toHaveTextContent("color: red;");
});

it("should re-render on state change", async () => {
  const element = mount("parent-element");

  element.increase();
  await tick();
  expect(element.shadowRoot.querySelector("p")).toHaveTextContent("Count: 2");
});

it("should reuse static nodes instead of re-creating them", async () => {
  const element = mount("parent-element");
  const node = element.shadowRoot.querySelector("p");

  element.increase();
  await tick();
  expect(element.shadowRoot.querySelector("p")).toBe(node);
});

it("should pass props to children and update them", async () => {
  const element = mount("parent-element");
  const child = element.shadowRoot.querySelector("child-element");

  expect(child.shadowRoot).toHaveTextContent("1");
  expect(child.renderCount).toBe(1);

  element.increase();
  await tick();
  expect(child.shadowRoot).toHaveTextContent("2");
  expect(child.renderCount).toBe(2);
});

it("should read host attributes as props", () => {
  const element = mount(null, `<host-attribute count="7"></host-attribute>`);

  expect(element.shadowRoot.querySelector("p")).toHaveTextContent("[7]");
});

it("should bind refs and keep handler context intact", async () => {
  const element = mount("ref-element");
  const button = element.shadowRoot.querySelector("button");

  expect(element.buttonRef.current).toBe(button);
  expect(button).toHaveTextContent("Click me");

  button.click();
  await tick();
  expect(button).toHaveTextContent("Clicked");
  expect(element.seen).toBe(button);
});

it("should swap event handlers when they change", async () => {
  const element = mount("event-swap");
  const button = element.shadowRoot.querySelector("button");

  button.click();
  await tick();
  expect(element.state.a).toBe(1);

  element.setState({ mode: "b" });
  await tick();

  button.click();
  await tick();
  expect(element.state.a).toBe(1);
  expect(element.state.b).toBe(1);

  /* a nullish handler detaches the listener instead of leaving the old one */
  element.setState({ mode: "none" });
  await tick();

  button.click();
  await tick();
  expect(element.state.a).toBe(1);
  expect(element.state.b).toBe(1);
});

it("should serialize attribute values safely", () => {
  const element = mount("attribute-element");
  const node = element.shadowRoot.querySelector("div");

  expect(node.getAttribute("title")).toBe('X " onclick="alert(1) Y');
  expect(node.hasAttribute("onclick")).toBe(false);
  expect(node.getAttribute("data-note")).toBe("A&B <tag>");
});

it("should render interpolated markup as text", () => {
  const element = mount("raw-text");

  expect(element.shadowRoot.querySelector("p")).toHaveTextContent("<b>bold</b>");
  expect(element.shadowRoot.querySelector("b")).toBe(null);
});

it("should build attributes from static parts and holes", async () => {
  const element = mount("attribute-toggle");
  const node = element.shadowRoot.querySelector("div");

  expect(node.getAttribute("class")).toBe("box yes");
  expect(node.getAttribute("data-active")).toBe("yes");

  element.setState({ active: "no" });
  await tick();
  expect(node.getAttribute("class")).toBe("box no");
  expect(node.getAttribute("data-active")).toBe("no");
});

it("should omit attributes for false and nullish values", async () => {
  const element = mount("falsy-attribute");
  const button = element.shadowRoot.querySelector("button");

  expect(button.getAttribute("disabled")).toBe("true");
  expect(button).toHaveTextContent("off");

  element.setState({ disabled: false });
  await tick();
  expect(button.hasAttribute("disabled")).toBe(false);
  expect(button).toHaveTextContent("");
});

it("should render nothing for booleans and nullish values in text", () => {
  const element = mount("boolean-text");

  expect(element.shadowRoot.querySelector("p")).toHaveTextContent("abcde0");
});

it("should pass camelCase on* names as props, not dom events", async () => {
  const element = mount("callback-parent");
  const child = element.shadowRoot.querySelector("callback-child");

  expect(typeof child.props.onbuy).toBe("function");
  expect(child.onbuy).toBe(undefined);

  child.shadowRoot.querySelector("button").click();
  await tick();
  expect(element.state.bought).toBe("shoe");
});

it("should pass on* names that collide with dom handlers as props", async () => {
  const element = mount("colliding-parent");
  const child = element.shadowRoot.querySelector("colliding-child");

  /* onclose, onchange, oninput, onselect, ontoggle, oncancel, onsubmit and onerror all live on HTMLElement */
  expect("onclose" in child).toBe(true);
  expect(typeof child.props.onclose).toBe("function");
  expect(child.onclose).toBe(null);

  child.shadowRoot.querySelector("button").click();
  await tick();
  expect(element.state.closed).toBe(1);
});

it("should keep false props instead of dropping them", () => {
  const element = mount("falsy-prop-parent");
  const child = element.shadowRoot.querySelector("falsy-prop-child");

  expect(child.props.flag).toBe(false);
  expect(child.shadowRoot).toHaveTextContent("boolean");
});

it("should treat text ending in = as text, not as an attribute", () => {
  const element = mount("trailing-equals");
  const p = element.shadowRoot.querySelector("p");

  expect(p.getAttribute("title")).toBe("t");
  expect(p).toHaveTextContent("n=1 a=2");
});

it("should render and update lists", async () => {
  const element = mount("list-element");
  const items = () => [...element.shadowRoot.querySelectorAll("li")].map((n) => n.textContent);

  expect(items()).toEqual(["a", "b"]);

  element.setState({ items: [...element.state.items, "c"] });
  await tick();
  expect(items()).toEqual(["a", "b", "c"]);

  element.setState({ items: ["a"] });
  await tick();
  expect(items()).toEqual(["a"]);

  element.setState({ items: [] });
  await tick();
  expect(items()).toEqual([]);

  element.setState({ items: ["z"] });
  await tick();
  expect(items()).toEqual(["z"]);
});

it("should swap between text and template inside a list", async () => {
  const element = mount("mixed-list");
  const ul = () => element.shadowRoot.querySelector("ul");

  expect(ul()).toHaveTextContent("a");
  expect(ul().querySelector("li")).toBe(null);

  element.setState({ items: [{ n: "b" }] });
  await tick();
  expect(ul().querySelector("li")).toHaveTextContent("b");

  element.setState({ items: ["c"] });
  await tick();
  expect(ul().querySelector("li")).toBe(null);
  expect(ul()).toHaveTextContent("c");
});

it("should swap conditional branches", async () => {
  const element = mount("branch-element");

  expect(element.shadowRoot.querySelector("em")).toHaveTextContent("on kim");

  element.setState({ on: false });
  await tick();
  expect(element.shadowRoot.querySelector("em")).toBe(null);
  expect(element.shadowRoot.querySelector("s")).toHaveTextContent("off");

  element.setState({ on: true });
  element.setState({ name: "lee" });
  await tick();
  expect(element.shadowRoot.querySelector("em")).toHaveTextContent("on lee");
});

it("should render multi-root templates", () => {
  const element = mount("fragment-element");

  expect(element.shadowRoot.querySelectorAll("p").length).toBe(2);
});

it("should parse table rows and svg correctly", async () => {
  const table = mount("table-element");
  expect(table.shadowRoot.querySelector("td")).toHaveTextContent("1");

  table.setState({ n: 2 });
  await tick();
  expect(table.shadowRoot.querySelector("td")).toHaveTextContent("2");

  const svg = mount("svg-element");
  const circle = svg.shadowRoot.querySelector("circle");
  expect(circle.getAttribute("r")).toBe("5");
  expect(circle.namespaceURI).toBe("http://www.w3.org/2000/svg");
});

it("should update children when a nested prop value changes", async () => {
  const element = mount("nested-prop-parent");
  const child = element.shadowRoot.querySelector("nested-prop-child");

  expect(child.shadowRoot).toHaveTextContent("1");

  element.setState({ items: [{ n: 7 }] });
  await tick();
  expect(child.shadowRoot).toHaveTextContent("7");
});

it("should build props from several holes in one attribute", async () => {
  const element = mount("nested-prop-parent");
  const child = element.shadowRoot.querySelector("nested-prop-child");

  expect(child.props.label).toBe("a1-xb");
  expect(child.hasAttribute("label")).toBe(false);

  element.setState({ tag: "y" });
  await tick();
  expect(child.props.label).toBe("a1-yb");
  expect(child.shadowRoot).toHaveTextContent("1a1-yb");
});

it("should skip the style node when no style is set", () => {
  Nho.style = "";

  const element = mount("parent-element");

  expect(element.shadowRoot.querySelector("style")).toBe(null);
  expect(element.shadowRoot.querySelector("p")).toHaveTextContent("Count: 1");
});

it("should run effects only when their value changes", async () => {
  const element = mount("effect-element");
  expect(element.seen).toEqual([]);

  element.setState({ count: 1 });
  await tick();
  expect(element.seen).toEqual(["0->1"]);

  element.setState({ other: 9 });
  await tick();
  expect(element.seen).toEqual(["0->1"]);

  element.setState({ count: 2 });
  await tick();
  expect(element.seen).toEqual(["0->1", "1->2"]);
});

it("should run lifecycle hooks", async () => {
  const element = mount("lifecycle-element");

  expect(element.calls).toEqual(["updated", "mounted"]);

  element.setState({ count: 1 });
  await tick();
  expect(element.calls).toEqual(["updated", "mounted", "updated"]);

  element.remove();
  expect(element.calls.at(-1)).toBe("unmounted");
});

it("should batch multiple state changes into one render", async () => {
  const element = mount("parent-element");
  const child = element.shadowRoot.querySelector("child-element");
  const before = child.renderCount;

  element.increase();
  element.increase();
  element.increase();
  await tick();

  expect(child.renderCount).toBe(before + 1);
  expect(child.shadowRoot).toHaveTextContent("4");
});

it("should not re-render after unmount", async () => {
  const element = mount("parent-element");

  element.increase();
  element.remove();
  await tick();

  expect(element.shadowRoot.querySelector("p")).toHaveTextContent("Count: 1");
});

it("should run setup only once when the element is moved", async () => {
  const element = mount("setup-count");

  element.setState({ count: 5 });
  await tick();

  const props = element.props;
  element.remove();
  document.body.appendChild(element);

  expect(element.setupCount).toBe(1);
  expect(element.state.count).toBe(5);
  expect(element.props).toBe(props);
});
