function createBoard () {
    const table = document.querySelector('.table');

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row',row);
            cell.setAttribute('data-column',col);
            if (row == 3 && col == 3) {
                cell.setAttribute('data-empty', '1');
            }
            table.appendChild(cell);
        }
    }

    const cells = document.querySelectorAll('[data-row][data-column]');
    cells.forEach(cell => {
        const row = cell.dataset.row;
        const col = cell.dataset.column;
        cell.setAttribute('data-img',`${row}${col}`);
        cell.style.backgroundPosition = imgPos(cell);
    });
}

function imgPos (cell) {
    let imgData = cell.getAttribute('data-img');
    let col = parseInt(imgData[0]);
    let row = parseInt(imgData[1]);
    let x = row * -100;
    let y = col * -100;

    return `${x}px ${y}px`;
}