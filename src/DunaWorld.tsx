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
  canvas.height = 600;
  const context = canvas.getContext("2d")!;

  context.fillStyle = "#082c27";
  context.roundRect(18, 18, 1164, 564, 54);
  context.fill();
  context.strokeStyle = chapter.c;
  context.lineWidth = 12;
  context.stroke();

  context.fillStyle = chapter.c;
  context.font = "900 34px system-ui";
  context.letterSpacing = "5px";
  context.fillText(`${chapter.n}  ${chapter.kicker}`, 72, 92);

  context.fillStyle = "#fff8df";
  context.font = "800 88px Georgia";
  context.letterSpacing = "-3px";
  wrapCanvasText(context, chapter.title, 1020, 2).forEach((line, index) => {
    context.fillText(line, 72, 210 + index * 92);
  });

  context.fillStyle = "rgba(255,248,223,.72)";
  context.font = "600 31px system-ui";
  context.letterSpacing = "0px";
  wrapCanvasText(context, chapter.body, 1040, 2).forEach((line, index) => {
    context.fillText(line, 72, 438 + index * 44);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(7.55, 3.85, 0.18),
    new THREE.MeshToonMaterial({ color: 0x082c27 }),
  );
  back.position.y = 4.15;
  back.castShadow = true;
  group.add(back);

  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(7.3, 3.6),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true }),
  );
  face.position.set(0, 4.15, 0.1);
  group.add(face);

  const postMaterial = new THREE.MeshToonMaterial({ color: 0xf4e8c7 });
  [-2.45, 2.45].forEach((x) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 5.1, 12), postMaterial);
    post.position.set(x, 2.25, -0.08);
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
  return vehicle;
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

    const camera = new THREE.OrthographicCamera(-12, 12, 8, -8, 0.1, 180);
    camera.position.set(12, 14, 16);
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
    for (let i = 0; i < 65; i += 1) {
      const radius = 0.45 + (i % 5) * 0.17;
      const crystal = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 0), saltMaterial);
      const x = ((i * 37) % 93) - 46;
      const z = ((i * 61) % 97) - 48;
      if (Math.abs(x) < 3 && Math.abs(z) < 42) continue;
      crystal.scale.y = 0.22;
      crystal.position.set(x, 0.1, z);
      crystal.rotation.y = i * 0.71;
      crystal.castShadow = true;
      scene.add(crystal);
    }

    const vehicle = createVehicle();
    scene.add(vehicle);

    chapters.forEach((chapter, index) => {
      const sign = createRoadSign(chapter);
      const side = index % 2 === 0 ? -1 : 1;
      addProp(scene, curve, chapter.t, side * 6.1, sign, 0.82);
      const signTangent = curve.getTangentAt(chapter.t).normalize();
      sign.rotation.y = Math.atan2(signTangent.x, signTangent.z);
    });

    const cell = createDunaliella();
    addProp(scene, curve, 0.25, -7.1, cell, 0.82);

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
      new THREE.BoxGeometry(8, 5, 0.65),
      new THREE.MeshToonMaterial({ color: 0x0a2925 }),
    );
    frame.position.y = 2.7;
    frame.castShadow = true;
    terminal.add(frame);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(6.9, 3.75),
      new THREE.MeshBasicMaterial({ color: 0xcaff61 }),
    );
    screen.position.set(0, 2.7, 0.34);
    terminal.add(screen);
    const portalLabel = textSprite("WIKI INDEX", "#082c27", 0.62);
    portalLabel.position.set(0, 2.7, 0.4);
    terminal.add(portalLabel);
    const terminalTangent = curve.getTangentAt(0.985).normalize();
    terminal.rotation.y = Math.atan2(terminalTangent.x, terminalTangent.z);
    addProp(scene, curve, 0.985, 0, terminal, 1);

    let targetProgress = 0.001;
    let currentProgress = 0.001;
    let disposed = false;
    let frameCount = 0;
    const cameraTarget = new THREE.Vector3();
    const cameraPosition = new THREE.Vector3();
    const travelTarget = new THREE.Vector3();
    const travelCamera = new THREE.Vector3();
    const terminalTarget = terminal.position.clone().add(new THREE.Vector3(0, 2.7, 0));
    const terminalCamera = terminal.position
      .clone()
      .addScaledVector(terminalTangent, 8)
      .add(new THREE.Vector3(0, 3.4, 0));
    const clock = new THREE.Clock();

    const updateScrollProgress = () => {
      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, root.offsetHeight - window.innerHeight);
      targetProgress = THREE.MathUtils.clamp((window.scrollY - rootTop) / travel, 0.001, 0.995);
    };

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height);
      const aspect = width / height;
      const view = 9.5;
      camera.left = -view * aspect;
      camera.right = view * aspect;
      camera.top = view;
      camera.bottom = -view;
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
      currentProgress = THREE.MathUtils.damp(currentProgress, targetProgress, 7, delta);

      const point = curve.getPointAt(currentProgress);
      const tangent = curve.getTangentAt(currentProgress).normalize();
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x);
      const routeSway = Math.sin(currentProgress * Math.PI * 7) * 0.12;
      vehicle.position.copy(point).addScaledVector(side, routeSway);
      vehicle.position.y = 0.12;
      vehicle.rotation.y = Math.atan2(tangent.x, tangent.z);
      vehicle.rotation.z = Math.sin(currentProgress * Math.PI * 14) * -0.035;

      const arriving = THREE.MathUtils.smoothstep(currentProgress, 0.87, 0.995);
      travelTarget.copy(vehicle.position).addScaledVector(tangent, -3.5);
      travelCamera
        .copy(vehicle.position)
        .addScaledVector(tangent, 11)
        .addScaledVector(side, 7)
        .add(new THREE.Vector3(0, 12, 0));
      cameraTarget.lerpVectors(travelTarget, terminalTarget, arriving);
      cameraPosition.lerpVectors(travelCamera, terminalCamera, arriving);
      camera.position.lerp(cameraPosition, 0.055);
      camera.zoom = THREE.MathUtils.lerp(1, 1.72, arriving);
      camera.updateProjectionMatrix();
      camera.lookAt(cameraTarget);

      cell.rotation.y += delta * 0.28;
      helix.rotation.y += delta * 0.42;
      network.rotation.y -= delta * 0.18;
      products.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.12;

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

  const panelProgress = Math.max(0, Math.min(1, (progress - 0.89) / 0.085));
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
      className={`duna-world${started || progress > 0.025 ? " is-started" : ""}${progress > 0.88 ? " is-arriving" : ""}${progress > 0.955 ? " is-panel-ready" : ""}`}
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
