const rad2deg = (radIn)=>{return radIn*180/Math.PI;}
const deg2rad = (degIn)=>{return degIn/180*Math.PI;}

const getDist = (xy,txy)=>{
	const dx = txy[0]-xy[0];
	const dy = txy[1]-xy[1];
	return Math.sqrt((dx)*(dx)+(dy)*(dy));
}

const getDir = (xy,txy)=>{
	const dx = txy[0]-xy[0];
	const dy = txy[1]-xy[1];

	if(dx==0) return (dy<0)?270:90;

	let direction = Math.atan(dy/dx)*180/Math.PI;
	if(dx<0) direction+=180;
	else if(dy<0) direction+=360;

	return direction;
}

const getXYfromDirDis = (direction, distance)=>{
	const rad = deg2rad(direction);
	const x = distance*Math.cos(rad);
	const y = distance*Math.sin(rad);
	return [x,y];
}

const getRand = (max)=>{
	return Math.floor(Math.random()*max);
}

const getXfrom4points = ([x1,y1],[x2,y2],[x3,y3],[x4,y4]) => {
	let x = 0, y = 0;
	if(x2==x1||y3==y4){
		x = x1;
		y = y3;
	}else if(y1==y2||x3==x4){
		x = x3;
		y = y1;
	}else{
		y = ((x3-x1)+(x2-x1)*(y1/(y2-y1))+(x4-x3)*(y3/(y3-y4)))/((x2-x1)/(y2-y1)+(x4-x3)/(y3-y4));
		x = (y-y1)/(y2-y1)*(x2-x1)+x1;
	}
	return [x,y];
}

console.log("Loaded: TrigScript.js");
