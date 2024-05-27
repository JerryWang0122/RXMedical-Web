$(document).ready(async function() {


    $('#addSalesRecordBtn').on('click', async function(event) {
        event.preventDefault();
        // 获取表单数据
        const jFlow = $('#jFlow').val();
        const jFlowAmount = $('#jFlowAmount').val();
        const jFlowCost = $('#jFlowCost').val();

        // 表单验证
        if (!jFlow || !jFlowAmount || !jFlowCost) {
            Swal.fire({
                title: "錯誤",
                text: "所有字段都必須填寫",
                icon: "error",
                confirmButtonText: "確認"
            });
            return;
        }

        if (jFlowAmount <= 0 || jFlowCost <= 0) {
            Swal.fire({
                title: "錯誤",
                text: "數量和開銷必須為正數",
                icon: "error",
                confirmButtonText: "確認"
            });
            return;
        }
    })

    // --------------- 進/銷表單狀態切換時
    $('#jFlow').on('change', function () {
        const selectedValue = $(this).val();

        if (selectedValue === '銷') {
            $('label[for="jFlowAmount"]').text('銷毀數量');
            $('label[for="jFlowCost"]').text('報銷費用');
        } else {
            $('label[for="jFlowAmount"]').text('批貨數量');
            $('label[for="jFlowCost"]').text('進貨總價');
        }
    });
})