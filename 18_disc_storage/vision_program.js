class VisionProgram{
    constructor(originalCanvas,displayCanvas){
        this.oCanvas = originalCanvas;
        this.width  = originalCanvas.canvas.width;
        this.height = originalCanvas.canvas.height;
        this.dCanvas = displayCanvas;
        this.oimgdata;

        this.lineScanner = new houghTransform();
        this.lineScanner.showPlot();
        this.histogram = new Histogram();
        this.histogram.showGraph();
        this.binary = new Binarize();

        this.LS_num = 15;
        this.LS = new Array(this.LS_num);
        for(let i=0;i<this.LS_num;i++){
            this.LS[i] = new LineScanner(3);
            this.LS[i].showGraph();
        }

    }
    resizeOcanvas(width,height){
        this.width = width;
        this.height= height;
    }
    run(){
        this.oimgdata = this.oCanvas.ct.getImageData(0,0,this.width,this.height);
        this.histogram.run([this.oimgdata,0,0,0]);
        this.histogram.updateGraphHistogram();
        this.histogram.getOtsu();
        this.histogram.updateGraphOtsu();
        const thresh = getMinIndex(this.histogram.otsu);
        log(thresh);
        this.binary.setThresh(thresh);
        this.binary.run([this.oimgdata,0,0,0]);
        this.lineScanner.run(this.binary.passROI);
        this.displayImageDataD(this.binary);
        return;

        for(let i=0;i<this.LS_num;i++){
            const hStart = this.height/2+this.height/40*i;
            const roi = this.newROI(0,hStart,this.width,1,0);
            this.LS[i].run(roi);
            this.displayImageDataD(this.LS[i]);
            this.displayImageDataO(this.LS[i]);
        }
    }
    newROI(x=0,y=0,width=1,height=1,theta=0){
        if(theta==0){
            //Crop from oimagedata
            let imgData = this.oCanvas.ct.createImageData(width,height);
            for(let xi=0;xi<width;xi++){
                for(let yi=0;yi<height;yi++){
                    const indexOut = this.xy2i([xi,yi]);
                    const indexIn  = this.xy2i([xi+x,yi+y]);
                    for(let i=0;i<3;i++){
                        imgData.data[indexOut*4+i] = this.oimgdata.data[indexIn*4+i];
                    }
                }
            }
            return [imgData, x,y,theta];
        }
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
        imgData.odraw(this.oCanvas);
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
        imgData.ddraw(this.dCanvas);
        this.dCanvas.ct.restore();
    }
    xy2i(xy,width=this.width){
        return Math.floor(xy[0])+width*Math.floor(xy[1]);
    }
    i2xy(i, width=this.width){
        return [i%width, Math.floor(i/width)];
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
    odraw(){}
    ddraw(){}
    xy2i(xy,width=this.width){
        return Math.floor(xy[0])+width*Math.floor(xy[1]);
    }
    i2xy(i, width=this.width){
        return [i%width, Math.floor(i/width)];
    }
    setPixXY(indexIn, value, type="all"){this.setPixI(this.xy2i(indexIn),value,type);}
    getPixXY(imgIn, indexIn, type="all"){this.getPixI(imgIn,this.xy2i(indexIn, imgIn.width),type);}
    setPixI(index, value, type="all"){
        //Set the pixel based on type
        if(type=="all"){
            this.imgOut.data[4*index  ] = value;
            this.imgOut.data[4*index+1] = value;
            this.imgOut.data[4*index+2] = value;
        }else{
            this.imgOut.data[4*index+type] = value;
        }}
    getPixI(imgIn,index,type="all"){
        //Get the pixel based on type
        if(type=="all"){
            return (imgIn.data[4*index]+imgIn.data[4*index+1]+imgIn.data[4*index+2])/3;
        }else{
            return imgIn.data[4*index+type];
        }
    }
    xy2i(xy,width=this.width){
        return Math.floor(xy[0])+width*Math.floor(xy[1]);
    }
    i2xy(i, width=this.width){
        return [i%width, Math.floor(i/width)];
    }
}

class Histogram extends ImageData{
    constructor(){
        super();
        this.bin = new Array(256).fill(0);
        this.otsu= new Array(256);
        this.graphHisto = new GraphCanvas();
        this.graphHisto.resize(256,100);
        this.graphHisto.resizeStyle(256,100,true);
        this.graphOtsu = new GraphCanvas();
        this.graphOtsu.resize(256,100);
        this.graphOtsu.resizeStyle(256,100,true);
    }
    showGraph(){
        this.graphHisto.appendSelf();
        this.graphOtsu.appendSelf();
    }
    updateBin(imgIn){
        this.bin.fill(0);
        for(let i=0;i<imgIn.data.length/4;i++){
            this.bin[Math.floor(this.getPixI(imgIn,i))]++;
        }
    }
    getOtsu(){
        let totalP = new Array(this.bin.length).fill(0);
        let totalN = new Array(this.bin.length).fill(0);
        let firstAccumulativeP = new Array(this.bin.length).fill(0);
        let firstAccumulativeN = new Array(this.bin.length).fill(0);
        let secondAccumulativeP = new Array(this.bin.length).fill(0);
        let secondAccumulativeN = new Array(this.bin.length).fill(0);
        for(let i=0;i<this.bin.length;i++){
            totalP[i] = this.bin[i];
            firstAccumulativeP[i] = this.bin[i]*i;
            secondAccumulativeP[i] = this.bin[i]*i*i;
            if(i>0){
                totalP[i]+=totalP[i-1];
                firstAccumulativeP[i]+=firstAccumulativeP[i-1];
                secondAccumulativeP[i]+=secondAccumulativeP[i-1];
            }
        }
        for(let i=this.bin.length-1;i>=0;i--){
            totalN[i] = this.bin[i];
            firstAccumulativeN[i] = this.bin[i]*i;
            secondAccumulativeN[i] = this.bin[i]*i*i;
            if(i<this.bin.length-1){
                totalN[i]+=totalN[i+1];
                firstAccumulativeN[i]+=firstAccumulativeN[i+1];
                secondAccumulativeN[i]+=secondAccumulativeN[i+1];
            }
        }
        let otsu = new Array(256).fill(0);
        for(let i=0;i<this.bin.length;i++){
            const centerP = firstAccumulativeP[i]/Math.max(1,totalP[i]);
            const centerN = firstAccumulativeN[i]/Math.max(1,totalN[i]);
            const varianceP = secondAccumulativeP[i]-centerP*centerP*totalP[i];
            const varianceN = secondAccumulativeN[i]-centerN*centerN*totalN[i];
            otsu[i] = varianceP+varianceN;
        }
        this.otsu = otsu;        
    }
    getOtsuThresh(){
        const otsuMin = Math.min(...this.otsu);
        for(let i=0;i<this.bin.length;i++){
            if(this.otsu[i]==otsuMin) return i;
        }
        return -1;
    }
    run([imgIn,xpos,ypos,theta]){
        this.updateROI([imgIn,xpos,ypos,theta]);
        this.updateBin(imgIn);
    }
    updateGraphHistogram(){this.graphHisto.update(this.bin,100/Math.max(1,Math.max(...this.bin)));}
    updateGraphOtsu(){this.graphOtsu.update(this.otsu,100/Math.max(1,Math.max(...this.otsu)));}
}

class Binarize extends ImageData{
    constructor(threshold=128){
        super();
        this.threshold = threshold;
    }
    setThresh(threshold=128){
        this.threshold = threshold;
    }
    run([imgIn,xpos,ypos,theta]){
        this.updateROI([imgIn,xpos,ypos,theta]);
        for(let i=0;i<imgIn.data.length/4;i++){
            const [x,y] = this.i2xy(i);
            const value = (imgIn.data[4*i]+imgIn.data[4*i+1]+imgIn.data[4*i+2])/3;
            if(value>this.threshold){
                this.setPixI(i,0);
            }else{
                this.setPixI(i,255);
            }
        }
    }
}

class houghTransform extends ImageData{
    constructor(rho=200,theta=200){
        super();
        this.resolutionRho = rho;
        this.resolutionTheta = theta;
        this.intensity = new Array(this.resolutionRho*this.resolutionTheta);
        //Prepare Plot Canvas
        this.plot = new Canvas();
        this.plot.resize(this.resolutionTheta,this.resolutionRho);
        this.plot.resizeStyle(this.resolutionTheta,this.resolutionRho,true);
        this.plotimgdata = this.plot.ct.createImageData(this.resolutionTheta,this.resolutionRho);
        for(let i=0;i<this.intensity.length;i++){
            this.plotimgdata.data[i*4+3]=256;
        }
        //Settings
        this.ySkip = 10;
        this.xavg = 10;
        this.thetaStart = -30;
        this.thetaScale = 60/200;
        this.rhoScale = 1;
    }
    showPlot(){
        this.plot.appendSelf();
    }
    run([imgIn,xpos,ypos,theta]){
        this.updateROI([imgIn,xpos,ypos,theta]);
        const width = imgIn.width;
        const height= imgIn.height;
        this.rhoScale = this.resolutionRho/width;
        this.intensity.fill(0);
        let value=0;
        for(let i=0;i<imgIn.data.length/4;i++){
            const [x,y] = this.i2xy(i);
            if(x==0){value=0;}
            if(y%this.ySkip!=0) continue;
            value += 255-(imgIn.data[4*i]+imgIn.data[4*i+1]+imgIn.data[4*i+2])/3;
            if(x%this.xavg==4){
                this.updateIntensity(x-(this.xavg-1)/2,y,value);
                value=0;
            }
        }
        this.updatePlotImageData();
    }
    updatePlotImageData(){
        const maxIntensity = Math.max(10,Math.max(...this.intensity));
        const intensityScale = 256/maxIntensity;
        for(let i=0;i<this.intensity.length;i++){
            const intensity = this.intensity[i]*intensityScale;
            this.plotimgdata.data[i*4+0]=intensity;
            if(this.intensity[i]>maxIntensity*0.8){
                this.plotimgdata.data[i*4+1]=0;
                this.plotimgdata.data[i*4+2]=0;
            }else{
                if(this.intensity[i]>maxIntensity*0.9){
                    this.plotimgdata.data[i*4+1]=intensity;
                    this.plotimgdata.data[i*4+2]=intensity;
                }else{
                    this.plotimgdata.data[i*4+1]=intensity;
                    this.plotimgdata.data[i*4+2]=intensity;

                }
            }
        }
        this.plot.ct.putImageData(this.plotimgdata,0,0);
    }
    updateIntensity(x,y,value){
        const radiusi = getDist(x,y);
        const thetai  = getDir(x,y);
        for(let theta=0;theta<this.resolutionTheta;theta++){
            const currentTheta = thetai+deg2rad(this.thetaStart+this.thetaScale*theta);
            const rho = radiusi*Math.cos(currentTheta);
            const rhoIndex = Math.floor(this.rhoScale*rho);
            this.intensity[rhoIndex*this.resolutionTheta+theta]+=value;
        }
        return;
    }
}

class LineScanner extends ImageData{
    constructor(smoothrange = 1){
        super();
        this.smoothrange = smoothrange;
        this.graph = new GraphCanvas();
    }
    showGraph(){
        this.graph.appendSelf();
    }
    getData(imgIn){
        let data = new Array(imgIn.width);
        for(let i=0;i<imgIn.width*imgIn.height;i++){
            data[i]=this.getPixI(imgIn,i);
        }
        return data;
    }
    run([imgIn,xpos,ypos,theta]){
        this.updateROI([imgIn,xpos,ypos,theta]);
        this.graph.resize(imgIn.width,100);
        this.graph.resizeStyle(imgIn.width,100,true);
        const d_0_original = this.getData(imgIn);
        const d_1_smoothen = smoothenArray(d_0_original, this.smoothrange);
        const d_2_derivative = takeDerivative(d_1_smoothen);
        const d_3_dualInt = dualIntegrate(d_2_derivative);
        const d_4_lines = lineIntensity(d_3_dualInt);
        this.graph.update(d_4_lines);
    }
}

console.log("Loaded: vision_program.js");