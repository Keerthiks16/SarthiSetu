import express from "express";
import dotenv from "dotenv";
import connectdb from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import jobRouter from "./routes/job.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

let app = express();

app.use(
  cors({
    origin: [
      "http://localhost:8081", // Expo web
      "http://localhost:19006", // Expo web alternative port
      "http://192.168.1.100:8081", // Replace with your local IP if needed
      "http://localhost:5173",
    ],
    credentials: true, // Important for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.send("NFC 25");
});
app.use("/api/auth", authRouter);
app.use("/api/job", jobRouter);

app.listen(PORT, () => {
  console.log(`Listening to: http://localhost:` + PORT);
  connectdb();
});
