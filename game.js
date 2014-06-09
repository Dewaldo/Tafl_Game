/*----------------------------------------------------------*/
/* Code template from http://diveintohtml5.info/canvas.html */
/*                                                          */
/* To Do:                                                   */
/* + Fix "out of bounds" issue with piece removal           */
/* + Fix piece removal to work for double captures          */
/* + Restrict castle movement to king piece                 */
/* + Implement a player turn order system                   */
/* + Implement victory conditions and game end              */
/*----------------------------------------------------------*/

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

var gIsOccupied = [];
var gWhitePieces = [];
var gBlackPieces = [];
var gSelectedPiece;
var gSelectedPieceHasMoved;
var gValidMoves = [];
var gGameInProgress;
//}

/*OBJECTS*/
/*Perhaps integrate some of the functions as methods down the line?*/
/*A "game board" object would also be handy*/
//{
/*Represents position on the game board*/
/*Eventually replace all "column"s and "row"s with this when I'm not lazy*/
function Coordinate (y,x) {
	this.y = y;
	this.x = x;
}

/*An object placed on the gameBoard canvas*/
function Cell(row, column, isBlack, isKing, isSelected){
	this.row = row;
	this.column = column;
	this.isBlack = isBlack;
	this.isKing = isKing;
	this.isSelected = false;
}
//}

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
		createBoardArray();
		newGame();
	}
}

function createBoardArray() {
	for(var y=0; y<kBoardHeight; y++) {
		gIsOccupied[y] = [];
		for(var x=0; x<kBoardWidth; x++) {
			gIsOccupied[y][x] = false;
		}
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
			gIsOccupied[y][x] = true;
		}
	}
	
	/*Place the attackers*/
	/*May need a function to consolidate new piece and occupied square creation*/
	for (var i=3; i<8; i+=1) {
		gBlackPieces.push(new Cell(0,i,true,false));
		gIsOccupied[0][i] = true;
		gBlackPieces.push(new Cell(10,i,true,false));
		gIsOccupied[10][i] = true;
		gBlackPieces.push(new Cell(i,0,true,false));
		gIsOccupied[i][0] = true;
		gBlackPieces.push(new Cell(i,10,true,false));
		gIsOccupied[i][10] = true;
		
		if (i==5){
			gBlackPieces.push(new Cell(1,i,true,false));
			gIsOccupied[1][i] = true;
			gBlackPieces.push(new Cell(9,i,true,false));
			gIsOccupied[9][i] = true;
			gBlackPieces.push(new Cell(i,1,true,false));
			gIsOccupied[i][1] = true;
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
	
	/*Not altogether sure if this creates a new cell or references an existing one*/
	var cell = new Cell(Math.floor(y/kPieceHeight), Math.floor(x/kPieceWidth));
	return cell;
}

/*Checks whether a game piece or empty cell is clicked*/
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

/*Will highlight a clicked piece and populate valid moves array*/
function clickOnPiece(cell) {
	if (cell.isSelected) { return; }
	/*Unselect the previous piece before selecting a new one*/
	if (gSelectedPiece !== undefined) {
		gSelectedPiece.isSelected = false;
	}
    gSelectedPiece = cell;
	gSelectedPiece.isSelected = true;
    gSelectedPieceHasMoved = false;
	validMoves(cell);
    drawBoard();
}

/*Re-populates the gValidMoves array*/
function validMoves(p) {

	gValidMoves = [];
    var column = p.column;
    var row = p.row;
	
	/*These series of for loops are a bit hacky*/
	
	/*Scan for empty squares above*/
	for(var i=row-1; i>=0; i--) {
		if(!gIsOccupied[i][column]) {
			gValidMoves.push(new Coordinate(i,column));
		} else {break;}
	}
	
	/*Scan empty rows below*/
	for(var i=row+1; i<kBoardHeight; i++) {
		if(!gIsOccupied[i][column]) {
			gValidMoves.push(new Coordinate(i,column));
		} else {break;}
	}
	
	/*Scan empty rows to the left*/
	for(var i=column-1; i>=0; i--) {
		if(!gIsOccupied[row][i]) {
			gValidMoves.push(new Coordinate(row,i));
		} else {break;}
	}
	
	/*Scan empty rows to the right*/
	for(var i=column+1; i<kBoardWidth; i++) {
		if(!gIsOccupied[row][i]) {
			gValidMoves.push(new Coordinate(row,i));
		} else {break;}
	}
}

/*Moves a piece if one is selected*/
function clickOnEmptyCell(cell) {

	/*If no piece or an invalid piece is selected, exit function*/
	if (gSelectedPiece == undefined) {return;}
	
	/*Compare the clicked space to the list of valid moves*/
	/*Implement king-checking for castle spaces*/
	var moveIsValid = false;
	for (var i=0; i<gValidMoves.length; i++) {
		if(gValidMoves[i].x == cell.column && gValidMoves[i].y == cell.row) {
			moveIsValid = true;
			break;
		}
	}
	
	/*If the move is a valid one, move the piece there and re-draw the board*/
	/*Later, implement the player switching here*/
	if (moveIsValid) {
		gIsOccupied[gSelectedPiece.row][gSelectedPiece.column] = false;
		gSelectedPiece.column = cell.column;
		gSelectedPiece.row = cell.row;
		gSelectedPiece.isSelected = false;
		gIsOccupied[gSelectedPiece.row][gSelectedPiece.column] = true;
		checkAdjacentPieces(gSelectedPiece);
		gSelectedPiece = undefined;
		drawBoard();
	}
	
}

/*THESE LAST TWO FUNCTIONS ARE A GODDAMN MESS. I MAY NEED TO IMPLEMENT A "GAMEBOARD" OBJECT TO CLEAN IT UP*/

/*Checks for adjacent pieces after a piece has moved*/
function checkAdjacentPieces(p) {
	
	for(var y=-1; y<=1; y++) {
		if (y==-1 || y==1) {
			if (gIsOccupied[p.row+y][p.column]) {
				isSurrounded(p, new Coordinate(p.row+y, p.column));
			}
		} else {
			if (gIsOccupied[p.row+y][p.column-1]) {
				isSurrounded(p, new Coordinate(p.row+y, p.column-1));
			} else if (gIsOccupied[p.row+y][p.column+1]) {
				isSurrounded(p, new Coordinate(p.row+y, p.column+1));
			}
		}
	}
}

/*Determines whether a piece is surrounded*/
function isSurrounded(originalPiece, targetCoordinate) {

	if(originalPiece.isBlack){
		/*Search through all the white pieces for a match. INEFFICIENT!*/
		for(var i=0; i<gWhitePieces.length; i++){
			
			/*If there is a white piece, check the opposite side for a piece*/
			if(gWhitePieces[i].row == targetCoordinate.y && gWhitePieces[i].column == targetCoordinate.x) {

				var pieceOffsetY = gWhitePieces[i].row - originalPiece.row;
				var pieceOffsetX = gWhitePieces[i].column - originalPiece.column;
				
				/*Look at the other side for a black piece. INEFFICIENT!*/
				if(gIsOccupied[targetCoordinate.y+pieceOffsetY][targetCoordinate.x+pieceOffsetX]){
					for(var j=0; j<gBlackPieces.length; j++) {
						if(gBlackPieces[j].row == targetCoordinate.y + pieceOffsetY && gBlackPieces[j].column == targetCoordinate.x + pieceOffsetX) {
							removePiece(gWhitePieces[i], i);
						}
					}
				}
			}
		}
	} else {
		/*Search through all the black pieces for a match. INEFFICIENT*/
		for(var i=0; i<gBlackPieces.length; i++){
			
			/*If there is a black piece, check the opposite side for a piece*/
			if(gBlackPieces[i].row == targetCoordinate.y && gBlackPieces[i].column == targetCoordinate.x) {

				var pieceOffsetY = gBlackPieces[i].row - originalPiece.row;
				var pieceOffsetX = gBlackPieces[i].column - originalPiece.column;
				
				/*Look at the other side for a white piece. INEFFICIENT!*/
				if(gIsOccupied[targetCoordinate.y+pieceOffsetY][targetCoordinate.x+pieceOffsetX]){
					for(var j=0; j<gWhitePieces.length; j++) {
						if(gWhitePieces[j].row == targetCoordinate.y + pieceOffsetY && gWhitePieces[j].column == targetCoordinate.x + pieceOffsetX) {
							removePiece(gBlackPieces[i], i);
						}
					}
				}
			}
		}
	}
	
}

/*Removes a piece from the game board then re-draws the board*/
function removePiece(p, pieceArrayIndex) {
	gIsOccupied[p.row][p.column] = false;
	
	if(p.isBlack) {
		gBlackPieces.splice(pieceArrayIndex, 1);
	} else {
		gWhitePieces.splice(pieceArrayIndex, 1);
	}
	drawBoard();
}
//}
