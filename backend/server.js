const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5010;


// ==========================
// MIDDLEWARE
// ==========================

app.use(
  cors({
    origin: "http://localhost:5181",
    credentials: true
  })
);

app.use(express.json());

app.use(cookieParser());


// ==========================
// ROUTES
// ==========================

const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);


// ==========================
// TEST ROUTE
// ==========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Authentication API is running",
    port: PORT
  });
});


// ==========================
// MONGODB CONNECTION
// ==========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error);
  });