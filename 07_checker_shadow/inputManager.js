function hereClicked(){
	hide=!hide;
	drawChecker();
	event.preventDefault();
}

function changeGscale(input){
	grayScale = input;
	drawChecker();
}

console.log("Loaded: inputManager.js");