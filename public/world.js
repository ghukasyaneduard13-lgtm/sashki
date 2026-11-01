
export function createWorld(THREE, scene) {
  // Освещение
  const ambient = new THREE.HemisphereLight(
    0xd9ecff,
    0x526070,
    2
  );
  scene.add(ambient);

  const sunlight = new THREE.DirectionalLight(0xffffff, 3);
  sunlight.position.set(-100, 150, 80);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  sunlight.shadow.camera.left = -180;
  sunlight.shadow.camera.right = 180;
  sunlight.shadow.camera.top = 180;
  sunlight.shadow.camera.bottom = -180;
  scene.add(sunlight);

  // Материалы
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x526b4d,
    roughness: 1
  });

  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x292e35,
    roughness: 0.95
  });

  const lineMat = new THREE.MeshStandardMaterial({
    color: 0xe6e6d5,
    roughness: 0.8
  });

  const buildingColors = [
    0x777f8b,
    0x9b9387,
    0x657888,
    0xb2a18d,
    0x777777,
    0x9cabb5
  ];

  // Земля
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 1200),
    grassMat
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
  ground.receiveShadow = true;
  scene.add(ground);

  // Дороги
  function road(width, length, x, z, rotation = 0) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, length),
      roadMat
    );

    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = rotation;
    mesh.position.set(x, 0, z);
    mesh.receiveShadow = true;
    scene.add(mesh);

    return mesh;
  }

  // Главная дорога через центр
  road(22, 1000, 0, 0);
  road(22, 1000, 0, 0, Math.PI / 2);

  // Разметка
  function marking(width, length, x, z, rotation = 0) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, length),
      lineMat
    );

    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = rotation;
    mesh.position.set(x, 0.025, z);
    scene.add(mesh);
  }

  for (let i = -480; i <= 480; i += 12) {
    marking(0.25, 5, 0, i);
    marking(5, 0.25, i, 0, Math.PI / 2);
  }

  // Тротуары
  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0x858585,
    roughness: 1
  });

  function sidewalk(width, length, x, z) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.18, length),
      sidewalkMat
    );

    mesh.position.set(x, 0.05, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  sidewalk(3, 1000, -13, 0);
  sidewalk(3, 1000, 13, 0);
  sidewalk(1000, 3, 0, -13);
  sidewalk(1000, 3, 0, 13);

  // Здания
  function building(x, z, width, depth, height, color) {
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.75,
      metalness: 0.12
    });

    const structure = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
    );

    structure.position.set(x, height / 2, z);
    structure.castShadow = true;
    structure.receiveShadow = true;
    scene.add(structure);

    // Окна
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x8bbbd0,
      emissive: 0x183044,
      emissiveIntensity: 0.35,
      metalness: 0.5,
      roughness: 0.25
    });

    const floors = Math.max(1, Math.floor(height / 4));

    for (let floor = 0; floor < floors; floor++) {
      for (let col = 0; col < Math.max(1, Math.floor(width / 3)); col++) {
        const windowMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 1.5, 0.06),
          windowMat
        );

        windowMesh.position.set(
          x - width / 2 + 2 + col * 3,
          2 + floor * 4,
          z + depth / 2 + 0.04
        );

        scene.add(windowMesh);
      }
    }
  }

  // Городские кварталы
  for (let x = -180; x <= 180; x += 35) {
    for (let z = -180; z <= 180; z += 35) {
      if (Math.abs(x) < 35 || Math.abs(z) < 35) continue;

      const width = 12 + Math.random() * 12;
      const depth = 12 + Math.random() * 12;
      const height = 12 + Math.random() * 55;

      const color = buildingColors[
        Math.floor(Math.random() * buildingColors.length)
      ];

      building(x, z, width, depth, height, color);
    }
  }

  // Деревья
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x59402b
  });

  const leavesMat = new THREE.MeshStandardMaterial({
    color: 0x285d38,
    roughness: 1
  });

  function tree(x, z) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 2.5, 8),
      trunkMat
    );

    trunk.position.set(x, 1.25, z);
    trunk.castShadow = true;
    scene.add(trunk);

    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 10, 8),
      leavesMat
    );

    leaves.position.set(x, 3.1, z);
    leaves.castShadow = true;
    scene.add(leaves);
  }

  for (let i = -200; i <= 200; i += 18) {
    if (Math.abs(i) < 30) continue;

    tree(-19, i);
    tree(19, i);
    tree(i, -19);
    tree(i, 19);
  }

  // Фонари
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x343b45,
    metalness: 0.7,
    roughness: 0.4
  });

  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xffe8a3,
    emissive: 0xffc766,
    emissiveIntensity: 2
  });

  function streetLamp(x, z) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 6, 8),
      poleMat
    );

    pole.position.set(x, 3, z);
    pole.castShadow = true;
    scene.add(pole);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.15, 0.35),
      lampMat
    );

    head.position.set(x, 6, z);
    scene.add(head);
  }

  for (let i = -180; i <= 180; i += 35) {
    streetLamp(-15, i);
    streetLamp(15, i);
    streetLamp(i, -15);
    streetLamp(i, 15);
  }
}
