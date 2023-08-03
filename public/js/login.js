async function getHome(event) {
    event.preventDefault();
    try {
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;
        if (email == "" || password == "") {
            return alert("Please fill required details");
        }
        const res = await axios.post(`${baseUrl}/user/login-authenticate`, {
            email: email,
            password: password
        });
        localStorage.setItem("token", res.data.token);
        window.location.href = "/user/index"
    } catch (err) {
        alert(err.response.data.message);
    }
};

// Main code

var baseUrl = "http://localhost:3000";

document.querySelector("#login").addEventListener("click", getHome);