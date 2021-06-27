class ImageData{
    constructor(){
    }
    updateROI([imgIn,xpos,ypos,theta,dx,dy],imgOutInit="copy"){
        this.imgIn = {data:new Uint8ClampedArray(imgIn.width*imgIn.height*4)};
        this.imgIn.data.set(imgIn.data);
        this.xpos = xpos;
        this.ypos = ypos;
        this.width = imgIn.width;
        this.height= imgIn.height;
        this.theta= theta;
        this.imgOut = imgIn;
        this.dx = dx;
        this.dy = dy;
        if(imgOutInit!="copy"){
            for(let i=0;i<imgIn.data.length;i++){
                if(i%4==3){
                    this.imgOut.data[i]=255;
                }else{
                    this.imgOut.data[i]=imgOutInit;
                }
            }
        }
    }
    get passROI(){
        return [this.imgOut, this.xpos, this.ypos, this.theta,this.dx,this.dy];
    }
    prepareDisplayCanvas(){
        const tempCanvas = new Canvas();
        tempCanvas.resize(this.width,this.height);
        tempCanvas.ct.putImageData(this.imgOut,0,0);
        return [tempCanvas,this.xpos,this.ypos,this.theta];
    }
    odraw(){}
    ddraw(){}
    xy2i(xy,width=this.width){
        return Math.floor(xy[0])+width*Math.floor(xy[1]);
    }
    i2xy(i, width=this.width){
        return [i%width, Math.floor(i/width)];
    }
    setPixXY(indexIn, value, type="all"){this.setPixI(this.xy2i(indexIn),value,type);}
    getPixXY(imgIn, indexIn, type="all"){return this.getPixI(imgIn,this.xy2i(indexIn, imgIn.width),type);}
    setPixI(index, value, type="all"){
        //Set the pixel based on type
        if(type=="all"){
            this.imgOut.data[4*index  ] = value;
            this.imgOut.data[4*index+1] = value;
            this.imgOut.data[4*index+2] = value;
        }else{
            this.imgOut.data[4*index+type] = value;
        }
    }
    getPixI(imgIn,index,type="all"){
        //Get the pixel based on type
        if(type=="all"){
            return (imgIn.data[4*index]+imgIn.data[4*index+1]+imgIn.data[4*index+2])/3;
        }else{
            return imgIn.data[4*index+type];
        }
    }
    xy2i(xy,width=this.width){
        return Math.floor(xy[0])+width*Math.floor(xy[1]);
    }
    i2xy(i, width=this.width){
        return [i%width, Math.floor(i/width)];
    }
}

class FindBlob extends ImageData{
    constructor(){
        super();
    }
    updateROI(ROI){
        super.updateROI(ROI);
        this.area = this.width*this.height;
        this.blobMap  = new Array(this.area);
        this.blobInfo= new Array();//[Area, xMin, yMin, xMax, yMax, selected]
        this.blobNumber = 0;
        this.maxArea = 0;
        this.maxAreaIndex = 0;
    }
    selectBlob([x,y]){
        const blobInfoIndex = this.blobMap[this.xy2i([Math.floor(x-this.xpos),Math.floor(y-this.ypos)])]/10-1;
        if(blobInfoIndex>=0){
            this.blobInfo[blobInfoIndex][5]=1;
            this.extractBlobs();
        }
    }
    removeUnselected(){
        for(let i=0;i<this.area;i++){
            this.setPixI(i,0);
            if(this.blobMap[i]!=0){
                const blobInfoIndex = this.blobMap[i]/10-1;
                if(this.blobInfo[blobInfoIndex][5]){
                    this.setPixI(i,255,1);
                }
            }
        }
    }
    autoScanRemoveBorderAndExtractBlobs(ROI){
        this.updateROI(ROI);
        this.scanBlobs();
        this.removeEdges();
        this.extractBlobs();
    }
    autoScanAndExtractLargest(ROI){
        this.updateROI(ROI);
        this.scanBlobs();
        this.eraseSmallerBlobs();
        this.extractLargestBlob();
    }
    eraseSmallerBlobs(){
        for(let i=0;i<this.area;i++){
            if(this.getPixI(this.imgOut,i,1)==0&&this.blobMap[i]!=(10*(this.maxAreaIndex+1))){
                this.setPixI(i, 255, "all");
            }
        }
    }
    removeEdges(){
        let removeIndexList = new Array();
        for(let blobIndex=this.blobInfo.length-1;blobIndex>=0;blobIndex--){
            if(this.blobInfo[blobIndex][1]==0||
               this.blobInfo[blobIndex][2]==0||
               this.blobInfo[blobIndex][3]==this.width-1||
               this.blobInfo[blobIndex][4]==this.height-1){
                removeIndexList[removeIndexList.length] = blobIndex;
                this.blobInfo[blobIndex][0]=0;
                continue;
            }
        }
        for(let i=0;i<this.area;i++){
            if(this.getPixI(this.imgOut,i,0)==0) continue;
            for(let removeIndex=0;removeIndex<removeIndexList.length;removeIndex++){
                if(this.blobMap[i]==10*(1+removeIndexList[removeIndex])){
                    this.blobMap[i] = 0;
                    this.setPixI(i,0);
                    break;
                }
            }
        }
        this.maxAreaIndex = 0;
        this.maxArea = 0;
        for(let blobIndex=0;blobIndex<this.blobInfo.length;blobIndex++){
            if(this.blobInfo[blobIndex][0]>this.maxArea){
                this.maxAreaIndex = blobIndex;
                this.maxArea = this.blobInfo[blobIndex][0];
            }
        }
    }
    extractBlobs(){
        for(let i=0;i<this.area;i++){
            this.setPixI(i,0);
            if(this.blobMap[i]!=0){
                const blobInfoIndex = this.blobMap[i]/10-1;
                if(this.blobInfo[blobInfoIndex][5]){
                    this.setPixI(i,255,1);
                }else{
                    this.setPixI(i,255);
                }
            }
        }
    }
    extractLargestBlob(){
        for(let i=0;i<this.area;i++){
            this.setPixI(i,0);
            if(this.blobMap[i]==10*(1+this.maxAreaIndex)){
                this.setPixI(i,255);
            }
        }
    }
    scanBlobs(){
        //Init the information
        this.blobNumber = 0;
        for(let i=0;i<this.area;i++){
            this.blobMap[i]=0;
        }
        for(let i=0;i<this.area;i++){
            if(this.getPixI(this.imgOut,i,0)==255) continue;
            if(this.blobMap[i]!=0) continue;
            this.blobNumber++;

            //Set up variables
            let tx = new Array();//Temps[]
            let ty = new Array();//Temps[]
            let left, right;
            let tim = 0;            //Temp Index Maximum
            let tic = 0;            //Temp Index Current
            tx[0] = i%this.width;
            ty[0] = Math.floor(i/this.width);

            let area, xMin, yMin, xMax, yMax;
            area = 0;
            xMin = xMax = tx[0]; 
            yMin = yMax = ty[0];

            while(tim!=-1){
                //go up until the end
                while(ty[tic]>=0&&this.getPixXY(this.imgOut, [tx[tic],ty[tic]-1], 0)==0){
                    ty[tic]--;
                }

                //Trun off Left Right and check for yMin
                left  = false;
                right = false;
                yMin = Math.min(yMin,ty[tic]);
                while(ty[tic]<this.height&&this.getPixXY(this.imgOut, [tx[tic],ty[tic]], 0)==0){
                    //Travel down one by one
                    let index = this.xy2i([tx[tic],ty[tic]], this.imgOut.width);
                    this.blobMap[index] = this.blobNumber*10;
                    this.imgOut.data[4*index+0] = 255;
                    this.imgOut.data[4*index+1] = 0;
                    this.imgOut.data[4*index+2] = 255;
                    area++;

                    //Check for Cell on Left
                    if(tx[tic]>0){
                        if(left!=(this.getPixXY(this.imgOut, [tx[tic]-1,ty[tic]], 0)==0)){
                            left = !left;
                            if(left){
                                xMin = Math.min(xMin,tx[tic]-1);
                                ty.splice(0,0,ty[tic]);
                                tx.splice(0,0,tx[tic]-1);
                                tim++;
                                tic++;
                            }
                        }
                    }

                    //Check for Cell on Right
                    if(tx[tic]<this.width-1){
                        if(right!=(this.getPixXY(this.imgOut, [tx[tic]+1,ty[tic]], 0)==0)){
                            right = !right;
                            if(right){
                                xMax = Math.max(xMax,tx[tic]+1);
                                ty.splice(0,0,ty[tic]);
                                tx.splice(0,0,tx[tic]+1);
                                tim++;
                                tic++;
                            }
                        }
                    }
                    ty[tic]++;
                }
                yMax = Math.max(yMax,ty[tic]-1);
                tim--;
                tic=tim;
            }
            this.blobInfo[this.blobNumber-1] = [area, xMin, yMin, xMax, yMax, 0];
            if(area>this.maxArea){
                this.maxArea = area;
                this.maxAreaIndex = this.blobNumber-1;
            }
        }
    }
}

const average=(imgdata,xrange=1,yrange=1)=>{
    let imgHolder = {data: new Array(imgdata.width*imgdata.height*4)};
    let counter, tempR, tempG, tempB, index;
    for(let y=0;y<imgdata.height;y++){
        counter = tempR = tempG = tempB = 0;
        for(let x=-xrange;x<imgdata.width+xrange;x++){
            index = Math.floor(x)+imgdata.width*Math.floor(y);
            
            if(x+xrange<imgdata.width){
                counter++;
                tempR += imgdata.data[4*(index+xrange)+0];
                tempG += imgdata.data[4*(index+xrange)+1];
                tempB += imgdata.data[4*(index+xrange)+2];
            }
            
            if(x-xrange>=0){
                counter--;
                tempR -= imgdata.data[4*(index-xrange)+0];
                tempG -= imgdata.data[4*(index-xrange)+1];
                tempB -= imgdata.data[4*(index-xrange)+2];
            }
            if(x>=0&&x<imgdata.width){
                imgHolder.data[4*index  ] = tempR/counter;
                imgHolder.data[4*index+1] = tempG/counter;
                imgHolder.data[4*index+2] = tempB/counter;
            }
        }
    }
    for(let x=0;x<imgdata.width;x++){
        counter = tempR = tempG = tempB = 0;
        for(let y=-yrange;y<imgdata.height+yrange;y++){
            index = Math.floor(x)+imgdata.width*Math.floor(y);
            
            if(y+yrange<imgdata.height){
                counter++;
                tempR += imgHolder.data[4*(index+yrange*imgdata.width)+0];
                tempG += imgHolder.data[4*(index+yrange*imgdata.width)+1];
                tempB += imgHolder.data[4*(index+yrange*imgdata.width)+2];
            }
            
            if(y-yrange>=0){
                counter--;
                tempR -= imgHolder.data[4*(index-yrange*imgdata.width)+0];
                tempG -= imgHolder.data[4*(index-yrange*imgdata.width)+1];
                tempB -= imgHolder.data[4*(index-yrange*imgdata.width)+2];
            }
            if(y>=0&&y<imgdata.height){
                imgdata.data[4*index  ] = tempR/counter;
                imgdata.data[4*index+1] = tempG/counter;
                imgdata.data[4*index+2] = tempB/counter;
            }
        }
    }
}

console.log("Loaded: vision_program.js");