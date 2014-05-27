/*----------------------------------------------/
Code from http://diveintohtml5.info/canvas.html

To Do:
+ Draw the king piece
/----------------------------------------------*/

var kBoardWidth = 11;
var kBoardHeight= 11;
var kPieceWidth = 50;
var kPieceHeight= 50;
var kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
var kPixelHeight= 1 + (kBoardHeight * kPieceHeight);

var gCanvasElement;
var gDrawingContext;
var gPattern;

var gWhitePieces = [];
var gBlackPieces = [];
var gNumPieces;
var gSelectedPieceIndex;
var gSelectedPieceHasMoved;
var gGameInProgress;

/*An object placed on the gameBoard canvas*/
function Cell(row, column){
	this.row = row;
	this.column = column;
}

/* returns Cell with .row and .column properties*/
function getCursorPosition(e) {
	var x;
	var y;
	
	if (e.pageX != undefined && e.pageY != undefined) {
		x = e.pageX;
		y = e.pageY;
	} else {
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	
	x -= gCanvasElement.offsetLeft;
	y-= gCanvasElement.offsetTop;
	x = Math.min(x, kBoardWidth * kPieceWidth);
	y = Math.min(y, kBoardHeight * kPieceHeight);
	var cell = new Cell(Math.floor(y/kPieceHeight), Math.floor(x/kPieceWidth));
	return cell;
}

function gameBoardOnClick(e) {
	var cell = getCursorPosition(e);
	return;
}

function clickOnEmptyCell(cell) {

}

function clickOnPiece(pieceIncex) {

}

function isTheGameOver() {
	return false;
}

function drawBoard() {
    if (gGameInProgress && isTheGameOver()) {
	endGame();
    }

    gDrawingContext.clearRect(0, 0, kPixelWidth, kPixelHeight);

    gDrawingContext.beginPath();
    
    /* vertical lines */
    for (var x = 0; x <= kPixelWidth; x += kPieceWidth) {
	gDrawingContext.moveTo(0.5 + x, 0);
	gDrawingContext.lineTo(0.5 + x, kPixelHeight);
    }
    
    /* horizontal lines */
    for (var y = 0; y <= kPixelHeight; y += kPieceHeight) {
	gDrawingContext.moveTo(0, 0.5 + y);
	gDrawingContext.lineTo(kPixelWidth, 0.5 +  y);
    }
    
	/* Corner x's*/
	
	
    /* draw it! */
    gDrawingContext.strokeStyle = "#ccc";
    gDrawingContext.stroke();
    
	/*draw white pieces*/
    for (var i = 0; i < gWhitePieces.length; i++) {
		if (i==6) {
			drawPiece(gWhitePieces[i], i == gSelectedPieceIndex, false, true);
		} else {
			drawPiece(gWhitePieces[i], i == gSelectedPieceIndex, false, false);
		}
    }
	
	/*draw black pieces*/
    for (var i = 0; i < gBlackPieces.length; i++) {
	drawPiece(gBlackPieces[i], i == gSelectedPieceIndex, true, false);
    }
	
    saveGameState();
}

function drawPiece(p, selected, isBlack, isKing) {
    var column = p.column;
    var row = p.row;
    var x = (column * kPieceWidth) + (kPieceWidth/2);
    var y = (row * kPieceHeight) + (kPieceHeight/2);
    var radius = (kPieceWidth/2) - (kPieceWidth/10);
    gDrawingContext.beginPath();
    gDrawingContext.arc(x, y, radius, 0, Math.PI*2, false);
    gDrawingContext.closePath();

    if (isBlack) {
	gDrawingContext.fillStyle = "#000";
	gDrawingContext.fill();
    }
	/* Designate the king with a + */
	if(isKing) {
		gDrawingContext.moveTo(x-(kPieceWidth/4),y-(kPieceHeight/4));
		gDrawingContext.lineTo(x+(kPieceWidth/4), y+(kPieceHeight/4));
		gDrawingContext.moveTo(x+(kPieceWidth/4), y-(kPieceHeight/4));
		gDrawingContext.lineTo(x-(kPieceWidth/4), y+(kPieceHeight/4));
	}
	
	gDrawingContext.strokeStyle = "#000";
    gDrawingContext.stroke();
}

if (typeof resumeGame != "function") {
    saveGameState = function() {
	return false;
    }
    resumeGame = function() {
	return false;
    }
}

function newGame() {

	/*Place the defenders*/
	for (var y=3; y<8; y+= 1){
		for (var x=4-Math.sin(y*(Math.PI/2)); x<7+Math.sin(y*(Math.PI/2)); x+=1){
			gWhitePieces.push(new Cell(y,x));
		}
	}
	
	/*Place the attackers*/
	for (var i=3; i<8; i+=1) {
		gBlackPieces.push(new Cell(0,i));
		gBlackPieces.push(new Cell(10,i));
		gBlackPieces.push(new Cell(i,0));
		gBlackPieces.push(new Cell(i,10));
		
		if (i==5){
			gBlackPieces.push(new Cell(1,i));
			gBlackPieces.push(new Cell(9,i));
			gBlackPieces.push(new Cell(i,1));
			gBlackPieces.push(new Cell(i,9));
		}
		
	}
	
	/*
    gPieces = [new Cell(kBoardHeight - 3, 0),
	       new Cell(kBoardHeight - 2, 0),
	       new Cell(kBoardHeight - 1, 0),
	       new Cell(kBoardHeight - 3, 1),
	       new Cell(kBoardHeight - 2, 1),
	       new Cell(kBoardHeight - 1, 1),
	       new Cell(kBoardHeight - 3, 2),
	       new Cell(kBoardHeight - 2, 2),
	       new Cell(kBoardHeight - 1, 2)];
	*/
    gNumPieces = gWhitePieces.length + gBlackPieces.length;
    gSelectedPieceIndex = -1;
    gSelectedPieceHasMoved = false;
    gMoveCount = 0;
    gGameInProgress = true;
    drawBoard();
}

function endGame() {
    gSelectedPieceIndex = -1;
    gGameInProgress = false;
}

function initGame(canvasElement) {
	if (!canvasElement) {
		canvasElement = document.createElement("canvas");
		canvasElement.id = "gameBoard";
		document.body.appendChild(canvasElement);
	}
	
	gCanvasElement = canvasElement;
	gCanvasElement.width = kPixelWidth;
	gCanvasElement.height = kPixelHeight;
	gCanvasElement.addEventListener("click", gameBoardOnClick, false);
	gDrawingContext = gCanvasElement.getContext("2d");
	
	if(!resumeGame()) {
		newGame();
	}
}