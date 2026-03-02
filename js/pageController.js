import { ApiClient } from "./apiClient.js";
import { mapPageData } from "./mapPageData.js";

export class PageController {
  #host = null;
  #pageData = null;
  #apiClient = null;
  #pageCache = null;
  #url = null;

  constructor(host, config) {
    this.#host = host;
    host.addController(this);
    this.#pageCache = new Map();
    this.#apiClient = new ApiClient(config);
    this.#url = config.url;
  }

  async loadPage({ page = 1, pageSize = 12 } = {}) {
    try {
      const response = await this.#apiClient.fetchWithRetry({ page, pageSize });
      return mapPageData(response, this.#url);
    } catch (error) {
      console.error(error);
    }
  }
}
