// Only add the context menu when the extension is installed/updated
chrome.runtime.onInstalled.addListener(function () {
  rebuildContextMenusFromOptions();
});

var default_options = {
  'lexer'     : 'javascript',
  'style'     : 'colorful',
  'linenos'   : true,
  'divstyles' : 'none'
};
var api_uri = 'http://hilite.me/api';

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if(info.menuItemId === 'tseidler_hilite_code') {
    highlightSelection(info, tab);
  }
});

chrome.runtime.onMessage.addListener(
  function(request) {
    console.log('REQUESTETET', request);
    if(request === "rebuildContextMenus") {
      rebuildContextMenusFromOptions();
    }
  }
);

function highlightSelection(info) {
  requestHiliteHTML(info.selectionText, default_options, copyToClipBoard);
}

function rebuildContextMenusFromOptions() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    'id':       'tseidler_hilite_code',
    'title':    'Selection to hilite.me',
    'contexts': ['selection']
  });

  chrome.storage.sync.get({
    highlight_languages: ['php', 'javascript', 'ruby']
  }, function (items) {
    items.highlight_languages.forEach(createContextMenuForLanguage);
  });
}

function createContextMenuForLanguage(language_key) {
  chrome.contextMenus.create({
    'id':         'tseidler_hilite_language_' + language_key,
    'title':      language_key,
    'parentId':   'tseidler_hilite_code',
    'contexts': ['selection']
  });
}

function requestHiliteHTML(text, options, callback) {
  var data = new FormData();
  data.append("code", text);
  data.append("lexer", "javascript");

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
