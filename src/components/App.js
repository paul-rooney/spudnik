import React from 'react';
import Header from './Header';
import LogInForm from './LogInForm';
import Arena from './Arena';
import Rules from './Rules';

class App extends React.Component {
  state = {
    users: {},
  }

  addUser = (user) => {
    const users = { ...this.state.users };
    users[`${Date.now()}`] = user;
    this.setState({ users });
  }

  render() {
    return (
      <>
        <Header />
        <LogInForm addUser={this.addUser} />
        <Arena />
        <Rules />
      </>
    );
  }
}

export default App;
