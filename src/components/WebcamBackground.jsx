import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import HandManager from '../utils/HandManager';

const WebcamBackground = () => {
    const { viewport, gl } = useThree();
    const textureRef = useRef(null);
    const videoRef = useRef(null);

    useEffect(() => {
        // Use the video element from HandManager if available, or wait for it
        const checkVideo = setInterval(() => {
            if (HandManager.video && HandManager.video.readyState === 4) {
                videoRef.current = HandManager.video;
                textureRef.current = new THREE.VideoTexture(HandManager.video);
                textureRef.current.colorSpace = THREE.SRGBColorSpace;
                clearInterval(checkVideo);
            }
        }, 100);
        return () => clearInterval(checkVideo);
    }, []);

    const fragmentShader = `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        
        void main() {
            vec2 uv = vUv;
            // Mirror x
            uv.x = 1.0 - uv.x;
            
            vec4 color = texture2D(uTexture, uv);
            
            // Stylize: Darken and Desaturate slightly
            float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
            vec3 grayColor = vec3(gray);
            
            // Mix original with gray for a "cinematic" look
            vec3 finalColor = mix(grayColor, color.rgb, 0.5);
            
            // Darken background to let particles pop
            finalColor *= 0.3; 
            
            // Scanline effect
            float scanline = sin(uv.y * 800.0) * 0.04;
            finalColor -= scanline;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    return (
        <mesh position={[0, 0, -5]}>
             <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
             <shaderMaterial
                uniforms={{
                    uTexture: { value: null } // Updated in useFrame potentially or auto by Three? VideoTexture updates automatically.
                }}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                depthWrite={false}
             >
                {/* We attach texture manually via uniform updates if needed, but ShaderMaterial uniforms can hold textures */}
                {/* Actually with R3F we can just attach transparently if we bind it */}
             </shaderMaterial>
        </mesh>
    );
};

// Actually, passing ref to shaderMaterial uniforms is tricky declaratively without a ref to the uniforms object.
// Let's use a simpler approach with <meshBasicMaterial> map={texture} if we didn't want the shader,
// but for the shader we need to attach the texture.

const WebcamBackgroundShader = () => {
    const { viewport } = useThree();
    const materialRef = useRef();
    
    useEffect(() => {
        const checkVideo = setInterval(() => {
             if (HandManager.video && HandManager.video.readyState >= 2) {
                 const texture = new THREE.VideoTexture(HandManager.video);
                 texture.colorSpace = THREE.SRGBColorSpace;
                 if (materialRef.current) {
                     materialRef.current.uniforms.uTexture.value = texture;
                 }
                 clearInterval(checkVideo);
             }
        }, 500);
        return () => clearInterval(checkVideo);
    }, []);

    return (
        <mesh position={[0, 0, -10]}> 
            {/* Plane covers screen. at z=-10, visual size needs to be big. 
                Viewport width/height is at z=0. 
                We can just use viewport and scale it up or put it locally.
            */}
            <planeGeometry args={[viewport.width * 3, viewport.height * 3]} /> 
            <shaderMaterial
                ref={materialRef}
                uniforms={{
                    uTexture: { value: new THREE.Texture() } 
                }}
                vertexShader={`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `}
                fragmentShader={`
                    uniform sampler2D uTexture;
                    varying vec2 vUv;
                    
                    void main() {
                        vec2 uv = vUv;
                        uv.x = 1.0 - uv.x; // Mirror
                        
                        vec4 tex = texture2D(uTexture, uv);
                        
                        // Cyberpunk/Hi-tech grid overlay
                        // ...
                        
                        // Simple darkened look
                        vec3 color = tex.rgb * 0.2; 
                        
                        gl_FragColor = vec4(color, 1.0);
                    }
                `}
                depthTest={false}
                depthWrite={false}
            />
        </mesh>
    );
};

export default WebcamBackgroundShader;
