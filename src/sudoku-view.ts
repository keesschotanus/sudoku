import Cell from "./cell";
import Sudoku from "./sudoku";

export default class SudokuView {
  private model: Sudoku;

  constructor(model: Sudoku) {
    this.model = model;
    document.addEventListener('keydown', this.onKey);
    document.getElementById('exampleButton')?.addEventListener('click', this.example);
    document.getElementById('validateButton')?.addEventListener('click', this.validate);
    document.getElementById('updateButton')?.addEventListener('click', this.update);
    document.getElementById('nakedSinglesButton')?.addEventListener('click', this.nakedSingles);
    document.getElementById('nakedDoublesButton')?.addEventListener('click', this.nakedDoubles);
    document.getElementById('hiddenSinglesButton')?.addEventListener('click', this.hiddenSingles);
  }

  public static idFromRowCol(row: number, col: number): string {
    return `id${row}${col}`
  }

  public static rowColFromId(id: string): [number, number] {
    return [+id.substr(2, 1), +id.substr(3, 1)];
  }

  public static clearStyleFromAllCells() {
    SudokuView.forEachCell((cell: HTMLDivElement) => {
      cell.classList.remove('error', 'selected', "naked-singles");
    });
  }

  public static forEachCell(callback: (cell: HTMLDivElement) => void): void {
    for (let row = 0; row < 9; ++row) {
      for (let col = 0; col < 9; ++col) {
        let cell = document.getElementById(SudokuView.idFromRowCol(row, col)) as HTMLDivElement;
        callback(cell);
      }
    }
  }

  public renderSudoku() {
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
        divCell.id = SudokuView.idFromRowCol(blockRow * 3 + row, blockCol * 3 + col);
        divCell.innerText = '0';
        divCell.addEventListener('click', this.onCellClick);

        divBlock.appendChild(divCell);
      }
    }

    let sudokuContainer: HTMLDivElement = document.getElementById("sudoku") as HTMLDivElement;
    sudokuContainer.appendChild(divBlock);
  }

  public selectCell(currentlySelectedCell: HTMLDivElement, row: number, col: number): void {
    // Deselect the current cell
    currentlySelectedCell.classList.remove('selected');

    // Select the new cell
    document.getElementById(SudokuView.idFromRowCol(row, col))?.classList.add('selected');

    // Update the model
    this.model.currentRow = row;
    this.model.currentCol = col;
  }

  private onCellClick = (event: MouseEvent) => {
    const target = event.target as HTMLDivElement;
    let id = target.getAttribute('id') as string;
    [this.model.currentRow, this.model.currentCol] = SudokuView.rowColFromId(id);

    SudokuView.clearStyleFromAllCells();
    target.classList.add('selected');
  }

  onKey = (event: KeyboardEvent) => {
    let cell = document.getElementById(SudokuView.idFromRowCol(this.model.currentRow, this.model.currentCol)) as HTMLDivElement;

    switch (event.key) {
      case '`':
        console.log(this.model.toString());
        break;
      case '0':
        cell.classList.add('hidden');
        cell.innerText = '' + event.key;
        this.model.rowModel[this.model.currentRow][this.model.currentCol].val = +event.key;
        this.model.resetPencilMarks();
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
        cell.classList.remove('hidden', 'hidden-single', 'hidden-double', 'naked-single', 'naked-double');
        this.model.rowModel[this.model.currentRow][this.model.currentCol].val = +event.key;
        if (this.model.rowModel[this.model.currentRow][this.model.currentCol].val !== +event.key) {
          this.model.resetPencilMarks();
        }
        break;
      case 'ArrowLeft':
        this.selectCell(cell, this.model.currentRow, this.model.currentCol === 0 ? 8 : this.model.currentCol - 1);
        break;
      case 'ArrowRight':
        this.selectCell(cell, this.model.currentRow, this.model.currentCol === 8 ? 0 : this.model.currentCol + 1);
        break;
      case 'ArrowUp':
        this.selectCell(cell, this.model.currentRow === 0 ? 8 : this.model.currentRow - 1, this.model.currentCol);
        break;
      case 'ArrowDown':
        this.selectCell(cell, this.model.currentRow === 8 ? 0 : this.model.currentRow + 1, this.model.currentCol);
        break;
    }

  }

  example = (event: MouseEvent) => {
    this.setValue(0,3,6);
    this.setValue(0,4,9);
    this.setValue(0,7,1);

    this.setValue(1,4,1);
    this.setValue(1,6,4);
    this.setValue(1,8,5);

    this.setValue(2,3,3);

    this.setValue(3,4,3);
    this.setValue(3,7,2);
    this.setValue(3,8,7);

    this.setValue(4,0,3);
    this.setValue(4,2,6);
    this.setValue(4,4,2);
    this.setValue(4,6,5);

    this.setValue(5,1,7);
    this.setValue(5,2,5);
    this.setValue(5,3,1);
    this.setValue(5,7,6);
    this.setValue(5,8,3);

    this.setValue(6,2,9);
    this.setValue(6,3,7);

    this.setValue(7,1,2);

    this.setValue(8,0,7);
    this.setValue(8,1,1);
    this.setValue(8,2,8);
    this.setValue(8,3,2);
  };

  private setValue(row: number, col: number, val: number) {
    let viewCell = document.getElementById(SudokuView.idFromRowCol(row, col)) as HTMLDivElement;
    viewCell.innerText = '' + val;
    viewCell.classList.remove('hidden');
    this.model.rowModel[row][col].val = val;
}

  validate = (event: MouseEvent) => {
    this.model.validate();
  };

  update = (event: MouseEvent) => {
    this.model.updatePencilMarks();
  };

  nakedSingles = (event: MouseEvent) => {
    const nakedCells = this.model.findNaked(1);
    nakedCells.forEach((modelCell: Cell) => {
      let viewCell = document.getElementById(SudokuView.idFromRowCol(modelCell.row, modelCell.col)) as HTMLDivElement;
      const digit = modelCell.getCandidates()[0];
      viewCell.classList.add('naked-single');
      viewCell.setAttribute('title', 'Naked single, can only contain a ' + digit);
    });
  };

  nakedDoubles = (event: MouseEvent) => {
    const nakedCells = this.model.findNaked(2);
    nakedCells.forEach((modelCell: Cell) => {
      let viewCell = document.getElementById(SudokuView.idFromRowCol(modelCell.row, modelCell.col)) as HTMLDivElement;
      const digits = modelCell.getCandidates();
      viewCell.classList.add('naked-double');
      viewCell.setAttribute('title', 'Naked double, can only contain the digits ' + digits);
    });
  };

  hiddenSingles = (event: MouseEvent) => {
    const hiddenSingles = this.model.findHiddenSingles();
    hiddenSingles.forEach((modelCell: Cell) => {
      let viewCell = document.getElementById(SudokuView.idFromRowCol(modelCell.row, modelCell.col)) as HTMLDivElement;
      viewCell.classList.add('hidden-single');
      viewCell.setAttribute('title', 'Hidden single, can only contain a ' + modelCell.digit);
    });
  };

}