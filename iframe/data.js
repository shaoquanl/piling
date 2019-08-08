import React, {Component} from 'react';
import 'antd/dist/antd.css';
import {Switch, Collapse, Input, Button, Icon, Upload} from 'antd';
const Panel = Collapse.Panel;


export default class Main extends Component {
  constructor() {
    super();
    chrome.runtime.onMessage.addListener(({type, to, event, url,key, value}) => {
      if (type === 'piliang' && to === 'iframe' && event =='param') {
        const rules =  window.setting.piliang_ajax_rules.find(i=> i.match.indexOf(url)>-1 )

        rules[key] = rules[key] && rules[key].length?  rules[key]: []
        Object.keys(value).forEach(i => {
            const val = value[i]|| ''
          if (rules[key].some(k => decodeURIComponent(k.key) == decodeURIComponent(i))) {
              const item = rules[key].find(k => k.key == i)
              if (!item.on) {
                item.value = val
              }
            } else {
              rules[key].push({
                key:i, value:val, on: false
              })
            }
          })
        this.set('piliang_ajax_rules', window.setting.piliang_ajax_rules);
        setTimeout(()=>this.forceUpdateDebouce(), 100);
      }
      if (type === 'piliang' && to === 'iframe' && event =='person') {
        const rules =  window.setting.piliang_ajax_rules.find(i=> i.match.indexOf(url)>-1 )
        rules.person=(value||[]).map(i=>{return {
          code: i,
          do: false
        }})
        rules.upfile = false;

        this.set('piliang_ajax_rules', window.setting.piliang_ajax_rules);

        setTimeout(()=>this.forceUpdateDebouce(), 100);
      }

      if (type === 'piliang' && to === 'iframe' && event =='xhr') {
        const rules =  window.setting.piliang_ajax_rules.find(i=> i.match.indexOf(url)>-1 )
        rules.sendparam = value.sendparam;
        rules.xhr = value.xhr
        this.set('piliang_ajax_rules', window.setting.piliang_ajax_rules);

        setTimeout(()=>this.forceUpdateDebouce(), 100);
      }

    });

    chrome.runtime.sendMessage(chrome.runtime.id, {type: 'piliang', to: 'background', iframeScriptLoaded: true});

    this.collapseWrapperHeight = -1;
  }

  state = {
    interceptedRequests: {},
      body:[],
      query:[]

  }

  componentDidMount() {
    // window.setting.piliang_ajax_rules=[
    //   {
    //     match:'http:a.ba.com',
    //     body: [
    //       {
    //         on: true,
    //         key: 'user',
    //       },
    //       {
    //         on: false,
    //         key: 'fasdr',
    //       }
    //     ],
    //     query: [
    //       {
    //         on: false,
    //         key: 'city',
    //       }
    //     ],
    //     title: {
    //       name: '技能组',
    //       tpl:''
    //     },
    //     unSend: true,
    //     person:[
    //
    //     ],
    //     on: true
    //   }
    // ]
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
    }, 500);
  }

  handleParamChange= (e, i,ii,type) => {
    const url = e.target.value
    window.setting.piliang_ajax_rules[i][type][ii].key=url
    this.set('piliang_ajax_rules', window.setting.piliang_ajax_rules);
    this.forceUpdateDebouce();
  }

  handleMatchChange = (e, i) => {
    const url = e.target.value
    window.setting.piliang_ajax_rules[i].match = url;
    const urlList = url.split('?')
    if(urlList.length == 2) {
      urlList[1].split('&').forEach(s => {
        const key = decodeURIComponent(s.split('=')[0])
        const value = decodeURIComponent(s.split('=').length == 2 ? s.split('=')[1] : '')
        if (window.setting.piliang_ajax_rules[i].query.some(k => k.key == key)) {
          const item = window.setting.piliang_ajax_rules[i].query.find(k => k.key == key)
          if (!item.on) {
            item.value = value
          }
        } else {
          window.setting.piliang_ajax_rules[i].query.push({
            key, value, on: false
          })
        }
      })
    }
    this.set('piliang_ajax_rules', window.setting.piliang_ajax_rules);
    this.forceUpdateDebouce();
  }

  handleClickAdd = () => {
    if( !window.setting.piliang_ajax_rule){
      window.setting.piliang_ajax_rule=[]
    }
    window.setting.piliang_ajax_rules.push({
      match: '',
      body:[],
      query:[],
      title: '',
      person:[],
      on: false
    });


    this.forceUpdate(this.updateAddBtnTop_interval);
  }

  handleClickRemove = (e, i) => {
    e.stopPropagation();
    const {interceptedRequests} = this.state;
    const match = window.setting.piliang_ajax_rules[i].match;

    window.setting.piliang_ajax_rules = [
      ...window.setting.piliang_ajax_rules.slice(0, i),
      ...window.setting.piliang_ajax_rules.slice(i + 1),
    ];
    this.set('piliang_ajax_rules', window.setting.piliang_ajax_rules);

    delete interceptedRequests[match];
    this.setState({interceptedRequests}, this.updateAddBtnTop_interval);
  }

  handleCollaseChange = ({timeout = 1200, interval = 50 }) => {
    this.updateAddBtnTop_interval();
  }

  /**
   <input className="upExecl" type="file" onChange={(e,i)=>this.upExecl(e,i)}
   ref={ref => this.upExeclRef = ref}
   accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"/>
   * @returns {*}
   */
  render() {
    return (
      <div className="main">
        <div>

        <Switch
          style={{zIndex: 10}}
          checked={window.setting.piliang_ajax_switchOn}
          onChange={this.handleSwitchChange}
        />
        <div className={window.setting.piliang_ajax_switchOn ? 'settingBody' : 'settingBody settingBody-hidden'}>
          {window.setting.piliang_ajax_rules && window.setting.piliang_ajax_rules.length > 0 ? (
            <div ref={ref => this.collapseWrapperRef = ref}>
              <Collapse
                className={window.setting.piliang_ajax_switchOn ? 'collapse' : 'collapse collapse-hidden'}
                onChange={this.handleCollaseChange}
                // onChangeDone={this.handleCollaseChange}
              >
                {window.setting.piliang_ajax_rules.map(({match, overrideTxt,body=[],query=[],title={}, unSend=true,person,on}, i) => (
                  <Panel
                    key={i}
                    header={
                      <div className="panel-header">
                        <Switch checked={on} size='small' onChange={() =>this.handleUrlSwitchChange(i,on)}/>
                        <Input className="panel-header-name" value={title} />
                        <Button type="primary" size='small' onClick={e => this.handleSend(e, i)} style={{marginLeft: '3px'}}>保存</Button>
                        <Button type="primary" size='small' onClick={e => this.handleSend(e, i)} style={{marginLeft: '3px'}} disabled={!person.length}>发送</Button>
                        <Button type="primary" size='small' onClick={e => this.handleClear(e, i)} style={{marginLeft: '3px'}}>清空</Button>
                        <Button
                          type="primary"
                          shape="circle"
                          size='small'
                          icon="minus"
                          onClick={e => this.handleClickRemove(e, i)}
                          style={{marginLeft: '3px'}}
                        />
                      </div>
                    }
                  >
                    <div className="ajax-param" style={{marginBottom: '8px'}}>
                      <div className="ajax-param-person">
                        <Button type="primary" size='small' onClick={e => this.upExecl(i)} >上传系统ID文件</Button>

                        <a
                          href="http://file.ljcdn.com/psd-sinan-file/prod/helpdesk_evidence/877B898BC78C43D7BCE1F5739E5E8217.xlsx"
                          className="download" download="">下载模版</a>
                      </div>
                      {
                        person.map((i,k) =><div key={k} className="ajax-param-person">
                          {i.code}
                          {
                            i.do? <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a"
                                        style={{marginTop: '3px'}}
                            /> :null
                          }
                        </div> )
                      }
                    </div>
                    <div className="ajax-param">
                      <Input
                        placeholder="URL Filter"
                        style={{width: '100%', marginBottom: '6px'}}
                        value={match}
                        onClick={e => e.stopPropagation()}
                        onChange={e => this.handleMatchChange(e, i)}
                      />
                      {
                        query.map((ii, k)=> <div key={k} style={{display:'flex'}}>
                          <div style={ii.on?{color:'blue',flex:1,textAlign: 'left'}:{flex:1,textAlign: 'left'}}onClick={() =>this.handleOnChange(i,k,'query')}>{decodeURIComponent(ii.key)}:</div> <Input
                          value={ii.value}
                          style={{width: '200px', height:'28px'}}
                          onChange={(e) =>this.handleParamChange(e,i,k,'query')}
                        />
                        </div>)
                      }
                      {
                        body.map((ii, k)=> <div key={k} style={{display:'flex'}}>
                          <div style={ii.on?{color:'blue',flex:1,textAlign: 'left'}:{flex:1,textAlign: 'left'}}onClick={() =>this.handleOnChange(i,k,'body')}>{decodeURIComponent(ii.key)}:</div> <Input
                          value={ii.value}
                          style={{width: '200px', height:'28px'}}
                          onChange={(e) =>this.handleParamChange(e,i,ii,'body')}
                        />
                        </div>)
                      }
                    </div>

                  </Panel>
                ))}
              </Collapse> 
            </div>
          ): <div />}
          <div ref={ref => this.addBtnRef = ref} className="wrapper-btn-add">
            <Button
              className={`btn-add ${window.setting.piliang_ajax_switchOn ? '' : ' btn-add-hidden'}`}
              type="primary"
              shape="circle" 
              icon="plus"
              onClick={this.handleClickAdd}
              disabled={!window.setting.piliang_ajax_switchOn}
            />
          </div>
        </div>
        </div>
      </div>
    );
  }
  handleSend=(e,i)=>{
    window.setting.piliang_ajax_rules[i].sendPerson = true;
    this.set('piliang_ajax_rules', window.setting.piliang_ajax_rules);

    this.forceUpdateDebouce();
    setTimeout(()=>{
      window.setting.piliang_ajax_rules[i].sendPerson = false;
      this.set('piliang_ajax_rules', window.setting.piliang_ajax_rules);
      this.forceUpdateDebouce();
    },100)
  }
  handleClear=()=>{}
  handleOnChange = (i,ii,type) => {
    window.setting.piliang_ajax_rules[i][type][ii].on = !window.setting.piliang_ajax_rules[i][type][ii].on;
    this.set('piliang_ajax_rules', window.setting.piliang_ajax_rules);
    this.forceUpdateDebouce();
  }

  upExecl=(i) => {
    window.setting.piliang_ajax_rules[i].upfile = true;
    this.set('piliang_ajax_rules', window.setting.piliang_ajax_rules);

    this.forceUpdateDebouce();
    setTimeout(()=>{
      window.setting.piliang_ajax_rules[i].upfile = false;
      this.set('piliang_ajax_rules', window.setting.piliang_ajax_rules);
      this.forceUpdateDebouce();
    },100)


  }


}