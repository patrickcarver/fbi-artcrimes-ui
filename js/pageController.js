import { config } from "./config.js";

export class PageController {
  #host = null;
  #params = new URLSearchParams({
    size: 12,
    number: 1,
  });
  #pageData = null;

  constructor(host) {
    this.#host.addController(host);
  }

  get pageData() {
    return this.#pageData();
  }

  async hostConnected() {
    try {
      // const response = await fetchFromUrl(config.apiUrl);
    } catch (error) {}
  }
}
