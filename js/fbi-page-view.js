import { LitElement, html, css } from "lit";
import { Task } from "@lit/task";
import { FbiPageGrid } from "./fbi-view-grid.js";
import { PageController } from "./pageController.js";

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

  #pageController = new PageController(this);

  constructor() {
    super();
    this.pageData = {};
    this.pageSize = 12;
    this.pageNumber = 1;
  }

  #pageDataTask = new Task(this, {
    task: async ([data, size, number]) => {
      const params = new URLSearchParams({
        pageSize: size,
        page: number,
      });

      const response = await fetch(
        `https://api.fbi.gov/artcrimes/list?${params}`,
      );

      if (!response.ok) throw new Error(`Failed to fetch data for ${params}`);

      return response.json();
    },
    args: () => [this.pageData, this.pageSize, this.pageNumber],
  });

  render() {
    return this.#pageDataTask.render({
      pending: () => html`<span>Loading...</span>`,
      complete: (pageData) =>
        html`<pre>${JSON.stringify(pageData, null, 2)}</pre>`,
      error: (error) => html`<span>Error: ${error.message}</span>`,
    });
  }
}

customElements.define("fbi-page-view", FbiPageView);
