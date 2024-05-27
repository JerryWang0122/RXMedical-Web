$(document).ready(async function() {

    // TODO: 發API 到後台拉產品資料
    let data = await [
        { "id": 1, "code": "CS1234567890", "name": "石膏鞋", "stock": 123, "storage": "01-03-05", "category": "石膏"},
        { "id": 2, "code": "IP1763967890", "name": "環保清潔袋(超特大)", "stock": 40, "storage": "11-03-05", "category": "垃圾袋"},
        { "id": 3, "code": "PT8334567381", "name": "PVC無粉手套-XS", "stock": 123, "storage": "02-05-01", "category": "手套"}
    ]

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
                className: "min-tablet-l fs-5 text-start text-md-center" },
            {
                data: 'category', title: "種類", responsivePriority: 6,
                className: "min-tablet-l fs-5 text-start text-md-center"
            },
            {
                data: 'id', title: "編輯/進銷", responsivePriority: 3,
                render: function (data, type, row) {

                    return `
                    
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
})