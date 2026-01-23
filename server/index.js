// server/index.js
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
//import routes
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json()); //agar server bisa baca data JSON

// --ROUTE UTAMA-- //
app.use("/expenses", expenseRoutes);

app.listen(port, () => {
  console.log(`Server lari kencang di port ${port}`);
});
