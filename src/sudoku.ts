import Cell from './cell.js';
import SudokuView from './sudoku-view.js';

let sudoku: Sudoku;
document.addEventListener('DOMContentLoaded', event => {
  sudoku = new Sudoku();
});


export default class Sudoku {
  rowView: Cell[][] = new Array(9);
  colView: Cell[][] = new Array(9);
  blockView: Cell[][] = new Array(9);
  sudokuView: SudokuView;

  currentRow = 0;
  currentCol = 0;

  constructor() {
    this.createRowModel();
    this.createColumnModel();
    this.createBlockModel();

    this.sudokuView = new SudokuView(this);
    this.sudokuView.renderSudoku();
  }

  private createRowModel() {
    for (let row = 0; row < 9; ++row) {
      this.rowView[row] = new Array(9);

      for (let col: number = 0; col < 9; ++col) {
        this.rowView[row][col] = new Cell(row, col);
      }
    }
  }

  private createColumnModel() {
    for (let col = 0; col < 9; ++col) {
      this.colView[col] = new Array(9);
      for (let row = 0; row < 9; ++row) {
        this.colView[col][row] = this.rowView[row][col];
      }
    }
  }

  private createBlockModel() {
    for (let block = 0; block < 9; ++block) {
      this.blockView[block] = new Array(9);

      let blockRow = Math.floor(block / 3);
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
      let cellsWithThisDigit = cells.filter((cell: Cell) => cell.val == digit);
      if (cellsWithThisDigit.length > 1) {
        for (let cell of cellsWithThisDigit) {
          console.log('v' + cell.row + cell.col);
          let sudokuCellElement = document.getElementById(SudokuView.idFromRowCol(cell.row, cell.col)) as HTMLDivElement;
          sudokuCellElement.classList.add('error');
          sudokuCellElement.setAttribute("title", "This " + cellType + ", already contains the digit " + digit);
        }
      }
    }
  }

  public toString(): string {
    let result = ''
    for (let row = 0; row < 9; ++row) {
      for (let col = 0; col < 9; ++col) {
        result += +sudoku.rowView[row][col].val;
      }
      result += '\n';
    }

    return result;
  }


}
