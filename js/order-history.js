

$(document).ready(function () {
	// 設定User
	$('.user-name').text('王俊傑');
	$('.user-dept').text('秘書室');

	// 渲染 #orderDetailsArea 的資料顯示
	const renderOrderDetailsArea = (orderDetail, index) => {
		return `<tr>
				<td>${index + 1}</td>
				<td>${orderDetail.productName}</td>
				<td>${orderDetail.qty}</td>
			</tr>`;
	}

	// TODO: 發 API 到後台拉歷史紀錄
	let data = [
		{ "id": 1, "recordId": "20240519001", "orderQty": 1, "status": "待確認" },
		{ "id": 2, "recordId": "20240519002", "orderQty": 2, "status": "待撿貨" },
		{ "id": 3, "recordId": "20240519003", "orderQty": 3, "status": "待出貨" },
		{ "id": 4, "recordId": "20240519004", "orderQty": 4, "status": "運送中" },
		{ "id": 5, "recordId": "20240519005", "orderQty": 5, "status": "已完成" },
		{ "id": 6, "recordId": "20240519006", "orderQty": 6, "status": "待確認" },
		{ "id": 7, "recordId": "20240519007", "orderQty": 7, "status": "待撿貨" },
		{ "id": 8, "recordId": "20240519008", "orderQty": 8, "status": "待出貨" },
		{ "id": 9, "recordId": "20240519009", "orderQty": 9, "status": "運送中" },
		{ "id": 10, "recordId": "20240519010", "orderQty": 10, "status": "已完成" },
		{ "id": 11, "recordId": "20240519011", "orderQty": 11, "status": "待確認" },
		{ "id": 12, "recordId": "20240519012", "orderQty": 12, "status": "待撿貨" },
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
	let table = $('#orderHistoryTable').DataTable({
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
		columns: [ //列的標題一般是從DOM中讀取（也可以使用這個屬性為表格創建列標題)
			{ data: 'recordId', title: "編號", responsivePriority: 1 },
			{
				data: 'id', title: "明細", responsivePriority: 2,
				render: function (data, type, row) {
					return `<button class="btn btn-outline-info fs-5 btn-order-detail" data-id="${data}" 
                    		data-bs-toggle="modal" data-bs-target="#orderListModal"> 
                    			<i class="bi bi-journal-text"></i>
                  			</button>`;
				}
			},
			{
				data: 'orderQty', title: "品項數量", responsivePriority: 5,
				className: "min-tablet-l text-start text-md-center fs-5"
			},
			{ 
				data: 'status', title: "訂單狀態", responsivePriority: 4,
				className: "min-tablet-p text-start text-md-center align-middle fs-5"
			},
			{
				data: 'status', title: "動作", responsivePriority: 3,
				className: "min-tablet-l text-start text-md-center fs-5",
				render: function (data, type, row) {
					if (data !== "運送中") {
						return "無";
					}
					return `<button class="btn-finish-order btn btn-success fs-5" data-id="${row.id}" > 
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

	// 顯示訂單詳細內容
	$('#orderHistoryTable tbody').on('click', '.btn-order-detail', async function () {

		const id = $(this).data('id');
		// 取得該row的recordId和status
		const tr = table.row($(this).closest('tr'));
		const recordId = tr.data().recordId;
		const status = tr.data().status;


		// 更新 modal title 顯示資料
		$('#recordId').text(recordId);
		$('#orderStatus').text(status);

		// 先清空 orderDetailsArea
		$('#orderDetailsArea').empty();

		// TODO: 用id到後台拿資料
		const orderDetails = [
			{ "productName": "石膏鞋", "qty": 5 },
			{ "productName": "石膏鞋", "qty": 10 },
			{ "productName": "石膏鞋", "qty": 15 },
			{ "productName": "石膏鞋石膏鞋石膏鞋", "qty": 20 },
			{ "productName": "石膏鞋石膏鞋", "qty": 25 },
			{ "productName": "石膏鞋", "qty": 30 },
			{ "productName": "石膏鞋石膏鞋石膏鞋", "qty": 35 },
			{ "productName": "石膏鞋", "qty": 40 },
			{ "productName": "石膏鞋", "qty": 45 },
			{ "productName": "石膏鞋石膏鞋", "qty": 50 },
			{ "productName": "石膏鞋", "qty": 55 },
			{ "productName": "石膏鞋石膏鞋石膏鞋", "qty": 60 },
		];

		// 顯示資料
		$('#orderDetailsArea').html(orderDetails.map(renderOrderDetailsArea).join(''));

	});

	// 按下完成訂單按鈕
	$('#orderHistoryTable tbody').on('click', '.btn-finish-order', async function () {
		const response = await Swal.fire({
			title: "是否完成訂單？",
			text: "訂單完成後，品項恕不補發",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "確認完成",
			cancelButtonText: "取消"
		});

		if (response.isConfirmed) {

			const id = $(this).data('id');
			// TODO: 發api到後台完成訂單，感覺這邊應該非同步就行？
			// fetch('http://localhost:8080/user/purchase/finish', {
			// 	method: 'POST',
			// 	headers: {  // 一定要加
			// 		'Content-Type': 'application/json'
			// 	},
			// 	body: JSON.stringify({ id })  // 資料轉 json 字串
			// });

			// 取得按鈕欄位並將按鈕改成無
			const td = $(this).closest('td');
			td.text('無');

			Swal.fire({
				position: "top",
				icon: "success",
				title: "訂單完成！",
				showConfirmButton: false,
				timer: 1500
			})
		};
		
	});

});