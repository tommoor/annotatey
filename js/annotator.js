$(function(){
    var img = new Image();
    var $canvas = $('canvas');
    var $window = $(window);
    var canvas = $canvas.get(0);
     
    $('nav').animate({top: 0}, 500);
    $('a.dropbox-saver').click(function() {
        var data = canvas.toDataURL('image/png');
        
        // give user feedback
        $(this).find('.action').text('Saving to Dropbox');
        
        localStorage.lastCapture = data;
        
        chrome.runtime.sendMessage({save: true});
    });
    
    $('a.file-saver').click(function() {
        $canvas.data('sketch').download('png');
    });
    
    $('a.close').click(function() {
        parent.closeMe();
    });
    
    $('a.color').click(function() {
        $('a.color').removeClass('selected');
        $(this).addClass('selected');
    });
    
    $('a.tool').click(function() {
        $('a.tool').removeClass('selected');
        $(this).addClass('selected');
    });
    
    canvas.width = $window.width();
    canvas.height = $window.height();
    $canvas.sketch();
    $canvas.data('sketch').load(localStorage.lastCapture);
});

chrome.runtime.onMessage.addListener(function(message, sender) {
    if (message.saved) {
        $('a.dropbox-saver').addClass('dropbox-dropin-success').find('.action').text('Save to Dropbox');
    }
});