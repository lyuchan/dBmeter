// Modules to control application life and create native browser window
const SerialPort = require('serialport');
let getserial
const { Tray, Menu, app, BrowserWindow } = require('electron')
const path = require('path')
const { ipcMain } = require('electron')
function createTray(win) {
  const iconPath = path.join(__dirname, '/led.png');
  const tray = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '回復',
      click: () => win.show()
    },
    {
      label: '結束',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ])
  tray.setToolTip('Tally Light Control')
  tray.setContextMenu(contextMenu);
  tray.on('click', () => win.show())
  return tray;
}
function createWindow(w, h, preloadjs, mainpage) {
  const mainWindow = new BrowserWindow({
    width: w,
    height: h,
    //frame: false,          // 標題列不顯示
    //transparent: true,     // 背景透明
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, preloadjs)
    }
  })
  mainWindow.loadFile(mainpage)
  mainWindow.webContents.openDevTools()
  return mainWindow;
}
app.whenReady().then(() => {
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  const win = createWindow(900, 400, 'preload.js', './web/index.html');

  ipcMain.on("toMain", (event, args) => {
    //tomain
    let res = JSON.parse(args);
    console.log(res)
    if (res.get == "getcomlist") {
      getpoart().then((data) => {
        send(JSON.stringify({ get: "comlist", data: data }))
      })
    }
  });
  function send(sendData) {
    win.webContents.send("fromMain", sendData);
  }

});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

async function getpoart() {
  let data = await SerialPort.SerialPort.list()
  getserial = Object.values(data).map(a => a.path)
  return getserial;
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
