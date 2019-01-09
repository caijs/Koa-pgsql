import React from 'react';
import { Layout } from 'antd';

export default ({children}) => {
  return (
    <Layout>
      <div style={{padding: "4rem"}}>
        { children }
      </div>
    </Layout>
  )
}
