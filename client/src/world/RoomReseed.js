
export function nextRoomSeed(depth, roomX, roomY){
 return depth*1000000 + roomX*1000 + roomY;
}

export function enterNewRoom(game, dx=0, dy=0){
 const p=game.state?.player || game.player;
 const g=game.currentGrid;
 if(!p||!g) return false;
 const tile=g?.[p.y]?.[p.x];
 const t=tile?.type ?? tile;
 if(t!==4) return false;

 p.roomX=(p.roomX||25)+(dx<0?-1:dx>0?1:0);
 p.roomY=(p.roomY||25)+(dy<0?-1:dy>0?1:0);

 const seed=nextRoomSeed(p.depth||0,p.roomX,p.roomY);
 if(game.campaign?.generateGrid){
   game.currentGrid=game.campaign.generateGrid(seed);
 }

 const h=game.currentGrid.length;
 const w=game.currentGrid[0].length;
 p.x=Math.floor(w/2);
 p.y=Math.floor(h/2);

 game.depthRooms ||= {};
 game.depthRooms[p.depth||0] ||= {};
 game.depthRooms[p.depth||0][`${p.roomX},${p.roomY}`]=game.currentGrid;
 return true;
}
