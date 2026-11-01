
export class Multiplayer {
  constructor(options = {}) {
    this.onPlayers = options.onPlayers || (() => {});
    this.onPlayerJoined = options.onPlayerJoined || (() => {});
    this.onPlayerMoved = options.onPlayerMoved || (() => {});
    this.onPlayerLeft = options.onPlayerLeft || (() => {});

    this.socket = null;
    this.id = null;
  }

  connect() {
    if (typeof window.io !== "function") {
      console.error("Socket.IO не загружен");
      return;
    }

    this.socket = window.io();

    this.socket.on("connect", () => {
      this.id = this.socket.id;
      console.log("AURA DRIVE: подключено", this.id);
    });

    this.socket.on("currentPlayers", (players) => {
      this.id = this.socket.id;
      this.onPlayers(players);
    });

    this.socket.on("newPlayer", (player) => {
      this.onPlayerJoined(player);
    });

    this.socket.on("playerMoved", (player) => {
      this.onPlayerMoved(player);
    });

    this.socket.on("playerDisconnected", (id) => {
      this.onPlayerLeft(id);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Ошибка подключения:", error.message);
    });
  }

  sendMovement(data) {
    if (!this.socket || !this.socket.connected) return;

    this.socket.emit("playerMovement", {
      x: data.x,
      z: data.z,
      rotation: data.rotation,
      car: data.car
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.id = null;
    }
  }
}
