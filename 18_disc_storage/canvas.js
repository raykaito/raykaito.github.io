class Canvas{
    constructor(canvas=document.createElement("canvas")){
        this.canvas = canvas;
        this.ct = canvas.getContext("2d");
        this.pixelRatio = window.devicePixelRatio;
    }
    flexResize(windowWidthRatio=0.95, HeightRatio=1, WidthMax=520, WidthMin=320){
        let width = Math.floor(window.innerWidth);
        if(Math.floor(window.innerWidth)>WidthMax)   width = WidthMax;
        if(Math.floor(window.innerWidth)<WidthMin)   width = WidthMin;
        width = Math.floor(width*windowWidthRatio);
        let height = Math.floor(width*HeightRatio);
        this.resizeStyle(width,height);
        this.resize(width*this.pixelRatio,height*this.pixelRatio);
    }
    resize(width, height){
        this.canvas.width = Math.floor(width);
        this.canvas.height= Math.floor(height);
    }
    resizeStyle(width,height){
        this.canvas.style.width  = Math.floor(width) +"px";
        this.canvas.style.height = Math.floor(height)+"px";
    }
    hideCanvas(){
        this.canvas.style.display = "none";
    }
    showCanvas(){
        this.canvas.style.display = "inline";
    }
    strokeLine(xi,yi,xf,yf){
        this.ct.beginPath();
        this.ct.moveTo(xi,yi);
        this.ct.lineTo(xf,yf);
        this.ct.closePath();
        this.ct.stroke();
    }
    fillAll(color="black"){
        this.ct.fillStyle = color;
        this.ct.fillRect(0,0,this.canvas.width,this.canvas.height);
    }
    drawImage(img,sx,sy,sw,sh,dx=0,dy=0,dw=this.canvas.width,dh=this.canvas.height){
        //console.log(img,sx,sy,sw,sh,dx,dy,dw,dh);
        this.ct.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);
    }
}

class CodeCanvas extends Canvas{
    constructor(canvas=document.createElement("canvas")){
        super(canvas);
    }
    displayCode(data = [0,1,0,0,1,1,0,0,0,1,1,1]){
        const scale = 1;
        const offset = 10.5;
        this.ct.strokeStyle = "black";
        for(let i=0;i<12;i++){
            this.ct.lineWidth = ((data[i]==1)?3:1)*scale;
            this.strokeLine(200,i*scale*4+offset,300,i*scale*4+offset);
        }
    }
}

console.log("Loaded: canvas.js");