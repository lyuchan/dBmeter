function setip() {
    Swal.fire({
        title: 'Select Serial Port',
        html: `
       
            <div class="comport-input" id="comPortInput" >
                <label class="comport-label" for="comPortSelect">COM Port: </label>
                <select class="swal2-select" id='comPortSelect'>
                    <option value="WebSocket" selected>WebSocket</option>
                    <option value="SerialPort">SerialPort</option>
                </select>
            </div>
            <div class="comport-input" ></div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Set',
        showLoaderOnConfirm: true,
        didOpen: () => {
            //ws.send(JSON.stringify({ get: "getcomlist" }));
            window.api.send("toMain", JSON.stringify({ get: "getcomlist" }));
            //comPortInput.style.display = 'flex';
        },
        preConfirm: () => {

            const comPort = document.getElementById('comPortSelect').value;
            if (comPort) {
                window.api.send("toMain", JSON.stringify({ get: 'setcom', data: comPort }));
                return;
            } else {
                Swal.showValidationMessage('Input invalid');
            }

        }
    });
}
window.api.receive("fromMain", (event) => {
    // console.log(`Received ${data} from main process`);

    // console.log('Message from server ', event);
    const res = JSON.parse(event);
    if (res.get == "comlist") {
        console.log(res.data);
        var select = document.getElementById("comPortSelect");
        select.innerHTML = "";
        for (var i = 0; i < res.data.length; i++) {
            var option = document.createElement("option");
            option.value = res.data[i];
            option.text = res.data[i];
            select.appendChild(option);
        }
    }
});