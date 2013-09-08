function captureTab() {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.captureVisibleTab({format: 'png', quality: 1}, function(data){
            chrome.windows.getCurrent(function(win){
                
                console.log('saving and triggering...');
                var filename = tab.url.toLowerCase().replace(/^https?/,'').replace(/[^\w ]+/g,'').replace(/ +/g,'-');
                
                localStorage.lastCapture = data;
                localStorage.filename = filename;
                chrome.tabs.sendMessage(tab.id, {trigger: true});
            });
        });
    });
}

chrome.browserAction.onClicked.addListener(function(){
    console.log('clicked');
    
    captureTab();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('clicked save button');
    
    chrome.windows.getCurrent(function(win){
    
        var client = new Dropbox.Client({key: "8yj4y7fh3x131iu"});
        client.authDriver(new Dropbox.AuthDriver.Chrome({receiverUrl: 'chrome_oauth_receiver.html'}));

        client.authenticate({interactive: true}, function(error, client) {
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
          
          var img = new Image();
          var canvas = $('<canvas/>').get(0);
          canvas.width = win.width;
          canvas.height = win.height;

          img.onload = function() {
              console.log('converting...');
              
              var context = canvas.getContext('2d');
              var filename = localStorage.filename + ".png";
              
              context.drawImage(img, 0, 0, win.width, win.height);
              canvas.toData(function(data){
                 
                 console.log('saving...');
                 
                 // reader.result contains the contents of blob as a typed array
                 client.writeFile(filename, data, function(error, stat) {
                   if (error) {
                     return console.log(error);  // Something went wrong.
                   }
                   
                   console.log('file saved, getting public link');
                   
                   client.makeUrl(filename, function(error, link){
                       console.log('public link is', link);
                       window.open(link.url);
                   });
                 });
              }, 'image/png');
          };
          
          img.src = localStorage.lastCapture;
        });
    });
});