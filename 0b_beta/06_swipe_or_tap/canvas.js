var pixelRatio;
var ct;

var cellLeg, sqLargeLeg, sqSmallLeg, sqCenter;

function initCanvas(){
	cellLeg = 36;
	sqLargeLeg = 28;
	sqSmallLeg = 4;
	sqCenter = 16;

    ct = canvas.getContext("2d");

    pixelRatio = window.devicePixelRatio;
    canvas.width  = cellLeg*getCol();
    canvas.height = cellLeg*getRow();
    canvas.style.width  = canvas.width +"px";
    canvas.style.height = canvas.height+"px";

    canvas.width *= pixelRatio;
    canvas.height*= pixelRatio;
    cellLeg    *= pixelRatio;
    sqLargeLeg *= pixelRatio;
    sqSmallLeg *= pixelRatio;
    sqCenter   *= pixelRatio;
    width  = canvas.width;
    height = canvas.height;

    firstTime = performance.now();
    lastTime = firstTime;
	applicationTime = 0;

    console.log("    - Canvas size Updated: (" +width+ ", " +height+ ")");
    console.log("    - Canvas size Updated: (" +pixelRatio+ ")");
    console.log("    - Canvas initialized.");
}

function drawBoard(){
    ct.fillStyle = "black";
    ct.fillRect(0, 0, canvas.width, canvas.height);
    draw(ct);
}

console.log("Loaded: canvas.js");