alert("B");
class Pixel{
constructor(x,y){
    this.reset(x,y);
}
reset(x,y){
    this.originalx = x;
    this.originaly = y;
    this.x=x;
    this.y=y;
    this.counter = 0;
    this.explodeCount = false;
}
update(){
    if(this.explodeCount!=false) return this.explodeCount;
    this.counter++;
    const newx = this.x*this.x-this.y*this.y+this.originalx;
    const newy = this.x*this.y*2+this.originaly;
    this.x=newx;
    this.y=newy;
    if(newx*newx+newy*newy>4){
        this.explodeCount = this.counter;
    }
    return this.explodeCount;
}
}
alert("Pixel loaded");