import React from 'react';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import filch from '../data/filch';
import { Button } from 'antd';
import { withRouter } from 'react-router-dom';

const LogoutButton = ({logout}) => {
  return (
     <Button icon="logout" size="small" onClick={logout}>Logout</Button>
  )
}

const mapStateToProps = state => ({});
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    logout() {
      return filch('/api/logout', {method:'POST'})
        .then(() => {
          return dispatch({type: 'CLEAR_ALL'});
        })
        .then(() => {
          return dispatch(reset('assumptions')); // clear assumptions form
        })
        .then(() => ownProps.history.push('/login'))
    }
  }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LogoutButton));
