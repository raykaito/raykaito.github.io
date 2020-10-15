//Create an overlayed canvas which covers the window
const fullScreenCanvas = document.createElement("canvas");

fullScreenStyle = {position:"fixed", display:"block", width:"100%", height:"100%", top:"0", left:"0", right:"0", bottom:"0", backgroundColor:"rgba(0,0,0,0.5)", zIndex:"2", cursor:"pointer"};


Object.assign(fullScreenCanvas.style, fullScreenStyle);
document.body.appendChild(fullScreenCanvas);

/*
//Debugger
const debugSpace = document.getElementById("debugger");
//Debugging tool for ios
logCanvas = new LogCanvas();
//logCanvas.appendSelf(debugSpace);
function log(input){
    logCanvas.newLine(input);
}

//Prepare streamer
const streamer = new VideoStream(document.getElementById("cameraMedia"));

//Usefull plots and graphs
const plotA = new PlotCanvas();
const plotB = new PlotCanvas();
const plotC = new PlotCanvas();
const graphA = new GraphCanvas();
const graphB = new GraphCanvas();
const graphC = new GraphCanvas();
graphA.appendSelf(debugSpace);
plotA.appendSelf(debugSpace);
if(false){
    plotB.appendSelf();
    plotC.appendSelf();
    graphB.appendSelf();
    graphC.appendSelf();
}
*/
console.log("Loaded: activator.js");