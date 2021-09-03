class Canvas{
constructor(canvas){
    //Initialize Canvas and its size
    this.canvas = canvas;
    this.ct = canvas.getContext("2d");
    this.resizeCanvas();

    //PotentialField
    this.potentialMap = new Array(this.canvas.width); // potential value [0,1]
    for(let x = 0; x < this.canvas.width; x++){
        this.potentialMap[x] = new Array(this.canvas.height);
    }
    for(let x = 0; x < this.canvas.width; x++){
        for(let y = 0; y < this.canvas.height; y++){
            this.potentialMap[x][y] = 0.5;
        }
    }

    //Initialize MandelPlotter
    this.mandelPlotter = new LaplaceEqSolver(this.canvas.width, this.canvas.height);

    //Reset...or start
    this.resetCanvas();
    this.setBoundary();
    this.solveLEQ();
    this.updateCanvas();
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
resetCanvas(){
    this.ct.fillStyle = "black";
    this.ct.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.imageData = this.ct.getImageData(0, 0, this.canvas.width, this.canvas.height);
}
setBoundary(){
    const xCen = this.canvas.width / 2;
    const yCen = this.canvas.height/ 2;
    for(let x = 0; x < this.canvas.width; x++){
        for(let y = 0; y < this.canvas.height; y++){
            if( (x - xCen) * (x - xCen) + (y - yCen) * (y - yCen) > xCen * xCen){
                this.mandelPlotter.setBoundary(x, y, 1);
                //this.potentialMap[x][y] = 1;
            }else if( (x - xCen) == 0 && (y - yCen) == 0){
                this.mandelPlotter.setBoundary(x, y, 0);
                //this.potentialMap[x][y] = 0;
            }
        }
    }
}
solveLEQ(){
    this.mandelPlotter.updatePotentialField();
}
updateCanvas(){
    for(let x = 0; x < this.canvas.width; x++){
        for(let y = 0; y < this.canvas.height; y++){
            this.setPix([x, y], this.interpolate(this.potentialMap[x][y]));
        }
    }
    this.ct.putImageData(this.imageData, 0, 0);
}
updateMandelBrotSet(xMin, yMin, xMax, yMax){
    //get mandelbrot set
    const startTime = new Date();
    this.deathMap = this.mandelPlotter.updateMandelBrotSet(xMin, yMin, xMax, yMax);
    console.log(new Date() - startTime + "ms");
    this.updateCanvas();
}
setPix(index, value){
    if(index.length == 2){
        index = this.xy2i(index);
    }
    //Set the pixel based on type
    this.imageData.data[4 * index + 0] = value;
    this.imageData.data[4 * index + 1] = value;
    this.imageData.data[4 * index + 2] = value;
}
interpolate(value){
    return value * 255;
}
i2xy(i){
    return [i % this.canvas.width, Math.floor(i / this.canvas.width)];
}
xy2i([x, y]){
    return x + y * this.canvas.width;
}
}
console.log("Loaded: canvas.js");