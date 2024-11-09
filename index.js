const gridSize = 10;

const canvasSize = 500;
const cellSize = canvasSize / gridSize;

const colorLight = 255;
const colorDark = 0;

class Cell {
  constructor(posX, posY, size, colorFront, colorBack) {
    this.posX = posX;
    this.posY = posY;
    this.size = size;
    this.colorFront = colorFront;
    this.colorBack = colorBack;
    this.rotation = floor(random(4)) * 90;
  }

  draw() {
    // Draw rectangle
    noStroke();
    fill(this.colorBack);
    rect(this.posX, this.posY, this.size, this.size);

    // Draw shape with rotation
    fill(this.colorFront);
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

  for (let i = 0; i < gridSize; i += 1) {
    for (let j = 0; j < gridSize; j += 1) {

      const isDark = random(1) > 0.5;
      const randomFront = isDark ? colorDark : colorLight;
      const randomBack = isDark ? colorLight : colorDark;
      const cell = new Cell(i * cellSize, j * cellSize, cellSize, randomFront, randomBack);
      cell.draw();
    }
  }
}

