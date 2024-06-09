$(document).ready(async function () {

    // 當沒有使用者資料時，強行導入回登入頁
    if (!localStorage.getItem('currUser')) {
        location.href = './index.html';
        return;
    }
    const currUser = JSON.parse(localStorage.getItem('currUser'));

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
				<td style="white-space:nowrap;">${orderDetail.takerName}</td>
			</tr>`;
    }

    // 填充admin人員選項到選單中
    const loadAdminListToOption = async function () {
        // 發API 到後台拉admin人員的資料
        const response = await fetch(`http://${IPAddress}:8080/api/users/admin/transporter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "userId": currUser.id, "verifyToken": currUser.verifyToken })
        })
        const adminList = (await response.json()).data;

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

        // 利用status發API，並決定要顯示的方式
        switch (status) {
            case '待確認':
                loadToBeConfirmedTable();
                break;
            case '待撿貨':
                loadPickingTable();
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

        // 發 API 到後台拉"待確認"訂單資料
        const uncheckedRes = await fetch(`http://${IPAddress}:8080/api/sales/admin/order_list/unchecked`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "userId": currUser.id,
                "verifyToken": currUser.verifyToken
            }),
        });
        data = (await uncheckedRes.json()).data;

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
                    data: 'code', title: "編號", responsivePriority: 4,
                    className: "min-tablet-l text-start text-md-center fs-5"
                },
                {
                    data: 'demander.dept', title: "處室", responsivePriority: 2,
                    className: "text-center fs-5"
                },
                {
                    data: 'demander.title', title: "職稱", responsivePriority: 6,
                    className: "min-tablet-l text-start text-md-center fs-5"
                },
                {
                    data: 'demander.name', title: "申請人", responsivePriority: 5,
                    className: "min-tablet-p text-start text-sm-center fs-5"
                },
                {
                    data: 'id', title: "明細", responsivePriority: 3,
                    render: function (data, type, row) {
                        return `<button class="btn btn-outline-info fs-5 btn-order-detail" data-id="${data}" 
                            data-record-id="${row.code}" data-status="待確認" data-apply-dept="${row.demander.dept}"
                            data-apply-user-name="${row.demander.name}"
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
                        <button class="btn-push-to-picking btn btn-success" data-id="${data}" data-record-id="${row.code}"><i class="bi bi-check-lg"></i></button>
                        <button class="btn-push-to-cancel btn btn-danger ms-3" data-id="${data}" data-record-id="${row.code}"><i class="bi bi-x-lg"></i></i></button>`;
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

        //用id到後台拿資料
        const detailListRes = await fetch(`http://${IPAddress}:8080/api/sales/admin/order_list/detail`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "userId": currUser.id,
                "recordId": id,
                "verifyToken": currUser.verifyToken
            }),
        });
        const detailList = (await detailListRes.json()).data;

        // 顯示資料
        $('#detailListArea').html(detailList.map(renderDetailListArea).join(''));

    });

    // 把訂單推到待撿貨
    $('#orderListTable').on('click', '.btn-push-to-picking', async function () {
        const id = $(this).data('id');
        const recordId = $(this).data('record-id');

        // 發API到後台將訂單往待撿貨狀態推
        // 利用 id 把訂單推到待撿貨
        const response = await fetch(`http://${IPAddress}:8080/api/sales/admin/order_list/unchecked`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'userId': currUser.id, 'recordId': id, 'verifyToken': currUser.verifyToken })
        });

        const { state, message } = await response.json();

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

        // 發API到後台將訂單往取消狀態推
        // 利用 id 把訂單推到取消
        const response = await fetch(`http://${IPAddress}:8080/api/sales/admin/order_list/unchecked`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'userId': currUser.id, 'recordId': id, 'verifyToken': currUser.verifyToken })
        });

        const { state, message } = await response.json();

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
    const loadPickingTable = async () => {
        cleanTable();

        // TODO: 發 API 到後台拉"待確認"訂單資料
        const response = await fetch(`http://${IPAddress}:8080/api/sales/admin/order_list/picking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'userId': currUser.id, 'verifyToken': currUser.verifyToken })
        })
        data = (await response.json()).data;

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
                    data: 'code', title: "編號", responsivePriority: 4,
                    className: "min-tablet-l text-start text-md-center fs-5"
                },
                {
                    data: 'demander.dept', title: "處室", responsivePriority: 2,
                    className: "text-center fs-5"
                },
                {
                    data: 'demander.title', title: "職稱", responsivePriority: 6,
                    className: "min-tablet-l text-start text-md-center fs-5"
                },
                {
                    data: 'demander.name', title: "申請人", responsivePriority: 5,
                    className: "min-tablet-p text-start text-sm-center fs-5"
                },
                {
                    data: 'applyAmount', title: "品項數量", responsivePriority: 7,
                    className: "min-desktop text-start text-md-center fs-5"
                },
                {
                    data: 'id', title: "執行動作", responsivePriority: 1,
                    render: function (data, type, row) {
                        return `
                        <button class="btn btn-success btn-start-picking" 
                        data-id="${data}" data-record-id="${row.code}" data-apply-dept="${row.demander.dept}"
                        data-bs-toggle="modal" data-bs-target="#orderPickingModal">開始撿貨</button>`;
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

    // 渲染每一筆訂單的方式
    const renderPickingList = (orderItem) => {
        let resultHTML = `
        <div class="col-12 col-sm-6 col-lg-4 p-1">
            <div class="order-item-detail ${orderItem.takerName ? 'item-picked ' : ''}m-2 p-2">
                <div class="row">
                    <div class="col-4 order-img-container">
                        <img src="${orderItem.product.picture}" alt="">
                    </div>
                    <div class="col-6">
                        <h5>${orderItem.product.name}</h5>
                        <span>${orderItem.product.code}</span><br>
                        <span>${orderItem.product.storage}</span>
                    </div>
                    <div class="col-2 col-sm-12 col-md-2 text-end align-content-center">
                        x${orderItem.quantity}
                    </div>
                </div>

                <div class="row pt-2 mx-1  border-top">
                    <div class="col-12 d-flex justify-content-between align-items-center" style="min-height: 38px;">
        `
        if (orderItem.takerName) {
            resultHTML += `
                        <span>撿貨人: ${orderItem.takerName}</span>
                        <input type="checkbox" class="form-check-input" >
            `;
        } else {
            resultHTML += `
                        <span>尚未撿貨</span>
                        <button class="btn btn-primary btn-pick-it-up" data-history-id="${orderItem.id}">我拿了</button>
            `;
        }

        resultHTML += `</div></div></div></div>`
        return resultHTML;
    };

    // 載入recordId對應的訂單內容
    const loadOrderItemToPickingList = async (id) => {
        $('#showRecordItemArea').empty();    // Reset
        // 發 API 到後台拉"待撿貨"訂單資料(History Table)
        const response = await fetch(`http://${IPAddress}:8080/api/sales/admin/order_list/picking/detail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'userId': currUser.id, 'recordId': id, 'verifyToken': currUser.verifyToken })
        });
        const { state, message, data } = await response.json();
        if (state) {
            $('#showRecordItemArea').html(data.map(renderPickingList).join(''));
        } else {
            Swal.fire({
                position: "top",
                icon: "error",
                title: message,
                showConfirmButton: false,
                timer: 1000
            });
        };

    };

    // 開始撿貨時，刷新訂單撿貨資料
    $('#orderListTable').on('click', '.btn-start-picking', async function (event) {
        const id = $(this).data('id');
        const recordId = $(this).data('record-id');
        const applyDept = $(this).data('apply-dept');
        $('#orderPickingModalLabel').text(`${recordId} - ${applyDept}`);
        $('#pushToWaitingBtn').attr('data-id', id);
        // 載入訂單資料
        await loadOrderItemToPickingList(id);   // load data
    });

    // 當按下“我拿了”按鈕
    $('#orderPickingModal').on('click', '.btn-pick-it-up', async function (event) {
        const pickUpBtn = $(this);
        const showPickerSpan = pickUpBtn.prev();

        // 按下時，先將按鈕漸變消失
        pickUpBtn.addClass('fade-transition hidden');

        // TODO:利用historyId和jwt內部的使用者id，紀錄history的user
        const historyId = $(this).data('history-id');
        const userId = currUser.id;
        const userName = currUser.name;
        const response = await fetch(`http://${IPAddress}:8080/api/sales/admin/order_list/picking`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ historyId, userId, 'verifyToken': currUser.verifyToken })
        });
        const { state, message } = await response.json();

        if (state) {    // 成功紀錄
            showPickerSpan.text('撿貨人: ' + userName);

            // 找到父層的order-item-detail
            const parent = pickUpBtn.parents('.order-item-detail');
            // parent 加上 'item-picked' class
            parent.addClass('item-picked');

            // 將自己改成checkBox
            pickUpBtn.replaceWith('<input type="checkbox" class="fade-transition hidden form-check-input">');
            showPickerSpan.next().addClass('visible');


        } else {
            pickUpBtn.removeClass('fade-transition hidden');
            Swal.fire({
                title: "發生錯誤",
                html: message,
                icon: "error",
                position: "top"
            });
        }
    });

    // 按下"完成撿貨"按鈕
    $('#pushToWaitingBtn').on('click', async function (event) {
        const id = $(this).attr('data-id');

        const result = await Swal.fire({
            title: "確認以進入[待出貨]",
            icon: "warning",
            position: "top",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "確認",
            cancelButtonText: "等一下",
        });

        if (result.isConfirmed) {
            // 發API到後台確認撿貨完成
            const response = await fetch(`http://${IPAddress}:8080/api/sales/admin/order_list/picking`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 'userId': currUser.id, 'recordId': id, 'verifyToken': currUser.verifyToken })
            });
            const { state, message } = await response.json();

            if (state) {
                Swal.fire({
                    title: "撿貨完成",
                    icon: "success",
                    position: "top",
                    showConfirmButton: false,
                    timer: 1000
                });
                const recordData = $('#orderListTable tbody tr [data-id="' + id + '"]')[0];
                // console.log(recordData);
                // 移除該行資料
                table.row($(recordData).closest('tr')).remove().draw();
                $('#orderPickingModal').modal('hide');
            } else {
                Swal.fire({
                    title: "發生錯誤",
                    text: message,
                    icon: "error",
                    position: "top",
                    showConfirmButton: true,
                });
            }
        }

    });

    // ----------------------------- 待出貨 waiting -----------------------------
    // 載入"待確認"訂單資料
    const loadWaitingTable = async () => {
        cleanTable();

        // 發 API 到後台拉"待確認"訂單資料 
        const response = await fetch(`http://${IPAddress}:8080/api/sales/admin/order_list/waiting`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'userId': currUser.id, 'verifyToken': currUser.verifyToken })
        })
        data = (await response.json()).data;

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
                    data: 'code', title: "編號", responsivePriority: 4,
                    className: "min-tablet-l text-start text-md-center fs-5"
                },
                {
                    data: 'demander.dept', title: "處室", responsivePriority: 2,
                    className: "text-center fs-5"
                },
                {
                    data: 'demander.title', title: "職稱", responsivePriority: 6,
                    className: "min-tablet-l text-start text-md-center fs-5"
                },
                {
                    data: 'demander.name', title: "申請人", responsivePriority: 5,
                    className: "min-tablet-p text-start text-sm-center fs-5"
                },
                {
                    data: 'id', title: "明細", responsivePriority: 3,
                    render: function (data, type, row) {
                        return `<button class="btn btn-outline-secondary fs-5 btn-order-detail" data-id="${data}" 
                            data-record-id="${row.code}" data-status="待出貨" data-apply-dept="${row.demander.dept}"
                            data-apply-user-name="${row.demander.name}"
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
                        data-id="${data}" data-record-id="${row.code}" data-apply-dept="${row.demander.dept}"
                        data-apply-user-name="${row.demander.name}"
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

        // 發API到後台確認配送訂單
        const response = await fetch(`http://${IPAddress}:8080/api/sales/admin/order_list/waiting`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'userId': currUser.id,
                'recordId': waitingId,
                transporterId,
                'verifyToken': currUser.verifyToken
            })
        });

        const { state, message } = await response.json();
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


    // ----------------------- 運送中 transporting --------------------------------
    // 載入運送中Table資料
    const loadOrderTransportingTable = async () => {
        cleanTable();
        // TODO: 發 API 到後台拉"運送中"訂單資料(感覺這一個 Table 需要定期自動刷新？)
        const response = await fetch(`http://${IPAddress}:8080/api/sales/admin/order_list/transporting`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'userId': currUser.id, 'verifyToken': currUser.verifyToken })
        })
        data = (await response.json()).data;

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
                    data: 'code', title: "編號", responsivePriority: 7,
                    className: "min-desktop fs-5 text-start text-md-center"
                },
                {
                    data: 'demander.dept', title: "處室", responsivePriority: 2,
                    className: "text-center fs-5"
                },
                {
                    data: 'demander.title', title: "職稱", responsivePriority: 6,
                    className: "min-tablet-l fs-5 text-md-center"
                },
                {
                    data: 'demander.name', title: "申請人", responsivePriority: 5,
                    className: "min-tablet-l fs-5 text-start text-md-center"

                },
                {
                    data: 'transporterName', title: "配送人", responsivePriority: 3,
                    className: "text-center fs-5"
                },
                {
                    data: 'id', title: "明細", responsivePriority: 4,
                    render: function (data, type, row) {
                        return `<button class="btn btn-outline-secondary fs-5 btn-order-detail" data-id="${data}" 
                            data-record-id="${row.code}" data-status="運送中" data-apply-dept="${row.demander.dept}"
                            data-apply-user-name="${row.demander.name}"
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
                        <p class="fs-6 mb-1">${data.split(' ')[0]}</p>
                        <p class="fs-6 mb-1">${data.split(' ')[1]}</p>
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

    const loadOrderFinishTable = async () => {
        cleanTable();
        // TODO: 發 API 到後台拉"已完成"訂單資料(感覺這一個 Table 需要定期自動刷新？)
        const response = await fetch(`http://${IPAddress}:8080/api/sales/admin/order_list/finish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'userId': currUser.id, 'verifyToken': currUser.verifyToken })
        })
        data = (await response.json()).data;
        table = $('#orderListTable').DataTable({
            language: {
                url: "../js/zh-Hant.json"  // 引用自定義漢化方式
            },
            paging: true,
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
            lengthMenu: [[10, 20, 50, -1], [10, 20, 50, "All"]],
            columns: [ // responsivePriority
                {
                    data: 'code', title: "編號", responsivePriority: 1,
                    className: "text-center fs-5"
                },
                {
                    data: 'demander.dept', title: "處室", responsivePriority: 2,
                    className: "min-tablet-p fs-5 text-sm-center text-start"
                },
                {
                    data: 'demander.title', title: "職稱", responsivePriority: 5,
                    className: "min-tablet-l fs-5 text-md-center"
                },
                {
                    data: 'demander.name', title: "申請人", responsivePriority: 4,
                    className: "min-tablet-l fs-5 text-start text-md-center"

                },
                {
                    data: 'transporterName', title: "配送人", responsivePriority: 6,
                    className: 'min-tablet-l fs-5 text-start text-md-center'
                },
                {
                    data: 'id', title: "明細", responsivePriority: 7,
                    className: "min-desktop fs-5 text-start text-md-center",
                    render: function (data, type, row) {
                        return `<button class="btn btn-outline-secondary fs-5 btn-order-finish" data-id="${data}" 
                            data-record-id="${row.code}" data-apply-dept="${row.demander.dept}"
                            data-apply-user-name="${row.demander.name}" data-transporter="${row.transporterName}"
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
        const response = await fetch(`http://${IPAddress}:8080/api/sales/admin/order_list/detail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'userId': currUser.id, 'recordId': id, 'verifyToken': currUser.verifyToken })
        })
        const detailLists = (await response.json()).data;;

        // 顯示資料
        $('#finishListArea').html(detailLists.map(renderFinishListArea).join(''));

    });

    // ----------------------- 取消 rejected (canceled) --------------------------------
    // 載入取消訂單Table資料
    const loadOrderCanceledTable = async () => {
        cleanTable();

        // 發 API 到後台拉"取消"訂單資料
        const response = await fetch(`http://${IPAddress}:8080/api/sales/admin/order_list/rejected`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'userId': currUser.id, 'verifyToken': currUser.verifyToken })
        })
        data = (await response.json()).data;

        table = $('#orderListTable').DataTable({
            language: {
                url: "../js/zh-Hant.json"  // 引用自定義漢化方式
            },
            paging: true,
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
            lengthMenu: [[10, 20, 50, -1], [10, 20, 50, "All"]],
            columns: [ // responsivePriority
                {
                    data: 'code', title: "編號", responsivePriority: 4,
                    className: "min-tablet-p text-start text-md-center fs-5"
                },
                {
                    data: 'demander.dept', title: "處室", responsivePriority: 2,
                    className: "text-center fs-5"
                },
                {
                    data: 'demander.title', title: "職稱", responsivePriority: 6,
                    className: "min-tablet-l text-start text-md-center fs-5"
                },
                {
                    data: 'demander.name', title: "申請人", responsivePriority: 5,
                    className: "min-tablet-l text-start text-md-center fs-5"
                },
                {
                    data: 'id', title: "明細", responsivePriority: 3,
                    render: function (data, type, row) {
                        return `<button class="btn btn-outline-secondary fs-5 btn-order-detail" data-id="${data}" 
                            data-record-id="${row.code}" data-status="取消" data-apply-dept="${row.demander.dept}"
                            data-apply-user-name="${row.demander.name}"
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

    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);

    async function drawChart () {
        let scoreRes = await fetch(`http://${IPAddress}:8080/api/analyze/laborScore`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'userId': currUser.id, 'verifyToken': currUser.verifyToken })
        })
        let scoreData = (await scoreRes.json()).data;
        let sortableArray = Object.entries(scoreData);

        // 按照值进行排序
        sortableArray.sort((a, b) => b[1] - a[1]);
        // 往前面塞資料
        sortableArray.unshift(['人員', '分數']);


        let data = google.visualization.arrayToDataTable(sortableArray);

        let options = {
            backgroundColor: 'transparent',
            legend: { position: 'bottom' },
            pieHole: 0.4
        };

        let chart = new google.visualization.PieChart(document.getElementById('piechart'));

        chart.draw(data, options);
    }

});