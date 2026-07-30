/**
 * 3D Matrix Visualization using Three.js
 * Renders matrix values as 3D bar towers with animations
 */

class Matrix3DVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.matrixGroup = null;
        this.gridHelper = null;
        this.animationId = null;
        this.isInitialized = false;
        this.values = [];
        this.rows = 0;
        this.cols = 0;
        this.barMeshes = [];
        this.animating = false;
        this.targetRotations = { x: 0, y: 0 };
    }

    init() {
        if (this.isInitialized) return;
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent

        // Camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(6, 5, 8);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        // OrbitControls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
        this.controls.minDistance = 4;
        this.controls.maxDistance = 20;
        this.controls.target.set(0, 0, 0);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0x6C63FF, 0.4);
        fillLight.position.set(-5, 3, -5);
        this.scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0x00D4FF, 0.3);
        rimLight.position.set(0, -5, 5);
        this.scene.add(rimLight);

        // Grid floor (decorative)
        this.gridHelper = new THREE.Group();
        
        const gridGeometry = new THREE.PlaneGeometry(12, 12);
        const gridMaterial = new THREE.MeshBasicMaterial({
            color: 0x6C63FF,
            wireframe: true,
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide
        });
        const grid = new THREE.Mesh(gridGeometry, gridMaterial);
        grid.rotation.x = -Math.PI / 2;
        grid.position.y = -2.5;
        this.gridHelper.add(grid);

        // Circular glow under grid
        const glowGeometry = new THREE.RingGeometry(2, 5, 64);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x6C63FF,
            transparent: true,
            opacity: 0.05,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = -2.4;
        this.gridHelper.add(glow);

        this.scene.add(this.gridHelper);

        // Matrix group
        this.matrixGroup = new THREE.Group();
        this.scene.add(this.matrixGroup);

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());

        this.isInitialized = true;
        this.animate();
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        if (!this.container) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * Visualize a 2D matrix as 3D bars
     */
    visualizeMatrix(matrix) {
        if (!this.isInitialized) this.init();

        // Clear existing bars with animation
        this.clearBars(() => {
            this.buildBars(matrix);
        });
    }

    clearBars(callback) {
        if (this.barMeshes.length === 0) {
            if (callback) callback();
            return;
        }

        let completed = 0;
        const total = this.barMeshes.length;
        
        this.barMeshes.forEach((mesh, index) => {
            const targetY = -2.5;
            const startY = mesh.position.y;
            const duration = 300;
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                
                mesh.position.y = startY + (targetY - startY) * eased;
                mesh.material.opacity = 1 - eased;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.matrixGroup.remove(mesh);
                    if (mesh.geometry) mesh.geometry.dispose();
                    if (mesh.material) mesh.material.dispose();
                    completed++;
                    if (completed === total) {
                        this.barMeshes = [];
                        if (callback) callback();
                    }
                }
            };
            requestAnimationFrame(animate);
        });
    }

    buildBars(matrix) {
        this.values = matrix;
        this.rows = matrix.length;
        this.cols = matrix[0] ? matrix[0].length : 0;
        
        if (this.rows === 0 || this.cols === 0) return;

        // Find min/max for color mapping
        let minVal = Infinity, maxVal = -Infinity;
        matrix.forEach(row => {
            row.forEach(val => {
                if (val < minVal) minVal = val;
                if (val > maxVal) maxVal = val;
            });
        });
        
        // Avoid division by zero
        const range = maxVal - minVal || 1;
        
        const spacing = 1.2;
        const offsetX = (this.cols - 1) * spacing / 2;
        const offsetZ = (this.rows - 1) * spacing / 2;
        
        this.barMeshes = [];

        matrix.forEach((row, i) => {
            row.forEach((val, j) => {
                const normalizedVal = (val - minVal) / range;
                const height = Math.max(0.1, Math.abs(val) * 0.5 + 0.2);
                const x = j * spacing - offsetX;
                const z = i * spacing - offsetZ;
                
                // Color based on value
                const color = new THREE.Color();
                const hue = 0.65 - normalizedVal * 0.4; // blue to purple
                color.setHSL(hue, 0.8, 0.4 + normalizedVal * 0.4);
                
                // Bar geometry
                const geometry = new THREE.BoxGeometry(0.6, height, 0.6);
                const material = new THREE.MeshPhysicalMaterial({
                    color: color,
                    metalness: 0.1,
                    roughness: 0.3,
                    transparent: true,
                    opacity: 0,
                    clearcoat: 0.3,
                    clearcoatRoughness: 0.4,
                    emissive: color,
                    emissiveIntensity: 0.1
                });
                
                const bar = new THREE.Mesh(geometry, material);
                bar.castShadow = true;
                bar.position.set(x, -2.5, z); // Start from below
                this.matrixGroup.add(bar);
                
                // Add wireframe outline
                const edges = new THREE.EdgesGeometry(geometry);
                const edgeMaterial = new THREE.LineBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.3
                });
                const wireframe = new THREE.LineSegments(edges, edgeMaterial);
                bar.add(wireframe);
                
                // Animate bar rising up
                const targetY = height / 2 - 2.0;
                const startY = -2.5;
                const delay = (i * this.cols + j) * 50;
                const duration = 500;
                const startTime = performance.now() + delay;
                
                const animate = (currentTime) => {
                    if (currentTime < startTime) {
                        requestAnimationFrame(animate);
                        return;
                    }
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    
                    bar.position.y = startY + (targetY - startY) * eased;
                    bar.material.opacity = eased;
                    bar.scale.y = 0.5 + eased * 0.5;
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        bar.position.y = targetY;
                        bar.material.opacity = 1;
                        bar.scale.y = 1;
                    }
                };
                requestAnimationFrame(animate);
                
                // Value label (floating above bar)
                const labelGeometry = new THREE.SphereGeometry(0.08, 8, 8);
                const labelMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0
                });
                const label = new THREE.Mesh(labelGeometry, labelMaterial);
                label.position.set(x, height / 2 - 1.5, z);
                this.matrixGroup.add(label);
                
                // Animate label appearing
                setTimeout(() => {
                    label.material.opacity = 0.8;
                }, delay + duration + 100);
                
                this.barMeshes.push(bar);
            });
        });
        
        // Auto-rotate on new data
        this.controls.autoRotate = true;
        setTimeout(() => {
            this.controls.autoRotate = false;
        }, 4000);
    }

    /**
     * Visualize a vector (e.g., eigenvalues)
     */
    visualizeVector(vector) {
        if (!Array.isArray(vector)) return;
        const matrix = vector.map(v => [v]);
        this.visualizeMatrix(matrix);
    }

    /**
     * Visualize scalar result
     */
    visualizeScalar(value) {
        if (!this.isInitialized) this.init();
        this.clearBars(() => {
            const color = new THREE.Color();
            const normalizedVal = (value + 10) / 20; // Rough normalization
            color.setHSL(0.65 - Math.min(1, Math.max(0, normalizedVal)) * 0.4, 0.8, 0.6);
            
            const geometry = new THREE.SphereGeometry(0.8, 32, 32);
            const material = new THREE.MeshPhysicalMaterial({
                color: color,
                metalness: 0.3,
                roughness: 0.2,
                transparent: true,
                opacity: 0,
                emissive: color,
                emissiveIntensity: 0.2,
                clearcoat: 0.5
            });
            
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(0, -2.5, 0);
            this.matrixGroup.add(sphere);
            
            // Animate
            const targetY = 0;
            const startTime = performance.now();
            const duration = 600;
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                
                sphere.position.y = -2.5 + (targetY + 2.5) * eased;
                sphere.material.opacity = eased;
                sphere.scale.setScalar(0.3 + eased * 0.7);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
            
            this.barMeshes.push(sphere);
        });
    }

    /** Visualize SVD components */
    visualizeSVD(svdData) {
        // Just show U matrix
        if (svdData.U) {
            this.visualizeMatrix(svdData.U);
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
        this.isInitialized = false;
    }

    /** Reset camera to default view */
    resetView() {
        this.camera.position.set(6, 5, 8);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }
}
