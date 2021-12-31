import Cell from "./cell";
import Sudoku, { InvalidCell } from "./sudoku";

/**
 * The Sudoku view
 */
export default class SudokuView {
  private model: Sudoku;

  private currentRow = 0;
  private currentCol = 0;

  /**
   * All CSS classes related to the different solving algorithms.
   */
  private static cssClassesForSolvedCells = ['hidden-single', 'hidden-double', 'naked-single', 'naked-double', 'pointing-value'];

  /**
   * Creates this view from the supplied model.
   * Adds all the event listeners.
   * @param model The Sudoku model.
   */
  constructor(model: Sudoku) {
    this.model = model;
    document.addEventListener('keydown', this.onKey);
    document.getElementById('exampleButton')?.addEventListener('click', this.example);
    document.getElementById('nakedSinglesButton')?.addEventListener('click', this.nakedSingles);
    document.getElementById('nakedDoublesButton')?.addEventListener('click', this.nakedDoubles);
    document.getElementById('hiddenSinglesButton')?.addEventListener('click', this.hiddenSingles);
    document.getElementById('hiddenDoublesButton')?.addEventListener('click', this.hiddenDoubles);
    document.getElementById('pointingValuesButton')?.addEventListener('click', this.pointingValues);
  }

  /**
   * Renders (displays) the entire Sudoku.
   */
   public renderSudoku() {
    for (let blockRow = 0; blockRow < 3; ++blockRow) {
      for (let blockCol = 0; blockCol < 3; ++blockCol) {
        this.renderBlock(blockRow, blockCol);
      }
    }
  }

  /**
   * Renders a single 3x3 block.
   * @param blockRow Row 0, 1 or 2.
   * @param blockCol Col 0, 1 or 2.
   */
  private renderBlock(blockRow: number, blockCol: number) {
    const divBlock = document.createElement('div');
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
        divCell.id = SudokuView.idFromRowCol(blockRow * 3 + row, blockCol * 3 + col);
        divCell.innerText = '0';
        divCell.addEventListener('click', this.onCellClick);

        divBlock.appendChild(divCell);
      }
    }

    const sudokuContainer: HTMLDivElement = document.getElementById("sudoku") as HTMLDivElement;
    sudokuContainer.appendChild(divBlock);
  }

  /**
   * Converts the supplied row and col to a string that represents the value of the HTML id attribute.
   * This is the opposite of {@link #rowColFromId}.
   * @param row The zero based row number.
   * @param col The zero based column number.
   * @returns The value of the HTML id attribute corresponding to the supplied row and col.
   *  For row #2 and col #3, 'id23' is returned.
   */
  private static idFromRowCol(row: number, col: number): string {
    return `id${row}${col}`
  }

  /**
   * Converts the id of a cell to a row and column.
   * This is the opposite of {@link #idFromRowCol}.
   * @param id id of a Sudoku cell.
   * @returns zero based row and column number.
   */
  private  static rowColFromId(id: string): [number, number] {
    return [+id.substr(2, 1), +id.substr(3, 1)];
  }

  /**
   * Executes the supplied callback function for every Sudoku cell.
   * @param callback Function that accepts a single Sudoku cell.
   */
  private static forEachCell(callback: (cell: HTMLDivElement) => void): void {
    for (let row = 0; row < 9; ++row) {
      for (let col = 0; col < 9; ++col) {
        let cell = document.getElementById(SudokuView.idFromRowCol(row, col)) as HTMLDivElement;
        callback(cell);
      }
    }
  }

  /**
   * Clears all the supplied css classes from all cells.
   * @param cssClasses Classes to clear.
   */
  private  static clearClassesFromAllCells(...cssClasses: string[]) {
    SudokuView.forEachCell((cell: HTMLDivElement) => {
      cell.classList.remove(...cssClasses);
    });
  }

  /**
   * Process clicking a cell with the mouse, 
   * by deselecting the current cell and then selecting the new cell.
   * @param event MouseEvent.
   */
  private onCellClick = (event: MouseEvent) => {
    // Deselect the current cell
    const currentCellDiv = document.getElementById(SudokuView.idFromRowCol(this.currentRow, this.currentCol)) as HTMLDivElement;
    currentCellDiv.classList.remove('selected');

    // Select the new cell
    const newCellDiv =  event.target as HTMLDivElement;
    newCellDiv.classList.add('selected');
    const id = newCellDiv.getAttribute('id') as string;
    [this.currentRow, this.currentCol] = SudokuView.rowColFromId(id);
  }

  /**
   * Processes all keyboard events.
   * - Entering a number from 0 to 9 in a cell
   * - Using an arrow key to select a cell
   * - backtick to display the Sudoku model in the console.
   * @param event KeyboardEvent.
   */
  private onKey = (event: KeyboardEvent) => {
    const cell = document.getElementById(SudokuView.idFromRowCol(this.currentRow, this.currentCol)) as HTMLDivElement;

    switch (event.key) {
      case '`':
        console.log(this.model.toString());
        break;
      case '0':
        cell.classList.add('hidden');
        cell.innerText = '' + event.key;
        this.model.setCellValue(this.currentRow, this.currentCol, +event.key);
        this.model.resetPencilMarks();
        this.validate();
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
        cell.classList.remove('hidden', ...SudokuView.cssClassesForSolvedCells);
        this.model.setCellValue(this.currentRow, this.currentCol, +event.key);
        if (this.model.getCellValue(this.currentRow, this.currentCol) !== +event.key) {
          this.model.resetPencilMarks();
        }
        this.validate();
        break;
      case 'ArrowLeft':
        this.selectCell(this.currentRow, this.currentCol === 0 ? 8 : this.currentCol - 1);
        break;
      case 'ArrowRight':
        this.selectCell(this.currentRow, this.currentCol === 8 ? 0 : this.currentCol + 1);
        break;
      case 'ArrowUp':
        this.selectCell(this.currentRow === 0 ? 8 : this.currentRow - 1, this.currentCol);
        break;
      case 'ArrowDown':
        this.selectCell(this.currentRow === 8 ? 0 : this.currentRow + 1, this.currentCol);
        break;
    }

  }

  /**
   * Selects the cell identified by the supplied row and col.
   * @param row The zero based row number.
   * @param col The zero based column number.
   */
  private selectCell(row: number, col: number): void {
    // Deselect the current cell
    const currentCell = document.getElementById(SudokuView.idFromRowCol(this.currentRow, this.currentCol)) as HTMLDivElement;
    currentCell.classList.remove('selected');

    // Select the new cell
    document.getElementById(SudokuView.idFromRowCol(row, col))?.classList.add('selected');

    // Update the model
    this.currentRow = row;
    this.currentCol = col;
  }

  /**
   * Creates an example Sudoku.
   * @param event MouseEvent.
   */
  private example = (event: MouseEvent) => {
    this.clearSudoku();

    this.setValue(0,3,6); this.setValue(0,4,9); this.setValue(0,7,1);
    this.setValue(1,4,1); this.setValue(1,6,4); this.setValue(1,8,5);
    this.setValue(2,3,3);
    this.setValue(3,4,3); this.setValue(3,7,2); this.setValue(3,8,7);
    this.setValue(4,0,3); this.setValue(4,2,6); this.setValue(4,4,2); this.setValue(4,6,5);
    this.setValue(5,1,7); this.setValue(5,2,5); this.setValue(5,3,1); this.setValue(5,7,6); this.setValue(5,8,3);
    this.setValue(6,2,9); this.setValue(6,3,7); this.setValue(7,1,2);
    this.setValue(8,0,7); this.setValue(8,1,1); this.setValue(8,2,8); this.setValue(8,3,2);
  };

  /**
   * Sets the supplied value in the cell identified by the supplied row and col.
   * @param row Zero based row number.
   * @param col Zero based column number.
   * @param val The value to set.
   */
  private setValue(row: number, col: number, val: number) {
    const viewCell = document.getElementById(SudokuView.idFromRowCol(row, col)) as HTMLDivElement;
    viewCell.innerText = '' + val;
    viewCell.classList.remove('hidden');
    this.model.setCellValue(row, col, val);
  }

  /**
   * Clears the Sudoku by setting all values in the model to 0.
   */
  private clearSudoku(): void {
    SudokuView.clearClassesFromAllCells('error', ...SudokuView.cssClassesForSolvedCells);
    SudokuView.forEachCell(cell => {
      cell.innerText = '0';
      cell.classList.add('hidden');
    });

    this.model.reset();
  }

  /**
   * Validates the Sudoku.
   * Invalid cells get a class named 'error'.
   */
  private validate():void {
    SudokuView.clearClassesFromAllCells('error');
    const invalidCells = this.model.validate();
    invalidCells.forEach((invalidCell: InvalidCell) => {
      const sudokuCellElement = document.getElementById(SudokuView.idFromRowCol(invalidCell.cell.row, invalidCell.cell.col)) as HTMLDivElement;
      sudokuCellElement.classList.add('error');
      sudokuCellElement.setAttribute("title", `The cell in this ${invalidCell.house}, contains the duplicate digit: ${invalidCell.digit}`);
    });
  };

  /**
   * Locates all the naked singles.
   * Naked single cells get a class named 'naked-single'.
   * @param event MouseEvent.
   */
  private nakedSingles = (event: MouseEvent) => {
    SudokuView.clearClassesFromAllCells(...SudokuView.cssClassesForSolvedCells);
    const nakedSingleCells = this.model.findNakedValues(1);
    nakedSingleCells.forEach((nakedSingleCell: Cell) => {
      const viewCell = document.getElementById(SudokuView.idFromRowCol(nakedSingleCell.row, nakedSingleCell.col)) as HTMLDivElement;
      const digit = nakedSingleCell.getCandidates()[0];
      viewCell.classList.add('naked-single');
      viewCell.setAttribute('title', 'Naked single, can only contain a ' + digit);
      this.setValue(nakedSingleCell.row, nakedSingleCell.col, digit);
    });
  };

  /**
   * Locates all the naked doubles.
   * Naked double cells get a class named 'naked-double'.
   * @param event MouseEvent.
   */
  private nakedDoubles = (event: MouseEvent) => {
    SudokuView.clearClassesFromAllCells(...SudokuView.cssClassesForSolvedCells);
    const nakedDoubleCells = this.model.findNakedValues(2);
    nakedDoubleCells.forEach((nakedDoubleCell: Cell) => {
      const viewCell = document.getElementById(SudokuView.idFromRowCol(nakedDoubleCell.row, nakedDoubleCell.col)) as HTMLDivElement;
      viewCell.classList.add('naked-double');
      viewCell.setAttribute('title', 'Naked double, can only contain the digits ' + nakedDoubleCell.digits);
    });
  };

  /**
   * Locates all the hidden singles.
   * Hidden single cells get a class named 'hidden-single'.
   * @param event MouseEvent.
   */
  private hiddenSingles = (event: MouseEvent) => {
    SudokuView.clearClassesFromAllCells(...SudokuView.cssClassesForSolvedCells);
    const hiddenSingleCells = this.model.findHiddenValues(1);
    hiddenSingleCells.forEach((hiddenSingleCell: Cell) => {
      const viewCell = document.getElementById(SudokuView.idFromRowCol(hiddenSingleCell.row, hiddenSingleCell.col)) as HTMLDivElement;
      viewCell.classList.add('hidden-single');
      viewCell.setAttribute('title', 'Hidden single, can only contain a ' + hiddenSingleCell.digits);
      this.setValue(hiddenSingleCell.row, hiddenSingleCell.col, Number(hiddenSingleCell.digits));
    });
  };

  /**
   * Locates all the hidden doubles.
   * Hidden double cells get a class named 'hidden-double'.
   * @param event MouseEvent.
   */
  private hiddenDoubles = (event: MouseEvent) => {
    SudokuView.clearClassesFromAllCells(...SudokuView.cssClassesForSolvedCells);
    const hiddenDoubleCells = this.model.findHiddenValues(2);
    hiddenDoubleCells.forEach((hiddenDoubleCell: Cell) => {
      const viewCell = document.getElementById(SudokuView.idFromRowCol(hiddenDoubleCell.row, hiddenDoubleCell.col)) as HTMLDivElement;
      viewCell.classList.add('hidden-double');
      viewCell.setAttribute('title', 'Hidden double, can only contain: ' + hiddenDoubleCell.digits);
    });
  };

  /**
   * Locates all the pointing values.
   * Point value cells get a class named 'pointing-value'.
   * @param event MouseEvent.
   */
  private pointingValues = (event: MouseEvent) => {
    SudokuView.clearClassesFromAllCells(...SudokuView.cssClassesForSolvedCells);
    const pointingValueCells = this.model.findPointingValues();
    pointingValueCells.forEach((pointingValueCell: Cell) => {
      const viewCell = document.getElementById(SudokuView.idFromRowCol(pointingValueCell.row, pointingValueCell.col)) as HTMLDivElement;
      viewCell.classList.add('pointing-value');
      viewCell.setAttribute('title', 'Pointing value, can only contain: ' + pointingValueCell.digits);
    });
  };

}