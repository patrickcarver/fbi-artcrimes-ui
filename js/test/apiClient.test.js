import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { ApiClient } from "../apiClient.js";

const makeController = (overrides = {}) =>
  new ApiClient({ apiUrl: "https://example.com", ...overrides });

describe("ApiClient constructor", () => {
  test("throws when apiUrl is empty", () => {
    expect(() => new ApiClient({ apiUrl: "" })).toThrow("API URL is required");
  });

  test("throws when apiUrl is null", () => {
    expect(() => new ApiClient({ apiUrl: null })).toThrow(
      "API URL is required",
    );
  });

  test("throws when apiUrl does not exist", () => {
    expect(() => new ApiClient({})).toThrow("API URL is required");
  });

  test("creates instance with valid options", () => {
    expect(() => makeController()).not.toThrow();
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

    const result = await makeController().fetchWithRetry();
    expect(result).toEqual(data);
  });

  test("throws on 4xx response", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 404 });
    await expect(makeController().fetchWithRetry()).rejects.toThrow("4xx");
  });

  test("retries on 5xx response", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      });

    const promise = makeController({
      baseDelayMilliseconds: 10,
    }).fetchWithRetry();

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

    const promise = makeController({
      baseDelayMilliseconds: 10,
    }).fetchWithRetry();

    await vi.runAllTimersAsync();
    await expect(promise).resolves.toEqual({ ok: true });
  });

  test("throws after max retries exceeded", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500 });

    const assertion = expect(
      makeController({
        maxRetries: 2,
        baseDelayMilliseconds: 10,
      }).fetchWithRetry(),
    ).rejects.toThrow("Maximum retries");

    await vi.runAllTimersAsync();
    await assertion;
  });
});
