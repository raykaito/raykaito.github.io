class DiscScanner{
    constructor(video,displayCanvas){
        //Get display canvas info
        this.dCanvas = displayCanvas;
        this.oCanvas = new Canvas();
        this.oCanvas.appendSelf();
        this.video = video;

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
        console.log(this.videoWidth,this.videoHeight);
        this.oCanvas.resize(this.videoWidth,this.videoHeight/2);
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
        log([this.video,0,this.videoHeight/4,this.videoWidth,this.videoHeight/2]);
        //this.displayct.drawImage(this.video,this.croppedVideoXStart,this.croppedVideoYStart,this.croppedVideoWidth,this.croppedVideoHeight,0,0,this.displayCanvasWidth,this.displayCanvasHeight);
        this.oCanvas.drawImage(this.video,0,this.videoHeight/4,this.videoWidth,this.videoHeight/2);
        this.dCanvas.drawImage(this.video,0,this.videoHeight/4,this.videoWidth,this.videoHeight/2);
        requestAnimationFrame(()=>{this.drawVideo();});
    }
}
console.log("Loaded: scanner.js");