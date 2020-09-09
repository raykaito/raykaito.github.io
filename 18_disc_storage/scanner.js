class DiscScanner{
    constructor(video,canvasClass){
        //Get display canvas info
        this.displayCanvas = canvasClass.canvas;
        this.displayct = canvasClass.ct;
        this.displayCanvasWidth = this.displayCanvas.width;
        this.displayCanvasHeight= this.displayCanvas.height;
        this.video = video;

        //Create Canvas for Original Video Image
        this.originalCanvas = document.createElement("canvas");
        this.originalct = this.originalCanvas.getContext("2d");
        this.originalCanvasWidth = -1;
        this.originalCanvasHeight= -1;

        //Initialize Board Reader Class
        this.boardV = new VisionProgram_BoardReader();
        this.numberV= new VisionProgram_NumberReader();

        this.front=false;
        this.constraints = {
            audio:false,
            video:{
                width:150,
                height:150,
                facingMode:(this.front?"user":"environment")
            }
        };
        this.videoWidth = -1;
        this.videoHeight= -1;
    }
    handleSuccess(stream){
        this.video.srcObject = stream;
        const mediaSettings = stream.getTracks()[0].getSettings();
        this.videoWidth = mediaSettings.width;
        this.videoHeight= mediaSettings.height;
        console.log(mediaSettings);
        this.originalCanvasWidth = this.videoWidth;
        this.originalCanvasHeight= this.videoHeight;
        this.getVideoDisplayOffsetSettings();
        alert(this.video+","+this.croppedVideoXStart+","+this.croppedVideoYStart+","+this.croppedVideoWidth+","+this.croppedVideoHeight+","+0+","+0+","+this.displayCanvasWidth+","+this.displayCanvasHeight)
        alert(this.videoWidth+","+this.videoHeight+","+this.displayCanvasWidth+","+this.displayCanvasHeight);
        this.drawVideo();
    }
    getVideoDisplayOffsetSettings(){
        const croppedVideoHeight = this.videoWidth *this.displayCanvasHeight/this.displayCanvasWidth;
        const croppedVideoWidth  = this.videoHeight*this.displayCanvasWidth /this.displayCanvasHeight;
        if(croppedVideoHeight<=this.videoHeight){
            this.croppedVideoYStart = Math.floor((this.videoHeight-croppedVideoHeight)/2);
            this.croppedVideoXStart = 0;
            this.croppedVideoHeight= Math.floor(croppedVideoHeight);
            this.croppedVideoWidth = this.videoWidth;
        }else{
            this.croppedVideoXStart = Math.floor((this.videoWidth-croppedVideoWidth)/2);
            this.croppedVideoYStart = 0;
            this.croppedVideoWidth = Math.floor(croppedVideoWidth);
            this.croppedVideoHeight= this.videoHeight;
        }
    }
    startScan(){        
        navigator.mediaDevices.getUserMedia(this.constraints).then((stream)=>{this.handleSuccess(stream);});
    }
    stopScan(){
        let stream = this.video.srcObject;
        if(stream==null) return;
        let tracks = stream.getTracks();
        tracks.forEach(function(track) {
            track.stop();
        });
        this.video.srcObject = null;
    }
    drawVideo(){
        //adjust video size for display
        this.displayct.drawImage(this.video,this.croppedVideoXStart,this.croppedVideoYStart,this.croppedVideoWidth,this.croppedVideoHeight,0,0,this.displayCanvasWidth,this.displayCanvasHeight);
        //this.displayct.drawImage(this.video,this.croppedVideoXStart,this.croppedVideoYStart,this.croppedVideoWidth,this.croppedVideoHeight,0,0,this.displayCanvasWidth,this.displayCanvasHeight);
        //this.displayct.drawImage(this.video,0,0,this.videoWidth,this.videoHeight,0,0,this.displayCanvasWidth,this.displayCanvasHeight);
        //this.displayct.drawImage(this.video,0,0);
        requestAnimationFrame(()=>{this.drawVideo();});
    }
}
class Scanner{
    constructor(uploadImage = false,img){
        //Create Canvas for Original Video Image
        this.ocanvas = document.createElement("canvas");
        this.oct = this.ocanvas.getContext("2d");
        this.vLength = 0;

        //Initialize Board Reader Class
        this.boardV = new VisionProgram_BoardReader();
        this.numberV= new VisionProgram_NumberReader();

        if(uploadImage){
            this.img = img;
            this.drawImage();
        }else{
            this.front=false;
            this.constraints = {
                audio:false,
                video:{
                    //width:1920,
                    //height:1080,
                    width:4096,
                    height:2160,
                    facingMode:(this.front?"user":"environment")
                }
            };
            navigator.mediaDevices.getUserMedia(this.constraints).then((stream)=>{this.handleSuccess(stream);});
        }
    }
    handleSuccess(stream){
        video.srcObject = stream;
        this.resizeOcanvas(0);
        this.drawVideo();
    }
    stopVideo(){
        let stream = video.srcObject;
        let tracks = stream.getTracks();
        tracks.forEach(function(track) {
            track.stop();
        });
        video.srcObject = null;
    }
    drawImage(){
        animationStartTime = Date.now();
        const newWidth = Math.min(this.img.width,this.img.height);
        draw();
        if(newWidth!=this.vLength) this.resizeOcanvas(newWidth);
        this.oct.drawImage(this.img,this.sx,this.sy,this.vLength,this.vLength,0,0,this.vLength,this.vLength);
              //ct.drawImage(this.ocanvas,0,0,this.vLength,this.vLength,offset,side,side*9,side*9);
              ct.drawImage(this.ocanvas,0,0);//,this.vLength,this.vLength,offset,side,side*9,side*9);
        const result = this.boardV.startScan(this.ocanvas,this.oct,this.numberV);
        if(!result) requestAnimationFrame(()=>{this.drawImage();});
        else{
            draw();
            requestAnimationFrame(()=>{this.drawProgress();});
        }
    }
    drawVideo(){
        animationStartTime = Date.now();
        const newWidth = Math.min(video.videoWidth,video.videoHeight);
        if(newWidth==0){
            requestAnimationFrame(()=>{this.drawVideo();});
            return;
        }
        draw();
        if(newWidth!=this.vLength) this.resizeOcanvas(newWidth);
        this.oct.drawImage(video,this.sx,this.sy,this.vLength,this.vLength,0,0,this.vLength,this.vLength);
              //ct.drawImage(this.ocanvas,0,0,this.vLength,this.vLength,offset,side,side*9,side*9);
              ct.drawImage(video,0,0);//,this.vLength,this.vLength,offset,side,side*9,side*9);
        const result = this.boardV.startScan(this.ocanvas,this.oct,this.numberV);
        if(!result) requestAnimationFrame(()=>{this.drawVideo();});
        else{
            this.stopVideo();
            draw();
            requestAnimationFrame(()=>{this.drawProgress();});
        }
    }
    drawProgress(){
        animationStartTime = Date.now();
        let result = false;
        while(Date.now()-animationStartTime<60){
            result=this.numberV.makeProgress();
            if(result) break;
        }
        if(!result){
            requestAnimationFrame(()=>{this.drawProgress();});
        }else{
            draw();
            requestAnimationFrame(()=>{this.checkSudoku();});
        }
    }
    checkSudoku(){
        const solvable = sudoku.checkSolvability(false);
        if(solvable==false){
            alert("Scanning process might have failed. Drag and Drop to correct the mistake.");
            phase.changePhase("Correct Scanning Error");
            this.numberV.startCorrection();
        }else{
            phase.changePhase("User Solving");
        }

    }
    userInput(inputType, x, y){
        this.numberV.userInput(inputType, x, y);
    }
    draw(){
        this.numberV.draw();
    }
    resizeOcanvas(newVlength){
        this.vLength = newVlength;
        if(this.vLength!=0){
            if(video.videoWidth>video.videoHeight){
                this.sx = Math.ceil((video.videoWidth - video.videoHeight)/2);
                this.sy = 0;
            }else{
                this.sx = 0;
                this.sy = Math.ceil((video.videoHeight - video.videoWidth)/2);
            }
        }
        this.ocanvas.width = this.vLength;
        this.ocanvas.height= this.vLength;
        canvasScale = this.ocanvas.width/(side*9);
        console.log("Ocanvas Dim: ("+this.ocanvas.width+","+this.ocanvas.height+","+canvasScale+")");
    }
}