const gridSize = 5;

const canvasSize = 800;
const cellSize = canvasSize / gridSize;

const colorBase = Math.floor(Math.random() * 360);
const colorLight = colorBase;
const colorDark = colorBase + 140;

let cells; // Make cells global

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

  // Update cells initialization to use global variable
  cells = Array(gridSize).fill().map(() => Array(gridSize));

  // First pass: assign colors
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const isDark = random(1) > 0.5;
      const randomFront = isDark ? colorDark : colorLight;
      const randomBack = isDark ? colorLight : colorDark;

      cells[i][j] = new Cell(
        i * cellSize,
        j * cellSize,
        cellSize,
        randomFront,
        randomBack,
        0 // temporary rotation
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

