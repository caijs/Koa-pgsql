import React from 'react';
import { Popover, Icon } from 'antd';
import Radium from 'radium';

const style = {
  minWidth: "2em",
  textAlign: "center",
  display: "inline-block",
  '@media print': {
    display: 'none',
  },
};

const InfoTip = ({text}) => {
  return (<Popover content={text} overlayStyle={{maxWidth: "400px"}} placement="topLeft">
    <span className="info-tip" style={style}><Icon type="question-circle"/></span>
  </Popover>);
};

export default Radium(InfoTip);
