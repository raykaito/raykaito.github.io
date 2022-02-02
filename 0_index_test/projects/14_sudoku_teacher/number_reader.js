class VisionProgram_NumberReader{
    constructor(){
        //tells if the program has failed or not
        this.images;
        this.currentImageWorkingOn;
        this.stepOnTheCurrentImage;
        this.reset();
        //Images and guessed numbers for User Check
        this.imageAndNumber;//[Image(canvas),Number read]
    }
    reset(){
        this.images = new Array();
        this.imageAndNumber = new Array();
        this.currentImageWorkingOn = 0;
        this.stepOnTheCurrentImage = 0;
    }
    makeProgress(){
        this.stepOnTheCurrentImage++;
        //Make a progress
        const ci = this.currentImageWorkingOn;
        const st = this.stepOnTheCurrentImage;
        if(st==1){
            this.imageAndNumber[ci] = new Array(2);
            this.imageAndNumber[ci][0] = this.images[ci][0].updateDisplayImage();
            if(recordMode) this.record(0,ci);
        }
        switch(st){
            case 1: this.images[ci][0] = new Binarize(this.images[ci][0].passdata); break;
            case 2: this.images[ci][0] = new EdgeFree(this.images[ci][0].passdata); break;
            case 3: this.images[ci][0] = new FindBlob(this.images[ci][0].passdata,1); break;
            case 4: this.images[ci][0].eraseSmallerBlobs(); break;
            case 5: this.images[ci][0] = new DistanceTransform(this.images[ci][0].passdata,1); break;
            case 6: this.images[ci][0] = new Skeltonize(this.images[ci][0].passdata); break;
            case 7: this.images[ci][0] = new NumberReader(this.images[ci][0].passdata); break;
        }
        if(recordMode) this.record(st,ci);
        const img = this.images[ci][0].updateDisplayImage();
        ct.drawImage(img,0,0,img.width,img.height,(this.images[ci][1]+1.1)*side,(this.images[ci][2]+1.1)*side,side*0.8,side*0.8);
        if(this.stepOnTheCurrentImage==7){
            const readNumber = this.images[ci][0].recognizeNumber();
            sudoku.userInput(this.images[ci][1],this.images[ci][2],readNumber);
            this.imageAndNumber[ci][1] = readNumber;
            this.currentImageWorkingOn++;
            this.stepOnTheCurrentImage=0;
        }
        if(this.currentImageWorkingOn==this.images.length) return true;
        return false;
    }
    record(st,ci){
        const img = this.images[ci][0].updateDisplayImage();
        rct.drawImage(img,(st+1)*33+1,ci*33+1);
        if(st==7){
            rct.fillStyle = "white";
            rct.fillRect(1,ci*33+1,32,32);
            rct.font = "30px Arial";
            rct.fillStyle = "black";
            rct.textAlign = "center";
            rct.textBaseline = "middle";
            rct.fillText(this.images[ci][0].recognizeNumber(),16,ci*33+16);
        }
    }
    draw(){
        for(let i=0;i<this.images.length;i++){
            if(i<this.currentImageWorkingOn) continue;
            const img = this.images[i][0].updateDisplayImage();
            //this.images[i][0].display(false);
            ct.drawImage(img,0,0,img.width,img.height,(this.images[i][1]+1.1)*side,(this.images[i][2]+1.1)*side,side*0.8,side*0.8);
            //ct.drawImage(img,(this.images[i][1]+1.1)*side,(this.images[i][2]+1.1)*side);//,side*0.8,side*0.8);
        }
    }
    userInput(type,x,y){
        if(type=="touch"){
            //this
        }else if(type=="move"){
            //this
        }else if(type=="release"){
            //this
        }
    }
    userCheck(){
        drawGrids();
        alert("Scanning process might have failed. Drag and Drop to correct the mistake.");
        let imageCount = new Array(9).fill(0);
        for(let imgI=0;imgI<this.imageAndNumber.length;imgI++){
            const readNumber = this.imageAndNumber[imgI][1];
            const img = this.imageAndNumber[imgI][0];
            const y=readNumber-1;
            const x=imageCount[readNumber-1];
            ct.drawImage(img,0,0,img.width,img.height,(x+1.1)*side,(y+1.1)*side,side*0.8,side*0.8);
            imageCount[readNumber-1]++;
        }
        for(let i=0;i<9;i++) drawNumber(0,i+1,i+1,"red");
    }
}