function loopInBound(num, upper){
	num=num%upper;
	if(num>=0)
		return num;
	else
		return num+upper;
}

function keepInBound(num, low, high){
	if(num<low) return low;
	if(num>high)return high;
	return num;
}

function getDist(x,y,tx,ty){
	return Math.sqrt((tx-x)*(tx-x)+(ty-y)*(ty-y));
}

function optimalCordinate(x,y,tx,ty){
	let king = {i:0, j:0, record:getDist(x,y,tx,ty)};
	let challenger = 0;
	for(i=-1;i<=1;i++){
		for(j=-1;j<=1;j++){
			if(i==0&&j==0) continue;
			challenger = getDist(x,y,tx+i*width, ty+j*height);
			//console.log(challenger+","+i+","+j);
			//console.log(x+","+y+","+tx+i*width+","+ty+j*height);
			if(challenger<king.record){
				king.i = i;
				king.j = j;
				king.record = challenger;
				//console.log("History Altered");
			}
		}
	}
	return king;
}

function getDir(x,y,tx,ty){
	const dx = tx-x;
	const dy = ty-y;

	if(dx==0) return (dy<0)?270:90;

	let dir = Math.atan(dy/dx)*180/Math.PI;
	if(dx<0) dir+=180;
	else if(dy<0) dir+=360;

	return dir;
}

function getRand(max){
	return Math.floor(Math.random()*max);
}

console.log("Loaded: functions.js");
