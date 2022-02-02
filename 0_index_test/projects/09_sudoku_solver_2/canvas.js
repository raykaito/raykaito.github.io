var pixelRatio;
var ct, width, height;

function initCanvas(){
    ct = canvas.getContext("2d");
    resize(1);
}

function resize(whRatio){
    rect = canvas.getBoundingClientRect();
    pixelRatio = window.devicePixelRatio;
    if(whRatio<1){
        if(Math.floor(window.innerWidth)>800)   canvas.width = 780;
        else                                    canvas.width = Math.floor(window.innerWidth-20);

        canvas.height = canvas.width*whRatio;
    }else{
        if(Math.floor(window.innerWidth)>800)   canvas.height = 780;
        else                                    canvas.height = Math.floor(window.innerWidth-20);

        canvas.width = canvas.height/whRatio;
    }
    
    canvas.style.width  = canvas.width +"px";
    canvas.style.height = canvas.height+"px";

    canvas.width *= pixelRatio;
    canvas.height*= pixelRatio;

    width  = canvas.width;
    height = canvas.height;
}

function line(xi,yi,xii,yii,w){
    ct.lineWidth = w;
    ct.beginPath();
    ct.moveTo(xi ,yi );
    ct.lineTo(xii,yii);
    ct.stroke();
}

function circle(x,y,rad){
    ct.beginPath();
    ct.arc(x,y,rad,0,2*Math.PI);
    ct.stroke();
}

console.log("Loaded: canvas.js");