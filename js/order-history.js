$(document).ready(function () {
  // TODO: 發 API 到後台拉歷史紀錄
  let data = [
    {
      "id": "20240519001",
      "orderQty": 1,
      "status": "待確認"
    },
    {
      "id": "20240519002",
      "orderQty": 2,
      "status": "待撿貨"
    },
    {
      "id": "20240519003",
      "orderQty": 3,
      "status": "待出貨"
    },
    {
      "id": "20240519004",
      "orderQty": 4,
      "status": "運送中"
    },
    {
      "id": "20240519005",
      "orderQty": 5,
      "status": "已完成"
    },
    {
      "id": "20240519006",
      "orderQty": 6,
      "status": "待確認"
    },
    {
      "id": "20240519007",
      "orderQty": 7,
      "status": "待撿貨"
    },
    {
      "id": "20240519008",
      "orderQty": 8,
      "status": "待出貨"
    },
    {
      "id": "20240519009",
      "orderQty": 9,
      "status": "運送中"
    },
    {
      "id": "20240519010",
      "orderQty": 10,
      "status": "已完成"
    },
    {
      "id": "20240519011",
      "orderQty": 11,
      "status": "待確認"
    },
    {
      "id": "20240519012",
      "orderQty": 12,
      "status": "待撿貨"
    },

  ];

  // DataTables
  /**
   * Respozsive Details -> https://datatables.net/extensions/responsive/classes
   * ----------------------------
   * desktop: x > 1024
   * tablet-l: 768 < x <= 1024
   * tablet-p: 480 < x <= 768
   * mobile-l: 320 < x <= 768
   * mobile-p: x <= 320
   */
  let table = $('#orderHistoryTable').DataTable({
    language: {
      url: "../zh-Hant.json"  // 引用自定義漢化方式
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
    // dom: "<'row'<'col-sm-12'f>><'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-2'i><'col-sm-12 col-md-5'p>>",
    columns: [ //列的標題一般是從DOM中讀取（也可以使用這個屬性為表格創建列標題)
      { data: 'id', title: "編號", responsivePriority: 1 },
      {
        data: 'id', title: "明細", responsivePriority: 4,
        render: function (data, type, row) {
          return `<button class="btn btn-outline-info fs-5" data-id="${data}" 
                  data-bs-toggle="modal" data-bs-target="#orderListModal"> 
                    <i class="bi bi-journal-text"></i>
                  </button>`;
        }
      },
      { 
        data: 'orderQty', title: "品項數量", responsivePriority: 5, 
        className: "min-tablet-l text-start text-md-center fs-5" 
      },
      { data: 'status', title: "訂單狀態", responsivePriority: 2 },
      {
        data: 'status', title: "動作", responsivePriority: 3,
        className: "min-tablet-l text-start text-md-center fs-5",
        render: function (data, type, row) {
          if (data !== "運送中") {
            return "無";
          }
          return `<button class="btn-finish-order btn btn-success fs-5"> 
                    完成訂單
                  </button>`;
        },
        
      }
    ],
    columnDefs: [
      {
        targets: '_all',
        className: 'text-start text-md-center align-middle fs-5'
      }
    ]
  });

  $('#cartItemsTable tbody').on('click', '.delete-btn', async function () {


    const response = await Swal.fire({
      title: "是否將項目移除？",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "確認刪除",
      cancelButtonText: "取消"
    });

    if (response.isConfirmed) {

      const productId = $(this).data('product-id');
      let tr = table.row($(this).closest('tr'));
      // 从表格中删除该行
      table.row(tr).remove().draw();

      // 更新data数组
      data = data.filter(item => item.productId !== productId);

      Swal.fire({
        title: "刪除成功!",
        icon: "success"
      });
    }

  });

  

});