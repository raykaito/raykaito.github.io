var ct, hct, mct;
var canvas, hcanvas, mcanvas;
var pixelRatio, canvasScale;
var animationStartTime, fpsTrackTime;
var interval,sudoku;

function initHcanvas(){
    pixelRatio = window.devicePixelRatio;
    hcanvas = document.getElementById("hugeCanvas");
    hct = hcanvas.getContext("2d");
    requestAnimationFrame(draw);
}
function initCanvas(){
    canvas = document.getElementById("displayCanvas");
    canvas.addEventListener('click', clicked, false);
    canvas.addEventListener('touchcancel', clicked, false);
    ct = canvas.getContext("2d");
    resize(400);
    ct.fillRect(0,0,canvas.width,canvas.height);
}
function initMcanvas(){
    mcanvas = document.getElementById("monitorCanvas");
    mct = mcanvas.getContext("2d");
    resizeM();
}

function resizeH(vLength){
    hcanvas.width = vLength;
    hcanvas.height= vLength;
    hcanvas.style.width  = hcanvas.width /pixelRatio +"px";
    hcanvas.style.height = hcanvas.height/pixelRatio+"px";
}
function resize(){
    canvas.width  = Math.floor(Math.min((window.innerWidth-40),760));
    canvas.height = canvas.width;
    canvas.style.width  = canvas.width +"px";
    canvas.style.height = canvas.height+"px";
    canvas.width *= pixelRatio;
    canvas.height*= pixelRatio;
    canvasScale = hcanvas.width/canvas.width;

    ct.save();

    console.log("Display Canvas Resize Requested...");
    console.log("pixelRatio: "+pixelRatio);
    console.log("dimension : "+canvas.style.width + ", "+ canvas.style.height);
    console.log("dimension : "+canvas.width + "  , "+ canvas.height);
}
function resizeM(){
    mcanvas.width  = canvas.width;
    mcanvas.height = 1377;
    mcanvas.style.width  = mcanvas.width/pixelRatio +"px";
    mcanvas.style.height = mcanvas.height/pixelRatio+"px";
    mct.fillRect(0,0,mcanvas.width,mcanvas.height);
}

function clicked(event){
    const rect = event.target.getBoundingClientRect();
    let x = event.pageX-rect.left-document.body.scrollLeft;
    let y = event.pageY-rect.top-document.body.scrollTop;
    x *= pixelRatio;
    y *= pixelRatio;
    kill();
}

function displayArray(array, index = 0, autoMin = 0, height = (mcanvas.height-16)/4, width = mcanvas.width-4){
    const dy = (height+4)*index;
    if(array.length<width) width = array.length;
    mct.fillStyle = "rgb(255,  0,255)";
    mct.fillRect(1,dy+1,width+2,height+2);
    mct.fillStyle = "rgb(255,255,255)";
    mct.fillRect(2,dy+2,width,height);
    mct.fillStyle = "rgb(  0,  0,  0)";
    const arrayMax = getAbsoluteMinMax(array)[1];
    const arrayMin = autoMin?getAbsoluteMinMax(array)[0]:0;
    for(let i=0;i<array.length;i++){
        const x = 2+(i/array.length)*width;
        const y = dy+height+2-Math.ceil((array[i]-arrayMin)*height/(arrayMax-arrayMin));
        mct.fillRect(x,y,1,Math.ceil((array[i]-arrayMin)*height/(arrayMax-arrayMin)));
    }
}

function rotateCanvas(x=hcanvas.width/2, y=hcanvas.height/2, deg=20){
    const r = deg2rad(deg);

    const tcanvas = document.createElement("canvas");
    tcanvas.width = hcanvas.width;
    tcanvas.height= hcanvas.height;
    const tct = tcanvas.getContext("2d");
    tct.drawImage(hcanvas,0,0);

    hct.save();
    hct.translate(x,y);
    hct.rotate( r );
    hct.translate( -x, -y );
    hct.fillRect(100,100,100,100);
    hct.drawImage( tcanvas, 0, 0 );
    hct.restore();

    ct.translate(x/canvasScale,y/canvasScale);
    ct.rotate( -r );
    ct.translate( -x/canvasScale, -y/canvasScale );
}

function draw() {
    if(stop) return;
    animationStartTime = Date.now();
    ct.restore();
    ct.save();
    const vLength = Math.min(video.videoWidth,video.videoHeight,640);
    let sx,sy;
    if(hcanvas.width!=vLength){
        resizeH(vLength);
        resize();
        resizeM();
    }
    if(vLength!=0){
        if(video.videoWidth>video.videoHeight){
            sx = (video.videoWidth - video.videoHeight)/2;
            sy = 0;
        }else{
            sx = 0;
            sy = (video.videoHeight - video.videoWidth)/2;
        }
        hct.drawImage(video,sx,sy,vLength,vLength,0,0,hcanvas.width,hcanvas.height);
        ct.drawImage(video,sx,sy,vLength,vLength,0,0,canvas.width,canvas.height);
        updateInfo();
        boardV.startScan();
        numberV.startScan(boardV);
    }
    requestAnimationFrame(draw);
}

function showFPS(){
    const length = 100;
    let timeList = new Array(length).fill(0);
    let index = 0;

    return function(){
        const now = Date.now();
        timeList[index] = now - animationStartTime;
        index = (index+1)%length;
        animationStartTime = now;
        return Math.floor(1000/getAve(timeList));
    }
}

function displayInformation(){
    const length = 100;
    let timeList = new Array(length).fill(0);
    let index = 0;

    return function(){
        const now = Date.now();
        timeList[index] = now - fpsTrackTime;
        index = (index+1)%length;
        fpsTrackTime = now;
        text([0,16,("FPS: "+Math.floor(1000/getAve(timeList)))],["lime","16pt Arial"],1);
        text([0,32,("DIM: "+hcanvas.width+"x"+hcanvas.height)],["lime","16pt Arial"],1);
    }
}

const line=([[xi,yi],[xii,yii]],[color,w]=["black", 1],absolute=false)=>{
    cs = (absolute?1:canvasScale);
    ct.strokeStyle = color;
    ct.lineWidth = w;
    ct.beginPath();
    ct.moveTo(xi/cs ,yi /cs);
    ct.lineTo(xii/cs,yii/cs);
    ct.stroke();
}

const circle=([x,y,rad],[color,w]=["black",1],absolute=false)=>{
    cs = (absolute?1:canvasScale);
    ct.strokeStyle = color;
    ct.lineWidth = w;
    ct.beginPath();
    ct.arc(x/cs,y/cs,pixelRatio*rad/cs,0,2*Math.PI);
    ct.stroke();
}

const text=([x,y,string],[color,font]=["black","16pt Arial"],absolute=false)=>{
    cs = (absolute?1:canvasScale);
    ct.fillStyle = color;
    ct.font = font;
    ct.fillText(string,x/cs,y/cs);
}

console.log("Loaded: canvas.js");