const rad2deg = (radIn)=>{return radIn*180/Math.PI;}
const deg2rad = (degIn)=>{return degIn/180*Math.PI;}

const getDist = (x,y,tx,ty)=>{
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

console.log("Loaded: TrigScript.js");
