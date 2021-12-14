class OsCommands extends OS {

    constructor() {
        super();
    }

    /***************************************************************************
    * COMMANDS
    ***************************************************************************/

    test(command = '', data = '') {
        if (command == '') {
            this.clear();
            this.addMessage(`<p>Would you like to save? Y/N</p>`);
            this.awaitingInput = 'test';
        } else if (command !== 'y' && command !== 'n') {
            this.doError(0, `Invalid Input. Please enter 'Y' or 'N'`);
            this.awaitingInput = 'test';
        } else if (command == 'y') {
            this.addMessage(`<p>Data saved.</p>`);
        } else {
            this.addMessage(`<p>Save cancelled.</p>`);
        }
    }


}

var OSObj = new OsCommands();
