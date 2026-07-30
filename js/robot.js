import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector("#canvas-experience");
const container = canvas.parentElement;
const sizes = {
  width: container.clientWidth,
  height: container.clientHeight,
};

// Hidden until the model has loaded and the scene is fully assembled — revealed as
// one clean fade-in on the canvas itself (see loader.load below), rather than each
// object materializing visibly from nothing, or the room shell fading in on its own.
canvas.style.opacity = '0';

// Intro sequencing: on desktop, the panel starts visually centered on the screen
// (a transform, not a layout change, so the renderer's own sizing logic below is
// unaffected), the scene populates while centered, then it slides to its normal
// place in the layout. home.js waits for the "hero-scene-ready" event (or the
// window.__heroSceneReady flag, in case it fires before home.js attaches its
// listener) before fading the hero text in, so the two stay in sync. Mobile skips
// the centering/slide entirely — the flag/event fires immediately so the text
// fades in right away instead of waiting on the 3D scene at all.
const isMobile = window.matchMedia('(max-width: 768px)').matches;

function announceHeroSceneReady() {
  window.__heroSceneReady = true;
  document.dispatchEvent(new Event('hero-scene-ready'));
}

if (isMobile) {
  announceHeroSceneReady();
} else {
  container.addEventListener('transitionend', function onSlideDone(e) {
    if (e.propertyName !== 'transform') return;
    container.removeEventListener('transitionend', onSlideDone);
    announceHeroSceneReady();
  });

  // Measured after web fonts are ready rather than immediately — measuring while the
  // hero row is still mid-reflow (nav/hero text reshuffling as fonts swap in) throws
  // the "center" off by however much layout still had left to settle.
  document.fonts.ready.then(() => {
    const rect = container.getBoundingClientRect();
    const naturalCenterX = rect.left + rect.width / 2;
    const screenCenterX = window.innerWidth / 2;
    container.style.transform = `translateX(${screenCenterX - naturalCenterX}px)`;
  });
}

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
let updateAmbientAnimations = null;

loader.load("/models/final-room.glb", (glb)=>{
  const joints = {};
  // Everything textured as "Target" pops in on load, except the chair — it's always
  // there, it just swivels — and the whole robot chain, which pops in as its own
  // ordered sequence after this batch (see "Robot reveal" below), not alongside it.
  const ROBOT_NAMES = ["robot_base", "joint_1", "joint_2", "joint_3", "gripper"];
  const spawnMeshes = [];
  let chairBody = null;
  let minuteHand = null;
  let hourHand = null;

  glb.scene.traverse((child) => {
    if (!child.isMesh) return;
    const key = child.name === "base" ? "Base" : "Target";
    child.material = new THREE.MeshBasicMaterial({ map: loadedTextures.day[key]});

    if (ROBOT_NAMES.includes(child.name)) {
      joints[child.name] = child;
    }
    if (child.name === "chair_body") chairBody = child;
    if (child.name === "minute_hand") minuteHand = child;
    if (child.name === "hour_hand") hourHand = child;

    if (key === "Target" && child.name !== "chair_body" && !ROBOT_NAMES.includes(child.name)) {
      spawnMeshes.push(child);
    }
  });

  scene.add(glb.scene);

  // Reveal: the whole canvas fades in as one unit once the room is fully assembled
  // and ready (the base is already fully opaque, nothing needs its own material
  // fade) — decor/robot pop-in below happens after this, visibly, once the canvas
  // is showing.
  const CANVAS_FADE_DURATION = 700;
  canvas.style.transition = `opacity ${CANVAS_FADE_DURATION}ms ease`;
  requestAnimationFrame(() => {
    canvas.style.opacity = '1';
  });

  // Chair: a continuous swivel around its own resting orientation — it's excluded
  // from the spawn-in above, it's just always gently rotating.
  const chairRestRotationY = chairBody ? chairBody.rotation.y : 0;
  const CHAIR_SWIVEL_AMPLITUDE = THREE.MathUtils.degToRad(18);
  const CHAIR_SWIVEL_SPEED = 0.6; // radians/sec inside the sine, ~10s per full cycle
  const updateChairSwivel = () => {
    if (!chairBody) return;
    chairBody.rotation.y = chairRestRotationY
      + Math.sin(performance.now() / 1000 * CHAIR_SWIVEL_SPEED) * CHAIR_SWIVEL_AMPLITUDE;
  };

  // Clock hands: spin freely while the scene is still loading/popping in — a bit of
  // motion to look at rather than sitting still at the right time from frame one —
  // then ease into the viewer's actual current time once everything (decor + robot)
  // has finished appearing, and keep ticking live from there. Minute hand does a full
  // rotation every 60 minutes, hour hand every 12 hours — each includes the finer
  // component (seconds/minutes) so they sweep smoothly instead of jumping once a minute.
  const CLOCK_SPIN_SPEED = Math.PI * 2 * 1.1; // minute hand's radians/sec while spinning, ~1.1 rotations/sec
  const CLOCK_SETTLE_DURATION = 700;
  let clockSettled = false;
  let clockSettleStart = null;
  let clockSettleFromHour = 0;
  let clockSettleFromMinute = 0;
  const wrapNear = (from, to) => {
    let wrapped = to;
    while (wrapped - from > Math.PI) wrapped -= Math.PI * 2;
    while (wrapped - from < -Math.PI) wrapped += Math.PI * 2;
    return wrapped;
  };
  const updateClockHands = () => {
    if (!minuteHand && !hourHand) return;

    if (!(generalSpawnDone && robotSpawnDone)) {
      // Hour hand spins at 1/12th the minute hand's rate while loading — same ratio
      // as their real movement (a full minute-hand turn = 30° of hour-hand travel) —
      // so it still reads as a clock spinning up, not two hands moving in lockstep.
      const elapsed = performance.now() / 1000;
      if (minuteHand) minuteHand.rotation.z = elapsed * CLOCK_SPIN_SPEED;
      if (hourHand) hourHand.rotation.z = elapsed * (CLOCK_SPIN_SPEED / 12);
      return;
    }

    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;
    const targetHour = -(hours / 12) * Math.PI * 2;
    const targetMinute = -(minutes / 60) * Math.PI * 2;

    if (!clockSettled) {
      if (clockSettleStart === null) {
        clockSettleStart = performance.now();
        clockSettleFromHour = hourHand ? hourHand.rotation.z : 0;
        clockSettleFromMinute = minuteHand ? minuteHand.rotation.z : 0;
      }
      const t = THREE.MathUtils.clamp((performance.now() - clockSettleStart) / CLOCK_SETTLE_DURATION, 0, 1);
      const eased = easeOutBack(t);
      if (hourHand) hourHand.rotation.z = THREE.MathUtils.lerp(clockSettleFromHour, wrapNear(clockSettleFromHour, targetHour), eased);
      if (minuteHand) minuteHand.rotation.z = THREE.MathUtils.lerp(clockSettleFromMinute, wrapNear(clockSettleFromMinute, targetMinute), eased);
      if (t >= 1) clockSettled = true;
      return;
    }

    if (hourHand) hourHand.rotation.z = targetHour;
    if (minuteHand) minuteHand.rotation.z = targetMinute;
  };
  updateAmbientAnimations = () => {
    updateSpawnAnimation();
    updateChairSwivel();
    updateClockHands();
  };

  // Recenter the camera on the room's actual geometry instead of assuming world
  // origin is its visual center — it wasn't, which is what pushed the room toward
  // the top of the frame. Keeps the exact same viewing angle/distance (the offset
  // the camera was originally set up with), just re-anchored on the room's center.
  const roomCenter = new THREE.Box3().setFromObject(glb.scene).getCenter(new THREE.Vector3());
  camera.position.copy(roomCenter).add(cameraOffset);
  camera.lookAt(roomCenter);

  const { robot_base: robotBase, joint_1: joint1, joint_2: joint2, joint_3: joint3, gripper } = joints;

  // Rest pose per joint — whatever tilt is already baked into the mesh — so the
  // driven rotation gets layered on top instead of overwriting it.
  const restQuaternion = {
    joint1: joint1.quaternion.clone(),
    joint2: joint2.quaternion.clone(),
    joint3: joint3.quaternion.clone(),
    gripper: gripper.quaternion.clone(),
  };

  // Measured from the model's true (scale-1) geometry, before any spawn-in scaling
  // below touches it — measuring these afterward, while joint_1 (their common
  // ancestor) is scaled to 0, collapsed the whole arm to a single point and gave
  // near-zero lengths, which is what silently broke the IK math for joint_3 and
  // gripper (NaN downstream of a divide-by-near-zero) while joint_2 just looked
  // subtly wrong — that's the bug behind "only the base ever shows up."
  const upperArmLength = joint2.getWorldPosition(new THREE.Vector3())
    .distanceTo(joint3.getWorldPosition(new THREE.Vector3()));
  const forearmLength = joint3.getWorldPosition(new THREE.Vector3())
    .distanceTo(gripper.getWorldPosition(new THREE.Vector3()));

  // Spawn-in: everything starts at scale 0 and grows to full size, like it's
  // materializing into the room. A little overshoot (easeOutBack) reads as a "pop"
  // rather than a flat grow. Starts right as the canvas's own fade-in finishes, so
  // objects begin populating a room that's already visible rather than one still
  // fading in underneath them.
  const SPAWN_DELAY = CANVAS_FADE_DURATION;
  const spawnStart = performance.now() + SPAWN_DELAY;
  const easeOutBack = (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  // Ordered by whatever number is in each object's name (popup_1, popup_2, ...) so
  // they pop in that sequence rather than all at once — items with no number fall in
  // at the end, except the clock hands, which jump the queue to spawn in first.
  // Each one's own duration overlaps the next starting rather than waiting for the
  // previous to fully finish.
  const extractNumber = (name) => {
    if (name === "minute_hand" || name === "hour_hand") return -1;
    const match = name.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : Infinity;
  };
  const orderedSpawn = [...spawnMeshes].sort((a, b) => extractNumber(a.name) - extractNumber(b.name));
  const SPAWN_STAGGER = 90;
  const SPAWN_ITEM_DURATION = 700;
  orderedSpawn.forEach((mesh) => mesh.scale.setScalar(0));
  const generalBatchDuration = (orderedSpawn.length - 1) * SPAWN_STAGGER + SPAWN_ITEM_DURATION;

  // Robot reveal: the whole arm pops in as one ordered sequence — base, then each
  // joint down the chain, then the gripper — starting near the end of the general
  // room decor batch, so the robot still reads as appearing last, without ever
  // going fully still first. The general batch's very last item or two are still
  // mid-pop (and, thanks to the overshoot easing, visually settled well before their
  // programmatic finish) by the time the robot starts, so there's always something
  // visibly moving instead of a dead beat between "decor done" and "robot begins."
  const ROBOT_ORDER = ["robot_base", "joint_1", "joint_2", "joint_3", "gripper"];
  const orderedRobot = ROBOT_ORDER.map((name) => joints[name]).filter(Boolean);
  const ROBOT_STAGGER = 260;
  const ROBOT_ITEM_DURATION = 550;
  orderedRobot.forEach((mesh) => mesh.scale.setScalar(0));
  const ROBOT_OVERLAP = 500;
  const robotStart = spawnStart + generalBatchDuration - ROBOT_OVERLAP;

  let generalSpawnDone = false;
  let robotSpawnDone = false;
  let introComplete = false;
  const updateSpawnAnimation = () => {
    const now = performance.now();
    if (!generalSpawnDone) {
      let allDone = true;
      orderedSpawn.forEach((mesh, i) => {
        const t = THREE.MathUtils.clamp((now - (spawnStart + i * SPAWN_STAGGER)) / SPAWN_ITEM_DURATION, 0, 1);
        mesh.scale.setScalar(easeOutBack(t));
        if (t < 1) allDone = false;
      });
      if (allDone) generalSpawnDone = true;
    }
    if (!robotSpawnDone) {
      let allDone = true;
      orderedRobot.forEach((mesh, i) => {
        const t = THREE.MathUtils.clamp((now - (robotStart + i * ROBOT_STAGGER)) / ROBOT_ITEM_DURATION, 0, 1);
        mesh.scale.setScalar(easeOutBack(t));
        if (t < 1) allDone = false;
      });
      if (allDone) robotSpawnDone = true;
    }
    // Once everything has popped in, slide the (desktop-only) centered panel back to
    // its normal place in the layout — the transitionend listener set up above fires
    // announceHeroSceneReady() once this finishes, which is what unblocks home.js's
    // text fade-in. Mobile never centered in the first place, so it already announced
    // ready immediately and has nothing to slide.
    if (!introComplete && generalSpawnDone && robotSpawnDone && !isMobile) {
      introComplete = true;
      container.style.transition = 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)';
      requestAnimationFrame(() => {
        container.style.transform = 'translateX(0px)';
      });
    }
  };

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

  // Listens on the whole page (not just this panel) so the robot tracks the mouse
  // anywhere on the site — but the NDC itself is mapped against the canvas's own
  // bounding rect, not window dimensions. That keeps (0,0) aligned with where the
  // panel actually sits on screen; mapping against the full window instead made the
  // "reach" origin land near the page's horizontal center, nowhere near the robot's
  // actual visual position off to the side, which is what caused it to retreat/collapse
  // at the wrong point. NDC naturally goes outside ±1 once the mouse leaves the canvas
  // bounds — that's fine, the orthographic raycaster still produces a valid ray for it.
  window.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  });

  const X_AXIS = new THREE.Vector3(1, 0, 0);
  const Y_AXIS = new THREE.Vector3(0, 1, 0);
  const _targetQuat = new THREE.Quaternion();
  const _basePos = new THREE.Vector3();
  const _shoulderPos = new THREE.Vector3();
  const _toTarget = new THREE.Vector3();

  // Underdamped spring per joint instead of a plain ease — lets the motion briefly
  // overshoot its target and settle back, which reads as "alive" rather than just slow.
  // Lower stiffness/damping down the chain gives a cascading, whip-like lag.
  const SPRING = {
    joint1: { stiffness: 140, damping: 14 },
    joint2: { stiffness: 110, damping: 12 },
    joint3: { stiffness: 90, damping: 10 },
    gripper: { stiffness: 70, damping: 9 },
  };
  const springState = {
    joint1: { value: 0, velocity: 0 },
    joint2: { value: 0, velocity: 0 },
    joint3: { value: 0, velocity: 0 },
    gripper: { value: 0, velocity: 0 },
  };
  const springTowards = (state, target, dt, { stiffness, damping }) => {
    // Shortest-path wrap so azimuth doesn't spring the long way around when it crosses ±π.
    while (target - state.value > Math.PI) target -= Math.PI * 2;
    while (target - state.value < -Math.PI) target += Math.PI * 2;
    const accel = (target - state.value) * stiffness - state.velocity * damping;
    state.velocity += accel * dt;
    state.value += state.velocity * dt;
    return state.value;
  };
  let lastFrameTime = null;
  // Trying this out — scales the spring's own time step rather than its stiffness/damping,
  // so it slows the whole motion down uniformly without changing the overshoot character at
  // all (just stretches it out). Set back to 1 to revert.
  const TIME_SCALE = 0.45;
  // Last shoulder/elbow targets seen while the mouse was still at a comfortable distance —
  // held steady once the target crosses into the minimum-reach floor below, instead of
  // continuing to chase an increasingly unstable close-up elevation.
  const held = { shoulderApplied: 0, elbowApplied: Math.PI, elevation: 0 };

  updateArmIK = () => {
    raycaster.setFromCamera(mouseNDC, camera);
    if (!raycaster.ray.intersectPlane(targetPlane, ikTarget)) return;

    const now = performance.now();
    // Cap dt so a backgrounded tab resuming doesn't fling the spring across the room.
    const dt = (lastFrameTime === null ? 1 / 60 : Math.min((now - lastFrameTime) / 1000, 1 / 30)) * TIME_SCALE;
    lastFrameTime = now;

    // Joint 1: rotate about Y so the arm's vertical plane faces the target.
    robotBase.getWorldPosition(_basePos);
    const azimuth = Math.atan2(ikTarget.x - _basePos.x, ikTarget.z - _basePos.z);
    const azimuthSmoothed = springTowards(springState.joint1, azimuth + Math.PI, dt, SPRING.joint1);
    joint1.quaternion.copy(_targetQuat.setFromAxisAngle(Y_AXIS, azimuthSmoothed).multiply(restQuaternion.joint1));
    joint1.updateWorldMatrix(true, true);

    // Joints 2 & 3: analytic 2-bone IK (law of cosines) in that vertical plane.
    joint2.getWorldPosition(_shoulderPos);
    _toTarget.copy(ikTarget).sub(_shoulderPos);
    const radial = Math.hypot(_toTarget.x, _toTarget.z);
    const height = _toTarget.y;
    // No safety epsilon here — acos is steep near ±1, so even a tiny margin like "-0.001"
    // was enough to visibly miss true 180° at full extension. cosElbow's own clamp below
    // already guards against float rounding pushing reach infinitesimally past true max.
    const maxReach = upperArmLength + forearmLength;
    // A target at or beyond the arm's true physical reach reads as fully straight (matches
    // "the retreat point was good before, at maxReach"); a floor beneath that stops the arm
    // from folding in on itself when the mouse sits right on top of it — it holds its closest
    // comfortable pose instead and can still swing freely with joint 1.
    // Raised from the geometric minimum — the camera-facing target plane makes it hard to
    // mouse-target anything closer than roughly 0.37 of maxReach in practice, so a lower
    // floor here would never actually get crossed by real mouse movement.
    const MIN_REACH_FRACTION = 0.42;
    const rawReach = Math.hypot(radial, height);
    const reach = THREE.MathUtils.clamp(rawReach, maxReach * MIN_REACH_FRACTION, maxReach);

    const a = upperArmLength, b = forearmLength;
    const cosElbow = THREE.MathUtils.clamp((a * a + b * b - reach * reach) / (2 * a * b), -1, 1);
    const elbowBend = Math.PI - Math.acos(cosElbow);

    const cosShoulder = THREE.MathUtils.clamp((a * a + reach * reach - b * b) / (2 * a * reach), -1, 1);
    const shoulderOffset = Math.acos(cosShoulder);
    const elevation = Math.atan2(height, radial);

    // Experimental: clamp the shoulder's own elevation-tracking relative to true horizontal
    // (the XZ plane at its origin), not the raw target elevation — allowing a bit of dip below
    // it — and hand off whatever elevation it couldn't cover to the elbow instead. The triangle's
    // own shoulderOffset is added back unclamped since that's a real geometric necessity, not
    // part of the "aim" being limited. Note this means full straightness (180°) only holds when
    // the target's elevation is within this clamp too — beyond it the elbow legitimately has to
    // bend to cover what the shoulder can't, which isn't fixable without dropping the clamp itself.
    const SHOULDER_UP_LIMIT = THREE.MathUtils.degToRad(40);
    const SHOULDER_DOWN_LIMIT = THREE.MathUtils.degToRad(15);
    const elevationClamped = THREE.MathUtils.clamp(elevation, -SHOULDER_DOWN_LIMIT, SHOULDER_UP_LIMIT);
    const elevationDeficit = elevation - elevationClamped;
    const shoulderApplied = elevationClamped + shoulderOffset;
    const elbowApplied = (Math.PI - elbowBend) + elevationDeficit;

    // Only keep tracking the live target while still at or beyond the minimum-reach floor —
    // once inside it, freeze at whatever pose was last held there instead of continuing to
    // chase the target (elevation swings wildly at very close range, which read as the arm
    // folding in on itself). Joint 1 above is untouched by this and keeps rotating freely.
    if (rawReach >= maxReach * MIN_REACH_FRACTION) {
      held.shoulderApplied = shoulderApplied;
      held.elbowApplied = elbowApplied;
      held.elevation = elevation;
    }

    const shoulderSmoothed = springTowards(springState.joint2, held.shoulderApplied, dt, SPRING.joint2);
    joint2.quaternion.copy(_targetQuat.setFromAxisAngle(X_AXIS, shoulderSmoothed).multiply(restQuaternion.joint2));
    const elbowSmoothed = springTowards(springState.joint3, held.elbowApplied, dt, SPRING.joint3);
    joint3.quaternion.copy(_targetQuat.setFromAxisAngle(X_AXIS, elbowSmoothed).multiply(restQuaternion.joint3));

    // Gripper: cancel the remaining pitch so it points at the target — using the joints'
    // actual (spring-lagged) angles rather than their instantaneous targets, so it tracks
    // where the arm really is, not where it's still catching up to — plus a constant flip
    // since the mesh's own "front" faces backwards from that axis.
    const wristAngle = held.elevation - (shoulderSmoothed - elbowSmoothed) + Math.PI;
    const wristSmoothed = springTowards(springState.gripper, wristAngle, dt, SPRING.gripper);
    gripper.quaternion.copy(_targetQuat.setFromAxisAngle(X_AXIS, wristSmoothed).multiply(restQuaternion.gripper));
  };
});

const scene = new THREE.Scene();
// Shrunk along with the panel's own on-page size (see .hero-scene in styles.css) so the
// room keeps the same rendered size — this just crops the excess empty space around it
// rather than zooming the room itself in or out.
const frustumSize = 12;
// The isometric viewing angle/distance, applied as an offset from whatever point the
// camera is centered on — recentered onto the room's actual geometry once it loads below.
const cameraOffset = new THREE.Vector3(10, 5.5, 10);

const camera = new THREE.OrthographicCamera(
    frustumSize * (sizes.width / sizes.height) / -2,
    frustumSize * (sizes.width / sizes.height) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    1000
);


camera.position.copy(cameraOffset);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Sized off the panel it lives in, not the window — this scene is now an embedded
// element in the hero, not a full-page canvas.
function resizeToContainer() {
  sizes.width = container.clientWidth;
  sizes.height = container.clientHeight;
  if (sizes.width === 0 || sizes.height === 0) return;

  const aspect = sizes.width / sizes.height;
  camera.left = frustumSize * aspect / -2;
  camera.right = frustumSize * aspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

new ResizeObserver(resizeToContainer).observe(container);

const render = () => {

  if (updateArmIK) updateArmIK();
  if (updateAmbientAnimations) updateAmbientAnimations();

  renderer.render( scene, camera );

  window.requestAnimationFrame(render);
}

render();
