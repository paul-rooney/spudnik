const socket = io();

const form = document.querySelector('#form');
const form_input = form.input;
const form_submit = form.submit;
const form_error = form.querySelector('.form__error');
const arena = document.querySelector('#arena');
const launchButton = document.querySelector('#buttonLaunch');

let username;
let connected = false;
let player;

const setUsername = () => {
  if (!form_input.value) {
    displayLoginError('You must enter a username to continue');
    return;
  }

  username = form_input.value.trim();

  if (username) {
    player = new Player(username);
    changeView('B');
  }

  socket.emit('add user', username);
}

const updateArena = (users) => {
  arena.innerHTML = '';

  users.forEach(user => {
    arena.innerHTML += `
      <li id="${user.id}" class="list__item">
        <label>${user.username}
          <input name="arena" type="radio" value="${user.id}">
        </label>
      </li>`;
  });
}

const displayLoginError = (error) => {
  form_error.textContent = error;
}

const startGame = (data) => {
  console.log(data);

  // enable control panel
  
}





// when the server emits 'add user', rebuild the player’s arena UI
socket.on('add user', users => {
  // updateWaitingRoom(users)
  updateArena(users);
});

socket.on('update users', users => {
  updateArena(users);
});

socket.on('return random user', user => {
  let randomUser = arena.querySelector(`#${user.id}`);

  if (randomUser.classList.contains('selected')) return;

  randomUser.classList.add('selected');

  startGame(user);
});





// Event listeners

form.addEventListener('submit', (e) => {
  e.preventDefault();

  setUsername();
});

launchButton.addEventListener('click', () => socket.emit('start game'));




// add to _helpers.js
function changeView(view) {
  document.body.dataset.view = view;
}
