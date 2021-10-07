export default class Util {
  public static idFromRowCol(row: number, col: number): string {
    return `id${row}${col}`
  }

  public static rowColFromId(id: string): [number, number] {
    return [+id.substr(2,1), +id.substr(3,1)];
  }
  
  public static clearStyleFromAllCells() {
    Util.forEachCell((cell: HTMLDivElement) => {
      cell.classList.remove('error', 'selected');
    });
  }

  public static selectCell(row: number, col: number): void {
    document.getElementById(Util.idFromRowCol(row, col))?.classList.add('selected');
  }

  public static forEachCell(callback: (cell: HTMLDivElement) => void): void {
    for (let row = 0; row < 9; ++row) {
      for (let col = 0; col < 9; ++col) {
        let cell = document.getElementById(Util.idFromRowCol(row, col)) as HTMLDivElement;
        callback(cell);
      }
    }
  }

}