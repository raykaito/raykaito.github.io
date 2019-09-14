var leftKey  = false;
var rightKey = false;
var upKey    = false;
var downKey  = false;
var spaceKey = false;
var ctrKey   = false;

var lastX, lastY;

var width;
var height;

function initEventlistener(){    
    addEventListener('keydown',keyPressed,false);
    addEventListener('keyup',keyReleased,false);
    
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
}

function release(event){
	rect = event.target.getBoundingClientRect();
	x = event.pageX-rect.left-document.body.scrollLeft;
	y = event.pageY-rect.top-document.body.scrollTop;
	x *= pixelRatio;
	y *= pixelRatio;

	swiped(lastX, lastY, x, y);
}

console.log("Loaded: inputManager.js");