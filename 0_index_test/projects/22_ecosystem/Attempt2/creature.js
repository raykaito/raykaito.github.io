const defaultInitialParametersHervabore = {minEnergy:Q_in/10, maxTravelDist:1,energyAbsorptionRate:Q_in/1,energyConsumptionRateBase:Q_in/5000,energyConsumptionRateMove:1,rgbAlive:[255,255,255],rgbDead:[0,0,255]};
const defaultInitialParametersCarnivore = {minEnergy:Q_in/100, maxTravelDist:1,energyAbsorptionRate:Q_in/1500,energyConsumptionRateBase:Q_in/15000,energyConsumptionRateMove:0.05,rgbAlive:[255,0,0],rgbDead:[255,255,255]};

class CreatureManager{
    constructor(){
        //Define Hervabores/Carnivores
        this.maxHervaCount = 5000;
        this.maxCarniCount = 10;
        this.liveHervaCount= 0;
        this.liveCarniCount= 0;
        this.hervaActChance = 1;
        this.carniActChance = 0.5;
        this.nextHervaSpawnAttemptIndex = 0;
        this.nextCarvaSpawnAttemptIndex = 0;
        this.hervabores = new Array();
        this.carnivores = new Array();
        for(let i=0;i<this.maxHervaCount;i++){this.hervabores[i] = new Hervabore();}
        for(let i=0;i<this.maxCarniCount;i++){this.carnivores[i] = new Hervabore();}
        this.populationBinHervabore = new Array(width*height);
        this.populationBinCarnivore = new Array(width*height);
    }
    updateCreatures(){
        //checkLocationOfEach
        this.populationBinHervabore.fill(0);
        this.populationBinCarnivore.fill(0);
        for(let i=0;i<this.maxHervaCount;i++){
            if(this.hervabores[i].state==1){
                const hervaIndex = this.hervabores[i].getIntIndex();
                this.populationBinHervabore[hervaIndex]++;
            }
        }
        //Based On Current Situation, decide action [eat/move/reproduce]
        for(let i=0;i<this.maxHervaCount;i++){
            if(this.hervabores[i].state==1){
                if(Math.random()>this.hervaActChance){
                    this.hervabores[i].action = 3;
                }else{
                    this.hervabores[i].chooseAction();
                    this.hervabores[i].consumeBaseEnergy();
                }
            }
        }
        //Take the action
        for(let i=0;i<this.maxHervaCount;i++){
            if(this.hervabores[i].state==1){
                this.hervabores[i].takeAction();
            }
        }
    }
    drawCreatures(imgData){
        //Draw Hervabores
        for(let i=0;i<this.maxHervaCount;i++){
            if(this.hervabores[i].state!=0){
                this.hervabores[i].drawSelf(imgData);
            }
        }
        //Draw Carnivores
    }
    spawn([x,y]){
        this.spawnHervabore([x,y]);
    }
    spawnHervabore([x,y]){
        for(let i=0;i<this.maxHervaCount;i++){
            if(this.hervabores[this.nextHervaSpawnAttemptIndex].state!=1){
                this.hervabores[this.nextHervaSpawnAttemptIndex].spawn([x,y]);
                this.liveHervaCount++;
                console.log(this.liveHervaCount);
                return true;
            }
            this.nextHervaSpawnAttemptIndex = (this.nextHervaSpawnAttemptIndex+1)%this.maxHervaCount;
        }
        return false;
    }
}

class Creature{
    constructor(initialParameters){
        //Parameters
        this.minEnergy = initialParameters.minEnergy;
        this.maxEenrgy=this.minEnergy*50;
        this.maxTravelDist = initialParameters.maxTravelDist;
        this.energyAbsorptionRate = initialParameters.energyAbsorptionRate;
        this.energyConsumptionRateBase = initialParameters.energyConsumptionRateBase;
        this.energyConsumptionRateMove = initialParameters.energyConsumptionRateMove;
        this.rgbAlive = new Array(3)
        this.rgbAlive[0] = initialParameters.rgbAlive[0];
        this.rgbAlive[1] = initialParameters.rgbAlive[1];
        this.rgbAlive[2] = initialParameters.rgbAlive[2];
        this.rgbDead = new Array(3)
        this.rgbDead[0] = initialParameters.rgbDead[0];
        this.rgbDead[1] = initialParameters.rgbDead[1];
        this.rgbDead[2] = initialParameters.rgbDead[2];
        //State
        this.state=0;//[0:Void 1:Alive 2:Dead]
        this.x=0;
        this.y=0;
        this.energy=0;
        //Action
        this.action;//[0:eat 1:move 2:reproduce 3:nothing]
        this.targetX;
        this.targetY;
    }
    spawn([x,y]){
        this.state = 1;
        this.energy = this.minEnergy*24;
        this.x = x;
        this.y = y;
    }
    die(){
        this.state=0;
    }
    consumeEnergy(energyConsumed){
        this.energy -= energyConsumed;
        if(this.energy<this.minEnergy){
            this.die();
        }
    }
    consumeBaseEnergy(){
        this.consumeEnergy(this.energyConsumptionRateBase);
    }
    moveTo([targetX_in,targetY_in]){
        //Bound targets in the field
        let targetX = targetX_in;
        let targetY = targetY_in;
        if(targetX<0) targetX=0;
        if(targetY<0) targetY=0;
        if(targetX>width-1) targetX=width-1;
        if(targetY>height-1) targetY=height-1;
        //Measure the distance to the target
        const dist = getDist([targetX,targetY],[this.x,this.y]);
        if(dist<this.maxTravelDist){
            this.x=targetX;
            this.y=targetY;
            this.consumeEnergy(dist*this.energyConsumptionRateMove);
        }else{
            const dx = (targetX-this.x)*this.maxTravelDist/dist;
            const dy = (targetY-this.y)*this.maxTravelDist/dist;
            this.x += dx;
            this.y += dy;
            this.consumeEnergy(this.maxTravelDist*this.energyConsumptionRateMove);
        }

    }
    drawSelf(imgData){
        const i=this.getIntIndex();
        imgData.data[i*4+0]=(this.state==1)?this.rgbAlive[0]:this.rgbDead[0];
        imgData.data[i*4+1]=(this.state==1)?this.rgbAlive[1]:this.rgbDead[1];
        imgData.data[i*4+2]=(this.state==1)?this.rgbAlive[2]:this.rgbDead[2];
    }
    getIntXY(){     return [Math.floor(this.x),Math.floor(this.y)];}
    getIntIndex(){  return xy2i(this.getIntXY(),width);}
}
class Hervabore extends Creature{
    constructor(x,y){
        super(defaultInitialParametersHervabore,x,y);
        this.threshForEnoughNeighborGrass = randomInt(8)+1;
        this.caresIfCrowded = randomInt(2);
    }
    die(){
        super.die();
        creatureMng.liveHervaCount--;
        console.log(creatureMng.liveHervaCount);
    }
    actionIsMoveRandom(){
            this.action = 1;
            this.targetX = this.x+randomInt(2*this.maxTravelDist)-randomInt(2*this.maxTravelDist);
            this.targetY = this.y+randomInt(2*this.maxTravelDist)-randomInt(2*this.maxTravelDist);
    }
    actionIsMoveToGrass([currentX,currentY]){
        const indexOffset = randomInt(8);
        let searchDistance = 1;
        let couldNotFindGrass = false;
        while(!couldNotFindGrass){
            let targetPixelOutOfFieldCount = 0;
            for(let i=indexOffset;i<8+indexOffset;i++){
                let [dx,dy] = dxy[i];
                dx *= searchDistance;
                dy *= searchDistance;
                dx += currentX;
                dy += currentY;
                if(!checkInBound(dx,0,width-1)){
                    targetPixelOutOfFieldCount++;
                }else if(!checkInBound(dy,0,height-1)){
                    targetPixelOutOfFieldCount++;
                }else{
                    const index = xy2i([dx,dy],width);
                    if(field.grassState[index]==1){
                        this.action = 1;
                        this.targetX= dx;
                        this.targetY= dy;
                        return;
                    }
                }
                if(targetPixelOutOfFieldCount==8) couldNotFindGrass = true;
            }
            searchDistance++;
            //if(searchDistance>width/4) couldNotFindGrass = true;
        }
        this.actionIsMoveRandom();
    }
    actionIsMoveToMoreGrass([currentX,currentY]){
        let targetPixelOutOfFieldCount = 0;
        let grassFound = false;
        let targetX = 0;
        let targetY = 0;
        for(let i=0;i<8;i++){
            let [dx,dy] = dxy[i];
            const index = xy2i([dx+currentX,dy+currentY],width);
            if(field.grassState[index]==1){
                grassFound = true;
                targetX += dx;
                targetY += dy;
            }
        }
        if(!grassFound||(targetX==0&&targetY==0)){
            this.actionIsMoveToGrass([currentX,currentY]);
        }else{
            this.action = 1;
            this.targetX = currentX + targetX;
            this.targetY = currentY + targetY;
        }
    }
    actionIsMoveToOpen([currentX,currentY]){
        const indexOffset = randomInt(8);
        let searchDistance = 1;
        let couldNotFindGrass = false;
        while(!couldNotFindGrass){
            let targetPixelOutOfFieldCount = 0;
            for(let i=indexOffset;i<8+indexOffset;i++){
                let [dx,dy] = dxy[i];
                dx *= searchDistance;
                dy *= searchDistance;
                dx += currentX;
                dy += currentY;
                if(!checkInBound(dx,0,width-1)){
                    targetPixelOutOfFieldCount++;
                }else if(!checkInBound(dy,0,height-1)){
                    targetPixelOutOfFieldCount++;
                }else{
                    const index = xy2i([dx,dy],width);
                    if(creatureMng.populationBinHervabore[index]==0){
                        this.action = 1;
                        this.targetX= dx;
                        this.targetY= dy;
                        return;
                    }
                }
                if(targetPixelOutOfFieldCount==8) couldNotFindGrass = true;
            }
            searchDistance++;
            //if(searchDistance>width/4) couldNotFindGrass = true;
        }
        this.actionIsMoveRandom();
    }
    actionIsMoveToLessFriend([currentX,currentY]){
        let targetPixelOutOfFieldCount = 0;
        let grassFound = false;
        let targetX = 0;
        let targetY = 0;
        for(let i=0;i<8;i++){
            let [dx,dy] = dxy[i];
            const index = xy2i([dx+currentX,dy+currentY],width);
            if(creatureMng.populationBinHervabore[index]==0){
                grassFound = true;
                targetX += dx;
                targetY += dy;
            }
        }
        if(!grassFound||(targetX==0&&targetY==0)){
            this.actionIsMoveToOpen([currentX,currentY]);
        }else{
            this.action = 1;
            this.targetX = currentX + targetX;
            this.targetY = currentY + targetY;
        }
    }
    anotherHervaboreAround(myLocationIndex, [currentX,currentY]){
        if(creatureMng.populationBinHervabore[myLocationIndex]>1) return true;
        for(let i=0;i<8;i++){
            const [dx,dy] = dxy[i];
            const index = xy2i([currentX+dx,currentY+dy],width);
            if(creatureMng.populationBinHervabore[index]>0) return true;
        }
        return false;
    }
    enoughGrassAround(myLocationIndex, [currentX,currentY]){
        let neighborGrassCount = 0;
        for(let i=0;i<8;i++){
            let [dx,dy] = dxy[i];
            const index = xy2i([currentX+dx,currentY+dy],width);
            if(field.grassState[index]==1){
                neighborGrassCount++;
            }
        }
        return (neighborGrassCount>=this.threshForEnoughNeighborGrass);
    }
    chooseAction(){
        //Aqcuire Important Parameters
        const myLocationIndex = this.getIntIndex();
        const [currentX,currentY] = this.getIntXY();

        //Priority 1 Run if there is carnivore

        //Priority 3 Reproduce if it has enough energy
        if(this.energy>this.minEnergy*48&&creatureMng.liveHervaCount!=creatureMng.maxHervaCount){
            this.action = 2;
            return;
        }

        //Priority 2 Eat grass if it can
        if(field.grassState[myLocationIndex]==1){
            this.action = 0;
            return;
        }
        
        //Priority 4 Move toward less crowded place
        if(this.caresIfCrowded){
            if(this.anotherHervaboreAround(myLocationIndex,[currentX,currentY])){
                this.actionIsMoveToLessFriend([currentX,currentY]);
                return;
            }
        }

        //Priority 5 Move toward more grass
        this.actionIsMoveToMoreGrass([currentX,currentY]);
    }
    reproduce(){
        const dx = Math.sign(randomInt(2)-0.5);
        const dy = Math.sign(randomInt(2)-0.5);
        const success = creatureMng.spawnHervabore([this.x+dx,this.y+dy]);
        if(success) this.energy-=this.minEnergy*24;
    }
    eatGrass(){
        const index = this.getIntIndex();
        const energyLeftForGrass = field.energy[index];
        const absorbableEnergy = Math.min(energyLeftForGrass,this.energyAbsorptionRate);
        field.energy[index] -= absorbableEnergy;
        this.energy += absorbableEnergy;
    }
    move(){
        this.moveTo([this.targetX,this.targetY]);
    }
    takeAction(){
        if(this.action==2){
            //reproduce
            this.reproduce();
            return;
        }
        if(this.action==0){
            //eat
            this.eatGrass();
            return;
        }
        if(this.action==1){
            this.move();
            return;
        }
    }
}

console.log("Loaded: creature.js");