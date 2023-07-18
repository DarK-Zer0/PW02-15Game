function createBoard () {
    const table = document.querySelector('.board');

    // Creates 4 rows
    for (let row = 0; row < 4; row++) {
        // Creates 4 columns
        for (let col = 0; col < 4; col++) {
            // Makes a new div w/ a class: cell
            const cell = document.createElement('div');
            cell.classList.add('cell');
            // Stores the correct location of the cell
            cell.setAttribute('data-row',row);
            cell.setAttribute('data-column',col);
            if (row == 3 && col == 3) { // Adds cell 16 to the board and makes it empty
                cell.setAttribute('data-empty', '1');
                table.appendChild(cell);
            } else { // Adds cells 1-15 to the board
                // Gives each cell a number to display over themself
                const number = document.createTextNode(row * 4 + col + 1);
                cell.appendChild(number);
                table.appendChild(cell);
            }
        }
    }

    // Gathers all cells w/ data-row & data-column attributes
    const cells = document.querySelectorAll('[data-row][data-column]');
    cells.forEach(cell => {
        const row = cell.dataset.row;
        const col = cell.dataset.column;
        // Sets the portion of the image the selected cell will contain by default
        cell.setAttribute('data-img',`${row}${col}`);
        cell.style.backgroundPosition = imgPos(cell);
    });
}

// Retrieves the portion of the image of a cell based on its stored data-img attribute
function imgPos (cell) {
    let imgData = cell.getAttribute('data-img');
    let col = parseInt(imgData[0]);
    let row = parseInt(imgData[1]);
    let x = row * -100;
    let y = col * -100;

    return `${x}px ${y}px`;
}

// Detects if a neighbor cell is the empty cell and returns a data-img value 
function nearEmpty (cell) {
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
    return `${emptyRow}${emptyCol}`;
}