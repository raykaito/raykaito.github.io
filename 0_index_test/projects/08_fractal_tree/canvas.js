var pixelRatio;
var width;
var height;
var ct;

function initCanvas(){
    ct = canvas.getContext("2d");

    resize();
}

function resize(){
    rect = canvas.getBoundingClientRect();
    pixelRatio = window.devicePixelRatio;
    if(Math.floor(window.innerWidth)>600)   canvas.width = 520;
    else                                    canvas.width = Math.floor(window.innerWidth-20);
    canvas.height = canvas.width*0.8;
    
    canvas.style.width  = canvas.width +"px";
    canvas.style.height = canvas.height+"px";

    width  = canvas.width;
    height = canvas.height;

    canvas.width *= pixelRatio;
    canvas.height*= pixelRatio;
}

function line(xi,yi,xii,yii,w){
    ct.lineWidth = w*pixelRatio;
    ct.beginPath();
    ct.moveTo(xi *pixelRatio,yi *pixelRatio);
    ct.lineTo(xii*pixelRatio,yii*pixelRatio);
    ct.stroke();
}

console.log("Loaded: canvas.js");