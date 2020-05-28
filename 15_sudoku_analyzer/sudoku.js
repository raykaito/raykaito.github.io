class Sudoku{
constructor(){
	//Init tiles
	this.step = 0;//Inclements everytime it solves a tile
	this.showMethod = false;//If true, show the method
	this.solvable = false;
	this.board = new Array();
	this.board[0] = new Board();
	this.userInputMode = "Numbers";
	this.selectedNumber= 0;
	this.initiallySelectedNumber;
	this.selectedNotes = new Array(9).fill(false);
	this.noSelectedNotes = true;
	//brute force parameters
	this.bruteForceParameter = new Array();//[step at guess, candidateNum]
	this.dragMode = "";//[AutoNoteInput,ModeChange,SelectionChange,SelectionChangeNumber]
	this.autoNoteChangedIndex = new Array(81).fill(false);
	this.selectionChangedIndex = new Array( 9).fill(false);
	this.lastActionType = "Init";
}
autoNoteChange(xi,yi){
	if(!this.autoNoteChangedIndex[this.XYToin([xi-1,yi-1])]){
		this.autoNoteChangedIndex[this.XYToin([xi-1,yi-1])]=true;
		for(let i=0;i<9;i++){
			if(this.selectedNotes[i]){
				this.userInput(xi-1,yi-1,i+1,true);
			}
		}
	}
}
selectionChange(xi,yi){
	if(!this.selectionChangedIndex[xi-1]){
		this.selectionChangedIndex[xi-1]=true;
		this.selectedNotes[xi-1]=!this.selectedNotes[xi-1];
		this.noSelectedNotes=true;
		for(let i=0;i<9;i++){
			if(this.selectedNotes[i]){
				this.noSelectedNotes=false;
				break;
			}
		}
	}
}
touchWhileSolving(x,y,event){
	const [xi,yi]=XYtoIndex([x,y]);
	if(xi>=1&&xi<=9&&yi>=1&&yi<=9){
		if(this.userInputMode=="Numbers"){
			if(this.selectedNumber==0){
				event.preventDefault();
				if(this.board[slider.value].tile[xi-1][yi-1]>=0)drawGrids("Number");
			}else{
				this.userInput(xi-1,yi-1,this.selectedNumber,false);
			}
		}else if(this.userInputMode=="Notes"){
			if(this.noSelectedNotes){
				event.preventDefault();
				if(this.board[slider.value].tile[xi-1][yi-1]==0)drawGrids("Number");
			}else{
				this.dragMode="AutoNoteInput";
				this.autoNoteChangedIndex = new Array(81).fill(false);
				this.autoNoteChange(xi,yi);
				event.preventDefault();
			}
		}
	}else if(yi==10&&xi>=1&&xi<=4){
		this.dragMode = "ModeChange";
		event.preventDefault();

	}else if(yi==11){
		if(this.userInputMode=="Numbers"){
			this.dragMode = "SelectionChangeNumber";
			this.initiallySelectedNumber = this.selectedNumber;
			event.preventDefault();
		}else if(this.userInputMode=="Notes"){
			this.dragMode = "SelectionChange";
			this.selectionChangedIndex = new Array(9).fill(false);
			this.selectionChange(xi,yi);
			event.preventDefault();
		}
	}
}
moveWhileSolving(x,y){
	const [xi,yi]=XYtoIndex([x,y]);
	if(this.dragMode=="AutoNoteInput"&&xi>=1&&xi<=9&&yi>=1&&yi<=9){
		if(this.userInputMode=="Notes"&&!this.noSelectedNotes){
			this.autoNoteChange(xi,yi);
		}
		draw();
	}else if(this.dragMode=="ModeChange"){
		draw();
	}else if(this.dragMode=="SelectionChange"){
		this.selectionChange(xi,yi);
		draw();
	}else if(this.dragMode=="SelectionChangeNumber"){
		this.selectedNumber=xi;
		draw();
	}
}
releaseWhileSolving(x,y){
	const [xil,yil]=XYtoIndex([x,y]);
	const [xii,yii]=XYtoIndex([touchX,touchY]);
	if(this.dragMode==""){
		let newNum = 3*(Math.floor((9-yil)/3))+Math.floor((xil-1)/3)+1;
		if(xil<1||xil>9||yil<1||yil>9) newNum = 0;
		if(this.userInputMode=="Numbers"&&this.selectedNumber==0){
			if(xii>=1&&xii<=9&&yii>=1&&yii<=9)sudoku.userInput(xii-1,yii-1,newNum,false);
		}else if(this.userInputMode=="Notes"&&this.noSelectedNotes){
			if(xii>=1&&xii<=9&&yii>=1&&yii<=9)sudoku.userInput(xii-1,yii-1,newNum,true);
		}
		if(yii==10&&yil==10){
			if(xii==8&&xil==8){			if(confirm("Do you want to start Analysis?")) this.startAnalysis();
			}else if(xii==7&&xil==7){	slider.value --;
			}else if(xii==9&&xil==9){	slider.value ++;
			}
			draw();
		}
	}else if(this.dragMode=="AutoNoteInput"){
		this.dragMode="";
	}else if(this.dragMode=="ModeChange"){
		this.dragMode="";
		if(xil>2) 	this.userInputMode = "Notes";
		else		this.userInputMode = "Numbers";
	}else if(this.dragMode=="SelectionChange"){
		this.dragMode="";
	}else if(this.dragMode=="SelectionChangeNumber"){
		this.dragMode="";
		if(xii==xil){
			if(this.initiallySelectedNumber==xil) this.selectedNumber=0;
			else this.selectedNumber=xil;
		}
	}
}
draw(){
	if(phase.phase=="Checking Solvability"){
		this.solver.draw();
	}else if(phase.phase=="Analyzed"){
		const board = this.board[slider.value];
		board.draw(this.showMethod);
		//Draw graph
		const xRange = 7*side;
		const yRange = 2*side;
		const xStart = side*1.5+offset;
		const yStart = side*13;
		ct.strokeStyle = "black";
		ct.lineWidth = 1;
	    ct.beginPath();
	    ct.moveTo(xStart,yStart);
		for(let i=1;i<slider.max;i++){
			const x = Math.floor(xRange*i/slider.max);
			const y = Math.floor(yRange*this.board[i].level/4);
	    	ct.lineTo(xStart+x,yStart-y);
		}
	    ct.stroke();
	    //Draw Current Posistion
	    const currentStep = slider.value;
	    const xCurrent = xStart+Math.floor(xRange*currentStep/slider.max);
	    const yCurrent = yStart-Math.floor(yRange*this.board[currentStep].level/4);
	    drawLine(xCurrent,yCurrent,xCurrent,yStart,0);
	}else if(phase.phase=="User Solving"){
		const board = this.board[slider.value];
		board.draw(this.showMethod,(this.userInputMode=="Numbers"?this.selectedNumber:null),(this.userInputMode=="Notes"?this.selectedNotes:null));
		drawUserInputInterface(this.userInputMode,this.selectedNumber, this.selectedNotes);
	}else{
		const board = this.board[slider.value];
		board.draw(this.showMethod);		
	}
	return false;
}
checkSolvability(changePhaseAutomatically = true){
	let array = new Array(81);
	const board = this.board[Number(slider.value)];
	for(let i=0;i<81;i++){
		const [x,y] = this.inToXY(i);
		array[i] = Math.abs(board.tile[x][y]);
	}
	const solver = new Solver(array);
	const solvable = solver.checkSolvability();
	if(changePhaseAutomatically){
		if(solvable) phase.changePhase("User Solving");
		else 		 phase.changePhase("Unsolvable");
	}else{
		return solvable;
	}
}
reset(step){
	this.step = step;
	slider.value = step;
	this.board[step].initializeTileAndNote();
}
showHideMethod(showMethod = !this.showMethod){
	this.showMethod = showMethod;
	draw();
}
scannerInput(xi,yi,newNum){
	this.action("addOriginalNumber", xi,yi,newNum);
}
userInput(xi,yi,newNum,note=false){
	if(phase.phase=="Input Sudoku Manually"){
		this.action("addOriginalNumber", xi,yi,newNum);
	}else if(phase.phase=="User Solving"||phase.phase=="Analyzed"){
		if(note){
			if(this.board[slider.value].tile[xi][yi]==0){
				this.action("userModifiedNote"  ,xi,yi,newNum);
			}
		}else{
			this.action("addUserInputNumber",xi,yi,newNum);
		}
		
	}
}
action(type,x,y,num,par){
	const step = Number(slider.value);
	if(type=="addOriginalNumber"){
		this.board[step].addOriginalNumber(x,y,num);		
	}else if(type=="userModifiedNote"&&this.lastActionType=="userModifiedNote"){
		this.board[step].userModifiedNote(x,y,num);
	}else{
		this.board[step+1] = new Board(this.board[step]);
		switch(type){
			case "addUserInputNumber"		: this.board[step+1].addUserInputNumber		(x,y,num);break;
			case "userModifiedNote"  		: this.board[step+1].userModifiedNote  		(x,y,num);break;
			case "programProgressed" 		: this.board[step+1].programProgressed 		(x,y,num,par);break;
			case "programProgressedNote"	: this.board[step+1].programProgressedNote 	(x,y,num,par);break;
			case "addNotes"		 			: this.board[step+1].addNotes				(x); break;
			case "deleteNotes"		 		: this.board[step+1].deleteNotes			(x); break;
			case "solved"		 			: this.board[step+1].solved					(x); break;
			default: break;
		}
		this.step		= step+1;
		slider.max 		= step+1;
		slider.value 	= step+1;
	}
	this.lastActionType=type;
	draw();
}
startAnalysis(){
	phase.changePhase("Analyzing Sudoku");
	this.solvable = false;
	this.bruteForceParameter = new Array();
	while(this.solve());
	if(this.solvable){
		phase.changePhase("Analyzed");
	}else{
		phase.changePhase("Unsolvable");
	}
}
solve(){
	const board = this.board[Number(slider.value)];
	if(this.singlePosition (board,0.25)) return true;//1-1:0.25※RowCol:0.5
	if(this.singleCandidate(board,0.5 )) return true;//1-2:0.50
	if(this.addNotes       (board,1   )) return true;//1-4:1.00
	if(this.singleNote     (board,0.75)) return true;//1-3:0.75
	if(this.candidateLine  (board,1.25)) return true;//2-1:1.25
	if(this.candidateBox   (board,1.5 )) return true;//2-2:1.50
	if(this.deleteNotes    (board,1   )) return true;//1-4:1.00
	if(this.nakedPair      (board,2.25)) return true;//3-1:2.25
	if(this.bruteForce     (board,3.25)) return true;//4-1:3.25
	if(this.checkStatus    (board,0   )) return true;//1-
	return false;
}
bruteForce(board,level){
	//Select Tile with least candidate
	let minNumCandidate = 9;
	let minNumCandidateXY =[-1,-1];
	for(let x=0;x<9;x++){
		for(let y=0;y<9;y++){
			//Skip if Tile has a Number
			if(board.tile[x][y]!=0) continue;
			//Check num of candidate
			let numCandidate = 0;
			for(let i=0;i<9;i++){
				if(board.note[x][y][i]){numCandidate++;}
			}
			if(numCandidate<minNumCandidate){
				minNumCandidate = numCandidate;
				minNumCandidateXY = [x,y];
			}
		}
	}
	if(minNumCandidateXY[0]==-1) return false;
	//If ZERO, the sudoku failed...
	if(minNumCandidate==0){
		//if parameter length==0, then it failed.return false
		if(this.bruteForceParameter.length==0) return false;
		//Inclement CandidateNum and restore previous.
		this.bruteForceParameter[this.bruteForceParameter.length-1][1]++;
		slider.value = this.bruteForceParameter[this.bruteForceParameter.length-1][0]-1;
	}
	else if(this.bruteForceParameter.length==0){
		this.bruteForceParameter[this.bruteForceParameter.length] = [slider.value,0];
		this.BruteForce_TakeAGuess(minNumCandidateXY[0],minNumCandidateXY[1],0,board,level);
	}
	else{//Check if you were here before or not
		const step = this.bruteForceParameter[this.bruteForceParameter.length-1][0];
		if(step==Number(slider.value)){
			//check the candidate Num
			const candidateNum = this.bruteForceParameter[this.bruteForceParameter.length-1][1];
			//If candidate Num > num of candidate, pop last brute Force, inclement previous, and restore
			if(candidateNum>=minNumCandidate){
				//Remove Last Element from this.bruteForceParameter
				this.bruteForceParameter.splice(this.bruteForceParameter.length-1,1);
				if(this.bruteForceParameter.length==0) return false;
				this.bruteForceParameter[this.bruteForceParameter.length-1][1]++;
				slider.value = this.bruteForceParameter[this.bruteForceParameter.length-1][0]-1;
			}
			else{
				this.bruteForceParameter[this.bruteForceParameter.length-1][1]++;
				this.BruteForce_TakeAGuess(minNumCandidateXY[0],minNumCandidateXY[1],candidateNum,board,level);
			}
		}
		else{
			this.bruteForceParameter[this.bruteForceParameter.length] = [slider.value,0];
			this.BruteForce_TakeAGuess(minNumCandidateXY[0],minNumCandidateXY[1],0,board,level);
		}
	}
	return true;
}
BruteForce_TakeAGuess(x,y,candidateNum,board,level){
	//select candidate based on the candidate Num;
	let candidateCount = 0;
	let candidate = -1;
	let hiliNote = new Array();
	for(let i=0;i<9;i++){
		if(board.note[x][y][i]){
			hiliNote[hiliNote.length] = [x+1,y+1,i+1,i+1,"darkGray"];
			if(candidateCount==candidateNum){
				candidate = i+1;
			}
			candidateCount++;
		}
	}
	hiliNote[hiliNote.length] = [x+1,y+1,candidate,"▢","blue",1.1];
	const msg = "Took a Guess";
	const hiliNum = [[x+1,y+1,"","lime"]];
	const hiliBox = null;//[[x+1,y+1,x+1,y+1,"blue"]];
	this.action("programProgressed",x,y,candidate,[msg,hiliNum,hiliNote,hiliBox,level]);
	return false;
}
checkStatus(board,level){
	let solved = true;
	//Check each box
	for(let box=0;box<9;box++){
		let numberFound = new Array(9).fill(false);
		for(let i=0;i<9;i++){
			const [x,y] = this.biToXY([box,i]);
			const tileNum = Math.abs(board.tile[x][y]);
			numberFound[tileNum-1]=true;
		}
		for(let i=0;i<9;i++){
			if(numberFound[i]==false) solved = false;
		}
	}
	//Check each row
	for(let y=0;y<9;y++){
		let numberFound = new Array(9).fill(false);
		for(let x=0;x<9;x++){
			const tileNum = Math.abs(board.tile[x][y]);
			numberFound[tileNum-1]=true;
		}
		for(let i=0;i<9;i++){
			if(numberFound[i]==false) solved = false;
		}
	}
	//Check each col
	for(let x=0;x<9;x++){
		let numberFound = new Array(9).fill(false);
		for(let y=0;y<9;y++){
			const tileNum = Math.abs(board.tile[x][y]);
			numberFound[tileNum-1]=true;
		}
		for(let i=0;i<9;i++){
			if(numberFound[i]==false) solved = false;
		}
	}
	//Make action based on the result
	this.showHideMethod(true);
	this.action("solved",solved);
	this.solvable = solved;
}
nakedPair(board,level){
	for(let BoxRowCol=0;BoxRowCol<3;BoxRowCol++){
		for(let parOne=0;parOne<9;parOne++){
			//Aquire important parameters first
			let numOpen = 9;
			let candidates_temp = new Array(9).fill(1);
			let candidates = new Array(0);
			//Count Open Tiles and Check Candidates
			for(let parTwo=0;parTwo<9;parTwo++){
				let x,y;
				if(     BoxRowCol==0){[x,y]=this.biToXY([parOne,parTwo]);}
				else if(BoxRowCol==1){[x,y]=[parTwo,parOne];}
				else if(BoxRowCol==2){[x,y]=[parOne,parTwo];}
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
					for(let parTwo=0;parTwo<9;parTwo++){
						let x,y;
						if(     BoxRowCol==0){[x,y]=this.biToXY([parOne,parTwo]);}
						else if(BoxRowCol==1){[x,y]=[parTwo,parOne];}
						else if(BoxRowCol==2){[x,y]=[parOne,parTwo];}
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
						//Hidden type or Naked type?
						const NakedNumber = pair;
						const HiddenNumber= numOpen-pair;
						const howMany = ["Singe","Pair","Triple","Quads"];
						//Get the message
						let msg;
						if(NakedNumber<=HiddenNumber){
							msg = "Naked "+howMany[NakedNumber-1]+" Found in a ";
						}else{
							msg = "Hidden "+howMany[HiddenNumber-1]+" Found in a ";
						}
						const PairTripleQuad = Math.min(pair,numOpen-pair);
						if(     BoxRowCol==0){msg += "Box";}
						else if(BoxRowCol==1){msg += "Row";}
						else if(BoxRowCol==2){msg += "Col";}
						const hiliNum = null;
						//Prepare Notes to hilight
						let hiliNote = new Array(0);
						if(NakedNumber<=HiddenNumber){						
							for(let i=0;i<onlyCombiIndex.length;i++){
								const [x,y] = this.inToXY(onlyCombiIndex[i]);
								for(let j=0;j<pair;j++){
									const num = candidates[combi[j]];
									if(board.note[x][y][num-1]){
										hiliNote[hiliNote.length] = [x+1,y+1,num,"▢","red",1.1];
									}
								}
							}
						}else{
							for(let i=0;i<mixedCombiIndex.length;i++){
								const [x,y] = this.inToXY(mixedCombiIndex[i]);
								for(let num=1;num<=9;num++){
									let oneOfEliminated = false;
									for(let combiIndex=0;combiIndex<pair;combiIndex++){
										if(num==candidates[combi[combiIndex]]){
											oneOfEliminated=true;
											break;
										}
									}
									if(!oneOfEliminated&&board.note[x][y][num-1]){
										hiliNote[hiliNote.length] = [x+1,y+1,num,"▢","red",1.1];
									}
								}
							}							
						}
						for(let i=0;i<mixedCombiIndex.length;i++){
							const [x,y] = this.inToXY(mixedCombiIndex[i]);
							for(let j=0;j<pair;j++){
								const num = candidates[combi[j]];
								if(board.note[x][y][num-1]){
									hiliNote[hiliNote.length] = [x+1,y+1,num,num,"darkGray"];
									hiliNote[hiliNote.length] = [x+1,y+1,num,"/","red",1.3];
								}
							}
						}
						let xii,yii,xil,yil;
						if(     BoxRowCol==0){
							[xii,yii] = this.biToXY([parOne,0]);
							[xil,yil] = this.biToXY([parOne,8]);
						}
						else if(BoxRowCol==1){
							[xii,yii] = [0,parOne];
							[xil,yil] = [8,parOne];
						}
						else if(BoxRowCol==2){
							[xii,yii] = [parOne,0];
							[xil,yil] = [parOne,8];
						}
						const hiliBox = [[xii+1,yii+1,xil+1,yil+1,"lime"]];
						this.action("programProgressedNote",x,y,nums,[msg,hiliNum,hiliNote,hiliBox,level]);
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
	}
}
deleteNotes(board,level){
	let changed = false;
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
					if(board.note[xtemp][ytemp][num-1]) changed=true;
				}
			}
		}
	}
	this.action("deleteNotes",newNote);
	return changed;
}
candidateBox(board,level){
	//Check for row
	for(let row=0;row<9;row++){
		//-3:TileFound -2:Found in Multi Boxes -1:Initial >=0:Box Number
		let liveNotes = new Array(9).fill(-1);
		for(let i=0;i<9;i++){
			const [x,y] = [i,row];
			if(board.tile[x][y]!=0){
				liveNotes[Math.abs(board.tile[x][y]-1)]=-3;
			}else{
				for(let note=0;note<9;note++){
					if(board.note[x][y][note]){
						if(liveNotes[note]==-1){
							//First Box Found
							liveNotes[note] = this.XYToBi([x,y])[0];
						}else if(liveNotes[note]>=0){
							if(liveNotes[note]!=this.XYToBi([x,y])[0]){
								//Second Box Did not Match the first
								liveNotes[note] = -2;
							}
						}
					}
				}
			}
		}
		for(let note=0;note<9;note++){
			if(liveNotes[note]<=0) continue;
			let xs = new Array(0);
			let ys = new Array(0);
			const box = liveNotes[note];
			for(let i=0;i<9;i++){
				const [x,y] = this.biToXY([box,i]);
				if(y==row) continue;
				if(board.tile[x][y]!=0) continue;
				if(board.note[x][y][note]){
					xs[xs.length] = x;
					ys[ys.length] = y;
				}
			}
			if(xs.length>0){
				const num = note+1;
				//Get the message
				const msg = "Candidate Box";
				const hiliNum = null;
				//Prepare Notes to hilight
				let hiliNote = new Array(0);
				//Notes to hilight
				for(let i=0;i<9;i++){
					const [x,y] = [i,row];
					if(board.tile[x][y]!=0) continue;
					if(board.note[x][y][note]){
						hiliNote[hiliNote.length] = [x+1,y+1,num,"▢","red",1.1];
					}
				}
				//Notes to eleminate
				for(let i=0;i<9;i++){
					const [x,y] = this.biToXY([box,i]);
					if(board.tile[x][y]!=0) continue;
					if(y==row)continue;
					if(board.note[x][y][note]){
						hiliNote[hiliNote.length] = [x+1,y+1,num,num,"darkGray"];
						hiliNote[hiliNote.length] = [x+1,y+1,num,"/","red",1.3];
					}
				}
				const [xii,yii] = [0,row];
				const [xil,yil] = [8,row];
				const hiliBox = [[xii+1,yii+1,xil+1,yil+1,"lime"]];
				this.action("programProgressedNote",xs,ys,[num],[msg,hiliNum,hiliNote,hiliBox,level]);
				return true;
			}
		}
	}
	//return false;
	//Check for col
	for(let col=0;col<9;col++){
		//-3:TileFound -2:Found in Multi Boxes -1:Initial >=0:Box Number
		let liveNotes = new Array(9).fill(-1);
		for(let i=0;i<9;i++){
			const [x,y] = [col,i];
			if(board.tile[x][y]!=0){
				liveNotes[Math.abs(board.tile[x][y]-1)]=-3;
			}else{
				for(let note=0;note<9;note++){
					if(board.note[x][y][note]){
						if(liveNotes[note]==-1){
							//First Box Found
							liveNotes[note] = this.XYToBi([x,y])[0];
						}else if(liveNotes[note]>=0){
							if(liveNotes[note]!=this.XYToBi([x,y])[0]){
								//Second Box Did not Match the first
								liveNotes[note] = -2;
							}
						}
					}
				}
			}
		}
		for(let note=0;note<9;note++){
			if(liveNotes[note]<=0) continue;
			let xs = new Array(0);
			let ys = new Array(0);
			const box = liveNotes[note];
			for(let i=0;i<9;i++){
				const [x,y] = this.biToXY([box,i]);
				if(x==col) continue;
				if(board.tile[x][y]!=0) continue;
				if(board.note[x][y][note]){
					xs[xs.length] = x;
					ys[ys.length] = y;
				}
			}
			if(xs.length>0){
				const num = note+1;
				//Get the message
				const msg = "Candidate Box";
				const hiliNum = null;
				//Prepare Notes to hilight
				let hiliNote = new Array(0);
				//Notes to hilight
				for(let i=0;i<9;i++){
					const [x,y] = [col,i];
					if(board.tile[x][y]!=0) continue;
					if(board.note[x][y][note]){
						hiliNote[hiliNote.length] = [x+1,y+1,num,"▢","red",1.1];
					}
				}
				//Notes to eleminate
				for(let i=0;i<9;i++){
					const [x,y] = this.biToXY([box,i]);
					if(board.tile[x][y]!=0) continue;
					if(x==col)continue;
					if(board.note[x][y][note]){
						hiliNote[hiliNote.length] = [x+1,y+1,num,num,"darkGray"];
						hiliNote[hiliNote.length] = [x+1,y+1,num,"/","red",1.3];
					}
				}
				const [xii,yii] = [col,0];
				const [xil,yil] = [col,8];
				const hiliBox = [[xii+1,yii+1,xil+1,yil+1,"lime"]];
				this.action("programProgressedNote",xs,ys,[num],[msg,hiliNum,hiliNote,hiliBox,level]);
				return true;
			}
		}
	}
	return false;
}
candidateLine(board,level){
	for(let box=0;box<9;box++){
		for(let num=1;num<=9;num++){
			let xCandidateLine = -1;
			let yCandidateLine = -1;
			let hiliNote = new Array();
			let nums = new Array();
			let xs = new Array();
			let ys = new Array();
			for(let i=0;i<9;i++){
				const [x,y] = this.biToXY([box,i]);
				if(board.tile[x][y]==num){
					xCandidateLine = -2;
					yCandidateLine = -2;
					break;
				}
				if(board.tile[x][y]!=0) continue;
				if(!board.note[x][y][num-1]) continue;
				hiliNote[hiliNote.length] = [x+1,y+1,num,"▢","red",1.1];
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
						const msg = "Candidate Line";
						const hiliNum = null;
			if(xCandidateLine>-1){
				for(let i=0;i<9;i++){
					if(indexToBox([xCandidateLine,i])==box) continue;
					if(board.tile[xCandidateLine][i]!=0) continue;
					if(board.note[xCandidateLine][i][num-1]){
						hiliNote[hiliNote.length] = [xCandidateLine+1,i+1,num,num,"darkGray"];
						hiliNote[hiliNote.length] = [xCandidateLine+1,i+1,num,"/","red",1.3];
						xs[xs.length] = xCandidateLine;
						ys[ys.length] = i;
						nums[nums.length] = num;
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
						hiliNote[hiliNote.length]= [i+1,yCandidateLine+1,num,num,"darkGray"];
						hiliNote[hiliNote.length]= [i+1,yCandidateLine+1,num,"/","red",1.3];
						xs[xs.length] = i;
						ys[ys.length] = yCandidateLine;
						nums[nums.length] = num;
					}
				}
			}
			if(nums.length>0){
				const [xii,yii] = this.biToXY([box,0]);
				const [xil,yil] = this.biToXY([box,8]);
				const hiliBox = [[xii+1,yii+1,xil+1,yil+1,"lime"]];
				this.action("programProgressedNote",xs,ys,nums,[msg,hiliNum,hiliNote,hiliBox,level]);
				return true;				
			}	
		}
	}
	return false;
}
singleNote(board,level){
	//Check for single candidate in a cell
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
				const msg = "Single Note in a Cell";
				const hiliNum = [[x+1,y+1,"","lime"]];
				const hiliNote= [[x+1,y+1,number,number,"darkGray"],[x+1,y+1,number,"▢","red",1.1]];
				const hiliBox = null;//[[x+1,y+1,x+1,y+1,"lime"]];
				this.action("programProgressed",x,y,number,[msg,hiliNum,hiliNote,hiliBox,0.25]);
				return true;
			}
		}
	}
	//Check for single candidate in Box, Row, Col
	for(let BoxRowCol=0;BoxRowCol<3;BoxRowCol++){
		for(let parOne=0;parOne<9;parOne++){
			let notes = new Array(9).fill(-1);
			for(let parTwo=0;parTwo<9;parTwo++){
				let x,y;
				if(     BoxRowCol==0){[x,y]=this.biToXY([parOne,parTwo]);}
				else if(BoxRowCol==1){[x,y]=[parTwo,parOne];}
				else if(BoxRowCol==2){[x,y]=[parOne,parTwo];}
				if(board.tile[x][y]==0){
					for(let noteIndex=0;noteIndex<9;noteIndex++){
						if(board.note[x][y][noteIndex]){
							if(notes[noteIndex]==-1){
								notes[noteIndex]=this.XYToin([x,y]);
							}else{
								notes[noteIndex]=-2;
							}
						}
					}
				}else{
					notes[Math.abs(board.tile[x][y])-1]=-2;
				}
			}
			for(let noteIndex=0;noteIndex<9;noteIndex++){
				if(notes[noteIndex]>=0){
					const [x,y] = this.inToXY(notes[noteIndex]);
					const box = this.XYToBi([x,y])[0];
					const num = noteIndex+1;
					//Check if the solution is valid
					let solutionValid = true;
					for(let xCheck=0;(xCheck<9&&solutionValid);xCheck++){
						for(let yCheck=0;(yCheck<9&&solutionValid);yCheck++){
							const boxCheck = this.XYToBi([xCheck,yCheck])[0];
							if(x==xCheck||y==yCheck||box==boxCheck){
								if(num==Math.abs(board.tile[xCheck][yCheck])){
									solutionValid=false;
								}
							}
						}
					}
					if(!solutionValid) continue;
					//Prepare Message
					let msg = "Single Note in a ";
					if(     BoxRowCol==0){msg += "Box";}
					else if(BoxRowCol==1){msg += "Row";}
					else if(BoxRowCol==2){msg += "Col";}
					//Prepare Number
					const hiliNum = [[x+1,y+1,"","lime"]];
					//Prepare Notes
					let hiliNote = new Array();
					for(let i=0;i<9;i++){
						if(board.note[x][y][i]){
							hiliNote[hiliNote.length] = [x+1,y+1,i+1,i+1,"darkGray"];
						}
					}
					hiliNote[hiliNote.length] = [x+1,y+1,num,"▢","red",1.1];
					//Prepare Box
					let xii,yii,xil,yil;
					if(     BoxRowCol==0){
						[xii,yii] = this.biToXY([parOne,0]);
						[xil,yil] = this.biToXY([parOne,8]);
					}
					else if(BoxRowCol==1){
						[xii,yii] = [0,parOne];
						[xil,yil] = [8,parOne];
					}
					else if(BoxRowCol==2){
						[xii,yii] = [parOne,0];
						[xil,yil] = [parOne,8];
					}
					const hiliBox = [[xii+1,yii+1,xil+1,yil+1,"lime"]];
					this.action("programProgressed",x,y,num,[msg,hiliNum,hiliNote,hiliBox,level]);
					return true;
				}
			}
		}
	}
	return false;
}
addNotes(board,level){
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
singleCandidate(board,level){
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
				this.action("programProgressed",x,y,n,[msg,hiliNum,hiliNote,hiliBox,level]);
				return true;
			}
			candidate[x+y*9][0]=count;
		}
	}
	//console.log(candidate);
	return false;
}
singlePosition(board,level){
	for(let n=1;n<=9;n++){//Check based on Number first
		let candidate = new Array(81).fill(1);
		let hiliNum = new Array;
		let hiliNumCan = new Array;
		let hiliBox = null;
		let hiliNote = null;
		for(let x=0;x<9;x++){
			for(let y=0;y<9;y++){
				if(board.tile[x][y]==0) continue;
				//If there is a number, then it cannnot be a candidate
				candidate[x+y*9] = 0;

				//If the number on tile matches, then clear candidates by row,colum and box
				if(board.tile[x][y]==n||board.tile[x][y]==-n){
					hiliNumCan[hiliNumCan.length]=[x+1,y+1,Math.abs(n),"red"];
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
				for(let i=0;i<hiliNumCan.length;i++){
					const boxCan = this.XYToBi([hiliNumCan[i][0]-1,hiliNumCan[i][1]-1])[0];
					if(box%3==boxCan%3||Math.floor(box/3)==Math.floor(boxCan/3)){
						hiliNum[hiliNum.length] = hiliNumCan[i];
					}
				}
				hiliNum[hiliNum.length]=[index%9+1,Math.floor(index/9)+1,n,"lime"];
				this.action("programProgressed",index%9,Math.floor(index/9),n,[msg,hiliNum,hiliNote,hiliBox,level]);
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
				hiliNumCan[hiliNumCan.length]=[index%9+1,Math.floor(index/9)+1,n,"lime"];
				this.action("programProgressed",index%9,Math.floor(index/9),n,[msg,hiliNumCan,hiliNote,hiliBox,0.5]);
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
				hiliNumCan[hiliNumCan.length]=[index%9+1,Math.floor(index/9)+1,n,"lime"];
				this.action("programProgressed",index%9,Math.floor(index/9),n,[msg,hiliNumCan,hiliNote,hiliBox,0.5]);
				return true;
			}
		}
	}
	return false;
}
XYToBi([x,y]){
	const box = Math.floor(x/3)+Math.floor(y/3)*3;
	const i   = Math.floor(x%3)+Math.floor(y%3)*3;
	return [box,i];
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