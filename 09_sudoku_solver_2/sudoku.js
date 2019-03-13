class Sudoku{
constructor(cornersIn, imgIn){
	//Transfer oriented image data
	this.imgO = ct.createImageData(imgIn.width, imgIn.height);
	for(var i=0;i<imgIn.data.length;i++) this.imgO.data[i] = imgIn.data[i];

	//Transfer Corner locations
	this.corners = cornersIn;
	this.cellL = Math.floor((cornersIn[3][0]-cornersIn[2][0])/8*0.8/2);

	//Init tiles
	this.status = "Initial"; //BoradStatus [Wrong, Undetermined, Solved]
	this.tiles = new Array(9);
	for(var x=0;x<9;x++){
		this.tiles[x] = new Array(9);
		for(var y=0;y<9;y++){
			this.tiles[x][y] = [0,1,2,3,4,5,6,7,8,9];
		}
	}

	//Initialize Solve Method Parameters
	this.interval;
	this.eraseCandidateTarget = 1;
	this.eraseCandiLastTarget = 1;
	this.displayCandidate = false;

	//Initialize Dummy System Parameters
	this.savedSudoku = new Array();
	this.progress = new Array();
	this.proIndex = 0;
	this.progress[this.proIndex] = 0;
	this.suspects = new Array();
	this.displayEachStep = true;
}
saveSudoku(saveIndex){
	this.savedSudoku[saveIndex] = new Array(81).fill(0);
	var numnum;
	for(var i=0;i<81;i++){
		numnum = this.tiles[i%9][Math.floor(i/9)][0];
		this.savedSudoku[saveIndex][i] = numnum;
	}
	//console.log(this.savedSudoku[saveIndex]);
	this.saveIndex++;
}
loadSudoku(loadIndex){
	for(var i=0;i<81;i++){
		this.tiles[i%9][Math.floor(i/9)] = [0,1,2,3,4,5,6,7,8,9];
	}
	for(var i=0;i<81;i++){
		if(this.savedSudoku[loadIndex][i]) this.setNumber(i%9,Math.floor(i/9),this.savedSudoku[loadIndex][i]);
	}
	this.updateCanvas();
}
setNumber(x,y,number){
	if(number==0) return;
	//console.log(x+","+y+","+number);
	for(var i=1;i<=9;i++) this.tiles[x][y][i] = 0;
	this.tiles[x][y][0] = number;
}
updateCanvas(){
	ct.putImageData(this.imgO, 0, 0);
	ct.textAlign = "center"; 
	ct.textBaseline = "middle"; 
	for(var x=0;x<9;x++){
		for(var y=0;y<9;y++){
			this.drawTile(x,y);
		}
	}
}
drawTile(x,y){
	//setup variables
	var xTempU, xTempD, yTempL, yTempR, xc, yc, dx, dy;
	var cell = this.tiles[x][y];
	var cl = this.cellL;
	var unknown = (cell[0]==0);

	//Locate the cordinate
	xTempU = this.corners[2][0]+x*(this.corners[3][0]-this.corners[2][0])/8;
	xTempD = this.corners[1][0]+x*(this.corners[0][0]-this.corners[1][0])/8;
	yTempL = this.corners[2][1]+y*(this.corners[1][1]-this.corners[2][1])/8;
	yTempR = this.corners[3][1]+y*(this.corners[0][1]-this.corners[3][1])/8;
	xc = xTempU+y*(xTempD-xTempU)/8;
	yc = yTempL+x*(yTempR-yTempL)/8;
	
	//Fill the background
	if(this.displayCandidate&&cell[0]==this.eraseCandidateTarget){
		ct.fillStyle = "green";
		ct.fillRect( xc-cl, yc-cl, cl*2, cl*2)
		ct.fillStyle = "cyan";
		for(var i=0;i<this.proIndex;i++){
			if(x==(this.suspects[i])%9&&y==Math.floor(this.suspects[i]/9)){
				ct.fillStyle=(i==(this.proIndex-1)?"orange":"yellow");
			}
		}
		cl*=0.8;
		ct.fillRect( xc-cl, yc-cl, cl*2, cl*2);
		cl/=0.8;
	}else{
		ct.fillStyle = unknown?"white":"cyan";
		for(var i=0;i<this.proIndex;i++){
			if(x==(this.suspects[i])%9&&y==Math.floor(this.suspects[i]/9)){
				ct.fillStyle=(i==(this.proIndex-1)?"orange":"yellow");
			}
		}
		ct.fillRect( xc-cl, yc-cl, cl*2, cl*2);
	}

	//Fill Texts
	ct.fillStyle = "black";
	ct.font = (unknown?"bold ":"")+ 2*cl/(unknown?3:1)+"px Arial";
	ct.textAlign = "center"; 
	ct.textBaseline = "middle"; 
	if(!unknown){
		ct.fillText(cell[0],xc,yc+cl/5);
	}else{
		for(var i=0;i<9;i++){
			if(cell[i+1]==0) continue;
			dx = (i%3-1)*cl*2/3;
			dy = Math.floor(i/3-1)*cl*2/3+cl/15;
			ct.fillText(cell[i+1],xc+dx,yc+dy);
		}
	}
}
countCandidate(tileIndex){
	var x = tileIndex%9;
	var y = Math.floor(tileIndex/9);
	var candidateNum = 0;
	for(var i=1;i<=9;i++){
		if(this.tiles[x][y][i]!=0) candidateNum++;
	}
	return candidateNum;
}

getNthcandidate(tileIndex, candidateIndex){
	var x = tileIndex%9;
	var y = Math.floor(tileIndex/9);
	for(var i=1;i<=9;i++){
		if(this.tiles[x][y][i]!=0) candidateIndex--;
		if(candidateIndex==0) return i;
		if(i==9) return -1;
	}
}
runDummy(){
	if(this.displayEachStep){
		this.displayEachStep = false;
		stepper.startSolving(15);
	}
	var validCandidateFound, candNum, minCandidate, minIndex, theCandidate;
	for(var limit=100;limit>0;limit--) {
		this.progress[this.proIndex]++;
		validCandidateFound = false;
		console.log(this.progress);

		//Find minimum candidate and its index
		minCandidate = 9;
		theCandidate = -1;
		for(var index=0;index<81;index++){
			candNum = this.countCandidate(index);
			if(candNum!=0&&candNum<minCandidate){
				minCandidate = candNum;
				minIndex = index;
				theCandidate = this.getNthcandidate(index,this.progress[this.proIndex]);
			}
		}

		//If there is enough candidate save and go deeper
		if(theCandidate>0&&this.status!="Wrong"){
			this.saveSudoku(this.proIndex);
			this.setNumber(minIndex%9,Math.floor(minIndex/9),theCandidate);
			this.suspects[this.proIndex] = minIndex;
			this.proIndex++;
			this.progress[this.proIndex] = 0;
			return true;
		}
		this.progress[this.proIndex] = 0;
		this.proIndex--;
		this.loadSudoku(this.proIndex);
		while(this.makeaProgress(true)!=false);
	}
}
makeaProgress(runDummy = false){
	this.updateCanvas();

	//Erase a Candidate
	if(this.checkSingleCandidate())	return true;
	if(this.status!="Wrong"&&this.eraseCandidate())	return true;
	if(this.status!="Wrong"&&this.updateTarget())	return true;
	if(this.status!="Wrong"&&this.checkBoard()) return "SOLVED";
	if(runDummy) return false;
	if(this.runDummy()) return true;
	return "UNSOLVABLE";
}
checkSingleCandidate(){
	//Set up Variables
	var x, y, dx, dy, progress = false;
	var r, k, c, b;//Row, Column, Cell, Box;
	var X,Y;
	if(!this.displayEachStep){
		for(var i=1;i<=9;i++){
			this.eraseCandidate(i);
		}
		this.checkBoard();
		if(this.status=="Wrong") return false;
	}

	for(var tar=1;tar<=9;tar++){
		for(var index=0;index<81;index++){
			x = index%9;
			y = Math.floor(index/9);
			r = k = c = b = -1;
			for(var i=0;i<9;i++){
				X = Math.floor(x/3)*3+i%3;
				Y = Math.floor(y/3)*3+Math.floor(i/3);
				r=(r!=-2?(this.tiles[i][y][0]==tar?-2:(this.tiles[i][y][tar]==tar?(r>=0?-2:i  ):r)):r);
				k=(k!=-2?(this.tiles[x][i][0]==tar?-2:(this.tiles[x][i][tar]==tar?(k>=0?-2:i  ):k)):k);
				c=(c!=-2?(this.tiles[x][y][0]!=0  ?-2:(this.tiles[x][y][i+1]!=0  ?(c>=0?-2:i+1):c)):c);
				b=(b!=-2?(this.tiles[X][Y][0]==tar?-2:(this.tiles[X][Y][tar]==tar?(b>=0?-2:i  ):b)):b);
			}
			if(r>=0){
				//console.log("1 Candidate in a row (y, candidate) = ("+y+", "+tar+")");
				this.setNumber(r,y,tar);
				return true;
			}
			if(k>=0){
				//console.log("1 Candidate in a col (x, candidate) = ("+x+", "+tar+")");
				this.setNumber(x,k,tar);
				return true;
			}
			if(c>=0){
				//console.log("1 Candidate in a cell(x, y) = ("+x+", "+y+")");
				this.setNumber(x,y,c);
				return true;
			}
			if(b>=0){
				X = Math.floor(x/3)*3+b%3;
				Y = Math.floor(y/3)*3+Math.floor(b/3);
				//console.log("1 Candidate in a cell(x, y) = ("+X+", "+Y+")");
				this.setNumber(X,Y,tar);
				return true;
			}
		}
	}
	return false;
}
eraseCandidate(tarNum = this.eraseCandidateTarget){
	//Set up Variables
	var x, y, dx, dy, progress = false;

	for(var index=0;index<81;index++){
		 x = index%9;
		dx = Math.floor(x/3)*3;
		 y = Math.floor(index/9);
		dy = Math.floor(y/3)*3;

		if(this.tiles[x][y][tarNum]==0) continue;
		for(var i=0;i<9;i++){
			if(this.tiles[x][i][0]==tarNum){
				//console.log("Erased Candidate by Col(x, candidate) = ("+x+", "+tarNum+")");
				progress = true;
				this.tiles[x][y][tarNum] = 0;
			}else if(this.tiles[i][y][0]==tarNum){
				//console.log("Erased Candidate by Row(y, candidate) = ("+y+", "+tarNum+")");
				progress = true;
				this.tiles[x][y][tarNum] = 0;
			}else if(this.tiles[dx+i%3][dy+Math.floor(i/3)][0]==tarNum){
				//console.log("Erased Candidate by Box(dx, dy, candidate) = ("+dx+", "+dy+", "+tarNum+")");
				progress = true;
				this.tiles[x][y][tarNum] = 0;
			}
		}
	}
	if(progress){
		this.eraseCandiLastTarget = tarNum;
		this.displayCandidate = true;
	}else{
		this.displayCandidate = false;
	}

	return progress;
}
updateTarget(){
	this.eraseCandidateTarget = this.eraseCandidateTarget%9+1;
	return (this.eraseCandidateTarget!=this.eraseCandiLastTarget);
}
checkBoard(){
	//Set up Variables
	var x, y, dx, dy;
	var row, col, box;

	for(var index=0;index<81;index++){
		x=index%9;
		y=Math.floor(index/9);
		if(this.tiles[x][y][0]==0){
			if(this.countCandidate(index)==0){
				this.status = "Wrong";
				console.log("I knew it");
				return false;
			}
		}
	}

	for(var index=0;index<9;index++){
		 x = index;
		 y = index;
		dx = index%3*3;
		dy = Math.floor(index/3)*3;
		row = [0,0,0,0,0,0,0,0,0];
		col = [0,0,0,0,0,0,0,0,0];
		box = [0,0,0,0,0,0,0,0,0];

		for(var i=0;i<9;i++){
			if(this.tiles[x][i][0]!=0) row[this.tiles[x][i][0]-1]++;
			if(this.tiles[i][y][0]!=0) col[this.tiles[i][y][0]-1]++;
			if(this.tiles[dx+i%3][dy+Math.floor(i/3)][0]!=0) box[this.tiles[dx+i%3][dy+Math.floor(i/3)][0]-1]++;
		}
		for(var i=0;i<9;i++){
			if(row[i]>1){
				//console.log("Dublicate "+(i+1)+" at row = "+ index);
				this.status = "Wrong";
				return false;
			}
			if(col[i]>1){
				//console.log("Dublicate "+(i+1)+" at col = "+ index);
				this.status = "Wrong";
				return false;
			}
			if(box[i]>1){
				//console.log("Dublicate "+(i+1)+" at box = "+ index);
				this.status = "Wrong";
				return false;
			}
		}
	}
	for(var index=0;index<81;index++){
		x=index%9;
		y=Math.floor(index/9);
		if(this.tiles[x][y][0]==0){
			this.status = "Undetermined";
			return false;
		}
	}
	return true;
}
}