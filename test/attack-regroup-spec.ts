
import { Attacks } from "../src/bots/Attacks";
import { Game } from '../src/Game'
import * as chai from "chai";
// import * as simple from 'simple-mock'
const simple = require('simple-mock')

const expect = chai.expect;

describe("Attacks", () => {

  describe('indexesAtRange', () => {
    it("should return 4 indexes at range of 1", () => {
      // Mock game object here...
      let game = new Game({}, {}, true)
      simple.mock(game, 'width', 10)

      let res = Attacks.getIndexesAtRange(100, 1, game);

      expect(res.length).to.equal(4);
    });

    it('should return 12 indexes at range of 3', () => {
      // Mock game object here...
      let game = new Game({}, {}, true)
      simple.mock(game, 'width', 10)

      let res = Attacks.getIndexesAtRange(100, 3, game);

      expect(res.length).to.equal(12);
    })

    it('should have 1 tile in all directions at range 1', () => {
      // Mock game object here...
      let from = 100;
      let game = new Game({}, {}, true)
      simple.mock(game, 'width', 10)

      let res = Attacks.getIndexesAtRange(from, 1, game);

// console.log(res);


      expect(res.indexOf(90)).to.above(-1);
      expect(res.indexOf(101)).to.above(-1);
      expect(res.indexOf(110)).to.above(-1);
      expect(res.indexOf(99)).to.above(-1);
    })

    it('should have 1 tile in all directions at range 1', () => {
      // Mock game object here...
      let from = 100;
      let game = new Game({}, {}, true)
      simple.mock(game, 'width', 10)

      let res = Attacks.getIndexesAtRange(from, 2, game);

console.log(res);

      // clockwise from 12  
      expect(res.indexOf(80)).to.above(-1);
      expect(res.indexOf(91)).to.above(-1);
      expect(res.indexOf(102)).to.above(-1);
      expect(res.indexOf(111)).to.above(-1);
      expect(res.indexOf(120)).to.above(-1);
      expect(res.indexOf(109)).to.above(-1);
      expect(res.indexOf(98)).to.above(-1);
      expect(res.indexOf(89)).to.above(-1);
    })

//     it('should have 3 tile in all directions at range 1', () => {
//       // Mock game object here...
//       let from = 100;
//       let game = new Game({}, {}, true)
//       simple.mock(game, 'width', 10)

//       let res = Attacks.getIndexesAtRange(from, 2, game);

// console.log(res);

//       // clockwise from 12  
//       expect(res.indexOf(70)).to.above(-1);
//       expect(res.indexOf(81)).to.above(-1);
//       expect(res.indexOf(92)).to.above(-1);
//       expect(res.indexOf(103)).to.above(-1);
//       expect(res.indexOf(112)).to.above(-1);
//       expect(res.indexOf(121)).to.above(-1);
//       expect(res.indexOf(130)).to.above(-1);
//       expect(res.indexOf(119)).to.above(-1);
//       expect(res.indexOf(108)).to.above(-1);
//       expect(res.indexOf(97)).to.above(-1);
//       expect(res.indexOf(88)).to.above(-1);
//       expect(res.indexOf(79)).to.above(-1);
//     })
  })
});
