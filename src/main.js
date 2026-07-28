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


let updateArmIK = null;

loader.load("/models/final-room.glb", (glb)=>{
  const joints = {};

  glb.scene.traverse((child) => {
    if (!child.isMesh) return;
    const key = child.name === "base" ? "Base" : "Target";
    child.material = new THREE.MeshBasicMaterial({ map: loadedTextures.day[key]});

    if (["robot_base", "joint_1", "joint_2", "joint_3", "gripper"].includes(child.name)) {
      joints[child.name] = child;
    }
  });

  scene.add(glb.scene);

  const { robot_base: robotBase, joint_1: joint1, joint_2: joint2, joint_3: joint3, gripper } = joints;

  // Rest pose per joint — whatever tilt is already baked into the mesh — so the
  // driven rotation gets layered on top instead of overwriting it.
  const restQuaternion = {
    joint1: joint1.quaternion.clone(),
    joint2: joint2.quaternion.clone(),
    joint3: joint3.quaternion.clone(),
    gripper: gripper.quaternion.clone(),
  };

  const upperArmLength = joint2.getWorldPosition(new THREE.Vector3())
    .distanceTo(joint3.getWorldPosition(new THREE.Vector3()));
  const forearmLength = joint3.getWorldPosition(new THREE.Vector3())
    .distanceTo(gripper.getWorldPosition(new THREE.Vector3()));

  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  const ikTarget = new THREE.Vector3();

  // A plane facing the camera, passing through the robot's base — gives the mouse
  // a 3D point to aim at without needing to hit any actual geometry.
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);
  const targetPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
    cameraDirection,
    robotBase.getWorldPosition(new THREE.Vector3())
  );

  window.addEventListener("mousemove", (event) => {
    mouseNDC.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  const X_AXIS = new THREE.Vector3(1, 0, 0);
  const Y_AXIS = new THREE.Vector3(0, 1, 0);
  const _deltaQuat = new THREE.Quaternion();
  const _basePos = new THREE.Vector3();
  const _shoulderPos = new THREE.Vector3();
  const _toTarget = new THREE.Vector3();

  updateArmIK = () => {
    raycaster.setFromCamera(mouseNDC, camera);
    if (!raycaster.ray.intersectPlane(targetPlane, ikTarget)) return;

    // Joint 1: rotate about Y so the arm's vertical plane faces the target.
    robotBase.getWorldPosition(_basePos);
    const azimuth = Math.atan2(ikTarget.x - _basePos.x, ikTarget.z - _basePos.z);
    joint1.quaternion.copy(_deltaQuat.setFromAxisAngle(Y_AXIS, azimuth + Math.PI))
      .multiply(restQuaternion.joint1);
    joint1.updateWorldMatrix(true, true);

    // Joints 2 & 3: analytic 2-bone IK (law of cosines) in that vertical plane.
    joint2.getWorldPosition(_shoulderPos);
    _toTarget.copy(ikTarget).sub(_shoulderPos);
    const radial = Math.hypot(_toTarget.x, _toTarget.z);
    const height = _toTarget.y;
    const maxReach = upperArmLength + forearmLength - 0.001;
    const reach = Math.min(Math.hypot(radial, height), maxReach);

    const a = upperArmLength, b = forearmLength;
    const cosElbow = THREE.MathUtils.clamp((a * a + b * b - reach * reach) / (2 * a * b), -1, 1);
    const elbowBend = Math.PI - Math.acos(cosElbow);

    const cosShoulder = THREE.MathUtils.clamp((a * a + reach * reach - b * b) / (2 * a * reach), -1, 1);
    const shoulderOffset = Math.acos(cosShoulder);
    const elevation = Math.atan2(height, radial);
    const shoulderAngle = elevation + shoulderOffset;

    joint2.quaternion.copy(_deltaQuat.setFromAxisAngle(X_AXIS, shoulderAngle))
      .multiply(restQuaternion.joint2);
    joint3.quaternion.copy(_deltaQuat.setFromAxisAngle(X_AXIS, Math.PI - elbowBend))
      .multiply(restQuaternion.joint3);

    // Gripper: cancel the remaining pitch so it points straight at the target.
    const wristAngle = elevation - (shoulderAngle - (Math.PI - elbowBend));
    gripper.quaternion.copy(_deltaQuat.setFromAxisAngle(X_AXIS, wristAngle))
      .multiply(restQuaternion.gripper);
  };
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

  if (updateArmIK) updateArmIK();

  renderer.render( scene, camera );

  window.requestAnimationFrame(render);
}

render();