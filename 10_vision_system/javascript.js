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

function binarizeBoundary(imageData){
	const dprThreshhold = 0.25;
	const fuzzyImageData = new Filter(imageData);
	let darkPixelRatio = new Array()
	for(let fuzzyRange = 0;fuzzyRange<6;fuzzyRange++){
		fuzzyImageData.fuzzy(fuzzyRange);
		derivativeFilteredImageData = new derivativeFilter(fuzzyImageData.passdata);
		darkPixelRatio[fuzzyRange] = derivativeFilteredImageData.applyFilter();

		if(darkPixelRatio[fuzzyRange]<dprThreshhold){
			return derivativeFilteredImageData;
		}
	}
	alert("You need to take better picture.");
	return false;
}

function button1(){
	const imageDataNew = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, hcanvas.width/6, hcanvas.height/6);
	const binarizedImageData = binarizeBoundary(imageDataNew.passdata);
	scanLineImageData = new FindLine(binarizedImageData.passdata);
	scanLineImageData.findIntersection();
}

function button2(){
}

function button3(){
}

function button4(){
}

function changeParameter(){
	fuzzy.fuzzy(Number(slider.value));
	df = new derivativeFilter(fuzzy.passdata);
	df.applyFilter();
	df.display();
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