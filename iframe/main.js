import React, {Component} from 'react';
import 'antd/dist/antd.css';
import {Radio,Icon} from 'antd';
import Data from './data'

import Ajax from './ajax'

export default class Main extends Component {
  state= {
    tab: '0'
  }
  changeState=(e)=> {
    this.setState({
      tab: e
    })
}
  render() {
    const {tab} = this.state
    return (
      <div className="main">
        <div><Icon type="arrow-left" />       批量助手       <Icon type="arrow-right" /></div>
        <Radio.Group value={tab} onChange={(e) => this.changeState(e.target.value)}>
          <Radio.Button value="0">动态接口</Radio.Button>
          <Radio.Button value="1">模版接口</Radio.Button>
        </Radio.Group>
        {
          tab=='0'?<Data/>:null
        }
        {
          tab=='1'?<Ajax/>:null
        }
      </div>
    );
  }
}