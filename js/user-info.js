$(document).ready(async function () {

    // 進入時，資料初始化
    let currUser = JSON.parse(localStorage.getItem('currUser'));

    const response = await fetch('http://localhost:8080/api/users/user/profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'userId': currUser.id, 'verifyToken': currUser.verifyToken })
    });
    const { state, message, data } = await response.json();

    if (state) {
        // 填入使用者資料
        $('#jEmpId').val(data.empCode);
        $('#jName').val(data.name);
        $('#jDept').val(data.dept);
        $('#jTitle').val(data.title);
        $('#jEmail').val(data.email);

        // 如果是 root使用者，只能唯讀
        if (data.authLevel === 'root') {
            $('#jName').prop('readonly', true);
            $('#jDept').prop('readonly', true);
            $('#jTitle').prop('readonly', true);
            $('#jEmail').prop('readonly', true);
        };
    } 

    // 修改資料表單送出
    $('#userInfoForm').on('submit', async(event) => {
        event.preventDefault();

        // 資料不可為空
        if (!$('#jName').val() || !$('#jDept').val() || !$('#jTitle').val() || !$('#jEmail').val()) {
            Swal.fire({
                position: "top",
                icon: "error",
                title: "資料不可為空",
                showConfirmButton: true
            })
            return;
        }
        
        const formData = {
            userId: currUser.id,
            name: $('#jName').val(),
            dept: $('#jDept').val(),
            title: $('#jTitle').val(),
            email: $('#jEmail').val(),
            verifyToken: currUser.verifyToken
        };

        const editResponse = await fetch('http://localhost:8080/api/users/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)  // 資料轉 json 字串
        });

        const resJson = await editResponse.json();
        if (resJson.state) {   // 修改成功
            Swal.fire({
                position: "top",
                icon: "success",
                title: "修改成功",
                showConfirmButton: false,
                timer: 1000
            })
            // 刷新已存在的資料
            currUser = resJson.data;
            localStorage.setItem('currUser', JSON.stringify(currUser));
            $('.user-name').text(currUser.name);
        } else {
            Swal.fire({
                position: "top",
                icon: "error",
                title: resJson.message,
                showConfirmButton: true
            })

            // Reset 使用者資料
            $('#jEmpId').val(data.empCode);
            $('#jName').val(data.name);
            $('#jDept').val(data.dept);
            $('#jTitle').val(data.title);
            $('#jEmail').val(data.email);
        }
        
    })
});