const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));

//
// CLASSES
//
class Game {
  constructor() {
    this.liberalPolicyTiles = ['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal'];
    this.fascistPolicyTiles = ['Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist', 'Fascist'];
    this.policyTiles = [...this.liberalPolicyTiles, ...this.fascistPolicyTiles];
    this.policyTilesDrawPile = shuffle(this.policyTiles.slice());
    this.totalPlayers = 0;
    this.liberalPoliciesEnacted = 0;
    this.fascistPoliciesEnacted = 0;
  }

  addPlayerToGame() {
    this.totalPlayers++;

    // if (this.totalPlayers >= 5) {
    if (this.totalPlayers >= 3) { // use some kind of button to begin and run the below fn
      this.assignPlayerRoles();
    }
  }

  removePlayerFromGame() {
    this.totalPlayers--;
  }

  assignPlayerRoles() {
    let partyMembershipDistribution;

////// for debugging/testing purposes only /////////////////////////////////////
    if (this.totalPlayers < 3 || this.totalPlayers > 10) return;

    // log some kind of warning then kill the function
    // if (this.totalPlayers < 5 || this.totalPlayers > 10) {
    //   console.error('There must be between 5 and 10 players to start the game.');
    //   return;
    // }

////// for debugging/testing purposes only /////////////////////////////////////
    // 3 Liberals, 1 Fascist + 1 Hitler
    if (this.totalPlayers === 3) {
      partyMembershipDistribution = ['Liberal', 'Fascist', 'Hitler'];
    }
    // if (this.totalPlayers === 5) {
    //   partyMembershipDistribution = ['Liberal', 'Liberal', 'Liberal', 'Fascist', 'Hitler'];
    // }

    // 4 Liberals, 1 Fascist + 1 Hitler
    if (this.totalPlayers === 6) {
      partyMembershipDistribution = ['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Hitler'];
    }

    // 4 Liberals, 2 Fascists + 1 Hitler
    if (this.totalPlayers === 7) {
      partyMembershipDistribution = ['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Hitler'];
    }

    // 5 Liberals, 2 Fascists + 1 Hitler
    if (this.totalPlayers === 8) {
      partyMembershipDistribution = ['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Hitler'];
    }

    // 5 Liberals, 3 Fascists + 1 Hitler
    if (this.totalPlayers === 9) {
      partyMembershipDistribution = ['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Fascist', 'Hitler'];
    }

    // 6 Liberals, 3 Fascists + 1 Hitler
    if (this.totalPlayers === 10) {
      partyMembershipDistribution = ['Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Liberal', 'Fascist', 'Fascist', 'Fascist', 'Hitler'];
    }

    let randomisedDistribution = shuffle(partyMembershipDistribution.slice());

    players.forEach((player) => {
      let partyMembership = randomisedDistribution.pop();

      if (partyMembership === 'Liberal') player.partyMembership = 'Liberal';
      if (partyMembership === 'Fascist') player.partyMembership = 'Fascist';
      if (partyMembership === 'Hitler') {
        player.partyMembership = 'Fascist';
        player.secretRole = 'Hitler';
      }
    });

    this.startGame();
  }

  drawPolicyTiles(peek) {
    if (this.policyTilesDrawPile.length < 3) {
      this.policyTilesDrawPile = shuffle(this.policyTiles.slice());
    }

    if (peek) {
      let peekedTiles = this.policyTilesDrawPile.splice(-3, 3);
      return peekedTiles; // not working
    }

    return this.policyTilesDrawPile.splice(-3, 3);
  }

  selectFirstPresidentialCandidate() {
    let player = shuffle(players.slice())[0];
    player.isPresidentialCandidate = true;
  }

  startGame() {
    this.selectFirstPresidentialCandidate();
    io.emit('startGame', players);
  }
}

class Election {
  constructor() {
    this.ticker = 0;
    this.failedElections = 0;
    this.votesFor = 0;
    this.votesAgainst = 0;
    this.totalVotes = 0;
    this.votesRequiredToPass = 0;
    this.votePassed = false;
    this.playerVotes = [];
    this.presidentialCandidate = '';
    this.chancellorCandidate = '';
    this.president = '';
    this.chancellor = '';
    this.isIneligibleForChancellorship = false;
  }
}

//
// DOM CACHING
//
const names = [];
const players = [];

let ticker = 0;

//
// INITIALISATION
//
const game = new Game();
const election = new Election();

//
// SOCKET.IO LOGIC
//
io.on('connection', (socket) => {
  let addedUser = false;
  //
  // Joining the game
  //
  socket.on('submitName', (name, callback) => {
    if (addedUser) return;

    // if the name is already in the global players array, return an error message to the client
    if (players.indexOf(name) !== -1) {
      callback(false);
    } else {

      callback(true);
      names.push(name);
      addedUser = true;
      let newPlayer = {
        name: name,
        id: formatUsername(name),
        UID: socket.id,
      };
      players.push(newPlayer);
      game.addPlayerToGame();
    }
  });





  //
  // Election
  //
  socket.on('nominateChancellor', (nominator, nominee, fn) => {
    if (election.isIneligibleForChancellorship !== undefined) {
      if (game.totalPlayers > 5) {
        let ineligibleCandidates = election.isIneligibleForChancellorship;
        for (let i = 0; i < ineligibleCandidates.length; i++) {
          if (nominee === ineligibleCandidates[i]) {
            fn('This person is “term-limited”, and ineligible to be nominated as Chancellor Candidate for this round.');
            return;
          }
        }
      } else {
        if (nominee === election.isIneligibleForChancellorship[0]) {
          // this references the last-elected Chancellor
          fn('This person is “term-limited”, and ineligible to be nominated as Chancellor Candidate for this round.');
          return;
        }
      }
    }

    io.emit('callElection', nominator, nominee);
    election.presidentialCandidate = nominator;
    election.chancellorCandidate = nominee;
  });

  socket.on('returnPlayerVote', (vote, player) => {
    election.votesRequiredToPass = Math.floor(game.totalPlayers / 2 + 1);

    if (vote === 'Ja!') election.votesFor++;
    if (vote === 'Nein.') election.votesAgainst++;

    election.playerVotes.push({
      player: player.name,
      vote: vote,
    });

    election.totalVotes++;

    // Election succeeded
    if (election.votesFor >= election.votesRequiredToPass && election.totalVotes === game.totalPlayers) {
      election.votePassed = true;
      election.president = election.presidentialCandidate;
      election.chancellor = election.chancellorCandidate;
    }

    // Election failed
    if (election.votesFor < election.votesRequiredToPass && election.totalVotes === game.totalPlayers) {
      election.votePassed = false;
      // advance election tracker ↑
      election.president = '';
      election.chancellor = '';

      // Select the next Presidential Candidate
      let i = election.ticker;

      election.presidentialCandidate = players[i].name;

      if (i < players.length - 1) {
        election.ticker++;
      } else {
        election.ticker = 0;
      }
      //

      election.chancellorCandidate = '';

      if (election.failedElections < 2) {
        election.failedElections++; // This will be the third failed attempt
      } else {
        election.failedElections = 0;
        console.log('The country is thrown into chaos.');

        //
        // NOTE: ADD LOGIC FOR COLLAPSED GOVERNMENT HERE
        //
      }
    }

    // Once all votes are in...
    if (election.totalVotes === game.totalPlayers) {
      io.emit('returnElectionResult', election);

      // RESET ELECTION OBJECT
      election.votesFor = 0;
      election.votesAgainst = 0;
      election.totalVotes = 0;
      election.votePassed = false;
      election.playerVotes = [];
      election.presidentialCandidate = '';
      election.chancellorCandidate = '';
      election.isIneligibleForChancellorship = [election.chancellor, election.president];
    }
  });

  socket.on('fascistsWin', () => {
    let msg = 'Hitler has been elected Chancellor after three Fascist Policies have been enacted. \nThe Fascists win.';

    io.emit('gameOver', msg);
  });

  //
  // Legislative Session
  //
  socket.on('drawPolicyTiles', (player) => {
    let policyTiles = game.drawPolicyTiles();
    io.emit('returnPolicyTiles', player, policyTiles);
  });

  socket.on('discardPolicyTile', (policyTile) => {
    io.emit('returnDiscardedPolicyTile', policyTile);
  });

  socket.on('revealPolicyTile', (type) => {
    ticker++;

    io.emit('returnFinalPolicyTile', type);

    // Make sure the enacted Policy is only counted once
    if (ticker === game.totalPlayers) {
      if (type === 'Fascist') game.fascistPoliciesEnacted++;
      if (type === 'Liberal') game.liberalPoliciesEnacted++;
      ticker = 0;

      console.log('new round with new Election');
      // if there are no new powers unlocked then choose the next presidentialCandidate and run the election code
      if (type === 'Liberal' && game.liberalPoliciesEnacted < 5) {
        // Begin a new round with a new Election
        let nextCandidate = players.find((player) => player.isPresidentialCandidate);
        console.log({ nextCandidate });
        io.emit('callNewElection', nextCandidate);
      }

      if (game.players < 6) {
        // for example...
        if (type === 'Fascist' && game.fascistPoliciesEnacted < 2) {
          // consult board to see when first presidential power is unlocked
          // Begin a new round with a new Election
          let nextCandidate = players.find((player) => player.isPresidentialCandidate);
          console.log({ nextCandidate });
          io.emit('callNewElection', nextCandidate);
        }
      }

      if (game.liberalPoliciesEnacted === 5) {
        let msg = 'The government has enacted five Liberal Policies. \nThe Liberals win.';

        io.emit('gameOver', msg);
      }

      if (game.fascistPoliciesEnacted === 6) {
        let msg = 'The government has enacted six Fascist Policies. \nThe Fascists win.';

        io.emit('gameOver', msg);
      }
    }
  });

  //
  // Executive powers
  //
  socket.on('policyPeek', (player) => {
    let policyTiles = game.drawPolicyTiles(true);
    socket.emit('returnPolicyPeek', player, policyTiles);
  });

  socket.on('investigateLoyalty', (target, fn) => {
    let partyMembership;

    for (var i = 0; i < players.length; i++) {
      if (players[i].UID === target) {
        partyMembership = players[i].partyMembership;
        break;
      }
    }

    fn(partyMembership);
  });
});

//
// HELPERS
//
function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue, randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function returnOddOrEven() {
  return Math.round(Math.random());
}

function formatUsername(string) {
  return string.toLowerCase().trim().split(' ').join('-');
}
