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

        this.front=false;
        this.constraints = {
            audio:false,
            video:{
                width:800,
                height:800,
                facingMode:(this.front?"user":"environment")
            }
        };
        this.videoWidth = -1;
        this.videoHeight= -1;

        //Initialize visionProgram
        this.vProgram = new VisionProgram_CodeLocator();
    }
    handleSuccess(stream){
        this.video.srcObject = stream;
        const mediaSettings = stream.getTracks()[0].getSettings();
        this.videoWidth = mediaSettings.width;
        this.videoHeight= mediaSettings.height;
        console.log(stream.getTracks()[0]);
        this.originalCanvasWidth = this.videoWidth;
        this.originalCanvasHeight= Math.floor(this.videoHeight/2);
        this.originalCanvas.width = this.originalCanvasWidth;
        this.originalCanvas.height= this.originalCanvasHeight;
        this.drawVideo();
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
        //this.displayct.drawImage(this.video,this.croppedVideoXStart,this.croppedVideoYStart,this.croppedVideoWidth,this.croppedVideoHeight,0,0,this.displayCanvasWidth,this.displayCanvasHeight);
        this.originalct.drawImage(this.video,0,this.videoHeight/4,this.videoWidth,this.videoHeight/2,0,0,this.originalCanvasWidth,this.originalCanvasHeight);
        this.displayct.drawImage(this.originalCanvas,0,0,this.originalCanvasWidth,this.originalCanvasHeight,0,0,this.displayCanvasWidth,this.displayCanvasHeight);
        requestAnimationFrame(()=>{this.drawVideo();});
    }
}
console.log("Loaded: scanner.js");