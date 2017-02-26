export class Move {
  from: number;
  to: number;
  elapse: number;

  constructor(from: number, to: number, elapse: number){
    this.from = from;
    this.to = to;
    this.elapse = elapse;
  }
}
