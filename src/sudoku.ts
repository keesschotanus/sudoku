import Cell from './cell.js';

let sudoku: Sudoku;
document.addEventListener('DOMContentLoaded', event => {
   sudoku = new Sudoku();

   document.addEventListener('keypress', sudoku.onKey);

});

export default class Sudoku {
  rowView: Cell[][] = new Array(9);
  colView: Cell[][] = new Array(9);
  blockView: Cell[][] = new Array(9);

  currentRow = 0;
  currentCol = 0;

  constructor() {
    this.createRowView();
    this.createColumnView();
    this.createBlockView();
    this.renderSudoku();
  }

  private createRowView() {
    for (let row = 0; row < 9; ++row) {
      this.rowView[row] = new Array(9);

      for (let col: number = 0; col < 9; ++col) {
        this.rowView[row][col] = new Cell(row, col);
      }
    }
  }

  private createColumnView() {
    for (let col = 0; col < 9; ++col) {
      this.colView[col] = new Array(9);
      for (let row = 0; row < 9; ++row) {
        this.colView[col][row] = this.rowView[row][col];
      }
    }
  }

  private createBlockView() {
    for (let block = 0; block < 9; ++block) {
      this.blockView[block] = new Array(9);

      /*
       * Holds the row number (0, 1 or 2) of the current block.
       * The first three blocks are at block row 0, the next three blocks are at block row 1.
       */
      let blockRow = Math.floor(block / 3);

      /*
       * Holds the column number (0, 1 or 2) of the current block.
       * The first, fourth and seventh block are at block column 0.
       */
      var blockCol = block % 3;

      // Now store the 3 x 3 cells in a single row.
      let column = 0;
      for (let cellRow = 0; cellRow <= 2; ++cellRow) {
        for (let cellCol = 0; cellCol <= 2; ++cellCol) {
          this.blockView[block][column++] = this.rowView[blockRow * 3 + cellRow][blockCol * 3 + cellCol];
        };
      };
    };
  }

  renderSudoku() {
    console.log('Rendering');

    for (let blockRow = 0; blockRow < 3; ++blockRow) {
      for (let blockCol = 0; blockCol < 3; ++blockCol) {
        this.renderBlock(blockRow, blockCol);
      }
    }
  }

  private renderBlock(blockRow: number, blockCol: number) {
    let divBlock = document.createElement('div');
    divBlock.className = 'sudoku-block';
    divBlock.className = blockRow == 1 ? divBlock.className + ' sudoku-block-middle-row' : divBlock.className;
    divBlock.className = blockCol == 1 ? divBlock.className + ' sudoku-block-middle-col' : divBlock.className;

    // Each block has another 3 x 3 grid
    for (let row = 0; row < 3; ++row) {
      for (let col = 0; col < 3; ++col) {
        let divCell = document.createElement('div');
        divCell.className = 'sudoku-cell';
        divCell.className = row == 1 ? divCell.className + ' sudoku-cell-middle-row' : divCell.className;
        divCell.className = col == 1 ? divCell.className + ' sudoku-cell-middle-col' : divCell.className;
        divCell.id = `R${blockRow * 3 + row}C${blockCol * 3 + col}`;
        divCell.innerText = '0';
        divCell.addEventListener('click', this.onCellClick);

        divBlock.appendChild(divCell);
      }
    }

    let sudokuContainer: HTMLDivElement = document.getElementById("sudoku") as HTMLDivElement;
    sudokuContainer.appendChild(divBlock);
  }

  onCellClick(this: HTMLDivElement, event: MouseEvent) {
    let previousCell = document.getElementById(`R${sudoku.currentRow}C${sudoku.currentCol}`) as HTMLDivElement;
    previousCell.classList.remove('sudoku-cell-selected');

    let id = this.getAttribute('id') as string;
    sudoku.currentRow = +id.substr(1, 1);
    sudoku.currentCol = +id.substr(3, 1);

    this.classList.add('sudoku-cell-selected')
  }

  onKey(this: Document, event: KeyboardEvent) {
    console.log('key:' + event.key);

    let cell = document.getElementById(`R${sudoku.currentRow}C${sudoku.currentCol}`) as HTMLDivElement;
    cell.innerText = '' + event.key;
  }

}
