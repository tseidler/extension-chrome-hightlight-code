
function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function () {
  renderStatus('Performing Google Image search for wheeeeeee');
});
