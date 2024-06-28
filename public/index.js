let gamehasStarted=false;
var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var urlParams = new URLSearchParams(window.location.search);
let gameover=false;
function onDragStart (source, piece, position, orientation) {
  if(!gamehasStarted) return false;
  if(gameover) return false;
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'
    socket.emit('move',move)
  updateStatus()
}

socket.on('newMove',(move)=>{
    game.move(move);
    board.position(game.fen())
    updateStatus()
})
function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }else if(!gamehasStarted){
    status = 'Game has not started yet,waiting for opponent to join'
  }
else if(gameover){
    status = 'Game over, opponent disconnected'
}
  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html(status)
  $fen.html(game.fen())
  $pgn.html(game.pgn())
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
}
board = Chessboard('board1', config)
if (playercolor =='black') {
    board.flip();
}
updateStatus();
var urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('code')) {
    console.log('jgrecv')
    socket.emit('joinGame', {
        code: urlParams.get('code')
    });
}
socket.on('startGame', function() {
    gamehasStarted = true;
    updateStatus()
});
socket.on('gameOverDisconnect', function() {
    gameOver = true;
    updateStatus()
});
console.log(playercolor)
updateStatus()