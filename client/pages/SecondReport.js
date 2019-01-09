import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { CardGridGroup, CardGroup } from '../components/Cards';
import { getCellIndexColumn, getCellIndexRow} from '../data/sheets';

import { Card, Table, Button, Icon, Row, Col, Divider } from 'antd';
import FormTemplate from '../templates/FormTemplate';
import AuthGate from '../components/AuthGate';
import Radium from 'radium';

import Utils from '../data/utils'

class SecondReport extends React.Component {
    constructor(props) {
      super(props);
    }
    render() {
        const {
            cells,
            selectedFacility
          } = this.props
        
        return (
        <FormTemplate>
            <AuthGate>
                <div style={divStyle}>
                    <Card title={(<span style={{color: "white"}}>Second Report</span>)} headStyle={{backgroundColor: "#3c6fc1", color: "white"}}>
                        <CardGridGroup
                        key = '1'
                        data={[
                            {col1: 'Name of facility', col2: Utils.upperFirstLetter(selectedFacility.providerName) },
                            {col1: 'Facility’s RUGS Mix', col2: cells[getCellIndexRow(16)][getCellIndexColumn("I")],style: {color: "#d44646", fontWeight: "bold"} },
                            {col1: 'National Benchmark for RN Staffing', col2:cells[getCellIndexRow(18)][getCellIndexColumn("J")] + "%" },
                            {col1: 'National Benchmark for Total Staffing', col2: cells[getCellIndexRow(18)][getCellIndexColumn("K")] + "%"}
                        ]}
                        cols={[  
                            { style: {width: '60%'}},
                            { style: {width: '40%'}},
                        ]}
                        />
                    </Card>
                </div>
            </AuthGate>
        </FormTemplate>
        )
    } 
}


const mapStateToProps = state => {
    return {
      cells: state.analysis.result,
      selectedFacility: state.facilities.selected,
    }
}
export default withRouter(connect(mapStateToProps)(Radium(SecondReport)));

const divStyle = {
    margin: '50px',
    width: '700px'
  };