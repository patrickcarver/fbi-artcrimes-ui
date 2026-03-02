import { ApiClient } from "./apiClient.js";

export class PageController {
  #host = null;
  #pageData = null;
  #apiClient = null;
  #cache = null;

  constructor(host, httpOptions) {
    this.#host = host;
    host.addController(this);
    this.#apiClient = new ApiClient(httpOptions);
  }

  get pageData() {
    return this.#pageData();
  }

  async loadPage({ number = 1, size = 12 } = {}) {
    try {
      return await this.#apiClient.fetchWithRetry({ number, size });
    } catch (error) {
      console.error(error);
    }
  }
}
