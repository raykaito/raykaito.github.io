const phases = ["InputProblem","SolveProblem","EditNote"];

class Sudoku{
constructor(){
	//Init tiles
	this.phase= 0;//["inputProblem,SolveProblem,editNote"]
	this.step = 0;//Inclements everytime it solves a tile
	this.showMethod = false;//If true, show the method
	this.board = new Array();
	this.board[0] = new Board();
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
draw(){
	const board = this.board[slider.value];
	board.draw(this.showMethod);
	return false;
}
userInput(xi,yi,newNum){
	switch(this.phase){
		case 0:	this.action("addOriginalNumber", xi,yi,newNum);break;
		case 1: this.action("addUserInputNumber",xi,yi,newNum);break;
		case 2: this.action("userModifiedNote"  ,xi,yi,newNum);break;
		default: break;
	}
}
action(type,x,y,num,par){
	const step = Number(slider.value);
	this.board[step+1] = new Board(this.board[step]);
	switch(type){
		case "addOriginalNumber" 		: this.board[step+1].addOriginalNumber 		(x,y,num);break;
		case "addUserInputNumber"		: this.board[step+1].addUserInputNumber		(x,y,num);break;
		case "userModifiedNote"  		: this.board[step+1].userModifiedNote  		(x,y,num);break;
		case "programProgressed" 		: this.board[step+1].programProgressed 		(x,y,num,par);break;
		case "programProgressedNote"	: this.board[step+1].programProgressedNote 	(x,y,num,par);break;
		case "addNotes"		 			: this.board[step+1].addNotes				(x); break;
		case "deleteNotes"		 		: this.board[step+1].deleteNotes			(x); break;
		default: break;
	}
	this.step		= step+1;
	slider.max 		= step+1;
	slider.value 	= step+1;
	draw();
}
startSolving(){
	//this.reloadSudoku();
	while(this.solve());
}
solve(){
	const board = this.board[Number(slider.value)];
	if(this.singlePosition (board)) return true;
	if(this.singleCandidate(board)) return true;
	if(this.addNotes       (board)) return true;
	if(this.noCandidate    (board)) return true;
	if(this.candidateLine  (board)) return true;
	if(this.deleteNotes    (board)) return true;
	if(this.nakedPair      (board)) return true;
	return false;
}
nakedPair(board){
	//Check of pairs or triples in each box
	for(let box=0;box<9;box++){
		//Aquire important parameters first
		let numOpen = 9;
		let candidates_temp = new Array(9).fill(1);
		let candidates = new Array(0);
		//Count Open Tiles and Check Candidates
		for(let i=0;i<9;i++){
			const [x,y]=this.biToXY([box,i]);
			if(board.tile[x][y]!=0){
				numOpen--;
				candidates_temp[Math.abs(board.tile[x][y])-1]=0;
			}
		}
		//Organize Candidates
		for(let i=0;i<9;i++) if(candidates_temp[i]) candidates.splice(candidates.length,0,i+1);
		for(let pair=2;pair<numOpen;pair++){
			let combi = new Array(pair);
			for(let i=0;i<pair;i++) combi[i]=pair-i-1;
			while(1){
				//Check for Condition
				let onlyCombiIndex = new Array();
				let mixedCombiIndex = new Array();
				for(let i=0;i<9;i++){
					const [x,y]=this.biToXY([box,i]);
					if(board.tile[x][y]!=0)continue;
					//Duplicates the notes from board 0:erased 1:possible
					let tempNotes = new Array();
					for(let j=0;j<9;j++){
						tempNotes[j]=(board.note[x][y][j]?1:0);
					}
					//Inverts the notes if its one of the candidates -1:candidate 0:erased 1: nonCand.
					for(let j=0;j<pair;j++){
						tempNotes[candidates[combi[j]]-1] *=-1;
					}
					let nonCombiFound = false;
					let combiFound = false;
					//Check if the tile only consists of candidates or there is a mixture
					for(let j=0;j<9;j++){
						if(tempNotes[j]== 1) nonCombiFound = true;
						if(tempNotes[j]==-1) combiFound = true;
					}
					if(combiFound){
						if(nonCombiFound){
							mixedCombiIndex[mixedCombiIndex.length]=this.XYToin([x,y]);
						}else{
							onlyCombiIndex[onlyCombiIndex.length]=this.XYToin([x,y]);
						}
					}
				}
				if(onlyCombiIndex.length>=pair&&mixedCombiIndex.length>0){
					//Get Array of X's and Y's
					let x = new Array();
					let y = new Array();
					for(let i=0;i<mixedCombiIndex.length;i++){
						[x[i],y[i]] = this.inToXY(mixedCombiIndex[i]);
					}
					//Get notes to erase
					let nums = new Array(pair);
					for(let i=0;i<pair;i++)nums[i]=candidates[combi[i]];
					//Get the message
					const msg = "Naked Pair/Triple Found in";
					const hiliNum = null;
					//Prepare Notes to hilight
					let hiliNote = new Array(0);
					for(let i=0;i<onlyCombiIndex.length;i++){
						const [x,y] = this.inToXY(onlyCombiIndex[i]);
						for(let j=0;j<pair;j++){
							const num = candidates[combi[j]];
							if(board.note[x][y][num-1]){
								hiliNote[hiliNote.length] = [x+1,y+1,num,"▢","red",1.4];
							}
						}
					}
					for(let i=0;i<mixedCombiIndex.length;i++){
						const [x,y] = this.inToXY(mixedCombiIndex[i]);
						console.log(x,y);
						for(let j=0;j<pair;j++){
							const num = candidates[combi[j]];
							if(board.note[x][y][num-1]){
								hiliNote[hiliNote.length] = [x+1,y+1,num,num,"darkGray"];
								hiliNote[hiliNote.length] = [x+1,y+1,num,"/","red",1.2];
							}
						}
					}
					const [xii,yii] = this.biToXY([box,0]);
					const [xil,yil] = this.biToXY([box,8]);
					const hiliBox = [[xii+1,yii+1,xil+1,yil+1,"lime"]];
					this.action("programProgressedNote",x,y,nums,[msg,hiliNum,hiliNote,hiliBox]);
					return true;
				}
				//update combi
				let resetDigitCounter = 0;
				for(let i=0;i<pair;i++){
					if(combi[i]==numOpen-1-i) resetDigitCounter++;
				}
				if(resetDigitCounter==pair) break;
				if(resetDigitCounter==0){
					combi[0]++;
				}else{
					for(let i=0;i<=resetDigitCounter;i++){
						combi[i]=combi[resetDigitCounter]+resetDigitCounter-i+1;
					}
				}
					
			}
		}
	}
	//Check of pairs or triples in each row
	for(let row=0;row<9;row++){
		//Aquire important parameters first
		let numOpen = 9;
		let candidates_temp = new Array(9).fill(1);
		let candidates = new Array(0);
		//Count Open Tiles and Check Candidates
		for(let i=0;i<9;i++){
			const [x,y]=[i,row];
			if(board.tile[x][y]!=0){
				numOpen--;
				candidates_temp[Math.abs(board.tile[x][y])-1]=0;
			}
		}
		//Organize Candidates
		for(let i=0;i<9;i++) if(candidates_temp[i]) candidates.splice(candidates.length,0,i+1);
		for(let pair=2;pair<numOpen;pair++){
			let combi = new Array(pair);
			for(let i=0;i<pair;i++) combi[i]=pair-i-1;
			while(1){
				//Check for Condition
				let onlyCombiIndex = new Array();
				let mixedCombiIndex = new Array();
				for(let i=0;i<9;i++){
					const [x,y]=[i,row];
					if(board.tile[x][y]!=0)continue;
					//Duplicates the notes from board 0:erased 1:possible
					let tempNotes = new Array();
					for(let j=0;j<9;j++){
						tempNotes[j]=(board.note[x][y][j]?1:0);
					}
					//Inverts the notes if its one of the candidates -1:candidate 0:erased 1: nonCand.
					for(let j=0;j<pair;j++){
						tempNotes[candidates[combi[j]]-1] *=-1;
					}
					let nonCombiFound = false;
					let combiFound = false;
					//Check if the tile only consists of candidates or there is a mixture
					for(let j=0;j<9;j++){
						if(tempNotes[j]== 1) nonCombiFound = true;
						if(tempNotes[j]==-1) combiFound = true;
					}
					if(combiFound){
						if(nonCombiFound){
							mixedCombiIndex[mixedCombiIndex.length]=this.XYToin([x,y]);
						}else{
							onlyCombiIndex[onlyCombiIndex.length]=this.XYToin([x,y]);
						}
					}
				}
				if(onlyCombiIndex.length>=pair&&mixedCombiIndex.length>0){
					//Get Array of X's and Y's
					let x = new Array();
					let y = new Array();
					for(let i=0;i<mixedCombiIndex.length;i++){
						[x[i],y[i]] = this.inToXY(mixedCombiIndex[i]);
					}
					//Get notes to erase
					let nums = new Array(pair);
					for(let i=0;i<pair;i++)nums[i]=candidates[combi[i]];
					//Get the message
					const msg = "Naked Pair/Triple Found in Row";
					const hiliNum = null;
					//Prepare Notes to hilight
					let hiliNote = new Array(0);
					for(let i=0;i<onlyCombiIndex.length;i++){
						const [x,y] = this.inToXY(onlyCombiIndex[i]);
						for(let j=0;j<pair;j++){
							const num = candidates[combi[j]];
							if(board.note[x][y][num-1]){
								hiliNote[hiliNote.length] = [x+1,y+1,num,"▢","red",1.4];
							}
						}
					}
					for(let i=0;i<mixedCombiIndex.length;i++){
						const [x,y] = this.inToXY(mixedCombiIndex[i]);
						console.log(x,y);
						for(let j=0;j<pair;j++){
							const num = candidates[combi[j]];
							if(board.note[x][y][num-1]){
								hiliNote[hiliNote.length] = [x+1,y+1,num,num,"darkGray"];
								hiliNote[hiliNote.length] = [x+1,y+1,num,"/","red",1.2];
							}
						}
					}
					const [xii,yii] = [0,row];
					const [xil,yil] = [8,row];
					const hiliBox = [[xii+1,yii+1,xil+1,yil+1,"lime"]];
					this.action("programProgressedNote",x,y,nums,[msg,hiliNum,hiliNote,hiliBox]);
					return true;
				}
				//update combi
				let resetDigitCounter = 0;
				for(let i=0;i<pair;i++){
					if(combi[i]==numOpen-1-i) resetDigitCounter++;
				}
				if(resetDigitCounter==pair) break;
				if(resetDigitCounter==0){
					combi[0]++;
				}else{
					for(let i=0;i<=resetDigitCounter;i++){
						combi[i]=combi[resetDigitCounter]+resetDigitCounter-i+1;
					}
				}
					
			}
		}
	}
	//Check of pairs or triples in each col
	for(let col=0;col<9;col++){
		//Aquire important parameters first
		let numOpen = 9;
		let candidates_temp = new Array(9).fill(1);
		let candidates = new Array(0);
		//Count Open Tiles and Check Candidates
		for(let i=0;i<9;i++){
			const [x,y]=[col,i];
			if(board.tile[x][y]!=0){
				numOpen--;
				candidates_temp[Math.abs(board.tile[x][y])-1]=0;
			}
		}
		//Organize Candidates
		for(let i=0;i<9;i++) if(candidates_temp[i]) candidates.splice(candidates.length,0,i+1);
		for(let pair=2;pair<numOpen;pair++){
			let combi = new Array(pair);
			for(let i=0;i<pair;i++) combi[i]=pair-i-1;
			while(1){
				//Check for Condition
				let onlyCombiIndex = new Array();
				let mixedCombiIndex = new Array();
				for(let i=0;i<9;i++){
					const [x,y]=[i,col];
					if(board.tile[x][y]!=0)continue;
					//Duplicates the notes from board 0:erased 1:possible
					let tempNotes = new Array();
					for(let j=0;j<9;j++){
						tempNotes[j]=(board.note[x][y][j]?1:0);
					}
					//Inverts the notes if its one of the candidates -1:candidate 0:erased 1: nonCand.
					for(let j=0;j<pair;j++){
						tempNotes[candidates[combi[j]]-1] *=-1;
					}
					let nonCombiFound = false;
					let combiFound = false;
					//Check if the tile only consists of candidates or there is a mixture
					for(let j=0;j<9;j++){
						if(tempNotes[j]== 1) nonCombiFound = true;
						if(tempNotes[j]==-1) combiFound = true;
					}
					if(combiFound){
						if(nonCombiFound){
							mixedCombiIndex[mixedCombiIndex.length]=this.XYToin([x,y]);
						}else{
							onlyCombiIndex[onlyCombiIndex.length]=this.XYToin([x,y]);
						}
					}
				}
				if(onlyCombiIndex.length>=pair&&mixedCombiIndex.length>0){
					//Get Array of X's and Y's
					let x = new Array();
					let y = new Array();
					for(let i=0;i<mixedCombiIndex.length;i++){
						[x[i],y[i]] = this.inToXY(mixedCombiIndex[i]);
					}
					//Get notes to erase
					let nums = new Array(pair);
					for(let i=0;i<pair;i++)nums[i]=candidates[combi[i]];
					//Get the message
					const msg = "Naked Pair/Triple Found in Col";
					const hiliNum = null;
					//Prepare Notes to hilight
					let hiliNote = new Array(0);
					for(let i=0;i<onlyCombiIndex.length;i++){
						const [x,y] = this.inToXY(onlyCombiIndex[i]);
						for(let j=0;j<pair;j++){
							const num = candidates[combi[j]];
							if(board.note[x][y][num-1]){
								hiliNote[hiliNote.length] = [x+1,y+1,num,"▢","red",1.4];
							}
						}
					}
					for(let i=0;i<mixedCombiIndex.length;i++){
						const [x,y] = this.inToXY(mixedCombiIndex[i]);
						console.log(x,y);
						for(let j=0;j<pair;j++){
							const num = candidates[combi[j]];
							if(board.note[x][y][num-1]){
								hiliNote[hiliNote.length] = [x+1,y+1,num,num,"darkGray"];
								hiliNote[hiliNote.length] = [x+1,y+1,num,"/","red",1.2];
							}
						}
					}
					const [xii,yii] = [col,0];
					const [xil,yil] = [col,8];
					const hiliBox = [[xii+1,yii+1,xil+1,yil+1,"lime"]];
					this.action("programProgressedNote",x,y,nums,[msg,hiliNum,hiliNote,hiliBox]);
					return true;
				}
				//update combi
				let resetDigitCounter = 0;
				for(let i=0;i<pair;i++){
					if(combi[i]==numOpen-1-i) resetDigitCounter++;
				}
				if(resetDigitCounter==pair) break;
				if(resetDigitCounter==0){
					combi[0]++;
				}else{
					for(let i=0;i<=resetDigitCounter;i++){
						combi[i]=combi[resetDigitCounter]+resetDigitCounter-i+1;
					}
				}
					
			}
		}
	}
	return false;
}
noCandidate(board){
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			if(board.tile[x][y]!=0) continue;
			let candidateCounter = 0;
			let number = -1;
			for(let i=0;i<9;i++){
				if(board.note[x][y][i]){
					candidateCounter++;
					number = i+1;
				}
			}
			if(candidateCounter==1){
				this.action("programProgressed",x,y,number,["No Other Candidate",x+y*9]);
				return true;
			}
		}
	}
	return false;
}
deleteNotes(board){
	let newNote = new Array(9);
	for(let x=0;x<9;x++){
		newNote[x] = new Array(9);
		for(let y=0;y<9;y++){
			newNote[x][y] = new Array(9).fill(true);
		}
	}
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			const num = Math.abs(board.tile[x][y]);
			if(num!=0){
				for(let i=0;i<9;i++){
					//By column
					newNote[i][y][num-1]=false;
					//By row
					newNote[x][i][num-1]=false;
					//By box
					const box = indexToBox([x,y]);//0~9
					const [xtemp,ytemp] = this.biToXY([box,i]);
					newNote[xtemp][ytemp][num-1]=false;
				}
			}
		}
	}
	this.action("deleteNotes",newNote);
	return false;
}
candidateLine(board){
	for(let box=0;box<9;box++){
		for(let num=1;num<=9;num++){
			let xCandidateLine = -1;
			let yCandidateLine = -1;
			let hiliNote = new Array;
			let hiliNoteCounter = 0;
			for(let i=0;i<9;i++){
				const [x,y] = this.biToXY([box,i]);
				if(board.tile[x][y]==num){
					xCandidateLine = -2;
					yCandidateLine = -2;
					break;
				}
				if(board.tile[x][y]!=0) continue;
				if(!board.note[x][y][num-1]) continue;
				hiliNote[hiliNoteCounter] = [x+1,y+1,num,"▢","red",1.4];
				hiliNoteCounter++;
				if(xCandidateLine==-1){//This is the first one found
					xCandidateLine=x;
				}else{
					if(xCandidateLine!=x)xCandidateLine=-2;
				}
				if(yCandidateLine==-1){//This is the first one found
					yCandidateLine=y;
				}else{
					if(yCandidateLine!=y)yCandidateLine=-2;
				}
			}
			if(xCandidateLine>-1){
				for(let i=0;i<9;i++){
					if(indexToBox([xCandidateLine,i])==box) continue;
					if(board.tile[xCandidateLine][i]!=0) continue;
					if(board.note[xCandidateLine][i][num-1]){
						const msg = "Candidate Line";
						const hiliNum = null;
						hiliNote[hiliNoteCounter] = [xCandidateLine+1,i+1,num,num,"darkGray"];
						hiliNote[hiliNoteCounter+1] = [xCandidateLine+1,i+1,num,"/","red",1.2];
						const hiliBox = [[xCandidateLine+1,1,xCandidateLine+1,9,"lime"]];
						this.action("programProgressedNote",[xCandidateLine],[i],[num],[msg,hiliNum,hiliNote,hiliBox]);
						return true;
					}
				}
			}
			if(yCandidateLine>-1){
				for(let i=0;i<9;i++){
					if(indexToBox([i,yCandidateLine])==box) continue;
					if(board.tile[i][yCandidateLine]!=0) continue;
					if(board.note[i][yCandidateLine][num-1]){
						const msg = "Candidate Line";
						const hiliNum = null;
						hiliNote[hiliNoteCounter]= [i+1,yCandidateLine+1,num,num,"darkGray"];
						hiliNote[hiliNoteCounter+1]= [i+1,yCandidateLine+1,num,"/","red",1.2];
						const hiliBox = [[1,yCandidateLine+1,9,yCandidateLine+1,"lime"]];
						this.action("programProgressedNote",[i],[yCandidateLine],[num],[msg,hiliNum,hiliNote,hiliBox]);
						return true;
					}
				}
			}		
		}
	}
	return false;
}
addNotes(board){
	let newNote = new Array(9);
	for(let x=0;x<9;x++){
		newNote[x] = new Array(9);
		for(let y=0;y<9;y++){
			newNote[x][y] = new Array(9).fill(true);
			for(let num=0;num<9;num++){
				if(board.note[x][y][num]) return false;
			}
		}
	}
	let filledTileCounter = 0;
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			const num = Math.abs(board.tile[x][y]);
			if(num!=0){
				filledTileCounter++;
				for(let i=0;i<9;i++){
					//By column
					newNote[i][y][num-1]=false;
					//By row
					newNote[x][i][num-1]=false;
					//By box
					const box = indexToBox([x,y]);//0~9
					const [xtemp,ytemp] = this.biToXY([box,i]);
					newNote[xtemp][ytemp][num-1]=false;
				}
			}
		}
	}
	if(filledTileCounter==81) return false;
	this.action("addNotes",newNote);
	return true;
}
singleCandidate(board){
	let candidate = new Array(81);
	for(let i=0;i<81;i++) candidate[i]=[0,1,2,3,4,5,6,7,8,9];
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			if(board.tile[x][y]==0) continue;
			//If there is a number, then it cannnot be a candidate
			candidate[x+y*9] = [0,0,0,0,0,0,0,0,0,0];

			//If the number on tile matches, then clear candidates by row,colum and box
			if(board.tile[x][y]!=0){
				for(let i=0;i<9;i++){
					//By column
					candidate[i+9*y][Math.abs(board.tile[x][y])]=0;
					//By row
					candidate[x+9*i][Math.abs(board.tile[x][y])]=0;
					//By box
					let box = indexToBox([x,y]);//0~9
					box = (box%3)*3+Math.floor(box/3)*3*9;//upper left of 0~81
					candidate[box+i%3+Math.floor(i/3)*9][Math.abs(board.tile[x][y])]=0;
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
				const msg = "Single Candidate";
				const hiliNum = [[x+1,y+1,n,"lime"]];
				const hiliNote= null;
				const hiliBox = [[x+1,y+1,x+1,y+1,"lime"]];
				this.action("programProgressed",x,y,n,[msg,hiliNum,hiliNote,hiliBox]);
				return true;
			}
			candidate[x+y*9][0]=count;
		}
	}
	//console.log(candidate);
	return false;
}
singlePosition(board){
	for(let n=1;n<=9;n++){//Check based on Number first
		let candidate = new Array(81).fill(1);
		let hiliNum = new Array;
		let hiliBox = null;
		let hiliNote = null;
		let hiliNumCounter = 0;
		for(let x=0;x<9;x++){
			for(let y=0;y<9;y++){
				if(board.tile[x][y]==0) continue;
				//If there is a number, then it cannnot be a candidate
				candidate[x+y*9] = 0;

				//If the number on tile matches, then clear candidates by row,colum and box
				if(board.tile[x][y]==n||board.tile[x][y]==-n){
					hiliNum[hiliNumCounter]=[x+1,y+1,Math.abs(n),"red"];
					hiliNumCounter++;
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
				const msg = "Single Position Box";
				const xii = 1+box%3*3;
				const xil = 3+box%3*3;
				const yii = 1+Math.floor(box/3)*3;
				const yil = 3+Math.floor(box/3)*3;
				const hiliBox = [[xii,yii,xil,yil,"lime"]];
				hiliNum[hiliNumCounter]=[index%9+1,Math.floor(index/9)+1,n,"lime"];
				this.action("programProgressed",index%9,Math.floor(index/9),n,[msg,hiliNum,hiliNote,hiliBox]);
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
				const msg = "Single Position Row";
				const xii = 1;
				const xil = 9;
				const yii = row+1;
				const yil = row+1;
				const hiliBox = [[xii,yii,xil,yil,"lime"]];
				hiliNum[hiliNumCounter]=[index%9+1,Math.floor(index/9)+1,n,"lime"];
				this.action("programProgressed",index%9,Math.floor(index/9),n,[msg,hiliNum,hiliNote,hiliBox]);
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
				const msg = "Single Position Col";
				const xii = col+1;
				const xil = col+1;
				const yii = 1;
				const yil = 9;
				const hiliBox = [[xii,yii,xil,yil,"lime"]];
				hiliNum[hiliNumCounter]=[index%9+1,Math.floor(index/9)+1,n,"lime"];
				this.action("programProgressed",index%9,Math.floor(index/9),n,[msg,hiliNum,hiliNote,hiliBox]);
				return true;
			}
		}
	}
	return false;
}
biToXY([box,i]){
	const index = (box%3)*3+Math.floor(box/3)*3*9+i%3+Math.floor(i/3)*9;//upper left of 0~81
	return [index%9,Math.floor(index/9)];
}
inToXY(index){
	return [index%9,Math.floor(index/9)];
}
XYToin([x,y]){
	return x+y*9;
}
}