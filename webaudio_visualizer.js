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

let scene, camera, renderer, analyser, uniforms;

const startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', init );

function init() {

    const fftSize = 128;

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.xr.enabled = true;
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    document.body.appendChild(ARButton.createButton(renderer));

    const listener = new THREE.AudioListener();

    const audio = new THREE.Audio( listener );
    const file = './sounds/drums.mp3';

    if ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) {

        const loader = new THREE.AudioLoader();
        loader.load( file, function ( buffer ) {

            audio.setBuffer( buffer );
            audio.setLoop( true );
            audio.play();

        } );

    } else {

        const mediaElement = new Audio( file );
        mediaElement.play();
        mediaElement.loop = true;

        audio.setMediaElementSource( mediaElement );

    }

    camera.add( listener );

    analyser = new THREE.AudioAnalyser( audio, fftSize );

    //

    const format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;

    uniforms = {

        tAudioData: { value: new THREE.DataTexture( analyser.data, fftSize / 2, 1, format ) }

    };

    const material = new THREE.ShaderMaterial( {

        uniforms: uniforms,
        vertexShader: vertexShaderCode,
        fragmentShader: fragmentShaderCode

    } );

    const geometry = new THREE.PlaneGeometry( 1, 1 );

    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(-1, 0, -1); // Move the first plane to the left
    mesh.rotateY(Math.PI / 4); // Rotate the plane 45 degrees
    scene.add( mesh );

    //
    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    window.addEventListener( 'resize', onWindowResize );

    animate();

}

function onSelect() {
	const intersections = getIntersections(controller);
  
	if (intersections.length > 0) {
	  const intersectedObject = intersections[0].object;
  
	  // Pause and play the audio to trigger a restart
	  if (intersectedObject == plane1) {
		toggleAudio(audio1);
	  }
    }
  }

function toggleAudio(audio) {
if (isplaying) {
    audio.pause();
    isplaying = false;
} else {
    audio.play();
    isplaying = true;
}
}

function getIntersections(controller) {
	const tempMatrix = new THREE.Matrix4();
	const raycaster = new THREE.Raycaster();
	const intersections = [];
  
	// Update the raycaster with the controller's position and direction
	const controllerMatrix = controller.matrixWorld;
	raycaster.ray.origin.setFromMatrixPosition(controllerMatrix);
	raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix.identity().extractRotation(controllerMatrix));
  
	// Check for intersections with each plane
	const planes = [plane1, plane2, plane3, plane4];
	for (const plane of planes) {
	  const intersection = raycaster.intersectObject(plane);
	  if (intersection.length > 0) {
		intersections.push(intersection[0]);
	  }
	}
  
	return intersections;
  }

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    render();

}

function render() {

    analyser.getFrequencyData();

    uniforms.tAudioData.value.needsUpdate = true;

    renderer.render( scene, camera );

}