OS.prototype.basicLines = [];
OS.prototype.projectName = '';
OS.prototype.basicVars = {};
OS.prototype.pointer = 0;

OS.prototype.main = function() {
    this.setCommandPrompt("READY: ");
    this.setTitleBar("BASIC");
    this.setStatusBar(`${Object.keys(this.basicLines).length} LINES`);
    this.clear();
    this.edit();
}

OS.prototype.edit = function(ln, data) {

    if (ln === '' || typeof(ln) === 'undefined') {
        this.addMessage("<p>You are now in Edit mode. To exit type 'BREAK'</p>");
        this.addMessage("<p>To re-enter Edit mode type 'EDIT'</p>");
        this.awaitingInput = 'edit';
        return false;
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
        case 'reset':
            this.reset();
        default:
            let storedLine = (ln + ' ' + data).toUpperCase();
            this.basicLines.push(storedLine.toUpperCase());
            this.addMessage(`<pre>${this.basicLines.length} ${storedLine}</pre>`);
            this.setStatusBar(`${this.basicLines.length} LINES`);
            this.awaitingInput = 'edit';
            break;
    }
}

OS.prototype.list = function() {
    this.basicLines.forEach((line, index) => {
        this.addMessage(`<pre>${index} ${line}</pre>`);
    });
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
