const gridSize = 10;
const gutterSize = 0;

const canvasSize = 800;
const cellSize = canvasSize / gridSize;
let cells; // Make cells global

let isRotating = false;

class Cell {
  constructor(posX, posY, size, rotation, imageObject) {
    this.posX = posX;
    this.posY = posY;
    this.size = size;
    this.rotation = rotation;
    this.imageObject = imageObject;
  }

  draw() {
    push(); // Save the current transformation state
    translate(this.posX + this.size / 2, this.posY + this.size / 2); // Move to center of cell
    rotate(radians(this.rotation)); // Apply rotation
    // Draw image centered at origin
    image(this.imageObject, -this.size / 2, -this.size / 2, this.size, this.size);
    pop(); // Restore the transformation state
  }
}


const assets = [
  'assets/IMG_4714.JPG',
  'assets/IMG_4715.JPG',
  'assets/IMG_4716.JPG',
  'assets/IMG_4717.JPG',
  'assets/IMG_4718.JPG',
  'assets/IMG_4719.JPG',
  'assets/IMG_4720.JPG',
  'assets/IMG_4721.JPG'
];

const images = [];

let activeImageIndex = 0;

function preload() {


  for (let i = 0; i < assets.length; i++) {
    images[i] = loadImage(assets[i]);
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

      cells[i][j] = new Cell(
        i * cellSize + gutterSize,
        j * cellSize + gutterSize,
        cellSize - gutterSize * 2,
        Math.floor(Math.random() * 4) * 90,
        images[Math.floor(Math.random() * images.length)]
      );
      cells[i][j].draw();
    }
  }

  // Add download button
  const downloadButton = createButton('Download Pattern');
  downloadButton.position(10, canvasSize + 10);
  downloadButton.mousePressed(downloadCanvas);

  // Add buttons for each image
  assets.forEach((asset, index) => {
    const img = createImg(asset, '');
    img.position(10 + (index * 100), canvasSize + 10);
    img.size(80, 80);
    const imageButton = createButton(`➡️`);
    imageButton.position(10 + (index * 100), canvasSize + 40);
    imageButton.mousePressed(() => {
      console.log(asset);
      activeImageIndex = index;
    });
  });


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


function mouseDragged() {
  if (mouseX < 0 || mouseX > canvasSize || mouseY < 0 || mouseY > canvasSize) return;

  // Calculate which cell was clicked
  const i = Math.floor(mouseX / cellSize);
  const j = Math.floor(mouseY / cellSize);

  cells[i][j].rotation = (cells[i][j].rotation + 90) % 360;

  // Redraw the canvas
  background(0);
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      cells[x][y].draw();
    }
  }
}

function mousePressed() {
  if (mouseX < 0 || mouseX > canvasSize || mouseY < 0 || mouseY > canvasSize) return;

  // Calculate which cell was clicked
  const i = Math.floor(mouseX / cellSize);
  const j = Math.floor(mouseY / cellSize);


  cells[i][j].imageObject = images[activeImageIndex];

  // Redraw the canvas
  background(0);
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      cells[x][y].draw();
    }
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    isRotating = true;
  }
}

function keyReleased() {
  if (key === 'r' || key === 'R') {
    isRotating = false;
  }
}

