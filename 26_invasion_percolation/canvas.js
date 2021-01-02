class Canvas{
constructor(canvas){
    //Initialize Canvas and its size
    this.canvas = canvas;
    this.ct = canvas.getContext("2d");
    this.resize();
    //Pixels
    this.sequence = 0;
    this.pixValue = new Array(this.canvas.width*this.canvas.height);
    this.invasionSequence = new Array(this.canvas.width*this.canvas.height).fill(0);//[0:UnQued, -1:Qued, +:InvadedSequence]
    this.queHeap = new heap();
    //Add Event listeners
    this.canvas.addEventListener('mousedown',  (event)=>{this.touch(event);}, false);
    this.canvas.addEventListener('touchstart', (event)=>{this.touch(event);}, false);
    //Reset Everything
    this.reset();
}
//Canvas Functions
resize(){
    this.canvas.width = Math.floor(window.innerWidth)-20;
    if(Math.floor(window.innerWidth)>540)   this.canvas.width = 520;
    if(Math.floor(window.innerWidth)<320)   this.canvas.width = 320;
    //this.canvas.width = 100;
    this.pixelRatio = window.devicePixelRatio;
    this.canvas.style.width  = this.canvas.width + "px";
    this.canvas.style.height = this.canvas.width + "px";
    this.canvas.width  = this.canvas.width;
    this.canvas.height = this.canvas.width;
    this.canvas.width *= this.pixelRatio;
    this.canvas.height*= this.pixelRatio;
    slider.style.width=this.canvas.width/this.pixelRatio+"px";
}
touch(event){
    if(this.loop){
        cancelAnimationFrame(this.animationRequest);
    }else{
        this.animationRequest = requestAnimationFrame(()=>{this.startAnimation();});
    }
    this.loop = !this.loop;
}
i2xy(i){
    return [i%this.canvas.width,Math.floor(i/this.canvas.width)];
}
xy2i(x,y){
    return y*this.canvas.width+x;
}
startAnimation(){
    if(!this.loop) return;
    this.ct.putImageData(this.imageData,0,0);
    text1.textContent = "Number of iterations: "+this.invasionCount;
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
//Invasion Percolation
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
    /*
    for(let pixelIndex=0;pixelIndex<this.pixValue.length;pixelIndex++){
        if(pixelIndex%this.canvas.width==0){
            this.addQue(pixelIndex);
        }
    }
    */
    this.addQue(this.xy2i(Math.floor(this.canvas.width/2),Math.floor(this.canvas.height/2)));
    this.getInvasionSequence();
    slider.max = this.canvas.width*this.canvas.height;
    //Start
    //this.startAnimation();
}
addQue(pixelIndex){
    if(this.invasionSequence[pixelIndex]!=0) return;
    else{
        this.queHeap.addValueIndex(this.pixValue[pixelIndex],pixelIndex);
        this.invasionSequence[pixelIndex] = -1;
    }
}
getInvasionSequence(){
    for(let i=0;i<this.canvas.width*this.canvas.height;i++){
        this.invasionCount++;
        const invadeIndex = this.queHeap.popValueIndex();
        const invadeXY = this.i2xy(invadeIndex);
        this.invasionSequence[invadeIndex] = this.invasionCount;
        this.setPix(invadeIndex,0);
        //getNeighbor and add to que
        const xNeighbor = [invadeXY[0]+1 ,invadeXY[0]   ,invadeXY[0]-1 ,invadeXY[0]  ];
        const yNeighbor = [invadeXY[1]   ,invadeXY[1]+1 ,invadeXY[1]   ,invadeXY[1]-1];
        for(let throat=0;throat<4;throat++){
            if(xNeighbor[throat]>=this.width ||xNeighbor[throat]<0) break;
            if(yNeighbor[throat]>=this.height||yNeighbor[throat]<0) break;
            this.addQue(this.xy2i(xNeighbor[throat],yNeighbor[throat]));
        }
    }
}
updateField(){
    for(let index = 0; index<this.canvas.width*this.canvas.height; index++){
        if(this.invasionSequence[index]<this.sequence){
            this.setPix(index,0);
        }else{
            //this.setPix(index,255);
            this.setPix(index,Math.floor(this.pixValue[index]*64)+192);
        }
    }
    this.ct.putImageData(this.imageData,0,0);
}
}
console.log("Loaded: canvas.js");