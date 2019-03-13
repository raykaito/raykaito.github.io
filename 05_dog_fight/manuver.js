function manuver(plane){
    if(plane.type == "player"){
        if     (leftKey ) plane.tiltPlane(-plane.tiltSpeed);
        else if(rightKey) plane.tiltPlane( plane.tiltSpeed);
        else plane.tiltPlane(0);

        if (upKey) plane.accelerate(plane.accel);
        else if (downKey) plane.accelerate(-plane.accel);
        else plane.accelerate(0);

        if(spaceKey) plane.fire();

        return;
    }
    if(plane.type == "easy"){
    	if(oc.player==-1) return;
    	tx = oc.getpx();
    	ty = oc.getpy();
    	dir = getDir(plane.x, plane.y,tx,ty);
    	ddir = loopInBound(plane.dir-dir,360);

    	if     (ddir<180) plane.tiltPlane(-plane.tiltSpeed);
    	else if(ddir>180) plane.tiltPlane( plane.tiltSpeed);
    	if(ddir<7||ddir>(360-7)) 			  plane.fire();
    }
}

console.log("Loaded: manuver.js");