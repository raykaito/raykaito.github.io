class Canvas{
    constructor(canvas=document.createElement("canvas")){
        this.canvas = canvas;
        this.ct = canvas.getContext("2d");
        this.pixelRatio = window.devicePixelRatio;
        this.imgdata;
    }
    resizeToFitScreen(){
        this.canvas.width = window.innerWidth*this.pixelRatio;
        this.canvas.height= window.innerHeight*this.pixelRatio;
    }
    resize(width, height){
        this.canvas.width = Math.floor(width);
        this.canvas.height= Math.floor(height);
    }
    resizeStyle(width,height,divideByPR=false){
        if(divideByPR){
            this.canvas.style.width  = Math.floor(width/this.pixelRatio) +"px";
            this.canvas.style.height = Math.floor(height/this.pixelRatio)+"px";
        }else{
            this.canvas.style.width  = Math.floor(width) +"px";
            this.canvas.style.height = Math.floor(height)+"px";
        }
    }
    drawImage(img,sx,sy,sw,sh,dx=0,dy=0,dw=this.canvas.width,dh=this.canvas.height){
        this.ct.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);
    }
    fillRect(dx=0,dy=0,width=this.canvas.width,height=this.canvas.height,color="black"){
        this.ct.fillStyle = color;
        this.ct.fillRect(dx,dy,width,height);
    }
    fillAll(color="black"){
        this.ct.fillStyle = color;
        this.ct.fillRect(0,0,this.canvas.width,this.canvas.height);
    }
    drawFrame(color){
        const frameWidth = 3*this.pixelRatio;
        this.ct.fillStyle = color;
        this.ct.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.ct.clearRect(frameWidth,frameWidth,this.canvas.width-frameWidth*2,this.canvas.height-frameWidth*2);
    }
}

console.log("Loaded: canvas.js");