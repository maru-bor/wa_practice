/**
 * Router - Load Balancer
 * Port: 8000
 */

const express = require("express");
const fetch = require("node-fetch"); 
const app = express();

// backend servery
const servers = [
  "http://localhost:8001", // Python
  "http://localhost:8002", // JS
];

let counter = 0;

function pickServer() {
  const server = servers[counter % servers.length];
  counter++;
  return server;
}

async function forward(req, res, path) {
  const target = pickServer() + path;

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!["host", "content-length"].includes(key.toLowerCase())) {
      headers[key] = value;
    }
  }

  const response = await fetch(target, {
    method: req.method,
    headers: headers,
    body: ["GET", "HEAD"].includes(req.method)
      ? undefined
      : req.body,
  });

  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const body = await response.buffer();
  res.send(body);
}


app.get("/drinks", (req, res) => {
  forward(req, res, "/drinks");
});

app.get("/drinks/:id", (req, res) => {
  forward(req, res, `/drinks/${req.params.id}`);
});

app.post("/drinks", express.raw({ type: "*/*" }), (req, res) => {
  forward(req, res, "/drinks");
});

app.put("/drinks/:id", express.raw({ type: "*/*" }), (req, res) => {
  forward(req, res, `/drinks/${req.params.id}`);
});

app.listen(8000, () => {
  console.log("Router running on port 8000");
});
