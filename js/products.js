$(document).ready(function () {

  // 当用户点击除了“全部”之外的分类复选框时
  $('.categories input[type="checkbox"]').not('#cate-all').on('change', function () {
    // 如果点击的不是“全部”复选框
    if ($(this).attr('id') !== 'cate-all') {
      // 取消选中“全部”复选框
      $('#cate-all').prop('checked', false);
    }
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
  });
  
  // 当任何分类复选框被点击时
  $('.categories input[type="checkbox"]').not('#cate-all').on('change', function () {
    // 如果所有的分类复选框都未被选中
    if ($('.categories input[type="checkbox"]:checked').length === 0) {
      // 将“全部”复选框选中
      $('#cate-all').prop('checked', true);
    }
  });
  
  // TODO: 點擊搜尋或種類時，產品結果調整
  
});
