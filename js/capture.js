function captureTab() {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.captureVisibleTab({format: 'png', quality: 1}, function(data){
            chrome.windows.getCurrent(function(win){
                
                console.log('sending...', data);
                chrome.tabs.sendMessage(tab.id, {capture: data, width: win.width, height: win.height});
            });
        });
    });
}

chrome.browserAction.onClicked.addListener(function(){
    console.log('clicked');
    
    captureTab();
});