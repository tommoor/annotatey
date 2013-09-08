chrome.runtime.onMessage.addListener(function(message, sender) {
    Dropbox.appKey = "3d12yhf7o4aj1un";
    
    $('body').html('<img src="' + message.capture + '"/>');
    console.log('replaced');
    console.log(Dropbox);
    
    var canvas = $('<canvas/>').get(0);
    canvas.width = message.width;
    canvas.height = message.height;
    
    var context = canvas.getContext('2d');
    context.drawImage(message.capture, 0, 0, message.width, message.height);
    context.toBlob(function(url){
        console.log(url);
    });
});