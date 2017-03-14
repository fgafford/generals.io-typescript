
import { Attacks } from "../src/bots/Attacks";
import { Game } from '../src/Game'
import { PathFinder } from '../src/PathFinder'
import { TILE } from '../src/GameConstants';

import * as chai from "chai";
const simple = require('simple-mock')
const expect = chai.expect;

describe("Pathfinder", () => {
    const microMap = require('./maps/3x3')
    const miniMap = require('./maps/5x5')
    const map1 = require('./maps/map1')
    const map2 = require('./maps/map2')
    const map3 = require('./maps/map3')
    const map4 = require('./maps/map4')

    it('basic test', () => {
      let map = microMap;
      // Mock game object here...
      let game = new Game({}, {}, true)
        simple.mock(game, 'width', map.width)
        simple.mock(game, 'terrain', map.terrain)
        simple.mock(game, 'BASE', map.BASE)

      let pf = new PathFinder(game);
      // pf.buildAllPat hs();
      pf.buildPath(game.BASE)
      pf.print(game.BASE);
    })

    /**
     * getSurroundingIndexes
     */
    describe('getSurroundingIndexes', () => {

      it('should have 4 correct indexes at range 1', () => {
        let game = new Game({}, {}, true)
        simple.mock(game, 'width', 10)
        simple.mock(game, 'terrain', new Array(100))

        let pf = new PathFinder(game);
        let res = pf.getSurroundingIndexes(55, game);
        
        expect(res.indexOf(45)).to.above(-1);
        expect(res.indexOf(56)).to.above(-1);
        expect(res.indexOf(65)).to.above(-1);
        expect(res.indexOf(54)).to.above(-1);
        expect(res.length).to.equal(4);
      })

      it('should only return one quadrent when it bottom right corner', () => {
        let game = new Game({}, {}, true)
        simple.mock(game, 'width', 10)
        simple.mock(game, 'terrain', new Array(100))
        
        let pf = new PathFinder(game);
        let res =  pf.getSurroundingIndexes(99, game);

        expect(res.indexOf(89)).to.above(-1);
        expect(res.indexOf(89)).to.above(-1);
        expect(res.length).to.equal(2);
      })

      it('should only return one quadrent when it top left', () => {
        let game = new Game({}, {}, true)
        simple.mock(game, 'width', 10)
        simple.mock(game, 'terrain', new Array(100))
        
        let pf = new PathFinder(game);
        let res =  pf.getSurroundingIndexes(0, game);

        // clockwise from 12  
        expect(res.indexOf(1)).to.above(-1);
        expect(res.indexOf(10)).to.above(-1);
        expect(res.length).to.equal(2);
      })

      it('should not spill indexes over to the right side when on the left', () => {
        let game = new Game({}, {}, true)
        simple.mock(game, 'width', 10)
        simple.mock(game, 'terrain', new Array(100))
      
        let pf = new PathFinder(game);
        let res =  pf.getSurroundingIndexes(50, game);

        expect(res.indexOf(40)).to.above(-1);
        expect(res.indexOf(51)).to.above(-1);
        expect(res.indexOf(60)).to.above(-1);
        expect(res.length).to.equal(3);
      })
    })

    /**
     * allMoves
     */
    describe('allMoves', () => {
      it('should return 4 moves when in middle of map', () => {
        const map = miniMap;
        // Mock game object here...
        let game = new Game({}, {}, true)
          simple.mock(game, 'width', map.width)
          simple.mock(game, 'terrain', map.terrain)
          simple.mock(game, 'BASE', map.BASE)
       
        let pf = new PathFinder(game);
        let moves = pf.allMoves(game.BASE - 1 , game.BASE)
 
        
        
        expect(moves.length).to.equal(4);
      })

      it('should return 2 moves in corner of map', () => {
        const map = miniMap;
        // Mock game object here...
        let game = new Game({}, {}, true)
          simple.mock(game, 'width', map.width)
          simple.mock(game, 'terrain', map.terrain)
          simple.mock(game, 'BASE', map.BASE)
       
        let pf = new PathFinder(game);
        let moves = pf.allMoves(0 , game.BASE)
 
        expect(moves.length).to.equal(2);
      })
    })

    /**
     * fastest
     */
    describe('fastest', () => {
        it('should return move to go when 1 away', () => {
          const map = miniMap;
          // Mock game object here...
          let game = new Game({}, {}, true)
            simple.mock(game, 'width', map.width)
            simple.mock(game, 'terrain', map.terrain)
            simple.mock(game, 'BASE', map.BASE)
        
          let pf = new PathFinder(game);
          let move = pf.fastest(game.BASE - 1 , game.BASE)

          expect(move.distance).to.equal(0);
          expect(move.index).to.equal(game.BASE);
        })
    })

    /**
     * 
     */
    describe('getNearest', () => {
      it('should return all surrounding matches', () => {
          const map = microMap;
          // Mock game object here...
          let game = new Game({}, {}, true)
            simple.mock(game, 'width', map.width)
            simple.mock(game, 'terrain', map.terrain)
            simple.mock(game, 'BASE', map.BASE)

          let pf = new PathFinder(game);
          let moves = pf.getNearest(game.BASE, TILE.EMPTY);

          // Need to Mock the terrain in other tests cases....
          expect(moves.length).to.equal(4);

          let expected = [1,3,5,7];
          for(let i of moves){
            expect(expected.indexOf(i.index)).to.above(-1);
          }

      })

      it('should not return surrounding tiles that do not match', () => {
          const map = microMap;
          // Mock game object here...
          let game = new Game({}, {}, true)
            simple.mock(game, 'width', map.width)
            simple.mock(game, 'terrain', [0,0,0,
                                          0,0,0,
                                          0,0,-1])

          let pf = new PathFinder(game);
          let moves = pf.getNearest(4, TILE.EMPTY);

          // Need to Mock the terrain in other tests cases....
          expect(moves.length).to.equal(1);
          expect(moves[0].index).to.equal(8);
      })

      it('should only return the nearest match', () => {
          const map = microMap;
          // Mock game object here...
          let game = new Game({}, {}, true)
            simple.mock(game, 'width', map.width)
            simple.mock(game, 'terrain', [0,0,0,
                                          0,0,0,
                                          0,-1,-1])

          let pf = new PathFinder(game);
          let moves = pf.getNearest(0, TILE.EMPTY);

          // Need to Mock the terrain in other tests cases....
          expect(moves.length).to.equal(1);
          expect(moves[0].index).to.equal(7);
      })

      it('should show the proper distance to the match', () => {
          const map = microMap;
          // Mock game object here...
          let game = new Game({}, {}, true)
            simple.mock(game, 'width', map.width)
            simple.mock(game, 'terrain', [0,0,0,
                                          0,0,0,
                                          0,0,-1])

          let pf = new PathFinder(game);
          let moves = pf.getNearest(0, TILE.EMPTY);

          // Need to Mock the terrain in other tests cases....
          expect(moves.length).to.equal(1);
          expect(moves[0].distance).to.equal(4);
      })

      it('should default to attack any army', () => {
          const map = microMap;
          // Mock game object here...
          let game = new Game({}, {}, true)
            simple.mock(game, 'width', map.width)
            simple.mock(game, 'terrain', [0,0,0,
                                          0,0,-1,
                                          0,-1,1])

          let pf = new PathFinder(game);
          let moves = pf.getNearest(0);

          // Need to Mock the terrain in other tests cases....
          expect(moves.length).to.equal(1);
          expect(moves[0].index).to.equal(8);
          

          simple.mock(game, 'terrain', [0,0, 1,
                                        0,0,-1,
                                        0,-1,1])

          pf = new PathFinder(game);
          moves = pf.getNearest(0);

          // Need to Mock the terrain in other tests cases....
          expect(moves.length).to.equal(1);
          expect(moves[0].index).to.equal(2);
      })

    })
});
