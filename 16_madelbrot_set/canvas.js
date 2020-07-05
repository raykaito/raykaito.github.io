class Canvas{
ct;
canvas;
animationStartTime;
imageData;
center;
sideLength;
pixels;
loop;
counter;
pixelRatio;
constructor(canvas=false,dim=false){
    //Initialize
    if(canvas.tagName!="CANVAS"){
        alert("Initialize Canvas Failed. Invalid type :["+canvas.tagName+"] was passes as an argument.");
        return false;
    }
    this.loop = true;
    this.canvas = canvas;
    this.canvas.addEventListener('mousedown', (event)=>{this.touch(event);}, false);
    this.canvas.addEventListener('touchstart', (event)=>{this.start(event);}, false);
    this.ct = canvas.getContext("2d");
    if(dim!=false) this.resize(dim);
    this.imageData = this.ct.getImageData(0,0,this.canvas.width,this.canvas.height);
    this.pixels = new Array(this.canvas.width*this.canvas.height);
    this.center = [0,0];
    this.sideLength = 4;
    this.reset();
}
reset(){
    this.loop = true;
    this.counter = 0;
    this.resetPixels();
    this.start();
}
getModXY(x,y){
    const xMod = this.center[0]+(x/this.canvas.width-1/2)*this.sideLength;
    const yMod = this.center[1]+(y/this.canvas.width-1/2)*this.sideLength;
    return [xMod,yMod];
}
touch=(event)=>{
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
resetPixels(){
    for(let i=0;i<this.pixels.length;i++){
        const [x,y] = this.i2xy(i);
        const [xMod,yMod] = this.getModXY(x,y);
        this.pixels[i] = new Pixel(xMod,yMod);
    }
}
resize(dim){
    if(dim.length!=2){
        alert("Invalid dim dimension");
        return;
    }
    this.pixelRatio = window.devicePixelRatio;
    this.canvas.style.width  = dim[0] + "px";
    this.canvas.style.height = dim[1] + "px";
    this.canvas.width  = dim[0];
    this.canvas.height = dim[1];
    this.canvas.width *= this.pixelRatio;
    this.canvas.height*= this.pixelRatio;
}
fill(){
    this.ct.putImageData(this.imageData,0,0);
}
start(){
    if(!this.loop) return;
    this.counter++; 
    let newDead = false;
    let unWhiteFound = false;
    for(let i=0;i<this.pixels.length;i++){
        const result = this.pixels[i].update();
        let value = 255;
        if(result != false){
            unWhiteFound = true;
            if(result==this.counter) newDead = true;
            value = result*255/this.counter;
        }
        this.setPix(i,value);
    }
    if(unWhiteFound&&newDead==false) this.loop=false;
    this.fill();
    text1.textContent = "Number of iterations: "+this.counter;
    requestAnimationFrame(()=>{this.start();});
}
i2xy(i){
    return [i%this.canvas.width,Math.floor(i/this.canvas.width)];
}
setPix(indexIn, value, type="all"){
    //Check if indexIn is xy or index
    let index;
    if(indexIn.length==2)   index = this.xy2i(indexIn);
    else                    index = indexIn;

    //Set the pixel based on type
    if(type=="all"||type==0) this.imageData.data[4*index+0] = value;
    if(type=="all"||type==1) this.imageData.data[4*index+1] = value;
    if(type=="all"||type==2) this.imageData.data[4*index+2] = value;
    if(type=="all"||type==2) this.imageData.data[4*index+3] = 255;
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
    if(this.explodeCount!=false) return this.explodeCount;
    this.counter++;
    const newx = this.x*this.x-this.y*this.y+this.originalx;
    const newy = this.x*this.y*2+this.originaly;
    this.x=newx;
    this.y=newy;
    if(newx*newx+newy*newy>4){
        this.explodeCount = this.counter;
    }
    return this.explodeCount;
}
}
console.log("Loaded: canvas.js");