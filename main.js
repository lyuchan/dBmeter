// Modules to control application life and create native browser window
const SerialPort = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline')
const fs = require('fs');
var crypto = require('crypto');
var buf = crypto.randomBytes(6);
let base64code = buf.toString('base64');

var ws = require("ws");
//remote url

//let remoteurl="ws://this.is_your_ws_ip"
let getserial
let sport;
const { Tray, Menu, app, BrowserWindow } = require('electron')
const path = require('path')
const { ipcMain } = require('electron')
function createTray(win) {
  const iconPath = path.join(__dirname, '/icon.png');
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
  //mainWindow.webContents.openDevTools()//!!!devtools!!!
  return mainWindow;
}
app.whenReady().then(() => {
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  const win = createWindow(900, 600, 'preload.js', './web/index.html');
  const configFilePath = 'config.json';
  fs.access(configFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      updatetoken();
      console.log(`remote code: ${base64code}`);
    } else {
      fs.readFile('config.json', 'utf8', (err, data) => {
        if (err) {
          console.error('read config file error:', err);
          return;
        }
        // 將 JSON 字串轉換為物件
        const config = JSON.parse(data);
        // 使用 config 物件進行你的操作
        //console.log('讀取到的設定:', config);
        base64code = config.id;
        console.log(`remote code: ${base64code}`);
      });
    }
  });

  ipcMain.on("toMain", (event, args) => {
    //tomain
    let res = JSON.parse(args);
    console.log(res)
    if (res.get == "getcomlist") {
      getpoart().then((data) => {
        send(JSON.stringify({ get: "comlist", data: data }))
      })
    }
    if (res.get == "setcom") {
      console.log(res.data);
      connectToSerialPort(res.data);
    }
    if (res.get == "token") {
      send(JSON.stringify({ token: base64code, get: "token", data: base64code }))
    }
    if (res.get == "updatetoken") {
      updatetoken();
    }
  });
  function cws() {
    sock2 = new ws(remoteurl);
    sock2.on("open", function () {
      console.log("connect success !!!!");
      // sock.send("HelloWorld");
    });

    sock2.on("error", function (err) {
      console.log("error: ", err);
    });

    sock2.on("close", function () {
      console.log("close");
      setTimeout(() => {
        console.log('正在重新連接...');
        cws(); // 遞迴重新連接
      }, 1000);
    });

    sock2.on("message", function (event) {
      let res = JSON.parse(event.toString());
      console.log(res)
      if (res.service == "dbmeter") {
        if (res.get == "checktokens") {
          if (res.token == base64code) {
            sendws(JSON.stringify({ service: "dbmeter", get: "checktoken", token: base64code }))
          }
        }
      }
    });
  }
  cws();

  function updatetoken() {
    buf = crypto.randomBytes(6);
    let test = buf.toString('base64url');
    test = test.toLowerCase()
    if (test.indexOf("+") != -1 | test.indexOf("-") != -1 | test.indexOf("_") != -1) {
      // console.log(test)
      updatetoken();
    } else {
      base64code = test
      send(JSON.stringify({ token: base64code, get: "token", data: base64code }))
      const updatedConfig = JSON.stringify({
        "id": base64code
      });
      // 寫入回 config.json 檔案
      fs.writeFile('config.json', updatedConfig, 'utf8', (err) => {
        if (err) {
          console.error('config write error:', err);
          return;
        }
        //   console.log('設定已成功更新！');
      });
    }

  }
  function sendws(data) {
    sock2.send(data);
  }
  function send(sendData) {
    win.webContents.send("fromMain", sendData);
  }
  function connectToSerialPort(portName) {
    if (sport) {
      sport.close();
    }
    sport = new SerialPort.SerialPort({ path: portName, baudRate: 9600 });

    // const parser = new Readline();
    // port.pipe(parser);
    const parser = sport.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    sport.on('open', () => {
      console.log('串列通訊埠已開啟');
      sport.set({ dtr: false }, (err) => {
        if (err) {
          console.error('Error setting DTR:', err);
        } else {
          console.log('DTR set to HIGH');
        }
        // 在這裡可以進行串列通訊埠的讀寫操作
      });
    });

    parser.on('data', (data) => {

      if (data > 140) {
        console.log("error");
      } else {
        send(JSON.stringify({ get: "updatedb", data: data }))
        sendws(JSON.stringify({ service: "dbmeter", token: base64code, get: "updatedb", data: data }))
      }

    });
    sport.on('error', err => {
      console.error(`无法打开串口 ${portName}:`, err);
      if (err = `[Error: Opening ${portName}: Access denied]`) {
        send(JSON.stringify({ uuid: "web", token: base64code, get: "error", data: (`${portName}已被其他軟體占用`) }))
      }
    });
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
