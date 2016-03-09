chrome.runtime.onInstalled.addListener(installListener);
chrome.runtime.onMessage.addListener(messageListener);
chrome.contextMenus.onClicked.addListener(contextMenuListener);
var selectedText = '';
var numberOfNotificationsSent = 0;
var languageDict = {
  'csharp':       'C#',
  'cpp':          'C++',
  'd':            'D',
  'fsharp':       'F#',
  'html':         'HTML',
  'javascript':   'JavaScript',
  'json':         'JSON',
  'php':          'PHP',
  'python':       'Python',
  'ruby':         'Ruby',
  'scss':         'SCSS',
  'yaml':         'YAML'
};

function installListener() {
  rebuildContextMenusFromOptions();
}
function messageListener(request) {
  if(request.type === 'rebuildContextMenus') {
    rebuildContextMenusFromOptions();
  } else if(request.type === 'selection') {
    selectedText = request.selection;
  }
}
function contextMenuListener(info) {
  if(info.parentMenuItemId === 'tseidler_hilite_code') {
    var language = info.menuItemId.slice('tseidler_hilite_language_'.length);
    highlightSelection(selectedText, language);
  } else if(info.menuItemId === 'tseidler_hilite_code') {
    // if no language is given, highlightSelection will use the first language
    highlightSelection(selectedText);
  }
}

function rebuildContextMenusFromOptions() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    'id':         'tseidler_hilite_code',
    'title':      'Selection to hilite.me',
    'contexts':   ['selection']
  });

  chrome.storage.sync.get({
    'highlight_languages': ['javascript', 'ruby', 'html']
  }, function (items) {
    // if there's only one item, render only the top-level context item
    if(items.highlight_languages.length > 1) {
      items.highlight_languages.forEach(createContextMenuForLanguage);
    }
  });
}

function createContextMenuForLanguage(language_key) {
  chrome.contextMenus.create({
    'id':         'tseidler_hilite_language_' + language_key,
    'title':      languageDict[language_key],
    'parentId':   'tseidler_hilite_code',
    'contexts':   ['selection']
  });
}

function highlightSelection(selection, lexer) {
  // get settings from storage & do request
  chrome.storage.sync.get({
    'highlight_output_style': 'colorful',
    'highlight_line_number':  false,
    'highlight_div_styles': 'none',
    'highlight_languages':  ['javascript']
  }, function (items) {
    var settings = {
      'lexer':      lexer || items.highlight_languages[0] || 'javascript',
      'style':      items.highlight_output_style,
      'linenos':    items.highlight_line_number || '',
      'divstyles':  items.highlight_div_styles
    };

    doHilightAPIRequest(selection, settings, copyToClipBoard);
  });
}

function doHilightAPIRequest(text, options, callback) {
  var api_uri = 'http://hilite.me/api';
  var data = new FormData();
  data.append('code', text);
  Object.keys(options).forEach(function (key) {
    data.append(key, options[key]);
  });

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.addEventListener('readystatechange', function () {
    if (this.readyState === this.DONE) {
      callback(this.responseText);
      renderStatusNotification('Done! HTML copied to clipboard.');
    }
  });
  xhr.open('POST', api_uri);
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

function renderStatusNotification(message) {
  var notificationOptions = {
    'type':       'basic',
    'title':      'Highlighting done!',
    'message':    message,
    'iconUrl':    'icons/icon128.png',
    'isClickable': false
  };
  chrome.notifications.create(String(numberOfNotificationsSent++), notificationOptions);
}
