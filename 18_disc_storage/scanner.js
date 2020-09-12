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

        //Animation Properties
        this.animeRequest;

        //Initialize visionProgram
        this.vProgram = new VisionProgram(this.oCanvas,this.dCanvas);
    }
    handleSuccess(stream){
        this.video.srcObject = stream;
        const mediaSettings = stream.getTracks()[0].getSettings();
        this.videoWidth = mediaSettings.width;
        this.videoHeight= mediaSettings.height;
        this.oCanvas.resize(this.videoWidth,this.videoHeight/2);
        this.vProgram.resizeOcanvas(this.videoWidth,this.videoHeight/2)
        this.oCanvas.resizeStyle(this.videoWidth,this.videoHeight/2,true);
        this.video.play();
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
        this.vProgram.run();
        this.animeRequest = requestAnimationFrame(()=>{this.drawVideo();});
    }
}
let outLine=false;
function dcClicked(){
    outLine =! outLine;
    log("display Canvas Clicked");
}
console.log("Loaded: scanner.js");