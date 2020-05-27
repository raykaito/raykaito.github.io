let leftKey  = false;
let rightKey = false;
let upKey    = false;
let downKey  = false;
let spaceKey = false;
let ctrKey   = false;
let lastMoveTime=0;
let moveIntervalTime = 15;


let touchX, touchY;

const  initEventlistener=()=>{    
    addEventListener('keydown',keyPressed,false);
    addEventListener('keyup',keyReleased,false);

    window.addEventListener('resize', resize, false);

    canvas.addEventListener('mousedown', touch, false);
    canvas.addEventListener('touchstart', touch, false);

    canvas.addEventListener('mousemove', move, false);
    canvas.addEventListener('touchmove', move, false);
    
    canvas.addEventListener('mouseup', release, false);
    canvas.addEventListener('touchend', release, false);

    file.addEventListener('change', loadImage, false);

	console.log("    - Eventlistener initialized.");
}
const loadImage=(e)=>{
	const fileData = e.target.files[0];
	if(fileData==undefined||!fileData.type.match('image.*')){
		alert('Please upload Image file.');
		return;
	}
	const reader = new FileReader();
	reader.onload = function(){
		const fileImage = document.createElement('img');
		fileImage.src = reader.result;
		fileImage.onload = (fileImage)=>{scanner = new Scanner(true,fileImage.target);};
	}
	reader.readAsDataURL(fileData);
}
const keyPressed=(event)=>{
	switch(event.keyCode){
		case  17:   ctrKey = true; break;
		case  32: spaceKey = true; break;
		case  37:  leftKey = true; break;
		case  38:    upKey = true; break;
		case  39: rightKey = true; break;
		case  40:  downKey = true; break;
		default : console.log("keyCode: "+event.keyCode);
		//default : alert("keyCode: "+event.keyCode);
	}
}
const keyReleased=(event)=>{
	switch(event.keyCode){
		case  17:   ctrKey = false; break;
		case  32: spaceKey = false; break;
		case  37:  leftKey = false; break;
		case  38:    upKey = false; break;
		case  39: rightKey = false; break;
		case  40:  downKey = false; break;
	}
}
const touch=(event)=>{
	const rect = event.target.getBoundingClientRect();
	let x = event.pageX-rect.left-document.scrollingElement.scrollLeft;
	let y = event.pageY-rect.top-document.scrollingElement.scrollTop;
	x *= pixelRatio;
	y *= pixelRatio;

	touchX = x;
	touchY = y;
	const [xi,yi]=XYtoIndex([x,y]);
	console.log(xi,yi);
	if(xi<1||xi>9||yi>10){
		console.log("invalid touch region");
		return;
	}else if(yi<1||yi>9){
		console.log("invalid touch region");
		event.preventDefault();
		return;
	}
	event.preventDefault();
	if(phaseList[phasei]=="Correct Scanning Error"){
		scanner.userInput("touch",xi,yi);
	}else{
		draw("drawInputs");
		console.log("Drawing Inputs");
	}
}
const move=(event)=>{
	//Check time first
	if(Date.now()-lastMoveTime<moveIntervalTime) return;
	lastMoveTime = Date.now();
	//Get coordinate
	const rect = event.target.getBoundingClientRect();
	let x = event.pageX-rect.left-document.scrollingElement.scrollLeft;
	let y = event.pageY-rect.top-document.scrollingElement.scrollTop;
	x *= pixelRatio;
	y *= pixelRatio;
	
	if(phaseList[phasei]=="Correct Scanning Error"){
		scanner.userInput("move",x,y);
	}
}
const release=(event)=>{
	//Check if the touch start position if valid or not
	if(touchX==undefined||touchY==undefined){
		console.log("invalid touch region (out of canvas)");
		draw();
		return;
	}
	const rect = event.target.getBoundingClientRect();
	let x = event.pageX-rect.left-document.scrollingElement.scrollLeft;
	let y = event.pageY-rect.top-document.scrollingElement.scrollTop;
	x *= pixelRatio;
	y *= pixelRatio;

	//get x and y index for initial and last position
	const [xii,yii] = XYtoIndex([touchX,touchY]);
	const [xil,yil] = XYtoIndex([x,y]);

	console.log("Touched  XY: ("+xii+","+yii+")");
	console.log("Released XY: ("+xil+","+yil+")");

	if(yii<1){
		if(xii==9){
			startScan();
			return;
		}else if(xii==8){
			uploadImage();
			return;
		}
	}else if(phaseList[phasei]=="Correct Scanning Error"){
		if(yii<1){
			if(rcanvas.style.display=="none")   rcanvas.style.display="block";
			else								rcanvas.style.display="none";
		}
		if(yii>9){
			scanner.numberV.endCorrection();
		}else{
			scanner.userInput("release",xil,yil);
		}
	}else{
		if(yil==10&&yii==10){
			//Start "User Solving" phase
			sudoku.checkSolvability();
		}else if(xii<1||xii>9||yii<1||yii>9){
			console.log("invalid release region");
		}else{
			let newNum = 3*(Math.floor((9-yil)/3))+Math.floor((xil-1)/3)+1;
			const index = sudoku.XYToBi([xil-1,yil-1])[1];
			if(xil<1||xil>9||yil<1||yil>9) newNum = 0;
			console.log("Uer Input: "+newNum);
			sudoku.userInput(xii-1,yii-1,newNum,index==8);
		}
	}
	draw();
}

console.log("Loaded: inputManager.js");