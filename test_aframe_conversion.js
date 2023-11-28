// import * as THREE from 'three';
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

let scene, camera, renderer, analyser, numCubes, cubes;

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', init);

function init() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

  cubes = [];
  numCubes = 128;

  for (let i = 0; i < numCubes; i++) {
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = i * 1.2;
    scene.add(cube);
    cubes.push(cube);
  }

  camera.position.z = 5;

  const listener = new THREE.AudioListener();
  const audio = new THREE.Audio(listener);
  const loader = new THREE.AudioLoader();
  loader.load('./sounds/drums.mp3', function (buffer) {
    audio.setBuffer(buffer);
    audio.setLoop(true);
    audio.setVolume(0.5);
  });
  audio.play();

  camera.add(listener);
  scene.add(camera);

  camera.position.z = 5;

  analyser = new THREE.AudioAnalyser(audio1, 256);

  animate();
}



function animate() {
    requestAnimationFrame(animate);
  const dataArray = analyser.getFrequencyData();

  for (let i = 0; i < numCubes; i++) {
    const scaleValue = dataArray[i] / 255;
    cubes[i].scale.y = Math.max(0.1, scaleValue * 5);
    cubes[i].material.color.setHSL(scaleValue, 1, 0.5);
  }
  render();
}

function render() {
  renderer.render(scene, camera);
}
