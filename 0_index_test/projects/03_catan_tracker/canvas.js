function updateCanvas(){
	cs.clearRect(0,0,width,height);
	if(mode==0){
		drawTile(wheat , 1,-1);
		drawTile(sheep , 1, 0);
		drawTile(iron  , 0,-1);
		drawTile(wood  , 0, 1);
		drawTile(clay  ,-1, 0);
		drawTile(desert,-1, 1);
	}else if(mode==1){
		drawTiles();
		if(resourceType==0){
			drawTile(selectedResource,-1,-3);
		}
		if(resourceType==1){
			drawTile(frame,-1,-3);
			cs.fillStyle = "black";
			if(selectedResource<4)	drawCircle(width*6.0/7, (20+40* selectedResource   )*pixelRatio, 18*pixelRatio);
			else 					drawRect  (width*6.5/7, (20+40*(selectedResource-4))*pixelRatio, 18*pixelRatio);
		}
		if(resourceType==2){
			drawTile(frame,-1,-3);
			cs.fillStyle = "black";
			drawCircle(width*6.0/7, 360*pixelRatio, 18*pixelRatio);
		}
		drawSettlements();
		drawNumberTiles();
		drawSettlementOptions();
		drawDice();
		drawInformation();
		drawGraph1();
		drawGraph2();
	}
	//drawTempText();
}
function drawGraph2(){
	if(rindex==0) return;

	tar = 5;
	finalizeData(tar);

	//Get Max
	max = 0;
	for(k=0;k<4;k++){
		for(i=0;i<rindex;i++){
			if(Math.abs(recordR[i][k][6])>max) max = Math.abs(recordR[i][k][6]);
		}
	}

	//Graph settings
	length = (width*9/12)/rindex;
	offset = width*1.35;
	upperLimit = width*0.2;
	scale = upperLimit/max;

	for(k=0;k<4;k++){
		switch(k){
			case 0: cs.strokeStyle = "blue";	break;
			case 1: cs.strokeStyle = "red";		break;
			case 2: cs.strokeStyle = "orange";	break;
			case 3: cs.strokeStyle = "white";	break;
		}
		drawThick(width/6+length*(0),offset,width/6+length*(1),offset-recordR[0][k][6]*scale);
		for(i=1;i<rindex;i++){
			drawThick(width/6+length*(i),offset-recordR[i-1][k][6]*scale,width/6+length*(i+1),offset-recordR[i][k][6]*scale);
		}
	}
	//Draw Graph Outline
	cs.strokeStyle = "black";
	drawLine(width/6,offset,width*11/12,offset);
	drawLine(width/6,offset+upperLimit*1.1,width/6,offset-upperLimit*1.1);

	//Draw Graph Info
	cs.save();
	cs.translate(width/6, offset);
	cs.rotate(-Math.PI/2);
	cs.textAlign = "center";
	cs.font = (20*pixelRatio).toString()+"px Georgia";
	cs.fillText("Luckyness Index"		, 0					, -width/6*0.4-20*pixelRatio);
	cs.fillText("Lucky"					, upperLimit*0.7	, -5*pixelRatio);
	cs.fillText("Unlucky"				,-upperLimit*0.7	, -5*pixelRatio);
	cs.restore();
}
function drawGraph1(){
	if(rindex==0) return;

	tar = 5;
	finalizeData(tar);
	max = Math.max(recordE[rindex-1][0][6],recordE[rindex-1][1][6],recordE[rindex-1][2][6],recordE[rindex-1][3][6]);

	//Graph settings
	length = (width*9/12)/rindex;
	offset = width*2.1;
	upperLimit = width*0.4;
	scale = upperLimit/max;

	for(k=0;k<4;k++){
		switch(k){
			case 0: cs.strokeStyle = "blue";	break;
			case 1: cs.strokeStyle = "red";		break;
			case 2: cs.strokeStyle = "orange";	break;
			case 3: cs.strokeStyle = "white";	break;
		}
		drawThick(width/6+length*(0),offset-recordE[0][k][tar]*scale,width/6+length*(1),offset-recordE[0][k][tar]*scale);
		//drawLine (width/6+length*(0),offset-recordR[0][k][tar]*scale,width/6+length*(1),offset-recordR[0][k][tar]*scale);
		for(i=1;i<rindex;i++){
			drawThick(width/6+length*(i),offset-recordE[i-1][k][tar]*scale,width/6+length*(i+1),offset-recordE[i][k][tar]*scale);
			//drawLine (width/6+length*(i),offset-recordR[i-1][k][tar]*scale,width/6+length*(i+1),offset-recordR[i][k][tar]*scale);
		}
	}
	//Draw Graph Outline
	cs.strokeStyle = "black";
	drawLine(width/6,offset,width*11/12,offset);
	drawLine(width/6,offset,width/6,offset-upperLimit*1.1);
	drawLine(width/6,offset-upperLimit,width/6+5*pixelRatio,offset-upperLimit);

	//Graph Info
	cs.save();
	cs.translate(width/6, offset);
	cs.rotate(-Math.PI/2);
	cs.textAlign = "center";
	cs.font = (20*pixelRatio).toString()+"px Georgia";
	cs.fillText("Expected　Resources"	, upperLimit*1.1/2	, -width/6*0.4-20*pixelRatio);
	cs.fillText("(Resources/36 Rolls)"	, upperLimit*1.1/2	, -width/6*0.4);
	cs.fillText("0"						, 0					, -5*pixelRatio);
	cs.fillText(max						, upperLimit*1.0	, -5*pixelRatio);
	cs.restore();
}
function drawInformation(){
	//Draw Resources
	/**
	drawTile(frame,-5,5);
	drawTile(wood ,-4,5);
	drawTile(clay ,-3,5);
	drawTile(wheat,-2,5);
	drawTile(sheep,-1,5);
	drawTile(iron ,-0,5);
	**/
}
function drawDice(){
	gap = width/10;
	cs.fillStyle="black";
	for(i=1;i<6;i++){
		drawCenteredText(width/2-gap*3+i*gap,width*0.95    ,gap*.75,""+(i+1));
	}
	for(i=1;i<6;i++){
		drawCenteredText(width/2-gap*3+i*gap,width*0.925+gap,gap*.75,""+(i+7));
	}
	drawCenteredText(width/2-gap*3+7*gap,(width*1.875+gap)/2,gap*.75,"←");
}
function drawNumberTiles(){
	for(i=0;i<ntNumber;i++){
		tx = numbers[i][0];//get X index
		ty = numbers[i][1];//get Y index
		tx=(tx+ty/2)*tileWidth+width/2;
		ty=ty*tileHeight*3/4+width/2;
		if(i<18)cs.fillStyle = "white";
		else	cs.fillStyle = "gray";
		if(numberTiles[i]==rolledDice) cs.fillStyle = "lime";
		drawCircle(tx,ty,15*pixelRatio);
		cs.fillStyle = "black";
		drawCenteredText(tx,ty,25*pixelRatio,numberTiles[i]);
	}

}
function drawSettlements(){
	for(i=0;i<settleNumber;i++){
		tx = settlement[i][0];//get X index
		ty = settlement[i][1];//get Y index
		ta = settlement[i][2];//get angle index
		tt = settlement[i][3];//get settlement Type
		tx=(tx+ty/2)*tileWidth+width/2;
		ty=ty*tileHeight*3/4+width/2;
		if(ta==2) ty = ty - tileHeight/2;
		if(ta==5) ty = ty + tileHeight/2;
		if(ta==1||ta==6) tx = tx - tileWidth/2;
		if(ta==3||ta==4) tx = tx + tileWidth/2;
		if(ta==1||ta==3) ty = ty - tileHeight/4;
		if(ta==4||ta==6) ty = ty + tileHeight/4;

		cs.fillStyle = "black";
		if(tt<4)	drawCircle(tx,ty,13*pixelRatio);
		else		drawRect  (tx,ty,13*pixelRatio);
		switch(tt%4){
			case 0: cs.fillStyle = "blue";	break;
			case 1: cs.fillStyle = "red";	break;
			case 2: cs.fillStyle = "orange";break;
			case 3: cs.fillStyle = "white";	break;
		}
		if(tt<4)	drawCircle(tx,ty,10*pixelRatio);
		else		drawRect  (tx,ty,10*pixelRatio);
	}
}
function drawSettlementOptions(){
	cs.fillStyle = "blue";
	drawCircle(width*6.0/7, 20*pixelRatio,15*pixelRatio);
	drawRect(  width*6.5/7, 20*pixelRatio,15*pixelRatio);
	cs.fillStyle = "red";
	drawCircle(width*6.0/7, 60*pixelRatio,15*pixelRatio);
	drawRect(  width*6.5/7, 60*pixelRatio,15*pixelRatio);
	cs.fillStyle = "orange";
	drawCircle(width*6.0/7, 100*pixelRatio,15*pixelRatio);
	drawRect(  width*6.5/7, 100*pixelRatio,15*pixelRatio);
	cs.fillStyle = "white";
	drawCircle(width*6.0/7, 140*pixelRatio,15*pixelRatio);
	drawRect(  width*6.5/7, 140*pixelRatio,15*pixelRatio);

	cs.fillStyle = "black";
	drawRect(  width*6.5/7, 180*pixelRatio,15*pixelRatio);

	cs.fillStyle = "white";
	drawCircle(width*6.0/7, 360*pixelRatio,15*pixelRatio);
	cs.fillStyle = "black";
	drawCenteredText(width*6.0/7, 360*pixelRatio,30*pixelRatio,"#");
	drawRect(  width*6.5/7, 360*pixelRatio,15*pixelRatio);

	cs.fillStyle = "white";
	drawCenteredText(width*6.5/7, 177*pixelRatio,30*pixelRatio,"←");
	drawCenteredText(width*6.5/7, 357*pixelRatio,30*pixelRatio,"←");
}

function drawTiles(){

	for(i=-2;i<=2;i++){
		for(j=-2;j<=2;j++){
			if(i+j<=-3)continue;
			if(i+j>= 3)continue;
			drawTile(selection[i+2][j+2],i,j);
		}
	}
}
function drawTempText(){
	cs.fillStyle = "black";
	drawCenteredText(width/2,20,40,tempx+", "+tempy);
}
function drawTile(tileImage,xindex,yindex){
	cs.drawImage(tileImage,width/2+(yindex*tileWidth/2+xindex*tileWidth-tileWidth/2),width/2+(yindex*tileHeight*3/4-tileHeight/2),tileWidth,tileHeight);
}
function drawCenteredText(x,y,h,txt){
	cs.beginPath();
	cs.font= h+"px Arial";
	cs.textAlign = 'center';
	y+=h/3;
	cs.fillText(txt,x,y);
}
function drawLeftAText(x,y,h,txt){
	cs.beginPath();
	cs.font= h+"px Arial";
	cs.textAlign = 'left';
	y+=h/3;
	cs.fillText(txt,x,y);
}
function drawLine(xi, yi, xo, yo){
	cs.lineWidth=1*pixelRatio;
	cs.beginPath();
	cs.moveTo(xi, yi);
	cs.lineTo(xo, yo);
	cs.stroke();
}
function drawThick(xi, yi, xo, yo){
	cs.lineWidth=3*pixelRatio;
	cs.beginPath();
	cs.moveTo(xi, yi);
	cs.lineTo(xo, yo);
	cs.stroke();
		//console.log("k:"+k+"xi:"+xi+"yi:"+yi+"xo:"+xo+"yo:"+yo);
}
function drawCircle(x, y, radius){
	cs.beginPath();
	cs.arc(x,y,radius,0,2*Math.PI);
	cs.fill();
}
function drawRect(x, y, side){
	cs.beginPath();
	cs.rect(x-side,y-side,side*2,side*2);
	cs.fill();
}