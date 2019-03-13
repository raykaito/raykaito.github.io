var plane;
var planeNum = 40;
var hitRadius = 10;

function objectController(){
	this.nextReady = 0;
	this.player = -1;
	this.init = function(){
		plane = new Array();
		for(j=0;j<planeNum;j++) plane[j] = new planeClass();
		console.log("    - ObjectController has been initialized.");
	}

	this.newPos = function(){
		if(this.player!=-1)
			if(!plane[this.player].alive)
				this.player=-1;



	    for(j=0;j<planeNum;j++){
	    	plane[j].newPos();
	    	for(k=0;k<10;k++){
	    		b=plane[j].bullet[k];
	    		if(!b.onFire) continue;
	    		for(m=0;m<planeNum;m++){
	    			p=plane[m];
	    			if(!p.alive) continue;
	    			if(p.affiliation==plane[j].affiliation) continue;
	    			if(getDist(p.x, p.y, b.x, b.y)<hitRadius){
	    				b.hit(p);
	    				p.hit(b);
	    			}
	    		}
	    	}
	    }
	}

	this.draw = function(){
	    for(j=0;j<planeNum;j++) plane[j].draw();
	}
	this.randomSpawn = function(level){
		if(level=="easy"){
			plane[this.nextReady].spawn(getRand(width), getRand(height), getRand(360), "Uke", "easy", "lightgreen");
			this.nextReady = loopInBound(this.nextReady+1, planeNum);
		}
		if(level=="player"){
			if(this.player!=-1) return;
			this.player = this.nextReady;
			plane[this.nextReady].spawn(width/2,height/2-45,0,"Osea", "player", "cyan");
			this.nextReady = loopInBound(this.nextReady+1, planeNum);
		}
	}
	this.specialSpawn = function(){
		for(i=0;i<planeNum;i++){
			plane[this.nextReady].spawn(width/2,height/2,i*(360/planeNum),"Osea", "player", "cyan");
			this.nextReady = loopInBound(this.nextReady+1, planeNum);
		}
	}
	this.getpx = function(){
		if(this.player==-1) return -1;
		return plane[this.player].x;
	}
	this.getpy = function(){
		if(this.player==-1) return -1;
		return plane[this.player].y;
	}
}

console.log("Loaded: objectController.js")