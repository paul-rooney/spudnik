import React from 'react';

class Arena extends React.Component {
  render() {
    return (
      <section id="view-b" className="grid">
        <ul id="arena" className="list">
          <li className="list__item selected">
            <label>Pyotr
              <input name="arena" type="radio" />
            </label>
          </li>
          <li className="list__item">
            <label>Sergei
              <input name="arena" type="radio" />
            </label>
          </li>
          <li className="list__item">
            <label>Ivan
              <input name="arena" type="radio" />
            </label>
          </li>
        </ul>

        <button id="buttonLaunch" type="button">Launch</button>
      </section>
    );
  }
}

export default Arena;
