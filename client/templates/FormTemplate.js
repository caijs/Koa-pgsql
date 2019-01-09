import React from 'react';
import { connect } from 'react-redux';
import { Layout, Steps, Button } from 'antd';
import { withRouter, Link } from 'react-router-dom';
import filch from '../data/filch';

import LogoutButton from '../components/LogoutButton';
import Radium from 'radium';

const Header = Layout.Header;
const Step = Steps.Step;

const FormTemplate = ({children, location, analysisCompleted, logout}) => {

  let current = 0;
  if(location.pathname === '/form') {
    current = 1;
  }
  else if(location.pathname.indexOf('/analysis') > -1) {
    current = 2;
  }

  const headerStyles = {
    padding: "1rem 3rem",
    color: "white",
    backgroundColor: "#05081c",
    fontSize: "1rem",
    display: "flex",
    justifyContent:"space-between",
    '@media print': {
      display: "none",
    },
  };

  const stepsStyles = {
    padding: "1rem 3rem",
    backgroundColor: "white",
    borderBottom: "1px solid #CCC",
    '@media print': {
      display: "none",
    },
  };

  const containerStyles = {
    padding: "1rem 3rem",
    maxWidth: 1400,
    '@media print': {
      padding: "1rem",
    },
  };

  let analysisTitle = "View Analysis"
  if(analysisCompleted) {
    analysisTitle = (<Link to="/analysis">View Analysis</Link>);
  }
  return (
    <Layout>
      <div className="header" style={headerStyles}>
        <span>Care Consulting: Staffing Analysis</span>
        <LogoutButton />
      </div>
      <div className="steps-bar" style={stepsStyles}>
        <div style={{maxWidth: "700px"}}>
          <Steps current={current}>
            <Step title={(<Link to="/facility">Select a Facility</Link>)} />
            <Step title={(<Link to="/form">Assumptions</Link>)} />
            <Step title={analysisTitle} />
          </Steps>
        </div>
      </div>
      <div className="container" style={containerStyles}>
        { children }
      </div>
    </Layout>
  )
};

const mapStateToProps = state => {
  return {
    analysisCompleted: state.analysis.result.length > 0,
  }
}

export default withRouter(connect(mapStateToProps)(Radium(FormTemplate)));
