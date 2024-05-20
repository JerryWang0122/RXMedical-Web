$(document).ready(function () {

  // 從localStorage取得購物車內容
  // TODO: 1. 拉LocalStorage內的資料 2. 將商品代碼一致的合併

  // 設定DataTables顯示資料
  let data = [
    { "productId": 1, "productImg": "product-1.png", "productName": "石膏鞋", "applyQty": 25 },
    { "productId": 2, "productImg": "product-3.png", "productName": "垃圾袋特大", "applyQty": 10 },
    { "productId": 3, "productImg": "product-5.png", "productName": "垃圾袋特大", "applyQty": 10 },
    { "productId": 4, "productImg": "product-7.png", "productName": "垃圾袋特大", "applyQty": 10 },
    { "productId": 5, "productImg": "product-9.png", "productName": "垃圾袋特大", "applyQty": 10 },
    { "productId": 6, "productImg": "product-11.png", "productName": "垃圾袋特大", "applyQty": 10 },
    { "productId": 7, "productImg": "product-13.png", "productName": "垃圾袋特大", "applyQty": 10 },
    { "productId": 8, "productImg": "product-15.png", "productName": "垃圾袋特大", "applyQty": 10 },
  ]

  // DataTables
  let table = $('#cartItemsTable').DataTable({
    // responsive: {
    //   breakpoints: [
    //     { name: 'desktop', width: Infinity },
    //     { name: 'tablet-l', width: 1024 },//原本是768~1024不含768
    //     { name: 'tablet-p', width: 767 },//
    //     { name: 'mobile-l', width: 480 },
    //     { name: 'mobile-p', width: 320 }
    //   ]
    // },
    searching: false, // 預設為true 搜尋功能，若要開啟不用特別設定
    lengthMenu: [[5, 10, 15, -1], [5, 10, 15, "All"]], //顯示筆數設定
    data: data,
    autoWidth: false,
    responsive: true,
    layout: {
      topStart: 'info',
      topEnd: 'pageLength',
      bottom: 'paging',
      bottomStart: null,
      bottomEnd: null,
    },
    language: {
      url: "../js/zh-Hant.json"  // 引用自定義漢化方式
    },
    columns: [ //列的標題一般是從DOM中讀取（也可以使用這個屬性為表格創建列標題)
      { data: 'productImg',
        title: "圖片",
        render: function (data, type, row) {
          return `<img src="../img/products/${data}" class="cart-product-img m-auto" alt="">`;
        }, 
        className: "min-tablet-l text-center align-middle fs-5"
      },
      { data: 'productName', title: "名稱" },
      { data: 'applyQty', title: "申請量" },
      { data: 'productId', 
        title: "動作",
        render: function (data, type, row) {
          return `<button type="button" class="delete-btn btn btn-danger" data-product-id="${data}">刪除</button>`
        },
        className: "text-center align-middle fs-5"
      },
    ],
    columnDefs:[
      {
        targets: '_all',
        className: 'text-center align-middle fs-5'
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

  // 跟DataTable一起完成，生成"去申請"按鈕
  const applyBtn =document.createElement('button');
  applyBtn.id = 'applyMaterialsBtn';
  applyBtn.classList.add('btn', 'btn-success', 'w-100', 'fs-5', 'mt-3');
  applyBtn.innerText = '去申請';
  $('#cartItemsTable').after(applyBtn);

  $('#applyMaterialsBtn').on('click', function () {
    let processedData = data.map(item => {
      return {
        productId: item.productId,
        applyQty: item.applyQty
      };
    });
    console.log(processedData);
  });

});