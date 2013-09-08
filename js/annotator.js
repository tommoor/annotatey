$(function(){

    /*
    var img = new Image();
    var canvas = $('<canvas/>').get(0);
    canvas.width = $(window).width();
    canvas.height = $(window).height();
    
    img.onload = function() {
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(function(url){
            console.log('blob response', url);
            
            $('body').prepend(Dropbox.createSaveButton(url, 'annotation.png'));
            
        }, 'image/png');
    };

    img.src = localStorage.lastCapture;
    */
    
    $('body').prepend('<a class="dropbox-save">Save to Dropbox</a>');
    $('a.dropbox-save').click(function() {
        
        var client = new Dropbox.Client({ key: "8yj4y7fh3x131iu" });
        client.authDriver(new Dropbox.AuthDriver.Chrome({receiverPath: "chrome_oauth_receiver.html"}));
        
        console.log('authenticate');
        client.authenticate(function(error, client) {
          if (error) {
              console.log(error);
            // Replace with a call to your own error-handling code.
            //
            // Don't forget to return from the callback, so you don't execute the code
            // that assumes everything went well.
            return;
          }

          // Replace with a call to your own application code.
          //
          // The user authorized your app, and everything went well.
          // client is a Dropbox.Client instance that you can use to make API calls.
          console.log('authenticated', client);
        });
    });
});