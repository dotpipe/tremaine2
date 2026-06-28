export class Foundry {

constructor(){

this.capacity =
1;

this.reactors =
1;

}

upgrade(){

this.capacity++;

}

slots(){

return (

this.capacity
*
this.reactors

);

}

}