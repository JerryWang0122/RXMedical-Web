$(document).ready(async function () {
    // 會員權限選項
    const options = [
        { value: 'root', text: 'root', disabled: true },
        { value: 'admin', text: '管理人員' },
        { value: 'staff', text: '一般員工' },
        { value: 'register', text: '完成註冊', disabled: true },
        { value: 'off', text: '關閉權限' }
    ];

    // TODO: 發 API 到後台拉人員權限資料
    let data = await [
        { "id": 1, "empId": "00000", "name": "root", "dept": "衛材庫房", "title": "root", "authLevel": "root" ,"createDate": "2024-05-01" },
        { "id": 2, "empId": "73174", "name": "王俊傑", "dept": "秘書室", "title": "替代役", "authLevel": "admin" ,"createDate": "2024-05-21" },
        { "id": 3, "empId": "12345", "name": "金一蓉", "dept": "文書中心", "title": "一般專員", "authLevel": "staff" ,"createDate": "2024-05-21" },
        { "id": 4, "empId": "22345", "name": "陳二令", "dept": "衛材庫房", "title": "契約專員", "authLevel": "admin" ,"createDate": "2024-05-21" },
        { "id": 5, "empId": "32345", "name": "張三疼", "dept": "秘書室", "title": "替代役", "authLevel": "off" ,"createDate": "2024-05-11" },
        { "id": 6, "empId": "42345", "name": "王寺鄉", "dept": "衛材庫房", "title": "契約專員", "authLevel": "register", "createDate": "2024-05-21" },
    ];

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
        data: data,
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
                data: 'empId', title: "ID", responsivePriority: 1,
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
                className: "min-tablet-l"
            },
            {
                data: 'authLevel', title: "權限", responsivePriority: 3,
                render: function (data, type, row) {
                    if (data === "root") {
                        return "root";
                    }

                    return `
                    <span>${ options.find(opt => opt.value === data).text}</span>
                    <button class="btn-change-auth btn fs-5 text-primary" 
                    data-member-id="${row.id}" data-auth-level="${data}" data-member-name="${row.name}"  
                    data-member-title="${row.title}" data-member-dept="${row.dept}"
                    data-bs-toggle="modal" data-bs-target="#authChangeModal">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    `;

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
        console.log(memberId, authLevel);
        // TODO: 發API到後台改人員權限
        // const response = await fetch('http://localhost:8080/api/root/member', {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         "userId": memberId,
        //         authLevel
        //     })
        // });

        // const { state, message } = await response.json();
        let state = true;
        let message = 'test';

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