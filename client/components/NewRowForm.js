import React from 'react';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import Switch from 'antd/lib/switch';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import { reduxForm, Field } from 'redux-form';

const NumberField = ({input}) => <InputNumber step={1} {...input}/>
const InputField = ({input}) => <Input onChange={input.onChange} value={input.value} name={input.name}/>;
const SwitchField = ({input}) => <Switch onChange={input.onChange} value={input.value} name={input.name}/>;
const TextAreaField = ({input}) => <Input.TextArea rows={5} onChange={input.onChange} value={input.value} name={input.name} />;

export const RelationSelectField = ({input, col}) => {
  const { data, key, title } = col.relation;
  return (<Select onChange={input.onChange} defaultValue={input.value} style={{width: "100%"}} name={input.name} >
    {data.map(r => {
      return (<Select.Option value={r[key]}>{r[title]}</Select.Option>)
    })}
  </Select>)
};

export const SelectField = ({input, col}) => {
  const { select, required } = col;
  const { options, defaultValue } = select;
  return (<Select onChange={input.onChange} defaultValue={typeof input.value === 'undefined' ? defaultValue : input.value } defaultActiveFirstOption={required && !defaultValue} style={{width: "100%"}} name={input.name} >
    { !required && (<Select.Option value=""><span style={{opacity: .5}}>None</span></Select.Option>) }
    { options.map(r => {
      return (<Select.Option value={r.value}>{r.title}</Select.Option>)
    })}
  </Select>)
};

export const PercentField = ({input}) => {
  return (<span><InputNumber
      value={input.value}
      defaultValue={1}
      min={0}
      max={1}
      step={0.05}
      formatter={val => val === '' ? '' : Math.round(val * 100)}
      parser={val => val === '' ? 0 : val / 100}
      onChange={input.onChange}
    />%</span>)
};

const FormInput = (c, i) => {
  if(!c.editable) return <span />

  let component = InputField;

  if(c.type) {
    switch(c.type.toLowerCase()) {
      case 'boolean': {
        component = SwitchField;
        break;
      }
      case 'text': {
        component = TextAreaField;
        break;
      }
      case 'relation': {
        component = ({input}) => <RelationSelectField input={input} col={c}/>;
        break;
      }
      case 'number': {
        component = NumberField;
        break;
      }
      case 'percent': {
        component = PercentField;
        break;
      }
      case 'select': {
        component = ({input}) => <SelectField input={input} col={c} />;
        break;
      }
    }
  }

  return <Form.Item label={ c.title } key={i} required={c.required}>
    <Field component={component} key={i} name={ c.dataIndex }/>
  </Form.Item>
}

const NewRowForm = ({columns, submitting, handleSubmit, buttonText = null}) => {
  return (
    <Form onSubmit={handleSubmit}>
      { columns.filter(c => !c.noCreate).map(FormInput) }
      <Button key="submit" htmlType="submit" type="primary" disabled={submitting}>
        { buttonText || "Create Row" }
      </Button>
    </Form>
  );
}

export default reduxForm()(NewRowForm);
