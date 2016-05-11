'use strict';

const Fs = require('fs');
const Hoek = require('hoek');

const internals = {};

exports.Player = module.exports.Player = internals.Player = function (id) {

    Hoek.assert(this instanceof internals.Player, 'Player must be instantiated using new');
    this.id = id;
};

exports.Team = module.exports.Team = internals.Team = function (id) {

    Hoek.assert(this instanceof internals.Team, 'Team must be instantiated using new');
    this.id = id;
    this.players = [];
    this.spymaster = null;
};

exports.BoardElement = module.exports.BoardElement = internals.BoardElement = function (value, type) {

    Hoek.assert(this instanceof internals.BoardElement, 'BoardElement must be instantiated using new');
    this.value = value;
    this.type = type;
};

//--    Game
exports.Game = module.exports.Game = internals.Game = function (id, creatorId) {

    Hoek.assert(this instanceof internals.Game, 'Game must be instantiated using new');
    this.id = id;
    this.players = [];
    this.players.push(creatorId);
    this.teams = [new internals.Team('red'), new internals.Team('blue')];  //note hardcoded to 2 teams

    this.NUM_RED_CARDS = 8;
    this.NUM_BLUE_CARDS = 8;
    this.NUM_GRAY_CARDS = 7;
    this.NUM_BLACK_CARDS = 1;
    this.BOARD_SIZE = 25;

    // Define phases of the game
    this.phases = {
        SETUP: 'setup',
        GIVE_CLUE: 'give_clue',
        SELECT_WORD: 'select_word',
        GAME_OVER: 'game_over'
    };

    // Define phases of the game
    this.cardColors = {
        RED: { value: 0, string: 'red' },
        BLUE: { value: 1, string: 'blue' },
        GRAY: { value: 2, string: 'gray' },
        BLACK: { value: 3, string: 'black' },
        NONE: { value: 4, string: 'none' }
    };

    this._LoadWords();
    this._LoadDictionary();

    this.phase = this.phases.SETUP;
    this.activeTeam = this.cardColors.RED.string;
    this.remainingGuesses = 0;
    this.remainingRedCards = 0;
    this.remainingBlueCards = 0;
    this.board = [];
    this.winner = null;
};

internals.Game.prototype.Reset = function () {

    this.players = [];
    this.players.push(creatorId);
    this.teams = [new internals.Team(0), new internals.Team(1)];

    this.phase = this.phases.SETUP;
    this.activeTeam = this.cardColors.RED.string;
    this.remainingGuesses = 0;
    this.remainingRedCards = 0;
    this.remainingBlueCards = 0;
    this.board = [];
    this.winner = null;
};

//--    Game setup
internals.Game.prototype.AddPlayer = function (playerId) {

    // Throw an error if game is not in setup
    if (this.phase !== this.phases.SETUP) {
        throw 'Cannot add player in current phase';
    }

    if (this.players.indexOf(playerId) !== -1) {
        throw playerId + ' is already a player';
    }

    this.players.push(playerId);
};

internals.Game.prototype.RemovePlayer = function (playerId) {

    const indexOfPlayer = this.players.indexOf(playerId);

    // If the player is a current player:
    if (indexOfPlayer !== -1) {
        this.players.slice(index, 1);
    }

    // Loop for each team:
    for (const team of this.teams) {

        const indexOfPlayerInTeam = team.players.indexOf(playerId);

        // If the player is on this team, remove him:
        if (indexOfPlayerInTeam !== -1) {
            team.players.slice(indexOfPlayerInTeam, 1);
        }

        // If the player is the spymaster on this team, remove him:
        if (team.spymaster === playerId) {
            team.spymaster = null;
        }
    }
};

internals.Game.prototype.getPlayers = function () {

    return this.players;
};

internals.Game.prototype.AssignPlayerToTeam = function (playerId, teamId) {

    // Throw an error if playerId is not a current player
    if (this.players.indexOf(playerId) === -1) {
        throw playerId + ' is not a current player';
    }

    // Throw an error if teamId is not a valid team
    if ((teamId !== 0) && (teamId !== 1)) {
        throw teamId + ' is an invalid team';
    }

    // Throw an error if game is not in setup
    if (this.phase !== this.phases.SETUP) {
        throw 'Cannot assign player to team in current phase';
    }

    const otherTeamId = (teamId === 0) ? 1 : 0;    //note: hardcoded to 2 teams
    const index = this.teams[otherTeamId].players.indexOf(playerId);

    // If the player is already on the other team
    if (index !== -1) {

        // Remove player from other team
        this.teams[otherTeamId].players.splice(index, 1);

        // If needed, remove player as other team's spymaster
        if (this.teams[otherTeamId].spymaster === playerId) {
            this.teams[otherTeamId].spymaster = null;
        }
    }

    // Add player to specified team if he is not already on it
    if (this.teams[teamId].players.indexOf(playerId) === -1) {
        this.teams[teamId].players.push(playerId);
    }
};

internals.Game.prototype.AssignTeamsRandomly = function () {

    // Throw an error if game is not in setup
    if (this.phase !== this.phases.SETUP) {
        throw 'Cannot assign teams randomly in current phase';
    }

    this.teams[0] = new internals.Team('red');
    this.teams[1] = new internals.Team('blue');

    const firstTeamSize = Math.floor(this.players.length / 2);

    while (this.teams[0].players.length < firstTeamSize) {
        const randomIndex = Math.floor(Math.random() * this.players.length);
        this.AssignPlayerToTeam(this.players[randomIndex], 0);
    }

    for (const playerId of this.players) {

        // If this player is not on the first team, assign him to the second team:
        if (this.teams[0].players.indexOf(playerId) === -1) {
            this.AssignPlayerToTeam(playerId, 1);
        }
    }
};

internals.Game.prototype.AssignSpymaster = function (teamId, playerId) {

    // Throw an error if game is not in setup
    if (this.phase !== this.phases.SETUP) {
        throw 'Cannot assign spymasters in current phase';
    }

    this.AssignPlayerToTeam(playerId, teamId);
    this.teams[teamId].spymaster = playerId;
};

internals.Game.prototype.ChooseSpymasters = function () {

    // Throw an error if game is not in setup
    if (this.phase !== this.phases.SETUP) {
        throw 'Cannot randomly assign spymasters in current phase';
    }

    if (this.teams[0].players.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.teams[0].players.length);
        this.teams[0].spymaster = this.teams[0].players[randomIndex];
    }

    if (this.teams[1].players.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.teams[1].players.length);
        this.teams[1].spymaster = this.teams[1].players[randomIndex];
    }
};

internals.Game.prototype.GetTeams = function () {

    return this.teams;
};

internals.Game.prototype.GetTeam = function (teamId) {

    // Throw an error if teamId is not a valid team
    if ((teamId !== 0) && (teamId !== 1)) {
        throw teamId + ' is an invalid team';
    }

    return this.teams[teamId];
};


internals.Game.prototype.Start = function () {

    if (this.IsReadyToStart() === false) {
        throw 'Start game requirements has not been met.';
    }

    this._RandomizeBoardWords();
    this._RandomizeBoardMap();

    this.gameStarted = true;
    this.phase = this.phases.GIVE_CLUE;
};

internals.Game.prototype.IsReadyToStart = function () {

    const enoughPlayers = ((this.teams[0].players.length >= 2) && (this.teams[1].players.length >= 2));
    const spymastersAssigned = ((this.teams[0].spymaster !== null) && (this.teams[1].spymaster !== null));

    return (enoughPlayers && spymastersAssigned);
};

internals.Game.prototype.GiveClue = function (playerId, word, count) {

    // Throw an error if playerId is not a current player
    if (this.players.indexOf(playerId) === -1) {
        throw playerId + ' is not a current player';
    }

    // Throw an error if the current phase is not GIVE_CLUE
    if (this.phase !== this.phases.GIVE_CLUE) {
        throw 'Current phase is not \'GIVE CLUE\'';
    }

    // Throw an error if playerId is not spymaster
    if (!this._IsPlayerSpymaster(playerId)) {
        throw playerId + ' is not spymaster';
    }

    // Throw an error if player's team is not active
    if (this._GetTeamIdFromPlayer(playerId) !== this.activeTeam) {
        throw playerId + ' is not on active team';
    }

    // Throw an error if count is invalid
    if (isNaN(count) || count < 0) {
        throw count + ' is invalid value';
    }

    const card = this._GetCardFromWord(word);

    // Throw an error if the clue exists on the board and is not selected:
    if ((card !== null) && (card.selected === false)) {
        throw word + ' cannot be used as a clue';
    }

    // Throw an error if this word is not in the dictionary
    if (!this.dictionary.has(word)) {
        throw word + ' is not in the dictionary';
    }

    this.clue = { wordClue: word, count: count };
    this.remainingGuesses = count;
    this.phase = this.phases.SELECT_WORD;
};

internals.Game.prototype.SelectWord = function (playerId, word) {

    // Throw an error if playerId is not a current player
    if (this.players.indexOf(playerId) === -1) {
        throw playerId + ' is not a current player';
    }

    // Throw an error if the current phase is not GIVE_CLUE
    if (this.phase !== this.phases.SELECT_WORD) {
        throw 'Current phase is not \'SELECT WORD\'';
    }

    // Throw an error if playerId is spymaster
    if (this._IsPlayerSpymaster(playerId)) {
        throw playerId + ' is a spymaster';
    }

    // Throw an error if player's team is not active
    if (this._GetTeamIdFromPlayer(playerId) !== this.activeTeam) {
        throw playerId + ' is not on active team';
    }

    const card = this._GetCardFromWord(word);

    // Throw an error if word does not exist on board
    if (card === null) {
        throw word + ' does not exist on board';
    }

    // Throw an error if word is already selected
    if (card.selected === true) {
        throw word + ' does not exist on board';
    }

    card.selected = true;
    --this.remainingGuesses;

    if (card.color === this.cardColors.RED.string) {
        --this.remainingRedCards;
    }
    else if (card.color === this.cardColors.BLUE.string) {
        --this.remainingBlueCards;
    }

    // If either team has no more cards remaining:
    if ((this.remainingRedCards === 0) || (this.remainingBlueCards === 0)) {

        // Select the winner
        if (this.numRedCardsRemaining === 0) {
            this.winner = this.cardColors.RED.string;
        }
        else {
            this.winner = this.cardColors.BLUE.string;
        }

        // End the game
        this.phase = this.phases.GAME_OVER;
    }
    // Otherwise, if the active team chose the other team's card or a neutral card:
    else if ((card.color === this._GetInactiveTeam()) || (card.color === this.cardColors.GRAY.string)) {

        // End this team's turn
        this.remainingGuesses = 0;
        this.activeTeam = this._GetInactiveTeam();
        this.phase = this.phases.GIVE_CLUE;
    }
    // Otherwise, if the active team chose the assassin:
    else if (card.color === this.cardColors.BLACK.string ) {

        // The other team is automatically the winner
        this.winner = this._GetInactiveTeam();

        this.phase = this.phases.GAME_OVER;
    }
};

internals.Game.prototype.PassTurn = function (playerId) {

    // Throw an error if playerId is not a current player
    if (this.players.indexOf(playerId) === -1) {
        throw playerId + ' is not a current player';
    }

    // Throw an error if the current phase is not GIVE_CLUE
    if (this.phase !== this.phases.SELECT_WORD) {
        throw 'Current phase is not \'SELECT WORD\'';
    }

    // Throw an error if playerId is spymaster
    if (this._IsPlayerSpymaster(playerId)) {
        throw playerId + ' is a spymaster';
    }

    // Throw an error if player's team is not active
    if (this._GetTeamIdFromPlayer(playerId) !== this.activeTeam) {
        throw playerId + ' is not on active team';
    }

    // End this team's turn
    this.remainingGuesses = 0;
    this.activeTeam = this._GetInactiveTeam();
    this.phase = this.phases.GIVE_CLUE;
};

internals.Game.prototype.GetGameState = function () {

    return {
        phase: this.phase,
        activeTeam: this.activeTeam,
        remainingGuesses: this.remainingGuesses,
        remainingRedCards: this.remainingRedCards,
        remainingBlueCards: this.remainingBlueCards,
        board: this.board,
        winner: this.winner
    };
};

internals.Game.prototype._GetTeamIdFromPlayer = function (playerId) {

    for (const team of this.teams) {

        if (team.players.indexOf(playerId) !== -1) {
            return team.id;
        }
    }

    return null;
};

internals.Game.prototype._IsPlayerSpymaster = function (playerId) {

    for (const team of this.teams) {

        if (team.spymaster === playerId) {
            return true;
        }
    }

    return false;
};

internals.Game.prototype._GetCardFromWord = function (word) {

    for (card of this.board) {

        if (card.word === word) {
            return card;
        }
    }

    return null;
};

internals.Game.prototype._GetInactiveTeam = function () {

    const inactiveTeam = (this.activeTeam === 'blue') ? 'red' : 'blue';

    return inactiveTeam;
};

internals.Game.prototype._LoadWords = function () {

    this.words = Fs.readFileSync(__dirname + '/resources/words.txt').toString().replace(/[\r]+/g,'').split('\n');
};

internals.Game.prototype._LoadDictionary = function () {

    this.dictionary = new Set();

    const dictionaryArray = Fs.readFileSync(__dirname + '/resources/dictionary.txt').toString().replace(/[\r]+/g,'').split('\n');

    for (const word of dictionaryArray) {
        this.dictionary.add(word);
    }
};

internals.Game.prototype._RandomizeBoardWords = function () {

    const wordSet = new Set();

    while (this.board.length < this.BOARD_SIZE) {

        const randomIndex = Math.floor(Math.random() * this.words.length);
        const randomWord = this.words[randomIndex];

        if (!wordSet.has(randomWord)) {
            this.board.push({ word: randomWord, color: this.cardColors.NONE.string, selected: false });
            wordSet.add(randomWord);
        }
    }
};

internals.Game.prototype._RandomizeBoardMap = function () {

    let numRedCardsRemaining = this.NUM_RED_CARDS;
    let numBlueCardsRemaining = this.NUM_BLUE_CARDS;
    let numGrayCardsRemaining = this.NUM_GRAY_CARDS;
    let numBlackCardsRemaining = this.NUM_BLACK_CARDS;

    const randomCoin = Math.floor(Math.random() * 2);

    if (randomCoin === 0) {
        ++numRedCardsRemaining;
        this.activeTeam = this.cardColors.RED.string;
    }
    else {
        ++numBlueCardsRemaining;
        this.activeTeam = this.cardColors.BLUE.string;
    }

    this.remainingRedCards = numRedCardsRemaining;
    this.remainingBlueCards = numBlueCardsRemaining;

    for (const card of this.board) {

        if (numRedCardsRemaining > 0) {
            card.color = this.cardColors.RED.string;
            --numRedCardsRemaining;
        }
        else if (numBlueCardsRemaining > 0) {
            card.color = this.cardColors.BLUE.string;
            --numBlueCardsRemaining;
        }
        else if (numGrayCardsRemaining > 0) {
            card.color = this.cardColors.GRAY.string;
            --numGrayCardsRemaining;
        }
        else {
            card.color = this.cardColors.BLACK.string;
            --numBlackCardsRemaining;
        }
    }

    // Shuffle the board again to shuffle the color assignments
    this._ShuffleBoard();
};

internals.Game.prototype._ShuffleBoard = function () {

    for (let i = this.board.length - 1; i > 0; --i) {

        // Add 1 to allow all cards an equal chance of being selected
        const randomIndex = Math.floor(Math.random() * (i + 1));

        // Swap a card at random index with index i
        const tempCard = this.board[i];
        this.board[i] = this.board[randomIndex];
        this.board[randomIndex] = tempCard;
    }
};
