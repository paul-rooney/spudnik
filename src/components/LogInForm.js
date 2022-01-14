import React from 'react';

class LogInForm extends React.Component {
  render() {
    return (
      <section id="view-a" className="grid">
        <form id="form" className="form" addUser={this.props.addUser}>
          <label className="form__label" htmlFor="form_input">Username</label>
          <input id="form_input" className="form__input" type="text" name="input" placeholder="Sergei Korolev"/>
          <p className="form__error">&nbsp;</p>
          <button className="form__submit" type="submit" name="submit">Submit</button>
        </form>
      </section>
    );
  }
}

export default LogInForm;
