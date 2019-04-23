var lastSec = 0;

var pixelRatio;
var ct;
var width;
var height;
var date;
var charDist, charWidth, charLength;

const init = () => {
    console.log("Initializing...");
    window.addEventListener('resize', resize, false);
    resize();
    console.log("Initialization complete.");
    startClock();
}

const startClock = () => {
    console.log("Clock started.");
    ct = canvas.getContext("2d");
    ct.imageSmoothingEnabled= false;
    requestAnimationFrame(animate);
}    

const animate = (time) => {
    requestAnimationFrame(animate);
    let date = new Date();
    let sec = date.getSeconds();
    let min = date.getMinutes();
    let hr = date.getHours();
    if(lastSec==sec) return;
    console.log(hr+":"+min+":"+sec);
    lastSec = sec;
    //Fill Rectangle
    ct.fillStyle = "black";
    ct.fillRect(0, 0, canvas.width, canvas.height);

    //Draw the Characters
    ct.fillStyle = "white";
    for(let i=0;i<12;i++){drawCharacter(i);}

    ct.strokeStyle = "white";
    let xy = new Array();
    
    ct.lineWidth = charWidth/3;
    xy = getXYfromDirDis(sec*6-90,charDist);
    ct.beginPath();
    ct.moveTo(width/2, height/2);
    ct.lineTo(xy[0]+width/2, xy[1]+height/2);
    ct.stroke();
    
    ct.lineWidth = charWidth;
    xy = getXYfromDirDis(min*6-90,charDist);
    ct.beginPath();
    ct.moveTo(width/2, height/2);
    ct.lineTo(xy[0]+width/2, xy[1]+height/2);
    ct.stroke();
    
    ct.lineWidth = charWidth*3;
    xy = getXYfromDirDis(hr*30+min/2-90,charDist*0.6);
    ct.beginPath();
    ct.moveTo(width/2, height/2);
    ct.lineTo(xy[0]+width/2, xy[1]+height/2);
    ct.stroke();
}

const drawCharacter = (digit) =>{
    const direction=360/12*digit-90;
    let a, b, c, d;
    let xy = getXYfromDirDis(direction, charDist);
    xy[0]+=width/2;
    xy[1]+=height/2;
    ct.beginPath();
    if(digit==10||digit==11||digit== 0||digit== 1||digit== 2||digit==5){
        //FirstLine
        a = Math.floor(xy[0]-charLength-charWidth);
        b = Math.floor(xy[1]-charLength-charWidth);
        c = Math.floor(xy[0]+charLength+charWidth-a);
        d = Math.floor(xy[1]-charLength+charWidth-b);
        ct.rect(a,b,c,d);
    }
    if(digit== 1||digit== 2||digit== 3||digit== 4||digit==5||digit==8){
        //SecondLine
        a = Math.floor(xy[0]+charLength-charWidth);
        b = Math.floor(xy[1]-charLength-charWidth);
        c = Math.floor(xy[0]+charLength+charWidth-a);
        d = Math.floor(xy[1]+charLength+charWidth-b);
        ct.rect(a,b,c,d);
    }
    if(digit== 4||digit== 5||digit== 6||digit== 7||digit==8||digit==11){
        //ThirdLine
        a = Math.floor(xy[0]-charLength-charWidth);
        b = Math.floor(xy[1]+charLength-charWidth);
        c = Math.floor(xy[0]+charLength+charWidth-a);
        d = Math.floor(xy[1]+charLength+charWidth-b);
        ct.rect(a,b,c,d);
    }
    if(digit== 7||digit== 8||digit== 9||digit== 10||digit==11||digit==2){
        //FourthLine
        a = Math.floor(xy[0]-charLength-charWidth);
        b = Math.floor(xy[1]-charLength-charWidth);
        c = Math.floor(xy[0]-charLength+charWidth-a);
        d = Math.floor(xy[1]+charLength+charWidth-b);
        ct.rect(a,b,c,d);
    }
    if(digit==0||digit==6){
        //FifthLine
        a = Math.floor(xy[0]           -charWidth);
        b = Math.floor(xy[1]-charLength-charWidth);
        c = Math.floor(xy[0]           +charWidth-a);
        d = Math.floor(xy[1]+charLength+charWidth-b);
        ct.rect(a,b,c,d);
    }
    if(digit==3||digit==9){
        //SixthLine
        a = Math.floor(xy[0]-charLength-charWidth);
        b = Math.floor(xy[1]           -charWidth);
        c = Math.floor(xy[0]+charLength+charWidth-a);
        d = Math.floor(xy[1]           +charWidth-b);
        ct.rect(a,b,c,d);
    }
    ct.fill();
}

const resize = (event) => {
    const rect = canvas.getBoundingClientRect();
    const InnerWidth = Math.floor(window.innerWidth);
    const InnerHeight = Math.floor(window.innerHeight);
    canvas.width = Math.floor(Math.min(560, InnerWidth)-40);
    canvas.height = Math.floor(InnerHeight-40);
    canvas.style.width  = canvas.width +"px";
    canvas.style.height = canvas.height+"px";
    pixelRatio = window.devicePixelRatio;
    canvas.width = Math.floor(canvas.width *pixelRatio);
    canvas.height= Math.floor(canvas.height*pixelRatio);
    width  = canvas.width;
    height = canvas.height;
    const leg = Math.min(width, height)

    charDist = Math.floor(leg/3);
    charWidth = Math.floor(leg/160);
    charLength = Math.floor(leg/25);


    console.log("    - Canvas size Updated.");
}

console.log("Loaded: canvas.js");