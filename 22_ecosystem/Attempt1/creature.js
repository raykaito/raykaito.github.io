class Creature{
    constructor(x, y){
        this.x=x;
        this.y=y;
        this.alive=true;
        this.energy;
        this.maxEnergy;
        this.reproductionCost;
        this.setInitialParameter(); 
    }
    update(){
        if(this==null)return;
    }
    setInitialParameter(){


    }
    returnEnergyToField(){
        const energyToReturn = this.energy*this.energyReturnRatio;
        field.energy[Math.floor(this.y)*field.widh+Math.floor(this.x)] += this.energyToReturn;
        this.energy -= energyToReturn;
        if(this.energy<1){
            this.destruct();
        }
    } 

    grow(x,y,energyAdded){
        this.energy += this.energyAdded;
    }
    die(x,y){
        this.alive=false;
        field.spreadableTiles[this.x+field.width*this.y] = true;
    }
    destruct(){
    }
    reproduce(){

    }
    getEaten(x,y){
        this.energy=0;
    }
}

console.log("Loaded: grass.js");