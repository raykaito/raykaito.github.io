class VisionProgram_NumberReader{
    constructor(){
        //tells if the program has failed or not
        this.images;
        this.currentImageWorkingOn;
        this.stepOnTheCurrentImage;
        this.reset();
        //Images and guessed numbers for User Check
        this.imageAndNumber;//[Image(canvas),xi, yi (Number rea)]
        this.imageCount;
        this.dragging;
        this.draggedImageIndex;
        this.correctionList;
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
        ct.drawImage(img,0,0,img.width,img.height,(this.images[ci][1]+0.1)*side+offset,(this.images[ci][2]+1.1)*side,side*0.8,side*0.8);
        if(this.stepOnTheCurrentImage==7){
            const readNumber = this.images[ci][0].recognizeNumber();
            sudoku.scannerInput(this.images[ci][1],this.images[ci][2],readNumber);
            this.imageAndNumber[ci][2] = readNumber;
            this.currentImageWorkingOn++;
            this.stepOnTheCurrentImage=0;
        }
        if(this.currentImageWorkingOn==this.images.length){
            this.resetImageAndNumberX();
            return true;
        }
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
            ct.drawImage(img,0,0,img.width,img.height,(this.images[i][1]+0.1)*side+offset,(this.images[i][2]+1.1)*side,side*0.8,side*0.8);
            //ct.drawImage(img,(this.images[i][1]+1.1)*side,(this.images[i][2]+1.1)*side);//,side*0.8,side*0.8);
        }
    }
    resetImageAndNumberX(){
        this.imageCount = new Array(9).fill(0);
        for(let imgI=0;imgI<this.imageAndNumber.length;imgI++){
            const readNumber = this.imageAndNumber[imgI][2]
            this.imageAndNumber[imgI][1] = this.imageCount[readNumber-1];
            this.imageCount[readNumber-1]++;
        }
    }
    startCorrection(){
        this.dragging = false;
        this.correctionList = new Array();
    }
    endCorrection(){
        sudoku.phase = 0;
        slider.value = 0;
        for(let imgI = 0;imgI<this.imageAndNumber.length;imgI++){
            sudoku.scannerInput(this.images[imgI][1],this.images[imgI][2],this.imageAndNumber[imgI][2]);
        }
        sudoku.startSolving()
    }
    userInput(type,x,y){
        if(type=="touch"){
            if(y<1||y>9) return;
            this.dragging = true;
            let theImgIndex = undefined;
            for(let imgI = 0;imgI<this.imageAndNumber.length;imgI++){
                if(this.imageAndNumber[imgI][1]==x-1&&this.imageAndNumber[imgI][2]==y){
                    this.draggedImageIndex = imgI;
                    draw("",[this.draggedImageIndex,x*side,y*side]);
                }
            }
        }else if(type=="move"){
            draw("",[this.draggedImageIndex,x-side/2,y-side/2]);
        }else if(type=="release"){
            if(this.draggedImageIndex==undefined) return;
            if(y<1||y>9) return;
            this.imageAndNumber[this.draggedImageIndex][2] = y;
            this.resetImageAndNumberX();
            this.dragging = false;
            this.draggedImageIndex = undefined;
            draw("",[undefined]);
        }
    }
}