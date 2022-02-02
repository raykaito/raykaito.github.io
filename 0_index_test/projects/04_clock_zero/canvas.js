var lastSec = 0;

var pixelRatio;
var ct;
var width;
var height;
var iww, iw, ih;
var date;
var inductor;

function init(){
    console.log("Initializing...");
    window.addEventListener('resize', resize, false);

    resize();

    inductor = new Array();
    for(j=0;j<=8;j++){
        inductor[j] = new Array();
    }
    for(k=0;k<7 ;k++){
        for(l=1;l<=7;l++){
            inductor[k][l] = 1;
        }
    }

    console.log("Initialization complete.");

    startClock();
}

function startClock() {
    console.log("Clock started.");
    ct = canvas.getContext("2d");
    requestAnimationFrame(animate);
}    

function animate(time) {
    requestAnimationFrame(animate);
    date = new Date();
    newSec = date.getSeconds();
    if(lastSec==newSec) return;
    lastSec = newSec;
    ct.fillStyle = "black";
    ct.fillRect(0, 0, canvas.width, canvas.height);
    drawClock();
}
function drawClock(){
    drawDigit(-3.5,Math.floor(date.getHours()/12));
    drawDigit(-2.5,(date.getHours()%12));
    drawDigit(-1.5,12);
    drawDigit(-0.5,Math.floor(date.getMinutes()/12));
    drawDigit( 0.5,date.getMinutes()%12);
    drawDigit( 1.5,12);
    drawDigit( 2.5,Math.floor(date.getSeconds()/12));
    drawDigit( 3.5,date.getSeconds()%12);
}

function drawDigit(digit, n){
    x = (width-iww)/2+digit*iww+iww*0.05;
    y = (height-ih)/2;
    idx = digit+3.5;
    ct.drawImage(d0,x ,y,iw,ih);

    for(j=1;j<=7;j++)
        inductor[idx][j]=0;

    if(n==0||n==1||n==2||n==5||n==10||n==11)
        inductor[idx][1] = 1;
    if(n==3||n==9)
        inductor[idx][2] = 1;
    if(n==4||n==5||n==6||n==7||n==8||n==11)
        inductor[idx][3] = 1;
    if(n==2||n==7||n==8||n==9||n==10||n==11)
        inductor[idx][4] = 1;
    if(n==0||n==6)
        inductor[idx][5] = 1;
    if(n==1||n==2||n==3||n==4||n==5||n==8)
        inductor[idx][6] = 1;
    if(n==12)
        inductor[idx][7] = 1;

    for(j=1;j<=7;j++){
        if(inductor[idx][j]==1)
            ct.drawImage(d[j],x,y,iw,ih);
    }

}

function resize(event){
    rect = canvas.getBoundingClientRect();
    wWidth = Math.floor(window.innerWidth);
    canvas.width = Math.min(520,wWidth-40);
    canvas.height = Math.floor((window.innerHeight-rect.top-20));
    canvas.style.width  = canvas.width +"px";
    canvas.style.height = canvas.height+"px";
    pixelRatio = window.devicePixelRatio;
    canvas.width *= pixelRatio;
    canvas.height*= pixelRatio;
    width  = canvas.width;
    height = canvas.height;

    iww= width/8;    
    iw = iww*0.9;
    ih = iw*390/140;

    console.log("    - Canvas size Updated.");
}

console.log("Loaded: canvas.js");