const socket = io();

const form = document.querySelector('#form');
const form_input = form.input;
const form_submit = form.submit;
const form_error = form.querySelector('.form__error');
const arena = document.querySelector('#arena');

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

const buildArena = (users) => {
  const list = document.querySelector('ul');
  list.innerHTML = '';

  users.forEach(user => {
    const output = `<li id="${user.id}" class="list__item">
                      <label>${user.username}
                        <input name="arena" type="radio" value="${user.id}">
                      </label>
                    </li>`;
    list.innerHTML += output;
  });
}

const displayLoginError = (error) => {
  form_error.textContent = error;
}


// when the server emits 'add user', rebuild the player’s arena UI
socket.on('add user', users => {
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
