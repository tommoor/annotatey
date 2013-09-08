$(function(){
    $('a.sign-out').click(function(ev){
        ev.preventDefault();
        
        var client = new Dropbox.Client({key: "8yj4y7fh3x131iu"});
        client.authDriver(new Dropbox.AuthDriver.Chrome({receiverUrl: 'chrome_oauth_receiver.html'}));
        client.signOut(function(){
            window.close();
        });
    });
});