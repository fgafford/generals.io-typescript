
import { Attacks } from "../src/bots/Attacks";
import { Game } from '../src/Game'
import { PathFinder } from '../src/PathFinder'
import { TILE } from '../src/GameConstants';
import * as chai from "chai";
// import * as simple from 'simple-mock'
const simple = require('simple-mock')

const expect = chai.expect;

describe("Attacks", () => {
    const microMap = require('./maps/3x3')
    const miniMap = require('./maps/5x5')

    describe('getArmiesWithMinSize', () => {
        it('should not use base by default', () => {
            let map = microMap;
            // Mock game object here...
            let game = new Game({}, {}, true)
                simple.mock(game, 'width', map.width)
                simple.mock(game, 'terrain', map.terrain)
                simple.mock(game, 'BASE', 0)
                simple.mock(game,'terrain', [ 0,-1,-1,
                                             -1,-1,-1,
                                             -1,-1,-1])
                simple.mock(game, 'armies', [2,0,0,
                                             0,0,0,
                                             0,0,0])

            let pf = new PathFinder(game);
            let attacks = new Attacks(game, pf); 

            let indexes = attacks.getArmiesWithMinSize()

            expect(indexes.length).to.equal(0);
            
        })

        it('should use base when specified', () => {
            let map = microMap;
            // Mock game object here...
            let game = new Game({}, {}, true)
                simple.mock(game, 'width', map.width)
                simple.mock(game, 'terrain', map.terrain)
                simple.mock(game, 'BASE', 0)
                simple.mock(game,'terrain', [ 0,-1,-1,
                                             -1,-1,-1,
                                             -1,-1,-1])
                simple.mock(game, 'armies', [2,0,0,
                                             0,0,0,
                                             0,0,0])

            let pf = new PathFinder(game);
            let attacks = new Attacks(game, pf); 

            let indexes = attacks.getArmiesWithMinSize(2, true)

            expect(indexes.length).to.equal(1);
            expect(indexes[0].index).to.equal(0);
            
        })
    })

    describe('expand', () => {

        it('should move off base by default', () => {
            let map = microMap;
            // Mock game object here...
            let game = new Game({}, {}, true)
                simple.mock(game, 'width', map.width)
                simple.mock(game, 'terrain', map.terrain)
                simple.mock(game, 'BASE', 0)
                simple.mock(game,'terrain', [ 0,-1,-1,
                                             -1,-1,-1,
                                             -1,-1,-1])
                simple.mock(game, 'armies', [2,0,0,
                                             0,0,0,
                                             0,0,0])
                simple.mock(game, 'cities', map.cities || [])

            let pf = new PathFinder(game);
            let attacks = new Attacks(game, pf); 

            let move = attacks.expand()

            let acceptableTo = [1,3]

            expect(move.from).to.equal(0);
            expect(acceptableTo.indexOf(move.to)).to.above(-1)
        })

        it('should goto the nearest empty when boardering', () => {
            let map = microMap;
            // Mock game object here...
            let game = new Game({}, {}, true)
                simple.mock(game, 'width', map.width)
                simple.mock(game, 'terrain', map.terrain)
                simple.mock(game, 'BASE', 0)
                simple.mock(game,'terrain', [ 0,-1,-1,
                                             -1,-1,-1,
                                             -1,-1,-1])
                simple.mock(game, 'armies', [2,0,0,
                                             0,0,0,
                                             0,0,0])
                simple.mock(game, 'cities', map.cities || [])

            let pf = new PathFinder(game);
            let attacks = new Attacks(game, pf); 

            let move = attacks.expand()

            let acceptableTo = [1,3]

            expect(move.from).to.equal(0);
            expect(acceptableTo.indexOf(move.to)).to.above(-1)
        })

        it('should select an army that is bordering an empty (default)', () => {
            let map = microMap;
            // Mock game object here...
            let game = new Game({}, {}, true)
                simple.mock(game, 'width', map.width)
                simple.mock(game, 'terrain', map.terrain)
                simple.mock(game, 'BASE', 0)
                simple.mock(game,'terrain', [ 0, 0,-1,
                                              0, 0,-1,
                                             -1,-1,-1])
                simple.mock(game, 'armies', [1,2,0,
                                             1,1,0,
                                             0,0,0])
                simple.mock(game, 'cities', map.cities || [])

            let pf = new PathFinder(game);
            let attacks = new Attacks(game, pf); 

            let move = attacks.expand()

            expect(move.to).to.equal(2);
            expect(move.from).to.equal(1)
        })

        it('should use largest army when using alternate sort', () => {
            let map = microMap;
            // Mock game object here...
            let game = new Game({}, {}, true)
                simple.mock(game, 'width', map.width)
                simple.mock(game, 'terrain', map.terrain)
                simple.mock(game, 'BASE', 0)
                simple.mock(game,'terrain', [ 0, 0, 0,
                                              0, 0, 0,
                                             -1,-1,-1])
                simple.mock(game, 'armies', [3,3,4,
                                             1,1,1,
                                             0,0,0])
                simple.mock(game, 'cities', map.cities || [])

            let pf = new PathFinder(game);
            let attacks = new Attacks(game, pf); 

            let move = attacks.expand(false,2,attacks.largestFirst)

            expect(move.from).to.equal(2)
            expect(move.to).to.equal(5);
        })
    })

    describe('regroup', () => {
        it('should pull from the army at furthest distance first', () => {
            let map = microMap;
            // Mock game object here...
            let game = new Game({}, {}, true)
                simple.mock(game, 'width', map.width)
                simple.mock(game, 'terrain', map.terrain)
                simple.mock(game, 'BASE', 0)
                simple.mock(game,'terrain', [0,0,0,
                                             0,0,0,
                                             0,0,0])
                simple.mock(game, 'armies', [1,1,1,
                                             1,2,4,
                                             1,4,2])
                simple.mock(game, 'cities', map.cities || [])

            let pf = new PathFinder(game);
            let attacks = new Attacks(game, pf); 

            let move = attacks.regroup()

            let acceptableTo = [5,7]

            expect(move.from).to.equal(8);
            expect(acceptableTo.indexOf(move.to)).to.above(-1)
        })

        it('should pass by armies that are lower then the minimum', () => {
            let map = microMap;
            // Mock game object here...
            let game = new Game({}, {}, true)
                simple.mock(game, 'width', map.width)
                simple.mock(game, 'terrain', map.terrain)
                simple.mock(game, 'BASE', 0)
                simple.mock(game,'terrain', [0,0,0,
                                             0,0,0,
                                             0,0,0])
                simple.mock(game, 'armies', [1,1,1,
                                             1,2,4,
                                             1,4,2])
                simple.mock(game, 'cities', map.cities || [])

            let pf = new PathFinder(game);
            let attacks = new Attacks(game, pf); 

            let move = attacks.regroup(game.BASE,5,3)

            let acceptableFrom = [5,7]
            let acceptableTo = [2,4,6]

            expect(acceptableFrom.indexOf(move.from)).to.above(-1)
            expect(acceptableTo.indexOf(move.to)).to.above(-1)
        })

        it('should only pull from our armies', () => {
            let map = microMap;
            // Mock game object here...
            let game = new Game({}, {}, true)
                simple.mock(game, 'width', map.width)
                simple.mock(game, 'terrain', map.terrain)
                simple.mock(game, 'BASE', 0)
                simple.mock(game,'terrain', [0,0,0,
                                             0,0,1,
                                             0,1,1])
                simple.mock(game, 'armies', [1,1,1,
                                             1,2,4,
                                             1,4,2])
                simple.mock(game, 'cities', map.cities || [])

            let pf = new PathFinder(game);
            let attacks = new Attacks(game, pf); 

            let move = attacks.regroup()

            let acceptableTo = [1,3]

            expect(move.from).to.equal(4);
            expect(acceptableTo.indexOf(move.to)).to.above(-1)
        })
    })
});
