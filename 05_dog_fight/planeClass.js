function planeClass(){
    this.init = function(){
        //Object Limitations.
        this.tiltSpeed = 1;
        this.accel = 1;
        this.maxSpeed = 200;
        this.nomSpeed = 100;
        this.minSpeed = 50;
        this.firingRate = 100;
        this.tiltMax = 30;

        //Object Conditions.
        this.x = 0;
        this.y = 0;
        this.dir = 45;
        this.tilt = 0;
        this.speed = 100;
        this.health = 100;
        this.lastFired = 0;
        this.bulletCount = 0;
        this.color = "white";
        this.alive = false;
        this.bullet = new Array();
        this.affiliation = "unknown";  //country
        this.type = "unknow";           //player, easy, hard...
        for(i=0;i<10;i++){
            this.bullet[i] = new bullet();
            this.bullet[i].init();
        }
    }
    this.spawn = function(x, y, dir, affiliation, type, color){
        this.x = x;
        this.y = y;
        this.dir=dir;
        this.affiliation = affiliation;
        this.type = type;
        this.color = color;
        this.health = 100;
        this.alive = true;
        if(type == "player") this.tiltSpeed = 3;
        else this.tiltSpeed = 1;
    }
    this.draw = function(){
        if(!this.alive) return;
        for(i=0;i<10;i++) this.bullet[i].draw();

        ctx = context;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(Math.floor(this.x), Math.floor(this.y), 20, (this.dir/180+1-0.12*(1-Math.abs(this.tilt/70)))*Math.PI, (this.dir/180+1+0.12*(1-Math.abs(this.tilt/70)))*Math.PI);
        ctx.fill();
    }
    this.tiltPlane = function(tilt){
        if(!this.alive) return;
        if(tilt==0){
            this.tilt -= Math.sign(this.tilt)*this.tiltSpeed/2;
            return;
        }
        tilt = keepInBound(tilt, -this.tiltSpeed, this.tiltSpeed);
        this.tilt += tilt;
        this.tilt = keepInBound(this.tilt, -this.tiltMax, this.tiltMax);
    }
    this.accelerate = function(accel){
        if(!this.alive) return;
        if(accel==0){
            this.speed -= Math.sign(this.speed-this.nomSpeed)*this.accel;
            return;
        }
        accel = keepInBound(accel, -this.accel, this.accel);
        this.speed += accel;
        this.speed = keepInBound(this.speed, this.minSpeed, this.maxSpeed);

    }
    this.fire = function(){
        if(!this.alive) return;
        if(applicationTime - this.lastFired>=this.firingRate){
            this.lastFired = applicationTime;
            this.bullet[this.bulletCount].fire(this);
            this.bulletCount = loopInBound(this.bulletCount+1, 10);
        }        
    }
    this.newPos = function(){
        if(!this.alive) return;
        for(i=0;i<10;i++) this.bullet[i].newPos();

        manuver(this);

        this.dir+=this.tilt/10;
        this.dir = loopInBound(this.dir,360);

        this.x += this.speed*Math.cos(this.dir*Math.PI/180)/30;
        this.x = loopInBound(this.x, width);
        this.y += this.speed*Math.sin(this.dir*Math.PI/180)/30;
        this.y = loopInBound(this.y, height);
    }
    this.hit = function(b){
        this.health-=b.damage;
        if(this.health<=0) this.alive = false;
    }
    this.init();
}

function bullet(){
    this.init = function(){
        //Object Limitations
        this.timeLimit = 0;

        //Object Conditions
        this.x = 0;
        this.y = 0;
        this.dir = 0;
        this.speed = 0;
        this.damage = 34;
        this.onFire = false;
        this.firedTime = 0;
    }
    this.fire = function(obj){
        if(this.onFire) return;
        this.onFire = true;
        this.firedTime = applicationTime;
        this.timeLimit = obj.firingRate*6;
        this.speed = obj.speed + 100;
        this.x = obj.x;
        this.y = obj.y;
        this.dir = obj.dir;
    }
    this.draw = function(){
        if(!this.onFire) return;
        ctx = context;
        ctx.beginPath();
        ctx.lineWidth = "2";
        ctx.strokeStyle = "yellow";
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x-Math.cos(this.dir*Math.PI/180)*5, this.y-Math.sin(this.dir*Math.PI/180)*5);
        ctx.stroke();
    }
    this.newPos = function() {
        if(!this.onFire) return;
        if(applicationTime-this.firedTime>this.timeLimit) this.onFire = false;
        this.x += this.speed*Math.cos(this.dir*Math.PI/180)/20;
        this.x = loopInBound(this.x, width);
        this.y += this.speed*Math.sin(this.dir*Math.PI/180)/20;
        this.y = loopInBound(this.y, height);
    }
    this.hit = function(p){
        this.onFire = false;
    }
}

console.log("Loaded: planeClass.js");