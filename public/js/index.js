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
        alert(res.data.message);
    } catch (err) {
        alert(err.response.data.message);
        console.log(err.response.err);
    }
}

// Main Code

var baseUrl = "http://localhost:3000";

document.querySelector("#send").addEventListener("click", sentMsg);