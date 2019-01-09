import React, { Component } from 'react';
import { Table, Input, InputNumber, Popconfirm, Icon, Modal, Tooltip, Switch, Select } from 'antd';
const { Option } = Select;
import Button from 'antd/lib/button';
import { Link } from 'react-router-dom';
import NewRowForm, { SelectField, RelationSelectField, PercentField } from '../components/NewRowForm';

// EditableCells toggle between editable and static modes.
// editable - boolean
// value - string
// onChange - function
// column - object
const EditableCell = ({ editable, value, onChange, column, name = null, row }) => {
  let content;

  if(column.component) {
    content = column.component(value, column, row, editable, onChange);
  }
  else if(editable) {
    if(column.type === 'boolean') {
      content = <Switch checked={value} onChange={e => onChange(!value)}/>
    }
    else if(column.type === 'relation' && column.relation ) {
      return <RelationSelectField input={{value, onChange, name}} col={column} />
    }
    else if(column.type === 'select' && column.select ) {
      return <SelectField input={{value, onChange, name}} col={column} />
    }
    else if(column.type === 'text') {
      content = <Input.TextArea value={value} onChange={e => onChange(e.target.value)} rows={5}/>
    }
    else if(column.type === 'number') {
      content = <InputNumber value={value} onChange={onChange} />
    }
    else if(column.type === 'percent') {
      content = <PercentField input={{value, onChange, name}} />
    }
    else {
      content = <Input style={{ margin: '-5px 0' }} value={value} onChange={e => onChange(e.target.value)} />
    }
  }
  else {
    if(column.baseUri && column.link ) {
      let linkKey = null;
      if(column.type === 'relation' && column.relation) {
        const { data, title, key } = column.relation;
        const record = data.find(r => r[key] === value);
        if(record) {
          linkKey = value;
          value = record[title];
        }
      }
      else if(column.linkKey) {
        linkKey = row[column.linkKey];
      }

      if(linkKey) {
        content = <Link to={column.baseUri + '/' + linkKey}>{ value }</Link>
      }
      else {
        content = <span>Not found</span>
      }
    }
    else if(column.type === 'boolean') {
      if(value) {
        content = <Switch defaultChecked disabled/>
      }
      else {
        content = <Switch disabled/>
      }
    }
    else if(column.type === 'percent') {
      content = <span>{Math.round((value * 100) || 100)} %</span>
    }
    else if(column.type === 'text') {
      content = <span style={{whiteSpace:"pre"}}>{value}</span>;
    }
    else if(column.type === 'relation' && column.relation ) {
      const { key, title, data, get } = column.relation;

      content = data.find(r => r[key] === value);
      if(content) {
        return content[title];
      }
    }
    else {
      content = value;
    }
  }

  let styles = {};

  if(column.style) {
    styles = column.style(value, row, editable);
  }

  return (
  <div style={styles}>
    { content }
  </div>
)};

// EditableTables are dynamic, feature-rich data tables which allow complex data interactions
// handleSave - function: edit record function
// handleDelete - function
// handleNewRow - function: create record function
// title - function / component: the title component or function to generate the table's header
// data - array: data rows in the form { _id: 1, name: 'foo' }
// columns - array: data columns in the form { key: '_id', dataIndex: '_id', title: 'Id', editable: false }
// id - string: used to help uniquely identify the form
// searchFilter - function : (row, searchText) => boolean, used to override the default 'name' search for the transactions log
// searchFilterText - string: Placeholder text for search filter input
// addNewRowButtonText - string: Custom button text
// hideActions - boolean: if true, hide actions column
// actionButtons - array of components: additional action buttons
// pagination - object: Ant Design pagination object
class EditableTable extends Component {
  constructor(props) {
    super(props);

    this.handleSearchTextChange = this.handleSearchTextChange.bind(this);
    this.filterFunction = this.filterFunction.bind(this);

    this.state = {
      editInputs: {},
      editingRow: false,
      pending: false,
      showNewRowModal: false,
      searchText: '',
    };
  }

  renderColumns(value, record, column) {
    const cellIsEditing = record.rowKey === this.state.editingRow && column.editable;

    let cellValue = value;

    if(cellIsEditing) {
      cellValue = this.state.editInputs[column.dataIndex];
      if(typeof this.state.editInputs[column.dataIndex] === 'undefined') {
        cellValue = value;
      }
    }

    return (
      <EditableCell
        editable={cellIsEditing}
        row={record}
        column={column}
        value={cellValue}
        onChange={value => this.handleChange(value, record.dataIndex, column)}
        name={record.dataIndex}
      />
    );
  }

  handleChange(value, key, column) {
    this.setState({editInputs: {...this.state.editInputs, [column.dataIndex]: value}});
  }

  edit(key) {
    this.setState({ editingRow: key });
  }

  setPending(id) {
    this.setState({ pending: id });
  }

  save(id, key) {
    const editInputs = this.state.editInputs;
    if(Object.keys(editInputs).length > 0) {
      this.setPending(id);
      this.props.handleSave(id, this.state.editInputs, () => { this.setState({ pending: false, editInputs: {}, editingRow: false}) });
    }
  }

  delete(id) {
    this.setPending(id);
    this.props.handleDelete(id, () => {
      this.setState({pending: false});
    });
  }

  cancel(key) {
    this.setState({ editingRow: false, editInputs: {} });
  }

  addNewRow() {
    this.setState({ showNewRowModal: true });
  }

  handleSearchTextChange(e) {
    this.setState({ searchText: e.target.value });
  }

  filterFunction(row) {
    if(typeof this.props.searchFilter === 'function') {
      return this.props.searchFilter(row, this.state.searchText);
    }
    return ((this.state.searchText != '' && row.name) ? row.name.toLowerCase().includes(this.state.searchText.toLowerCase()) : true );
  }

  render() {
    const { actionsComponents = [] } = this.props;

    const actionsColumn = {
      title: 'Actions',
      dataIndex: 'actions',
      width: '150px',
      fixed: 'right',
      render: (text, record) => {
        const { editInputs } = this.state;
        const recordId = record.id;
        const isLoading = this.state.pending === recordId;
        const isDirty = Object.keys(editInputs).filter(key => editInputs[key] !== record[key]).length > 0;

        const clearTooltip = <Tooltip title="Close">
          <Button type="danger" loading={isLoading} onClick={ !isDirty ? () => this.cancel(record.rowKey) : null }><Icon type="close" /></Button>
        </Tooltip>;

        return (
          <div>
            {
              this.state.editingRow === record.rowKey ?
                <span>
                  <Button type="primary" disabled={!isDirty} onClick={() => this.save(recordId)} style={{marginRight: ".5rem"}} loading={isLoading}><Icon type="save" /></Button>

                  { isDirty &&
                  <Popconfirm title="Clear changes?" onConfirm={() => this.cancel(record.rowKey)}>
                      {clearTooltip}
                  </Popconfirm> }

                  { !isDirty && clearTooltip }
                </span>
                : <span>{ this.props.handleSave && (<Tooltip title="Edit"><Button onClick={() => this.edit(record.rowKey)} style={{marginRight: ".5rem"}} loading={isLoading}><Icon type="edit" /></Button></Tooltip>)}
                { this.props.handleDelete && (<Popconfirm title="Are you sure you want to delete this record?" onConfirm={() => this.delete(recordId)}>
                  <Tooltip title="Delete"><Button type="danger" loading={isLoading}><Icon type="delete"/></Button></Tooltip>

                </Popconfirm>)}

                { actionsComponents.length > 0 && (
                  <span style={{marginLeft: ".5rem"}}>
                    { actionsComponents.map(C => (
                      <span>{ C }</span>
                    )) }
                  </span>
                )}
              </span>
            }
          </div>
        );
      },
    };

    if(!Array.isArray(this.props.data)) {
      return <span />
    }

    const rows = this.props.data.map((r, i) => { r['rowKey'] = i; return r;});
    let columns = this.props.columns.map(c => { c['render'] = (value, record) => this.renderColumns(value, record, c); return c;}).filter(c => !c.hide);

    if(!this.props.hideActions) {
      columns = columns.concat([actionsColumn]);
    }

    return (<div>
      <Modal
        visible={ this.state.showNewRowModal }
        closable={ false }
        footer={[
            <Popconfirm title="Are you sure you want to exit?" onConfirm={() => this.setState({showNewRowModal: false})}>
              <Button key="back" onClick={this.handleCancel}>Exit</Button>
            </Popconfirm>,
          ]}
      >
        <NewRowForm onSubmit={inputs => {
            this.props.handleNewRow(inputs);
            this.setState({showNewRowModal: false});
          }}
          form={ this.props.id + 'CreateForm' }
          columns={ this.props.columns }
          buttonText={ this.props.addNewRowButtonText }
        />
      </Modal>
      <Input name="filter" style={{marginBottom: "1rem"}} onChange={ this.handleSearchTextChange } value={ this.state.searchText } placeholder={ this.props.searchFilterText ? this.props.searchFilterText : "Filter Rows" }/>
      <Table
        pagination={typeof this.props.pagination !== 'undefined' ? this.props.pagination : {pageSize: 100}} // Careful - pagination can be disabled with false
        size={this.props.size || 'small'}
        bordered
        title={this.props.title}
        dataSource={rows.filter(this.filterFunction)}
        columns={columns}
        footer={() => this.props.handleNewRow ? (<Button onClick={() => this.addNewRow()}><Icon type="plus" />{ this.props.addNewRowButtonText || 'Add a new row' }</Button>) : <span />}
        scroll={this.props.scroll || {x: 1750}}
      />
    </div>);
  }
}

export default EditableTable;
