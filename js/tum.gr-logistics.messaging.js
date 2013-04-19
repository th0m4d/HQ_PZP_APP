function GRMessaging(serivceBoundCallback, incomingMessageCallback) {

  var app2app;
  var myChannelProxy;
  var obsoleteChannels = [];
  
  var get4DigitHash = function () {
    return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
  }

  var getNewURN = function() {
    return "urn:gr-logistics:headquarter:" + get4DigitHash() + get4DigitHash();
  }

  var URN = getNewURN();

  var unbindApp2AppService = function() {
    if (typeof app2app === "undefined") {
      alert("App2app service is not available.");
      return;
    }
    app2app.unbind();
  }

  this.createChannel = function () {
      var properties = {};
      // we allow all channel clients to send and receive
      properties.mode = "send-receive";

      var config = {};
      // the namespace is an URN which uniquely defines the channel in the personal zone
      config.namespace = URN;
      config.properties = properties;
      // we can attach application-specific information to the channel
      config.appInfo = {};

      app2app.createChannel(
              config,
              // callback invoked when a client want to connect to the channel
              function(request) {
                  // we allow all clients to connect (we could also for example check some application-
                  // specific information in the request.requestInfo to make a decision)
                  return true;
              },
              // callback invoked to receive messages
              function(message) {
                  alert("The channel creator received a message: " + message.contents);
              },
              // callback invoked on success, with the client's channel proxy as parameter
              function(channelProxy) {
                  myChannelProxy = channelProxy;
                  console.log("Created channel: " + channelProxy.namespace);
                  window.onbeforeunload = function() {
                    channelProxy.send(
                      {action: "creatorLeaves", message: app2app.serviceAddress},
                    // callback invoked when the message is accepted for processing
                    function(success) {
                      // ok, but no action needed in our example
                    },
                      function(error) {
                        console.log("Could not send message: " + error.message);
                      }
                    );
                    channelProxy.disconnect();
              		};
              },
              function(error) {
                  alert("Could not create channel: " + error.message);
              }
      );
  }
  
  this.searchChannel = function() {
      if (typeof myChannelProxy !== "undefined") {
          alert("Already connected to the channel.");
          return;
      }

      app2app.searchForChannels(
              // the namespace to search for (can include a wildcard "*" instead of "example"
              // to search for all channels with prefix "org-webinos")
              URN,
              // no other zones need to be searched, only its own personal zone
              [],
              // callback invoked on each channel found, we expect it to be called at most once
              // because we did not use a wildcard
              function(channelProxy) {
                  // we directly request to connect to the channel
                  console.log("Found channel: " + channelProxy.namespace);
                  if(!(channelProxy.namespace in obsoleteChannels)) {
                    connectToChannel(channelProxy);
                  }
              },
              // callback invoked when the search query is accepted for processing
              function(success) {
                  // ok, but no action needed in our example
              },
              function(error) {
                alert("Could not search for channel: " + error.message);
                createChannel();
              }
      );
  }

  var connectToChannel = function(channelProxy) {
      // we can include application-specific information to the connect request
      var requestInfo = {};
      channelProxy.connect(
          requestInfo,
          // callback invoked to receive messages, only after successful connect
          function(message) {
            incomingMessageCallback(message);
          },
          // callback invoked when the client is successfully connected (i.e. authorized by the creator)
          function(success) {
            // make the proxy available now that we are successfully connected
            console.log("Connected to channel: " + channelProxy.namespace);
            myChannelProxy = channelProxy;
          },
          function(error) {
              alert("Could not connect to channel: " + error.message);
          }
      );
  }
  
  this.sendBroadcast = function() {
    if (typeof myChannelProxy === "undefined") {
        alert("You first have to create the channel.");
        return;
    }

    var message = new Object();
    message.id = "id";
    message.type = "broadcast";
    message.message = $('#msg_send').val();

    // send message to all connected clients (in our example this is only one)
    myChannelProxy.send(
            message,
            // callback invoked when the message is accepted for processing
            function(success) {
              $('#msg_send').empty();
            },
            function(error) {
                alert("Could not send message: " + error.message);
            }
    );
  }


  this.sendMessageTo = function(id, success, failure) {
    if (typeof myChannelProxy === "undefined") {
        alert("You first have to connect to the channel.");
        return;
    }

    var message = new Object();
    message.id = webinos.session.getPZPId();
    message.type = "unicast";
    message.message = $('#msg_send').val();

      // send message to all connected clients (in our example this is only one)
      myChannelProxy.send(
              message,
              // callback invoked when the message is accepted for processing
              function(success) {
                  // ok, but no action needed in our example
              },
              function(error) {
                  alert("Could not send message: " + error.message);
              }
      );
  }
  
  var connectToNextChannel = function() {

    if (typeof myChannelProxy === "undefined") {
      alert("Not connected to a channel.");
      return;
    }

    myChannelProxy.disconnect(function(){
      obsoleteChannels[myChannelProxy.namespace] = myChannelProxy;		
      myChannelProxy = undefined;
      searchChannel();
    }, function(error){
      console.log(error.message);
    });

  }
  
  webinos.discovery.findServices(new ServiceType("http://webinos.org/api/app2app"), {
      onFound: function (service) {
          service.bindService({
              onBind: function () {
                if(typeof app2app === "undefined") {
                  app2app = service;
                  window.onbeforeunload = function() {unbindApp2AppService()};
                  serivceBoundCallback();
                }
              }
          });
      },
      onError: function (error) {
          alert("Error finding service: " + error.message + " (#" + error.code + ")");
      }
  });

}
