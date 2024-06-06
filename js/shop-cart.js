$(document).ready(async function () {

	// 當沒有使用者資料時，強行導入回登入頁
	if (!localStorage.getItem('currUser')) {
		location.href = './index.html';
		return;
	}
	const currUser = JSON.parse(localStorage.getItem('currUser'));
	let shopCartList = JSON.parse(localStorage.getItem('shopCartList')) || [];
	let data = await Promise.all(shopCartList.map(async item => {
		console.log(item);
		const res = await fetch('http://localhost:8080/api/products/product/item', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ "userId": currUser.id, "verifyToken": currUser.verifyToken, "materialId": item.productId })
		});
		const json = await res.json();
		console.log(json);
		item.productName = json.data.name;
		item.productImg = json.data.picture;
		return item;
	}));

	// DataTables
	let table = $('#cartItemsTable').DataTable({
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
			{
				data: 'productImg',
				title: "圖片",
				render: function (data, type, row) {
					return `<img src="${data}" class="cart-product-img m-auto" alt="">`;
				},
				className: "min-tablet-l text-center align-middle fs-5"
			},
			{ data: 'productName', title: "名稱" },
			{ data: 'applyQty', title: "申請量" },
			{
				data: 'productId',
				title: "動作",
				render: function (data, type, row) {
					return `<button type="button" class="delete-btn btn btn-danger" data-product-id="${data}">刪除</button>`
				},
				className: "text-center align-middle fs-5"
			},
		],
		columnDefs: [
			{
				targets: '_all',
				className: 'text-center align-middle fs-5'
			}
		]
	});

	// 當點擊刪除按鈕時
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
			// 从表格中删除该行
			let tr = table.row($(this).closest('tr'));
			table.row(tr).remove().draw();

			// 更新data数组
			data = data.filter(item => item.productId !== productId);

			// 更新localStorage
			localStorage.setItem('shopCartList', JSON.stringify(data));
			// 更新購物車顯示
			$('#cartCount').text(data.length);
			if (data.length === 0) {
				// 移除去申請按鈕
				$('#applyMaterialsBtn').remove();
			}

			Swal.fire({
				title: "刪除成功!",
				icon: "success"
			});
		}

	});

	// 跟DataTable一起完成，生成"去申請"按鈕
	if (data.length === 0) return;
	const applyBtn = document.createElement('button');
	applyBtn.id = 'applyMaterialsBtn';
	applyBtn.classList.add('btn', 'btn-success', 'w-100', 'fs-5', 'mt-3');
	applyBtn.innerText = '去申請';
	$('#cartItemsTable').after(applyBtn);

	$('#applyMaterialsBtn').on('click', async function () {
		const confirmSubmit = await Swal.fire({
			title: "確認申請？",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "確認",
			cancelButtonText: "取消"
		})
		if (!confirmSubmit.isConfirmed) return;

		let processedData = data.map(item => {
			return {
				productId: item.productId,
				applyQty: item.applyQty
			};
		});
		
		const formData = {
			'userId': currUser.id,
			'applyItems': processedData,
			'verifyToken': currUser.verifyToken
		};

		const checkRes = await fetch('http://localhost:8080/api/sales/order_generate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData)
		});

		const checkJson = await checkRes.json();

		if (checkJson.state) {
			data = [];
			// 清空購物車
			$('#cartCount').text(0);
			// 更新localStorage
			localStorage.setItem('shopCartList', JSON.stringify(data));
			// 清空dataTable
			table.clear().draw();
			// 拔掉按鈕
			$('#applyMaterialsBtn').remove();

			Swal.fire({
				title: "申請成功",
				icon: "success"
			});

		} else {

			Swal.fire({
				title: checkJson.message,
				html: checkJson.data,
				icon: "error",
				text: checkJson.message
			});
		}

		
	});

});