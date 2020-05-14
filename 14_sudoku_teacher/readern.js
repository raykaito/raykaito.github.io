class VisionProgram_NumberReader{
    constructor(){
        //tells if the program has failed or not
        this.images;
        this.currentImageWorkingOn;
        this.stepOnTheCurrentImage;
    }
    reset(){
        this.images = new Array();
        this.currentImageWorkingOn = 0;
        this.stepOnTheCurrentImage = 0;
    }
    makeProgress(){
        this.stepOnTheCurrentImage++;
        //Make a progress
        const ci = this.currentImageWorkingOn;
        const st = this.stepOnTheCurrentImage;
        switch(st){
            case 1: this.images[ci][0] = new Binarize(this.images[ci][0].passdata); break;
            case 2: this.images[ci][0] = new FindBlob(this.images[ci][0].passdata,1); break;
            case 3: this.images[ci][0].eraseSmallerBlobs(); break;
            case 4: this.images[ci][0] = new DistanceTransform(this.images[ci][0].passdata,1); break;
            case 5: this.images[ci][0] = new Skeltonize(this.images[ci][0].passdata); break;
            case 6: this.images[ci][0] = new NumberReader(this.images[ci][0].passdata); break;
        }
        if(this.stepOnTheCurrentImage==6){
            sudoku.userInput(this.images[ci][1],this.images[ci][2],this.images[ci][0].recognizeNumber());
            console.log(this.images[ci][0].recognizeNumber());
            this.currentImageWorkingOn++;
            this.stepOnTheCurrentImage=0;
        }else if(this.stepOnTheCurrentImage==1){
            console.log("XXXXXXXX     "+(this.images[ci][1]+1)+"     XXXXXXXX");
        }
        if(this.currentImageWorkingOn==this.images.length) return true;
        return false;
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
}