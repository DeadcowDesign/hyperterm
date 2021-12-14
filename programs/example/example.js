OS.prototype.example = function() {
    const self = this;
    this.addMessage('<p>This is the example command</p>');
    this.addMessage('<p>This is part of the example program');
}

OsCommands.prototype.help = function() {
    const self = this;
    this.open('programs/example/help.html');
    this.addMessage('<p>This is part of the example program');
}