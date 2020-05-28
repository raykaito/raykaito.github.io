class Board{
constructor(board=false){
	//Initialize
	this.msg = "Not Modified";
	this.par = 0;
	this.level = 0;
	this.initializeTileAndNote();
	if(board!=false) this.dupulicateTileAndNote(board);
}
initializeTileAndNote(){
	this.tile = new Array(9);//Negative for Original, Positive for Solved
	this.note = new Array(9);//true:possible false:erased
	for(let x=0;x<9;x++){
		this.tile[x] = new Array(9).fill(0);
		this.note[x] = new Array(9);
		for(let y=0;y<9;y++){
			this.note[x][y] = new Array(9).fill(false);
		}
	}
	this.msg = "Initialized";
	this.par = 0;
}
dupulicateTileAndNote(board){
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			this.tile[x][y] = board.tile[x][y];
			for(let i=0;i<9;i++){
				this.note[x][y][i] = board.note[x][y][i];
			}
		}
	}
}
addOriginalNumber(x,y,num){
	this.tile[x][y] = -num;
	this.msg = "Original Number Added";
	this.par = [x,y];
	console.log("sudoku.userInput("+x+","+y+","+num+");");
}
addUserInputNumber(x,y,num){
	this.tile[x][y] = num;
	this.msg = "User Solved a Tile";
	this.par = [x,y];
}
userModifiedNote(x,y,num){
	this.note[x][y][num-1] = !this.note[x][y][num-1];
	this.msg = "User Added/Removed a Note";
	this.par = [x,y,num-1];
}
programProgressed(x,y,num,[msg,hiliNum,hiliNote,hiliBox,level]){
	this.tile[x][y] = num;
	this.msg = msg;
	this.hiliNum = hiliNum;
	this.hiliNote= hiliNote;
	this.hiliBox = hiliBox;
	this.level = level
}
programProgressedNote(x,y,num,[msg,hiliNum,hiliNote,hiliBox,level]){
	for(let j=0;j<x.length;j++){
		for(let i=0;i<num.length;i++){
			this.note[x[j]][y[j]][num[i]-1] = false;
		}
	}
	this.msg = msg;
	this.hiliNum = hiliNum;
	this.hiliNote= hiliNote;
	this.hiliBox = hiliBox;
	this.level = level
}
addNotes(note){
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			for(let i=0;i<9;i++){
				this.note[x][y][i] =note[x][y][i];
			}
		}
	}
	this.msg = "Note Updated";
}
deleteNotes(note){
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			for(let i=0;i<9;i++){
				if(note[x][y][i]==false)this.note[x][y][i] = false;
			}
		}
	}
	this.msg = "Note Updated";
}
solved(solved){
	//console.log("here");
	this.msg = solved?"SUDOKU SOLVED!":"SUDOKU UNSOLVED...";
	this.hiliBox = [[1,1,9,9,solved?"lime":"red"]];
}
draw(showMsg=false,hilightNumber=null,hilightNote=null){
	//Draw Original Numbers
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			const num = this.tile[x][y];
			//Draw Original Numbers
			if(num<0){drawNumber(x+1,y+1,-num,"black");}
			//Draw Solved Numbers
			if(num>0){drawNumber(x+1,y+1, num,"darkGray");}
			//Draw Highlight
			if(hilightNumber!=null&&hilightNumber>0&&hilightNumber==Math.abs(num)){
				drawRectIndex(x+1,y+1,x+1,y+1,"lime",1);
			}
			if(num==0){
				for(let num=0;num<9;num++){
					if(this.note[x][y][num]){
						drawNotes(x+1,y+1,num+1,num+1,"darkGray");
						if(hilightNote!=null&&hilightNote[num]){
							drawNotes(x+1,y+1,num+1,"▢","lime",1.1);
						}
					}
				}
			}
		}
	}
	//Draw Progress
	if(showMsg&&(phase.phase=="User Solving"||phase.phase=="Analyzed")){
		drawNumber(5,10,this.msg,"black",side*0.6,"Times New Roman",false);
		if(this.hiliNum!=null){
			for(let i=0;i<this.hiliNum.length;i++){
				drawNumber(this.hiliNum[i][0],this.hiliNum[i][1],this.hiliNum[i][2],this.hiliNum[i][3]);
			}
		}
		if(this.hiliBox!=null){
			for(let i=0;i<this.hiliBox.length;i++){
				drawRectIndex(this.hiliBox[i][0],this.hiliBox[i][1],this.hiliBox[i][2],this.hiliBox[i][3],this.hiliBox[i][4],3);
			}
		}
		if(this.hiliNote!=null){
			for(let i=0;i<this.hiliNote.length;i++){
				drawNotes(this.hiliNote[i][0],this.hiliNote[i][1],this.hiliNote[i][2],this.hiliNote[i][3],this.hiliNote[i][4],this.hiliNote[i][5]);
			}
		}
	}
	return;
}
}