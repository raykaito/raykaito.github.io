
function aqpToabc(x){
   var lala=x[0]*(x[1]+x[2]);
   x[2]=x[0]*x[1]*x[2];
   x[1]=lala;
   return x;
}
function ahkToabc(x){
   var lala=2*x[0]*x[1];
   x[2]= x[2]+x[0]*x[1]*x[1];
   x[1]=lala;
   return x;
}
function abcToaqp(x){
   var lala=new Array();
   lala=yTopoint(x,0);
   x[1]=-lala[0];
   x[2]=-lala[1];
   return x;
}
function abcToahk(x){
   var lala=x[1]/(2*x[0]);
   x[2]=x[2]-x[1]*x[1]/(4*x[0]);
   x[1]=lala;
   return x;
}
function xTopoint(abc,x){
   var ans=abc[0]*x*x+abc[1]*x+abc[2];
   return ans;
}
function yTopoint(abc,y){
   var a=abc[0];
   var b=abc[1];
   var c=abc[2];
   c=c-y;
   var lala=b*b-4*a*c;
   var sol=new Array();
   sol[0]=(-b-Math.sqrt
      (Math.abs(lala)))/(2*a);
   sol[1]=(-b+Math.sqrt
      (Math.abs(lala)))/(2*a);
   sol[2]=lala;
   return sol;
}
function findVertex(abc){
   abc=abcToahk(abc);
   var sols=new Array();
   sols[0]=-abc[1];
   sols[1]=abc[2];
   return (sols);
}
function rounder(x){
  if(x.length){
  for(var i=0;i<x.length;i++){
  x[i]=Math.round(x[i]*100)/100;}
  }else{
  x=Math.round(x*100)/100;}
  return x;
}
