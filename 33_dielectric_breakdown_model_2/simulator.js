class Simulator{
constructor(width, height, canvasIn, glIn, pixelRatio, cwidth, cheight){
    //Mandel Map Variables
    this.width = width;
    this.height = height;
    this.area = this.width * this.height;
    this.pixelRatio = pixelRatio;
    this.cwidth = cwidth;
    this.cheight = cheight

    // GPU variables
    this.gpu = new GPU({
        mode:'gpu',
        canvas: canvasIn,
        context: glIn
    });
    console.log("GPU supported:"+GPU.isGPUSupported);
    this.solveLaplaceEquation = this.gpu.createKernel(function(potentialMap, pixStatusMap){
        const thx = this.thread.y;
        const thy = this.thread.x;
        if(pixStatusMap[thx][thy] != 0){
            return potentialMap[thx][thy];
        }else{
            return (potentialMap[thx + 1][thy    ] / 4 + 
                    potentialMap[thx - 1][thy    ] / 4 + 
                    potentialMap[thx    ][thy + 1] / 4 + 
                    potentialMap[thx    ][thy - 1] / 4);
        }
    })
    .setOutput([this.width, this.height]);

    this.generatePotentialMap = this.gpu.createKernel(function(){
        return 0.5;
    })
    .setOutput([this.width, this.height])
    .setPipeline(true)
    .setImmutable(true);

    this.setPotentialZero = this.gpu.createKernel(function(potentialMap, x, y){
        const thx = this.thread.y;
        const thy = this.thread.x;
        if( thx == x ){
            if( thy == y ){
                return 0;
            }
        }
        return potentialMap[thx][thy];
    })
    .setOutput([this.width, this.height])
    .setPipeline(true)
    .setImmutable(true);

    this.setBoundaryCircular = this.gpu.createKernel(function(potentialMap, xCen, yCen){
        const thx = this.thread.y;
        const thy = this.thread.x;
        if((thx - xCen) * (thx - xCen) + (thy - yCen) * (thy - yCen) > xCen * xCen * 0.99){
            return 1;
        }else{
            return potentialMap[thx][thy];
        }
    })
    .setOutput([this.width, this.height])
    .setPipeline(true)
    .setImmutable(true);

    this.solveLEQ = this.gpu.createKernel(function(potentialMap, pixStatusMap){
        const thx = this.thread.y;
        const thy = this.thread.x;
        if(pixStatusMap[thx][thy] != 0){
            return potentialMap[thx][thy];
        }else{
            return (potentialMap[thx + 1][thy    ] / 4 + 
                    potentialMap[thx - 1][thy    ] / 4 + 
                    potentialMap[thx    ][thy + 1] / 4 + 
                    potentialMap[thx    ][thy - 1] / 4);
        }
    })
    .setOutput([this.width, this.height])
    .setPipeline(true)
    .setImmutable(true);



    this.findNextPath = this.gpu.createKernel(function(potentialMap, bond, length, randomNum){
        let probabilitySum = 0;
        
        for(let bondIndexOne = length / 4 - 1; bondIndexOne >= 0; bondIndexOne--){
            const bondX = bond[4 * bondIndexOne + 2 * 1 + 0];
            const bondY = bond[4 * bondIndexOne + 2 * 1 + 1];
            probabilitySum += potentialMap[bondX][bondY];
        }
        let rand = randomNum * probabilitySum;
        for(let bondIndexTwo = length / 4 - 1; bondIndexTwo >= 0; bondIndexTwo--){
            const bondX = bond[4 * bondIndexTwo + 2 * 1 + 0];
            const bondY = bond[4 * bondIndexTwo + 2 * 1 + 1];
            rand -= potentialMap[bondX][bondY];
            if(rand < 0){
                //bondIndex at this moment is to be invaded next
                return [bondX, bondY, bond[4 * bondIndexTwo + 2 * 0 + 0], bond[4 * bondIndexTwo + 2 * 0 + 1]];
            }
        }
    })
    .setOutput([1])
    .setPipeline(true)
    .setDynamicArguments(true);

    this.updateCanvas = this.gpu.createKernel(function(pathCounter, potentialMap, newPath, displaySettings){
        const x = Math.floor(this.thread.x / this.constants.pr);
        const y = Math.floor(this.thread.y / this.constants.pr);
        const index = x + y * this.constants.width;
        if(newPath[index] > 0 && (displaySettings[3] != 0 || displaySettings[4] != 0 || displaySettings[5] != 0)){
            const r2 = displaySettings[3];
            const g2 = displaySettings[4] + displaySettings[5] * 0.5;
            const b2 = displaySettings[5];
            this.color(r2, g2, b2);
        }else if(pathCounter[index] != 0){
            const value = Math.min(255, 5 * pathCounter[index])
            const r1 = displaySettings[0];
            const g1 = displaySettings[1];
            const b1 = displaySettings[2];
            this.color(r1 * value / 256, g1 * value / 256, b1 * value / 256);
        }else{
            const value3 = potentialMap[x][y] * 0.5;
            const r3 = displaySettings[6];
            const g3 = displaySettings[7];
            const b3 = displaySettings[8];
            this.color(r3 * value3, g3 * value3, b3 * value3);
        }
    })
    .setOutput([this.cwidth, this.cheight])
    .setConstants({width:this.width, pr:this.pixelRatio})
    .setGraphical(true);
}
xy2i(x, y){
    return x + y * this.width;
}
}
console.log("Loaded: simulator.js");