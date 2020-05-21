class Canvas{
    constructor(canvas,rcanvas){
        this.side;//Cell Length = Math.floor(Width/9)
        this.offset;
        this.LineWidthThin;
        this.LineWidthThick;
        this.canvasScale;
        this.icon_camera=false;
        this.draw_this = () => {this.draw();};

        this.canvas = canvas;
        this.rcanvas = rcanvas;
        this.ct = canvas.getContext("2d");
        this.rct = rcanvas.getContext("2d");
        this.resize();
        this.rresize();
        if(!recordMode){
            this.rct.clearRect(0,0,rcanvas.width,rcanvas.height);
        }else{
            this.rct.fillStyle = "black";
            this.rct.fillRect(0, 0, rcanvas.width, rcanvas.height);
        }
        this.icon_camera = new Image();
        this.icon_camera.src = "icon_camera.png";
        this.icon_camera.onload = this.draw_this;
    }
    rresize = () => {
        this.rcanvas.width = Math.floor(window.innerWidth);
        if(Math.floor(window.innerWidth)>520)   this.rcanvas.width = 520;
        if(Math.floor(window.innerWidth)<320)   this.rcanvas.width = 320;
        this.rcanvas.height= (recordMode?(33*81+1):1);

        this.rcanvas.style.width  = this.rcanvas.width +"px";
        this.rcanvas.style.height = this.rcanvas.height+"px";
        pixelRatio = window.devicePixelRatio;
        this.rcanvas.width *= pixelRatio;
        this.rcanvas.height*= pixelRatio;

        console.log("RCanvas  Width: "+this.rcanvas.width+"pt, " +this.rcanvas.style.width+"px");
        console.log("RCanvas Height: "+this.rcanvas.height+"pt, "+this.rcanvas.style.height+"px");
    }
    resize(){
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = Math.floor(window.innerWidth);
        if(Math.floor(window.innerWidth)>520)   this.canvas.width = 520;
        if(Math.floor(window.innerWidth)<320)   this.canvas.width = 320;    
        this.canvas.style.width  = this.canvas.width +"px";
        pixelRatio = window.devicePixelRatio;
        this.canvas.width *= pixelRatio;

        this.LineWidthThin = Math.ceil(this.canvas.width/500);
        this.LineWidthThick = Math.ceil(this.canvas.width/150);

        this.side = Math.floor((this.canvas.width-this.LineWidthThick-2)/9);
        this.offset = Math.floor((this.canvas.width-9*this.side)/2);
                                    
        this.canvas.height = this.side*11;
        this.canvas.style.height = this.canvas.height/pixelRatio+"px";
        console.log("Canvas  Width: "+this.canvas.style.width+"pt, " +this.canvas.width+"px LineWidthThick" +this.LineWidthThick+"px");
        console.log("Canvas Height: "+this.canvas.style.height+"pt, "+this.canvas.height+"px LineWidthThin" +this.LineWidthThin +"px");

        this.draw();
    }
    draw(type,par=[undefined]){
        if(phaseList[phasei]=="Input Sudoku Manualy"){
            this.drawGrids();
            if(type=="drawInputs"){
                this.drawGrids(false);
                this.drawNumber(2,8,1,"gray",this.side*3);
                this.drawNumber(5,8,2,"gray",this.side*3);
                this.drawNumber(8,8,3,"gray",this.side*3);
                this.drawNumber(2,5,4,"gray",this.side*3);
                this.drawNumber(5,5,5,"gray",this.side*3);
                this.drawNumber(8,5,6,"gray",this.side*3);
                this.drawNumber(2,2,7,"gray",this.side*3);
                this.drawNumber(5,2,8,"gray",this.side*3);
                this.drawNumber(8,2,9,"gray",this.side*3);
            }else{
                sudoku.draw();
            }
            this.drawNumber(5,0,"Input Sudoku or Scan with →","black",this.side*0.6);
            this.drawNumber(5,10,"Tap HERE to start Analysis.","black",this.side*0.6);
        }else if(phaseList[phasei]=="Scanning Board"){
            this.ct.restore();
            this.ct.save();
            this.drawGrids();
            this.drawNumber(5,0,"Scanning Board","black",this.side*0.6);
            sudoku.draw();
            if(scanner) scanner.draw();
        }else if(phaseList[phasei]=="Correct Scanning Error"){
            this.drawGrids();
            this.drawNumber(5,0,"Drag and Drop","black",this.side*0.6);
            this.drawNumber(5,10,"Tap HERE to start Analysis.","black",this.side*0.6);
            for(let imgI=0;imgI<scanner.numberV.imageAndNumber.length;imgI++){
                const readNumber = scanner.numberV.imageAndNumber[imgI][2];
                const img = scanner.numberV.imageAndNumber[imgI][0];
                let y=(readNumber-1+1.1)*this.side;
                let x=(scanner.numberV.imageAndNumber[imgI][1]+1.1)*this.side+this.offset;
                if(par!=undefined&&par[0]!=imgI){
                    this.ct.drawImage(img,0,0,img.width,img.height,x,y,this.side*0.8,this.side*0.8);
                }
            }
            if(par!=undefined&&par[0]!=undefined){
                const img =  scanner.numberV.imageAndNumber[par[0]][0];
                this.ct.drawImage(img,0,0,img.width,img.height,par[1],par[2],this.side*0.8,this.side*0.8);
            }
            for(let i=0;i<9;i++) this.drawNumber(1,i+1,i+1,"red");
        }else if(phaseList[phasei]=="Solved"){
            this.drawGrids();
            //Draw Sudoku
            sudoku.draw();
        }else if(phaseList[phasei]=="UnSolved"){
            this.drawGrids();
            //Draw Sudoku
            sudoku.draw();
        }else{
            this.drawGrids();
            //Draw Sudoku
            sudoku.draw();
            this.drawNumber(5,0,phaseList[phasei]);
            this.drawNumber(5,10,"Un Known Condition");
        }
    }
    drawGrids(nineByNine=true){
        //Fill with White
        this.ct.fillStyle = "white";
        this.ct.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //Draw Borders
        this.ct.strokeStyle = "black";
        for(let i=0;i<=9;i++){
            if(i%3!=0&&!nineByNine) continue;
            let w = (((i%3)==0)?3:1);
            this.drawLine(this.side*i+this.offset,this.side*1    ,this.side*i+this.offset,this.side*10    ,w);
            this.drawLine(this.offset       ,this.side*(i+1),this.side*9+this.offset,this.side*(i+1) ,w);
        }
        //Draw Camera Icon
        if(this.icon_camera) this.ct.drawImage(this.icon_camera,0,0,100,100,this.side*8.1+this.offset,this.side*0.1,this.side*0.8,this.side*0.8);
    }

    drawNotes(xi,yi,pos,str,color="black",factor=0.8){
        const size = this.side/3.5;
        let x=Math.floor((xi-0.5)*this.side)+((pos-1)%3-1)*size;
        let y=Math.floor((yi+0.55)*this.side)+(Math.floor((pos-1)/3)-1)*size;
        this.ct.fillStyle = color;
        this.ct.font = ""+Math.floor(size*factor)+"px Times New Roman";
        this.ct.textAlign = "center";
        this.ct.textBaseline = "middle";
        this.ct.fillText(str,x+this.offset,y);
    }

    drawNumber(xi,yi,n,color="black",size=this.side, fontFamily = "Times New Roman"){
        //fill with white first
        this.ct.fillStyle = "white";
        this.ct.fillRect((xi-0.95)*this.side+this.offset,(yi+0.05)*this.side,this.side*0.9,this.side*0.9);
        //Draw Number
        const x=Math.floor((xi-0.5)*this.side+this.offset);
        const y=Math.floor((yi+0.55)*this.side);
        this.ct.fillStyle = color;
        this.ct.font = ""+Math.floor(size*0.8)+"px "+fontFamily;
        this.ct.textAlign = "center";
        this.ct.textBaseline = "middle";
        this.ct.fillText(n,x,y);
    }

    drawRectIndex(xii,yii,xil,yil,color="lime",w=1){
        const lefEdgeThick = ((xii-1)%3==0);
        const rigEdgeThick = ((xil  )%3==0);
        const topEdgeThick = ((yii-1)%3==0);
        const botEdgeThick = ((yil  )%3==0);
        const offsetNeg    = Math.ceil (this.LineWidthThick/2)-Math.ceil (this.LineWidthThin/2);
        const offsetPos    = Math.floor(this.LineWidthThick/2)-Math.floor(this.LineWidthThin/2); 
        const xi =(xii-1)*this.side+(this.LineWidthThick+1)-(lefEdgeThick?0:offsetNeg)+this.offset;
        const xl =(xil  )*this.side-(this.LineWidthThick+1)+(rigEdgeThick?0:offsetPos)+this.offset;
        const yi =(yii  )*this.side+(this.LineWidthThick+1)-(topEdgeThick?0:offsetNeg);
        const yl =(yil+1)*this.side-(this.LineWidthThick+1)+(botEdgeThick?0:offsetPos);
        this.ct.strokeStyle = color;
        this.drawLine(xi,yi,xl,yi,w);
        this.drawLine(xi,yi,xi,yl,w);
        this.drawLine(xl,yi,xl,yl,w);
        this.drawLine(xi,yl,xl,yl,w);
    }

    drawLine(xi,yi,xii,yii,w){
        this.ct.lineWidth = (w==1?this.LineWidthThin:this.LineWidthThick);
        const widthOdd = (this.ct.lineWidth%2==1);
        const vertical = (xi==xii);
        const horizontal = (yi==yii);
        const xiBigger = (xi>xii);
        const yiBigger = (yi>yii);
        xi = Math.floor(xi )+(widthOdd?0.5:0)+(horizontal?(xiBigger? this.ct.lineWidth:-this.ct.lineWidth):0)/2;
        xii= Math.floor(xii)+(widthOdd?0.5:0)+(horizontal?(xiBigger?-this.ct.lineWidth: this.ct.lineWidth):0)/2;
        yi = Math.floor(yi )+(widthOdd?0.5:0)+(vertical?(yiBigger? this.ct.lineWidth:-this.ct.lineWidth):0)/2;
        yii= Math.floor(yii)+(widthOdd?0.5:0)+(vertical?(yiBigger?-this.ct.lineWidth: this.ct.lineWidth):0)/2;
        this.ct.beginPath();
        this.ct.moveTo(xi ,yi );
        this.ct.lineTo(xii,yii);
        this.ct.stroke();
    }

    displayArray(array, index = 0, autoMin = 0, height = (this.canvas.height-16)/6, width = this.canvas.width-4){
        const dy = (this.canvas.height+4)*index;
        const dx = this.canvas.width-array.length;
        if(array.length<this.canvas.width) this.canvas.width = array.length;
        this.ct.fillStyle = "rgb(255,  0,255)";
        this.ct.fillRect(dx+1,dy+1,this.canvas.width+2,this.canvas.height+2);
        this.ct.fillStyle = "rgb(255,255,255)";
        this.ct.fillRect(dx+2,dy+2,this.canvas.width,this.canvas.height);
        this.ct.fillStyle = "rgb(  0,  0,  0)";
        const arrayMax = getAbsoluteMinMax(array)[1];
        const arrayMin = autoMin?getAbsoluteMinMax(array)[0]:0;
        for(let i=0;i<array.length;i++){
            const x = dx+2+(i/array.length)*this.canvas.width;
            const y = dy+this.canvas.height+2-Math.ceil((array[i]-arrayMin)*this.canvas.height/(arrayMax-arrayMin));
            this.ct.fillRect(x,y,1,Math.ceil((array[i]-arrayMin)*this.canvas.height/(arrayMax-arrayMin)));
        }
    }
    circle([x,y,rad],[color,w]=["black",1],absolute=false){
        const cs = (absolute?1:this.canvasScale);
        this.ct.strokeStyle = color;
        this.ct.lineWidth = w;
        this.ct.beginPath();
        this.ct.arc(x/cs,y/cs,pixelRatio*rad/cs,0,2*Math.PI);
        this.ct.stroke();
    }

    rotateCanvas(x=ocanvas.width/2, y=ocanvas.height/2, deg=20,ocanvas,oct){
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

        this.ct.translate(x/this.canvasScale,y/this.canvasScale);
        this.ct.rotate( -r );
        this.ct.translate( -x/this.canvasScale, -y/this.canvasScale );
    }

    line([[xi,yi],[xii,yii]],[color,w]=["black", 1],absolute=false){
        const cs = (absolute?1:this.canvasScale);
        this.ct.strokeStyle = color;
        this.ct.lineWidth = w;
        this.drawLine((xi)/cs,yi/cs,(xii)/cs,yii/cs,w)
    }

    text([x,y,string],[color,font]=["black","16pt Times New Roman"],absolute=false){
        cs = (absolute?1:this.canvasScale);
        this.ct.fillStyle = color;
        this.ct.font = font;
        this.ct.fillText(string,x/cs,y/cs);
    }
}   
    

const XYtoIndex=([x,y])=>{    return [Math.floor((x-ca.offset)/ca.side)+1,Math.floor(11*y/ca.canvas.height)];}
const indexToBox=([xi,yi])=>{ return Math.floor(xi/3)+Math.floor(yi/3)*3;}

console.log("Loaded: canvas.js");