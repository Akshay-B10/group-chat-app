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
    try {
        const token = localStorage.getItem("token");
        const oldMsgs = JSON.parse(localStorage.getItem("messages")) || [];
        if (oldMsgs.length > 0) {
            oldMsgs.forEach(item => {
                displayMsg(item);
            });
        }
        const lastMsgId = localStorage.getItem("last-msg-id");
        const res = await axios.get(`${baseUrl}/message/get-all-new?lastMsgId=${lastMsgId || -1}`, {
            headers: {
                "Authorization": token
            }
        });
        const messages = res.data.messages;
        // msgCount = messages.length;
        for (let i = 0; i < messages.length; i++) {
            if (i == messages.length - 1) {
                localStorage.setItem("last-msg-id", messages[i].id);
            }
            displayMsg(messages[i]);
        };
        const newMsgs = oldMsgs.concat(messages);
        localStorage.setItem("messages", JSON.stringify(newMsgs));
    } catch (err) {
        console.log(err);
        alert("Something went wrong");
    }
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
        //msgCount++;
        document.querySelector("#msg-box").value = "";
    } catch (err) {
        alert(err.response.data.message);
        console.log(err.response.err);
    }
}

// Main Code

var baseUrl = "http://localhost:3000";

//var msgCount = 0;
const chatBox = document.querySelector("#chat-box");

document.querySelector("#send").addEventListener("click", sentMsg);

window.addEventListener("DOMContentLoaded", pageReload);
/*
setInterval(async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${baseUrl}/message/get-all`, {
            headers: {
                "Authorization": token
            }
        });
        const messages = res.data.messages;
        if (msgCount < messages.length) {
            for (let i = msgCount; i < messages.length; i++) {
                displayMsg(messages[i]);
                msgCount++;
            }
        }
    } catch (err) {
        console.log(err);
    }
}, 1000);
*/