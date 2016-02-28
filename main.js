chrome.runtime.onInstalled.addListener(installListener);
chrome.contextMenus.onClicked.addListener(contextMenuListener);
chrome.runtime.onMessage.addListener(messageListener);

function installListener() {
  rebuildContextMenusFromOptions();
}
function contextMenuListener(info) {
  if(info.parentMenuItemId === 'tseidler_hilite_code') {
    var language = info.menuItemId.slice('tseidler_hilite_language_'.length);
    highlightSelection(info.selectionText, language);
  }
}
function messageListener(request) {
  if(request === "rebuildContextMenus") {
    rebuildContextMenusFromOptions();
  }
}

function highlightSelection(selection, lexer) {
  // get settings from storage & do request
  chrome.storage.sync.get({
    'highlight_output_style': 'colorful',
    'highlight_line_number':  true,
    'highlight_div_styles': 'none'
  }, function (items) {
    var settings = {
      'lexer':      lexer,
      'style':      items.highlight_output_style,
      'linenos':    items.highlight_line_number,
      'divstyles':  items.highlight_div_styles
    };

    doHilightAPIRequest(selection, settings, copyToClipBoard);
  });
}

function doHilightAPIRequest(text, options, callback) {
  var api_uri = 'http://hilite.me/api';
  var data = new FormData();
  data.append("code", text);
  Object.keys(options).forEach(function (key) {
    data.append(key, options[key]);
  });

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      console.log(this.responseText);
      callback(this.responseText);
    }
  });
  xhr.open("POST", api_uri);
  xhr.send(data);
}

function copyToClipBoard(info) {
  // copy to clipboard
  var copyFrom = document.createElement('textarea');
  var body = document.querySelector('body');

  copyFrom.textContent = info;
  body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  body.removeChild(copyFrom);
}

function rebuildContextMenusFromOptions() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    'id':         'tseidler_hilite_code',
    'title':      'Selection to hilite.me',
    'contexts':   ['selection']
  });

  chrome.storage.sync.get({
    'highlight_languages': ['php', 'javascript', 'ruby']
  }, function (items) {
    items.highlight_languages.forEach(createContextMenuForLanguage);
  });
}

function createContextMenuForLanguage(language_key) {
  chrome.contextMenus.create({
    'id':         'tseidler_hilite_language_' + language_key,
    'title':      language_key,
    'parentId':   'tseidler_hilite_code',
    'contexts':   ['selection']
  });
}
