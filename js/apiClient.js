export class ApiClient {
  #attempt;
  #apiUrl;
  #maxRetries;
  #baseDelayMilliseconds;
  #httpOptions;

  constructor(options) {
    this.#apiUrl = options.url?.api;
    this.#maxRetries = options.fetch?.maxRetries || 3;
    this.#baseDelayMilliseconds = options.fetch?.baseDelayMilliseconds || 1000;
    this.#httpOptions = options.fetch?.httpOptions || {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    };

    if (
      options.url?.api !== null &&
      options.url?.api !== "" &&
      options.url?.api !== undefined
    ) {
      this.#apiUrl = options.url?.api;
    } else {
      throw new Error("API URL is required");
    }
  }

  #is4xx(status) {
    return status >= 400 && status <= 499;
  }

  #is5xx(status) {
    return status >= 500 && status <= 599;
  }

  #sleep() {
    return new Promise((resolve) => {
      setTimeout(resolve, this.#baseDelayMilliseconds);
    });
  }

  #exponentialBackoffMilliseconds(attempt) {
    return this.#baseDelayMilliseconds * 2 ** (attempt - 1);
  }

  async #retryWithBackoff(params, errorMessage, attempt) {
    attempt++;
    const finalErrorMessage = `Maximum retries (${this.#maxRetries}) reached: ${errorMessage}`;
    if (attempt > this.#maxRetries) throw new Error(finalErrorMessage);

    const backoffMilliseconds = this.#exponentialBackoffMilliseconds(attempt);
    await this.#sleep(backoffMilliseconds);

    return this.fetchWithRetry(params, attempt);
  }

  async fetchWithRetry(params, attempt = 1) {
    try {
      const url = `${this.#apiUrl}?${new URLSearchParams(params).toString()}`;
      const response = await fetch(url, this.#httpOptions);

      if (response.ok) {
        return await response.json();
      }

      if (this.#is5xx(response.status)) {
        const errorMessage = `Received this 5xx status code error: ${response.status}`;
        return this.#retryWithBackoff(params, errorMessage, attempt);
      }

      if (this.#is4xx(response.status)) {
        const errorMessage = `Unable to retry on 4xx status code error: ${response.status}`;
        throw new Error(errorMessage);
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      if (error instanceof TypeError) {
        return this.#retryWithBackoff(params, error.message, attempt);
      }
      throw error;
    }
  }
}
