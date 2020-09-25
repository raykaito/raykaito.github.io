class Grass extends Creature{
    constructor(x,y){
        super(x,y);
        this.grow();
        this.energy = 50;
        this.livingCost = 1;
        this.maxEnergy = 100;
        this.minEnergy = 30;
        this.reproductionCost = 20;
        this.energyAbsorptionRatio = 0.3; 
        this.energyReturnRatio = 0.5; 
    }

    update(){
        if(this==null)return;
        const random=Math.floor(Math.random()*20);
        //if(random!=0) return;
        if(!this.alive){
            this.returnEnergyToField();
            return;
        } 


        //Energy gained from field
        const energyAbsorbed = Math.min(this.maxEnergy-this.energy,this.energyAbsorptionRatio * field.energy[this.y*field.width+this.x]);
        this.energy += energyAbsorbed;
        field.energy[this.y*field.widh+this.x] -= energyAbsorbed;
        
        //Energy cost to live
        this.energy -= this.livingCost;

        if(true||this.energy>this.minEnergy+this.reproductionCost){
            this.reproduce();
        }
        if(this.energy<this.minEnergy){
            this.die();
        }
    }

    reproduce(){
        super.reproduce();
        const randomX=Math.floor(Math.random()*3)-1;
        const randomY=Math.floor(Math.random()*3)-1;
        const babyX = this.x+randomX;
        const babyY = this.y+randomY;
        if(field.spreadableTiles[babyY*field.width+babyX]){
            grass[grass.length]=new Grass(babyX,babyY);
            field.spreadableTiles[babyY*field.width+babyX] = false;
            this.energy -= this.reproductionCost;
            console.log(grass.length);
        }
    }
    draw(){
        fieldCanvas.ct.strokeStyle=(this.alive?"green":"brown");
        fieldCanvas.ct.lineWidth=0;
        fieldCanvas.line(this.x,this.y,this.x,this.y);
    }
}


console.log("Loaded: grass.js");