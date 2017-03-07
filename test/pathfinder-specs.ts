
import { Attacks } from "../src/bots/Attacks";
import { Game } from '../src/Game'
import { PathFinder } from '../src/PathFinder'

import * as chai from "chai";
const simple = require('simple-mock')
const expect = chai.expect;

describe("Pathfinder", () => {
    // Mock game object here...
    const map = require('./maps/map4')
    let game = new Game({}, {}, true)
    simple.mock(game, 'width', map.width)
    simple.mock(game, 'terrain', map.terrain)
    simple.mock(game, 'BASE', map.BASE)

    it('should do things...', () => {
      let pf = new PathFinder(game);
      pf.buildAllPaths();
      // pf.buildPath(game.BASE)
      pf.print(game.BASE);
    })

});
