import { LitElement, html, css } from "lit";

export class FbiPageGrid extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  static properties = {};

  render() {
    return html`view grid`;
  }
}

customElements.define("fbi-view-grid", FbiPageGrid);
