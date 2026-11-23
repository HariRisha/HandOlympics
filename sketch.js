// Ml5
let capture;
let handPose;
let hands = [];

// Matter.js
let Engine = Matter.Engine;
let World = Matter.World;
let Bodies = Matter.Bodies;

// outlines
let leftHandImg;
let rightHandImg;

// Stickman
let stickman1 = {};
let stickman2 = {};

let engine;
let world;
let ground;
let leftWall;
let rightWall;
let ceeling;

let mode = "basketball";

function preload() {
  handPose = ml5.handPose({ modelPath: "./ml5-models/handpose", flipped: true });
  
  leftHandImg = loadImage("assets/hand_trace_left.png");
  rightHandImg = loadImage("assets/hand_trace_right.png");
}

function setup() {
  createCanvas(640, 480);

  // start cam capture
  capture = createCapture(VIDEO, { flipped: true });
  capture.hide();

  handPose.detectStart(capture, gotHands);
  engine = Engine.create();
  world = engine.world;

  if (mode === "basketball") {
    setupBasketball(world, stickman1, stickman2);
  } else if (mode === "football") {
    setupFootball(world, stickman1, stickman2);
  } else if (mode === "fencing") {
    setupFencing(world, stickman1, stickman2);
  }

  // gravity
  engine.world.gravity.y = 1;

  // floor
  ground = Bodies.rectangle(width / 2, height - 20, width, 40, {
    isStatic: true,
  });

  // left wall
  leftWall = Bodies.rectangle(width - 20, height / 2, 40, height, {
    isStatic: true,
  });

  // right wall
  rightWall = Bodies.rectangle(0, height / 2, 40, height, {
    isStatic: true,
  });

  // ceeling
  ceeling = Bodies.rectangle(0, 0, width, 80, {
    isStatic: true,
  });

  World.add(world, [ground, leftWall, rightWall, ceeling]);
  createStickman(stickman1, width * 0.3);
  createStickman(stickman2, width * 0.7);
  
  stickman1.hairColor = color(20);
  stickman2.hairColor = color(200, 150, 50);
}

function draw() {
  // draw the webcam and make it semi transparent 
  drawEnvironment();
  tint(255, 80);
  image(capture, 0, 0);
  noTint();
  
  // hand guides if hands are missing
  if (hands.length < 2) {
  drawHandGuides();
}
  
  drawLights();

  fill(0, 255, 200);
  noStroke();

  Engine.update(engine);

  // determin if hand is left or right
  let hand1 = null;
  let hand2 = null;

  if (hands.length >= 2) {
    let sortedHands = hands.slice().sort((a, b) => {
      return a.keypoints[0].x - b.keypoints[0].x;
    });

    hand1 = sortedHands[0];
    hand2 = sortedHands[1];
  }

  // fingertips markers
  let tips = [4, 8, 12, 16, 20];

  for (let hand of hands) {
    for (let i of tips) {
      let kp = hand.keypoints[i];
      circle(kp.x, kp.y, 15);
    }
  }

  if (mode === "basketball") {
    updateBasketball();
    drawBasketball();
  } else if (mode === "football") {
    updateFootball();
    drawFootball();
  } else if (mode === "fencing") {
    updateFencing(stickman1, stickman2);
    drawFencing();
  }

  // control stickmen body
  updateBodyControl(stickman1, hand1);
  updateBodyControl(stickman2, hand2);

  // control stickemn limbs
  updateLimbControls(stickman1, hand1);
  updateLimbControls(stickman2, hand2);

  // draw the stickmen
  drawStickman(stickman1);
  drawStickman(stickman2);
}

function gotHands(results) {
  hands = results;
}

function drawEnvironment() {
  if (mode === "basketball") {
    drawBasketballCourt();
  } else if (mode === "football") {
    drawFootballField();
  } else if (mode === "fencing") {
    drawFencingStrip();
  }
}

function createStickman(s, xOffset) {
  let x = xOffset;
  let y = height - 180;

  // Body parts
  s.head = Bodies.circle(x, y, 15, { friction: 0.8 });

  s.body = Bodies.rectangle(x, y + 50, 10, 80, { friction: 0.8 });
  
  // rotate body vertically 
  Matter.Body.setAngle(s.body, Math.PI / 2);

  // create limbs
  s.leftArm = Bodies.rectangle(x - 40, y + 40, 60, 8, { friction: 0.8 });
  s.rightArm = Bodies.rectangle(x + 40, y + 40, 60, 8, {
    friction: 0.8,
  });

  s.leftLeg = Bodies.rectangle(x - 15, y + 120, 60, 8, {
    friction: 0.8,
  });
  s.rightLeg = Bodies.rectangle(x + 15, y + 120, 60, 8, {
    friction: 0.8,
  });

  World.add(world, [
    s.head,
    s.body,
    s.leftArm,
    s.rightArm,
    s.leftLeg,
    s.rightLeg,
  ]);

  // connecting parts with joints
  let joints = [
    // Neck
    Matter.Constraint.create({
      bodyA: s.head,
      bodyB: s.body,
      pointA: { x: 0, y: 15 },
      pointB: { x: 0, y: -40 },
      length: 0,
      stiffness: 0.9,
    }),

    // Left arm
    Matter.Constraint.create({
      bodyA: s.body,
      bodyB: s.leftArm,
      pointA: { x: 0, y: -30 },
      pointB: { x: 30, y: 0 },
      length: 0,
      stiffness: 0.6,
    }),

    // Right arm
    Matter.Constraint.create({
      bodyA: s.body,
      bodyB: s.rightArm,
      pointA: { x: 0, y: -30 },
      pointB: { x: -30, y: 0 },
      length: 0,
      stiffness: 0.9,
    }),

    // Left leg
    Matter.Constraint.create({
      bodyA: s.body,
      bodyB: s.leftLeg,
      pointA: { x: 0, y: 40 },
      pointB: { x: 30, y: 0 },
      length: 0,
      stiffness: 0.9,
    }),

    // Right leg
    Matter.Constraint.create({
      bodyA: s.body,
      bodyB: s.rightLeg,
      pointA: { x: 0, y: 40 },
      pointB: { x: -30, y: 0 },
      length: 0,
      stiffness: 0.9,
    }),
  ];

  World.add(world, joints);

  // hair physics feature
  s.hair = [];

  let offsets = [-10, -5, 0, 5, 10]; // positions across the head

  for (let offset of offsets) {
    let strand = [];
    let prev = s.head;

    for (let i = 0; i < 3; i++) {
      // create hair particles
      let part = Bodies.circle(x + offset, y - 20 - i * 8, 4, {
        frictionAir: 0.1,
      });

      strand.push(part);

      // connect stranded pieces
      let constraint = Matter.Constraint.create({
        bodyA: prev,
        bodyB: part,
        pointA: i === 0 ? { x: offset, y: -15 } : { x: 0, y: 0 },
        length: 6,
        stiffness: 0.6,
      });

      World.add(world, [part, constraint]);

      prev = part;
    }

    s.hair.push(strand);
  }
}

function keyPressed() {
  if (key === "1") {
    mode = "basketball";
    resetWorld();
    setupBasketball(world, stickman1, stickman2);
  }
  if (key === "2") {
    mode = "football";
    resetWorld();
    setupFootball(world, stickman1, stickman2);
  }
  if (key === "3") {
    mode = "fencing";
    resetWorld();
    setupFencing(world);
  }
}

function drawStickman(s) {
  stroke(0);
  strokeWeight(4);

  // Head
  fill(255);
  ellipse(s.head.position.x, s.head.position.y, 30);

  // Body + limbs
  drawBone(s.body);
  drawBone(s.leftArm);
  drawBone(s.rightArm);
  drawBone(s.leftLeg);
  drawBone(s.rightLeg);

  // draw hair
  stroke(s.hairColor || 30);
  strokeWeight(3);

  for (let strand of s.hair) {
    for (let i = 0; i < strand.length - 1; i++) {
      let a = strand[i];
      let b = strand[i + 1];
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
  }
}

function drawBone(body) {
  push();
  // move drawing origins to the bodys position
  translate(body.position.x, body.position.y);
  rotate(body.angle);

  // draw lines representing limbs
  // endpoints are calculated using the bodys bounds
  // so the line is full length of rectangle body
  line(
    -body.bounds.max.x + body.position.x,
    0,
    body.bounds.max.x - body.position.x,
    0
  );

  pop();
}

function updateBodyControl(s, hand) {
  if (!hand) return;

  let middle = hand.keypoints[12];

  let targetX = middle.x;
  let targetY = middle.y + 200;

  let newX = lerp(s.body.position.x, targetX, 0.35);
  let newY = lerp(s.body.position.y, targetY, 0.25);

  Matter.Body.setPosition(s.body, { x: newX, y: newY });

  // stabilize
  Matter.Body.setVelocity(s.body, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(s.body, 0);

  // keep upright
  Matter.Body.setAngle(s.body, Math.PI / 2);

  stroke(255, 0, 0);
  line(middle.x, middle.y, newX, newY);
}

function updateLimbControls(s, hand) {
  if (!hand) return;

  let isLeftHand = hand.handedness === "Left";

  // Thumb
  let thumb = hand.keypoints[4];
  let normThumb = map(thumb.y, 100, height - 150, 0, 1);
  normThumb = constrain(normThumb, 0, 1);

  // Pinky
  let pinky = hand.keypoints[20];
  let normPinky = map(pinky.y, 100, height - 150, 0, 1);
  normPinky = constrain(normPinky, 0, 1);

  // Ring
  let ring = hand.keypoints[8];
  let normRing = map(ring.y, 150, height - 150, 0, 1);
  normRing = constrain(normRing, 0, 1);

  // Index
  let index = hand.keypoints[16];
  let normIndex = map(index.y, 150, height - 150, 0, 1);
  normIndex = constrain(normIndex, 0, 1);

  let targetAngleL, targetAngleR, targetAngleLL, targetAngleRL;

  // finger controls for body parts
  // swapped controls for different hands
  if (isLeftHand) {
    targetAngleL = map(normPinky, 0, 1, PI / 2, -PI / 2);
    targetAngleR = map(normThumb, 0, 1, -PI / 2, PI / 2);
    targetAngleLL = map(normIndex, 0, 1, -PI / 2.5, PI / 2.5);
    targetAngleRL = map(normRing, 0, 1, PI / 2.5, -PI / 2.5);
  } else {
    targetAngleL = map(normThumb, 0, 1, PI / 2, -PI / 2);
    targetAngleR = map(normPinky, 0, 1, -PI / 2, PI / 2);
    targetAngleLL = map(normRing, 0, 1, -PI / 2.5, PI / 2.5);
    targetAngleRL = map(normIndex, 0, 1, PI / 2.5, -PI / 2.5);
  }

  // use lerp for smoother more natrual movement instead of snapping limbs instantly
  Matter.Body.setAngle(s.leftArm, lerp(s.leftArm.angle, targetAngleL, 0.3));
  Matter.Body.setAngle(s.rightArm, lerp(s.rightArm.angle, targetAngleR, 0.3));
  Matter.Body.setAngle(s.leftLeg, lerp(s.leftLeg.angle, targetAngleLL, 0.4));
  Matter.Body.setAngle(s.rightLeg, lerp(s.rightLeg.angle, targetAngleRL, 0.4));

  // preventing physics engine from adding unwandted spinning
  Matter.Body.setAngularVelocity(s.leftArm, 0);
  Matter.Body.setAngularVelocity(s.rightArm, 0);
  Matter.Body.setAngularVelocity(s.leftLeg, 0);
  Matter.Body.setAngularVelocity(s.rightLeg, 0);

  // drawing strings
  if (isLeftHand) {
    stroke(255);
    line(thumb.x, thumb.y, s.rightArm.position.x, s.leftArm.position.y);
    line(pinky.x, pinky.y, s.leftArm.position.x, s.rightArm.position.y);
    line(ring.x, ring.y, s.rightLeg.position.x, s.leftLeg.position.y);
    line(index.x, index.y, s.leftLeg.position.x, s.rightLeg.position.y);
  } else {
    stroke(255);
    line(thumb.x, thumb.y, s.leftArm.position.x, s.leftArm.position.y);
    line(pinky.x, pinky.y, s.rightArm.position.x, s.rightArm.position.y);
    line(ring.x, ring.y, s.leftLeg.position.x, s.leftLeg.position.y);
    line(index.x, index.y, s.rightLeg.position.x, s.rightLeg.position.y);
  }
}

function resetWorld() {
  Matter.World.clear(world);
  Matter.Engine.clear(engine);

  engine = Engine.create();
  world = engine.world;

  // gravity
  world.gravity.y = 1;

  // walls
  ground = Bodies.rectangle(width / 2, height - 20, width, 40, {
    isStatic: true,
  });
  leftWall = Bodies.rectangle(width - 20, height / 2, 40, height, {
    isStatic: true,
  });
  rightWall = Bodies.rectangle(0, height / 2, 40, height, { 
    isStatic: true });
  ceeling = Bodies.rectangle(0, 0, width, 80, {
    isStatic: true,
  });

  World.add(world, [ground, leftWall, rightWall, ceeling]);

  // recreate players
  createStickman(stickman1, width * 0.3);
  createStickman(stickman2, width * 0.7);

  // recreate mode objects
  if (mode === "basketball") {
    setupBasketball(world, stickman1, stickman2);
  } else if (mode === "football") {
    setupFootball(world, stickman1, stickman2);
  } else if (mode === "fencing") {
    setupFencing(world, stickman1, stickman2);
  }
}

function drawHandGuides() {
  push();

  tint(255, 150);

  let y = 100;

  //pulsating effect
  let scaleFactor = 1 + sin(frameCount * 0.05) * 0.1;

  let size = 150 * scaleFactor;

  imageMode(CENTER);

  image(leftHandImg, width * 0.25, y, size, size);
  image(rightHandImg, width * 0.75, y, size, size);
  pop();
}

function drawLights() {
  push();
  noStroke();

  let t = frameCount * 0.02;

  // Left light
  let leftBottomX = width * 0.35 + sin(t) * 30;

  for (let i = 0; i < 3; i++) {
    fill(255, 255, 200, 80 / (i + 1));

    beginShape();
    vertex(0, 0);
    vertex(leftBottomX - 80 - i * 20, height * 0.75 + i * 20); // bottom left
    vertex(leftBottomX + 80 + i * 20, height * 0.75 + i * 20); // bottom right
    endShape(CLOSE);
  }

  // Center light
  let centerBottomX = width / 2 + sin(t * 1.2) * 20;

  for (let i = 0; i < 3; i++) {
    fill(255, 255, 200, 100 / (i + 1));

    beginShape();
    vertex(width / 2, 0);
    vertex(centerBottomX - 70 - i * 20, height * 0.75 + i * 20);
    vertex(centerBottomX + 70 + i * 20, height * 0.75 + i * 20);
    endShape(CLOSE);
  }

  // Right Light
  let rightBottomX = width * 0.65 + sin(t + 2) * 30;

  for (let i = 0; i < 3; i++) {
    fill(255, 255, 200, 80 / (i + 1));

    beginShape();
    vertex(width, 0);
    vertex(rightBottomX - 80 - i * 20, height * 0.75 + i * 20);
    vertex(rightBottomX + 80 + i * 20, height * 0.75 + i * 20);
    endShape(CLOSE);
  }

  pop();
}