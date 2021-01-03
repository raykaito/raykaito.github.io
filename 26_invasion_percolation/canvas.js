class Canvas{
constructor(canvas){
    //Initialize Canvas and its size
    this.canvas = canvas;
    this.ct = canvas.getContext("2d");
    this.resize();
    //Pixels
    this.sequence = 0;
    this.pixValue = new Array(this.canvas.width*this.canvas.height);
    this.invadedSequence = new Array(this.canvas.width*this.canvas.height).fill(0);//[0:UnQued, -1:Qued, +:InvadedSequence]
    this.trappedSequence  = new Array(this.canvas.width*this.canvas.height).fill(0);//[0:Not trapped, +:TrappedSequence]
    this.clusterIndex = new Array(this.canvas.width*this.canvas.height).fill(0);//[0:Not trapped, -1:MainCluster, Cluster ID]
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
    this.updateField();
    //this.startAnimation();
}
addQue(pixelIndex){
    if(this.invadedSequence[pixelIndex]!=0) return;
    else{
        this.queHeap.addValueIndex(this.pixValue[pixelIndex],pixelIndex);
        this.invadedSequence[pixelIndex] = -1;
    }
}
getInvasionSequence(){
    for(let i=0;i<this.canvas.width*this.canvas.height;i++){
        this.invasionCount++;
        const invadeIndex = this.queHeap.popValueIndex();
        const invadeXY = this.i2xy(invadeIndex);
        this.invadedSequence[invadeIndex] = this.invasionCount;
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
applyTrapping(){
    //Define Main Cluster at beggining
    for(let x=0;x<this.canvas.width;x++){
        const yMin = 0;
        const yMax = this.canvas.height-1;
        this.clusterIndex[this.xy2i(x,yMin)] = -1;
        this.clusterIndex[this.xy2i(x,yMax)] = -1;
    }
    for(let y=0;y<this.canvas.height;y++){
        const xMin = 0;
        const xMax = this.canvas.width-1;
        this.clusterIndex[this.xy2i(xMin,y)] = -1;
        this.clusterIndex[this.xy2i(xMax,y)] = -1;
    }
    //Aquire Sorted Pore List
    let sortedPoreList = new Array(this.canvas.width*this.canvas.height+1);
    for(let poreIndex=0;poreIndex<this.invadedSequence.length;poreIndex++){
        sortedPoreList[this.invadedSequence[poreIndex]] = poreIndex;
    }
    //get Clusters
    let openClusterHeap = new heap();
    let poreListForEachCluster = new Array();
    for(let sequence = this.sortedPoreList.length-1;sequence>0;sequence--){
        let neighborIndex = new Array(4).fill(0);//[0:Not trapped, -1:MainCluster, Cluster ID]
        //getNeighbor and add to que
        const xNeighbor = [invadeXY[0]+1 ,invadeXY[0]   ,invadeXY[0]-1 ,invadeXY[0]  ];
        const yNeighbor = [invadeXY[1]   ,invadeXY[1]+1 ,invadeXY[1]   ,invadeXY[1]-1];
        let neighborCondition = 0;//[0: All Not Trapped (New) 1: Cluster Found (Grow) 2: More Clusters Found (Merge) 3: Main (Cluster Trapped)]
        for(let throat=0;throat<4;throat++){
            if(xNeighbor[throat]>=this.width ||xNeighbor[throat]<0) break;
            if(yNeighbor[throat]>=this.height||yNeighbor[throat]<0) break;
            const localNeighborIndex = this.clusterIndex[this.xy2i(xNeighbor[throat],yNeighbor[throat])];
            neighborIndex[throat] = localNeighborIndex;
            //Update Neighbor Condition
            if(localNeighborIndex==-1){
                neighborCondition = 3;
            }else if(localNeighborIndex>0){
                if(neighborCondition<2){
                    neighborCondition++;
                }
            }
        }
        //Birdth of a new Cluster
        if(neighborCondition==0){
            let newClusterIndex = poreListForEachCluster.length;
            if(openClusterHeap.valueTree.length!=0){
                newClusterIndex = openClusterHeap.popValueIndex();
            }
            poreListForEachCluster[newClusterIndex] = [this.sortedPoreList[sequence]];
            this.clusterIndex[this.sortedPoreList[sequence]] = newClusterIndex;
        }
        //Grow Clusters
        if(neighborCondition==1){
            //Get Cluster ID
            let clusterIndex;
            for(let throat=0;throat<4;throat++){
                if(neighborIndex[throat]>0){
                    clusterIndex = neighborIndex[throat];
                    break;
                }
            }
            poreListForEachCluster[clusterIndex][poreListForEachCluster[clusterIndex].length] = [this.sortedPoreList[sequence]];
        }
        //Merge Clusters
        if(neighborCondition==2){
            let parentClusterIndex=0;
            //Get Cluster Index (minimum neighborIndex)
            for(let throat=0;throat<4;throat++){
                if(neighborIndex[throat]>0){
                    if(parentClusterIndex==0){
                        parentClusterIndex = neighborIndex[throat];
                    }else{
                        if(neighborIndex[throat]<parentClusterIndex){
                            parentClusterIndex = neighborIndex[throat];
                        }
                    }
                }
            }
            //Merge them one by one
            for(let throat=0;throat<4;throat++){
                if(neighborIndex[throat]!=0&&neighborIndex[throat]!=clusterIndex){
                    const childClusterIndex = neighborIndex[throat];
                    const childClusterPoreCount = poreListForEachCluster[childClusterIndex].length;
                    openClusterHeap.addValueIndex(childClusterIndex,childClusterIndex);
                    for(let clusterMemberIndex=0;clusterMemberIndex<childClusterPoreCount;clusterMemberIndex++){
                        const parentClusterPoreCount = poreListForEachCluster[parentClusterIndex].length;
                        poreListForEachCluster[parentClusterIndex][parentClusterPoreCount] = poreListForEachCluster[childClusterIndex][clusterMemberIndex];
                        this.clusterIndex[poreListForEachCluster[childClusterIndex][clusterMemberIndex]] = parentClusterIndex;
                    }
                }
            }
        }
        //Trapped Cluster
        if(neighborCondition==3){

        }
    }
}
updateField(){
    for(let index = 0; index<this.canvas.width*this.canvas.height; index++){
        if(this.invadedSequence[index]<this.sequence){
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