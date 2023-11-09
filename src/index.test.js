import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Nho } from "./";

const tick = () => new Promise((r) => setTimeout(r, 100));

class HelloWorld extends Nho {
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
      </div>
    `;
  }
}

customElements.define("hello-world", HelloWorld);

describe("test the library", () => {
  const name = "hello-world";

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
});
