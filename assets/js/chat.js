var Chat = function(opts) {
  // DOM cache - chat window
  this.$chatMessageBody = $(opts.chatBody);
  this.$chatMessage = $(opts.chatMessage);
  this.$chatSubmitBtn = $(opts.chatBtn);

  this.mesRef = firebaseModule.database.ref('messages');
  this.messages = [];

  this.$chatSubmitBtn.on('click', this.postChatMessage.bind(this));
};

Chat.prototype.postChatMessage = function(msg) {
  let message = msg;
  this.$chatMessageBody.append($('<li></li>').text(message).addClass('list-group-item'));
};

Chat.prototype.submitChatMessage = function() {
  let message = this.$chatMessage.val();
  if (message.length < 1) {
    return;
  }
  let messageRef = this.mesRef.push();
  messageRef.set({ message: message }).then(this.postChatMessage(message));
};

Chat.prototype.enableChat = function() {
  console.log('enabling chat');
  this.$chatSubmitBtn.removeClass('disabled');
};

Chat.prototype.displayMessages = function() {
  let self = this;
  self.mesRef.on('value', function(snap) {
    console.log(snap.val());
    snap.forEach(function(childSnap) {
      self.messages.push(childSnap.val().message);
      self.postChatMessage(childSnap.val().message);
    });
  });
};
