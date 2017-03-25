export class Move {
  from: number;
  to: number;
  elapse: number;
  half: boolean;

  constructor(from: number, to: number, elapse: number, half?:boolean){
    this.from = from;
    this.to = to;
    this.elapse = elapse;
    this.half = half || false
  }
}
