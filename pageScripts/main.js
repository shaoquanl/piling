function juejn(url, responseText) {
  // if(url.indexOf('web-api.juejin.im/query')>-1) {
  //   console.log(url)
  //   console.log(JSON.parse(responseText).data.articleFeed.items.edges.map(i => {
  //     createIframe(i.node.originalUrl)
  //     return {
  //       title: i.node.title,
  //       content: i.node.content,
  //       url: i.node.originalUrl
  //     }
  //   })
  //   )
  // }

}
function juejnDetail(url, responseText) {
  // if(url.indexOf('post-storage-api-ms.juejin.im/v1/getDetailData')>-1 && url.indexOf('type=entryView')>-1) {
  //   console.log(location.href)
  //   console.log(JSON.parse(responseText).d.content)
  // }

}
function createIframe(url) {
  var iframe = document.createElement("iframe");
  iframe.src = url
  iframe.style = 'display:none';
  document.body.insertBefore(iframe, document.body.firstChild);
}
// 命名空间
let ajax_interceptor_qoweifjqon = {
  settings: {
    piliang_switchOn: false,
    piliang_rules: [],
    piliang_ajax_switchOn: false,
    piliang_ajax_rules: [],
  },
  originalXHR: window.XMLHttpRequest,
  myXHR: function() {
    let pageScriptEventDispatched = false;
    const modifyResponse = () => {
      juejn(this.responseURL, this.responseText, this.response)
      juejnDetail(this.responseURL, this.responseText)

      ajax_interceptor_qoweifjqon.settings.piliang_rules.forEach(({match, overrideTxt = ''}) => {
        if (match && this.responseURL.indexOf(match) > -1) {
          this.responseText = overrideTxt;
          this.response = overrideTxt;
          if (!pageScriptEventDispatched) {
            window.dispatchEvent(new CustomEvent("pageScript", {
              detail: {url: this.responseURL, match}
            }));
            pageScriptEventDispatched = true;
          }
        }
      })
    }
    
    const xhr = new ajax_interceptor_qoweifjqon.originalXHR;
    xhr._open = xhr.open
    xhr.open = (...args) => {
      if(args[0].type == 'per') {
        xhr._open(...window._p_args)
      }
      else {
        let queryMap
        xhr.urlPath = args[1]

        // if(args[1].indexOf('post-storage-api-ms.juejin.im/v1/getDetailData')) {
        //   console.log(args[1])
        // }
        if (ajax_interceptor_qoweifjqon.settings.piliang_ajax_switchOn) {
          ajax_interceptor_qoweifjqon.settings.piliang_ajax_rules.forEach(({match, query, overrideTxt = ''}) => {
            const url = match ? match.split("?")[0].split("//").length ? match.split("?")[0].split("//")[1] : match.split("?")[0] : ''
            if (match && args[1].indexOf(url) > -1) {
              window._p_args = args
              const map = {}
              query.filter(i => i.on).forEach(i => map[decodeURIComponent(i.key)] = decodeURIComponent(i.value))
              queryMap = Object.assign({}, getMap(args[1]), map)

              postMessage({type: 'piliang', to: 'content', event: 'param', url: url, key: 'query', value: queryMap});
              args[1] = args[1].split('?')[0] + '?' + Object.keys(queryMap).map(i => `${encodeURIComponent(i)}=${encodeURIComponent(queryMap[i])}`).join('&')
            }
          })
        }
        xhr._open(...args)
      }
    }
    xhr._send = xhr.send
    xhr.send = (str) => {
      let param
      let paramStr = str;

      if (ajax_interceptor_qoweifjqon.settings.piliang_ajax_switchOn) {
        ajax_interceptor_qoweifjqon.settings.piliang_ajax_rules.forEach(({match, body, overrideTxt = ''}) => {
          const url =match? match.split("?")[0].split("//").length? match.split("?")[0].split("//")[1]:match.split("?")[0]:''
          if (match && xhr.urlPath.indexOf(url) > -1) {
            if(!window._xhr_map){
              window._xhr_map = {}
            }
            window._xhr_map[url]=xhr
            postMessage({type: 'piliang', to: 'content', event:'param',url: url, key: 'xhr', value: {sendparam:str,xhr:''}});
            if (paramStr) {
              const map = {}
              body.filter(i => i.on).forEach(i => map[i.key] = i.value)
              param = Object.assign({}, getMap(str), map)

              postMessage({type: 'piliang', to: 'content', event: 'param', url: url, key: 'body', value: param});
              paramStr = Object.keys(param).map(i => `${encodeURIComponent(i)}=${encodeURIComponent(param[i])}`).join('&')
            }
          }
        })
      }
      xhr._send(paramStr)
    }

    for (let attr in xhr) {
      // params["assignerCode"]: 20344443
      // console.log("=========")
      // console.log(attr)
      if (attr === 'onreadystatechange') {
        xhr.onreadystatechange = (...args) => {
          if (this.readyState == 4) {
            // 请求成功
            if (ajax_interceptor_qoweifjqon.settings.piliang_switchOn) {
              // 开启拦截
              modifyResponse();
            }
          }
          this.onreadystatechange && this.onreadystatechange.apply(this, args);
        }
        continue;
      } else if (attr === 'onload') {
        xhr.onload = (...args) => {

          // 请求成功
          if (ajax_interceptor_qoweifjqon.settings.piliang_switchOn) {
            // 开启拦截
            modifyResponse();
          }
          this.onload && this.onload.apply(this, args);
        }
        continue;
      }

      if (typeof xhr[attr] === 'function') {
        this[attr] = xhr[attr].bind(xhr);
      } else {
        // responseText和response不是writeable的，但拦截时需要修改它，所以修改就存储在this[`_${attr}`]上
        if (attr === 'responseText' || attr === 'response') {
          Object.defineProperty(this, attr, {
            get: () => this[`_${attr}`] == undefined ? xhr[attr] : this[`_${attr}`],
            set: (val) => this[`_${attr}`] = val,
            enumerable: true
          });
        } else {
          Object.defineProperty(this, attr, {
            get: () => xhr[attr],
            set: (val) => xhr[attr] = val,
            enumerable: true
          });
        }
      }
    }
  },

  originalFetch: window.fetch.bind(window),
  myFetch: function(...args) {
    return ajax_interceptor_qoweifjqon.originalFetch(...args).then((response) => {
      let txt = undefined;
      ajax_interceptor_qoweifjqon.settings.piliang_rules.forEach(({match, overrideTxt = ''}) => {
        if (match && response.url.indexOf(match) > -1) {
          window.dispatchEvent(new CustomEvent("pageScript", {
            detail: {url: response.url, match}
          }));
          txt = overrideTxt;
        }
      });

      if (txt !== undefined) {
        const stream = new ReadableStream({
          start(controller) {
            const bufView = new Uint8Array(new ArrayBuffer(txt.length));
            for (var i = 0; i < txt.length; i++) {
              bufView[i] = txt.charCodeAt(i);
            }
  
            controller.enqueue(bufView);
            controller.close();
          }
        });
  
        const newResponse = new Response(stream, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        });
        const proxy = new Proxy(newResponse, {
          get: function(target, name){
            switch(name) {
              case 'ok':
              case 'redirected':
              case 'type':
              case 'url':
              case 'useFinalURL':
              case 'body':
              case 'bodyUsed':
                return response[name];
            }
            return target[name];
          }
        });
  
        for (let key in proxy) {
          if (typeof proxy[key] === 'function') {
            proxy[key] = proxy[key].bind(newResponse);
          }
        }
  
        return proxy;
      } else {
        return response;
      }
    });
  },
}

addInput();

window.addEventListener("message", function(event) {
  const data = event.data;
  if (data.type === 'piliang' && data.to === 'pageScript') {
    ajax_interceptor_qoweifjqon.settings[data.key] = data.value;
  }
  if (ajax_interceptor_qoweifjqon.settings.piliang_ajax_rules.some(i=>i.upfile)){
    var rule = ajax_interceptor_qoweifjqon.settings.piliang_ajax_rules.find(i=>i.upfile)
      upFile(rule)
    }
  if (ajax_interceptor_qoweifjqon.settings.piliang_ajax_rules.some(i=>i.sendPerson)){
    var rule = ajax_interceptor_qoweifjqon.settings.piliang_ajax_rules.find(i=>i.sendPerson)
    sendPerson(rule)
  }

  if (ajax_interceptor_qoweifjqon.settings.piliang_switchOn || ajax_interceptor_qoweifjqon.settings.piliang_ajax_switchOn) {
    window.XMLHttpRequest = ajax_interceptor_qoweifjqon.myXHR;
    window.fetch = ajax_interceptor_qoweifjqon.myFetch;
  } else {
    window.XMLHttpRequest = ajax_interceptor_qoweifjqon.originalXHR;
    window.fetch = ajax_interceptor_qoweifjqon.originalFetch;
  }
}, false);
function getMap(str) {
  const urlList = str.split('?')
  const paramStr = urlList.length == 2 ? urlList[1]: str
  const map = {}
    paramStr.split('&').forEach(i => map[decodeURIComponent(i.split('=')[0])]=decodeURIComponent(i.split('=').length == 2? i.split('=')[1]:''))
  return map
}



function addInput() {
  if(location.host== "crm.lianjia.com") {
    let upExeclDom = document.createElement('input');
    upExeclDom.setAttribute('class', 'ajax-help-upExecl');
    upExeclDom.setAttribute('type', 'file');
    upExeclDom.setAttribute('accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv');
    setTimeout(function () {
      document.body.appendChild(upExeclDom);
    }, 1000)
    upExeclDom.addEventListener('change', (e) => {
      var data = new FormData();
      data.append(0, e.currentTarget.files[0]);
      $.ajax({
        url: 'http://sinan.lianjia.com/message/importExcel',
        type: 'POST',
        data: data,
        dataType: 'json',
        processData: false,
        contentType: false,
        xhrFields: {
          withCredentials: true
        },
        crossDomain: true,
        success: function (res) {
          $('.ajax-help-upExecl').val('')
          let url = window._ajax_match
          window._ajax_match = ''
          let rule = ajax_interceptor_qoweifjqon.settings.piliang_ajax_rules.find(i=>i.match == url)
          rule.upfile=false
          postMessage({type: 'piliang', to: 'content', event:'person',url: url, key: 'person', value: res.data.successList.map(i => +i.ucid.substr(1))});
        }
      });
    })
  }
}
function upFile(item) {
  if(!window._ajax_match ) {
    window._ajax_match = item.match
    $('.ajax-help-upExecl').trigger('click')
  }
}
function sendPerson(item) {
  // if(!window._ajax_match ) {
  //   window._ajax_match = item.match
  const url =item.match? item.match.split("?")[0].split("//").length? item.match.split("?")[0].split("//")[1]:item.match.split("?")[0]:''
  window._xhr_map[url].open({type: 'per'})
  window._xhr_map[url].send()

  // }
}