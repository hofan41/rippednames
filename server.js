'use strict';

const App = require('express')();
const GameModule = require('./game');
const Http = require('http').Server(App);
const Io = require('socket.io')(Http);
const Game = GameModule.Game;

const internals = {};

internals.port = process.env.PORT || 3000;
internals.maxGameInstances = 100;
internals.gameInstances = {};
internals.numUsers = 0;

App.get('/', (req, res) => {

    res.sendFile(__dirname + '/html/index.html');
});

Io.on('connection', (socket) => {

    internals.numUsers++;
    socket.username = '';
    socket.gameId = '';

    console.log('User has connected. ' + internals.numUsers + ' user(s) are connected');

    socket.on('disconnect', () => {

        --internals.numUsers;

        // If this socket has been assigned a username and a game:
        if (socket.username !== '' && socket.gameId !== '') {

            // Remove the username from the player list for their game
            internals.gameInstances[socket.gameId].players.delete(socket.username);

            // Get this socket to leave the room it previously joined
            socket.leave(socket.gameId);

            console.log('[' + socket.gameId + '] ' + socket.username + ' left game');

            // If there are no more players in this game instance:
            if (internals.gameInstances[socket.gameId].players.size === 0) {

                // Remove the game
                delete internals.gameInstances[socket.gameId];

                console.log('Removing game ' + socket.gameId);
            }
        }

        console.log('User has disconnected. ' + internals.numUsers + ' user(s) are connected');
    });

    socket.on('create game', (data, callback) => {

        if (data.username === '') {
            callback(failStatus('Invalid username'));
            console.log(data.username + ' is unable to create new game due to invalid username');
            return;
        }

        // If the current number of concurrent game instances has reached the max:
        if (Object.keys(internals.gameInstances) >= internals.maxGameInstances) {
            callback(failStatus('Max concurrent game instances reached'));
            console.log(data.username + ' is unable to create new game');
            return;
        }

        let gameCreated = false;
        let attemptCount = 0;
        const maxAttempts = 10;

        // Loop until a unique gameId is generated or until all attempts have been exhausted:
        do {

            const gameId = getRandomGameId();

            // If the gameId does not already exist:
            if (!internals.gameInstances.hasOwnProperty(gameId)) {

                // Associate this socket with the username and gameId
                socket.username = data.username;
                socket.gameId = gameId;

                internals.gameInstances[gameId] = { players: new Set(), game: new Game(gameId, data.username) };

                // Add the username the players set
                internals.gameInstances[gameId].players.add(data.username);

                // Join this socket to a room identified by the gameId
                socket.join(gameId);

                gameCreated = true;
                break;
            }

            ++attemptCount;
        }
        while (attemptCount < maxAttempts);

        if (gameCreated) {
            callback( { status: 'success', gameId: socket.gameId } );
            console.log(data.username + ' created new game ' + socket.gameId);
        }
        else {
            callback( failStatus('Unable to create new game') );
            console.log(data.username + ' is unable to create new game');
        }
    });

    socket.on('join game', (data, callback) => {

        if (data.username === '') {
            callback(failStatus('Invalid username'));
            console.log(data.username + ' is unable to join game due to invalid username');
            return;
        }

        // If the gameId already exists:
        if (internals.gameInstances.hasOwnProperty(data.gameId)) {

            // If the client's username is a duplicate of another player in this game:
            if (internals.gameInstances[data.gameId].players.has(data.username)) {

                callback(failStatus('Unable to join game due to duplicate username'));
                console.log('[' + data.gameId + '] ' + data.username + ' is unable to join game due to duplicate username');
                return;
            }

            // Associate this socket with the username and gameId
            socket.username = data.username;
            socket.gameId = data.gameId;

            // Add the username the players set
            internals.gameInstances[data.gameId].players.add(data.username);

            // Add a new player to the game
            internals.gameInstances[data.gameId].game.AddPlayer(data.username);

            // Join this socket to a room identified by the gameId
            socket.join(data.gameId);

            callback(successStatus());
            console.log('[' + socket.gameId + '] ' + data.username + ' joined game');
        }
        // Otherwise, the gameId does not exist:
        else {
            callback(failStatus('Nonexistant game ID'));
            console.log(data.username + ' is unable to join nonexistant game ' + data.gameId);
        }
    });

    socket.on('select team', (data, callback) => {

        console.log('[' + socket.gameId + '] ' + socket.username + ' selected to be on ' + data.team + ' team');

        try {
            internals.gameInstances[socket.gameId].game.AssignPlayerToTeam(socket.username, data.team);
            callback(successStatus());
        }
        catch (err) {
            callback(failStatus(err));
            console.log('[' + socket.gameId + '] Error: ' + err);
        }

        Io.to(socket.gameId).emit('update team settings', getTeams(socket.gameId));
    });

    socket.on('select as spymaster', (data, callback) => {

        console.log('[' + socket.gameId + '] ' + socket.username + ' selected to be a spymaster on ' + data.team);

        try {
            internals.gameInstances[socket.gameId].game.AssignSpymaster(socket.username, data.team);
            callback(successStatus());
        }
        catch (err) {
            callback(failStatus(err));
            console.log('[' + socket.gameId + '] Error: ' + err);
        }

        Io.to(socket.gameId).emit('update team settings', getTeams(socket.gameId));
    });

    socket.on('randomize team', (callback) => {

        try {
            internals.gameInstances[socket.gameId].game.AssignTeamsRandomly();
            internals.gameInstances[socket.gameId].game.ChooseSpymasters();
            callback(successStatus());
        }
        catch (err) {
            callback(failStatus(err));
            console.log('[' + socket.gameId + '] Error: ' + err);
        }
        console.log('[' + socket.gameId + '] ' + socket.username + ' randomized the team');

        Io.to(socket.gameId).emit('update team settings', getTeams(socket.gameId));
    });

    socket.on('start game', (data, callback) => {

        // If the minimum requirements to start the game have been met:
        if (internals.gameInstances[socket.gameId].IsReadyToStart()) {

            // Start the game
            internals.gameInstances[socket.gameId].Start();

            callback(successStatus());
            console.log('[' + socket.gameId + '] ' + socket.username + ' started game');

            Io.to(socket.gameId).emit('update game state', getTeams(socket.gameId));
        }
        //Otherwise, the game is not ready to start:
        else {

            callback(failStatus(err));
            console.log('[' + socket.gameId + '] ' + socket.username + ' was unable to start game');
        }
    });

    socket.on('reset game', (data, callback) => {

        callback(successStatus());
        console.log('[' + socket.gameId + '] ' + socket.username + ' reseted game');
        Io.to(socket.gameId).emit('update team settings', getTeams(socket.gameId));
    });

    socket.on('provide clue', (data, callback) => {

        callback(successStatus());
        console.log('[' + socket.gameId + '] ' + socket.username + ' provided clue ' + data.word + ':' + data.count);
        Io.to(socket.gameId).emit('update game state');
    });

    socket.on('select word', (data, callback) => {

        callback(successStatus());
        console.log('[' + socket.gameId + '] ' + socket.username + ' selected word ' + data.word);
        Io.to(socket.gameId).emit('update game state');
    });

    socket.on('pass turn', (data, callback) => {

        callback(successStatus());
        console.log('[' + socket.gameId + '] ' + socket.username + ' passed turn');
        Io.to(socket.gameId).emit('update game state');
    });
});

Http.listen(internals.port, () => {

    console.log('listening on *:' + internals.port);
});

const getTeams = (gameId) => {

    if (!internals.gameInstances.hasOwnProperty(gameId)) {
        console.log('[' + gameId + '] ' + 'Unable to get teams for game');
        return {};
    }

    const teamSettings = { teams: [] };

    for (const team of internals.gameInstances[gameId].game.GetTeams()) {

        const teamObject = { name: team.id, players: team.players, spymaster: team.spymaster };

        teamSettings.teams.push(teamObject);
    }

    return teamSettings;
};

const successStatus = () => {

    return { status: 'success' };
};

const failStatus = (msg) => {

    return { status: 'fail', message: msg };
};

const getRandomGameId = () => {

    let randomGameId = '';
    const possibleChars = 'abcdefghijklmnopqrstuvwxyz';

    for (let i = 0; i < 6; ++i) {
        randomGameId += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
    }

    return randomGameId;
};
