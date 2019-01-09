import React from 'react';
import ReactDOM from 'react-dom';
import './styles/app.css';
import 'antd/dist/antd.css';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from './pages/Home';
import Facility from './pages/Facility';
import Form from './pages/Form';
import Analysis from './pages/Analysis';
import Admin from './pages/Admin';
import Login from './pages/Login';
import FirstReport from './pages/FirstReport'
import SecondReport from './pages/SecondReport'
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import reducer from './masterReducer';

import configureStore from './configureStore';
const {store, persistor} = configureStore();
import { AuthProvider } from 'react-check-auth';
import { StyleRoot } from 'radium';

const root = document.getElementById('react-root');

const App = () => {
  return (
    <AuthProvider authUrl={process.env.NODE_ENV==='development' ? 'http://localhost:3000/api/auth' : '/api/auth'}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <StyleRoot>
            <Router>
              <React.Fragment>
                <Route exact path="/" component={Home} />
                <Route exact path="/facility" component={Facility} />
                <Route exact path="/form" component={Form} />
                <Route exact path="/analysis" component={Analysis} />
                <Route exact path="/admin" component={Admin} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/analysis/firstreport" component={FirstReport} />
                <Route exact path="/analysis/secondreport" component={SecondReport} />
              </React.Fragment>
            </Router>
          </StyleRoot>
        </PersistGate>
      </Provider>
    </AuthProvider>
  );
};

ReactDOM.render(<App />, root);
