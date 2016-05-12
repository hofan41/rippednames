'use strict';

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const GameModule = require('../game');
const Player = GameModule.Player;
const Game = GameModule.Game;
const BoardElement = GameModule.BoardElement;

lab.experiment('player', { timeout: 1000 }, () => {

    lab.test('can be instantiated', { parallel: true }, (done) => {

        const player = new Player(0);
        Code.expect(player).to.be.an.object();
        Code.expect(player.id).to.equal(0);
        done();
    });
});

lab.experiment('boardElement', { timeout: 1000 }, () => {

    lab.test('can be instantiated', { parallel: true }, (done) => {

        const boardElement = new BoardElement('a', 0);
        Code.expect(boardElement).to.be.an.object();
        Code.expect(boardElement.value).to.equal('a');
        Code.expect(boardElement.type).to.equal(0);
        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can be instantiated', { parallel: true }, (done) => {

        const creator = new Player(0);
        Code.expect(creator.id).to.equal(0); //avoid no-unused vars from lint

        const game = new Game(0, creator.id);
        Code.expect(game).to.be.an.object();
        Code.expect(game.id).to.equal(0);
        Code.expect(game.players.length).to.equal(1);

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can add create game with 1 player', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');

        const players = game.getPlayers();

        Code.expect(players.length).to.equal(1);
        Code.expect(players[0]).to.equal('Tana');

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can add new players', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AddPlayer('Benson');

        const players = game.getPlayers();

        Code.expect(players.length).to.equal(2);
        Code.expect(players.indexOf('Tana')).to.not.equal(-1);
        Code.expect(players.indexOf('Benson')).to.not.equal(-1);

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can assign players to team', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AssignPlayerToTeam('Tana', 'red');

        const team = game.GetTeam('red');

        Code.expect(team.players.length).to.equal(1);
        Code.expect(team.players[0]).to.equal('Tana');

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can assign player as spymaster', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AssignSpymaster('Tana', 'red');

        const team = game.GetTeam('red');

        Code.expect(team.players.length).to.equal(1);
        Code.expect(team.players[0]).to.equal('Tana');
        Code.expect(team.spymaster).to.equal('Tana');

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can assign players to random teams', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AddPlayer('Ho-Fan');
        game.AddPlayer('Kevin');
        game.AddPlayer('Lan');
        game.AddPlayer('Benson');

        game.AssignTeamsRandomly();

        const teamA = game.GetTeam('red');
        const teamB = game.GetTeam('blue');

        Code.expect(teamA.players.length + teamB.players.length).to.equal(5);
        Code.expect((teamA.players.indexOf('Tana') !== -1) || (teamB.players.indexOf('Tana') !== -1)).to.equal(true);
        Code.expect((teamA.players.indexOf('Ho-Fan') !== -1) || (teamB.players.indexOf('Ho-Fan') !== -1)).to.equal(true);
        Code.expect((teamA.players.indexOf('Kevin') !== -1) || (teamB.players.indexOf('Kevin') !== -1)).to.equal(true);
        Code.expect((teamA.players.indexOf('Lan') !== -1) || (teamB.players.indexOf('Lan') !== -1)).to.equal(true);
        Code.expect((teamA.players.indexOf('Benson') !== -1) || (teamB.players.indexOf('Benson') !== -1)).to.equal(true);

        done();
    });
});


lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can assign random spymasters after team selection', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AddPlayer('Ho-Fan');
        game.AddPlayer('Kevin');
        game.AddPlayer('Lan');
        game.AddPlayer('Benson');

        game.AssignTeamsRandomly();
        game.ChooseSpymasters();

        const teamA = game.GetTeam('red');
        const teamB = game.GetTeam('blue');

        Code.expect(teamA.spymaster).to.not.equal(null);
        Code.expect(teamB.spymaster).to.not.equal(null);
        Code.expect(teamA.spymaster).to.not.equal(teamB.spymaster);

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can detect valid team setup', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AddPlayer('Ho-Fan');
        game.AddPlayer('Kevin');
        game.AddPlayer('Lan');

        game.AssignPlayerToTeam('Tana', 'red');
        game.AssignPlayerToTeam('Ho-Fan', 'red');
        game.AssignPlayerToTeam('Kevin', 'blue');
        game.AssignPlayerToTeam('Lan', 'blue');

        game.AssignSpymaster('Tana', 'red');
        game.AssignSpymaster('Kevin', 'blue');

        Code.expect(game.IsReadyToStart()).to.equal(true);

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can detect not enough players to start', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AddPlayer('Ho-Fan');
        game.AddPlayer('Kevin');

        game.AssignPlayerToTeam('Tana', 'red');
        game.AssignPlayerToTeam('Ho-Fan', 'red');
        game.AssignPlayerToTeam('Kevin', 'blue');

        game.AssignSpymaster('Tana', 'red');
        game.AssignSpymaster('Kevin', 'blue');

        Code.expect(game.IsReadyToStart()).to.equal(false);

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can detect spymaster not assigned', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AddPlayer('Ho-Fan');
        game.AddPlayer('Kevin');
        game.AddPlayer('Lan');

        game.AssignPlayerToTeam('Tana', 'red');
        game.AssignPlayerToTeam('Ho-Fan', 'red');
        game.AssignPlayerToTeam('Kevin', 'blue');
        game.AssignPlayerToTeam('Lan', 'blue');

        game.AssignSpymaster('Tana', 'red');

        Code.expect(game.IsReadyToStart()).to.equal(false);

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can receive clue from spymaster', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AddPlayer('Ho-Fan');
        game.AddPlayer('Kevin');
        game.AddPlayer('Lan');

        game.AssignPlayerToTeam('Tana', 'red');
        game.AssignPlayerToTeam('Ho-Fan', 'red');
        game.AssignPlayerToTeam('Kevin', 'blue');
        game.AssignPlayerToTeam('Lan', 'blue');

        game.AssignSpymaster('Tana', 'red');
        game.AssignSpymaster('Kevin', 'blue');

        game.Start();

        const activeTeam = game.GetGameState().activeTeam;

        if (activeTeam === 'red') {
            game.GiveClue('Tana', 'node', 1);
        }
        else {
            game.GiveClue('Kevin', 'node', 1);
        }

        const clue = game.GetGameState().clue;

        Code.expect(clue.word).to.equal('node');
        Code.expect(clue.count).to.equal(1);

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can receive correct guess from player', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AddPlayer('Ho-Fan');
        game.AddPlayer('Kevin');
        game.AddPlayer('Lan');

        game.AssignPlayerToTeam('Tana', 'red');
        game.AssignPlayerToTeam('Ho-Fan', 'red');
        game.AssignPlayerToTeam('Kevin', 'blue');
        game.AssignPlayerToTeam('Lan', 'blue');

        game.AssignSpymaster('Tana', 'red');
        game.AssignSpymaster('Kevin', 'blue');

        game.Start();

        const oldActiveTeam = game.GetGameState().activeTeam;
        let playerGivingClue = '';
        let playerGuessing = '';

        if (oldActiveTeam === 'red') {
            playerGivingClue = 'Tana';
            playerGuessing = 'Ho-Fan';
        }
        else {
            playerGivingClue = 'Kevin';
            playerGuessing = 'Lan';
        }

        game.GiveClue(playerGivingClue, 'node', 1);

        let board = game.GetGameState().board;
        let chosenWord = '';

        for (const card of board) {
            if ((card.selected === false) && (card.color === oldActiveTeam)) {
                chosenWord = card.word;
                game.SelectWord(playerGuessing, chosenWord);
                break;
            }
        }

        board = game.GetGameState().board;

        for (const card of board) {
            if (chosenWord === card.word) {
                Code.expect(card.selected).to.equal(true);
                break;
            }
        }

        const newActiveTeam = game.GetGameState().activeTeam;

        Code.expect(newActiveTeam).to.not.equal(oldActiveTeam);

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can receive incorrect (neutral) guess from player', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AddPlayer('Ho-Fan');
        game.AddPlayer('Kevin');
        game.AddPlayer('Lan');

        game.AssignPlayerToTeam('Tana', 'red');
        game.AssignPlayerToTeam('Ho-Fan', 'red');
        game.AssignPlayerToTeam('Kevin', 'blue');
        game.AssignPlayerToTeam('Lan', 'blue');

        game.AssignSpymaster('Tana', 'red');
        game.AssignSpymaster('Kevin', 'blue');

        game.Start();

        const oldActiveTeam = game.GetGameState().activeTeam;
        let playerGivingClue = '';
        let playerGuessing = '';

        if (oldActiveTeam === 'red') {
            playerGivingClue = 'Tana';
            playerGuessing = 'Ho-Fan';
        }
        else {
            playerGivingClue = 'Kevin';
            playerGuessing = 'Lan';
        }

        game.GiveClue(playerGivingClue, 'node', 1);

        const board = game.GetGameState().board;

        for (const card of board) {
            if ((card.selected === false) && (card.color === 'gray')) {
                game.SelectWord(playerGuessing, card.word);
                break;
            }
        }

        const newActiveTeam = game.GetGameState().activeTeam;

        Code.expect(newActiveTeam).to.not.equal(oldActiveTeam);

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can receive assassin guess from player', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AddPlayer('Ho-Fan');
        game.AddPlayer('Kevin');
        game.AddPlayer('Lan');

        game.AssignPlayerToTeam('Tana', 'red');
        game.AssignPlayerToTeam('Ho-Fan', 'red');
        game.AssignPlayerToTeam('Kevin', 'blue');
        game.AssignPlayerToTeam('Lan', 'blue');

        game.AssignSpymaster('Tana', 'red');
        game.AssignSpymaster('Kevin', 'blue');

        game.Start();

        const activeTeam = game.GetGameState().activeTeam;
        let playerGivingClue = '';
        let playerGuessing = '';

        if (activeTeam === 'red') {
            playerGivingClue = 'Tana';
            playerGuessing = 'Ho-Fan';
        }
        else {
            playerGivingClue = 'Kevin';
            playerGuessing = 'Lan';
        }

        game.GiveClue(playerGivingClue, 'node', 1);

        const board = game.GetGameState().board;

        for (const card of board) {
            if ((card.selected === false) && (card.color === 'black')) {
                game.SelectWord(playerGuessing, card.word);
                break;
            }
        }

        const phase = game.GetGameState().phase;
        const winner = game.GetGameState().winner;

        Code.expect(phase).to.equal('game_over');
        Code.expect(winner).to.not.equal(activeTeam);

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can receive pass turn from player', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AddPlayer('Ho-Fan');
        game.AddPlayer('Kevin');
        game.AddPlayer('Lan');

        game.AssignPlayerToTeam('Tana', 'red');
        game.AssignPlayerToTeam('Ho-Fan', 'red');
        game.AssignPlayerToTeam('Kevin', 'blue');
        game.AssignPlayerToTeam('Lan', 'blue');

        game.AssignSpymaster('Tana', 'red');
        game.AssignSpymaster('Kevin', 'blue');

        game.Start();

        const oldActiveTeam = game.GetGameState().activeTeam;
        let playerGivingClue = '';
        let playerGuessing = '';

        if (oldActiveTeam === 'red') {
            playerGivingClue = 'Tana';
            playerGuessing = 'Ho-Fan';
        }
        else {
            playerGivingClue = 'Kevin';
            playerGuessing = 'Lan';
        }

        game.GiveClue(playerGivingClue, 'node', 1);
        game.PassTurn(playerGuessing);

        const newActiveTeam = game.GetGameState().activeTeam;

        Code.expect(newActiveTeam).to.not.equal(oldActiveTeam);

        done();
    });
});
