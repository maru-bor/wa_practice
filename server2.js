const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const DB_FILE = "db.json";

function loadData() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.get("/drinks", (req, res) => {
  const data = loadData();
  res.setHeader("X-Server-ID", "2");
  res.json(data.drinks);
});

app.get("/drinks/:id", (req, res) => {
  const data = loadData();
  const drink = data.drinks.find(d => d.id == req.params.id);
  res.setHeader("X-Server-ID", "2");
  if (!drink) return res.status(404).json({ error: "Not found" });
  res.json(drink);
});

app.post("/drinks", (req, res) => {
  const data = loadData();
  const newDrink = req.body;

  const newId = data.drinks.length
    ? Math.max(...data.drinks.map(d => d.id)) + 1
    : 1;

  newDrink.id = newId;
  data.drinks.push(newDrink);
  saveData(data);

  res.setHeader("X-Server-ID", "2");
  res.status(201).json(newDrink);
});

app.put("/drinks/:id", (req, res) => {
  const data = loadData();
  const drink = data.drinks.find(d => d.id == req.params.id);
  res.setHeader("X-Server-ID", "2");
  if (!drink) return res.status(404).json({ error: "Not found" });

  Object.assign(drink, req.body);
  saveData(data);
  res.json(drink);
});

app.listen(8002, () => {
  console.log("Server 2 running on port 8002");
});
