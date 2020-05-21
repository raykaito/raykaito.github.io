class Scanner{
    constructor(){
        //Create Canvas for Original Video Image
        this.ocanvas = document.createElement("canvas");
        this.oct = this.ocanvas.getContext("2d");
        this.vLength = 0;

        //Initialize Board Reader Class
        this.boardV = new VisionProgram_BoardReader();
        this.numberV= new VisionProgram_NumberReader();

        this.front=false;
        this.constraints = {
            audio:false,
            video:{
                //width:1920,
                //height:1080,
                width:480,
                height:480,
                facingMode:(this.front?"user":"environment")
            }
        };
        if(false){
            this.drawImage();
        }else{
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
        if(ca.canvas.width!=this.vLength) this.resizeOcanvas(ca.canvas.width);
        ca.draw();
        this.oct.drawImage(canvas,0,0,ca.canvas.width,ca.canvas.height,0,0,this.vLength,this.vLength);
        const result = this.boardV.startScan(this.ocanvas,this.oct,this.numberV);
        if(!result){requestAnimationFrame(()=>{scanner.drawImage();});}
        else{       requestAnimationFrame(()=>{scanner.drawProgress();});}
    }
    drawVideo(){
        animationStartTime = Date.now();
        ca.draw();
        const newVlength = Math.min(video.videoWidth,video.videoHeight,ca.canvas.width);
        if(newVlength==0){
            requestAnimationFrame(()=>{scanner.drawVideo();});
            return;
        }
        if(newVlength!=this.vLength) this.resizeOcanvas(newVlength);
        this.oct.drawImage(video,this.sx,this.sy,this.vLength,this.vLength,0,0,this.vLength,this.vLength);
              ca.ct.drawImage(this.ocanvas,0,0,this.vLength,this.vLength,ca.offset,ca.side,ca.side*9,ca.side*9);
        const result = this.boardV.startScan(this.ocanvas,this.oct,this.numberV);
        if(!result) requestAnimationFrame(()=>{scanner.drawVideo();});
        else{
            this.stopVideo();
            //draw();
            requestAnimationFrame(()=>{scanner.drawProgress();});
        }
    }
    drawProgress(){
        animationStartTime = Date.now();
        let result = false;
        //console.log("slider"+(slider.value+1));
        for(let i=0;i<Number(slider.value)+1;i++){
            result=this.numberV.makeProgress();
            if(result) break;
        }
        if(!result){
            requestAnimationFrame(()=>{scanner.drawProgress();});
        }else{
            const solvable = sudoku.startSolving();
            if(solvable==false){
                alert("Scanning process might have failed. Drag and Drop to correct the mistake.");
                changePhase("Correct Scanning Error");
                this.numberV.startCorrection();
            }
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
                this.sx = (video.videoWidth - video.videoHeight)/2;
                this.sy = 0;
            }else{
                this.sx = 0;
                this.sy = (video.videoHeight - video.videoWidth)/2;
            }
        }
        this.ocanvas.width = this.vLength;
        this.ocanvas.height= this.vLength;
        ca.canvasScale = this.ocanvas.width/(ca.side*9);
        console.log("Ocanvas Dim: ("+this.ocanvas.width+","+this.ocanvas.height+")");
    }
}