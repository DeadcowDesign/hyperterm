class Os {

    constructor() {
        this.input = '',
            this.output = '',
            this.commandBar = null,
            this.terminal = '',
            this.statusbar = '';
        this.boot();
    }

    /**
     * boot - create the interface, add event listeners and
     * start the operating system.
     */
    boot() {
        const self = this;
        document.addEventListener("DOMContentLoaded", () => {
            self.buildInterface();
            self.input.focus();
            self.startInputListener();
            self.init();
        });
    }

    /**
     * init - initialisation function.
     * Used to run initial commands on application boot.
     * @returns boolean
     */
    init() {
        return false;
    }

    /**
     * buildInterface - build and return the interface
     * for the operating system.
     * @returns boolean true on success
     */
    buildInterface() {
        // Build the terminal container
        this.terminal = document.createElement('div');
        this.terminal.classList.add('terminal', 'screen');
        this.terminal.setAttribute('id', 'terminal');
        document.body.appendChild(this.terminal);

        // Build the header
        this.statusbar = document.createElement('header');
        this.terminal.appendChild(this.statusbar);

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
     * 
     * @param {string} url The url to fetch
     */
    getServerData(page = '', callback = '') {

        var self = this;

        fetch(page).then(data => this[callback](data) );
    }

    /**
     * addMessage - add a message to the output div
     * @param {string} markup A string representation of the markup to be displayed
     */
    writeOutput(markup) {
        this.output.insertAdjacentHTML('beforeend', markup);
    }

    /**
     * setStatusBar - set the contents of the status bar.
     * @param {string} markup A string representation of the statusbar markup
     */
    setStatusBar(markup) {
        this.statusbar.innerHTML = markup;
    }

    /**
     * executeCommand - get the contents of the input box, and
     * split them up into a command and its arguments.
     * Run the command with the arguments
     */
    executeCommand() {

        let commandString = this.input.value.toLowerCase();

        const [command, ...data] = commandString.split(' ');

        if (typeof(this[command]) !== 'function') {

            this.doError(0, `Command ${command} not recognised`);

        } else {
            this[command](data);
        }
    }

    /**
     * clear - clear the output div
     */
    clear() {
        this.output.innerHTML = '';
    }

    /**
     * doError - output an OS error to the screen.
     * 
     * @param {int} code The error code
     * @param {String} message The error message
     */
    doError(code = 0, message = '') {
        this.writeOutput(`<p>The OS could not process your request because of an error.</p>`);
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

        this.writeOutput(errorMessage);
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
                    this.writeOutput('<p>' + this.input.value.toUpperCase() + '</p>');
                    this.executeCommand(this.input.value);
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
}