const socket = io();

const form = document.querySelector('#form');
const form_input = form.input;
const form_submit = form.submit;
const form_error = form.querySelector('.form__error');
const arena = document.querySelector('#arena');
const waiting_room = document.querySelector('#waiting-room');

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
    changeView('D');
  }

  socket.emit('add user', username);
}

const buildArena = (users) => {
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

const buildWaitingRoom = (users) => {
  waiting_room.innerHTML = '';

  users.forEach(user => {
    waiting_room.innerHTML += `<li class="list__item">${user.username}</li>`;
  });
}

const displayLoginError = (error) => {
  form_error.textContent = error;
}


// when the server emits 'add user', rebuild the player’s arena UI
socket.on('add user', users => {
  buildWaitingRoom(users)
  buildArena(users);
});

socket.on('update users', users => {
  buildArena(users);
});

socket.on('return random user', user => {
  let randomUser = randomUserarena.querySelector(`#${randomUser.id}`);

  if (randomUser.classList.contains('selected')) return;

  randomUser.classList.add('selected');
});



// Event listeners

form.addEventListener('submit', (e) => {
  e.preventDefault();

  setUsername();
});





// add to _helpers.js
function changeView(view) {
  document.body.dataset.view = view;
}
