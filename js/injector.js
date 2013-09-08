chrome.runtime.onMessage.addListener(function(message, sender) {
    console.log('received, injecting iframe');
    
    $('body').prepend('<iframe src="' + chrome.extension.getURL('annotator.html') + '" frameborder="0" style="border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; z-index: 2147483647; position: fixed; width: 100%; left: 0px; top: 0px; height: 100%; display: block; visibility: visible; outline-style: none; outline-width: 0px; outline-color: rgb(0, 0, 0); "></iframe>');
});