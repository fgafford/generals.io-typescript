# generals.io-typescript

This are my Generals.io bots implemented in TypeScript.

More about generals.io [here](http://dev.generals.io/)

## Structure

These code runs 2 parallel processes. One is dedicated to recieving updates from the server and keeping the game state updated and the other is for the bot to run all its computations. A move is requested from a bot when a new server update has been pushed and the bot has already responded with its previous move request.

[Game.ts](https://github.com/fgafford/generals.io-typescript/blob/master/src/Game.ts) : Handles connecting to server, game updates, and manages game state.

[Commander.ts](https://github.com/fgafford/generals.io-typescript/blob/master/src/Commander.ts) : Bootstrap class

[BotProcess.ts](https://github.com/fgafford/generals.io-typescript/blob/master/src/BotProcess.ts) : wrapper class that handles passing game data from the Game process to the bot and moves back to the Game process.

[bot.ts](https://github.com/fgafford/generals.io-typescript/blob/master/src/bots/bot.ts) : Minimal interface bots must implement

[PathFinder.ts](https://github.com/fgafford/generals.io-typescript/blob/master/src/PathFinder.ts) : Pathfinding class (builds all paths to a given location). Current implementation only includes cities that are already owned by the bot.

## The Bots 

### Curly-pi
[Play record]()


### Installation

To use with node:

$ npm install ramda
Then in the console:

const R = require('ramda');
To use directly in the browser:
