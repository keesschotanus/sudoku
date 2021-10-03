/*
 * A single cell of a Sudoku puzzle.
 */

export default class Cell {

  row: number;          // Zero based row
  col: number;          // Zero based column
  val: number;          // Value of the cell or zero when it has no value yet
  block: number;        // Zero based block number
  candidates: number[]; // Possible candidate values this cell can have

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;

    this.val = 0;
    this.block = Math.floor(this.row / 3) * 3 + Math.floor(this.col / 3);
    this.candidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  }

  /* 
   * Creates a String representation of this Sudoku cell. 
   * @return a String representation of this Sudoku cell. 
   */ 
  toString() {
    return `[${this.row},${this.col}]`;
  }
    
}