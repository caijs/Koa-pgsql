import React from 'react';
import { Input, Button, Alert } from 'antd';
import SplashTemplate from '../templates/SplashTemplate';
import filch from '../data/filch';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: null,
      password: null,
      loggingIn: false,
      error: null,
    }
    this.handleLogIn = this.handleLogIn.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleLogIn() {
    const { email, password } = this.state;
    if(!email || !password) {
      this.setState({error: 'Both fields are required.'});
    }
    else {
      this.setState({error: null});
      filch('/api/login', {
        method: 'POST',
        body: JSON.stringify({username: email, password}),
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(res => {
        if(res.ok) {
          return res.json();
        }
        throw "Incorrect e-mail or password";
      })
      .then(json => {
        // redirect to facility
        console.log(`-----------${json}-----`);
        return this.props.clearAll();
      })
      .then(() => {
        window.location = '/facility';
      })
      .catch(error => {
        this.setState({error});
      });
    }
  }

  handleChange(field) {
    return (e) => {
      this.setState({[field]: e.target.value});
    };
  }

  render() {
    const { email, password, loggingIn, error } = this.state;
    return (
      <SplashTemplate>
        <h1>Sign in</h1>
        <p>Use the credentials you received from Care Consulting to log in.</p>
        { error && <div style={{marginBottom: "1rem"}}><Alert type="error" message={error} showIcon/></div>}
        <div style={{marginBottom: "1rem"}}>
          <Input placeholder="Your e-mail" style={{width: 300}} value={email} onChange={this.handleChange('email')}/>
        </div>
        <div style={{marginBottom: "1rem"}}>
          <Input type="password" placeholder="Your password" style={{width: 300}} value={password} onChange={this.handleChange('password')}/>
        </div>
        <Button type="primary" onClick={this.handleLogIn}>Log in</Button>
      </SplashTemplate>
    )
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => {
  return {
    clearAll() {
      return dispatch({type: 'CLEAR_ALL'});
    }
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));
