import React, {Component} from 'react';
import 'antd/dist/antd.css';
import {Switch, Collapse, Input, Button, Badge, Tooltip} from 'antd';
const Panel = Collapse.Panel;

import Replacer from './Replacer';

import './Main.less';

const buildUUID = () => {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}


export default class Main extends Component {
  constructor() {
    super();
    // chrome.runtime.onMessage.addListener(({type, to, url, match}) => {
    //   if (type === 'piliang' && to === 'iframe') {
    //     const {interceptedRequests} = this.state;
    //     if (!interceptedRequests[match]) interceptedRequests[match] = [];
    //
    //     const exits = interceptedRequests[match].some(obj => {
    //       if (obj.url === url) {
    //         obj.num++;
    //         return true;
    //       }
    //       return false;
    //     });
    //
    //     if (!exits) {
    //       interceptedRequests[match].push({url, num: 1});
    //     }
    //     this.setState({interceptedRequests}, () => {
    //       if (!exits) {
    //         // 新增的拦截的url，会多展示一行url，需要重新计算高度
    //         this.updateAddBtnTop_interval();
    //       }
    //     })
    //   }
    // });

    // chrome.runtime.sendMessage(chrome.runtime.id, {type: 'piliang', to: 'background', iframeScriptLoaded: true});

    this.collapseWrapperHeight = -1;
  }

  state = {
    interceptedRequests: {},
  }

  componentDidMount() {
    this.updateAddBtnTop_interval();
  }


  updateAddBtnTop = () => {
    let curCollapseWrapperHeight = this.collapseWrapperRef ? this.collapseWrapperRef.offsetHeight : 0;
    if (this.collapseWrapperHeight !== curCollapseWrapperHeight) {
      this.collapseWrapperHeight = curCollapseWrapperHeight;
      clearTimeout(this.updateAddBtnTopDebounceTimeout);
      this.updateAddBtnTopDebounceTimeout = setTimeout(() => {
        this.addBtnRef.style.top = `${curCollapseWrapperHeight + 30}px`;
      }, 50);
    }
  }

  updateAddBtnTop_interval = ({timeout = 1000, interval = 50 } = {}) => {
    const i = setInterval(this.updateAddBtnTop, interval);
    setTimeout(() => {
      clearInterval(i);
    }, timeout);
  }

  set = (key, value) => {
    // 发送给background.js
    chrome.runtime.sendMessage(chrome.runtime.id, {type: 'piliang', to: 'background', key, value});
    chrome.storage && chrome.storage.local.set({[key]: value});
  }

  forceUpdateDebouce = () => {
    clearTimeout(this.forceUpdateTimeout);
    this.forceUpdateTimeout = setTimeout(() => {
      this.forceUpdate();
    }, 1000);
  }

  handleSwitchChange = () => {
    window.setting.piliang_switchOn = !window.setting.piliang_switchOn;
    this.set('piliang_switchOn', window.setting.piliang_switchOn);

    this.forceUpdate();
  }

  handleMatchChange = (e, i) => {
    const url = e.target.value
    window.setting.piliang_rules[i].match = url;
    const urlList = url.split('?')
    if(urlList.length == 2) {
      this.setState({
        param: urlList[1].split('&').map(i => {return {key: i.split('=')[0],value:i.split('=').length == 2? i.split('=')[1]:''}})
      })
    }
    this.set('piliang_rules', window.setting.piliang_rules);

    this.forceUpdateDebouce();
  }

  handleClickAdd = () => {
    window.setting.piliang_rules.push({match: '', key: buildUUID()});
    this.forceUpdate(this.updateAddBtnTop_interval);
  }

  handleClickRemove = (e, i) => {
    e.stopPropagation();
    const {interceptedRequests} = this.state;
    const match = window.setting.piliang_rules[i].match;

    window.setting.piliang_rules = [
      ...window.setting.piliang_rules.slice(0, i),
      ...window.setting.piliang_rules.slice(i + 1),
    ];
    this.set('piliang_rules', window.setting.piliang_rules);

    delete interceptedRequests[match];
    this.setState({interceptedRequests}, this.updateAddBtnTop_interval);
  }

  handleCollaseChange = ({timeout = 1200, interval = 50 }) => {
    this.updateAddBtnTop_interval();
  }

  render() {
    return (
      <div className="main">
        <div>
        <Switch
          style={{zIndex: 10}}
          defaultChecked={window.setting.piliang_switchOn}
          onChange={this.handleSwitchChange}
        />
        <div className={window.setting.piliang_switchOn ? 'settingBody' : 'settingBody settingBody-hidden'}>
          {window.setting.piliang_rules && window.setting.piliang_rules.length > 0 ? (
            <div ref={ref => this.collapseWrapperRef = ref}>
              <Collapse
                className={window.setting.piliang_switchOn ? 'collapse' : 'collapse collapse-hidden'}
                onChange={this.handleCollaseChange}
                // onChangeDone={this.handleCollaseChange}
              >
                {window.setting.piliang_rules.map(({match, overrideTxt, key}, i) => (
                  <Panel
                    key={key}
                    header={
                      <div className="panel-header">
                        <Input
                          placeholder="URL Filter"
                          style={{width: '79%'}}
                          defaultValue={match}
                          onClick={e => e.stopPropagation()}
                          onChange={e => this.handleMatchChange(e, i)}
                        />
                        <Button
                          type="primary"
                          shape="circle" 
                          icon="minus"
                          onClick={e => this.handleClickRemove(e, i)}
                          style={{marginLeft: '4.5%'}}
                        />
                      </div>
                    }
                  >
                    <Replacer
                      defaultValue={overrideTxt}
                      updateAddBtnTop={this.updateAddBtnTop}
                      index={i}
                      set={this.set}
                    />
                    {/* <div className="replace-with">
                      Replace With:
                    </div>
                    <textarea
                      className="overrideTxt"
                      // placeholder="replace with"
                      style={{resize: 'none'}}
                      defaultValue={overrideTxt}
                      onChange={e => this.handleOverrideTxtChange(e.target.value, i)}
                    />
                    <Switch onChange={this.handleEditorSwitch} checkedChildren="JSON editor" unCheckedChildren="JSON editor" size="small" />
                    {this.state.showJSONEditor && <div className="JSONEditor">
                      <ReactJson
                        name=""
                        src={JSON.parse(overrideTxt)}
                        onEdit={val => this.handleJSONEditorChange(val, i)}
                        onAdd={val => this.handleJSONEditorChange(val, i)}
                        onDelete={val => this.handleJSONEditorChange(val, i)}
                      />
                    </div>} */}
                    {this.state.interceptedRequests[match] && (
                      <>
                        <div className="intercepted-requests">
                          Intercepted Requests:
                        </div>
                        <div className="intercepted">
                          {this.state.interceptedRequests[match] && this.state.interceptedRequests[match].map(({url, num}) => (
                            <Tooltip placement="top" title={url} key={url}>
                              <Badge
                                count={num}
                                style={{
                                  backgroundColor: '#fff',
                                  color: '#999',
                                  boxShadow: '0 0 0 1px #d9d9d9 inset',
                                  marginTop: '-3px',
                                  marginRight: '4px'
                                }}
                              />
                              <span className="url">{url}</span>
                            </Tooltip>
                          ))}
                        </div>
                      </>
                    )}
                  </Panel>
                ))}
              </Collapse> 
            </div>
          ): <div />}
          <div ref={ref => this.addBtnRef = ref} className="wrapper-btn-add">
            <Button
              className={`btn-add ${window.setting.piliang_switchOn ? '' : ' btn-add-hidden'}`}
              type="primary"
              shape="circle" 
              icon="plus"
              onClick={this.handleClickAdd}
              disabled={!window.setting.piliang_switchOn}
            />
          </div>
        </div>
        </div>
      </div>
    );
  }
}