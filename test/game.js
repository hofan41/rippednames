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

        const game = new Game(0, creator);
        Code.expect(game).to.be.an.object();
        Code.expect(game.id).to.equal(0);
        Code.expect(game.players.length).to.equal(1);

        done();
    });
});

lab.experiment('game', { timeout: 1000 }, () => {

    lab.test('can be started', { parallel: true }, (done) => {

        const creator = new Player(0);
        Code.expect(creator.id).to.equal(0); //avoid no-unused vars from lint

        const game = new Game(0, creator);
        Code.expect(game).to.be.an.object();
        Code.expect(game.id).to.equal(0);
        Code.expect(game.players.length).to.equal(1);

        const player1 = new Player(1);
        const player2 = new Player(2);
        const player3 = new Player(3);

        game.AddPlayer(player1.id);
        Code.expect(game.players.length).to.equal(2);
        game.AddPlayer(player2.id);
        Code.expect(game.players.length).to.equal(3);

        //Do a game.Start here and expect an exception to be thrown because not enough players

        game.AddPlayer(player3.id);
        Code.expect(game.players.length).to.equal(4);

        //Do a game.Start here and expect an exception to be thrown because team not assigned

        game.AssignPlayerToTeam(creator.id, 0);
        game.AssignPlayerToTeam(player1.id, 0);
        game.AssignPlayerToTeam(player2.id, 1);
        game.AssignPlayerToTeam(player3.id, 1);

        let teams = game.GetTeams();
        Code.expect(teams[0].players.length).to.equal(2);
        Code.expect(teams[0].players[0]).to.equal(creator.id);
        Code.expect(teams[0].players[1]).to.equal(player1.id);
        Code.expect(teams[1].players.length).to.equal(2);
        Code.expect(teams[1].players[0]).to.equal(player2.id);
        Code.expect(teams[1].players[1]).to.equal(player3.id);

        const player4 = new Player(4);
        game.AddPlayer(player4.id);

        game.AssignTeamsRandomly();
        teams = game.GetTeams();
        Code.expect(teams[0].players.length).to.equal(2);
        Code.expect(teams[1].players.length).to.equal(3);

        //Change team
        game.AssignPlayerToTeam(teams[1].players[2], 0);
        teams = game.GetTeams();
        Code.expect(teams[0].players.length).to.equal(3);
        Code.expect(teams[1].players.length).to.equal(2);

        //Do a game.Start here and expect an exception to be thrown because spy masters not assigned

        teams = game.GetTeams();
        game.AssignSpymaster(0, teams[0].players[0]);
        Code.expect(teams[0].spyMaster).to.equal(teams[0].players[0]);

        game.ChooseSpyMasters();
        teams = game.GetTeams();
        Code.expect(teams[0].players.indexOf(teams[0].spyMaster)).to.not.equal(-1);
        Code.expect(teams[1].players.indexOf(teams[1].spyMaster)).to.not.equal(-1);

        const TYPE_RED_AGENT = 0;
        const TYPE_BLUE_AGENT = 1;
        const TYPE_ASSASSIN = 2;
        const TYPE_CIVILIAN = 3;
        const board = [
            new BoardElement('a', TYPE_RED_AGENT), new BoardElement('b', TYPE_RED_AGENT), new BoardElement('c', TYPE_RED_AGENT), new BoardElement('d', TYPE_RED_AGENT), new BoardElement('e', TYPE_RED_AGENT),
            new BoardElement('f', TYPE_BLUE_AGENT), new BoardElement('g', TYPE_BLUE_AGENT), new BoardElement('h', TYPE_RED_AGENT), new BoardElement('i', TYPE_BLUE_AGENT), new BoardElement('j', TYPE_BLUE_AGENT),
            new BoardElement('', TYPE_ASSASSIN), new BoardElement('', TYPE_CIVILIAN), new BoardElement('', TYPE_CIVILIAN), new BoardElement('', TYPE_CIVILIAN), new BoardElement('', TYPE_CIVILIAN),
            new BoardElement('k', TYPE_RED_AGENT), new BoardElement('l', TYPE_RED_AGENT), new BoardElement('m', TYPE_RED_AGENT), new BoardElement('n', TYPE_RED_AGENT), new BoardElement('o', TYPE_RED_AGENT),
            new BoardElement('p', TYPE_BLUE_AGENT), new BoardElement('q', TYPE_BLUE_AGENT), new BoardElement('r', TYPE_RED_AGENT), new BoardElement('s', TYPE_BLUE_AGENT), new BoardElement('t', TYPE_BLUE_AGENT)
        ];

        game.Start(board);

        done();
    });
});
