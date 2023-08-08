function displayGroup(group, theme) {
    const li = document.createElement("li");
    li.className = `list-group-item list-group-item-action list-group-item-${theme}`;
    li.setAttribute("value", group.id);
    li.appendChild(document.createTextNode(`${group.name}`));
    document.querySelector("#left-panel").appendChild(li);
    if (theme == "light") {
        const chatHead = document.querySelector("#chat-head");
        chatHead.textContent = "";
        chatHead.appendChild(document.createTextNode(`${group.name}`));
        selectedLi = li;
    };
}

function displayMsg(data) {
    const p = document.createElement("p");
    if (!data.sender) {
        p.className = "gen-msg";
        if (data.myself) {
            p.appendChild(document.createTextNode(`You joined`));
        } else {
            p.appendChild(document.createTextNode(`${data.message}`));
        }
        chatBox.appendChild(p);
        return;
    };
    if (data.myself) {
        p.className = "my-msg";
    } else {
        p.className = "others-msg";
        const name = document.createElement("strong");
        name.appendChild(document.createTextNode(data.sender));
        p.appendChild(name);
        p.appendChild(document.createElement("br"));
    };
    p.appendChild(document.createTextNode(`${data.message}`));
    chatBox.appendChild(p);
}

async function showMessages(token, selectedGroup) {
    try {
        const chatBox = document.querySelector("#chat-box");
        while (chatBox.children.length != 0) {
            chatBox.removeChild(chatBox.lastElementChild);
        }
        const messageData = JSON.parse(localStorage.getItem(`chat-${selectedGroup}`));
        let oldMsgs;
        let lastMsgId;
        if (messageData) {
            oldMsgs = messageData.messages;
            lastMsgId = messageData.lastMsgId;
        } else {
            oldMsgs = [];
            lastMsgId = -1;
        }
        if (oldMsgs.length > 0) {
            oldMsgs.forEach(item => {
                displayMsg(item);
            });
        }
        const res = await axios.get(`${baseUrl}/message/get-all-new?lastMsgId=${lastMsgId}&groupId=${selectedGroup}`, {
            headers: {
                "Authorization": token
            }
        });
        const messages = res.data.messages;
        // msgCount = messages.length;
        for (let i = 0; i < messages.length; i++) {
            if (i == messages.length - 1) {
                const newMsgs = oldMsgs.concat(messages);
                localStorage.setItem(`chat-${selectedGroup}`, JSON.stringify({
                    messages: newMsgs,
                    lastMsgId: messages[i].id
                }));
                // localStorage.setItem("last-msg-id", messages[i].id);
            }
            displayMsg(messages[i]);
        };
    } catch (err) {
        console.log(err);
        alert("Messages couldn't load");
    }
}

async function pageReload() {
    try {
        const token = localStorage.getItem("token");
        const result = await axios.get(`${baseUrl}/group/get-all`, {
            headers: {
                "Authorization": token
            }
        });
        // Ui to display groupList in left panel.
        let selectedGroup = localStorage.getItem("selected-group");
        for (let i = 0; i < result.data.length; i++) {
            if ((selectedGroup && selectedGroup == result.data[i].id) || (!selectedGroup && i == 0)) {
                displayGroup(result.data[i], "light");
            } else {
                displayGroup(result.data[i], "dark");
            }
            if (!selectedGroup && i == result.data.length - 1) {
                selectedGroup = result.data[0].id;
                localStorage.setItem("selected-group", selectedGroup);
            }
        }
        if (!selectedGroup) {
            return;
        }
        showMessages(token, selectedGroup);

    } catch (err) {
        console.log(err);
        alert("Page couldn't load");
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
        const selectedGroup = localStorage.getItem("selected-group");
        const res = await axios.post(`${baseUrl}/message/sent?groupId=${selectedGroup}`, {
            message: msg,
        }, {
            headers: {
                "Authorization": token
            }
        });
        displayMsg({
            myself: true,
            message: msg,
            sender: "Yes"
        });
        //msgCount++;
        document.querySelector("#msg-box").value = "";
    } catch (err) {
        alert(err.response.data.message);
        console.log(err.response.err);
    }
};

function displayMembersToAdd(contact) {
    // Div Element For Contact
    const div = document.createElement("div");
    div.className = "form-check mb-2";

    // Append Checkbox
    const checkBox = document.createElement("input");
    checkBox.className = "form-check-input me-4";
    checkBox.type = "checkbox";
    checkBox.id = contact.id;
    div.appendChild(checkBox);

    // Label for checkbox
    const label = document.createElement("label");
    label.className = "form-check-label";
    label.appendChild(document.createTextNode(`${contact.name}`));
    div.appendChild(label);

    document.querySelector("#new-group-form").appendChild(div);
}

async function newGroup() {
    document.querySelector("#more-options").click();
    const token = localStorage.getItem("token");
    const res = await axios.get(`${baseUrl}/user/get-contacts`, {
        headers: {
            "Authorization": token
        }
    });
    const contacts = res.data;
    const newGroupForm = document.querySelector("#new-group-form");
    while (newGroupForm.firstElementChild !== newGroupForm.lastElementChild) {
        newGroupForm.removeChild(newGroupForm.lastElementChild);
    }
    for (let i = 0; i < contacts.length; i++) {
        displayMembersToAdd(contacts[i]);
    }
};

async function createGroup(event) {
    event.preventDefault();
    try {
        const form = document.querySelector("#new-group-form");
        const data = {
            name: form.firstElementChild.value || null
        };
        const members = [];
        const formChildrens = form.children;
        for (let i = 1; i < formChildrens.length; i++) {
            if (formChildrens[i].firstElementChild.checked) {
                const subData = {};
                subData.id = formChildrens[i].firstElementChild.id;
                subData.checked = formChildrens[i].firstElementChild.checked;
                members.push(subData);
            }
        }
        data.members = members;
        const token = localStorage.getItem("token");
        const res = await axios.post(`${baseUrl}/group/create`, data, {
            headers: {
                "Authorization": token
            }
        });
        const group = res.data;
        if (!localStorage.getItem("selected-group")) {
            localStorage.setItem("selected-group", group.id);
            displayGroup(group, "light");
        } else {
            displayGroup(group, "dark");
        }
        form.firstElementChild.value = null;
        document.querySelector("#close-new-btn").click();
    } catch (err) {
        alert("Couldn't create group");
    }
};

function selectGroup(event) {
    const li = event.target;
    if (selectedLi == li) {
        return;
    }
    const darkClass = "list-group-item-dark";
    const lightClass = "list-group-item-light";
    selectedLi.classList.replace(lightClass, darkClass);
    li.classList.replace(darkClass, lightClass);
    selectedLi = li;
    localStorage.setItem("selected-group", li.getAttribute("value"));

    // Chat head Ui
    const chatHead = document.querySelector("#chat-head");
    chatHead.textContent = "";
    chatHead.appendChild(document.createTextNode(`${li.textContent}`));
    showMessages(localStorage.getItem("token"), li.getAttribute("value"));
};
// Main Code

var baseUrl = "http://localhost:3000";

//var msgCount = 0;
const chatBox = document.querySelector("#chat-box");

document.querySelector("#send").addEventListener("click", sentMsg);

document.querySelector("#new-group-btn").addEventListener("click", newGroup);

document.querySelector("#create-new-group-btn").addEventListener("click", createGroup);

let selectedLi;
document.querySelector("#left-panel").addEventListener("click", selectGroup);

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