let football;
let goalLeft;
let goalRight;

let scoreLeft = 0;
let scoreRight = 0;

let footballWorld;

let ballInGoal = false;
let footballCollisionAdded = false;

// setup
function setupFootball(world, s1, s2) {
  footballWorld = world;

  // create ball
  football = Matter.Bodies.circle(width / 2, 100, 15, {
    restitution: 0.9,
    friction: 0.01,
    frictionAir: 0.002,
  });

  // create goals
  goalLeft = Matter.Bodies.rectangle(40, height - 80, 60, 120, {
    isStatic: true,
    isSensor: true,
  });

  goalRight = Matter.Bodies.rectangle(width - 40, height - 80, 60, 120, {
    isStatic: true,
    isSensor: true,
  });

  Matter.World.add(footballWorld, [football, goalLeft, goalRight]);

  // prevent multiple event listeners from being added when switching modes
  if (!footballCollisionAdded) {
    footballCollisionAdded = true;

    Matter.Events.on(engine, "collisionStart", function (event) {
      for (let pair of event.pairs) {
        let a = pair.bodyA;
        let b = pair.bodyB;

        // left goal, player 2 scores
        if (
          (a === football && b === goalLeft) ||
          (b === football && a === goalLeft)
        ) {
          if (!ballInGoal) {
            scoreRight++;
            ballInGoal = true;
            resetFootball();
          }
        }

        // right goal, player 1 scores
        if (
          (a === football && b === goalRight) ||
          (b === football && a === goalRight)
        ) {
          if (!ballInGoal) {
            scoreLeft++;
            ballInGoal = true;
            resetFootball();
          }
        }

        // ball - limb collision
        if (a === football || b === football) {
          let other = a === football ? b : a;

          let allLimbs = [
            s1.leftArm,
            s1.rightArm,
            s1.leftLeg,
            s1.rightLeg,
            s2.leftArm,
            s2.rightArm,
            s2.leftLeg,
            s2.rightLeg,
          ];

          if (allLimbs.includes(other)) {
            hitFootball(other);
          }
        }
      }
    });
  }
}

function drawFootball() {
  fill(255);
  stroke(0);
  ellipse(football.position.x, football.position.y, 30);

  noFill();
  stroke(0, 255, 0);

  rectMode(CENTER);
  drawGoal(goalLeft, true);
  drawGoal(goalRight, false);

  fill(255, 255, 255);
  noStroke();
  textSize(20);
  text(scoreLeft + " : " + scoreRight, width / 2 - 20, 30);
}

function updateFootball() {}

function resetFootball() {
  // put ball back in center
  Matter.Body.setPosition(football, {
    x: width / 2,
    y: 100,
  });

  Matter.Body.setVelocity(football, { x: 0, y: 0 });

  ballInGoal = false;
}

function hitFootball(limb) {
  let ballPos = football.position;
  let limbPos = limb.position;

  // direction vector from limb to ball
  let dx = ballPos.x - limbPos.x;
  let dy = ballPos.y - limbPos.y;

  // normalize vector
  let mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) return;

  dx /= mag;
  dy /= mag;

  // kick strength
  let strength = 10;

  // apply velocity
  Matter.Body.setVelocity(football, {
    x: dx * strength,
    y: dy * strength,
  });
}

function drawGoal(goal, isLeft) {
  let x = goal.position.x;
  let y = goal.position.y;

  let w = 60;
  let h = 120;

  let offset = 0;

  // frame
  stroke(255);
  strokeWeight(4);
  noFill();

  rectMode(CENTER);
  rect(x + offset, y, w, h);

  // net vertical lines
  stroke(200);
  strokeWeight(1);

  for (let i = -w / 2; i <= w / 2; i += 10) {
    line(x + offset + i, y - h / 2, x + offset + i, y + h / 2);
  }

  // net horizontal lines
  for (let j = -h / 2; j <= h / 2; j += 10) {
    line(x + offset - w / 2, y + j, x + offset + w / 2, y + j);
  }
}

function drawFootballField() {
  let yStart = (height / 2) + (height / 4);

  // grass
  fill(40, 150, 60);
  noStroke();
  rectMode(CORNER);
  rect(0, yStart, width, height / 2);

  stroke(255);
  strokeWeight(2);
  
  fill(0, 0, 0);
  rect(0, 0, width, yStart);

  // center line
  line(width / 2, yStart, width / 2, height);

  // center circle
  noFill();
  ellipse(width / 2, yStart + height / 8, 80);

  // penalty areas
  rectMode(CENTER);
  rect(80, yStart + height / 8, 120, 100);
  rect(width - 80, yStart + height / 8, 120, 100);
}
