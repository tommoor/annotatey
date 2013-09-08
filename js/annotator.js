$(function(){
    var img = new Image();
    var canvas = $('canvas').get(0);
    
    $('nav').animate({top: 0}, 500);
    $('a.dropbox-save').click(function() {
        var data = canvas.toDataURL('image/png');
        console.log('saving modifications');
        localStorage.lastCapture = data;
        
        chrome.runtime.sendMessage({save: true});
    });
    
    img.onload = function() {
        console.log(img.width, img.height);
        
        var context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        $('canvas').sketch();
        context.drawImage(img, 0, 0, img.width, img.height);
    };
    
    img.src = localStorage.lastCapture;
});