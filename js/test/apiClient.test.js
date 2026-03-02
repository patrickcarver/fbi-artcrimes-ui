import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { ApiClient } from "../apiClient.js";

const defaultOptions = {
  apiUrl: "https://example.com",
  fetch: { maxRetries: 3, baseDelayMilliseconds: 1000 },
};

const makeClient = (overrides = {}) =>
  new ApiClient({ ...defaultOptions, ...overrides });

const defaultParams = { number: 1, size: 12 };

describe("ApiClient constructor", () => {
  test("throws when apiUrl is empty", () => {
    expect(() => new ApiClient({ apiUrl: "", fetch: {} })).toThrow(
      "API URL is required",
    );
  });

  test("throws when apiUrl is null", () => {
    expect(() => new ApiClient({ apiUrl: null, fetch: {} })).toThrow(
      "API URL is required",
    );
  });

  test("throws when apiUrl does not exist", () => {
    expect(() => new ApiClient({ fetch: {} })).toThrow("API URL is required");
  });

  test("creates instance with valid options", () => {
    expect(() => makeClient()).not.toThrow();
  });
});

describe("fetchWithRetry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  test("returns JSON on 200 response", async () => {
    const data = { id: 1 };
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    });

    const result = await makeClient().fetchWithRetry(defaultParams);
    expect(result).toEqual(data);
  });

  test("builds URL with query params", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await makeClient().fetchWithRetry({ number: 2, size: 10 });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.com?number=2&size=10",
      expect.any(Object),
    );
  });

  test("throws on 4xx response", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 404 });
    await expect(
      makeClient().fetchWithRetry(defaultParams),
    ).rejects.toThrow("4xx");
  });

  test("retries on 5xx response", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      });

    const promise = makeClient({
      fetch: { maxRetries: 3, baseDelayMilliseconds: 10 },
    }).fetchWithRetry(defaultParams);

    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test("retries on network error (TypeError)", async () => {
    global.fetch
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      });

    const promise = makeClient({
      fetch: { maxRetries: 3, baseDelayMilliseconds: 10 },
    }).fetchWithRetry(defaultParams);

    await vi.runAllTimersAsync();
    await expect(promise).resolves.toEqual({ ok: true });
  });

  test("throws after max retries exceeded", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500 });

    const assertion = expect(
      makeClient({
        fetch: { maxRetries: 2, baseDelayMilliseconds: 10 },
      }).fetchWithRetry(defaultParams),
    ).rejects.toThrow("Maximum retries");

    await vi.runAllTimersAsync();
    await assertion;
  });
});
