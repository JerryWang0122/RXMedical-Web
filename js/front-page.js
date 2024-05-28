
/* 頁面路由 (待 DOM 加載完成之後再執行)
 *
 *
*/
$(document).ready(async () => {

	// 當沒有使用者資料時，強行導入回登入頁
	if (!localStorage.getItem('currUser')) {
		location.href = './index.html';
		return;
	}

	await loadHTML('/f-products.html', '#contentArea');

	// 按下navbar的標題時，回到首頁
	$('#frontIndexBtn').on('click', () => location.reload());

	// -------------------- navbar 按鈕被按下時 -----------------
	$('#navbarMenu').on('click', async (event) => {
		await handleChangeNavBar(event, '#applyListBtn', '/f-order_history.html');
		await handleChangeNavBar(event, '#backManageBtn', '/back_page_frame.html');
	})

	$('#navbarMenu').on('click', '#myAccountBtn', async () => {
		await loadHTML('./f-user_info.html', '#contentArea');
	})

	// -------------------- 商品展覽區有商品被按下時 -----------------
	$('.product-area').on('click', '.product-item', async function() {
		// 取得商品ID
		console.log($(this).data('product-id'));
		await loadHTML('./f-product_detail.html', '#contentArea');
	});

	// -------------------- 購物車按鈕被按下時 -----------------
	$('#shopCartBtn').on('click', async (event) => {
		await loadHTML('./f-shop_cart.html', '#contentArea');
	})

	$('#logout').on('click', (event) => {
		event.preventDefault();

		// TODO: await .... 清除token
		localStorage.clear();
		
		location.href = '/index.html';
	})
});







const BASE_URL = '';

// 在target容器中載入特定HTML
const loadHTML = async (url, target) => {
	const fullURL = BASE_URL + url;

	try {
		const response = await fetch(fullURL);
		const data = await response.text();
		$('#contentArea').html(data);
	} catch (err) {
		console.error(err);
	}

};

// 處理navBar點擊，切換頁面效果
const handleChangeNavBar = async (event, idName, url) => {
	const eventId = '#' + event.target.id;
	// if eventId not equals to idName => return
	if (eventId !== idName) {
		return;
	}
	if (idName === '#backManageBtn') {
		location.href = url;
		return;
	}
	$('#navbarMenu .navbar-nav .nav-link').removeClass('active');
	// 将点击的按钮添加 'active' 类
	$(event.target).addClass('active');
	await loadHTML(url, '#contentArea');
};


