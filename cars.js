
export function createCar(THREE, type = 0) {
  const car = new THREE.Group();

  const colors = [
    0x168cff,
    0xe32636,
    0xffffff
  ];

  const color = colors[type] || colors[0];

  const paint = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.75,
    roughness: 0.25
  });

  const dark = new THREE.MeshStandardMaterial({
    color: 0x11151c,
    metalness: 0.35,
    roughness: 0.55
  });

  const glass = new THREE.MeshStandardMaterial({
    color: 0x152b3d,
    metalness: 0.7,
    roughness: 0.15
  });

  const rubber = new THREE.MeshStandardMaterial({
    color: 0x090909,
    roughness: 0.9
  });

  const lights = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 2
  });

  const rearLights = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 1.5
  });

  function addBox(w, h, d, material, x, y, z) {
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
  addBox(2.1, 0.55, 4.5, paint, 0, 0.65, 0);

  // Капот
  addBox(1.95, 0.22, 1.25, paint, 0, 0.95, 1.35);

  // Крыша
  addBox(1.65, 0.7, 1.85, paint, 0, 1.35, -0.15);

  // Стекла
  addBox(1.55, 0.52, 0.08, glass, 0, 1.36, 0.8);
  addBox(1.55, 0.52, 0.08, glass, 0, 1.36, -1.1);

  // Передняя решётка
  addBox(1.15, 0.22, 0.08, dark, 0, 0.55, 2.27);

  // Фары
  addBox(0.42, 0.15, 0.08, lights, -0.68, 0.83, 2.29);
  addBox(0.42, 0.15, 0.08, lights, 0.68, 0.83, 2.29);

  // Задние фонари
  addBox(0.42, 0.15, 0.08, rearLights, -0.68, 0.82, -2.29);
  addBox(0.42, 0.15, 0.08, rearLights, 0.68, 0.82, -2.29);

  // Бамперы
  addBox(2.05, 0.22, 0.2, dark, 0, 0.42, 2.3);
  addBox(2.05, 0.22, 0.2, dark, 0, 0.42, -2.3);

  // Колёса
  const wheelPositions = [
    [-1.08, 0.38, 1.4],
    [1.08, 0.38, 1.4],
    [-1.08, 0.38, -1.4],
    [1.08, 0.38, -1.4]
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.22, 24),
      rubber
    );

    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    car.add(wheel);

    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.235, 16),
      new THREE.MeshStandardMaterial({
        color: 0x9ba6b5,
        metalness: 0.9,
        roughness: 0.2
      })
    );

    rim.rotation.z = Math.PI / 2;
    rim.position.set(x * 1.01, y, z);
    car.add(rim);
  });

  // Зеркала
  addBox(0.22, 0.15, 0.3, dark, -1.08, 1.05, 0.65);
  addBox(0.22, 0.15, 0.3, dark, 1.08, 1.05, 0.65);

  // Спойлер для третьей машины
  if (type === 2) {
    addBox(1.8, 0.12, 0.35, dark, 0, 1.2, -2.05);
    addBox(0.12, 0.35, 0.12, dark, -0.65, 1.0, -2.05);
    addBox(0.12, 0.35, 0.12, dark, 0.65, 1.0, -2.05);
  }

  return car;
}
