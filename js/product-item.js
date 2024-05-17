$(document).ready(function () {

  // ---------------- 申請量增減按鈕互動 --------------------------
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
  const handleAddToCartBtnClick = (event) => {
    event.preventDefault();

    // TODO: 申請單項目資料
    const formData = {};

    // TODO: 檢查商品數量是否大於庫存量
    const hasProductInStock = true;

    if (hasProductInStock) {
      // TODO: 放到localStorage
      Swal.fire({
        position: "top",
        icon: "success",
        title: "已加入購物車",
        showConfirmButton: false,
        timer: 1500
      })
      
    } else {
      Swal.fire({
        title: "庫存不足，加入失敗",
        icon: "error"
      })
    }

  };

  // addToCartBtn.on('submit', handleAddToCartBtnClick);
  addToCartBtn.on('click', handleAddToCartBtnClick);

});
