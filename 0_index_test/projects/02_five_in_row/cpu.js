function aiCheck(){
	if(cpuActive) return;
	aiCheckReserved = false;
	if(player[b.currentPlayer==1?0:1]!="Human"){
		aiMove(-1);
	}
}
function aiMove(AiLevel){
	if(stateIndex!=0){
		return;
	}

	var level;
	if(AiLevel==-1){
		level = cpulevel[b.currentPlayer==1?0:1];
	}else{
		level = AiLevel;
	}

	var moveIndex;
	if(b.moveCount==0){
		moveIndex = firstMove();
	}else{
		switch(level){
			case  1: moveIndex = basic(false); break;
			case  2: moveIndex = basic(true ); break;
			case  3: moveIndex = laplase()   ; break;
			default: moveIndex = 0;alert("Error: Abnormal CPU Level Selected");
		}
	}
	b.setStone(moveIndex);
}

function firstMove(){
	var range, minr, minc;
	range = 5;
	minr = (row-range)/2;
	minc = (col-range)/2;
	minr += Math.random()*range;
	minc += Math.random()*range;
	minr = Math.floor(minr);
	minc = Math.floor(minc);
	return toi(minr, minc);
}

function basic(advanced){
	var i, record, champCount, score, luckyChampNumber;
	record = champCount = 0;
	for(i=0;i<row*col;i++){
		if(getSide(i)!=0) continue;
		score = b.getScore(b.currentPlayer,advanced,i)
		if(record<score){
			record = score;
			champCount = 1;
		}else if(record == score){
			champCount++;
		}
	}
	if(champCount==0){
		alert("Error: beginner couldn't find a single champ");
		return 0;
	}
	luckyChampNumber = Math.floor(Math.random()*champCount);
	for(i=0;i<row*col;i++){
		if(getSide(i)!=0) continue;
		score = b.getScore(b.currentPlayer,advanced,i)
		if(record==score){
			if(luckyChampNumber == 0){
				return i;
			}
			else luckyChampNumber --;
		}
	}
	alert("Error: beginner found some champs but couldn't choose");
	return 0;
}