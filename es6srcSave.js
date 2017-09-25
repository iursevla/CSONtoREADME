let fse = require('fs-extra'); //Filesystem https://www.npmjs.com/package/fs-extra
let CSON = require('cson'); //CSON https://www.npmjs.com/package/cson + https://github.com/bevry/cson

const BOOSTNOTE_JSON = 'boostnote.json'; //Constant for .json file
const NOTES_FOLDER = 'notes'; //Constant for notes folder
const DIST_FOLDER = 'dist'; //Constant for dist folder
const CSON_FORMAT = '.cson'; //CSON file
const MARKDOWN_NOTE = 'MARKDOWN_NOTE';
const SNIPPET_NOTE = 'SNIPPET_NOTE';

//Represents a boostnote folder http://prntscr.com/gpkl5t
class BoostNoteFolder {
    constructor(folderKey, folderName, folderPath) {
        this.folderKey = folderKey;
        this.folderName = folderName;
        this.folderPath = folderPath;
        this.files = [];
    }

    addFile(boostNoteFile) {
        this.files.push(boostNoteFile);
    }
}

//Represents a boostnote file http://prntscr.com/gpkleu
class BoostNoteFile {
    constructor(folderKey, fileType, fileTitle, fileContentJSON) {
        this.folderKey = folderKey;
        this.fileType = fileType;
        this.fileTitle = fileTitle;
        this.fileContentJSON = fileContentJSON;
    }
}

//The CLI for the 
class CLI {
    constructor(args = process.argv.slice(2)) {
        // console.log(process.argv, args);
        let folderPath = args[0];
        if (!folderPath)
            throw 'No folder given';
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
            let boostNoteFolders = [];
            let boostNoteKeysMap = new Map();
            let jsonFile = JSON.parse(fse.readFileSync(this.jsonPath, 'utf8'));
            for (let boostFolder of jsonFile.folders){
                boostNoteFolders.push(new BoostNoteFolder(boostFolder.key, boostFolder.name, this.distPath + boostFolder.name));
                boostNoteKeysMap.set(boostFolder.key, new BoostNoteFolder(boostFolder.key, boostFolder.name, this.distPath + boostFolder.name));
            }
            this.processBoostNoteFolders(boostNoteFolders);
        }
        else {
            let error = `Boostnote main file named: ${BOOSTNOTE_JSON} wasn't found on folder: ${this.folderPath}`;
            throw error;
        }
    }

    /**
     * Process each boost note folder and create the files that 
     * @param {Array<BoostNoteFolder>} boostNoteFolders - the boost note folders.
     * @memberof CLI
     */
    processBoostNoteFolders(boostNoteFolders) {
        console.log(boostNoteFolders);
        let csonFileNames = this._getCSONFiles(); //this._getFolderContent(this.notesPath).filter((f) => f.includes(CSON_FORMAT));
        for (let csonFileName of csonFileNames) {
            let fileContent = fse.readFileSync(this.notesPath + '/' + csonFileName, 'utf8');
            let cson = CSON.parse(fileContent);
            if (cson.type === MARKDOWN_NOTE) {
                console.log("----   MARKDOWN_NOTE    ---");
                if (cson.content) {
                    console.log(cson.title);
                    let boostNotefile = new BoostNoteFile(cson.folder, cson.type, cson.title, cson.content)
                    
                    
                } else
                    console.log(`${csonFileName} has no content, so it was ignored...`);
            }
            else if (cson.type === SNIPPET_NOTE) {
                console.log("----   SNIPPET_NOTE     ---");
                console.log('snippet note found but ignored...');
            }
        }
    }

    _findBoostNoteFolder() {

    }

    /**
     * Creates a folder with the given name. If the name isn't provided then creates the dist folder.
     * @param {string} folderName - The name of the folder to create.
     * @memberof CLI
     */
    createFolder(folderName = '') {
        let folderPath = this.distPath + '/' + folderName;
        console.log(folderPath);
        fse.ensureDirSync(folderPath); // Create if not exists
        fse.emptyDirSync(folderPath); // Empty content if it did
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