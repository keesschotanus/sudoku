/*
 * A single cell of a Sudoku puzzle.
 */

import Combination from "./combination.js";

export default class Cell {

  private row: number;                // Zero based row
  private col: number;                // Zero based column
  private val: number;                // Value of the cell or zero when it has no value yet
  private block: number;              // Zero based block number
  private candidates: number[];       // Possible candidate values this cell can have (pencil marks)
  private solvedCandidates: string;   // Used to communicate solved candidates data to the view

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

    this.solvedCandidates = '';
  }

  public getRow(): number {
    return this.row;
  }

  public getCol(): number {
    return this.col;
  }

  public getVal(): number {
    return this.val;
  }

  public setVal(val: number): void {
    this.val = val;
  }

  public getBlock(): number {
    return this.block;
  }

  public getSolvedCandidates(): string {
    return this.solvedCandidates;
  }

  public setSolvedCandidates(solvedCells: string) {
    this.solvedCandidates = solvedCells;
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
   * Clears a single candidate.
   * @param digit The candidate digit to clear.
   */
  public clearCandidate(digit: number): void {
    this.candidates[digit] = 0;
  }

  /**
   * Sets the supplied digit is a possible candidate.
   * @param digit The digit to set as a candidate.
   */
  public setCandidate(digit: number): void {
    this.candidates[digit] = digit;
  }

  /**
   * Determines if the supplied digit is a candidate digit for this cell.
   * @returns True when the supplied digit is a candidate digit.
   */
  public isCandidate(digit: number): boolean {
    return this.candidates[digit] === digit;
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
  public getCombinationsOfCandidates(size: number): Array<Array<number>> {
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
  public hasSameCandidates(other: Cell): boolean {
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
   * Resets the possible candidates.
   */
  public resetCandidates(): void {
    this.candidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  }

  /**
   * Determines if this cell is in the set of supplied cells.
   * @param set The set of cells to check.
   */
  public inSet(set: Cell[]): boolean {
    return set.includes(this);
  }

  /**
   * Gets the next possible value for this cell.
   * WHen no such candidate exists, 0 is returned.
   * That is the first candidate value greater than the current value.
   * @returns The first candidate greater than the current value.
   */
  public getNextValue(): number {
    for (let digit = this.val + 1; digit <= 9; ++digit) {
      if (this.candidates[digit] === digit) {
        return digit;
      }
    }

    return 0;
  }

  /* 
   * Creates a String representation of this Sudoku cell. 
   * @return a String representation of this Sudoku cell. 
   */ 
  public toString() {
    return `[${this.row},${this.col}]`;
  }
    
}