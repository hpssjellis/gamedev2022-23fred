// ---------------------------------------------------
// Constants
// ---------------------------------------------------
const BOARD_DOM = document.getElementById('app');

const ROW = 8;
const COL = 8;
const SQUARE_SIZE = 50;
const BOARD_BORDER = 10;

const BLACK = 'b';
const WHITE = 'w';

// names
const PAWN = 'pawn';
const ROOK = 'rook';
const KNIGHT = 'knight';
const BISHOP = 'bishop';
const QUEEN = 'queen';
const KING = 'king';

// pieces
const B_PAWN = '&#9823;';
const W_PAWN = '&#9817;';
const B_ROOK = '&#9820;';
const W_ROOK = '&#9814;';
const B_KNIGHT = '&#9822;';
const W_KNIGHT = '&#9816;';
const B_BISHOP = '&#9821;';
const W_BISHOP = '&#9815;';
const B_QUEEN = '&#9819;';
const W_QUEEN = '&#9813;';
const B_KING = '&#9818;';
const W_KING = '&#9812;';

// ---------------------------------------------------
// Variables
// ---------------------------------------------------
var isMoving = null;
var turnDom = document.getElementById('turn');

// ---------------------------------------------------

function createBoard(row, col) {
  var arr = [];
  for (var i = 0; i < row; i++) {
    var rowArr = [];
    for (var j = 0; j < col; j++) {
      var value = true;
      if (i % 2 === 0) value = !value;
      if (j % 2 === 0) value = !value;
      rowArr.push({ piece: null, background: value });
    }
    arr.push(rowArr);
  }
  return arr;
}

function renderBoard() {
  var boardHTML = this.board.reduce(function(acc, item, index) {
    var row = ''
    item.forEach(function (element, idx) {
      var pieceName, color, id, player = '';
      var classValue = element.background ? 'grey' : 'white';

      if (element.piece) {
        pieceName = element.piece.name;
        color = element.piece.color;
        id = 'data-piece=' + element.piece.id;
        player = 'data-player=' + color;
      }
      
      row += 
        '<div data-x=' + idx + ' class="' + classValue + '">' +          
            buildPiece(pieceName, color, id , player) + 
        '</div>';
    })
    return acc += '<div data-y=' + index + ' class="row">' + row + '</div>';
  }, '');  
  BOARD_DOM.innerHTML = boardHTML;
}

function buildPiece(name, color, id , player) {
  value = '';
  if (!name) return value;
  
  if (name === PAWN) value = color === BLACK ? B_PAWN : W_PAWN;
  if (name === ROOK) value = color === BLACK ? B_ROOK : W_ROOK;
  if (name === KNIGHT) value = color === BLACK ? B_KNIGHT : W_KNIGHT;
  if (name === BISHOP) value = color === BLACK ? B_BISHOP : W_BISHOP;
  if (name === QUEEN) value = color === BLACK ? B_QUEEN : W_QUEEN;
  if (name === KING) value = color === BLACK ? B_KING : W_KING;
  
  return '<div ' + id + ' ' + player + ' class="game-piece">' + value + '</div>';
}

function GamePiece(x, y, name, color, count) {
  this.name = name;
  this.color = color;
  this.x = x;
  this.y = y;
  this.id = name + count + color;
  this.move(); // this will place the piece in the board
  game.pieces[this.id] = this; // keep all pieces together for easy access
}

GamePiece.prototype.move = function() {
  game.board[this.y][this.x].piece = this;
  game.render();
}

GamePiece.prototype.update = function(x, y) {
  if (isMoveAllowed(this, x, y)) {
    this.x = x;
    this.y = y;
    this.move();
    game.render();
    game.updateTurn(); 
  } else {
    this.goBack();
  }
}

GamePiece.prototype.goBack = function() {
  this.move();
}

function isMoveAllowed(obj, x, y) {
  var isAllowed = false;
  
  if (obj.name === PAWN) isAllowed = checkPawnRules(obj, x, y);
  if (obj.name === ROOK) isAllowed = checkRookRules(obj, x, y);
  if (obj.name === KNIGHT) isAllowed = checkKnightRules(obj, x, y);
  if (obj.name === BISHOP) isAllowed = checkBishopRules(obj, x, y);
  if (obj.name === QUEEN) isAllowed = checkQueenRules(obj, x, y);
  if (obj.name === KING) isAllowed = checkKingRules(obj, x, y);
  
  return isAllowed;
}

function checkPawnRules (obj, x, y) {
  var initialY = obj.color === BLACK ? 1 : 6;
  var collisionValue = checkCollision(x, y);
  var result = true;

  // always move straight
  if (obj.x !== x) result = false;

  // can't capture straight
  if (obj.x === x && collisionValue &&
      collisionValue.color !== obj.color) result = false;

  if (obj.color === WHITE) {
    // can't go back, move one space
    if (obj.y < y || y !== obj.y - 1) {
      result = false;
    }
    // first move can jump 2 spaces
    if (initialY === obj.y && y === obj.y - 2 && obj.x === x) {
      result = true;
    }
  }

  if (obj.color === BLACK) {
    // can't go back, move one space
    if (obj.y > y || y !== obj.y + 1) {
      result = false;
    }
    // first move can jump 2 spaces
    if (initialY === obj.y && y === obj.y + 2 && obj.x === x) {
      result = true;
    }
  }

  if (collisionValue && collisionValue.color !== obj.color) {
    if (x === obj.x - 1 || x === obj.x + 1) {
      console.log('capture');
      result = true;
    }
  }

  return result;
}

// todo
function checkRookRules (obj, x, y) {
  var dest = { x: x, y: y };
  var collisionValue = checkCollision(x, y);
  var ownColor = obj.color;
  
  // avoid moving in the same spot
  if (x === obj.x && y === obj.y) return false;

  // rook cant\'t move diagonal
  if (x !== obj.x && y !== obj.y) return false;
    
  // checks which way is moving 
  var letter = obj.x === x ? 'y' : 'x';
   
  // can not jump pieces
  var min = Math.min(obj[letter], dest[letter]) + 1;
  var max = Math.max(obj[letter], dest[letter]) - 1;
  
  for (var i = min; i <= max; i++) {
    if (letter === 'y') {
      if (checkCollision(x, i)) return false;
    } else {
      if (checkCollision(i, y)) return false;
    }
  }
  
  if (collisionValue && collisionValue.color !== ownColor || !collisionValue) return true;
  
  return false;
}

function checkKnightRules(initial, x, y) {
  var collisionValue = checkCollision(x, y);
  var ownColor = initial.color;
  
  if (collisionValue && collisionValue.color !== ownColor || !collisionValue) {
    if ( (y === initial.y + 2 && x === initial.x + 1) ||
         (y === initial.y + 2 && x === initial.x - 1) ||
         (y === initial.y - 2 && x === initial.x + 1) ||
         (y === initial.y - 2 && x === initial.x - 1) ) return true;
    
    if ( (x === initial.x + 2 && y === initial.y + 1) ||
         (x === initial.x + 2 && y === initial.y - 1) ||
         (x === initial.x - 2 && y === initial.y + 1) ||
         (x === initial.x - 2 && y === initial.y - 1) ) return true;  
  }
  return false;
}

function checkBishopRules(initial, x, y) {
  var collisionValue = checkCollision(x, y);
  
  var xDiff = Math.abs(initial.x - x);
  var yDiff = Math.abs(initial.y - y);
  
  // only moves diagonal
  if ( (xDiff === yDiff) && !collisionValue ||
       (collisionValue && collisionValue.color !== initial.color) ) {
    
    // TODO: bishop can not jump pieces    
    var spacesLength = xDiff - 1;
    // check if the movement is positive or negative
    var xOperator = getCoordOperator(initial.x, x);
    var yOperator = getCoordOperator(initial.y, y);
    
    // checks path for collision   
    for (var i = 1; i <= spacesLength; i++ ) {
      var xResult = operation[xOperator](initial.x, i);
      var yResult = operation[yOperator](initial.y, i);
      
      if (checkCollision(xResult, yResult)) return false;
    }
    
    return true; 
  }
  
  return false;
}

function getCoordOperator(start, end) {
  if (start < end) return 'sum';
  return 'sub'
}

var operation = {
  sum: function(a, b) { return a + b },
  sub: function(a, b) { return a - b }
}

function checkQueenRules(obj, x, y) {
  if (checkRookRules(obj, x, y) || checkBishopRules(obj, x, y)) return true;
  
  return false;
}

function checkKingRules(obj, x, y) {
  var xDiff = Math.abs(obj.x - x);
  var yDiff = Math.abs(obj.y - y);
  
  // can not jump to the same place
  if (obj.x === x && obj.y === y) return false;
  
  // no more than 1 space
  if (xDiff <= 1 && yDiff <= 1) return true;
  
  return false;
}

function drag(event) {
  if (event.target.classList.contains('game-piece')) {
    var element = event.target;
    var width = element.offsetWidth / 2;
    var height = element.offsetHeight / 2;
    var player = element.dataset.player;
    
    var turn = game.turn ? BLACK : WHITE;
    // checks if player is draging his own pieces
    if (player === turn) isMoving = true;
    
    element.addEventListener('mousemove', function(e) {
      if (isMoving) {
        var x = e.clientX - width;
        var y = e.clientY - height;
        
        var board = BOARD_DOM.getBoundingClientRect();
        var coordX = x - board.x;
        var coordY = y - board.y;
        
        // limits of the board        
        if (coordX < 0 || coordX > 375 || coordY < 0 || coordY > 375 ) return
                
        var position = 'left:' + x + 'px;top:' + y + 'px; z-index: 1;';
        element.setAttribute('style', position);
        element.classList.add('active');
      }
    });
  }
}

function drop(event) {
  if (isMoving) {
    var element = event.target
    var x = event.x;
    var y = event.y;

    element.classList.remove('active');

    var coords = getCoordinates(x, y);
    updateBoard(element, coords);
  }

  isMoving = false;
}

function getCoordinates(x, y) {
  var board = BOARD_DOM.getBoundingClientRect();
  
  var coordX = x - board.x - BOARD_BORDER; 
  var coordY = y - board.y - BOARD_BORDER;
  
  const boardSize = ROW * SQUARE_SIZE;
  var resultX = Math.floor(coordX / boardSize * ROW);
  var resultY = Math.floor(coordY / boardSize * ROW);
  
  return { x: resultX, y: resultY };
}

function updateBoard(element, coord) {
  var x = coord.x;
  var y = coord.y;
  var id = element.dataset.piece;  
  var piece = game.pieces[id];
    
  // erase piece from initial coordinates
  game.board[piece.y][piece.x].piece = null;
  // update piece
  piece.update(x, y);
} 

function checkCollision(x, y) {
  return (game.board[y][x].piece) 
}

function updateTurn() {
  this.turn = !this.turn;
  
  var classValue = this.turn ? 'player-black' : 'player-white';
  var player = this.turn ? 'Black' : 'White';
  var feedBack = '<div class="' + classValue + '">Next: ' + player + '</div>';
  
  turnDom.innerHTML = feedBack;
}

// ---------------------------------------------------
// Game Module
// ---------------------------------------------------

var game = {
  board: createBoard(ROW, COL),
  render: renderBoard,
  pieces: {},
  turn: true,
  updateTurn: updateTurn,
  init: function() {
    BOARD_DOM.addEventListener('mousedown', drag);
    BOARD_DOM.addEventListener('mouseup', drop);

    // create black pawns
    for (var i = 0; i < 8; i++) {
      new GamePiece(i, 1, PAWN, BLACK, i);
    }

    // create white pawns
    for (var i = 0; i < 8; i++) {
      new GamePiece(i, 6, PAWN, WHITE, i);
    }
    
    new GamePiece(0, 7, ROOK, WHITE, 1);
    new GamePiece(7, 7, ROOK, WHITE, 2);
    new GamePiece(1, 7, KNIGHT, WHITE, 1);
    new GamePiece(6, 7, KNIGHT, WHITE, 2);
    new GamePiece(2, 7, BISHOP, WHITE, 1);
    new GamePiece(5, 7, BISHOP, WHITE, 2);
    new GamePiece(3, 7, QUEEN, WHITE, 1);
    new GamePiece(4, 7, KING, WHITE, 1);
    
    new GamePiece(0, 0, ROOK, BLACK, 1);
    new GamePiece(7, 0, ROOK, BLACK, 2);
    new GamePiece(1, 0, KNIGHT, BLACK, 1);
    new GamePiece(6, 0, KNIGHT, BLACK, 2);
    new GamePiece(2, 0, BISHOP, BLACK, 1);
    new GamePiece(5, 0, BISHOP, BLACK, 2);
    new GamePiece(3, 0, QUEEN, BLACK, 1);
    new GamePiece(4, 0, KING, BLACK, 1);

    this.updateTurn();
    this.render();
  } 
}

game.init();


