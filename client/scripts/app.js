// YOUR CODE HERE:
var app = {};

app.rooms = new Set();
app.username;
app.server = 'http://127.0.0.1:3000'
//================================initialize and rerender callout ==============================//
app.init = function() {
  app.username = window.location.search.match(/\?username([^\?])*/)[0].split('=')[1];
  $('#roomLabel').text('Tweet Feed');
  app.fetch();
};

app.fetch = function() {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server + '/classes/messages',
    type: 'GET',
    data: 'order=-createdAt',
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message received', data);
      app.displayTweets(data);
      app.setRoomSelector(data);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to get message', data);
    }
  });
};

app.filterFetch = function (category, filter) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server + '/classes/messages',
    type: 'GET',
    data: 'where={' + JSON.stringify(category) + ':{"$regex":' + JSON.stringify(filter) + '}}',
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message received', data);
      app.displayTweets(data);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to get message', data);
    }
  });
};

//=============================parses and displays tweeets ===================================//
app.displayTweets = function(data) {
  var index = 0;
  data.results.forEach(function(tweet) {
    if (!tweet.username || !tweet.text) {
      return;
    } else {
      if (index < 10) {
        tweet.text = tweet.text.replace(/[\<\>\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        tweet.username = tweet.username.replace(/[\<\>\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        $('#tweet' + index + ' .author').text(tweet.username);
        $('#tweet' + index + ' .tweetText').text(tweet.text);

        index++;
      }
    }
  });
};

// ========================= all methods that deal with Rooms =================================//
app.setRoomSelector = function(data) {
  data.results.forEach(function(tweet) {
    if (tweet.roomname) {
      if (!tweet.roomname.includes('<')) {
        app.rooms.add(tweet.roomname);
      } 
    }
  });

  $('#roomSelector').empty();
  this.rooms.forEach(function(room) {
    $('#roomSelector').append("<option value='" + room + "'>" + room + "</option>");
  });
  $('#roomSelector').append("<option value='newRoom'>New room...</option>");
  $('.roomInput').hide();

  $('.roomList').empty();
  this.rooms.forEach(function(room) {
    $('.roomList').append("<li value='" + room + "'>" + "<a href = '#' onclick = 'app.filterRoom(this)'><p>" + room + "</p></a></li>");
  });
};

app.makeRoom = function(room) {
  if (room === 'newRoom') {
    $('.roomInput').show();
  } else {
    $('.roomInput').hide();
  }

};

app.filterRoom = function(roomLink) {
  var roomName = roomLink.firstElementChild.innerHTML;
  app.filterFetch('roomname', roomName);
  $('#roomLabel').text(roomName);
};

// ========================= all methods that deal with Users =================================//

app.filterUser = function(userLink) {
  var userName = userLink.firstElementChild.innerHTML;
  app.filterFetch('username', userName);
  $('#roomLabel').text(userName);
};

//============================posting methods ==================================================//
app.newPost = function () {
  var form = document.getElementById('form');
  var message = {};
  message.username = app.username;
  message.text = form.message.value;
  if (form.roomSelector.value === 'newRoom') {
    message.roomname = form.roomInput.value;
  } else {
    message.roomname = form.roomSelector.value;  
  }
  this.postMessage(message);
  console.log(message);
};

app.postMessage = function(message) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server + '/classes/messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
      app.fetch();
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

//initialize app
$(document).ready(function() {
  app.init();
  $('#userIdDisplay').text(app.username);
});
