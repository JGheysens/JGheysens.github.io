// import * as THREE from 'three';
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

class ARButton {

	static createButton( renderer, sessionInit = {} ) {

		const button = document.createElement( 'button' );

		function showStartAR( /*device*/ ) {

			if ( sessionInit.domOverlay === undefined ) {

				const overlay = document.createElement( 'div' );
				overlay.style.display = 'none';
				document.body.appendChild( overlay );

				const svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
				svg.setAttribute( 'width', 38 );
				svg.setAttribute( 'height', 38 );
				svg.style.position = 'absolute';
				svg.style.right = '20px';
				svg.style.top = '20px';
				svg.addEventListener( 'click', function () {

					currentSession.end();

				} );
				overlay.appendChild( svg );

				const path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
				path.setAttribute( 'd', 'M 12,12 L 28,28 M 28,12 12,28' );
				path.setAttribute( 'stroke', '#fff' );
				path.setAttribute( 'stroke-width', 2 );
				svg.appendChild( path );

				if ( sessionInit.optionalFeatures === undefined ) {

					sessionInit.optionalFeatures = [];

				}

				sessionInit.optionalFeatures.push( 'dom-overlay' );
				sessionInit.domOverlay = { root: overlay };

			}

			//

			let currentSession = null;

			async function onSessionStarted( session ) {

				session.addEventListener( 'end', onSessionEnded );

				renderer.xr.setReferenceSpaceType( 'local' );

				await renderer.xr.setSession( session );

				button.textContent = 'STOP AR';
				sessionInit.domOverlay.root.style.display = '';

				currentSession = session;

			}

			function onSessionEnded( /*event*/ ) {

				currentSession.removeEventListener( 'end', onSessionEnded );

				button.textContent = 'START AR';
				sessionInit.domOverlay.root.style.display = 'none';

				currentSession = null;

			}

			//

			button.style.display = '';

			button.style.cursor = 'pointer';
			button.style.left = 'calc(50% - 50px)';
			button.style.width = '100px';

			button.textContent = 'START AR';

			button.onmouseenter = function () {

				button.style.opacity = '1.0';

			};

			button.onmouseleave = function () {

				button.style.opacity = '0.5';

			};

			button.onclick = function () {

				if ( currentSession === null ) {

					navigator.xr.requestSession( 'immersive-ar', sessionInit ).then( onSessionStarted );

				} else {

					currentSession.end();

				}

			};

		}

		function disableButton() {

			button.style.display = '';

			button.style.cursor = 'auto';
			button.style.left = 'calc(50% - 75px)';
			button.style.width = '150px';

			button.onmouseenter = null;
			button.onmouseleave = null;

			button.onclick = null;

		}

		function showARNotSupported() {

			disableButton();

			button.textContent = 'AR NOT SUPPORTED';

		}

		function showARNotAllowed( exception ) {

			disableButton();

			console.warn( 'Exception when trying to call xr.isSessionSupported', exception );

			button.textContent = 'AR NOT ALLOWED';

		}

		function stylizeElement( element ) {

			element.style.position = 'absolute';
			element.style.bottom = '20px';
			element.style.padding = '12px 6px';
			element.style.border = '1px solid #fff';
			element.style.borderRadius = '4px';
			element.style.background = 'rgba(0,0,0,0.1)';
			element.style.color = '#fff';
			element.style.font = 'normal 13px sans-serif';
			element.style.textAlign = 'center';
			element.style.opacity = '0.5';
			element.style.outline = 'none';
			element.style.zIndex = '999';

		}

		if ( 'xr' in navigator ) {

			button.id = 'ARButton';
			button.style.display = 'none';

			stylizeElement( button );

			navigator.xr.isSessionSupported( 'immersive-ar' ).then( function ( supported ) {

				supported ? showStartAR() : showARNotSupported();

			} ).catch( showARNotAllowed );

			return button;

		} else {

			const message = document.createElement( 'a' );

			if ( window.isSecureContext === false ) {

				message.href = document.location.href.replace( /^http:/, 'https:' );
				message.innerHTML = 'WEBXR NEEDS HTTPS'; // TODO Improve message

			} else {

				message.href = 'https://immersiveweb.dev/';
				message.innerHTML = 'WEBXR NOT AVAILABLE';

			}

			message.style.left = 'calc(50% - 90px)';
			message.style.width = '180px';
			message.style.textDecoration = 'none';

			stylizeElement( message );

			return message;

		}

	}

}

let camera, scene, renderer;
let controller;
let plane1, plane2, plane3, plane4; // New variables for the planes
let planeMaterials; // Array to store materials for both planes
let listener, audio, audioFile;
let isplaying = false;

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