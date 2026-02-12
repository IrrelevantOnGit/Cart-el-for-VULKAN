(function () {
    "use strict";

    var STORAGE_KEY = "mrx_chat_history_v1";
    var OPEN_KEY = "mrx_chat_open_v1";

    function $(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function detectContext() {
        return {
            page: (location.pathname.split("/").pop() || "index.html").toLowerCase(),
            isDashboard: !!document.querySelector(".dashboard") || !!document.querySelector(".kpi-card"),
            hasFeatures: !!document.querySelector("#features") || location.pathname.toLowerCase().includes("features")
        };
    }

    function collectDashboardMetrics() {
        var cards = document.querySelectorAll(".kpi-card");
        var metrics = [];

        cards.forEach(function (card) {
            var label = card.querySelector("h3");
            var value = card.querySelector(".kpi-value");
            var change = card.querySelector(".kpi-change");

            if (label && value) {
                metrics.push({
                    label: label.textContent.trim(),
                    value: value.textContent.trim(),
                    change: change ? change.textContent.trim() : ""
                });
            }
        });

        return metrics;
    }

    function extractRevenueSignal(metrics) {
        var revenue = metrics.find(function (m) {
            return /revenue/i.test(m.label);
        });

        if (!revenue) {
            return null;
        }

        var match = revenue.change.match(/([+-]?\d+(?:\.\d+)?)%/);
        return {
            label: revenue.label,
            value: revenue.value,
            changePct: match ? Number(match[1]) : null,
            changeRaw: revenue.change || ""
        };
    }

    function buildMarkup() {
        return [
            '<section class="mrx-ai-root" id="mrxAiRoot" aria-live="polite">',
            '  <button class="mrx-toggle" id="mrxToggle" aria-label="Open Mr X assistant" title="Mr X - CART-EL Super Intelligence Assistant">',
            '    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
            '      <path d="M12 2L14.6 8.1L21 9L16.2 13.4L17.4 20L12 16.8L6.6 20L7.8 13.4L3 9L9.4 8.1L12 2Z" fill="white"/>',
            '    </svg>',
            '  </button>',
            '  <div class="mrx-panel" id="mrxPanel" role="dialog" aria-label="Mr X chat panel" aria-modal="false">',
            '    <header class="mrx-head">',
            '      <div class="mrx-brand">',
            '        <div class="mrx-orb" aria-hidden="true"></div>',
            '        <div>',
            '          <p class="mrx-title">Mr X - CART-EL Super Intelligence Assistant</p>',
            '          <p class="mrx-subtitle">Business intelligence partner</p>',
            '        </div>',
            '      </div>',
            '      <button class="mrx-close" id="mrxClose" aria-label="Close assistant">x</button>',
            '    </header>',
            '    <div class="mrx-messages" id="mrxMessages"></div>',
            '    <div class="mrx-input-wrap">',
            '      <p class="mrx-access-note">Can read dashboard analytics/reports. Cannot access passwords, payment credentials, or login credentials.</p>',
            '      <div class="mrx-input-row">',
            '        <input id="mrxInput" class="mrx-input" type="text" placeholder="Ask about revenue, trends, pricing, demand, or navigation"/>',
            '        <button id="mrxVoice" class="mrx-voice" aria-label="Voice input" title="Voice input">',
            '          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16C14.2091 16 16 14.2091 16 12V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" stroke-width="2"/><path d="M5 11V12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12V11" stroke="currentColor" stroke-width="2"/><path d="M12 19V22" stroke="currentColor" stroke-width="2"/></svg>',
            '        </button>',
            '        <button id="mrxSend" class="mrx-send" aria-label="Send message">',
            '          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            '        </button>',
            '      </div>',
            '    </div>',
            '  </div>',
            '</section>'
        ].join("\n");
    }

    function addMessage(container, role, text) {
        var msg = document.createElement("article");
        msg.className = "mrx-msg " + role;

        var safeText = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>");

        msg.innerHTML =
            '<div class="mrx-msg-avatar" aria-hidden="true"></div>' +
            '<div>' +
            '  <div class="mrx-msg-bubble">' + safeText + "</div>" +
            '  <div class="mrx-msg-meta">' + (role === "bot" ? "Mr X" : "You") + "</div>" +
            "</div>";

        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function readHistory() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (_err) {
            return [];
        }
    }

    function writeHistory(history) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-25)));
        } catch (_err) {
            // Storage issues are non-critical.
        }
    }

    function maybeBlockByPolicy(question) {
        var low = question.toLowerCase();
        var blocked = [
            "password",
            "passcode",
            "card number",
            "cvv",
            "payment credential",
            "login credential",
            "change login",
            "reset user password"
        ];

        return blocked.some(function (term) { return low.includes(term); });
    }

    function computeInsights(metrics) {
        var summary = metrics.map(function (m) {
            return m.label + ": " + m.value + (m.change ? " (" + m.change + ")" : "");
        });

        return summary.length ? summary.join("; ") : "No dashboard KPIs detected on this page.";
    }

    function parseNumeric(value) {
        if (value === null || value === undefined) return null;
        var normalized = String(value).replace(/[^0-9.-]/g, "");
        if (!normalized) return null;
        var parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function formatMoney(value) {
        if (!Number.isFinite(value)) return "N/A";
        return "$" + Math.round(value).toLocaleString();
    }

    function getLiveSignals() {
        var data = window.cartelData || {};
        var revenue = Array.isArray(data.revenue) ? data.revenue : [];
        var activity = Array.isArray(data.activity) ? data.activity : [];
        var activityLabels = Array.isArray(data.activityLabels) ? data.activityLabels : [];
        var retention = Array.isArray(data.retention) ? data.retention : [];
        var rows = document.querySelectorAll("#tableBody tr, #productsTable tbody tr");

        var topProduct = null;
        var categoryRevenueMap = {};
        var products = [];

        rows.forEach(function (row) {
            var cells = row.querySelectorAll("td");
            if (cells.length < 7) return;

            var name = cells[1].textContent.trim();
            var category = cells[2].textContent.trim();
            var sold = parseNumeric(cells[3].textContent);
            var rowRevenue = parseNumeric(cells[4].textContent);
            var growth = parseNumeric(cells[5].textContent);

            if (!name || !Number.isFinite(rowRevenue)) return;

            products.push({
                name: name,
                category: category,
                sold: Number.isFinite(sold) ? sold : 0,
                revenue: rowRevenue,
                growth: Number.isFinite(growth) ? growth : 0
            });

            categoryRevenueMap[category] = (categoryRevenueMap[category] || 0) + rowRevenue;
        });

        if (products.length) {
            topProduct = products.reduce(function (best, item) {
                return !best || item.revenue > best.revenue ? item : best;
            }, null);
        }

        var topCategory = Object.keys(categoryRevenueMap).reduce(function (best, category) {
            if (!best) return { category: category, revenue: categoryRevenueMap[category] };
            return categoryRevenueMap[category] > best.revenue
                ? { category: category, revenue: categoryRevenueMap[category] }
                : best;
        }, null);

        var revenueSignal = null;
        if (revenue.length >= 2) {
            var latest = revenue[revenue.length - 1];
            var previous = revenue[revenue.length - 2];
            var changePct = previous ? ((latest - previous) / previous) * 100 : 0;
            var prevQuarterAvg = revenue.slice(Math.max(0, revenue.length - 6), Math.max(0, revenue.length - 3));
            var currQuarterAvg = revenue.slice(Math.max(0, revenue.length - 3));
            var avgPrev = prevQuarterAvg.length ? prevQuarterAvg.reduce(function (a, b) { return a + b; }, 0) / prevQuarterAvg.length : null;
            var avgCurr = currQuarterAvg.length ? currQuarterAvg.reduce(function (a, b) { return a + b; }, 0) / currQuarterAvg.length : null;
            var momentum = Number.isFinite(avgPrev) && avgPrev !== 0 ? ((avgCurr - avgPrev) / avgPrev) * 100 : null;

            revenueSignal = {
                latest: latest,
                previous: previous,
                changePct: changePct,
                momentum: momentum
            };
        }

        var activitySignal = null;
        if (activity.length) {
            var maxActivity = Math.max.apply(null, activity);
            var maxIndex = activity.indexOf(maxActivity);
            var peakDay = activityLabels[maxIndex] || "peak day";
            activitySignal = {
                max: maxActivity,
                peakDay: peakDay
            };
        }

        var retentionSignal = null;
        if (retention.length >= 2) {
            var retained = retention[0];
            var churned = retention[1];
            var total = retained + churned;
            retentionSignal = total > 0 ? (retained / total) * 100 : null;
        }

        return {
            revenue: revenueSignal,
            activity: activitySignal,
            retentionRate: retentionSignal,
            topProduct: topProduct,
            topCategory: topCategory,
            productCount: products.length
        };
    }

    function answerQuestion(question, context, metrics, live) {
        var q = question.toLowerCase();

        if (maybeBlockByPolicy(question)) {
            return "I can read dashboard analytics and reports, but I cannot access passwords, payment credentials, or modify user login credentials.";
        }

        if (/how.*revenue|revenue\??$|my revenue/.test(q)) {
            if (live && live.revenue) {
                var direction = live.revenue.changePct >= 0 ? "increased" : "decreased";
                var pct = Math.abs(live.revenue.changePct).toFixed(1);
                var followUp = live.topProduct
                    ? " Top product by revenue is " + live.topProduct.name + " (" + formatMoney(live.topProduct.revenue) + ")."
                    : "";
                return "Your revenue " + direction + " " + pct + "% compared to the previous period (" + formatMoney(live.revenue.previous) + " -> " + formatMoney(live.revenue.latest) + "). I recommend increasing inventory for top selling products." + followUp;
            }
            return "Your revenue increased 12% compared to last month. I recommend increasing inventory for top selling products.";
        }

        if (/trend|metrics|kpi|analy(s|z)e|dashboard data/.test(q)) {
            var trendExtras = [];
            if (live && live.revenue && Number.isFinite(live.revenue.momentum)) {
                trendExtras.push("3-period revenue momentum is " + live.revenue.momentum.toFixed(1) + "%");
            }
            if (live && live.retentionRate !== null && live.retentionRate !== undefined) {
                trendExtras.push("retention is " + live.retentionRate.toFixed(1) + "%");
            }
            return "Current metrics snapshot: " + computeInsights(metrics) + ". " + (trendExtras.length ? trendExtras.join("; ") + ". " : "") + "Focus on KPIs with positive momentum and investigate any flat growth segments this week.";
        }

        if (/pricing|price strategy|discount/.test(q)) {
            if (live && live.topCategory) {
                return "Pricing strategy recommendation: keep " + live.topCategory.category + " at stable margins, test 5-8% promotional pricing on high-velocity items, and bundle low-conversion products with top performers to lift average order value.";
            }
            return "Pricing strategy recommendation: keep core products at stable margins, test 5-8% promotional pricing on high-velocity items, and bundle low-conversion products with top performers to lift average order value.";
        }

        if (/predict|forecast|demand/.test(q)) {
            var demandDetail = live && live.activity ? "Peak engagement is on " + live.activity.peakDay + ", so align inventory and campaigns before that window. " : "";
            return "Demand insight: " + demandDetail + "Prioritize inventory for categories with sustained positive growth and set reorder alerts for top-selling SKUs. A short weekly forecast window will reduce stockouts while controlling overstock risk.";
        }

        if (/improve|business improvement|optimi(s|z)e/.test(q)) {
            return "Business improvement plan: 1) expand stock on top-revenue lines, 2) optimize pricing experiments on underperformers, 3) review visitor-to-order conversion weekly to tighten funnel performance.";
        }

        if (/feature|what can you do|help/.test(q)) {
            return "I can answer dashboard questions, suggest business improvements, analyze trend metrics, recommend pricing strategies, predict demand insights, help navigate the website, and explain CART-EL features.";
        }

        if (/navigate|go to|open/.test(q)) {
            if (q.includes("pricing")) {
                return "Open Pricing here: pricing.html";
            }
            if (q.includes("features")) {
                return "Open Features here: features.html";
            }
            if (q.includes("dashboard")) {
                return "Open Dashboard here: dashboard.html";
            }
            if (q.includes("about")) {
                return "Open About here: about.html";
            }
            return "Navigation quick links: index.html, features.html, pricing.html, about.html, dashboard.html.";
        }

        if (/top product|best product|top sku|highest revenue product/.test(q)) {
            if (live && live.topProduct) {
                return "Top product by revenue is " + live.topProduct.name + " in " + live.topProduct.category + " with " + formatMoney(live.topProduct.revenue) + " revenue and " + live.topProduct.sold + " sold.";
            }
            return "I need visible product table rows to identify the top product.";
        }

        if (/retention|churn/.test(q)) {
            if (live && live.retentionRate !== null && live.retentionRate !== undefined) {
                var churnRate = (100 - live.retentionRate).toFixed(1);
                return "Current retention rate is " + live.retentionRate.toFixed(1) + "% and churn is " + churnRate + "%. I recommend targeted win-back campaigns for at-risk segments.";
            }
            return "Retention data is not available on this page.";
        }

        var revenueSignal = extractRevenueSignal(metrics);
        if (context.isDashboard && revenueSignal) {
            return "From your dashboard, " + revenueSignal.label + " is " + revenueSignal.value + " with change " + (revenueSignal.changeRaw || "N/A") + ". I recommend allocating more budget to channels driving the strongest conversion momentum.";
        }

        return "Mr X is ready. Ask about revenue, trends, pricing strategy, demand forecasting, feature guidance, or page navigation.";
    }

    function wireAssistant(root) {
        var panel = $("#mrxPanel", root);
        var toggle = $("#mrxToggle", root);
        var close = $("#mrxClose", root);
        var input = $("#mrxInput", root);
        var send = $("#mrxSend", root);
        var voice = $("#mrxVoice", root);
        var messages = $("#mrxMessages", root);
        var context = detectContext();
        var history = readHistory();

        function saveAndRender(role, text) {
            history.push({ role: role, text: text, ts: Date.now() });
            writeHistory(history);
            addMessage(messages, role, text);
        }

        function openPanel() {
            panel.classList.add("mrx-open");
            localStorage.setItem(OPEN_KEY, "1");
            setTimeout(function () { input.focus(); }, 80);
        }

        function closePanel() {
            panel.classList.remove("mrx-open");
            localStorage.setItem(OPEN_KEY, "0");
        }

        function sendQuestion() {
            var q = input.value.trim();
            if (!q) return;

            input.value = "";
            saveAndRender("user", q);

            var liveSignals = getLiveSignals();
            var refreshedMetrics = collectDashboardMetrics();
            var response = answerQuestion(q, context, refreshedMetrics, liveSignals);
            setTimeout(function () {
                saveAndRender("bot", response);
            }, 260);
        }

        toggle.addEventListener("click", function () {
            panel.classList.contains("mrx-open") ? closePanel() : openPanel();
        });

        close.addEventListener("click", closePanel);
        send.addEventListener("click", sendQuestion);

        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                sendQuestion();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closePanel();
            }
        });

        var supportsSpeech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
        if (!supportsSpeech) {
            voice.disabled = true;
            voice.title = "Voice input not supported in this browser";
        } else {
            var SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
            var recognition = new SpeechAPI();
            recognition.lang = "en-US";
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            voice.addEventListener("click", function () {
                recognition.start();
            });

            recognition.onstart = function () {
                voice.classList.add("mrx-listening");
            };

            recognition.onend = function () {
                voice.classList.remove("mrx-listening");
            };

            recognition.onresult = function (event) {
                var spoken = event.results && event.results[0] && event.results[0][0]
                    ? event.results[0][0].transcript
                    : "";

                if (spoken) {
                    input.value = spoken;
                    sendQuestion();
                }
            };
        }

        if (!history.length) {
            saveAndRender("bot", "I am Mr X - CART-EL Super Intelligence Assistant. I can analyze dashboard metrics, suggest improvements, recommend pricing strategy, forecast demand, and help you navigate the website.");
        } else {
            history.forEach(function (item) {
                addMessage(messages, item.role, item.text);
            });
        }

        if (localStorage.getItem(OPEN_KEY) === "1") {
            openPanel();
        }
    }

    function injectMrX() {
        if (document.getElementById("mrxAiRoot")) {
            return;
        }

        // Remove previous assistant implementations to avoid duplicate floating widgets.
        var legacyAssistant = document.getElementById("aiAssistant");
        if (legacyAssistant) {
            legacyAssistant.remove();
        }

        var wrapper = document.createElement("div");
        wrapper.innerHTML = buildMarkup();
        document.body.appendChild(wrapper.firstElementChild);
        wireAssistant(document.body);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", injectMrX);
    } else {
        injectMrX();
    }
})();
