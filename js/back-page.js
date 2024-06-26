
/* 頁面路由 (待 DOM 加載完成之後再執行)
 *
 *
*/
$(document).ready(async () => {

	// 當沒有使用者資料時，強行導入回登入頁
	if (!localStorage.getItem('currUser') || !localStorage.getItem('jwt')) {
		location.href = './index.html';
		return;
	}
	const currUser = JSON.parse(localStorage.getItem('currUser'));
	const jwt = localStorage.getItem('jwt');

	await loadHTML('/b-order_manage.html', '#contentArea');

	// 按下navbar的標題時，回到首頁
	$('#backIndexBtn').on('click', () => location.reload());

	// -------------------- navbar 按鈕被按下時 -----------------
	$('#navbarMenu').on('click', async (event) => {
		await handleChangeNavBar(event, '#orderListManageBtn', '/b-order_manage.html');
		await handleChangeNavBar(event, '#materialSalesBtn', '/b-material_sales.html');
		await handleChangeNavBar(event, '#memberAuthLevelBtn', '/b-member_auth.html');
	})

	$('#backToFrontPageBtn').on('click', () => {
		location.href = '/front_page_frame.html';
	});

	// ----------- 登出 ----------
	$('#logout').on('click', (event) => {
		event.preventDefault();

		// TODO: await .... 清除token
		localStorage.clear();

		location.href = '/index.html';
	});

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
	$('#navbarMenu .navbar-nav .nav-link').removeClass('active');
	// 将点击的按钮添加 'active' 类
	$(event.target).addClass('active');
	await loadHTML(url, '#contentArea');
};


