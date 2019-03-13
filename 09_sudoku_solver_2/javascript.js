var ex, ey;
var stepper;
var img, himg, imgOriented;

function initJS(){
	ex = [1,1,0,-1,-1,-1, 0, 1];
	ey = [0,1,1, 1, 0,-1,-1,-1];
	stepper = new stepManager();
}

document.getElementById('inp').onchange = function(e) {
   img = new Image();
  himg = new Image();
   img.onload =  imageLoaded;
  himg.onload = himageLoaded;
   img.src = URL.createObjectURL(this.files[0]);
  himg.src = URL.createObjectURL(this.files[0]);
};

function imageLoaded() {
	resize(this.height/this.width);
	ct.drawImage(this, 0,0,width, height);
}

function himageLoaded() {
	resizeH(this.width, this.height);
	hct.drawImage(this,0,0,this.width,this.height);

	stepper.startStepping();
}

function stepManager(){
	//Variables
	var interval, step;
	var imgData;
	var startPoint;
	var corner;
	var sudoku;
	var imgSaved;

	this.updateSudoku = function(){
		sudoku.updateCanvas();
	};

	this.startSolving = function(time = 100){
		clearInterval(interval);
		interval = setInterval(this.solve, time);
	};
	this.solve = function(){
		var status = sudoku.makeaProgress();
		if(status=="UNSOLVABLE"){
			clearInterval(interval);
			alert("Failed");
		}
		if(status=="SOLVED"){
			clearInterval(interval);
			alert("Success!");
		}
	};

	this.startStepping = function(){
		clearInterval(interval);
		step = 0;
		interval = setInterval(this.step, 1000);
	};

	this.step = function(){
		step++;
		switch(step){
			case  1: imgData    = step1(          ); break;
			case  2: startPoint = step2(imgData   ); break;
			case  3: corner     = step3(startPoint); imgSaved = ct.getImageData(0,0,width,height); break;
			case  4: sudoku     = step4(corner); break;
			case  5: step5() ; break;
			case  6: step6() ; break;
			default: clearInterval(interval); return;
		}
		console.log("Current Step: "+step);
	};

	this.try = function(){
		//Test things in here
		sudoku.saveSudoku();
	};

	this.try2 = function(){
		//Test things in here
		sudoku.loadSudoku(0);
	};

	this.loadSaved = function(){
		console.log("im here");
		ct.putImageData(imgSaved,0,0);
	};
}

function step1(){//Filter the section in middle
	var imgData = getProcessedImageData(width*2/5, height*2/5, width/5, height/5);
	ct.putImageData(imgData, width*2/5, height*2/5);
	return imgData;
}

function getProcessedImageData(xIn, yIn, widthIn, heightIn){//Shrink, Binarize, and Trims the image
	var imgOut, histog;
	if(hRatio>1){
		imgOut = hct.getImageData(xIn*hRatio, yIn*hRatio, widthIn*hRatio, heightIn*hRatio);
		imgOut = shrink(imgOut,1/hRatio);
	}else{
		imgOut = ct.getImageData(xIn, yIn, widthIn, heightIn);
	}
	histog = new histogram(imgOut);
	imgOut = histog.binarize();
	imgOut = trim(imgOut);
	return imgOut;
}

function step2(imgIn){//Find the starting point sx and sy
	var fb, angleRatio, distRatio, angle1, angle2, dist1, dist2, txLength, ffdProblem;

	imgIn = thin(imgIn);
	imgIn = trim(imgIn);
	fb = new extractLargestBlob(imgIn);
	txLength = fb.txLength();

	for(var i=0;i<txLength;i++){
		for(var j=0;j<txLength;j++){
			for(var k=0;k<txLength;k++){
				//Skip if i==j==k
				if(i==j||i==k||j==k) continue;
				//Check Distance Ratio
				dist1 = getDist(fb.txx(i),fb.txy(i),fb.txx(j),fb.txy(j));
				dist2 = getDist(fb.txx(i),fb.txy(i),fb.txx(k),fb.txy(k));
				distRatio = dist1/dist2;
				if(distRatio>1.03||distRatio<0.97) continue;

				//Check Angle Ratio
				angle1 = getDir(fb.txx(i),fb.txy(i),fb.txx(j),fb.txy(j));
				angle2 = getDir(fb.txx(i),fb.txy(i),fb.txx(k),fb.txy(k));
				angleRatio = Math.min(((360+angle1-angle2)%360)/(90),((360+angle2-angle1)%360)/(90));
				if(angleRatio>1.03||angleRatio<0.97) continue;

				//Check for the 45 degree error problem
				ffdProblem = false;
				for(var l=0;l<txLength;l++){
					if(getDist(fb.txx(l),fb.txy(l),(fb.txx(j)+fb.txx(k))/2,(fb.txy(j)+fb.txy(k))/2)<dist1/4){
						ffdProblem = true;
						continue;
					}
				}
				if(ffdProblem) continue;
				for(var l=0;l<txLength;l++){
					if(getDist(fb.txx(l),fb.txy(l),(fb.txx(i)+fb.txx(k))/2,(fb.txy(i)+fb.txy(k))/2)<dist1/4){
						ffdProblem = true;
						continue;
					}
				}
				if(ffdProblem) continue;

				//Starting Point Found
				console.log("Success: "+Math.floor(distRatio*angleRatio*10000)/100+"%");
				rotateCanvas(width *2/5+fb.txx(i),height*2/5+fb.txy(i), angle1);
				circle(width *2/5+fb.txx(i),height*2/5+fb.txy(i),12);
				return [width *2/5+fb.txx(i),height*2/5+fb.txy(i),dist1];
			}
		}
	}
	//Code won't reach here unless it failed
	ct.putImageData(imgIn,width*2/5, height*2/5);
	if(startPoint=="FAIL"){
		alert("Error: Unable to find a cell.");
		return;
	}
}

function rotateCanvas(x,y,t){
	t=(t+360)%90;
	if(t>45) t-=90;
	//Small canvas
	ct.save();
	ct.translate(x,y);
	ct.rotate(-Math.PI*t/180);
	ct.translate(-x,-y);
	ct.drawImage(img, 0,0,width, height);
	imgOriented = ct.getImageData(0,0,width,height);
	ct.restore();

	//Hidden canvas
	hct.save();
	hct.translate(x*hRatio,y*hRatio);
	hct.rotate(-Math.PI*t/180);
	hct.translate(-x*hRatio,-y*hRatio);
	hct.drawImage(himg, 0,0,hwidth, hheight);
	hct.restore();
}

function step3(startPoint){
	var i, sumMove, corner = new Array();
	for(i=0;i<4;i++) corner[i] = findCorner(startPoint, i);
	sumMove = corner.reduce(function(a,b,c){return a+b[2];},0);
	if(sumMove!=36){
		alert("Error: Unable to locate the corners.");
		console.log(sumMove);
		return;
	}
	for(i=0;i<4;i++){
		corner[i][0]+=ex[2*i+1]*startPoint[2]/2;
		corner[i][1]+=ey[2*i+1]*startPoint[2]/2;
	}

	return corner
}

function findCorner(startPoint,dir){
	var sideL, windL, lastp, currentp, moveC, dc, error;//directionIndicator, upperLeftCorner, directionChanged

	dir = dir*2;
	
	moveC = 0;
	sideL = startPoint[2];
	windL = Math.floor(sideL/4);
	lastp = [startPoint[0], startPoint[1]];
	dc = 0;
	for(var i=0;i<18;i++){

		currentp = findX(lastp[0]+ex[dir]*sideL,lastp[1]+ey[dir]*sideL,windL);
		error = 100*getDist(lastp[0]+ex[dir]*sideL,lastp[1]+ey[dir]*sideL,currentp[0],currentp[1])/sideL;
		moveC++;
		
		//ct.putImageData(fb.imgOut(),lastp[0]+ex[dir]*sideL-windL,lastp[1]+ey[dir]*sideL-windL);
		circle(currentp[0],currentp[1],12);
		if(currentp=="FAIL"){
			dir=(dir+2)%8;
			dc++;
			if(dc==2) break;
		}else{
			sideL = getDist(currentp[0],currentp[1],lastp[0],lastp[1]);
			lastp = currentp;
		}
	}
	return [lastp[0], lastp[1], moveC];
}

function findX(x,y,length){
	var imgOut, i, min=1000, minIndex = 0;;
	
	imgOut = getProcessedImageData(x-length,y-length,2*length, 2*length);
	ct.putImageData(imgOut,x-length,y-length);
	imgOut = trim(imgOut);
	imgOut = thin(imgOut);
	imgOut = trim(imgOut);
	fb = new extractLargestBlob(imgOut);
	for(i=0;i<fb.txLength();i++){
		if(getDist(length,length, fb.txx(i), fb.txy(i))<min){
			min = getDist(length,length, fb.txx(i), fb.txy(i));
			minIndex = i;
		}
	}

	x = x-length+fb.txx(minIndex);
	y = y-length+fb.txy(minIndex);
	
	if(fb.checkIfBlobIsOnEveryEdge(4)) 	return [x, y];
	else 								return "FAIL";
}

function step4(corner, index = -1){
	var sudoku = new Sudoku(corner, imgOriented);
	var sideL  = (corner[3][0] - corner[2][0])/8;
	var xTempU, xTempD, yTempL, yTempR;
	for(var x=0;x<9;x++){
		for(var y=0;y<9;y++){
			if(index!=-1) if(index!=(x+9*y)) continue; 
			xTempU = corner[2][0]+x*(corner[3][0]-corner[2][0])/8;
			xTempD = corner[1][0]+x*(corner[0][0]-corner[1][0])/8;
			yTempL = corner[2][1]+y*(corner[1][1]-corner[2][1])/8;
			yTempR = corner[3][1]+y*(corner[0][1]-corner[3][1])/8;
			xTempU = xTempU+y*(xTempD-xTempU)/8;
			yTempL = yTempL+x*(yTempR-yTempL)/8;
			num = readNumber(xTempU, yTempL, sideL);
			if(num=="FAIL"){
				alert("Error: Number not found.");
				return;
			}
			sudoku.setNumber(x,y,num);
		}
	}
	return sudoku;
}

function readNumber(x,y,sideL){
	//Check if the cell is Empty or not
	var imgCell, historia, blob;
	imgCell = ct.getImageData(x-sideL/4,y-sideL/4,sideL/2,sideL/2);
	historia = new histogram(imgCell);
	//Display Variance
	//USING SHRINK FUNCION MIGHT SOLVE THE PROBLEM
	if(false){
		ct.fillStyle = "cyan";
		ct.font = sideL/3+"px Arial";
		ct.textAlign = "center"; 
		ct.textBaseline = "middle"; 
		ct.fillText(Math.floor(historia.variance()),x,y);
		return 0;
	}
	if(historia.variance()<35) return 0;

	imgCell = ct.getImageData(x-sideL*0.7/2,y-sideL*0.7/2,sideL*0.7,sideL*0.7);
	imgCell = clearEdge(imgCell);
	//imgCell = hct.getImageData(hRatio*(x-sideL*0.7/2),hRatio*(y-sideL*0.7/2),hRatio*(sideL*0.7),hRatio*(sideL*0.7));
	//imgCell = shrink(imgCell,1/hRatio)
	historia = new histogram(imgCell);
	imgCell = historia.binarize("smooth");
	//ct.putImageData(imgCell,x-sideL*0.7/2,y-sideL*0.7/2);
	imgCell = trim(imgCell);
	ct.putImageData(imgCell,x-sideL*0.7/2,y-sideL*0.7/2);
	blob = new extractLargestBlob(imgCell);

	//ct.putImageData(imgCell,x-sideL*0.7/2,y-sideL*0.7/2);
	return blob.readNumber();
}

function step5(){
	stepper.updateSudoku();
}

function step6(){
	stepper.startSolving();
}

function button1(){
	stepper.startStepping();
}

function button2(){
	stepper.updateSudoku();
}

function button3(){
	stepper.startSolving();
}
function button4(){
	stepper.try();
}

function changeParameter(){
	stepper.try2();
	return;
	var histogramTest = new histogram(imgTestO);
	imgTest = histogramTest.binarize(Number(slider.value));
	histogramTest.graph();
	histogramTest.graphSpecial();
	ct.putImageData(imgTest,0,220);
}

console.log("Loaded: javascript.js");