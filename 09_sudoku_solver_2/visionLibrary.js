var charMinModel, charMaxModel;

function visionInit(){
	charMinModel = new Array();
	charMaxModel = new Array();

	charMinModel[1] = [57, 57, 57, 53, 46, 40, 33, 20, 6, 0, 0, 0, 0, 0, 0, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57];
	charMinModel[2] = [33, 20, 16, 12, 12, 8, 4, 4, 4, 4, 4, 57, 57, 57, 57, 57, 57, 57, 57, 54, 45, 41, 37, 37, 29, 25, 20, 16, 12, 8, 8, 4, 0, 0, 0, 0, 4];
	charMinModel[3] = [25, 20, 12, 8, 8, 4, 4, 0, 0, 4, 57, 57, 57, 54, 37, 33, 33, 33, 37, 57, 57, 57, 57, 57, 57, 0, 0, 0, 0, 0, 4, 4, 8, 12, 20, 20, 29];
	charMinModel[4] = [57, 57, 57, 53, 50, 50, 46, 42, 38, 34, 34, 30, 26, 26, 23, 19, 15, 15, 11, 7, 7, 3, 0, 0, 0, 0, 0, 0, 3, 57, 57, 57, 57, 57, 57, 57, 57];
	charMinModel[5] = [16, 12, 12, 12, 12, 12, 8, 8, 8, 8, 8, 8, 4, 4, 4, 4, 4, 4, 4, 4, 57, 57, 57, 57, 57, 57, 0, 0, 0, 0, 4, 4, 8, 12, 16, 25, 33];
	charMinModel[6] = [37, 29, 20, 20, 16, 12, 8, 8, 8, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 8, 8, 8, 12, 16, 20, 25, 33, 45];
	charMinModel[7] = [4, 0, 0, 0, 0, 0, 57, 57, 57, 56, 52, 52, 52, 48, 44, 40, 40, 40, 36, 36, 32, 32, 32, 28, 28, 28, 28, 28, 24, 24, 24, 20, 20, 20, 20, 20, 20, 20];
	charMinModel[8] = [33, 25, 20, 16, 12, 12, 8, 8, 8, 8, 8, 8, 12, 12, 16, 20, 25, 16, 12, 8, 8, 4, 4, 4, 0, 0, 0, 4, 4, 4, 8, 8, 12, 16, 20, 29, 41];
	charMinModel[9] = [33, 20, 16, 12, 8, 8, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 8, 8, 12, 20, 25, 37, 57, 57, 57, 4, 4, 4, 8, 8, 12, 16, 25, 33];

	charMaxModel[1] = [93, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 93];
	charMaxModel[2] = [75, 83, 91, 91, 95, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 95, 95, 91, 87, 83, 79, 75, 70, 66, 62, 58, 54, 45, 41, 37, 33, 100, 100, 100, 100, 100, 100];
	charMaxModel[3] = [66, 75, 83, 83, 87, 91, 91, 91, 95, 95, 91, 91, 91, 87, 83, 79, 79, 87, 91, 95, 95, 100, 100, 100, 100, 100, 100, 100, 100, 95, 95, 91, 87, 83, 79, 75, 66];
	charMaxModel[4] = [76, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 96, 100, 100, 100, 96, 92, 80, 80, 80, 80, 80, 80, 80, 80];
	charMaxModel[5] = [91, 95, 95, 91, 91, 33, 33, 29, 29, 29, 29, 29, 70, 79, 83, 87, 91, 95, 95, 100, 100, 100, 100, 100, 100, 100, 100, 100, 95, 95, 91, 91, 87, 83, 79, 70, 62];
	charMaxModel[6] = [70, 83, 87, 87, 91, 95, 95, 95, 95, 25, 20, 20, 70, 79, 83, 87, 91, 95, 95, 100, 100, 100, 100, 100, 100, 100, 100, 100, 95, 95, 91, 91, 87, 83, 79, 70, 62];
	charMaxModel[7] = [92, 100, 100, 100, 100, 96, 92, 88, 88, 84, 80, 80, 76, 76, 72, 68, 64, 64, 64, 60, 60, 60, 56, 56, 52, 52, 52, 52, 48, 48, 48, 48, 44, 44, 44, 44, 44, 40];
	charMaxModel[8] = [66, 75, 83, 83, 87, 91, 91, 95, 95, 95, 95, 91, 91, 87, 87, 79, 75, 83, 87, 91, 95, 95, 100, 100, 100, 100, 100, 100, 100, 95, 95, 91, 91, 87, 79, 70, 62];
	charMaxModel[9] = [62, 70, 79, 83, 87, 87, 91, 91, 95, 95, 95, 95, 95, 95, 100, 100, 100, 100, 100, 100, 95, 95, 95, 95, 95, 95, 95, 91, 91, 91, 87, 83, 83, 79, 70, 66, 54];

}

function grbg(imgIn,x,y,type){
	return imgIn.data[4*(x+imgIn.width*y)+type];
}

function histogram(imgIn){
	var grayScale = new Array(256).fill(0);
	var i, x, y, lgs, max, total;//local gray scale
	var threshhold = 50;

	total = imgIn.width*imgIn.height;
	min = total;
	max = 0;

	for(x=0;x<imgIn.width;x++){
		for(y=0;y<imgIn.height;y++){
			lgs = grbg(imgIn,x,y,0);
			lgs+= grbg(imgIn,x,y,1);
			lgs+= grbg(imgIn,x,y,2);
			lgs = Math.floor(lgs/3);
			grayScale[lgs]++;
		}
	}

	for(i=0;i<255;i++){
		max = Math.max(max,grayScale[i]);
		min = Math.min(min,grayScale[i]);
	}
	this.autoThresh = function(type){
		if(type=="whiteMajor"){
			var i, maxIndex, localMax = 0;
			//Get Maximum Index
			for(i=250;i>=0;i--){
				if(grayScale[i]>localMax){localMax = grayScale[i]; maxIndex = i;}
			}

			//Get an index where pixel count is 20% of max
			for(i=maxIndex;grayScale[i]>localMax*0.2;i--);
			return Math.floor(maxIndex-(maxIndex-i)/0.8);
		}
		if(type=="smooth"){
			var smoothScale = new Array(256);
			var range = 16;
			for(i=range;i<255-range;i++){
				smoothScale[i] = 0;
				for(var j=-range;j<range;j++){
					smoothScale[i]+= Math.floor(grayScale[i+j]);
				}
				smoothScale[i]/=(range*2+1);
			}
			var max = 0;
			var maxIndex = 0;
			for(i=range;i<255-range;i++){
				if(smoothScale[i]>max){
					max = smoothScale[i];
					maxIndex = i;
				}
			}
			for(i=maxIndex;smoothScale[i]>max*0.2;i--);
			return i;

		}
		return type;
	}
	this.binarize = function(type = "whiteMajor"){
		//Check Dimension & Copy data
		var imgOut = ct.createImageData(imgIn.width, imgIn.height);
		for(i=0;i<imgIn.data.length;i++) imgOut.data[i] = imgIn.data[i];

		threshhold = this.autoThresh(type);
		//Binarize
		for(i=0;i<imgIn.width*imgIn.height;i++){
			darkness = imgIn.data[4*i+0];
			darkness+= imgIn.data[4*i+1];
			darkness+= imgIn.data[4*i+2];
			for(c=0;c<3;c++){
				imgOut.data[4*i+c] = (3*threshhold>darkness)?0:255;
			}
		}

		return imgOut;
	}
	this.graph = function(){
		ct.fillStyle = "white";
		ct.fillRect(0,0,256,100);
		ct.fillStyle = "black";
		for(i=0;i<256;i++){
			ct.fillRect(i,100-Math.floor(grayScale[i]*100/max),1,Math.floor(grayScale[i]*100/max));
		}
		ct.fillStyle = "red";
		ct.fillRect(threshhold,0, 1,100);
	};
	this.graphSpecial = function(){
		ct.fillStyle = "white";
		ct.fillRect(0,110,256,100);
		ct.fillStyle = "black";
		var y, range = 16;
		for(i=range;i<255-range;i++){
			y = 0;
			for(var j=-range;j<=range;j++) y+= Math.floor(grayScale[i+j]*100/max)
			y/=range*2+1;
			ct.fillRect(i,110+100-y,1,y);
		}
		ct.fillStyle = "red";
		ct.fillRect(threshhold,110, 1,100);
	};
	this.variance = function(){
		var ave = grayScale.reduce(function(a,b,c){return a+b*c; })/total;
		var std = grayScale.reduce(function(a,b,c){return a+b*Math.pow((c-ave),2); })/total;
		return Math.sqrt(std);
	};
}

function extractLargestBlob(imgIn){
	//Check Dimension & Copy data
	var imgOut = ct.createImageData(imgIn.width, imgIn.height);
	for(i=0;i<imgIn.data.length;i++) imgOut.data[i] = imgIn.data[i];

	var blob, bloa, bIsLarger = true;

	//Find the first Blob
	for(i=0;i<imgIn.width*imgIn.height;i++){
		if(imgOut.data[4*i]!=255) break;
		if(i==imgIn.width*imgIn.height-1){
			return false;
		}
	}
	blob = new extractBlob(imgOut, i);
	imgOut = blob.imgOut();

	//Find more Blobs
	while(true){
		for(i=0;i<imgIn.width*imgIn.height;i++){
			if(imgOut.data[4*i]!=255) break;
		}
		if(i>=imgIn.width*imgIn.height) break;
		if(bIsLarger){
			bloa = new extractBlob(imgOut, i);
			imgOut = bloa.imgOut();
		}else{
			blob = new extractBlob(imgOut, i);
			imgOut = blob.imgOut();
		}
		bIsLarger = (blob.ci()>bloa.ci());
	}
	(bIsLarger?blob:bloa).eraseEE();
	(bIsLarger?blob:bloa).findTorX();
	return (bIsLarger?blob:bloa);
}

function extractBlob(imgIn, index){
	//Check Dimension & Copy data
	var imgOut = ct.createImageData(imgIn.width, imgIn.height);
	for(var i=0;i<imgIn.data.length;i++) imgOut.data[i] = imgIn.data[i];

	//Set up variables
	var red = imgOut.data[4*index];
	var wid = imgOut.width;
	var hei= imgOut.height;
	var cx = new Array();//Cells[]
	var cy = new Array();//Cells[]
	var tx = new Array();//Temps[]
	var ty = new Array();//Temps[]
	var leftred, rightred;
	var ci = 0;				//Cell Index
	var tim = 0;			//Temp Index Maximum
	var tic = 0;			//Temp Index Current
	tx[0] = index%wid;
	ty[0] = Math.floor(index/wid);

	//Cells with more than three neighbors 
	var txx = new Array();
	var txy = new Array();
	var txi=0;

	while(tim!=-1){
		//go up until the end
		while(ty[tic]>=0&&grbg(imgOut, tx[tic], ty[tic]-1, 0)==red){
			ty[tic]--;
		}
		leftred  = false;
		rightred = false;
		while(ty[tic]<hei&&grbg(imgOut, tx[tic], ty[tic], 0)==red){
			cx[ci]  = tx[tic];
			cy[ci]= ty[tic];
			imgOut.data[4*(cx[ci]+wid*cy[ci])+0] = (red==255)?254:255;
			imgOut.data[4*(cx[ci]+wid*cy[ci])+1] = 0;
			imgOut.data[4*(cx[ci]+wid*cy[ci])+2] = 0;
			ci++;
			if(tx[tic]-1>=0){
				if(leftred!=(grbg(imgOut, tx[tic]-1, ty[tic], 0)==red)){
					leftred = !leftred;
					if(leftred){
						ty.splice(0,0,ty[tic]);
						tx.splice(0,0,tx[tic]-1);
						tim++;
						tic++;
					}
				}
			}
			if(tx[tic]+1<wid){
				if(rightred!=(grbg(imgOut, tx[tic]+1, ty[tic], 0)==red)){
					rightred = !rightred;
					if(rightred){
						ty.splice(0,0,ty[tic]);
						tx.splice(0,0,tx[tic]+1);
						tim++;
						tic++;
					}
				}
			}
			ty[tic]++;
		}
		tim--;
		tic=tim;
	}
	this.ci = function(){return ci;};
	this.imgOut = function(){return imgOut;};
	this.txx = function(index){return txx[index];};
	this.txy = function(index){return txy[index];};
	this.txLength = function(){return txx.length;};

	this.verticalCheck = function(cxMin, cyMin, cxMax, cyMin){
		var i, intersectCounter, blobAfterTrim = extractLargestBlob(trim(imgOut));
		if(!blobAfterTrim) return 0;
	}

	this.readNumber = function(){
		//Check if there is a blob
		if(ci==0){
			return 0;
		}

		//Set up variables
		var cyMin, cyMax, cxMin, cxMax, i, j;
		cxMin = wid;
		cyMin = hei;
		cxMax = 0;
		cyMax = 0;

		//Determine the Character Dimension
		for(i=0; i<ci; i++){
			cxMin = Math.min(cxMin, cx[i]);
			cxMax = Math.max(cxMax, cx[i]);
			cyMin = Math.min(cyMin, cy[i]);
			cyMax = Math.max(cyMax, cy[i]);
		}
		//Prepare Image data variables
		var imgThin = ct.createImageData(imgOut.width, imgOut.height);
		var imgTrim = ct.createImageData(imgOut.width, imgOut.height);
		var imgLine = ct.createImageData(imgOut.width, imgOut.height);
		var imgFill = ct.createImageData(imgOut.width, imgOut.height);
		for(i=0;i<imgIn.data.length;i++){
			imgThin.data[i] = imgTrim.data[i] = imgOut.data[i];
		}
		imgThin = thin(imgThin);
		imgTrim = trim(imgThin);



		//Determine Key Characteristics
		var noBlobAfterTrim, verticalIntersection = 0;
		var xMean, yMean;
		xMean = Math.floor((cxMax+cxMin)/2);
		yMean = Math.floor((cyMax+cyMin)/2);
		
		noBlobAfterTrim=(!extractLargestBlob(imgTrim));

		//Copy Trimed or thinned image to imgLine
		for(i=0;i<imgIn.data.length;i++){
			imgLine.data[i] = noBlobAfterTrim?imgThin.data[i]:imgTrim.data[i];
		}

		//Count the number of intersections and then make a line
		for(i=1;i<hei;i++){
			if(grbg(imgLine,xMean,i  ,0)==255) continue;
			if(grbg(imgLine,xMean,i-1,0)==255) verticalIntersection++;
		}
		for(i=1;i<hei;i++){
			imgLine.data[4*(wid*i+xMean)+0] = 0;
			imgLine.data[4*(wid*i+xMean)+1] = 0;
			imgLine.data[4*(wid*i+xMean)+2] = 0;
		}
		if(noBlobAfterTrim){
			if(verticalIntersection==3){
				//2 or 3 or 5
				var leftFirstIndex, rightFirstIndex;
				leftFirstIndex = rightFirstIndex = 0;
				var blobTemp = new extractBlob(imgLine,0); 
				imgFill = blobTemp.fill(0);
				for(leftFirstIndex=1 ;leftFirstIndex <hei;leftFirstIndex++ ) if(grbg(imgFill,xMean-1,leftFirstIndex   ,0)==255) break;
				for(rightFirstIndex=1;rightFirstIndex<hei;rightFirstIndex++) if(grbg(imgFill,xMean+1,rightFirstIndex  ,0)==255) break;

				ct.putImageData(imgLine,0,hei*2.2);
				ct.putImageData(imgFill,0,hei*3.3);

				if(leftFirstIndex==hei) return 3;
				if(leftFirstIndex>rightFirstIndex) return 2;
				return 5;
			}else{
				//1 or 7
				//Determine the Character Dimension
				var x, y;
				cxMin = wid;
				cyMin = hei;
				cxMax = 0;
				cyMax = 0;
				for(i=0;i<wid*hei;i++){
					x = i%wid;
					y = Math.floor(i/wid);
					if(grbg(imgThin,x,y,0)==0){
						cxMin = Math.min(cxMin, x);
						cyMin = Math.min(cyMin, x);
						cxMax = Math.max(cxMax, y);
						cyMax = Math.max(cyMax, y);
						//console.log(cxMin+","+cyMin+","+cxMax+","+cyMax);
					}
					//console.log("x,y,g = "+x+","+y+","+grbg(imgThin,x,y,0));
				}
				//ct.putImageData(imgThin,20, 0);
				//return;
				var xMaxIndex, xAtMiddle, y, yIndex, xMaxFound;

				xMaxFound = false;
				//ct.putImageData(imgThin,0,0);
				for(xMaxIndex=wid-1;!xMaxFound&&xMaxIndex>0;xMaxIndex--){
					for(y=0;!xMaxFound&&y<hei;y++){
						if(grbg(imgThin,xMaxIndex,y,0)==0){
							yIndex=y;
							xMaxFound = true;
						}
						imgThin.data[4*(xMaxIndex+wid*Math.floor(y))+1]=0;
					}
				}
				//ct.putImageData(imgThin,0,hei*2.2);


				for(xAtMiddle=wid-1;xAtMiddle>0;xAtMiddle--){
					if(grbg(imgThin,xAtMiddle,Math.floor(cyMax),0)==0)break;
					imgThin.data[4*(xAtMiddle+wid*Math.floor(cyMax))]=0;
				}
				//ct.putImageData(imgThin,0,hei*3.3);
				///console.log("Max: "+ xMaxIndex+", Mid: "+xAtMiddle);(xMaxIndex-xAtMiddle)/(cxMax-cxMin)>0.1
				//console.log((xMaxIndex-xAtMiddle)/(cxMax-cxMin));
				if((xMaxIndex-xAtMiddle)/(cxMax-cxMin)>0.2) return 7;
				return 1;
			}
		}else{
			if(verticalIntersection==3){
				return 8;
			}else{
				//4 or 6 or 9
				for(i=0;i<imgIn.data.length;i++)imgLine.data[i] = imgThin.data[i];
				for(i=1;i<hei;i++){
					imgLine.data[4*(wid*i+xMean)+0] = 0;
					imgLine.data[4*(wid*i+xMean)+1] = 0;
					imgLine.data[4*(wid*i+xMean)+2] = 0;
				}
				var leftCounter, rightCounter;
				leftCounter = rightCounter = 0;
				var blobTemp = new extractBlob(imgLine,0); 
				imgFill = blobTemp.fill(0);
				for(i=1;i<hei;i++){
					if(grbg(imgFill,xMean-1,i,0)==255&&grbg(imgFill,xMean-1,i-1,0)==0) leftCounter++;
					if(grbg(imgFill,xMean+1,i,0)==255&&grbg(imgFill,xMean+1,i-1,0)==0) rightCounter++;
				}

				ct.putImageData(imgLine,0,hei*2.2);
				ct.putImageData(imgFill,0,hei*3.3);

				if(leftCounter==2) return 6;
				if(rightCounter==2) return 9;
				return 4;
			}
		}
		return 0;
	}

	this.checkIfBlobIsOnEveryEdge = function(input){
		nor = sou = wes = eas = false;
		count=0;
		for(i=0;i<ci;i++){
			if(cx[i]==3) wes=true;
			if(cy[i]==3) nor=true;
			if(cx[i]==wid-4) eas=true;
			if(cy[i]==hei-4) sou=true;
		}
		if(wes) count++;
		if(nor) count++;
		if(eas) count++;
		if(sou) count++;
		return (count>=input);
	};
	this.findTorX = function(){
		txi=0;
		for(i=0;i<ci;i++){
			neighbor=0;
			for(j=0;j<ci;j++){
				if(cx[i]==cx[j]){
					if(Math.abs(cy[i]-cy[j])==1) neighbor++;
					if(neighbor==3) break;
				}else if(cy[i]==cy[j]){
					if(Math.abs(cx[i]-cx[j])==1) neighbor++;
					if(neighbor==3) break;
				}
			}
			if(neighbor==3){
				if(txi==0||getDist(cx[i],cy[i],txx[txi-1],txy[txi-1])>5){
					if(cx[i]!=0&&cx[i]!=wid-1&&cy[i]!=0&&cy[i]!=hei-1){
						txx[txi]=cx[i];
						txy[txi]=cy[i];
						txi++;
					}
				}
			}
		}
		for(i=0;i<txi;i++){
			imgOut.data[4*(txx[i]+txy[i]*wid)+0] = 0;
			imgOut.data[4*(txx[i]+txy[i]*wid)+1] = 255;
			imgOut.data[4*(txx[i]+txy[i]*wid)+2] = 0;		
		}
		return imgOut;
	};
	this.eraseEE = function(){
		for(i=0;i<wid*hei;i++){
			imgOut.data[4*i+0] = 255;
			imgOut.data[4*i+1] = 255;
			imgOut.data[4*i+2] = 255;
		}
		for(i=0;i<ci;i++){
			imgOut.data[4*(cx[i]+cy[i]*wid)+0] = 0;
			imgOut.data[4*(cx[i]+cy[i]*wid)+1] = 0;
			imgOut.data[4*(cx[i]+cy[i]*wid)+2] = 0;
		}
		return imgOut;
	};

	this.fill = function(colorIn){
		for(i=0;i<ci;i++){
			imgOut.data[4*(cx[i]+cy[i]*wid)+0] = colorIn;
			imgOut.data[4*(cx[i]+cy[i]*wid)+1] = colorIn;
			imgOut.data[4*(cx[i]+cy[i]*wid)+2] = colorIn;
		}
		return imgOut;
	}
}

function trim(imgIn){
	//Copy Image Date
	var imgOut = ct.createImageData(imgIn.width, imgIn.height);
	for(var i=0;i<imgIn.data.length;i++) imgOut.data[i] = imgIn.data[i];

	var processed = true, x, y, whiteNeighbors;
	while(processed){
		processed=false;
		for(var i=0;i<imgOut.width*imgOut.height;i++){
			//Skip if White
			if(imgOut.data[4*i]!=0) continue;
			//Skip if Edge
			x=i%imgOut.width;
			y=Math.floor(i/imgOut.width);
			if(x==0||x==imgOut.width-1||y==0||y==imgOut.height-1) continue;
			//Count whiteNeighbors around
			whiteNeighbors = 0;
			for(var j=0;j<8;j+=2) if(imgOut.data[4*(i+ey[j%8]*imgOut.width+ex[j%8])]==255) whiteNeighbors++;

			if(whiteNeighbors>=3){
				processed = true;
				imgOut.data[4*i+0] = 255;
				imgOut.data[4*i+1] = 255;
				imgOut.data[4*i+2] = 255;
			}
		}
	}
	return imgOut;
}

function clearEdge(imgIn){
	//Copy Image Date
	var imgOut = ct.createImageData(imgIn.width, imgIn.height);
	for(var i=0;i<imgIn.data.length;i++) imgOut.data[i] = imgIn.data[i];

	//Clear Edges
	var wid = imgIn.width;
	var hei = imgIn.height;
	for(var x=0;x<wid;x++){
		imgOut.data[4*(x+wid*(hei-1))+0] = 255;
		imgOut.data[4*(x+wid*(hei-1))+1] = 255;
		imgOut.data[4*(x+wid*(hei-1))+2] = 255;
		imgOut.data[4*(x)+0] = 255;
		imgOut.data[4*(x)+1] = 255;
		imgOut.data[4*(x)+2] = 255;
	}
	for(var y=0;y<hei;y++){
		imgOut.data[4*(wid-1+wid*(y))+0] = 255;
		imgOut.data[4*(wid-1+wid*(y))+1] = 255;
		imgOut.data[4*(wid-1+wid*(y))+2] = 255;
		imgOut.data[4*(wid*(y))+0] = 255;
		imgOut.data[4*(wid*(y))+1] = 255;
		imgOut.data[4*(wid*(y))+2] = 255;
	}
	return imgOut;
}

function thin(imgIn){
	//Copy Image Date
	var imgOut = ct.createImageData(imgIn.width, imgIn.height);
	for(var i=0;i<imgIn.data.length;i++) imgOut.data[i] = imgIn.data[i];

	var processed = true, x, y, c=new Array();
	while(processed){
		processed=false;
		for(var d=0;d<8;d+=2){
			for(var i=0;i<imgOut.width*imgOut.height;i++){
				//Skip if White
				if(imgOut.data[4*i]!=0) continue;
				//Skip if Edge
				x=i%imgOut.width;
				y=Math.floor(i/imgOut.width);
				if(x==0||x==imgOut.width-1||y==0||y==imgOut.height-1) continue;
				//Scan c around
				for(var j=0;j<16;j++) c[j]=(imgOut.data[4*(i+ey[j%8]*imgOut.width+ex[j%8])]==0);

				if((!c[d+4]||!c[d+6])&&!c[d+5]){
					if(c[d+1]){
						if(c[d+6]&&c[d+0]&&!c[d+7]);
						else if(c[d+2]&&c[d+4]&&!c[d+3]);
						else if(c[d+2]&&c[d+0]&&!c[d+1]);
						else if(c[d+6]&&c[d+2]&&(!c[d+1]||!c[d+7]||!c[d+0]));
						else if(c[d+0]&&c[d+4]&&(!c[d+3]||!c[d+2]||!c[d+1]));
						else {
							processed = true;
							imgOut.data[4*i+2] = 255;
						}
					}
				}
			}
			for(var i=0;i<imgOut.width*imgOut.height;i++){
				if(imgOut.data[4*i+2]==255){
					imgOut.data[4*i+0] = 255;
					imgOut.data[4*i+1] = 255;
				}
			}
		}
	}
	return imgOut;
}

function filter(imgIn, type, range){
	//Check Dimension & Copy data
	var imgOut = ct.createImageData(imgIn.width, imgIn.height);
	for(i=0;i<imgIn.data.length;i++) imgOut.data[i] = imgIn.data[i];

	var counter,tempR, tempG, tempB;
	for(i=0;i<imgOut.width*imgOut.height;i++){
		//Apply Filter on each cell
		var tempX = i%imgOut.width;
		var tempY = Math.floor(i/imgOut.width);

		//Initial variable setups based on filter "type"
		if(type=="blend"){
			counter = tempR = tempG = tempB = 0;
		}
		else if(type=="shrinkWhite"){
			counter = 1;
			tempR = tempG = tempB = 255;
		}

		for(x=Math.max(tempX-range,0);x<=Math.min(tempX+range,imgOut.width-1);x++){
			for(y=Math.max(tempY-range,0);y<=Math.min(tempY+range,imgOut.height-1);y++){
				//"x,y" indicates the surrounding cells within "range"
				switch(type){
					case "blend":
						counter++;
						tempR += grbg(imgIn,x,y,0);
						tempG += grbg(imgIn,x,y,1);
						tempB += grbg(imgIn,x,y,2);
						break;
					case "shrinkWhite":
						tempR = Math.min(tempR, grbg(imgIn,x,y,0));
						tempG = Math.min(tempG, grbg(imgIn,x,y,1));
						tempB = Math.min(tempB, grbg(imgIn,x,y,2));
						break;
					default:
						console.log("unknown filter type");
				}
			}
		}
		imgOut.data[4*i+0] = Math.floor(tempR/counter);
		imgOut.data[4*i+1] = Math.floor(tempG/counter);
		imgOut.data[4*i+2] = Math.floor(tempB/counter);
	}
	return imgOut;
}

function shrink(imgIn, ratio){
	//Check Dimension & Copy data
	var imgOut = ct.createImageData(Math.floor(imgIn.width*ratio), Math.floor(imgIn.height*ratio));
	var range = Math.floor(1/ratio)+1;

	var counter,tempR, tempG, tempB, tempA;
	for(i=0;i<imgOut.width*imgOut.height;i++){
		//Apply Filter on each cell
		var tempX = Math.floor(i%imgOut.width/ratio);
		var tempY = Math.floor(i/imgOut.width/ratio);

		//Initial variable setups based on filter "type"
		counter = tempR = tempG = tempB = tempA = 0;

		for(x=Math.max(tempX-range,0);x<=Math.min(tempX+range,imgIn.width-1);x++){
			for(y=Math.max(tempY-range,0);y<=Math.min(tempY+range,imgIn.height-1);y++){
				//"x,y" indicates the surrounding cells within "range"
				counter++;
				tempR += grbg(imgIn,x,y,0);
				tempG += grbg(imgIn,x,y,1);
				tempB += grbg(imgIn,x,y,2);
				tempA += grbg(imgIn,x,y,3);
			}
		}
		imgOut.data[4*i+0] = Math.floor(tempR/counter);
		imgOut.data[4*i+1] = Math.floor(tempG/counter);
		imgOut.data[4*i+2] = Math.floor(tempB/counter);
		imgOut.data[4*i+3] = Math.floor(tempA/counter);
	}
	return imgOut;
}