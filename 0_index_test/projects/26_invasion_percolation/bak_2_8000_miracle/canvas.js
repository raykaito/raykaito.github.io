class Canvas{
    constructor(canvas){
        //Initialize Canvas and its size
        this.canvas = canvas;
        this.ct = canvas.getContext("2d");
        this.resize();
        //ColorMapInfo
        this.randColorRGB = new Array();
        this.prepareRandColor();
        //ImageData
        this.ct.fillStyle = "white";
        this.ct.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.imageData = this.ct.getImageData(0,0,this.canvas.width,this.canvas.height);
    }
    prepareRandColor(){
        const colorList = ["aqua","aquamarine","beige","cyan","cornsilk","lawngreen","lime","palegreen","springgreen","yellow","pink","lightpink"];
        for(let colorListIn = 0; colorListIn<colorList.length; colorListIn++){
            this.ct.fillStyle = colorList[colorListIn];
            this.ct.fillRect(0,0,1,1);
            this.imageData = this.ct.getImageData(0,0,1,1);
            this.randColorRGB[colorListIn] = new Uint8Array(3);
            this.randColorRGB[colorListIn][0] = this.imageData.data[0];
            this.randColorRGB[colorListIn][1] = this.imageData.data[1];
            this.randColorRGB[colorListIn][2] = this.imageData.data[2];
        }
    }
    //Canvas Functions
    resize(){
        this.canvas.width = Math.floor(window.innerWidth)-20;
        if(Math.floor(window.innerWidth)>540)   this.canvas.width = 520;
        if(Math.floor(window.innerWidth)<320)   this.canvas.width = 320;
        //this.canvas.width = 20;
        this.canvas.style.width  = this.canvas.width + "px";
        this.canvas.style.height = this.canvas.width + "px";
        this.pixelRatio = window.devicePixelRatio;
        const side = 8000;
        this.canvas.width  = side;
        this.canvas.height = side;
    }
    setPix(index, value,rgb=3){
        //Set the pixel based on type
        if(rgb==3){
            this.imageData.data[4*index+0] = value;
            this.imageData.data[4*index+1] = value;
            this.imageData.data[4*index+2] = value;
        }else{
            this.imageData.data[4*index+rgb] = value;
        }
    }
    setRandomColor(index,value){
        const colorIndex = value%this.randColorRGB.length;
        this.imageData.data[4*index+0] = this.randColorRGB[colorIndex][0];
        this.imageData.data[4*index+1] = this.randColorRGB[colorIndex][1];
        this.imageData.data[4*index+2] = this.randColorRGB[colorIndex][2];
    }
    text(string="empty string", x=0, y=0, color="black", font="10px 'Times'", ta="left", tbl="top"){
        this.ct.fillStyle = color;
        this.ct.font = font;
        this.ct.textAlign = ta;
        this.ct.textBaseline = tbl;
        this.ct.fillText(string,x,y);
    }
    hideCanvas(){
        this.canvas.style.display = "none";
    }
    showCanvas(){
        this.canvas.style.display = "inline";
    }
}
class LogCanvas extends Canvas{
    constructor(canvas=document.createElement("canvas"),lineSize=16){
        super(canvas);
        this.lineSize = lineSize;
        this.font = ""+lineSize+"px 'Times'";

        this.canvas.width = Math.floor(window.innerWidth)-20;
        if(Math.floor(window.innerWidth)>540)   this.canvas.width = 520;
        if(Math.floor(window.innerWidth)<320)   this.canvas.width = 320;
        //this.canvas.width = 20;
        this.canvas.style.width  = this.canvas.width + "px";
        this.canvas.style.height = this.canvas.width*0.4 + "px";
        this.pixelRatio = window.devicePixelRatio;
        this.canvas.width  = this.canvas.width;
        this.canvas.height = this.canvas.width*0.4;
        this.canvas.width *= this.pixelRatio;
        this.canvas.height*= this.pixelRatio;

        this.ct.fillStyle = "white";
        this.ct.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.newLine("Logger Started...");
    }
    newLine(string="Empty"){
        if(string.isArray){
            let newString = "";
            string.forEach((element)=>{
                newString = newString+","+element;
            });
            string = newString;
        }
        this.text(string,0,0,"black",this.font);
        this.ct.drawImage(this.canvas,0,this.lineSize);
        this.ct.fillStyle = "white";
        this.ct.fillRect(0,0,this.canvas.width,this.lineSize);
    }
    onLine(string="Empty"){
        this.ct.fillStyle = "white";
        this.ct.fillRect(0,0,this.canvas.width,this.lineSize);
        this.text(string,0,0,"black",this.font);        
    }
}
console.log("Loaded: canvas.js");