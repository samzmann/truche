const gridSize = 5;
const gutterSize = 0;

const canvasSize = 800;
const cellSize = canvasSize / gridSize;

const colorBase = Math.floor(Math.random() * 360);
const colorLight = colorBase;
const colorDark = colorBase + 140;

let cells; // Make cells global

class Cell {
  constructor(posX, posY, size, colorFront, colorBack, rotation, drawStyle) {
    this.posX = posX;
    this.posY = posY;
    this.size = size;
    this.colorFront = colorFront;
    this.colorBack = colorBack;
    this.rotation = rotation;
    this.drawStyle = drawStyle;

    this.posTopLeft = createVector(0, 0);
    this.posTopMiddle = createVector(this.size / 2, 0);
    this.posTopRight = createVector(this.size, 0);
    this.posRightMiddle = createVector(this.size, this.size / 2);
    this.posBottomRight = createVector(this.size, this.size);
    this.posBottomMiddle = createVector(this.size / 2, this.size);
    this.posBottomLeft = createVector(0, this.size);
    this.posLeftMiddle = createVector(0, this.size / 2);

    this.hueIncrement = 0;
  }

  draw() {
    // Draw rectangle
    noStroke();
    fillHsluv(this.colorBack + this.hueIncrement, 90, 70);
    rect(this.posX, this.posY, this.size, this.size);

    // Draw shape with rotation
    fillHsluv(this.colorFront + this.hueIncrement, 90, 70);
    push();
    translate(this.posX + this.size / 2, this.posY + this.size / 2);
    rotate(radians(this.rotation));
    translate(-this.size / 2, -this.size / 2);

    if (this.drawStyle === 'lines') {
      this.drawLines();
    } else if (this.drawStyle === 'arcs') {
      this.drawArcs();
    }

    pop();
  }

  drawLines() {
    beginShape();
    vertex(this.posTopLeft.x, this.posTopLeft.y);
    vertex(this.posTopMiddle.x, this.posTopMiddle.y);
    vertex(this.posRightMiddle.x, this.posRightMiddle.y);
    vertex(this.posBottomRight.x, this.posBottomRight.y);
    vertex(this.posBottomMiddle.x, this.posBottomMiddle.y);
    vertex(this.posLeftMiddle.x, this.posLeftMiddle.y);
    endShape(CLOSE);
  }

  drawArcs() {
    // Draw straight lines for top-left segment
    // beginShape();
    // vertex(this.posTopLeft.x, this.posTopLeft.y);
    // vertex(this.posTopMiddle.x, this.posTopMiddle.y);

    // Draw arc from top-middle to right-middle (bending inward)

    // arc(this.posTopRight.x, this.posTopRight.y,  // center x,y
    //   this.size, this.size,    // width, height
    //   PI, -HALF_PI,           // start angle, end angle
    //   OPEN);                  // don't close the arc

    arc(this.size, 0, this.size, this.size, PI / 2, PI);



    // Draw straight lines for right-bottom segment

    // vertex(this.posRightMiddle.x, this.posRightMiddle.y);
    // vertex(this.posBottomRight.x, this.posBottomRight.y);
    // vertex(this.posBottomMiddle.x, this.posBottomMiddle.y);


    // Draw arc from bottom-middle to left-middle (bending inward)

    // arc(0, this.size / 2,         // center x,y
    //   this.size, this.size,    // width, height
    //   HALF_PI, 0,             // start angle, end angle
    //   OPEN);                  // don't close the arc

    arc(0, this.size, this.size, this.size, -PI / 2, 0);


    // Draw straight line for left-top segment

    // vertex(this.posLeftMiddle.x, this.posLeftMiddle.y);
    // vertex(this.posTopLeft.x, this.posTopLeft.y);
    // endShape(CLOSE);
  }

  update() {
    this.hueIncrement += 0.5;
    // Update the colors based on the increment
    // this.colorFront = (this.colorFront + this.hueIncrement) % 360;
    // this.colorBack = (this.colorBack + this.hueIncrement) % 360;
  }
}

function setup() {
  createCanvas(canvasSize, canvasSize);
  background(255);

  // Update cells initialization to use global variable
  cells = Array(gridSize).fill().map(() => Array(gridSize));

  // First pass: assign colors
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const isDark = random(1) > 0.5;
      const randomFront = isDark ? colorDark : colorLight;
      const randomBack = isDark ? colorLight : colorDark;
      const drawStyle = 'arcs';

      cells[i][j] = new Cell(
        i * cellSize + gutterSize,
        j * cellSize + gutterSize,
        cellSize - gutterSize * 2,
        randomFront,
        randomBack,
        0, // temporary rotation
        drawStyle
      );
    }
  }

  // Second pass: assign rotations
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cell = cells[i][j];
      const neighbors = getNeighbors(cells, i, j);
      const rotation = determineRotation(cell, neighbors, cells[i][j - 1]); // Pass left neighbor for initial reference
      cell.rotation = rotation * 90;
      cell.draw();
    }
  }

  // Add download button
  const downloadButton = createButton('Download Pattern');
  downloadButton.position(10, canvasSize + 10);
  downloadButton.mousePressed(downloadCanvas);

}

function draw() {
  background(255);
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      cells[i][j].update();
    }
  }

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      cells[i][j].draw();
    }
  }
}

function downloadCanvas() {
  saveCanvas('output/pattern', 'png');
}

function fillHsluv(h, s, l) {
  var rgb = hsluv.hsluvToRgb([h, s, l]);
  fill(rgb[0] * 255, rgb[1] * 255, rgb[2] * 255);
}
function strokeHsluv(h, s, l) {
  var rgb = hsluv.hsluvToRgb([h, s, l]);
  stroke(rgb[0] * 255, rgb[1] * 255, rgb[2] * 255);
}

function getNeighbors(cells, i, j) {
  return {
    top: j > 0 ? cells[i][j - 1] : null,
    right: i < gridSize - 1 ? cells[i + 1][j] : null,
    bottom: j < gridSize - 1 ? cells[i][j + 1] : null,
    left: i > 0 ? cells[i - 1][j] : null
  };
}

function determineRotation(cell, neighbors, leftNeighbor) {
  const hasConflictingNeighbor = Object.values(neighbors).some(neighbor =>
    neighbor && neighbor.colorFront === cell.colorFront
  );

  if (!hasConflictingNeighbor) {
    // If no same-color neighbors, any rotation is fine
    return Math.floor(random(2));
  }

  // If we have same-color neighbors, we need opposite rotation
  // Use left neighbor as reference if it exists
  if (leftNeighbor && leftNeighbor.colorFront === cell.colorFront) {
    return (Math.floor(leftNeighbor.rotation / 90) + 1) % 2;
  }

  // If no left neighbor or different color, start with random rotation
  return Math.floor(random(2));
}

function mousePressed() {
  if (mouseX < 0 || mouseX > canvasSize || mouseY < 0 || mouseY > canvasSize) return;

  // Calculate which cell was clicked
  const i = Math.floor(mouseX / cellSize);
  const j = Math.floor(mouseY / cellSize);

  // Rotate the clicked cell
  cells[i][j].rotation = (cells[i][j].rotation + 90) % 360;

  // Redraw the canvas
  background(0);
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      cells[x][y].draw();
    }
  }
}

