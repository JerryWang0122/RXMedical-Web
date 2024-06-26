$(document).ready(async function () {
    const tokenRes = await fetch(`http://${IPAddress}:8080/api/users/user/CSRFToken`, {
        method: 'POST'
    });
    const tokenJson = await tokenRes.json();

    if (tokenJson.state) {
        $('#jToken').val(tokenJson.data[0]);
    } else {
        Swal.fire({
            position: "top",
            icon: "error",
            title: "伺服器發生錯誤",
            showConfirmButton: true
        })
        return;
    }

    // 處理登入行為
    $('#loginBtn').on('click', async function (event) {
        event.preventDefault();
        // get user login input
        const email = $('#jEmail').val();
        const password = $('#jPassword').val();
        const token = $('#jToken').val();

        const response = await fetch(`http://${IPAddress}:8080/api/users/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenJson.data[1]}`
            },
            body: JSON.stringify({ email, password, token }),   // 資料轉 json 字串
        });
        const { state, message, data } = await response.json();
        const { dept, name, authLevel, jwt } = data;

        if (state) { // log success
            switch (data.authLevel) {
                case "root":
                case "admin":
                case "staff":
                    Swal.fire({
                        position: "top",
                        icon: "success",
                        title: "登入成功",
                        showConfirmButton: false,
                        timer: 1000
                    });
                    localStorage.setItem('currUser', JSON.stringify({ dept, name, authLevel}));
                    localStorage.setItem('jwt', jwt);
                    setTimeout(() => {
                        location.href = './front_page_frame.html';
                    }, 1000);

                    break;
                case "off":
                case "register":
                default:
                    Swal.fire({
                        position: "top",
                        icon: "error",
                        title: "帳號權限有誤，請聯繫管理員",
                        showConfirmButton: false,
                        timer: 1500
                    })
            }

        } else { // log fail
            Swal.fire({
                position: "top",
                icon: "error",
                title: message,
                showConfirmButton: false,
                timer: 1500
            })
        }
    });
});