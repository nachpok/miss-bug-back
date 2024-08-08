import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { setupAsyncLocalStorage } from "./middlewares/setupAls.middleware.js";

import { bugRoutes } from "./api/bug/bug.routes.js";
import { userRoutes } from "./api/user/user.routes.js";
import { authRoutes } from "./api/auth/auth.routes.js";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
  origin: [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5174",
    "http://localhost:5174",
    "https://miss-bug-back.onrender.com/",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/bug", bugRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

app.all("*", setupAsyncLocalStorage);

app.get("/**", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

const port = process.env.PORT || 3030;
app.listen(port, () => console.log(`Server listening on port:${port}/`));
