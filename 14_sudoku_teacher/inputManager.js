let leftKey  = false;
let rightKey = false;
let upKey    = false;
let downKey  = false;
let spaceKey = false;
let ctrKey   = false;

let touchX, touchY;

function initEventlistener(){    
    addEventListener('keydown',keyPressed,false);
    addEventListener('keyup',keyReleased,false);

    window.addEventListener('resize', resize, false);

    canvas.addEventListener('mousedown', touch, false);
    canvas.addEventListener('touchstart', touch, false);
    
    canvas.addEventListener('mouseup', release, false);
    canvas.addEventListener('touchend', release, false);

	console.log("    - Eventlistener initialized.");
}
keyPressed=(event)=>{
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
keyReleased=(event)=>{
	switch(event.keyCode){
		case  17:   ctrKey = false; break;
		case  32: spaceKey = false; break;
		case  37:  leftKey = false; break;
		case  38:    upKey = false; break;
		case  39: rightKey = false; break;
		case  40:  downKey = false; break;
	}
}
touch=(event)=>{
	const rect = event.target.getBoundingClientRect();
	let x = event.pageX-rect.left-document.scrollingElement.scrollLeft;
	let y = event.pageY-rect.top-document.scrollingElement.scrollTop;
	x *= pixelRatio;
	y *= pixelRatio;

	touchX = x;
	touchY = y;
	event.preventDefault();
	const [xi,yi]=XYtoIndex([x,y]);
	if(xi<1||xi>9||yi<1||yi>9){
		console.log("invalid touch region");
		return;
	}
	showInputs([xi,yi]);
}
release=(event)=>{
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

	setNum(touchX, touchY, x, y);
}
showInputs=([xi,yi])=>{
	drawGrids(false);
	drawNumber(2,8,1,"gray",side*3);
	drawNumber(5,8,2,"gray",side*3);
	drawNumber(8,8,3,"gray",side*3);
	drawNumber(2,5,4,"gray",side*3);
	drawNumber(5,5,5,"gray",side*3);
	drawNumber(8,5,6,"gray",side*3);
	drawNumber(2,2,7,"gray",side*3);
	drawNumber(5,2,8,"gray",side*3);
	drawNumber(8,2,9,"gray",side*3);
}
setNum=(xi,yi,xl,yl)=>{
	//get x and y index for initial and last position
	const [xii,yii] = XYtoIndex([xi,yi]);
	const [xil,yil] = XYtoIndex([xl,yl]);
	//Return if the initial position is invalid
	if(yii>9){
		if(xii>9){
			startScan();
			return;
		}
		if(rcanvas.style.display=="none")   rcanvas.style.display="block";
		else								rcanvas.style.display="none";
		//User Input
	}
	if(xii<1||xii>9||yii<1||yii>9){
		console.log("invalid region");
		draw();
		return;
	}
	let newNum = 3*(Math.floor((9-yil)/3))+Math.floor((xil-1)/3)+1;
	if(xil<1||xil>9||yil<1||yil>9) newNum = 0;
	sudoku.userInput(xii-1,yii-1,newNum);
	draw();
}

XYtoIndex=([x,y])=>{	return [Math.floor(11*x/width),Math.floor(11*y/height)];}
indexToBox=([xi,yi])=>{	return Math.floor(xi/3)+Math.floor(yi/3)*3;}

console.log("Loaded: inputManager.js");