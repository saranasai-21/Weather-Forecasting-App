const ALLOWED_LAYERS = new Set(["temp", "precipitation", "wind"]);

export default async function handler(req, res) {
  const { layer, z, x, y } = req.query;
  const key = process.env.OWM_API_KEY;

  if (!key) {
    return res.status(404).send("OpenWeatherMap key is not configured.");
  }

  if (!ALLOWED_LAYERS.has(layer)) {
    return res.status(400).send("Invalid map layer.");
  }

  const tileUrl = `https://tile.openweathermap.org/map/${layer}_new/${z}/${x}/${y}.png?appid=${key}`;

  try {
    const response = await fetch(tileUrl);
    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(response.status).send(buffer);
  } catch (error) {
    return res.status(502).send("Unable to reach OpenWeatherMap.");
  }
}
