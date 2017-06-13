var Chat = function(opts) {
  // DOM cache - chat window
  this.$chatMessageBody = $(opts.chatBody);
  this.$chatMessage = $(opts.chatMessage);
  this.$chatSubmitBtn = $(opts.chatBtn);

  this.mesRef = firebaseModule.database.ref('messages');

  this.$chatSubmitBtn.on('click', this.submitChatMessage.bind(this));
};

Chat.prototype.postChatMessage = function(msg, user) {
  let $username = $('<span></span>').addClass('text-primary').text(`${user} says:`);
  let $message = $('<p></p>').append($username).append(` ${msg}`);
  this.$chatMessageBody.prepend($('<li></li>').html($message).addClass('list-group-item'));
};

Chat.prototype.submitChatMessage = function() {
  let message = this.$chatMessage.val();
  let username = $('#username').attr('data-username');
  if (message.length < 1) {
    return;
  }
  let messageRef = this.mesRef.push();
  messageRef.set({ message: message, user: username });
};

Chat.prototype.enableChat = function() {
  this.$chatSubmitBtn.removeClass('disabled');
};

Chat.prototype.listenForMessages = function() {
  let self = this;
  self.mesRef.on('child_added', function(snap) {
    self.postChatMessage(snap.val().message, snap.val().user);
  });
};
