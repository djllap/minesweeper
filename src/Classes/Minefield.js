import { cloneDeep } from "lodash";

class MineField {  
  constructor(height, width, numMines) {
    this.height = height;
    this.width = width;
    this.numMines = numMines;
    this.field = this.makeField(this.height, this.width);
    this.isExploded = false;
    this.hasWon = false;
  }

  coordsAreValid = (row, col) => {
    return (row >= 0 && row < this.height) && (col >= 0 && col < this.width);
  }
  
  makeField = (height, width) => {
    const field = [];
    for (let i = 0; i < height; i++) {
      field[i] = [];
      for (let j = 0; j < width; j++) {
        field[i][j] = { isRevealed: false, isMine: false, flag: 'none' };
      }
    }
    return field;
  };

  printField = () => {
    const field = this.field.map(row => row.map(cell => {
      if (cell.isMine) return '*';
      else if (cell.minesTouching && cell.minesTouching > 0) return cell.minesTouching;
      else return ' ';
    }))
    for (let row of field) console.log(row.join(' '));
  }

  seedMines = (rowCoord, colCoord) => {
    // No mines can spawn here
    const safezone = [
      [ rowCoord - 1, rowCoord, rowCoord + 1 ],
      [ colCoord - 1, colCoord, colCoord + 1 ]
    ];
  
    // Spawns mines randomly
    const mineLocations = {};
    let numMines = this.numMines;

    while (numMines > 0) {
      const rowNum = Math.floor(Math.random() * this.height);
      const colNum = Math.floor(Math.random() * this.width);
      if (!mineLocations[`${rowNum},${colNum}`] && !(safezone[0].includes(rowNum) && safezone[1].includes(colNum))) {
        mineLocations[`${rowNum},${colNum}`] = true;
        this.field[rowNum][colNum].isMine = true;
        numMines -= 1;
      } 
    }

    // maps the number of mines touching each cell
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (!this.field[row][col].isMine) {
          this.field[row][col].minesTouching = this.countAdjacentMines(row, col);
        }
      }
    }
  };

  revealCell = (rowCoord, colCoord) => {
    const cell = this.field[rowCoord][colCoord];
    if (cell.isMine) {
      this.isExploded = true;
    } else {
      cell.isRevealed = true;
      if (cell.minesTouching === 0) {
        this.runOnNeighbors(rowCoord, colCoord, this.revealCell)
      }
    }
  }

  countAdjacentMines = (rowCoord, colCoord) => {
    let count = 0;
    const incrementIfMine = (rowCoord, colCoord) => {
      const cell = this.field[rowCoord][colCoord];
      if (cell.isMine) count++;
    };

    this.runOnNeighbors(rowCoord, colCoord, incrementIfMine)
    console.log(`Count: ${count}`);
    return count;    
  }

  runOnNeighbors = (rowCoord, colCoord, func) => {
    let row = rowCoord - 1;
    let col = colCoord - 1;

    // executes given function for all 8 touching cells
    while (true) { // top cells
      if (this.coordsAreValid(row, col)) func(row, col);
      if (col === colCoord+1) break;
      col++;
    }
    row++;
    while (true) { // right cells
      if (this.coordsAreValid(row, col)) func(row, col);
      if (row === rowCoord+1) break;
      row++;
    }
    col--;
    while (true) { // bottom cells
      if (this.coordsAreValid(row, col)) func(row, col);
      if (col === colCoord-1) break;
      col--;
    }
    row--; // left cell
    if (this.coordsAreValid(row, col)) func(row, col)
  }

  makeCopy = () => {
    return cloneDeep(this);
  }

  checkIfWon = () => {
    let numNotRevealed = 0;

    for (let row of this.field) {
      for (let cell of row) {
        if (cell.isRevealed === false) numNotRevealed++;
      }
    }

    if (numNotRevealed === this.numMines) {
      return this.hasWon = true;
    }
  }
}

module.exports = { MineField };
