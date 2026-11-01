
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

const MODEL_PATHS = [
  "/models/mazda3.glb",
  "/models/mercedes-w210.glb",
  "/models/jeep-compass.glb",
  "/models/mercedes-cls.glb"
];

const modelCache = new Map();

function loadModel(path) {
  if (!modelCache.has(path)) {
    const promise = new Promise((resolve, reject) => {
      loader.load(
        path,
        gltf => resolve(gltf.scene),
        undefined,
        error => reject(error)
      );
    });

    modelCache.set(path, promise);
  }

  return modelCache.get(path);
}

function createPlate(THREE, text, flag) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = "#111";
  ctx.lineWidth = 5;
  ctx.strokeRect(3, 3, 506, 122);

  if (flag === "AM") {
    ctx.fillStyle = "#d90012";
    ctx.fillRect(10, 10, 65, 34);
    ctx.fillStyle = "#0033a0";
    ctx.fillRect(10, 44, 65, 34);
    ctx.fillStyle = "#f2a800";
    ctx.fillRect(10, 78, 65, 34);
  } else {
    ctx.fillStyle = "#fff";
    ctx.fillRect(10, 10, 65, 34);
    ctx.fillStyle = "#0039a6";
    ctx.fillRect(10, 44, 65, 34);
    ctx.fillStyle = "#d52b1e";
    ctx.fillRect(10, 78, 65, 34);
  }

  ctx.fillStyle = "#111";
  ctx.font = "bold 53px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 295, 65, 410);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 0.29),
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    })
  );
}

function prepareModel(THREE, model, type) {
  const clone = model.clone(true);

  clone.traverse(object => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());

  const targetLengths = [4.42, 4.78, 4.45, 4.92];
  const targetLength = targetLengths[type] || 4.42;

  if (size.z > 0 && size.x > 0 && size.y > 0) {
    const scale = targetLength / Math.max(size.x, size.z);
    clone.scale.multiplyScalar(scale);
  }

  const normalizedBox = new THREE.Box3().setFromObject(clone);
  const center = normalizedBox.getCenter(new THREE.Vector3());

  clone.position.x -= center.x;
  clone.position.z -= center.z;
  clone.position.y -= normalizedBox.min.y;

  return clone;
}

export function createCar(THREE, type = 0) {
  const car = new THREE.Group();

  const configs = [
    { name: "MAZDA 3", plate: "44СС550", flag: "AM" },
    { name: "MERCEDES W210 E320", plate: "44WW550", flag: "AM" },
    { name: "JEEP COMPASS", plate: "37NY727", flag: "AM" },
    { name: "MERCEDES CLS", plate: "А777РА 77", flag: "RU" }
  ];

  const index = Math.max(0, Math.min(3, Number(type) || 0));
  const config = configs[index];

  car.userData.carName = config.name;
  car.userData.plate = config.plate;
  car.userData.carType = index;
  car.userData.loading = true;

  const placeholder = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1, 4),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );

  placeholder.position.y = 0.5;
  car.add(placeholder);

  loadModel(MODEL_PATHS[index])
    .then(source => {
      if (!car.parent && car.userData.removed) return;

      car.remove(placeholder);

      const model = prepareModel(THREE, source, index);
      car.add(model);

      // Номерные знаки
      const frontPlate = createPlate(THREE, config.plate, config.flag);
      frontPlate.position.set(0, 0.55, 2.15);
      car.add(frontPlate);

      const rearPlate = createPlate(THREE, config.plate, config.flag);
      rearPlate.position.set(0, 0.55, -2.15);
      rearPlate.rotation.y = Math.PI;
      car.add(rearPlate);

      car.userData.loading = false;
      car.userData.modelLoaded = true;
    })
    .catch(error => {
      console.error(
        "Не удалось загрузить модель:",
        MODEL_PATHS[index],
        error
      );

      car.userData.loading = false;
      car.userData.modelError = true;
    });

  return car;
}
