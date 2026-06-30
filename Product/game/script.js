let currentDay = 1;
let money = 100000;
let holdingStocks = [0, 0, 0, 0]; // 各銘柄の保有数
let currentBrandIndex = 0;        // 現在選んでいる銘柄
let isGameOver = false;           // ゲーム終了フラグ

const brands = [
    {
        name: "銘柄A (国債連動ファンド)",
        reliability: "高 (超安定型)",
        history: [1000, 1002, 998, 1005, 1001, 1003, 1007, 1002, 1005, 1010], 
        risk: 15, // 値動きが非常に小さい
        color: '#2ecc71'
    },
    {
        name: "銘柄B (大手自動車メーカー)",
        reliability: "中 (手堅い成長型)",
        history: [950, 960, 980, 970, 990, 1000, 1010, 990, 980, 1000], 
        risk: 40, // 標準的な値動き
        color: '#1e90ff'
    },
    {
        name: "銘柄C (新興ITベンチャー)",
        reliability: "低 (ハイリスク・ハイリターン)",
        history: [1200, 800, 1500, 700, 1900, 1100, 600, 1400, 900, 1000], 
        risk: 250, // 【修正】値動き（リスク）を大幅に大きく
        color: '#ff8c00'
    },
    {
        name: "銘柄D (暗号資産ファンド)",
        reliability: "極低 (超ハイリスク・一発逆転)",
        history: [500, 2500, 300, 4000, 800, 1200, 3100, 500, 1800, 1500], 
        risk: 600, // 破滅か爆益かの超ハイリスク
        color: '#e74c3c'
    }
];

//過去10日間の日本語ラベル作成
let chartLabels = [
    "9日前の推移", "8日前の推移", "7日前の推移", "6日前の推移", 
    "5日前の推移", "4日前の推移", "3日前の推移", "2日前の推移", 
    "1日前の推移", "1日目(現在)"
];

//グラフの初期設定
const ctx = document.getElementById('stockChart').getContext('2d');
let stockChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: chartLabels,
        datasets: [{
            label: '株価 (円)',
            data: [...brands[currentBrandIndex].history], 
            borderColor: brands[currentBrandIndex].color,
            borderWidth: 2,
            fill: false,
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: { beginAtZero: false }
        }
    }
});

//画面表示の更新関数
function updateUI() {
    if (isGameOver) return; 

    const activeBrand = brands[currentBrandIndex];
    const currentPrice = activeBrand.history[activeBrand.history.length - 1];

    document.getElementById("display-day").textContent = currentDay;
    document.getElementById("display-money").textContent = money.toLocaleString();
    document.getElementById("display-stocks").textContent = holdingStocks[currentBrandIndex];
    document.getElementById("display-brand-name").textContent = activeBrand.name;
    document.getElementById("display-price").textContent = currentPrice.toLocaleString();
    document.getElementById("display-reliability").textContent = activeBrand.reliability;

    //直近10日分だけを切り出してグラフに表示
    const displayHistory = activeBrand.history.slice(-10);
    const displayLabels = chartLabels.slice(-10);

    stockChart.data.datasets[0].data = displayHistory;
    stockChart.data.labels = displayLabels;
    stockChart.data.datasets[0].borderColor = activeBrand.color;
    stockChart.data.datasets[0].label = `${activeBrand.name} の株価 (円)`;

    stockChart.update();
}

//銘柄切り替え処理
function selectBrand(index) {
    if (isGameOver) return;
    currentBrandIndex = index;
    
    const buttons = document.querySelectorAll(".btn-brand");
    buttons.forEach((btn, i) => {
        if(i === index) btn.classList.add("active");
        else btn.classList.remove("active");
    });
    updateUI();
}

//「買う」処理
function buyStock() {
    if (isGameOver) return;
    const activeBrand = brands[currentBrandIndex];
    const currentPrice = activeBrand.history[activeBrand.history.length - 1];

    if (money >= currentPrice) {
        money -= currentPrice;
        holdingStocks[currentBrandIndex] += 1;
        updateUI();
    } else {
        alert("資金が足りません！");
    }
}

//「売る」処理
function sellStock() {
    if (isGameOver) return;
    const activeBrand = brands[currentBrandIndex];
    const currentPrice = activeBrand.history[activeBrand.history.length - 1];

    if (holdingStocks[currentBrandIndex] > 0) {
        money += currentPrice;
        holdingStocks[currentBrandIndex] -= 1;
        updateUI();
    } else {
        alert("売却する株を持っていません！");
    }
}

//「次の日へ進む」処理 
function nextDay() {
    if (isGameOver) return;

    if (currentDay >= 50) {
        endGame(); 
        return;
    }

    currentDay++;

    chartLabels.push(`${currentDay}日目`);

    // 全銘柄の価格を更新
    brands.forEach(brand => {
        const lastPrice = brand.history[brand.history.length - 1];
        const fluctuation = (Math.random() - 0.5) * brand.risk;
        let newPrice = lastPrice + Math.round(fluctuation);
        
        if (newPrice < 10) newPrice = 10;
        brand.history.push(newPrice);
    });

    updateUI();
}

//「ゲーム終了（結果報告）」処理
function endGame() {
    if (isGameOver) return;
    isGameOver = true;

    const actionButtons = document.querySelectorAll(".action-buttons .btn");
    actionButtons.forEach(btn => btn.disabled = true);

    // 全ての保有株を強制売却
    let totalStocksValue = 0;
    for (let i = 0; i < brands.length; i++) {
        const currentPrice = brands[i].history[brands[i].history.length - 1];
        totalStocksValue += holdingStocks[i] * currentPrice;
    }

    const finalTotalAssets = money + totalStocksValue;
    const profit = finalTotalAssets - 100000;

    document.getElementById("result-days").textContent = currentDay;
    document.getElementById("result-money").textContent = money.toLocaleString();
    document.getElementById("result-stocks-value").textContent = totalStocksValue.toLocaleString();
    document.getElementById("result-total").textContent = finalTotalAssets.toLocaleString();
    
    const profitElement = document.getElementById("result-profit");
    profitElement.textContent = (profit >= 0 ? "+" : "") + profit.toLocaleString();
    profitElement.style.color = profit >= 0 ? "#ff4d4d" : "#1e90ff";

    document.getElementById("chart-area").classList.add("hidden");
    document.getElementById("result-area").classList.remove("hidden");
}

function showHelp(type) {
    let message = "";
    if (type === 'howTo') {
        message = "【投資の仕方】\n1. 銘柄ボタンでチャートを切り替えます。\n2. 安い時に「1株買う」で仕込み、高くなったら「1株売る」で利益を確定させましょう。\n3. 「次の日へ進む」を押すと株価が1日分変動します。";
    } else if (type === 'trivia') {
        message = "【投資の豆知識】\n「卵を一つのカゴに盛るな」という格言があります。特定のハイリスク株（銘柄Dなど）だけに全財産を賭けると暴落時に大損します。安定した銘柄AやBにも分散して投資するのがリスクヘッジの基本です。";
    }
    alert(message);
}

// 起動時に一回画面を更新
updateUI();



// 利用規約を表示する関数
function showTerms() {
    // ゲーム画面を非表示にし、規約画面を表示する
    document.getElementById("game-screen").classList.add("hidden");
    document.getElementById("terms-screen").classList.remove("hidden");
}

// ゲーム画面に戻る関数
function backToGame() {
    // 規約画面を非表示にし、ゲーム画面を再表示する
    document.getElementById("terms-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    
    if (stockChart) {
        stockChart.resize();
        stockChart.update();
    }
}