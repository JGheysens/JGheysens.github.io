// import * as THREE from 'three';
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

fftSize=128;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const listener = new THREE.AudioListener();

const audio = new THREE.Audio( listener );
const file = './sounds/drums.mp3';
const mediaElement = new Audio( file );
mediaElement.play();
audio.setMediaElementSource( mediaElement );

analyser = new THREE.AudioAnalyser( audio, fftSize );

    //

const format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;

uniforms = {

        tAudioData: { value: new THREE.DataTexture( analyser.data, fftSize / 2, 1, format ) }

};

    const material = new THREE.ShaderMaterial( {

        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent

    } );

    const geometry = new THREE.PlaneGeometry( 1, 1 );

    const mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
/* 
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube ); */

camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );

    

	/* cube.rotation.x += 0.01;
	cube.rotation.y += 0.01; */

	render();
}

function render() {

    analyser.getFrequencyData();

    uniforms.tAudioData.value.needsUpdate = true;

    renderer.render( scene, camera );

}
animate();
