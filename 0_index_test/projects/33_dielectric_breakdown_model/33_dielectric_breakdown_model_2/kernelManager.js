class KernelManager{
constructor(canvas){
    //Initialize Canvas and its size
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', { premultipliedAlpha: false });
    this.resizeCanvas();
    this.cwidth = this.canvas.width;
    this.cheight= this.canvas.height;
    this.width  = this.cwidth / this.pixelRatio;
    this.height = this.cheight / this.pixelRatio;

    //Initialize LES
    this.sim = new Simulator(this.width, this.height, this.canvas, this.gl, this.pixelRatio, this.cwidth, this.cheight);

    //Initialize PotentialMapK
    this.potentialMapK = this.sim.generatePotentialMap();
    this.potentialMapK = this.sim.setBoundaryCircular(this.potentialMapK, Math.floor(this.width / 2), Math.floor(this.height / 2));

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

    //Set boundary and path
    this.setBoundary();
    this.setPath(Math.floor(this.width/2), Math.floor(this.height/2));
    this.solveLEQ();
    this.solveLEQK();
    this.sim.updateCanvas(this.pathCounter, this.potentialMap, this.newPath, displaySettings);
    this.startAnimation();
}
toggleAnimation(){
    if(this.animatingNow){
        this.stopAnimation();
        text2.textContent = "Start/Pause Animation [ll]"
    }else{
        this.startAnimation();
        text2.textContent = "Start/Pause Animation [▶]"
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
    this.canvas.width *= this.pixelRatio;
    this.canvas.height*= this.pixelRatio;
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
    this.potentialMapK = this.sim.setPotentialZero(this.potentialMapK, x, y);

    // Check a neighbor and add bond if not invaded
    if(this.pixStatusMap[x - 1][y    ] == 0){
        this.bond.push(x, y, x - 1, y);
    // Check a neighbor and remove bond if invaded
    }else if(this.pixStatusMap[x - 1][y    ] == 2){
        for(let bondIndex = 0; bondIndex < this.bond.length / 4; bondIndex++){
            if(this.bond[4 * bondIndex + 2 * 1 + 0] == (x - 1) &&
               this.bond[4 * bondIndex + 2 * 1 + 1] == y){
                this.bond.splice(bondIndex * 4, 4);
            }
        }
    }else if(this.pixStatusMap[x - 1][y    ] == 1){
        console.log("STOP");
        this.stopAnimation();
        return;
    }

    // Check a neighbor and add bond if not invaded
    if(this.pixStatusMap[x + 1][y    ] == 0){
        this.bond.push(x, y, x + 1, y);
    // Check a neighbor and remove bond if invaded
    }else if(this.pixStatusMap[x + 1][y    ] == 2){
        for(let bondIndex = 0; bondIndex < this.bond.length / 4; bondIndex++){
            if(this.bond[4 * bondIndex + 2 * 1 + 0] == (x + 1) &&
               this.bond[4 * bondIndex + 2 * 1 + 1] == y){
                this.bond.splice(bondIndex * 4, 4);
            }
        }
    }else if(this.pixStatusMap[x + 1][y    ] == 1){
        console.log("STOP");
        this.stopAnimation();
        return;
    }

    // Check a neighbor and add bond if not invaded
    if(this.pixStatusMap[x    ][y - 1] == 0){
        this.bond.push(x, y, x , y - 1);
    // Check a neighbor and remove bond if invaded
    }else if(this.pixStatusMap[x    ][y - 1] == 2){
        for(let bondIndex = 0; bondIndex < this.bond.length / 4; bondIndex++){
            if(this.bond[4 * bondIndex + 2 * 1 + 0] == x &&
               this.bond[4 * bondIndex + 2 * 1 + 1] == (y - 1)){
                this.bond.splice(bondIndex * 4, 4);
            }
        }
    }else if(this.pixStatusMap[x    ][y - 1] == 1){
        console.log("STOP");
        this.stopAnimation();
        return;
    }

    // Check a neighbor and add bond if not invaded
    if(this.pixStatusMap[x    ][y + 1] == 0){
        this.bond.push(x, y, x , y + 1);
    // Check a neighbor and remove bond if invaded
    }else if(this.pixStatusMap[x    ][y + 1] == 2){
        for(let bondIndex = 0; bondIndex < this.bond.length / 4; bondIndex++){
            if(this.bond[4 * bondIndex + 2 * 1 + 0] == x &&
               this.bond[4 * bondIndex + 2 * 1 + 1] == (y + 1)){
                this.bond.splice(bondIndex * 4, 4);
            }
        }
    }else if(this.pixStatusMap[x    ][y + 1] == 1){
        console.log("STOP");
        this.stopAnimation();
        return;
    }

    //Remove bond to new pixel
    for(let bondIndex = 0; bondIndex < this.bond.length / 4; bondIndex++){
        if(this.bond[4 * bondIndex + 2 * 1 + 0] == x &&
           this.bond[4 * bondIndex + 2 * 1 + 1] == y){
            this.bond.splice(bondIndex * 4, 4);
        }
    }
}
findNextPath(potentialMapK, bond, length, randomNum){
    return this.sim.findNextPath(potentialMapK, bond, length, randomNum);
}
returnArray(kernelIn){
    return kernelIn.toArray();
}
updateCanvas(){
    this.sim.updateCanvas(this.pathCounter, this.potentialMapK, this.newPath, displaySettings);
}
solveLEQ(){
    this.potentialMap = this.sim.solveLaplaceEquation(this.potentialMap, this.pixStatusMap);
}
solveLEQK(){
    this.potentialMapK = this.sim.solveLEQ(this.potentialMapK, this.pixStatusMap);
}
startAnimation(){
    this.animatingNow = true;
    let newXY, newXYK;
    //this.solveLEQ();
    this.solveLEQK();
    const randomNum = Math.random();
    //newXY = this.findNextPath(randomNum);
    newXYK = this.findNextPath(this.potentialMapK, this.bond, this.bond.length, randomNum);
    newXYK = this.returnArray(newXYK)[0];
    this.setPath(newXYK[0], newXYK[1], newXYK[2], newXYK[3]);
    this.paintNewPath([newXYK[0], newXYK[1]]);
    this.updateCanvas();
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
console.log("Loaded: kernelManager.js");