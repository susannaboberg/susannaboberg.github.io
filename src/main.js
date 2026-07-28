import './style.scss'
import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector("#canvas-experience");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Loaders
const textureLoader = new THREE.TextureLoader();

// Model loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const textureMap = {
  Base: {
    day: "/textures/texture_bases_day.webp",
    night: ""
  },
  Target: {
    day: "/textures/texture_targets_day.webp",
    night: ""
  }
};

//after done loading, put in object
const loadedTextures = {
  day:{
  },
  night: {},
}

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;

  const nightTexture = textureLoader.load(paths.night)
  nightTexture.flipY = false;
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.night[key] = nightTexture;
  nightTexture.flipY = false;
});


loader.load("/models/final-room.glb", (glb)=>{
  glb.scene.traverse((child) => {
    if (!child.isMesh) return;
    const key = child.name === "base" ? "Base" : "Target";
    child.material = new THREE.MeshBasicMaterial({ map: loadedTextures.day[key]});
  
    scene.add(glb.scene); 
  });
});

const scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 20;

const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2, // left
    frustumSize * aspect / 2,  // right
    frustumSize / 2,           // top
    frustumSize / -2,          // bottom
    0.1,                       // near
    1000                       // far
);

camera.position.set(10, 5.5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

//Event Listeners
window.addEventListener("resize", ()=>{
  const aspect = window.innerWidth / window.innerHeight;
    
    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})

const axesHelper = new THREE.AxesHelper( 5 );
axesHelper.setColors(
    0xff0000, // X-axis hex (Red)
    0x00ff00, // Y-axis hex (Green)
    0x0000ff  // Z-axis hex (Blue)
);

scene.add(axesHelper);


const render = () => {

  renderer.render( scene, camera );

  window.requestAnimationFrame(render);
}

render();