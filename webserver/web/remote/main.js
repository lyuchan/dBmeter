let urlold = window.location.href//取得當前網址
let url = urlold.replace("https://", "");//去除https
url = url.replace("http://", "");//去除http
url = url.replace("dbmeter", "");//去除/
url = url.split('/')[0];
url = url.replace("/", "");//去除/
url2 = url
url = "ws://" + url;//加入ws://
let first = 0;
var ws = new ReconnectingWebSocket(url)
ws.reconnectDecay = 1;
var params = new URLSearchParams(new URL(urlold).search);
let token = params.get('token');
console.log(token)
console.log(url)
ws.onopen = () => {
    //src2.innerHTML = "<h2>已與伺服器連線</h2>"
    if (first == 0) {
        first++;

    } else {
        wsToast.fire({
            icon: 'success',
            title: '成功重新連接伺服器',
            iconColor: '#00ff00'
        })
    }
}
ws.onmessage = event => {
    let res = JSON.parse(event.data);
    if (res.service == "dbmeter") {
        if (res.token == token) {
            if (res.get == "updatedb") {
                let text = document.getElementById("text");
                text.innerHTML = `${res.data}dB`
                changeBodyColor(res.data)
            }
            if (res.get == "error") {
                if (res.uuid == "web") {
                    Toast.fire({
                        icon: 'error',
                        title: res.data
                    })
                }
            }
        }
    }
}
ws.onerror = (error) => {
    wsToast.fire({
        icon: 'error',
        title: "與伺服器連接好像發生了一點問題，正在嘗試重新連線"
    })
};
ws.onclose = () => {
    wsToast.fire({
        icon: 'error',
        title: "與伺服器連接好像發生了一點問題，正在嘗試重新連線"
    })
}
const wsToast = Swal.mixin({
    toast: true,
    position: 'bottom-right',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true

})
const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-right',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true
})
function logout() {
    window.location.assign(`http://${url2}`);
}