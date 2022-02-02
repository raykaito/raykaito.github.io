function roll(num){
	tempx = num;
	rolledDice = num;

	addRecord();
	recordEx();
	recordRe();
	rindex++;
}
function finalizeData(tar){
	//Finalize Recorded
	for(k=0;k<4;k++){
		for(i=0;i<rindex;i++){
			recordR[i][k][6]=0;
			recordE[i][k][6]=0;
			for(j=0;j<i+1;j++){
				recordR[i][k][6]+=recordR[j][k][tar];
				recordE[i][k][6]+=recordE[j][k][tar];
			}
			recordR[i][k][6]=recordR[i][k][6]/recordE[i][k][6]-1;
			recordR[i][k][6]/=Math.pow(0.95,i);
		}
	}
	//Finalize Expectation
	for(k=0;k<4;k++){
		for(i=0;i<rindex;i++){
			recordE[i][k][6]=recordE[i][k][tar];
		}
	}
	return;
}
function recordEx(){
	for(k=0;k<4;k++){
		for(l=0;l<5;l++){
			recordE[rindex][k][l]+=expectation[k][l];
			recordE[rindex][k][5]+=expectation[k][l];
		}
	}
}
function recordRe(k,l){
	for(i=0;i<settleNumber;i++){
		tt = settlement[i][3];//get settlement Type
		for(j=0;j<3;j++){
			if(settlement[i][5+2*j]==rolledDice){
				recordR[rindex][tt%4][settlement[i][4+2*j]]+=30;
				recordR[rindex][tt%4][5]+=30;
			}
		}
	}
}
function facto(num){
	fac = 1;
	for (ray=1;ray<=num;ray++){
		fac*=ray;
	}
	return fac;
}
function xy2xindex(x, y){
	xindex = x-(y-width/2)/2-width/2+tileWidth/2;
	return Math.floor(xindex/(tileWidth));
}
function xy2yindex(x, y){
	yindex = y-width/2+tileHeight*3/8;
	return Math.floor(yindex/(tileHeight*3/4));
}
function dist (xi,yi,xo,yo){
	return Math.sqrt((xi-xo)*(xi-xo)+(yi-yo)*(yi-yo));
}
function line2Angle(xi,yi,xo,yo){
	angle = Math.atan((yo-yi)/(xo-xi));
	angle = angle*180/Math.PI;
	if(xo-xi>0) angle=angle+180;
	angle = (angle+360)%360;
	angle = Math.ceil(angle/60);
	return angle;
}
function expectationAnalysis(){
	resetExpectation();
	for(i=0;i<settleNumber;i++){
		tt = settlement[i][3]%4;
		for(j=0;j<3;j++){
			tr = settlement[i][4+j*2];
			if(tr==-1) continue;
			expectation[tt][tr]+=tn2probability(settlement[i][5+j*2]);
		}
	}
}
function tn2probability(tn){
	if(tn>12||tn<2) return 0;
	return 6-Math.abs(7-tn);
}
function mapSettlement(){
	if(newMapRequired==false) return;
	for(i=0;i<settleNumber;i++){
		xi = settlement[i][0];//get X index
		yi = settlement[i][1];//get Y index
		ta = settlement[i][2];//get angle index
		tt = settlement[i][3];//get settlement Type
		//First Resource
		if(validIndex(xi,yi)){
			settlement[i][4] = getResource(selection[xi+2][yi+2]);
			settlement[i][5] = findNumberTile(xi,yi);
		}
		//SecondResource
		xii = xi+angleToXindexOffset[ta%6];
		yii = yi+angleToYindexOffset[ta%6];
		if(validIndex(xii,yii)){
			settlement[i][6] = getResource(selection[xii+2][yii+2]);
			settlement[i][7] = findNumberTile(xii,yii);
		}
		//ThirdResource
		xiii = xi+angleToXindexOffset[(ta+1)%6];
		yiii = yi+angleToYindexOffset[(ta+1)%6];
		if(validIndex(xiii,yiii)){
			settlement[i][8] = getResource(selection[xiii+2][yiii+2]);
			settlement[i][9] = findNumberTile(xiii,yiii);
		}
	}
	expectationAnalysis();
}
function findNumberTile(tx,ty){
	if(ntNumber==19){
		if(tx==numbers[18][0]&&ty==numbers[18][1]){
			return -1;
		}
	}
	for(j=0;j<ntNumber;j++){
		if(numbers[j][0]!=tx)continue;
		if(numbers[j][1]!=ty)continue;
		return numberTiles[j];
	}
	return -1;
}
function getResource(img){
	switch(img){
		case wood:	return 0;
		case clay:	return 1;
		case wheat:	return 2;
		case sheep:	return 3;
		case iron:	return 4;
	}
	return -1;
}
function validIndex(tx,ty){
	if(tx<-2||tx>2||ty<-2||ty>2){ return false;}
	if(tx+ty<=-3||tx+ty>= 3){ return false;}
	return true;
}