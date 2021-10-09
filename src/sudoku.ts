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
        divCell.className = 'sudoku-cell hidden';
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
      let cellsWithThisDigit = cells.filter((cell: Cell) => cell.val == digit);
      if (cellsWithThisDigit.length > 1) {
        for (let cell of cellsWithThisDigit) {
          console.log('v' + cell.row + cell.col);
          let sudokuCellElement = document.getElementById(Util.idFromRowCol(cell.row, cell.col)) as HTMLDivElement;
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

  onCellClick(this: HTMLDivElement, event: MouseEvent) {
    let id = this.getAttribute('id') as string;
    [sudoku.currentRow, sudoku.currentCol] = Util.rowColFromId(id);

    Util.clearStyleFromAllCells();
    this.classList.add('selected');
  }

  onKey(this: Document, event: KeyboardEvent) {
    let cell = document.getElementById(Util.idFromRowCol(sudoku.currentRow, sudoku.currentCol)) as HTMLDivElement;

    switch (event.key) {
      case '`':
        console.log(sudoku.toString());
        break;
      case '0':
        cell.classList.add('hidden');
        cell.innerText = '' + event.key;
        sudoku.rowView[sudoku.currentRow][sudoku.currentCol].val = +event.key;
        break;
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
        cell.classList.remove('hidden');
        sudoku.rowView[sudoku.currentRow][sudoku.currentCol].val = +event.key;
        break;
      case 'ArrowLeft':
        cell.classList.remove('selected');
        sudoku.currentCol = sudoku.currentCol === 0 ? 8 : --sudoku.currentCol;
        Util.selectCell(sudoku.currentRow, sudoku.currentCol);
        break;
      case 'ArrowRight':
        cell.classList.remove('selected');
        sudoku.currentCol = sudoku.currentCol === 8 ? 0 : ++sudoku.currentCol;
        Util.selectCell(sudoku.currentRow, sudoku.currentCol);
        break;
      case 'ArrowUp':
        cell.classList.remove('selected');
        sudoku.currentRow = sudoku.currentRow === 0 ? 8 : --sudoku.currentRow;
        Util.selectCell(sudoku.currentRow, sudoku.currentCol);
        break;
      case 'ArrowDown':
        cell.classList.remove('selected');
        sudoku.currentRow = sudoku.currentRow === 8 ? 0 : ++sudoku.currentRow;
        Util.selectCell(sudoku.currentRow, sudoku.currentCol);
        break;

    }

    console.log('key:' + event.key);

  }

}
