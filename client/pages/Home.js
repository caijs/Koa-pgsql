import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import SplashTemplate from '../templates/SplashTemplate';

export default ({}) => {
  return (
    <SplashTemplate>
      <h1 style={{marginBottom: 0, fontSize: "2.5rem"}}>Healthcare Facility Staffing Analysis</h1>
      <h2 style={{marginBottom: "2rem", color: "#888"}}>by <em>Care Consulting</em></h2>
      <p style={{fontSize: "1rem"}}>Custom analysis to help you understand and optimize your staffing costs.</p>
      <div style={{marginTop: "3rem"}}>
        <Button size="large" type="primary"><Link to="/facility">Get Started</Link></Button>
      </div>
    </SplashTemplate>
  )
}
