import React from 'react';
import { Button, Select, Icon } from 'antd';
import { Link } from 'react-router-dom';
import FormTemplate from '../templates/FormTemplate';
import { connect } from 'react-redux';
import AuthGate from '../components/AuthGate';
import { reset } from 'redux-form';

import filch from '../data/filch';

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

const Facility = ({selectedFacility, handleFacilitySelect, handleStateSelect, facilities, states, selectedState}) => {

  return (
    <FormTemplate>
      <AuthGate>
      <div>
        <h1>Select a Facility</h1>
        <div style={{marginBottom: "2rem"}}>
          1) <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select a state"
            onSelect={handleStateSelect}
            value={selectedState.abbrev}
          >
            { Object.keys(states).map(abbrev => {
              return (
                <Select.Option key={abbrev} value={abbrev}>{states[abbrev]} ({abbrev})</Select.Option>
              )
            })}
          </Select>
        </div>
        <div style={{marginBottom: "2rem"}}>
          2) <Select
            showSearch
            style={{ width: 350 }}
            placeholder="Select a facility"
            onChange={handleFacilitySelect(facilities)}
            value={selectedFacility.federalProviderNumber}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            disabled={!selectedState}
          >
            { facilities.map(f => {
              return <Select.Option value={f.federalProviderNumber}>{toTitleCase(f.providerName)}</Select.Option>
            })}
          </Select>
        </div>
        <Button size="large" type="primary"><Link to="/form">Next <Icon type="right" /></Link></Button>
      </div>
      </AuthGate>
    </FormTemplate>
  )
}

const mapStateToProps = state => {
  return {
    selectedFacility: state.facilities.selected,
    facilities: state.facilities.facilities,
    states: state.states.states,
    selectedState: state.states.selected,
  }
};

const mapDispatchToProps = dispatch => {
  return {
    handleStateSelect(state) {

      // Filter facilities by state
      filch('/api/staffing-data?s=' + state)
        .then(res => res.json())
        .then(facilities => {
          dispatch({type: 'SELECT_STATE', state});
          dispatch({type: 'CLEAR_FACILITY'});
          return dispatch({ type: 'LOAD_FACILITIES', facilities});
        });
    },
    handleFacilitySelect(facilities) {
      return (federalProviderNumber) => {
        if(federalProviderNumber) {
          const facility = facilities.find(f => f.federalProviderNumber === federalProviderNumber);
          dispatch({type: 'SELECT_FACILITY', facility});
          dispatch(reset('assumptions'));
        }
      }
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Facility);
