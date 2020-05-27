class Solver{
constructor(array){
	//constants
	this.rowConst = new Array();
	this.colConst = new Array();
	this.boxConst = new Array();
	for(let i=0;i<9;i++){
		this.rowConst[i] = new Array();
		this.colConst[i] = new Array();
		this.boxConst[i] = new Array();
		for(let j=0;j<9;j++){
			this.rowConst[i][j] = i*9+j;
			this.colConst[i][j] = i+j*9;
			this.boxConst[i][j] = (i%3)*3+Math.floor(i/3)*3*9+j%3+Math.floor(j/3)*9;
		}
	}
	//Record the depth and path
	this.solutionCount = 0;
	this.path = [0];
	//If not solvable
	this.solvable = true;
	//Initialize the Situation
	this.singleList = new Array();
	this.situation = new Array();
	this.situation[0] = new Situation();
	this.inputSetNumbers(this.situation[0],array);
}
checkSolvability(){
	while(this.step());
	if(this.solutionCount==1&&this.solvable){
		return true;
	}else{
		return false;
	}
}
step(){
	this.singleList = new Array();
	//Get Situtation First
	const currentDepth = this.path.length-1;
	if(currentDepth==-1) return false;
	//Check if there is unsolved index or not
	let unsolvedTileIndex = -1;
	let minCandidate = 10;
	for(let i=0;i<81;i++){
		const newNumCan = this.situation[currentDepth].numCandidates[i];
		if(newNumCan<0){
			//Skip
		}else if(newNumCan==2){
			unsolvedTileIndex = i;
			break;
		}else if(newNumCan<minCandidate){
			unsolvedTileIndex = i;
			minCandidate = newNumCan;
		}
	}
	//If unsolvedTileIndex is -1, the board is solved
	if(unsolvedTileIndex==-1){
		this.solved();
	}else{
		this.guess(unsolvedTileIndex);
	}
	if(this.solutionCount>1) return false;
	if(this.solvable==false) return false;
	return true;
}
solved(){
	//console.log("SOLVED: "+arrayToString(this.path));
	this.solutionSituation = new Situation();
	this.solutionSituation.duplicate(this.situation[this.path.length-1]);
	this.path.pop();
	this.solutionCount++;
}
guess(index){
	//console.log("GUESS : "+arrayToString(this.path));
	const newDepth = this.path.length;
	let currentPath = this.path[newDepth-1];
	//Find Number To Geuss
	let newNumber = -1;
	for(let i=0;i<9;i++){
		if(this.situation[newDepth-1].candidates[index][i]){
			if(currentPath==0){
				newNumber = i+1;
				break;
			}else{
				currentPath--;
			}
		}
	}
	if(newNumber==-1){
		this.path.pop();
	}else{		
		this.situation[newDepth] = new Situation();
		this.situation[newDepth].duplicate(this.situation[newDepth-1]);
		this.path[newDepth]=0;
		this.path[newDepth-1]++;
		this.setNewNumber(this.situation[newDepth],index,newNumber,true);
	}
}
failed(){
	if(this.path.length==0){
		this.solvable = false;
		return;
	}
	//console.log("FAILED: "+arrayToString(this.path));
	this.path.pop();
}
inputSetNumbers(situation,array){
	//Input the "original" numbers of the sudoku puzzle
	//this should be called only once when orignal board is inputted
	for(let i=0;i<81;i++){
		const newNumber = array[i];
		if(newNumber!=0){
			//Number of Candidates will be the negative of number
			this.setNewNumber(situation,i,newNumber,true);
		}
	}
}
setNewNumber(situation,index,number,cleanUpCandidates=false){
	if(cleanUpCandidates){
		for(let j=0;j<9;j++){
			situation.candidates[index][j]=false;
		}
	}
	//Set the Number as a Negative number
	situation.numCandidates[index] = -number;
	//Make the Candidate False
	situation.candidates[index][number-1] = false;
	//Remove Candidates from related Row, Col and Box
	for(let j=0;j<9;j++){
		const indexRow = this.rowConst[this.inToRow(index)][j];
		const indexCol = this.colConst[this.inToCol(index)][j];
		const indexBox = this.boxConst[this.inToBox(index)][j];
		if(this.tryToEliminateCandidate(situation,indexRow,number)) return;
		if(this.tryToEliminateCandidate(situation,indexCol,number)) return;
		if(this.tryToEliminateCandidate(situation,indexBox,number)) return;
	}
	if(this.singleList.length==0){
		this.findSinglePosition(situation,2);
	}
	if(this.singleList.length==0){
		this.findSinglePosition(situation,1);
	}
	if(this.singleList.length==0){
		this.findSinglePosition(situation,0);
	}
	if(this.singleList.length>0){
		const [newIndex,newNumber,cleanUpCandidates] = this.singleList[this.singleList.length-1];
		this.singleList.pop();
		if(this.setNewNumber(situation,newIndex,newNumber,cleanUpCandidates)) return;
	}
}
findSinglePosition(situation,rcb){
	for(let i=0;i<9;i++){
		let candidates = new Array(9).fill(-1);//-1:Not Found +: Found -2: impossible
		for(let j=0;j<9;j++){
			let index;
			switch(rcb){
				case 0: index = this.rowConst[i][j]; break;
				case 1: index = this.colConst[i][j]; break;
				case 2: index = this.boxConst[i][j]; break;
			}
			if(situation.numCandidates[index]<0){
				candidates[-situation.numCandidates[index]]=-2;
			}else{
				for(let num=0;num<9;num++){
					if(situation.candidates[index][num]){
						if(candidates[num]==-1){
							candidates[num]=index;
						}else if(candidates[num]>=0){
							candidates[num]=-2;
						}
					}
				}
			}
		}
		for(let i=0;i<9;i++){
			if(candidates[i]>=0){
				this.singleList[this.singleList.length] = [candidates[i],i+1,true];
				//console.log(candidates[i],i+1);
			}
		}
	}
}
tryToEliminateCandidate(situation,index,number){
	if( situation.candidates[index][number-1]){
		situation.candidates[index][number-1] = false;
		situation.numCandidates[index]--;
		const newNumCan = situation.numCandidates[index];
		if(newNumCan==1){
			let newNumber = -1;
			for(let i=0;i<9;i++){
				if(situation.candidates[index][i]){
					newNumber = i+1;
					break;
				}
			}
			this.singleList[this.singleList.length] = [index,newNumber,false];
		}
		else if(newNumCan==0){
			this.failed();
			return true;
		}
	}
	return false;
}
draw(situationIndex = 0){
	//Draw Original Numbers
	for(let i=0;i<81;i++){
		const number = this.situation[situationIndex].numCandidates[i];
		const x = this.inToCol(i);
		const y = this.inToRow(i);
		if(number<0){
			drawNumber(x+1,y+1,-number,"black");
			continue;
		}
		for(let num=0;num<9;num++){
			if(this.situation[situationIndex].candidates[i][num]) drawNotes(x+1,y+1,num+1,num+1,"black");
		}
	}
	return;
}
inToCol(index){return index%9;}
inToRow(index){return Math.floor(index/9);}
inToBox(index){return Math.floor((index%9)/3)+Math.floor(index/27)*3;}
}
class Situation{
	constructor(){
		//Initialize NumberOfCandidates and Candidates
		this.numCandidates = new Array(81).fill(9);//[-9]~[-1]: Set, [0]~[9]: Num of can
		this.candidates = new Array(81);
		for(let i=0;i<81;i++){
			this.candidates[i] = new Array(9).fill(true);
		}
	}
	duplicate(situation){
		for(let i=0;i<81;i++){
			this.numCandidates[i] = situation.numCandidates[i];
			for(let j=0;j<9;j++){
				this.candidates[i][j] = situation.candidates[i][j];
			}
		}
	}
}
const arrayToString = (array,separator=",") => {
	let str = ""+array[0];
	for(let i=1;i<array.length;i++){
		str += (separator+array[i]);
	}
	return str;
}

console.log("Loaded: quickSolver.js");