const play = require('play-dl');

(async () => {
  try {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    if (!url) {
      throw new Error("URL is undefined");
    }

    const stream = await play.stream(url);
    console.log("✅ Stream object:", stream);
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
