class OsCommands extends Os {
    constructor() {
        super();
    }

    init() {
        this.goto(['pages/home.html']);
    }

    goto(args = []) {
        console.log(args);
        const url = args;
        if (!url) this.doError('URL not specified');

        this.getServerData(url, 'displaypage');
    }

    displaypage(data) {
        let pageData = data;
        console.log(data);
        this.clear();
        pageData.text().then( (data) => {
            this.writeOutput(data);
            this.setStatusBar(`<p>Status: ${pageData.status} ${pageData.statusText} | Loaded: ${data.length} bytes | Hyperterminal: Ready</p>`);
        });
        
    }

    help(detail) {
        const helpdir = 'pages/help/'
        if (detail == "") {
            this.goto(helpdir + 'help.html');
        } else {
            this.goto(`${helpdir}${detail}.html`);
        }
    }
    
}

new OsCommands();