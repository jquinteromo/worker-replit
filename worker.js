
//Para prubeas locales:
// const { spawn } = require("child_process");

// const videoUrl = process.argv[2];
// const formatId = process.argv[3];

// const ytdlp = spawn("yt-dlp", [
//   "-f",
//   formatId,
//   "-o",
//   "-",
//   videoUrl,
// ]);

// const ffmpeg = spawn("ffmpeg", [
//   "-i", "pipe:0",
//   "-vn",
//   "-acodec", "libmp3lame",
//   "-ab", "192k",
//   "-f", "mp3",
//   "pipe:1",
// ]);

// ytdlp.stdout.pipe(ffmpeg.stdin);
// ffmpeg.stdout.pipe(process.stdout);

// ffmpeg.stderr.on("data", (data) => {
//   console.error("[ffmpeg]", data.toString());
// });

// ytdlp.stderr.on("data", (data) => {
//   console.error("[yt-dlp]", data.toString());
// });

// process.on("SIGINT", () => {
//   ytdlp.kill("SIGKILL");
//   ffmpeg.kill("SIGKILL");
// });


//conexion directa con api :
const express = require("express");
const { spawn } = require("child_process");

const app = express();

app.get("/convert", (req, res) => {
  const videoUrl = req.query.url;
  const formatId = req.query.format || "140"; // default a m4a

  if (!videoUrl) {
    return res.status(400).send("❌ Falta la URL del video.");
  }

  console.log(`🎬 Recibido: ${videoUrl} | Formato: ${formatId}`);

  const ytdlp = spawn("yt-dlp", [
    "-f", formatId,
    "-o", "-",
    videoUrl,
  ]);

  const ffmpeg = spawn("ffmpeg", [
    "-i", "pipe:0",
    "-vn",
    "-acodec", "libmp3lame",
    "-ab", "192k",
    "-f", "mp3",
    "pipe:1",
  ]);

  ytdlp.stdout.pipe(ffmpeg.stdin);
  ffmpeg.stdout.pipe(res);

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Disposition", "inline; filename=audio.mp3");

  ffmpeg.stderr.on("data", (data) => {
    console.error("[ffmpeg]", data.toString());
  });

  ytdlp.stderr.on("data", (data) => {
    console.error("[yt-dlp]", data.toString());
  });

  ffmpeg.on("close", () => {
    console.log("✅ Conversión terminada.");
  });

  req.on("close", () => {
    console.log("⚠️ Cliente desconectado. Matando procesos...");
    ytdlp.kill("SIGKILL");
    ffmpeg.kill("SIGKILL");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Worker corriendo en puerto ${PORT}`);
});
