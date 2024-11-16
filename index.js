const columns = 5;
const rows = 6;
const gutterSize = 1;

const cellSize = 100;
const canvasSize = {
  width: columns * cellSize,
  height: rows * cellSize
};
let cells;

let isRotating = false;
let isDeleting = false;

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
    if (this.imageObject) {
      image(this.imageObject, -this.size / 2, -this.size / 2, this.size, this.size);
    } else {
      rect(-this.size / 2, -this.size / 2, this.size, this.size);
    }

    pop(); // Restore the transformation state
  }
}

const oneToNone = [
  'assets/set_2/OneToNone 1.png',
  'assets/set_2/OneToNone 2.png',
  'assets/set_2/OneToNone 3.png'
]
const oneToOne = [
  'assets/set_2/OneToOne 1.png',
  'assets/set_2/OneToOne 2.png',
  'assets/set_2/OneToOne 3.png',
  'assets/set_2/OneToOne 4.png',
  'assets/set_2/OneToOne 5.png'
]
const oneToOneAngled = [
  'assets/set_2/OneToOneAngled 1.png',
  'assets/set_2/OneToOneAngled 2.png',
  'assets/set_2/OneToOneAngled 3.png'
]
const oneToOneTwo = [
  'assets/set_2/OneToTwo 1.png',
  'assets/set_2/OneToTwo 2.png'
]
const oneToOneThree = [
  'assets/set_2/OneToThree 1.png',
  'assets/set_2/OneToThree 2.png',
  'assets/set_2/OneToThree 3.png'
]


const assets = [
  ...oneToNone,
  ...oneToOne,
  ...oneToOneAngled,
  ...oneToOneTwo,
  ...oneToOneThree
];

const images = [];

let activeImageIndex = 0;

function preload() {


  for (let i = 0; i < assets.length; i++) {
    images[i] = loadImage(assets[i]);
  }
}

function setup() {
  createCanvas(canvasSize.width, canvasSize.height);
  background(0);

  // Update cells initialization for 2D array with columns and rows
  cells = Array(columns).fill().map(() => Array(rows));

  // First pass: assign colors
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      cells[i][j] = new Cell(
        i * cellSize + gutterSize,
        j * cellSize + gutterSize,
        cellSize - gutterSize * 2,
        0,
        null
      );
      cells[i][j].draw();
    }
  }

  // Update download button position
  const downloadButton = createButton('Download Pattern');
  downloadButton.position(10, canvasSize.height + 10);
  downloadButton.mousePressed(downloadCanvas);

  // Update image buttons position
  assets.forEach((asset, index) => {
    const img = createImg(asset, '');
    img.position(10 + (index * 100), canvasSize.height + 10);
    img.size(80, 80);
    const imageButton = createButton(`➡️`);
    imageButton.position(10 + (index * 100), canvasSize.height + 40);
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

function mousePressed() {
  if (mouseX < 0 || mouseX > canvasSize.width || mouseY < 0 || mouseY > canvasSize.height) return;

  const i = Math.floor(mouseX / cellSize);
  const j = Math.floor(mouseY / cellSize);

  if (isDeleting) {
    cells[i][j].imageObject = null;
    cells[i][j].rotation = 0;
  }
  else if (isRotating) {
    cells[i][j].rotation = (cells[i][j].rotation + 90) % 360;
  }
  else {
    cells[i][j].imageObject = images[activeImageIndex];
  }

  // Redraw the canvas
  background(0);
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      cells[x][y].draw();
    }
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    isRotating = true;
  }
  if (key === 'd' || key === 'D') {
    isDeleting = true;
  }
}

function keyReleased() {
  if (key === 'r' || key === 'R') {
    isRotating = false;
  }
  if (key === 'd' || key === 'D') {
    isDeleting = false;
  }
}

