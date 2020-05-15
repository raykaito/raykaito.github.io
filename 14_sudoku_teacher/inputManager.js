let leftKey  = false;
let rightKey = false;
let upKey    = false;
let downKey  = false;
let spaceKey = false;
let ctrKey   = false;

let lastX, lastY;

function initEventlistener(){    
    addEventListener('keydown',keyPressed,false);
    addEventListener('keyup',keyReleased,false);

    window.addEventListener('resize', resize, false);
    
    //canvas.addEventListener('click', clicked, false);
    //canvas.addEventListener('touchcancel', clicked, false);
    canvas.addEventListener('mousedown', touch, false);
    canvas.addEventListener('touchstart', touch, false);
    
    canvas.addEventListener('mouseup', release, false);
    canvas.addEventListener('touchend', release, false);

	console.log("    - Eventlistener initialized.");
}

function keyPressed(event){
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
function keyReleased(event){
	switch(event.keyCode){
		case  17:   ctrKey = false; break;
		case  32: spaceKey = false; break;
		case  37:  leftKey = false; break;
		case  38:    upKey = false; break;
		case  39: rightKey = false; break;
		case  40:  downKey = false; break;
	}
}

function touch(event){
	rect = event.target.getBoundingClientRect();
	x = event.pageX-rect.left-document.body.scrollLeft;
	y = event.pageY-rect.top-document.body.scrollTop;
	x *= pixelRatio;
	y *= pixelRatio;

	lastX = x;
	lastY = y;
	event.preventDefault();
	showInputs(XYtoIndex([x,y]));
}

function release(event){
	rect = event.target.getBoundingClientRect();
	x = event.pageX-rect.left-document.body.scrollLeft;
	y = event.pageY-rect.top-document.body.scrollTop;
	x *= pixelRatio;
	y *= pixelRatio;

	setNum(lastX, lastY, x, y);
}

function showInputs([xi,yi]){
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

function setNum(xi,yi,xl,yl){
	//get x and y index for initial and last position
	const [xii,yii] = XYtoIndex([xi,yi]);
	const [xil,yil] = XYtoIndex([xl,yl]);
	//Return if the initial position is invalid
	if(yii>9){
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

function XYtoIndex([x,y]){	return [Math.floor(11*x/width),Math.floor(11*y/height)];}
function indexToBox([xi,yi]){	return Math.floor(xi/3)+Math.floor(yi/3)*3;}

console.log("Loaded: inputManager.js");