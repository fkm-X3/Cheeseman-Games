/**
 * HybridRenderer.js - Three.js 3D backgrounds + Canvas 2D gameplay
 */

export class HybridRenderer {
    constructor(canvas, width, height) {
        this.canvas2D = canvas;
        this.ctx2D = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        
        // Create 3D canvas for background
        this.canvas3D = document.createElement('canvas');
        this.canvas3D.width = width;
        this.canvas3D.height = height;
        this.canvas3D.style.position = 'absolute';
        this.canvas3D.style.left = '0';
        this.canvas3D.style.top = '0';
        this.canvas3D.style.zIndex = '-1';
        this.canvas3D.style.pointerEvents = 'none';
        
        // Insert 3D canvas behind 2D canvas
        this.canvas2D.parentElement.insertBefore(this.canvas3D, this.canvas2D);
        
        // Three.js setup
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.objects3D = [];
        this.initialized = false;
        
        this.init3D();
    }

    init3D() {
        if (typeof THREE === 'undefined') {
            console.warn('[HybridRenderer] Three.js not loaded. 3D backgrounds disabled.');
            return false;
        }

        try {
            // Scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x0a0a0a);
            
            // Camera
            this.camera = new THREE.PerspectiveCamera(
                75,
                this.width / this.height,
                0.1,
                1000
            );
            this.camera.position.z = 5;
            
            // Renderer
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas3D,
                alpha: true,
                antialias: true,
            });
            this.renderer.setSize(this.width, this.height);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            
            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(5, 10, 5);
            this.scene.add(directionalLight);
            
            this.initialized = true;
            console.log('[HybridRenderer] Three.js initialized');
            
            // Create default background
            this.createDefaultBackground();
            
            return true;
        } catch (error) {
            console.error('[HybridRenderer] Failed to initialize Three.js:', error);
            return false;
        }
    }

    createDefaultBackground() {
        // Create a grid floor
        const gridHelper = new THREE.GridHelper(20, 20, 0x00BFFF, 0x333333);
        gridHelper.position.y = -2;
        this.scene.add(gridHelper);
        this.objects3D.push(gridHelper);
        
        // Create floating cubes in background
        const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        
        for (let i = 0; i < 20; i++) {
            const material = new THREE.MeshPhongMaterial({
                color: Math.random() * 0xffffff,
                emissive: 0x111111,
                transparent: true,
                opacity: 0.3,
            });
            
            const cube = new THREE.Mesh(cubeGeometry, material);
            cube.position.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10 - 5
            );
            cube.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            // Store rotation speeds
            cube.userData.rotationSpeed = {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02,
            };
            
            this.scene.add(cube);
            this.objects3D.push(cube);
        }
        
        // Create particles
        this.createParticleSystem();
    }

    createParticleSystem() {
        const particleCount = 500;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
            
            colors[i * 3] = Math.random();
            colors[i * 3 + 1] = Math.random();
            colors[i * 3 + 2] = Math.random();
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.userData.isParticles = true;
        this.scene.add(particles);
        this.objects3D.push(particles);
    }

    loadStage(stageData) {
        // Clear current objects
        this.clearBackground();
        
        // Load stage-specific 3D scene
        // TODO: Implement based on stageData
        console.log('[HybridRenderer] Loading stage:', stageData);
        
        this.createDefaultBackground();
    }

    clearBackground() {
        for (let obj of this.objects3D) {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        }
        this.objects3D = [];
    }

    update3D(deltaTime) {
        if (!this.initialized) return;
        
        // Animate background objects
        for (let obj of this.objects3D) {
            if (obj.userData.rotationSpeed) {
                obj.rotation.x += obj.userData.rotationSpeed.x;
                obj.rotation.y += obj.userData.rotationSpeed.y;
                obj.rotation.z += obj.userData.rotationSpeed.z;
            }
            
            if (obj.userData.isParticles) {
                obj.rotation.y += 0.001;
            }
        }
        
        // Subtle camera movement
        this.camera.position.x = Math.sin(Date.now() * 0.0001) * 0.5;
        this.camera.position.y = Math.cos(Date.now() * 0.00015) * 0.3;
    }

    render3D() {
        if (!this.initialized) return;
        this.renderer.render(this.scene, this.camera);
    }

    render2D(drawCallback) {
        // Clear 2D canvas
        this.ctx2D.clearRect(0, 0, this.width, this.height);
        
        // Call game's 2D rendering
        if (drawCallback) {
            drawCallback(this.ctx2D);
        }
    }

    render(draw2DCallback) {
        // Render 3D background
        this.render3D();
        
        // Render 2D gameplay on top
        this.render2D(draw2DCallback);
    }

    onResize(width, height) {
        this.width = width;
        this.height = height;
        
        // Update 2D canvas
        this.canvas2D.width = width;
        this.canvas2D.height = height;
        
        // Update 3D
        if (this.initialized) {
            this.canvas3D.width = width;
            this.canvas3D.height = height;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    }

    setBackgroundColor(color) {
        if (this.scene) {
            this.scene.background = new THREE.Color(color);
        }
    }

    setCameraShake(magnitude) {
        if (!this.initialized) return;
        
        this.camera.position.x += (Math.random() - 0.5) * magnitude;
        this.camera.position.y += (Math.random() - 0.5) * magnitude;
    }

    dispose() {
        this.clearBackground();
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.canvas3D && this.canvas3D.parentElement) {
            this.canvas3D.parentElement.removeChild(this.canvas3D);
        }
    }

    // Helper to add custom 3D objects
    add3DObject(object) {
        if (this.scene) {
            this.scene.add(object);
            this.objects3D.push(object);
        }
    }

    remove3DObject(object) {
        if (this.scene) {
            this.scene.remove(object);
            const index = this.objects3D.indexOf(object);
            if (index > -1) {
                this.objects3D.splice(index, 1);
            }
        }
    }
}
