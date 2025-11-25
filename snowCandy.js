//A.I. Disclaimer: All work for this assignment was completed by myself and entirely without the use of artificial intelligence tools such as ChatGPT, MS Copilot,
//my partner is chad brown

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ---------------- Scene / Renderer ---------------- */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0d8f0);

/* ---------------- Orthographic Camera ---------------- */
const aspect = window.innerWidth / window.innerHeight;
const d = 5;
const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 100);
camera.position.set(5, 5, 5);
camera.lookAt(0, 1.5, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;

/* ---------------- Lights & Ground ---------------- */
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6));

const key = new THREE.DirectionalLight(0xffffff, 0.9);
key.position.set(5, 10, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
scene.add(key);

const ground = new THREE.Mesh(
	new THREE.PlaneGeometry(30, 30),
	new THREE.MeshStandardMaterial({ color: 0x228822 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

//materials
const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
const blackMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff8800 });
const redMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });

// Helpers 
function sphere(r, mat) {
	const geo = new THREE.SphereGeometry(r, 32, 32);
	const mesh = new THREE.Mesh(geo, mat);
	mesh.castShadow = true;
	return mesh;
}

function cylinder(rTop, rBot, h, mat) {
	const geo = new THREE.CylinderGeometry(rTop, rBot, h, 24);
	const mesh = new THREE.Mesh(geo, mat);
	mesh.castShadow = true;
	return mesh;
}

function cone(r, h, mat) {
	const geo = new THREE.ConeGeometry(r, h, 32);
	const mesh = new THREE.Mesh(geo, mat);
	mesh.castShadow = true;
	return mesh;
}


function buildSnowman() {
	const g = new THREE.Group();

	const bottom = sphere(1.2, snowMat); bottom.position.y = 1.2;
	const middle = sphere(0.9, snowMat); middle.position.y = 2.7;
	const head = sphere(0.6, snowMat); head.position.y = 3.6;
	g.add(bottom, middle, head);

	const eyeL = sphere(0.1, blackMat); eyeL.position.set(-0.15, 3.7, 0.55);
	const eyeR = sphere(0.1, blackMat); eyeR.position.set(0.15, 3.7, 0.55);
	g.add(eyeL, eyeR);

	const nose = cone(0.1, 0.5, orangeMat);
	nose.position.set(0, 3.6, 0.6);
	nose.rotation.x = Math.PI / 2;
	g.add(nose);

	// More buttons for detail
	for (let i = 0; i < 6; i++) {
		const btn = sphere(0.1, blackMat);
		btn.position.set(0, 2.7 - 0.4 + i * 0.25, 0.9 - i * 0.15);
		g.add(btn);
	}

	const armL = cylinder(0.05, 0.05, 1, blackMat);
	armL.position.set(-1.2, 2.7, 0); armL.rotation.z = Math.PI / 4;
	const armR = armL.clone();
	armR.position.x = 1.2; armR.rotation.z = -Math.PI / 4;
	g.add(armL, armR);

	return g;
}

//candy cane 
function buildCandyCane() {
	const cane = new THREE.Group();

	const shaftRadius = 0.15;
	const shaftHeight = 2;
	const hookRadius = 0.6;
	const turns = 6;
	const segments = 300;

	// Curve for entire candy cane
	const candyCurve = new THREE.Curve();
	candyCurve.getPoint = function(t) {
		const shaftPortion = shaftHeight / (shaftHeight + hookRadius);
		if (t < shaftPortion) {
			const localY = t / shaftPortion * shaftHeight;
			return new THREE.Vector3(0, localY, 0);
		} else {
			const hookT = (t - shaftPortion) / (1 - shaftPortion);
			const angle = hookT * Math.PI; // half circle
			const y = shaftHeight + hookRadius * Math.sin(angle);
			const z = hookRadius * (1 - Math.cos(angle));
			return new THREE.Vector3(0, y, z);
		}
	};

	const geometry = new THREE.TubeGeometry(candyCurve, segments, shaftRadius, 32, false);

	// Add stripes
	const pos = geometry.attributes.position;
	const colors = [];
	let prev = new THREE.Vector3().fromBufferAttribute(pos, 0);
	let accumulatedLength = 0;
	const lengths = [0];
	for (let i = 1; i < pos.count; i++) {
		const curr = new THREE.Vector3().fromBufferAttribute(pos, i);
		accumulatedLength += curr.distanceTo(prev);
		lengths.push(accumulatedLength);
		prev.copy(curr);
	}
	const totalLength = lengths[lengths.length - 1];
	const colorRed = new THREE.Color(0xff0000);
	const colorWhite = new THREE.Color(0xffffff);
	for (let i = 0; i < pos.count; i++) {
		const t = lengths[i] / totalLength;
		const stripeIndex = Math.floor(t * turns * 2) % 2;
		colors.push(...(stripeIndex === 0 ? colorRed.toArray() : colorWhite.toArray()));
	}

	geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

	const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 });
	const candyMesh = new THREE.Mesh(geometry, material);
	candyMesh.castShadow = true;
	cane.add(candyMesh);

	cane.position.set(3, 0, 0);
	return cane;
}


const snowman = buildSnowman();
scene.add(snowman);

const candyCane = buildCandyCane();
scene.add(candyCane);
function onResize() {
	const aspect = window.innerWidth / window.innerHeight;
	camera.left = -d * aspect;
	camera.right = d * aspect;
	camera.top = d;
	camera.bottom = -d;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

renderer.setAnimationLoop(() => {
	controls.update();
	renderer.render(scene, camera);
});
