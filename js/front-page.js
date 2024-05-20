
/* 頁面路由 (待 DOM 加載完成之後再執行)
 *
 *   
*/
$(document).ready(async() => {
  await loadHTML('/f-products.html', '#contentArea');

  // 按下navbar的標題時，回到首頁
  $('#frontIndexBtn').on('click', () => location.reload());
  
  // -------------------- navbar 按鈕被按下時 -----------------
  $('#navbarMenu').on('click', async(event) => {
    await handleChangeNavBar(event, '#myAccountBtn', '/f-user_info.html');
    await handleChangeNavBar(event, '#applyListBtn', '/f-user_info.html');
    await handleChangeNavBar(event, '#backManageBtn', '/f-user_info.html');
  })

  // -------------------- 商品展覽區有商品被按下時 -----------------
  $('.product-area').on('click', async(event) => {
    await handleProductCardClick(event, 'product-item', handleShowProduct);
  })

  // -------------------- 購物車按鈕被按下時 -----------------
  $('#shopCartBtn').on('click', async(event) => {
    await loadHTML('./f-shop_cart.html', '#contentArea');
  })
});








const BASE_URL = '';

// 每一個 fun 都要寫註解
const loadHTML = async(url, target) => {
  const fullURL = BASE_URL + url;

  try {
    const response = await fetch(fullURL);
    const data = await response.text();
    $('#contentArea').html(data);
  } catch (err) {
    console.error(err);
  }

};

// 每一個 fun 都要寫註解
const handleProductCardClick = (event, className, callback) => {
  // 查找最近的包含指定类的祖先元素
  const targetElement = $(event.target).closest(`.${className}`);
  if (!targetElement.length) {
    return;
  }
  const productId = $(targetElement).attr('data-productId');
  callback(productId);
};

// 每一個 fun 都要寫註解
const handleShowProduct = async(productId) => {
  console.log(productId);
  await loadHTML('./f-prouct-item.html', '#contentArea');
}

// 每一個 fun 都要寫註解
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


