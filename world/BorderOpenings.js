export const TILE={ENTRANCE:0,EXIT:1,WALL:2,FLOOR:3,OPENING:4};

export function traverse(depth,roomX,roomY,x,y,w,h){
 if(x===0)return {depth,roomX:roomX-1,roomY,x:w-2,y};
 if(x===w-1)return {depth,roomX:roomX+1,roomY,x:1,y};
 if(y===0)return {depth,roomX,roomY:roomY-1,x,y:h-2};
 if(y===h-1)return {depth,roomX,roomY:roomY+1,x,y:1};
 return {depth,roomX,roomY,x,y};
}
