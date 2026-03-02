import { describe, test, expect } from "vitest";
import { mapPageData } from "../mapPageData.js";

const url = {
  image: "https://artcrimes.fbi.gov",
  link: "https://www.fbi.gov",
};

const makeItem = (overrides = {}) => ({
  title: "Stolen Painting",
  description: "A valuable painting",
  additionalData: "Some data",
  url: "https://www.fbi.gov/artcrimes/case-1",
  measurements: "10x20cm",
  materials: "Oil on canvas",
  maker: "Unknown",
  crimeCategory: "Theft",
  images: [],
  ...overrides,
});

const makeRaw = (overrides = {}) => ({
  total: 100,
  page: 1,
  items: [],
  ...overrides,
});

describe("mapPageData", () => {
  test("returns a Map with totalPages, pageNumber, and items keys", () => {
    const result = mapPageData(makeRaw(), url);
    expect(result).toBeInstanceOf(Map);
    expect(result.has("totalPages")).toBe(true);
    expect(result.has("pageNumber")).toBe(true);
    expect(result.has("items")).toBe(true);
  });

  test("maps total to totalPages", () => {
    const result = mapPageData(makeRaw({ total: 42 }), url);
    expect(result.get("totalPages")).toBe(42);
  });

  test("maps page to pageNumber", () => {
    const result = mapPageData(makeRaw({ page: 3 }), url);
    expect(result.get("pageNumber")).toBe(3);
  });

  test("maps items array", () => {
    const result = mapPageData(makeRaw({ items: [makeItem()] }), url);
    expect(result.get("items")).toHaveLength(1);
  });
});

describe("sanitizeInteger (via totalPages / pageNumber)", () => {
  test("passes through a valid safe integer", () => {
    expect(mapPageData(makeRaw({ total: 50 }), url).get("totalPages")).toBe(50);
  });

  test("returns 0 for a float", () => {
    expect(mapPageData(makeRaw({ total: 3.7 }), url).get("totalPages")).toBe(0);
  });

  test("returns 0 for a numeric string", () => {
    expect(mapPageData(makeRaw({ total: "42" }), url).get("totalPages")).toBe(
      0,
    );
  });

  test("returns 0 for null", () => {
    expect(mapPageData(makeRaw({ total: null }), url).get("totalPages")).toBe(
      0,
    );
  });

  test("returns 0 for undefined", () => {
    expect(
      mapPageData(makeRaw({ total: undefined }), url).get("totalPages"),
    ).toBe(0);
  });
});

describe("mapItem — string fields", () => {
  const getItem = (overrides) =>
    mapPageData(makeRaw({ items: [makeItem(overrides)] }), url).get("items")[0];

  test("maps title", () => {
    expect(getItem({ title: "The Scream" }).title).toBe("The Scream");
  });

  test("trims whitespace from strings", () => {
    expect(getItem({ title: "  trimmed  " }).title).toBe("trimmed");
  });

  test("truncates strings to 255 characters", () => {
    const long = "a".repeat(300);
    expect(getItem({ title: long }).title).toHaveLength(255);
  });

  test("handles null string fields gracefully", () => {
    expect(getItem({ title: null }).title).toBe("");
  });

  test("strips HTML tags from strings", () => {
    expect(getItem({ title: "<b>Bold</b>" }).title).toBe("Bold");
  });

  test("maps description", () => {
    expect(getItem({ description: "Oil on canvas" }).description).toBe(
      "Oil on canvas",
    );
  });

  test("maps maker", () => {
    expect(getItem({ maker: "Picasso" }).maker).toBe("Picasso");
  });

  test("maps crimeCategory", () => {
    expect(getItem({ crimeCategory: "Theft" }).crimeCategory).toBe("Theft");
  });
});

describe("mapItem — linkUrl", () => {
  const getItem = (overrides) =>
    mapPageData(makeRaw({ items: [makeItem(overrides)] }), url).get("items")[0];

  test("passes a valid fbi.gov link through", () => {
    expect(
      getItem({ url: "https://www.fbi.gov/artcrimes/case-1" }).linkUrl,
    ).toBe("https://www.fbi.gov/artcrimes/case-1");
  });

  test("returns null for a non-https link", () => {
    expect(
      getItem({ url: "http://www.fbi.gov/artcrimes/case-1" }).linkUrl,
    ).toBeNull();
  });

  test("returns null for a link with a different origin", () => {
    expect(getItem({ url: "https://evil.com/page" }).linkUrl).toBeNull();
  });

  test("returns null for a null link", () => {
    expect(getItem({ url: null }).linkUrl).toBeNull();
  });

  test("throws for a malformed URL", () => {
    expect(() => getItem({ url: "not-a-url" })).toThrow();
  });
});

describe("mapItem — images", () => {
  const imageUrl =
    "https://artcrimes.fbi.gov/image-repository/figure-2.jpg/@@images/image/large";

  const getImages = (images) =>
    mapPageData(makeRaw({ items: [makeItem({ images })] }), url).get("items")[0]
      .images;

  test("returns empty array when images is not an array", () => {
    expect(getImages(null)).toEqual([]);
    expect(getImages(undefined)).toEqual([]);
  });

  test("sanitizes image URLs", () => {
    const [img] = getImages([
      {
        large: imageUrl,
        thumb: imageUrl,
        original: "https://artcrimes.fbi.gov/image-repository/figure-2.jpg",
        caption: "A stolen painting",
      },
    ]);
    expect(img.large).toBe(imageUrl);
    expect(img.original).toBe(
      "https://artcrimes.fbi.gov/image-repository/figure-2.jpg",
    );
  });

  test("returns null for image URL with wrong origin", () => {
    const [img] = getImages([
      {
        large: "https://evil.com/image.jpg",
        thumb: null,
        original: null,
        caption: "",
      },
    ]);
    expect(img.large).toBeNull();
  });

  test("sanitizes caption", () => {
    const [img] = getImages([
      { large: null, thumb: null, original: null, caption: "  A caption  " },
    ]);
    expect(img.caption).toBe("A caption");
  });
});
