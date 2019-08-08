
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, "toggle");
  })
});

// 接收iframe传来的信息，转发给content.js
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'piliang' && msg.to === 'background') {
    if (msg.key === 'piliang_switchOn') {
      if (msg.value === true) {
        chrome.browserAction.setIcon({path: {
          16: '/images/icon.png',
          32: '/images/icon.png',
          48: '/images/icon.png',
          128: '/images/icon.png',
        }});
      } else {
        chrome.browserAction.setIcon({path: {
          16: '/images/icon.png',
          32: '/images/icon.png',
          48: '/images/icon.png',
          128: '/images/icon.png',
        }});
      }
    }
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      console.log('background')
      chrome.tabs.sendMessage(tabs[0].id, {...msg, to: 'content'});
    })
  }
});

chrome.storage.local.get(['piliang_switchOn', 'piliang_rules'], (result) => {
  if (result.hasOwnProperty('piliang_switchOn')) {
    if (result.piliang_switchOn) {
      chrome.browserAction.setIcon({path: "/images/icon.png"});
    } else {
      chrome.browserAction.setIcon({path: "/images/icon.png"});
    }
  }
});