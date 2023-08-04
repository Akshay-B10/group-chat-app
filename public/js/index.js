function displayMsg(data) {
    const p = document.createElement("p");
    if (data.myself) {
        p.className = "my-msg";
    } else {
        p.className = "others-msg";
    }
    p.appendChild(document.createTextNode(`${data.message}`));
    chatBox.appendChild(p);
}

async function pageReload() {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${baseUrl}/message/get-all`, {
        headers: {
            "Authorization": token
        }
    });
    const messages = res.data.messages;
    for (let i = 0; i < messages.length; i++) {
        displayMsg(messages[i]);
    };
};

async function sentMsg(event) {
    event.preventDefault();
    try {
        const msg = document.querySelector("#msg-box").value;
        if (msg == "") {
            return;
        }
        const token = localStorage.getItem("token");
        const res = await axios.post(`${baseUrl}/message/sent`, {
            message: msg,
        }, {
            headers: {
                "Authorization": token
            }
        });
        displayMsg({
            myself: true,
            message: msg
        });
        document.querySelector("#msg-box").value = "";
    } catch (err) {
        alert(err.response.data.message);
        console.log(err.response.err);
    }
}

// Main Code

var baseUrl = "http://localhost:3000";

document.querySelector("#send").addEventListener("click", sentMsg);

window.addEventListener("DOMContentLoaded", pageReload);

const chatBox = document.querySelector("#chat-box");