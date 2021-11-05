import Cell from './cell.js';
import SudokuView from './sudoku-view.js';

export default class Sudoku {
  rowModel: Cell[][] = new Array(9);
  colModel: Cell[][] = new Array(9);
  blockModel: Cell[][] = new Array(9);
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
      this.rowModel[row] = new Array(9);

      for (let col: number = 0; col < 9; ++col) {
        this.rowModel[row][col] = new Cell(row, col);
      }
    }
  }

  private createColumnModel() {
    for (let col = 0; col < 9; ++col) {
      this.colModel[col] = new Array(9);
      for (let row = 0; row < 9; ++row) {
        this.colModel[col][row] = this.rowModel[row][col];
      }
    }
  }

  private createBlockModel() {
    for (let block = 0; block < 9; ++block) {
      this.blockModel[block] = new Array(9);

      let blockRow = Math.floor(block / 3);
      var blockCol = block % 3;

      // Now store the 3 x 3 cells in a single row.
      let column = 0;
      for (let cellRow = 0; cellRow <= 2; ++cellRow) {
        for (let cellCol = 0; cellCol <= 2; ++cellCol) {
          this.blockModel[block][column++] = this.rowModel[blockRow * 3 + cellRow][blockCol * 3 + cellCol];
        }
      }
    }
  }

  public forEachCell(callback: (cell: Cell) => void): void {
    for (let row = 0; row < 9; ++row) {
      for (let col = 0; col < 9; ++col) {
        let cell = this.rowModel[row][col];
        callback(cell);
      }
    }
  }

  public forEachHouse(callback: (cells: Cell[], house: string) => void): void {
    for (let index = 0; index < 9; ++index) {
      callback(sudoku.rowModel[index], "row");
      callback(sudoku.colModel[index], "column");
      callback(sudoku.blockModel[index], "block");
    }
  }

  /*
    * Tests whether this Sudoku is valid or not.
    * A Sudoku is valid if each row, column and block does not contain a duplicate (non zero) digit.
    * Duplicates are marked by adding the class name "error" to all offending cells.
    */
  validate() {
    this.forEachHouse((cells: Cell[], house: string) => {
      for (let digit = 1; digit <= 9; ++digit) {
        let cellsWithThisDigit = cells.filter((cell: Cell) => cell.val == digit);
        if (cellsWithThisDigit.length > 1) {
          for (let cell of cellsWithThisDigit) {
            const sudokuCellElement = document.getElementById(SudokuView.idFromRowCol(cell.row, cell.col)) as HTMLDivElement;
            sudokuCellElement.classList.add('error');
            sudokuCellElement.setAttribute("title", `This ${house}, already contains the digit: ${digit}`);
          }
        }
      }
    });
  }

  public resetPencilMarks() {
    this.forEachCell((cell: Cell) => {
      for (let i = 0; i < 10; ++i) {
        cell.candidates[i] = i;
      }
    })
  }

  public updatePencilMarks() {
    // For each cell with a value (other than 0)
    // Remove the value as a candidate from the same row, column and block
    this.forEachCell((cell: Cell) => {
      if (cell.val != 0) {
        for (let i = 0; i < 9; ++i) {
          this.rowModel[cell.row][i].candidates[cell.val] = 0;
          this.colModel[cell.col][i].candidates[cell.val] = 0;
          this.blockModel[cell.block][i].candidates[cell.val] = 0;
        }
      }
    });
  }

  public findNaked(size: number): Cell[] {
    const result: Cell[] = [];
    this.forEachHouse((cells: Cell[], house) => {
      cells.forEach((cell: Cell, index: number) => {
        if (cell.val === 0 && cell.getNumberOfCandidates() === size) {
          // See if remaining cells have the same content as the current cell
          let matchingCells: Cell[] = new Array<Cell>();
          matchingCells.push(cell);
          for (let remainingCellIndex = index + 1; remainingCellIndex < cells.length; ++remainingCellIndex) {
            if (cells[remainingCellIndex].val === 0 && cell.hasSameCandidates(cells[remainingCellIndex])) {
              matchingCells.push(cells[remainingCellIndex]);
            }
          }
          if (matchingCells.length === size) {
            // Remove pencil amrks from the non-matching cells
            result.push(...matchingCells);
          }
        }
      });

    });

    return result;
  }

  public findHiddenSingles(): Cell[] {
    const result: Cell[] = [];

    for (let i = 0; i < 9; ++i) {
      result.push(...this.findHiddenSinglesForCells(this.rowModel[i]));
      result.push(...this.findHiddenSinglesForCells(this.colModel[i]));
      result.push(...this.findHiddenSinglesForCells(this.blockModel[i]));
    }
  
    return result;
  }

  private findHiddenSinglesForCells(cells: Cell[]): Cell[] {
    const result: Cell[] = [];
    for (let digit = 1; digit <= 9; ++digit) {
      const hiddenSingles = cells.filter((cell: Cell) => cell.val === 0 && cell.candidates[digit] === digit);
      if (hiddenSingles.length == 1) {
        const cell = hiddenSingles[0];
        cell.digit = digit;
        result.push(cell);
      }

    }

    return result;
  }

  public toString(): string {
    let result = ''
    for (let row = 0; row < 9; ++row) {
      for (let col = 0; col < 9; ++col) {
        result += +sudoku.rowModel[row][col].val;
      }
      result += '\n';
    }

    return result;
  }

}

let sudoku: Sudoku;
document.addEventListener('DOMContentLoaded', event => {
  sudoku = new Sudoku();
});

