/*rstart.cl
 * * Bioners in Dance // Forked from flocking, slider y otrxs códigos de p5js. <3<3<3<3
/*
 * @name Flocking
 * @description Demonstration of <a href="http://www.red3d.com/cwr/">Craig Reynolds' "Flocking" behavior</a>.<br>
 * (Rules: Cohesion, Separation, Alignment.)<br>
 * From <a href="http://natureofcode.com">natureofcode.com</a>.
 */
// A HTML range slider.

var slider;

var angle = 0;

var x = 127;

var boids = [];

function setup() {
  createCanvas(displayWidth, displayHeight);
  //createCanvas(720, 400);
    // hue, saturation, and brightness
  colorMode(HSB, 255);
  // slider has a range between 0 and 255 with a starting value of 127
  slider = createSlider(0, 255, 127);

  // Add an initial set of boids into the system
  for (var i = 0; i < 100; i++) {
    boids[i] = new Boid(random(width), random(height));
  }
}

function draw() {
  background(010, 010);
  strokeWeight(2);
  
  var x = map(sin(angle), -1, 1, 0, 255); 
  slider.value(x) ;
  //x = x + random(-5,5)
  angle += 0.01;
  
  // Run all the boids
  for (var i = 0; i < boids.length; i++) {
    boids[i].run(boids);
  }
}


// Boid class
// Methods for Separation, Cohesion, Alignment added
function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = p5.Vector.random2D();
  this.position = createVector(x, y);
  this.r = 3.0;
  this.maxspeed =2;    // Maximum speed
  this.maxforce = 0.05; // Maximum steering force
}

Boid.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  this.borders();
  this.render();
}

// Forces go into acceleration
Boid.prototype.applyForce = function(force) {
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
  var sep = this.separate(boids); // Separation
  var ali = this.align(boids);    // Alignment
  var coh = this.cohesion(boids); // Cohesion
  // Arbitrarily weight these forces
  sep.mult(2.5);
  ali.mult(1.0);
  coh.mult(1.0);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}

// Method to update location
Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset acceleration to 0 each cycle
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  var desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  var steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxforce); // Limit to maximum steering force
  return steer;
}

// Draw boid as a circle
Boid.prototype.render = function() {
  fill(slider.value(), 255, 255, 127);
  
  
  fill(slider.value(), mouseX, height, mouseY/2+20, mouseY/2, inverseX, height*2, (inverseY/2)+20, (inverseY/2)+10, 2, 55, 127);
  var inverseX = width-mouseX;
  var inverseY = height-mouseY;
  
    stroke(slider.value(), 255, 255, 127);
  
  //stroke(slider.value(), mouseY, height/2, mouseX/2+10, mouseX/2+10, inverseX, height/2, (inverseX/2)+20, (inverseX/2)+10, 255, 55);
  //var inverseY = width-mouseY;
  //var inverseX = height-mouseX;
  ellipse(this.position.x, this.position.y, 5, 3);
  //ellipse(this.position.x, height/2, (inverseY/2)+20, (inverseY/2)+10);

}

// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r) this.position.x = width + this.r;
  if (this.position.y < -this.r) this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  var desiredseparation = 25.0;
  var steer = createVector(0, 0);
  var count = 0;
  // For every boid in the system, check if it's too close
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position, boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      var diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d); // Weight by distance
      steer.add(diff);
      count++; // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
  var neighbordist = 50;
  var sum = createVector(0, 0);
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    var steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
  var neighbordist = 50;
  var sum = createVector(0, 0); // Start with empty vector to accumulate all locations
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum); // Steer towards the location
  } else {
    return createVector(0, 0);
  }
}
