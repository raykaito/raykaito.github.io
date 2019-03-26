var ex, ey;
var stepper;
var img, himg;

function initJS(){
	ex = [1,1,0,-1,-1,-1, 0, 1];
	ey = [0,1,1, 1, 0,-1,-1,-1];
}

document.getElementById('inp').onchange = function(e) {
	 ctResized = false;
	hctResized = false;
   img = new Image();
  himg = new Image();
   img.onload =  imageLoaded;
  himg.onload = himageLoaded;
   img.src = URL.createObjectURL(this.files[0]);
  himg.src = URL.createObjectURL(this.files[0]);
};

function imageLoaded() {
	resize(this.height/this.width);
	ct.drawImage(this, 0,0,canvas.width, canvas.height);
}

function himageLoaded() {
	resizeH(this.width, this.height);
	hct.drawImage(this,0,0,this.width,this.height);
}

function button1(){
	const imageDataNew = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, hcanvas.width/6, hcanvas.height/6);
	df = new derivativeFilter(imageDataNew.passdata);
}

function button2(){
}

function button3(){
}

function button4(){
}

function changeParameter(){
}

function changeParameter2(){
}

function changeParameter3(){
	df.allowedDerivative = Number(slider3.value);
	df.display();
}

function imagesLoaded(){
}

console.log("Loaded: javascript.js");