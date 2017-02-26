
import { PlayerSettings } from '../config/PlayerSettings';
import { GameSettings } from '../config/GameSettings';
import { Game } from './Game';
/**
 * commander.js
 *
 * Controller for running multiple games in parallell
 */
// should be some config we read the games list from...
new Game(GameSettings, PlayerSettings);

// Handle game win

// Handle game loss (log)

// start another game
