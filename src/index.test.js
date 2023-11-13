import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Nho } from "./";

const tick = () => new Promise((r) => setTimeout(r, 500));

class ChildElement extends Nho {
  render(h) {
    h`<p>${this.props.count}</p>`;
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

customElements.define("parent-element", ParentElement);
customElements.define("child-element", ChildElement);

describe("test the library", () => {
  const name = "parent-element";
  const childName = "child-element";

  beforeEach(() => {
    const element = document.createElement(name);
    document.body.appendChild(element);
  });

  afterEach(() => {
    const element = document.querySelector(name);
    document.body.removeChild(element);
  });

  it("should render the custom element", () => {
    const element = document.querySelector(name);
    expect(element).toBeInTheDocument();
  });

  it("should render correct content", () => {
    const element = document.querySelector(name);
    const content = element.shadowRoot.querySelector("p");

    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Count: 1");
  });

  it("should behave correctly when an event happens", async () => {
    const element = document.querySelector(name);
    const content = element.shadowRoot.querySelector("p");
    const button = element.shadowRoot.querySelector("button");

    expect(content).toHaveTextContent("Count: 1");
    expect(button).toHaveTextContent("Increase");

    button.click();
    await tick();

    expect(content).toHaveTextContent("Count: 2");
  });

  it("should render child elements with correct props", async () => {
    const element = document.querySelector(name);
    const button = element.shadowRoot.querySelector("button");
    const getChild = () => element.shadowRoot.querySelectorAll(childName);

    expect(getChild().length).toBe(1);

    button.click();
    await tick();

    let newChild = getChild();
    expect(newChild.length).toBe(2);
  });
});
