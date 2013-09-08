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
    captureTab();
});

chrome.contextMenus.create({
    title: "Annotate Page",
    contexts: ["page"],
    id: "annotate"
});

chrome.contextMenus.onClicked.addListener(function(){
    captureTab();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('clicked save button');
    
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
      
      var img = new Image();
      var canvas = $('<canvas/>').get(0);
      canvas.width = request.width;
      canvas.height = request.height;
      
      img.onload = function() {
          console.log('converting...');
      
          var context = canvas.getContext('2d');
          var filename = localStorage.filename + ".png";
      
          context.drawImage(img, 0, 0, request.width, request.height);
          canvas.toData(function(data){
         
             console.log('saving...');
         
             // reader.result contains the contents of blob as a typed array
             client.writeFile(filename, data, function(error, stat) {
               if (error) {
                 return console.log(error);  // Something went wrong.
               }
           
               console.log('file saved, getting public link');
           
               chrome.tabs.getSelected(null, function(tab) {
                   chrome.tabs.sendMessage(tab.id, {saved: true});
               });
           
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