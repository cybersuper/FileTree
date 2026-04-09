const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false 
    }
  });
  win.loadFile('index.html');
}

// Logic to build the tree as a string
function getTreeString(dir, prefix = '') {
  let output = '';
  try {
    const items = fs.readdirSync(dir).filter(name => !name.startsWith('.'));
    const lastIndex = items.length - 1;

    items.forEach((item, index) => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      const isLast = index === lastIndex;
      const connector = isLast ? '└── ' : '├── ';
      
      output += prefix + connector + item + (stats.isDirectory() ? path.sep : '') + '\n';

      if (stats.isDirectory()) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        output += getTreeString(fullPath, newPrefix);
      }
    });
  } catch (err) {
    return `Error reading directory: ${err.message}`;
  }
  return output;
}

app.whenReady().then(createWindow);

ipcMain.on('get-tree', (event, targetPath) => {
  // We use the new function that returns a string instead of console.log
  const treeData = getTreeString(targetPath); 
  event.reply('tree-result', treeData);
});