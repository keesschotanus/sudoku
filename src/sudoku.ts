import Cell from './cell.js';
import SudokuView from './sudoku-view.js';
export type InvalidCell = { cell: Cell, house: string, digit: number };

/**
 * A Sudoku is a board puzzle. 
 * The board is a 9 x 9 grid divided into 3 x 3 sub-grids.
 * Each row, column and sub-grid should contain the numbers 1 - 9.
 * This class actually solves a Sudoku.
 * I wrote this program to get some understanding of TypeScript.
 * If you really need great support for solving a Sudoku, try
 * <a href="https://www.sudoku-solutions.com/">Sudoku Solutions</a>
 * for example.
 * That being said, this program contains readable source code
 * and can be upgraded to include more fancy techniques.
 * It will also actually solve any Sudoku using back-tracking.
 */
export default class Sudoku {

  private rowModel: Cell[][] = new Array(9);
  private colModel: Cell[][] = new Array(9);
  private blockModel: Cell[][] = new Array(9);

  // The view in the MVC pattern
  private sudokuView: SudokuView;

  /**
   * Creates a Sudoku object by creating the different models plus the view.
   * The models are created to simply access all rows, columns and blocks.
   * The block model for example puts each 3 x 3 block in its own row of 9 columns.
   * If the first 3 x 3 block contains the following numbers:
   * 132
   * 465
   * 798
   * then blockModel[0] would contain: [1,3,2,4,6,5,7,9,8]
   * I decided against using one model consisting of 27 rows,
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
  private createRowModel(): void {
    for (let row = 0; row < 9; ++row) {
      this.rowModel[row] = new Array(9);

      for (let col: number = 0; col < 9; ++col) {
        this.rowModel[row][col] = new Cell(row, col);
      }
    }
  }

  /**
   * Creates the column model.
   * The first row in this model contains all cells of the first column.
   */
  private createColumnModel(): void {
    for (let col = 0; col < 9; ++col) {
      this.colModel[col] = new Array(9);
      for (let row = 0; row < 9; ++row) {
        this.colModel[col][row] = this.rowModel[row][col];
      }
    }
  }

  /**
   * Creates the block model.
   * The first row in this model contains all cells of the first 3 x 3 block.
   */
   private createBlockModel(): void {
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
   * Resets the Sudoku by clearing all cells,
   * restoring all possible candidates.
   */
  public reset(): void {
    this.forEachCell(cell => {
      cell.setVal(0);
      cell.resetCandidates();
      cell.setSolvedCandidates('');
    });
  }

  /**
   * Gets the value of a single cell.
   * @param row The zero based row number.
   * @param col The zero based column number.
   * @returns The value of the cell identified by the supplied row and col.
   * 
   */
  public getCellValue(row: number, col: number): number {
    return this.rowModel[row][col].getVal();
  }

  /**
   * Sets the value of a single cell.
   * To clear a cell, supply a val of zero.
   * @param row The zero based row number.
   * @param col The zero based column number.
   * @param val The value of the cell.
   * 
   */
  public setCellValue(row: number, col: number, val: number): void {
    this.rowModel[row][col].setVal(val);
  }

  /**
   * Executes the supplied callback function for every cell.
   * Cells are processed by row and within a row by column.
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
   * Executes the supplied callback function for every house.
   * @param callback Function that accepts an array of all the cells in the house,
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
    * Verifies whether this Sudoku is valid or not.
    * A Sudoku is valid if each row, column and block does not contain a duplicate (non zero) digit.
    * @returns An array of all the offending cells.
    */
  validate(): InvalidCell[] {
    const result: InvalidCell[] = [];
    this.forEachHouse((cells: Cell[], houseName: string) => {
      for (let digit = 1; digit <= 9; ++digit) {
        let cellsWithThisDigit = cells.filter((cell: Cell) => cell.getVal() === digit);
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
  public resetPencilMarks(): void {
    this.forEachCell((cell: Cell) => cell.resetCandidates());
  }

  /**
   * Updates all pencil marks by looking at every cell to see if has a value other than 0.
   * If so, then this value is removed as a possible candidate from every cell
   * in the same row, column and block.
   */
  public updatePencilMarks(): void {
    this.forEachCell((cell: Cell) => {
      if (cell.getVal() !== 0) {
        for (let i = 0; i < 9; ++i) {
          this.rowModel[cell.getRow()][i].clearCandidate(cell.getVal());
          this.colModel[cell.getCol()][i].clearCandidate(cell.getVal());
          this.blockModel[cell.getBlock()][i].clearCandidate(cell.getVal());
        }
      }
    });
  }

  /**
   * Removes all the supplied candidates from all the supplied cells.
   * @param cells The cells to remove candidates from.
   * @param candidates The candidate values that should be removed.
   */
  private removePencilMarks(cells: Cell[], candidates: number[]): void {
    cells.forEach((cell: Cell) => {
      candidates.forEach((digit: number) => cell.clearCandidate(digit));
    });
  }

  /**
   * Removes all candidates from the supplied cells that are not present in the supplied combination.
   * @param cells Cells to remove pencil marks from.
   * @param combination The combination of candidates that should not be removed.
   */
  private removePencilMarksWhenNotInCombination(cells: Cell[], combination: number[]) {
    cells.forEach(cell => {
      cell.getCandidates().forEach(candidate => {
        if (!combination.includes(candidate)) {
          cell.clearCandidate(candidate);
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
        if (cell.getVal() === 0 && cell.getNumberOfCandidates() === size) {
          // See if remaining cells have the same content as the current cell
          const matchingCells: Cell[] = new Array<Cell>();
          matchingCells.push(cell);
          for (let remainingCellIndex = index + 1; remainingCellIndex < cells.length; ++remainingCellIndex) {
            if (cells[remainingCellIndex].getVal() === 0 && cell.hasSameCandidates(cells[remainingCellIndex])) {
              matchingCells.push(cells[remainingCellIndex]);
            }
          }
          if (matchingCells.length === size) {
            matchingCells.forEach(matchingCell => matchingCell.setSolvedCandidates(matchingCells[0].getCandidates().toString()));
            this.removePencilMarks(this.subtractSetsOfCells(cells, matchingCells), matchingCells[0].getCandidates());
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
   * can be removed from other blocks in the same row or column.
   * Assume for example that only the first three cells of the second row
   * have 1 as a candidate and the remaining cells in the block do not.
   * Then 1 can be removed as a candidate from the other cells in the same row.
   * @returns All the cells with pointing values.
   */
  public findPointingValues(): Cell[] {
    this.updatePencilMarks();
    const result: Cell[] = [];
    for (let rc = 0; rc < 9; ++rc) {
      for (let threeCells = 0; threeCells < 3; ++threeCells) {
        const threeRowCells = this.rowModel[rc].slice(threeCells * 3, threeCells * 3 + 3);
        this.findPointingValuesForCells(threeRowCells, this.blockModel[threeRowCells[0].getBlock()], this.rowModel[rc]);

        const threeColCells = this.colModel[rc].slice(threeCells * 3, threeCells * 3 + 3);
        this.findPointingValuesForCells(threeColCells, this.blockModel[threeColCells[0].getBlock()], this.colModel[rc]);
      }
    }
    
    return result;
  }

  /**
   * Finds pointing values for the supplied cells.
   * When pointing values are found, then the candidates will be removed
   * from the house cells (unless the house cell is one of the three cells).
   * @param threeCells Three cells.
   * @param blockCells Block cells that the three cells are part of.
   * @param houseCells House cells that the three cells are port of.
   * @returns All the house cells with pointing values.
   */
  private findPointingValuesForCells(threeCells: Cell[], blockCells: Cell[], houseCells: Cell[]) {
    // Check if the "three cells" contain digits not occurring in the "block cells"
    for (let digit = 1; digit <= 9; ++digit) {
      threeCells.forEach((cell: Cell) => {
        if (cell.getVal() === 0 && cell.isCandidate(digit)) {
          // Check if the remaining cells in the block do not contain the digit
          if (!blockCells.some((blockCell: Cell) => blockCell.getVal() === 0 && blockCell.isCandidate(digit) && !blockCell.inSet(threeCells))) {
            // Remove the digit as a candidate from the supplied house cells
            houseCells.forEach((houseCell: Cell) => {
              if (!houseCell.inSet(threeCells) && houseCell.getVal() === 0 && houseCell.isCandidate(digit)) {
                houseCell.clearCandidate(digit);
              }
            });
          }
        }
      });
    }
  }

  /**
   * Finds all the hidden values of the supplied size.
   * @param size Size of hidden values.
   *  For hidden singles, supply 1, for hidden doubles supply 2.
   * @returns All cells with the hidden values.
   */
  public findHiddenValues(size: number): Cell[] {
    this.updatePencilMarks();
    const result: Cell[] = [];

    this.forEachHouse((houseCells: Cell[], houseName: string) => {
      result.push(...this.findHiddenValuesInHouse(size, houseCells));
    });

    return result;
  }

  /**
   * Finds all the hidden values of the supplied size,
   * with the cells of a single house.
   * @param size Size of hidden values.
   * @param houseCells All cells of a single house.
   * @returns All cells within the house with the hidden values.
   */
  private findHiddenValuesInHouse(size: number, houseCells: Cell[]): Cell[] {
    const result: Cell[] = [];

    houseCells.forEach((houseCell, houseCellIndex) => {
      // Next if statement makes sure that we are not finding naked values
      if (houseCell.getNumberOfCandidates() > size && houseCell.getVal() === 0) {
        const houseCellCombinations = houseCell.getCombinationsOfCandidates(size);
        houseCellCombinations.forEach(houseCellCombination => {
          const cellsWithSameCombination = this.findOtherCellsWithCombination(houseCellCombination, houseCells, houseCellIndex);
          if (cellsWithSameCombination.length + 1 === houseCellCombination.length) {
            cellsWithSameCombination.push(houseCell);
            if (this.checkOtherCellsDoNotContainCandidatesInCombination(houseCells, cellsWithSameCombination, houseCellCombination)) {
              this.removePencilMarksWhenNotInCombination(cellsWithSameCombination, houseCellCombination);
              cellsWithSameCombination.forEach(cellWithSameCombination => cellWithSameCombination.setSolvedCandidates(houseCellCombination.toString()));
              result.push(...cellsWithSameCombination);
            }
          }
        });
      }
    });

    return result;
  }

  /**
   * Finds other cells, that is except for the cell with the supplied cellIndex,
   * with the supplied combination.
   * @param combination Combination to look for in cells.
   * @param houseCells The cells to search for.
   * @param cellIndex Index of cell that we know has the supplied combination.
   * @returns All cells within the house with the supplied combination,
   *  except for the cell with the supplied cellIndex.
   */
  private findOtherCellsWithCombination(combination: number[], houseCells: Cell[], cellIndex: number): Cell[] {
    const result: Cell[] = [];

    houseCells.forEach((cell, houseCellIndex) => {
      if (cellIndex !== houseCellIndex && houseCells[houseCellIndex].getVal() === 0) {
        const cellCombinations = cell.getCombinationsOfCandidates(combination.length);
        cellCombinations.forEach(cellCombination => {
          if (this.areCombinationsEqual(combination, cellCombination)) {
            result.push(houseCells[houseCellIndex]);
          }
        });
      }
    });

    return result;
  }

  /**
   * Determines if two combinations are equal.
   * @param combinationOne First combination.
   * @param combinationTwo Second combination.
   * @returns True when both combinations are equal, otherwise false is returned.
   */
  private areCombinationsEqual(combinationOne: number [], combinationTwo: number []): boolean {
    let result = combinationOne.length === combinationTwo.length;
    for (let i = 0; result && i < combinationOne.length; ++i) {
      result = combinationOne[i] === combinationTwo[i];
    }

    return result;
  }

  /**
   * Computes the difference of the first set minus the second set.
   * @param cellSetOne Set of cells.
   * @param cellSetTwo Set of cells.
   * @returns The difference betwee cellSetOne and cellSetTwo.
   */
  private subtractSetsOfCells(cellSetOne: Cell[], cellSetTwo: Cell[]): Cell[] {
    return cellSetOne.filter(cell => !cellSetTwo.includes(cell));
  }

  /**
   * Checks if other cells do not contain candidates that are present in the supplied combination.
   * @param houseCells to check.
   * @param cellsWithSameCombination Cells in the house that contains the supplied combination.
   * @param combination The combination of candidates present in the supplied cells with the same combination.
   * @returns True when the remaining houseCells do not contain any candidates that are present
   *  in the supplied combination.
   */
  private checkOtherCellsDoNotContainCandidatesInCombination(houseCells: Cell[], cellsWithSameCombination: Cell[], combination: number[]): boolean {
    let result = true;
    const filteredHouseCells = houseCells.filter(houseCell => !cellsWithSameCombination.includes(houseCell));
    filteredHouseCells.forEach(filteredHouseCell => {
      combination.forEach(digit => {
        if (filteredHouseCell.getVal() === 0 && filteredHouseCell.isCandidate(digit)) {
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
        result += +sudoku.rowModel[row][col].getVal();
      }
      result += '\n';
    }

    for (let row = 0; row < 9; ++row) {
      for (let col = 0; col < 9; ++col) {
        result += `${row}:${col}:${sudoku.rowModel[row][col].getVal()} = ${sudoku.rowModel[row][col].getCandidates()}\n`;
      }
    }

    return result;
  }
}

//Constructs the Sudoku
let sudoku: Sudoku;
document.addEventListener('DOMContentLoaded', event => {
  sudoku = new Sudoku();
});


