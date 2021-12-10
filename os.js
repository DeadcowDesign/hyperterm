class OS {

    constructor() {
        this.output = '',
        this.input = '',
        this.terminal = '',
        this.command = '',
        this.awaitingInput = '',
        this.program = '',
        this.data = '';

        this.boot();
    }


    boot() {
        const self = this;
        document.addEventListener("DOMContentLoaded", () => {
            self.buildInterface();
            self.input.focus();
            self.startInputListener();
            self.goto('home');
        });
    }

    buildInterface() {
        console.log('Building output');
        // Build the terminal container
        this.terminal = document.createElement('div');
        this.terminal.classList.add('terminal', 'screen');
        this.terminal.setAttribute('id', 'terminal');
        document.body.appendChild(this.terminal);

        // Build the header
        let header = document.createElement('header');
        let h1 = document.createElement('h1');
        h1.innerHTML = '<h1><u>H</u>yper<u>T</u>er<u>M</u>ina<u>L</u> - (HTML)</h1>';
        header.appendChild(h1);
        let pageData = document.createElement('p');
        pageData.innerHTML = '<p>Page: <span id="pageName"></span></p>';
        header.appendChild(pageData);
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
        this.input = document.createElement('p');
        this.input.classList.add('input-bar');
        this.input.setAttribute('id', "input-bar");
        this.input.setAttribute("contenteditable", "true");
        inputWrapper.appendChild(this.input);
        let caret = document.createElement("div");
        caret.classList.add("caret");
        inputWrapper.appendChild(caret);
        this.terminal.appendChild(inputWrapper);

        return true;
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
                
                /*case 'ArrowLeft':
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
                    break;*/
            }
        })
    }

    /**
     * override links so that they don't actually link anymore.
     */
    processLinks() {

        let links = document.querySelectorAll('a');
        let linkCount = 1;
        links.forEach(link => {
            link.dataset.index = linkCount;
            link.innerText += ' [' + linkCount + ']';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                let linkTarget = e.target.getAttribute('href');
                this.goto(linkTarget);
            })
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
        console.log(this.output);
        this.output.insertAdjacentHTML('beforeend', markup);
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

    goto(url) {
        // Here we're dealing with the 'GOTO 1' scenario. If a link has an index
        // target that matches our URL, we assume its an index, rather than a link
        // text that's been entered (so, GOTO 1 as opposed to GOTO /PAGES/FOO)
        let potentialTarget = document.querySelector(`[data-index="${url}"]`)
        if (potentialTarget) {
            let urlFragment = potentialTarget.getAttribute('href');
            url = `pages/${urlFragment}.html`
        } else {
            url = `pages/${url}.html`;
        }

        const self = this;
        this.addMessage("<p>Loading " + url + " Please wait...</p>");
        this.loadPage(url).then((markup) => {
            self.clear();
            self.addMessage(markup);
            self.updateBytes(markup.length);
            self.updatePage(url);
            self.processLinks();
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
}