class OsCommands extends OS {

    constructor() {
        super();
    }

    /***************************************************************************
    * COMMANDS
    ***************************************************************************/

    test(command = '', data = '') {
        console.log(command);
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

    help(detail) {
        if (detail == "") {
            this.goto('help/help');
        } else {
            this.goto(`help/${detail}`);
        }
    }

    list() {
        this.goto('list');
    }

    home() {
        this.goto('home');
    }

    hello() {
        this.addMessage('Hello, yourself.');
    }

    goto(url) {
        const self = this;
        this.addMessage("<p>Loading /" + url + " Please wait...</p>");
        this.loadPage(`pages/${url}.html`).then((markup) => {
            self.clear();
            self.addMessage(markup);
            self.updateBytes(markup.length);
            self.updatePage(url);
        })
            .catch((error) => {
                self.doError(error.status, error.message);
            });
    }

    reset() {
        location.reload();
    }

    clear() {
        this.output.innerHTML = "";
        this.output.style.bottom = '0px';
    }

    glow() {
        document.body.classList.toggle('glow');

        let message = '<p>Glow disabled</p>';

        if (document.body.classList.contains('glow')) {
            message = '<p>Glow enabled</p>';
        }

        this.addMessage(message);
    }

    scanlines() {
        this.terminal.classList.toggle('screen');

        let message = '<p>Scanlines disabled</p>';

        if (this.terminal.classList.contains('screen')) {
            message = '<p>Scanlines enabled</p>';
        }

        this.addMessage(message);
    }

    colour(requiredColour) {
        let colours = ['red', 'blue', 'white', 'amber', 'lt-amber', 'green-1', 'green-2', 'green-3', 'apple-ii', 'apple-iic'];

        if (!colours.includes(requiredColour)) {
            this.doError(0, `Colour not recogised. type 'HELP COLOUR' for a list of available colours`);
            return false;
        }

        for (const colour of colours) {

            document.body.classList.remove(colour);
        }

        document.body.classList.add(requiredColour);
        return true;

    }

    echo(string) {
        string = '<p>' + string + '</p>';
        this.addMessage(string);
    }
}

new OsCommands();