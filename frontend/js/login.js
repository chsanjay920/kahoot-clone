const apiUrl = 'http://localhost:8000';
var login = document.getElementById('login');
var signin = document.getElementById('register');


signin.style.display = "none";

function register()
{
    login.style.display = "none";
    signin.style.display = "block";
}

function submitregister()
{
    var username = document.getElementById("userid");
    var password = document.getElementById("rpassword");
    var confirmpassword = document.getElementById("cpassword");
    if(username.length == 0 || username.length < 6)
    {
        alert("Enter valid username!");
        return;
    }
    if(password == confirmpassword)
    {
        alert("Password must match!");
        return;
    }
    fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username : username.value,
            password:password.value,
            role:"player"
        }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            alert("New user registered!");
            return response.json();
        })
        .then((data) => {
            console.log('Server response:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function Userlogin()
{
    var username = document.getElementById("username");
    var password = document.getElementById("clientpassword");
    
    fetch(`${apiUrl}/login/${username.value}_${password.value}`,).then(data => data.json().then(response => {
        if(response.role == "player")
            window.location.href = 'player.html';
        else if(response.role == "admin")
            window.location.href = 'dashboard.html';
        else
            alert("invalid user");
    }))
}

function showLogin()
{
    login.style.display = "block";
    signin.style.display = "none";
}