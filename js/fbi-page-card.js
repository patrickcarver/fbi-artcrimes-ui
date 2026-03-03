import { LitElement, html, css, nothing } from "lit";
import { when } from "lit/directives/when.js";

export class FbiPageCard extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      background: var(--primary-background-color);
      border-radius: 12px;
      box-sizing: border-box;
      padding: 0.5rem;
      gap: 0.5rem;
    }

    .title {
      font-size: 1.25rem;
      font-weight: bold;
    }
  `;

  static properties = {
    item: { type: Object },
  };

  constructor() {
    super();
    this.item = {};
  }

  render() {
    return html`
      <img src="${this.item.images[0]?.original}" />
      <span class="title">${this.item.title}</span>
      <span>By ${this.item.maker}</span>
      <div>${this.item.description}</div>
      ${when(
        this.item.additionalData !== "",
        () =>
          html` <section>
            <span>Additional Info:</span>
            <span>${this.item.additionalData}</span>
          </section>`,
        () => nothing,
      )}
      <section>
        <span>Measurements:</span>
        <span>${this.item.measurements}</span>
      </section>
      <section>
        <span>Materials:</span>
        <span>${this.item.materials}</span>
      </section>
      <section>
        <span>Crime Category:</span>
        <span>${this.item.crimeCategory}</span>
      </section>
    `;
  }
}

customElements.define("fbi-page-card", FbiPageCard);
