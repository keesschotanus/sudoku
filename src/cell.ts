/*
 * A single cell of a Sudoku puzzle.
 */

export default class Cell {

  row: number;          // Zero based row
  col: number;          // Zero based column
  val: number;          // Value of the cell or zero when it has no value yet
  block: number;        // Zero based block number
  candidates: number[]; // Possible candidate values this cell can have
  digit: number;        // Used to communicate data 

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;

    this.val = 0;
    this.block = Math.floor(this.row / 3) * 3 + Math.floor(this.col / 3);
    this.candidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    this.digit = 0;
  }

  getCandidates(): number[] {
    return this.candidates.filter((candidate) => candidate !== 0);
  }

  getNumberOfCandidates(): number {
    return this.candidates.reduce((length: number, candidate: number): number => candidate === 0 ? length : length + 1);
  }

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
  
  /* 
   * Creates a String representation of this Sudoku cell. 
   * @return a String representation of this Sudoku cell. 
   */ 
  toString() {
    return `[${this.row},${this.col}]`;
  }
    
}