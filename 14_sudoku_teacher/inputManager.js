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
	showInputs(getIndex(x,y));
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
	drawGrids();
	for(let i=0;i<9;i++){
		let x=xi+i%3-1;
		let y=yi-(Math.floor(i/3)-1);
		drawNumber(x,y,i+1,"gray");
	}
}

function setNum(xi,yi,xl,yl){
	//get x and y index for initial and last position
	const [xii,yii] = getIndex(xi,yi);
	const [xil,yil] = getIndex(xl,yl);
	if(xii<1||xii>9||yii<1||yii>9){
		console.log("invalid region");
		draw();
		return;
	}
	
	//valid x = [1,2,3] valid y = [1,2,3]
	const x = (xil+2)-xii;
	const y = (yii+2)-yil;

	if(x<1||x>3||y<1||y>3) 	sudoku.resetTile(xii-1,yii-1);
	else 					sudoku.setTile(xii-1,yii-1,x+(y-1)*3);
	draw();
}

console.log("Loaded: inputManager.js");