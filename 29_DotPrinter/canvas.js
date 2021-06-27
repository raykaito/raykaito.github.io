//Canvas Variables
let oct;
let pct;
let tct;
let pixelRatio;
const theWidth = 400; // width of power game window
const theHeight = 300;// height of power game window
const theArea = theWidth*theHeight;

//Parameters
let brightness;
let scale;

// Vision P Variables
let colorLen = bg[0].length; // Number of colors
let bgIndex = 2;//0: non, 1: light, 2: gray
let statMap = new Int16Array(theArea); // SM[pixInd] = -1:unPaintable 0:Paintable 1:↑ok 2:→ok 3:↓ok 4:←ok 5:painted 6:BLACK
let colorMap = new Int16Array(theArea); //colorMap[pixInd] = colorInd;
let leftTopMap = new Int16Array(theArea); //LTMap[pixInd] = 0 if none, 1 if left most, 2, if top most 3 if both
let paintableCount = new Uint16Array(colorLen); //Number of paintable pixels
const dirList = [-theWidth, 1, theWidth, -1];
let inst;

const initCanvas = () => {
    pixelRatio = window.devicePixelRatio;
    
    // Get Context
    oct = ocanvas.getContext("2d");
    pct = pcanvas.getContext("2d");
    tct = tcanvas.getContext("2d");

    // Canvas Resize
    ocanvas.style.width  = theWidth+"px";
    ocanvas.style.height  = theHeight+"px";
    
    pcanvas.style.width  = theWidth+"px";
    pcanvas.style.height  = theHeight+"px";

    pcanvas.width = theWidth;
    pcanvas.height = theHeight;
    
    tcanvas.width  = theWidth;
    tcanvas.height  = theHeight;

    updatePreview();
}

const drawOriginalImage = (fileImage) => {
    let xOffset = yOffset = 0;
    const imgWidth = fileImage.width;
    const imgHeight= fileImage.height;
    if(imgWidth/imgHeight >= theWidth/theHeight){
        ocanvas.width = imgWidth;
        ocanvas.height = imgWidth*3/4;
        yOffset = (ocanvas.height - imgHeight) / 2
    }else{
        ocanvas.height = imgHeight;
        ocanvas.width = imgHeight*4/3;
        xOffset = (ocanvas.width - imgWidth) / 2
    }
    oct.drawImage(fileImage, xOffset, yOffset, imgWidth, imgHeight);

    updatePreview();
}

const updatePreview = () =>{
    updateText();

    tct.fillStyle = "black";
    tct.fillRect(0,0,tcanvas.width, tcanvas.height);
    tct.drawImage(ocanvas, 0, 0, ocanvas.width, ocanvas.height, 0, 0, tcanvas.width, tcanvas.height);
    timgdata = tct.getImageData(0, 0, tcanvas.width, tcanvas.height);

    let minDif, minDifInd, dif;
    let dotCount = 0;
    for(let pixInd = 0; pixInd < timgdata.data.length/4; pixInd++){
        minDif = -1;
        minDifInd = -1;
        for(let colInd = 0; colInd < colorLen; colInd++){
            dif = 0;
            dif += Math.pow((timgdata.data[pixInd*4+0]*brightness-bg[bgIndex][colInd][0]), 2);
            dif += Math.pow((timgdata.data[pixInd*4+1]*brightness-bg[bgIndex][colInd][1]), 2);
            dif += Math.pow((timgdata.data[pixInd*4+2]*brightness-bg[bgIndex][colInd][2]), 2);
            if(minDif == -1 || dif < minDif){
                minDif = dif;
                minDifInd = colInd;
            }
        }
        timgdata.data[pixInd*4 + 0] = bg[bgIndex][minDifInd][0];
        timgdata.data[pixInd*4 + 1] = bg[bgIndex][minDifInd][1];
        timgdata.data[pixInd*4 + 2] = bg[bgIndex][minDifInd][2];
        // Update Color map
        colorMap[pixInd] = minDifInd;
        // If not Black, initial stat is -1;
        if(minDifInd==27){
            statMap[pixInd] = 6;
        }else{
            statMap[pixInd] = -1;
            dotCount++;
        }
    }
    console.log("require "+dotCount+" dots");
    pct.putImageData(timgdata, 0, 0);
}

const getInstruction = () => {
    inst = "";
    while(paint());
    return;
}

const updatePaintStat = () => {

    // Reset paintableCount
    for(let i=0; i<colorLen; i++){
            paintableCount[i] = 0;
            leftTopMap[i] = 0;
    }
    //Check stats for each pixel
    for(let i=0; i<theArea; i++){//Scans in +x dir
        //Check pixel on right
        if(i%theWidth+1<theWidth&&colorMap[i]==colorMap[i+1]){
            if(i%theWidth-1>=0&&colorMap[i]!=colorMap[i-1]) leftTopMap[i]++;
            //update stats
            if(statMap[i]==-1) statMap[i] = 0;
            if(statMap[i+1]==-1) statMap[i+1] = 0;
        }
        //Check pixel on bottom
        if(i+theWidth<theArea&&colorMap[i]==colorMap[i+theWidth]){
            if((i-theWidth)>=0&&colorMap[i]!=colorMap[i-theWidth]) leftTopMap[i]+=2;
            //update stats
            if(statMap[i]==-1) statMap[i] = 0;
            if(statMap[i+theWidth]==-1) statMap[i+theWidth] = 0;
        }
        //If self is painted, on right and below is paintable
        if(statMap[i]==5){
            if(i%theWidth+1<theWidth&&statMap[i+1]==-1){
                statMap[i+1] = 4;
            }
            if(i+theWidth<theArea&&statMap[i+theWidth]==-1){
                statMap[i+theWidth] = 1;
            }
        }
        //If left or below is painted, the self is paintable
        if(statMap[i]==-1){
            if(i%theWidth+1<theWidth&&statMap[i+1]==5){
                statMap[i] = 2;
            }
            if(i+theWidth<theArea&&statMap[i+theWidth]==5){
                statMap[i] = 3;
            }
        }
        if(statMap[i]!=-1&&statMap[i]!=5&&statMap[i]!=6){
            paintableCount[colorMap[i]]++;
        }
        /*
        if(statMap[i]==5){
            timgdata.data[i*4+0] = 0;
            timgdata.data[i*4+1] = 255;
            timgdata.data[i*4+2] = 0;
        }else if(leftTopMap[i]>0){
            timgdata.data[i*4 + 0] = 255;
            timgdata.data[i*4 + 1] *= 0.25;
            timgdata.data[i*4 + 2] *= 0.25;
        }else if(statMap[i]!=0){
            timgdata.data[i*4 + 0] = 255;
            timgdata.data[i*4 + 1] *= 0.75;
            timgdata.data[i*4 + 2] *= 0.75;
        }else{
            // doNothing
        }*/
    }
    //pct.putImageData(timgdata, 0, 0);
}

const paint = () => {
    // Update the paintable stats of the drawing
    updatePaintStat();

    // Check which color has the most paintable pixels
    let maxPaintableCount = -1;
    let targetColInd = -1;
    for(let i=0; i<colorLen; i++){
        if(targetColInd==-1||paintableCount[i]>maxPaintableCount){
            maxPaintableCount = paintableCount[i];
            targetColInd = i;
        }
    }
    inst += "Select,"+targetColInd+",\r\n";
    
    //Horizontal first;
    let paintedCount = 0;
    for(let i=0; i<theArea; i++){
        if(colorMap[i]==targetColInd&&leftTopMap[i]%2==1){
            painted = false;
            const startPixInd = i;
            let offset = 0;
            do{
                if(statMap[(i+offset)]!=5){
                    statMap[(i+offset)]=5;
                    painted = true;
                    paintedCount++;
                }
                timgdata.data[(i+offset)*4+0]=255;
                timgdata.data[(i+offset)*4+1]*=0.25;
                timgdata.data[(i+offset)*4+2]*=0.25;
                offset++;
            }while((i+offset)%theWidth<theWidth&&colorMap[(i+offset)]==targetColInd);
            const endPixInd = (i+offset)-1;
            if(painted){
                inst += "Start,"+startPixInd%theWidth+","+Math.floor(startPixInd/theWidth)+",\r\n";
                inst += "End,"+endPixInd%theWidth+","+Math.floor(endPixInd/theWidth)+",\r\n";
            }
        }
    }

    //Vertical second;
    for(let i=0; i<theArea; i++){
        if(colorMap[i]==targetColInd&&leftTopMap[i]>=2){
            painted = false;
            const startPixInd = i;
            let offset = 0;
            do{
                if(statMap[(i+offset)]!=5){
                    statMap[(i+offset)]=5;
                    painted = true;
                    paintedCount++;
                }
                timgdata.data[(i+offset)*4+0]=255;
                timgdata.data[(i+offset)*4+1]*=0.25;
                timgdata.data[(i+offset)*4+2]*=0.25;
                offset+=theWidth;
            }while((i+offset)<theArea&&colorMap[(i+offset)]==targetColInd);
            const endPixInd = (i+offset)-theWidth;
            if(painted){
                inst += "Start,"+startPixInd%theWidth+","+Math.floor(startPixInd/theWidth)+",\r\n";
                inst += "End,"+endPixInd%theWidth+","+Math.floor(endPixInd/theWidth)+",\r\n";
            }
        }
    }

    //Singlets third
    for(let i=0; i<theArea; i++){
        if(colorMap[i]==targetColInd&&statMap[i]>=1&&statMap[i]<=4){
            if(statMap[i]==1){
                inst += "Start,"+i%theWidth+","+Math.floor(i/theWidth)+"\r\n";
                inst += "End,"+(i-theWidth)%theWidth+","+Math.floor((i-theWidth)/theWidth)+"\r\n";
            }else if(statMap[i]==2){
                inst += "Start,"+i%theWidth+","+Math.floor(i/theWidth)+"\r\n";
                inst += "End,"+(i+1)%theWidth+","+Math.floor((i+1)/theWidth)+"\r\n";
            }else if(statMap[i]==3){
                inst += "Start,"+i%theWidth+","+Math.floor(i/theWidth)+"\r\n";
                inst += "End,"+(i+theWidth)%theWidth+","+Math.floor((i+theWidth)/theWidth)+"\r\n";
            }else if(statMap[i]==4){
                inst += "Start,"+i%theWidth+","+Math.floor(i/theWidth)+"\r\n";
                inst += "End,"+(i-1)%theWidth+","+Math.floor((i-1)/theWidth)+"\r\n";
            }else{
                alert("unknown error. This should not happen.");
            }
            statMap[i]=5;
            paintedCount++;
            timgdata.data[i*4+0]=255;
            timgdata.data[i*4+1]*=0.25;
            timgdata.data[i*4+2]*=0.25;
        }
    }
    console.log("painted: "+paintedCount);
    pct.putImageData(timgdata, 0, 0);
    if(paintedCount){
        return 1;
    }else{
        console.log("NONE!!! target is "+targetColInd+", Paintable is "+paintableCount[targetColInd]);
        if(paintableCount[targetColInd]) return 1;
        return 0;
        // Paint the paintable
        for(let i=0; i<theArea; i++){
            if(colorMap[i] == targetColInd){
                if(statMap[i]==0){
                    statMap[i] =5;
                    timgdata.data[i*4 + 0] = 0;
                    timgdata.data[i*4 + 1] = 255;
                    timgdata.data[i*4 + 2] = 0;
                }
                if(statMap[i]>=1&&statMap[i]<=4){
                    statMap[i] =5;
                    timgdata.data[i*4 + 0] = 0;
                    timgdata.data[i*4 + 1] = 0;
                    timgdata.data[i*4 + 2] = 255;
                }
                /*
                if(statMap[i]!=-1&&statMap[i]!=5&&statMap[i]!=6){
                    statMap[i]=5;
                    timgdata.data[i*4 + 0] = 255;
                    timgdata.data[i*4 + 1] *= 0.75;
                    timgdata.data[i*4 + 2] *= 0.75;
                }
                */
            }
        }
        pct.putImageData(timgdata, 0, 0);
        return 0;
    }

}
console.log("Loaded: canvas.js");