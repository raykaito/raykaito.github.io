class Manager{
constructor(canvas, text1, text2){
    //Initialize Canvas and its size
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', { premultipliedAlpha: false });
    this.resizeCanvas();

    //Initialize text elements
    this.text1 = text1;
    this.text2 = text2;

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
    this.windowLength = 4;
    this.iterationCount = 100;

    //Initialize MandelPlotter
    this.mandelPlotter = new MandelPlotter(this.canvas.width, this.canvas.height, this.canvas, this.gl);

    //plot Mandelbrot set
    this.plotMandelbrotSet();
}
plotMandelbrotSet(){
    this.text1.textContent = "Number of iterations: "+this.iterationCount;
    this.text2.textContent = "Length of side: "+this.windowLength.toExponential(3);
    this.mandelPlotter.plotMandelbrotSet(this.xCorner, this.yCorner, this.xCorner + this.windowLength, this.yCorner + this.windowLength, this.iterationCount);
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

    //Pan
    if(touchCount == 1){
        if(this.panStarted == false){
            //Pan Started
            this.panStarted = true;
            this.panXY = this.getXYtouch(event, 0);
        }else{
            const newPanXY = this.getXYtouch(event, 0);
            this.xCorner -= (newPanXY[0] - this.panXY[0]) * this.windowLength / this.canvas.width;
            this.yCorner -= (newPanXY[1] - this.panXY[1]) * this.windowLength / this.canvas.height;
            this.panXY[0] = newPanXY[0];
            this.panXY[1] = newPanXY[1];

            //update Canvas
            this.plotMandelbrotSet();
        }
    }else{
        this.panStarted = false;
    }

    //Pinch
    if(touchCount == 2){
        if(this.pinchStarted == false){
            //Pinch Started
            this.pinchStarted = true;
            this.pinchXY0 = this.getXYtouch(event, 0);
            this.pinchXY1 = this.getXYtouch(event, 1);
        }else{
            //Find new touches
            const newPinchXY0 = this.getXYtouch(event, 0);
            const newPinchXY1 = this.getXYtouch(event, 1);

            //Find last and new center point
            const lastCenterX = (this.pinchXY0[0] + this.pinchXY1[0]) / 2;
            const lastCenterY = (this.pinchXY0[1] + this.pinchXY1[1]) / 2;
            const newCenterX = (newPinchXY0[0] + newPinchXY1[0]) / 2;
            const newCenterY = (newPinchXY0[1] + newPinchXY1[1]) / 2;

            //Shift x and y corner based on the change in the centerpoints
            this.xCorner -= (newCenterX - lastCenterX) * this.windowLength / this.canvas.width;
            this.yCorner -= (newCenterY - lastCenterY) * this.windowLength / this.canvas.height;

            //Find last and new distance between points
            const lastdx = Math.abs(this.pinchXY0[0] - this.pinchXY1[0]);
            const lastdy = Math.abs(this.pinchXY0[1] - this.pinchXY1[1]);
            const lastdd = lastdx * lastdx + lastdy * lastdy;
            const newdx = Math.abs(newPinchXY0[0] - newPinchXY1[0]);
            const newdy = Math.abs(newPinchXY0[1] - newPinchXY1[1]);
            const newdd = newdx * newdx + newdy * newdy;

            //Modify the window length based on the scale
            const scale = Math.sqrt(lastdd/newdd);
            const [x, y] = this.modXYcoordinate([newCenterX, newCenterY]);
            this.windowLength *= scale;
            this.xCorner += (x - this.xCorner) * (1 - scale);
            this.yCorner += (y - this.yCorner) * (1 - scale);

            //Update lastPinchXY
            this.pinchXY0[0] = newPinchXY0[0];
            this.pinchXY0[1] = newPinchXY0[1];
            this.pinchXY1[0] = newPinchXY1[0];
            this.pinchXY1[1] = newPinchXY1[1];

            //plot the Mandelbrot set
            this.plotMandelbrotSet();
        }
    }else{
        this.pinchStarted = false;
    }
}
mouseWheel(event){
    event.preventDefault();
    if(Date.now() - this.lastMove < 16) return;
    this.lastMove = Date.now();

    //Modify the window length based on the scale
    const scale = (1 - event.wheelDelta/1200);
    const [x, y] = this.modXYcoordinate(this.getXYmouse(event));
    this.windowLength *= scale;
    this.xCorner += (x - this.xCorner) * (1 - scale);
    this.yCorner += (y - this.yCorner) * (1 - scale);
    this.plotMandelbrotSet();
}
getXYtouch(event, index){
    //Return the xy coordinate from touch event
    if(index==-1){
        return [this.canvas.width/2,this.canvas.height/2];
    }
    const rect = event.target.getBoundingClientRect();
    let x = event.touches[index].pageX-rect.left-document.scrollingElement.scrollLeft;
    let y = event.touches[index].pageY-rect.top -document.scrollingElement.scrollTop;
    x *= this.pixelRatio;
    y *= this.pixelRatio;
    return [Math.floor(x),Math.floor(y)];
}
getXYmouse(event){
    //Return the xy coordinate from mouse event
    const rect = event.target.getBoundingClientRect();
    let x = event.pageX-rect.left-document.scrollingElement.scrollLeft;
    let y = event.pageY-rect.top-document.scrollingElement.scrollTop;
    x *= this.pixelRatio;
    y *= this.pixelRatio;
    return [x,y];
}
modXYcoordinate([x,y]){
    //Convert pixel coordinate to actual coordinate
    const xMod = this.xCorner + (x / this.canvas.width  ) * this.windowLength;
    const yMod = this.yCorner + (y / this.canvas.height ) * this.windowLength;
    return [xMod,yMod];
}
}
console.log("Loaded: canvas.js");