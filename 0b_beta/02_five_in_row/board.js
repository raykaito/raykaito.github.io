function tile(){
	this.p = 0;
	this.bscore = [0,0];
	this.wscore = [0,0];
}
tile.prototype.getScore = function(player, level){
	if(player==1)
		return this.bscore[level];
	else
		return this.wscore[level];
};
tile.prototype.init = function(){
	this.clear();
};
tile.prototype.clear = function(){
	this.bscore[0] = this.bscore[1] = 0;
	this.wscore[0] = this.wscore[1] = 0;
};

function board(){
	this.st= [];
	this.sc=  1;
	this.sm=  0;
	this.t = [];
	this.currentPlayer = 1;
	this.moveCout = 0;
}
board.prototype.saveb = function(){
	var l;
	for(l=0;l<row*col;l++){
		this.st[l] = this.t[l].p;
	}
	this.sc = this.currentPlayer;
	this.sm = this.moveCount;
};
board.prototype.loadb = function(){
	var l;
	for(l=0;l<row*col;l++){
		this.t[l].p = this.st[l];
	}
	this.currentPlayer = this.sc;
	this.moveCount = this.sm;
	analyzeAll();
	updateCanvas();
};
board.prototype.getScore = function(player, advanced, index){
	return this.t[index].getScore(player, advanced?1:0);
};
board.prototype.init = function(){
	var i;
	for(i=0; i<row*col;i++){
		this.t.push(new tile());
		this.t[i].init();
	}
	this.clearBoard();
	this.saveb();
};
board.prototype.clearBoard = function(){
	var i;
	for(i=0;i<row*col;i++){
		this.t[i].p = 0;
		this.t[i].clear();
	}
	this.currentPlayer = 1;
	this.moveCount = 0;
	stateIndex = 0;
};
board.prototype.moveBack  = function(){
	if(this.moveCount == 0) return;
	var i;
	for(i=0;i<row*col;i++){
		if(Math.abs(this.t[i].p)==this.moveCount){
			this.t[i].p = 0;
			analyze(i);
			this.moveCount--;
			this.currentPlayer*=-1;
			return;
		}
	}
	updateCanvas();
};
board.prototype.setStone = function(index){
	if(stateIndex!=0) return;
	if(index==null){
		alert("invalid index:");
		return;
	}
	if(cpuActive==false){
		sound.load();
		sound.play();
	}
	if(this.t[index].p==0){
		this.moveCount++;
		this.t[index].p = this.moveCount*this.currentPlayer;
		analyze(index);
		this.currentPlayer*=-1;
	}
	updateCanvas();
};
function getSide(i){
	if(i<0||i>=row*col){
		alert(i+"");
		return;
	}
	if     (Number(b.t[i].p)> 0)return  1;
	else if(Number(b.t[i].p)< 0)return -1;
	else				return  0;
}
function tor(index){
	return Math.floor(index/row);
}
function toc(index){
	return (index%row);
}
function toi(r, c){
	return r*col+c;
}