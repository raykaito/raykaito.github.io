var hcanvas, hct, hwidth, hheight, hRatio;

function initHcanvas(){
    hcanvas = document.createElement("canvas");
    hct = hcanvas.getContext("2d");
}

function resizeH(widthIn, heightIn){
    hcanvas.width = widthIn;
    hcanvas.height= heightIn;

    hwidth = widthIn;
    hheight= heightIn;

    hRatio=hwidth/width;
}

console.log("Loaded: hcanvas.js");