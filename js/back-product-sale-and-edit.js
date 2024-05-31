$(document).ready(async function() {

    // 當沒有使用者資料時，強行導入回登入頁
    if (!localStorage.getItem('currUser')) {
        location.href = './index.html';
        return;
    }
    const currUser = JSON.parse(localStorage.getItem('currUser'));

    // 相片是否符合規格
    let picValid = false;
    const imgPrevArea = $('#imgPrevArea');

    // ---------------- 使用者上傳相片時 ------------------------
    $('#aProductUpdateImage').on('change', function(event){
        // Reset
        picValid = false;
        imgPrevArea.html('');

        let filePic = event.target.files[0];

        if (filePic.size > 500 * 1024) {
            Swal.fire({
                title: "檔案過大，請重新上傳",
                position: "top",
                icon: "warning"
            })
            $(this).val('');
            return;
        }

        let fileReader = new FileReader();
        fileReader.onload = function (e) {
            let data = e.target.result;
            

            let imgReader = new Image();
            imgReader.onload = function () {
                let upfileWidth = imgReader.width;
                if (upfileWidth > 1000) {
                    picValid = false;
                    Swal.fire({
                        title: "照片寬度過大，請重新上傳",
                        position: "top",
                        icon: "warning"
                    })
                    $(this).val('');
                    return;
                } else {
                    picValid = true;
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "照片有效",
                        showConfirmButton: false,
                        timer: 1000
                    });
                    imgPrevArea.append('<img src="' + data + '" width="150">');
                }
            }
            imgReader.src = data;
        }
        fileReader.readAsDataURL(filePic);
    });

    // -------------- 使用者確定更新產品資料 ---------------
    $('#updateMaterialInfoBtn').on('click', async(event) => {
        event.preventDefault();
        const materialId = $('#updateMaterialInfoBtn').data('id');
        const updatePic = $('#aProductUpdateImage')[0].files[0];
        // 檢查圖片
        // 如果有上傳圖片但picValid為false，則拒絕提交
        if (updatePic && !picValid) {
            Swal.fire({
                position: "top",
                icon: "warning",
                title: "照片無效，請重新上傳",
                showConfirmButton: false,
                timer: 1000
            });
            return;
        }

        // 取得資料
        const name = $('#aProductName').val();
        const category = $('#aProductCategory').val();
        const storage = $('#aProductStorage').val();
        const description = $('#aProductDescription').val();

        // 資料不可為空
        if (!name || !category || !storage || !description) {
            Swal.fire({
                position: "top",
                icon: "warning",
                title: "所有欄位皆為必填",
                showConfirmButton: true,
            });
            return;
        }

        const formData = new FormData();

        formData.append('userId', currUser.id);
        formData.append('productId', materialId)
        formData.append('name', name);
        formData.append('category', category);
        formData.append('storage', storage);
        formData.append('description', description);
        formData.append('picture', updatePic || null);

        // 發API到後台更新商品資料
        const response = await fetch('http://localhost:8080/api/products/admin/material/edit', {
            method: 'PUT',
            body: formData
        });

        const { state, message } = await response.json();

        if (state) {
            Swal.fire({
                position: "top",
                icon: "success",
                title: message,
                showConfirmButton: false,
                timer: 1000
            });
            if (updatePic) {
                $('#aProductImage').attr('src', `./img/products/${ updatePic.name }`);
            }
            imgPrevArea.html('');
            return;
        } else {
            Swal.fire({
                position: "top",
                icon: "error",
                title: message,
                showConfirmButton: true
            })
            return;
        }
    });

    // --------------- 進/銷表單狀態切換時 -------------------
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

    // ------------- 送出進銷表單 -------------------
    $('#addSalesRecordBtn').on('click', async function(event) {
        event.preventDefault();
        // 获取表单数据
        const jFlow = $('#jFlow').val();
        const jFlowAmount = $('#jFlowAmount').val();
        const jFlowCost = $('#jFlowCost').val();
        const materialId = $('#addSalesRecordBtn').data('id');

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

        const apiURL = jFlow === '進' ? "http://localhost:8080/api/sales/admin/call" : "http://localhost:8080/api/sales/admin/destroy";

        const saleRes = await fetch(apiURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "userId": currUser.id,
                materialId,
                "quantity": jFlowAmount,
                "price": jFlowCost
            })
        })
        const saleJson = await saleRes.json();
        if (saleJson.state) {
            Swal.fire({
                position: "top",
                icon: "success",
                title: saleJson.message + ' ' + saleJson.data,
                showConfirmButton: false,
                timer: 1000
            });
            $('#jFlowAmount').val('');
            $('#jFlowCost').val('');

            return;
        }

    })

    
})