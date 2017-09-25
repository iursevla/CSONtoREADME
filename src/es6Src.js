let fse = require('fs-extra'); //Filesystem https://www.npmjs.com/package/fs-extra
let CSON = require('cson'); //CSON https://www.npmjs.com/package/cson + https://github.com/bevry/cson

const BOOSTNOTE_JSON = 'boostnote.json'; //Constant for .json file
const NOTES_FOLDER = 'notes'; //Constant for notes folder
const DIST_FOLDER = 'dist'; //Constant for dist folder

//Represents a boostnote folder http://prntscr.com/gpkl5t
class BoostNoteFolder {
    constructor(folderKey, folderName) {
        this.folderKey = folderKey;
        this.folderName = folderName;
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
        console.log(process.argv, args);
        let folder = args[0];
        this.bootnoteJSONPath = folder + '/' + BOOSTNOTE_JSON;
        this.notesPath = folder + '/' + NOTES_FOLDER; //The path for the notes folder
        this.distFolderPath = folder + '/' + DIST_FOLDER; // The path for the dist folder
    }

    hasFolders() {

    }
}

new CLI();