// import * as THREE from 'three';
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

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

const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
});

const geometry = new THREE.PlaneGeometry(2, 2); // Increase the size of the plane

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