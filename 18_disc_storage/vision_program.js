class VisionProgram{
    constructor(originalCanvas,displayCanvas){
        this.oCanvas = originalCanvas;
        this.width  = originalCanvas.canvas.width;
        this.height = originalCanvas.canvas.height;
        this.dCanvas = displayCanvas;
        this.oimgdata;

        this.houghTrans = new houghTransform();
        //this.houghTrans.showPlot();
        //this.houghTrans.showGraph();

        this.histogram = new Histogram();
        this.histogram.showGraph();

        this.linearScanner = new LineScanner(3);
        this.linearScanner.showGraph();
    }
    resizeOcanvas(width,height){
        this.width = width;
        this.height= height;
    }
    run(){
        this.oimgdata = this.oCanvas.ct.getImageData(0,0,this.width,this.height);

        let lineDetectionROI = this.newROI(3*this.width/16,this.height/2,this.width/8,this.height/2-1);
        this.histogram.updateROI(lineDetectionROI);
        this.histogram.updateBin();
        this.histogram.getOtsu();
        this.histogram.getOtsuThresh();
        this.histogram.updateGraphHistogram();
        this.histogram.updateGraphOtsu();
        this.histogram.binarize();

        this.houghTrans.updateROI(this.histogram.passROI);
        this.houghTrans.yLines(15);
        this.houghTrans.transform();
        this.houghTrans.detectLine();
        this.houghTrans.updatePlotImageData();
        const intersection_L = this.houghTrans.getXInter();
        this.displayImageDataD(this.houghTrans);

        lineDetectionROI = this.newROI(12*this.width/16,this.height/2,this.width/8,this.height/2-1);
        this.histogram.updateROI(lineDetectionROI);
        this.histogram.updateBin();
        this.histogram.getOtsu();
        this.histogram.getOtsuThresh();
        this.histogram.updateGraphHistogram();
        this.histogram.updateGraphOtsu();
        this.histogram.binarize();

        this.houghTrans.updateROI(this.histogram.passROI);
        this.houghTrans.yLines(15);
        this.houghTrans.transform();
        this.houghTrans.detectLine();
        this.houghTrans.updatePlotImageData();
        const intersection_R = this.houghTrans.getXInter();
        this.displayImageDataD(this.houghTrans);

        const linearScan_ROI = this.newROI(0,this.height/2,this.width,1);
        this.linearScanner.updateROI(linearScan_ROI);
        this.linearScanner.updateLineIntensity(linearScan_ROI);
        this.linearScanner.updateGraph();
        this.displayImageDataD(this.linearScanner);

        const lineCount = this.getLineCount(this.linearScanner.lineIntensity,intersection_L,intersection_R);
    }
    getLineCount(lineInt,inter_L,inter_R){
        const countStart = 5;
        const countEnd = 50;
        let maxScore = 0;
        let maxScoreCount = -1;
        const length = inter_R-inter_L;
        const lineIntThresh = getMax(lineInt.slice(Math.floor(inter_L),Math.floor(inter_R)))/10;
        for(let count=countStart;count<countEnd;count++){
            let score = 0;
            let gap = length/count;
            for(let i=0;i<Math.ceil(length);i++){
                if(lineInt[i+Math.floor(inter_L)]<lineIntThresh) continue;
                if(((i+gap/4)%gap)<gap/2){
                    score++;
                }else{
                    score--;
                }
            }
            score=score/count;
            if(score>maxScore){
                maxScore = score;
                maxScoreCount = count;
            }
        }
        log(maxScoreCount);
        return maxScoreCount;
    }
    newROI(x=0,y=0,width=1,height=1,theta=0){
        x=Math.floor(x);
        y=Math.floor(y);
        width=Math.floor(width);
        height=Math.floor(height);
        if(theta==0){
            //Crop from oimagedata
            let imgData = this.oCanvas.ct.createImageData(width,height);
            for(let xi=0;xi<width;xi++){
                for(let yi=0;yi<height;yi++){
                    const indexOut = this.xy2i([xi,yi],width);
                    const indexIn  = this.xy2i([xi+x,yi+y],this.width);
                    for(let i=0;i<4;i++){
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
        this.thresh;
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
    updateBin(imgIn = this.imgIn){
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
        this.thresh = getMinIndex(this.otsu);
    }
    binarize(){
        for(let i=0;i<this.imgIn.data.length/4;i++){
            const value = this.getPixI(this.imgIn,i);
            if(value>this.thresh){
                this.setPixI(i,255);
            }else{
                this.setPixI(i,0);
            }
        }
    }
    updateGraphHistogram(){this.graphHisto.update(this.bin,true);}
    updateGraphOtsu(){this.graphOtsu.update(this.otsu,true);}
}

class houghTransform extends ImageData{
    constructor(rho=100,theta=100){
        super();
        //range for rho and theta
        this.rangeRho = rho;
        this.rangeTheta = theta;
        this.intensity = new Array(this.rangeRho*this.rangeTheta);
        //important Parameters
        this.ySkip = 100;
        this.xavg = 1;
        this.thetaStart = -10;
        this.scaleTheta = 20/100;
        this.scaleRho = 1;
        //Prepare Plot Canvas
        this.plot = new Canvas();
        this.plot.resize(this.rangeTheta,this.rangeRho);
        this.plot.resizeStyle(this.rangeTheta,this.rangeRho,true);
        this.plotimgdata = this.plot.ct.createImageData(this.rangeTheta,this.rangeRho);
        for(let i=0;i<this.intensity.length;i++){
            this.plotimgdata.data[i*4+3]=256;
        }
        //Prepare Graph Canvas
        this.graph = new GraphCanvas();
        this.graph.resize(this.rangeRho,100);
        this.graph.resizeStyle(this.rangeRho,100,true);
    }
    showPlot(){this.plot.appendSelf();}
    showGraph(){this.graph.appendSelf();}
    yLines(numLine=10){
        this.ySkip = Math.floor(this.imgIn.height/numLine);
    }
    transform(){
        const width = this.imgIn.width;
        const height= this.imgIn.height;
        this.scaleRho = this.rangeRho/width;
        this.intensity.fill(0);
        let value=0;
        for(let i=0;i<this.imgIn.data.length/4;i++){
            const [x,y] = this.i2xy(i);
            if(x==0){value=0;}
            if(y%this.ySkip!=0) continue;
            value += 255-this.getPixI(this.imgIn,i);
            if(x%this.xavg==(this.xavg-1)){
                this.updateIntensity(x-(this.xavg-1)/2,y,value);
                value=0;
            }
        }
    }
    updateIntensity(x,y,value){
        if(value==0) return;
        const radiusi = getDist(x,y);
        const thetai  = getDir(x,y);
        for(let theta=0;theta<this.rangeTheta;theta++){
            const currentTheta = thetai+deg2rad(this.thetaStart+this.scaleTheta*theta);
            const rho = radiusi*Math.cos(currentTheta);
            const rhoIndex = Math.floor(this.scaleRho*rho);
            this.intensity[rhoIndex*this.rangeTheta+theta]+=value;
        }
        return;
    }
    detectLines(){
        const theta = getMaxIndex(this.intensity)%this.rangeTheta;
        let lineIntensity = new Array(this.rangeRho);
        const maxIntensity = getMax(this.intensity);
        for(let i=0;i<this.rangeRho;i++){
            lineIntensity[i] = maxIntensity-this.intensity[i*this.rangeTheta+theta];
        }
        const d_1_smoothen = smoothenArray(lineIntensity, this.rangeRho/50);
        const d_2_derivative = takeDerivative(d_1_smoothen);
        const d_3_dualInt = dualIntegrate(d_2_derivative);
        const d_4_lines = getLineIntensity(d_3_dualInt);
        this.graph.update(d_4_lines,true);
    }
    detectLine(){
        const maxIndex = getMaxIndex(this.intensity);
        this.thetaMax = this.thetaStart+this.scaleTheta*(maxIndex%this.rangeTheta);
        this.rhoMax = 1/this.scaleRho*Math.floor(maxIndex/this.rangeTheta);
    }
    getXInter(){
        return this.xpos+this.rhoMax/Math.cos(deg2rad(this.thetaMax));
    }
    prepareDisplayCanvas(){
        const [tempCanvas,xpos,ypos,theta] = super.prepareDisplayCanvas();
        const xi=this.rhoMax/Math.cos(deg2rad(this.thetaMax));
        const yi=0;
        const xt=xi+this.height*Math.sin(deg2rad(this.thetaMax));
        const yt=this.height;
        tempCanvas.ct.strokeStyle = "lime";
        tempCanvas.ct.lineWidth = 5;
        tempCanvas.line(xi,yi,xt,yt);
        return [tempCanvas,xpos,ypos,theta];
    }
    updatePlotImageData(){
        const maxIntensity = Math.max(10,getMax(this.intensity));
        const intensityScale = 256/maxIntensity;
        for(let i=0;i<this.intensity.length;i++){
            const intensity = this.intensity[i]*intensityScale;
            this.plotimgdata.data[i*4+0]=intensity;
            this.plotimgdata.data[i*4+1]=intensity;
            this.plotimgdata.data[i*4+2]=intensity;
        }
        this.plot.ct.putImageData(this.plotimgdata,0,0);
    }
}

class LineScanner extends ImageData{
    constructor(smoothrange = 1){
        super();
        this.lineIntensity = new Array(5);
        this.smoothrange = smoothrange;
        this.graph = new GraphCanvas();
    }
    showGraph(){
        this.graph.appendSelf();
    }
    updateGraph(){
        this.graph.update(this.lineIntensity,true);
    }
    resizeGraph(){
        this.graph.resize(imgIn.width,100);
        this.graph.resizeStyle(imgIn.width,100,true);
    }
    getData(imgIn){
        let data = new Array(imgIn.width);
        for(let i=0;i<imgIn.width*imgIn.height;i++){
            data[i]=this.getPixI(imgIn,i);
        }
        return data;
    }
    updateLineIntensity([imgIn,xpos,ypos,theta]){
        const d_0_original = this.getData(imgIn);
        const d_1_smoothen = smoothenArray(d_0_original, this.smoothrange);
        const d_2_derivative = takeDerivative(d_1_smoothen);
        const d_3_dualInt = dualIntegrate(d_2_derivative);
        this.lineIntensity = getLineIntensity(d_3_dualInt);
    }
}

const average=(imgdata,xrange=1,yrange=1)=>{
    let imgHolder = {data: new Array(imgdata.width*imgdata.height*4)};
    let counter, tempR, tempG, tempB, index;
    for(let y=0;y<imgdata.height;y++){
        counter = tempR = tempG = tempB = 0;
        for(let x=-xrange;x<imgdata.width+xrange;x++){
            index = Math.floor(x)+imgdata.width*Math.floor(y);
            
            if(x+xrange<imgdata.width){
                counter++;
                tempR += imgdata.data[4*(index+xrange)+0];
                tempG += imgdata.data[4*(index+xrange)+1];
                tempB += imgdata.data[4*(index+xrange)+2];
            }
            
            if(x-xrange>=0){
                counter--;
                tempR -= imgdata.data[4*(index-xrange)+0];
                tempG -= imgdata.data[4*(index-xrange)+1];
                tempB -= imgdata.data[4*(index-xrange)+2];
            }
            if(x>=0&&x<imgdata.width){
                imgHolder.data[4*index  ] = tempR/counter;
                imgHolder.data[4*index+1] = tempG/counter;
                imgHolder.data[4*index+2] = tempB/counter;
            }
        }
    }
    for(let x=0;x<imgdata.width;x++){
        counter = tempR = tempG = tempB = 0;
        for(let y=-yrange;y<imgdata.height+yrange;y++){
            index = Math.floor(x)+imgdata.width*Math.floor(y);
            
            if(y+yrange<imgdata.height){
                counter++;
                tempR += imgHolder.data[4*(index+yrange*imgdata.width)+0];
                tempG += imgHolder.data[4*(index+yrange*imgdata.width)+1];
                tempB += imgHolder.data[4*(index+yrange*imgdata.width)+2];
            }
            
            if(y-yrange>=0){
                counter--;
                tempR -= imgHolder.data[4*(index-yrange*imgdata.width)+0];
                tempG -= imgHolder.data[4*(index-yrange*imgdata.width)+1];
                tempB -= imgHolder.data[4*(index-yrange*imgdata.width)+2];
            }
            if(y>=0&&y<imgdata.height){
                imgdata.data[4*index  ] = tempR/counter;
                imgdata.data[4*index+1] = tempG/counter;
                imgdata.data[4*index+2] = tempB/counter;
            }
        }
    }
}

console.log("Loaded: vision_program.js");