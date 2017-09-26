const fse = require('fs-extra'); //https://github.com/jprichardson/node-fs-extra
const CSON = require('cson'); //https://github.com/bevry/cson
const markdownpdf = require('markdown-pdf') //https://github.com/alanshaw/markdown-pdf
const sanitize = require('sanitize-filename'); //https://github.com/parshap/node-sanitize-filename

const BOOSTNOTE_JSON = 'boostnote.json'; //Constant for .json file
const NOTES_FOLDER = 'notes'; //Constant for notes folder
const DIST_FOLDER = 'dist'; //Constant for dist folder
const CSON_FORMAT = '.cson'; //CSON file
const MD_FORMAT = '.md';
const PDF_FORMAT = '.pdf';
const MARKDOWN_NOTE = 'MARKDOWN_NOTE';
const SNIPPET_NOTE = 'SNIPPET_NOTE';

//Represents a boostnote folder http://prntscr.com/gpkl5t
class BoostnoteFolder {
    constructor(folderKey, folderName, folderPath) {
        this.folderKey = folderKey;
        this.folderName = folderName;
        this.folderPath = folderPath;
        this.notes = [];
    }

    addNote(boostnoteNote) {
        this.notes.push(boostnoteNote);
    }
}

/**
         * @type {Array<BoostnoteNote>}
         */

//Represents a boostnote Note http://prntscr.com/gpkleu
class BoostnoteNote {
    constructor(folderKey, noteType, noteTitle, noteContent) {
        this.folderKey = folderKey;
        this.noteType = noteType;
        this.noteTitle = noteTitle;
        this.noteContent = noteContent;
    }
}

//The CLI for the 
class CLI {
    constructor(args = process.argv.slice(2)) {
        // console.log(process.argv, args);
        let folderPath = args[0];
        if (!folderPath)
            throw 'No boostnote folder given';
        this.folderPath = folderPath;
        this.jsonPath = folderPath + '/' + BOOSTNOTE_JSON; //The boostnote.json file
        this.notesPath = folderPath + '/' + NOTES_FOLDER; //The path for the notes folder
        this.distPath = folderPath + '/' + DIST_FOLDER; // The path for the dist folder
        this.processArgsFolder();
    }

    /**
     * Process the folder given in the arguments by the user.
     * @memberof CLI
     */
    processArgsFolder() {
        let fileAndFolders = this._getFolderContent(this.folderPath); //fse.readdirSync(this.folderPath);
        if (fileAndFolders.indexOf(BOOSTNOTE_JSON) !== -1 && fileAndFolders.indexOf(NOTES_FOLDER) !== -1) { //boostnote.json and notes folder exist
            this.createFolder(); //distFolder
            let boostNoteFolderKeysMap = new Map();
            let jsonFile = JSON.parse(fse.readFileSync(this.jsonPath, 'utf8'));
            for (let boostFolder of jsonFile.folders)
                boostNoteFolderKeysMap.set(boostFolder.key, new BoostnoteFolder(boostFolder.key, boostFolder.name, this.distPath + boostFolder.name));
            this.processBoostNoteFolders(boostNoteFolderKeysMap);
        }
        else {
            let error = `Boostnote main file named: ${BOOSTNOTE_JSON} wasn't found on folder: ${this.folderPath}`;
            throw error;
        }
    }

    /**
     * Process each boost note folder and associate add it's BoostNoteFiles.
     * @param {Map<string, BoostnoteFolder>} boostNoteFolderKeysMap - Each key (folder key) points to a BoostNoteFolder.
     * @memberof CLI
     */
    processBoostNoteFolders(boostNoteFolderKeysMap) {
        // console.log(boostNoteFolderKeysMap);
        let csonFileNames = this._getCSONFiles(); //this._getFolderContent(this.notesPath).filter((f) => f.includes(CSON_FORMAT));
        for (let csonFileName of csonFileNames) {
            let fileContent = fse.readFileSync(this.notesPath + '/' + csonFileName, 'utf8');
            let cson = CSON.parse(fileContent);
            if (cson.type === MARKDOWN_NOTE) {
                // console.log("----   MARKDOWN_NOTE    ---");
                if (cson.content) {
                    // console.log(cson.title);
                    let boostNotefile = new BoostnoteNote(cson.folder, cson.type, cson.title, cson.content)
                    boostNoteFolderKeysMap.get(cson.folder).addNote(boostNotefile);
                } else
                    console.log(`${csonFileName} has no content, so it was ignored...`);
            }
            else if (cson.type === SNIPPET_NOTE) {
                // console.log("----   SNIPPET_NOTE     ---, ignored for now...");
            }
        }
        // console.log(boostNoteFolderKeysMap);
        this.processBoostNoteFiles(boostNoteFolderKeysMap.values());
    }

    /**
     * Creates all folders and respective files with .md format.
     * @param {Array<BoostnoteFolder>} boostNoteFolders - The boost note folders with it's files.
     * @memberof CLI
     */
    processBoostNoteFiles(boostNoteFolders) {
        for (let boostNoteFolder of boostNoteFolders) {
            if (boostNoteFolder.notes.length === 0)
                console.log(`Folder with name: ${boostNoteFolder.folderName} has no files, so it was ignored.`);
            else {
                let folderName = this.validName(boostNoteFolder.folderName); //Should validate filename
                this.createFolder(folderName);
                console.log("Folder name:", boostNoteFolder.folderName, "was created. It has the following files:");
                for (let f of boostNoteFolder.notes) {
                    console.log(f.noteTitle);
                }

                for (let f of boostNoteFolder.notes) {
                    let filePath = this.distPath + '/' + folderName + '/' + this.validName(f.noteTitle);
                    this.createREADMEFile(filePath, f.noteContent);
                    this.createPDFFile(filePath, f.noteContent);
                }
            }
        }
    }

    /**
     * A name is valid if it does not contain any invalid char or more than one dot.
     * @param {string} name - The name of the file or folder. 
     * @returns {boolean} - true, if the given name is valid, false, otherwise.
     * @memberof CLI
     */
    validName(name) {
        return sanitize(name);
    }

    /**
     * Creates a folder with the given name. If the name isn't provided then creates the dist folder.
     * @param {string} folderName - The name of the folder to create.
     * @memberof CLI
     */
    createFolder(folderName = '') {
        let folderPath = this.distPath + '/' + folderName;
        // console.log(folderPath);
        fse.ensureDirSync(folderPath); // Create if not exists
        fse.emptyDirSync(folderPath); // Empty content if it did
    }

    /**
     * Creates a MARKDOWN file with the given content.
     * @param {string} filePath - The file path.
     * @param {string} mdContent - The content to write to the file.
     * @memberof CLI
     */
    createREADMEFile(filePath, mdContent) {
        filePath += MD_FORMAT;
        fse.writeFileSync(filePath, mdContent);
    }

    /**
     * Creates a PDF file with the given content.
     * @param {string} filePath - The file path.
     * @param {string} mdContent - The content to write to the file.
     * @memberof CLI
     */
    createPDFFile(filePath, mdContent) {
        filePath += PDF_FORMAT;
        markdownpdf({highlightCssPath: '../css/highlight.css'}).from.string(mdContent).to(filePath, () => { console.log("Created pdf file"); })
        // fse.writeFileSync(filePath, mdContent);
    }


    /**
     * Returns the cson files from the notes folder. If there's any file inside the notes folder that isn't a cson file
     * then it is removed from the result.
     * @returns {Array<string>} - 
     * @private
     * @memberof CLI
     */
    _getCSONFiles() {
        return this._getFolderContent(this.notesPath).filter((f) => f.includes(CSON_FORMAT))
    }

    /**
     * Returns the folder content of the given path.
     * @param {string} folderPath - The folder path.
     * @returns {Array<string>} - the content of the folder of the given path.
     * @private
     * @memberof CLI
     */
    _getFolderContent(folderPath) {
        return fse.readdirSync(folderPath);
    }
}

new CLI();