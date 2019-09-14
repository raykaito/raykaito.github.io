var player, cpulevel, cpuDisplayed;
var showKihu, showScore;
var stateIndex, states;
var cpuActive, aiCheckReserved;

function setup(){
	player = ["Human", "CPU 2"];
	cpulevel = [1,1];
	states = ["Continue", "Black Won!", "White Won!", "Draw"];
	stateIndex = 0;
	cpuDisplayed = 1;
	showKihu = false;
	showScore= false;
	cpuActive= false;

	displayAll();
}

function switchPlayer(n){
	player[n] = player[n]=="Human"?"CPU "+(n+1):"Human";
	displayAll();
}

function switchCpuDisplayed(){
	cpuDisplayed = (cpuDisplayed+1)%2;
	displayAll();
}

function cpuSelected(){
	if(Number(cplevel.value)==4){
		alert("Sorry, our Ace is not here today. Please visit us after some days.");
		cplevel.value = cpulevel[cpuDisplayed];
		return;
	}
	cpulevel[cpuDisplayed] = Number(cplevel.value);
	displayAll();
}

function displayAll(){
	cplevel.value = cpulevel[cpuDisplayed];
	display.innerHTML = player[0]+" vs "+player[1];
	if(stateIndex==0){
		displaz.innerHTML = "CPU "+(cpuDisplayed+1)+" Level:";
	}else{
		displaz.innerHTML = "Play Again!!";
	}
	if(!aiCheckReserved){
		setTimeout(aiCheck,30);
		aiCheckReserved = true;
	}
}