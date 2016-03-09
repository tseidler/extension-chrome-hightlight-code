function save_settings() {
  var style = document.getElementById('output_style').value;
  var line_numbers = document.getElementById('line_numbers').checked;

  // get the selected languages and convert to Array
  var languages_checked = Array.from(document.querySelectorAll('[name="enabled_languages[]"]:checked'));
  var selected_languages = languages_checked.map(function getLanguageValue(selected_language) {
    return selected_language.value;
  });

  chrome.storage.sync.set({
    'highlight_output_style': style,
    'highlight_line_number': line_numbers,
    'highlight_languages': selected_languages
  }, function success() {
    var status = document.getElementById('status');
    status.textContent = 'Settings saved.';
    setTimeout(function () {
      status.textContent = '';
    }, 750);
  });

  chrome.runtime.sendMessage('rebuildContextMenus');
}

// on load, set the correct settings(saved values)
function restore_settings() {
  chrome.storage.sync.get({
    'highlight_output_style': 'colorful',
    'highlight_line_number':  true,
    'highlight_languages':    ['javascript', 'ruby', 'html']
  }, function (items) {
    document.getElementById('output_style').value = items.highlight_output_style;
    document.getElementById('line_numbers').checked = items.highlight_line_number;
    items.highlight_languages.forEach(function setLanguageChecked(lang_value) {
      document.querySelector('input[value="' + lang_value + '"]').checked = 'CHECKED';
    });
  });
}

function close_settings_window() {
  window.close();
}

document.addEventListener('DOMContentLoaded', restore_settings);
document.getElementById('save').addEventListener('click', save_settings);
document.getElementById('cancel').addEventListener('click', close_settings_window);
