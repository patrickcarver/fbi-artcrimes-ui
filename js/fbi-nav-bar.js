import { LitElement, html, css } from "lit";

export class FbiNavBar extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  static properties = {
    pageNumber: { type: Number },
  };

  constructor() {
    super();
    this.pageNumber = 0;
  }

  #onBackClick() {
    this.dispatchEvent(
      new CustomEvent("back-one", { bubbles: true, composed: true }),
    );
  }

  #onNextClick() {
    this.dispatchEvent(
      new CustomEvent("next-one", { bubbles: true, composed: true }),
    );
  }

  render() {
    return html`
      <button
        type="button"
        id="back-btn"
        name="back-btn"
        ?disabled=${this.pageNumber === 1}
        @click=${this.#onBackClick}
      >
        <
      </button>
      <span>${this.pageNumber}</span>
      <button
        type="button"
        id="next-btn"
        name="next-btn"
        @click=${this.#onNextClick}
      >
        >
      </button>
    `;
  }
}

customElements.define("fbi-nav-bar", FbiNavBar);
