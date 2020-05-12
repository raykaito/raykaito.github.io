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
        //Make a progress
        const ci = this.currentImageWorkingOn;
        const st = this.stepOnTheCurrentImage;
        switch(st){
            case 0: this.images[ci][0] = new Binarize(this.images[ci][0].passdata); break;
            case 1: this.images[ci][0] = new FindBlob(this.images[ci][0].passdata,1); break;
            case 2: this.images[ci][0].eraseSmallerBlobs(); break;
        }
        this.stepOnTheCurrentImage++;
        for(let i=0;i<this.images.length;i++){
            const img = this.images[i][0].updateDisplayImage();
            ct.drawImage(img,0,0,img.width,img.height,(this.images[i][1]+1.1)*side,(this.images[i][2]+1.1)*side,side*0.8,side*0.8);
            //ct.drawImage(this.images[i][0],(this.images[i][1]+1.1)*side,(this.images[i][2]+1.1)*side);//,side*0.8,side*0.8);
        }
        if(this.stepOnTheCurrentImage==3){
            this.currentImageWorkingOn++;
            this.stepOnTheCurrentImage=0;
        }
        if(this.currentImageWorkingOn==this.images.length) return true;
        return false;
    }
}