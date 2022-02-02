const dxy = new Array();
for(let i=0;i<16;i++){
    const theta = i*Math.PI/4;
    dxy[i]=[Math.round(Math.cos(theta)),Math.round(Math.sin(theta))];
}

const checkInBound=(target,minAcceptable,maxAcceptable)=>{
	if(target<minAcceptable) return false;
	if(target>maxAcceptable) return false;
	return true;
}

const randomInt=(maxInt)=>{
    return Math.floor(Math.random()*maxInt);
}

const randBtwn=(min,max)=>{
    return min+Math.random()*(max-min);
}

const xy2i=([x,y],width)=>{
    return x+y*width;
}
const i2xy=(i,width)=>{
    return [i%width,Math.floor(i/width)];
}

const getDist=([targetX,targetY],[currentX,currentY])=>{
    return Math.sqrt(Math.pow((targetX-currentX),2)+Math.pow((targetY-currentY),2));
}