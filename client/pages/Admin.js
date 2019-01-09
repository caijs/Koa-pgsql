import React from 'react';
import { Button, Icon, Upload, Table, Alert, Spin, Divider, Select, Input } from 'antd';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import { Redirect, withRouter } from 'react-router-dom';
import AdminTemplate from '../templates/AdminTemplate';
import EditableTable from '../components/EditableTable';
import AuthGate from '../components/AuthGate';
import filch from '../data/filch';
import LogoutButton from '../components/LogoutButton';

let uri = "";

if(process.env.NODE_ENV === "development") {
  uri = "http://localhost:3000";
}

const Facility = ({f, style}) => {
  return (<div style={style}><strong>{f.federalProviderNumber}</strong> - {f.providerName} ({f.providerState})</div>)
}

const DeleteButton = ({deleted, handleRemove, handleUndoRemove}) => {
  if(deleted) {
    return (<Button size="small" icon="cross" onClick={handleUndoRemove}/>);
  }
  return (<Button size="small" type="danger" onClick={handleRemove} icon="delete" />);
}


const matchPN = facility => f => f.federalProviderNumber === facility.federalProviderNumber;

class FacilitySearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      federalProviderNumber: '',
      isSearching: false,
      error: null,
      additions: [],
      deletions: [],
    };

    this.handleSearch = this.handleSearch.bind(this);
    this.remove = this.remove.bind(this);
    this.undoRemove = this.undoRemove.bind(this);
    this.removeAddition = this.removeAddition.bind(this);
    this.add = this.add.bind(this);
  }

  handleSearch() {
    if(this.state.federalProviderNumber.length > 0) {
      // conduct search
      this.setState({isSearching: true});
      filch('/api/staffing-data/' + this.state.federalProviderNumber)
        .then(res => {
          return res.json();
        })
        .then(json => {
          this.setState({error: null, isSearching: false, federalProviderNumber: ''});
          this.add(json);
        })
        .catch(err => {
          this.setState({error: 'No results found.', isSearching: false});
        });
    }
  }

  add(facility) {
    const additions = [...this.state.additions];
    const staffingData = this.props.row.StaffingData;

    if(!additions.find(matchPN(facility)) && !staffingData.find(matchPN(facility))) {
      additions.push(facility);

      this.setState({additions,}, () => {
        this.props.onChange({additions: this.state.additions, deletions: this.state.deletions});
      });
    }
  }

  removeAddition(facility) {
    let { additions, deletions } = this.state;

    const addIdxToDelete = additions.findIndex(matchPN(facility))
    if(addIdxToDelete > -1) { // If deletion is an addition, simply remove addition
      additions = [...additions];
      additions.splice(addIdxToDelete, 1);
      this.setState({additions}, () => {
        this.props.onChange({additions, deletions});
      });
      return true;
    }
    return false;
  }

  undoRemove(facility) {
    let { additions, deletions } = this.state
    // Remove addition
    this.removeAddition(facility);

    const deletionIdx = deletions.findIndex(matchPN(facility)); // restore deletion
    if(deletionIdx > -1) {
      deletions = [...deletions];
      deletions.splice(deletionIdx, 1);
      this.setState({deletions}, () => {
        this.props.onChange({additions, deletions});
      });
    }
  }

  remove(facility) {
    let { additions, deletions } = this.state;

    if(this.removeAddition(facility)) {
      return;
    }

    deletions = [...this.state.deletions];
    deletions.push(facility);
    this.setState({deletions,}, () => {
      this.props.onChange({additions: this.state.additions, deletions: this.state.deletions});
    });
  }

  render() {
    const { value, column, row, editable, onChange } = this.props;
    const { error, isSearching, federalProviderNumber, additions, deletions } = this.state;
    const staffingData = row.StaffingData;
    if(editable && staffingData) {
      return (
        <div>
          <div style={{marginBottom: "1rem"}}>
            { staffingData.map(f => {
              let style = {display: "flex"};
              const deleted = deletions.find(matchPN(f));
              if(deleted){
                style.color = "red";
                style.textDecoration = "line-through";
              }
              return (<div style={style}><Facility f={f} style={{marginRight: ".5rem"}}/><DeleteButton handleRemove={() => this.remove(f)} handleUndoRemove={() => this.undoRemove(f)} deleted={deleted}/></div>)
            })}
            { additions.filter(f => !staffingData.find(matchPN(f))).map(f => <div style={{display: "flex", color: "green"}}><Facility f={f} style={{marginRight: ".5rem"}} /><Button size="small" type="danger" icon="delete" onClick={() => this.remove(f)} /></div>)}
          </div>
          <div style={{marginBottom: ".5rem"}}>
          <Input
            name="federalProviderNumber"
            style={{width:200, marginRight: ".5rem"}}
            placeholder="Federal Provider Number"
            onChange={(e) => this.setState({federalProviderNumber: e.target.value})}
            value={federalProviderNumber}
          />
          <Button onClick={this.handleSearch} disabled={isSearching} loading={isSearching} type="primary">Search</Button>
          </div>
          { error && (<Alert type="error" showIcon message={error} style={{marginBottom: ".5rem"}}/>)}
        </div>
      )
    }
    else {
      return (<div>
        { staffingData.map(f => (<Facility f={f} />)) }
      </div>)
    }
  }
}

const FacilitySearchConnector = (value, col, row, editable, onChange) => {
  return <FacilitySearch value={value} col={col} row={row} editable={editable} onChange={onChange}/>
};


class Admin extends React.Component {
  componentWillMount() {
    // fetch users
    if(!this.props.users.fetched) {
      this.props.fetchUsers();
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      ssError: false,
      ssSuccess: false,
      ssUpdating: false,
    };

    this.updateSpreadsheet = this.updateSpreadsheet.bind(this);
  }

  updateSpreadsheet() {
    this.setState({ssUpdating: true});
    filch('/api/spreadsheet', { method: 'POST' })
      .then((res) => {
        if(res.ok) {
          this.setState({ssError: false, ssSuccess: true, ssUpdating: false});
        }
      })
      .catch(err => {
        this.setState({ssError: true, ssSuccess: false, ssUpdating: false});
      });
  }

  render() {
    const { createUser, editUser, users, deleteUser } = this.props;
    const { ssSuccess, ssError, ssUpdating } = this.state;
    return (
      <AdminTemplate>
        <AuthGate admin>
              <div>
              <div style={{marginBottom: "2rem"}}>
                <h2>User Management</h2>
                <EditableTable
                  size="small"
                  handleSave={editUser}
                  handleDelete={deleteUser}
                  handleNewRow={createUser}
                  searchFilterText="Filter by user name"
                  addNewRowButtonText="Add new user"
                  scroll={{x: "100%"}}
                  columns={[{
                    title: 'Name',
                    dataIndex: 'name',
                    key: 'name',
                    editable: true,
                  }, {
                    title: 'E-mail',
                    dataIndex: 'email',
                    key: 'email',
                    editable: true,
                    required: true,
                  },
                  {
                    title: 'Is Admin User',
                    dataIndex: 'admin',
                    key: 'admin',
                    editable: true,
                    type: 'boolean',
                  },
                  {
                    title: 'Facilities',
                    dataIndex: 'facilities',
                    key: 'facilities',
                    editable: true,
                    component: FacilitySearchConnector,
                    noCreate: true,
                  },
                  {
                    dataIndex: 'password',
                    title: 'Password',
                    editable: true,
                    type: 'password',
                    required: true
                  },
                ]}
                data={users}
              />
            </div>
            <div style={{marginBottom: "2rem"}}>
              <h2>Update Spreadsheet</h2>
              <p>Updates this site's internal representation of the Google spreadsheet used for analysis.</p>
              <Button onClick={this.updateSpreadsheet} disabled={ssUpdating} loading={ssUpdating}>Click to Update</Button>
              <div style={{marginTop: "1rem"}}>
                { ssSuccess && (<Alert message="Successfully uploaded" type="success"/>)}
                { ssError && (<Alert message="There was a problem uploading the new sheet." type="error"/>)}
              </div>
            </div>
            {/* <div style={{marginBottom: "2rem"}}> */}
            {/* <h2>State Salary Defaults</h2> */}
            {/* <Upload>
              <Button><Icon type="upload" /> Upload State Salary Defaults</Button>
            </Upload> */}
            {/* </div> */}
            <div>
              <h2>Star Ratings</h2>
              <p>Uploads the bulk data file (in CSV format) for facility star rating information</p>
              <Upload
                name='starRatings'
                action={ uri + '/api/stars'}
                >
                  <Button><Icon type="upload" /> Upload CSV File</Button>
                </Upload>
              </div>
              <div style={{marginTop: "2rem"}}>
                <h2>Facility Staffing Data</h2>
                <p>Uploads the bulk data file (in CSV format) for facility staffing data</p>
                <Upload
                  name='staffingData'
                  action={ uri + '/api/staffing-data'}
                  >
                    <Button><Icon type="upload" /> Upload CSV File</Button>
                  </Upload>
                </div>
                <Divider />
                <div style={{marginTop: "2rem"}}>
                  <LogoutButton />
                </div>
              </div>
        </AuthGate>
      </AdminTemplate>
    )
  }
}

const mapStateToProps = state => {
  return {
    users: state.users.data,
  }
};

const getPk = (f) => f.federalProviderNumber;

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchUsers() {
      filch('/api/users')
        .then(res => res.json())
        .then(users => {
          dispatch({type: 'LOAD_USERS', users});
        })
        .catch(console.error);
    },
    createUser(data) {
      filch('/api/users', {method: 'POST', body: JSON.stringify(data), headers: {'Content-Type': 'application/json'}})
        .then(res => res.json())
        .then(user => {
          dispatch({type: 'LOAD_USER', user})
          dispatch(reset('undefinedCreateForm'));
        })
        .catch(console.error);
    },
    editUser(id, edits, cb) {


      const facilitiesChanges = edits.facilities;
      if(facilitiesChanges) {
        facilitiesChanges.additions = facilitiesChanges.additions.map(getPk);
        facilitiesChanges.deletions = facilitiesChanges.deletions.map(getPk);
      }

      filch('/api/users/' + id, {method: 'PUT', body: JSON.stringify(edits), headers: {'Content-Type': 'application/json'}})
        .then(res => res.json())
        .then(user => {
          return dispatch({type: 'UPDATE_USER', id, user});
        })
        .then(cb)
        .catch(console.error);
    },
    deleteUser(id, cb) {
      filch('/api/users/' + id, {method: 'DELETE'})
        .then(res => {
          if(res.ok) {
            return dispatch({type: 'DELETE_USER', id});
          }
        })
        .then(cb);
    },
  }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Admin))
