class Player {
  constructor(name) {
    this.name = name;
    this.id = formatUsername(name);
    this.isPresidentialCandidate = false;
    this.isPresident = false;
    this.isChancellorCandidate = false;
    this.isChancellor = false;
    this.isIneligibleForChancellorship = false;
  }



  // Election methods
  nominateChancellor() {
    if (!this.isPresidentialCandidate) return;

    let nominator = this.name;
    let nominee = document.querySelector('input[type="radio"]:checked') ? document.querySelector('input[type="radio"]:checked').value : undefined;

    if (!nominee) {
      alert('You must choose a candidate.')
      return;
    }

    socket.emit('nominateChancellor', nominator, nominee, function(data) {
      console.log(data);
    });
  }

  castBallot(nominator, nominee) {
    let vote = confirm(`${nominator === this.name ? 'You have' : nominator + ' has'} nominated ${nominee === this.name ? 'you' : nominee} for the position of Chancellor. \nHow do you vote?`);

    if (vote) {
      return 'Ja!';
    } else {
      return 'Nein.';
    }
  }

  // Legislative session methods
  drawPolicyTiles() {
    // if (!this.isPresident) return;
    if (!this.isPresident) {
      console.warn('Only the President or Chancellor can draw policy tiles.')
      return;
    }

    socket.emit('drawPolicyTiles', player);
  }

  discardPolicyTiles(policyTile) {
    if (!this.isPresident && !this.isChancellor) return;

    socket.emit('discardPolicyTile', policyTile);
  }

  revealPolicyTile(type) {
    socket.emit('revealPolicyTile', type);
  }

  // Executive powers methods
  investigateLoyalty() {
    if (!this.isPresident) return;

    document.addEventListener('click', handleClick, true);

    function handleClick(e) {
      if (!e.target.closest('[data-player]')) return; // returns null

      let target = e.target.closest('[data-player] input').id;

      socket.emit('investigateLoyalty', target, function (data) {
        console.log('Party loyalty: ', data);
      });

      document.removeEventListener('click', handleClick, true);
    }
  }

  callSpecialElection(player) {
    // if (!this.isPresident) return;
    if (!this.isPresident) {
      console.warn('Only the President can use this Executive Power.');
      return;
    }
  }

  policyPeek() {
    // if (!this.isPresident) return;
    if (!this.isPresident) {
      console.warn('Only the President can use this Executive Power.');
      return;
    }

    socket.emit('policyPeek', player);
  }
}

class Liberal extends Player {
  constructor(...args) {
    super(...args);
    this.partyMembership = 'Liberal';
  }
}

class Fascist extends Player {
  constructor(...args) {
    super(...args);
    this.partyMembership = 'Fascist';
  }
}

class Hitler extends Fascist {
  constructor(...args) {
    super(...args);
    this.secretRole = 'Hitler';
  }
}
