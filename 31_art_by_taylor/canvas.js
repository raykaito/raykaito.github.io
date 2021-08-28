class Canvas{
constructor(canvas){
    //Initialize Canvas and its size
    this.canvas = canvas;
    this.ct = canvas.getContext("2d");
    this.resizeCanvas();
    //Variables
    this.newIndex;
    this.color = [0, 0, 0];
    this.dcolor = [0, 0, 0];
    //Add Event listeners
    this.canvas.addEventListener('mousedown',  (event) => {this.touch(event);},     false);
    this.canvas.addEventListener('touchstart', (event) => {this.touch(event);},     false);
    this.canvas.addEventListener('mousemove',  (event) => {this.moveMouse(event);}, false);
    this.canvas.addEventListener('touchmove',  (event) => {this.moveMouse(event);}, false);
    this.canvas.addEventListener('mouseup'  ,  (event) => {this.release(event);},   false);
    this.canvas.addEventListener('touchend'  , (event) => {this.release(event);},   false);
    //Reset...or start
    this.resetCanvas();
    this.startAnimation();
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
    this.counter = 0;
    //Touch control parameters
    this.touchStart = false;
    this.touchXY = [0, 0];
    //Set Color
    this.color = [this.getRand(255), this.getRand(255), this.getRand(255)];
    this.dcolor= [this.getRand(5) - 2, this.getRand(5) - 2, this.getRand(5) - 2];
    this.newIndex = this.getRand(this.canvas.width*this.canvas.height);
}
startAnimation(){
    requestAnimationFrame(() => {canvas.startAnimation()});
    const xy = this.i2xy(this.newIndex);
    let unOccupiedFound = false;
    for(let range = 1; ; range++){
        const dir = this.getRand(8*range);
        for(let circonference = 0; circonference < 8*range; circonference++){
            let dx, dy;
            const section = Math.floor((dir+circonference)/(range*2));
            if(section == 0){
                dx = dir+circonference-range;
                dy = -range;
            }
            if(section == 1){
                dx = +range;
                dy = dir + circonference - 3 * range;
            }
            if(section == 2){
                dx = range - (dir + circonference - 4 * range);
                dy = +range;
            }
            if(section == 3){
                dx = -range;
                dy = range - (dir + circonference - 6 * range);
            }
            const newIndexTemp = this.xy2i(xy[0]+dx, xy[1] + dy);
            if(this.imageData.data[4*newIndexTemp+0]==0&&
                this.imageData.data[4*newIndexTemp+1]==0&&
                this.imageData.data[4*newIndexTemp+2]==0){
                this.newIndex = newIndexTemp;
                unOccupiedFound = true;
                console.log("dir:"+dir+", circ:"+circonference+", sec:"+section+",xy:"+dx+","+dy);
            }
            if(unOccupiedFound) break;
        }
        if(unOccupiedFound) break;
    }
    //updateMap and color
    for(let i = 0; i < 3; i++){
        this.setPix(this.newIndex, this.color[i], i);
        this.color[i] += this.dcolor[i];
        if(this.color[i] > 255 || this.color[i] < 0){
            this.dcolor[i] *= -1;
            this.color[i] += this.dcolor[i];
        }
    }
    this.updateCanvas();
}
updateCanvas(){
    this.ct.putImageData(this.imageData, 0, 0);
}
touch(event){
    this.loop = false;
    this.move = false;
    this.touchStart = true;
    this.touchXY = this.getXY(event);
    this.lastMove = Date.now();
    this.ct.strokeStyle = "lime";
    this.ct.lineWidth = this.pixelRatio;
}
moveMouse(event){
    if(this.touchStart == false) return;
    if(Date.now() - this.lastMove < 15) return;
    this.lastMove = Date.now();
    this.ct.putImageData(this.imageData, 0, 0);
    const [x,y] = this.getXY(event);
    const halfSide = Math.abs(x - this.touchXY[0]);
    this.ct.strokeRect(this.touchXY[0] - halfSide, this.touchXY[1] - halfSide, halfSide * 2, halfSide * 2);
}
release(event){    
    this.loop = false;
    const [xPixEnd, yPixEnd] = this.getXY(event);
    const [xPixStart, yPixStart] = this.touchXY;
    [this.centerX, this.centerY] = this.getModXY(xPixStart, yPixStart);
    const sideLengthPix = Math.abs(xPixEnd - xPixStart);
    if(sideLengthPix == 0){
        this.sideLength *= 0.5;
    }else{
        this.sideLength *= (2 * sideLengthPix / this.canvas.width);
    }
    this.resetCanvas();
    this.updateMandelBrotSet(this.centerX - this.sideLength / 2,
                             this.centerY - this.sideLength / 2,
                             this.centerX + this.sideLength / 2,
                             this.centerY + this.sideLength / 2);
}
getXY(event){
    event.preventDefault();
    const rect = event.target.getBoundingClientRect();
    let x = event.pageX - rect.left - document.scrollingElement.scrollLeft;
    let y = event.pageY - rect.top  - document.scrollingElement.scrollTop;
    x *= this.pixelRatio;
    y *= this.pixelRatio;
    return [x,y];
}
getModXY(xPix, yPix){
    const xMod = this.centerX+(xPix/this.canvas.width  - 1/2) * this.sideLength;
    const yMod = this.centerY+(yPix/this.canvas.height - 1/2) * this.sideLength;
    return [xMod,yMod];
}
setPix(index, value, type = -1){
    if(type == -1){
        //Set the pixel based on type
        this.imageData.data[4 * index + 0] = value;
        this.imageData.data[4 * index + 1] = value;
        this.imageData.data[4 * index + 2] = value;
    }else{
        this.imageData.data[4 * index + type] = value;
    }
}
i2xy(i){
    return [i % this.canvas.width, Math.floor(i / this.canvas.width)];
}
xy2i(x, y){
    return this.canvas.width*y+x;
}
getRand(number){
    return Math.floor(Math.random()*number);
}
}
console.log("Loaded: canvas.js");