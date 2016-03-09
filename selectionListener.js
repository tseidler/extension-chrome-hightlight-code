// workaround: Chrome's contextMenu's selectionText property strips whitespaces
document.addEventListener('mouseup', function () {
  var selection = window.getSelection().toString();
  if(selection.length > 0) {
    chrome.runtime.sendMessage(
      {
        'type':       'selection',
        'selection':  selection
      }
    );
  }
});
