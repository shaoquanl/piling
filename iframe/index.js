import React from 'react';
import ReactDOM from 'react-dom';

import Main from './Main';

const DEFAULT_SETTING = {
  piliang_switchOn: false,
  piliang_rules: [],

  piliang_ajax_switchOn: false,
  piliang_ajax_rules: [],
}

if (chrome.storage) {
  chrome.storage.local.get(['piliang_switchOn', 'piliang_rules','piliang_ajax_switchOn','piliang_ajax_rules'], (result) => {
    // if (result.piliang_switchOn) {
    //   this.set('piliang_switchOn', result.piliang_switchOn, false);
    // }
    // if (result.piliang_rules) {
    //   this.set('piliang_rules', result.piliang_rules, false);
    // }
    window.setting = {
      ...DEFAULT_SETTING,
      ...result,
    };

    ReactDOM.render(
      <Main />,
      document.getElementById('main')
    );
  });
} else {
  window.setting = DEFAULT_SETTING;
  // 测试环境
  ReactDOM.render(
    <Main />,
    document.getElementById('main')
  );
}