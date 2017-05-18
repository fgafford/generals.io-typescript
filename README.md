# generals.io-typescript

This are my Generals.io bots implemented in TypeScript using general functional programming techniques.

More about generals.io [here](http://dev.generals.io/)

## Flow and Structure

These code runs 2 parallel processes. One is dedicated to recieving updates from the server and keeping the game state updated and the other is for the bot to run all its computations. A move is requested from a bot when a new server update has been pushed and the bot has already responded with its previous move request.

[Game.ts](https://github.com/fgafford/generals.io-typescript/blob/master/src/Game.ts) : Handles connecting to server, game updates, and manages game state.

[Commander.ts](https://github.com/fgafford/generals.io-typescript/blob/master/src/Commander.ts) : Bootstrap class

[BotProcess.ts](https://github.com/fgafford/generals.io-typescript/blob/master/src/BotProcess.ts) : wrapper class that handles passing game data from the Game process to the bot and moves back to the Game process.

[bot.ts](https://github.com/fgafford/generals.io-typescript/blob/master/src/bots/bot.ts) : Minimal interface bots must implement

[PathFinder.ts](https://github.com/fgafford/generals.io-typescript/blob/master/src/PathFinder.ts) : Pathfinding class (builds all paths to a given location). Current implementation only includes cities that are already owned by the bot. The PathFinder class also contains common attack strategies like regrouping or expanding that are fully parameterized for general bot usage.
  
    
## The Bots 
  
### Curly-pi

![Curly Howard](http://famousfamilybirthdaysbiofacts.com/Thumbnail_Small_Images/Curly-Howard-Movie-Actor-birhday.jpg)

[Curly.ts](https://github.com/fgafford/generals.io-typescript/blob/master/src/bots/Curly.ts) | [Game history](http://bot.generals.io/profiles/%5BBot%5D%20Curly-pi)

Curly is a stateless, moderatly conservative bot that take easy avaliable lands and uses a basic regroup strategy for attacking.
  
    
### Larry-pi

![Larry Fine](http://rs77.pbsrc.com/albums/j50/littlesteve69/3%20STOOGES/FineLarry.jpg~c200)

[Larry.ts](https://github.com/fgafford/generals.io-typescript/blob/master/src/bots/Larry.ts) | [Game history](http://bot.generals.io/profiles/%5BBot%5D%20Larry-pi)

Larry is a statefull, highly conservative bot that determins attack and on base defence based on total enemy strength potential.
  
  
### Run Test  
To run tests:   
> $ gulp test
  
  
### Technologies
Requires NodeJS 7.x, PM2, and gulp. 
