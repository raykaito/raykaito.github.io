var mode; //0:Select Resource Type 1: MainScreen
var selection;
var tempx, tempy;
var selectedResource;
var resourceType;//0:tile 1:settlement 2: numbers
var settlement, settleNumber;
var numbers, numberTiles, ntNumber;
var rolledDice, newMapRequired;
var angleToXindexOffset,angleToYindexOffset;
var expectation;
var recordE, recordR, rindex;

function fillSelectionwithFrame(){
	selection  = [];
	for(i=0;i<=4;i++){
		selection[i] = [];
		for(j=0;j<=4;j++){
			selection[i][j] = frame;
		}
	} 
}
function arrayInit(){
	//settlement
	settleNumber = 0;
	settlement = [];
	for(i=0;i<=27;i++){
		settlement[i] = [];
	}
	//record
	rindex = 0;
	recordE = [];
	recordR = [];
	//Expectation
	resetExpectation();
}
function resetExpectation(){
    expectation = [];
    for(i=0;i<4;i++){
    	expectation[i] = [0,0,0,0,0];
    }	
}
function numberTileInit(){
	ntNumber = 0;
	numbers = [];
	for(i=0;i<=18;i++){
		numbers[i] = [];
	}
	numberTiles = [5,2,6,3,8,10,9,12,11,4,8,10,9,4,5,6,3,11,0];
	angleToXindexOffset = [-1,-1,0,1,1,0];
	angleToYindexOffset = [1,0,-1,-1,0,1];
}
function addRecord(){
	recordE[rindex] = [];
	recordR[rindex] = [];
	for(i=0;i<5;i++){
		recordE[rindex][i] = [0,0,0,0,0,0];
		recordR[rindex][i] = [0,0,0,0,0,0];
	}
	return;
}
function settingsInit(){
    fillSelectionwithFrame();
    arrayInit();
    numberTileInit();

    mode = 0;
    resourceType = 0;
    rolledDice = 1;
    newMapRequired = false;
}