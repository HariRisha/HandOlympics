let sword1;
let sword2;

let fencingscore1 = 0;
let fencingscore2 = 0;

let lastHitTime = 0;
let hitCooldown = 500;

function setupFencing(world) {
  sword1 = Matter.Bodies.rectangle(0, 0, 80, 5, {
    friction: 0,
    frictionAir: 0.02,
  });

  sword2 = Matter.Bodies.rectangle(0, 0, 80, 5, {
    friction: 0,
    frictionAir: 0.02,
  });

  // collision detection
  Matter.Events.on(engine, "collisionStart", function (event) {
    for (let pair of event.pairs) {
      let a = pair.bodyA;
      let b = pair.bodyB;

      if (!stickman1.head || !stickman2.head) return;

      // player 1 hit player 2
      if (a === sword1 || b === sword1) {
        let other = a === sword1 ? b : a;

        let targetParts = [
          stickman2.head,
          stickman2.body,
          stickman2.leftArm,
          stickman2.rightArm,
          stickman2.leftLeg,
          stickman2.rightLeg,
        ];

        let now = millis();

        if (targetParts.includes(other) && now - lastHitTime > hitCooldown) {
          fencingscore1++;
          lastHitTime = now;
        }
      }

      // player 2 hit player 1
      if (a === sword2 || b === sword2) {
        let other = a === sword2 ? b : a;

        let targetParts = [
          stickman1.head,
          stickman1.body,
          stickman1.leftArm,
          stickman1.rightArm,
          stickman1.leftLeg,
          stickman1.rightLeg,
        ];

        let now = millis();

        if (targetParts.includes(other) && now - lastHitTime > hitCooldown) {
          fencingscore2++;
          lastHitTime = now;
        }
      }
    }
  });

  Matter.World.add(world, [sword1, sword2]);
}

// update sword position based on players arm
function updateFencing(s1, s2) {
  updateSword(sword1, s1.rightArm, false);
  updateSword(sword2, s2.leftArm, true);
}

function updateSword(sword, arm, isLeft = false) {
  if (!sword || !arm) return;

  // get current rotation of the arm
  let angle = arm.angle;

  // flip sword for left hand
  let direction = isLeft ? -1 : 1;

  // extend the sword from the arm
  let offsetX = Math.cos(angle) * 40 * direction;
  let offsetY = Math.sin(angle) * 40 * direction;

  // offsetting the sword by a bit
  let targetX = arm.position.x + offsetX;
  let targetY = arm.position.y + offsetY;

  let newX = lerp(sword.position.x, targetX, 0.4);
  let newY = lerp(sword.position.y, targetY, 0.4);

  Matter.Body.setPosition(sword, { x: newX, y: newY });
  Matter.Body.setAngle(sword, angle);

  Matter.Body.setVelocity(sword, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(sword, 0);
}

function drawFencing() {
  drawSword(sword1);
  drawSword(sword2);

  fill(255,255,255);
  noStroke();
  textSize(20);
  text("P1: " + fencingscore1, 20, 30);
  text("P2: " + fencingscore2, width - 100, 30);
}

function drawSword(sword) {
  if (!sword) return;

  stroke(180);
  strokeWeight(6);

  // scores
  push();
  translate(sword.position.x, sword.position.y);
  rotate(sword.angle);
  line(-40, 0, 40, 0);
  pop();
}

function drawFencingStrip() {
  let yStart = height / 2 + height / 4;

  // dark background
  fill(60);
  noStroke();
  rectMode(CORNER);
  rect(0, yStart, width, height / 2);

  fill(0, 0, 0);
  rect(0, 0, width, yStart);

  // strip
  fill(180);
  rectMode(CENTER);
  rect(width / 2, yStart + height / 8, width * 0.6, 80);

  // center line
  stroke(255);
  line(
    width / 2,
    yStart + height / 8 - 40,
    width / 2,
    yStart + height / 8 + 40
  );
}
