let fse = require('fs-extra'); //Filesystem https://www.npmjs.com/package/fs-extra
let CSON = require('cson'); //CSON https://www.npmjs.com/package/cson + https://github.com/bevry/cson
// import { BoostnoteFolder } from './BoostNoteFolder.js';
// let BoostnoteFile = require('./BoostnoteFile.js');

const BOOSTNOTE_JSON = 'boostnote.json'; //Constant for .json file
const NOTES_FOLDER = 'notes'; //Constant for notes folder
const DIST_FOLDER = 'dist'; //Constant for dist folder
let distFolderPath; // The path for the dist folder
let notesPath; //The path for the notes folder

function readArguments() {
    let folderPath = process.argv[2];
    distFolderPath = folderPath + '/' + DIST_FOLDER;
    notesPath = folderPath + '/' + NOTES_FOLDER;
    if (!folderPath)
        throw 'No folder given';
    else
        processFolder(folderPath);
}

//Process Boostnote folder
function processFolder(folderPath) {
    console.log(`Reading folder: ${folderPath}.`);
    let fileAndFolders = fse.readdirSync(folderPath);
    if (fileAndFolders.indexOf(BOOSTNOTE_JSON) !== -1 && fileAndFolders.indexOf(NOTES_FOLDER) !== -1) { //boostnote.json and notes folder exist
        createFolder(); //distFolder
        let jsonFilePath = folderPath + '/' + BOOSTNOTE_JSON; //console.log(jsonFile);
        let JSONFileRes = JSON.parse(fse.readFileSync(jsonFilePath, 'utf8')); //console.log(JSONRes + "---------");
        let map = new Map();
        for (let boostFolder of JSONFileRes.folders) {
            let folderName = boostFolder.name;
            let folderKey = boostFolder.key;
            map.set(folderKey, folderName);
            console.log(folderName, folderKey);
            createFolder(folderName);
            searchBoostnoteFolderFiles(folderKey, map);
        }
        console.log(map);
    }
    else {
        let error = `Boostnote main file named: ${BOOSTNOTE_JSON} wasn't found on folder: ${folderPath}`;
        throw error;
    }
}

// Read CSON file and 
function searchBoostnoteFolderFiles(folderKey, map) {
    //With the given folderKey search for files
    //Read CSON files and then convert them to JSON for further processing
    
}

//Create folder with the given folder path
function createFolder(folderName) {
    let folderPath = !folderName ? distFolderPath : distFolderPath + '/' + folderName;
    console.log(folderPath);
    fse.ensureDirSync(folderPath); // Create if not exists
    fse.emptyDirSync(folderPath); // Empty content if it did
}

//Create readme.md file with the given file name
function createReadmeFile(fileName) {

}


//Convert CSON code to JSON code
function CSONtoJSON(cson) {

}

readArguments();

