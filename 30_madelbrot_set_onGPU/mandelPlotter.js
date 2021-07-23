class MandelPlotter{
constructor(width, height){
    //Mandel Map Variables
    this.width = width;
    this.height = height;
    this.area = this.width * this.height;
    this.mandelXmap = new Array(this.area);
    this.mandelYmap = new Array(this.area);

    // GPU variables
    this.gpu = new GPU();
    console.log("GPU supported:"+GPU.isGPUSupported);
    this.getMandelDeathMap = this.gpu.createKernel(function(xMap, yMap){
        // Prepare Variables
        let mandelDeathMap = -1;
        let xVal = xMap[this.thread.x];
        let yVal = yMap[this.thread.x];
        for(let counter = 0; counter < 2000; counter++){
            const newx = xVal * xVal - yVal * yVal + xMap[this.thread.x];
            const newy = xVal * yVal * 2 + yMap[this.thread.x];
            xVal = newx;
            yVal = newy;
            if(newx * newx + newy * newy > 4 && mandelDeathMap == -1){
                mandelDeathMap = counter;
                //return counter;
            }
        }
        return mandelDeathMap;
    }).setOutput([this.area]);
}
resetXYMap(xMin, yMin, xMax, yMax){
    for(let x = 0; x < this.width; x++){
        for(let y = 0; y < this.height; y++){
            const i = this.xy2i(x, y);
            this.mandelXmap[i] = xMin + (xMax - xMin) * x / this.width;
            this.mandelYmap[i] = yMin + (yMax - yMin) * y / this.height;
        }
    }
}
updateMandelBrotSet(xMin, yMin, xMax, yMax){
    this.resetXYMap(xMin, yMin, xMax, yMax);
    return this.getMandelDeathMap(this.mandelXmap, this.mandelYmap);
}
xy2i(x, y){
    return x + y * this.width;
}
}
console.log("Loaded: MandelPlotter.js");