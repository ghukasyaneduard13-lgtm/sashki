
"use strict";

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
  res.json({
    name: "AURA DRIVE",
    status: "online",
    multiplayer: true
  });
});

const players = {};

io.on("connection", (socket) => {
  console.log("Игрок подключился:", socket.id);

  players[socket.id] = {
    id: socket.id,
    x: 0,
    y: 0,
    z: 0,
    rotation: 0,
    car: 0
  };

  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", players[socket.id]);

  socket.on("playerMovement", (data) => {
    if (!players[socket.id]) return;

    players[socket.id] = {
      ...players[socket.id],
      x: Number(data.x) || 0,
      y: Number(data.y) || 0,
      z: Number(data.z) || 0,
      rotation: Number(data.rotation) || 0,
      car: Number(data.car) || 0
    };

    socket.broadcast.emit("playerMoved", players[socket.id]);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
    console.log("Игрок отключился:", socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`AURA DRIVE запущена на порту ${PORT}`);
});
