  // ==== פונקציות משותפות ====
  function formatMoney(value) {
    if (!isFinite(value)) return "0.00";
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatPercent(value) {
    if (!isFinite(value)) return "0.00";
    return value.toFixed(2);
  }

  function formatRatio(value) {
    if (!isFinite(value) || value <= 0) return "0.00";
    return value.toFixed(2);
  }

  // ==== מחשבון מחיר ממוצע ====
  function calcAvgPrice() {
    function getNum(id) {
      var v = document.getElementById(id).value.replace(/,/g, '');
      var n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    }

    var existingQty   = getNum('avg_existingQty');
    var existingPrice = getNum('avg_existingPrice');
    var newQty        = getNum('avg_newQty');
    var newPrice      = getNum('avg_newPrice');

    var totalQty = existingQty + newQty;
    var requiredInvestment = newQty * newPrice;

    var avgPrice = 0;
    if (totalQty > 0) {
      avgPrice = (existingQty * existingPrice + newQty * newPrice) / totalQty;
    }

    var currentPrice   = newPrice;
    var marginDollar   = 0;
    var marginPercent  = 0;

    if (totalQty > 0 && avgPrice > 0 && currentPrice > 0) {
      marginDollar  = (currentPrice - avgPrice) * totalQty;
      marginPercent = (currentPrice - avgPrice) / avgPrice * 100;
    }

    document.getElementById('avg_requiredInvestment').innerText = formatMoney(requiredInvestment);
    document.getElementById('avg_avgPrice').innerText           = formatMoney(avgPrice);
    document.getElementById('avg_totalQty').innerText           = totalQty;
    document.getElementById('avg_marginDollar').innerText       = formatMoney(marginDollar);
    document.getElementById('avg_marginPercent').innerText      = formatPercent(marginPercent);

    document.getElementById('avgResults').style.display = 'block';
  }

  // ==== מחשבון סיכון/סיכוי (עם Finnhub כמו אצלך) ====
  const FINNHUB_TOKEN = "d4b0dq9r01qp275hrhfgd4b0dq9r01qp275hrhg0";

function fetchMarketPrice() {
    const el = document.getElementById('risk_symbol');
    const symbol = el.value.trim().toUpperCase();
    el.value = symbol;
    if (!symbol) {
      alert("נא להזין קודם סימול (לדוגמה AAPL).");
      return;
    }

    if (!FINNHUB_TOKEN) {
      alert("יש להגדיר טוקן Finnhub בקוד.");
      return;
    }

    const url = "https://finnhub.io/api/v1/quote?symbol="
      + encodeURIComponent(symbol)
      + "&token=" + encodeURIComponent(FINNHUB_TOKEN);

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data && typeof data.c === "number" && data.c > 0) {
          document.getElementById('risk_buy').value = data.c.toFixed(2);
        } else {
          alert("לא ניתן היה לקבל מחיר תקין לסימול הזה.");
        }
      })
      .catch(err => {
        console.error(err);
        alert("שגיאה בשליפת מחיר מ-Finnhub.");
      });
  }

  function calculateStock() {
    var buy    = parseFloat(document.getElementById('risk_buy').value);
    var tp1    = parseFloat(document.getElementById('risk_tp1').value);
    var tp2    = parseFloat(document.getElementById('risk_tp2').value);
    var sl     = parseFloat(document.getElementById('risk_sl').value);
    var amount = parseFloat(document.getElementById('risk_amount').value);
    var symbol = (document.getElementById('risk_symbol').value || "-").trim().toUpperCase();
    document.getElementById('risk_symbol').value = symbol;

    if (!buy || !amount || !tp1 || !tp2 || !sl) {
      alert("נא למלא את כל השדות המספריים (קניה, TP1, TP2, סטופ, כמות).");
      return;
    }

    var totalCost = buy * amount;

    // TP1
    var tp1Profit  = (tp1 - buy) * amount;
    var tp1Percent = ((tp1 - buy) / buy) * 100;

    // TP2
    var tp2Profit  = (tp2 - buy) * amount;
    var tp2Percent = ((tp2 - buy) / buy) * 100;

    // סטופ לוס
    var slLoss    = (buy - sl) * amount; // חיובי = הפסד
    var slPercent = ((buy - sl) / buy) * 100;

    // יחס סיכון/סיכוי
    var rr1 = tp1Percent > 0 && slPercent > 0 ? (tp1Percent / slPercent) : NaN;
    var rr2 = tp2Percent > 0 && slPercent > 0 ? (tp2Percent / slPercent) : NaN;

    setRRBadge(rr1, "rr1Badge", "rr1Text");
    setRRBadge(rr2, "rr2Badge", "rr2Text");
    
    document.getElementById('outSymbol').innerText = symbol;

    document.getElementById('totalCost').innerText   = formatMoney(totalCost);
    document.getElementById('totalAmount').innerText = amount + " מניות";

    document.getElementById('tp1Profit').innerText   = formatMoney(tp1Profit);
    document.getElementById('tp1Percent').innerText  = formatPercent(tp1Percent);

    document.getElementById('tp2Profit').innerText   = formatMoney(tp2Profit);
    document.getElementById('tp2Percent').innerText  = formatPercent(tp2Percent);

    document.getElementById('rr1').innerText = formatRatio(rr1);
    document.getElementById('rr2').innerText = formatRatio(rr2);

    document.getElementById('slLoss').innerText    = formatMoney(slLoss);
    document.getElementById('slPercent').innerText = formatPercent(slPercent);

    document.getElementById('riskResults').style.display = 'block';
  }

// ======================================================
// ==== Toggle for home page accordions (מי אני + מחשבונים) ====
// ======================================================
function initCalcHomeAccordions(root) {
  var scope = root || document;

  // אקורדיון "עופר חביב — מי אני?"
  scope.querySelectorAll('.accordion').forEach(function (acc) {
    var checkbox = acc.querySelector('input[type="checkbox"]');
    var label = acc.querySelector('.accordion-label');

    if (checkbox && label) {
      label.addEventListener('click', function (e) {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
      });
    }
  });

  // הפלוסים של רשימת המחשבונים
  scope.querySelectorAll('.calc-row-box').forEach(function (box) {
    var checkbox = box.querySelector('.toggle-box');
    var plus = box.querySelector('.toggle-plus');

    if (checkbox && plus) {
      plus.addEventListener('click', function (e) {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
      });
    }
  });
}

// ריצה אוטומטית כשכל ה-HTML כבר בעמוד (מצב ישן)
document.addEventListener('DOMContentLoaded', function () {
  if (typeof initCalcHomeAccordions === 'function') {
    initCalcHomeAccordions(document);
  }
});

function rrCategory(rr) {
    if (!isFinite(rr) || rr <= 0) return { cls: "rr-1", text: "1:1" };

    if (rr < 1.5) return { cls: "rr-1", text: "1:1" };
    if (rr < 2.0) return { cls: "rr-15", text: "1:1.5" };
    if (rr < 3.0) return { cls: "rr-2", text: "1:2" };
    return { cls: "rr-3p", text: "1:3+" };
}
function setRRBadge(rr, badgeId, textId) {
    const cat = rrCategory(rr);
    const badgeEl = document.getElementById(badgeId);
    const textEl = document.getElementById(textId);

    // אם אחד מהם לא קיים בדף – פשוט לא עושים כלום
    if (!badgeEl || !textEl) return;

    badgeEl.classList.remove("rr-1", "rr-15", "rr-2", "rr-3p");
    badgeEl.classList.add(cat.cls);
    textEl.textContent = cat.text;
}
function setRRBadge(rr, badgeId, textId) {
    const cat = rrCategory(rr);
    const badgeEl = document.getElementById(badgeId);
    const textEl = document.getElementById(textId);

    // אם אחד מהם לא קיים בדף – פשוט לא עושים כלום
    if (!badgeEl || !textEl) return;

    badgeEl.classList.remove("rr-1", "rr-15", "rr-2", "rr-3p");
    badgeEl.classList.add(cat.cls);
    textEl.textContent = "1:" + formatRatio(rr);

}
