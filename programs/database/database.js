OS.prototype.Database = '';
OS.prototype.Request = null;
OS.prototype.CommandBuffer = [];

OS.prototype.main = function() {

    if (!window.indexedDB) {
        this.addMessage("<p>Your system does not support the Database program.<p><p>Please contact your local HyperTerMinaL representative.</p>");
        return false;
    }
    this.clear();
    this.goto('programs/database/database.html')
    this.setTitleBar("Database");
    this.setCommandPrompt("Open a Database:");
    this.setStatusBar("Database Seleted: none");
    this.awaitingInput = 'open';
}

/**
 * open - open a database for CRUD operations
 * @param {string} dbName The name of the database to be opened
 */
OS.prototype.open = function(dbName) {
    this.clear();
    const self = this;

    let request = indexedDB.open(dbName);

    request.onerror = (event) => {
        self.addMessage('An error occurred while trying to open the database: ' + event.target.errorCode);
    }

    request.onsuccess = (event) => {
        self.Database = event.target.result;
        self.setStatusBar(`Database Selected: ${dbName}`);
        this.setCommandPrompt('Database Ready: ');
    }

    request.onupgradeneeded = () => {
        self.setup();
    }
}

OS.prototype.setup = (command, data) => {

    if (Object.keys(this.CommandBuffer).length == 0) {
        this.addMessage('<p>You are creating a new Database. Please define your columns.</p>')
    }
}

OS.prototype.setupColName = function() {
    this.setCommandPrompt('New column name: ');

}