class LaplaceEqSolver{
constructor(width, height){
    //Mandel Map Variables
    this.width = width;
    this.height = height;
    this.area = this.width * this.height;
    this.potentialMap = new Array(this.width); // potential value [0,1]
    this.boundaryMap = new Array(this.width); // 0: not boundary, 1: part of boundary
    for(let x = 0; x < this.width; x++){
        this.potentialMap[x] = new Array(this.height);
        this.boundaryMap[x]  = new Array(this.height);
    }

    this.resetField();

    // GPU variables
    this.gpu = new GPU();
    console.log("GPU supported:"+GPU.isGPUSupported);
    this.solveLaplaceEquation = this.gpu.createKernel(function(potentialMapO, boundaryMapO){
        // Prepare Variables
        let potentialMap = potentialMapO[this.thread.x][this.thread.y];
        let boundaryMap = potentialMapO[this.thread.x][this.thread.y];
        let newPotentail;
        for(let counter = 0; counter < 100; counter++){
            if(this.thread.x > 1 && this.thread.x < 520 - 1 && this.thread.y > 1 && this.thread.y < 520 - 1){
                if(boundaryMap[this.thread.x][this.thread.y]){
                    newpotentialMap =  potentialMap[this.thread.x][this.thread.y];
                }else{
                    newpotentialMap = (potentialMap[this.thread.x + 1][this.thread.y    ] + 
                                    potentialMap[this.thread.x - 1][this.thread.y    ] + 
                                    potentialMap[this.thread.x    ][this.thread.y + 1] + 
                                    potentialMap[this.thread.x    ][this.thread.y - 1])/4;
                    potentialMap = newPotential;
                }
            }else{
                potentialMap =  0.5;
            }
        }
        return potentialMap;
    }).setOutput([this.width, this.height]);

    this.getMandelDeathMap = this.gpu.createKernel(function(xMap, yMap){
        // Prepare Variables
        let mandelDeathMap = -1;
        let xVal = xMap[this.thread.x];
        let yVal = yMap[this.thread.x];
        for(let counter = 0; counter < 5000; counter++){
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
resetField(){
    for(let x = 0; x < this.width; x++){
        for(let y = 0; y < this.height; y++){
            this.potentialMap[x][y] = 0.5;
            this.boundaryMap[x][y] = 0;
        }
    }
}
setBoundary(x, y , value){
    this.potentialMap[x][y] = value;
    this.boundaryMap[x][y] = 1;
}
updatePotentialField() {
    return this.solveLaplaceEquation(this.potentialMap, this.boundaryMap);
}
xy2i(x, y){
    return x + y * this.width;
}
}
console.log("Loaded: MandelPlotter.js");