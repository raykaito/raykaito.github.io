class Network{
constructor(xMax,yMax,canvas){
    this.canvas = canvas;
    //Initialize Canvas and its size
    this.xMax = xMax;
    this.yMax = yMax;
    this.area = xMax*yMax;

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
    this.breakthroughSequence = -1;
    this.sequence = -1;

    //parameters for trapping
    this.clusterIndex = new Int32Array(this.area).fill(-1);// [0, clusterCount-1]
    this.trappedSequence = new Int32Array(this.area).fill(-1);
    this.trappedSequence2 = new Int32Array(this.area).fill(-1);

    //parameters for animation
    this.organizedInvadedSequence;
    this.maxOrganizedSequenceIndex;
    this.sequenceToIndex;
    this.lastDrawnSequence=-1;

    //HeapStructure
    this.queHeap = new heap();

    //Animation
    this.totalFrame = 600;
    this.currFrame = 0;
    this.passedBreakthrough = false;
}
assignRandomValues(){
    this.sequence = 0;
    for(let i=0; i<this.area; i++){
        this.value[i] = Math.random();
    }
    console.log("assign random values done");
}
addQue(index){
    if(this.quedSequence[index]!=-1) return;
    else{
        this.queHeap.addValueIndex(this.value[index],index);
        this.quedSequence[index] = this.sequence;
    }
}
setInletsTop(){
    for(let i=0; i<this.area; i++){
        if(this.yPosition[i]==0){
            this.addQue(i);
        }
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
        if(this.breakthroughSequence==-1){
            if(invadedSiteXY[1]==this.yMax-1){
                this.breakthroughSequence = this.sequence;
            }
        }

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
    console.log("invasion percolation done");
}
applyTrapping2(){
    //getReverseOrderIndex
    let reverseOrderIndex = new Uint32Array(this.area+1);
    for(let i=0; i<this.area; i++){
        reverseOrderIndex[this.invadedSequence[i]] = i;
    }

    //Cluster Information
    let clusterSeq = new Int32Array(this.area).fill(-1);
    let clusterLabel = new Int32Array(this.area).fill(-1);
    let nextClusterLabel = 0;
    let nextConfirmedClusterIndex = 0;

    for(let sequence=this.area; sequence>0; sequence--){
        //Get next site index and XY
        const nextSiteIndex = reverseOrderIndex[sequence];
        const nextSiteXY = this.i2xy(nextSiteIndex);

        //Initialize Variables
        let sinkFound = false;
        let neiClusCou = 0;
        let neiClusSeqList = new Array();
        let neiClusLabelList = new Array();
        //let message = ("Seq:"+sequence+" ("+nextSiteXY[0]+","+nextSiteIndex+")");

        //check for neighboring clusters and get their index
        const xNeighbor = [nextSiteXY[0]+1 ,nextSiteXY[0]   ,nextSiteXY[0]-1 ,nextSiteXY[0]  ];
        const yNeighbor = [nextSiteXY[1]   ,nextSiteXY[1]+1 ,nextSiteXY[1]   ,nextSiteXY[1]-1];

        //Check each direction and check for Sink and Clusters
        for(let direction=0;direction<4;direction++){
            if(xNeighbor[direction]>=this.xMax ||xNeighbor[direction]<0||yNeighbor[direction]>=this.yMax ||yNeighbor[direction]<0){
                //Now its part of a sink
                sinkFound = true;
                continue;
            }

            //Get Cluster index
            const neiSiteIn = this.xy2i(xNeighbor[direction], yNeighbor[direction]);
            const neiClusSeq = clusterSeq[neiSiteIn];
            const neiClusLabel = clusterLabel[neiSiteIn];

            //identify the cluster
            if(neiClusLabel!=-1){
                if(neiClusLabel==-2){
                    sinkFound = true;
                }else{
                    let duplicate = false;
                    for(let labelIn = 0; labelIn<neiClusCou; labelIn++){
                        if(neiClusLabelList[labelIn]==neiClusLabel){
                            duplicate = true;
                            break;
                        }
                    }
                    if(duplicate){
                        continue;
                    }else{
                        neiClusSeqList[neiClusCou] = neiClusSeq;
                        neiClusLabelList[neiClusCou] = neiClusLabel;
                        neiClusCou++;
                    }
                }
            }
        }
        if(sinkFound){
            //message+="    Sink";
            if(neiClusCou==0){
                //New sink
                //message+=" No Clus";
                clusterLabel[nextSiteIndex] = -2;
            }else{
                //Trapping and expansion of a sink
                //message+=" ClusCou:"+neiClusCou;
                clusterLabel[nextSiteIndex] = -2;
                for(let neiClusSeqIn = 0; neiClusSeqIn<neiClusCou; neiClusSeqIn++){
                    let counter=0;
                    let currClusSite = neiClusSeqList[neiClusSeqIn];
                    let alreadyTrapped = false;
                    while(clusterLabel[currClusSite]!=-2){
                        counter++;
                        clusterLabel[currClusSite] = -2;
                        if(!alreadyTrapped&&this.trappedSequence[currClusSite]!=-1){
                            //message+="alreadyTrappedAt"+this.trappedSequence[currClusSite];
                            alreadyTrapped=true;
                        }
                        this.clusterIndex[currClusSite] = nextConfirmedClusterIndex;
                        this.trappedSequence[currClusSite] = sequence;
                        currClusSite = clusterSeq[currClusSite];
                    }
                    //message+="ClusCount:"+counter;
                    nextConfirmedClusterIndex++;
                }
            }
        }else{
            //message+= " No Sink";
            if(neiClusCou==0){
                //message+=" newClus";
                clusterSeq[nextSiteIndex] = nextSiteIndex;
                clusterLabel[nextSiteIndex] = nextClusterLabel;
                nextClusterLabel++;
            }else if(neiClusCou==1){
                //message+=" expand";
                clusterLabel[nextSiteIndex] = neiClusLabelList[0];
                clusterSeq[nextSiteIndex] = clusterSeq[neiClusSeqList[0]];
                clusterSeq[neiClusSeqList[0]] = nextSiteIndex;
                //message+=" Swapped";
            }else{
                //message+=" union";
                const unionLabel = neiClusLabelList[0];
                clusterSeq[nextSiteIndex] = nextSiteIndex;
                clusterLabel[nextSiteIndex] = unionLabel; 
                for(let neiClusSeqIn = 0; neiClusSeqIn<neiClusCou; neiClusSeqIn++){
                    const temp = clusterSeq[nextSiteIndex];
                    clusterSeq[nextSiteIndex] = clusterSeq[neiClusSeqList[neiClusSeqIn]];
                    clusterSeq[neiClusSeqList[neiClusSeqIn]] = temp;
                    //Update label if Index>0
                    if(neiClusSeqIn>0){
                        let counter = 0;
                        let currClusSite = clusterSeq[nextSiteIndex];
                        while(clusterLabel[currClusSite]!=unionLabel){
                            counter++;
                            clusterLabel[currClusSite] = unionLabel;
                            currClusSite = clusterSeq[currClusSite];
                        }
                        //message+=" relabelCount:"+counter;
                    }
                    //message+=" Swapped";
                }                
            }
        }
        //console.log(message);
    }
    console.log("Apply trapping done");
}
applyTrapping(){
    //getReverseOrderIndex
    let reverseOrderIndex = new Uint32Array(this.area+1);
    for(let i=0; i<this.area; i++){
        reverseOrderIndex[this.invadedSequence[i]] = i;
    }

    //Cluster Information
    let clusterSeq = new Int32Array(this.area).fill(-1);
    let clusterLabel = new Int32Array(this.area).fill(-1);
    let nextClusterLabel = 0;
    let nextConfirmedClusterIndex = 0;

    for(let sequence=this.area; sequence>0; sequence--){
        //Get next site index and XY
        const nextSiteIndex = reverseOrderIndex[sequence];
        const nextSiteXY = this.i2xy(nextSiteIndex);

        //Initialize Variables
        let sinkFound = false;
        let neiClusCou = 0;
        let neiClusSeqList = new Array();
        let neiClusLabelList = new Array();
        //let message = ("Seq:"+sequence+" ("+nextSiteXY[0]+","+nextSiteIndex+")");

        //check for neighboring clusters and get their index
        const xNeighbor = [nextSiteXY[0]+1 ,nextSiteXY[0]   ,nextSiteXY[0]-1 ,nextSiteXY[0]  ];
        const yNeighbor = [nextSiteXY[1]   ,nextSiteXY[1]+1 ,nextSiteXY[1]   ,nextSiteXY[1]-1];

        //Check each direction and check for Sink and Clusters
        for(let direction=0;direction<4;direction++){
            if(xNeighbor[direction]>=this.xMax ||xNeighbor[direction]<0||yNeighbor[direction]>=this.yMax ||yNeighbor[direction]<0){
                //Now its part of a sink
                sinkFound = true;
                continue;
            }

            //Get Cluster index
            const neiSiteIn = this.xy2i(xNeighbor[direction], yNeighbor[direction]);
            const neiClusSeq = clusterSeq[neiSiteIn];
            const neiClusLabel = clusterLabel[neiSiteIn];

            //identify the cluster
            if(neiClusLabel!=-1){
                if(neiClusLabel==-2){
                    sinkFound = true;
                }else{
                    let duplicate = false;
                    for(let labelIn = 0; labelIn<neiClusCou; labelIn++){
                        if(neiClusLabelList[labelIn]==neiClusLabel){
                            duplicate = true;
                            break;
                        }
                    }
                    if(duplicate){
                        continue;
                    }else{
                        neiClusSeqList[neiClusCou] = neiClusSeq;
                        neiClusLabelList[neiClusCou] = neiClusLabel;
                        neiClusCou++;
                    }
                }
            }
        }
        if(sinkFound){
            //message+="    Sink";
            if(neiClusCou==0){
                //New sink
                //message+=" No Clus";
                clusterLabel[nextSiteIndex] = -2;
            }else{
                //Trapping and expansion of a sink
                //message+=" ClusCou:"+neiClusCou;
                clusterLabel[nextSiteIndex] = -2;
                for(let neiClusSeqIn = 0; neiClusSeqIn<neiClusCou; neiClusSeqIn++){
                    let counter=0;
                    let currClusSite = neiClusSeqList[neiClusSeqIn];
                    let alreadyTrapped = false;
                    while(clusterLabel[currClusSite]!=-2){
                        counter++;
                        clusterLabel[currClusSite] = -2;
                        if(!alreadyTrapped&&this.trappedSequence[currClusSite]!=-1){
                            //message+="alreadyTrappedAt"+this.trappedSequence[currClusSite];
                            alreadyTrapped=true;
                        }
                        this.clusterIndex[currClusSite] = nextConfirmedClusterIndex;
                        this.trappedSequence[currClusSite] = sequence;
                        currClusSite = clusterSeq[currClusSite];
                    }
                    //message+="ClusCount:"+counter;
                    nextConfirmedClusterIndex++;
                }
            }
        }else{
            //message+= " No Sink";
            if(neiClusCou==0){
                //message+=" newClus";
                clusterSeq[nextSiteIndex] = nextSiteIndex;
                clusterLabel[nextSiteIndex] = nextClusterLabel;
                nextClusterLabel++;
            }else if(neiClusCou==1){
                //message+=" expand";
                clusterLabel[nextSiteIndex] = neiClusLabelList[0];
                clusterSeq[nextSiteIndex] = clusterSeq[neiClusSeqList[0]];
                clusterSeq[neiClusSeqList[0]] = nextSiteIndex;
                //message+=" Swapped";
            }else{
                //message+=" union";
                const unionLabel = neiClusLabelList[0];
                clusterSeq[nextSiteIndex] = nextSiteIndex;
                clusterLabel[nextSiteIndex] = unionLabel; 
                for(let neiClusSeqIn = 0; neiClusSeqIn<neiClusCou; neiClusSeqIn++){
                    const temp = clusterSeq[nextSiteIndex];
                    clusterSeq[nextSiteIndex] = clusterSeq[neiClusSeqList[neiClusSeqIn]];
                    clusterSeq[neiClusSeqList[neiClusSeqIn]] = temp;
                    //Update label if Index>0
                    if(neiClusSeqIn>0){
                        let counter = 0;
                        let currClusSite = clusterSeq[nextSiteIndex];
                        while(clusterLabel[currClusSite]!=unionLabel){
                            counter++;
                            clusterLabel[currClusSite] = unionLabel;
                            currClusSite = clusterSeq[currClusSite];
                        }
                        //message+=" relabelCount:"+counter;
                    }
                    //message+=" Swapped";
                }                
            }
        }
        //console.log(message);
    }
    console.log("Apply trapping done");
}
organizeInvadedSequence(){
    //Get untrapped Inv Seq where trapped will be -1
    let untrappedInvasionSequence = new Int32Array(this.area).fill(-1);
    let sequenceCounter = 0;
    for(let siteIndex = 0; siteIndex<this.area; siteIndex++){
        if(this.trappedSequence[siteIndex]==-1){
            untrappedInvasionSequence[this.invadedSequence[siteIndex]] = this.invadedSequence[siteIndex];
            sequenceCounter++;
        }
    }
    //Get organized Inv Seq which skips trapped
    this.organizedInvadedSequence = new Int32Array(sequenceCounter).fill(-1);
    this.maxOrganizedSequenceIndex = sequenceCounter-1;
    let absoluteSequence = 0;
    for(let sequence = 0; sequence<sequenceCounter; sequence++){
        while(untrappedInvasionSequence[absoluteSequence]==-1){
            absoluteSequence++;
        }
        this.organizedInvadedSequence[sequence] = absoluteSequence;
        absoluteSequence++;
    }
    //Get seuqnceToIndex which tells index to change from seq
    this.sequenceToIndex = new Array(this.area);
    for(let index = 0; index < this.area; index++){
        this.sequenceToIndex[index] = new Array();
    }
    for(let index = 0; index < this.area; index++){
        if(this.trappedSequence[index]==-1){
            const seq = this.invadedSequence[index];
            const nextSeqIndex = this.sequenceToIndex[seq].length;
            this.sequenceToIndex[seq][nextSeqIndex] = index;
        }else{
            const seq = this.trappedSequence[index];
            const nextSeqIndex = this.sequenceToIndex[seq].length;
            this.sequenceToIndex[seq][nextSeqIndex] = index;
        }
    }

    console.log("Organize Invasion Sequence done");
}
i2xy(i){
    return [i%this.xMax, Math.floor(i/this.xMax)];
}
xy2i(x,y){
    return y*this.xMax+x;
}
drawSelf(sequence=this.area+1,partialUpdate = false){
    if(partialUpdate&&this.lastDrawnSequence!=-1){
        for(let seq = this.lastDrawnSequence+1;seq<=sequence;seq++){
            for(let indexListIndex=0;indexListIndex<this.sequenceToIndex[seq].length;indexListIndex++){
                const index = this.sequenceToIndex[seq][indexListIndex];
                this.updateIndex(index,sequence);  
            }
        }
    }else{
        for(let index = 0; index<this.area; index++){
            this.updateIndex(index,sequence);
        }
    }
    this.lastDrawnSequence = sequence;
    this.canvas.ct.putImageData(this.canvas.imageData,0,0);
}
updateIndex(index,sequence){
    if(this.trappedSequence[index]<sequence&&this.trappedSequence[index]>=0){
        if(mode==0){
            this.canvas.setRandomColor(index,this.trappedSequence[index]);
        }else{
            this.canvas.setPix(index,255);
        }
    }else if(this.invadedSequence[index]<sequence){
        this.canvas.setPix(index,Math.floor(255*this.invadedSequence[index]/(this.canvas.width*this.canvas.height)));
    }else {
        this.canvas.setPix(index,Math.floor(this.value[index]*64)+192);
    }
}
startAnimation(){
    const timeStart = Date.now();
    if(this.currFrame==this.totalFrame){
        this.drawSelf(this.area+1);
        console.log("Animation Done");
        return;
    }
    const organizedSequenceIndex = Math.floor(this.currFrame/this.totalFrame*(this.maxOrganizedSequenceIndex));
    const sequence = this.organizedInvadedSequence[organizedSequenceIndex];
    if(!this.passedBreakthrough&&sequence>this.breakthroughSequence){
        this.drawSelf(this.breakthroughSequence);
        this.passedBreakthrough = true;
        setTimeout(()=>{this.startAnimation();},1500);
    }else{
        this.drawSelf(sequence,true);
        this.currFrame++;
        this.animationRequest = requestAnimationFrame(()=>{this.startAnimation();});
    }
    on("Delay:"+(Date.now()-timeStart));
}
}
console.log("Loaded: network.js");