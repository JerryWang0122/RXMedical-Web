$(document).ready(async function () {

    // 進入時，當沒有使用者資料時，強行導入回登入頁
    // 當沒有使用者資料時，強行導入回登入頁
    if (!localStorage.getItem('currUser') || !localStorage.getItem('jwt')) {
        location.href = './index.html';
        return;
    }
    const currUser = JSON.parse(localStorage.getItem('currUser'));
    const jwt = localStorage.getItem('jwt');

    // 發API 到後台拉資料
    const [matRes, safetyRes] = await Promise.all([
        fetch(`http://${IPAddress}:8080/api/products/admin/material`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            }
        }),
        fetch(`http://${IPAddress}:8080/api/analyze/materialSafetyRatio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            }
        })
    ]);

    const [matJson, safetyRatioData] = await Promise.all([
        matRes.json(),
        safetyRes.json().then(data => data.data)
    ]);


    // ----------------- 畫arc between------------------------------
    // 选择包含SVG的容器
    const container = d3.select("#arc-container");

    // 设置SVG画布的尺寸
    const width = 230;
    const height = 230;
    const radius = Math.min(width, height) / 2 - 10;

    // 定义弧生成器
    const arcBackground = d3.arc()
        .innerRadius(radius - 20)
        .outerRadius(radius)
        .startAngle(0)
        .endAngle(2 * Math.PI); // Full circle for background

    const arcForeground = d3.arc()
        .innerRadius(radius - 20)
        .outerRadius(radius)
        .startAngle(0); // End angle will be set based on ratio

    // 创建SVG元素并为每个产品绘制一个弧
    safetyRatioData.forEach((d, i) => {
        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        // 添加背景弧形路径（100%）
        svg.append("path")
            .attr("d", arcBackground)
            .attr("fill", "#e6e6e6"); // Light grey background

        // 添加前景弧形路径（实际库存比例），并添加转场效果
        svg.append("path")
            .datum({ endAngle: 0 }) // Start the transition from 0 angle
            .attr("d", arcForeground)
            .attr("fill", d3.schemeCategory10[i])
            .transition() // Apply transition
            .duration(1000) // Duration of the transition in milliseconds
            .attrTween("d", function (datum) {
                const interpolate = d3.interpolate(datum.endAngle, d.ratio * 2 * Math.PI);
                return function (t) {
                    datum.endAngle = interpolate(t);
                    return arcForeground(datum);
                };
            });

        // 添加产品名称
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", `-${height / 7}px`)
            .text(d.name);

        // 添加产品编号
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", `7px`)
            .text(d.code);

        // 添加库存比例
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", `${height / 5}px`)
            .text((d.ratio * 100).toFixed(1) + "%");
    });


    // DataTables
    /**
     * Responsive Details -> https://datatables.net/extensions/responsive/classes
     * ----------------------------
     * desktop: x > 1024
     * tablet-l: 768 < x <= 1024
     * tablet-p: 480 < x <= 768
     * mobile-l: 320 < x <= 768
     * mobile-p: x <= 320
     */
    let table = $('#productInfoTable').DataTable({
        language: {
            url: "../js/zh-Hant.json"  // 引用自定義漢化方式
        },
        lengthMenu: [[10, 20, 50, -1], [10, 20, 50, "All"]], //顯示筆數設定
        data: matJson.state ? matJson.data : [],
        autoWidth: false,
        responsive: true,
        layout: {
            top3Start: 'search',
            top2Start: 'info',
            top2End: 'pageLength',
            topStart: null,
            topEnd: null,
            top: 'paging',
            bottom: 'paging',
            bottomStart: null,
            bottomEnd: null,
        },
        columns: [ // responsivePriority
            {
                data: 'code', title: "編號", className: "min-desktop text-start text-lg-center fs-5"
            },
            {
                data: 'name', title: "名稱", responsivePriority: 4,
                className: " fs-5 text-center"
            },
            {
                data: 'stock', title: "庫存量", responsivePriority: 5,
                className: "min-tablet-p fs-5 text-start text-sm-center"
            },
            {
                data: 'storage', title: "儲存位置",
                className: "min-tablet-l fs-5 text-start text-md-center"
            },
            {
                data: 'category', title: "種類", responsivePriority: 6,
                className: "min-tablet-l fs-5 text-start text-md-center"
            },
            {
                data: 'id', title: "編輯/進銷", responsivePriority: 3,
                render: function (data, type, row) {

                    return `
                    
                    <button class="btn fs-5 text-primary btn-edit-material" 
                    data-material-id="${row.id}">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    `;

                },
                className: "text-center align-middle fs-5"
            }
        ],
        columnDefs: [
            {
                targets: '_all',
                className: 'text-start text-md-center align-middle fs-5'
            }
        ]
    });

    // ------------- 新增商品按鍵被按下時 -------------
    $('#addProductBtn').on('click', async function () {
        await loadHTML('./b-add_product.html', '#contentArea');
    });

    // 載入個別商品的進貨建議圖表
    async function drawStuff(id) {
        const suggestRes = await fetch(`http://${IPAddress}:8080/api/analyze/callMaterialDiagram`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`
            },
            body: JSON.stringify({
                "userId": null,
                "materialId": id
            })
        });
        let suggestData = (await suggestRes.json()).data;
        suggestData = suggestData.map(d => {
            return [d.startOfWeek, d.suggestQuantity];
        })
        suggestData.unshift(["時間", "建議購入量"]);

        const data = new google.visualization.arrayToDataTable(suggestData);

        const options = {
            backgroundColor: 'transparent',
            legend: { position: 'none' },
            chart: {
                title: '每週建議購入量',
            },
            bar: { groupWidth: "90%" }
        };

        const chart = new google.charts.Bar(document.getElementById('callSuggestDiagram'));
        // Convert the Classic options to Material options.
        chart.draw(data, google.charts.Bar.convertOptions(options));
    };

    // ------------- 編輯/進銷按鈕被按下時 ---------------
    $('#productInfoTable').on('click', '.btn-edit-material', async function () {

        const id = $(this).data('material-id');

        const infoRes = await fetch(`http://${IPAddress}:8080/api/products/admin/material/edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({ "userId": null, "materialId": id })
        })

        const infoJson = await infoRes.json();
        if (infoJson.state) {
            await loadHTML('./b-product_sale_and_edit.html', '#contentArea');
            $('#aProductID').val(infoJson.data.code);
            $('#aProductName').val(infoJson.data.name);
            $('#aProductCategory').val(infoJson.data.category);
            $('#aProductSafetyThreshold').val(infoJson.data.safetyThreshold);
            $('#aProductStorage').val(infoJson.data.storage);
            $('#aProductDescription').val(infoJson.data.description);
            $('#aProductImage').attr('src', infoJson.data.picture);
            $('#addSalesRecordBtn').attr('data-id', id);
            $('#updateMaterialInfoBtn').attr('data-id', id)

            // 繪製圖表
            google.charts.load('current', { 'packages': ['bar'] });
            google.charts.setOnLoadCallback(() => drawStuff(id));
        } else {
            Swal.fire({
                position: "top",
                icon: "error",
                title: infoJson.message,
                showConfirmButton: true
            });
        }

    });
})