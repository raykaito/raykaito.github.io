class Canvas{
    constructor(canvas){
        //Initialize Canvas and its size
        this.canvas = canvas;
        this.ct = canvas.getContext("2d");
        this.resize();
        //ColorMapInfo
        this.randColorRGB = new Array();
        this.prepareRandColor();
        //ImageData
        this.ct.fillStyle = "white";
        this.ct.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.imageData = this.ct.getImageData(0,0,this.canvas.width,this.canvas.height);
    }
    prepareRandColor(){
        const colorList = ["aqua","aquamarine","beige","cyan","cornsilk","lawngreen","lime","palegreen","springgreen","yellow","pink","lightpink"];
        for(let colorListIn = 0; colorListIn<colorList.length; colorListIn++){
            this.ct.fillStyle = colorList[colorListIn];
            this.ct.fillRect(0,0,1,1);
            this.imageData = this.ct.getImageData(0,0,1,1);
            this.randColorRGB[colorListIn] = new Uint8Array(3);
            this.randColorRGB[colorListIn][0] = this.imageData.data[0];
            this.randColorRGB[colorListIn][1] = this.imageData.data[1];
            this.randColorRGB[colorListIn][2] = this.imageData.data[2];
        }
    }
    //Canvas Functions
    resize(whRatio = 1){
        this.canvas.width = Math.floor(window.innerWidth)-20;
        if(Math.floor(window.innerWidth)>540)   this.canvas.width = 520;
        if(Math.floor(window.innerWidth)<320)   this.canvas.width = 320;
        //this.canvas.width = 20;
        this.pixelRatio = window.devicePixelRatio;
        //this.canvas.width = 8000/this.pixelRatio;
        this.canvas.style.width  = this.canvas.width + "px";
        this.canvas.style.height = this.canvas.width*whRatio + "px";
        this.canvas.width  = this.canvas.width;
        this.canvas.height = this.canvas.width*whRatio;
        this.canvas.width *= this.pixelRatio;
        this.canvas.height*= this.pixelRatio;
    }
    setPix(index, value,rgb=3){
        //Set the pixel based on type
        if(rgb==3){
            this.imageData.data[4*index+0] = value;
            this.imageData.data[4*index+1] = value;
            this.imageData.data[4*index+2] = value;
        }else{
            this.imageData.data[4*index+rgb] = value;
        }
    }
    setRandomColor(index,value){
        const colorIndex = value%this.randColorRGB.length;
        this.imageData.data[4*index+0] = this.randColorRGB[colorIndex][0];
        this.imageData.data[4*index+1] = this.randColorRGB[colorIndex][1];
        this.imageData.data[4*index+2] = this.randColorRGB[colorIndex][2];
    }
    text(string="empty string", x=0, y=0, color="black", font="10px 'Times'", ta="left", tbl="top"){
        this.ct.fillStyle = color;
        this.ct.font = font;
        this.ct.textAlign = ta;
        this.ct.textBaseline = tbl;
        this.ct.fillText(string,x,y);
    }
    hideCanvas(){
        this.canvas.style.display = "none";
    }
    showCanvas(){
        this.canvas.style.display = "inline";
    }
}
class LogCanvas extends Canvas{
    constructor(canvas=document.createElement("canvas"),lineSize=16){
        super(canvas);
        this.lineSize = lineSize;
        this.font = ""+lineSize+"px 'Times'";
        this.resize(0.4);
        this.ct.fillStyle = "white";
        this.ct.fillRect(0,0,this.canvas.width,this.canvas.height);
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
        this.ct.fillStyle = "white";
        this.ct.fillRect(0,0,this.canvas.width,this.lineSize);
    }
    onLine(string="Empty"){
        this.ct.fillStyle = "white";
        this.ct.fillRect(0,0,this.canvas.width,this.lineSize);
        this.text(string,0,0,"black",this.font);        
    }
}
class Manager{
constructor(canvas){
    //Initialize Canvas and its size
    l.newLine("Ver1.");
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', { premultipliedAlpha: false });
    this.resizeCanvas();
    //Add Event listeners
    /*
    this.touchStart = false;
    this.touchXY = [0, 0];
    this.canvas.addEventListener('mousedown',  (event) => {this.touch(event);},     false);
    this.canvas.addEventListener('touchstart', (event) => {this.touch(event);},     false);
    this.canvas.addEventListener('mousemove',  (event) => {this.moveMouse(event);}, false);
    this.canvas.addEventListener('touchmove',  (event) => {this.moveMouse(event);}, false);
    this.canvas.addEventListener('mouseup'  ,  (event) => {this.release(event);},   false);
    this.canvas.addEventListener('touchend'  , (event) => {this.release(event);},   false);
    this.canvas.addEventListener('mousewheel', (event) => {this.mouseWheel(event);},false);
    */
    this.panStarted = false;
    this.pinchStarted = false;
    this.canvas.addEventListener('touchstart', (event) => {this.touchHandler(event);}, false);
    this.canvas.addEventListener('touchmove',  (event) => {this.touchHandler(event);}, false);
    this.canvas.addEventListener('touchend'  , (event) => {this.touchHandler(event);}, false);
    this.canvas.addEventListener('mousewheel', (event) => {this.mouseWheel(event);},false);
    //Initialize ROI
    this.xCorner = -2;
    this.yCorner = -2;
    this.sideLength = 4;
    this.iterationCount = 100;
    //Initialize MandelPlotter
    this.mandelPlotter = new MandelPlotter(this.canvas.width, this.canvas.height, this.canvas, this.gl);
    //Reset...or start
    this.plotDone = false;
    this.initializeMandelbrotMap();
}
initializeMandelbrotMap(){
    text1.textContent = "Number of iterations: "+this.iterationCount;
    text2.textContent = "Length of side: "+this.sideLength.toExponential(3);
    this.mandelPlotter.plotMandelbrotSet(this.xCorner, this.yCorner, this.xCorner + this.sideLength, this.yCorner + this.sideLength, this.iterationCount);
    this.plotDone = true;
}
resizeCanvas(){
    this.canvas.width = Math.floor(window.innerWidth) - 20;
    if(Math.floor(window.innerWidth) > 540) this.canvas.width = 520;
    if(Math.floor(window.innerWidth) < 320) this.canvas.width = 320;
    this.pixelRatio = window.devicePixelRatio;
    this.canvas.style.width  = this.canvas.width + "px";
    this.canvas.style.height = this.canvas.width + "px";
    this.canvas.width  = this.canvas.width;
    this.canvas.height = this.canvas.width;
    this.canvas.width *= this.pixelRatio;
    this.canvas.height*= this.pixelRatio;
}
touchHandler(event){
    event.preventDefault();
    const touchCount = event.touches.length;
    if(touchCount == 1){
        if(this.panStarted == false){
            this.panStarted = true;
            this.panXY = this.getXYtouch(event, 0);
        }else{
            const newPanXY = this.getXYtouch(event, 0);
            l.newLine("Ver1."+newPanXY);
            this.xCorner -= (newPanXY[0] - this.panXY[0]) * this.sideLength / this.canvas.width;
            this.yCorner -= (newPanXY[1] - this.panXY[1]) * this.sideLength / this.canvas.height;
            console.log([newPanXY[0], this.panXY[0], this.sideLength, this.canvas.width]);
            this.panXY[0] = newPanXY[0];
            this.panXY[1] = newPanXY[1];
            this.initializeMandelbrotMap();
        }
    }else{
        this.panStarted = false;
    }
    if(touchCount == 2){
        if(this.pinchStarted = false){
            this.pinchStarted = true;
            this.pinchXY0 = this.getXYtouch(event, 0);
            this.pinchXY1 = this.getXYtouch(event, 1);
        }else{
            const newPinchXY0 = this.getXYtouch(event, 0);
            const newPinchXY1 = this.getXYtouch(event, 1);

            this.pinchXY0[0] = newPinchXY0[0];
            this.pinchXY0[1] = newPinchXY0[1];
            this.pinchXY1[0] = newPinchXY1[0];
            this.pinchXY1[1] = newPinchXY1[1];
            l.newLine("Ver1."+this.pinchXY0 + "----" + this.pinchXY1);
        }
    }else{
        this.pinchStarted = false;
    }
}
/*
touch(event){
    if(this.touchStart) return;
    this.touchStart = true;
    this.touchXY = this.getXY(event);
    this.lastMoveXY = this.getXYmouse(event);
    this.lastMove = Date.now();
}
moveMouse(event){
    if(this.touchStart == false) return;
    if(Date.now() - this.lastMove < 17) return;
    this.lastMove = Date.now();
    const [xpix, ypix] = this.getXYmouse(event);
    const scale = (1 + (ypix - this.lastMoveXY[1])/100);
    console.log((ypix - this.lastMoveXY[1]) + ", " + scale);
    this.sideLength *= scale;
    this.xCorner += (this.touchXY[0] - this.xCorner) * (1 - scale);
    this.yCorner += (this.touchXY[1] - this.yCorner) * (1 - scale);
    this.sideLength = Math.fround(this.sideLength);
    this.xCorner= Math.fround(this.xCorner);
    this.yCorner= Math.fround(this.yCorner);
    this.lastMoveXY[0] = xpix;
    this.lastMoveXY[1] = ypix;
    this.initializeMandelbrotMap();
}
release(event){    
    this.touchStart = false;
}
*/
mouseWheel(event){
    event.preventDefault();
    if(Date.now() - this.lastMove < 16) return;
    this.lastMove = Date.now();
    const scale = (1 - event.wheelDelta/1200);
    const [x, y] = this.modXY(this.getXYmouse(event));
    this.sideLength *= scale;
    this.xCorner += (x - this.xCorner) * (1 - scale);
    this.yCorner += (y - this.yCorner) * (1 - scale);
    this.sideLength = Math.fround(this.sideLength);
    this.xCorner= Math.fround(this.xCorner);
    this.yCorner= Math.fround(this.yCorner);
    this.initializeMandelbrotMap();
}
getXYtouch(event, index){
    event.preventDefault();
    const rect = event.target.getBoundingClientRect();
    let x = event.touches[index].pageX-rect.left-document.scrollingElement.scrollLeft;
    let y = event.touches[index].pageY-rect.top -document.scrollingElement.scrollTop;
    x *= this.pixelRatio;
    y *= this.pixelRatio;
    return [Math.floor(x),Math.floor(y)];
}
getXYmouse(event){
    event.preventDefault();
    const rect = event.target.getBoundingClientRect();
    let x = event.pageX-rect.left-document.scrollingElement.scrollLeft;
    let y = event.pageY-rect.top-document.scrollingElement.scrollTop;
    x *= this.pixelRatio;
    y *= this.pixelRatio;
    return [x,y];
}
modXY([x,y]){
    const xMod = this.xCorner + (x / this.canvas.width  ) * this.sideLength;
    const yMod = this.yCorner + (y / this.canvas.height ) * this.sideLength;
    return [xMod,yMod];
}
}
console.log("Loaded: canvas.js");