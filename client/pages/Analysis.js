import React from 'react';
import { connect } from 'react-redux';
import FormTemplate from '../templates/FormTemplate';
import { Card, Table, Button, Icon, Row, Col, Divider } from 'antd';
import { getCellVal, offsetLabel } from '../data/sheets';
import { CardGridGroup, CardGroup } from '../components/Cards';
import { withRouter, Link } from 'react-router-dom';
import InfoTip from '../components/InfoTip';
import AuthGate from '../components/AuthGate';
import Radium from 'radium';

const printHide = {
  '@media print': {
    display: 'none',
  },
};

const decimal = (num) => {
  if(num === null) {
    num = 0;
  }
  const numericVal = parseFloat(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  if(num < 0) {
    return '(' + numericVal.substr(1) + ')';
  }
  return numericVal;
}

const requiredStaffingColumns = [
  // { title: '', dataIndex: 'starNumberLabel', key: 'starNumberLabel' },
  { title: '', dataIndex: 'lineItem', key: 'lineItem' },
  { title: (<span>CNA <InfoTip text='Required CNA hours may be reduced from the "Internal staffing requirement" to offset an increase in RN hours above the Internal staffing requirement.' /></span>), dataIndex: 'cna', key: 'cna' },
  { title: (<span>LPN <InfoTip text='Required LPN hours may be reduced from the "Internal staffing requirement" to offset an increase RN hours above the Internal staffing requirement.' /></span>), dataIndex: 'lpn', key: 'lpn' },
  { title: 'RN', dataIndex: 'rn', key: 'rn' },
  { title: 'Total', dataIndex: 'total', key: 'total'},
];

const RequirementsTable = ({staffing, overall, ...props}) => {
  return (
    <div style={{marginTop: "1.5rem"}}>
      <h3>In Order to attain a <span style={{color: "red"}}>{staffing} star staffing</span> rating (resulting in a <span style={{color: "violet"}}>{overall} star overall</span> rating) you will need:</h3>
      <Table
        size="small"
        pagination={false}
        columns={requiredStaffingColumns}
        {...props}
      />
    </div>
  )
};

class Analysis extends React.Component {
  constructor(props) {
    super(props);
    this.gotoFirstReport = this.gotoFirstReport.bind(this);
    this.gotoSecondReport = this.gotoSecondReport.bind(this);
  }
  gotoFirstReport() {
    // window.location = '/analysis/firstreport';
    this.props.history.push("/analysis/firstreport");
  }
  gotoSecondReport() {
    // window.location = '/analysis/secondreport';
    this.props.history.push("/analysis/secondreport");
  }
  componentWillMount() {
    if(this.props.cells.length === 0) {
      this.props.history.push('/form');
    }
  }

  render() {
    const { cells } = this.props;
    if(cells.length === 0) {
      return <span></span>
    }

    const gC = getCellVal(cells, offsetLabel);
    const dec = key => decimal(gC(key))

    return (
      <FormTemplate>
        <AuthGate>
        <div>
          <CardGroup>
            <Row gutter={8}>
              <Col span={8}><Card title={(<span style={{color: "white"}}>Current Star rating </span>)} headStyle={{backgroundColor: "#264985", color: "white"}}>

                <CardGridGroup
                  data={[
                    {col1: 'Quality Measures', col2: gC('qualityMeasures')},
                    {col1: 'Health Inspection', col2: gC('healthInspection')},
                    {col1: 'Staffing', col2: gC('staffing'), style: {color: "#d44646", fontWeight: "bold"}},
                    {col1: 'Overall Rating', col2: gC('overall'), style: {borderTop: "1px solid #AAA", backgroundColor: "#EEE", fontWeight: "bold"}},
                  ]}
                  cols={[
                    { style: {width: '75%'}},
                    { style: {width: '25%'}},
                  ]}
                />
              </Card></Col>
              <Col span={16}><Card title={(<span style={{color: "white"}}>Current Staffing</span>)} headStyle={{backgroundColor: "#3c6fc1"}}>
                <p>
                  These numbers are based on the staffing and census data from the quarterly PBJ submission for the <strong>{gC("latestPeriod")}</strong>, and are the basis for the current star rating.
                  <InfoTip text="These amounts include only hours worked and paid as per PBJ guidelines; it does not include paid time off such as sick and personal days, or lunchbreaks. It also does not include any unpaid worked hours." />
                </p>
                <Table
                  size="small"
                  pagination={false}
                  dataSource={[
                    {
                      key: 1,
                      label: 'Hours PPD',
                      cna: dec('currentCnaPPD'),
                      lpn: dec('currentLpnPPD'),
                      rn: dec('currentRnPPD'),
                      total: dec('currentPPDTotal'),
                    },
                    {
                      key: 2,
                      label: (<span># of employees per day <InfoTip text='This is the total number of eight-hour nursing shifts per day for the facility based on the facilitys census. The eight hour shifts would include any paid meal breaks (but not unpaid breaks).' /></span>),
                      cna: dec('currentCnaEmp'),
                      lpn: dec('currentLpnEmp'),
                      rn: dec('currentRnEmp'),
                      total: dec('totalEmp')
                    },
                  ]}
                  columns = {
                    [
                      {title: '', dataIndex: 'label', key: 'label'},
                      {
                        title: (<span>CNA <InfoTip text="CNAs includes aides in training and medication aides/technicians (PBJ Job codes 10, 11 & 12)" /></span>),
                        dataIndex: 'cna',
                        key: 'cna',
                      },
                      {
                        title: (<span>LPN <InfoTip text="LPNs includes LVNs and LPNs/LVNs with administrative duties (PBJ Job codes 8 & 9)" /></span>),
                        dataIndex: 'lpn',
                        key: 'lpn',
                      },
                      {
                        title: (<span>RN <InfoTip text="RNs includes DON and other RNs with administrative duties (PBJ Job codes 5, 6 & 7)" /></span>),
                        dataIndex: 'rn',
                        key: 'rn',
                      },
                      {
                        title: 'Total',
                        dataIndex: 'total',
                        key: 'total',
                      },
                    ]
                  }
                />

              </Card></Col>
            </Row>
            <Row gutter={8}>
              <Col span={8} xs={{span:24}} lg={{span: 8}}><Card title={(<span style={{color: "white"}}>Next Overall Star rating <InfoTip text="This calculation assumes that your health Inspection and Quality Measures ratings remains the same." /></span>)} headStyle={{backgroundColor: "#2c714e"}}>
                <div style={{maxWidth: "700px", margin: "0 auto"}}>
                  <CardGridGroup
                    data={[
                      {col1: 'If your Staffing rating will be:', col2: 'Your Overall rating will be:', style: {fontWeight: "bold"}},
                      {col1: 1, col2: gC('overallRating1')},
                      {col1: 2, col2: gC('overallRating2')},
                      {col1: 3, col2: gC('overallRating3')},
                      {col1: 4, col2: gC('overallRating4')},
                      {col1: 5, col2: gC('overallRating5')},
                    ]}
                    cols={[
                      { style: {width: '50%', textAlign: "center", backgroundColor: "#FAFAFA"}},
                      { style: {width: '50%', textAlign: "center", color: "#2F704F"}},
                    ]}
                  />
                </div>
              </Card></Col>
              <Col lg={{span: 16}} xs={{span: 24}}>
              <Card title={(<span style={{color: "white"}}>Required staffing to attain respective star rating <InfoTip text='"Required Staffing" for each specific discipline will not be lower than the "Internal staffing requirement" entered.' /></span>)} headStyle={{backgroundColor: "#40996b"}}>
                <p><strong>Note:</strong> Hours PPD Do not include PTO or lunchbreaks.</p>
                <RequirementsTable
                  staffing={2}
                  overall={gC('overallRating2')}
                  dataSource={[{
                    key: 1,
                    lineItem: (<strong>Hours PPD</strong>),
                    cna: dec('twoReqCnaPPD'),
                    lpn: dec('twoReqLpnPPD'),
                    rn: dec('twoReqRnPPD'),
                    total: dec('twoReqTotalPPD'),
                  },
                  {
                    key: 2,
                    lineItem: 'Increase from current hours',
                    cna: dec('twoReqCnaInc'),
                    lpn: dec('twoReqLpnInc'),
                    rn: dec('twoReqRnInc'),
                    total: dec('twoReqTotalInc'),
                  },
                  {
                    key: 3,
                    lineItem: (<strong># of employees per day</strong>),
                    cna: dec('twoReqCnaEmp'),
                    lpn: dec('twoReqLpnEmp'),
                    rn: dec('twoReqRnEmp'),
                    total: dec('twoReqTotalEmp'),
                  },
                  {
                    key: 4,
                    lineItem: "Increase from current employees",
                    cna: dec('twoReqCnaEmpInc'),
                    lpn: dec('twoReqLpnEmpInc'),
                    rn: dec('twoReqRnEmpInc'),
                    total: dec('twoReqTotalEmpInc'),
                  },
                  {
                    key: 5,
                    lineItem: (<span>Additional monthly cost <InfoTip text="This cost includes Employee Benefits expense and PTO" /></span>),
                    total: (<span style={{backgroundColor: "gold", fontWeight: "bold"}}>$ { dec('twoStarAddMonth') }</span>),
                  },
                  {
                    key: 6,
                    lineItem: "Additional cost PPD",
                    total: (<span>$ { dec('twoStarAddPPD') }</span>)
                  },]}
                />
                <RequirementsTable
                  staffing={3}
                  overall={gC('overallRating3')}
                  dataSource={[
                    {
                      key: 8,
                      starNumberLabel: (<strong>3 Star Staffing</strong>),
                      lineItem: (<strong>Hours PPD</strong>),
                      cna: dec('threeReqCnaPPD'),
                      lpn: dec('threeReqLpnPPD'),
                      rn: dec('threeReqRnPPD'),
                      total: dec('threeReqTotalPPD'),
                    },
                    {
                      key: 9,
                      lineItem: "Increase from current hours",
                      cna: dec('threeReqCnaInc'),
                      lpn: dec('threeReqLpnInc'),
                      rn: dec('threeReqRnInc'),
                      total: dec('threeReqTotalInc'),
                    },
                    {
                      key: 10,
                      starNumberLabel: (<strong>2 Star Overall</strong>),
                      lineItem: (<strong># of employees per day</strong>),
                      cna: dec('threeReqCnaEmp'),
                      lpn: dec('threeReqLpnEmp'),
                      rn: dec('threeReqRnEmp'),
                      total: dec('threeReqTotalEmp'),
                    },
                    {
                      key: 11,
                      lineItem: "Increase from current employees",
                      cna: dec('threeReqCnaEmpInc'),
                      lpn: dec('threeReqLpnEmpInc'),
                      rn: dec('threeReqRnEmpInc'),
                      total: dec('threeReqTotalEmpInc'),
                    },
                    {
                      key: 12,
                      lineItem: (<span>Additional monthly cost <InfoTip text="This cost includes Employee Benefits expense and PTO" /></span>),
                      total: <span style={{backgroundColor: "gold", fontWeight: "bold"}}>$ { dec('threeStarAddMonth') }</span>,
                    },
                    {
                      key: 13,
                      lineItem: "Additional cost PPD",
                      total: (<span>$ { dec('threeStarAddPPD') }</span>)
                    },
                  ]}
                />
                <RequirementsTable
                  staffing={4}
                  overall={gC('overallRating4')}
                  dataSource={[
                    {
                      key: 15,
                      starNumberLabel: (<strong>4 Star Staffing</strong>),
                      lineItem: (<strong>Hours PPD</strong>),
                      cna: dec('fourReqCnaPPD'),
                      lpn: dec('fourReqLpnPPD'),
                      rn: dec('fourReqRnPPD'),
                      total: dec('fourReqTotalPPD'),
                    },
                    {
                      key: 16,
                      lineItem: "Increase from current hours",
                      cna: dec('fourReqCnaInc'),
                      lpn: dec('fourReqLpnInc'),
                      rn: dec('fourReqRnInc'),
                      total: dec('fourReqTotalInc'),
                    },
                    {
                      key: 17,
                      starNumberLabel: (<strong>3 Star Overall</strong>),
                      lineItem: (<strong># of employees per day</strong>),
                      cna: dec('fourReqCnaEmp'),
                      lpn: dec('fourReqLpnEmp'),
                      rn: dec('fourReqRnEmp'),
                      total: dec('fourReqTotalEmp'),
                    },
                    {
                      key: 18,
                      lineItem: "Increase from current employees",
                      cna: dec('fourReqCnaEmpInc'),
                      lpn: dec('fourReqLpnEmpInc'),
                      rn: dec('fourReqRnEmpInc'),
                      total: dec('fourReqTotalEmpInc'),
                    },
                    {
                      key: 19,
                      lineItem: (<span>Additional monthly cost <InfoTip text="This cost includes Employee Benefits expense and PTO" /></span>),
                      total: <span style={{backgroundColor: "gold", fontWeight: "bold"}}>$ {dec('fourStarAddMonth')}</span>,
                    },
                    {
                      key: 20,
                      lineItem: "Additional cost PPD",
                      total: (<span>$ {dec('fourStarAddPPD')}</span>)
                    },
                  ]}
                />
                <Divider />
                <div>
                  <p><strong>Note:</strong> "Required Staffing" is based on the most recent RUGS data processed by CMS and is subject to change with a change in the RUGS mix</p>
                  <p style={printHide}><Button style={{marginRight: "1rem"}} type="primary" onClick={this.gotoFirstReport} >Click here</Button> to see how a change in the RUGS may impact the required stafffing.</p>
                  <p style={printHide}><Button style={{marginRight: "1rem"}} type="primary" onClick={this.gotoSecondReport}>Click here</Button> to see RUG Type Report.</p>
                </div>
                </Card>
              </Col>
            </Row>

          </CardGroup>
          <div style={printHide}>
            <Link to="/form"><Button size="large" style={{marginRight: "1rem"}} icon="rollback">Change Inputs</Button></Link>
            <Button onClick={() => window.print()} size="large"><Icon type="printer"/> Print Analysis</Button>
          </div>
        </div>
        </AuthGate>
      </FormTemplate>
    );
  }
}

const mapStateToProps = state => {
  return {
    cells: state.analysis.result,
    
  }
}
export default withRouter(connect(mapStateToProps)(Radium(Analysis)));
