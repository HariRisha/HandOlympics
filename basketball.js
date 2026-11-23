let ball;
let hoop;

let backboard;
let backboard2;

let basketballscore1 = 0;
let basketballscore2 = 0;

let hoop1;
let hoop2;

let player1;
let player2;

let worldRef;

// Setup
function setupBasketball(world, s1, s2) {
  worldRef = world;
  player1 = s1;
  player2 = s2;

  // ball
  ball = Matter.Bodies.circle(200, 100, 15, {
    restitution: 0.95,
    friction: 0,
    frictionAir: 0.001,
  });

  // RIGHT HOOP (Player 1 scores)
  hoop1 = Matter.Bodies.circle(width - 100, 200, 25, {
    isStatic: true,
    isSensor: true,
  });

  // LEFT HOOP (Player 2 scores)
  hoop2 = Matter.Bodies.circle(100, 200, 25, {
    isStatic: true,
    isSensor: true,
  });

  // backboard
  backboard = Matter.Bodies.rectangle(530, 180, 10, 80, {
    isStatic: true,
  });
  
  // backboard 2
  backboard2 = Matter.Bodies.rectangle(110, 180, 10, 80, {
    isStatic: true,
});

  Matter.World.add(worldRef, [ball, hoop1, hoop2, backboard, backboard2]);

  // scoring
  Matter.Events.on(engine, "collisionStart", function (event) {
    for (let pair of event.pairs) {
      let a = pair.bodyA;
      let b = pair.bodyB;

      // PLAYER 1 SCORES (right hoop)
      if ((a === ball && b === hoop1) || (b === ball && a === hoop1)) {
        basketballscore1++;
        resetBall();
      }

      // PLAYER 2 SCORES (left hoop)
      if ((a === ball && b === hoop2) || (b === ball && a === hoop2)) {
        basketballscore2++;
        resetBall();
      }

      // Arm hit 
      if (a === ball || b === ball) {
        let other = a === ball ? b : a;

        if (
          other === player1.leftArm ||
          other === player1.rightArm ||
          other === player1.leftLeg ||
          other === player1.rightLeg ||
          other === player2.leftArm ||
          other === player2.rightArm ||
          other === player2.leftLeg ||
          other === player2.rightLeg
        ) {
          hitBall(other);
        }
      }
    }
  });
}

// Update
function updateBasketball() {
  // if ball is near ground and moving slow bounce it
  if (ball.position.y > height - 60 && Math.abs(ball.velocity.y) < 6) {
    Matter.Body.setVelocity(ball, {
      x: ball.velocity.x + random(-0.5, 0.5),
      y: -12,
    });
  }
}

// draw
function drawBasketball() {
  // ball
  stroke(20);
  fill(255, 150, 0);
  ellipse(ball.position.x, ball.position.y, 30);

  // hoops
  noFill();
  stroke(255, 0, 0);

  ellipse(hoop1.position.x, hoop1.position.y, 50);
  ellipse(hoop2.position.x, hoop2.position.y, 50);

  // backboards
  fill(200);
  noStroke();
  rectMode(CENTER);
  rect(backboard.position.x + 40, backboard.position.y, 10, 80);
  rect(backboard2.position.x - 40, backboard2.position.y, 10, 80);
  rect(backboard.position.x + 50, backboard.position.y + 120, 10, 250);
  rect(backboard2.position.x - 50, backboard2.position.y + 120, 10, 250);

  // scores
  fill(255,255,255);
  noStroke();
  textSize(20);

  text("P1: " + basketballscore1, 20, 30);
  text("P2: " + basketballscore2, width - 100, 30);
}

function hitBall(arm) {
  let v = arm.velocity;

  let multiplier = 8;

  Matter.Body.setVelocity(ball, {
    x: v.x * multiplier,
    y: v.y * multiplier - 4,
  });
}

function resetBall() {
  Matter.Body.setPosition(ball, {
    x: width / 2,
    y: 100,
  });

  Matter.Body.setVelocity(ball, { x: 0, y: 0 });
}

function drawBasketballCourt() {
  let yStart = (height / 2) + (height/4);

  // floor
  fill(245, 180, 80);
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
  ellipse(width / 2, yStart + height / 8, 100);
  
  noFill();
  arc(80, yStart + height / 8, 100, 100, -HALF_PI, HALF_PI);
  arc(560, yStart + height / 8, 100, 100, HALF_PI, -HALF_PI)
}