

const socket = io();

// CACHE THE DOM

const form = document.querySelector('#form');
const formInput = form.querySelector('#formInput');
const formSubmit = form.querySelector('#formSubmit');
const drawPolicyTileButton = document.querySelector('#drawPolicyTileButton');
const nominateChancellorButton = document.querySelector('#nominateChancellorButton');
const viewA = document.querySelector('#viewA');
const viewB = document.querySelector('#viewB');
const viewC = document.querySelector('#viewC');
const viewD = document.querySelector('#viewD');
const viewE = document.querySelector('#viewE');
const viewF = document.querySelector('#viewF');
const viewG = document.querySelector('#viewG');
const viewH = document.querySelector('#viewH');
const fascistBoard = document.querySelector('#fascistBoard');
const liberalBoard = document.querySelector('#liberalBoard');
const confirmModal = document.querySelector('#confirmModal');
const openHowToPlayButton = document.querySelector('#openHowToPlayButton');
const closeHowToPlayButton = document.querySelector('#closeHowToPlayButton');
const howToPlay = document.querySelector('#button_howToPlay');
const rules = document.querySelector('.rules');

// VARIABLES

let player = {};

// FUNCTIONS

function submitForm(e) {
  e.preventDefault();

  if (formInput.value === '') {
    alert('You must enter a name.');
  } else {
    let name = formInput.value;

    socket.emit('submitName', name, (data) => {
      if (!data) {
        alert('That name is taken. Please try another name.');
      } else {
        document.body.id = formatUsername(name);
        formInput.value = '';

        document.title = `${name} • Secret Hitler`;
      }
    });
  }

  changeView(viewC);
}

function changeView(element) {
  element.classList.toggle('is-in-view');
}

function nominateChancellor() {
  if (!player.nominateChancellor) return; // can probably be avoided with clever use of CSS

  player.nominateChancellor();
}

function printPlayersList(players) {
  if (players.length <= 6 && player.partyMembership === 'Fascist') document.body.classList.add('is-fascist'); // Hitler knows who the Fascist is if six or fewer players
  if (player.partyMembership === 'Fascist' && !player.secretRole) document.body.classList.add('is-fascist');

  let output = [];

  players.forEach((player) => {
    let markup = `<div data-player="${player.id}" style="border: 1px solid; margin-bottom: 8px;">
                    <label for="${player.UID}">${player.id === document.body.id ? 'You' : player.name}</label>
                    <input id="${player.UID}" name="player-list" type="radio" value="${player.name}" ${player.id === document.body.id ? 'disabled' : ''}>
                    <small class="party-membership">${player.secretRole ? player.secretRole : player.partyMembership}</small>
                    <strong><small data-role-container>${player.isPresidentialCandidate ? 'Presidental Candidate' : ''}</small></strong>
                  </div>`;

    output.push(markup);
  });

  viewC.innerHTML = output.join('');
}

function printElectionResult(election) {
  let output = [];

  election.playerVotes.forEach((playerVote) => {
    let markup = `<div style="border: 1px solid; margin-bottom: 8px;">
                    <p>${playerVote.player} voted:<br>
                    ${playerVote.vote}</p>
                  </div>`;

    output.push(markup);
  });

  viewE.innerHTML = output.join('');
}

function assignPlayerRoles(players) {
  for (var i = 0; i < players.length; i++) {
    if (players[i].id === document.body.id) {
      if (players[i].partyMembership === 'Liberal') {
        player = new Liberal(players[i].name);
      } else if (players[i].secretRole === 'Hitler') {
        player = new Hitler(players[i].name);
      } else {
        player = new Fascist(players[i].name);
      }

      if (players[i].isPresidentialCandidate) player.isPresidentialCandidate = true;

      break;
    }
  }
}

// Legislative session
function drawPolicyTiles() {
  if (!player.drawPolicyTiles) return; // can probably be avoided with clever use of CSS

  player.drawPolicyTiles();
}

function printPolicyTiles(policyTiles, visibleToChancellor) {
  let output = [];

  if (visibleToChancellor) {
    policyTiles.forEach((policyTile) => {
      let markup = `<div data-party="${policyTile}" style="border: 1px solid; margin-bottom: 8px;">
                      <p>${player.isChancellor ? policyTile : 'Policy Tile'}</p>
                      ${player.isChancellor ? '<button data-discard type="button">Discard</button>' : ''}
                    </div>`;

      output.push(markup);
    });
  } else {
    policyTiles.forEach((policyTile) => {
      let markup = `<div data-party="${policyTile}" style="border: 1px solid; margin-bottom: 8px;">
                      <p>${player.isPresident ? policyTile : 'Policy Tile'}</p>
                      ${player.isPresident ? '<button data-discard type="button">Discard</button>' : ''}
                    </div>`;

      output.push(markup);
    });
  }

  viewD.innerHTML = output.join('');
}

function addTileToBoard(type) {
  let output = [];
  let markup = `<div style="border: 1px solid ${type === 'Liberal' ? '' : '#FF0000'};">
                  <p>${type}</p>
                </div>`;

  console.log(markup); // this is adding all three players' markup to each player's board

  output.push(markup);

  viewD.innerHTML = output.join('');
  if (type === 'Liberal') {
    liberalBoard.querySelector('span').innerHTML += output.join('');
  } else {
    fascistBoard.querySelector('span').innerHTML += output.join('');
  }
}

function discardPolicyTiles(e) {
  if (!e.target.matches('button[data-discard]')) return;

  let policyTile = e.target.parentNode.dataset.party;

  player.discardPolicyTiles(policyTile);
}

function revealPolicyTile(type) {
  player.revealPolicyTile(type);
}

function toggleHowToPlay() {
  rules.classList.toggle('is-in-view');
}

// EVENT HANDLERS

form.addEventListener('submit', submitForm);
// drawPolicyTileButton.addEventListener('click', drawPolicyTiles);
// nominateChancellorButton.addEventListener('click', nominateChancellor);
viewD.addEventListener('click', discardPolicyTiles);
// openHowToPlayButton.addEventListener('click', showHowToPlay);

document.body.addEventListener('click', (e) => {
  if (e.target === drawPolicyTileButton) drawPolicyTiles();
  if (e.target === nominateChancellorButton) nominateChancellor();
  // if (e.target === viewD) discardPolicyTiles();
  // if (e.target === openHowToPlayButton || e.target === closeHowToPlayButton) toggleHowToPlay();
  if (e.target === button_howToPlay) toggleHowToPlay();
});

// SOCKET EVENTS

socket.on('startGame', (players) => {
  assignPlayerRoles(players);
  printPlayersList(players);
});

// Election events
socket.on('callElection', (nominator, nominee) => {
  let vote = player.castBallot(nominator, nominee);
  socket.emit('returnPlayerVote', vote, player);
});

socket.on('returnElectionResult', (election) => {
  printElectionResult(election);
  console.log(election);

  // ELECTION FAILED
  if (!election.votePassed) {
    console.log(
      `The election failed. \nThe presidential candidacy passes to the next player, ${election.presidentialCandidate}.`
    );

    let containers = document.querySelectorAll('[data-role-container]');
    containers.forEach((container) => (container.textContent = ''));

    let containerToUpdate = document.querySelector(`input[value="${election.presidentialCandidate}"]`).parentNode;
    containerToUpdate.querySelector('[data-role-container]').textContent = 'Presidental Candidate';

    if (player.name === election.presidentialCandidate) {
      player.isPresidentialCandidate = true;
    } else {
      player.isPresidentialCandidate = false;
    }
  }

  // ELECTION SUCCEEDED
  if (election.votePassed) {
    let containers = document.querySelectorAll('[data-role-container]');
    containers.forEach((container) => (container.textContent = ''));

    let containerToUpdate = document.querySelector(`input[value="${election.president}"]`).parentNode;
    document.querySelector(`input[value="${election.president}"]`).setAttribute('disabled', 'true');
    containerToUpdate.querySelector('[data-role-container]').textContent = 'President';

    containerToUpdate = document.querySelector(`input[value="${election.chancellor}"]`).parentNode;
    document.querySelector(`input[value="${election.chancellor}"]`).setAttribute('disabled', 'true');
    containerToUpdate.querySelector('[data-role-container]').textContent = 'Chancellor';

    if (player.name === election.presidentialCandidate) {
      console.log('You are the President.');
      player.isPresidentialCandidate = false;
      player.isPresident = true;
    }

    if (player.name === election.chancellorCandidate) {
      if (player.secretRole === 'Hitler' && election.fascistPoliciesEnacted === 3) socket.emit('fascistsWin');

      console.log('You are the Chancellor.');
      player.isChancellorCandidate = false;
      player.isChancellor = true;
    }
  }
});

socket.on('gameOver', (msg) => {
  alert(msg);
});

socket.on('callNewElection', (nextCandidate) => {
  console.log(nextCandidate);
});

// Legislative session events
socket.on('returnPolicyTiles', (player, policyTiles) => {
  console.log(`${player.id === document.body.id ? 'You' : player.name} drew ${formatArray(policyTiles)} Policy tiles.`);
  printPolicyTiles(policyTiles, false);
});

socket.on('returnDiscardedPolicyTile', (policyTile) => {
  let node = document.querySelector(`[data-party="${policyTile}"]`);

  viewD.removeChild(node);

  let remainingTilesArray = Array.from(document.querySelectorAll('[data-party]'));
  let remainingTiles = remainingTilesArray.map((tile) => tile.dataset.party);

  if (remainingTiles.length === 1) {
    let type = remainingTiles[0];
    revealPolicyTile(type);
    return;
  }

  printPolicyTiles(remainingTiles, true);
});

socket.on('returnFinalPolicyTile', (type) => {
  addTileToBoard(type);
});

// Executive Power events
socket.on('returnPolicyPeek', (player, policyTiles) => {
  console.log(formatArray(policyTiles));
});

socket.on('investigateLoyalty', (caller, target) => {
  if (target !== document.body.id) return;

  let loyalty = player.revealLoyalty();

  socket.emit('revealLoyalty', caller, loyalty);
});

socket.on('revealLoyalty', (caller, loyalty) => {
  if (caller.id !== document.body.id) return;

  console.log({ caller, loyalty });
});

// HELPERS

function formatUsername(string) {
  return string.toLowerCase().trim().split(' ').join('-');
}

function formatArray(array) {
  if (array.length > 1) {
    return `${array.slice(0, -1).join(', ')}, and ${array.slice(-1)}`;
  } else {
    return array;
  }
}
