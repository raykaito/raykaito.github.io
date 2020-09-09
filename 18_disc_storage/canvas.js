class Canvas{
    constructor(canvas){
        this.canvas = canvas;
        this.ct = canvas.getContext("2d");
        this.pixelRatio = window.devicePixelRatio;
        
        this.canvas.width = Math.floor(window.innerWidth);
        if(Math.floor(window.innerWidth)>520)   this.canvas.width = 520;
        if(Math.floor(window.innerWidth)<320)   this.canvas.width = 320;
        this.canvas.height = Math.floor(this.canvas.width * 0.6);    
        this.canvas.style.width  = this.canvas.width +"px";
        this.canvas.style.height = this.canvas.height +"px";
        this.canvas.width *= this.pixelRatio;
        this.canvas.height*= this.pixelRatio;

        this.ct.fillStyle = "black";
        this.ct.fillRect(0,0,this.canvas.width,this.canvas.height);
    }
    hideCanvas(){
        this.canvas.style.display = "none";
    }
    showCanvas(){
        this.canvas.style.display = "inline";
    }
}

let pixelRatio;
let width;
let height;
let side;//Cell Length = Math.floor(Width/9)
let offset;
let LineWidthThin;
let LineWidthThick;
let ct;
let canvasScale;
let icon_camera=false;
let icon_folder=false;

const initCanvas = () => {
    ct = canvas.getContext("2d");
    rct= rcanvas.getContext("2d");
    resize();
    rresize();
    if(!recordMode){
        rct.clearRect(0,0,rcanvas.width,rcanvas.height);
    }else{
        rct.fillStyle = "black";
        rct.fillRect(0, 0, rcanvas.width, rcanvas.height);
    }
    icon_camera = new Image();
    icon_camera.src = "icon_camera.png";
    icon_camera.onload = ()=>{draw();};
    icon_folder = new Image();
    icon_folder.src = "icon_folder.png";
    icon_folder.onload = ()=>{draw();};
    icon_analyze = new Image();
    icon_analyze.src = "icon_analyze.png";
    icon_analyze.onload = ()=>{draw();};
}

const rresize = () => {
    rcanvas.width = Math.floor(window.innerWidth);
    if(Math.floor(window.innerWidth)>520)   rcanvas.width = 520;
    if(Math.floor(window.innerWidth)<320)   rcanvas.width = 320;
    rcanvas.height= (recordMode?(33*81+1):1);

    rcanvas.style.width  = rcanvas.width +"px";
    rcanvas.style.height = rcanvas.height+"px";
    rcanvas.width *= pixelRatio;
    rcanvas.height*= pixelRatio;

    console.log("RCanvas  Width: "+rcanvas.width+"pt, " +rcanvas.style.width+"px");
    console.log("RCanvas Height: "+rcanvas.height+"pt, "+rcanvas.style.height+"px");
}

const resize = () => {
    rect = canvas.getBoundingClientRect();
    pixelRatio = window.devicePixelRatio;
    
    canvas.width = Math.floor(window.innerWidth);
    if(Math.floor(window.innerWidth)>520)   canvas.width = 520;
    if(Math.floor(window.innerWidth)<320)   canvas.width = 320;    
    canvas.style.width  = canvas.width +"px";
    canvas.width *= pixelRatio;
    width  = canvas.width;

    LineWidthThin = Math.ceil(width/500);
    LineWidthThick = Math.ceil(width/150);

    side = Math.floor(Math.min((width-LineWidthThick-2)/9,50*pixelRatio));
    offset = Math.floor((width-9*side)/2);
    slider.style.width=(Math.floor((side*7)/pixelRatio)+16)+"px";
    //slider.style.marginLeft=(Math.floor((offset+side*1.5)/pixelRatio)-5)+"px";
    slider.style.marginLeft="0px";
    const arrowSize = (Math.floor((side*0.6)/pixelRatio))+"px";
    rightA.style.width    = arrowSize;
    leftA.style.width     = arrowSize;;
    rightA.style.fontSize = arrowSize;;
    leftA.style.fontSize  = arrowSize;;
                                
    canvas.height = side*13+Math.floor(LineWidthThin/2);
    canvas.style.height = canvas.height/pixelRatio+"px";
    height = canvas.height;
    console.log("Canvas  Width: "+canvas.style.width+"pt, " +canvas.width+"px LineWidthThick" +LineWidthThick+"px");
    console.log("Canvas Height: "+canvas.style.height+"pt, "+canvas.height+"px LineWidthThin" +LineWidthThin +"px");

    draw();
}
const draw=()=>{
    phase.draw();
}
const canvasRestoreSave=()=>{
    ct.restore();
    ct.save();
}
const drawUserInputInterface=(userInputMode,selectedNumber, selectedNotes,dragMode=null,[dragx=null, dragy=null])=>{
    //Draw User Input Mode (Number vs Notes);
    if(dragMode=="ModeChange"){
        const xi = Math.atan(((dragx-offset)/side-2)*10)/Math.PI*2+1.5;
        drawSwitch(0.5,10,2.5,10,[xi],[10],side/4,side/2);
    }else{
        drawSwitch(0.5,10,2.5,10,[userInputMode=="Numbers"?0.5:2.5],[10],side/4,side/2);
    }
    drawNumber(1.5,10,"Number",color="white",side*0.4,"Times New Roman",false);
    drawNumber(3.5,10,"Notes",color="white",side*0.4,"Times New Roman",false);
    drawIcon(icon_analyze,8,10);

    //Draw Selected Numbers of Notes (1~9)
    if(userInputMode=="Numbers"){
        if(dragMode=="SelectionChangeNumber"){
            //let tempx = Math.atan(((dragx-offset)/side-2)*10)/Math.PI*2+1.5;
            let tempx = Math.pow(((dragx-offset)/side-selectedNumber+0.5),5)*16;
            console.log(tempx);
            const xi = Math.min(8,Math.max(0,selectedNumber-1+tempx));
            drawSwitch(0,11,8,11,[xi],[11],side/2.25,0);
        }else{
            let xi;
            console.log(selectedNumber);
            if(selectedNumber>0) xi = selectedNumber-1;
            drawSwitch(0,11,8,11,[xi],[11],side/2.25,0);
        }
    }else{
        const xi = new Array();
        const yi = new Array();
        for(i=0;i<9;i++){
            if(selectedNotes[i]){
                xi[i] = i;
                yi[i] = 11;
            }
        }
        drawSwitch(0,11,8,11,xi,yi,side/2.25,0);
    }
    for(let i=0;i<9;i++){
        drawNumber(i+1,11,i+1,color="white",side*0.8,"Times New Roman",false);
    }
}
const drawSwitch = (xii,yii,xil,yil,xic,yic,radius,length) => {
    const xi = Math.floor((xii+0.5)*side-length+offset)+0.5;
    const xl = Math.floor((xil+0.5)*side+length+offset)+0.5;
    const yi = Math.floor((yii+0.5)*side)+0.5;
    const yl = Math.floor((yil+0.5)*side)+0.5;
    const xci= new Array();
    const xcl= new Array();
    const yc = new Array();
    for(let i=0;i<xic.length;i++){
        xci[i] = Math.floor((xic[i]+0.5)*side-length+offset)+0.5;
        xcl[i] = Math.floor((xic[i]+0.5)*side+length+offset)+0.5;
        yc[i]  = Math.floor((yic[i]+0.5)*side)+0.5;
    }
    //Draw Outer
    ct.beginPath();
    ct.arc(xi,yi,radius,0.5*Math.PI,1.5*Math.PI);
    ct.arc(xl,yl,radius,1.5*Math.PI,0.5*Math.PI);
    ct.fillStyle = "black";
    ct.fill();
    //Draw Innder
    ct.beginPath();
    ct.arc(xi,yi,radius-LineWidthThin,0.5*Math.PI,1.5*Math.PI);
    ct.arc(xl,yl,radius-LineWidthThin,1.5*Math.PI,0.5*Math.PI);
    ct.fillStyle = "gray";
    ct.fill();
    //Draw Selection
    for(let i=0;i<xic.length;i++){
        ct.beginPath();
        ct.arc(xci[i],yc[i],radius-LineWidthThin*2,0.5*Math.PI,1.5*Math.PI);
        ct.arc(xcl[i],yc[i],radius-LineWidthThin*2,1.5*Math.PI,0.5*Math.PI);
        ct.fillStyle = "black";
        ct.fill();
    }
}
const drawGraph = () => {
    //SetBacgroundRegions
    ct.fillStyle = "red";
    ct.fillRect(side*1.0+offset, side*11  , side*7, side/2);
    ct.fillStyle = "orange";
    ct.fillRect(side*1.0+offset, side*11.5, side*7, side/2);
    ct.fillStyle = "yellow";
    ct.fillRect(side*1.0+offset, side*12  , side*7, side/2);
    ct.fillStyle = "lightgreen";
    ct.fillRect(side*1.0+offset, side*12.5, side*7, side/2);
    //Draw Axis
    ct.strokeStyle = "black";
    drawLine(side*1.0+offset,side*11,side*1+offset,side*13,1);
    drawLine(side*1.0+offset,side*13,side*8+offset,side*13,1);
    //Label Axis
    drawNumber(1,12.25,"Easy",color="black",side*0.4,"Times New Roman",false);
    drawNumber(1,11.75,"Med.",color="black",side*0.4,"Times New Roman",false);
    drawNumber(1,11.25,"Hard",color="black",side*0.4,"Times New Roman",false);
    drawNumber(1,10.75,"Guess" ,color="black",side*0.4,"Times New Roman",false);
}
const drawGrids = (type="Normal") => {
    //Fill with White
    ct.clearRect(0, 0, width, height);
    ct.fillStyle = "white";
    ct.fillRect(offset, side, side*9, side*9);

    //Draw Borders
    ct.strokeStyle = "black";
    for(let i=0;i<=9;i++){
        if(i%3!=0&&type!="Normal") continue;
        let w = (((i%3)==0)?3:1);
        drawLine(side*i+offset,side*1    ,side*i+offset,side*10    ,w);
        drawLine(offset       ,side*(i+1),side*9+offset,side*(i+1) ,w);
    }
    if(type=="Number"||type=="NumberNote"){
         //Draw Inputs for Solved Number
        drawNumber(2,8,1,"gray",side*3);
        drawNumber(5,8,2,"gray",side*3);
        drawNumber(8,8,3,"gray",side*3);
        drawNumber(2,5,4,"gray",side*3);
        drawNumber(5,5,5,"gray",side*3);
        drawNumber(8,5,6,"gray",side*3);
        drawNumber(2,2,7,"gray",side*3);
        drawNumber(5,2,8,"gray",side*3);
        drawNumber(8,2,9,"gray",side*3);        
    }
    if(type=="NumberNote"){      
        //Draw Inputs for Notes
        drawNumber(3,9,1,"gray",side);
        drawNumber(6,9,2,"gray",side);
        drawNumber(9,9,3,"gray",side);
        drawNumber(3,6,4,"gray",side);
        drawNumber(6,6,5,"gray",side);
        drawNumber(9,6,6,"gray",side);
        drawNumber(3,3,7,"gray",side);
        drawNumber(6,3,8,"gray",side);
        drawNumber(9,3,9,"gray",side);
    }
}
const drawIcon=(img,xi,yi)=>{
    if(img) ct.drawImage(img,0,0,img.width,img.height,side*(xi+0.1)+offset,side*(yi+0.1),side*0.8,side*0.8);
}

const drawNotes = (xi,yi,pos,str,color="black",factor=0.8) => {
    const square = str=="▢";
    const size = side/3.5;
    let x=Math.floor((xi-0.5)*side)+((pos-1)%3-1)*size;
    let y=Math.floor((yi+0.5)*side)+(Math.floor((pos-1)/3)-1)*size;
    ct.fillStyle = color;
    ct.font = ""+Math.floor(1.5*size*factor*(square?1.2:1))+"px Times New Roman";
    ct.textAlign = "center";
    ct.textBaseline = "middle";
    ct.fillText((square?"□":str),x+offset,y-(square?side/20:0));
}

const drawNumber = (xi,yi,n,color="black",size=side, fontFamily = "Times New Roman",overWrite = true) => {
    //fill with white first
    if(overWrite){
        ct.fillStyle = "white";
        ct.fillRect((xi-0.95)*side+offset,(yi+0.05)*side,side*0.9,side*0.9);
    }
    //Draw Number
    const x=Math.floor((xi-0.5)*side+offset);
    const y=Math.floor((yi+0.5)*side);
    ct.fillStyle = color;
    ct.font = ""+Math.floor(size*0.8)+"px "+fontFamily;
    ct.textAlign = "center";
    ct.textBaseline = "middle";
    ct.fillText(n,x,y);
}

const drawRectIndex = (xii,yii,xil,yil,color="lime",w=1) => {
    const lefEdgeThick = ((xii-1)%3==0);
    const rigEdgeThick = ((xil  )%3==0);
    const topEdgeThick = ((yii-1)%3==0);
    const botEdgeThick = ((yil  )%3==0);
    const offsetNeg    = Math.ceil (LineWidthThick/2)-Math.ceil (LineWidthThin/2);
    const offsetPos    = Math.floor(LineWidthThick/2)-Math.floor(LineWidthThin/2); 
    const xi =(xii-1)*side+(LineWidthThick+1)-(lefEdgeThick?0:offsetNeg)+offset;
    const xl =(xil  )*side-(LineWidthThick+1)+(rigEdgeThick?0:offsetPos)+offset;
    const yi =(yii  )*side+(LineWidthThick+1)-(topEdgeThick?0:offsetNeg);
    const yl =(yil+1)*side-(LineWidthThick+1)+(botEdgeThick?0:offsetPos);
    ct.strokeStyle = color;
    drawLine(xi,yi,xl,yi,w);
    drawLine(xi,yi,xi,yl,w);
    drawLine(xl,yi,xl,yl,w);
    drawLine(xi,yl,xl,yl,w);
}

const drawLine = (xi,yi,xii,yii,w) => {
    if(w==0) ct.lineWidth=1;
    else ct.lineWidth = (w==1?LineWidthThin:LineWidthThick);
    const widthOdd = (ct.lineWidth%2==1);
    const vertical = (xi==xii);
    const horizontal = (yi==yii);
    const xiBigger = (xi>xii);
    const yiBigger = (yi>yii);
    xi = Math.floor(xi )+(widthOdd?0.5:0)+(horizontal?(xiBigger? ct.lineWidth:-ct.lineWidth):0)/2;
    xii= Math.floor(xii)+(widthOdd?0.5:0)+(horizontal?(xiBigger?-ct.lineWidth: ct.lineWidth):0)/2;
    yi = Math.floor(yi )+(widthOdd?0.5:0)+(vertical?(yiBigger? ct.lineWidth:-ct.lineWidth):0)/2;
    yii= Math.floor(yii)+(widthOdd?0.5:0)+(vertical?(yiBigger?-ct.lineWidth: ct.lineWidth):0)/2;
    ct.beginPath();
    ct.moveTo(xi ,yi );
    ct.lineTo(xii,yii);
    ct.stroke();
}

const displayArray = (array, index = 0, autoMin = 0, height = (canvas.height-16)/6, width = canvas.width-4) => {
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
const circle = ([x,y,rad],[color,w]=["black",1],absolute=false)=>{
    cs = (absolute?1:canvasScale);
    ct.strokeStyle = color;
    ct.lineWidth = w;
    ct.beginPath();
    ct.arc(x/cs,y/cs,pixelRatio*rad/cs,0,2*Math.PI);
    ct.stroke();
}

const rotateCanvas = (x=ocanvas.width/2, y=ocanvas.height/2, deg=20,ocanvas,oct) => {
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
    drawLine((xi+offset)/cs,yi/cs+side,(xii+offset)/cs,yii/cs+side,w)
}

const text=([x,y,string],[color,font]=["black","16pt Times New Roman"],absolute=false)=>{
    cs = (absolute?1:canvasScale);
    ct.fillStyle = color;
    ct.font = font;
    ct.fillText(string,x/cs,y/cs);
}

const XYtoIndex=([x,y])=>{    return [Math.floor((x-offset)/side)+1,Math.floor(y/side)];}
const indexToBox=([xi,yi])=>{ return Math.floor(xi/3)+Math.floor(yi/3)*3;}

console.log("Loaded: canvas.js");