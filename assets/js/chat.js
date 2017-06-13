var Chat = function(opts) {
  // DOM cache - chat window
  this.$chatMessageBody = $(opts.chatBody);
  this.$chatMessage = $(opts.chatMessage);
  this.$chatSubmitBtn = $(opts.chatBtn);

  this.$chatSubmitBtn.on('click', this.postChatMessage);
};

Chat.prototype.postChatMessage = function() {
  this.$chatMessageBody.append($('<p></p>').text(this.$chatMessage.text));
};

Chat.prototype.enableChat = function() {
  this.$chatSubmitBtn.removeClass('disabled');
};
