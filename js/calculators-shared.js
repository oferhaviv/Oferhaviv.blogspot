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
// ======================================================
// ==== Net Profit Calculator (profiles + local save + calc) ====
// ======================================================
(function () {
    "use strict";

    // --- URLs (server templates) ---
    const FEES_URL = "https://oferhaviv.github.io/Oferhaviv.blogspot/db/fee_profiles.json";
    const TAX_URL = "https://oferhaviv.github.io/Oferhaviv.blogspot/db/tax_profiles.json";

    // --- localStorage keys ---
    const LS_FEES_KEY = "net_fee_profiles_local";
    const LS_TAX_KEY = "net_tax_profiles_local";
    const LS_LAST_FEE = "net_last_fee_profile";
    const LS_LAST_TAX = "net_last_tax_profile";

    function $(id) { return document.getElementById(id); }

    function parseNum(v) {
        const s = String(v ?? "").replace(/,/g, "").trim();
        const n = parseFloat(s);
        return isNaN(n) ? 0 : n;
    }

    function currencySymbol(code) {
        return (code === "ILS" || code === "NIS" || code === "₪") ? "₪" : "$";
    }

    function normalizeName(name) {
        return (name || "").trim().toLowerCase();
    }

    function setSelectStatus(selectEl, text) {
        if (!selectEl) return;
        selectEl.innerHTML = "";
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = text;
        selectEl.appendChild(opt);
    }

    async function fetchJson(url) {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
        return await res.json();
    }

    function readLocalArr(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function writeLocalArr(key, arr) {
        localStorage.setItem(key, JSON.stringify(arr));
    }

    function mergeByName(serverArr, localArr) {
        const out = [];
        const seen = new Set();

        (serverArr || []).forEach(p => {
            const name = (p && p.name) ? String(p.name).trim() : "";
            if (!name || seen.has(name.toLowerCase())) return;
            seen.add(name.toLowerCase());
            out.push(p);
        });

        (localArr || []).forEach(p => {
            const name = (p && p.name) ? String(p.name).trim() : "";
            if (!name || seen.has(name.toLowerCase())) return;
            seen.add(name.toLowerCase());
            out.push(p);
        });

        return out;
    }

    function populateSelect(selectEl, profiles) {
        if (!selectEl) return;

        selectEl.innerHTML = "";
        const first = document.createElement("option");
        first.value = "";
        first.textContent = "בחר...";
        selectEl.appendChild(first);

        profiles.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id || p.name;
            opt.textContent = p.name;
            selectEl.appendChild(opt);
        });
    }

    function findProfile(list, value) {
        if (!Array.isArray(list) || !value) return null;
        const v = String(value).trim();
        return list.find(p => (p.id && p.id === v) || (p.name && p.name === v)) || null;
    }

    function restoreLastSelections() {
        const feeSelect = $("net_feeProfile");
        const taxSelect = $("net_taxProfile");

        const lastFee = localStorage.getItem(LS_LAST_FEE) || "";
        const lastTax = localStorage.getItem(LS_LAST_TAX) || "";

        if (feeSelect && lastFee) {
            const exists = Array.from(feeSelect.options).some(o => o.value === lastFee);
            if (exists) feeSelect.value = lastFee;
        }
        if (taxSelect && lastTax) {
            const exists = Array.from(taxSelect.options).some(o => o.value === lastTax);
            if (exists) taxSelect.value = lastTax;
        }

        // אם אין last — נבחר ראשון אמיתי אם קיים (לא "בחר...")
        if (feeSelect && !feeSelect.value && feeSelect.options.length > 1) feeSelect.selectedIndex = 1;
        if (taxSelect && !taxSelect.value && taxSelect.options.length > 1) taxSelect.selectedIndex = 1;
    }

    function bindLastSelectionHandlers() {
        const feeSelect = $("net_feeProfile");
        const taxSelect = $("net_taxProfile");

        if (feeSelect && !feeSelect.__bound_last) {
            feeSelect.__bound_last = true;
            feeSelect.addEventListener("change", function () {
                localStorage.setItem(LS_LAST_FEE, feeSelect.value || "");
            });
        }
        if (taxSelect && !taxSelect.__bound_last) {
            taxSelect.__bound_last = true;
            taxSelect.addEventListener("change", function () {
                localStorage.setItem(LS_LAST_TAX, taxSelect.value || "");
            });
        }
    }

    // ---- Load profiles (server + local) ----
    async function loadProfiles() {
        const feeSelect = $("net_feeProfile");
        const taxSelect = $("net_taxProfile");
        if (!feeSelect || !taxSelect) return; // לא עמוד נטו

        setSelectStatus(feeSelect, "טוען פרופילי עמלות...");
        setSelectStatus(taxSelect, "טוען פרופילי מס...");

        try {
            const [feesDb, taxDb] = await Promise.all([fetchJson(FEES_URL), fetchJson(TAX_URL)]);

            const serverFees = (feesDb && feesDb.profiles) ? feesDb.profiles : [];
            const serverTaxes = (taxDb && taxDb.profiles) ? taxDb.profiles : [];

            const localFees = readLocalArr(LS_FEES_KEY);
            const localTaxes = readLocalArr(LS_TAX_KEY);

            const feeProfiles = mergeByName(serverFees, localFees);
            const taxProfiles = mergeByName(serverTaxes, localTaxes);

            window.__net_feeProfiles = feeProfiles;
            window.__net_taxProfiles = taxProfiles;

            populateSelect(feeSelect, feeProfiles);
            populateSelect(taxSelect, taxProfiles);

            bindLastSelectionHandlers();
            restoreLastSelections();

        } catch (e) {
            console.error("Net profiles load failed:", e);
            setSelectStatus(feeSelect, "שגיאה בטעינת פרופילי עמלות");
            setSelectStatus(taxSelect, "שגיאה בטעינת פרופילי מס");
        }
    }

    // ---- UI: toggle fee model fields (if exists) ----
    function toggleFeeModelUI() {
        const model = ($("net_newFee_model")?.value) || "per_share";
        const per = $("net_model_per_share");
        const pct = $("net_model_percent");
        if (per) per.style.display = (model === "per_share") ? "" : "none";
        if (pct) pct.style.display = (model === "percent") ? "" : "none";
    }

    function showMsg(id, text, isError) {
        const el = $(id);
        if (!el) return;
        el.style.display = "block";
        el.textContent = text;
        el.style.borderColor = isError ? "#ef4444" : "#333";
        setTimeout(() => { el.style.display = "none"; el.textContent = ""; }, 3200);
    }

    function makeIdFromName(name, prefix) {
        const base = (name || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_\u0590-\u05FF]/g, "");
        const rnd = Math.random().toString(16).slice(2, 8);
        return (prefix || "p") + "_" + (base ? base : "profile") + "_" + rnd;
    }

    // ---- Save fee profile locally + add to select + select it ----
    function saveFeeProfile() {
        const name = ($("net_newFee_name")?.value || "").trim();
        const currency = ($("net_newFee_currency")?.value || "USD").trim();
        const model = ($("net_newFee_model")?.value || "per_share").trim();

        const min = parseNum($("net_newFee_min")?.value);
        const discountPct = parseNum($("net_newFee_discountPct")?.value);

        if (!name) return showMsg("net_feeProfileMsg", "נא להזין שם לפרופיל.", true);
        if (!isFinite(min) || min < 0) return showMsg("net_feeProfileMsg", "מינימום לעסקה לא תקין.", true);
        if (!isFinite(discountPct) || discountPct < 0 || discountPct > 100) return showMsg("net_feeProfileMsg", "הנחה חייבת להיות בין 0 ל-100.", true);

        let per_share = 0, percent = 0;

        if (model === "per_share") {
            const cents = parseNum($("net_newFee_centsPerShare")?.value);
            if (!isFinite(cents) || cents < 0) return showMsg("net_feeProfileMsg", "סנטים למניה לא תקין.", true);
            per_share = cents / 100; // סנט -> מטבע
            percent = 0;
        } else {
            const pctVal = parseNum($("net_newFee_percent")?.value);
            if (!isFinite(pctVal) || pctVal < 0) return showMsg("net_feeProfileMsg", "אחוז עמלה לא תקין.", true);
            percent = pctVal / 100; // 0.08% -> 0.0008
            per_share = 0;
        }

        const server = Array.isArray(window.__net_feeProfiles) ? window.__net_feeProfiles : [];
        const local = readLocalArr(LS_FEES_KEY);

        const n = normalizeName(name);
        const exists = server.some(p => normalizeName(p.name) === n) || local.some(p => normalizeName(p.name) === n);
        if (exists) return showMsg("net_feeProfileMsg", "שם הפרופיל כבר קיים. בחר שם אחר.", true);

        const id = makeIdFromName(name, "fee");

        const profile = {
            id,
            name,
            currency,
            buy: { per_share, percent, min, flat: 0 },
            sell: { per_share, percent, min, flat: 0 },
            discount_percent: discountPct
        };

        local.push(profile);
        writeLocalArr(LS_FEES_KEY, local);

        // עדכון מיידי ב-UI
        const feeSelect = $("net_feeProfile");
        if (feeSelect) {
            const val = profile.id || profile.name;
            const opt = document.createElement("option");
            opt.value = val;
            opt.textContent = profile.name;
            feeSelect.appendChild(opt);
            feeSelect.value = val;
            localStorage.setItem(LS_LAST_FEE, val);
        }

        // עדכון הרשימה בזיכרון
        if (Array.isArray(window.__net_feeProfiles)) window.__net_feeProfiles.push(profile);
        else window.__net_feeProfiles = [profile];

        showMsg("net_feeProfileMsg", "נשמר! הפרופיל נבחר ברשימה.", false);

        // ניקוי שם (שאר הערכים נשארים לנוחות)
        if ($("net_newFee_name")) $("net_newFee_name").value = "";
    }

    // ---- Save tax profile locally + add to select + select it ----
    function saveTaxProfile() {
        const name = ($("net_newTax_name")?.value || "").trim();
        const taxPct = parseNum($("net_newTax_pct")?.value);

        if (!name) return showMsg("net_taxProfileMsg", "נא להזין שם לפרופיל מס.", true);
        if (!isFinite(taxPct) || taxPct < 0 || taxPct > 100) return showMsg("net_taxProfileMsg", "אחוז מס חייב להיות בין 0 ל-100.", true);

        const server = Array.isArray(window.__net_taxProfiles) ? window.__net_taxProfiles : [];
        const local = readLocalArr(LS_TAX_KEY);

        const n = normalizeName(name);
        const exists = server.some(p => normalizeName(p.name) === n) || local.some(p => normalizeName(p.name) === n);
        if (exists) return showMsg("net_taxProfileMsg", "שם פרופיל מס כבר קיים. בחר שם אחר.", true);

        const id = makeIdFromName(name, "tax");

        const profile = {
            id,
            name,
            tax_percent: taxPct
        };

        local.push(profile);
        writeLocalArr(LS_TAX_KEY, local);

        const taxSelect = $("net_taxProfile");
        if (taxSelect) {
            const val = profile.id || profile.name;
            const opt = document.createElement("option");
            opt.value = val;
            opt.textContent = profile.name;
            taxSelect.appendChild(opt);
            taxSelect.value = val;
            localStorage.setItem(LS_LAST_TAX, val);
        }

        if (Array.isArray(window.__net_taxProfiles)) window.__net_taxProfiles.push(profile);
        else window.__net_taxProfiles = [profile];

        showMsg("net_taxProfileMsg", "נשמר! פרופיל המס נבחר ברשימה.", false);

        if ($("net_newTax_name")) $("net_newTax_name").value = "";
    }

    // ---- Fee calc helper ----
    function calcSideFee(price, qty, sideRule) {
        const perShare = parseNum(sideRule?.per_share);
        const percent = parseNum(sideRule?.percent);
        const min = parseNum(sideRule?.min);
        const flat = parseNum(sideRule?.flat);

        const tradeValue = price * qty;
        const raw = flat + (perShare * qty) + (percent * tradeValue);
        return Math.max(raw, min || 0);
    }

    // ---- Main calc ----
    function calcNetProfit() {
        const buy = parseNum($("net_buyPrice")?.value);
        const sell = parseNum($("net_sellPrice")?.value);
        const qty = parseNum($("net_qty")?.value);

        if (!buy || !sell || !qty) {
            alert("נא למלא מחיר קנייה, מחיר מכירה וכמות.");
            return;
        }

        const feeSelectVal = $("net_feeProfile")?.value || "";
        const taxSelectVal = $("net_taxProfile")?.value || "";

        const feeProfile = findProfile(window.__net_feeProfiles, feeSelectVal);
        const taxProfile = findProfile(window.__net_taxProfiles, taxSelectVal);

        if (!feeProfile) {
            alert("נא לבחור פרופיל עמלות.");
            return;
        }
        if (!taxProfile) {
            alert("נא לבחור פרופיל מס.");
            return;
        }

        // לשמור בחירה אחרונה
        localStorage.setItem(LS_LAST_FEE, feeSelectVal);
        localStorage.setItem(LS_LAST_TAX, taxSelectVal);

        const discount = parseNum(feeProfile.discount_percent) / 100;
        const sym = currencySymbol(feeProfile.currency);

        const buyFee = calcSideFee(buy, qty, feeProfile.buy);
        const sellFee = calcSideFee(sell, qty, feeProfile.sell);

        const buyFeeDisc = buyFee * (1 - discount);
        const sellFeeDisc = sellFee * (1 - discount);
        const totalFees = buyFeeDisc + sellFeeDisc;

        const totalBuy = buy * qty;
        const totalSell = sell * qty;

        const grossProfit = (sell - buy) * qty;
        const grossPct = totalBuy > 0 ? (grossProfit / totalBuy * 100) : 0;

        const taxableBase = Math.max(grossProfit - totalFees, 0);
        const taxPct = parseNum(taxProfile.tax_percent) / 100;
        const tax = taxableBase * taxPct;

        const netProfit = grossProfit - totalFees - tax;

        // אחוז נטו מול “השקעה בפועל” (כולל עמלת קנייה אחרי הנחה)
        const invested = totalBuy + buyFeeDisc;
        const netPct = invested > 0 ? (netProfit / invested * 100) : 0;

        // Render
        if ($("net_totalBuy")) $("net_totalBuy").innerText = formatMoney(totalBuy);
        if ($("net_totalSell")) $("net_totalSell").innerText = formatMoney(totalSell);

        if ($("net_grossProfit")) $("net_grossProfit").innerText = formatMoney(grossProfit);
        if ($("net_grossPct")) $("net_grossPct").innerText = formatPercent(grossPct);

        if ($("net_totalFees")) $("net_totalFees").innerText = formatMoney(totalFees);
        if ($("net_tax")) $("net_tax").innerText = formatMoney(tax);

        if ($("net_netProfit")) $("net_netProfit").innerText = formatMoney(netProfit);
        if ($("net_netPct")) $("net_netPct").innerText = formatPercent(netPct);

        // אם בתוצאות יש לך סימן מטבע קבוע ב-HTML ($) — השאר.
        // אם תרצה דינמי, נגיד לי ואעשה replace קטן.

        if ($("netResults")) $("netResults").style.display = "block";
    }

    // ---- Bind buttons (once) ----
    function bindNetHandlersOnce() {
        const calcBtn = $("net_btnCalc");
        if (calcBtn && !calcBtn.__bound_net) {
            calcBtn.__bound_net = true;
            calcBtn.addEventListener("click", calcNetProfit);
        }

        const saveFeeBtn = $("net_btnSaveFeeProfile");
        if (saveFeeBtn && !saveFeeBtn.__bound_net) {
            saveFeeBtn.__bound_net = true;
            saveFeeBtn.addEventListener("click", saveFeeProfile);
        }

        const saveTaxBtn = $("net_btnSaveTaxProfile");
        if (saveTaxBtn && !saveTaxBtn.__bound_net) {
            saveTaxBtn.__bound_net = true;
            saveTaxBtn.addEventListener("click", saveTaxProfile);
        }

        const feeModel = $("net_newFee_model");
        if (feeModel && !feeModel.__bound_net) {
            feeModel.__bound_net = true;
            toggleFeeModelUI();
            feeModel.addEventListener("change", toggleFeeModelUI);
        }
    }

    // ---- Init with retry (Blogger) ----
    function init() {
        // רק אם זה העמוד הזה
        if (!$("net_feeProfile") || !$("net_taxProfile")) return;

        loadProfiles();
        bindNetHandlersOnce();
    }

    let tries = 0;
    (function tryInit() {
        tries++;
        if ($("net_feeProfile") && $("net_taxProfile")) return init();
        if (tries < 40) return setTimeout(tryInit, 100);
    })();

})();
