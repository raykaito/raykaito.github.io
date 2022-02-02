const phases = ["InputProblem","SolveProblem","EditNote"];

class Sudoku{
constructor(){
	//Init tiles
	this.phase= 0;//["inputProblem,SolveProblem,editNote"]
	this.step = 0;//Inclements everytime it solves a tile
	this.showMethod = false;//If true, show the method to make last progress
	this.notes = new Array(9);
	this.tiles = new Array(9);
	this.tilesO= new Array(9);
	this.solution = new Array();//[index(1~81),number(1~9),method(String),parameter(array)]
	for(let x=0;x<9;x++){
		this.notes[x] = new Array(9);
		this.tiles[x] = new Array(9).fill(0);
		this.tilesO[x]= new Array(9).fill(0);
		for(let y=0;y<9;y++){
			this.notes[x][y] = new Array(9).fill(1);
		}
	}
}
userInput(x,y,num){
	if(this.phase==0){
		this.tiles[x][y] = num;
		this.tilesO[x][y]= num;
	}
	if(this.phase==1){
		this.solutionFound(x,y,num,"UserSolved",9*y+x);

	}
	if(this.phase==2){
		if(this.notes[x][y][num-1]==0)this.notes[x][y][num-1]=1;
		else if(this.notes[x][y][num-1]==1)this.notes[x][y][num-1]=0;
	}
	draw();
}
showHideMethod(){
	this.showMethod=!this.showMethod;
	metho.value = this.showMethod?"Hide Method":"Show Method";
	draw();
}
changePhase(){
	this.phase = (this.phase+1)%3;
	phase.value = phases[this.phase];
	draw();
}
cs(){
	for(let row=0;row<9;row++){
		const s = ""+this.tiles[0][row]+","+this.tiles[1][row]+","+this.tiles[2][row]+","+this.tiles[3][row]+","+this.tiles[4][row]+","+this.tiles[5][row]+","+this.tiles[6][row]+","+this.tiles[7][row]+","+this.tiles[8][row];
		console.log(s);
	}
}
reloadSudoku(){
	this.step = 0;
	this.solution = new Array();
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			const num = this.tilesO[x][y];
			if(num==0) this.tiles[x][y]=0;
		}
	}
}
erasedNoteFound(x,y,num,met,par=0){
	this.solution[this.step] = [x,y,-num,met,par];
	this.notes[x][y][num-1]=2;
	this.step++;
	slider.max=this.step;
	draw();
}
solutionFound(x,y,num,met,par=0){
	this.solution[this.step] = [x,y,num,met,par];
	this.tiles[x][y] = num;
	this.step++;
	slider.max=this.step;
	draw();
}
draw(){
	//Draw Original Numbers
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			const num = this.tilesO[x][y];
			if(num!=0) drawNumber(x+1,y+1,num,"black");
		}
	}
	//Draw Notes
	if(this.phase==2){
		for(let x=0;x<9;x++){
			for(let y=0;y<9;y++){
				if(this.tiles[x][y]!=0)continue;
				for(let num=0;num<9;num++){
					if(this.notes[x][y][num]>0)drawNotes(x+1,y+1,num+1,"darkGray");
				}
			}
		}
	}
	//Draw Progress
	for(let step=0;step<Math.min(this.step,slider.value);step++){
		const x   = this.solution[step][0];
		const y   = this.solution[step][1];
		const num = this.solution[step][2];
		if(!this.showMethod||step<slider.value-1){
			if(num>0)					drawNumber(x+1,y+1,num,"darkGray");
			else if(this.phase==2)		drawNotes (x+1,y+1,-num,"darkGray",true);
			continue;
		}
		if(this.solution[step][3]=="SinglePosition_Box"){
			const box = this.solution[step][4];
			const xii = 1+box%3*3;
			const xil = 3+box%3*3;
			const yii = 1+Math.floor(box/3)*3;
			const yil = 3+Math.floor(box/3)*3;
			drawRectIndex(xii,yii,xil,yil,"lime");
			drawNumber(x+1,y+1,num,"lime");
			continue;
		}
		if(this.solution[step][3]=="SinglePosition_Row"){
			const row = this.solution[step][4];
			const xii = 1;
			const xil = 9;
			const yii = row+1;
			const yil = row+1;
			drawRectIndex(xii,yii,xil,yil,"lime");
			drawNumber(x+1,y+1,num,"lime");
			continue;
		}
		if(this.solution[step][3]=="SinglePosition_Col"){
			const col = this.solution[step][4];
			const xii = col+1;
			const xil = col+1;
			const yii = 1;
			const yil = 9;
			drawRectIndex(xii,yii,xil,yil,"lime");
			drawNumber(x+1,y+1,num,"lime");
			continue;
		}
		if(this.solution[step][3]=="SingleCandidate"){
			const index = this.solution[step][4];
			const xii = 1+index%9;
			const xil = 1+index%9;
			const yii = 1+Math.floor(index/9);
			const yil = 1+Math.floor(index/9);
			drawRectIndex(xii,yii,xil,yil,"lime");
			drawNumber(x+1,y+1,num,"lime");
			continue;
		}
		if(this.solution[step][3]=="UserSolved"){
			const index = this.solution[step][4];
			const xii = 1+index%9;
			const xil = 1+index%9;
			const yii = 1+Math.floor(index/9);
			const yil = 1+Math.floor(index/9);
			drawRectIndex(xii,yii,xil,yil,"magenta");
			drawNumber(x+1,y+1,num,"magenta");
			continue;
		}
		if(this.solution[step][3]=="candidateLine"){
			const index = this.solution[step][4];
			const xii = 1+index%9;
			const xil = 1+index%9;
			const yii = 1+Math.floor(index/9);
			const yil = 1+Math.floor(index/9);
			//drawRectIndex(xii,yii,xil,yil,"green");
			if(this.phase==2) drawNotes(x+1,y+1,-num,"red",true);
			continue;
		}
	}
}
startSolving(){
	//this.reloadSudoku();
	while(this.solve());
}
solve(){
	if(this.singlePosition()) return true;
	if(this.singleCandidate()) return true;
	if(this.updateNotes()) return true;
	if(this.candidateLine()) return true;
	return false;
}
updateNotes(){
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			const num = this.tiles[x][y];
			if(num!=0){
				for(let i=0;i<9;i++){
					//By column
					this.notes[i][y][num-1]=0;
					//By row
					this.notes[x][i][num-1]=0;
					//By box
					const box = indexToBox([x,y]);//0~9
					const [xtemp,ytemp] = this.biToXY([box,i]);
					this.notes[xtemp][ytemp][num-1]=0;
				}
			}
		}
	}
	draw();
	return false;
}
singleCandidate(){
	let candidate = new Array(81);
	for(let i=0;i<81;i++) candidate[i]=[0,1,2,3,4,5,6,7,8,9];
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			if(this.tiles[x][y]==0) continue;
			//If there is a number, then it cannnot be a candidate
			candidate[x+y*9] = [0,0,0,0,0,0,0,0,0,0];

			//If the number on tile matches, then clear candidates by row,colum and box
			if(this.tiles[x][y]!=0){
				for(let i=0;i<9;i++){
					//By column
					candidate[i+9*y][this.tiles[x][y]]=0;
					//By row
					candidate[x+9*i][this.tiles[x][y]]=0;
					//By box
					let box = indexToBox([x,y]);//0~9
					box = (box%3)*3+Math.floor(box/3)*3*9;//upper left of 0~81
					candidate[box+i%3+Math.floor(i/3)*9][this.tiles[x][y]]=0;
				}
			}
		}
	}
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			let count=0;
			let n=0;
			for(let i=0;i<10;i++){
				if(candidate[x+y*9][i]==0) count++;
				else n = candidate[x+y*9][i];
			}
			if(count==9){
				this.solutionFound(x,y,n,"SingleCandidate",x+y*9);
				return true;
			}
			candidate[x+y*9][0]=count;
		}
	}
	//console.log(candidate);
	return false;
}
singlePosition(){
	for(let n=1;n<=9;n++){//Check based on Number first
		let candidate = new Array(81).fill(1);
		for(let x=0;x<9;x++){
			for(let y=0;y<9;y++){
				if(this.tiles[x][y]==0) continue;
				//If there is a number, then it cannnot be a candidate
				candidate[x+y*9] = 0;

				//If the number on tile matches, then clear candidates by row,colum and box
				if(this.tiles[x][y]==n){
					for(let i=0;i<9;i++){
						//By column
						candidate[i+9*y]=0;
						//By row
						candidate[x+9*i]=0;
						//By box
						let box = indexToBox([x,y]);//0~9
						box = (box%3)*3+Math.floor(box/3)*3*9;//upper left of 0~81
						candidate[box+i%3+Math.floor(i/3)*9]=0;
					}
				}
			}
		}
		//Now, candidates were eliminated. Choose the only one based on row, column or box
		//console.log(candidate);
		let index = 0;
		for(let box=0;box<9;box++){//Check by Box
			const boxIndex = (box%3)*3+Math.floor(box/3)*3*9;
			let count = 0;
			for(let i=0;i<9;i++){
				if(candidate[boxIndex+i%3+Math.floor(i/3)*9]==1){
					count++;
					index = boxIndex+i%3+Math.floor(i/3)*9;
				}
			}
			if(count==1){
				this.solutionFound(index%9,Math.floor(index/9),n,"SinglePosition_Box",box);
				return true;
			}
		}
		for(let row=0;row<9;row++){//Check by Row
			let count = 0;
			for(let i=0;i<9;i++){
				if(candidate[i+9*row]==1){
					count++;
					index = i+9*row;
				}
			}
			if(count==1){
				this.solutionFound(index%9,Math.floor(index/9),n,"SinglePosition_Row",row);
				return true;
			}
		}
		for(let col=0;col<9;col++){//Check by Col
			let count = 0;
			for(let i=0;i<9;i++){
				if(candidate[col+9*i]==1){
					count++;
					index = col+9*i;
				}
			}
			if(count==1){
				this.solutionFound(index%9,Math.floor(index/9),n,"SinglePosition_Col",col);
				return true;
			}
		}
	}
	return false;
}
candidateLine(){
	for(let box=0;box<9;box++){
		for(let num=1;num<=9;num++){
		let xCandidateLine = -1;
		let yCandidateLine = -1;
			for(let i=0;i<9;i++){
				const [x,y] = this.biToXY([box,i]);
				if(this.tiles[x][y]!=0) continue;
				if(this.notes[x][y][num-1]==0) continue;
				if(xCandidateLine==-1){//This is the first one found
					xCandidateLine=x;
					yCandidateLine=y;
					continue;
				}else{
					if(xCandidateLine!=x)xCandidateLine=-2;
					if(yCandidateLine!=y)yCandidateLine=-2;
				}
			}
			if(xCandidateLine>-1){
				for(let i=0;i<9;i++){
					if(indexToBox([xCandidateLine,i])==box) continue;
					if(this.tiles[xCandidateLine][i]!=0) continue;
					if(this.notes[xCandidateLine][i][num-1]==1){
						this.erasedNoteFound(xCandidateLine,i,num,"candidateLine",num);
						return true;
					}
				}
			}
			if(yCandidateLine>-1){
				for(let i=0;i<9;i++){
					if(indexToBox([i,yCandidateLine])==box) continue;
					if(this.tiles[i][yCandidateLine]!=0) continue;
					if(this.notes[i][yCandidateLine][num-1]==1){
						this.erasedNoteFound(i,yCandidateLine,num,"candidateLine",num);
						return true;
					}
				}
			}		
		}
	}
	return false;
}
doublePair(){}
multiLine(){}
nakedPairs(){}
hiddenPairs(){}
biToXY([box,i]){
	const index = (box%3)*3+Math.floor(box/3)*3*9+i%3+Math.floor(i/3)*9;//upper left of 0~81
	return [index%9,Math.floor(index/9)]
}
}