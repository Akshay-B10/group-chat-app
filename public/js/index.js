// Main Code

var baseUrl = "http://localhost:3000";

//var msgCount = 0;
const chatBox = document.querySelector("#chat-box");

document.querySelector("#send").addEventListener("click", sentMsg);

document.querySelector("#new-group-btn").addEventListener("click", newGroup);

document.querySelector("#create-new-group-btn").addEventListener("click", createGroup);

let selectedLi;
document.querySelector("#left-panel").addEventListener("click", selectGroup);

document.querySelector("#members-list").addEventListener("click", makeAdminOrRemove);

document.querySelector("#add-members-btn").addEventListener("click", addMembers);

document.querySelector("#search-contacts").addEventListener("keyup", searchContacts);

window.addEventListener("DOMContentLoaded", pageReload);

const socket = io(baseUrl);
socket.on("connect", () => {
    socket.emit("connect-user", localStorage.getItem("name"), localStorage.getItem("selected-group"));
});

let prevGroup;
if (localStorage.getItem("selected-group")) {
    socket.emit("join-group", localStorage.getItem("selected-group"), prevGroup);
};

socket.on("group-connection", message => {
    console.log(message);
});

socket.on("display-to-members", data => {
    displayMsg(data);
});

// Functions

function scrollBottom(chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

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
    scrollBottom(chatBox);
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
        for (let i = 0; i < messages.length; i++) {
            if (i == messages.length - 1) {
                const newMsgs = oldMsgs.concat(messages);
                localStorage.setItem(`chat-${selectedGroup}`, JSON.stringify({
                    messages: newMsgs,
                    lastMsgId: messages[i].id
                }));
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
        getGroupDetails();
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
        document.querySelector("#msg-box").value = "";
        socket.emit("send-message", {
            message: msg,
            sender: localStorage.getItem("name"),
            myself: false // For other users.
        }, localStorage.getItem("selected-group"));
    } catch (err) {
        alert(err.response.data.message);
        console.log(err.response.err);
    }
};

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
        displayMembersToAdd(contacts[i], "#contacts-list");
    }
};

async function createGroup(event) {
    event.preventDefault();
    try {
        const form = document.querySelector("#new-group-form");
        const name = form.firstElementChild.value;
        if (!name || name == "") {
            return alert("Group name required");
        }
        const data = {
            name: name
        };
        const members = [];
        let atleastOne = false;
        const contactList = document.querySelector("#contacts-list").children;
        for (let i = 0; i < contactList.length; i++) {
            if (contactList[i].firstElementChild.firstElementChild.checked) {
                if (!atleastOne) {
                    atleastOne = true;
                }
                const subData = {};
                subData.id = contactList[i].id;
                subData.checked = contactList[i].firstElementChild.firstElementChild.checked;
                members.push(subData);
            }
        };
        if (!atleastOne) {
            return alert("Please select atleast one member");
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

            socket.emit("join-group", localStorage.getItem("selected-group"), prevGroup);
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
    prevGroup = localStorage.getItem("selected-group");
    localStorage.setItem("selected-group", li.getAttribute("value"));

    // Chat head Ui
    const chatHead = document.querySelector("#chat-head");
    chatHead.textContent = "";
    chatHead.appendChild(document.createTextNode(`${li.textContent}`));
    showMessages(localStorage.getItem("token"), li.getAttribute("value"));
    getGroupDetails();

    console.log(localStorage.getItem("selected-group"), prevGroup);
    socket.emit("join-group", localStorage.getItem("selected-group"), prevGroup);
};

function displayMembersToAdd(user, htmlEleId) {
    const copiedLi = document.querySelector("#not-member-li").cloneNode(true);
    copiedLi.removeAttribute("style");
    copiedLi.removeAttribute("id");
    if (user.id || htmlEleId == "#contacts-list") {
        copiedLi.id = user.id;
    } else {
        copiedLi.setAttribute("data-email", user.email);
    }

    const labelEle = document.createElement("label");
    labelEle.appendChild(document.createTextNode(user.name));
    copiedLi.firstElementChild.lastElementChild.appendChild(labelEle);

    copiedLi.firstElementChild.appendChild(document.createTextNode(user.email));
    copiedLi.firstElementChild.appendChild(document.createElement("br"));
    copiedLi.firstElementChild.appendChild(document.createTextNode(user.phone));
    document.querySelector(htmlEleId).appendChild(copiedLi);
};

function groupDetailsUI(user, status) {
    const copiedLi = document.querySelector("#member-li").cloneNode(true);
    copiedLi.removeAttribute("style");
    copiedLi.removeAttribute("id");
    copiedLi.setAttribute("data-email", user.email);
    if (user.usergroup.isAdmin) {
        copiedLi.setAttribute("data-info", true);
        const span = document.createElement("span");
        span.className = "badge bg-secondary";
        span.appendChild(document.createTextNode("Group admin"));
        copiedLi.firstElementChild.insertBefore(span, copiedLi.firstElementChild.firstElementChild);
    }
    copiedLi.firstElementChild.lastElementChild.appendChild(document.createTextNode(user.name));
    copiedLi.firstElementChild.appendChild(document.createTextNode(user.email));
    copiedLi.firstElementChild.appendChild(document.createElement("br"));
    copiedLi.firstElementChild.appendChild(document.createTextNode(user.phone));

    if (status && !user.myself) {
        const div = document.createElement("div");
        div.className = "vstack";
        if (!copiedLi.getAttribute("data-info")) {
            const makeAdminBtn = document.createElement("button");
            makeAdminBtn.className = "btn btn-sm btn-light mx-5 mb-1";
            makeAdminBtn.appendChild(document.createTextNode("Make admin"));
            div.appendChild(makeAdminBtn);
        };
        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-danger mx-5 mb-1";
        removeBtn.appendChild(document.createTextNode("Remove from group"));
        div.appendChild(removeBtn);
        copiedLi.appendChild(div);
    }
    document.querySelector("#members-list").appendChild(copiedLi);
};

async function getGroupDetails() {
    try {
        if (document.querySelector("#add-members-btn").getAttribute("style")) {
            document.querySelector("#add-members-btn").setAttribute("style", "display: none;");
        };
        const groupId = localStorage.getItem("selected-group");
        if (!groupId) {
            document.querySelector("#group-details-close-btn").click();
            return;
        }
        const token = localStorage.getItem("token");
        const res = await axios.get(`${baseUrl}/group/get-details?groupId=${groupId}`, {
            headers: {
                "Authorization": token
            }
        });
        let adminStatus = res.data.status;
        const group = res.data.group;
        const head = document.querySelector("#group-details-head");
        head.textContent = "";
        head.appendChild(document.createTextNode(`${group.name}`));
        const users = group.users;
        // Removing prev UI
        const membersList = document.querySelector("#members-list");
        while (membersList.children.length != 0) {
            membersList.removeChild(membersList.lastElementChild);
        }
        const notMembersList = document.querySelector("#not-members-list");
        while (notMembersList.children.length != 0) {
            notMembersList.removeChild(notMembersList.lastElementChild);
        }
        // Adding new UI
        users.forEach(user => {
            groupDetailsUI(user, adminStatus);
        });
        if (adminStatus) {
            document.querySelector("#search-contacts").disabled = false;
            const notMembers = res.data.notMembers;
            notMembers.forEach(user => {
                displayMembersToAdd(user, "#not-members-list");
            });
            if (document.querySelector("#add-members-btn").getAttribute("style")) {
                document.querySelector("#add-members-btn").removeAttribute("style");
            }
        };
    } catch (err) {
        console.log(err);
        alert("Could not fetch details");
    }
};

async function makeAdmin(li) {
    try {
        const email = li.getAttribute("data-email");
        const groupId = localStorage.getItem("selected-group");
        const res = await axios.get(`${baseUrl}/group/make-admin?email=${email}&groupId=${groupId}`);
        const user = res.data;
        const membersList = document.querySelector("#members-list");
        for (let i = 0; i < membersList.children.length; i++) {
            const li = membersList.children[i];
            if (li.getAttribute("data-email") == user.email) {
                li.setAttribute("data-info", true);
                const span = document.createElement("span");
                span.className = "badge bg-secondary";
                span.appendChild(document.createTextNode("Group admin"));
                li.firstElementChild.insertBefore(span, li.firstElementChild.firstElementChild);

                li.lastElementChild.removeChild(li.lastElementChild.firstElementChild);
                return;
            };
        }
    } catch (err) {
        alert("Couldn't make user admin of the group");
    }
};

async function removeFromGroup(li) {
    try {
        const email = li.getAttribute("data-email");
        const groupId = localStorage.getItem("selected-group");
        const res = await axios.get(`${baseUrl}/group/remove-member?email=${email}&groupId=${groupId}`);
        const user = res.data;
        document.querySelector("#members-list").removeChild(li);
        displayMembersToAdd(user, "#not-members-list");
    } catch (err) {
        alert("Couldn't remove user from group");
    }
}

function makeAdminOrRemove(event) {
    if (!event.target.classList.contains("btn")) {
        return;
    }
    const li = event.target.parentElement.parentElement;
    if (event.target.classList.contains("btn-light")) {
        makeAdmin(li);
        return;
    }
    if (event.target.classList.contains("btn-danger")) {
        removeFromGroup(li);
        return;
    }
};

async function addMembers(event) {
    event.preventDefault();
    try {
        const ul = document.querySelector("#not-members-list");
        const data = {
            groupId: localStorage.getItem("selected-group")
        };
        let members = [];
        let atleastOne = false;
        let toDelete = [];
        for (let i = 0; i < ul.children.length; i++) {
            if (ul.children[i].firstElementChild.firstElementChild.checked) {
                if (!atleastOne) {
                    atleastOne = true;
                }
                members.push({
                    email: ul.children[i].getAttribute("data-email"),
                    checked: true
                });
                toDelete.push(ul.children[i]);
            };
        };
        if (!atleastOne) {
            return alert("Please select atleast one member");
        }
        data.members = members;
        const res = await axios.post(`${baseUrl}/group/add-members`, data);
        const users = res.data.users;
        for (let i = 0; i < toDelete.length; i++) {
            ul.removeChild(toDelete[i]);
        };
        users.forEach(user => {
            groupDetailsUI(user, true);
        });
    } catch (err) {
        console.log(err);
        alert("Couldn't add members")
    }
};

function searchContacts(event) {
    let text = event.target.value.toLowerCase();
    let contacts = document.querySelector("#not-members-list").children;

    Array.from(contacts).forEach(contact => {
        let name = contact.firstElementChild.firstElementChild.textContent.toLowerCase();
        let desc = contact.firstElementChild.textContent.toLowerCase();
        if (name.indexOf(text) != -1 || desc.indexOf(text) != -1) {
            if (contact.getAttribute("style")) {
                contact.removeAttribute("style");
            }
        } else {
            contact.setAttribute("style", "display: none!important;");
        }
    });
}

