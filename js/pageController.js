import { ApiClient } from "./apiClient.js";
import { mapPageData } from "./mapPageData.js";

export class PageController {
  #host = null;
  #pageData = null;
  #apiClient = null;
  #cache = null;
  #url = null;

  constructor(host, config) {
    this.#host = host;
    host.addController(this);

    this.#cache = new Map();
    this.#apiClient = new ApiClient(config);
    this.#url = config.url;
  }

  async loadPage({ page = 1, pageSize = 12 } = {}) {
    try {
      if (this.#cache.has(page) && this.#cache.get(page) != null) {
        return this.#cache.get(page);
      } else {
        const response = await this.#apiClient.fetchWithRetry({
          page,
          pageSize,
        });
        const pageData = mapPageData(response, this.#url);
        this.#cache.set(page, pageData);
        return pageData;
      }
    } catch (error) {
      console.error(error);
    }
  }
}
