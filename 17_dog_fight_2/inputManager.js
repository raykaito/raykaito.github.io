let leftKey  = false;
let rightKey = false;
let upKey    = false;
let downKey  = false;
let spaceKey = false;
let ctrKey   = false;

let width;
let height;

function initEventlistener(){    
    addEventListener('keydown',keyPressed,false);
    addEventListener('keyup',keyReleased,false);

    window.addEventListener('resize', resize, false);
    
    canvas.addEventListener('click', clicked, false);
    canvas.addEventListener('touchcancel', clicked, false);

	console.log("    - Eventlistener added.");
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

function clicked(event){
	const rect = event.target.getBoundingClientRect();
	let x = event.pageX-rect.left-document.body.scrollLeft;
	let y = event.pageY-rect.top-document.body.scrollTop;
	x *= pixelRatio;
	y *= pixelRatio;

	if(ctrKey) oc.randomSpawn("player");
	else oc.randomSpawn("easy");
}

function resize(event){
	const rect = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio;
    canvas.width  = Math.floor(window.innerWidth-40);
    canvas.height = Math.floor((window.innerHeight-rect.top-20));
    canvas.style.width  = canvas.width +"px";
    canvas.style.height = canvas.height+"px";
    canvas.width *= pixelRatio;
    canvas.height*= pixelRatio;
    width  = canvas.width;
    height = canvas.height;

    console.log("    - Canvas size Updated.");
}

console.log("Loaded: inputManager.js");