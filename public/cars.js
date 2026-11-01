
export function createCar(THREE, type = 0) {
  const car = new THREE.Group();

  const configs = [
    {
      name: "MAZDA 3",
      plate: "44СС550",
      flag: "AM",
      color: 0x080808,
      width: 1.82,
      length: 4.42,
      cabinWidth: 1.48,
      cabinLength: 2.15,
      cabinHeight: 0.76,
      cabinZ: -0.12,
      wheelbase: 2.68,
      wheelRadius: 0.36,
      suv: false,
      rear: "hatch"
    },
    {
      name: "MERCEDES W210 E320",
      plate: "44WW550",
      flag: "AM",
      color: 0x080808,
      width: 1.86,
      length: 4.78,
      cabinWidth: 1.52,
      cabinLength: 2.30,
      cabinHeight: 0.72,
      cabinZ: -0.05,
      wheelbase: 2.83,
      wheelRadius: 0.37,
      suv: false,
      rear: "sedan"
    },
    {
      name: "JEEP COMPASS",
      plate: "37NY727",
      flag: "AM",
      color: 0xf2f2f2,
      width: 1.91,
      length: 4.45,
      cabinWidth: 1.57,
      cabinLength: 2.35,
      cabinHeight: 1.02,
      cabinZ: -0.05,
      wheelbase: 2.72,
      wheelRadius: 0.39,
      suv: true,
      rear: "suv"
    },
    {
      name: "MERCEDES CLS",
      plate: "А777РА 77",
      flag: "RU",
      color: 0x080808,
      width: 1.88,
      length: 4.92,
      cabinWidth: 1.52,
      cabinLength: 2.25,
      cabinHeight: 0.69,
      cabinZ: -0.12,
      wheelbase: 2.88,
      wheelRadius: 0.37,
      suv: false,
      rear: "coupe"
    }
  ];

  const c = configs[type] || configs[0];

  const paint = new THREE.MeshStandardMaterial({
    color: c.color,
    metalness: 0.82,
    roughness: 0.2
  });

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x142b3c,
    metalness: 0.45,
    roughness: 0.12,
    transparent: true,
    opacity: 0.88
  });

  const black = new THREE.MeshStandardMaterial({
    color: 0x090b0e,
    metalness: 0.45,
    roughness: 0.3
  });

  const rubber = new THREE.MeshStandardMaterial({
    color: 0x080808,
    roughness: 0.92
  });

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xbfc7cf,
    metalness: 0.95,
    roughness: 0.16
  });

  const silver = new THREE.MeshStandardMaterial({
    color: 0x707780,
    metalness: 0.9,
    roughness: 0.22
  });

  const headlight = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 2.5
  });

  const redLight = new THREE.MeshStandardMaterial({
    color: 0xff1111,
    emissive: 0xff0000,
    emissiveIntensity: 2
  });

  const amber = new THREE.MeshStandardMaterial({
    color: 0xffa323,
    emissive: 0xff7b00,
    emissiveIntensity: 1.2
  });

  function add(geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    car.add(mesh);
    return mesh;
  }

  function box(w, h, d, material, x, y, z, bevel = 0) {
    let geometry = new THREE.BoxGeometry(w, h, d);

    if (bevel > 0) {
      geometry = new THREE.BoxGeometry(w, h, d, 2, 2, 2);
      geometry.computeVertexNormals();
    }

    return add(geometry, material, x, y, z);
  }

  // Плавный основной кузов
  function bodyShape() {
    const shape = new THREE.Shape();

    shape.moveTo(-c.width * 0.43, 0.36);
    shape.quadraticCurveTo(-c.width * 0.51, 0.37, -c.width * 0.5, 0.55);
    shape.lineTo(-c.width * 0.45, 0.87);
    shape.quadraticCurveTo(-c.width * 0.43, 0.96, -c.width * 0.34, 0.98);
    shape.lineTo(c.width * 0.34, 0.98);
    shape.quadraticCurveTo(c.width * 0.43, 0.96, c.width * 0.45, 0.87);
    shape.lineTo(c.width * 0.5, 0.55);
    shape.quadraticCurveTo(c.width * 0.51, 0.37, c.width * 0.43, 0.36);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: c.length,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.07,
      bevelThickness: 0.045,
      curveSegments: 12
    });

    geometry.translate(0, 0, -c.length / 2);
    geometry.computeVertexNormals();

    add(geometry, paint, 0, 0, 0);
  }

  bodyShape();

  // Капот
  box(
    c.width * 0.91,
    0.16,
    c.length * 0.27,
    paint,
    0,
    0.97,
    c.length * 0.34
  );

  // Крышка багажника
  box(
    c.width * 0.88,
    0.13,
    c.length * (c.rear === "hatch" ? 0.18 : 0.22),
    paint,
    0,
    0.94,
    -c.length * 0.39
  );

  // Крыша и кабина
  const cabinShape = new THREE.Shape();

  cabinShape.moveTo(-c.cabinWidth * 0.5, 0);
  cabinShape.quadraticCurveTo(-c.cabinWidth * 0.52, 0.04, -c.cabinWidth * 0.46, 0.14);
  cabinShape.lineTo(-c.cabinWidth * 0.34, c.cabinHeight);
  cabinShape.quadraticCurveTo(0, c.cabinHeight + 0.08, c.cabinWidth * 0.34, c.cabinHeight);
  cabinShape.lineTo(c.cabinWidth * 0.46, 0.14);
  cabinShape.quadraticCurveTo(c.cabinWidth * 0.52, 0.04, c.cabinWidth * 0.5, 0);
  cabinShape.closePath();

  const cabinGeometry = new THREE.ExtrudeGeometry(cabinShape, {
    depth: c.cabinLength,
    bevelEnabled: true,
    bevelSegments: 5,
    bevelSize: 0.055,
    bevelThickness: 0.045,
    curveSegments: 16
  });

  cabinGeometry.translate(0, 0, -c.cabinLength / 2);
  add(cabinGeometry, paint, 0, 0.98, c.cabinZ);

  // Панорамные стёкла
  box(
    c.cabinWidth * 0.84,
    c.cabinHeight * 0.65,
    0.045,
    glass,
    0,
    1.48 + c.cabinHeight * 0.12,
    c.cabinZ + c.cabinLength * 0.48
  );

  box(
    c.cabinWidth * 0.84,
    c.cabinHeight * 0.62,
    0.045,
    glass,
    0,
    1.47 + c.cabinHeight * 0.12,
    c.cabinZ - c.cabinLength * 0.48
  );

  // Боковые окна
  for (const side of [-1, 1]) {
    const x = side * (c.cabinWidth * 0.485);

    box(
      0.035,
      c.cabinHeight * 0.62,
      c.cabinLength * 0.75,
      glass,
      x,
      1.45 + c.cabinHeight * 0.12,
      c.cabinZ
    );

    // Стойки кузова
    for (const z of [-0.75, 0, 0.75]) {
      box(
        0.075,
        c.cabinHeight + 0.05,
        0.075,
        black,
        side * (c.cabinWidth * 0.49),
        1.34,
        c.cabinZ + z * c.cabinLength * 0.42
      );
    }
  }

  // Передняя решётка
  if (type === 1 || type === 3) {
    box(
      c.width * 0.43,
      0.29,
      0.065,
      black,
      0,
      0.73,
      c.length / 2 + 0.035
    );

    for (let i = -2; i <= 2; i++) {
      box(
        c.width * 0.38,
        0.018,
        0.025,
        chrome,
        0,
        0.65 + i * 0.045,
        c.length / 2 + 0.08
      );
    }

    if (type === 1) {
      // Четыре круглые фары W210
      for (const x of [-0.62, -0.39, 0.39, 0.62]) {
        const light = add(
          new THREE.SphereGeometry(0.105, 20, 16),
          headlight,
          x,
          0.88,
          c.length / 2 + 0.07
        );
        light.scale.set(1.3, 0.75, 0.35);
      }
    }
  } else {
    box(
      c.width * 0.49,
      0.22,
      0.07,
      black,
      0,
      0.72,
      c.length / 2 + 0.035
    );
  }

  // Передний бампер
  box(
    c.width * 0.96,
    0.2,
    0.16,
    black,
    0,
    0.43,
    c.length / 2 + 0.07
  );

  // Задний бампер
  box(
    c.width * 0.96,
    0.2,
    0.16,
    black,
    0,
    0.43,
    -c.length / 2 - 0.07
  );

  // Передние фары Mazda, Jeep и CLS
  if (type !== 1) {
    for (const x of [-1, 1]) {
      const light = add(
        new THREE.BoxGeometry(0.48, 0.13, 0.07),
        headlight,
        x * c.width * 0.34,
        0.91,
        c.length / 2 + 0.075
      );

      light.rotation.y = x * -0.08;
    }
  }

  // Задние фонари
  for (const x of [-1, 1]) {
    box(
      0.42,
      0.17,
      0.07,
      redLight,
      x * c.width * 0.34,
      0.84,
      -c.length / 2 - 0.055
    );
  }

  // Дополнительные детали Jeep
  if (type === 2) {
    for (let i = -3; i <= 3; i++) {
      box(
        0.045,
        0.34,
        0.045,
        chrome,
        i * 0.13,
        0.72,
        c.length / 2 + 0.08
      );
    }

    // Расширенные арки колёс
    for (const side of [-1, 1]) {
      for (const z of [-c.wheelbase / 2, c.wheelbase / 2]) {
        const arch = add(
          new THREE.TorusGeometry(0.48, 0.075, 10, 32, Math.PI),
          black,
          side * c.width * 0.5,
          0.46,
          z
        );
        arch.rotation.z = Math.PI;
      }
    }

    // Багажник на крыше
    for (const x of [-0.55, 0.55]) {
      box(0.055, 0.07, 1.7, black, x, 2.02, -0.05);
    }
  }

  // Колёса и диски
  const wheelZ = c.wheelbase / 2;
  const wheelX = c.width * 0.51;

  for (const x of [-wheelX, wheelX]) {
    for (const z of [-wheelZ, wheelZ]) {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(x, c.wheelRadius, z);
      car.add(wheelGroup);

      const tire = new THREE.Mesh(
        new THREE.CylinderGeometry(
          c.wheelRadius,
          c.wheelRadius,
          0.23,
          40
        ),
        rubber
      );

      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(
          c.wheelRadius * 0.68,
          c.wheelRadius * 0.68,
          0.245,
          32
        ),
        chrome
      );

      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      // Спицы дисков
      for (let i = 0; i < 10; i++) {
        const spoke = box(
          0.035,
          0.045,
          c.wheelRadius * 1.05,
          silver,
          0,
          0,
          0
        );

        spoke.position.set(x, c.wheelRadius, z);
        spoke.rotation.x = 0;
        spoke.rotation.y = i * Math.PI / 5;
        spoke.rotation.z = Math.PI / 2;

        car.remove(spoke);
        wheelGroup.add(spoke);
      }

      const center = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.075, 0.26, 24),
        chrome
      );

      center.rotation.z = Math.PI / 2;
      wheelGroup.add(center);

      wheelGroup.userData.spin = true;
      car.userData.wheels = car.userData.wheels || [];
      car.userData.wheels.push(wheelGroup);
    }
  }

  // Зеркала
  for (const side of [-1, 1]) {
    box(
      0.2,
      0.14,
      0.28,
      black,
      side * (c.width * 0.53),
      1.13,
      0.65
    );
  }

  // Ручки дверей
  for (const side of [-1, 1]) {
    for (const z of [-0.55, 0.35]) {
      box(
        0.035,
        0.045,
        0.22,
        chrome,
        side * (c.width * 0.505),
        0.95,
        z
      );
    }
  }

  // Выхлопные трубы
  for (const x of [-0.55, 0.55]) {
    const exhaust = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.15, 16),
      chrome
    );

    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(
      x,
      0.43,
      -c.length / 2 - 0.11
    );

    car.add(exhaust);
  }

  // Номерной знак с флагом
  function createPlate(z, front) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 506, 122);

    if (c.flag === "AM") {
      ctx.fillStyle = "#d90012";
      ctx.fillRect(10, 10, 65, 34);
      ctx.fillStyle = "#0033a0";
      ctx.fillRect(10, 44, 65, 34);
      ctx.fillStyle = "#f2a800";
      ctx.fillRect(10, 78, 65, 34);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(10, 10, 65, 34);
      ctx.fillStyle = "#0039a6";
      ctx.fillRect(10, 44, 65, 34);
      ctx.fillStyle = "#d52b1e";
      ctx.fillRect(10, 78, 65, 34);
    }

    ctx.fillStyle = "#111111";
    ctx.font = "bold 58px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(c.plate, 295, 65, 405);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(1.15, 0.29),
      new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      })
    );

    plate.position.set(0, 0.57, z);

    if (!front) {
      plate.rotation.y = Math.PI;
    }

    car.add(plate);
  }

  createPlate(c.length / 2 + 0.17, true);
  createPlate(-c.length / 2 - 0.17, false);

  // Название и характеристики
  car.userData.carName = c.name;
  car.userData.plate = c.plate;
  car.userData.carType = type;

  return car;
}
