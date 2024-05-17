const BASE_URL = '';

const loadHTML = async(url, target) => {
  const fullURL = BASE_URL + url;

  try {
    const response = await fetch(fullURL);
    const data = await response.text();
    $('#contentArea').html(data);
  } catch (err) {
    console.error(err);
  }

}

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

// 待 DOM 加載完成之後再執行
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
});