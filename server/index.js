const express = require("express");
const db = require("./config/db");
const app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.send("API Money Record Jalan Boss!!");
});

app.listen(port, () => {
  console.log(`Server lari kencang di port ${port}`);
});