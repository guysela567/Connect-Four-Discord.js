//---imports---\\

const { createCanvas } = require('canvas');


//---constants---\\

const COLS = 7;
const ROWS = 6;
const SQUARE_SIZE = 100;
const PIECE_SIZE = 80;

const player1 = 'red';
const player2 = 'yellow';
const empty = 'white';

//---cell---\\

class Cell {
  constructor(i, j, ctx) {
    this.i = i;
    this.j = j;
    this.type = empty;
    this.x = i * SQUARE_SIZE + SQUARE_SIZE / 2;
    this.y = j * SQUARE_SIZE + 3 * SQUARE_SIZE / 2;
    this.ctx = ctx;
  }

  show() {
    this.fill(this.type);
    this.ellipse(this.x, this.y, PIECE_SIZE);
  }


  //---draw-functions---\\

  fill(color) {
    this.ctx.fillStyle = color;
  }
  
  ellipse(x, y, d) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, d / 2, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.fill();
  }
  
}

//---game---\\

class Game {
  constructor(nameDict) {
    this.canvas = createCanvas(COLS * SQUARE_SIZE, ROWS * SQUARE_SIZE + SQUARE_SIZE);
    this.ctx = this.canvas.getContext('2d');
    this.turn = player1;
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = 'black';
    this.ctx.textAlign = 'center'; // needs to be center center
    this.ctx.font = '60px sans-serif'
    this.isGameOver = false;
    this.nameDict = nameDict;
    this.attachments = [];

    // setup
    this.grid = this.createGrid();
    this.drawGrid();
  }
  
  //---game-mechanics---\\

  addPiece(x) {
    if (this.tie() == true || this.getWinner() != null) return;
    let y = this.nextSpace(x - 1);
    if (y >= 0) {
      this.grid[y][x - 1].type = this.turn;
      this.turn = this.turn == player1 ? player2 : player1;
    }
  
    this.drawGrid();
  
    if (this.tie())
      this.tie_screen();
    if (this.getWinner() != null)
      this.winner_screen(this.getWinner());
    
  }

  //---screens---\\

  tie_screen() {
    this.fill('white');
    this.rect(-1, -1, this.canvas.width + 2, SQUARE_SIZE);
    this.fill('black');
    this.ctx.fillText('Draw. ', this.canvas.width / 2, SQUARE_SIZE / 2);
    this.isGameOver = true;
  }

  winner_screen(winner) {
    this.fill('white');
    this.rect(-1, -1, this.canvas.width + 2, SQUARE_SIZE);
    this.fill(winner);
    this.ctx.fillText(`${this.nameDict[winner]} won!`, this.canvas.width / 2, SQUARE_SIZE / 2);
    this.isGameOver = true;
  }


  //---grid-functions---\\

  createGrid() {
    let grid = [];
    for (let j = 0; j < ROWS; j++) {
      grid[j] = [];
      for (let i = 0; i < COLS; i++) {
        grid[j][i] = new Cell(i, j, this.ctx);
      }
    }
    return grid;
  }

  drawGrid() {
    this.background('blue');
    this.fill('white');
    this.rect(-1, -1, this.canvas.width + 2, SQUARE_SIZE);
  
    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS; i++) {
        this.grid[j][i].show();
      }
    }
  
    for (let x = SQUARE_SIZE; x < this.canvas.width; x += SQUARE_SIZE) {
      this.line(x, SQUARE_SIZE, x, this.canvas.height);
    }
  }

  nextSpace(x) {
    for (let y = ROWS - 1; y >= 0; y--) {
      if (this.grid[y][x].type == empty)
        return y;
    }
    return -1;
  }

  tie() {
    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS; i++) {
        if (this.grid[j][i].type == empty)
          return false;
      }
    }
    return true;
  }
  
  getWinner() {
    // Test Horizontal
    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i <= COLS - 4; i++) {
        const test = this.grid[j][i].type;
        if (test != empty) {
          let temp = true;
          for (let k = 0; k < 4; k++) {
            if (this.grid[j][i + k].type !== test) {
              temp = false;
            }
          }
          if (temp == true) {
            return test;
          }
        }
      }
    }

    // Test Vertical
    for (let j = 0; j <= ROWS - 4; j++) {
      for (let i = 0; i < COLS; i++) {
        const test = this.grid[j][i].type;
        if (test != empty) {
          let temp = true;
          for (let k = 0; k < 4; k++) {
            if (this.grid[j + k][i].type !== test) {
              temp = false;
            }
          }
          if (temp == true) {
            return test;
          }
        }
      }
    }

    // Test Diagonal
    for (let j = 0; j <= ROWS - 4; j++) {
      for (let i = 0; i <= COLS - 4; i++) {
        const test = this.grid[j][i].type;
        if (test != empty) {
          let temp = true;
          for (let k = 0; k < 4; k++) {
            if (this.grid[j + k][i + k].type !== test) {
              temp = false;
            }
          }
          if (temp == true) {
            return test;
          }
        }
      }
    }

    // Test Antidiagonal
    for (let j = 0; j <= ROWS - 4; j++) {
      for (let i = 3; i < COLS; i++) {
        const test = this.grid[j][i].type;
        if (test != empty) {
          let temp = true;
          for (let k = 0; k < 4; k++) {
            if (this.grid[j + k][i - k].type !== test) {
              temp = false;
            }
          }
          if (temp == true) {
            return test;
          }
        }
      }
    }
    return null;
  }


  //---draw-functions---\\

  rect(x, y, w, h) {
    this.ctx.beginPath();
    this.ctx.rect(x, y, w, h);
    this.ctx.stroke();
    this.ctx.fill();
  }
  
  fill(color) {
    this.ctx.fillStyle = color;
  }
  
  ellipse(x, y, d) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, d / 2, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.fill();
  }
  
  background(color) {
    const prevFill = this.ctx.fillStyle;
    this.fill(color);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.fill(prevFill);
  }
  
  line(x1, y1, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }
}

//---exports---\\

module.exports = Game;