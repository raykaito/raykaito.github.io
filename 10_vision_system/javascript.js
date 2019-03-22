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
	fucktion();
}

function button1(){
	let array = [1,2,1,2,1,7,1,3,1,3,1,3,1,4,1,4,1,4,1,7,1,5,1,5,1,6,1,5,1,6,0];
	getLocalMinMaxIndex(array,2);
}

function button2(){
	fl.findIntersection();
}

function button3(){
}

function button4(){
}

function changeParameter(){
	let s1 = Number(slider.value);
	console.log(nextBinary(s1));
}

function changeParameter2(){
	let s2 = Number(slider2.value);
	binarize = new Binarize(imageDataNew.passdata);
	binarize.display();
	binarize.updateSmoothHistogram(s2);
	binarize.displayHistogram();
	binarize.displaySmoothHistogram();
}

function changeParameter3(){
	fl.scanAngle = Number(slider3.value);
	fl.scanIntensity();
	fl.display();
	fl.displayGraph();
}

function fucktion(){
	const imageDataNew = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, hcanvas.width/6, hcanvas.height/6);
	fl = new FindLine(imageDataNew.passdata);
}

console.log("Loaded: javascript.js");