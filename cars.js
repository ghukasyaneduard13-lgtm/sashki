
export function createCar(THREE, type = 0) {
  const car = new THREE.Group();

  const cars = [
    { name: "MAZDA 3", color: 0x080808, plate: "44СС550", flag: "AM", width: 1.85, length: 4.35, height: 1.25 },
    { name: "MERCEDES W210 E320", color: 0x080808, plate: "44WW550", flag: "AM", width: 1.9, length: 4.7, height: 1.4 },
    { name: "JEEP COMPASS", color: 0xf2f2f2, plate: "37NY727", flag: "AM", width: 2.0, length: 4.4, height: 1.8 },
    { name: "MERCEDES CLS", color: 0x080808, plate: "А777РА 77", flag: "RU", width: 1.95, length: 4.9, height: 1.25 }
  ];

  const config = cars[type] || cars[0];

  const paint = new THREE.MeshStandardMaterial({
    color: config.color,
    metalness: 0.8,
    roughness: 0.22
  });

  const dark = new THREE.MeshStandardMaterial({
    color: 0x101319,
    metalness: 0.5,
    roughness: 0.35
  });

  const glass = new THREE.MeshStandardMaterial({
    color: 0x142b3d,
    metalness: 0.7,
    roughness: 0.12
  });

  const rubber = new THREE.MeshStandardMaterial({
    color: 0x080808,
    roughness: 0.9
  });

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xb8c0c8,
    metalness: 0.95,
    roughness: 0.15
  });

  const headlight = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 2
  });

  const taillight = new THREE.MeshStandardMaterial({
    color: 0xff1111,
    emissive: 0xff0000,
    emissiveIntensity: 1.5
  });

  function box(w, h, d, material, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    car.add(mesh);
    return mesh;
  }

  // Основной кузов
  box(config.width, 0.48, config.length, paint, 0, 0.65, 0);

  // Капот
  box(config.width * 0.96, 0.22, config.length * 0.27,
    paint, 0, 0.94, config.length * 0.32);

  // Багажник
  box(config.width * 0.95, 0.2, config.length * 0.19,
    paint, 0, 0.91, -config.length * 0.38);

  // Крыша
  const roofLength = type === 2 ? 2.15 : type === 1 ? 2.0 : 1.85;

  box(
    config.width * 0.78,
    type === 2 ? 0.95 : 0.68,
    roofLength,
    paint,
    0,
    type === 2 ? 1.35 : 1.3,
    -0.12
  );

  // Лобовое и заднее стекло
  box(config.width * 0.76, 0.52, 0.08, glass, 0, 1.3, 0.95);
  box(config.width * 0.76, 0.48, 0.08, glass, 0, 1.3, -1.12);

  // Боковые окна
  box(0.045, 0.48, 1.35, glass, -config.width * 0.4, 1.32, -0.1);
  box(0.045, 0.48, 1.35, glass, config.width * 0.4, 1.32, -0.1);

  // Передняя решётка
  box(config.width * 0.52, 0.24, 0.07, dark, 0, 0.58, config.length / 2);

  // Хромированная окантовка
  box(config.width * 0.54, 0.035, 0.08, chrome, 0, 0.72, config.length / 2 + 0.01);

  // Фары
  box(0.42, 0.16, 0.08, headlight, -0.62, 0.86, config.length / 2 + 0.02);
  box(0.42, 0.16, 0.08, headlight, 0.62, 0.86, config.length / 2 + 0.02);

  // Задние фонари
  box(0.42, 0.17, 0.08, taillight, -0.65, 0.82, -config.length / 2 - 0.02);
  box(0.42, 0.17, 0.08, taillight, 0.65, 0.82, -config.length / 2 - 0.02);

  // Бамперы
  box(config.width * 0.95, 0.2, 0.18, dark, 0, 0.42, config.length / 2 + 0.05);
  box(config.width * 0.95, 0.2, 0.18, dark, 0, 0.42, -config.length / 2 - 0.05);

  // Колёса
  const wheelZ = config.length * 0.32;
  const wheelX = config.width * 0.52;

  for (const x of [-wheelX, wheelX]) {
    for (const z of [-wheelZ, wheelZ]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.38, 0.24, 32),
        rubber
      );

      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.38, z);
      wheel.castShadow = true;
      car.add(wheel);

      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.25, 24),
        chrome
      );

      rim.rotation.z = Math.PI / 2;
      rim.position.set(x * 1.01, 0.38, z);
      car.add(rim);
    }
  }

  // Зеркала
  box(0.2, 0.15, 0.3, dark, -config.width / 2 - 0.08, 1.0, 0.65);
  box(0.2, 0.15, 0.3, dark, config.width / 2 + 0.08, 1.0, 0.65);

  // Номер с флагом
  function createPlate(z, front) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 120);

    // Флаг
    if (config.flag === "AM") {
      ctx.fillStyle = "#d90012";
      ctx.fillRect(12, 12, 65, 34);
      ctx.fillStyle = "#0033a0";
      ctx.fillRect(12, 46, 65, 34);
      ctx.fillStyle = "#f2a800";
      ctx.fillRect(12, 80, 65, 34);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(12, 12, 65, 34);
      ctx.fillStyle = "#0039a6";
      ctx.fillRect(12, 46, 65, 34);
      ctx.fillStyle = "#d52b1e";
      ctx.fillRect(12, 80, 65, 34);
    }

    ctx.fillStyle = "#111111";
    ctx.font = "bold 64px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(config.plate, 294, 65);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(1.15, 0.29),
      new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      })
    );

    plate.position.set(0, 0.55, z);
    if (!front) plate.rotation.y = Math.PI;

    car.add(plate);
  }

  createPlate(config.length / 2 + 0.15, true);
  createPlate(-config.length / 2 - 0.15, false);

  // Название автомобиля
  car.userData.carName = config.name;
  car.userData.plate = config.plate;

  return car;
}
