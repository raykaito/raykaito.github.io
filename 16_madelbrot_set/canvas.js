class Canvas{
constructor(canvas){
    //Initialize Canvas and its size
    this.canvas = canvas;
    this.ct = canvas.getContext("2d");
    this.resize();
    //Add Event listeners
    this.canvas.addEventListener('mousedown', (event)=>{this.touch(event);}, false);
    this.canvas.addEventListener('touchstart', (event)=>{this.start(event);}, false);
    //Array for pixels
    this.pixels = new Array(this.canvas.width*this.canvas.height);
    //Initialize ROI
    this.center = [0,0];
    this.sideLength = 4;
    //Reset...or start
    this.reset();
}
reset(){
    this.startTime = Date.now();
    this.counter = 0;
    this.loop = true;
    this.deads = new Array(this.canvas.width*this.canvas.height).fill(-1);
    this.resetPixels();
    this.ct.fillStyle = "white";
    this.ct.fillRect(0,0,this.canvas.width,this.canvas.height);
    this.imageData = this.ct.getImageData(0,0,this.canvas.width,this.canvas.height);
    this.start();
}
resetPixels(){
    for(let i=0;i<this.pixels.length;i++){
        const [x,y] = this.i2xy(i);
        const [xMod,yMod] = this.getModXY(x,y);
        this.pixels[i] = new Pixel(xMod,yMod);
    }
}
start(){
    if(!this.loop){
        console.log(Date.now()-this.startTime);
        return;
    }
    this.counter+=5; 
    let newDead = false;
    let unWhiteFound = false;
    for(let i=0;i<this.pixels.length;i++){
        if(this.deads[i]!=-1){
            unWhiteFound = true;
            this.setPix(i,Math.pow(this.deads[i],0.5)*255/Math.pow(this.counter,0.5));
            //this.setPix(i,this.deads[i]*255/this.counter);
            continue;
        }
        const result = this.pixels[i].update();
        //let value = 255;
        if(result != false){
            unWhiteFound = true;
            this.deads[i]=result;
            if(result==this.counter) newDead = true;
            //value = this.deads[i]*255/this.counter;
        }
        //this.setPix(i,value);
    }
    if(unWhiteFound&&newDead==false) this.loop=false;
    this.ct.putImageData(this.imageData,0,0);
    text1.textContent = "Number of iterations: "+this.counter;
    requestAnimationFrame(()=>{this.start();});
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
touch(event){
    const rect = event.target.getBoundingClientRect();
    let x = event.pageX-rect.left-document.scrollingElement.scrollLeft;
    let y = event.pageY-rect.top-document.scrollingElement.scrollTop;
    x *= this.pixelRatio;
    y *= this.pixelRatio;
    this.loop = false;
    const [xMod,yMod] = this.getModXY(x,y);
    this.center = [xMod,yMod];
    this.sideLength *=0.5;
    this.reset();
}
i2xy(i){
    return [i%this.canvas.width,Math.floor(i/this.canvas.width)];
}
getModXY(x,y){
    const xMod = this.center[0]+(x/this.canvas.width-1/2)*this.sideLength;
    const yMod = this.center[1]+(y/this.canvas.width-1/2)*this.sideLength;
    return [xMod,yMod];
}
setPix(index, value){
    //Set the pixel based on type
    this.imageData.data[4*index+0] = value;
    this.imageData.data[4*index+1] = value;
    this.imageData.data[4*index+2] = value;
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
update(){
    for(let i=0;i<5;i++){
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