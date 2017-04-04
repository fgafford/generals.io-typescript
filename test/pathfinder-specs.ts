
import { Game } from '../src/Game'
import { PathFinder } from '../src/PathFinder'
import { TILE } from '../src/GameConstants';
import { MockBot } from '../src/bots/mockBot'

import * as chai from "chai";
const simple = require('simple-mock')
const expect = chai.expect;

describe("Pathfinder", () => {
    const mockBot = new MockBot();
    const microMap = require('./maps/3x3')
    const miniMap = require('./maps/5x5')
    const map1 = require('./maps/map1')
    const map2 = require('./maps/map2')
    const map3 = require('./maps/map3')
    const map4 = require('./maps/map4')

    it('should not error building all paths', () => {
      let map = microMap;
      // Mock game object here...
      let game = new Game('', '', mockBot, true)
        simple.mock(game, 'width', map.width)
        simple.mock(game, 'terrain', map.terrain)
        simple.mock(game, 'BASE', map.BASE)
        simple.mock(game, 'cities', map.cities || [])
        

      let pf = new PathFinder(game);
      pf.buildAllPaths();
      // pf.print(game.BASE);
    })

    it('does not include visibile cities (as of now)', () => {
      let map = miniMap;
      // Mock game object here...
      let game = new Game('', '', mockBot, true)
        simple.mock(game, 'width', map.width)
        simple.mock(game, 'terrain', [-1,-1,-1,-1,-1,
                                      -1,-1,-1,-1,-1,
                                      -1, 0, 0,-1,-1,                                      
                                      -1,-1,-1,-1,-1,
                                      -1,-1,-1,-1,-1,])
        simple.mock(game, 'armies',  [-1,-1,-1,-1,-1,
                                      -1,-1,-1,-1,-1,
                                      -1, 45,1,-1,-1,                                      
                                      -1,-1,-1,-1,-1,
                                      -1,-1,-1,-1,-1,])
        simple.mock(game, 'BASE', map.BASE)
        simple.mock(game, 'cities', [11])

      let pf = new PathFinder(game);
      pf.buildPath(game.BASE)

      expect(pf.distanceTo(10,game.BASE)).to.equal(4);

      // pf.print(game.BASE);
    })

    it('should not include BASE on another path (for now)', () => {
      let map = microMap;
      // Mock game object here...
      let game = new Game('', '', mockBot, true)
        simple.mock(game, 'width', map.width)
        simple.mock(game, 'terrain', map.terrain)
        simple.mock(game, 'BASE', map.BASE)
        simple.mock(game, 'cities', map.cities || [])
        
      let ind = 1;

      let pf = new PathFinder(game);
      pf.buildPath(ind);

      expect(pf.distanceTo(7, ind)).to.equal(4);

      // pf.print(ind);
    })

    /**
     * getSurroundingIndexes
     */
    describe('getSurroundingIndexes', () => {

      it('should have 4 correct indexes at range 1', () => {
      let game = new Game('', '', mockBot, true)
        simple.mock(game, 'width', 10)
        simple.mock(game, 'terrain', new Array(100))
        simple.mock(game, 'cities', [])

        let pf = new PathFinder(game);
        let res = pf.getSurroundingIndexes(55, game);
        
        expect(res.indexOf(45)).to.above(-1);
        expect(res.indexOf(56)).to.above(-1);
        expect(res.indexOf(65)).to.above(-1);
        expect(res.indexOf(54)).to.above(-1);
        expect(res.length).to.equal(4);
      })

      it('should only return one quadrent when it bottom right corner', () => {
        let game = new Game('', '', mockBot, true)
        simple.mock(game, 'width', 10)
        simple.mock(game, 'terrain', new Array(100))
        simple.mock(game, 'cities', [])
        
        let pf = new PathFinder(game);
        let res =  pf.getSurroundingIndexes(99, game);

        expect(res.indexOf(89)).to.above(-1);
        expect(res.indexOf(89)).to.above(-1);
        expect(res.length).to.equal(2);
      })

      it('should only return one quadrent when it top left', () => {
        let game = new Game('', '', mockBot, true)
        simple.mock(game, 'width', 10)
        simple.mock(game, 'terrain', new Array(100))
        simple.mock(game, 'cities', [])
        
        let pf = new PathFinder(game);
        let res =  pf.getSurroundingIndexes(0, game);

        // clockwise from 12  
        expect(res.indexOf(1)).to.above(-1);
        expect(res.indexOf(10)).to.above(-1);
        expect(res.length).to.equal(2);
      })

      it('should not spill indexes over to the right side when on the left', () => {
        let game = new Game('', '', mockBot, true)
        simple.mock(game, 'width', 10)
        simple.mock(game, 'terrain', new Array(100))
        simple.mock(game, 'cities', [])
      
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
        let game = new Game('', '', mockBot, true)
          simple.mock(game, 'width', map.width)
          simple.mock(game, 'terrain', map.terrain)
          simple.mock(game, 'BASE', map.BASE)
          simple.mock(game, 'cities', map.cities || [])
       
        let pf = new PathFinder(game);
        let moves = pf.allMoves(game.BASE - 1 , game.BASE)
 
        
        
        expect(moves.length).to.equal(4);
      })

      it('should return 2 moves in corner of map', () => {
        const map = miniMap;
        // Mock game object here...
        let game = new Game('', '', mockBot, true)
          simple.mock(game, 'width', map.width)
          simple.mock(game, 'terrain', map.terrain)
          simple.mock(game, 'BASE', map.BASE)
          simple.mock(game, 'cities', map.cities || [])
       
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
          let game = new Game('', '', mockBot, true)
            simple.mock(game, 'width', map.width)
            simple.mock(game, 'terrain', map.terrain)
            simple.mock(game, 'armies',  [0,0,0,0,0,
                                          0,0,0,0,0,
                                          0,0,0,0,0,
                                          0,0,0,0,0,
                                          0,0,0,0,0])
            simple.mock(game, 'BASE', map.BASE)
            simple.mock(game, 'cities', map.cities || [])
        
          let pf = new PathFinder(game);
          let move = pf.fastest(game.BASE - 1 , game.BASE)

          expect(move.distance).to.equal(0);
          expect(move.index).to.equal(game.BASE);
        })

        it('should perfer paths with great ally armies if same distance away', () => {
          let map = miniMap;
          // Mock game object here...
          let game = new Game('', '', mockBot, true)
            simple.mock(game, 'width', map.width)
            simple.mock(game, 'terrain', [-1,-1,-1,-1,-1,
                                           0, 0, 0, 0, 0,
                                           0,-2,-2,-2, 0,                                      
                                           0, 0, 0, 0, 0,
                                          -1,-1,-1,-1,-1,])
            simple.mock(game, 'armies',  [-1,-1,-1,-1,-1,
                                           1, 1, 1, 1, 1,
                                           1,-1,-1,-1, 5,                                      
                                           2, 2, 2, 2, 2,
                                          -1,-1,-1,-1,-1,])
            simple.mock(game, 'BASE', 10)
            simple.mock(game, 'cities', [])

          let pf = new PathFinder(game);
          pf.buildPath(game.BASE)

          let move = pf.fastest(14,game.BASE);

          expect(move.index).to.equal(19);
          // pf.print(game.BASE);
        })

        it('should perfer allies over enemy tiles if same distance away', () => {
          let map = miniMap;
          // Mock game object here...
          let game = new Game('', '', mockBot, true)
            simple.mock(game, 'width', map.width)
            simple.mock(game, 'terrain', [-1,-1,-1,-1,-1,
                                           0, 0, 0, 0, 0,
                                           0,-2,-2,-2, 0,                                      
                                           1, 1, 1, 1, 1,
                                          -1,-1,-1,-1,-1,])
            simple.mock(game, 'armies',  [-1,-1,-1,-1,-1,
                                           1, 1, 1, 1, 1,
                                           1,-1,-1,-1, 5,                                      
                                           2, 2, 2, 2, 2,
                                          -1,-1,-1,-1,-1,])
            simple.mock(game, 'BASE', 10)
            simple.mock(game, 'cities', [])

          let pf = new PathFinder(game);
          pf.buildPath(game.BASE)

          let move = pf.fastest(14,game.BASE);

          expect(move.index).to.equal(9);
        })
        
    })

    /**
     * 
     */
    describe('getNearest', () => {
      it('should return all surrounding matches', () => {
          const map = microMap;
          // Mock game object here...
          let game = new Game('', '', mockBot, true)
            simple.mock(game, 'width', map.width)
            simple.mock(game, 'terrain', map.terrain)
            simple.mock(game, 'BASE', map.BASE)
            simple.mock(game, 'cities', map.cities || [])

          let pf = new PathFinder(game);
          let move = pf.getNearest(game.BASE, TILE.EMPTY);

          // Need to Mock the terrain in other tests cases....
          let expected = [1,3,5,7];
          expect(expected.indexOf(move.index)).to.above(-1);

      })

      it('should not return surrounding tiles that do not match', () => {
          const map = microMap;
          // Mock game object here...
          let game = new Game('', '', mockBot, true)
            simple.mock(game, 'width', map.width)
            simple.mock(game, 'terrain', [0,0,0,
                                          0,0,0,
                                          0,0,-1])
            simple.mock(game, 'cities', map.cities || [])

          let pf = new PathFinder(game);
          let moves = pf.getNearest(4, TILE.EMPTY);

          // Need to Mock the terrain in other tests cases....
          expect(moves.index).to.equal(8);
      })

      it('should only return the nearest match', () => {
          const map = microMap;
          // Mock game object here...
          let game = new Game('', '', mockBot, true)
            simple.mock(game, 'width', map.width)
            simple.mock(game, 'terrain', [0,0,0,
                                          0,0,0,
                                          0,-1,-1])
            simple.mock(game, 'cities', map.cities || [])

          let pf = new PathFinder(game);
          let move = pf.getNearest(0, TILE.EMPTY);

          // Need to Mock the terrain in other tests cases....
          expect(move.index).to.equal(7);
      })

      it('should show the proper distance to the match', () => {
          const map = microMap;
          // Mock game object here...
          let game = new Game('', '', mockBot, true)
            simple.mock(game, 'width', map.width)
            simple.mock(game, 'terrain', [0,0,0,
                                          0,0,0,
                                          0,0,-1])
            simple.mock(game, 'cities', map.cities || [])

          let pf = new PathFinder(game);
          let move = pf.getNearest(0, TILE.EMPTY);

          // Need to Mock the terrain in other tests cases....
          expect(move.distance).to.equal(4);
      })

      it('should default to attack any army', () => {
          const map = microMap;
          // Mock game object here...
          let game = new Game('', '', mockBot, true)
            simple.mock(game, 'width', map.width)
            simple.mock(game, 'terrain', [0,0,0,
                                          0,0,-1,
                                          0,-1,1])
            simple.mock(game, 'cities', map.cities || []) 

          let pf = new PathFinder(game);
          let move = pf.getNearest(0);

          // Need to Mock the terrain in other tests cases....
          expect(move.index).to.equal(8);
          

          simple.mock(game, 'terrain', [0,0, 1,
                                        0,0,-1,
                                        0,-1,1])

          pf = new PathFinder(game);
          move = pf.getNearest(0);

          // Need to Mock the terrain in other tests cases....
          expect(move.index).to.equal(2);
      })

    })
});
