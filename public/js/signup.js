async function addUser(event) {
    event.preventDefault();
    try {
        const name = document.querySelector("#name").value;
        const email = document.querySelector("#email").value;
        const phone = document.querySelector("#phone").value;
        const password = document.querySelector("#password").value;
        if (name == "" || email == "" || phone == "" || password == "") {
            return alert("Please fill required details.");
        }
        const res = await axios.post(`${baseUrl}/user/add`, {
            name: name,
            email: email,
            phone: phone,
            password: password
        });
        alert(res.data.message);
        document.querySelector("#name").value = "";
        document.querySelector("#email").value = "";
        document.querySelector("#phone").value = "";
        document.querySelector("#password").value = "";
    } catch (err) {
        alert(err.response.data.message);
    }
};

// Main code

var baseUrl = "http://44.201.83.42";

document.querySelector("#signup").addEventListener("click", addUser);