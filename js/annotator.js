$(function(){
    var img = new Image();
    var $canvas = $('canvas');
    var $window = $(window);
    var canvas = $canvas.get(0);
     
    $('nav').animate({top: 0}, 500);
    $('a.dropbox-save').click(function() {
        var data = canvas.toDataURL('image/png');
        console.log('saving modifications');
        localStorage.lastCapture = data;
        
        chrome.runtime.sendMessage({save: true});
    });
    
    console.log($window.width(), $window.height());
    
    canvas.width = $window.width();
    canvas.height = $window.height();
    $canvas.sketch();
    $canvas.data('sketch').load(localStorage.lastCapture);
});