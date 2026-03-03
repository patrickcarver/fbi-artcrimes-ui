export function mapPageData(raw, url) {
  const totalPages = sanitizeInteger(raw.total);
  const pageNumber = sanitizeInteger(raw.page);
  const items = raw.items.map((item) => mapItem(item, url));

  return new Map([
    ["totalPages", totalPages],
    ["pageNumber", pageNumber],
    ["items", items],
  ]);
}

const sanitizeInteger = (value) => (Number.isSafeInteger(value) ? value : 0);

const sanitizeString = (value, maxLength = 255) =>
  String(value ?? "")
    .trim()
    .replace(/<[^>]*>/g, "")
    .slice(0, maxLength);

const sanitizeUrl = (value, baseUrl) => {
  if (!value) return null;
  const url = new URL(value);
  if (url.protocol !== "https:") return null;
  if (url.origin !== baseUrl) return null;
  return url.href;
};

const sanitizeImage = ({ large, caption, thumb, original }, imageUrl) => ({
  large: sanitizeUrl(large, imageUrl),
  thumb: sanitizeUrl(thumb, imageUrl),
  original: sanitizeUrl(original, imageUrl),
  caption: sanitizeString(caption),
});

const sanitizeImages = (images, imageUrl) =>
  Array.isArray(images)
    ? images.map((image) => sanitizeImage(image, imageUrl))
    : [];

const mapItem = (item, url) => {
  const uid = sanitizeString(item.uid);
  const images = sanitizeImages(item.images, url.image);
  const description = sanitizeString(item.description);
  const additionalData = sanitizeString(item.additionalData);
  const title = sanitizeString(item.title);
  const linkUrl = sanitizeUrl(item.url, url.link);
  const measurements = item.measurements
    ? sanitizeString(item.measurements)
    : "Unknown";
  const materials = item.materials ? sanitizeString(item.materials) : "Unknown";
  const maker = item.maker ? sanitizeString(item.maker) : "Unknown";
  const crimeCategory = sanitizeString(item.crimeCategory);

  return {
    uid,
    images,
    description,
    additionalData,
    title,
    linkUrl,
    measurements,
    materials,
    maker,
    crimeCategory,
  };
};
