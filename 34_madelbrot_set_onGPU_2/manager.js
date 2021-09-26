class Manager{
constructor(canvas){
    //Initialize Canvas and its size
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', { premultipliedAlpha: false });
    this.resizeCanvas();
    //Add Event listeners
    this.touchStart = false;
    this.touchXY = [0, 0];
    this.canvas.addEventListener('mousedown',  (event) => {this.touch(event);},     false);
    this.canvas.addEventListener('touchstart', (event) => {this.touch(event);},     false);
    this.canvas.addEventListener('mousemove',  (event) => {this.moveMouse(event);}, false);
    this.canvas.addEventListener('touchmove',  (event) => {this.moveMouse(event);}, false);
    this.canvas.addEventListener('mouseup'  ,  (event) => {this.release(event);},   false);
    this.canvas.addEventListener('touchend'  , (event) => {this.release(event);},   false);
    this.canvas.addEventListener('mousewheel', (event) => {this.mouseWheel(event);},false);
    //Initialize ROI
    this.xCorner = -2;
    this.yCorner = -2;
    this.sideLength = 4;
    this.iterationCount = 100;
    //Initialize MandelPlotter
    this.counter = 0;
    this.mandelPlotter = new MandelPlotter(this.canvas.width, this.canvas.height, this.canvas, this.gl);
    //Reset...or start
    this.initializeMandelbrotMap();
}
initializeMandelbrotMap(){
    text1.textContent = "Number of iterations: "+this.iterationCount;
    text2.textContent = "Length of side: "+this.sideLength.toExponential(3);
    this.counter++;
    //console.log(this.counter);
    this.MandelbrotMap = this.mandelPlotter.initializeMandelbrotMap(this.xCorner, this.yCorner, this.xCorner + this.sideLength, this.yCorner + this.sideLength);
    this.MandelbrotMap = this.mandelPlotter.updateMandelbrotMap(this.MandelbrotMap, 0, this.iterationCount);
    this.mandelPlotter.updateCanvas(this.MandelbrotMap);
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
touch(event){
    if(this.touchStart) return;
    this.touchStart = true;
    this.touchXY = this.getXY(event);
    this.lastMoveXY = this.getXYpix(event);
    this.lastMove = Date.now();
}
moveMouse(event){
    if(this.touchStart == false) return;
    if(Date.now() - this.lastMove < 15) return;
    this.lastMove = Date.now();
    const [xpix, ypix] = this.getXYpix(event);
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
mouseWheel(event){
    if(Date.now() - this.lastMove < 15) return;
    this.lastMove = Date.now();
    const scale = (1 - event.wheelDelta/1200);
    const [x, y] = this.getXY(event);
    this.sideLength *= scale;
    this.xCorner += (x - this.xCorner) * (1 - scale);
    this.yCorner += (y - this.yCorner) * (1 - scale);
    this.sideLength = Math.fround(this.sideLength);
    this.xCorner= Math.fround(this.xCorner);
    this.yCorner= Math.fround(this.yCorner);
    this.initializeMandelbrotMap();
}
getXYpix(event){
    event.preventDefault();
    const rect = event.target.getBoundingClientRect();
    let x = event.pageX-rect.left-document.scrollingElement.scrollLeft;
    let y = event.pageY-rect.top-document.scrollingElement.scrollTop;
    x *= this.pixelRatio;
    y *= this.pixelRatio;
    return [x,y];
}
getXY(event){
    event.preventDefault();
    const rect = event.target.getBoundingClientRect();
    let xPix = event.pageX - rect.left - document.scrollingElement.scrollLeft;
    let yPix = event.pageY - rect.top  - document.scrollingElement.scrollTop;
    xPix *= this.pixelRatio;
    yPix *= this.pixelRatio;
    const x = this.xCorner + (xPix / this.canvas.width  ) * this.sideLength;
    const y = this.yCorner + (yPix / this.canvas.height ) * this.sideLength;
    return [x, y];
}
}
console.log("Loaded: canvas.js");