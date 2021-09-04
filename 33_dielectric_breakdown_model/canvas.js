class Canvas{
constructor(canvas){
    //Initialize Canvas and its size
    this.canvas = canvas;
    this.ct = canvas.getContext("2d");
    this.resizeCanvas();
    this.resetCanvas();

    //Initialize potential and pixStatus Map
    this.potentialMap = new Array(this.canvas.width); // potential value [0,1]
    this.pixStatusMap = new Array(this.canvas.width); // 0: uninvaded, 1: boundary, 2: path
    this.parentMap = new Array(this.canvas.width);
    for(let x = 0; x < this.canvas.width; x++){
        this.potentialMap[x] = new Array(this.canvas.height);
        this.pixStatusMap[x]  = new Array(this.canvas.height);
        this.parentMap[x] = new Array(this.canvas.height);
        for(let y = 0; y < this.canvas.height; y++){
            this.potentialMap[x][y] = 0.5;
            this.pixStatusMap[x][y] = 0;
            this.parentMap[x][y] = [0, 0];
        }
    }
    this.pathCounter = new Array(this.canvas.width*this.canvas.height);
    for(let i = 0; i < this.canvas.width * this.canvas.height; i++){
        this.pathCounter[i] = 0;
    }

    //Variables
    this.bond = new Array();


    //Initialize LES
    this.LES = new LaplaceEqSolver(this.canvas.width, this.canvas.height);

    //Set boundary and path
    this.setBoundary();
    this.setPath(Math.floor(this.canvas.width/2), Math.floor(this.canvas.height/2));
    this.solveLEQ();
    this.updateCanvas();
    this.ct.putImageData(this.imageData, 0, 0);
    this.animatingNow = false;
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
            if( (x - xCen) * (x - xCen) + (y - yCen) * (y - yCen) > xCen * xCen * 0.99){
                this.pixStatusMap[x][y] = 1;
                this.potentialMap[x][y] = 1;
            }
        }
    }
}
setPath(x, y, xo = -1, yo){
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
    console.log(rand/probabilitySum);
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
    for(let i = 0; i < 1; i++){
        this.potentialMap = this.LES.solveLaplaceEquation(this.potentialMap, this.pixStatusMap);
   }
}
updateCanvas2(){
    for(let x = 0; x < this.canvas.width; x++){
        for(let y = 0; y < this.canvas.height; y++){
            this.setPix([x, y], this.interpolate(this.potentialMap[x][y]));
            //this.setPix([x, y], this.interpolate(this.pixStatusMap[x][y]));
        }
    }
}
updateCanvas(){
    for(let x = 0; x < this.canvas.width; x++){
        for(let y = 0; y < this.canvas.height; y++){
            this.setPix([x, y], Math.max(0, 3 * this.pathCounter[this.xy2i([x,y])]));
            //this.setPix([x, y], this.interpolate(this.pixStatusMap[x][y]));
        }
    }
}
startAnimation(){
    this.animatingNow = true;
    let newXY;
    this.solveLEQ();
    for(let speed = 0; speed < 1; speed++){
        newXY = this.findNextPath();
    }
    this.updateCanvas();
    this.paintNewPath(newXY);
    this.ct.putImageData(this.imageData, 0, 0);
    if(this.animatingNow) this.animation = requestAnimationFrame(() => {this.startAnimation();});
}
stopAnimation(){
    if(!this.animatingNow) return;
    cancelAnimationFrame(this.animation);
    this.animatingNow = false;
}
paintNewPath(newXY){
    this.setPix(newXY, 0  , 0);
    this.setPix(newXY, 128, 1);
    this.setPix(newXY, 255, 2);
    this.pathCounter[this.xy2i(newXY)]++;
    while(this.parentMap[newXY[0]][newXY[1]] != -1){
        newXY = this.parentMap[newXY[0]][newXY[1]];
        this.setPix(newXY, 0  , 0);
        this.setPix(newXY, 128, 1);
        this.setPix(newXY, 255, 2);
        this.pathCounter[this.xy2i(newXY)]++;
    }
}
setPix(index, value, type = -1){
    if(index.length == 2){
        index = this.xy2i(index);
    }
    if(type == -1){
        //Set the pixel based on type
        this.imageData.data[4 * index + 0] = value;
        this.imageData.data[4 * index + 1] = value;
        this.imageData.data[4 * index + 2] = value;
    }else{
        this.imageData.data[4 * index + type] = value;
    }
}
interpolate(value){
    //return value * 256;
    if(value == 0) return 0;
    if(value == 1) return 255;
    return value * 128 + 127;
}
i2xy(i){
    return [i % this.canvas.width, Math.floor(i / this.canvas.width)];
}
xy2i([x, y]){
    return x + y * this.canvas.width;
}
}
console.log("Loaded: canvas.js");