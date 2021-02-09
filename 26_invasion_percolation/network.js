class Network{
constructor(xMax,yMax,canvas){
    this.canvas = canvas;
    //Initialize Canvas and its size
    this.xMax = xMax;
    this.yMax = yMax;
    this.area = xMax*yMax;
    slider.max = this.area+1;
    this.sliderLock = false;

    //index and location
    this.index = new Uint32Array(this.area);
    this.xPosition = new Uint32Array(this.area);
    this.yPosition = new Uint32Array(this.area);
    for(let i=0; i<this.area; i++){
        this.index[i] = i;
        this.xPosition[i] = i%xMax;
        this.yPosition[i] = Math.floor(i/xMax);
    }

    //parameters for invasion percolation
    this.value = new Array(this.area).fill(-1);
    this.quedSequence = new Int32Array(this.area).fill(-1);
    this.unquedSequence = new Int32Array(this.area).fill(-1);
    this.invadedSequence = new Int32Array(this.area).fill(-1); //[1, this.area]
    this.sequence = -1;

    //parameters for trapping
    this.clusterIndex = new Int32Array(this.area).fill(-1);// [0, clusterCount-1]
    this.trappedSequence = new Int32Array(this.area).fill(-1);

    //HeapStructure
    this.queHeap = new heap();
}
assignRandomValues(){
    this.sequence = 0;
    for(let i=0; i<this.area; i++){
        this.value[i] = Math.random();
    }
}
addQue(index){
    if(this.quedSequence[index]!=-1) return;
    else{
        this.queHeap.addValueIndex(this.value[index],index);
        this.quedSequence[index] = this.sequence;
    }
}
setInletsLeft(){
    for(let i=0; i<this.area; i++){
        if(this.xPosition[i]==0){
            this.addQue(i);
        }
    }
}
setInletsCenter(){
    this.addQue(Math.floor(this.area/2+this.yMax/2));
}
runInvasionPercolation(){
    for(let i=0;i<this.area;i++){
        //Inclement Sequence
        this.sequence++;

        //Get nextSiteInfromation
        const invadedSiteIndex = this.queHeap.popValueIndex();
        const invadedSiteXY = this.i2xy(invadedSiteIndex);
        this.invadedSequence[invadedSiteIndex] = this.sequence;
        this.unquedSequence[invadedSiteIndex] = this.sequence;

        //getNeighbor and add to que
        const xNeighbor = [invadedSiteXY[0]+1 ,invadedSiteXY[0]   ,invadedSiteXY[0]-1 ,invadedSiteXY[0]  ];
        const yNeighbor = [invadedSiteXY[1]   ,invadedSiteXY[1]+1 ,invadedSiteXY[1]   ,invadedSiteXY[1]-1];
        for(let direction=0;direction<4;direction++){
            if(xNeighbor[direction]>=this.xMax ||xNeighbor[direction]<0) continue;
            if(yNeighbor[direction]>=this.yMax ||yNeighbor[direction]<0) continue;
            this.addQue(this.xy2i(xNeighbor[direction],yNeighbor[direction]));
        }
    }
    this.drawSelf(0);
}
applyTrapping(){
    //CreateReverseOrder
    let reverseOrderIndex = new Uint32Array(this.area+1);

    //Cluster Information
    let clusterMap = new Int32Array(this.area).fill(-1);
    let merClus = new Int32Array(this.area);
    let nextClusterIndex = 0;
    let confirmedClusterIndex = 0;
    //Define Sink
    for(let siteIndex=0; siteIndex<this.area; siteIndex++){
        const [x,y] = this.i2xy(siteIndex);
        if(x==0||x==this.xMax-1||y==0||y==this.yMax-1){
            clusterMap[siteIndex]=-2;
            //console.log("Sink ("+x+","+y+")");
        }
    }

    for(let i=0; i<this.area; i++){
        reverseOrderIndex[this.invadedSequence[i]] = i;
    }
    for(let sequence=this.area; sequence>0; sequence--){
        let neiClusList = new Array();
        let neiClusCou = 0;
        let minNeiClusIn = this.area;
        const nextSiteIndex = reverseOrderIndex[sequence];
        const nextSiteXY = this.i2xy(nextSiteIndex);

        //check for neighboring clusters and get their index
        const xNeighbor = [nextSiteXY[0]+1 ,nextSiteXY[0]   ,nextSiteXY[0]-1 ,nextSiteXY[0]  ];
        const yNeighbor = [nextSiteXY[1]   ,nextSiteXY[1]+1 ,nextSiteXY[1]   ,nextSiteXY[1]-1];
        for(let direction=0;direction<4;direction++){
            if(xNeighbor[direction]>=this.xMax ||xNeighbor[direction]<0) continue;
            if(yNeighbor[direction]>=this.yMax ||yNeighbor[direction]<0) continue;

            const neiSiteIn = this.xy2i(xNeighbor[direction],yNeighbor[direction]);

            //Get Cluster index
            let neiClusIn = clusterMap[neiSiteIn];
            if(neiClusIn>=0){
                neiClusIn = merClus[neiClusIn];
            }
            if(neiClusIn!=-1){
                //Skip if Duplicated Cluster
                let duplicateFound = false;
                for(let neiClusListIn=0; neiClusListIn<neiClusCou; neiClusListIn++){
                    if(neiClusIn==neiClusList[neiClusListIn]){
                        duplicateFound = true;
                        break;
                    }
                }
                if(duplicateFound) continue;
                //if unique, add to neiClusList
                neiClusList[neiClusCou] = neiClusIn;
                if(neiClusIn<minNeiClusIn){
                    minNeiClusIn = neiClusIn;
                }
                neiClusCou++;
            }
        }
        if(neiClusCou==0){
            //Birth of a new cluster
            //console.log("newCluster"+nextClusterIndex);
            clusterMap[nextSiteIndex] = nextClusterIndex;
            merClus[nextClusterIndex] = nextClusterIndex;
            nextClusterIndex++;
        }else if(neiClusCou==1){
            //Extend existing cluster
            //console.log("extendCluster"+minNeiClusIn);
            clusterMap[nextSiteIndex] = minNeiClusIn;
        }else if(minNeiClusIn>=0){
            //Merge clusters
            //console.log("mergeClusters"+neiClusList);
            for(let merClusIn=0; merClusIn<merClus.length; merClusIn++){
                for(let neiClusListIn=0; neiClusListIn<neiClusCou; neiClusListIn++){
                    if(merClus[merClusIn]==neiClusList[neiClusListIn]){
                        merClus[merClusIn]=minNeiClusIn;
                    }
                }
            }
        }else if(minNeiClusIn==-2){
            //console.log("here"+sequence);
            //reached sink
            for(let neiClusListIn=0; neiClusListIn<neiClusCou; neiClusListIn++){
                const theNeiClusIn = neiClusList[neiClusListIn];
                //console.log(theNeiClusIn);
                if(theNeiClusIn!=-2){
                    //Extract cluster Information
                    for(let siteIndex=0;siteIndex<this.area;siteIndex++){
                        //console.log("here");
                        const siteCluster = clusterMap[siteIndex];
                        //clusterMap[siteIndex] = -2;
                        if(theNeiClusIn==merClus[siteCluster]){
                            this.clusterIndex[siteIndex] = confirmedClusterIndex;
                            this.trappedSequence[siteIndex] = sequence;
                        }
                    }
                    confirmedClusterIndex++;

                    //Update merClus and add them to Sink (-2)
                    for(let merClusIn=0; merClusIn<merClus.length; merClusIn++){
                        if(merClus[merClusIn]==theNeiClusIn){
                            merClus[merClusIn]=-2;
                        }
                    }
                }
            }
        }
    }
    console.log(this.trappedSequence);
    console.log("done");
}
i2xy(i){
    return [i%this.xMax, Math.floor(i/this.xMax)];
}
xy2i(x,y){
    return y*this.xMax+x;
}
drawSelf(sequence){
    this.sliderLock = true;
    for(let index = 0; index<this.area; index++){
        if(this.trappedSequence[index]<sequence&&this.trappedSequence[index]>=0){
            this.canvas.setPix(index,0);
            this.canvas.setPix(index,255,1);
        }else if(this.invadedSequence[index]<sequence){
            //this.setPix(index,Math.floor(255*this.invadedSequence[index]/(this.canvas.width*this.canvas.height)));
            this.canvas.setPix(index, 0);
        }else {
            //this.setPix(index,255);
            this.canvas.setPix(index,Math.floor(this.value[index]*64)+192);
        }
    }
    this.canvas.ct.putImageData(this.canvas.imageData,0,0);
    this.sliderLock = false;
}
}
console.log("Loaded: network.js");