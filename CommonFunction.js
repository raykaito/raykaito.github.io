function reverseBinaryCounter(number, digit){
	number = number.toString(2).split("").reverse().join("");
	while(number.length<digit) number = number + "0";
	number = parseInt(number,2);
	return number;
}
function calculateVariance(array){
	var total = array.length;
	var ave = array.reduce(function(a,b,c){return a+b; })/total;
	var std = array.reduce(function(a,b,c){return a+Math.pow((b-ave),2); })/total;
	return Math.sqrt(std);
}

function interpolate(outLow, outHigh, rate){//Rate 0.00 ~ 1.00
	return outLow+(outHigh-outLow)*rate;
}

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

function checkInBound(num, low, high){
	if(num>=low&&num<=high)
		return true;
	else
		return false;
}

function getDist(x,y,tx,ty){
	return Math.sqrt((tx-x)*(tx-x)+(ty-y)*(ty-y));
}

function getDir(x,y,tx,ty){
	let dx = tx-x;
	let dy = ty-y;

	if(dx==0) return (dy<0)?270:90;

	dir = Math.atan(dy/dx)*180/Math.PI;
	if(dx<0) dir+=180;
	else if(dy<0) dir+=360;

	return dir;
}

function getXfromDD(direction, distance){
	return distance*Math.cos(direction/180*Math.PI);
}

function getYfromDD(direction, distance){
	return distance*Math.sin(direction/180*Math.PI);
}

function getRand(max){
	return Math.floor(Math.random()*max);
}

console.log("Loaded: CommonFunction.js");
