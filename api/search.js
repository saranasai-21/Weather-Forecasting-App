const WEATHER_API_BASE_URL = "https://api.weatherapi.com/v1";

export default async function handler(req, res) {
  const query = req.query.q;
  const key = process.env.WEATHERAPI_KEY;

  if (!key) {
    return res.status(500).json({ error: { message: "WEATHERAPI_KEY is not configured on the server." } });
  }

  if (!query) {
    return res.status(400).json({ error: { message: "Missing search query." } });
  }

  const url = new URL(`${WEATHER_API_BASE_URL}/search.json`);
  url.searchParams.set("key", key);
  url.searchParams.set("q", query);

  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({ error: { message: "Unable to reach WeatherAPI." } });
  }
}
