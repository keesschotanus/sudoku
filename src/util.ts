export default class Util {
  public static idFromRowCol(row: number, col: number): string {
    return `id${row}${col}`
  }

  public static rowColFromId(id: string): [number, number] {
    return [+id.substr(2,1), +id.substr(3,1)];
  }

}