function manuver(plane){
    if(plane.type == "player"){
        if     (leftKey ) plane.turnPlane(100);
        else if(rightKey) plane.turnPlane(-100);

        if (upKey) plane.accelerate(plane.accel);
        else if (downKey) plane.accelerate(-plane.accel);
        else plane.accelerate(0);

        if(spaceKey) plane.fire();

        return;
    }
    if(plane.type == "easy"){
    	if(oc.player==-1) return;
    	const tx = oc.getpx();
    	const ty = oc.getpy();
    	const dir = getDir(plane.x, plane.y,tx,ty);
    	const ddir = loopInBound(plane.dir-dir,360);
    	plane.directPlane(dir);

    	if(ddir<7||ddir>(360-7))plane.fire();
    }
}

console.log("Loaded: manuver.js");