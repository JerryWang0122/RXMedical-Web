$(document).ready(async function () {
    
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

    let table = null;
    let data = null;
    

    // 清空過去 DataTables 設定
    const cleanTable = () => {
        if (table !== null) {
            table.clear().destroy();
        }

        $('#orderListTable thead').empty();
        $('#orderListTable tbody').empty();
    }

    // 渲染 #orderDetailsArea 的資料顯示
    const renderDetailListArea = (orderDetail, index) => {
        return `<tr>
				<td>${index + 1}</td>
				<td>${orderDetail.productName}</td>
				<td>${orderDetail.quantity}</td>
			</tr>`;
    }

    // 渲染 #orderDetailsArea 的資料顯示
    const renderFinishListArea = (orderDetail, index) => {
        return `<tr>
				<td>${index + 1}</td>
				<td style="white-space:nowrap;">${orderDetail.productName}</td>
				<td style="white-space:nowrap;">${orderDetail.quantity}</td>
				<td style="white-space:nowrap;">${orderDetail.grabber}</td>
			</tr>`;
    }

    // 填充admin人員選項到選單中
    const loadAdminListToOption = async function () {
        // TODO: 發API 到後台拉admin人員的資料
        const adminList = await [
            { "id": 1, "empCode": "12345", "name": "陳一令" },
            { "id": 2, "empCode": "22345", "name": "陳二令" },
            { "id": 3, "empCode": "32345", "name": "陳三令" },
            { "id": 4, "empCode": "42345", "name": "陳四令" },
        ]

        // 載入admin人員選項
        adminList.forEach(adminMember => {
            $('#jAdminList').append(`<option value="${adminMember.id}">${adminMember.empCode} / ${adminMember.name}</option>`);
        })

    }

    // -------------------- orderStateNav 按鈕被按下時 -----------------
    $('#orderStateNav').on('click', '.nav-link', async function (event) {
        // console.log(this);
        const status = $(this).data('status');
        $('#orderStateNav .nav-link').removeClass('active');
        // 将点击的按钮添加 'active' 类
        $(this).addClass('active');

        // TODO: 利用status發API，並決定要顯示的方式
        switch (status) {
            case '待確認':
                loadToBeConfirmedTable();
                break;
            case '待撿貨':
                break;
            case '待出貨':
                loadWaitingTable();
                break;
            case '運送中':
                loadOrderTransportingTable();
                break;
            case '已完成':
                loadOrderFinishTable();
                break;
            case '取消':
                loadOrderCanceledTable();
                break;
            default:
                console.log(status);
        };

    });

    // ----------------------------- 待確認 unchecked (to be confirmed) -----------------------------
    // 載入"待確認"訂單資料
    const loadToBeConfirmedTable = async () => {
        cleanTable();

        // TODO: 發 API 到後台拉"待確認"訂單資料
        data = await [
            { "id": 1, "recordId": "20240523001", "applyAmount": 20, "dept": "護家202", "title": "書記", "name": "王建民" },
            { "id": 2, "recordId": "20240523002", "applyAmount": 10, "dept": "502病房", "title": "契約專員", "name": "陳曉民" },
            { "id": 3, "recordId": "20240523003", "applyAmount": 20, "dept": "護家202", "title": "書記", "name": "王建民" },
            { "id": 4, "recordId": "20240523004", "applyAmount": 10, "dept": "502病房", "title": "契約專員", "name": "陳曉民" },
            { "id": 5, "recordId": "20240523005", "applyAmount": 20, "dept": "護家202", "title": "書記", "name": "王建民" },
            { "id": 6, "recordId": "20240523006", "applyAmount": 10, "dept": "502病房", "title": "契約專員", "name": "陳曉民" },
            { "id": 7, "recordId": "20240523007", "applyAmount": 20, "dept": "護家202", "title": "書記", "name": "王建民" },
            { "id": 8, "recordId": "20240523008", "applyAmount": 10, "dept": "502病房", "title": "契約專員", "name": "陳曉民" },
            { "id": 9, "recordId": "20240523009", "applyAmount": 20, "dept": "護家202", "title": "書記", "name": "王建民" },
            { "id": 10, "recordId": "20240523010", "applyAmount": 10, "dept": "502病房", "title": "契約專員", "name": "陳曉民" },
            { "id": 11, "recordId": "20240523011", "applyAmount": 20, "dept": "護家202", "title": "書記", "name": "王建民" },
            { "id": 12, "recordId": "20240523012", "applyAmount": 10, "dept": "502病房", "title": "契約專員", "name": "陳曉民" },
        ];

        table = $('#orderListTable').DataTable({
            language: {
                url: "../js/zh-Hant.json"  // 引用自定義漢化方式
            },
            paging: false,
            data: data,
            autoWidth: false,
            responsive: true,
            layout: {
                topStart: 'search',
                topEnd: 'info',
                bottomStart: null
            },
            columns: [ // responsivePriority
                { 
                    data: 'recordId', title: "編號", responsivePriority: 4,
                    className: "min-tablet-l text-start text-md-center fs-5" 
                },
                { 
                    data: 'dept', title: "處室", responsivePriority: 2,
                    className: "text-center fs-5" 
                },
                { 
                    data: 'title', title: "職稱", responsivePriority: 6,
                    className: "min-tablet-l text-start text-md-center fs-5"
                },
                {
                    data: 'name', title: "申請人", responsivePriority: 5,
                    className: "min-tablet-p text-start text-sm-center fs-5"
                },
                {
                    data: 'id', title: "明細", responsivePriority: 3,
                    render: function (data, type, row) {
                        return `<button class="btn btn-outline-info fs-5 btn-order-detail" data-id="${data}" 
                            data-record-id="${row.recordId}" data-status="待確認" data-apply-dept="${row.dept}"
                            data-apply-user-name="${row.name}"
                    		data-bs-toggle="modal" data-bs-target="#orderDetailModal"> 
                    			<i class="bi bi-journal-text"></i>
                  			</button>`;
                    },
                    className: "fs-5 text-center"
                },
                {
                    data: 'applyAmount', title: "品項數量", responsivePriority: 7,
                    className: "min-desktop text-start text-md-center fs-5"
                },
                {
                    data: 'id', title: "確認訂單", responsivePriority: 1,
                    render: function (data, type, row) {
                        return `
                        <button class="btn-push-to-picking btn btn-success" data-id="${data}" data-record-id="${row.recordId}"><i class="bi bi-check-lg"></i></button>
                        <button class="btn-push-to-cancel btn btn-danger ms-3" data-id="${data}" data-record-id="${row.recordId}"><i class="bi bi-x-lg"></i></i></button>`;
                    },
                    className: "fs-5 text-center"
                }
            ],
            columnDefs: [
                {
                    targets: '_all',
                    className: 'text-start text-md-center align-middle fs-5'
                }
            ]
        });


    };

    // 顯示訂單詳細內容
    $('#orderListTable').on('click', '.btn-order-detail', async function () {

        const id = $(this).data('id');
        const recordId = $(this).data('record-id');
        const status = $(this).data('status');
        const applyDept = $(this).data('apply-dept');
        const applyUserName = $(this).data('apply-user-name');


        // 更新 modal title 顯示資料
        $('#detailRecordId').text(recordId);
        $('#detailOrderStatus').text(status);
        $('#detailApplyDept').text(applyDept);
        $('#detailApplyUserName').text(applyUserName);

        // 先清空 detailListArea
        $('#detailListArea').empty();

        // // TODO: 用id到後台拿資料
        const detailLists = await[
            { "productName": "石膏鞋", "quantity": 5 },
            { "productName": "石膏鞋", "quantity": 10 },
            { "productName": "石膏鞋", "quantity": 15 },
            { "productName": "石膏鞋石膏鞋石膏鞋", "quantity": 20 },
            { "productName": "石膏鞋石膏鞋", "quantity": 25 },
            { "productName": "石膏鞋", "quantity": 30 },
            { "productName": "石膏鞋石膏鞋石膏鞋", "quantity": 35 },
            { "productName": "石膏鞋", "quantity": 40 },
            { "productName": "石膏鞋", "quantity": 45 },
            { "productName": "石膏鞋石膏鞋", "quantity": 50 },
            { "productName": "石膏鞋", "quantity": 55 },
            { "productName": "石膏鞋石膏鞋石膏鞋", "quantity": 60 },
        ];

        // 顯示資料
        $('#detailListArea').html(detailLists.map(renderDetailListArea).join(''));

    });

    // 把訂單推到待撿貨
    $('#orderListTable').on('click', '.btn-push-to-picking', async function () {
        const id = $(this).data('id');
        const recordId = $(this).data('record-id');

        // TODO: 發API到後台將訂單往待撿貨狀態推
        // 利用 id 把訂單推到待撿貨
        // const response = await fetch('http://localhost:8080/api/sales/admin/order_list/unchecked', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ id })
        // });

        // const { state, message } = await response.json();
        let state = true;
        let message = 'something wrong';

        if (state) {    // 狀態推送成功
            Swal.fire({
                position: "top",
                icon: "success",
                title: `訂單確認 ${recordId} `,
                showConfirmButton: false,
                timer: 800
            });

            // 移除該行資料
            table.row($(this).closest('tr')).remove().draw();
        } else {
            Swal.fire({
                position: "top",
                icon: "error",
                title: `確認訂單 ${recordId} 發生錯誤 `,
                text: message,
                showConfirmButton: true
            });
        }

    });

    // 把訂單推到取消
    $('#orderListTable').on('click', '.btn-push-to-cancel', async function () {
        const id = $(this).data('id');
        const recordId = $(this).data('record-id');

        const result = await Swal.fire({
            title: `取消訂單 ${recordId}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "確認取消",
            cancelButtonText: "再看看",
        })

        if (!result.isConfirmed) {
            return;
        }

        // TODO: 發API到後台將訂單往取消狀態推
        // 利用 id 把訂單推到待撿貨
        // const response = await fetch('http://localhost:8080/api/admin/order_list/unchecked', {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ id })
        // });

        // const { state, message } = await response.json();
        let state = true;
        let message = 'something wrong';

        if (state) {    // 狀態推送成功
            Swal.fire({
                position: "top",
                icon: "success",
                title: `成功取消訂單 ${recordId}`,
                showConfirmButton: false,
                timer: 800
            });

            // 移除該行資料
            table.row($(this).closest('tr')).remove().draw();
        } else {
            Swal.fire({
                position: "top",
                icon: "error",
                title: `取消訂單 ${recordId}\n 發生錯誤 `,
                text: message,
                showConfirmButton: true
            });
        }

    });


    // ----------------------------- 待撿貨 picking -----------------------------


    // ----------------------------- 待出貨 waiting -----------------------------
    // 指派人員運送，並將訂單推到"運送中"狀態
    $('#assignTransporterBtn').on('click', async function (event) {
        event.preventDefault();
        
        
        // 取得配送訂單和配送人員編號
        const waitingId = $('#jWaitingId').val();
        const transporterId = $('#jAdminList').val();
        
        // 利用waitingId找到欄位
        const waiting = $('#orderListTable tbody tr [data-id="' + waitingId + '"]')[1];
        
        if (!transporterId) {
            Swal.fire({
                title: "請指定配送人員",
                icon: "warning",
                position: "top"
            });
            return;
        }
        console.log(waitingId, transporterId);

        // TODO: 發API到後台確認配送訂單
        // const response = await fetch('http://localhost:8080/api/sales/admin/order_list/waiting', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         id: waitingId,
        //         transporterId
        //     })
        // });

        // const { state, message } = await response.json();
        let state = true;
        let message = 'something wrong';
        if (state) {
            Swal.fire({
                position: "top",
                icon: "success",
                title: "開始配送",
                showConfirmButton: false,
                timer: 1000
            });

            
            // 關閉 modal 視窗
            setTimeout(() => {
                $('#orderWaitingModal').modal('hide');
                // 移除該行資料
                table.row($(waiting).closest('tr')).remove().draw();
                // Reset jAdminList 選項
                $('#jAdminList').val(null).trigger('change');
            }, 1000)
        } else {
            Swal.fire({
                position: "top",
                icon: "error",
                title: "設定失敗",
                text: message,
                showConfirmButton: true
            });
        }
    });

    // 修改指派人員的訂單顯示資料
    $('#orderListTable').on('click', '.btn-assign-transporter', async function () {
        const id = $(this).data('id');
        const recordId = $(this).data('record-id');
        const applyDept = $(this).data('apply-dept');
        const applyUserName = $(this).data('apply-user-name');

        // 替換資訊
        $('#orderWaitingRecordId').text(recordId);
        $('#orderWaitingDept').text(applyDept);
        $('#orderWaitingMemberName').text(applyUserName);
        $('#jWaitingId').val(id);
        
    });

    // 載入"待確認"訂單資料
    const loadWaitingTable = async () => {
        cleanTable();

        // TODO: 發 API 到後台拉"待確認"訂單資料
        data = await [
            { "id": 1, "recordId": "20240525001", "dept": "護家202", "title": "書記", "name": "王建民" },
            { "id": 2, "recordId": "20240525002", "dept": "502病房", "title": "契約專員", "name": "陳曉民" },
            { "id": 3, "recordId": "20240525003", "dept": "護家202", "title": "書記", "name": "王建民" },
            { "id": 4, "recordId": "20240525004", "dept": "502病房", "title": "契約專員", "name": "陳曉民" }
        ];

        table = $('#orderListTable').DataTable({
            language: {
                url: "../js/zh-Hant.json"  // 引用自定義漢化方式
            },
            paging: false,
            data: data,
            autoWidth: false,
            responsive: true,
            layout: {
                topStart: 'search',
                topEnd: 'info',
                bottomStart: null
            },
            columns: [ // responsivePriority
                {
                    data: 'recordId', title: "編號", responsivePriority: 4,
                    className: "min-tablet-l text-start text-md-center fs-5"
                },
                {
                    data: 'dept', title: "處室", responsivePriority: 2,
                    className: "text-center fs-5"
                },
                {
                    data: 'title', title: "職稱", responsivePriority: 6,
                    className: "min-tablet-l text-start text-md-center fs-5"
                },
                {
                    data: 'name', title: "申請人", responsivePriority: 5,
                    className: "min-tablet-p text-start text-sm-center fs-5"
                },
                {
                    data: 'id', title: "明細", responsivePriority: 3,
                    render: function (data, type, row) {
                        return `<button class="btn btn-outline-secondary fs-5 btn-order-detail" data-id="${data}" 
                            data-record-id="${row.recordId}" data-status="待出貨" data-apply-dept="${row.dept}"
                            data-apply-user-name="${row.name}"
                    		data-bs-toggle="modal" data-bs-target="#orderDetailModal"> 
                    			<i class="bi bi-journal-text"></i>
                  			</button>`;
                    },
                    className: "fs-5 text-center"
                },
                {
                    data: 'id', title: "開始配送", responsivePriority: 1,
                    render: function (data, type, row) {
                        return `
                        <button class="btn-assign-transporter btn btn-success" 
                        data-id="${data}" data-record-id="${row.recordId}" data-apply-dept="${row.dept}"
                        data-apply-user-name="${row.name}"
                        data-bs-toggle="modal" data-bs-target="#orderWaitingModal"> 
                            指定人員
                        </button>`;
                    },
                    className: "fs-5 text-center"
                }
            ],
            columnDefs: [
                {
                    targets: '_all',
                    className: 'text-start text-md-center align-middle fs-5'
                }
            ]
        });
    };


    // ----------------------- 運送中 transporting --------------------------------
    // 載入運送中Table資料
    const loadOrderTransportingTable = async () => {
        cleanTable();
        // TODO: 發 API 到後台拉"運送中"訂單資料(感覺這一個 Table 需要定期自動刷新？)
        data = await [
            { 
                "id": 1, "recordId": "20240523051", "dept": "嘉監", "title": "書記", "name": "盧秀憲",
                "transporter": "王俊傑", "updateDate": "2024-05-23 09:13:25" 
            },
            { 
                "id": 2, "recordId": "20240523052", "dept": "嘉所", "title": "管理員", "name": "測試用",
                "transporter": "王俊傑", "updateDate": "2024-05-23 10:53:25"
            },
            { 
                "id": 3, "recordId": "20240523053", "dept": "精神科", "title": "專員", "name": "想不到",
                "transporter": "張芸瑄", "updateDate": "2024-05-24 09:13:25" 
            }
        ];

        table = $('#orderListTable').DataTable({
            language: {
                url: "../js/zh-Hant.json"  // 引用自定義漢化方式
            },
            paging: false,
            data: data,
            autoWidth: false,
            responsive: true,
            layout: {
                topStart: 'search',
                topEnd: 'info',
                bottomStart: null
            },
            columns: [ // responsivePriority
                {
                    data: 'recordId', title: "編號", responsivePriority: 7,
                    className: "min-desktop fs-5 text-start text-md-center"
                },
                {
                    data: 'dept', title: "處室", responsivePriority: 2,
                    className: "text-center fs-5"
                },
                {
                    data: 'title', title: "職稱", responsivePriority: 6,
                    className: "min-tablet-l fs-5 text-md-center"
                },
                {
                    data: 'name', title: "申請人", responsivePriority: 5,
                    className: "min-tablet-l fs-5 text-start text-md-center" 
                    
                },
                {
                    data: 'transporter', title: "配送人", responsivePriority: 3,
                    className: "text-center fs-5"
                },
                {
                    data: 'id', title: "明細", responsivePriority: 4,
                    render: function (data, type, row) {
                        return `<button class="btn btn-outline-secondary fs-5 btn-order-detail" data-id="${data}" 
                            data-record-id="${row.recordId}" data-status="運送中" data-apply-dept="${row.dept}"
                            data-apply-user-name="${row.name}"
                    		data-bs-toggle="modal" data-bs-target="#orderDetailModal"> 
                    			<i class="bi bi-journal-text"></i>
                  			</button>`;
                    },
                    className: "min-tablet-p fs-5 text-sm-center text-start"
                },
                {
                    data: 'updateDate', title: "開始配送", responsivePriority: 1,
                    render: function (data, type, row) {
                        return `
                        <p class="fs-6 mb-1">${ data.split(' ')[0] }</p>
                        <p class="fs-6 mb-1">${ data.split(' ')[1] }</p>
                        `;
                    },
                    className: 'text-center fs-5'
                }
            ],
            columnDefs: [
                {
                    targets: '_all',
                    className: 'align-middle fs-5'
                }
            ]
        });
    };

    // ----------------------- 已完成 finish --------------------------------

    // 顯示訂單詳細內容
    $('#orderListTable').on('click', '.btn-order-finish', async function () {

        const id = $(this).data('id');
        const recordId = $(this).data('record-id');
        const applyDept = $(this).data('apply-dept');
        const applyUserName = $(this).data('apply-user-name');
        const transporter = $(this).data('transporter');


        // 更新 modal title 顯示資料
        $('#finishRecordId').text(recordId);
        $('#finishApplyDept').text(applyDept);
        $('#finishApplyUserName').text(applyUserName);
        $('#finishTransporterName').text(transporter);

        // 先清空 finishListArea
        $('#finishListArea').empty();

        // // TODO: 用id到後台拿資料
        const detailLists = await [
            { "productName": "石膏鞋", "quantity": 5, "grabber": '測試一' },
            { "productName": "石膏鞋", "quantity": 10, "grabber": '測試一' },
            { "productName": "石膏鞋", "quantity": 15, "grabber": '測試一' },
            { "productName": "石膏鞋石膏鞋石膏鞋", "quantity": 20, "grabber": '測試一' },
            { "productName": "石膏鞋石膏鞋", "quantity": 25, "grabber": '測試一' },
            { "productName": "石膏鞋", "quantity": 30, "grabber": '測試一' },
            { "productName": "石膏鞋石膏鞋石膏鞋", "quantity": 35, "grabber": '測試一' },
            { "productName": "石膏鞋", "quantity": 40, "grabber": '測試一' },
            { "productName": "石膏鞋", "quantity": 45, "grabber": '測試一' },
            { "productName": "石膏鞋石膏鞋", "quantity": 50, "grabber": '測試一' },
            { "productName": "石膏鞋", "quantity": 55, "grabber": '測試一' },
            { "productName": "石膏鞋石膏鞋石膏鞋", "quantity": 60, "grabber": '測試一' },
        ];

        // 顯示資料
        $('#finishListArea').html(detailLists.map(renderFinishListArea).join(''));

    });

    const loadOrderFinishTable = async () => {
        cleanTable();
        // TODO: 發 API 到後台拉"運送中"訂單資料(感覺這一個 Table 需要定期自動刷新？)
        data = await [
            {
                "id": 1, "recordId": "20240523071", "dept": "文書中心", "title": "一般專員", "name": "洪申翰",
                "transporter": "王俊傑", "updateDate": "2024-05-23 09:13:25"
            },
            {
                "id": 2, "recordId": "20240523072", "dept": "營養科", "title": "管理員", "name": "習大大",
                "transporter": "羅議程", "updateDate": "2024-05-23 10:53:25"
            },
            {
                "id": 3, "recordId": "20240523073", "dept": "急診", "title": "書記", "name": "林老師",
                "transporter": "張芸瑄", "updateDate": "2024-05-24 09:13:25"
            }
        ];

        table = $('#orderListTable').DataTable({
            language: {
                url: "../js/zh-Hant.json"  // 引用自定義漢化方式
            },
            paging: false,
            data: data,
            autoWidth: false,
            responsive: true,
            layout: {
                topStart: 'search',
                topEnd: 'info',
                bottomStart: null
            },
            columns: [ // responsivePriority
                {
                    data: 'recordId', title: "編號", responsivePriority: 1,
                    className: "text-center fs-5"
                },
                {
                    data: 'dept', title: "處室", responsivePriority: 2,
                    className: "min-tablet-p fs-5 text-sm-center text-start"
                },
                {
                    data: 'title', title: "職稱", responsivePriority: 5,
                    className: "min-tablet-l fs-5 text-md-center"
                },
                {
                    data: 'name', title: "申請人", responsivePriority: 4,
                    className: "min-tablet-l fs-5 text-start text-md-center"

                },
                {
                    data: 'transporter', title: "配送人", responsivePriority: 6,
                    className: 'min-tablet-l fs-5 text-start text-md-center'
                },
                {
                    data: 'id', title: "明細", responsivePriority: 7,
                    className: "min-desktop fs-5 text-start text-md-center", 
                    render: function (data, type, row) {
                        return `<button class="btn btn-outline-secondary fs-5 btn-order-finish" data-id="${data}" 
                            data-record-id="${row.recordId}" data-apply-dept="${row.dept}"
                            data-apply-user-name="${row.name}" data-transporter="${row.transporter}"
                    		data-bs-toggle="modal" data-bs-target="#orderFinishModal"> 
                    			<i class="bi bi-journal-text"></i>
                  			</button>`;
                    }
                },
                {
                    data: 'updateDate', title: "完成時間", responsivePriority: 3,
                    className: "text-center fs-5", 
                    render: function (data, type, row) {
                        return `
                        <p class="fs-6 mb-1">${data.split(' ')[0]}</p>
                        <p class="fs-6 mb-1">${data.split(' ')[1]}</p>
                        `;
                    }
                }
            ],
            columnDefs: [
                {
                    targets: '_all',
                    className: 'align-middle fs-5'
                }
            ]
        });
    };


    // ----------------------- 取消 rejected (canceled) --------------------------------
    // 載入取消訂單Table資料
    const loadOrderCanceledTable = async () => {
        cleanTable();

        // TODO: 發 API 到後台拉"待確認"訂單資料
        data = await [
            { "id": 1, "recordId": "20240523091", "applyAmount": 25, "dept": "護家302", "title": "書記", "name": "王美惠" },
            { "id": 2, "recordId": "20240523092", "applyAmount": 15, "dept": "202病房", "title": "契約專員", "name": "陳國偉" },
            { "id": 3, "recordId": "20240523093", "applyAmount": 21, "dept": "護家301", "title": "書記", "name": "王小玉" }
        ];

        table = $('#orderListTable').DataTable({
            language: {
                url: "../js/zh-Hant.json"  // 引用自定義漢化方式
            },
            paging: false,
            data: data,
            autoWidth: false,
            responsive: true,
            layout: {
                topStart: 'search',
                topEnd: 'info',
                bottomStart: null
            },
            columns: [ // responsivePriority
                {
                    data: 'recordId', title: "編號", responsivePriority: 4,
                    className: "min-tablet-p text-start text-md-center fs-5"
                },
                {
                    data: 'dept', title: "處室", responsivePriority: 2,
                    className: "text-center fs-5"
                },
                {
                    data: 'title', title: "職稱", responsivePriority: 6,
                    className: "min-tablet-l text-start text-md-center fs-5"
                },
                {
                    data: 'name', title: "申請人", responsivePriority: 5,
                    className: "min-tablet-l text-start text-md-center fs-5"
                },
                {
                    data: 'id', title: "明細", responsivePriority: 3,
                    render: function (data, type, row) {
                        return `<button class="btn btn-outline-secondary fs-5 btn-order-detail" data-id="${data}" 
                            data-record-id="${row.recordId}" data-status="取消" data-apply-dept="${row.dept}"
                            data-apply-user-name="${row.name}"
                    		data-bs-toggle="modal" data-bs-target="#orderDetailModal"> 
                    			<i class="bi bi-journal-text"></i>
                  			</button>`;
                    },
                    className: "fs-5 text-center"
                },
                {
                    data: 'applyAmount', title: "品項數量", responsivePriority: 7,
                    className: "min-desktop text-start text-md-center fs-5"
                }
            ],
            columnDefs: [
                {
                    targets: '_all',
                    className: 'text-start text-md-center align-middle fs-5'
                }
            ]
        });


    };


    //--------------------- 載入網頁 ---------------------
    // 初始狀態時，載入"待確認"訂單
    await loadToBeConfirmedTable();

    // 載入admin人員選項到指派人員的modal
    await loadAdminListToOption();

});