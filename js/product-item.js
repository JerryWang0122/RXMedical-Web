$(document).ready(function () {

	// 當沒有使用者資料時，強行導入回登入頁
	if (!localStorage.getItem('currUser')) {
		location.href = './index.html';
		return;
	}
	const currUser = JSON.parse(localStorage.getItem('currUser'));

	// ---------------- 申請量增減按鈕互動 --------------------------
	const itemStock = $('#itemStock');
	const jAmountInput = $('#jAmount');
	const increaseBtn = $('#jAmountIncreaseBtn');
	const decreaseBtn = $('#jAmountDecreaseBtn');

	const addToCartBtn = $('#jAddToCartBtn');

	// jAmount 输入框的输入事件处理
	jAmountInput.on('input', function () {
		const value = $(this).val().replace(/\D/g, '');
		$(this).val(value);
	});

	// 增加按钮点击事件处理
	increaseBtn.on('click', function () {
		const currentValue = parseInt(jAmountInput.val()) || 0;
		jAmountInput.val(currentValue + 1);
	});

	// 减少按钮点击事件处理
	decreaseBtn.on('click', function () {
		const currentValue = parseInt(jAmountInput.val()) || 2;
		if (currentValue > 1) {
			jAmountInput.val(currentValue - 1);
		}
	});

	// ---------------- 按下放入購物車時的動作 ------------------------
	const handleAddToCartBtnClick = function(event) {
		event.preventDefault();

		// 檢查商品數量是否大於庫存量
		if (Number(itemStock.text()) < Number(jAmountInput.val())) {
			Swal.fire({
				title: "庫存不足，加入失敗",
				icon: "error"
			})
			return;
		}

		const itemData = {
			'productId': $(this).data('product-id'),
			'productName': $(this).data('product-name'),
			'productImg': $(this).data('product-img'),
			'applyQty': Number(jAmountInput.val())
		}

		// ------- 購物車資料，放到localStorage ----------
		let shopCartList = JSON.parse(localStorage.getItem('shopCartList')) || [];
		// 檢查是否已經存在相同 productId 的項目
		let existingItemIndex = shopCartList.findIndex(item => item.productId === itemData.productId);

		if (existingItemIndex !== -1) {
			const newQty = shopCartList[existingItemIndex].applyQty + itemData.applyQty;
			if (newQty > Number(itemStock.text())) {
				Swal.fire({
					title: "購物車累積超過庫存，加入失敗",
					icon: "error"
				})
				return;
			}
			// 已經存在，更新 applyQty
			shopCartList[existingItemIndex].applyQty = newQty;
		} else {
			// 不存在，新增一個新項目
			shopCartList.push(itemData);
			// 更新購物車數字
			$('#cartCount').text(Number($('#cartCount').text()) + 1);
		}

		// 將更新後的購物車資料保存到 localStorage
		localStorage.setItem('shopCartList', JSON.stringify(shopCartList));

		Swal.fire({
			position: "top",
			icon: "success",
			title: "已加入購物車",
			showConfirmButton: false,
			timer: 1500
		})

	};

	addToCartBtn.on('click', handleAddToCartBtnClick);

});
