let pixelRatio;
let width;
let height;
let side;
let ct;

function initCanvas(){
    ct = canvas.getContext("2d");
    resize();
}

function resize(){
    rect = canvas.getBoundingClientRect();
    pixelRatio = window.devicePixelRatio;
    
    canvas.width = Math.floor(window.innerWidth-20);
    if(Math.floor(window.innerWidth)>800)   canvas.width = 780;
    if(Math.floor(window.innerWidth)<520)   canvas.width = 500;                                    
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
    drawGrids();
    //Draw Sudoku
    sudoku.draw();
}

function drawGrids(nineByNine=true){
    //Fill with White
    ct.fillStyle = "white";
    ct.fillRect(0, 0, width, height);

    //Draw Borders
    ct.strokeStyle = "black";
    for(let i=1;i<11;i++){
        if((i-1)%3!=0&&!nineByNine) continue;
        let w = ((i-1)%3==0?3:1)*pixelRatio;
        line(side*i,side*1,side*i ,side*10,w);
        line(side*1,side*i,side*10,side*i ,w);
    }
}

function drawNumber(xi,yi,n,color="black",size=side){
    const x=Math.floor((xi+0.5)*side);
    const y=Math.floor((yi+0.6)*side);
    ct.fillStyle = color;
    ct.font = ""+Math.floor(size*0.8)+"px Arial";
    ct.textAlign = "center";
    ct.textBaseline = "middle";
    ct.fillText(n,x,y);
}

function drawRectIndex(xii,yii,xil,yil,color="lime"){
    const xi =Math.floor((xii+0.1)*side); 
    const xl =Math.floor((xil+0.9)*side); 
    const yi =Math.floor((yii+0.1)*side); 
    const yl =Math.floor((yil+0.9)*side);
    ct.strokeStyle = color;
    line(xi,yi,xl,yi,3);
    line(xi,yi,xi,yl,3);
    line(xl,yi,xl,yl,3);
    line(xi,yl,xl,yl,3);
}

function line(xi,yi,xii,yii,w){
    ct.lineWidth = Math.floor(w);
    xi = Math.floor(xi );
    xii= Math.floor(xii);
    yi = Math.floor(yi );
    yii= Math.floor(yii);
    ct.beginPath();
    ct.moveTo(xi ,yi );
    ct.lineTo(xii,yii);
    ct.stroke();
}

console.log("Loaded: canvas.js");