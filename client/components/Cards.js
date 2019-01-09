import React from 'react';
import { Card } from 'antd';

const cellStyle = {
  padding: ".5rem",
  // fontSize: "1rem",
};

export const CardGridGroup = ({data, cols}) => {
  return data.map(row => (
    <React.Fragment>
      { cols.map((col, i) => {
        const key = 'col' + (i + 1);
        return (
          <Card.Grid key={key} style={Object.assign({}, cellStyle, col.style, row.style)}>{ row[key] }</Card.Grid>
        )
      })}
    </React.Fragment>
  ));
};

export const CardGroup = ({children}) => {
  return children.map((c, i) => {
    return (<div style={{marginBottom: "1.5rem"}} key={i}>{c}</div>)
  });
};
