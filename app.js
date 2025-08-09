const API_KEY = "7fb94029e8f1ba018c62a1b03c7dca4d56c0b01c"; // CryptoPanic API key

// Update interval (ms)
const UPDATE_INTERVAL = 1000 * 60 * 2; // elke 2 minuten

// Elementen
const buyBar = document.getElementById("buy-bar");
const sellBar = document.getElementById("sell-bar");
const newsList = document.getElementById("news-list");

// Functie: haal koop/verkoop % van Binance (XRPUSDT)
async function fetchBuySellPercent() {
  try {
    const res = await fetch("https://api.binance.com/api/v3/depth?symbol=XRPUSDT&limit=100");
    if (!res.ok) throw new Error("Binance API fout");
    const data = await res.json();
    const totalBids = data.bids.reduce((sum, bid) => sum + parseFloat(bid[1]), 0);
    const totalAsks = data.asks.reduce((sum, ask) => sum + parseFloat(ask[1]), 0);
    const total = totalBids + totalAsks;
    if(total === 0) return {buyers: 50, sellers: 50};
    return {
      buyers: ((totalBids / total) * 100).toFixed(1),
      sellers: ((totalAsks / total) * 100).toFixed(1)
    };
  } catch(e) {
    console.error("Fout bij Binance data:", e);
    return {buyers: 50, sellers: 50};
  }
}

// Functie: haal top 10 XRP nieuws van CryptoPanic
async function fetchXRPNews() {
  try {
    const url = `https://cryptopanic.com/api/developer/v2/posts/?auth_token=${API_KEY}&currencies=XRP&public=true&kind=news&filter=important`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("CryptoPanic API fout");
    const data = await res.json();
    if (!data.results) return [];
    // Sorteer nieuwst bovenaan op published_at
    const sorted = data.results
      .filter(item => item.published_at)
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      .slice(0, 10);
    return sorted;
  } catch(e) {
    console.error("Fout bij CryptoPanic data:", e);
    return [];
  }
}

// Toon koop/verkoop balk
function updateBuySellBar(buyers, sellers) {
  buyBar.style.width = buyers + "%";
  sellBar.style.width = sellers + "%";
  buyBar.textContent = buyers + "%";
  sellBar.textContent = sellers + "%";
}

// Toon nieuws in lijst
function updateNewsList(newsArray) {
  newsList.innerHTML = "";
  newsArray.forEach(item => {
    const li = document.createElement("li");
    // Datum mooi formatten
    const date = new Date(item.published_at);
    const dateStr = date.toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
    li.innerHTML = `
      <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>
      <div class="news-date">${dateStr}</div>
    `;
    newsList.appendChild(li);
  });
}

// Hoofdfunctie om alles te verversen
async function refreshDashboard() {
  const [buySell, news] = await Promise.all([
    fetchBuySellPercent(),
    fetchXRPNews()
  ]);
  updateBuySellBar(buySell.buyers, buySell.sellers);
  updateNewsList(news);
}

// Start en automatisch refresh
refreshDashboard();
setInterval(refreshDashboard, UPDATE_INTERVAL);
