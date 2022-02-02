//Open Full Screen
function openFullScreen(){
	const documentElem = document.documentElement;
	if (documentElem.requestFullscreen) {
		documentElem.requestFullscreen();
	} else if (documentElem.mozRequestFullScreen) { /* Firefox */
		documentElem.mozRequestFullScreen();
	} else if (documentElem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
		documentElem.webkitRequestFullscreen();
	} else if (documentElem.msRequestFullscreen) { /* IE/Edge */
		documentElem.msRequestFullscreen();
	}
}

//Create an overlayed canvas which covers the window
const fullScreenCanvas = new Canvas(document.createElement("canvas"));
const videoElement = document.createElement("video");

fullScreenStyle = {position:"fixed", display:"block", width:"100%", height:"100%", top:"0", left:"0", right:"0", bottom:"0", zIndex:"2048", cursor:"pointer"};
videoElementStyle = {position:"fixed", display:"none", width:"100px", height:"100px", top:"0", left:"0", zIndex:"2", cursor:"pointer"};
videoElementProperties = {controls:true, autoplay:true, playsinline:true };
Object.assign(fullScreenCanvas.canvas.style, fullScreenStyle);
Object.assign(videoElement.style, videoElementStyle);
Object.assign(videoElement, videoElementProperties);
document.body.appendChild(fullScreenCanvas.canvas);
document.body.appendChild(videoElement);

function turnOn(){
	streamer.startScan();
	fullScreenCanvas.canvas.style.display = "block";
}
function turnOff(){
	streamer.stopScan();
	fullScreenCanvas.canvas.style.display = "none";
	alert("Exit Touchless Control Mode.");
}

//Prepare streamer
const streamer = new VideoStream(videoElement,fullScreenCanvas);
fullScreenCanvas.canvas.onclick = (turnOff);

streamer.switchStreamerOnOff();

console.log("Loaded: runner.js");