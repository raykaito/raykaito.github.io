class VisionProgram{
    constructor(originalCanvas,displayCanvas){
        this.oCanvas = originalCanvas;
        this.dCanvas = displayCanvas;
        this.middleLS = new LineScanner();
        this.middleLS.showGraph();
    }
    run(){
        const width  = this.oCanvas.canvas.width;
        const height = this.oCanvas.canvas.height;
        this.middleLS.run(this.newROI(0,height/2,width,1,0));
        this.displayImageDataD(this.middleLS);
        //this.displayImageDataO(this.lineScannerA);
    }
    locatePeaks(xi,yi,xf,yf){
        return [x,y];
    }
    newROI(x=0,y=0,width=1,height=1,theta=0){
        //Create New Canvas
        const roi = new Canvas();
        roi.resize(width,height);
        //Copy and paste the ROI from oCanvas
        roi.ct.save();
        roi.rotateRad(-theta);
        roi.translate(-x,-y);
        //Copy the region to ROI
        roi.ct.drawImage(this.oCanvas.canvas,0,0);
        roi.ct.restore();
        //Create Image Data
        return [roi.ct.getImageData(0,0,width,height),x,y,theta];
    }
    displayImageDataO(imgData){
        const [tempCanvas,x,y,theta] = imgData.prepareDisplayCanvas();
        const tc = tempCanvas.canvas;
        this.oCanvas.ct.save();
        this.oCanvas.translate(x,y);
        this.oCanvas.rotateRad(theta);
        this.oCanvas.drawRect("lime",-1,-1,tc.width+2,tc.height+2);
        this.oCanvas.drawImage(tc,0,0,tc.width,tc.height,0,0,tc.width,tc.height);
        this.oCanvas.ct.restore();
    }
    displayImageDataD(imgData){
        const [tempCanvas,x,y,theta] = imgData.prepareDisplayCanvas();
        const tc = tempCanvas.canvas;
        const wScale = this.dCanvas.canvas.width /this.oCanvas.canvas.width;
        const hScale = this.dCanvas.canvas.height/this.oCanvas.canvas.height;
        this.dCanvas.ct.save();
        this.dCanvas.translate(x*wScale,y*hScale);
        this.dCanvas.rotateRad(theta);
        this.dCanvas.drawRect("lime",-1,-1,tc.width*wScale+2,tc.height*hScale+2);
        this.dCanvas.drawImage(tc,0,0,tc.width,tc.height,0,0,tc.width*wScale,tc.height*hScale);
        this.dCanvas.ct.restore();
    }
}

class ImageData{
    constructor(){
    }
    updateROI([imgIn,xpos,ypos,theta]){
        this.imgIn = imgIn;
        this.xpos = xpos;
        this.ypos = ypos;
        this.width = imgIn.width;
        this.height= imgIn.height;
        this.theta= theta;
        this.imgOut = imgIn;
        for(let i=0;i<imgIn.data.length;i++){
            this.imgOut.data[i]=imgIn.data[i];
        }
    }
    get passROI(){
        return [this.imgOut, this.xpos, this.ypos, this.theta];
    }
    prepareDisplayCanvas(){
        const tempCanvas = new Canvas();
        tempCanvas.resize(this.width,this.height);
        tempCanvas.ct.putImageData(this.imgOut,0,0);
        return [tempCanvas,this.xpos,this.ypos,this.theta];
    }
    xy2i(xy,width=this.width){
        return Math.floor(xy[0])+width*Math.floor(xy[1]);
    }
    i2xy(i, width=this.width){
        return [i%width, Math.floor(i/width)];
    }
    setPix(indexIn, value, type="all"){
        //Check if indexIn is xy or index
        let index;
        if(indexIn.length==2)   index = this.xy2i(indexIn);
        else                    index = indexIn;

        //Set the pixel based on type
        if(type=="all"||type==0) this.imgOut.data[4*index+0] = value;
        if(type=="all"||type==1) this.imgOut.data[4*index+1] = value;
        if(type=="all"||type==2) this.imgOut.data[4*index+2] = value;
    }
    getPix(imgIn, indexIn, type="all"){
        //Check if indexIn is xy or index
        let index;
        if(indexIn.length==2)   index = this.xy2i(indexIn, imgIn.width);
        else                    index = indexIn;

        //Get the pixel based on type
        let rgbValue =0;
        if(type=="all"||type==0) rgbValue += imgIn.data[4*index+0];
        if(type=="all"||type==1) rgbValue += imgIn.data[4*index+1];
        if(type=="all"||type==2) rgbValue += imgIn.data[4*index+2];
        if(             type==3) rgbValue += imgIn.data[4*index+3];
        if(type=="all") rgbValue /= 3;

        return rgbValue;
    }
}

class LineScanner extends ImageData{
    constructor(){
        super();
        this.graph = new GraphCanvas();
    }
    updateROI([imgIn,xpos,ypos,theta]){
        if(imgIn.height!=1){
            alert("The Height for ROI needs to be 1 for LineScanner.");
        }else{
            super.updateROI([imgIn,xpos,ypos,theta]);
        }
    }
    showGraph(){
        this.graph.appendSelf();
    }
    getData(imgIn,type="all"){
        let data = new Array(imgIn.width);
        if(type=="r"){
            for(let i=0;i<imgIn.width;i++){
                data[i]=100*(imgIn.data[4*i])/256;
            }
        }else if(type=="g"){
            for(let i=0;i<imgIn.width;i++){
                data[i]=100*(imgIn.data[4*i+1])/256;
            }
        }else if(type=="b"){
            for(let i=0;i<imgIn.width;i++){
                data[i]=100*(imgIn.data[4*i+2])/256;
            }
        }else{
            for(let i=0;i<imgIn.width;i++){
                data[i]=100*(imgIn.data[4*i]+imgIn.data[4*i+1]+imgIn.data[4*i+2])/(256*3);
            }
        }
        return data;
    }
    smoothenData(data,range=3){
        let counter=0;
        let sum = 0;
        let smoothdata = new Array(data.length);
        for(let i=-range; i<data.length+range; i++){
            if(i+range<data.length){
                counter++;
                sum+=data[i+range];
            }
            if(i-range>=0){
                counter--;
                sum-=data[i-range];
            }
            if(i>=0&&i<data.length){
                smoothdata[i]=sum/counter;
            }
        }
        return smoothdata;
    }
    derivativeData(data){
        let derivative = new Array(data.length);
        let rightSlope = 0;
        let leftSlope = 0;
        for(let i=0;i<data.length;i++){
            if(i>0){
                leftSlope=rightSlope;
            }
            if(i+1<data.length){
                rightSlope = data[i+1]-data[i];
            }
            derivative[i]=rightSlope+leftSlope;
        }
        return derivative;
    }
    dualIntegrate(data){
        let dualInt = new Array(data.length).fill(50);
        let sum=0;
        for(let i=0;i<data.length;i++){
            if(data[i]<0){
                sum+=data[i];
                dualInt[i] = sum+50;
            }else{
                sum = 0;
            }
        }
        sum=0;
        for(let i=data.length-1;i>=0;i--){
            if(data[i]>0){
                sum+=data[i];
                dualInt[i] = sum+50;
            }else{
                sum = 0;
            }
        }
        return dualInt;
    }
    run([imgIn,xpos,ypos,theta]){
        this.updateROI([imgIn,xpos,ypos,theta])
        this.graph.resize(imgIn.width,100);
        const d_0_original = this.getData(imgIn);
        const d_1_smoothen = this.smoothenData(d_0_original);
        const d_2_derivative = this.derivativeData(d_1_smoothen);
        const d_3_dualInt = this.dualIntegrate(d_2_derivative);
        this.graph.update(d_3_dualInt);
    }
}

console.log("Loaded: vision_program.js");