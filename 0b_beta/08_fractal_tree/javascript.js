var origin;
var branch, angle, drate;
var ymin, ymax, xmin, xmax, scale;
var itv, target, step, targetType;

function initJS(){
	branchS.value = 10;
	angleS.value = 0;
	drateS.value = 70;

	target = [[10,15,66],[10,29,54],[10,60,60],[10,90,71]];

	changeParameter();
	autoSlideStart(1);
}

function autoSlideStart(type){
	clearInterval(itv);
	targetType = type;
	step = 20;
	itv = setInterval(slideTick,60);
}

function slideTick(type){
	if(step==0){
		clearInterval(itv);
		return;
	}

	branchS.value = Number(branchS.value)+Math.floor((target[targetType-1][0]-Number(branchS.value))/step);
	 angleS.value = Number( angleS.value)+Math.floor((target[targetType-1][1]-Number( angleS.value))/step);
	 drateS.value = Number( drateS.value)+Math.floor((target[targetType-1][2]-Number( drateS.value))/step);

	step--;
	changeParameter();
}

function changeParameter(){
	branch=Number(branchS.value);
	angle =Number( angleS.value);
	drate =Number( drateS.value);

	generateTree();
}

function generateTree(){

	//Clear Window
    ct.clearRect(0, 0, width*pixelRatio, height*pixelRatio);
    ct.save();

    //Generate Tree
	ymin = ymax = xmin = xmax = 0;
	origin = new node(0,0,270,0);

	//Fit the tree in the Window and draw it
	xscale = width/(xmax-xmin)*0.95;
	yscale = height/(ymax-ymin)*0.95;
	scale = Math.min(xscale,yscale);

	ct.translate(pixelRatio*((width/2)+scale*(xmax+xmin)/2),pixelRatio*((height/2)-scale*(ymax+ymin)/2));
	origin.draw();
	ct.restore();
}

function node(xi, yi, directioni, generationi){
	var generation = generationi+1;

	var x = xi;
	var y = yi;
	
	var direction = directioni;
	var length = 100*Math.pow((drate/100),(generation-1));

	var xn = x+getXfromDD(direction, length);
	var yn = y+getYfromDD(direction, length);

	ymin = Math.min(ymin, yn);
	ymax = Math.max(ymax, yn);
	xmin = Math.min(xmin, xn);
	xmax = Math.max(xmax, xn);

	if(generation<branch){
		var childNode1 = new node(xn, yn, direction+angle, generation);
		var childNode2 = new node(xn, yn, direction-angle, generation);
	}

	this.draw = function(){
		line(x*scale,y*scale,xn*scale,yn*scale,1);
		if(generation<branch){
			childNode1.draw();
			childNode2.draw();
		}
	};
}

console.log("Loaded: javascript.js");