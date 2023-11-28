// import * as THREE from 'three';
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

let camera, scene, renderer;

init();
animate();

function init() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a cube geometry and material for visualization
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

// Create an array to hold cubes
const cubes = [];
const numCubes = 128; // Adjust this based on your needs

for (let i = 0; i < numCubes; i++) {
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = i * 1.2; // Adjust spacing between cubes
  scene.add(cube);
  cubes.push(cube);
}

// Create an AudioListener
const listener = new THREE.AudioListener();

// Function to create an audio object, load an audio file, and set properties
function createAudioObject(file, loop = true, volume = 0.5) {
  const audio = new THREE.Audio(listener);
  const loader = new THREE.AudioLoader();

  loader.load(file, function (buffer) {
    audio.setBuffer(buffer);
    audio.setLoop(loop);
    audio.setVolume(volume);
    audio.play(); // Start playing the audio immediately
  });

  return audio;
}

// Audio files
const audioFiles = [
  './sounds/drums.mp3',
  './sounds/beat_music.mp3',
  './sounds/piano_music.mp3',
  './sounds/relax_music.mp3'
];

// Create audio objects using the function
const audioObjects = audioFiles.map(file => createAudioObject(file));

// Assign audio objects to individual variables
const [audio1, audio2, audio3, audio4] = audioObjects;

// Attach the AudioListener to the camera
camera.add(listener);
scene.add(camera);

// Set the camera position
camera.position.z = 5;

// Create an AudioAnalyser
const analyser = new THREE.AudioAnalyser(audio1, 256); // Adjust fftSize based on your needs

}

function animate() {
  // Get frequency data
  const dataArray = analyser.getFrequencyData();

  // Update cube scales based on frequency data
  for (let i = 0; i < numCubes; i++) {
    const scaleValue = dataArray[i] / 255; // Normalize to [0, 1]
    cubes[i].scale.y = Math.max(0.1, scaleValue * 5); // Adjust scaling factor
    cubes[i].material.color.setHSL(scaleValue, 1, 0.5); // Adjust color based on frequency
  }

  // Render the scene
  render();

  // Call animate recursively on the next frame
  requestAnimationFrame(animate);
}

function render() {
  renderer.render(scene, camera);
}