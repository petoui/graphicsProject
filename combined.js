import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ---------------- BASIC SETUP ---------------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0d8f0); // light sky

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
);
camera.position.set(8, 6, 12);
camera.lookAt(0, 2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0);
controls.enableDamping = true;

/* ---------------- LIGHTING ---------------- */

// ambient light for soft background illumination
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// directional "sunlight"
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(10, 20, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 50;
sun.shadow.camera.left = -20;
sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20;
sun.shadow.camera.bottom = -20;
scene.add(sun);

// warm point light near tree for glow effect
const treeLight = new THREE.PointLight(0xffcc88, 1, 10);
treeLight.position.set(-3.5, 3.5, 1);
scene.add(treeLight);

// cool spotlight on snowman
const snowSpot = new THREE.SpotLight(0x88ccff, 1.2, 20, Math.PI / 6, 0.25);
snowSpot.position.set(4, 6, 4);
snowSpot.target.position.set(1, 2, -1);
snowSpot.castShadow = true;
scene.add(snowSpot);
scene.add(snowSpot.target);

/* ---------------- GROUND (Snow) ---------------- */
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
        metalness: 0.0
    })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* ============================================================
   ---------------------- OBJECT BUILDERS ----------------------
   ============================================================ */

/* ---------- Snowman ---------- */
function buildSnowman() {
    const snowMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.6,
        metalness: 0.1
    });

    const blackMat = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        roughness: 0.4,
        metalness: 0.3
    });

    const orangeMat = new THREE.MeshStandardMaterial({ 
        color: 0xff8800,
        roughness: 0.3,
        metalness: 0.4
    });

    const g = new THREE.Group();

    function sphere(r, mat) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), mat);
        m.castShadow = true;
        return m;
    }

    const bottom = sphere(1.2, snowMat); bottom.position.y = 1.2;
    const middle = sphere(0.9, snowMat); middle.position.y = 2.7;
    const head = sphere(0.6, snowMat); head.position.y = 3.6;
    g.add(bottom, middle, head);

    const eyeL = sphere(0.1, blackMat); eyeL.position.set(-0.15, 3.7, 0.55);
    const eyeR = sphere(0.1, blackMat); eyeR.position.set(0.15, 3.7, 0.55);
    g.add(eyeL, eyeR);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 32), orangeMat);
    nose.position.set(0, 3.6, 0.6);
    nose.rotation.x = Math.PI / 2;
    g.add(nose);

    return g;
}

/* ---------- Candy Cane ---------- */
function buildCandyCane() {
    const cane = new THREE.Group();

    const shaftRadius = 0.15;
    const shaftHeight = 2;
    const hookRadius = 0.6;
    const segments = 200;

    const curve = new THREE.Curve();
    curve.getPoint = function (t) {
        const cutoff = shaftHeight / (shaftHeight + hookRadius);
        if (t < cutoff) {
            const y = (t / cutoff) * shaftHeight;
            return new THREE.Vector3(0, y, 0);
        } else {
            const k = (t - cutoff) / (1 - cutoff);
            const angle = k * Math.PI;
            return new THREE.Vector3(
                0,
                shaftHeight + hookRadius * Math.sin(angle),
                hookRadius * (1 - Math.cos(angle))
            );
        }
    };

    const tube = new THREE.TubeGeometry(curve, segments, shaftRadius, 32, false);

    const colors = [];
    const pos = tube.attributes.position;
    const red = new THREE.Color(0xff0000);
    const white = new THREE.Color(0xffffff);

    for (let i = 0; i < pos.count; i++) {
        const stripe = Math.floor(i / 20) % 2 === 0 ? red : white;
        colors.push(...stripe.toArray());
    }

    tube.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0.3,
        roughness: 0.2
    });

    const mesh = new THREE.Mesh(tube, material);
    cane.add(mesh);

    return cane;
}

/* ---------- Present Gift Box ---------- */
function buildPresent() {
    const gift = new THREE.Group();

    const box = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.5,
            metalness: 0.2
        })
    );
    gift.add(box);

    const ribbonMat = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        metalness: 0.7,
        roughness: 0.3
    });

    const horiz = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.15, 1.1), ribbonMat);
    const vert = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.1, 1.1), ribbonMat);

    gift.add(horiz, vert);
    return gift;
}

/* ---------- Tree ---------- */
function buildTree() {
    const group = new THREE.Group();

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 1, 8),
        new THREE.MeshStandardMaterial({
            color: 0x5b3a1e,
            roughness: 0.9,
            metalness: 0.0
        })
    );
    trunk.position.y = -0.5;
    group.add(trunk);

    const greenMat = new THREE.MeshStandardMaterial({
        color: 0x007700,
        roughness: 0.8,
        metalness: 0.1
    });

    function branch(r, h, y) {
        const b = new THREE.Mesh(new THREE.ConeGeometry(r, h, 16), greenMat);
        b.castShadow = true;
        b.position.y = y;
        group.add(b);
    }

    branch(1.5, 2, 0.5);
    branch(1.2, 1.8, 1.8);
    branch(0.8, 1.5, 2.9);

    return group;
}

/* ---------- Extruded Gold Star ---------- */
function buildStar() {
    const shape = new THREE.Shape();
    const outer = 0.5, inner = 0.2;

    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * outer;
        const y = Math.sin(a) * outer;

        const a2 = a + Math.PI / 5;
        const x2 = Math.cos(a2) * inner;
        const y2 = Math.sin(a2) * inner;

        if (i === 0) shape.moveTo(x, y);
        shape.lineTo(x, y);
        shape.lineTo(x2, y2);
    }

    const extrudeSettings = {
        depth: 0.25,
        bevelEnabled: true,
        bevelSize: 0.05,
        bevelThickness: 0.05
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 1.0,
        roughness: 0.2
    });

    const star = new THREE.Mesh(geo, mat);
    star.castShadow = true;
    return star;
}

/* ---------- Snowman Hat (LatheGeometry) ---------- */
function buildSnowmanHat() {
    const profile = [];

    profile.push(new THREE.Vector2(0.6, 0));     
    profile.push(new THREE.Vector2(0.45, 0.05)); 
    profile.push(new THREE.Vector2(0.45, 0.7));  
    profile.push(new THREE.Vector2(0.25, 1.0));  
    profile.push(new THREE.Vector2(0.25, 1.1));  

    const geo = new THREE.LatheGeometry(profile, 64);
    const mat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.6,
        metalness: 0.2
    });

    const hat = new THREE.Mesh(geo, mat);
    hat.castShadow = true;

    return hat;
}

/* ---------- Snowflakes for snowfall ---------- */
function buildSnowflake() {
    const geo = new THREE.IcosahedronGeometry(0.07, 1);
    const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x111111,
        roughness: 0.4,
        metalness: 0.1
    });
    return new THREE.Mesh(geo, mat);
}

/* ---------------- ADD OBJECTS TO SCENE ---------------- */
const tree = buildTree();
tree.position.set(-3.5, 0, 0);
scene.add(tree);

const snowman = buildSnowman();
snowman.position.set(1, 0, -1);
scene.add(snowman);

const cane = buildCandyCane();
cane.position.set(3, 0, 0);
scene.add(cane);

const present = buildPresent();
present.position.set(-1.5, 0.5, 0);
scene.add(present);

/* ----- Star on Tree ----- */
const star = buildStar();
star.position.set(-3.5, 3.7, 0);
star.rotation.y = Math.PI / 4;
scene.add(star);

/* ----- Snowman Hat ----- */
const hat = buildSnowmanHat();
hat.position.set(1, 4.1, -1);
scene.add(hat);

/* ----- Snowfall System ----- */
const snowflakes = [];
for (let i = 0; i < 200; i++) {
    const f = buildSnowflake();
    f.position.set(
        (Math.random() - 0.5) * 30,
        Math.random() * 10 + 5,
        (Math.random() - 0.5) * 30
    );
    f.castShadow = false;
    scene.add(f);
    snowflakes.push(f);
}

/* ----- Snow Toggle (Press A) ----- */
let snowEnabled = false;

window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "a") {
        snowEnabled = !snowEnabled;
        console.log("Snowfall:", snowEnabled ? "ON" : "OFF");
    }
});

/* ---------------- RESIZE ---------------- */
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------------- ANIMATION LOOP ---------------- */
renderer.setAnimationLoop(() => {
    controls.update();

    /* ---- Snow animation ---- */
    if (snowEnabled) {
        for (const f of snowflakes) {
            f.position.y -= 0.03 + Math.random() * 0.01;
            f.rotation.x += 0.01;
            f.rotation.y += 0.01;

            if (f.position.y < 0) {
                f.position.y = Math.random() * 10 + 5;
            }
        }
    }

    renderer.render(scene, camera);
});
