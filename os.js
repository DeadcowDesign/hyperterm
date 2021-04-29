class DDOS {

    constructor() {
        this.output = document.getElementById('output'),
            this.input = document.getElementById('input-bar'),
            this.terminal = document.getElementById('terminal');
        this.command = '',
            this.data = '';

        this.init();
    }

    init() {
        this.input.focus();
        this.disableMouseAndKeys();
        this.startInputListener();
        this.goto('home');
    }

    /**
     * disableMouseAndKeys - prevents the user from clicking any elements
     * and returns focus to the input bar if the user attempts to use their
     * mouse on the page.
     * 
     * Also disables default behaviour for the enter key to enable single line
     * input for the input bar.
     */
    disableMouseAndKeys() {
        window.addEventListener('click', () => {
            this.addMessage("<p>Mouse navigation is disabled. Returning control to command bar.</p>");
            this.input.focus();
        })
    }

    /**
     * startInputListener - listen for keyboard events from this method. Any
     * special keys should be added in here. Note that we disable Enter, Esc, 
     * and the left and right arrows to prevent issues with the OS.
     */
    startInputListener() {
        const self = this;

        this.input.addEventListener("keydown", (event) => {

            switch (event.key) {
                case 'Enter':
                    event.preventDefault();
                    this.processCommand(this.input.innerText);
                    this.input.innerText = '';
                    break;

                case 'Escape':
                    event.preventDefault();
                    this.input.innerText = '';
                    break;
                
                case 'ArrowLeft':
                case 'ArrowRight':
                    event.preventDefault();
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this.scroll(24, true);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.scroll(24);
                    break;
            }
        })
    }

    /**
     * scroll - allow the user to scroll the output window with their cursor
     * keys. Probably wouldn't have been a feature of original green-screen
     * terminals, but we have to make some allowances for modernity and
     * practicality.
     * 
     * @param {int} amount The amount in pixels each keypress should scroll by
     * @param {string} up Set true to scroll up, else down.
     */
    scroll(amount, up = false) {
        let bottom = parseInt(this.output.style.bottom);

        if (up) {
                this.output.style.bottom = (bottom - amount) + 'px';
        } else {
            this.output.style.bottom = (bottom + amount) + 'px';
        }
    }
    /**
     * addMessage - add a message to the terminal. Valid HTML should be passed
     * to this function. Note that this will not clear the terminal and any
     * message will be added to the bottom of the stack. Call the clear function
     * first if the terminal window should be wiped before adding the message
     */
    addMessage(markup) {
        output.insertAdjacentHTML('beforeend', markup);
    }

    /**
     * processCommand takes a command string and parses it for further processing
     * commands consist of a maximum of two parts, the command, and the data that
     * is passed to the command. Each command can only take a single piece of
     * data.
     * @param {string} input 
     */
    processCommand(input) {
        input = input.toLowerCase();

        let [command, ...data] = input.split(" ");

        this.command = command;
        this.data = data.join(" ");

        if (typeof this[this.command] !== 'function') {
            this.doError(1, `Command '${this.command}' not recognised`);
            return false;
        }

        return this[this.command](data);
    }

    /**
     * loadPage ajax out to a specified resource and return it.
     * 
     * @return {promise} A JavaScript promis object
     */
    loadPage(page = '') {

        let httpRequest = new XMLHttpRequest();

        return new Promise((resolve, reject) => {

            httpRequest.onreadystatechange = () => {

                if (httpRequest.readyState === XMLHttpRequest.DONE) {

                    if (httpRequest.status === 200) {

                        resolve(httpRequest.responseText);

                    } else if (httpRequest.status === 404) {

                        reject({ status: httpRequest.status, message: "The requested page could not be found." });

                    } else {

                        reject({ status: httpRequest.status, message: "There was a problem loading the page. Please refresh the page or try again later" });
                    }
                }
            }

            let cachebuster = Math.round(new Date().getTime() / 1000);
            httpRequest.open('GET', page + '?cb=' + cachebuster);

            httpRequest.send();
        });
    }

    /**
     * updateBytes - update the number of bytes loaded in the status bar
     * @param {int} bytes Number of bytes loaded
     */
    updateBytes(bytes = 0) {
        document.getElementById('bytes').innerText = bytes;
    }

    /**
     * updatePage - update the current page displayed in the status bar
     * @param {string} url Name of page
     */
    updatePage(url = '') {
        document.getElementById('pageName').innerText = '/' + url;

    }
    /***************************************************************************
    * COMMANDS
    ***************************************************************************/

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

    doError(code = 0, message = '') {
        this.addMessage(`<p>The OS could not process your request because of an error.</p>`);
        let errorMessage = '<p>';
        if (code) {
            errorMessage += `Code: ${code} `; 
        }
        
        errorMessage += `Message: `;

        if (message) {
            errorMessage += message;
        } else {
            errorMessage += "Unidentified Error";
        }

        errorMessage += '</p>';

        this.addMessage(errorMessage);
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
        let colours = ['amber', 'lt-amber', 'green-1', 'green-2', 'green-3', 'apple-ii', 'apple-iic'];

        for (const colour of colours) {

            document.body.classList.remove(colour);

            if (colour == requiredColour) {
                document.body.classList.add(requiredColour);

                return true;
            }
        }

        this.doError(0, `Colour not recogised. type 'HELP COLOUR' for a list of available colours`);
    }
}