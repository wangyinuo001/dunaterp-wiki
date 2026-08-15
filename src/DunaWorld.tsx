import { useEffect, useRef, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";

type HeaderProps = { light?: boolean };

const chapters = [
  { t: .08, n: "01", kicker: "HALOPHILIC CHASSIS", title: "Life without a wall", body: "Dunaliella salina is a wall-less, motile green alga adapted to hypersaline water.", link: "/alternative-platform", c: "#c9ff55" },
  { t: .25, n: "02", kicker: "REAL CELL ARCHITECTURE", title: "Meet Dunaliella", body: "Two equal anterior flagella, a cup-shaped chloroplast, central pyrenoid and a small eyespot define the cell beside the road.", link: "/project-description", c: "#ff8b3d" },
  { t: .42, n: "03", kicker: "TRANSCRIPTOMICS", title: "Read the light response", body: "Light intensity and quality become two analysis axes for finding testable regulators around the LCYB control point.", link: "/results", c: "#7de2ff" },
  { t: .59, n: "04", kicker: "MATHEMATICAL MODEL", title: "Find where control moves", body: "Expression, branch kinetics and network capacity ask when more LCYB stops producing a useful gain.", link: "/model", c: "#f8cb54" },
  { t: .75, n: "05", kicker: "FOUR PRODUCT ROUTES", title: "One hub, four strains", body: "β-ionone, astaxanthin, crocetin and β-citraurin are designed as separate product strains sharing a β-carotene hub.", link: "/engineering", c: "#ff6d8b" },
  { t: .88, n: "06", kicker: "RESPONSIBLE ENGINEERING", title: "The world changes the design", body: "Safety, stakeholder feedback and reproducibility determine whether the platform should move beyond the lab.", link: "/human-practices", c: "#c4a8ff" },
];

function makeRoad(curve: THREE.CatmullRomCurve3, width: number) {
  const segments = 260;
  const positions: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const side = new THREE.Vector3().crossVectors(up, tangent).normalize().multiplyScalar(width / 2);
    positions.push(p.x + side.x, .08, p.z + side.z, p.x - side.x, .08, p.z - side.z);
    if (i < segments) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

function textSprite(text: string, accent = "#d5ff61", scale = 1) {
  const canvas = document.createElement("canvas"); canvas.width = 768; canvas.height = 192;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(5,25,23,.88)"; ctx.roundRect(12, 16, 744, 160, 30); ctx.fill();
  ctx.strokeStyle = accent; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = "#fff8df"; ctx.font = "800 54px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 384, 96);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(8 * scale, 2 * scale, 1); return sprite;
}

function tube(points: THREE.Vector3[], radius: number, material: THREE.Material) {
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, radius, 8, false), material);
}

function createDunaliella() {
  const cell = new THREE.Group(); cell.name = "Dunaliella salina model";
  const membrane = new THREE.MeshPhysicalMaterial({ color: 0xaef378, transparent: true, opacity: .34, roughness: .2, transmission: .35, side: THREE.DoubleSide });
  const profile = [new THREE.Vector2(.18, -2.5), new THREE.Vector2(1.35, -2.15), new THREE.Vector2(1.85, -.7), new THREE.Vector2(1.72, .8), new THREE.Vector2(1.2, 1.9), new THREE.Vector2(.48, 2.55), new THREE.Vector2(.08, 2.65)];
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), membrane); body.castShadow = true; cell.add(body);

  const chloroplast = new THREE.Mesh(new THREE.TorusGeometry(1.05, .56, 14, 48, Math.PI * 1.72), new THREE.MeshToonMaterial({ color: 0x5ca532, transparent: true, opacity: .8 }));
  chloroplast.rotation.set(Math.PI / 2, 0, -.15); chloroplast.scale.set(1, 1.35, 1); chloroplast.position.y = -.4; cell.add(chloroplast);
  const pyrenoid = new THREE.Mesh(new THREE.SphereGeometry(.47, 24, 16), new THREE.MeshToonMaterial({ color: 0xd9e9a9 })); pyrenoid.position.set(0, -.45, .15); cell.add(pyrenoid);
  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(.58, 24, 16), new THREE.MeshToonMaterial({ color: 0xf3e9a7 })); nucleus.scale.y = 1.25; nucleus.position.set(0, .85, -.15); cell.add(nucleus);
  const eyespot = new THREE.Mesh(new THREE.SphereGeometry(.22, 20, 12), new THREE.MeshToonMaterial({ color: 0xe44924 })); eyespot.position.set(1.18, 1.05, .64); cell.add(eyespot);
  const dropletMaterial = new THREE.MeshToonMaterial({ color: 0xf78b24 });
  [[-1.15,-1.25,.45],[.9,-1.5,.8],[-1.25,.1,-.55],[1.28,-.2,-.25],[-.82,-1.72,-.72],[.55,-1.78,-.9],[1.05,.4,.55]].forEach(([x,y,z],i)=>{ const d=new THREE.Mesh(new THREE.SphereGeometry(.15+(i%3)*.035,16,10),dropletMaterial);d.position.set(x,y,z);cell.add(d); });
  const flagellaMaterial = new THREE.MeshToonMaterial({ color: 0xbdf479 });
  const f1 = tube([new THREE.Vector3(-.2,2.5,0),new THREE.Vector3(-.65,3.5,.2),new THREE.Vector3(-1.7,4.2,.7),new THREE.Vector3(-2.8,5.5,.2),new THREE.Vector3(-2.1,7,-.4)],.055,flagellaMaterial);
  const f2 = tube([new THREE.Vector3(.2,2.5,0),new THREE.Vector3(.8,3.45,-.1),new THREE.Vector3(1.9,4.1,-.7),new THREE.Vector3(3,5.35,-.15),new THREE.Vector3(2.35,6.9,.5)],.055,flagellaMaterial);
  cell.add(f1,f2); cell.scale.setScalar(1.08); return cell;
}

function createVehicle() {
  const vehicle = new THREE.Group();
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.45,.45,2.15),new THREE.MeshToonMaterial({color:0xf1762e})); chassis.position.y=.55;chassis.castShadow=true;vehicle.add(chassis);
  const cabin = new THREE.Mesh(new THREE.SphereGeometry(.72,20,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshToonMaterial({color:0x173f3a}));cabin.scale.set(.86,.75,1);cabin.rotation.x=Math.PI; cabin.position.set(0,.82,-.2);vehicle.add(cabin);
  const wheelMaterial=new THREE.MeshToonMaterial({color:0x122522});
  [[-.76,.3,.7],[.76,.3,.7],[-.76,.3,-.72],[.76,.3,-.72]].forEach(([x,y,z])=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.25,18),wheelMaterial);w.rotation.z=Math.PI/2;w.position.set(x,y,z);w.castShadow=true;vehicle.add(w);});
  const glow=new THREE.Mesh(new THREE.CircleGeometry(.32,20),new THREE.MeshBasicMaterial({color:0xd9ff67}));glow.position.set(0,.58,1.081);vehicle.add(glow);return vehicle;
}

function createHelix() {
  const group=new THREE.Group();const blue=new THREE.MeshToonMaterial({color:0x66d7ef});const pink=new THREE.MeshToonMaterial({color:0xf36e9b});const rung=new THREE.MeshToonMaterial({color:0xf8d968});
  const a:THREE.Vector3[]=[];const b:THREE.Vector3[]=[];
  for(let i=0;i<36;i++){const y=i*.18;const ang=i*.52;a.push(new THREE.Vector3(Math.cos(ang)*.75,y,Math.sin(ang)*.75));b.push(new THREE.Vector3(Math.cos(ang+Math.PI)*.75,y,Math.sin(ang+Math.PI)*.75));if(i%3===0){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a[i],b[i]]),new THREE.LineBasicMaterial({color:(rung as THREE.MeshToonMaterial).color}));group.add(line);}}
  group.add(tube(a,.1,blue),tube(b,.1,pink));group.position.y=.2;return group;
}

function addProp(scene:THREE.Scene,curve:THREE.CatmullRomCurve3,t:number,offset:number,object:THREE.Object3D,label:string,color:string,scale=1){const p=curve.getPointAt(t);const tangent=curve.getTangentAt(t).normalize();const side=new THREE.Vector3(-tangent.z,0,tangent.x).multiplyScalar(offset);object.position.copy(p).add(side);object.position.y=.12;object.scale.multiplyScalar(scale);scene.add(object);const s=textSprite(label,color,.8);s.position.copy(object.position).add(new THREE.Vector3(0,6*scale,0));scene.add(s);}

export function DunaWorld({ Header }: { Header: ComponentType<HeaderProps> }) {
  const mount=useRef<HTMLDivElement>(null);const [started,setStarted]=useState(false);const [progress,setProgress]=useState(.005);const [active,setActive]=useState(0);const [quality,setQuality]=useState<"webgl"|"fallback">("webgl");
  const activeChapter=chapters[active];
  useEffect(()=>{if(!mount.current)return;const host=mount.current;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"});}catch{setQuality("fallback");return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));renderer.setSize(host.clientWidth,host.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.className="duna-canvas";host.appendChild(renderer.domElement);
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x8fd0d2);scene.fog=new THREE.Fog(0x8fd0d2,35,78);
    const camera=new THREE.OrthographicCamera(-12,12,8,-8,.1,180);camera.position.set(12,14,16);camera.lookAt(0,0,0);
    scene.add(new THREE.HemisphereLight(0xe7fbff,0x304a35,2.3));const sun=new THREE.DirectionalLight(0xfff1ca,4);sun.position.set(-18,25,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-28;sun.shadow.camera.right=28;sun.shadow.camera.top=28;sun.shadow.camera.bottom=-28;scene.add(sun);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(110,110),new THREE.MeshToonMaterial({color:0xe9e1c7}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-18,0,18),new THREE.Vector3(-15,0,7),new THREE.Vector3(-5,0,12),new THREE.Vector3(5,0,5),new THREE.Vector3(15,0,10),new THREE.Vector3(20,0,-2),new THREE.Vector3(10,0,-11),new THREE.Vector3(-2,0,-6),new THREE.Vector3(-14,0,-14),new THREE.Vector3(-7,0,-28),new THREE.Vector3(8,0,-25),new THREE.Vector3(20,0,-36)],false,"catmullrom",.45);
    const road=new THREE.Mesh(makeRoad(curve,3.7),new THREE.MeshToonMaterial({color:0x17463e}));road.receiveShadow=true;scene.add(road);
    for(let i=2;i<130;i+=4){const t=i/132;const p=curve.getPointAt(t);const tangent=curve.getTangentAt(t);const dash=new THREE.Mesh(new THREE.BoxGeometry(.16,.035,.75),new THREE.MeshToonMaterial({color:0xf5da61}));dash.position.copy(p);dash.position.y=.13;dash.rotation.y=Math.atan2(tangent.x,tangent.z);scene.add(dash);}
    const poolMat=new THREE.MeshToonMaterial({color:0xe7a3a8,transparent:true,opacity:.82});[[-24,9,7,4],[-2,22,8,3],[25,19,9,4],[28,-17,7,3],[-25,-31,10,5],[4,-41,8,3]].forEach(([x,z,sx,sz])=>{const pool=new THREE.Mesh(new THREE.CircleGeometry(1,40),poolMat);pool.rotation.x=-Math.PI/2;pool.scale.set(sx,sz,1);pool.position.set(x,.025,z);scene.add(pool);});
    const saltMat=new THREE.MeshToonMaterial({color:0xfff8df});for(let i=0;i<65;i++){const r=.45+(i%5)*.17;const crystal=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),saltMat);const x=((i*37)%93)-46;const z=((i*61)%97)-48;if(Math.abs(x)<3&&Math.abs(z)<42)continue;crystal.scale.y=.22;crystal.position.set(x,.1,z);crystal.rotation.y=i*.71;crystal.castShadow=true;scene.add(crystal);}
    const vehicle=createVehicle();scene.add(vehicle);
    const cell=createDunaliella();addProp(scene,curve,.25,-7.1,cell,"D. SALINA — BIFLAGELLATE",chapters[1].c,.82);
    const helix=createHelix();addProp(scene,curve,.42,6,helix,"LIGHT → RNA → REGULATION",chapters[2].c,.78);
    const network=new THREE.Group();const nodeMat=new THREE.MeshToonMaterial({color:0xf5cd54});const edgeMat=new THREE.LineBasicMaterial({color:0x274d45});const nodePositions=[new THREE.Vector3(0,4,0),new THREE.Vector3(-2,2,1),new THREE.Vector3(2,2,-1),new THREE.Vector3(-2.7,0,-1.5),new THREE.Vector3(0,0,1.8),new THREE.Vector3(2.8,0,.2)];nodePositions.forEach((p,i)=>{const n=new THREE.Mesh(new THREE.IcosahedronGeometry(.5+(i===0?.2:0),1),nodeMat);n.position.copy(p);network.add(n);if(i){network.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([nodePositions[Math.max(0,Math.floor((i-1)/2))],p]),edgeMat));}});addProp(scene,curve,.59,-6.5,network,"ODE + FBA + SENSITIVITY",chapters[3].c,.9);
    const products=new THREE.Group();[[0xf7a52d,"β-I"],[0xe65c42,"AST"],[0xe9c43a,"CRO"],[0xed7688,"β-CIT"]].forEach(([color,label],i)=>{const tower=new THREE.Mesh(new THREE.CylinderGeometry(.6,.8,2.2+i*.5,8),new THREE.MeshToonMaterial({color:color as number}));tower.position.set((i-1.5)*1.7,1.1+i*.25,0);tower.castShadow=true;products.add(tower);const sp=textSprite(label as string,"#fff1c8",.28);sp.position.set((i-1.5)*1.7,3+i*.5,0);products.add(sp);});addProp(scene,curve,.75,6.7,products,"FOUR STRAINS / ONE HUB",chapters[4].c,.85);
    const compass=new THREE.Group();const ring=new THREE.Mesh(new THREE.TorusGeometry(2,.18,10,36),new THREE.MeshToonMaterial({color:0xb9a4f2}));ring.rotation.x=Math.PI/2;ring.position.y=2.2;compass.add(ring);for(let i=0;i<4;i++){const person=new THREE.Mesh(new THREE.CapsuleGeometry(.32,.7,5,10),new THREE.MeshToonMaterial({color:[0xf07849,0x72cbd4,0xf2cb5b,0xc5a4ef][i]}));person.position.set(Math.cos(i*Math.PI/2)*2,1.1,Math.sin(i*Math.PI/2)*2);compass.add(person);}addProp(scene,curve,.88,-6,compass,"SAFETY × SOCIETY",chapters[5].c,.8);
    const terminal=new THREE.Group();const frameMat=new THREE.MeshToonMaterial({color:0x0a2925});const screenMat=new THREE.MeshBasicMaterial({color:0xcaff61});const frame=new THREE.Mesh(new THREE.BoxGeometry(8,5,.65),frameMat);frame.position.y=2.7;frame.castShadow=true;terminal.add(frame);const screen=new THREE.Mesh(new THREE.PlaneGeometry(6.9,3.75),screenMat);screen.position.set(0,2.7,.34);terminal.add(screen);const portalLabel=textSprite("ENTER THE WIKI","#caff61",.62);portalLabel.position.set(0,2.7,.4);terminal.add(portalLabel);const terminalTangent=curve.getTangentAt(.985);terminal.rotation.y=Math.atan2(terminalTangent.x,terminalTangent.z)+Math.PI;addProp(scene,curve,.985,0,terminal,"DOCUMENTED. REPRODUCIBLE. REUSABLE.","#caff61",1);
    let targetProgress=.005,currentProgress=.005,lateral=0,lateralTarget=0;const keys=new Set<string>();let dragY:number|null=null;let disposed=false;const cameraTarget=new THREE.Vector3();const cameraPosition=new THREE.Vector3();const clock=new THREE.Clock();let frameCount=0;
    const onKeyDown=(e:KeyboardEvent)=>{keys.add(e.key.toLowerCase());if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(e.key.toLowerCase()))e.preventDefault();};const onKeyUp=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase());
    const advance=(amount:number)=>{targetProgress=THREE.MathUtils.clamp(targetProgress+amount,0,.995);};
    const onWheel=(e:WheelEvent)=>{e.preventDefault();advance(e.deltaY*.00009);};
    const onPointerDown=(e:PointerEvent)=>{dragY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);};const onPointerMove=(e:PointerEvent)=>{if(dragY===null)return;const dy=e.clientY-dragY;advance(dy*.00035);dragY=e.clientY;};const onPointerUp=()=>{dragY=null;};
    window.addEventListener("keydown",onKeyDown,{passive:false});window.addEventListener("keyup",onKeyUp);renderer.domElement.addEventListener("wheel",onWheel,{passive:false});renderer.domElement.addEventListener("pointerdown",onPointerDown);renderer.domElement.addEventListener("pointermove",onPointerMove);renderer.domElement.addEventListener("pointerup",onPointerUp);
    const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);const aspect=w/h;const view=9.5;camera.left=-view*aspect;camera.right=view*aspect;camera.top=view;camera.bottom=-view;camera.updateProjectionMatrix();};window.addEventListener("resize",resize);resize();
    const animate=()=>{if(disposed)return;requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);const forward=(keys.has("w")||keys.has("arrowup")?1:0)-(keys.has("s")||keys.has("arrowdown")?1:0);const steer=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0);advance(forward*dt*.045);lateralTarget=THREE.MathUtils.clamp(lateralTarget+steer*dt*3,-1.35,1.35);lateral=THREE.MathUtils.damp(lateral,lateralTarget,6,dt);currentProgress=THREE.MathUtils.damp(currentProgress,targetProgress,7,dt);const p=curve.getPointAt(currentProgress);const tangent=curve.getTangentAt(currentProgress).normalize();const side=new THREE.Vector3(-tangent.z,0,tangent.x);vehicle.position.copy(p).addScaledVector(side,lateral);vehicle.position.y=.12;vehicle.rotation.y=Math.atan2(tangent.x,tangent.z);vehicle.rotation.z=-steer*.08;const arriving=THREE.MathUtils.smoothstep(currentProgress,.93,.995);cameraTarget.copy(vehicle.position).addScaledVector(tangent,3+arriving*7);cameraPosition.copy(vehicle.position).addScaledVector(tangent,-10+arriving*5).add(new THREE.Vector3(10-arriving*8,12-arriving*8,10-arriving*8));camera.position.lerp(cameraPosition,.055);camera.lookAt(cameraTarget);cell.rotation.y+=dt*.28;helix.rotation.y+=dt*.42;network.rotation.y-=dt*.18;products.rotation.y=Math.sin(clock.elapsedTime*.35)*.12;frameCount++;if(frameCount%5===0){setProgress(currentProgress);let idx=0;for(let i=0;i<chapters.length;i++)if(currentProgress>=chapters[i].t-.045)idx=i;setActive(idx);}renderer.render(scene,camera);};animate();
    return()=>{disposed=true;window.removeEventListener("resize",resize);window.removeEventListener("keydown",onKeyDown);window.removeEventListener("keyup",onKeyUp);renderer.domElement.removeEventListener("wheel",onWheel);renderer.domElement.removeEventListener("pointerdown",onPointerDown);renderer.domElement.removeEventListener("pointermove",onPointerMove);renderer.domElement.removeEventListener("pointerup",onPointerUp);renderer.dispose();renderer.domElement.remove();};
  },[]);
  if(quality==="fallback")return <main className="webgl-fallback"><Header/><h1>Interactive world unavailable</h1><p>This device cannot start WebGL. The complete Wiki remains available through the standard page map.</p><Link to="/wiki-map">Open Wiki map</Link></main>;
  return <main className={`duna-world${started?" is-started":""}${progress>.94?" is-arriving":""}`}><Header light/><div ref={mount} className="duna-stage" aria-label="Interactive 3D journey through the DunaTerp project"/><section className="world-intro"><p>SCU–CHINA · iGEM 2026</p><h1>Drive into<br/><i>Dunaliella.</i></h1><p>A real-time journey from hypersaline water to a controllable carotenoid platform.</p><button onClick={()=>setStarted(true)}>Start the engine <span>→</span></button><small>WASD / ARROW KEYS · SCROLL · DRAG</small></section><aside className="world-hud"><div className="hud-index">{activeChapter.n}</div><div><p style={{color:activeChapter.c}}>{activeChapter.kicker}</p><h2>{activeChapter.title}</h2><p>{activeChapter.body}</p><Link to={activeChapter.link}>Explore this work ↗</Link></div></aside><div className="world-controls"><span>STEER</span><kbd>W</kbd><div><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></div><small>or scroll / drag</small></div><div className="world-route" aria-label={`Journey progress ${Math.round(progress*100)} percent`}><span style={{width:`${progress*100}%`}}/>{chapters.map(ch=><i key={ch.n} style={{left:`${ch.t*100}%`,background:ch.c}}/> )}</div><section className="wiki-terminal"><p>ROUTE COMPLETE · 06/06</p><h2>The world becomes<br/>the record.</h2><p>Enter the complete, judge-readable Wiki with fixed URLs, methods, results and attribution.</p><div><Link to="/wiki-map">Enter full Wiki</Link><Link to="/project-description">Project overview</Link></div><small>Every scientific claim remains subject to named team review.</small></section><button className="restart-drive" onClick={()=>window.location.reload()} aria-label="Restart journey">↺</button></main>;
}
