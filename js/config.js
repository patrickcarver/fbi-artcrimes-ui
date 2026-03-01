export const config = {
  apiUrl: "https://api.fbi.gov/artcrimes/list",
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
