class Phase{
constructor(){
	//											,G,G,G,F,C,G,A,N,N
	this.phaseList = [["Input Sudoku Manualy"	,0,0,0,0,0,0,0,0,0],
					  ["Scanning Board"			,0,0,0,0,0,0,0,0,0],
					  ["Uploading Image"		,0,0,0,0,0,0,0,0,0],
					  ["Correct Scanning Error"	,0,0,0,0,0,0,0,0,0],
					  ["Checking Solvability"	,0,0,0,0,0,0,0,0,0],
					  ["User Solving"			,0,0,0,0,0,0,0,0,0],
					  ["Analyzing Sudoku"		,0,0,0,0,0,0,0,0,0],
					  ["Analyzed"				,0,0,0,0,0,0,0,0,0],
					  ["Unsolvable"				,0,0,0,0,0,0,0,0,0],
					  ];
	this.phaseIndex = 0;
}
changePhase(newPhase){
	for(let phaseIndex = 0; phaseIndex<this.phaseList.length;phaseIndex++){
		if(phaseList[phaseIndex][0]==newPhase){
			this.phaseIndex = phaseIndex;
			this.updateInfo();
			draw();
			return;
		}
	}
	alert("Invalid Phase Change");
}
updateInfo(){
	const newPhase = this.phaseList[this.phaseIndex];
	this.phase 				= newPhase[0];
	this.gridNormal 		= newPhase[1];
	this.gridNumber 		= newPhase[2];
	this.gridNumberNote 	= newPhase[3];
	this.folder_icon 		= newPhase[4];
	this.camera_icon 		= newPhase[5];
	this.graph 				= newPhase[6];
	this.startAnalyze 		= newPhase[7];
	this.numberVisualizer 	= newPhase[8];
	this.noteVisualizer 	= newPhase[9];
}
}