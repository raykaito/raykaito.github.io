alert("H");
class Canvas{
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
}

alert("Loaded: canvasC.js");