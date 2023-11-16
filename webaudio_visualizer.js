import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// Shader code as strings
const vertexShaderCode = `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

const fragmentShaderCode = `
    uniform sampler2D tAudioData;
    varying vec2 vUv;

    void main() {
        vec3 backgroundColor = vec3(0.125, 0.125, 0.125);
        vec3 color = vec3(1.0, 1.0, 0.0);

        float f = texture2D(tAudioData, vec2(vUv.x, 0.0)).r;

        float i = step(vUv.y, f) * step(f - 0.0125, vUv.y);

        gl_FragColor = vec4(mix(backgroundColor, color, i), 1.0);
    }
`;

const fftSize = 128;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Assuming you have an HTML element with id 'overlay'
const overlay = document.getElementById('overlay');
overlay.remove();

// Assuming you have an HTML element with id 'container'
const container = document.getElementById('container');

const listener = new THREE.AudioListener();
const audio = new THREE.Audio(listener);
const file = './sounds/drums.mp3';
const mediaElement = new Audio(file);
mediaElement.play();
audio.setMediaElementSource(mediaElement);

const analyser = new THREE.AudioAnalyser(audio, fftSize);

// Use 'let' to declare variables
let uniforms = {
    tAudioData: { value: new THREE.DataTexture(analyser.data, fftSize / 2, 1, THREE.RedFormat) }
};

// Shader material with inline shader code
/* const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShaderCode,
    fragmentShader: fragmentShaderCode
}); */
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const geometry = new THREE.PlaneGeometry(5, 5); // Increase the size of the plane

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

camera.position.z = 5;

function render() {
    analyser.getFrequencyData();
    uniforms.tAudioData.value.needsUpdate = true;
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

animate();
