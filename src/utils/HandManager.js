import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

class HandManager {
    constructor() {
        this.landmarker = null;
        this.video = null;
        this.lastVideoTime = -1;
        this.results = null;
        this.isReady = false;
        
        // Singleton instance
        if (HandManager.instance) {
            return HandManager.instance;
        }
        HandManager.instance = this;
    }

    async init() {
        if (this.isReady) return;

        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        this.landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numHands: 2
        });

        await this.setupCamera();
        this.isReady = true;
        this.loop();
    }

    async setupCamera() {
        this.video = document.createElement('video');
        this.video.style.display = 'none'; // hidden
        // video.style = "position: absolute; top: 0; left: 0; z-index: 10; width: 320px; height: 240px;"
        // document.body.appendChild(this.video);
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 1280,
                height: 720
            }
        });

        this.video.srcObject = stream;
        await this.video.play();
    }

    loop() {
        if (this.video && this.landmarker) {
            let startTimeMs = performance.now();
            if (this.lastVideoTime !== this.video.currentTime) {
                this.lastVideoTime = this.video.currentTime;
                this.results = this.landmarker.detectForVideo(this.video, startTimeMs);
            }
        }
        requestAnimationFrame(() => this.loop());
    }

    getResults() {
        return this.results;
    }
    
    // Helper to get normalized coordinates of index finger tip
    getHandData() {
        if (!this.results || !this.results.landmarks || this.results.landmarks.length === 0) return null;
        
        const hand = this.results.landmarks[0];
        const indexTip = hand[8];
        const thumbTip = hand[4];
        
        // Calculate pinch distance
        const dx = indexTip.x - thumbTip.x;
        const dy = indexTip.y - thumbTip.y;
        const dz = indexTip.z - thumbTip.z;
        const pinchDist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        const isPinching = pinchDist < 0.05; // Threshold
        
        return {
            x: 1.0 - indexTip.x, // Mirror x
            y: 1.0 - indexTip.y,
            isPinching,
            pinchDist,
            rawX: indexTip.x,
            rawY: indexTip.y
        };
    }
}

export default new HandManager();
