import { LitElement, html, css } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { Task } from "@lit/task";
import { PageController } from "./pageController.js";
import { FbiPageCard } from "./fbi-page-card.js";
import { config } from "./config.js";

export class FbiPageView extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .card-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 0.5rem;
    }
  `;

  static properties = {
    pageData: { type: Object },
    pageSize: { type: Number },
    pageNumber: { type: Number },
  };

  #pageController = null;

  #fetchPage = new Task(this, {
    task: ([pageNumber, pageSize]) =>
      this.#pageController.loadPage({ number: pageNumber, size: pageSize }),
    args: () => [this.pageNumber, this.pageSize],
  });

  constructor() {
    super();
    this.pageData = {};
    this.pageSize = 12;
    this.pageNumber = 1;
    this.#pageController = new PageController(this, config);
  }

  render() {
    return this.#fetchPage.render({
      pending: () => html`<span>Loading...</span>`,
      complete: (data) =>
        html` <div class="card-container">
          ${repeat(
            data.get("items"),
            (item) => item.uid,
            (item) => html`<fbi-page-card .item=${item}></fbi-page-card>`,
          )}
        </div>`,
      error: (error) => html`<span>Error: ${error.message}</span>`,
    });
  }
}

customElements.define("fbi-page-view", FbiPageView);
