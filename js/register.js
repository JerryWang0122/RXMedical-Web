$(document).ready(async function () {

	const tokenRes = await fetch('http://localhost:8080/api/users/user/CSRFToken', {
		method: 'POST'
	});
	const tokenJson = await tokenRes.json();
	if (tokenJson.state) {
		$('#jToken').val(tokenJson.data);
	} else {
		Swal.fire({
			position: "top",
			icon: "error",
			title: "伺服器發生錯誤",
			showConfirmButton: true
		})
		return;
	}
	// ------------------------ 註冊前檢查 --------------------------
	// 閱讀注意事項 -> 啟動註冊按鈕 -----------------------------------
	const noticeCheckBox = $('#noticeCheckBox');
	
	// 先確認注意事項是否勾選
	// 若已勾選則啟用註冊按鈕
	noticeCheckBox.on('change', () => {
		$('#registerSubmit').prop('disabled', !noticeCheckBox.prop('checked'))
	})

	// 密碼設定--------------------------------------------------------
	const jPassword = $('#jPassword');
	const jPasswordConfirm = $('#jPasswordConfirm');

	// 检查密码格式
	function checkPasswordFormat() {
		if (jPassword.val().length < 6) {
			jPassword.addClass('invalid');
			$('#warningMessagePassword').removeClass('d-none');
		} else {
			jPassword.removeClass('invalid');
			$('#warningMessagePassword').addClass('d-none');
		}
	}

	// 检查密码和确认密码是否匹配
	function checkPasswordMatch() {
		if (jPassword.val() !== jPasswordConfirm.val()) {
			jPasswordConfirm.addClass('invalid');
			$('#warningMessageConfirmPassword').removeClass('d-none');
		} else {
			jPasswordConfirm.removeClass('invalid');
			$('#warningMessageConfirmPassword').addClass('d-none');
		}
	}

	// 密码输入框事件处理
	jPassword.on('keyup', () => {
		checkPasswordFormat();
		if (jPasswordConfirm.val().length !== 0) {
			checkPasswordMatch();
		}
	});

	// 确认密码输入框事件处理
	jPasswordConfirm.on('keyup', () => {
		checkPasswordMatch();
	});

	// ---------------------------- 表單送出 ---------------------------------
	// 表單送出時，檢查員工編號格式、密碼格式、確認密碼是否一致
	// 否則返回並顯示提示視窗
	$('#registerForm').on('submit',  async (event) => {
		event.preventDefault();
		let correctData = true;
		let feedbackMessage = '';

		// 檢查員工編號
		if ($('#jEmpId').val().length !== 5) {
			correctData = false;
			feedbackMessage = '員工編號格式錯誤\n';
		}

		// 檢查密碼
		if (jPassword.val().length < 6) {
			correctData = false;
			feedbackMessage += '密碼格式錯誤\n';
		} else if (jPassword.val() !== jPasswordConfirm.val()) {
			correctData = false;
			feedbackMessage += '密碼驗證不一致\n';
		}

		// 顯示提示視窗
		if (!correctData) {  // 使用者資料有誤
			Swal.fire({
				position: "top",
				icon: "error",
				title: feedbackMessage,
				showConfirmButton: true
			})
		} else {
			// get user register info
			const formData = {
				empCode: $('#jEmpId').val(),
				name: $('#jName').val(),
				dept: $('#jDept').val(),
				title: $('#jTitle').val(),
				email: $('#jEmail').val(),
				password: jPassword.val(),
				token: $('#jToken').val()
			};

			const response = await fetch('http://localhost:8080/api/users/user/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData)  // 資料轉 json 字串
			});
			const { state, message, data } = await response.json();
			if (state) {	// 註冊成功
				Swal.fire({
					position: "top",
					icon: "success",
					title: message,
					showConfirmButton: false,
					timer: 1000
				});
				setTimeout(() => {
					location.href = './index.html';
				}, 1000);
			} else {
				Swal.fire({
					position: "top",
					icon: "error",
					title: "註冊失敗",
					// TODO:註冊時，回饋的訊息
					text: message,	
					showConfirmButton: true
				})
			}
		}
	})

});  
