class Canvas{
constructor(canvas){
    //Initialize Canvas and its size
    this.canvas = canvas;
    this.ct = canvas.getContext("2d");
    this.resize();
    //Add Event listeners
    this.canvas.addEventListener('mousedown',  (event)=>{this.touch(event);}, false);
    this.canvas.addEventListener('touchstart', (event)=>{this.touch(event);}, false);
    //ImageData
    this.ct.fillStyle = "white";
    this.ct.fillRect(0,0,this.canvas.width,this.canvas.height);
    this.imageData = this.ct.getImageData(0,0,this.canvas.width,this.canvas.height);
}
//Canvas Functions
resize(){
    this.canvas.width = Math.floor(window.innerWidth)-20;
    if(Math.floor(window.innerWidth)>540)   this.canvas.width = 520;
    if(Math.floor(window.innerWidth)<320)   this.canvas.width = 320;
    //this.canvas.width = 20;
    this.pixelRatio = window.devicePixelRatio;
    this.canvas.style.width  = this.canvas.width + "px";
    this.canvas.style.height = this.canvas.width + "px";
    ///////
    this.canvas.width = 10;
    this.pixelRatio = 1;
    this.canvas.style.width  = this.canvas.width*40 + "px";
    this.canvas.style.height = this.canvas.width*40 + "px";
    ///////
    this.canvas.width  = this.canvas.width;
    this.canvas.height = this.canvas.width;
    this.canvas.width *= this.pixelRatio;
    this.canvas.height*= this.pixelRatio;
    slider.style.width=this.canvas.width/this.pixelRatio*50+"px";
}
touch(event){
    return;
    if(this.loop){
        cancelAnimationFrame(this.animationRequest);
    }else{
        this.animationRequest = requestAnimationFrame(()=>{this.startAnimation();});
    }
    this.loop = !this.loop;
}
startAnimation(){
    if(!this.loop) return;
    this.ct.putImageData(this.imageData,0,0);
    text1.textContent = "Number of Steps: "+Math.sqrt(this.invasionCount);
    text2.textContent = "Number of clusters: "+this.clusterCount;
    this.animationRequest = requestAnimationFrame(()=>{this.startAnimation();});
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
}
console.log("Loaded: canvas.js");