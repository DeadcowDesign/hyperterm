OS.prototype.main = function() {
    this.setCommandPrompt("READY: ");
    this.setTitleBar("EXAMPLE");
}

OS.prototype.example = function() {
    const self = this;
    this.addMessage('<p>This is the example command</p>');
    this.addMessage('<p>This is part of the example program');
}

OS.prototype.help = function() {
    const self = this;
    this.goto('programs/example/help.html');
    this.addMessage('<p>This is part of the example program');
}