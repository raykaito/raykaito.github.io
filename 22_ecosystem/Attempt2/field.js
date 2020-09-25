//Global Parameters
const Q_in  = 10000;//[J/frame]
const milli_Q_in = Q_in/1e3;
const micro_Q_in = Q_in/1e6;
const width = 512; //[pixels]
const height= 512; //[pixels]

class Field{
    constructor(){
        //Geometric Parameter
        this.width=width;
        this.height=height;
        this.area = this.width*this.height;
        this.center_x = this.width/2;
        this.center_y = this.height/2;

        //Solar Radiation Parameter
        this.totalRadiantFlux = Q_in;      //[J/frame]
        this.radiationRadius = 90;     //[pixels]
        this.solarRevolutionRadius = this.width/2-this.radiationRadius;//[pixels]
        this.energy = new Array(this.area).fill(0);

        //Guassian Distribution Parameter
        this.arraySideLength = 30;      //[elements]
        this.gaussianMagnifier = this.radiationRadius/this.arraySideLength;//[pixels/elements]
        this.varianceAtEdge = 3;        //[sigma]
        this.solarIrradiance = new Array(Math.pow(this.arraySideLength,2));
        this.getGaussDistribution(this.solarIrradiance);

        //Grass Parameter
        this.grassState = new Array(this.area).fill(0);//[0:Void 1:Alive 2:Dead]
        this.grassAliveNeighbor = new Array(this.area).fill(0);
        this.grassAliveList = new Array();
        this.grassMinSpawnEnergy = 2000*micro_Q_in;
        this.grassEnergyConsumptionRate = 50*micro_Q_in;
        this.grassDespawnChance = 0.005;
        this.grassReproduceChance = 0.1;
        this.grassSpawnAttemptChance = 0.1;
    }
    getGaussDistribution(gaussianDistribution){
        /*-----------INFO ABOUT GAUSSIAN DISTRIBUTION-----------*/
        /*
        2D gaussian function f(x,y) can be expressed as
            f(x,y) = A exp ( -{((x-x_0)**2)/(2σx**2)+((y-y_0)**2)/(2σy**2)})
        Where A is the amplitude, x_0,y_0 are the center and σx and σy are the spread.
        The Volume is given by
            V = 2π*A*σx*σy
        */
        const sigma_xy_element = this.arraySideLength/this.varianceAtEdge;
        let totalRadiantFluxMeasured = 0;
        //Calculate Gaussian Distribution without consideration of A
        for(let iGauss=0;iGauss<gaussianDistribution.length;iGauss++){
            const xGauss = iGauss%this.arraySideLength;
            const yGauss = Math.floor(iGauss/this.arraySideLength);
            gaussianDistribution[iGauss] = Math.exp(-( Math.pow(xGauss,2)/(2*Math.pow(sigma_xy_element,2))+Math.pow(yGauss,2)/(2*Math.pow(sigma_xy_element,2)) ));
            totalRadiantFluxMeasured += 4*gaussianDistribution[iGauss]*Math.pow((this.radiationRadius/this.arraySideLength),2);
        }
        //Multiply each element by A to adjust the totalRadiantFlux (Q_in);
        const A = this.totalRadiantFlux/totalRadiantFluxMeasured;
        for(let iGauss=0;iGauss<gaussianDistribution.length;iGauss++){
            gaussianDistribution[iGauss] *= A;
        }

    }
    updateField(time){
        this.updateSunPosition(time);
        this.calculateSolarIrradiance();
        this.grassUpdate();
        this.grassAttemptSpawn();
        this.grassAttemptReproduce();
    }
    updateSunPosition(time){
        const theta = (time/60)*2 * Math.PI;
        this.sunX = Math.floor(this.center_x+this.solarRevolutionRadius*Math.cos(theta));
        this.sunY = Math.floor(this.center_y+this.solarRevolutionRadius*Math.sin(theta));
    }
    calculateSolarIrradiance(){
        for(let iGauss=0;iGauss<this.solarIrradiance.length;iGauss++){
            let dx = iGauss%this.arraySideLength*this.gaussianMagnifier;
            let dy = Math.floor(iGauss/this.arraySideLength)*this.gaussianMagnifier;
            const irradiance = this.solarIrradiance[iGauss];
            for(let iDir=0;iDir<4;iDir++){
                let xSign = Math.sign(1/dx);
                let ySign = Math.sign(1/dy);
                for(let xMag=0;xMag<this.gaussianMagnifier;xMag++){
                    const xindex = this.sunX+dx+xMag*xSign+Math.min(xSign,0);
                    for(let yMag=0;yMag<this.gaussianMagnifier;yMag++){
                        const yindex = this.sunY+dy+yMag*ySign+Math.min(ySign,0);
                        const index  = yindex*this.width+xindex;
                        this.energy[index] += irradiance;
                    }
                }
                //Rotate by 90 deg
                const dx_save = dx;
                dx = -dy;
                dy = dx_save;
            }
        }

    }
    grassUpdate(){
        for(let index=0;index<this.area;index++){
            if(this.grassState[index]==1){
                this.energy[index] -= this.grassEnergyConsumptionRate;
                if(this.energy[index]<this.grassMinSpawnEnergy){
                    this.grassDie(index);
                }
            }else if(this.grassState[index]==2){
                if(Math.random()>this.grassDespawnChance) continue;
                this.grassDespawn(index);
            }
        }
    }
    grassAttemptSpawn(){
        if(Math.random()>this.grassSpawnAttemptChance) return;
        this.grassSpawn(randomInt(this.area));
    }
    grassAttemptReproduce(){
        const aliveCount = this.grassAliveList.length;
        for(let iLiveGrass=0;iLiveGrass<aliveCount;iLiveGrass++){
            if(Math.random()>this.grassReproduceChance) continue;
            const index = this.grassAliveList[iLiveGrass];
            if(this.grassAliveNeighbor[index]<8){
                const [ x, y] = i2xy(index,this.width);
                const [dx,dy] = dxy[randomInt(8)];
                const neighbori = xy2i([x+dx,y+dy],this.width);
                this.grassSpawn(neighbori);
            }
        }
    }
    grassSpawn(index){
        if(this.grassState[index]>=1) return;
        if(this.energy[index]<this.grassMinSpawnEnergy){
            return;
        }
        this.grassState[index] = 1;
        this.grassAliveList.push(index);
        this.grassUpdateNeighbour(index,true);
    }
    grassDie(index){
        this.grassState[index] = 2;
        this.grassAliveList.splice(this.grassAliveList.indexOf(index),1);
    }
    grassDespawn(index){
        this.grassState[index] = 0;
        this.grassUpdateNeighbour(index,false);        
    }
    grassUpdateNeighbour(index,add=true){
        const [x,y] = i2xy(index,this.width);
        for(let i=0;i<8;i++){
            const [dx,dy] = dxy[i];
            const neighbourx=dx+x;
            const neighboury=dy+y;
            if(neighbourx<0||neighbourx>=this.width) continue;
            if(neighboury<0||neighboury>=this.height) continue;
            const neighbori = xy2i([neighbourx,neighboury],this.width);
            this.grassAliveNeighbor[neighbori] += (add?1:-1);
        }
    }
    drawField(fieldImgData){
        for(let i=0;i<this.energy.length;i++){
            if(this.grassState[i]==0){
                fieldImgData.data[i*4+0]=this.energy[i];
                fieldImgData.data[i*4+1]=this.energy[i];
                fieldImgData.data[i*4+2]=0;
            }else if(this.grassState[i]==1){
                fieldImgData.data[i*4+0]=30;
                fieldImgData.data[i*4+1]=200;
                fieldImgData.data[i*4+2]=20;
            }else if(this.grassState[i]==2){
                fieldImgData.data[i*4+0]=180;
                fieldImgData.data[i*4+1]=50;
                fieldImgData.data[i*4+2]=20;
            }
        }
    }
    drawField_rand(canvas){
        for(let i=0;i<this.energy.length;i++){
            if(this.grassState[i]==0){
                fieldImgData.data[i*4+0]=this.energy[i];
                fieldImgData.data[i*4+1]=this.energy[i];
                fieldImgData.data[i*4+2]=this.energy[i];
            }else if(this.grassState[i]==1){
                fieldImgData.data[i*4+0]=255*randBtwn(0.0,0.4);
                fieldImgData.data[i*4+1]=255*randBtwn(0.6,0.7);
                fieldImgData.data[i*4+2]=255*randBtwn(0.0,0.4);
            }else if(this.grassState[i]==2){
                fieldImgData.data[i*4+0]=255*randBtwn(0.2,0.9);
                fieldImgData.data[i*4+1]=255*randBtwn(0.0,0.3);
                fieldImgData.data[i*4+2]=255*randBtwn(0.0,0.2);
            }
        }
    }
    changeEnergy(x,y,energyAdded){
        this.energy[x+y*this.width] += energyAdded;
    }
}

console.log("Loaded: grass.js");