const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello this is home page");
});

app.listen(3000, () => {
  console.log(`Server Starts at PORT : 3000`);
});
