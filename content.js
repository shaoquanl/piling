// const elt = document.createElement("script");
// elt.innerHTML = "window.test = 1"
// document.head.appendChild(elt);

// 在页面上插入代码
// const s1 = document.createElement('script');
// s1.setAttribute('type', 'text/javascript');
// s1.setAttribute('src', chrome.extension.getURL('pageScripts/defaultSettings.js'));
// document.documentElement.appendChild(s1);

// 在页面上插入代码
const script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', chrome.extension.getURL('pageScripts/main.js'));
document.documentElement.appendChild(script);

script.addEventListener('load', () => {
  chrome.storage.local.get(['piliang_switchOn', 'piliang_rules', 'piliang_ajax_switchOn', 'piliang_ajax_rules'], (result) => {
    if (result.hasOwnProperty('piliang_switchOn')) {
      postMessage({type: 'piliang', to: 'pageScript', key: 'piliang_switchOn', value: result.piliang_switchOn});
    }
    if (result.piliang_rules) {
      postMessage({type: 'piliang', to: 'pageScript', key: 'piliang_rules', value: result.piliang_rules});
    }
    if (result.hasOwnProperty('piliang_ajax_switchOn')) {
      postMessage({type: 'piliang', to: 'pageScript', key: 'piliang_ajax_switchOn', value: result.piliang_ajax_switchOn});
    }
    if (result.piliang_ajax_rules) {
      postMessage({type: 'piliang', to: 'pageScript', key: 'piliang_ajax_rules', value: result.piliang_ajax_rules});
    }


  });
});


let iframe;
let iframeLoaded = false;

// 只在最顶层页面嵌入iframe
if (window.self === window.top) {

  document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
      iframe = document.createElement('iframe'); 
      iframe.className = "api-interceptor";
      iframe.style.setProperty('height', '100%', 'important');
      iframe.style.setProperty('width', '450px', 'important');
      iframe.style.setProperty('position', 'fixed', 'important');
      iframe.style.setProperty('top', '0', 'important');
      iframe.style.setProperty('left', '0', 'important');
      iframe.style.setProperty('z-index', '9999999999999', 'important');
      iframe.style.setProperty('transform', 'translateX(-450px)', 'important');
      iframe.style.setProperty('transition', 'all .4s', 'important');
      iframe.style.setProperty('box-shadow', '0 0 15px 2px rgba(0,0,0,0.12)', 'important');
      iframe.frameBorder = "none"; 
      iframe.src = chrome.extension.getURL("iframe/index.html")
      document.body.appendChild(iframe);
      let show = false;

      chrome.runtime.onMessage.addListener((msg, sender) => {
        if (msg == 'toggle') {
          show = !show;
          iframe.style.setProperty('transform', show ? 'translateX(0)' : 'translateX(-450px)', 'important');
        }

        return true;
      });
    }
  }
}


// 接收background.js传来的信息，转发给pageScript
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'piliang' && msg.to === 'content') {
    if (msg.hasOwnProperty('iframeScriptLoaded')) {
      if (msg.iframeScriptLoaded) iframeLoaded = true;
    } else {
      postMessage({...msg, to: 'pageScript'});
    }
  }
});

// 接收pageScript传来的信息，转发给iframe
window.addEventListener("pageScript", function(event) {
  if (iframeLoaded) {
    chrome.runtime.sendMessage({type: 'piliang', to: 'iframe', ...event.detail});
  } else {
    let count = 0;
    const checktLoadedInterval = setInterval(() => {
      if (iframeLoaded) {
        clearInterval(checktLoadedInterval);
        chrome.runtime.sendMessage({type: 'piliang', to: 'iframe', ...event.detail});
      }
      if (count ++ > 500) {
        clearInterval(checktLoadedInterval);
      }
    }, 10);
  }
}, false);

window.addEventListener("message", function(event) {
  const data = event.data;
  if (data.type === 'piliang' && data.to === 'content') {
    chrome.runtime.sendMessage({type: 'piliang', to: 'iframe', event:data.event,url: data.url, key: data.key, value: data.value});
  }
}, false);


