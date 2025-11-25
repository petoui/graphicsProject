import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; 
 
        const scene = new THREE.Scene();
        //scene.background = new THREE.Color(0xAAAAAA);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        //camera.position.z = 8;
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 1, 0);

        // WebGL renderer
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // ---

        // Orbit controls for exploration
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 1, 0); 
        controls.update();

        // light
        const ambientLight = new THREE.AmbientLight(0x404040); ///// soft white light
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();
        scene.add(directionalLight);

        // gift box
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // red color
        const giftBox = new THREE.Mesh(boxGeometry, boxMaterial);
        scene.add(giftBox);

        // ribbon
        const ribbonGeometry = new THREE.BoxGeometry(1.1, 0.2, 1.1); // horizontal ribbon
        const ribbonMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // yellow color
        const ribbonHorizontal = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
        giftBox.add(ribbonHorizontal); // add ribbon to box

        const ribbonVerticalGeometry = new THREE.BoxGeometry(0.2, 1.1, 1.1); // vertical ribbon
        const ribbonVertical = new THREE.Mesh(ribbonVerticalGeometry, ribbonMaterial);
        giftBox.add(ribbonVertical);

        // animation loops
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();

        // handle window resizing
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });