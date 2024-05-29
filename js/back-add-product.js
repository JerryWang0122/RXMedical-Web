$(document).ready(async function () {

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
    $('#jProductImage').on('change', (event) => {
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


    //-------------------- 確認新增商品 -------------------------- 
    $('#addNewProductForm').on('submit', async (event) => {
        event.preventDefault();

        // 確認照片
        if (!picValid) {
            Swal.fire({
                position: "top",
                icon: "warning",
                title: "照片無效，請重新上傳",
                showConfirmButton: false,
                timer: 1000
            });
            return
        }

        // 取得資料
        const code = $('#jProductID').val();
        const name = $('#jProductName').val();
        const category = $('#jProductCategory').val();
        const storage = $('#jProductStorage').val();
        const description = $('#jProductDescription').val();

        const quantity = $('#jFirstPurchaseQuantity').val();
        const price = $('#jFirstPurchaseCost').val();

        // 所有資料不可為空
        if (!code || !name || !category || !storage || !description || !quantity || !price) {
            Swal.fire({
                position: "top",
                icon: "error",
                title: "資料不可為空",
                showConfirmButton: true
            })
            return;
        }
        // quantity 和 price 需為數字，且為正數
        if (isNaN(quantity) || quantity < 0 || isNaN(price) || price < 0) {
            Swal.fire({
                position: "top",
                icon: "error",
                title: "無效進貨資料",
                showConfirmButton: true
            })
            return;
        }

        const formData = new FormData();

        formData.append('code', code);
        formData.append('name', name);
        formData.append('category', category);
        formData.append('storage', storage);
        formData.append('description', description);
        formData.append('quantity', quantity);
        formData.append('price', price);
        formData.append('userId', currUser.id);
        formData.append('picture', $('#jProductImage')[0].files[0]);
        
        // 發API到後台新增商品
        const response = await fetch('http://localhost:8080/api/products/admin/material/create', {
            method: 'POST',
            body: formData
        })
        
        console.log('nothing happen');
        // const { state, message } = await response.json();
        

        // if (state) {
        //     Swal.fire({
        //         position: "top",
        //         icon: "success",
        //         title: message,
        //         showConfirmButton: false,
        //         timer: 1000
        //     });
        //     setTimeout(async () => {
        //         await loadHTML('./b-material_sales.html', '#contentArea');
        //     }, 1000);
        //     console.log("test");
        //     return;
        // } else {
        //     Swal.fire({
        //         position: "top",
        //         icon: "error",
        //         title: message,
        //         showConfirmButton: true
        //     })
        //     return;
        // }
    });
});