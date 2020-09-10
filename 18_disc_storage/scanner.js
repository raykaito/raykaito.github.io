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
        codeDisplayCanvas.text("a",0,0);
        const mediaSettings = stream.getTracks()[0].getSettings();
        codeDisplayCanvas.text("b",0,10);
        this.videoWidth = mediaSettings.width;
        codeDisplayCanvas.text("c",0,20);
        this.videoHeight= mediaSettings.height;
        codeDisplayCanvas.text("d",0,30);
        console.log(this.videoWidth,this.videoHeight);
        codeDisplayCanvas.text("e",0,40);
        this.oCanvas.resize(this.videoWidth,this.videoHeight/2);
        codeDisplayCanvas.text("f",0,50);
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
        codeDisplayCanvas.text("g",0,60);
        //this.displayct.drawImage(this.video,this.croppedVideoXStart,this.croppedVideoYStart,this.croppedVideoWidth,this.croppedVideoHeight,0,0,this.displayCanvasWidth,this.displayCanvasHeight);
        this.oCanvas.drawImage(this.video,0,this.videoHeight/4,this.videoWidth,this.videoHeight/2);
        codeDisplayCanvas.text("h",0,70);
        this.dCanvas.drawImage(this.video,0,this.videoHeight/4,this.videoWidth,this.videoHeight/2);
        codeDisplayCanvas.text("i",0,80);
        requestAnimationFrame(()=>{this.drawVideo();});
    }
}
console.log("Loaded: scanner.js");