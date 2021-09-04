class LaplaceEqSolver{
constructor(width, height){
    //Mandel Map Variables
    this.width = width;
    this.height = height;
    this.area = this.width * this.height;

    // GPU variables
    this.gpu = new GPU();
    console.log("GPU supported:"+GPU.isGPUSupported);
    this.solveLaplaceEquation = this.gpu.createKernel(function(potentialMap, pixStatusMap){
        const thx = this.thread.y;
        const thy = this.thread.x;
        if(pixStatusMap[thx][thy] != 0){
            return potentialMap[thx][thy];
        }else{
            //const offset = (0.5 - potentialMap[thx][thy]) * 0.05;
            return (potentialMap[thx + 1][thy    ] / 4 + 
                    potentialMap[thx - 1][thy    ] / 4 + 
                    potentialMap[thx    ][thy + 1] / 4 + 
                    potentialMap[thx    ][thy - 1] / 4);
        }
    }).setOutput([this.width, this.height]);
}
updatePotentialField(potentialMap, pixStatusMap) {
    return this.solveLaplaceEquation(potentialMap, pixStatusMap);
}
xy2i(x, y){
    return x + y * this.width;
}
}
console.log("Loaded: MandelPlotter.js");