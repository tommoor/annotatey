function captureTab() {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.captureVisibleTab({format: 'png', quality: 1}, function(data){
            chrome.windows.getCurrent(function(win){
                
                console.log('saving and sending...', data);
                localStorage.lastCapture = data;
                
                chrome.tabs.sendMessage(tab.id, {width: win.width, height: win.height});
            });
        });
    });
}

chrome.browserAction.onClicked.addListener(function(){
    console.log('clicked');
    
    captureTab();
});