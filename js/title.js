$(document).ready(function () {
	// 設定標題
	$('.hospital-title').text('榮心醫院');
	$('.medical-product').text('榮心衛材');
	$('.platform-backend').text('榮心衛材後台系統')

	// 設定User
	let currUser = JSON.parse(localStorage.getItem('currUser'));
	$('.user-name').text(currUser.name);
	$('.user-dept').text(currUser.dept);

	// 設定購物車內容量
	// TODO: LocalStorage內的資料
	$('#cartCount').text('1');
});