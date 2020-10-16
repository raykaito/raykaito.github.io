//Create an overlayed canvas which covers the window
const fullScreenCanvas = new Canvas(document.createElement("canvas"));
const videoElement = document.createElement("video");

fullScreenStyle = {position:"fixed", display:"block", width:"100%", height:"100%", top:"0", left:"0", right:"0", bottom:"0", zIndex:"2", cursor:"pointer"};
videoElementStyle = {position:"fixed", display:"none", width:"100px", height:"100px", top:"0", left:"0", zIndex:"1", cursor:"pointer"};
videoElementProperties = {controls:true, autoplay:true, playsinline:true };
Object.assign(fullScreenCanvas.canvas.style, fullScreenStyle);
Object.assign(videoElement.style, videoElementStyle);
Object.assign(videoElement, videoElementProperties);
document.body.appendChild(fullScreenCanvas.canvas);
document.body.appendChild(videoElement);

//Debugging tool for ios
const logCanvas = new LogCanvas();
//logCanvas.appendSelf(document.body);
function log(input){
    logCanvas.newLine(input);
}

//Prepare streamer
const streamer = new VideoStream(videoElement,fullScreenCanvas);
fullScreenCanvas.onclick = (()=>streamer.stopScan());

//Usefull plots and graphs
const plotA = new PlotCanvas();
const plotB = new PlotCanvas();
const plotC = new PlotCanvas();
const graphA = new GraphCanvas();
const graphB = new GraphCanvas();
const graphC = new GraphCanvas();
if(false){
    graphA.appendSelf(document.body);
    graphB.appendSelf(document.body);
    graphC.appendSelf(document.body);
    plotA.appendSelf(document.body);
    plotB.appendSelf(document.body);
    plotC.appendSelf(document.body);
}
streamer.switchStreamerOnOff();

console.log("Loaded: runner.js");