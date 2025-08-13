import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv"
dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
}));

// Mongoose connection setup
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Mongoose schema and model for lyrics
const lyricsSchema = new mongoose.Schema({
    song: String,
    artist: String,
    lyrics: String
});
const Lyrics = mongoose.model("Lyrics", lyricsSchema);

// API to get song lyrics by song name and artist name using route parameters
app.get('/lyrics/:song/:artist', async (req, res) => {
    const { song, artist } = req.params;
    if (!song || !artist) {
        return res.status(400).json({ error: "Missing song or artist parameter" });
    }
    try {
        const lyricsDoc = await Lyrics.findOne({ song, artist });
        if (!lyricsDoc) {
            return res.status(404).json({ error: "Lyrics not found" });
        }
        res.json({ lyrics: lyricsDoc.lyrics });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// API to insert multiple lyrics (limit to 10)
app.post('/lyrics/bulk', async (req, res) => {
    const lyricsArray = [
        {
            song: "Mocking bird",
            artist: "Eminem",
            lyrics: `Hailie, I know you miss your mom
And I know you miss your dad when I’m gone
But I’m trying to give you the life that I never had
I can see you’re sad
Even when you smile
Even when you laugh
I can see it in your eyes
Deep inside, you wanna cry
Cuz you’re scared
I ain’t there?
Daddy’s with you in your prayers
No more crying
Wipe them tears
Daddy’s here
No more nightmares
We gonna pull together through it
We gon’ do it
Laini, uncle’s crazy ain’t he?
Yeah but he loves you girl and you better know it
We’re all we got in this world
When it spins
When it swirls
When it whirls
When it twirls
Two little beautiful girls
Looking puzzled, in a daze
I know it’s confusing you
Daddy’s always on the move
Mama’s always on the news
I try to keep you sheltered from it
But somehow it seems, the harder that I try to do that
the more it backfires on me
All the things, growing up
As daddy that he had to see
Daddy don’t want you to see
But you see just as much as me (to see?)
That we did not plan it to be this way
You’re mother and me
But things have got so bad between us
I don’t see us ever being
Together ever again
Like we used to be when was teenagers
But then of coarse
Everything always happens for a reason
I guess it was never meant to be
But it’s just something
We have no control over
And that’s what destiny is
But no more worries
Rest your head and go to sleep
Maybe one day we’ll wake up
And this will all just be a dream`
        }
    ];
    if (!Array.isArray(lyricsArray) || lyricsArray.length === 0) {
        return res.status(400).json({ error: "Request body must be a non-empty array" });
    }
    if (lyricsArray.length > 10) {
        return res.status(400).json({ error: "Maximum 10 lyrics can be inserted at once" });
    }
    try {
        const result = await Lyrics.insertMany(lyricsArray);
        res.status(201).json({ insertedCount: result.length, insertedLyrics: result });
    } catch (err) {
        res.status(500).json({ error: "Failed to insert lyrics" });
    }
});

app.get('/', (req, res) => {
    res.send('Hello React');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});