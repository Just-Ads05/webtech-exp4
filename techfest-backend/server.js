require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("./middleware/logger");
const errors = require("./middleware/errorHandler");


const app = express();
app.use(cors());           // allow React (port 5173) to call the API
app.use(express.json());
app.use(logger);           // 1. log every request
app.use("/api/cart", require("./routes/cart"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/registrations", require("./routes/registrations"));

app.use(errors.notFound);      // 2. unknown URL: 404
app.use(errors.errorHandler);  // 3. any error: JSON

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB error:", err.message));

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
