let pixelRatio;
let width;
let height;
let side;//Cell Length = Width/11
let ct;
let canvasScale;
const fontList = ["Arial","Times New Roman","ＭＳ ゴシック","Georgia","Palatino Linotype","Comic Sans MS","Impact","Arial Black","Arial Black"];

function initCanvas(){
    ct = canvas.getContext("2d");
    resize();
}

function resize(){
    rect = canvas.getBoundingClientRect();
    pixelRatio = window.devicePixelRatio;
    
    canvas.width = Math.floor(window.innerWidth-20);
    if(Math.floor(window.innerWidth)>800)   canvas.width = 780;
    if(Math.floor(window.innerWidth)<320)   canvas.width = 300;                                    
    canvas.height = canvas.width;

    canvas.style.width  = canvas.width +"px";
    canvas.style.height = canvas.height+"px";

    canvas.width *= pixelRatio;
    canvas.height*= pixelRatio;

    width  = canvas.width;
    height = canvas.height;
    side = Math.floor(width/11);

    console.log("Canvas  Width: "+width+"pt, " +canvas.width+"px");
    console.log("Canvas Height: "+height+"pt, "+canvas.height+"px");

    draw();
}

function draw(){
    ct.restore();
    ct.save();
    drawGrids();
    //Draw Sudoku
    sudoku.draw();
    if(scanner) scanner.draw();
}

function drawGrids(nineByNine=true){
    //Fill with White
    ct.fillStyle = "white";
    ct.fillRect(0, 0, width, height);

    //Draw Borders
    ct.strokeStyle = "black";
    for(let i=1;i<11;i++){
        if((i-1)%3!=0&&!nineByNine) continue;
        let w = ((i-1)%3==0?3:1);
        drawLine(side*i,side*1,side*i ,side*10,w);
        drawLine(side*1,side*i,side*10,side*i ,w);
    }
}

function drawNotes(xi,yi,pos,str,color="black",factor=0.8){
    const size = side/3.5;
    let x=Math.floor((xi+0.5)*side)+((pos-1)%3-1)*size;
    let y=Math.floor((yi+0.55)*side)+(Math.floor((pos-1)/3)-1)*size;
    ct.fillStyle = color;
    ct.font = ""+Math.floor(size*factor)+"px Arial";
    ct.textAlign = "center";
    ct.textBaseline = "middle";
    ct.fillText(str,x,y);
}

function drawNumber(xi,yi,n,color="black",size=side){
    //fill with white first
    ct.fillStyle = "white";
    ct.fillRect((xi+0.05)*side,(yi+0.05)*side,side*0.9,side*0.9);
    //Draw Number
    const x=Math.floor((xi+0.5)*side);
    const y=Math.floor((yi+0.55)*side);
    ct.fillStyle = color;
    //ct.font = ""+Math.floor(size*0.8)+"px "+fontList[yi];
    ct.font = ""+Math.floor(size*0.8)+"px "+fontList[0];
    ct.textAlign = "center";
    ct.textBaseline = "middle";
    ct.fillText(n,x,y);
}

function drawRectIndex(xii,yii,xil,yil,color="lime"){
    const xi =Math.floor((xii+0.05)*side); 
    const xl =Math.floor((xil+0.95)*side); 
    const yi =Math.floor((yii+0.05)*side); 
    const yl =Math.floor((yil+0.95)*side);
    ct.strokeStyle = color;
    drawLine(xi,yi,xl,yi,3);
    drawLine(xi,yi,xi,yl,3);
    drawLine(xl,yi,xl,yl,3);
    drawLine(xi,yl,xl,yl,3);
}

function drawLine(xi,yi,xii,yii,w){
    ct.lineWidth = Math.floor(w);
    xi = Math.floor(xi )+0.5;
    xii= Math.floor(xii)+0.5;
    yi = Math.floor(yi )+0.5;
    yii= Math.floor(yii)+0.5;
    ct.beginPath();
    ct.moveTo(xi ,yi );
    ct.lineTo(xii,yii);
    ct.stroke();
}

function displayArray(array, index = 0, autoMin = 0, height = (canvas.height-16)/6, width = canvas.width-4){
    const dy = (height+4)*index;
    const dx = width-array.length;
    if(array.length<width) width = array.length;
    ct.fillStyle = "rgb(255,  0,255)";
    ct.fillRect(dx+1,dy+1,width+2,height+2);
    ct.fillStyle = "rgb(255,255,255)";
    ct.fillRect(dx+2,dy+2,width,height);
    ct.fillStyle = "rgb(  0,  0,  0)";
    const arrayMax = getAbsoluteMinMax(array)[1];
    const arrayMin = autoMin?getAbsoluteMinMax(array)[0]:0;
    for(let i=0;i<array.length;i++){
        const x = dx+2+(i/array.length)*width;
        const y = dy+height+2-Math.ceil((array[i]-arrayMin)*height/(arrayMax-arrayMin));
        ct.fillRect(x,y,1,Math.ceil((array[i]-arrayMin)*height/(arrayMax-arrayMin)));
    }
}
const circle=([x,y,rad],[color,w]=["black",1],absolute=false)=>{
    cs = (absolute?1:canvasScale);
    ct.strokeStyle = color;
    ct.lineWidth = w;
    ct.beginPath();
    ct.arc(x/cs,y/cs,pixelRatio*rad/cs,0,2*Math.PI);
    ct.stroke();
}

function rotateCanvas(x=ocanvas.width/2, y=ocanvas.height/2, deg=20,ocanvas,oct){
    const r = deg2rad(deg);

    const tcanvas = document.createElement("canvas");
    tcanvas.width = ocanvas.width;
    tcanvas.height= ocanvas.height;
    const tct = tcanvas.getContext("2d");
    tct.drawImage(ocanvas,0,0);

    oct.save();
    oct.translate(x,y);
    oct.rotate( r );
    oct.translate( -x, -y );
    oct.fillRect(100,100,100,100);
    oct.drawImage( tcanvas, 0, 0 );
    oct.restore();

    ct.translate(x/canvasScale,y/canvasScale);
    ct.rotate( -r );
    ct.translate( -x/canvasScale, -y/canvasScale );
}

const line=([[xi,yi],[xii,yii]],[color,w]=["black", 1],absolute=false)=>{
    cs = (absolute?1:canvasScale);
    ct.strokeStyle = color;
    ct.lineWidth = w;
    drawLine(xi/cs,yi/cs,xii/cs,yii/cs,w)
}

const text=([x,y,string],[color,font]=["black","16pt Arial"],absolute=false)=>{
    cs = (absolute?1:canvasScale);
    ct.fillStyle = color;
    ct.font = font;
    ct.fillText(string,x/cs,y/cs);
}

console.log("Loaded: canvas.js");