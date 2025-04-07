export default async function handler(req, res) {
  const API_KEY = 'AIzaSyBu9InvdlLMLd2vt5JDY4OdOkMgqEE5sHc';
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Missing query' });
  }

  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${API_KEY}`
  );
  const searchData = await searchRes.json();

  const videoIds = searchData.items.map(item => item.id.videoId).join(',');

  const detailsRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds}&key=${API_KEY}`
  );
  const detailsData = await detailsRes.json();

  const allTags = detailsData.items.flatMap(video => video.snippet.tags || []);
  const tagFrequency = {};
  allTags.forEach(tag => {
    tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
  });

  const sortedTags = Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  res.status(200).json({ tags: sortedTags.slice(0, 20) });
}
