/*
class Grass extends Creature{
    constructor(x,y){
        super(Math.floor(x),Math.floor(y));
        this.grow();
        this.energy = 40;
        this.livingCost = 1;
        this.maxEnergy = 100;
        this.minEnergy = 30;
        this.reproductionCost = 45;
        this.energyAbsorptionRatio = 0.3; 
        this.energyReturnRatio = 0.5; 
        this.maxAbsorbableEnergy = 2;
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
        let  energyAbsorbed = this.energyAbsorptionRatio * field.energy[this.y*field.width+this.x];
        energyAbsorbed = Math.min(this.maxAbsorbableEnergy,energyAbsorbed);
        energyAbsorbed = Math.min(this.maxEnergy-this.energy,energyAbsorbed);
        this.energy += energyAbsorbed;
        field.energy[this.y*field.width+this.x] -= energyAbsorbed;
        
        this.energy -= this.livingCost;
        //Energy cost to live
        //if(random==0){

            if(this.energy>this.minEnergy+this.reproductionCost){
                this.reproduce();
            }
        //}
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
            //console.log(grass.length);
        }
    }
    draw(){
        fieldCanvas.ct.strokeStyle=(this.alive?"green":"brown");
        fieldCanvas.ct.lineWidth=0;
        fieldCanvas.line(this.x,this.y,this.x,this.y);
    }
}
*/

console.log("Loaded: grass.js");