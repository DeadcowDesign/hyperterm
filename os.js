class OS {

    constructor() {
        this.output         = '',
        this.input          = '',
        this.caret          = '',
        this.terminal       = '',
        this.command        = '',
        this.awaitingInput  = '',
        this.program        = '',
        this.data           = '';

        this.boot();
    }

    /**
     * addMessage - add a message to the terminal. Valid HTML should be passed
     * to this function. Note that this will not clear the terminal and any
     * message will be added to the bottom of the stack. Call the clear function
     * first if the terminal window should be wiped before adding the message
     */
    addMessage(markup) {
        this.output.insertAdjacentHTML('beforeend', markup);
    }

    boot() {
        const self = this;
        document.addEventListener("DOMContentLoaded", () => {
            self.buildInterface();
            self.input.focus();
            self.startInputListener();
            self.goto('pages/home.html');
        });
    }

    buildInterface() {
        // Build the terminal container
        this.terminal = document.createElement('div');
        this.terminal.classList.add('terminal', 'screen');
        this.terminal.setAttribute('id', 'terminal');
        document.body.appendChild(this.terminal);

        // Build the header
        let header = document.createElement('header');
        let h1 = document.createElement('h1');
        h1.innerHTML = '<h1><i>H</i>yper<i>T</i>er<i>M</i>ina<i>L</i> - (HTML)</h1>';
        header.appendChild(h1);
        //let pageData = document.createElement('p');
        //pageData.innerHTML = '<p>Page: <span id="pageName"></span></p>';
        //header.appendChild(pageData);
        let byteData = document.createElement('p');
        byteData.innerHTML = '<p>Loaded <span id="bytes"></span> bytes</p>';
        header.appendChild(byteData);
        this.terminal.appendChild(header);

        // Build the output container
        let outputWrapper = document.createElement('div');
        outputWrapper.classList.add('output-wrapper');
        this.terminal.appendChild(outputWrapper);
        this.output = document.createElement('div');
        this.output.classList.add('output');
        this.output.setAttribute('id', 'output');
        this.output.style.bottom = '0px';
        outputWrapper.appendChild(this.output);
        this.terminal.appendChild(outputWrapper);

        // Build the input
        let inputWrapper = document.createElement('div');
        inputWrapper.classList.add("input");
        let barText = document.createElement('p');
        barText.innerText = "Enter command: ";
        inputWrapper.appendChild(barText);
        this.input = document.createElement('input');
        this.input.classList.add('input-bar');
        this.input.setAttribute('id', "input-bar");
        this.input.setAttribute('tabindex', '0');
        inputWrapper.appendChild(this.input);
        this.terminal.appendChild(inputWrapper);

        return true;
    }

    /**
     * clear - clear the terminal window
     */
    clear() {
        this.output.innerHTML = "";
        this.output.style.bottom = '0px';
    }

    /**
     * doError - output an OS error to the screen.
     * 
     * @param {int} code The error code
     * @param {String} message The error message
     */
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

    /**
     * goto - goto a page on the website or a link
     * @param {utl} url the requested URL
     */
    goto(url) {

        if (url.match(/^[0-9]{1,}$/)) {
            let targetLink = document.querySelector(`[data-index="${url}"]`);

            if (!targetLink) {

                this.doError(0, "Unrecognised link ID");
                return false;
            }

            url = targetLink.getAttribute("href");
        }

        // Open external site
        if (url.match(/^http(s)?:/)) {

            this.addMessage('<p>Opening link in new window in 5 seconds<p>');
            this.timer(5, () => window.open(url));


        } else {

            // Open internal page
            const self = this;
            this.addMessage("<p>Loading /" + url + " Please wait...</p>");
            this.loadPage(`${url}`).then((markup) => {
                self.clear();
                self.addMessage(markup);
                self.updateBytes(markup.length);
                self.updatePage(url);
                self.parseLinks();
            })
                .catch((error) => {
                    self.doError(error.status, error.message);

                    return false;
                });
        }

        return true;
    }

    /**
     * loadPage ajax out to a specified resource and return it.
     * 
     * @return {promise} A JavaScript promis object
     */
    loadPage(page = '') {

        this.addMessage('<p>' + page + '</p>');

    }

    /**
     * parseLinks - loop through the page links and add a link
     * identifier to them so they can be access via the command
     * @returns boolean on success
     */
    parseLinks() {
        let links = this.output.querySelectorAll('a');

        for (let i = 0; i < links.length; i++) {
            links[i].addEventListener('click', (e) => {
                e.preventDefault();
                this.goto(links[i].getAttribute('href'));
            })
            links[i].innerHTML += ` [${i + 1}]`;
            links[i].dataset.index = i + 1;
        }

        return true;
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

        if (this.awaitingInput === '') {
            if (typeof this[this.command] !== 'function') {
                this.doError(1, `Command '${this.command}' not recognised`);
                return false;
            }

            return this[this.command](this.data);
        }

        if (typeof this[this.awaitingInput] !== 'function') {
            this.doError(0, 'Unexpected input error');
            return false;
        }

        let awaitingFunc = this.awaitingInput;
        this.awaitingInput = '';

        this[awaitingFunc](this.command, this.data);
    }

    /**
     * reset - reset the terminal (reload the page)
     */
    reset() {
        location.reload();
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
                    this.processCommand(this.input.value);
                    this.input.value = '';
                    break;

                case 'Escape':
                    event.preventDefault();
                    this.input.value = '';
                    break;
                /*case 'ArrowUp':
                    event.preventDefault();
                    this.scroll(24, true);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.scroll(24);
                    break;*/
            }
        })
    }

    timer(seconds = 0, callback = () => {}) {

        let secs = seconds - 1;
        const self = this;

        let timer = window.setInterval(() => {
            if (secs > 0) {
                this.addMessage(`<p>${secs} Seconds...</p>`);
                secs--;
            } else {
                callback();
                window.clearInterval(timer);
            }
        }, (1000));
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
        //document.getElementById('pageName').innerText = url;

    }
}