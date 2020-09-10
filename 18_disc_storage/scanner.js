class DiscScanner{
    constructor(video,displayCanvas){
        //Get display canvas info
        this.dCanvas = displayCanvas;
        this.oCanvas = new Canvas();
        this.oCanvas.appendSelf();
        this.video = video;
        this.video.setAttribute('autoplay', '');
        this.video.setAttribute('muted', '');
        this.video.setAttribute('playsinline', '');

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

        //Animation Properties
        this.animeRequest;

        //Initialize visionProgram
        this.vProgram = new VisionProgram();
    }
    handleSuccess(stream){
        this.video.srcObject = stream;
        const mediaSettings = stream.getTracks()[0].getSettings();
        this.videoWidth = mediaSettings.width;
        this.videoHeight= mediaSettings.height;
        log([this.videoWidth,this.videoHeight]);
        this.oCanvas.resize(this.videoWidth,this.videoHeight/2);
        this.drawVideo();
    }
    startScan(){        
        navigator.mediaDevices.getUserMedia(this.constraints).then((stream)=>{this.handleSuccess(stream);});
    }
    stopScan(){
        let stream = this.video.srcObject;
        if(stream==null) return;
        cancelAnimationFrame(this.animeRequest);
        let tracks = stream.getTracks();
        tracks.forEach(function(track) {
            track.stop();
        });
        this.video.srcObject = null;
    }
    drawVideo(){
        this.oCanvas.drawImage(this.video,0,this.videoHeight/4,this.videoWidth,this.videoHeight/2);
        this.dCanvas.drawImage(this.video,0,this.videoHeight/4,this.videoWidth,this.videoHeight/2);
        this.animeRequest = requestAnimationFrame(()=>{this.drawVideo();});
    }
}
console.log("Loaded: scanner.js");