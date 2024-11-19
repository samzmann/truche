const columns = 8;
const rows = 8;
const gutterSize = 1;

const cellSize = 100;
const canvasSize = {
  width: columns * cellSize,
  height: rows * cellSize
};
let cells;

let isRotating = false;
let isDeleting = false;

const uiOriginX = canvasSize.width + 50;
const uiOriginY = 0;

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

// Represent "endings", which have one connection point only (always the top side)
const oneToNone = [
  'assets/set_2/OneToNone 1.png',
  'assets/set_2/OneToNone 2.png',
  'assets/set_2/OneToNone 3.png'
]

// Represent cells which have two connection points (always the top side and the bottom side)
const oneToOne = [
  'assets/set_2/OneToOne 1.png',
  'assets/set_2/OneToOne 2.png',
  'assets/set_2/OneToOne 3.png',
  'assets/set_2/OneToOne 4.png',
  'assets/set_2/OneToOne 5.png'
]

// Represent cells which have two connection points, but at an angle (always the top side and the left side)
const oneToOneAngled = [
  'assets/set_2/OneToOneAngled 1.png',
  'assets/set_2/OneToOneAngled 2.png',
  'assets/set_2/OneToOneAngled 3.png'
]

// Represent cells which have three connection points (always the top side, the left side and the right side)
const oneToOneTwo = [
  'assets/set_2/OneToTwo 1.png',
  'assets/set_2/OneToTwo 2.png',
  'assets/set_2/OneToTwo 3.png'
]

// Represent cells which have four connection points (always the top side, bottom side, left side, right side)
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

function drawUI() {
  // Download button remains at fixed position
  const downloadButton = createButton('Download Pattern');
  downloadButton.position(10, canvasSize.height + 10);
  downloadButton.mousePressed(downloadCanvas);

  const randomizeButton = createButton('Randomize');
  randomizeButton.position(10, canvasSize.height + 40);
  randomizeButton.mousePressed(() => {
    generateRandomPattern().catch(console.error);
  });

  // Define sections with their titles and corresponding arrays
  const sections = [
    { title: 'One to None', assets: oneToNone },
    { title: 'One to One', assets: oneToOne },
    { title: 'One to One Angled', assets: oneToOneAngled },
    { title: 'One to Two', assets: oneToOneTwo },
    { title: 'One to Three', assets: oneToOneThree }
  ];

  let currentY = uiOriginY;
  const itemsPerRow = 5; // Adjust this value to change number of items per row
  const itemWidth = 100;
  const itemHeight = 120;
  const sectionSpacing = 0; // Space between sections

  sections.forEach(section => {
    // Create section header
    const header = createElement('h3', section.title);
    header.position(uiOriginX, currentY);
    header.style('color', 'black');
    header.style('font-family', 'Arial, sans-serif');
    currentY += 50; // Space after header

    // Create grid of images and buttons for this section
    section.assets.forEach((asset, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;

      const xPos = uiOriginX + (col * itemWidth);
      const yPos = currentY + (row * itemHeight);

      // Create image
      const img = createImg(asset, '');
      img.position(xPos, yPos);
      img.size(80, 80);

      // Create button below image
      const imageButton = createButton('➡️');
      imageButton.position(xPos, yPos);
      imageButton.mousePressed(() => {
        // Find the global index in the combined assets array
        activeImageIndex = assets.indexOf(asset);
      });

      // Add count text element
      const countElement = createElement('p', '0');
      countElement.position(xPos, yPos + 85); // Position below the button
      countElement.style('margin', '0');
      countElement.style('text-align', 'center');
      countElement.style('width', '80px');
      countElement.style('font-size', '20px');
      countElement.style('font-family', 'Arial, sans-serif');
      countElement.id('count-' + assets.indexOf(asset)); // Add unique ID for updating later
    });

    // Update currentY for next section
    const rowsInSection = Math.ceil(section.assets.length / itemsPerRow);
    currentY += (rowsInSection * itemHeight) + sectionSpacing;
  });
}

function setup() {
  createCanvas(canvasSize.width, canvasSize.height);
  background(220);
  noStroke()

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

  drawUI();
}

async function generateRandomPattern() {
  // Add a safety counter to prevent infinite loops
  let attempts = 0;
  const maxAttempts = 1000;  // Adjust this value as needed

  background(220);

  // Clear all cells
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      cells[i][j].imageObject = null;
      cells[i][j].rotation = 0;
      cells[i][j].draw();  // Draw empty cells
    }
  }

  // Helper function to determine if a tile has a connection point on a given side at a given rotation
  function hasConnectionPoint(assetPath, rotation, side) {
    // Define connection points for each asset type at 0 degrees
    // [top, right, bottom, left]
    let baseConnections;
    if (oneToNone.includes(assetPath)) {
      baseConnections = [true, false, false, false];
    } else if (oneToOne.includes(assetPath)) {
      baseConnections = [true, false, true, false];
    } else if (oneToOneAngled.includes(assetPath)) {
      baseConnections = [true, false, false, true];
    } else if (oneToOneTwo.includes(assetPath)) {
      baseConnections = [true, true, false, true];
    } else if (oneToOneThree.includes(assetPath)) {
      baseConnections = [true, true, true, true];
    } else {
      return false;
    }

    // Rotate the connection points based on rotation
    const rotationIndex = (rotation / 90) % 4;
    return baseConnections[(side - rotationIndex + 4) % 4];
  }

  // Helper function to check if a tile configuration would connect with at least one neighbor
  function hasValidConnection(col, row, assetPath, rotation) {
    const directions = [
      [0, -1, 0, 2], // top neighbor: [dx, dy, my side, neighbor side]
      [1, 0, 1, 3],  // right neighbor
      [0, 1, 2, 0],  // bottom neighbor
      [-1, 0, 3, 1]  // left neighbor
    ];

    let hasAnyConnection = false;
    for (const [dx, dy, mySide, neighborSide] of directions) {
      const newCol = col + dx;
      const newRow = row + dy;

      // Skip if neighbor is out of bounds
      if (newCol < 0 || newCol >= columns || newRow < 0 || newRow >= rows) continue;

      const neighbor = cells[newCol][newRow];
      if (!neighbor.imageObject) continue;

      const neighborPath = assets[images.indexOf(neighbor.imageObject)];
      const myConnection = hasConnectionPoint(assetPath, rotation, mySide);
      const neighborConnection = hasConnectionPoint(neighborPath, neighbor.rotation, neighborSide);

      // If both cells have connection points facing each other, it's a valid connection
      if (myConnection && neighborConnection) {
        hasAnyConnection = true;
      }
    }

    return hasAnyConnection;
  }

  // Helper function to find valid tile configurations for a position
  function findValidConfiguration(col, row) {
    const validConfigs = [];

    // Helper function to check if a rotation is valid for an edge position
    function isValidEdgeRotation(assetPath, rotation, col, row) {
      // Check top edge
      if (row === 0 && hasConnectionPoint(assetPath, rotation, 0)) return false;
      // Check right edge
      if (col === columns - 1 && hasConnectionPoint(assetPath, rotation, 1)) return false;
      // Check bottom edge
      if (row === rows - 1 && hasConnectionPoint(assetPath, rotation, 2)) return false;
      // Check left edge
      if (col === 0 && hasConnectionPoint(assetPath, rotation, 3)) return false;
      return true;
    }

    // Try each asset type
    for (const assetPath of assets) {
      const validRotations = getValidRotations(assetPath);

      // Try each valid rotation
      for (const rotation of validRotations) {
        // Check if the rotation is valid for edge positions
        if (!isValidEdgeRotation(assetPath, rotation, col, row)) {
          continue;
        }

        // For the first tile, accept any configuration that satisfies edge constraints
        const isFirstTile = cells.every(row => row.every(cell => !cell.imageObject));
        if (isFirstTile || hasValidConnection(col, row, assetPath, rotation)) {
          validConfigs.push({
            image: images[assets.indexOf(assetPath)],
            rotation: rotation
          });
        }
      }
    }

    return validConfigs;
  }

  // Helper function to get valid rotations
  function getValidRotations(assetPath) {
    if (oneToNone.includes(assetPath)) return [0, 90, 180, 270];
    if (oneToOne.includes(assetPath)) return [0, 180];
    if (oneToOneAngled.includes(assetPath)) return [0, 90, 180, 270];
    if (oneToOneTwo.includes(assetPath)) return [0, 90, 180, 270];
    if (oneToOneThree.includes(assetPath)) return [0, 90, 180, 270];
    return [0];
  }

  // Helper function to get empty neighbors
  function getEmptyNeighbors(col, row) {
    const neighbors = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // left, right, up, down

    for (const [dx, dy] of directions) {
      const newCol = col + dx;
      const newRow = row + dy;
      if (newCol >= 0 && newCol < columns &&
        newRow >= 0 && newRow < rows &&
        !cells[newCol][newRow].imageObject) {
        neighbors.push([newCol, newRow]);
      }
    }
    return neighbors;
  }

  // Helper function to find a random empty cell
  function findRandomEmptyCell() {
    const emptyCells = [];
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        if (!cells[i][j].imageObject) {
          emptyCells.push([i, j]);
        }
      }
    }
    return emptyCells.length > 0 ?
      emptyCells[Math.floor(Math.random() * emptyCells.length)] :
      null;
  }

  // Fill cells starting from random positions
  let cellsToFill = [[
    Math.floor(Math.random() * columns),
    Math.floor(Math.random() * rows)
  ]];

  while (cellsToFill.length > 0 && attempts < maxAttempts) {
    attempts++;
    const [currentCol, currentRow] = cellsToFill.pop();

    if (cells[currentCol][currentRow].imageObject) continue;

    // Find valid configurations for this position
    const validConfigs = findValidConfiguration(currentCol, currentRow);

    if (validConfigs.length > 0) {
      // Reset attempts counter when we successfully place a tile
      attempts = 0;

      // Choose a random valid configuration
      const config = validConfigs[Math.floor(Math.random() * validConfigs.length)];

      // Place the tile
      cells[currentCol][currentRow].imageObject = config.image;
      cells[currentCol][currentRow].rotation = config.rotation;

      // Draw the cell and wait
      cells[currentCol][currentRow].draw();
      await new Promise(resolve => setTimeout(resolve, 30));

      // Add empty neighbors to the fill queue
      const emptyNeighbors = getEmptyNeighbors(currentCol, currentRow);
      cellsToFill.push(...emptyNeighbors);
    }

    // If no neighbors to fill, find a new random empty cell
    if (cellsToFill.length === 0) {
      const nextCell = findRandomEmptyCell();
      if (nextCell) {
        cellsToFill.push(nextCell);
      }
    }
  }

  // If we hit the maximum attempts, fill remaining cells with valid configurations
  if (attempts >= maxAttempts) {
    console.log("Pattern generation reached maximum attempts, filling remaining cells...");

    // Fill any remaining empty cells with whatever configurations are valid
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        if (!cells[i][j].imageObject) {
          const validConfigs = findValidConfiguration(i, j);
          if (validConfigs.length > 0) {
            const config = validConfigs[Math.floor(Math.random() * validConfigs.length)];
            cells[i][j].imageObject = config.image;
            cells[i][j].rotation = config.rotation;
            cells[i][j].draw();
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
    }
  }

  updateImageCounts();
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

function updateImageCounts() {
  // Reset all counts
  const counts = new Array(assets.length).fill(0);

  // Count occurrences
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      if (cells[x][y].imageObject) {
        const index = images.indexOf(cells[x][y].imageObject);
        if (index !== -1) {
          counts[index]++;
        }
      }
    }
  }

  // Update count elements
  counts.forEach((count, index) => {
    const countElement = select('#count-' + index);
    if (countElement) {
      countElement.html(count);
    }
  });
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
  background(220);
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      cells[x][y].draw();
    }
  }

  // Update the counts
  updateImageCounts();
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

