// -----GLOBAL VARIABLES-----
// default grid size
var rows = 4, cols = 4, gridSetting = 'default',
  // time tracking
  totalSeconds = 0, timer = null, bestTime = null, 
  // move tracking
  leastMoves = null, moves = 0,
  // default background
  background, bgSetting = 'default',
  // Array of background classes
  backgrounds = ['background1', 'background2', 'background3', 'background4', 'background5'];

// -----CODE: GAME BOARD-----
// Retrieves the section of the image a cell should hold based on its stored data-img attribute
function imgPos(cell) {
  let imgData = cell.getAttribute('data-img');
  let col = parseInt(imgData[0]);
  let row = parseInt(imgData[1]);
  let x = row * (-400 / rows);
  let y = col * (-400 / cols);

  return `${x}px ${y}px`;
}
// Loads the image section based on the stored data-img
function loadImg(cell) {
  cell.style.backgroundPosition = imgPos(cell);
}
function createBoard() {
  // Randomizes the background image chosen on start
  if (bgSetting == 'default') {
    randomBackground();
  }

  const table = document.querySelector('.board');

  for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
          // Makes a new div w/ a class: cell
          const cell = document.createElement('div');
          cell.classList.add('cell');
          cell.classList.add(background);
          // Stores the location of the cell
          cell.setAttribute('data-row',row);
          cell.setAttribute('data-column',col);
          if (row == rows-1 && col == cols-1) { // Adds cell 16 to the board and makes it empty
              cell.setAttribute('data-empty','1');
              table.appendChild(cell);
          } else { // Adds cells 1-15 to the board
              // Gives each cell a number to display over themself
              const number = document.createTextNode(row * cols + col + 1);
              cell.appendChild(number);
              table.appendChild(cell);
          }
          // Adds an event listener to the cell that calls the swapCell function when clicked
          cell.addEventListener('click', () => {
              shiftCell(cell);
          });
      }
  }

  // Gathers all cells w/ data-row & data-column attributes
  const cells = document.querySelectorAll('[data-row][data-column]');
  cells.forEach(cell => {
      const row = cell.dataset.row;
      const col = cell.dataset.column;
      // Sets the portion of the image the selected cell will contain by default
      cell.setAttribute('data-img',`${row}${col}`);
      loadImg(cell);
  });
}

// -----CODE: Moving Cells-----
// Detects if a neighbor cell is the empty cell and returns a string containing the position of empty cell if true 
function nearEmpty(cell) {
    const emptyCell = document.querySelector('[data-empty]');
    const emptyRow = parseInt(emptyCell.dataset.row);
    const emptyCol = parseInt(emptyCell.dataset.column);
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.column);
    if (emptyRow == row && emptyCol == col) { // Checks if given cell is the empty cell
        return null;
    }

    // Calculates the displacement from the given cell and the empty cell
    const rowDisp = Math.abs(row - emptyRow);
    const colDisp = Math.abs(col - emptyCol);
    if (rowDisp > 1 || colDisp > 1) { // Checks if given cell and empty cell are not adjacent
        return null;
    }
    if (rowDisp == 1 && colDisp == 1) { // Checks if given cell and empty cell are diagonally adjacent
        return null;
    }
    return `${emptyRow}${emptyCol}`;
}
// Shifts a non-empty cell to the location of the empty cell
function shiftCell(cell) {
    const emptyPos = nearEmpty(cell);
    if (emptyPos == null) { // Does nothing if empty cell is not found adjacent to non-empty cell
        return;
    }

    // Swaps the data-empty attribute, moving the blank space
    const emptyCell = document.querySelector(`[data-row="${emptyPos[0]}"][data-column="${emptyPos[1]}"]`);
    emptyCell.removeAttribute('data-empty');
    cell.setAttribute('data-empty','1');

    // Swaps the data-img attribute
    const noImg = emptyCell.dataset.img;
    emptyCell.setAttribute('data-img',cell.dataset.img);
    cell.setAttribute('data-img',noImg);
        // Loads the new image section
        loadImg(emptyCell);

    // Swaps the number of the cell
    const number = cell.textContent;
    emptyCell.textContent = number;
    cell.textContent = '';

    // Check for win condition
    moves++;
    let gameOver = gameWon();
    if (gameOver) endGame();
}

// -----CODE: SHUFFLE-----
// Swaps the content of two cells
function swapCells(cell1, cell2) {
  const tempDataImg = cell1.getAttribute('data-img');
  const tempText = cell1.textContent;

  cell1.setAttribute('data-img', cell2.getAttribute('data-img'));
  cell1.textContent = cell2.textContent;

  cell2.setAttribute('data-img', tempDataImg);
  cell2.textContent = tempText;

  cell1.style.backgroundPosition = imgPos(cell1);
  cell2.style.backgroundPosition = imgPos(cell2);
}
// Shuffles the board by randomly swapping cells with the empty cell
function shuffleBoard() {
  const cells = document.querySelectorAll('.cell:not([data-empty])');

  const getRandomNeighbor = (cell) => {
    const neighbors = [];

    let emptyCell = document.querySelector('[data-empty]');
    const emptyRow = parseInt(emptyCell.dataset.row);
    const emptyCol = parseInt(emptyCell.dataset.column);

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.column);

    if (emptyRow === row) {
      if (Math.abs(emptyCol - col) === 1) {
        neighbors.push(cell);
      }
    } else if (emptyCol === col) {
      if (Math.abs(emptyRow - row) === 1) {
        neighbors.push(cell);
      }
    }

    return neighbors[Math.floor(Math.random() * neighbors.length)];
  };

  let emptyCell = document.querySelector('[data-empty]');

  for (let i = 0; i < 1000; i++) { // Repeat the shuffle process multiple times
    const randomIndex = Math.floor(Math.random() * cells.length);
    let randomCell = cells[randomIndex];
    const neighborCell = getRandomNeighbor(randomCell);

    if (neighborCell != null) {
      swapCells(neighborCell, emptyCell);
      emptyCell.removeAttribute('data-empty');
      randomCell.setAttribute('data-empty', '1');
      emptyCell = randomCell; // Update the reference to the empty cell
    }
  }
  // Initializes/Restarts the Timer
  if (!timer) {
    runTimer();
  } else {
    totalSeconds = 0;
  }
}  

// -----CODE: TIMER-----
// Keeps track of the number of minutes:seconds since the last shuffle until game ends
function runTimer() {
  // Timer Variables
  const minutesLabel = document.getElementById("minutes");
  const secondsLabel = document.getElementById("seconds");

  // Start the timer
  timer = setInterval(setTime, 1000);

  // Timer Function
  function setTime() {
      ++totalSeconds;
      secondsLabel.innerHTML = pad(totalSeconds % 60);
      minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
  }

  // Seconds Converter
  function pad(val) {
      var valString = val + "";
      if (valString.length < 2) {
          return "0" + valString;
      } else {
          return valString;
      }
  }
}
function stopTimer() {
  clearInterval(timer);
  timer = null;
}

// -----CODE: WINNING THE GAME-----
function gameWon() {
  const cells = document.querySelectorAll('.cell');
  for (const cell of cells) { // Checks if each cell is in their correct position
    const location = `${cell.dataset.row}${cell.dataset.column}`;
    const imgLocation = cell.dataset.img;
    if (location != imgLocation) return false;
  };
  return true;
}
function endGame() {
  stopTimer();

  // Show the stats of the game in a notifcation
  showGameStatus();
  // Checks if time to finsh and # of moves used is less than the best of this session
  showBest(totalSeconds);
  // Clears variables for next run
  totalSeconds = 0;
  moves = 0;
}
// Converts seconds to 'Time: minutes:seconds' format
function secToMins(seconds) {
  const min = parseInt(seconds / 60);
  const sec = seconds % 60;
  return `Time: ${min}:${sec.toString().padStart(2, '0')}`;
}
function showBest(secondsTaken) {
  if (secondsTaken < bestTime || !bestTime) bestTime = secondsTaken;
  if (moves < leastMoves || !leastMoves) leastMoves = moves;
  // Check if the container div already exists
  let container = document.querySelector('.best');
  if (!container) { // Container doesn't already exist
    // Create a container <div>
    container = document.createElement('div');
    container.className = 'best';
    document.body.appendChild(container);
    // Create a <h2> element
    const h2 = document.createElement('h2');
    h2.textContent = 'Session\'s Best';
    container.appendChild(h2);
    // Create a <p> element
    const p = document.createElement('p');
    p.innerHTML = `${secToMins(bestTime)} <br>Moves: ${leastMoves}`;
    container.appendChild(p);
  } else { // Container already exists
    const p = document.querySelector('.best p');
    p.innerHTML = `${secToMins(bestTime)} <br>Moves: ${leastMoves}`;
  }
}

// -----CODE: End-Game Notification-----
function showPopup(time, moves, isWinner) {
  const popupContainer = document.getElementById('popupContainer');
  const totalTimeElement = document.getElementById('totalTime');
  const totalMovesElement = document.getElementById('totalMoves');

  // Update the content in the pop-up
  totalTimeElement.textContent = secToMins(time);
  totalMovesElement.textContent = moves;
  // Show the pop-up container
  popupContainer.style.display = 'block';
}
function showGameStatus() {
  const won = true;
  // If the game is won, show the pop-up with the winner image and the relevant data
  showPopup(totalSeconds, moves, won); // Pass true to indicate the user wins
}
function closePopup() {
  const popupContainer = document.getElementById('popupContainer');
  popupContainer.style.display = 'none';
}

// -----CODE: CHANGEABLE GRID SIZES-----
function loadGrid() {
  // Options to Set Grid Size
  const select = document.createElement('select');
  select.id = 'gridSize';

  // Create option elements for each grid size; default = 4x4
  const gridSizes = [3, 4, 6, 8, 10];
  gridSizes.forEach(size => {
    const option = document.createElement('option');
    option.value = size;
    option.textContent = `${size}x${size}`;
    select.appendChild(option);
  });
  select.selectedIndex = 1;

  // Add event listener to call setGrid with selected grid size
  select.addEventListener('change', event => {
    const gridSize = parseInt(event.target.value);
    setGrid(gridSize);
  });

  // Add select element to .gridSize div
  const optionsDiv = document.querySelector('.gridSize');
  optionsDiv.appendChild(select);
}
function setGrid(choice) { // choice = # of rows and columns
  const cellWidth = parseInt(400 / choice);
  rows = choice;
  cols = choice;
  // Removes the old grid size
  const existingStyles = document.querySelectorAll('style');
  existingStyles.forEach(style => {
    if (style.textContent.includes('.board')) {
      style.remove();
    }
  });
  // Removes the old board
  const board = document.querySelector('div.board');
  board.innerHTML = '';
  createBoard();
  // Sets the new grid size
  const style = document.createElement('style');
  if (choice > 8) { // Sets the smallest font-size for the largest grid size
    style.textContent = `.board { grid-template-columns: repeat(${choice}, ${cellWidth}px); font-size: 22pt; }`;
  } else if (choice > 6) { // Shrinks font-size to fit on larger grid size
    style.textContent = `.board { grid-template-columns: repeat(${choice}, ${cellWidth}px); font-size: 24pt; }`;
  } else {
    style.textContent = `.board { grid-template-columns: repeat(${choice}, ${cellWidth}px); }`;
  }
  document.head.appendChild(style);
}

// -----CODE: CHANGEABLE BACKGROUNDS-----
// Randomizes the background variable referencing the backgrounds array
function randomBackground()	{
  // Chooses background randomly from backgrounds array
	background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  // Sets the background name displayed in the Image Selector to the random background selected
  imgSel = document.querySelector('div.buttonRow select#imageSelector');
  const index = parseInt(background.substring('background'.length))-1;
  imgSel.selectedIndex = index;
}
// Sets the background-image for all cells
document.addEventListener('DOMContentLoaded', function () {
  const imageSelector = document.getElementById('imageSelector');

  // When Image Selector is changed manually by the user
  imageSelector.addEventListener('change', function () {
    const selectedValue = imageSelector.value;
    background = selectedValue;
    bgSetting = 'custom'; // Stops the background from changing randomly when changing grid sizes
    const cells = document.querySelectorAll('.cell');

    // Loop through all cells and update their background class
    cells.forEach(cell => {
      // Remove existing background class
      cell.classList.remove('background1', 'background2', 'background3', 'background4', 'background5');

      // Add the selected background class
      cell.classList.add(selectedValue);
	  
    });
  });
});

