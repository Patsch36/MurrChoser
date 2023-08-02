// ./build_installer.js
// 1. Import Modules
const { MSICreator } =  require('electron-wix-msi');
const path = require('path');

// 2. Define input and output directory.
 // Important: the directories must be absolute, not relative e.g
// appDirectory
 const APP_DIR = path.resolve(__dirname, './MurrChoser-win32-x64');
// outputDirectory
const OUT_DIR = path.resolve(__dirname, './windows_installer');


// 3. Instantiate the MSICreator
const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,

     // Configure metadata
    description: 'This is MurrChoser Application',
    exe: 'MurrChoser',
    name: 'MurrChoser Azubirunden-Tool',
    manufacturer: 'Patrick Scheich',
    version: '1.0.0',
    icon: path.resolve(__dirname, './murr.ico'),
     // Configure installer User Interface
    ui: {
        chooseDirectory: true
     },
});


// 4. Create a .WXS template file
msiCreator.create().then (function (){
    // Step 5: Compile the template to a .msi file
    msiCreator.compile();
});
