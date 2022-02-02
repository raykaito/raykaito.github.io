class Network{
constructor(xMax,yMax,canvas){
    this.canvas = canvas;
    //Initialize Canvas and its size
    this.xMax = xMax;
    this.yMax = yMax;
    this.area = xMax*yMax;
    this.percent = this.area/100;

    //index and location
    this.index = new Uint32Array(this.area);
}
resetNetwork(){
    //parameters for invasion percolation
    this.value = new Int32Array(this.area).fill(-1);
    this.qued  = new Uint8Array(this.area).fill( 0);
    this.invadedSequence = new Int32Array(this.area).fill(-1); //[1, this.area]
    this.breakthroughSequence = -1;
    this.sequence = -1;

    //parameters for trapping
    this.trappedSequence = new Int32Array(this.area).fill(-1);
    this.currentPercent = 0;

    //parameters for animation
    this.organizedInvadedSequence;
    this.maxOrganizedSequenceIndex;
    this.sequenceToIndex;
    this.lastDrawnSequence=-1;

    //HeapStructure
    this.queHeap = new heap(this.area);

    //Animation
    this.totalFrame = 600;
    this.currFrame = 0;
    this.passedBreakthrough = false;

    //Assign random Values
    this.sequence = 0;
    for(let i=0; i<this.area; i++){
        this.value[i] = Math.floor(Math.random()*2147483647);
    }
    console.log("assign random values done");
}
addQue(index){
    if(this.qued[index]) return;
    else{
        this.queHeap.addValueIndex(this.value[index],index);
        this.qued[index] = 1;
    }
}
setInletsTop(){
    for(let i=0; i<this.area; i++){
        if(this.i2xy(i)[1]==0){
            this.addQue(i);
        }
    }
}
setInletsLeft(){
    for(let i=0; i<this.area; i++){
        if(this.i2xy(i)[0]==0){
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
        if(this.sequence/this.percent>this.currentPercent){
            this.currentPercent++;
            console.log("progress:"+this.currentPercent);
        }

        //Get nextSiteInfromation
        const invadedSiteIndex = this.queHeap.popValueIndex();
        const invadedSiteXY = this.i2xy(invadedSiteIndex);
        this.invadedSequence[invadedSiteIndex] = this.sequence;
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
applyTrapping(){
    //getReverseOrderIndex
    let reverseOrderIndex = new Uint32Array(this.area+1);
    for(let i=0; i<this.area; i++){
        reverseOrderIndex[this.invadedSequence[i]] = i;
    }

    //Cluster Information
    let clusterLabel = new Int8Array(this.area).fill(-1);

    for(let sequence=this.area; sequence>0; sequence--){
        //Get next site index and XY
        const nextSiteIndex = reverseOrderIndex[sequence];
        const nextSiteXY = this.i2xy(nextSiteIndex);

        //check for neighboring clusters and get their index
        const xNeighbor = [nextSiteXY[0]+1 ,nextSiteXY[0]   ,nextSiteXY[0]-1 ,nextSiteXY[0]  ];
        const yNeighbor = [nextSiteXY[1]   ,nextSiteXY[1]+1 ,nextSiteXY[1]   ,nextSiteXY[1]-1];

        //Check each direction and check for Sink
        let sinkFound = false;
        for(let direction=0;direction<4;direction++){
            if(xNeighbor[direction]>=this.xMax ||xNeighbor[direction]<0||yNeighbor[direction]>=this.yMax ||yNeighbor[direction]<0){
                //Now its part of a sink
                sinkFound = true;
                break;
            }
            //Check if neighbor is Sink
            const neiSiteIn = this.xy2i(xNeighbor[direction], yNeighbor[direction]);
            const neiClusLabel = clusterLabel[neiSiteIn];
            if(neiClusLabel==-2){
                sinkFound = true;
                break;
            }
        }
        if(sinkFound){
            //Sink is found
            for(let direction=0;direction<4;direction++){
                const neiSiteIn = this.xy2i(xNeighbor[direction], yNeighbor[direction]);
                const neiClusLabel = clusterLabel[neiSiteIn];
                if(neiClusLabel==0){
                    //Trapped! Fill the cluster

                    //Set up variables
                    let tx = new Array();//Temps[]
                    let ty = new Array();//Temps[]
                    let left, right;
                    let tim = 0;            //Temp Index Maximum
                    let tic = 0;            //Temp Index Current
                    tx[0] = xNeighbor[direction];
                    ty[0] = yNeighbor[direction];

                    while(tim!=-1){
                        //go up until the end
                        while(ty[tic]>=0&&clusterLabel[this.xy2i(tx[tic],ty[tic]-1)]==0){
                            ty[tic]--;
                        }

                        //Trun off Left Right and check for yMin
                        left  = false;
                        right = false;
                        while(ty[tic]<this.yMax&&clusterLabel[this.xy2i(tx[tic],ty[tic])]==0){
                            //Travel down one by one
                            let index = this.xy2i(tx[tic],ty[tic]);
                            clusterLabel[index] = -2;
                            this.trappedSequence[index] = sequence;

                            //Check for Cell on Left
                            if(tx[tic]>0){
                                if(left!=(clusterLabel[this.xy2i(tx[tic]-1,ty[tic])]==0)){
                                    left = !left;
                                    if(left){
                                        ty.splice(0,0,ty[tic]);
                                        tx.splice(0,0,tx[tic]-1);
                                        tim++;
                                        tic++;
                                    }
                                }
                            }

                            //Check for Cell on Right
                            if(tx[tic]<this.xMax-1){
                                if(right!=(clusterLabel[this.xy2i(tx[tic]+1,ty[tic])]==0)){
                                    right = !right;
                                    if(right){
                                        ty.splice(0,0,ty[tic]);
                                        tx.splice(0,0,tx[tic]+1);
                                        tim++;
                                        tic++;
                                    }
                                }
                            }
                            ty[tic]++;
                        }
                        tim--;
                        tic=tim;
                    }
                }
            }
            clusterLabel[nextSiteIndex] = -2;
        }else{
            clusterLabel[nextSiteIndex] = 0;
        }
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
        this.canvas.setRandomColor(index,this.trappedSequence[index]);
    }else if(this.invadedSequence[index]<sequence){
        this.canvas.setPix(index,Math.floor(255*this.invadedSequence[index]/(this.canvas.width*this.canvas.height)));
    }else {
        this.canvas.setPix(index,Math.floor(this.value[index]*64/2147483647)+192);
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
        this.drawSelf(this.breakthroughSequence,true);
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