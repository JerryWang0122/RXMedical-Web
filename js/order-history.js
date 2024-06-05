$(document).ready(async function () {

	// 當沒有使用者資料時，強行導入回登入頁
	if (!localStorage.getItem('currUser')) {
		location.href = './index.html';
		return;
	}
	const currUser = JSON.parse(localStorage.getItem('currUser'));

	// 設定User
	$('.user-name').text(currUser.name);
	$('.user-dept').text(currUser.dept);

	// 渲染 #orderDetailsArea 的資料顯示
	const renderOrderDetailsArea = (orderDetail, index) => {
		return `<tr>
				<td>${index + 1}</td>
				<td>${orderDetail.productName}</td>
				<td>${orderDetail.quantity}</td>
			</tr>`;
	}

	// 發 API 到後台拉歷史紀錄
	const purchaseHistoryRes = await fetch('http://localhost:8080/api/users/user/purchase', {
		method: 'POST',
		headers: {  // 一定要加
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ 'userId': currUser.id, 'verifyToken': currUser.verifyToken })  // 資料轉 json 字串
	})
	let data = (await purchaseHistoryRes.json()).data;

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
			{ data: 'code', title: "編號", responsivePriority: 1 },
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
		const code = tr.data().code;
		const status = tr.data().status;


		// 更新 modal title 顯示資料
		$('#recordCode').text(code);
		$('#orderStatus').text(status);

		// 先清空 orderDetailsArea
		$('#orderDetailsArea').empty();

		// 用id到後台拿資料
		const response = await fetch('http://localhost:8080/api/users/user/purchase/detail', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ 'userId': currUser.id, 'recordId': id, 'verifyToken': currUser.verifyToken })
		})
		const orderDetails = (await response.json()).data;

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
			// 發api到後台完成訂單
			const finishRes = await fetch('http://localhost:8080/api/users/user/purchase/finish', {
				method: 'POST',
				headers: {  // 一定要加
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ 'userId': currUser.id, 'recordId': id, 'verifyToken': currUser.verifyToken })  // 資料轉 json 字串
			});
			const finishJson = await finishRes.json();

			if (finishJson.state) {
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
			} else {
				Swal.fire({
					title: "發生錯誤",
					text: finishJson.message,
					icon: "error",
					position: "top",
					showConfirmButton: true
				})
			}
		};
		
	});

});