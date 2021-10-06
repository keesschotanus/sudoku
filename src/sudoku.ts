import Cell from './cell.js';
import Util from './util.js';

let sudoku: Sudoku;
document.addEventListener('DOMContentLoaded', event => {
  sudoku = new Sudoku();
  document.addEventListener('keydown', sudoku.onKey);

  document.getElementById('validateButton')?.addEventListener('click', sudoku.validate);
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
        divCell.id = Util.idFromRowCol(blockRow * 3 + row, blockCol * 3 + col);
        divCell.innerText = '0';
        divCell.addEventListener('click', this.onCellClick);

        divBlock.appendChild(divCell);
      }
    }

    let sudokuContainer: HTMLDivElement = document.getElementById("sudoku") as HTMLDivElement;
    sudokuContainer.appendChild(divBlock);
  }

  /*
    * Tests whether this Sudoku is valid or not.
    * A Sudoku is valid if each row, column and block does not contain a duplicate (non zero) digit.
    * Duplicates are marked by adding the class name "error" to all offending cells.
    */
  validate(this: HTMLButtonElement) {
    for (let index = 0; index < 9; ++index) {
      sudoku.validateCells(sudoku.rowView[index], "row");
      sudoku.validateCells(sudoku.colView[index], "column");
      sudoku.validateCells(sudoku.blockView[index], "block");
    }
  }

  /*
   * Determines if the supplied sudokuCells don't contain a duplicate (non zero digit).
   * @param sudokuCells The Sudoku cells to check.
   * @param sudokuCellContainer The name of the container of the supplied sudokuCells.
   *  Should be one of: row, column or block. 
   */
  private validateCells(cells: Cell[], cellType: "row" | "column" | "block") {
    for (let digit = 1; digit <= 9; ++digit) {
      let cellsWithDuplicateDigits = cells.filter((cell: Cell) => cell.val == digit);
      for (let cell of cellsWithDuplicateDigits) {
          let sudokuCellElement = document.getElementById(Util.idFromRowCol(cell.row, cell.col)) as HTMLDivElement;
          sudokuCellElement.classList.add('error');
          sudokuCellElement.setAttribute("title", "This " + cellType + ", already contains the digit " + digit);
        }
    }
  }

  onCellClick(this: HTMLDivElement, event: MouseEvent) {
    const previousCell = document.getElementById(Util.idFromRowCol(sudoku.currentRow, sudoku.currentCol)) as HTMLDivElement;
    previousCell.classList.remove('selected');

    let id = this.getAttribute('id') as string;
    console.log(id);
    [sudoku.currentRow, sudoku.currentCol] = Util.rowColFromId(id);

    console.log(sudoku.currentRow, sudoku.currentCol);

    this.classList.add('selected')
  }

  onKey(this: Document, event: KeyboardEvent) {
    let cell = document.getElementById(Util.idFromRowCol(sudoku.currentRow, sudoku.currentCol)) as HTMLDivElement;

    switch (event.key) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        cell.innerText = '' + event.key;
        sudoku.rowView[sudoku.currentRow][sudoku.currentCol].val = +event.key;
        break;
      case 'ArrowLeft':
        cell.classList.remove('selected');
        sudoku.currentCol = sudoku.currentCol === 0 ? 8 : --sudoku.currentCol;
        cell = document.getElementById(Util.idFromRowCol(sudoku.currentRow, sudoku.currentCol)) as HTMLDivElement;
        cell.classList.add('selected');
        break;
      case 'ArrowRight':
        cell.classList.remove('selected');
        sudoku.currentCol = sudoku.currentCol === 8 ? 0 : ++sudoku.currentCol;
        cell = document.getElementById(Util.idFromRowCol(sudoku.currentRow, sudoku.currentCol)) as HTMLDivElement;
        cell.classList.add('selected');
        break;
      case 'ArrowUp':
        cell.classList.remove('selected');
        sudoku.currentRow = sudoku.currentRow === 0 ? 8 : --sudoku.currentRow;
        cell = document.getElementById(Util.idFromRowCol(sudoku.currentRow, sudoku.currentCol)) as HTMLDivElement;
        cell.classList.add('selected');
        break;
      case 'ArrowDown':
        cell.classList.remove('selected');
        sudoku.currentRow = sudoku.currentRow === 8 ? 0 : ++sudoku.currentRow;
        cell = document.getElementById(Util.idFromRowCol(sudoku.currentRow, sudoku.currentCol)) as HTMLDivElement;
        cell.classList.add('selected');
        break;

    }

    console.log('key:' + event.key);

  }

}
