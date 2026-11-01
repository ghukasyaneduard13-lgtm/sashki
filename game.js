
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { createWorld } from "./world.js";
import { createCar } from "./cars.js";
import { Multiplayer } from "./multiplayer.js";

const container = document.getElementById("game");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91b8d4);
scene.fog = new THREE.Fog(0x91b8d4, 100, 550);

const camera = new THREE.PerspectiveCamera(
  65, innerWidth / innerHeight, 0.1, 1500
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

container.appendChild(renderer.domElement);

createWorld(THREE, scene);

let speed = 0;
let heading = 0;
let selectedCar = 0;

let playerCar = createCar(THREE, selectedCar);
scene.add(playerCar);

const remotePlayers = new Map();
const keys = {};

addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});

addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

function bindButton(id, key) {
  const button = document.getElementById(id);

  button.addEventListener("pointerdown", e => {
    e.preventDefault();
    keys[key] = true;
    button.setPointerCapture(e.pointerId);
  });

  function release() {
    keys[key] = false;
  }

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
}

bindButton("gas", "w");
bindButton("brake", "s");
bindButton("left", "a");
bindButton("right", "d");

// Смена своей машины
document.getElementById("car").addEventListener("change", e => {
  selectedCar = Number(e.target.value);

  const x = playerCar.position.x;
  const z = playerCar.position.z;

  scene.remove(playerCar);

  playerCar = createCar(THREE, selectedCar);
  playerCar.position.set(x, 0, z);
  playerCar.rotation.y = heading;

  scene.add(playerCar);
});

const multiplayer = new Multiplayer({
  onPlayers(players) {
    Object.values(players).forEach(addRemotePlayer);
  },

  onPlayerJoined(player) {
    addRemotePlayer(player);
  },

  onPlayerMoved(player) {
    updateRemotePlayer(player);
  },

  onPlayerLeft(id) {
    removeRemotePlayer(id);
  }
});

function addRemotePlayer(data) {
  if (data.id === multiplayer.id) return;
  if (remotePlayers.has(data.id)) return;

  const car = createCar(THREE, data.car || 0);

  car.position.set(data.x || 0, 0, data.z || 0);
  car.rotation.y = data.rotation || 0;

  scene.add(car);

  remotePlayers.set(data.id, {
    object: car,
    type: Number(data.car) || 0
  });
}

function updateRemotePlayer(data) {
  if (data.id === multiplayer.id) return;

  if (!remotePlayers.has(data.id)) {
    addRemotePlayer(data);
  }

  const player = remotePlayers.get(data.id);
  if (!player) return;

  const newType = Number(data.car) || 0;

  // Если игрок выбрал другую машину, меняем модель
  if (player.type !== newType) {
    const oldPosition = player.object.position.clone();
    const oldRotation = player.object.rotation.y;

    scene.remove(player.object);

    player.object = createCar(THREE, newType);
    player.object.position.copy(oldPosition);
    player.object.rotation.y = oldRotation;

    player.type = newType;

    scene.add(player.object);
  }

  player.object.userData.targetPosition = new THREE.Vector3(
    data.x || 0,
    0,
    data.z || 0
  );

  player.object.userData.targetRotation = data.rotation || 0;
}

function removeRemotePlayer(id) {
  const player = remotePlayers.get(id);
  if (!player) return;

  scene.remove(player.object);
  remotePlayers.delete(id);
}

const clock = new THREE.Clock();
let networkTimer = 0;

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.04);

  const forward = keys.w || keys.arrowup;
  const backward = keys.s || keys.arrowdown;
  const left = keys.a || keys.arrowleft;
  const right = keys.d || keys.arrowright;

  if (forward) {
    speed = Math.min(speed + 19 * dt, 42);
  } else if (backward) {
    speed = Math.max(speed - 28 * dt, -12);
  } else {
    speed *= Math.pow(0.985, dt * 60);
  }

  if (Math.abs(speed) < 0.05) speed = 0;

  const steering = Math.max(0.25, Math.abs(speed) / 15);

  if (left) {
    heading += 1.9 * steering * dt * Math.sign(speed || 1);
  }

  if (right) {
    heading -= 1.9 * steering * dt * Math.sign(speed || 1);
  }

  playerCar.rotation.y = heading;

  playerCar.position.x += Math.sin(heading) * speed * dt;
  playerCar.position.z += Math.cos(heading) * speed * dt;

  const targetCamera = new THREE.Vector3(
    playerCar.position.x - Math.sin(heading) * 10,
    5.5,
    playerCar.position.z - Math.cos(heading) * 10
  );

  camera.position.lerp(
    targetCamera,
    1 - Math.exp(-5 * dt)
  );

  camera.lookAt(
    playerCar.position.x,
    1.1,
    playerCar.position.z
  );

  remotePlayers.forEach(player => {
    const car = player.object;
    const target = car.userData.targetPosition;

    if (target) {
      car.position.lerp(target, 1 - Math.exp(-10 * dt));
    }

    if (car.userData.targetRotation !== undefined) {
      car.rotation.y = THREE.MathUtils.lerp(
        car.rotation.y,
        car.userData.targetRotation,
        1 - Math.exp(-8 * dt)
      );
    }
  });

  networkTimer += dt;

  if (networkTimer >= 0.05) {
    networkTimer = 0;

    multiplayer.sendMovement({
      x: playerCar.position.x,
      z: playerCar.position.z,
      rotation: heading,
      car: selectedCar
    });
  }

  document.getElementById("speed").innerHTML =
    `${Math.round(Math.abs(speed) * 3.6)} <small>KM/H</small>`;

  document.getElementById("online").textContent =
    `ONLINE: ${remotePlayers.size + 1}`;

  renderer.render(scene, camera);
}

multiplayer.connect();
animate();

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
});

document.getElementById("loading").style.opacity = "0";

setTimeout(() => {
  document.getElementById("loading").style.display = "none";
}, 600);
