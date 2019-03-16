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
	let newImage = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, 200, 100);
	binarize = new Binarize(newImage.passdata);
	binarize.displayGraph();
	binarize.binarize();
	binarize.display();
}

function button2(){
	blob = new FindBlob(binarize.passdata);
	blob.scanBlobs();
	blob.display();
}

function button3(){
	binarize.display();
}
function button4(){
	let newImage = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, 200, 100);
	newImage.display();
}

function changeParameter(){
	let s1 = Number(slider.value);
	let s2 = Number(slider2.value);
	let s3 = Number(slider3.value);
	binarize.thresh = s1;
	binarize.binarize();
	binarize.displayGraph();
	binarize.display();
	blob = new FindBlob(binarize.passdata);
	blob.scanBlobs();
	blob.display();
}

console.log("Loaded: javascript.js");