class Canvas{
constructor(canvas){
    //Initialize Canvas and its size
    this.canvas = canvas;
    this.ct = canvas.getContext("2d");
    this.resize();
    //Pixels
    this.pixValue = new Array(this.canvas.width*this.canvas.height);
    this.pixState = new Array(this.canvas.width*this.canvas.height);
    //Add Event listeners
    this.canvas.addEventListener('mousedown', (event)=>{this.touch(event);}, false);
    this.canvas.addEventListener('touchstart', (event)=>{this.touch(event);}, false);
    //Reset Everything
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
reset(){
    //Iterations
    this.loop = true;
    this.invasionCount = 0;
    this.clusterCount = 0;
    this.animationRequest;
    //ImageData
    this.ct.fillStyle = "white";
    this.ct.fillRect(0,0,this.canvas.width,this.canvas.height);
    this.imageData = this.ct.getImageData(0,0,this.canvas.width,this.canvas.height);
    //Pixel Parameters
    for(let pixelIndex=0;pixelIndex<this.pixValue.length;pixelIndex++){
        this.pixValue[pixelIndex] = Math.random();
        this.setPix(pixelIndex,Math.floor(this.pixValue[pixelIndex]*64)+192);
    }
    console.log(this.pixValue);
    //Start
    this.startAnimation();
}
invade(){
    this.invasionCount++;
}
startAnimation(){
    if(!this.loop) return;
    //this.invade();
    this.ct.putImageData(this.imageData,0,0);
    text1.textContent = "Number of iterations: "+this.invasionCount;
    text2.textContent = "Length of side: "+this.clusterCount;
    this.animationRequest = requestAnimationFrame(()=>{this.startAnimation();});
}
touch(event){
    if(this.loop){
        cancelAnimationFrame(this.animationRequest);
    }else{
        this.animationRequest = requestAnimationFrame(()=>{this.startAnimation();});
    }
    this.loop = !this.loop;
}
setPix(index, value,rgb=3){
    //Set the pixel based on type
    if(rgb==3){
        this.imageData.data[4*index+0] = value;
        this.imageData.data[4*index+1] = value;
        this.imageData.data[4*index+2] = value;
    }else{
        this.imageData.data[4*index+rgb] = value;
    }
}
i2xy(i){
    return [i%this.canvas.width,Math.floor(i/this.canvas.width)];
}
}
console.log("Loaded: canvas.js");