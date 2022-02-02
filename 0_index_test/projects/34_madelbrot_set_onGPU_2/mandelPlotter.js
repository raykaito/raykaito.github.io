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

    this.plotMandelbrotSet = this.gpu.createKernel(function(xMin, yMin, xMax, yMax, maxIteration){
        //Initialize
        const thx = this.thread.x;
        const thy = this.thread.y;
        const xOri = xMin + (xMax - xMin) * thx / this.constants.width;
        const yOri = yMax + (yMin - yMax) * thy / this.constants.height;
        const xVal = xOri;
        const yVal = yOri;

        //Calculate
        for(let counter = 0; counter < maxIteration; counter++){
            const newx = xVal * xVal - yVal * yVal + xOri;
            const newy = xVal * yVal * 2 + yOri;
            xVal = newx;
            yVal = newy;
            if(newx * newx + newy * newy > 4){
                const pixelValue = 0.75 * (1 - Math.pow(0.99, counter));
                this.color(pixelValue, pixelValue, pixelValue);
                return 0;
            }
        }
        this.color(1,1,1);
    })
    .setLoopMaxIterations(10000)
    .setOutput([this.width, this.height])
    .setConstants({width:this.width, height:this.height})
    .setGraphical(true);
}
}
console.log("Loaded: MandelPlotter.js");