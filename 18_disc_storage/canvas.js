class Canvas{
    constructor(canvas=document.createElement("canvas")){
        this.canvas = canvas;
        this.ct = canvas.getContext("2d");
        this.pixelRatio = window.devicePixelRatio;
    }
    //Transformation
    translate(x,y){
        this.ct.translate(x,y);
    }
    rotateDeg(deg){
        if(deg==0) return;
        this.rotate(deg*Math.PI/180);
    }
    rotateRad(rad){
        if(rad==0) return; 
        this.ct.rotate(rad);
    }
    //Style of canvas element on HTML
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
    resizeStyle(width,height,divideByPR=false){
        if(divideByPR){
            this.canvas.style.width  = Math.floor(width/this.pixelRatio) +"px";
            this.canvas.style.height = Math.floor(height/this.pixelRatio)+"px";
        }else{
            this.canvas.style.width  = Math.floor(width) +"px";
            this.canvas.style.height = Math.floor(height)+"px";
        }
    }
    hideCanvas(){
        this.canvas.style.display = "none";
    }
    showCanvas(){
        this.canvas.style.display = "inline";
    }
    //DrawStrokeFill things on Canvas
    text(string="empty string", x=0, y=0, color="black", font="10px 'Times'", ta="left", tbl="top"){
        this.ct.fillStyle = color;
        this.ct.font = font;
        this.ct.textAlign = ta;
        this.ct.textBaseline = tbl;
        this.ct.fillText(string,x,y);
    }
    strokeLine(xi,yi,xf,yf){
        this.ct.beginPath();
        this.ct.moveTo(xi,yi);
        this.ct.lineTo(xf,yf);
        this.ct.closePath();
        this.ct.stroke();
    }
    fillAll(color="black",dx=0,dy=0,width=this.canvas.width,height=this.canvas.height){
        this.ct.fillStyle = color;
        this.ct.fillRect(dx,dy,width,height);
    }
    drawRect(color="black",dx=0,dy=0,width=this.canvas.width,height=this.canvas.height){
        this.ct.strokeStyle = color;
        this.ct.beginPath();
        this.ct.rect(dx,dy,width,height);
        this.ct.closePath();
        this.ct.stroke();
    }
    fillRect(color="black",dx=0,dy=0,width=this.canvas.width,height=this.canvas.height){
        this.ct.fillStyle = color;
        this.ct.fillRect(dx,dy,width,height);
    }
    drawImage(img,sx,sy,sw,sh,dx=0,dy=0,dw=this.canvas.width,dh=this.canvas.height){
        this.ct.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);
    }
    appendSelf(parent=body){
        console.log("HERE");
        parent.appendChild(this.canvas);
    }
}

class GraphCanvas extends Canvas{
    constructor(canvas=document.createElement("canvas"),width=100,height=256){
        super(canvas);
        this.clear();
    }
    resize(width,height){
        super.resize(width+2,height+2);
    }
    resizeStyle(width,height){
        super.resizeStyle(width+2,height+2);
    }
    clear(){
        this.fillAll("black");    
    }
    update(data){
        if(Array.isArray(data)){
            this.clear();
            for(let i=0;i<data.length;i++){
                this.fillRect("white",i+1,1,1,this.canvas.height-data[i]-2);
            }
        }else{
            alert("Data input for GraphCanvas needs to be 1-D Array");
        }
    }
    show(){
        this.appendSelf();
    }
}

class LogCanvas extends Canvas{
    constructor(canvas=document.createElement("canvas"),lineSize=16){
        super(canvas);
        this.lineSize = lineSize;
        this.font = ""+lineSize+"px 'Times'";
        this.appendSelf(debugSpace);
        this.flexResize(0.95,0.2);
        this.fillAll("white");
        this.newLine("Logger Started...");
    }
    newLine(string="Empty"){
        if(string.isArray){
            let newString = "";
            string.forEach((element)=>{
                newString = newString+","+element;
            });
            string = newString;
        }
        this.text(string,0,0,"black",this.font);
        this.ct.drawImage(this.canvas,0,this.lineSize);
        this.fillAll("white",0,0,this.canvas.width,this.lineSize);
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
            this.strokeLine(200,i*scale*6+offset,300,i*scale*6+offset);
        }
    }
}

console.log("Loaded: canvas.js");