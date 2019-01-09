import React from 'react';
import { AuthConsumer } from 'react-check-auth';
import { Spin } from 'antd';
import { Redirect } from 'react-router-dom';

const AuthGate = ({children, admin}) => {
  const redirect = (<Redirect to="/login" />);
  return (
    <AuthConsumer>
      {({userInfo, isLoading, error}) => {
        if(isLoading) {
          return (<Spin size="large"/>)
        }

        if(userInfo && userInfo.user) {
          if(admin && !userInfo.user.admin) { // admin required and user isn't admin
            return redirect;
          }
          return children;
        }
        return redirect;
      }}
    </AuthConsumer>
  )
};

export default AuthGate;
