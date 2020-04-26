class Sudoku{
constructor(){
	//Init tiles
	this.step = 0;//Inclements everytime it solves a tile
	this.showMethod = false;
	this.tiles = new Array(9);
	for(let x=0;x<9;x++){
		this.tiles[x] = new Array(9);
		for(let y=0;y<9;y++){
			this.resetTile(x,y);
		}
	}
}
reloadSudoku(){
	this.step = 0;
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			if(this.tiles[x][y][1]!=0) this.resetTile(x,y);
		}
	}
}
showHideMethod(){
	this.showMethod=!this.showMethod;
	swicch.value = this.showMethod?"Hide Method":"Show Method";
	draw();
}
resetTile(x,y){ this.tiles[x][y] = [0,0,0,0,0,0,0,0,0,0];}
setTile(x,y,n,s=false,p1=0){
	this.tiles[x][y] = [n,0,0,0,0,0,0,0,0,0];
	if(s!=false){
		this.step++;
		slider.max=this.step;
		this.tiles[x][y][1]=this.step;
		this.tiles[x][y][2]=s;
		this.tiles[x][y][3]=p1;
		console.log(s);
	}
	draw();
}
draw(){
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			const num = this.tiles[x][y][0];
			const color = this.tiles[x][y][1]==0?"black":"darkgray";
			if(num==0) continue;
			if(this.tiles[x][y][1]>slider.value) continue;
			if(this.tiles[x][y][1]==slider.value&&this.showMethod&&slider.value!=0){
				if(this.tiles[x][y][2]=="SinglePosition_Box"){
					const box = this.tiles[x][y][3];
					const xii = 1+box%3*3;
					const xil = 3+box%3*3;
					const yii = 1+Math.floor(box/3)*3;
					const yil = 3+Math.floor(box/3)*3;
					drawRectIndex(xii,yii,xil,yil,"lime");
					drawNumber(x+1,y+1,num,"lime");
					console.log(this.tiles[x][y][2],this.tiles[x][y][3]);
					continue;
				}
				if(this.tiles[x][y][2]=="SinglePosition_Row"){
					const row = this.tiles[x][y][3];
					const xii = 1;
					const xil = 9;
					const yii = row+1;
					const yil = row+1;
					drawRectIndex(xii,yii,xil,yil,"lime");
					drawNumber(x+1,y+1,num,"lime");
					console.log(this.tiles[x][y][2],this.tiles[x][y][3]);
					continue;
				}
				if(this.tiles[x][y][2]=="SinglePosition_Col"){
					const col = this.tiles[x][y][3];
					const xii = col+1;
					const xil = col+1;
					const yii = 1;
					const yil = 9;
					drawRectIndex(xii,yii,xil,yil,"lime");
					drawNumber(x+1,y+1,num,"lime");
					console.log(this.tiles[x][y][2],this.tiles[x][y][3]);
					continue;
				}
				if(this.tiles[x][y][2]=="SingleCandidate"){
					const index = this.tiles[x][y][3];
					const xii = 1+index%9;
					const xil = 1+index%9;
					const yii = 1+Math.floor(index/9);
					const yil = 1+Math.floor(index/9);
					drawRectIndex(xii,yii,xil,yil,"lime");
					drawNumber(x+1,y+1,num,"lime");
					console.log(this.tiles[x][y][2],this.tiles[x][y][3]);
					continue;
				}
				console.log(this.tiles[x][y][2]);
			}
			drawNumber(x+1,y+1,num,color);
		}
	}
}
startSolving(){
	this.reloadSudoku();
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			if(this.tiles[x][y][1]!=0) this.resetTile(x,y);
		}
	}
	while(this.solve());
}
solve(){
	if(this.singlePosition()) return true;
	if(this.singleCandidate()) return true;
	return false;
}
singleCandidate(){
	let candidate = new Array(81);
	for(let i=0;i<81;i++) candidate[i]=[0,1,2,3,4,5,6,7,8,9];
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			if(this.tiles[x][y][0]==0) continue;
			//If there is a number, then it cannnot be a candidate
			candidate[x+y*9] = [0,0,0,0,0,0,0,0,0,0];

			//If the number on tile matches, then clear candidates by row,colum and box
			if(this.tiles[x][y][0]!=0){
				for(let i=0;i<9;i++){
					//By column
					candidate[i+9*y][this.tiles[x][y][0]]=0;
					//By row
					candidate[x+9*i][this.tiles[x][y][0]]=0;
					//By box
					let box = indexToBox([x,y]);//0~9
					box = (box%3)*3+Math.floor(box/3)*3*9;//upper left of 0~81
					candidate[box+i%3+Math.floor(i/3)*9][this.tiles[x][y][0]]=0;
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
				this.setTile(x,y,n,"SingleCandidate",x+y*9);
				return true;
			}
			candidate[x+y*9][0]=count;
		}
	}
	console.log(candidate);
	return false;
}
singlePosition(){
	for(let n=1;n<=9;n++){//Check based on Number first
		let candidate = new Array(81).fill(1);
		for(let x=0;x<9;x++){
			for(let y=0;y<9;y++){
				if(this.tiles[x][y][0]==0) continue;
				//If there is a number, then it cannnot be a candidate
				candidate[x+y*9] = 0;

				//If the number on tile matches, then clear candidates by row,colum and box
				if(this.tiles[x][y][0]==n){
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
				this.setTile(index%9,Math.floor(index/9),n,"SinglePosition_Box",box);
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
				this.setTile(index%9,Math.floor(index/9),n,"SinglePosition_Row",row);
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
				this.setTile(index%9,Math.floor(index/9),n,"SinglePosition_Col",col);
				return true;
			}
		}
	}
	return false;
}
candidateLine(){}
doublePair(){}
multiLine(){}
nakedPairs(){}
hiddenPairs(){}
}