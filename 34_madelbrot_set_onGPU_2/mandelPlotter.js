class MandelPlotter{
constructor(width, height, canvasIn, glIn){
    //Mandel Map Variables
    this.width = width;
    this.height = height;

    console.log(this.width);
    console.log(this.height);

    // GPU variables
    this.gpu = new GPU({
        mode:'gpu',
        canvas: canvasIn,
        context: glIn
    });

    this.initializeMandelbrotMap = this.gpu.createKernel(function(xMin, yMin, xMax, yMax){
        const thx = this.thread.x;
        const thy = this.thread.y;
        const xVal = xMin + (xMax - xMin) * thx / this.constants.width;
        const yVal = yMax + (yMin - yMax) * thy / this.constants.height;
        return [xVal, yVal, xVal, yVal];
    }).setOutput([this.width, this.height])
    .setConstants({width:this.width, height:this.height})
    .setPipeline(true)
    .setImmutable(true);

    this.updateMandelbrotMap = this.gpu.createKernel(function(mandelbrotMap, countStart, maxIteration){
        const thx = this.thread.x;
        const thy = this.thread.y;
        // Prepare Variables
        const val = mandelbrotMap[thx][thy];
        if(val[0] >= 2){
            //The pixel is already dead...
            return val;
        }else{
            const xOri = val[0];
            const yOri = val[1];
            let   xVal = val[2];
            let   yVal = val[3];
            for(let counter = countStart; counter < countStart + maxIteration; counter++){
                const newx = xVal * xVal - yVal * yVal + xOri;
                const newy = xVal * yVal * 2 + yOri;
                xVal = newx;
                yVal = newy;
                if(newx * newx + newy * newy > 4){
                    return [counter + 2, 0, 0, 0];
                }
            }
            return [xOri, yOri, xVal, yVal];
        }
    }).setOutput([this.width, this.height])
    .setPipeline(true)
    .setImmutable(true)
    .setLoopMaxIterations(10000);

    this.updateCanvas = this.gpu.createKernel(function(mandelbrotMap){
        const thx = this.thread.x;
        const thy = this.thread.y;
        const val = mandelbrotMap[thx][thy];
        if(val[0] >= 2){
            const pixelValue = 0.75 * (1 - Math.pow(0.99, val[0]));
            this.color(pixelValue, pixelValue, pixelValue);
        }else{
            this.color(1,1,1);
        }
    })
    .setOutput([this.width, this.height])
    .setGraphical(true);
}
}
console.log("Loaded: MandelPlotter.js");