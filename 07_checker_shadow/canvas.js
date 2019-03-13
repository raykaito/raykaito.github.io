var pixelRatio;
var width;
var height;
var ct;
var grayScale;//0~255

var firstTime;
var lastTime;
var hide;
var AAI; //auto adjustment index

var maxWidth, su, sl, lu, ll;//Cells Cordinate

function initCanvas(){
    ct = canvas.getContext("2d");

    resize();

    grayScale = 120;
    hide = false;
    maxWidth = 780;
    su = [[332,224],[430,245],[480,189],[383,168]];
    sl = [[323,362],[422,386],[473,326],[377,305]];
    lu = [[226,341],[323,362],[480,189],[383,168]];
    ll = [[323,362],[422,386],[580,210],[480,189]];

    for(i=0;i<4;i++){
        su[i][0]=su[i][0]*width*pixelRatio/maxWidth;
        su[i][1]=su[i][1]*width*pixelRatio/maxWidth;
        sl[i][0]=sl[i][0]*width*pixelRatio/maxWidth;
        sl[i][1]=sl[i][1]*width*pixelRatio/maxWidth;
        lu[i][0]=lu[i][0]*width*pixelRatio/maxWidth;
        lu[i][1]=lu[i][1]*width*pixelRatio/maxWidth;
        ll[i][0]=ll[i][0]*width*pixelRatio/maxWidth;
        ll[i][1]=ll[i][1]*width*pixelRatio/maxWidth;
    }
    drawChecker();
}

function drawChecker(){
    ct.clearRect(0,0,width*pixelRatio,height*pixelRatio);

    if(!hide) ct.drawImage(checker, 0, 0, width*pixelRatio, height*pixelRatio);
    //span.innerHTML = hide?"0~100%":(grayScale-120)/(206-120)+"%";
    myspan.textContent = !hide?"0~100%":"AAI: "+Math.floor(100*(grayScale-120)/(206-120))+"%";

    drawCell('rgb('+grayScale+','+grayScale+','+grayScale+')', hide?lu:su);
    drawCell('rgb(120,120,120)', hide?ll:sl);

    ct.fillStyle = 'rgb(48,48,48)';
    ct.textBaseline = "middle"; 
    ct.textAlign = "center";
    ct.font = (25*pixelRatio).toString()+"px Georgia";
    ct.fillText("A",(su[0][0]+su[2][0])/2,(su[0][1]+su[2][1])/2);
    ct.fillText("B",(sl[0][0]+sl[2][0])/2,(sl[0][1]+sl[2][1])/2);
}

function drawCell(fillStyle,cc){
    ct.fillStyle = fillStyle;
    ct.beginPath();
    for(i=0;i<4;i++)    ct.lineTo(cc[i][0],cc[i][1]);
    ct.closePath();
    ct.fill();
}

function resize(){
    rect = canvas.getBoundingClientRect();
    pixelRatio = window.devicePixelRatio;
    if(Math.floor(window.innerWidth)>600)   canvas.width = 520;
    else                                    canvas.width = Math.floor(window.innerWidth-20);
    canvas.height = canvas.width*0.8;
    
    canvas.style.width  = canvas.width +"px";
    canvas.style.height = canvas.height+"px";

    width  = canvas.width;
    height = canvas.height;

    canvas.width *= pixelRatio;
    canvas.height*= pixelRatio;
}

console.log("Loaded: canvas.js");