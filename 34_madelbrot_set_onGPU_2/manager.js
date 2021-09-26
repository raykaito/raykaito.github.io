class Manager{
constructor(canvas){
    //Initialize Canvas and its size
    l.newLine("Ver1.");
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', { premultipliedAlpha: false });
    this.resizeCanvas();
    //Add Event listeners
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
            //update Canvas
            this.sideLength = Math.fround(this.sideLength);
            this.xCorner= Math.fround(this.xCorner);
            this.yCorner= Math.fround(this.yCorner);
            this.initializeMandelbrotMap();
        }
    }else{
        this.panStarted = false;
    }
    if(touchCount == 2){
        if(this.pinchStarted == false){
            this.pinchStarted = true;
            this.pinchXY0 = this.getXYtouch(event, 0);
            this.pinchXY1 = this.getXYtouch(event, 1);
        }else{
            //Find new touches
            const newPinchXY0 = this.getXYtouch(event, 0);
            const newPinchXY1 = this.getXYtouch(event, 1);
            //Find pan
            const lastCenterX = (this.pinchXY0[0] + this.pinchXY1[0]) / 2;
            const lastCenterY = (this.pinchXY0[1] + this.pinchXY1[1]) / 2;
            const newCenterX = (newPinchXY0[0] + newPinchXY1[0]) / 2;
            const newCenterY = (newPinchXY0[1] + newPinchXY1[1]) / 2;
            this.xCorner -= (newCenterX - lastCenterX) * this.sideLength / this.canvas.width;
            this.yCorner -= (newCenterY - lastCenterY) * this.sideLength / this.canvas.height;
            //Find scale
            const lastdx = Math.abs(this.pinchXY0[0] - this.pinchXY1[0]);
            const lastdy = Math.abs(this.pinchXY0[1] - this.pinchXY1[1]);
            const lastdd = lastdx * lastdx + lastdy * lastdy;
            const newdx = Math.abs(newPinchXY0[0] - newPinchXY1[0]);
            const newdy = Math.abs(newPinchXY0[1] - newPinchXY1[1]);
            const newdd = newdx * newdx + newdy * newdy;
            const scale = Math.sqrt(lastdd/newdd);
            const [x, y] = this.modXY([newCenterX, newCenterY]);
            this.sideLength *= scale;
            this.xCorner += (x - this.xCorner) * (1 - scale);
            this.yCorner += (y - this.yCorner) * (1 - scale);
            //Update lastPinchXY
            this.pinchXY0[0] = newPinchXY0[0];
            this.pinchXY0[1] = newPinchXY0[1];
            this.pinchXY1[0] = newPinchXY1[0];
            this.pinchXY1[1] = newPinchXY1[1];
            //Update Canvas
            this.sideLength = Math.fround(this.sideLength);
            this.xCorner= Math.fround(this.xCorner);
            this.yCorner= Math.fround(this.yCorner);
            this.initializeMandelbrotMap();
            l.newLine("Ver1."+this.pinchXY0 + "----" + this.pinchXY1);
        }
    }else{
        this.pinchStarted = false;
    }
}
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
    if(index==-1){
        return [this.canvas.width/2,this.canvas.height/2];
    }
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