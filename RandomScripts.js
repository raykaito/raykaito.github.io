const reverseBinaryCounter = (number, digit)=>{
	number = number.toString(2).split("").reverse().join("");
	while(number.length<digit) number = number + "0";
	number = parseInt(number,2);
	return number;
}
const calculateVariance = (array)=>{
	var total = array.length;
	var ave = array.reduce(const(a,b,c){return a+b; })/total;
	var std = array.reduce(const(a,b,c){return a+Math.pow((b-ave),2); })/total;
	return Math.sqrt(std);
}

const interpolate = (outLow, outHigh, rate)=>{//Rate 0.00 ~ 1.00
	return outLow+(outHigh-outLow)*rate;
}

const loopInBound = (num, upper)=>{
	num=num%upper;
	if(num>=0)
		return num;
	else
		return num+upper;
}

const keepInBound = (num, low, high)=>{
	if(num<low) return low;
	if(num>high)return high;
	return num;
}

const checkInBound = (num, low, high)=>{
	if(num>=low&&num<=high)
		return true;
	else
		return false;
}

const rad2deg = (radIn)=>{return radIn*180/Math.PI;}
const deg2rad = (degIn)=>{return degIn/180*Math.PI;}

const getDist = (x,y,tx,ty)=>{
	return Math.sqrt((tx-x)*(tx-x)+(ty-y)*(ty-y));
}

const getDir = (x,y,tx,ty)=>{
	let dx = tx-x;
	let dy = ty-y;

	if(dx==0) return (dy<0)?270:90;

	dir = Math.atan(dy/dx)*180/Math.PI;
	if(dx<0) dir+=180;
	else if(dy<0) dir+=360;

	return dir;
}

const getXYfromDirDis = (direction, distance)=>{
	return [distance*Math.cos(deg2rad(direction)), distance*Math.sin(deg2rad(direction))];
}

const getRand = (max)=>{
	return Math.floor(Math.random()*max);
}

console.log("Loaded: randomScripts.js");
