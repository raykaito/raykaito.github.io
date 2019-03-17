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
	newImage = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, 200, 200);
	filteredImage = new Filter(newImage.passdata);
	filteredImage.fuzzy(Number(slider2.value));
	filteredImage.display();
	binarize = new Binarize(filteredImage.passdata);
}

function button2(){
	newImage2 = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, 100, 100);
	lineScanner = new FindLine(newImage2.passdata);
	lineScanner.scanAngle = 3.9;
	lineScanner.displayGraph();
	lineScanner.display();
}

function button3(){
	binarize = new Binarize(filteredImage.passdata);
}

function button4(){
}

function changeParameter(){
	let s1 = Number(slider.value);
	let s2 = Number(slider2.value);
	let s3 = Number(slider3.value);

	filteredImage.fuzzy(Number(slider2.value));


	binarize = new Binarize(filteredImage.passdata);
	binarize.thresh = s1;
	binarize.binarize();
	binarize.displayGraph();

	blob = new FindBlob(binarize.passdata);
	blob.scanBlobs();
	blob.display();
}

function changeParameter3(){
	let s1 = Number(slider.value);
	let s2 = Number(slider2.value);
	let s3 = Number(slider3.value);

	lineScanner.scanAngle = s3;
	lineScanner.displayGraph();
	lineScanner.display();
}

console.log("Loaded: javascript.js");