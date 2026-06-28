
export function travel(roomX,roomY,px,py,w,h){
 if(px<0) return {roomX:roomX-1,roomY,px:w-2,py};
 if(px>=w) return {roomX:roomX+1,roomY,px:1,py};
 if(py<0) return {roomX,roomY:roomY-1,px,py:h-2};
 if(py>=h) return {roomX,roomY:roomY+1,px,py:1};
 return {roomX,roomY,px,py};
}
