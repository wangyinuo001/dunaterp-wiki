import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";

type HeaderProps = { light?: boolean };

type PanelGroup = {
  key: string;
  index: string;
  label: string;
  short: string;
  summary: string;
  accent: string;
  links: Array<{ label: string; href: string; note: string }>;
};

const chapters = [
  {
    t: 0.08,
    n: "01",
    kicker: "HALOPHILIC CHASSIS",
    title: "Life without a wall",
    body: "Dunaliella salina is a wall-less, motile green alga adapted to hypersaline water.",
    link: "/alternative-platform",
    c: "#c9ff55",
  },
  {
    t: 0.25,
    n: "02",
    kicker: "REAL CELL ARCHITECTURE",
    title: "Meet Dunaliella",
    body: "Two equal anterior flagella, a cup-shaped chloroplast, a central pyrenoid and a small eyespot shape the cell beside the road.",
    link: "/project-description",
    c: "#ff8b3d",
  },
  {
    t: 0.42,
    n: "03",
    kicker: "TRANSCRIPTOMICS",
    title: "Read the light response",
    body: "Light intensity and quality become two analysis axes for finding testable regulators around the LCYB control point.",
    link: "/results",
    c: "#7de2ff",
  },
  {
    t: 0.59,
    n: "04",
    kicker: "MATHEMATICAL MODEL",
    title: "Find where control moves",
    body: "Expression, branch kinetics and network capacity ask when more LCYB stops producing a useful gain.",
    link: "/model",
    c: "#f8cb54",
  },
  {
    t: 0.75,
    n: "05",
    kicker: "FOUR PRODUCT ROUTES",
    title: "One hub, four strains",
    body: "β-ionone, astaxanthin, crocetin and β-citraurin are designed as separate product strains sharing a β-carotene hub.",
    link: "/engineering",
    c: "#ff6d8b",
  },
  {
    t: 0.88,
    n: "06",
    kicker: "RESPONSIBLE ENGINEERING",
    title: "The world changes the design",
    body: "Safety, stakeholder feedback and reproducibility determine whether the platform should move beyond the lab.",
    link: "/human-practices",
    c: "#c4a8ff",
  },
] as const;

const panelGroups: PanelGroup[] = [
  {
    key: "wet-lab",
    index: "01",
    label: "Wet Lab",
    short: "WL",
    summary: "Build the chassis, test the constructs and preserve every experimental decision.",
    accent: "#c9ff55",
    links: [
      { label: "Project Description", href: "/project-description", note: "The biological idea and product routes" },
      { label: "Engineering", href: "/engineering", note: "Design · Build · Test · Learn" },
      { label: "Experiments", href: "/experiments", note: "Protocols, controls and records" },
      { label: "Results", href: "/results", note: "Evidence and its limits" },
      { label: "Safety", href: "/safety-and-security", note: "Containment and risk design" },
    ],
  },
  {
    key: "dry-lab",
    index: "02",
    label: "Dry Lab",
    short: "DL",
    summary: "Connect light, regulation and pathway allocation with reproducible computation.",
    accent: "#7de2ff",
    links: [
      { label: "Model", href: "/model", note: "ODE, branch allocation and FBA" },
      { label: "Transcriptomics", href: "/results", note: "Light response and candidate regulators" },
      { label: "Alternative Platform", href: "/alternative-platform", note: "Why Dunaliella is the chassis" },
      { label: "Contribution", href: "/contribution", note: "Reusable workflows and troubleshooting" },
    ],
  },
  {
    key: "human-practices",
    index: "03",
    label: "Human Practices",
    short: "HP",
    summary: "Let stakeholders, safety and sustainability change what the team builds.",
    accent: "#f8cb54",
    links: [
      { label: "Human Practices", href: "/human-practices", note: "People, feedback and design decisions" },
      { label: "Sustainability", href: "/sustainability", note: "Whole-system impact" },
      { label: "Education", href: "/education", note: "Dialogue and reusable learning" },
    ],
  },
  {
    key: "people",
    index: "04",
    label: "People",
    short: "PE",
    summary: "Meet the team and see exactly who contributed, supported and reviewed the work.",
    accent: "#ff8b72",
    links: [
      { label: "Team", href: "/team", note: "Students, PIs, instructors and advisors" },
      { label: "Attributions", href: "/attributions", note: "A transparent division of work" },
      { label: "Responsible AI", href: "/responsible-ai", note: "Models, boundaries and human review" },
      { label: "Complete Wiki Map", href: "/wiki-map", note: "Every standard route in one place" },
    ],
  },
];

function makeRoad(curve: THREE.CatmullRomCurve3, width: number) {
  const segments = 260;
  const positions: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const side = new THREE.Vector3().crossVectors(up, tangent).normalize().multiplyScalar(width / 2);
    positions.push(
      point.x + side.x,
      0.08,
      point.z + side.z,
      point.x - side.x,
      0.08,
      point.z - side.z,
    );
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function textSprite(text: string, accent = "#d5ff61", scale = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 192;
  const context = canvas.getContext("2d")!;
  context.shadowColor = "rgba(2, 20, 18, .8)";
  context.shadowBlur = 18;
  context.fillStyle = accent;
  context.font = "800 54px system-ui";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 384, 96);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }),
  );
  sprite.scale.set(8 * scale, 2 * scale, 1);
  return sprite;
}

function createTerminalScreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 660;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#caff61";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#082c27";
  context.lineWidth = 22;
  context.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#082c27";
  context.font = "900 58px system-ui";
  context.letterSpacing = "12px";
  context.fillText("END OF ROUTE", 600, 178);
  context.font = "800 116px Georgia";
  context.letterSpacing = "-4px";
  context.fillText("ENTER THE WIKI", 600, 342);
  context.font = "900 84px system-ui";
  context.letterSpacing = "18px";
  context.fillText("↓  ↓  ↓", 600, 514);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = testLine;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function createRoadSign(chapter: (typeof chapters)[number]) {
  const group = new THREE.Group();
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 480;
  const context = canvas.getContext("2d")!;

  context.fillStyle = "#082c27";
  context.roundRect(18, 18, 1164, 444, 54);
  context.fill();
  context.strokeStyle = chapter.c;
  context.lineWidth = 12;
  context.stroke();

  // Number as a small accent, then the title — the kicker line was the part
  // nobody can read while the vehicle is moving.
  context.textAlign = "center";
  context.fillStyle = chapter.c;
  context.font = "900 56px system-ui";
  context.letterSpacing = "6px";
  context.fillText(chapter.n, 600, 150);

  context.fillStyle = "#fff8df";
  context.letterSpacing = "-3px";
  // wrapCanvasText drops any word that will not fit inside maxLines, so the
  // size is stepped down until the whole title survives the wrap.
  let titleSize = 116;
  let titleLines = wrapCanvasText(context, chapter.title, 1020, 2);
  for (; titleSize >= 68; titleSize -= 4) {
    context.font = `800 ${titleSize}px Georgia`;
    titleLines = wrapCanvasText(context, chapter.title, 1020, 2);
    if (titleLines.join(" ") === chapter.title) break;
  }
  const lineHeight = titleSize + 2;
  titleLines.forEach((line, index) => {
    context.fillText(line, 600, 300 + index * lineHeight - (titleLines.length - 1) * 24);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(7.55, 3.08, 0.18),
    new THREE.MeshToonMaterial({ color: 0x082c27 }),
  );
  back.position.y = 3.72;
  back.castShadow = true;
  group.add(back);

  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(7.3, 2.82),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true }),
  );
  face.position.set(0, 3.72, 0.1);
  group.add(face);

  const postMaterial = new THREE.MeshToonMaterial({ color: 0xf4e8c7 });
  [-2.45, 2.45].forEach((x) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 4.55, 12), postMaterial);
    post.position.set(x, 2.08, -0.08);
    post.castShadow = true;
    group.add(post);
  });

  return group;
}

function tube(points: THREE.Vector3[], radius: number, material: THREE.Material) {
  return new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, radius, 8, false),
    material,
  );
}

function createDunaliella() {
  const cell = new THREE.Group();
  cell.name = "Dunaliella salina model";
  const membrane = new THREE.MeshPhysicalMaterial({
    color: 0xaef378,
    transparent: true,
    opacity: 0.34,
    roughness: 0.2,
    transmission: 0.35,
    side: THREE.DoubleSide,
  });
  const profile = [
    new THREE.Vector2(0.18, -2.5),
    new THREE.Vector2(1.35, -2.15),
    new THREE.Vector2(1.85, -0.7),
    new THREE.Vector2(1.72, 0.8),
    new THREE.Vector2(1.2, 1.9),
    new THREE.Vector2(0.48, 2.55),
    new THREE.Vector2(0.08, 2.65),
  ];
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), membrane);
  body.castShadow = true;
  cell.add(body);

  const chloroplast = new THREE.Mesh(
    new THREE.TorusGeometry(1.05, 0.56, 14, 48, Math.PI * 1.72),
    new THREE.MeshToonMaterial({ color: 0x5ca532, transparent: true, opacity: 0.8 }),
  );
  chloroplast.rotation.set(Math.PI / 2, 0, -0.15);
  chloroplast.scale.set(1, 1.35, 1);
  chloroplast.position.y = -0.4;
  cell.add(chloroplast);

  const pyrenoid = new THREE.Mesh(
    new THREE.SphereGeometry(0.47, 24, 16),
    new THREE.MeshToonMaterial({ color: 0xd9e9a9 }),
  );
  pyrenoid.position.set(0, -0.45, 0.15);
  cell.add(pyrenoid);

  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(0.58, 24, 16),
    new THREE.MeshToonMaterial({ color: 0xf3e9a7 }),
  );
  nucleus.scale.y = 1.25;
  nucleus.position.set(0, 0.85, -0.15);
  cell.add(nucleus);

  const eyespot = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 20, 12),
    new THREE.MeshToonMaterial({ color: 0xe44924 }),
  );
  eyespot.position.set(1.18, 1.05, 0.64);
  cell.add(eyespot);

  const dropletMaterial = new THREE.MeshToonMaterial({ color: 0xf78b24 });
  [
    [-1.15, -1.25, 0.45],
    [0.9, -1.5, 0.8],
    [-1.25, 0.1, -0.55],
    [1.28, -0.2, -0.25],
    [-0.82, -1.72, -0.72],
    [0.55, -1.78, -0.9],
    [1.05, 0.4, 0.55],
  ].forEach(([x, y, z], index) => {
    const droplet = new THREE.Mesh(
      new THREE.SphereGeometry(0.15 + (index % 3) * 0.035, 16, 10),
      dropletMaterial,
    );
    droplet.position.set(x, y, z);
    cell.add(droplet);
  });

  const flagellaMaterial = new THREE.MeshToonMaterial({ color: 0xbdf479 });
  const flagellumA = tube(
    [
      new THREE.Vector3(-0.2, 2.5, 0),
      new THREE.Vector3(-0.65, 3.5, 0.2),
      new THREE.Vector3(-1.7, 4.2, 0.7),
      new THREE.Vector3(-2.8, 5.5, 0.2),
      new THREE.Vector3(-2.1, 7, -0.4),
    ],
    0.055,
    flagellaMaterial,
  );
  const flagellumB = tube(
    [
      new THREE.Vector3(0.2, 2.5, 0),
      new THREE.Vector3(0.8, 3.45, -0.1),
      new THREE.Vector3(1.9, 4.1, -0.7),
      new THREE.Vector3(3, 5.35, -0.15),
      new THREE.Vector3(2.35, 6.9, 0.5),
    ],
    0.055,
    flagellaMaterial,
  );
  cell.add(flagellumA, flagellumB);
  cell.scale.setScalar(1.08);
  return cell;
}

function createVehicle() {
  const vehicle = new THREE.Group();
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.45, 2.15),
    new THREE.MeshToonMaterial({ color: 0xf1762e }),
  );
  chassis.position.y = 0.55;
  chassis.castShadow = true;
  vehicle.add(chassis);

  const cabin = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshToonMaterial({ color: 0x173f3a }),
  );
  cabin.scale.set(0.86, 0.75, 1);
  cabin.rotation.x = Math.PI;
  cabin.position.set(0, 0.82, -0.2);
  vehicle.add(cabin);

  const wheelMaterial = new THREE.MeshToonMaterial({ color: 0x122522 });
  [
    [-0.76, 0.3, 0.7],
    [0.76, 0.3, 0.7],
    [-0.76, 0.3, -0.72],
    [0.76, 0.3, -0.72],
  ].forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.25, 18), wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    vehicle.add(wheel);
  });

  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(0.32, 20),
    new THREE.MeshBasicMaterial({ color: 0xd9ff67 }),
  );
  glow.position.set(0, 0.58, 1.081);
  vehicle.add(glow);

  const rearBumper = new THREE.Mesh(
    new THREE.BoxGeometry(1.12, 0.16, 0.12),
    new THREE.MeshToonMaterial({ color: 0x173f3a }),
  );
  rearBumper.position.set(0, 0.42, -1.11);
  vehicle.add(rearBumper);
  [-0.43, 0.43].forEach((x) => {
    const tailLight = new THREE.Mesh(
      new THREE.CircleGeometry(0.1, 16),
      new THREE.MeshBasicMaterial({ color: 0xff5e45 }),
    );
    tailLight.position.set(x, 0.64, -1.086);
    tailLight.rotation.y = Math.PI;
    vehicle.add(tailLight);
  });
  return vehicle;
}

function createMiniDunaliella(seed: number) {
  const mini = new THREE.Group();
  const colors = [0x83ca4a, 0xa8d84f, 0xe6a33b, 0x70bd45];
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, 18, 12),
    new THREE.MeshToonMaterial({ color: colors[seed % colors.length] }),
  );
  body.scale.set(0.78, 1.08, 0.67);
  body.castShadow = true;
  mini.add(body);

  const chloroplast = new THREE.Mesh(
    new THREE.TorusGeometry(0.25, 0.1, 8, 18, Math.PI * 1.7),
    new THREE.MeshToonMaterial({ color: 0x4c8f35 }),
  );
  chloroplast.rotation.x = Math.PI / 2;
  chloroplast.position.set(0, -0.06, 0.37);
  mini.add(chloroplast);

  const eyespot = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xf26a21 }),
  );
  eyespot.position.set(0.25, 0.16, 0.34);
  mini.add(eyespot);

  const flagellaMaterial = new THREE.MeshBasicMaterial({ color: 0xcaff61 });
  mini.add(
    tube(
      [
        new THREE.Vector3(-0.1, 0.42, 0),
        new THREE.Vector3(-0.18, 0.77, 0.05),
        new THREE.Vector3(-0.42, 1.12, 0.08),
        new THREE.Vector3(-0.32, 1.48, -0.04),
      ],
      0.018,
      flagellaMaterial,
    ),
    tube(
      [
        new THREE.Vector3(0.1, 0.42, 0),
        new THREE.Vector3(0.22, 0.76, -0.04),
        new THREE.Vector3(0.46, 1.1, -0.08),
        new THREE.Vector3(0.35, 1.46, 0.04),
      ],
      0.018,
      flagellaMaterial,
    ),
  );

  mini.scale.setScalar(0.72 + (seed % 3) * 0.05);
  mini.rotation.y = seed * 1.37;
  return mini;
}

function createHelix() {
  const group = new THREE.Group();
  const blue = new THREE.MeshToonMaterial({ color: 0x66d7ef });
  const pink = new THREE.MeshToonMaterial({ color: 0xf36e9b });
  const rung = new THREE.LineBasicMaterial({ color: 0xf8d968 });
  const sideA: THREE.Vector3[] = [];
  const sideB: THREE.Vector3[] = [];

  for (let i = 0; i < 36; i += 1) {
    const y = i * 0.18;
    const angle = i * 0.52;
    sideA.push(new THREE.Vector3(Math.cos(angle) * 0.75, y, Math.sin(angle) * 0.75));
    sideB.push(new THREE.Vector3(Math.cos(angle + Math.PI) * 0.75, y, Math.sin(angle + Math.PI) * 0.75));
    if (i % 3 === 0) {
      group.add(
        new THREE.Line(new THREE.BufferGeometry().setFromPoints([sideA[i], sideB[i]]), rung),
      );
    }
  }

  group.add(tube(sideA, 0.1, blue), tube(sideB, 0.1, pink));
  group.position.y = 0.2;
  return group;
}

function createSaltworksOutpost() {
  const group = new THREE.Group();
  const saltMaterial = new THREE.MeshToonMaterial({ color: 0xfff8df });
  const darkMaterial = new THREE.MeshToonMaterial({ color: 0x17463e });
  const brineMaterial = new THREE.MeshToonMaterial({ color: 0xe7a3a8 });

  const platform = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.25, 4.8), saltMaterial);
  platform.position.y = 0.12;
  platform.receiveShadow = true;
  group.add(platform);

  [
    [-1.8, 0.8, -0.8, 1.5, 1.4, 1.7],
    [0.1, 1.15, -0.65, 1.8, 2.1, 1.9],
    [2.1, 0.65, -0.4, 1.25, 1.1, 1.4],
  ].forEach(([x, y, z, width, height, depth]) => {
    const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), saltMaterial);
    building.position.set(x, y, z);
    building.castShadow = true;
    group.add(building);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.7, 0.65, 4), darkMaterial);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(x, y + height / 2 + 0.3, z);
    group.add(roof);
  });

  [-1.7, 0, 1.7].forEach((x) => {
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.12, 28), brineMaterial);
    basin.position.set(x, 0.3, 1.45);
    group.add(basin);
  });
  return group;
}

function createPhotobioreactorStation() {
  const group = new THREE.Group();
  const frameMaterial = new THREE.MeshToonMaterial({ color: 0x0b3a34 });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xcaf9e9,
    transparent: true,
    opacity: 0.34,
    roughness: 0.1,
    transmission: 0.28,
  });
  const cultureMaterial = new THREE.MeshToonMaterial({ color: 0x82c94a, transparent: true, opacity: 0.78 });

  [-1.65, 0, 1.65].forEach((x, index) => {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 3.7, 24), glassMaterial);
    tank.position.set(x, 2.05, 0);
    tank.castShadow = true;
    group.add(tank);
    const culture = new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.57, 2.75, 24), cultureMaterial);
    culture.position.set(x, 1.6, 0);
    group.add(culture);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.77, 0.77, 0.18, 20), frameMaterial);
    cap.position.set(x, 4, 0);
    group.add(cap);
    const bubbleMaterial = new THREE.MeshBasicMaterial({ color: 0xf7f1df });
    for (let bubbleIndex = 0; bubbleIndex < 4; bubbleIndex += 1) {
      const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), bubbleMaterial);
      bubble.position.set(
        x + Math.sin(index * 4 + bubbleIndex) * 0.28,
        0.65 + bubbleIndex * 0.68,
        0.42,
      );
      group.add(bubble);
    }
  });

  const pipe = tube(
    [
      new THREE.Vector3(-1.65, 4.05, 0),
      new THREE.Vector3(-1.65, 4.55, 0),
      new THREE.Vector3(1.65, 4.55, 0),
      new THREE.Vector3(1.65, 4.05, 0),
    ],
    0.1,
    frameMaterial,
  );
  group.add(pipe);
  return group;
}

function createLightArray() {
  const group = new THREE.Group();
  const postMaterial = new THREE.MeshToonMaterial({ color: 0x173f3a });
  const lightColors = [0xff8b72, 0x7de2ff, 0xf8cb54, 0xc4a8ff];
  lightColors.forEach((color, index) => {
    const x = (index - 1.5) * 1.55;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 3.2, 10), postMaterial);
    post.position.set(x, 1.6, 0.4);
    group.add(post);
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(1.22, 1.75, 0.16),
      new THREE.MeshBasicMaterial({ color }),
    );
    panel.position.set(x, 3.15, 0);
    panel.rotation.x = -0.18;
    panel.rotation.z = (index - 1.5) * 0.05;
    group.add(panel);
  });
  return group;
}

function createWetLabBench() {
  const group = new THREE.Group();
  const benchMaterial = new THREE.MeshToonMaterial({ color: 0x17463e });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xcaf9e9,
    transparent: true,
    opacity: 0.4,
    roughness: 0.12,
  });
  const liquidColors = [0x83ca4a, 0xf8cb54, 0xff8b72];

  const top = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.3, 2.6), benchMaterial);
  top.position.y = 2.05;
  top.castShadow = true;
  group.add(top);
  [-2.35, 2.35].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2, 2.1), benchMaterial);
    leg.position.set(x, 1, 0);
    group.add(leg);
  });

  [-1.6, 0, 1.6].forEach((x, index) => {
    const flask = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.62, 1.35, 18),
      glassMaterial,
    );
    flask.position.set(x, 2.85, 0);
    group.add(flask);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.21, 0.75, 14), glassMaterial);
    neck.position.set(x, 3.78, 0);
    group.add(neck);
    const liquid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.53, 0.24, 16),
      new THREE.MeshToonMaterial({ color: liquidColors[index], transparent: true, opacity: 0.85 }),
    );
    liquid.position.set(x, 2.38, 0);
    group.add(liquid);
  });
  return group;
}

function createCarotenoidHub() {
  const group = new THREE.Group();
  const hubPosition = new THREE.Vector3(0, 2.8, 0);
  const hub = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.9, 1),
    new THREE.MeshToonMaterial({ color: 0xf39a2d }),
  );
  hub.position.copy(hubPosition);
  hub.castShadow = true;
  group.add(hub);

  const branchColors = [0xffbe38, 0xe85b48, 0xe6c83c, 0xee7790];
  branchColors.forEach((color, index) => {
    const angle = (index / branchColors.length) * Math.PI * 2;
    const end = new THREE.Vector3(Math.cos(angle) * 2.5, 1.2 + (index % 2) * 1.1, Math.sin(angle) * 2.5);
    group.add(tube([hubPosition, hubPosition.clone().lerp(end, 0.52), end], 0.09, new THREE.MeshToonMaterial({ color })));
    const node = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.58, 0),
      new THREE.MeshToonMaterial({ color }),
    );
    node.position.copy(end);
    node.castShadow = true;
    group.add(node);
  });
  return group;
}

function createProductDepot() {
  const group = new THREE.Group();
  const colors = [0xf7a52d, 0xe65c42, 0xe9c43a, 0xed7688];
  colors.forEach((color, index) => {
    const x = (index - 1.5) * 1.45;
    const tank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.68, 2.4 + (index % 2) * 0.55, 16),
      new THREE.MeshToonMaterial({ color }),
    );
    tank.position.set(x, 1.25 + (index % 2) * 0.28, 0);
    tank.castShadow = true;
    group.add(tank);
    const cap = new THREE.Mesh(
      new THREE.ConeGeometry(0.58, 0.55, 16),
      new THREE.MeshToonMaterial({ color: 0x173f3a }),
    );
    cap.position.set(x, 2.72 + (index % 2) * 0.55, 0);
    group.add(cap);
  });
  return group;
}

function createSustainabilityStation() {
  const group = new THREE.Group();
  const frameMaterial = new THREE.MeshToonMaterial({ color: 0x17463e });
  const solarMaterial = new THREE.MeshToonMaterial({ color: 0x386a78 });

  [-1.8, 0, 1.8].forEach((x) => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.12, 2.25), solarMaterial);
    panel.position.set(x, 1.55, 0);
    panel.rotation.x = -0.42;
    panel.castShadow = true;
    group.add(panel);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.45, 10), frameMaterial);
    post.position.set(x, 0.75, 0.3);
    group.add(post);
  });

  const waterLoop = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.16, 10, 36),
    new THREE.MeshToonMaterial({ color: 0x7de2ff }),
  );
  waterLoop.position.set(0, 2.35, -2.15);
  waterLoop.rotation.y = Math.PI / 2;
  group.add(waterLoop);
  return group;
}

function addProp(
  scene: THREE.Scene,
  curve: THREE.CatmullRomCurve3,
  t: number,
  offset: number,
  object: THREE.Object3D,
  scale = 1,
) {
  const point = curve.getPointAt(t);
  const tangent = curve.getTangentAt(t).normalize();
  const side = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(offset);
  object.position.copy(point).add(side);
  object.position.y = 0.12;
  object.scale.multiplyScalar(scale);
  scene.add(object);
}

function WikiTerminal({ panelProgress }: { panelProgress: number }) {
  const [activeKey, setActiveKey] = useState(panelGroups[0].key);
  const activeGroup = panelGroups.find((group) => group.key === activeKey) ?? panelGroups[0];
  const style = { "--panel-progress": panelProgress } as CSSProperties;

  return (
    <section className="wiki-terminal" style={style} aria-label="DunaTerp Wiki navigation panel">
      <nav className="terminal-tabs" aria-label="Wiki sections">
        {panelGroups.map((group) => (
          <button
            key={group.key}
            type="button"
            className={group.key === activeKey ? "is-active" : ""}
            onClick={() => setActiveKey(group.key)}
            aria-pressed={group.key === activeKey}
          >
            <span>{group.short}</span>
            {group.label}
          </button>
        ))}
      </nav>

      <div className="terminal-shell" style={{ "--panel-accent": activeGroup.accent } as CSSProperties}>
        <div className="terminal-preview" aria-hidden="true">
          <div className="terminal-code">DUNA / {activeGroup.index}</div>
          <div className="terminal-cell">
            <i />
            <i />
            <span />
          </div>
          <p>{activeGroup.index} — FIELD</p>
          <h2>{activeGroup.label}</h2>
          <p>{activeGroup.summary}</p>
        </div>

        <div className="terminal-content">
          <header>
            <div>
              <p>SCU–CHINA · iGEM 2026</p>
              <h3>{activeGroup.label}</h3>
            </div>
            <Link to="/wiki-map">All pages ↗</Link>
          </header>
          <nav className="terminal-links" aria-label={`${activeGroup.label} pages`}>
            {activeGroup.links.map((item, index) => (
              <Link key={`${activeGroup.key}-${item.label}`} to={item.href}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.label}</strong>
                <small>{item.note}</small>
                <b aria-hidden="true">↗</b>
              </Link>
            ))}
          </nav>
          <footer>
            <span>DOCUMENTED · REPRODUCIBLE · REUSABLE</span>
            <span>{activeGroup.index} / {String(panelGroups.length).padStart(2, "0")}</span>
          </footer>
        </div>
      </div>
    </section>
  );
}

export function DunaWorld({ Header }: { Header: ComponentType<HeaderProps> }) {
  const journey = useRef<HTMLElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState<"webgl" | "fallback">("webgl");

  useEffect(() => {
    if (!mount.current || !journey.current) return;
    const host = mount.current;
    const root = journey.current;
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      queueMicrotask(() => setQuality("fallback"));
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "duna-canvas";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8fd0d2);
    scene.fog = new THREE.Fog(0x8fd0d2, 35, 78);

    const camera = new THREE.PerspectiveCamera(
      48,
      host.clientWidth / Math.max(1, host.clientHeight),
      0.1,
      180,
    );
    camera.position.set(10, 9, 14);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xe7fbff, 0x304a35, 2.3));
    const sun = new THREE.DirectionalLight(0xfff1ca, 4);
    sun.position.set(-18, 25, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -28;
    sun.shadow.camera.right = 28;
    sun.shadow.camera.top = 28;
    sun.shadow.camera.bottom = -28;
    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(110, 110),
      new THREE.MeshToonMaterial({ color: 0xe9e1c7 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-18, 0, 18),
        new THREE.Vector3(-15, 0, 7),
        new THREE.Vector3(-5, 0, 12),
        new THREE.Vector3(5, 0, 5),
        new THREE.Vector3(15, 0, 10),
        new THREE.Vector3(20, 0, -2),
        new THREE.Vector3(10, 0, -11),
        new THREE.Vector3(-2, 0, -6),
        new THREE.Vector3(-14, 0, -14),
        new THREE.Vector3(-7, 0, -28),
        new THREE.Vector3(8, 0, -25),
        new THREE.Vector3(20, 0, -36),
      ],
      false,
      "catmullrom",
      0.45,
    );

    const road = new THREE.Mesh(
      makeRoad(curve, 3.7),
      new THREE.MeshToonMaterial({ color: 0x17463e }),
    );
    road.receiveShadow = true;
    scene.add(road);

    // Props are scattered on a grid, but the route sweeps from x=-18 to x=20,
    // so a grid cell can land on the tarmac. Measure against the route itself
    // rather than against a fixed corridor.
    const roadSamples = curve.getSpacedPoints(240);
    const distanceToRoad = (x: number, z: number) => {
      let nearest = Number.POSITIVE_INFINITY;
      for (const sample of roadSamples) {
        const dx = sample.x - x;
        const dz = sample.z - z;
        const squared = dx * dx + dz * dz;
        if (squared < nearest) nearest = squared;
      }
      return Math.sqrt(nearest);
    };
    const ROAD_CLEARANCE = 3.6;

    const dashMaterial = new THREE.MeshToonMaterial({ color: 0xf5da61 });
    for (let i = 2; i < 130; i += 4) {
      const t = i / 132;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.75), dashMaterial);
      dash.position.copy(point);
      dash.position.y = 0.13;
      dash.rotation.y = Math.atan2(tangent.x, tangent.z);
      scene.add(dash);
    }

    const poolMaterial = new THREE.MeshToonMaterial({ color: 0xe7a3a8, transparent: true, opacity: 0.82 });
    [
      [-24, 9, 7, 4],
      [-2, 22, 8, 3],
      [25, 19, 9, 4],
      [28, -17, 7, 3],
      [-25, -31, 10, 5],
      [4, -41, 8, 3],
    ].forEach(([x, z, sx, sz]) => {
      const pool = new THREE.Mesh(new THREE.CircleGeometry(1, 40), poolMaterial);
      pool.rotation.x = -Math.PI / 2;
      pool.scale.set(sx, sz, 1);
      pool.position.set(x, 0.025, z);
      scene.add(pool);
    });

    const saltMaterial = new THREE.MeshToonMaterial({ color: 0xfff8df });
    for (let i = 0; i < 44; i += 1) {
      const radius = 0.45 + (i % 5) * 0.17;
      const x = ((i * 37) % 93) - 46;
      const z = ((i * 61) % 97) - 48;
      if (distanceToRoad(x, z) < ROAD_CLEARANCE + radius) continue;
      const crystal = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 0), saltMaterial);
      crystal.scale.y = 0.22;
      crystal.position.set(x, 0.1, z);
      crystal.rotation.y = i * 0.71;
      crystal.castShadow = true;
      scene.add(crystal);
    }

    const vehicle = createVehicle();
    scene.add(vehicle);

    const landingPoint = curve.getPointAt(0.001);
    const landingRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xcaff61,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const landingRing = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.82, 36),
      landingRingMaterial,
    );
    landingRing.rotation.x = -Math.PI / 2;
    landingRing.position.copy(landingPoint);
    landingRing.position.y = 0.16;
    landingRing.visible = false;
    scene.add(landingRing);

    const miniAlgae: Array<{
      object: THREE.Group;
      t: number;
      home: THREE.Vector3;
      velocity: THREE.Vector3;
      angular: THREE.Vector3;
      hit: boolean;
    }> = [];
    const algaeClusterPoints = [0.13, 0.34, 0.51, 0.68, 0.83];
    let miniIndex = 0;
    algaeClusterPoints.forEach((clusterT, clusterIndex) => {
      for (let itemIndex = 0; itemIndex < 4; itemIndex += 1) {
        const t = clusterT + (itemIndex - 1.5) * 0.004;
        const point = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const side = new THREE.Vector3(-tangent.z, 0, tangent.x);
        // Kept clear of the 1.85-wide half-road: these line the shoulders
        // instead of standing in the driving line.
        const shoulderSide = itemIndex % 2 === 0 ? -1 : 1;
        const offset = shoulderSide * (2.95 + Math.floor(itemIndex / 2) * 0.6)
          + Math.sin((miniIndex + 1) * 3.17) * 0.16;
        const object = createMiniDunaliella(miniIndex);
        object.position.copy(point).addScaledVector(side, offset);
        object.position.y = 0.52;
        object.rotation.y = Math.atan2(tangent.x, tangent.z) + clusterIndex * 0.45;
        scene.add(object);
        miniAlgae.push({
          object,
          t,
          home: object.position.clone(),
          velocity: new THREE.Vector3(),
          angular: new THREE.Vector3(),
          hit: false,
        });
        miniIndex += 1;
      }
    });

    const impactBursts: Array<{
      mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
      life: number;
    }> = [];
    const impactParticles: Array<{
      mesh: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshBasicMaterial>;
      velocity: THREE.Vector3;
      life: number;
    }> = [];
    let collisionFeedback = 0;
    let collisionSide = 0;

    const roadSigns: Array<{ t: number; object: THREE.Group }> = [];
    chapters.forEach((chapter, index) => {
      const sign = createRoadSign(chapter);
      const side = index % 2 === 0 ? -1 : 1;
      addProp(scene, curve, chapter.t, side * 6.8, sign, 0.82);
      // Orientation is re-aimed at the camera every frame; see the animate loop.
      roadSigns.push({ t: chapter.t, object: sign });
    });

    const scenicFeatures = [
      { t: 0.055, offset: 13.2, object: createSaltworksOutpost(), scale: 0.68, turn: 0.12 },
      { t: 0.16, offset: 13, object: createPhotobioreactorStation(), scale: 0.72, turn: -0.1 },
      { t: 0.345, offset: -12.8, object: createLightArray(), scale: 0.74, turn: 0.12 },
      { t: 0.49, offset: 12.9, object: createWetLabBench(), scale: 0.71, turn: -0.1 },
      { t: 0.665, offset: -13.1, object: createCarotenoidHub(), scale: 0.74, turn: 0.12 },
      { t: 0.815, offset: -13, object: createProductDepot(), scale: 0.76, turn: -0.1 },
      { t: 0.935, offset: 13.3, object: createSustainabilityStation(), scale: 0.74, turn: 0.12 },
    ];
    scenicFeatures.forEach((feature) => {
      addProp(scene, curve, feature.t, feature.offset, feature.object, feature.scale);
      const featureTangent = curve.getTangentAt(feature.t).normalize();
      feature.object.rotation.y = Math.atan2(featureTangent.x, featureTangent.z)
        + Math.PI
        + feature.turn;
    });

    const cell = createDunaliella();
    addProp(scene, curve, 0.25, -8.4, cell, 0.95);
    cell.position.y = 2.7;

    const helix = createHelix();
    addProp(scene, curve, 0.42, 6, helix, 0.78);

    const network = new THREE.Group();
    const nodeMaterial = new THREE.MeshToonMaterial({ color: 0xf5cd54 });
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x274d45 });
    const nodePositions = [
      new THREE.Vector3(0, 4, 0),
      new THREE.Vector3(-2, 2, 1),
      new THREE.Vector3(2, 2, -1),
      new THREE.Vector3(-2.7, 0, -1.5),
      new THREE.Vector3(0, 0, 1.8),
      new THREE.Vector3(2.8, 0, 0.2),
    ];
    nodePositions.forEach((position, index) => {
      const node = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.5 + (index === 0 ? 0.2 : 0), 1),
        nodeMaterial,
      );
      node.position.copy(position);
      network.add(node);
      if (index) {
        network.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              nodePositions[Math.max(0, Math.floor((index - 1) / 2))],
              position,
            ]),
            edgeMaterial,
          ),
        );
      }
    });
    addProp(scene, curve, 0.59, -6.5, network, 0.9);

    const products = new THREE.Group();
    [
      [0xf7a52d, "β-I"],
      [0xe65c42, "AST"],
      [0xe9c43a, "CRO"],
      [0xed7688, "β-CIT"],
    ].forEach(([color, label], index) => {
      const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.8, 2.2 + index * 0.5, 8),
        new THREE.MeshToonMaterial({ color: color as number }),
      );
      tower.position.set((index - 1.5) * 1.7, 1.1 + index * 0.25, 0);
      tower.castShadow = true;
      products.add(tower);
      const sprite = textSprite(label as string, "#fff1c8", 0.28);
      sprite.position.set((index - 1.5) * 1.7, 3 + index * 0.5, 0);
      products.add(sprite);
    });
    addProp(scene, curve, 0.75, 6.7, products, 0.85);

    const compass = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2, 0.18, 10, 36),
      new THREE.MeshToonMaterial({ color: 0xb9a4f2 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 2.2;
    compass.add(ring);
    for (let i = 0; i < 4; i += 1) {
      const person = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.32, 0.7, 5, 10),
        new THREE.MeshToonMaterial({ color: [0xf07849, 0x72cbd4, 0xf2cb5b, 0xc5a4ef][i] }),
      );
      person.position.set(Math.cos((i * Math.PI) / 2) * 2, 1.1, Math.sin((i * Math.PI) / 2) * 2);
      compass.add(person);
    }
    addProp(scene, curve, 0.88, -6, compass, 0.8);

    const terminal = new THREE.Group();
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(9.2, 5.8, 0.72),
      new THREE.MeshToonMaterial({ color: 0x0a2925 }),
    );
    frame.position.y = 3.35;
    frame.castShadow = true;
    terminal.add(frame);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(8.05, 4.65),
      new THREE.MeshBasicMaterial({ map: createTerminalScreenTexture() }),
    );
    screen.position.set(0, 3.35, 0.38);
    terminal.add(screen);
    const gateMaterial = new THREE.MeshToonMaterial({ color: 0xf26a21 });
    const beaconMaterial = new THREE.MeshBasicMaterial({ color: 0xcaff61 });
    [-5.1, 5.1].forEach((x) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 7.6, 12), gateMaterial);
      pillar.position.set(x, 3.65, -0.18);
      pillar.castShadow = true;
      terminal.add(pillar);
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 12), beaconMaterial);
      beacon.position.set(x, 7.55, -0.18);
      terminal.add(beacon);
    });
    const gateTop = new THREE.Mesh(new THREE.BoxGeometry(10.7, 0.42, 0.45), gateMaterial);
    gateTop.position.set(0, 7.2, -0.18);
    gateTop.castShadow = true;
    terminal.add(gateTop);
    const terminalTangent = curve.getTangentAt(0.985).normalize();
    terminal.rotation.y = Math.atan2(terminalTangent.x, terminalTangent.z) + Math.PI;
    addProp(scene, curve, 0.985, 0, terminal, 1);

    // Route fraction covered per second while catching up to the scroll target.
    const FOLLOW_SPEED = 0.5;
    let targetProgress = 0.001;
    let currentProgress = 0.001;
    let previousProgress = currentProgress;
    let disposed = false;
    let frameCount = 0;
    const cameraTarget = new THREE.Vector3();
    const cameraPosition = new THREE.Vector3();
    const travelTarget = new THREE.Vector3();
    const travelCamera = new THREE.Vector3();
    const cameraImpactOffset = new THREE.Vector3();
    const signWorldPosition = new THREE.Vector3();
    const vehicleGroundPosition = new THREE.Vector3();
    const terminalTarget = terminal.position.clone().add(new THREE.Vector3(0, 3.35, 0));
    const terminalCamera = terminal.position
      .clone()
      .addScaledVector(terminalTangent, -12)
      .add(new THREE.Vector3(0, 5.4, 0));
    const clock = new THREE.Clock();

    const startPoint = curve.getPointAt(0.001);
    const startTangent = curve.getTangentAt(0.001).normalize();
    camera.position
      .copy(startPoint)
      .addScaledVector(startTangent, -8.8)
      .add(new THREE.Vector3(0, 5.8, 0));
    camera.lookAt(
      startPoint
        .clone()
        .addScaledVector(startTangent, 4.2)
        .add(new THREE.Vector3(0, 0.8, 0)),
    );

    const updateScrollProgress = () => {
      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, root.offsetHeight - window.innerHeight);
      targetProgress = THREE.MathUtils.clamp((window.scrollY - rootTop) / travel, 0.001, 0.995);
    };

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      updateScrollProgress();
    };

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", resize);
    resize();

    const animate = () => {
      if (disposed) return;
      requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.04);
      // Constant rate rather than exponential damping: damp() covers most of
      // the gap immediately and then crawls, which reads as uneven speed.
      const remaining = targetProgress - currentProgress;
      currentProgress += THREE.MathUtils.clamp(
        remaining,
        -FOLLOW_SPEED * delta,
        FOLLOW_SPEED * delta,
      );
      const progressVelocity = (currentProgress - previousProgress) / Math.max(delta, 0.001);
      previousProgress = currentProgress;

      const point = curve.getPointAt(currentProgress);
      const tangent = curve.getTangentAt(currentProgress).normalize();
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x);
      const routeSway = Math.sin(currentProgress * Math.PI * 7) * 0.12;
      vehicleGroundPosition.copy(point).addScaledVector(side, routeSway);
      vehicle.position.copy(vehicleGroundPosition);

      const introTime = clock.elapsedTime;
      let dropHeight = 0;
      if (introTime < 0.78) {
        const dropProgress = introTime / 0.78;
        dropHeight = 11 * (1 - dropProgress * dropProgress);
      } else if (introTime < 2.1) {
        const bounceTime = introTime - 0.78;
        dropHeight = Math.abs(Math.sin(bounceTime * 7.6)) * 2.35 * Math.exp(-bounceTime * 2.45);
      }
      vehicle.position.y = 0.12 + dropHeight;
      vehicle.rotation.y = Math.atan2(tangent.x, tangent.z);
      vehicle.rotation.x = -0.22 * Math.exp(-introTime * 1.7) * Math.cos(introTime * 5.5);
      vehicle.rotation.z = Math.sin(currentProgress * Math.PI * 14) * -0.035
        + 0.18 * Math.exp(-introTime * 1.8) * Math.sin(introTime * 6.4);

      const landingLife = (introTime - 0.7) / 1.05;
      landingRing.visible = landingLife >= 0 && landingLife <= 1;
      if (landingRing.visible) {
        const landingScale = 1 + landingLife * 5.2;
        landingRing.scale.setScalar(landingScale);
        landingRingMaterial.opacity = (1 - landingLife) * 0.82;
      }

      let closestSignIndex = 0;
      let closestSignDistance = Number.POSITIVE_INFINITY;
      roadSigns.forEach((sign, index) => {
        const distance = Math.abs(currentProgress - sign.t);
        if (distance < closestSignDistance) {
          closestSignDistance = distance;
          closestSignIndex = index;
        }
      });
      roadSigns.forEach((sign, index) => {
        sign.object.visible = currentProgress < 0.925 && index === closestSignIndex && closestSignDistance < 0.13;
        if (!sign.object.visible) return;
        // Turn on the vertical axis only, so the sign faces the camera without
        // tipping as the camera rises and falls.
        sign.object.getWorldPosition(signWorldPosition);
        sign.object.rotation.y = Math.atan2(
          camera.position.x - signWorldPosition.x,
          camera.position.z - signWorldPosition.z,
        );
      });

      miniAlgae.forEach((actor, actorIndex) => {
        if (currentProgress < 0.025 && actor.hit) {
          actor.hit = false;
          actor.object.position.copy(actor.home);
          actor.velocity.set(0, 0, 0);
          actor.angular.set(0, 0, 0);
        }

        if (!actor.hit) {
          actor.object.position.y = actor.home.y + Math.sin(introTime * 2.4 + actorIndex * 0.83) * 0.055;
          actor.object.rotation.y += delta * (0.35 + (actorIndex % 3) * 0.12);

          const separation = actor.object.position.clone().sub(vehicleGroundPosition);
          separation.y = 0;
          const collisionDistance = separation.length();
          if (Math.abs(currentProgress - actor.t) < 0.022 && collisionDistance < 1.55) {
            actor.hit = true;
            const hitSide = Math.sign(separation.dot(side)) || (actorIndex % 2 === 0 ? -1 : 1);
            const pushDirection = separation.lengthSq() > 0.01
              ? separation.normalize()
              : side.clone().multiplyScalar(actorIndex % 2 === 0 ? -1 : 1);
            const vehicleSpeed = THREE.MathUtils.clamp(Math.abs(progressVelocity) * 7, 0.45, 5.5);
            const distanceMultiplier = THREE.MathUtils.clamp(
              (2 - collisionDistance) / 1.5,
              0,
              1,
            );
            const vehicleVelocityPush = tangent
              .clone()
              .multiplyScalar(Math.sign(progressVelocity || 1) * vehicleSpeed * 100);
            const sidewaysPush = pushDirection.clone().multiplyScalar(20);

            // Folio 2025 Leaves.js force structure, retuned for CPU-driven algae:
            // (vehicle velocity push + radial push) × speed × distance falloff.
            actor.velocity
              .copy(vehicleVelocityPush)
              .add(sidewaysPush)
              .multiplyScalar(vehicleSpeed * distanceMultiplier * 0.008)
              .clampLength(2.4, 7.5);
            const planarSpeed = Math.hypot(actor.velocity.x, actor.velocity.z);
            actor.velocity.y = Math.min(2, planarSpeed) * 1.05 + (actorIndex % 3) * 0.18;
            actor.angular.set(
              2.8 + planarSpeed * 0.42 + (actorIndex % 3),
              (actorIndex % 2 === 0 ? -1 : 1) * (3.8 + planarSpeed * 0.55),
              2.4 + planarSpeed * 0.36 + (actorIndex % 4) * 0.45,
            );

            collisionFeedback = Math.min(
              1.35,
              Math.max(collisionFeedback, 0.95) + 0.12,
            );
            collisionSide = THREE.MathUtils.clamp(
              collisionSide * 0.35 + hitSide * 0.85,
              -1,
              1,
            );

            const burstMaterial = new THREE.MeshBasicMaterial({
              color: actorIndex % 2 === 0 ? 0xcaff61 : 0xff9b42,
              transparent: true,
              opacity: 0.9,
              side: THREE.DoubleSide,
              depthWrite: false,
            });
            const burst = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.34, 24), burstMaterial);
            burst.position.copy(actor.object.position);
            burst.position.y = 0.82;
            burst.renderOrder = 4;
            scene.add(burst);
            impactBursts.push({ mesh: burst, life: 0 });

            for (let particleIndex = 0; particleIndex < 7; particleIndex += 1) {
              const angle = (particleIndex / 7) * Math.PI * 2 + actorIndex * 0.41;
              const particle = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.09 + (particleIndex % 3) * 0.025, 0),
                new THREE.MeshBasicMaterial({
                  color: particleIndex % 2 === 0 ? 0xcaff61 : 0xff9b42,
                  transparent: true,
                  opacity: 1,
                  depthWrite: false,
                }),
              );
              particle.position.copy(actor.object.position);
              particle.position.y = 0.72;
              particle.renderOrder = 3;
              scene.add(particle);
              impactParticles.push({
                mesh: particle,
                velocity: pushDirection
                  .clone()
                  .multiplyScalar(1.7 + (particleIndex % 3) * 0.35)
                  .addScaledVector(side, Math.cos(angle) * 1.8)
                  .addScaledVector(tangent, Math.sin(angle) * 1.15)
                  .add(new THREE.Vector3(0, 2.2 + (particleIndex % 4) * 0.42, 0)),
                life: 0,
              });
            }
          }
        } else {
          actor.velocity.y -= 7.8 * delta;
          const planarDamping = Math.exp(-1.5 * delta);
          actor.velocity.x *= planarDamping;
          actor.velocity.z *= planarDamping;
          actor.object.position.addScaledVector(actor.velocity, delta);
          actor.object.rotation.x += actor.angular.x * delta;
          actor.object.rotation.y += actor.angular.y * delta;
          actor.object.rotation.z += actor.angular.z * delta;
          actor.angular.multiplyScalar(Math.exp(-0.72 * delta));

          if (actor.object.position.y < 0.48) {
            actor.object.position.y = 0.48;
            if (actor.velocity.y < -0.45) actor.velocity.y *= -0.43;
            else actor.velocity.y = 0;
            actor.velocity.x *= 0.74;
            actor.velocity.z *= 0.74;
          }
        }
      });

      const impactPulse = Math.min(1.2, collisionFeedback);
      if (impactPulse > 0.002) {
        vehicle.position
          .addScaledVector(tangent, -impactPulse * 0.32)
          .addScaledVector(side, -collisionSide * impactPulse * 0.14);
        vehicle.position.y += Math.abs(Math.sin(introTime * 48)) * impactPulse * 0.13;
        vehicle.rotation.x += impactPulse * 0.085;
        vehicle.rotation.z += collisionSide * impactPulse * 0.17;
      }

      for (let burstIndex = impactBursts.length - 1; burstIndex >= 0; burstIndex -= 1) {
        const burst = impactBursts[burstIndex];
        burst.life += delta;
        const burstProgress = burst.life / 0.62;
        burst.mesh.quaternion.copy(camera.quaternion);
        burst.mesh.scale.setScalar(1 + burstProgress * 5.5);
        burst.mesh.material.opacity = Math.max(0, 1 - burstProgress) * 0.9;
        if (burstProgress >= 1) {
          scene.remove(burst.mesh);
          burst.mesh.geometry.dispose();
          burst.mesh.material.dispose();
          impactBursts.splice(burstIndex, 1);
        }
      }

      for (let particleIndex = impactParticles.length - 1; particleIndex >= 0; particleIndex -= 1) {
        const particle = impactParticles[particleIndex];
        particle.life += delta;
        const particleProgress = particle.life / 0.7;
        particle.velocity.y -= 7.8 * delta;
        particle.mesh.position.addScaledVector(particle.velocity, delta);
        particle.mesh.rotation.x += delta * 9;
        particle.mesh.rotation.y += delta * 12;
        particle.mesh.scale.setScalar(Math.max(0.01, 1 - particleProgress * 0.72));
        particle.mesh.material.opacity = Math.max(0, 1 - particleProgress);
        if (particleProgress >= 1) {
          scene.remove(particle.mesh);
          particle.mesh.geometry.dispose();
          particle.mesh.material.dispose();
          impactParticles.splice(particleIndex, 1);
        }
      }

      const arriving = THREE.MathUtils.smoothstep(currentProgress, 0.9, 0.995);
      const shotPhase = currentProgress * Math.PI * 4;
      const sideOffset = Math.sin(shotPhase * 0.82) * 0.72;
      const cameraHeight = 5.5 + Math.cos(shotPhase * 0.72) * 0.45;
      const cameraTrail = 8.8 + Math.sin(shotPhase * 0.55) * 0.45;
      const cellReveal = THREE.MathUtils.smoothstep(currentProgress, 0.17, 0.23)
        * (1 - THREE.MathUtils.smoothstep(currentProgress, 0.3, 0.36));
      travelTarget
        .copy(vehicleGroundPosition)
        .addScaledVector(tangent, 4.2)
        .add(new THREE.Vector3(0, 0.75 + dropHeight * 0.28, 0));
      travelTarget.lerp(cell.position, cellReveal * 0.3);
      travelCamera
        .copy(vehicleGroundPosition)
        .addScaledVector(tangent, -cameraTrail)
        .addScaledVector(side, sideOffset)
        .add(new THREE.Vector3(0, cameraHeight, 0));
      cameraTarget.lerpVectors(travelTarget, terminalTarget, arriving);
      cameraPosition.lerpVectors(travelCamera, terminalCamera, arriving);
      camera.position.lerp(cameraPosition, 0.055);
      cameraImpactOffset.set(
        Math.sin(introTime * 91) * impactPulse * impactPulse * 0.2,
        Math.cos(introTime * 73) * impactPulse * impactPulse * 0.13,
        Math.sin(introTime * 61) * impactPulse * impactPulse * 0.11,
      );
      camera.position
        .addScaledVector(side, cameraImpactOffset.x)
        .addScaledVector(tangent, cameraImpactOffset.z);
      camera.position.y += cameraImpactOffset.y;
      camera.fov = THREE.MathUtils.lerp(48, 40, arriving) + impactPulse * 3.2;
      camera.updateProjectionMatrix();
      camera.lookAt(cameraTarget);

      cell.rotation.y += delta * 0.28;
      helix.rotation.y += delta * 0.42;
      network.rotation.y -= delta * 0.18;
      products.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.12;
      collisionFeedback *= Math.exp(-8.2 * delta);
      collisionSide *= Math.exp(-6.4 * delta);

      frameCount += 1;
      if (frameCount % 4 === 0) setProgress(currentProgress);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  if (quality === "fallback") {
    return (
      <main className="webgl-fallback">
        <Header />
        <h1>Interactive world unavailable</h1>
        <p>This device cannot start WebGL. The complete Wiki remains available through the standard page map.</p>
        <Link to="/wiki-map">Open Wiki map</Link>
      </main>
    );
  }

  const panelProgress = Math.max(0, Math.min(1, (progress - 0.958) / 0.034));
  const journeyStyle = {
    "--journey-progress": progress,
    "--panel-progress": panelProgress,
  } as CSSProperties;

  const beginJourney = () => {
    setStarted(true);
    const top = journey.current?.offsetTop ?? 0;
    window.scrollTo({ top: top + window.innerHeight * 0.92, behavior: "smooth" });
  };

  return (
    <main
      ref={journey}
      className={`duna-world${started || progress > 0.025 ? " is-started" : ""}${progress > 0.9 ? " is-arriving" : ""}${progress > 0.982 ? " is-panel-ready" : ""}`}
      style={journeyStyle}
    >
      <Header light />

      <div className="duna-sticky">
        <div ref={mount} className="duna-stage" aria-label="A scroll-driven 3D journey through the DunaTerp project" />

        <section className="world-intro">
          <p>SCU–CHINA · iGEM 2026</p>
          <h1>Scroll into<br /><i>Dunaliella.</i></h1>
          <p>A continuous journey from hypersaline water to a controllable carotenoid platform.</p>
          <button type="button" onClick={beginJourney}>Begin the journey <span>↓</span></button>
          <small>SCROLL DOWN · TRACKPAD · SWIPE</small>
        </section>

        <div className="world-route" aria-label={`Journey progress ${Math.round(progress * 100)} percent`}>
          <span style={{ width: `${progress * 100}%` }} />
          {chapters.map((chapter) => (
            <i key={chapter.n} style={{ left: `${chapter.t * 100}%`, background: chapter.c }} />
          ))}
        </div>

        <WikiTerminal panelProgress={panelProgress} />

        <button
          className="restart-drive"
          type="button"
          onClick={() => window.scrollTo({ top: journey.current?.offsetTop ?? 0, behavior: "smooth" })}
          aria-label="Return to the beginning"
        >
          ↑
        </button>
      </div>

      <div className="duna-scroll-story">
        <div className="duna-scroll-lead" aria-hidden="true" />
        {chapters.map((chapter) => (
          <section
            key={chapter.n}
            className="duna-scroll-segment"
            aria-label={`${chapter.n}. ${chapter.kicker}. ${chapter.title}. ${chapter.body}`}
          />
        ))}
        <div className="duna-terminal-space" aria-hidden="true" />
      </div>
    </main>
  );
}
