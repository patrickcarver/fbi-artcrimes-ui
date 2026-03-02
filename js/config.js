export const config = {
  url: {
    api: "https://api.fbi.gov/artcrimes/list",
    image: "https://artcrimes.fbi.gov",
    link: "https://www.fbi.gov",
  },
  fetch: {
    maxRetries: 3,
    baseDelayMilliseconds: 1000,
    httpOptions: {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    },
  },
};
