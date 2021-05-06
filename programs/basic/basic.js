OS.prototype.basicLines = {};
OS.prototype.projectName = '';
OS.prototype.basicVars = {};

OS.prototype.main = function() {
    this.setCommandPrompt("READY: ");
    this.setTitleBar("BASIC");
    this.setStatusBar(`${Object.keys(this.basicLines).length} LINES`);
    this.clear();
    this.edit();
}

OS.prototype.edit = function(ln, data) {

    console.log(ln);

    if (ln === '' || typeof(ln) === 'undefined') {
        this.addMessage("<p>You are now in Edit mode. To exit type 'EXIT'</p>");
        this.addMessage("<p>To re-enter Edit mode type 'EDIT'</p>");
        this.awaitingInput = 'edit';
        return false;
    }

    // if it starts with a number, it's a line and should be stored.
    if (ln.match(/^[0-9]{1,}/)) {
        let storedLine = (ln + ' ' + data).toUpperCase();
        this.basicLines[ln] = data.toUpperCase();
        this.addMessage(`<pre>${storedLine}</pre>`);
        this.setStatusBar(`${Object.keys(this.basicLines).length} LINES`);
        this.awaitingInput = 'edit';
        return true;
    }

    switch(ln) {
        case '':
            this.awaitingInput = 'edit';
            break;
        case 'break':
            this.addMessage('<p>Exited</p>');
            this.addMessage(`Type "RUN ${this.projectName}" to run your program`);
            this.setCommandPrompt("ENTER COMMAND: ");
            break;
        case 'list':
            this.list();
            this.awaitingInput = 'edit';
            break;
        case 'clear':
            this.clear();
        default:
            //this.doLine();
            this.awaitingInput = 'edit';
            break;
    }
}

OS.prototype.list = function() {
    for (const [key, value] of Object.entries(this.basicLines)) {
        this.addMessage(`<pre>${key} ${value}</pre>`);
      }
}

OS.prototype.sortLines = function() {
    const tempLines = Object.keys(this.basicLines).sort().reduce(
        (obj, key) => { 
          obj[key] = this.basicLines[key]; 
          return obj;
        }, 
        {}
    );

    this.basicLines = tempLines;
}

OS.prototype.run = function() {

    
}

/**
 * BASIC Functions
 * 
 * CLOSE
 * CLR
 * CMD
 * DATA
 * DEF FN
 * DIM - (maybe not)
 * END
 * FOR...TO...STEP
 * GET - (maybe)
 * GET# - (maybe)
 * GOSUB
 * GOTO
 * IF...THEN
 * INPUT
 * INPUT# - (maybe)
 * LET
 * NEXT
 * ON
 * OPEN
 * POKE - (no)
 * PRINT
 * READ
 * REM - (maybe)
 * RESTORE
 * RETURN
 * STOP
 * --- MATH ---
 * ABS(X)
 * ATN(X)
 * COS(X)
 * EXP(X)
 * FNxx(X)
 * INT(X)
 * LOG(X)
 * RND(X)
 * SGN(X)
 * SIN(X)
 * TAN(X)
 * -- STRING--
 * ACS(X$)
 * CHR$(X)
 * LEFT$(X$,X)
 * LEN(X$)
 * MID(X$,S,X)
 * RIGHT(X$,X)
 * VAL(X$)
 */
