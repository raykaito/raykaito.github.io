var t, tickTime;
var gameover;

function Game(){
	var cell, row, col, itv, ssPhase, score, offset;

	init = function(){
		console.log("Initializing");

		row = 11;
		col = 11;
		tickTime = 150;
		ssPhase = 0;
		gameover = false;

		initEventlistener();
		initCanvas();

		cell = new Array();
		for(var i=0; i<col; i++){
			cell[i] = new Array();
			for(var j=0; j<row; j++){
				cell[i][j] = new Cell(0,i,j);
			}
		}
		spawnCell(  ((col-1)/2)  ,  ((row-1)/2)  ,  8  );

		firstTime = performance.now();
		lastTime = 0;
		itv = setInterval(tick,tickTime);
		drawBoard();
	}; 

	getRow = function(){ return row;};
	getCol = function(){ return col;};

	showScore = function(){
		gameover = true;
		if(ssPhase==0){
			ssPhase++;
			setTimeout(showScore, 2000);
		}else if(ssPhase==1){
			for(var i=0; i<col; i++){
				for(var j=0; j<row; j++){
					cell[i][j].draw(true);
				}
			}
			ssPhase++;
			setTimeout(showScore, 2000);
		}else if(ssPhase==2){
			score = 0;
			//updateScore();
			//displayScore();
			itv = setInterval(countScore,10);
			//ssPhase++;
			//setTimeout(showScore, 2000);
		}
	};

	countScore = function(){
		for(var i=0; i<col; i++){
			for(var j=0; j<row; j++){
				if(cell[i][j].countDot()){
					score++;
					displayScore();
					return;
				}
			}
		}
		clearInterval(itv);
	};

	displayScore = function(){
		if(String(score).length==3) offset = 0;
		if(String(score).length==2) offset = 4;
		if(String(score).length==1) offset = 8;

		for(var s=0;s<String(score).length;s++){
			var digit = Number(String(score).charAt(s));
			for(var i=0; i<3; i++){
				for(var j=0; j<5; j++){
					if(Number(String(digitd[digit]).charAt(i+3*j))){
						cell[i+4*s+offset][j+3].setDigit(true);
					}else{
						cell[i+4*s+offset][j+3].setDigit(false);
					}
				}
			}
		}
	}

	updateScore = function(){
		score = 0;
		for(var i=0; i<col; i++){
			for(var j=0; j<row; j++){
				if(cell[i][j].number()>0) score+=cell[i][j].number();
			}
		}
	};

	checkFillState = function(){
		for(var i=0; i<col; i++){
			for(var j=0; j<row; j++){
				if(cell[i][j].number()==0) return "notFilled";
			}
		}
		return "filled";
	};

	spawnCell = function(x,y,num,noOverWrite){
		if(x<0||x>=col) return;
		if(y<0||y>=row) return;
		if(noOverWrite){
			if(cell[x][y].number()!=0) return;
		}
		cell[x][y].setNum(num);
	};

	cellNumber = function (x,y){
		return cell[x][y].number();
	};

	swiped = function(lx, ly, x, y){
		lxi = getXindex(lx,ly);
		lyi = getYindex(lx,ly);

		xi = getXindex(x,y);
		yi = getYindex(x,y);

		if(cell[lxi][lyi].number()==0)	return;
		if(lxi==xi&&lyi==yi)			cell[xi][yi].shatter();

		cell[lxi][lyi].multiply(xi,yi);
	};

	draw = function(){
		for(var i=0; i<col; i++){
			for(var j=0; j<row; j++){
				cell[i][j].draw();
			}
		}
	};

	tick = function(){
		if(checkFillState()=="filled"){
			clearInterval(itv);
			showScore();
		}
		t = performance.now();
		var x = getRandomInt(col);
		var y = getRandomInt(row);
		cell[x][y].gainXp();
	};
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function getXindex(x,y){
	return Math.floor(x/cellLeg);
}

function getYindex(x,y){
	return Math.floor(y/cellLeg);
}

console.log("Loaded: game.js");