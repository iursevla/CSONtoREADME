let fse = require('fs-extra'); //Filesystem https://www.npmjs.com/package/fs-extra
let CSON = require('cson'); //CSON 

const BOOSTNOTE_JSON = 'boostnote.json'; //Constant for .json file
const NOTES_FOLDER = 'notes'; //Constant for notes folder
const DIST_FOLDER = 'dist'; //Constant for dist folder
let distFolderPath; // The path for the dist folder

function readArguments() {
    let folder = process.argv[2];
    distFolderPath = folder + '/' + DIST_FOLDER;
    if (!folder)
        throw 'No folder given';
    else {
        // console.log(folder);
        processFolder(folder);
    }
}

//Process Boostnote folder
function processFolder(folder) {
    console.log(`Reading folder: ${folder}.`);
    let fileAndFolders = fse.readdirSync(folder);
    if (fileAndFolders.indexOf(BOOSTNOTE_JSON) !== -1 && fileAndFolders.indexOf(NOTES_FOLDER) !== -1) { //boostnote.json and notes folder exist
        createFolder(); //distFolder
        let jsonFilePath = folder + '/' + BOOSTNOTE_JSON; //console.log(jsonFile);
        let JSONFileRes = JSON.parse(fse.readFileSync(jsonFilePath, 'utf8')); //console.log(JSONRes + "---------");
        for (let folder of JSONFileRes.folders) {
            let folderName = folder.name;
            let folderKey = folder.key;
            console.log(folderName, folderKey);
            createFolder(folderName);
        }
    }
    else {
        let error = `Boostnote main file named: ${BOOSTNOTE_JSON} wasn't found on folder: ${folder}`;
        throw error;
    }
}

// Read CSON file and 
function searchBoostnoteFolderFiles(folderKey) {
    //With the given folderKey search for avilable 
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