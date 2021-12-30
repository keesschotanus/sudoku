/*
 * A single cell of a Sudoku puzzle.
 */

import Combination from "./combination.js";

export default class Cell {

  row: number;          // Zero based row
  col: number;          // Zero based column
  val: number;          // Value of the cell or zero when it has no value yet
  block: number;        // Zero based block number
  candidates: number[]; // Possible candidate values this cell can have (pencil marks)
  digits: string;       // Used to communicate data to the view

  /**
   * Creates a Sudoku cell from a row and column.
   * @param row The zero based row number.
   * @param col The zero based column number.
   */
  public constructor(row: number, col: number) {
    this.row = row;
    this.col = col;

    this.val = 0;
    this.block = Math.floor(this.row / 3) * 3 + Math.floor(this.col / 3);
    this.candidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    this.digits = '';
  }

  /**
   * Gets all the possible candidates for this cell.
   * When the possible candidates are 2,3, and 5 then candidates looks like this:
   * [0,0,2,3,0,5,0,0,0,0], and the returned value is[2,3,5].
   * @returns All possible candidates.
   */
  public getCandidates(): number[] {
    return this.candidates.filter((candidate) => candidate !== 0);
  }

  /**
   * Gets the number of possible candidates.
   * @returns The number of possible candidates.
   */
  public getNumberOfCandidates(): number {
    return this.candidates.reduce((length, candidate): number => candidate === 0 ? length : length + 1);
  }

  /**
   * Gets all the possible combinations of candidates of the supplied size.
   * @returns An array where each element contains a combination of candidates.
   */
  getCombinationsOfCandidates(size: number): Array<Array<number>> {
    const result = new Array<Array<number>>();

    if (this.val === 0 && this.getNumberOfCandidates() >= size) {
      const combination = new Combination<number>(this.getCandidates(), size);
      while (combination.hasNext()) {
        result.push(combination.next());
      }
    };

    return result;
  }

  /**
   * Determines if this cell has the exact same candidates as the other cell.
   * @param other Other cell to compare candidates against.
   * @returns True when this cell and the other cell have the exact same candidates.
   */
  hasSameCandidates(other: Cell): boolean {
    let thisCandidates = this.getCandidates();
    let otherCandidates = other.getCandidates();

    let result = thisCandidates.length === otherCandidates.length;
    for (let index = 0; index < thisCandidates.length && result; ++index) {
      if (thisCandidates[index] !== otherCandidates[index]) {
        result = false;
      }
    }

    return result;
  }
  
  /**
   * Determines if this cell is in the set of supplied cells.
   * @param set The set of cells to check.
   */
  inSet(set: Cell[]): boolean {
    return set.includes(this);
  }

  /* 
   * Creates a String representation of this Sudoku cell. 
   * @return a String representation of this Sudoku cell. 
   */ 
  toString() {
    return `[${this.row},${this.col}]`;
  }
    
}