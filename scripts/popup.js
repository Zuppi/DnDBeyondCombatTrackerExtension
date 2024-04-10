document.getElementById('dndcte_resetTrackerBtn').addEventListener('click', reset_tracker);

function reset_tracker() {
    if (confirm('Are you sure you want to reset?') == true) {
        sendToContent('reset');
    }
}

function sendToContent(message_to_send) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, message_to_send);
    });
}