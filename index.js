const gridSize = 10;

const canvasSize = 500;
const cellSize = canvasSize / gridSize;

const colorBase = Math.floor(Math.random() * 360);
const colorLight = colorBase;
const colorDark = colorBase + 140;

class Cell {
  constructor(posX, posY, size, colorFront, colorBack, rotation) {
    this.posX = posX;
    this.posY = posY;
    this.size = size;
    this.colorFront = colorFront;
    this.colorBack = colorBack;
    this.rotation = rotation;
  }

  draw() {
    // Draw rectangle
    // noStroke();
    stroke(255);
    fillHsluv(this.colorBack, 90, 70);
    rect(this.posX, this.posY, this.size, this.size);

    // Draw shape with rotation
    fillHsluv(this.colorFront, 90, 70);
    push(); // Save current transformation state
    translate(this.posX + this.size / 2, this.posY + this.size / 2); // Move to center of cell
    rotate(radians(this.rotation)); // Apply rotation
    translate(-this.size / 2, -this.size / 2); // Move back to origin

    beginShape();
    vertex(0, 0);
    vertex(this.size / 2, 0);
    vertex(this.size, this.size / 2);
    vertex(this.size, this.size);
    vertex(this.size / 2, this.size);
    vertex(0, this.size / 2);
    endShape(CLOSE);

    pop(); // Restore transformation state
  }
}

function setup() {
  createCanvas(canvasSize, canvasSize);
  background(0);

  let lastRotation = 0;
  const maxRotation = 2;
  for (let i = 0; i < gridSize; i += 1) {
    for (let j = 0; j < gridSize; j += 1) {

      const isDark = true //random(1) > 0.5;
      const randomFront = isDark ? colorDark : colorLight;
      const randomBack = isDark ? colorLight : colorDark;
      const rotation = lastRotation * 90;
      lastRotation = (lastRotation + 1) % maxRotation;
      const cell = new Cell(i * cellSize, j * cellSize, cellSize, randomFront, randomBack, rotation);
      cell.draw();
    }
  }

  // Add download button
  const downloadButton = createButton('Download Pattern');
  downloadButton.position(10, canvasSize + 10);
  downloadButton.mousePressed(downloadCanvas);
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

