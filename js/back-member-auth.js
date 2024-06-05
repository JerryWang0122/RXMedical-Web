$(document).ready(async function () {

    // 會員權限選項
    const options = [
        { value: 'root', text: 'root', disabled: true },
        { value: 'admin', text: '管理人員' },
        { value: 'staff', text: '一般員工' },
        { value: 'register', text: '完成註冊', disabled: true },
        { value: 'off', text: '關閉權限' }
    ];

    // 進入時，當沒有使用者資料時，強行導入回登入頁
    if (!localStorage.getItem('currUser')) {
        location.href = './index.html';
        return;
    }

    // 取得使用者資訊
    let currUser = JSON.parse(localStorage.getItem('currUser'));

    // 發 API 到後台拉人員權限資料
    const memberRes = await fetch('http://localhost:8080/api/users/admin/member', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "userId": currUser.id, "verifyToken": currUser.verifyToken })
    });

    const memberJson = await memberRes.json();

    // DataTables
    /**
     * Responsive Details -> https://datatables.net/extensions/responsive/classes
     * ----------------------------
     * desktop: x > 1024
     * tablet-l: 768 < x <= 1024
     * tablet-p: 480 < x <= 768
     * mobile-l: 320 < x <= 768
     * mobile-p: x <= 320
     */
    let table = $('#memberAuthLevelTable').DataTable({
        language: {
            url: "../js/zh-Hant.json"  // 引用自定義漢化方式
        },
        lengthMenu: [[10, 20, 50, -1], [10, 20, 50, "All"]], //顯示筆數設定
        data: memberJson.data,
        autoWidth: false,
        responsive: true,
        layout: {
            top3Start: 'search',
            top2Start: 'info',
            top2End: 'pageLength',
            topStart: null,
            topEnd: null,
            top: 'paging',
            bottom: 'paging',
            bottomStart: null,
            bottomEnd: null,
        },
        columns: [ // responsivePriority
            { 
                data: 'empCode', title: "ID", responsivePriority: 1,
                className: "min-tablet-l fs-5 text-start text-md-center"
            },
            { 
                data: 'dept', title: "處室", responsivePriority: 4, 
                className: " min-tablet-p fs-5 text-start text-sm-center" 
            },
            { 
                data: 'title', title: "職稱", responsivePriority: 5,
                className: "min-tablet-p fs-5 text-start text-sm-center"
            },
            { data: 'name', title: "姓名", responsivePriority: 2, className: "text-center fs-5" },
            { 
                data: 'createDate', title: "註冊日", responsivePriority: 6,
                className: "min-tablet-l text-start text-md-center fs-5"
            },
            {
                data: 'authLevel', title: "權限", responsivePriority: 3,
                render: function (data, type, row) {
                    if (data === "root") {
                        return "root";
                    }
                    let retHTML = `<span>${options.find(opt => opt.value === data).text}</span>`
                    if (currUser.authLevel === "root") {
                        retHTML += `<button class="btn-change-auth btn fs-5 text-primary" 
                                    data-member-id="${row.id}" data-auth-level="${data}" data-member-name="${row.name}"  
                                    data-member-title="${row.title}" data-member-dept="${row.dept}"
                                    data-bs-toggle="modal" data-bs-target="#authChangeModal">
                                        <i class="bi bi-pencil-square"></i>
                                    </button>`
                    }
                    return retHTML;

                },
                className: "text-center align-middle fs-5"
            }
        ],
        columnDefs: [
            {
                targets: '_all',
                className: 'text-start text-md-center align-middle fs-5'
            }
        ]
    });

    // 編輯權限按鈕點擊事件
    $('#memberAuthLevelTable').on('click', '.btn-change-auth', async function () {
        // 權限按鈕刷新
        $('input[type="radio"]').each(function() {
            $(this).prop('checked', false);
        });

        $('#authChangeMemberDept').text($(this).data('member-dept'));
        $('#authChangeMemberTitle').text($(this).data('member-title'));
        $('#authChangeMemberName').text($(this).data('member-name'));
        $('#jMemberId').val($(this).data('member-id'));

        // authLevel 相同者預先選取起來
        const authLevel = $(this).data('auth-level');
        // 選取 input:radio value === authLevel 設置為 checked
        $('input[type="radio"][value="' + authLevel + '"]').prop('checked', true);
    });

    // 確認修改權限按鈕點擊事件
    $('#authChangeBtn').on('click', async function (event) {
        event.preventDefault();

        const authLevel = $('input[type="radio"]:checked').val();
        const memberId = $('#jMemberId').val();
        
        // 發API到後台改人員權限
        const response = await fetch('http://localhost:8080/api/users/root/member', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'userId': currUser.id,
                memberId,
                authLevel,
                'verifyToken': currUser.verifyToken
            })
        });

        const { state, message } = await response.json();

        if (state) {
            Swal.fire({
                position: "top",
                icon: "success",
                title: message,
                showConfirmButton: false,
                timer: 1000
            });
            // 利用data-member-id找到table欄位對應的button，並更新span -> 修正更動人員的權限顯示狀態
            $('[data-member-id=' + memberId + ']').data('auth-level', authLevel);
            $('[data-member-id=' + memberId +']').prev().text(options.find(opt => opt.value === authLevel).text);

            // 關閉 modal 視窗
            setTimeout(() => {
                $('#authChangeModal').modal('hide');
            }, 1000)
        } else {
            Swal.fire({
                position: "top",
                icon: "error",
                title: message,
                showConfirmButton: true
            })
        }

        
    });

    
});