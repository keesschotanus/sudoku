# Sudoku Solver

This is my attempt at solving a [Sudoku](https://en.wikipedia.org/wiki/Sudoku) puzzle.
Many of these applications exist and many of them are probably better than mine.

That being said, my Sudoku Solver has readable source code.
You can check it out.
Maybe even improve upon it.
With ease you should be able to support naked triples for example,
as the algorithm to find naked values already supports this.

## The Goal

I just wanted to see if I could write the code to solve a Sudoku, using TypeScript.
Turns out, I can.

The goal was not to write a program that aids in solving a Sudoku.
It does not use pencil marks and it does not support hints.
There are only a couple of buttons you can click and this will solve the puzzle for you.

## Usage
You can use either the mouse or the arrow keys on your keyboard to select a cell.
Pressing 1 to 9, sets the value into the selected cell.
Pressing 0 clears the value from the selected cell.

This allows you to enter any Sudoku.
When the Sudoku is invalid, offending cells will be clearly marked red.

Click on any of the buttons at the right of the puzzle to eliminate some possible candidate numbers,
or even let the program fill out the form with values that have been solved.

The "Solve Sudoku" button will find a solution to the puzzle when available,
or warn you that no such solution exists.

## Lessons learned

TypeScript really lends itself to writing code to solve a Sudoku.
Most challenging part was the code for finding "hidden doubles".
This requires testing all combinations of possible candidates
and making sure that the numbers in the combination do not appear in other cells
in the same house.

### Jargon

For the jargon used, see the sudoku.ts source file.

