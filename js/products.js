$(document).ready(async function () {

	// 每頁顯示商品數量
	const productPerPage = 12;
	// 符合搜尋條件的商品, 最大頁數
	let matchProducts, maxPage;

	// ----------------------------------------------------
	// 當沒有使用者資料時，強行導入回登入頁
	if (!localStorage.getItem('currUser') || !localStorage.getItem('jwt')) {
		location.href = './index.html';
		return;
	}
	const currUser = JSON.parse(localStorage.getItem('currUser'));
	const jwt = localStorage.getItem('jwt');

	//------------------------------ 功能方法 ------------------------------
	// 渲染商品種類區域的方法
	const renderCategoriesArea = (category, index) => {
		return `
		<label class="cate-item">
			<input type="checkbox" id="cate-${index + 1}" class="form-check-input me-2" name="cate-${index + 1}" 
			value="${category}">${category}
		</label>
		`
	};
	// 渲染商品的方式
	const renderProduct = (product) => {
		return `
		<div class="col-6 col-md-4 col-lg-3 mb-3">
			<div class="card text-center product-item px-4" data-product-id="${product.id}">
				<a href="javascript:;">
					<div class="product-img position-relative">
						<img src="${product.picture}" class="card-img-top" alt="">
						<div class="product-quantity noto-sans">存貨量 ${product.stock}</div>
					</div>
					<div class="card-body px-0">
						<h5 class="card-text" style="white-space: nowrap">${product.name}</h5>
					</div>
				</a>
			</div>
		</div>
		`
	}

	// 在一開始初始化，或做了搜索動作時，初始化分頁器和商品區域
	const initPaginatorAndProductsArea = (matchedProduct) => {

		// 計算頁數
		maxPage = Math.ceil(matchedProduct.length / productPerPage);

		if (maxPage === 0) {
			$('#productArea').html('<div class="fs-4 text-center">沒有符合商品</div>');
		} else {
			// 初始化分頁器
			let paginatorHTML = `
			<li class="page-item disabled"><a class="page-link" data-page="prev" id="previousPagination" href="javascript:;" aria-label="Previous"><i class="bi bi-caret-left"></i></a></li>
			<li class="page-item active"><a class="page-link" data-page="1" href="javascript:;">1</a></li>
			`;

			for (let i = 1; i < maxPage; i++) {
				paginatorHTML += `<li class="page-item"><a class="page-link" data-page="${i + 1}" href="javascript:;">${i + 1}</a></li>`;
			}

			paginatorHTML += `
			<li class="page-item${maxPage === 1 ? ' disabled' : ''}"><a class="page-link" data-page="next" id="nextPagination" href="javascript:;" aria-label="Next"><i class="bi bi-caret-right"></i></a></li>
			`;
			$('#paginatorArea').html(paginatorHTML);

			// 填入商品，一頁最多productPerPage個
			$('#productArea').html(matchedProduct.slice(0, productPerPage).map(renderProduct).join(''));
		}
	};

	// 用傳入的頁碼決定如何渲染
	const renderProductsAreaByPage = (page) => {
		$('#productArea').html(matchProducts.slice((page - 1) * productPerPage, page * productPerPage).map(renderProduct).join(''));
	};

	// 點擊搜尋或種類時，產品結果調整
	const searchMatchProducts = () => {
		const keyword = $('#keyword').val().toLowerCase();
		let categories = [];
		// 取出所有已被勾選種類的名字
		$('.categories input[type="checkbox"]:checked').each(function () {
			categories.push($(this).val());
		});

		// 重設 matchProducts為符合條件的商品(先過種類再過關鍵字)
		// 如果種類為all，只需過關鍵字
		if (categories.includes('all')) {
			matchProducts = data.filter(p => p.name.toLowerCase().includes(keyword));
		} else {
			matchProducts = data.filter(p => categories.includes(p.category))
				.filter(p => p.name.toLowerCase().includes(keyword));
		}
		initPaginatorAndProductsArea(matchProducts);
	};


	// ------------------------------- 頁面初始化 ------------------------------
	// 發api到後台拿商品資料
	const response = await fetch(`http://${IPAddress}:8080/api/products/product`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${jwt}`
		}
	});
	const { state, message, data } = await response.json();
	if (!state) {	// 權限不足，不應該進來網頁
		location.href = './index.html';
		return;
	} else {

		// 渲染分類區域
		let categoriesHTML = `
		<label class="cate-item">
			<input type="checkbox" id="cate-all" class="form-check-input me-2" name="cate-all" value="all" checked>全部
		</label>
		` ;

		categoriesHTML += [... new Set(data.map(p => p.category))].map(renderCategoriesArea).join('')
		$('#categoriesArea').html(categoriesHTML)

		// 渲染商品區域
		matchProducts = data;

		// 初始化分頁器和商品區域
		initPaginatorAndProductsArea(matchProducts);
	};


	// ------------------------------- 事件監聽 -------------------------------
	// ----------- 分頁器點擊事件 --------------
	$('#paginatorArea').on('click', '.page-link', function () {
		const gotoPage = $(this).data('page');
		// 找到目前的page
		const currentPage = $('#paginatorArea .page-item.active a').data('page');
		// 依照目前的page來決定要做什麼事
		switch (gotoPage) {
			case 'prev':
				if (currentPage > 1) {
					// 讓"往下一頁"取消disabled class
					$('#nextPagination').parent().removeClass('disabled');
					// 讓當前頁面的active消失，讓前一頁的active出現
					$('#paginatorArea .page-item.active').removeClass('active').prev().addClass('active');
					// 如果已經第一頁了，讓"往前一頁"增加disabled class
					if (currentPage - 1 === 1) {
						$('#previousPagination').parent().addClass('disabled');
					}
					renderProductsAreaByPage(currentPage - 1);
				}
				break;
			case 'next':
				if (currentPage < maxPage) {
					// 讓"往前一頁"取消disabled class
					$('#previousPagination').parent().removeClass('disabled');
					// 讓當前頁面的active消失，讓後一頁的active出現
					$('#paginatorArea .page-item.active').removeClass('active').next().addClass('active');
					// 如果已經最後一頁了，讓"往下一頁"增加disabled class
					if (currentPage === maxPage - 1) {
						$('#nextPagination').parent().addClass('disabled');
					}
					renderProductsAreaByPage(currentPage + 1);
				}
				break;
			default:
				if (gotoPage === 1) {
					// 讓"往下一頁"取消disabled class
					$('#nextPagination').parent().removeClass('disabled');
					// 讓"往前一頁"增加disabled class
					$('#previousPagination').parent().addClass('disabled');
				} else if (gotoPage === maxPage) {
					// 讓"往前一頁"取消disabled class
					$('#previousPagination').parent().removeClass('disabled');
					// 讓"往下一頁"增加disabled class
					$('#nextPagination').parent().addClass('disabled');
				}
				// 讓其他頁的active消失，被按的打開
				$('#paginatorArea .page-item.active').removeClass('active');
				$(this).parent().addClass('active');
				// 重新渲染
				renderProductsAreaByPage(gotoPage);
				break;
		}
	});

	// ----------- 關鍵字搜索 --------------
	// #keyword 按下enter時執行
	$('#keyword').on('keyup', function (event) {
		event.preventDefault();
		if (event.keyCode === 13) {
			searchMatchProducts();
		}
	});
	// 按下搜尋按鈕
	$('#keywordSearchBtn').on('click', function (event) {
		event.preventDefault();
		searchMatchProducts();
	});

	// ------------ 進階篩選點擊 ----------------
	// 当用户点击除了“全部”之外的分类复选框时
	$('.categories input[type="checkbox"]').not('#cate-all').on('change', function () {
		// 如果点击的不是“全部”复选框
		if ($(this).attr('id') !== 'cate-all') {
			// 取消选中“全部”复选框
			$('#cate-all').prop('checked', false);
		}
		searchMatchProducts();
	});

	// 当用户点击“全部”复选框时
	$('#cate-all').on('change', function () {
		// 如果“全部”复选框被选中
		if ($(this).prop('checked')) {
			// 取消其他复选框的选中状态
			$('.categories input[type="checkbox"]').not(this).prop('checked', false);
		} else {
			// 将“全部”复选框重新选中
			$(this).prop('checked', true);
		}
		searchMatchProducts();
	});

	// 当任何分类复选框被点击时
	$('.categories input[type="checkbox"]').not('#cate-all').on('change', function () {
		// 如果所有的分类复选框都未被选中
		if ($('.categories input[type="checkbox"]:checked').length === 0) {
			// 将“全部”复选框选中
			$('#cate-all').prop('checked', true);
		}
		searchMatchProducts();
	});

	// 個別商品被按下時
	$('#productArea').on('click', '.product-item', async function () {
		const productId = $(this).data('product-id');

		const itemRes = await fetch(`http://${IPAddress}:8080/api/products/product/item`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${jwt}`
			},
			body: JSON.stringify({
				'userId': null, 'materialId': productId,
			}),
		});
		const itemJson = await itemRes.json();
		if (itemJson.state) {
			await loadHTML('f-product_detail.html', '#contentArea');
			$('#itemName').text(itemJson.data.name);
			$('#itemImg').attr('src', `${itemJson.data.picture}`);
			$('#itemCategory').text(itemJson.data.category);
			$('#itemDescription').text(itemJson.data.description);
			$('#itemStock').text(itemJson.data.stock);
			$('#jAddToCartBtn').attr('data-product-id', itemJson.data.id);
			$('#jAddToCartBtn').attr('data-product-name', itemJson.data.name);
		} else {
			Swal.fire({
				position: "top",
				icon: "error",
				title: itemJson.message,
				showConfirmButton: true
			})
		}
	});

});
