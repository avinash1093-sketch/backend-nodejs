import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import routes from "./routes/Auths.js";
import verifyToken from "./middleware/jwtVerification.js";
import databaseMiddleware from "./middleware/dbConnection.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(databaseMiddleware);

app.use("/api/auth", routes);

// Mongoose schema and model for lyrics
const lyricsSchema = new mongoose.Schema({
  song: String,
  artist: String,
  lyrics: String,
});
const Lyrics = mongoose.model("Lyrics", lyricsSchema);

// API to get song lyrics by song name and artist name using route parameters
app.get("/lyrics/:song/:artist", verifyToken, async (req, res) => {
  const { song, artist } = req.params;
  if (!song || !artist) {
    return res.status(400).json({ error: "Missing song or artist parameter" });
  }
  try {
    const lyricsDoc = await Lyrics.findOne({
      song: { $regex: song, $options: "i" },
      artist: { $regex: artist, $options: "i" },
    });
    if (!lyricsDoc) {
      return res.status(404).json({ error: "Lyrics not found" });
    }
    res.json({ lyrics: lyricsDoc.lyrics });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", err });
  }
});

// API to insert multiple lyrics (limit to 10)
app.post("/lyrics/bulk", verifyToken, async (req, res) => {
  const lyricsArray = [
    {
      song: "Mocking bird",
      artist: "Eminem",
      lyrics: `Hailie, I know you miss your mom And I know you miss your dad when I’m gone...`,
    },
  ];
  if (!Array.isArray(lyricsArray) || lyricsArray.length === 0) {
    return res
      .status(400)
      .json({ error: "Request body must be a non-empty array" });
  }
  if (lyricsArray.length > 10) {
    return res
      .status(400)
      .json({ error: "Maximum 10 lyrics can be inserted at once" });
  }
  try {
    const result = await Lyrics.insertMany(lyricsArray);
    res
      .status(201)
      .json({ insertedCount: result.length, insertedLyrics: result });
  } catch (err) {
    res.status(500).json({ error: "Failed to insert lyrics" });
  }
});

// API to insert lyrics (limit to 10)
app.post("/lyrics/addOne", verifyToken, async (req, res) => {
  const { songName, artistName, lyrics } = req.body;
  if (!req.body) {
    return res.status(400).json({ error: "Error body not found" });
  }
  try {
    const result = await Lyrics.insertOne({
      song: songName,
      artist: artistName,
      lyrics: lyrics,
    });
    res.status(201).json({ insertedLyrics: result });
  } catch (err) {
    res.status(500).json({ error: "Failed to insert lyrics" });
  }
});

app.listen(process.env.SERVER_PORT_1, () => {
  console.log(`Server listening on port ${process.env.SERVER_PORT_1}`);
});
