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
        game.AssignPlayerToTeam('Tana', 0);

        const team = game.GetTeam(0);

        Code.expect(team.players.length).to.equal(1);
        Code.expect(team.players[0]).to.equal('Tana');

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can assign player as spymaster', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AssignSpymaster(0, 'Tana');

        const team = game.GetTeam(0);

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

        const teamA = game.GetTeam(0);
        const teamB = game.GetTeam(1);

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

        const teamA = game.GetTeam(0);
        const teamB = game.GetTeam(1);

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

        game.AssignPlayerToTeam('Tana', 0);
        game.AssignPlayerToTeam('Ho-Fan', 0);
        game.AssignPlayerToTeam('Kevin', 1);
        game.AssignPlayerToTeam('Lan', 1);

        game.AssignSpymaster(0, 'Tana');
        game.AssignSpymaster(1, 'Kevin');

        Code.expect(game.IsReadyToStart()).to.equal(true);

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can detect not enough players to start', { parallel: true }, (done) => {

        const game = new Game(0, 'Tana');
        game.AddPlayer('Ho-Fan');
        game.AddPlayer('Kevin');

        game.AssignPlayerToTeam('Tana', 0);
        game.AssignPlayerToTeam('Ho-Fan', 0);
        game.AssignPlayerToTeam('Kevin', 1);

        game.AssignSpymaster(0, 'Tana');
        game.AssignSpymaster(1, 'Kevin');

        Code.expect(game.IsReadyToStart()).to.equal(false);

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can detect spymaster not assigned', { parallel: true }, (done) => {

        const game = new Game(0, 'creator');
        game.AddPlayer('Tana');
        game.AddPlayer('Ho-Fan');
        game.AddPlayer('Kevin');
        game.AddPlayer('Lan');

        game.AssignPlayerToTeam('Tana',0);
        game.AssignPlayerToTeam('Ho-Fan',0);
        game.AssignPlayerToTeam('Kevin',1);
        game.AssignPlayerToTeam('Lan',1);

        game.AssignSpymaster(0, 'Tana');

        Code.expect(game.IsReadyToStart()).to.equal(false);

        done();
    });
});
