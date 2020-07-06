class Canvas{
constructor(canvas){
    //Initialize Canvas and its size
    this.canvas = canvas;
    this.ct = canvas.getContext("2d");
    this.resize();
    //Add Event listeners
    this.canvas.addEventListener('mousedown', (event)=>{this.touch(event);}, false);
    this.canvas.addEventListener('mousemove', (event)=>{this.moveMouse(event);}, false);
    this.canvas.addEventListener('mouseup'  , (event)=>{this.release(event);}, false);
    //Array for pixels
    this.pixels = new Array(this.canvas.width*this.canvas.height);
    //Initialize ROI
    this.center = [0,0];
    this.sideLength = 4;
    this.eachIteration = 1;
    this.initialIteration = 0;
    //Reset...or start
    this.reset();
}
reset(){
    console.log("Start with... initialIteration:"+this.initialIteration+", eachIteration:"+this.eachIteration);
    //Looping Parameters
    this.loop = true;
    this.counter = 0;
    this.minIteration = -1;
    this.maxIteration = -1;
    this.maxIterationSecond = -1;
    //Pixel Parameters
    this.deads = new Array(this.canvas.width*this.canvas.height).fill(-1);
    this.resetPixels();
    this.ct.fillStyle = "white";
    this.ct.fillRect(0,0,this.canvas.width,this.canvas.height);
    this.imageData = this.ct.getImageData(0,0,this.canvas.width,this.canvas.height);
    //Touch control parameters
    this.touchStart = false;
    this.touchXY = [0,0];
    this.iterate(this.initialIteration);
    this.startTime = Date.now();
    this.start();
}
resetPixels(){
    for(let i=0;i<this.pixels.length;i++){
        const [x,y] = this.i2xy(i);
        const [xMod,yMod] = this.getModXY(x,y);
        this.pixels[i] = new Pixel(xMod,yMod);
    }
}
iterate(iterateCount=1){
    this.counter+=iterateCount; 
    let newDead = false;
    for(let i=0;i<this.pixels.length;i++){
        if(this.deads[i]!=-1){
            //this.setPix(i,Math.pow(this.deads[i],0.5)*255/Math.pow(this.counter,0.5));
            this.setPix(i,this.interpolate(this.deads[i]));
            continue;
        }
        const result = this.pixels[i].update(iterateCount);
        if(result != false){
            if(this.minIteration==-1||result<this.minIteration) this.minIteration = result;
            if(result>this.maxIteration){
                this.maxIterationSecond = this.maxIteration;
                this.maxIteration = result;
            }
            newDead = true;
            this.deads[i]=result;
        }
    }
    if(newDead){
        if((this.maxIterationSecond-this.maxIteration)>1)  newDead=false;
    }
    return newDead;
}
start(){
    if(!this.loop) return;
    const newDead = this.iterate(this.eachIteration);
    if(this.minIteration!=-1&&newDead==false){
        this.loop = false;
        this.getIterationParameters();
    }else{
        this.maxIteration = this.counter;
    }
    this.ct.putImageData(this.imageData,0,0);
    text1.textContent = "Number of iterations: "+this.counter;
    text2.textContent = "Length of side: "+this.sideLength.toExponential(3);
    requestAnimationFrame(()=>{this.start();});
}
getXY(event){
    const rect = event.target.getBoundingClientRect();
    let x = event.pageX-rect.left-document.scrollingElement.scrollLeft;
    let y = event.pageY-rect.top-document.scrollingElement.scrollTop;
    x *= this.pixelRatio;
    y *= this.pixelRatio;
    return [x,y];
}
touch(event){
    event.preventDefault();
    this.loop = false;
    this.move = false;
    this.touchStart = true;
    this.touchXY = this.getXY(event);
    this.lastMove = Date.now()
}
moveMouse(event){
    if(this.touchStart==false) return;
    if(Date.now()-this.lastMove<15) return;
    this.lastMove = Date.now();
    this.ct.putImageData(this.imageData,0,0);
    const [x,y] = this.getXY(event);
    const halfSide = Math.abs(x-this.touchXY[0]);
    this.ct.strokeStyle = "lime";
    this.ct.lineWidth = this.pixelRatio;
    this.ct.strokeRect(this.touchXY[0]-halfSide,this.touchXY[1]-halfSide,halfSide*2,halfSide*2);
}
release(event){    
    this.loop = false;
    const [x,y] = this.getXY(event);
    const [cx,cy] = this.touchXY;
    this.center = this.getModXY(cx,cy);
    const halfSide = Math.abs(x-this.touchXY[0]);
    if(halfSide==0){
        this.sideLength *=0.5;
    }else{
        this.sideLength *=(2*halfSide/this.canvas.width);
    }
    this.getIterationParameters();
    this.reset();
}
resize(){
    this.canvas.width = Math.floor(window.innerWidth)-20;
    if(Math.floor(window.innerWidth)>540)   this.canvas.width = 520;
    if(Math.floor(window.innerWidth)<320)   this.canvas.width = 320;
    this.pixelRatio = window.devicePixelRatio;
    this.canvas.style.width  = this.canvas.width + "px";
    this.canvas.style.height = this.canvas.width + "px";
    this.canvas.width  = this.canvas.width;
    this.canvas.height = this.canvas.width;
    this.canvas.width *= this.pixelRatio;
    this.canvas.height*= this.pixelRatio;
}
getIterationParameters(){
    const time = Date.now()-this.startTime;
    this.initialIteration = this.minIteration;
    this.eachIteration = Math.ceil((this.maxIteration-this.minIteration)*50/time);
}
setPix(index, value){
    //Set the pixel based on type
    this.imageData.data[4*index+0] = value;
    this.imageData.data[4*index+1] = value;
    this.imageData.data[4*index+2] = value;
}
interpolate(value){
    return 255*0.75*(1-Math.pow(0.99,((value-this.minIteration))));
}
i2xy(i){
    return [i%this.canvas.width,Math.floor(i/this.canvas.width)];
}
getModXY(x,y){
    const xMod = this.center[0]+(x/this.canvas.width-1/2)*this.sideLength;
    const yMod = this.center[1]+(y/this.canvas.width-1/2)*this.sideLength;
    return [xMod,yMod];
}
}

class Pixel{
constructor(x,y){
    this.reset(x,y);
}
reset(x,y){
    this.originalx = x;
    this.originaly = y;
    this.x=x;
    this.y=y;
    this.counter = 0;
    this.explodeCount = false;
}
update(iteration){
    for(let i=0;i<iteration;i++){
        if(this.explodeCount!=false) return this.explodeCount;
        this.counter++;
        const newx = this.x*this.x-this.y*this.y+this.originalx;
        const newy = this.x*this.y*2+this.originaly;
        this.x=newx;
        this.y=newy;
        if(newx*newx+newy*newy>4){
            this.explodeCount = this.counter;
        }
    }
    return this.explodeCount;
}
}
console.log("Loaded: canvas.js");