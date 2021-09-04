class Canvas{
constructor(canvas){
    //Initialize Canvas and its size
    this.canvas = canvas;
    this.ct = canvas.getContext('webgl2', { premultipliedAlpha: false });
    this.resizeCanvas();
    this.width = this.canvas.width;
    this.height= this.canvas.height;

    // GPU variables
    this.canvasgpu = new GPU({
        mode:'gpu',
        canvas: this.canvas,
        context: this.ct
    });
    console.log("GPU supported:"+GPU.isGPUSupported);
    this.updateCanvas = this.canvasgpu.createKernel(function(pathCounter, newPath){
        const index = this.thread.x + this.thread.y * this.constants.width;
        if(newPath[index] > 0){
            this.color(0, 0.5, 1);
        }else{
            const value = Math.min(255, 5 * pathCounter[index])
            this.color(value / 256, value / 256, value / 256);
        }
    })
    .setOutput([this.width, this.height])
    .setConstants({width:this.width})
    .setGraphical(true);

    //Initialize potential and pixStatus Map
    this.potentialMap = new Array(this.width); // potential value [0,1]
    this.pixStatusMap = new Array(this.width); // 0: uninvaded, 1: boundary, 2: path
    this.parentMap = new Array(this.width);
    for(let x = 0; x < this.width; x++){
        this.potentialMap[x] = new Array(this.height);
        this.pixStatusMap[x]  = new Array(this.height);
        this.parentMap[x] = new Array(this.height);
        for(let y = 0; y < this.height; y++){
            this.potentialMap[x][y] = 0.5;
            this.pixStatusMap[x][y] = 0;
            this.parentMap[x][y] = [0, 0];
        }
    }

    //Initialize pathCounter and newPath
    this.pathCounter = new Array(this.width*this.height);
    this.newPath = new Array(this.width*this.height);
    for(let i = 0; i < this.width * this.height; i++){
        this.pathCounter[i] = 0;
        this.newPath[i] = 0;
    }

    //Variables
    this.bond = new Array();
    this.counter = 0;
    this.animatingNow = false;

    //Initialize LES
    this.LES = new LaplaceEqSolver(this.width, this.height);

    //Set boundary and path
    this.setBoundary();
    this.setPath(Math.floor(this.width/2), Math.floor(this.height/2));
    this.solveLEQ();
    this.updateCanvas(this.pathCounter, this.newPath);
    this.startAnimation();
}
toggleAnimation(){
    if(this.animatingNow){
        this.stopAnimation();
    }else{
        this.startAnimation();
    }
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
    this.canvas.style.width  = this.canvas.width / this.pixelRatio + "px";
    this.canvas.style.height = this.canvas.width / this.pixelRatio + "px";
}
setBoundary(){
    const xCen = this.width / 2;
    const yCen = this.height/ 2;
    for(let x = 0; x < this.width; x++){
        for(let y = 0; y < this.height; y++){
            if( (x - xCen) * (x - xCen) + (y - yCen) * (y - yCen) > xCen * xCen * 0.99){
                this.pixStatusMap[x][y] = 1;
                this.potentialMap[x][y] = 1;
            }
        }
    }
}
setPath(x, y, xo = -1, yo){
    this.counter++;
    text1.textContent = "Number of iterations: "+this.counter;
    if(xo == -1){
        this.parentMap[x][y] = -1;
    }else{
        this.parentMap[x][y] = [xo, yo];
    }
    //Update Status and potential
    this.pixStatusMap[x][y] = 2;
    this.potentialMap[x][y] = 0;

    // Check a neighbor and add bond if not invaded
    if(this.pixStatusMap[x - 1][y    ] == 0){
        this.bond[this.bond.length] = [[x, y], [x - 1, y    ]];
    // Check a neighbor and remove bond if invaded
    }else if(this.pixStatusMap[x - 1][y    ] == 2){
        for(let bondIndex = 0; bondIndex < this.bond.length; bondIndex++){
            if(this.bond[bondIndex][1][0] == (x - 1) &&
               this.bond[bondIndex][1][1] == y){
                this.bond.splice(bondIndex, 1);
            }
        }
    }else if(this.pixStatusMap[x - 1][y    ] == 1){
        console.log("STOP");
        this.stopAnimation();
        return;
    }

    // Check a neighbor and add bond if not invaded
    if(this.pixStatusMap[x + 1][y    ] == 0){
        this.bond[this.bond.length] = [[x, y], [x + 1, y    ]];
    // Check a neighbor and remove bond if invaded
    }else if(this.pixStatusMap[x + 1][y    ] == 2){
        for(let bondIndex = 0; bondIndex < this.bond.length; bondIndex++){
            if(this.bond[bondIndex][1][0] == (x + 1) &&
               this.bond[bondIndex][1][1] == y){
                this.bond.splice(bondIndex, 1);
            }
        }
    }else if(this.pixStatusMap[x + 1][y    ] == 1){
        console.log("STOP");
        this.stopAnimation();
        return;
    }

    // Check a neighbor and add bond if not invaded
    if(this.pixStatusMap[x    ][y - 1] == 0){
        this.bond[this.bond.length] = [[x, y], [x    , y - 1]];
    // Check a neighbor and remove bond if invaded
    }else if(this.pixStatusMap[x    ][y - 1] == 2){
        for(let bondIndex = 0; bondIndex < this.bond.length; bondIndex++){
            if(this.bond[bondIndex][1][0] == x &&
               this.bond[bondIndex][1][1] == (y - 1)){
                this.bond.splice(bondIndex, 1);
            }
        }
    }else if(this.pixStatusMap[x    ][y - 1] == 1){
        console.log("STOP");
        this.stopAnimation();
        return;
    }

    // Check a neighbor and add bond if not invaded
    if(this.pixStatusMap[x    ][y + 1] == 0){
        this.bond[this.bond.length] = [[x, y], [x    , y + 1]];
    // Check a neighbor and remove bond if invaded
    }else if(this.pixStatusMap[x    ][y + 1] == 2){
        for(let bondIndex = 0; bondIndex < this.bond.length; bondIndex++){
            if(this.bond[bondIndex][1][0] == x &&
               this.bond[bondIndex][1][1] == (y + 1)){
                this.bond.splice(bondIndex, 1);
            }
        }
    }else if(this.pixStatusMap[x    ][y + 1] == 1){
        console.log("STOP");
        this.stopAnimation();
        return;
    }

    //Remove bond to new pixel
    for(let bondIndex = 0; bondIndex < this.bond.length; bondIndex++){
        if(this.bond[bondIndex][1][0] == x &&
           this.bond[bondIndex][1][1] == y){
            this.bond.splice(bondIndex, 1);
        }
    }
}
findNextPath(){
    let probabilitySum = 0;
    for(let bondIndex = this.bond.length - 1; bondIndex >= 0; bondIndex--){
        probabilitySum += this.getProbability(bondIndex);
    }
    let rand = Math.random() * probabilitySum;
    for(let bondIndex = this.bond.length - 1; bondIndex >= 0; bondIndex--){
        const bondX = this.bond[bondIndex][1][0];
        const bondY = this.bond[bondIndex][1][1];
        rand -= this.potentialMap[bondX][bondY];
        if(rand < 0){
            //bondIndex at this moment is to be invaded next
            this.setPath(bondX, bondY, this.bond[bondIndex][0][0], this.bond[bondIndex][0][1]);
            return [bondX, bondY];
        }
    }
}
getProbability(bondIndex){
    const bondX = this.bond[bondIndex][1][0];
    const bondY = this.bond[bondIndex][1][1];
    return this.potentialMap[bondX][bondY];
}
solveLEQ(){
    /*
    for(let x = 0; x < this.width; x++){
        for(let y = 0; y < this.height; y++){
            if(this.pixStatusMap[x][y] == 0){
                this.potentialMap[x][y] = 0;
            }
        }
    }
    */
    for(let i = 0; i < 1; i++){
        this.potentialMap = this.LES.solveLaplaceEquation(this.potentialMap, this.pixStatusMap);
   }
   this.potentialMap = this.potentialMap.toArray();
}
updateCanvas_Potential(){
    for(let x = 0; x < this.width; x++){
        for(let y = 0; y < this.height; y++){
            this.setPix([x, y], this.interpolate(this.potentialMap[x][y]));
            //this.setPix([x, y], this.interpolate(this.pixStatusMap[x][y]));
        }
    }
}
updateCanvas_CPU(){
    for(let x = 0; x < this.width; x++){
        for(let y = 0; y < this.height; y++){
            this.setPix([x, y], Math.max(0, 5 * this.pathCounter[this.xy2i([x,y])]));
            //this.setPix([x, y], this.interpolate(this.pixStatusMap[x][y]));
        }
    }
}
startAnimation(){
    this.animatingNow = true;
    let newXY;
    this.solveLEQ();
    newXY = this.findNextPath();
    this.paintNewPath(newXY);
    this.updateCanvas(this.pathCounter, this.newPath);
    //this.ct.putImageData(this.imageData, 0, 0);
    if(this.animatingNow) this.animation = requestAnimationFrame(() => {this.startAnimation();});
}
stopAnimation(){
    if(!this.animatingNow) return;
    cancelAnimationFrame(this.animation);
    this.animatingNow = false;
}
paintNewPath(newXY){
    for(let i = 0; i < this.width * this.height; i++){
        this.newPath[i] = 0;
    }
    this.pathCounter[this.xy2i(newXY)]++;
    this.newPath[this.xy2i(newXY)] = 1;
    while(this.parentMap[newXY[0]][newXY[1]] != -1){
        newXY = this.parentMap[newXY[0]][newXY[1]];
        let rand = Math.random();
        let offset = 0;
        while(rand < 0.1){
            rand *= 10;
            offset++;
        }
        if(rand < 0.25){
            this.pathCounter[this.xy2i([newXY[0] - offset, newXY[1]])]++;
        }else if(rand < 0.5){
            this.pathCounter[this.xy2i([newXY[0] + offset, newXY[1]])]++;
        }else if(rand < 0.75){
            this.pathCounter[this.xy2i([newXY[0] , newXY[1] - offset])]++;
        }else{
            this.pathCounter[this.xy2i([newXY[0] , newXY[1] + offset])]++;
        }
        this.newPath[this.xy2i(newXY)] = 1;
    }
}
i2xy(i){
    return [i % this.width, Math.floor(i / this.width)];
}
xy2i([x, y]){
    return x + y * this.width;
}
}
console.log("Loaded: canvas.js");