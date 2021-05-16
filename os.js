class OS {

    constructor() {
        this.output         = '',
        this.input          = '',
        this.caret          = '',
        this.terminal       = '',
        this.command        = '',
        this.awaitingInput  = '',
        this.program        = '',
        this.statusBar      = '',
        this.commandPrompt  = '',
        this.titleBar       = '',
        this.baseHref       = '/hyperterminal',
        this.data           = '';
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
            self.detectFocus();
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
        this.titleBar = document.createElement('h1');
        this.setTitleBar()
        header.appendChild(this.titleBar);
        this.statusBar = document.createElement('p');
        header.appendChild(this.statusBar);
        this.terminal.appendChild(header);

        // Build the output container
        let outputWrapper = document.createElement('div');
        outputWrapper.classList.add('output-wrapper');
        this.terminal.appendChild(outputWrapper);
        this.output = document.createElement('section');
        this.output.classList.add('output');
        this.output.setAttribute('id', 'output');
        this.output.style.bottom = '0px';
        outputWrapper.appendChild(this.output);
        this.terminal.appendChild(outputWrapper);

        // Build the input
        let inputWrapper = document.createElement('div');
        inputWrapper.classList.add("input");
        this.commandPrompt = document.createElement('p');
        this.commandPrompt.textContent = "ENTER COMMAND: ";
        inputWrapper.appendChild(this.commandPrompt);
        this.input = document.createElement('p');
        this.input.classList.add('input-bar');
        this.input.setAttribute('id', "input-bar");
        this.input.setAttribute("contenteditable", "true");
        this.input.setAttribute('tabindex', '0');
        inputWrapper.appendChild(this.input);
        this.caret = document.createElement("div");
        this.caret.classList.add("caret");
        this.caret.setAttribute('id', 'caret');
        inputWrapper.appendChild(this.caret);
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
     * disableMouseAndKeys - prevents the user from clicking any elements
     * and returns focus to the input bar if the user attempts to use their
     * mouse on the page.
     * 
     * Also disables default behaviour for the enter key to enable single line
     * input for the input bar.
     * 
     * Attempts to detect focus for the input bar. Unfortunately, you can't actually properly
     * detect whether an element is focussed or not when the user tabs out of the page.
     * Which is, frankly, utterly insane.
     */
    detectFocus() {
        document.addEventListener('keyup', (e) => {
            if (e.target.nodeName !== 'P') {
                self.addMessage(e.target.nodeName);
                self.input.focus();
            }
        })

        const self = this;
        this.input.addEventListener('focusout', () => {
            this.caret.style.display = 'none';
            self.input.focus();
        })

        this.input.addEventListener('focus', (e) => {
            if (e.target.nodeName == 'P') {
                this.caret.style.display = 'block';
            }
        })
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
            console.log(url);
            const self = this;
            this.addMessage("<p>Loading /" + url + " Please wait...</p>");
            this.loadPage(`${url}`).then((markup) => {
                self.clear();
                self.addMessage(markup);
                let statusMessage = `<p>PAGE: ${url} - ${markup.length} BYTES LOADED</p>`;
                self.setStatusBar(statusMessage);
                //window.history.pushState("","",this.baseHref + '/' + url);
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
     * load - not to be confused with 'loadPage' below, this loads a js file
     * which should be formatted for hyperterminal use, and executes the 'main'
     * function which works like initialization.
     * 
     * @param {string} file The program to be loaded
     */
    load(file) {
        if (this.program) {document.head.removeChild(this.program)};

        const self = this;
        let cachebuster = Math.round(new Date().getTime() / 1000);
        this.program = document.createElement("script");
        this.program.setAttribute("src", `programs/${file}/${file}.js?cb=${cachebuster}`);
        document.head.appendChild(this.program);

        this.program.addEventListener('load', () => {
            self.addMessage(`<p>Program '${file}' loaded</p>`);
        });

        this.program.addEventListener('error', () => {
            self.addMessage(`<p>The program could not be loaded.</p><p>Please ensure the program exists in the programs directory. See 'HELP' for more information</p>`);
        })
    }

    run() {
        this.main();
    }

    /**
     * loadPage ajax out to a specified resource and return it.
     * 
     * @return {promise} A JavaScript promis object
     */
    loadPage(page = '') {

        this.addMessage('<p>' + page + '</p>');
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
     * parseLinks - loop through the page links and add a link
     * identifier to them so they can be access via the command
     * @returns boolean on success
     */
    parseLinks() {
        let links = this.output.querySelectorAll('a');

        for (let i = 0; i < links.length; i++) {
            console.log(links[i]);
            links[i].innerHTML += `&nbsp;[${i + 1}]`;
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

    setCommandPrompt(message = 'ENTER COMMAND: ') {
        this.commandPrompt.textContent = message;
    }

    setTitleBar(message = '<i>H</i>yper<i>T</i>er<i>M</i>ina<i>L</i> - (HTML)') {
        this.titleBar.innerHTML = message;
    }

    setStatusBar(message = '') {
        this.statusBar.innerHTML = message;
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

    startPage() {

        // Get the path and dump the dev base
        let path = window.location.pathname.replace(this.baseHref, '');

        path.replace(/^\/+/g, '');

        if (path = '') {
            path = 'pages/home.html';
        }

        this.goto(path);
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

    /***********
     * UTILITIES
     ***********/

    /**
     * glow - toggle the glow effect. Default is 'off'. Simply adds the glow class
     * to the body which in turn adds a drop shadow to everything. I'm using
     * filter: drop shadow as opposed to other methods because it works on all
     * elements with minimal effort.
     */
    glow() {
        document.body.classList.toggle('glow');

        let message = '<p>Glow disabled</p>';

        if (document.body.classList.contains('glow')) {
            message = '<p>Glow enabled</p>';
        }

        this.addMessage(message);
    }

    /**
     * scanlines - toggle the scanlines effect. Default is 'on' because it looks
     * really cool. Scanlines is just a full screen overlay with a repeating
     * gradient. Colour is based on the actual colour of CRT screens.
     */
    scanlines() {
        this.terminal.classList.toggle('screen');

        let message = '<p>Scanlines disabled</p>';

        if (this.terminal.classList.contains('screen')) {
            message = '<p>Scanlines enabled</p>';
        }

        this.addMessage(message);
    }

    /**
     * colour - changes the 'phosphor' colour of the terminal. There are a bunch
     * of options for these in the CSS, all based on actual CRT phosphor colours
     * (taken from here: https://superuser.com/questions/361297/what-colour-is-the-dark-green-on-old-fashioned-green-screen-computer-displays).
     * Defaults to a familiar terminal green colour (Green 2).
     * TODO - move colours into here. Use js to change var?
     * 
     * @param {requiredColour} requiredColour 
     * @returns 
     */
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

    /**************
     * SYSTEM PAGES
     **************/
     help(detail) {
        const helpdir = 'pages/help/'
        if (detail == "") {
            this.goto(helpdir + 'help.html');
        } else {
            this.goto(`${helpdir}${detail}.html`);
        }
    }

    directory() {
        this.goto('pages/directory.html');
    }

    home() {
        this.goto('pages/home.html');
    }
}

var os = new OS();

os.boot();