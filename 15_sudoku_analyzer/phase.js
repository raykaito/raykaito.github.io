class Phase{
constructor(initial){
	this.phaseList = [
	//							,R,G,G,G,S,S,F,C,G,A,N,N,U,D
	{	phase:"Input Sudoku Manually",	
		gridNormal:1,
		sudoku:1,
		folder_icon:1,
		camera_icon:1,
		textUp:"Input Sudoku or Upload →",		
		textDown:"Tap HERE to start Solving."},

	{	phase:"Scanning Board",			
		restoreSave:1,
		gridNormal:1,
		sudoku:1,
		scanner:1,
		textUp:"Scanning Sudoku...",			
		textDown:""},

	{	phase:"Uploading Image",			
		restoreSave:1,
		gridNormal:1,
		sudoku:1,
		scanner:1,
		textUp:"Scanning Sudoku...",			
		textDown:""},

	{	phase:"Correct Scanning Error",	
		gridNormal:1,
		scanner:1,
		textUp:"Drag and Drop",				
		textDown:"Tap HERE When Done."},

	{	phase:"Checking Solvability",		
		gridNormal:1,
		sudoku:1,
		textUp:"Checking Solvability",			
		textDown:""},

	{	phase:"User Solving",				
		gridNormal:1,
		sudoku:1,
		textUp:"User Solving"},

	{	phase:"Analyzing Sudoku",			
		gridNormal:1,
		sudoku:1,
		textUp:"Analyzing Sudoku...",			
		textDown:""},

	{	phase:"Analyzed",					
		gridNormal:1,
		sudoku:1,
		graph:1,
		textUp:"Analysis Complete!!!",			
		textDown:""},

	{	phase:"Unsolvable",				
		gridNormal:1,
		sudoku:1,
		textUp:"This sudoku was Unsolvable",	
		textDown:""}	
	];
	this.changePhase(initial,false);
}
changePhase(newPhase,drawChange=true){
	for(let phaseIndex = 0; phaseIndex<this.phaseList.length;phaseIndex++){
		if(this.phaseList[phaseIndex].phase==newPhase){
			this.phaseIndex = phaseIndex;
			this.updateInfo();
			console.log(this.phaseList[this.phaseIndex]);
			if(drawChange) draw();
			return;
		}
	}
	alert("Invalid Phase Change");
}
updateInfo(){
	const newPhase = this.phaseList[this.phaseIndex];
	this.phase 				= (newPhase.phase			== undefined?0:newPhase.phase);
	this.restoreSave		= (newPhase.restoreSave		== undefined?0:newPhase.restoreSave);
	this.gridNormal 		= (newPhase.gridNormal		== undefined?0:newPhase.gridNormal);
	this.gridNumber 		= (newPhase.gridNumber		== undefined?0:newPhase.gridNumber);
	this.gridNumberNote 	= (newPhase.gridNumberNote	== undefined?0:newPhase.gridNumberNote);
	this.sudoku				= (newPhase.sudoku			== undefined?0:newPhase.sudoku);
	this.scanner			= (newPhase.scanner			== undefined?0:newPhase.scanner);
	this.folder_icon 		= (newPhase.folder_icon		== undefined?0:newPhase.folder_icon);
	this.camera_icon 		= (newPhase.camera_icon		== undefined?0:newPhase.camera_icon);
	this.graph 				= (newPhase.graph			== undefined?0:newPhase.graph);
	this.startAnalyze 		= (newPhase.startAnalyze	== undefined?0:newPhase.startAnalyze);
	this.numberVisualizer 	= (newPhase.numberVisualizer== undefined?0:newPhase.numberVisualizer);
	this.noteVisualizer 	= (newPhase.noteVisualizer	== undefined?0:newPhase.noteVisualizer);
	this.textUp				= (newPhase.textUp			== undefined?"":newPhase.textUp);
	this.textDown			= (newPhase.textDown		== undefined?"":newPhase.textDown);
	slider.style.display = (this.graph?"inline-block":"none");
}
draw(){
    if(this.restoreSave        ) canvasRestoreSave();
    if(this.gridNormal         ) drawGrids("Normal");
    if(this.gridNumber         ) drawGrids("Number");
    if(this.gridNumberNote     ) drawGrids("NumberNote");
    if(this.graph              ) drawGraph();
    if(this.sudoku             ) sudoku.draw();
    if(this.scanner            ) if(scanner) scanner.draw();
    if(this.folder_icon        ) drawIcon(icon_camera,8,0);
    if(this.camera_icon        ) drawIcon(icon_folder,7,0);
    if(this.startAnalyze       ) draw();
    if(this.numberVisualizer   ) draw();
    if(this.noteVisualizer     ) draw();
    drawNumber(5, 0,this.textUp  ,"black",side*0.6,"Times New Roman",false);
    drawNumber(5,10,this.textDown,"black",side*0.6,"Times New Roman",false);
    if(this.phase=="Unsolvable"){
        alert("This sudoku was unsolvable. Please input sudoku Manualy.");
        this.changePhase("Input Sudoku Manually");
    }
}
touch(x,y,event){
	const [xi,yi]=XYtoIndex([x,y]);
	console.log(xi,yi);
	if(this.phase=="User Solving"){
		sudoku.touchWhileSolving(x,y,event);
	}else{
		if(xi<1||xi>9||yi>10){
			console.log("invalid touch region");
			return;
		}else if(yi<1||yi>9){
			console.log("invalid touch region");
			event.preventDefault();
			return;
		}
		event.preventDefault();
		if(this.phase=="Correct Scanning Error"){
			scanner.userInput("touch",xi,yi);
		}else{
			drawGrids("Number");
		}
	}
}
move(x,y){	
	if(this.phase=="Correct Scanning Error"){
		scanner.userInput("move",x,y);
	}else if(this.phase=="User Solving"){
		sudoku.moveWhileSolving(x,y);
	}
}
release(x,y){
	//Check if the touch start position if valid or not
	if(touchX==undefined||touchY==undefined){
		console.log("invalid touch region (out of canvas)");
		draw();
		return;
	}	
	//get x and y index for initial and last position
	const [xii,yii] = XYtoIndex([touchX,touchY]);
	const [xil,yil] = XYtoIndex([x,y]);

	console.log("Touched  XY: ("+xii+","+yii+")");
	console.log("Released XY: ("+xil+","+yil+")");

	//Take Care of Inputs
	if(this.folder_icon){if(yii==0&&yil==0&&xii==8&&xil==8){uploadImage();return;}}
	if(this.camera_icon){if(yii==0&&yil==0&&xii==9&&xil==9){startScan();  return;}}

	if(this.phase=="Input Sudoku Manually"){
		if(yil==10&&yii==10){
			//Start "User Solving" phase
			sudoku.checkSolvability();
		}else if(xii>=1||xii<=9||yii>=1||yii<=9){
			let newNum = 3*(Math.floor((9-yil)/3))+Math.floor((xil-1)/3)+1;
			const index = sudoku.XYToBi([xil-1,yil-1])[1];
			if(xil<1||xil>9||yil<1||yil>9) newNum = 0;
			console.log("Uer Input: "+newNum);
			sudoku.userInput(xii-1,yii-1,newNum,index==8);
		}
	}else if(this.phase=="Correct Scanning Error"){
		if(yii<1){
			if(rcanvas.style.display=="none")   rcanvas.style.display="block";
			else								rcanvas.style.display="none";
		}
		if(yii==10&&yil==10){
			scanner.numberV.endCorrection();
		}else{
			scanner.userInput("release",xil,yil);
		}
	}else if(this.phase=="User Solving"){
		sudoku.releaseWhileSolving(x,y);
	}
	draw();
}
}