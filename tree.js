import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; 
 
        const scene = new THREE.Scene();
        //scene.background = new THREE.Color(0xAAAAAA);
    
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        //camera.position.z = 10;
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

        //light
        const ambientLight = new THREE.AmbientLight(0x404040); // white light
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();
        scene.add(directionalLight);

        // trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // brown
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = -0.5;
        scene.add(trunk);

        //tree layers/branches
        const branchMaterial = new THREE.MeshLambertMaterial({ color: 0x008000 }); // greeb

        const createBranch = (radius, height, yPos) => {
            const branchGeometry = new THREE.ConeGeometry(radius, height, 16);
            const branch = new THREE.Mesh(branchGeometry, branchMaterial);
            branch.position.y = yPos;
            scene.add(branch);
            return branch;
        };

        createBranch(1.5, 2, 0.5); // bottom "branch"
        createBranch(1.2, 1.8, 1.8); // middle "branch"
        createBranch(0.8, 1.5, 2.9); // top "branch"

        // ornaments - initial (on top branch)
        const radius = 1.0;
        const widthSegments = 12;
        const heightSegments =  8;
        const ornamentGeometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
        const ornamentMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 }); // red
        const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
        ornament.position.set(-0.3, 2.8, 0.5); // position around tree
        ornament.scale.set(0.2, 0.2, 0.2); // adjust size
        scene.add(ornament);

        // ornaments - additional
        const createOrnament = (x, y, z) => {
            const radius = 1.0;
            const widthSegments = 12;
            const heightSegments =  8;
            const ornamentGeometry = new THREE.SphereGeometry( radius, heightSegments, widthSegments );
            const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
            //ornament.position.y = y;
            ornament.position.set(x, y, z); // position around tree
            ornament.scale.set(0.2, 0.2, 0.2); // adjust size
            scene.add(ornament);
            return ornament;
        };

        // 2nd on top branch, right
        createOrnament(.5, 2.5, .6);
        
        // middle ornaments
        createOrnament(.4, 1.4, .9);
        createOrnament(-0.6, 1.2, 1.0);

        // bottom ornaments
        createOrnament(.7, 0.1, 1.0);
        createOrnament(-0.5, 0.3, 1.0);

        // createOrnament(.7, 8, 1); ///// bottom layer

        // star
        const starShape = new THREE.Shape();
        starShape.moveTo(0, 1);
        starShape.lineTo(0.25, 0.25);
        starShape.lineTo(1, 0.25);
        starShape.lineTo(0.5, -0.25);
        starShape.lineTo(0.75, -1);
        starShape.lineTo(0, -0.5);
        starShape.lineTo(-0.75, -1);
        starShape.lineTo(-0.5, -0.25);
        starShape.lineTo(-1, 0.25);
        starShape.lineTo(-0.25, 0.25);
        starShape.lineTo(0, 1);

        const extrudeSettings = {
            steps: 2,
            depth: 0.1,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelOffset: 0,
            bevelSegments: 1
        };
        const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
        const starMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 }); //yellow
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(0, 3.8, 0); // position to top of tree
        star.scale.set(0.2, 0.2, 0.2); //star size
        scene.add(star);

        // animation loop
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