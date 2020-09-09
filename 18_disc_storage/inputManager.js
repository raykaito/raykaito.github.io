let leftKey  = false;
let rightKey = false;
let upKey    = false;
let downKey  = false;
let spaceKey = false;
let ctrKey   = false;
let pKey   	 = false;
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
		case  80:     pKey = true; break;
		default : console.log("keyCode: "+event.keyCode);
		//default : alert("keyCode: "+event.keyCode);
	}
	if(pKey) preLoad();
}
const keyReleased=(event)=>{
	switch(event.keyCode){
		case  17:   ctrKey = false; break;
		case  32: spaceKey = false; break;
		case  37:  leftKey = false; break;
		case  38:    upKey = false; break;
		case  39: rightKey = false; break;
		case  40:  downKey = false; break;
		case  80:     pKey = false; break;
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
	phase.touch(x,y,event);
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
	phase.move(x,y);
}
const release=(event)=>{
	const rect = event.target.getBoundingClientRect();
	let x = event.pageX-rect.left-document.scrollingElement.scrollLeft;
	let y = event.pageY-rect.top-document.scrollingElement.scrollTop;
	x *= pixelRatio;
	y *= pixelRatio;
	phase.release(x,y);
}

console.log("Loaded: inputManager.js");