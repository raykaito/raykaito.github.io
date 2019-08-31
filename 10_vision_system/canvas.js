let pixelRatio, canvasScale;
let ct, hct, hcanvas;
let ctResized, hctResized;

function initHcanvas(){
    hcanvas = document.createElement("canvas");
    hct = hcanvas.getContext("2d");
}
function resizeH(widthIn, heightIn){
    hcanvas.width = widthIn;
    hcanvas.height= heightIn;

    hctResized = true;
    if(ctResized){
        canvasScale = hcanvas.height/canvas.height;
        console.log("Canval Scale: "+canvasScale);
        imagesLoaded();
    }
}

function initCanvas(){
    ct = canvas.getContext("2d");
    resize(1);
}
function resize(widthHeightRatio){
    rect = canvas.getBoundingClientRect();
    pixelRatio = window.devicePixelRatio;

    if(Math.floor(window.innerWidth)>800){
        canvas.width  = Math.floor(800 - 40/pixelRatio);
        canvas.height = Math.floor(canvas.width*widthHeightRatio);
    }else{
        canvas.width  = Math.floor(window.innerWidth-40/pixelRatio);
        canvas.height = Math.floor(canvas.width*widthHeightRatio);
    }
    
    canvas.style.width  = canvas.width +"px";
    canvas.style.height = canvas.height+"px";

    canvas.width *= pixelRatio;
    canvas.height*= pixelRatio;

    ctResized = true;
    if(hctResized){
        canvasScale = hcanvas.height/canvas.height;
        imagesLoaded();
    }

    console.log("Canvas Resize Requested...");
    console.log("pixelRatio: "+pixelRatio);
    console.log("dimension : "+canvas.style.width + ", "+ canvas.style.height);
    console.log("dimension : "+canvas.width + "  , "+ canvas.height);
}

const line=(xi,yi,xii,yii,w)=>{
    ct.lineWidth = w;
    ct.beginPath();
    ct.moveTo(xi ,yi );
    ct.lineTo(xii,yii);
    ct.stroke();
}

const circle=(x,y,rad)=>{
    ct.beginPath();
    ct.arc(x,y,rad,0,2*Math.PI);
    ct.stroke();
}

console.log("Loaded: canvas.js");