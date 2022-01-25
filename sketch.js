SHOULD_DEBUG = false;

// draggable objects
let eye;
let mirrorHandleA;
let mirrorHandleB;
let physicalObject;

// a reference to the object being dragged
let focusedObject;
let isDragging = false;

function setup() {
  createCanvas(600, 600);
  physicalObject = createClickable(103, 67, "object", 50, 50);
  eye = createClickable(408, 67, "eye", 50, 50);
  mirrorHandleA = createClickable(100, 300, "", 20, 20);
  mirrorHandleB = createClickable(424, 305, "", 20, 20);
}

function createClickable(x, y, text, w, h){
  let ret = new Clickable();
  ret.locate(x, y);
  ret.cornerRadius = 0;
  ret.strokeWeight = 0;
  ret.text = text;
  ret.width = w;
  ret.height = h;
  ret.onPress = function(){
    isDragging = true;
    focusedObject = ret; 
    ret.color = "#ccc";   
  }
  ret.onOutside = function(){
    ret.color = "#fff";
  }
  return ret;
}

function draw() {
  background(220);

  // handle drags
  if (isDragging){
    let dx = mouseX-pmouseX;
    let dy = mouseY-pmouseY;
    focusedObject.locate(
      focusedObject.x + dx,
      focusedObject.y + dy 
    );
    
    if (SHOULD_DEBUG){
      console.log('obj', physicalObject.x, physicalObject.y);
      console.log('eye', eye.x, eye.y);
      console.log('handlea', mirrorHandleA.x, mirrorHandleA.y);
      console.log('handleb', mirrorHandleB.x, mirrorHandleB.y);  
    }
  }
  computeReflection();

  // draw mirror between handles
  stroke(0);
  line( 
    mirrorHandleA.x + 10,
    mirrorHandleA.y + 10,
    mirrorHandleB.x + 10,
    mirrorHandleB.y + 10
  );

  // draw draggables
  physicalObject.draw();
  eye.draw();
  mirrorHandleA.draw();
  mirrorHandleB.draw();  
}

function mouseReleased(){
  isDragging = false;
  if (focusedObject)
    focusedObject.color = "#fff";
}

// ripped from https://stackoverflow.com/questions/30004165/check-if-a-vector-angle-intersects-area
function rayRectangleIntersection (r, p, n) {
  var lowerLimitX = (r.x - p.x) / n.x;
  var upperLimitY =  (r.y - p.y) / n.y;
  var upperLimitX = (r.x + r.w - p.x) / n.x;
  var lowerLimitY  = (r.y + r.h - p.y) / n.y;

  return Math.max(lowerLimitX, lowerLimitY) <=
      Math.min(upperLimitX, upperLimitY);
};

function computeDistance(a, b){
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  return Math.sqrt( dx*dx + dy*dy );
}

// let's show light rays coming off our object
// and reflect them from the mirror
// this perhaps(?) makes it clear where the eye can be dragged
// and where the dead zones are
function computeReflection(){
  
  let startX = mirrorHandleA.x + 10;
  let stopX = mirrorHandleB.x + 10;
  let startY = mirrorHandleA.y + 10;
  let stopY = mirrorHandleB.y + 10;

  for (var i = 0; i < 1; i+=0.05){
    let x = lerp(startX, stopX, i);
    let y = lerp(startY, stopY, i);
    
    stroke("#fff");
    point(x, y);
    
    let obj_dx = physicalObject.x + 25 - x;
    let obj_dy = physicalObject.y +25 - y;
    let eye_dx = eye.x + 25 - x;
    let eye_dy = eye.y + 25 - y;
 
    // this series of lines is meant to show that 
    // the object sends rays of reflected light onto 
    // our mirror
    line(      
      physicalObject.x+25, 
      physicalObject.y+25,
      x, y
    );

    // do some vector math here
    // to compute angle
    // using https://github.com/tmpvar/vec2.js

    let x0 = lerp(startX, stopX, i-0.1);
    let y0 = lerp(startY, stopY, i-0.1);
    let vecA = new Vec2(x-x0, y-y0); // a vector representing the mirror
    let vecB = new Vec2(physicalObject.x-x, physicalObject.y-y); // the line we just drew
    let theta = vecA.angleTo(vecB);

    // draw bounces
    let thetaBounced = Math.PI-theta;
    let bounceX = Math.cos(thetaBounced) * 66;
    let bounceY = Math.sin(thetaBounced) * 66;
    line(x, y, x + bounceX, y + bounceY);

    // for each ray, see if the bounce hits the eye
    // if so, lengthen the ray to show the connection
    let p = { x: x, y: y };
    let r = { x: eye.x, y: eye.y, w: eye.width, h: eye.height };
    let n = { x: Math.cos(thetaBounced), y: Math.sin(thetaBounced) };
    let success = rayRectangleIntersection(r, p, n);
    if (success){
      //stroke("#ff9999");
      //line(physicalObject.x+25, physicalObject.y+25, x, y);
      //line(x, y, x + bounceX, y + bounceY);
      let d = computeDistance( { x: x, y: y }, { x: eye.x+25, y: eye.y+25 } );      
      line( 
        x, 
        y,
        x + Math.cos(thetaBounced) * d,
        y + Math.sin(thetaBounced) * d);
      if (SHOULD_DEBUG) {
        console.log("ray hit");
      }
    }

    // danger! this changes theta (because I'm lazy) so... 
    // make sure it's the last thing that runs in this loop
    if (SHOULD_DEBUG){
      theta = theta * 180/Math.PI;
      if (theta<0) theta += 180;  
      if (theta>90) theta = 180-theta;  
      theta = Math.round(theta);
      textSize(13);
      fill("#aaa");
      text(''+theta, x, y +25);  
    }
    
  }

}