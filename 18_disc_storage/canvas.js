class Canvas{
    constructor(canvas=document.createElement("canvas")){
        this.canvas = canvas;
        this.ct = canvas.getContext("2d");
        this.pixelRatio = window.devicePixelRatio;
        this.imgdata;
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
    line(xi,yi,xf,yf){
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
        parent.appendChild(this.canvas);
    }
    //imageData
    createImageData(w=this.canvas.width,h=this.canvas.height){
        this.imgdata = this.ct.createImageData(w,h);
    }
}
class PlotCanvas extends Canvas{
    constructor(canvas=document.createElement("canvas")){
        super(canvas);
        this.reset(100,100);
    }
    reset(width,height){
        if(this.canvas.width!=width+2||this.canvas.height!=height+2){
            this.resize(width,height);
            this.resizeStyle(width,height,true);
            this.createImageData(width,height);
            for(let i=0;i<width*height;i++){
                this.imgdata.data[i*4+3] = 256;
            }
        }
        this.clear();
    }
    resize(width,height){
        super.resize(width+2,height+2);
    }
    resizeStyle(width,height,divideByPR){
        super.resizeStyle(width+2,height+2,divideByPR);
    }
    clear(){
        this.fillAll("white");
        this.fillRect("black",1,1,this.canvas.width-2,this.canvas.height-2);
    }
    update(data,width,height="fromWidth",autoScale=true){
        const scale = autoScale?256/Math.max(1,getMax(data)):1;
        if(height=="fromWidth"){
            height = data.length/width;
        }
        this.reset(width,height);
        for(let i=0;i<data.length;i++){
            const brightness = data[i]*scale;
            this.imgdata.data[i*4+0]=brightness;
            this.imgdata.data[i*4+1]=brightness;
            this.imgdata.data[i*4+2]=brightness;
        }
        this.ct.putImageData(this.imgdata,1,1);
    }
}

class GraphCanvas extends Canvas{
    constructor(canvas=document.createElement("canvas")){
        super(canvas);
        this.clear();
    }
    reset(width,height){
        if(this.canvas.width!=width+2||this.canvas.height!=height+2){
            this.resize(width,height);
            this.resizeStyle(width,height,true);
        }
        this.clear();
    }
    resize(width,height){
        super.resize(width+2,height+2);
    }
    resizeStyle(width,height,divideByPR){
        super.resizeStyle(width+2,height+2,divideByPR);
    }
    clear(){
        this.fillAll("black");    
    }
    update(data,scale="autoScale",width="dataLength",height=100){
        scale = (scale=="autoScale")?height/Math.max(1,getMax(data)):scale;
        if(width=="dataLength"){
            width = data.length;
        }
        if(Array.isArray(data)){
            this.reset(width,height);
            for(let i=0;i<data.length;i++){
                this.fillRect("white",i+1,1,1,this.canvas.height-data[i]*scale-2);
            }
        }else{
            alert("Data input for GraphCanvas needs to be 1-D Array");
        }
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
            this.line(200,i*scale*6+offset,300,i*scale*6+offset);
        }
    }
}

console.log("Loaded: canvas.js");