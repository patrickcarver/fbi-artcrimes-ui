import { LitElement, html, css } from "lit";
import { Task } from "@lit/task";
import { FbiPageGrid } from "./fbi-view-grid.js";
import { PageController } from "./pageController.js";
import { config } from "./config.js";

export class FbiPageView extends LitElement {
  static styles = css`
    :host {
      display: block;
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
      complete: (data) => html`<pre>${data.get("pageNumber")}</pre>`,
      error: (error) => html`<span>Error: ${error.message}</span>`,
    });
  }
}

customElements.define("fbi-page-view", FbiPageView);
