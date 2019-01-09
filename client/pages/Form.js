import React from 'react';
import FormTemplate from '../templates/FormTemplate';
import { Button, Input, Divider, Popover, Alert } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import InfoTip from '../components/InfoTip';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { number, required } from '../data/validation';
import filch from '../data/filch';
import AuthGate from '../components/AuthGate';

const validationStyles = (meta, styles) => {
  if(meta.touched && meta.error) {
    styles.borderColor = "red";
  }
  return styles;
}

const CurrencyInput = ({input, meta, ...rest}) => {
  return (
    <span><strong style={{marginRight: ".25rem"}}>$</strong><Input style={validationStyles(meta, {maxWidth: "5rem"})} {...input} {...rest}/></span>
  )
};

const PercentInput = ({input, meta, ...rest}) => {
  return (
    <span><Input style={validationStyles(meta, {maxWidth: "5rem"})} {...input} {...rest}/><strong style={{marginLeft: ".25rem"}}>%</strong></span>
  )
};

const DecimalInput = ({input, meta, ...rest}) => {
  return (
    <Input style={validationStyles(meta, {maxWidth: "5rem"})} {...input} {...rest}/>
  )
}

const PTOInput = ({input, meta, ...rest}) => {
  return (
    <span><Input style={validationStyles(meta, {width: 70, marginRight: ".25rem"})} {...input} {...rest}/><span style={{marginRight: "1rem"}}>days</span></span>
  )
};

const MealBreakInput = ({input, meta, ...rest}) => {
  return (
    <span><Input style={validationStyles(meta, {width: 50, marginRight: ".25rem"})} {...input} {...rest}/> <span style={{marginRight: "1rem"}}>minutes per shift</span></span>
  )
};

const CensusInput = ({input, meta, ...rest}) => {
  return (
    <Input style={validationStyles(meta, {width: "6rem", marginRight: "1rem"})} {...input} {...rest}/>
  )
}

const DefaultButton = ({children, ...props}) => {
  return (
    <Button style={{backgroundColor: "#c2e0f6", color: "#62717d"}} {...props}>{children}</Button>
  )
}

const labelStyle = {fontWeight: "bold", fontSize: "1rem"};

const ButtonTip = ({text}) => (<div style={{display: "inline"}}><InfoTip text={text} /></div>);

const Form = ({selectedFacility, handleSubmit, submitting, defaults, change, anyTouched, invalid, analysisCompleted, selectedState, reset}) => {
  return (
    <FormTemplate>
      <AuthGate>
      <form onSubmit={handleSubmit}>
      { selectedFacility.providerName && (<div><h2>{ selectedFacility.providerName } ({ selectedFacility.providerState})</h2><Divider /></div>) }
      <div style={{marginBottom: "1rem"}}>
        <Alert message="All fields are required and must be numeric." type="warning" showIcon/>
      </div>
      <div style={{marginBottom: "1rem"}}>
        <Button onClick={reset} type="danger">Clear all Inputs</Button>
      </div>
      <h2>Payroll Information <InfoTip text="This enables the calculator to estimate the associated increase/decrease in expense resulting from a change in staffing amounts."/></h2>
      <table className="data-table">
        <thead>
          <tr>
            <th></th>
            <th>CNA</th>
            <th>LPN</th>
            <th>RN</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Salary rate <InfoTip text="Enter the average hourly gross pay rate for each discipline."/></th>
            <td><Field component={CurrencyInput} validate={[required, number]} name="cnaSalary"/></td>
            <td><Field component={CurrencyInput} validate={[required, number]} name="lpnSalary"/></td>
            <td><Field component={CurrencyInput} validate={[required, number]} name="rnSalary"/></td>
            <td><DefaultButton onClick={() => {
              const state = defaults.salary[selectedState.full];
              change('cnaSalary', state[2]);
              change('lpnSalary', state[1]);
              change('rnSalary', state[0]);
            }}>Use state averages <ButtonTip text="Based on state specific data from the U.S. Bureau of Labor Statistics. Includes an adjustment for the national average rate differential for SNF settings." /></DefaultButton></td>
          </tr>
          <tr>
            <th>Benefits <InfoTip text="Enter the amount of all employee benefits that the facility generally provides to the nursing staff as a % of the base payroll amount. (include payroll tax, workers comp, health insurance, retirement etc). "/></th>
            <td><Field component={PercentInput} validate={[required, number]} name="cnaBenefits" /></td>
            <td><Field component={PercentInput} validate={[required, number]} name="lpnBenefits" /></td>
            <td><Field component={PercentInput} validate={[required, number]} name="rnBenefits" /></td>
            <td><DefaultButton onClick={() => {
              change('cnaBenefits', defaults.benefits);
              change('lpnBenefits', defaults.benefits);
              change('rnBenefits', defaults.benefits);
            }}>Use average <ButtonTip text="Based on national data from the U.S. Bureau of Labor Statistics for Health care and social assistance employees in Nursing care facilities." /></DefaultButton></td>
          </tr>
        </tbody>
      </table>
      <div style={{marginTop: "1.5rem"}}>
        <label style={{...labelStyle, marginRight: "1rem"}}>PTO <InfoTip text="Enter the total number of all paid off days that the facility generally provides the nursing staff each year (including vacation, sick and personal days and holidays)." /></label>
        <Field component={PTOInput} validate={[required, number]} name="pto" />
        <DefaultButton onClick={() => {
          change('pto', defaults.pto);
        }}>Use average <ButtonTip text="Based on most the recent data from the U.S. Bureau of Labor Statistics for Health care and social assistance employees in Nursing care facilities." /></DefaultButton>
      </div>
      <div style={{marginTop: "1.5rem"}}>
        <label style={{...labelStyle, marginRight: "1rem"}}>Paid meal break <InfoTip text="Enter the average number of minutes of paid mealbreak (per 8-hour shift) that the facility provides the emoloyees. (for example, if the morning and evening shifts recive a 30 minute break but the night shift does not, the average would be 20 minutes). Per CMS guidelines, paid meal breaks cannot be included in the staffing hours for PBJ, and accordingly are not counted towards the staffing hours used for the star rating computations." /></label>
        <Field component={MealBreakInput} validate={[required, number]} name="mealBreak" />
        <DefaultButton onClick={() => {
          change('mealBreak', defaults.mealBreak);
        }}>Use average <ButtonTip text="Or click here to use the average meal break length" /></DefaultButton>
      </div>
      <Divider />
      <div style={{marginTop: "1.5rem"}}>
        <h3>Internal staffing requirement</h3>
        <p>Enter the amount of staffing hours PPD that the facility requires based on internal clinical and care considerations, regardless of any star rating considerations. The required Staffing for each respective star rating that will be calculated will for each specific discipline will not be lower than the "Internal staffing requirement" entered here.</p>
        <Popover overlayStyle={{maxWidth: 300}} content="Various combinations of staffing amounts from the diffirent staffing types can be used to achieve each star rating. The calculater will choose the combination that is closest to the facilitys internal requrement.">
          <div style={{display: "inline-block", borderRadius: "5px", padding: ".33rem", backgroundColor: "#777", color: "white"}}>Why is this information necessary?</div>
        </Popover>
        <table className="data-table" style={{marginTop: "1rem"}}>
          <thead>
            <tr>
              <th></th>
              <th>CNA</th>
              <th>LPN</th>
              <th>RN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>&nbsp;</th>
              <td><Field component={DecimalInput} validate={[required, number]} name="cnaAdmin" /></td>
              <td><Field component={DecimalInput} validate={[required, number]} name="lpnAdmin" /></td>
              <td><Field component={DecimalInput} validate={[required, number]} name="rnAdmin" /></td>
              <td><DefaultButton onClick={() => {
                change('cnaAdmin', defaults.cnaAdmin);
                change('lpnAdmin', defaults.lpnAdmin);
                change('rnAdmin', defaults.rnAdmin);
              }}>Use defaults <ButtonTip text="The default amounts are by no means a suggested amount, rather it is a built in mechanism to prevent the calculator from displaying staffing amounts below these levels."/></DefaultButton></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{marginTop: "1rem"}}>
        <label style={{...labelStyle, marginRight: "2rem"}}>Average daily census</label>
        <Field component={CensusInput} validate={[required, number]} name="census" />
      </div>
      <div style={{marginTop: "3rem"}}>
        <Button.Group>
          <Link to="/facility"><Button icon="arrow-left" size="large" disabled={submitting}>Select a Facility</Button></Link>
          <Button icon="calculator" htmlType="submit" type="primary" size="large" loading={submitting} disabled={submitting}>{analysisCompleted && (<span>Re-</span>)}Analyze</Button>
        </Button.Group>
      </div>
      </form>
      </AuthGate>
    </FormTemplate>
  )
}

const mapStateToProps = state => {
  return {
    selectedFacility: state.facilities.selected,
    selectedState: state.states.selected,
    defaults: state.defaults,
    analysisCompleted: state.analysis.result.length > 0,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit(values, dispatch, props) {
      const {federalProviderNumber} = props.selectedFacility;

      values["federalProviderNumber"] = federalProviderNumber;

      return filch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: {'Content-Type': 'application/json'},
      })
      .then((res) => {
        if(res.ok) {
          return res.json();
        }
      })
      .then((json) => {
        console.log(json.result);
        dispatch({type: 'LOAD_ANALYSIS', result: json.result});
        ownProps.history.push('/analysis');
      })
      .catch(err => {
        console.error(err);
        dispatch({type: 'SET_ERROR', error: 'Something went wrong'});
        // Update state to show that analysis failed
      });
    }
  }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(reduxForm({
  form: 'assumptions',
  destroyOnUnmount: false,
})(Form)));
