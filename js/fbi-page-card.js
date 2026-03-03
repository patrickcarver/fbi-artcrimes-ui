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
        () => html`<div>${this.item.additionalData}</div>`,
        () => nothing,
      )}
      <table>
        <tr>
          <td>Measurements:</td>
          <td>${this.item.measurements}</td>
        </tr>
        <tr>
          <td>Materials:</td>
          <td>${this.item.materials}</td>
        </tr>
        <tr>
          <td>Crime Category:</td>
          <td>${this.item.crimeCategory}</td>
        </tr>
      </table>
    `;
  }
}

customElements.define("fbi-page-card", FbiPageCard);
