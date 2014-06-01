/*-------------------------------------------------------*/
/* Code from http://diveintohtml5.info/canvas.html       */
/*                                                       */
/* To Do:                                                */
/* + Implement valid moves function                      */
/* + Highlight valid move squares                        */
/* + Implement move function                             */
/*-------------------------------------------------------*/

/*CONSTANTS AND GLOBAL VARIABLES*/
//{
var kBoardWidth = 11;
var kBoardHeight= 11;
var kPieceWidth = 50;
var kPieceHeight= 50;
var kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
var kPixelHeight= 1 + (kBoardHeight * kPieceHeight);

var gCanvasElement;
var gDrawingContext;

var gWhitePieces = [];
var gBlackPieces = [];
var gSelectedPiece = new Cell();
var gSelectedPieceHasMoved;
var gValidMoves = [];
var gGameInProgress;
//}

/*An object placed on the gameBoard canvas*/
function Cell(row, column, isBlack, isKing, isSelected){
	this.row = row;
	this.column = column;
	this.isBlack = isBlack;
	this.isKing = isKing;
	this.isSelected = false;
}

/*GAMEFLOW FUNCTIONS*/
//{
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

function newGame() {

	/*Place the defenders*/
	for (var y=3; y<8; y+= 1){
		for (var x=4-Math.sin(y*(Math.PI/2)); x<7+Math.sin(y*(Math.PI/2)); x+=1){
			if (y==5 && x==5){
				gWhitePieces.push(new Cell(y,x,false,true));
			} else {
				gWhitePieces.push(new Cell(y,x,false,false));
			}
		}
	}
	
	/*Place the attackers*/
	for (var i=3; i<8; i+=1) {
		gBlackPieces.push(new Cell(0,i,true,false));
		gBlackPieces.push(new Cell(10,i,true,false));
		gBlackPieces.push(new Cell(i,0,true,false));
		gBlackPieces.push(new Cell(i,10,true,false));
		
		if (i==5){
			gBlackPieces.push(new Cell(1,i,true,false));
			gBlackPieces.push(new Cell(9,i,true,false));
			gBlackPieces.push(new Cell(i,1,true,false));
			gBlackPieces.push(new Cell(i,9,true,false));
		}
		
	}
	
    gSelectedPieceHasMoved = false;
    gGameInProgress = true;
    drawBoard();
}

if (typeof resumeGame != "function") {
    saveGameState = function() {
	return false;
    }
    resumeGame = function() {
	return false;
    }
}

function isTheGameOver() {
	return false;
}

function endGame() {
    gGameInProgress = false;
}

//}

/*DRAWING FUNCTIONS*/
//{
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
	function drawAnX(topLeftX, topLeftY) {
		gDrawingContext.moveTo(topLeftX, topLeftY);
		gDrawingContext.lineTo(topLeftX+0.5+kPieceWidth, topLeftY+0.5+kPieceHeight);
		gDrawingContext.moveTo(topLeftX+0.5+kPieceWidth, topLeftY);
		gDrawingContext.lineTo(topLeftX, topLeftY+0.5+kPieceHeight);
	}
	
	drawAnX(0,0);
	drawAnX(0,kPixelHeight-kPieceHeight);
	drawAnX(kPixelWidth-kPieceWidth, 0);
	drawAnX(kPixelWidth-kPieceWidth, kPixelHeight-kPieceHeight);
	
	
    /* draw it! */
    gDrawingContext.strokeStyle = "#ccc";
    gDrawingContext.stroke();
    
	/*draw white pieces*/
    for (var i = 0; i < gWhitePieces.length; i++) {
			drawPiece(gWhitePieces[i]);
    }
	
	/*draw black pieces*/
    for (var i = 0; i < gBlackPieces.length; i++) {
	drawPiece(gBlackPieces[i]);
    }
	
    saveGameState();
}

function drawPiece(p) {
    var column = p.column;
    var row = p.row;
    var x = (column * kPieceWidth) + (kPieceWidth/2);
    var y = (row * kPieceHeight) + (kPieceHeight/2);
    var radius = (kPieceWidth/2) - (kPieceWidth/10);
	
	/*highlight selected piece with a faint yellow border*/
	/*draw this before doing the piece so it appears behind it*/
	if(p.isSelected) {
		drawHighlight(x,y,radius);
	}
	
    gDrawingContext.beginPath();
    gDrawingContext.arc(x, y, radius, 0, Math.PI*2, false);
    gDrawingContext.closePath();

    if (p.isBlack) {
	gDrawingContext.fillStyle = "#000";
	gDrawingContext.fill();
    }
	
	/* Designate the king with a + */
	if(p.isKing) {
		gDrawingContext.moveTo(x-(kPieceWidth/4),y-(kPieceHeight/4));
		gDrawingContext.lineTo(x+(kPieceWidth/4), y+(kPieceHeight/4));
		gDrawingContext.moveTo(x+(kPieceWidth/4), y-(kPieceHeight/4));
		gDrawingContext.lineTo(x-(kPieceWidth/4), y+(kPieceHeight/4));
	}
	
	gDrawingContext.strokeStyle = "#000";
	gDrawingContext.lineWidth = 1;
    gDrawingContext.stroke();
	
}

function drawHighlight(x,y,radius) {
		
	/*Draw a yellow highlight around the game piece*/
	gDrawingContext.beginPath();
	gDrawingContext.arc(x, y, radius, 0, Math.PI*2, false);
	gDrawingContext.closePath();
	gDrawingContext.strokeStyle = "#FFFF00";
	gDrawingContext.lineWidth = 7;
	gDrawingContext.stroke();
	
	/*Draw a highlight around valid moves*/
}

function validMoves(p) {

    var column = p.column;
    var row = p.row;
	
	/*Scan for empty squares*/
	for(var i=0; i<11; i++) {
		
	}
}
//}

/*CLICK FUNCTIONS*/
//{
/*Returns Cell with .row and .column properties*/
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
    for (var i = 0; i < gWhitePieces.length; i++) {
		if ((gWhitePieces[i].row == cell.row) && 
	    (gWhitePieces[i].column == cell.column)) {
			clickOnPiece(gWhitePieces[i]);
			return;
		}
	for (var j=0; j<gBlackPieces.length; j++){	
		if ((gBlackPieces[j].row == cell.row) && 
	    (gBlackPieces[j].column == cell.column)) {
			clickOnPiece(gBlackPieces[j]);
			return;
		}
	}
    }
    clickOnEmptyCell(cell);
}

function clickOnEmptyCell(cell) {

	/*If no piece is selected, exit function*/
}

function clickOnPiece(cell) {
	if (cell.isSelected) { return; }
	/*Unselect the previous piece before selecting a new one*/
	if (gSelectedPiece !== null) {
		gSelectedPiece.isSelected = false;
	}
    gSelectedPiece = cell;
	gSelectedPiece.isSelected = true;
    gSelectedPieceHasMoved = false;
    drawBoard();
}

//}
