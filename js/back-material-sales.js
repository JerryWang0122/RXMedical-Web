$(document).ready(async function () {

    // 當沒有使用者資料時，強行導入回登入頁
    if (!localStorage.getItem('currUser')) {
        location.href = './index.html';
        return;
    }
    const currUser = JSON.parse(localStorage.getItem('currUser'));

    // 發API 到後台拉產品資料
    const matRes = await fetch(`http://${IPAddress}:8080/api/products/admin/material`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "userId": currUser.id, "verifyToken": currUser.verifyToken })
    });
    const matJson = await matRes.json();


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
    let table = $('#productInfoTable').DataTable({
        language: {
            url: "../js/zh-Hant.json"  // 引用自定義漢化方式
        },
        lengthMenu: [[10, 20, 50, -1], [10, 20, 50, "All"]], //顯示筆數設定
        data: matJson.state ? matJson.data : [],
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
                data: 'code', title: "編號", className: "min-desktop text-start text-lg-center fs-5"
            },
            {
                data: 'name', title: "名稱", responsivePriority: 4,
                className: " fs-5 text-center"
            },
            {
                data: 'stock', title: "庫存量", responsivePriority: 5,
                className: "min-tablet-p fs-5 text-start text-sm-center"
            },
            {
                data: 'storage', title: "儲存位置",
                className: "min-tablet-l fs-5 text-start text-md-center"
            },
            {
                data: 'category', title: "種類", responsivePriority: 6,
                className: "min-tablet-l fs-5 text-start text-md-center"
            },
            {
                data: 'id', title: "編輯/進銷", responsivePriority: 3,
                render: function (data, type, row) {

                    return `
                    
                    <button class="btn fs-5 text-primary btn-edit-material" 
                    data-material-id="${row.id}">
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

    // ------------- 新增商品按鍵被按下時 -------------
    $('#addProductBtn').on('click', async function () {
        await loadHTML('./b-add_product.html', '#contentArea');
    });

    // ------------- 編輯/進銷按鈕被按下時 ---------------
    $('#productInfoTable').on('click', '.btn-edit-material', async function () {

        const id = $(this).data('material-id');

        const infoRes = await fetch(`http://${IPAddress}:8080/api/products/admin/material/edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "userId": currUser.id, "materialId": id, 'verifyToken': currUser.verifyToken })
        })

        const infoJson = await infoRes.json();
        if (infoJson.state) {
            await loadHTML('./b-product_sale_and_edit.html', '#contentArea');
            $('#aProductID').val(infoJson.data.code);
            $('#aProductName').val(infoJson.data.name);
            $('#aProductCategory').val(infoJson.data.category);
            $('#aProductStorage').val(infoJson.data.storage);
            $('#aProductDescription').val(infoJson.data.description);
            $('#aProductImage').attr('src', infoJson.data.picture);
            $('#addSalesRecordBtn').attr('data-id', id);
            $('#updateMaterialInfoBtn').attr('data-id', id)
        } else {
            Swal.fire({
                position: "top",
                icon: "error",
                title: infoJson.message,
                showConfirmButton: true
            });
        }

    });
})