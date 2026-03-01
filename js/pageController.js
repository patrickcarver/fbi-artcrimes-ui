import { ApiClient } from "./apiClient.js";

export class PageController {
  #host = null;
  #params = new URLSearchParams({
    size: 12,
    number: 1,
  });
  #pageData = null;
  #apiClient = null;

  constructor(host, httpOptions = {}) {
    this.#host = host;
    host.addController(this);
    this.#apiClient = new ApiClient(httpOptions);
  }

  get pageData() {
    return this.#pageData();
  }

  async hostConnected() {
    try {
      // const response = await fetchWithRetry(config.apiUrl);
      //
    } catch (error) {}
  }
}
