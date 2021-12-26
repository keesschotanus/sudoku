import Cell from './cell.js';
import SudokuView from './sudoku-view.js';
export type InvalidCell = { cell: Cell, house: string, digit: number };

/**
 * A Sudoku is a puzzle. 
 * The board is a 9 x 9 grid divided into 3 x 3 sub-grids.
 * Each row, column and sub-grid should contain the numbers 1 - 9.
 * This class aids in solving a Sudoku.
 * I wrote this program to get some understanding of TypeScript.
 * If you really need great support for solving a Sudoku, try
 * <a href="https://www.sudoku-solutions.com/">Sudoku Solutions</a>
 * for example.
 * That being said, this program contains readable source code
 * and can be upgraded to include more fancy techniques.
 * It will also actually solve any Sudoku using back-tracking.
 */
export default class Sudoku {

  rowModel: Cell[][] = new Array(9);
  colModel: Cell[][] = new Array(9);
  blockModel: Cell[][] = new Array(9);

  // The view in the MVC pattern
  sudokuView: SudokuView;

  currentRow = 0;
  currentCol = 0;

  /**
   * Creates a Sudoku object by creating the different models
   * plus the view.
   * The models are created to simply access all rows, columns and blocks.
   * The block model for example puts each 3 x 3 block in its own row
   * of 9 columns.
   * If the first 3 x 3 block contains the following numbers:
   * 132
   * 465
   * 798
   * then blockModel[0] would contain: [1,3,2,4,6,5,7,9,8]
   * I decided against using one model consisting of 27 rows
   * where the first 9 rows would be columns, then 9 rows for columns
   * and finally 9 rows for blocks.
   * Mainly because processing all rows, columns and blocks can easily be combined.
   * 
   * Some jargon used in this class.
   * Every element in the 9 x 9 grid is called a cell.
   * Every row, column and block is called a house.
   */
  constructor() {
    this.createRowModel();
    this.createColumnModel();
    this.createBlockModel();

    this.sudokuView = new SudokuView(this);
    this.sudokuView.renderSudoku();
  }

  /**
   * Creates the row model which is actually the 9 x 9 grid.
   */
  private createRowModel() {
    for (let row = 0; row < 9; ++row) {
      this.rowModel[row] = new Array(9);

      for (let col: number = 0; col < 9; ++col) {
        this.rowModel[row][col] = new Cell(row, col);
      }
    }
  }

  /**
   * Creates the column model.
   * The first row in this model contains all cells of the first row.
   */
  private createColumnModel() {
    for (let col = 0; col < 9; ++col) {
      this.colModel[col] = new Array(9);
      for (let row = 0; row < 9; ++row) {
        this.colModel[col][row] = this.rowModel[row][col];
      }
    }
  }

  /**
   * Creates the block model.
   * The first row in this model contains all cells of the first block.
   */
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

  /**
   * Processes all cells of the Sudoku, by row and column.
   * @param callback Function that accepts the cell to process.
   */
  public forEachCell(callback: (cell: Cell) => void): void {
    for (let row = 0; row < 9; ++row) {
      for (let col = 0; col < 9; ++col) {
        let cell = this.rowModel[row][col];
        callback(cell);
      }
    }
  }

  /**
   * Processes all cells of the Sudoku by house.
   * @param callback Function that accepts an arrays of all the cells in the house,
   *  and the description of the house ("row", "column", or "block".
   */
  public forEachHouse(callback: (cells: Cell[], house: string) => void): void {
    for (let index = 0; index < 9; ++index) {
      callback(sudoku.rowModel[index], "row");
      callback(sudoku.colModel[index], "column");
      callback(sudoku.blockModel[index], "block");
    }
  }

  /**
    * Tests whether this Sudoku is valid or not.
    * A Sudoku is valid if each row, column and block does not contain a duplicate (non zero) digit.
    * @returns An array of all the offending cells.
    */
  validate(): InvalidCell[] {
    const result: InvalidCell[] = [];
    this.forEachHouse((cells: Cell[], houseName: string) => {
      for (let digit = 1; digit <= 9; ++digit) {
        let cellsWithThisDigit = cells.filter((cell: Cell) => cell.val == digit);
        if (cellsWithThisDigit.length > 1) {
          for (let cell of cellsWithThisDigit) {
            result.push({cell, house: houseName, digit});
          }
        }
      }
    });
    return result;
  }

  /**
   * Resets all pencil marks to 1..9 for every cell.
   */
  public resetPencilMarks() {
    this.forEachCell((cell: Cell) => {
      for (let i = 0; i < 10; ++i) {
        cell.candidates[i] = i;
      }
    });
  }

  /**
   * Updates all pencil marks by looking at every cell to see if has a value other than 0.
   * If so, then this value is removed as a possible candidate from every cell
   * in the same row, column and block.
   */
  public updatePencilMarks() {
    this.forEachCell((cell: Cell) => {
      if (cell.val !== 0) {
        for (let i = 0; i < 9; ++i) {
          this.rowModel[cell.row][i].candidates[cell.val] = 0;
          this.colModel[cell.col][i].candidates[cell.val] = 0;
          this.blockModel[cell.block][i].candidates[cell.val] = 0;
        }
      }
    });
  }

  /**
   * Removes all the supplied candidates from all cells in the supplied house,
   * except for the supplied cells that should not be touched.
   * @param house The house with the cells to process.
   * @param cellsToNotTouch The cells we should not touch.
   *  This should be a subset of all the cells in the supplied house.
   * @param candidates The candidate values that should be removed.
   */
  private removePencilMarks(house: Cell[], cellsToNotTouch: Cell[], candidates: number[]) {
    house.forEach((cell: Cell) => {
      if (!cellsToNotTouch.includes(cell)) {
        candidates.forEach((digit: number) => {
          cell.candidates[digit] = 0;
        });
      }
    });
  }

  /**
   * Removes all candidates from the supplied cells that are nt present in the supplied combination.
   * @param cells Cells to remove pencil marks from.
   * @param combination The combination of candidates that should not be removed.
   */
  removePencilMarks2(cells: Cell[], combination: number[]) {
    cells.forEach(cell => {
      cell.getCandidates().forEach(candidate => {
        if (!combination.includes(candidate)) {
          console.log('Removing candidate', candidate, 'from cell:', cell)
          cell.candidates[candidate] = 0;
          console.log('Removed candidate', candidate, 'from cell:', cell)
        }
      });
    });
  }

  /**
   * Finds naked values in all the cells.
   * A naked single for example is a cell that only has one possible candidate.
   * To find naked singles you will have to supply a size of 1.
   * For finding naked doubles you would have to supply a size of 2.
   * In this case the algorithm will find two cells in the same house
   * with the same 2 possible candidates.
   * When naked values are found, the values are removed from the remaining
   * cells in the same house.
   * @param size The number of values we are looking for.
   * @returns All the cells with the supplied size of naked values.
   */
  public findNakedValues(size: number): Cell[] {
    this.updatePencilMarks();
    const result: Cell[] = [];
    this.forEachHouse((cells: Cell[], houseName) => {
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
            this.removePencilMarks(cells, matchingCells, matchingCells[0].getCandidates());
            result.push(...matchingCells);
          }
        }
      });
    });

    return result;
  }

  /**
   * Finds pointing values.
   * When a row or column in a block is the only row or column
   * containing a certain digit as a candidate, then the same digit
   * can be removed from other blocks  in the same row or column.
   * Assume for example that only the first three cells of the second row
   * have 1 as a candidate and the remaining cells in the block do not.
   * Then 1 can be removed as a candidate from the other cells in the same row.
   * @returns All the cells with candidates that are removed.
   */
  public findPointingValues(): Cell[] {
    this.updatePencilMarks();
    const result: Cell[] = [];
    for (let rc = 0; rc < 9; ++rc) {
      for (let treeCells = 0; treeCells < 3; ++treeCells) {
        const threeRowCells = this.rowModel[rc].slice(treeCells * 3, treeCells * 3 + 3);
        this.findPointingValuesForCells(threeRowCells, this.blockModel[threeRowCells[0].block], this.rowModel[rc]);

        const threeColCells = this.colModel[rc].slice(treeCells * 3, treeCells * 3 + 3);
        this.findPointingValuesForCells(threeColCells, this.blockModel[threeColCells[0].block], this.colModel[rc]);
      }
    }
    
    return result;
  }

  private findPointingValuesForCells(threeCells: Cell[], blockCells: Cell[], houseCells: Cell[]) {
    // Check if the "three cells" contain digits not occurring in the "block cells"
    for (let digit = 1; digit <= 9; ++digit) {
      threeCells.forEach((cell: Cell) => {
        if (cell.val == 0 && cell.candidates[digit] === digit) {
          // Check if the remaining cells in the block do not contain the digit
          if (!blockCells.some((blockCell: Cell) => blockCell.val === 0 && blockCell.candidates[digit] === digit && !blockCell.inSet(threeCells))) {
            // Remove the digit as a candidate from the supplied house cells
            houseCells.forEach((houseCell: Cell) => {
              if (!houseCell.inSet(threeCells) && houseCell.val === 0 && houseCell.candidates[digit] === digit) {
                console.log(`Can remove digit: ${digit} from cell: ${houseCell}`);
                houseCell.candidates[digit] = 0;
              }
            });
          }
        }
      });
    }
  }
  
  public findHiddenSingles(): Cell[] {
    this.updatePencilMarks();
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

  public findHiddenValues(size: number): Cell[] {
    this.updatePencilMarks();
    const result: Cell[] = [];

    this.forEachHouse((houseCells: Cell[], houseName: string) => {
      this.findHiddenValuesInHouse(size, houseCells);
    });

    return result;
  }

  private findHiddenValuesInHouse(size: number, houseCells: Cell[]): Cell[] {
    const result: Cell[] = [];

    houseCells.forEach((houseCell, houseCellIndex) => {
      // Next if statement makes sure that we are not finding naked values
      if (houseCell.getNumberOfCandidates() > size && houseCell.val === 0) {
        const houseCellCombinations = houseCell.getCombinationsOfCandidates(size);
        houseCellCombinations.forEach(houseCellCombination => {
          const cellsWithSameCombination = this.findOtherCellsWithCombination(houseCellCombination, houseCells, houseCellIndex);
          if (cellsWithSameCombination.length + 1 === houseCellCombination.length) {
            cellsWithSameCombination.push(houseCell);

            if (this.check(houseCells, cellsWithSameCombination, houseCellCombination)) {
              console.log('Before remove', cellsWithSameCombination, '#', houseCellCombination, '#');
              this.removePencilMarks2(cellsWithSameCombination, houseCellCombination);
            }
          }
        });
      }
    });

    return result;
  }

  private findOtherCellsWithCombination(combination: number[], houseCells: Cell[], cellIndex: number): Cell[] {
    const result: Cell[] = [];

    houseCells.forEach((cell, houseCellIndex) => {
      if (cellIndex !== houseCellIndex && houseCells[houseCellIndex].val === 0) {
        let cellCombinations = cell.getCombinationsOfCandidates(combination.length);
        cellCombinations.forEach(cellCombination => {
          if (this.areCombinationsEqual(combination, cellCombination)) {
            result.push(houseCells[houseCellIndex]);
          }
        });
      }
    });

    return result;
  }

  private areCombinationsEqual(combinationOne: number [], combinationTwo: number []): boolean {
    let result = combinationOne.length === combinationTwo.length;
    for (let i = 0; result && i < combinationOne.length; ++i) {
      result = combinationOne[i] === combinationTwo[i];
    }

    return result;
  }

  private check(houseCells: Cell[], cellsWithSameCombination: Cell[], combination: number[]): boolean {
    let result = true;
    const filteredHouseCells = houseCells.filter(houseCell => !cellsWithSameCombination.includes(houseCell));
    filteredHouseCells.forEach(filteredHouseCell => {
      combination.forEach(digit => {
        if (filteredHouseCell.val === 0 && filteredHouseCell.candidates[digit] !== 0) {
          result = false;
        }
      });
    });

    return result;
  }

  /**
   * Creates a representation of the Sudoku board.
   * @returns A representation of the Sudoku board.
   */
  public toString(): string {
    let result = ''
    for (let row = 0; row < 9; ++row) {
      for (let col = 0; col < 9; ++col) {
        result += +sudoku.rowModel[row][col].val;
      }
      result += '\n';
    }

    for (let row = 0; row < 9; ++row) {
      for (let col = 0; col < 9; ++col) {
        result += `${row}:${col}:${sudoku.rowModel[row][col].val} = ${sudoku.rowModel[row][col].candidates}\n`;
      }
    }

    return result;
  }
}

let sudoku: Sudoku;
document.addEventListener('DOMContentLoaded', event => {
  sudoku = new Sudoku();
});


