
import { Attacks } from "../src/bots/Attacks";
import { Game } from '../src/Game'
import * as chai from "chai";
// import * as simple from 'simple-mock'
const simple = require('simple-mock')

const expect = chai.expect;

describe("Attacks", () => {


  describe('indexesAtRange', () => {
    // Mock game object here...
    let from = 55;
    let game = new Game({}, {}, true)
    simple.mock(game, 'width', 10)
    simple.mock(game, 'terrain', new Array(100))

    it('should have 4 correct indexes at range 1', () => {
      let res = Attacks.getIndexesAtRange(55, 1, game);
      
      expect(res.indexOf(45)).to.above(-1);
      expect(res.indexOf(56)).to.above(-1);
      expect(res.indexOf(65)).to.above(-1);
      expect(res.indexOf(54)).to.above(-1);
      expect(res.length).to.equal(4);
    })

    it('should have 8 correct indexes at range 2', () => {
      let res = Attacks.getIndexesAtRange(55, 2, game);

      // clockwise from 12  
      expect(res.indexOf(35)).to.above(-1);
      expect(res.indexOf(46)).to.above(-1);
      expect(res.indexOf(57)).to.above(-1);
      expect(res.indexOf(66)).to.above(-1);
      expect(res.indexOf(75)).to.above(-1);
      expect(res.indexOf(64)).to.above(-1);
      expect(res.indexOf(53)).to.above(-1);
      expect(res.indexOf(44)).to.above(-1);
      expect(res.length).to.equal(8);
    })

    it('should have 12 correct indexes at range 3', () => {
      let res = Attacks.getIndexesAtRange(55, 3, game);

      // clockwise from 12  
      expect(res.indexOf(25)).to.above(-1);
      expect(res.indexOf(36)).to.above(-1);
      expect(res.indexOf(47)).to.above(-1);
      expect(res.indexOf(58)).to.above(-1);
      expect(res.indexOf(67)).to.above(-1);
      expect(res.indexOf(76)).to.above(-1);
      expect(res.indexOf(85)).to.above(-1);
      expect(res.indexOf(74)).to.above(-1);
      expect(res.indexOf(63)).to.above(-1);
      expect(res.indexOf(52)).to.above(-1);
      expect(res.indexOf(43)).to.above(-1);
      expect(res.indexOf(34)).to.above(-1);
      expect(res.length).to.equal(12);
    })

    it('should only return indexes that are valid on the map', () => {
      let game = new Game({}, {}, true)
      simple.mock(game, 'width', 4)
      simple.mock(game, 'terrain', new Array(4 * 5))
      
      let res = Attacks.getIndexesAtRange(14, 2, game);

      // clockwise from 12  
      expect(res.indexOf(6)).to.above(-1);
      expect(res.indexOf(9)).to.above(-1);
      expect(res.indexOf(11)).to.above(-1);
      expect(res.indexOf(12)).to.above(-1);
      expect(res.indexOf(17)).to.above(-1);
      expect(res.indexOf(19)).to.above(-1);
      expect(res.length).to.equal(6);
    })

    it('should only return one quadrent when it bottom right corner', () => {
      let game = new Game({}, {}, true)
      simple.mock(game, 'width', 10)
      simple.mock(game, 'terrain', new Array(100))
      
      let res = Attacks.getIndexesAtRange(99, 2, game);

      expect(res.indexOf(79)).to.above(-1);
      expect(res.indexOf(88)).to.above(-1);
      expect(res.indexOf(97)).to.above(-1);
      expect(res.length).to.equal(3);
    })

    it('should only return one quadrent when it top left', () => {
      let game = new Game({}, {}, true)
      simple.mock(game, 'width', 10)
      simple.mock(game, 'terrain', new Array(100))
      
      let res = Attacks.getIndexesAtRange(0, 3, game);

      // clockwise from 12  
      expect(res.indexOf(3)).to.above(-1);
      expect(res.indexOf(12)).to.above(-1);
      expect(res.indexOf(21)).to.above(-1);
      expect(res.indexOf(30)).to.above(-1);
      expect(res.length).to.equal(4);
    })

    it('should not spill indexes over to the right side when on the left', () => {
      let game = new Game({}, {}, true)
      simple.mock(game, 'width', 10)
      simple.mock(game, 'terrain', new Array(100))
      
      let res = Attacks.getIndexesAtRange(50, 2, game);

      expect(res.indexOf(30)).to.above(-1);
      expect(res.indexOf(41)).to.above(-1);
      expect(res.indexOf(52)).to.above(-1);
      expect(res.indexOf(61)).to.above(-1);
      expect(res.indexOf(70)).to.above(-1);
      expect(res.length).to.equal(5);
    })
  })
});
