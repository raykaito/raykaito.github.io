let pixelRatio;
let width;
let height;
let side;//Cell Length = Width/11
let ct;
let canvasScale;
let icon_camera=false;

function initCanvas(){
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
    icon_camera.onload = draw;
}

rresize = () => {
    rcanvas.width = Math.floor(window.innerWidth-40);
    if(Math.floor(window.innerWidth)>800)   rcanvas.width = 760;
    if(Math.floor(window.innerWidth)<320)   rcanvas.width = 280;
    rcanvas.height= (recordMode?(33*81+1):1);

    rcanvas.style.width  = rcanvas.width +"px";
    rcanvas.style.height = rcanvas.height+"px";
    rcanvas.width *= pixelRatio;
    rcanvas.height*= pixelRatio;

    console.log("RCanvas  Width: "+rcanvas.width+"pt, " +rcanvas.style.width+"px");
    console.log("RCanvas Height: "+rcanvas.height+"pt, "+rcanvas.style.height+"px");
}

function resize(){
    rect = canvas.getBoundingClientRect();
    pixelRatio = window.devicePixelRatio;
    
    canvas.width = Math.floor(window.innerWidth-40);
    if(Math.floor(window.innerWidth)>800)   canvas.width = 760;
    if(Math.floor(window.innerWidth)<320)   canvas.width = 280;                                    
    canvas.height = canvas.width;

    canvas.style.width  = canvas.width +"px";
    canvas.style.height = canvas.height+"px";

    canvas.width *= pixelRatio;
    canvas.height*= pixelRatio;

    width  = canvas.width;
    height = canvas.height;
    side = Math.floor(width/11);

    console.log("Canvas  Width: "+canvas.style.width+"pt, " +canvas.width+"px");
    console.log("Canvas Height: "+canvas.style.height+"pt, "+canvas.height+"px");

    draw();
}
const draw=(type,par=[undefined])=>{
    if(phaseList[phasei]=="Input Sudoku Manualy"){
        drawGrids();
        if(type=="drawInputs"){
            drawGrids(false);
            drawNumber(2,8,1,"gray",side*3);
            drawNumber(5,8,2,"gray",side*3);
            drawNumber(8,8,3,"gray",side*3);
            drawNumber(2,5,4,"gray",side*3);
            drawNumber(5,5,5,"gray",side*3);
            drawNumber(8,5,6,"gray",side*3);
            drawNumber(2,2,7,"gray",side*3);
            drawNumber(5,2,8,"gray",side*3);
            drawNumber(8,2,9,"gray",side*3);
        }else{
            sudoku.draw();
        }
        drawNumber(5,0,"Input Sudoku or Scan with →","black",side*0.6);
        drawNumber(5,10,"Tap HERE to start Analysis.","black",side*0.6);
    }else if(phaseList[phasei]=="Scanning Board"){
        ct.restore();
        ct.save();
        drawGrids();
        drawNumber(5,0,"Scanning Board","black",side*0.6);
        sudoku.draw();
        if(scanner) scanner.draw();
    }else if(phaseList[phasei]=="Correct Scanning Error"){
        drawGrids();
        drawNumber(5,0,"Drag and Drop","black",side*0.6);
        drawNumber(5,10,"Tap HERE to start Analysis.","black",side*0.6);
        for(let imgI=0;imgI<scanner.numberV.imageAndNumber.length;imgI++){
            const readNumber = scanner.numberV.imageAndNumber[imgI][2];
            const img = scanner.numberV.imageAndNumber[imgI][0];
            let y=(readNumber-1+1.1)*side;
            let x=(scanner.numberV.imageAndNumber[imgI][1]+1.1)*side;
            if(par!=undefined&&par[0]!=imgI){
                ct.drawImage(img,0,0,img.width,img.height,x,y,side*0.8,side*0.8);
            }
        }
        if(par!=undefined&&par[0]!=undefined){
            const img =  scanner.numberV.imageAndNumber[par[0]][0];
            ct.drawImage(img,0,0,img.width,img.height,par[1],par[2],side*0.8,side*0.8);
        }
        for(let i=0;i<9;i++) drawNumber(0,i+1,i+1,"red");
    }else if(phaseList[phasei]=="Solved"){
        drawGrids();
        //Draw Sudoku
        sudoku.draw();
    }else if(phaseList[phasei]=="UnSolved"){
        drawGrids();
        //Draw Sudoku
        sudoku.draw();
    }else{
        drawGrids();
        //Draw Sudoku
        sudoku.draw();
        drawNumber(5,0,phaseList[phasei]);
        drawNumber(5,10,"Un Known Condition");
    }
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
    //Draw Camera Icon
    if(icon_camera) ct.drawImage(icon_camera,0,0,100,100,side*10.1,side*0.1,side*0.8,side*0.8);
}

function drawNotes(xi,yi,pos,str,color="black",factor=0.8){
    const size = side/3.5;
    let x=Math.floor((xi+0.5)*side)+((pos-1)%3-1)*size;
    let y=Math.floor((yi+0.55)*side)+(Math.floor((pos-1)/3)-1)*size;
    ct.fillStyle = color;
    ct.font = ""+Math.floor(size*factor)+"px Times New Roman";
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
    ct.font = ""+Math.floor(size*0.8)+"px Times New Roman";
    ct.textAlign = "center";
    ct.textBaseline = "middle";
    ct.fillText(n,x,y);
}

function drawRectIndex(xii,yii,xil,yil,color="lime",w=1){
    const xi =Math.floor((xii  )*side)+Math.floor((1+w)*pixelRatio); 
    const xl =Math.floor((xil+1)*side)-Math.floor((1+w)*pixelRatio);
    const yi =Math.floor((yii  )*side)+Math.floor((1+w)*pixelRatio);
    const yl =Math.floor((yil+1)*side)-Math.floor((1+w)*pixelRatio);
    ct.strokeStyle = color;
    drawLine(xi,yi,xl,yi,3,w);
    drawLine(xi,yi,xi,yl,3,w);
    drawLine(xl,yi,xl,yl,3,w);
    drawLine(xi,yl,xl,yl,3,w);
}

function drawLine(xi,yi,xii,yii,w){
    ct.lineWidth = Math.floor(w*pixelRatio);
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

const text=([x,y,string],[color,font]=["black","16pt Times New Roman"],absolute=false)=>{
    cs = (absolute?1:canvasScale);
    ct.fillStyle = color;
    ct.font = font;
    ct.fillText(string,x/cs,y/cs);
}

const XYtoIndex=([x,y])=>{    return [Math.floor(11*x/width),Math.floor(11*y/height)];}
const indexToBox=([xi,yi])=>{ return Math.floor(xi/3)+Math.floor(yi/3)*3;}

console.log("Loaded: canvas.js");