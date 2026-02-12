document.addEventListener('DOMContentLoaded', function () {
    var revenueValue = 145230;
    var ordersValue = 1429;
    var visitorsValue = 12234;
    var conversionValue = 8.2;

    var revenueEl = document.getElementById('kpiRevenue');
    var ordersEl = document.getElementById('kpiOrders');
    var visitorsEl = document.getElementById('kpiVisitors');
    var conversionEl = document.getElementById('kpiConversion');

    var deltaRevenue = document.getElementById('deltaRevenue');
    var deltaOrders = document.getElementById('deltaOrders');
    var deltaVisitors = document.getElementById('deltaVisitors');
    var deltaConversion = document.getElementById('deltaConversion');

    var revenueData = [78000, 86000, 94000, 102000, 115000, 126000, 137000, 145230];
    var activityData = [780, 940, 1120, 1260, 1390, 1170, 980];
    var retentionData = [86, 14];

    var revenueChart = new Chart(document.getElementById('revenueChartDemo'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            datasets: [{
                label: 'Revenue',
                data: revenueData,
                borderColor: '#60a5fa',
                backgroundColor: 'rgba(59, 130, 246, 0.16)',
                fill: true,
                tension: 0.35,
                borderWidth: 2.5,
                pointRadius: 3
            }]
        },
        options: commonChartOptions(true)
    });

    var activityChart = new Chart(document.getElementById('activityChartDemo'), {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Active Customers',
                data: activityData,
                borderRadius: 8,
                backgroundColor: '#3b82f6'
            }]
        },
        options: commonChartOptions(false)
    });

    var retentionChart = new Chart(document.getElementById('retentionChartDemo'), {
        type: 'doughnut',
        data: {
            labels: ['Retained', 'Churned'],
            datasets: [{
                data: retentionData,
                backgroundColor: ['#22c55e', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#d7e5ff'
                    }
                }
            },
            cutout: '68%'
        }
    });

    setInterval(function () {
        var revenueChange = randomInt(1100, 4200);
        var ordersChange = randomInt(4, 18);
        var visitorsChange = randomInt(-120, 190);
        var conversionChange = (Math.random() - 0.45) * 0.25;

        revenueValue += revenueChange;
        ordersValue += ordersChange;
        visitorsValue = Math.max(8000, visitorsValue + visitorsChange);
        conversionValue = Math.min(11.9, Math.max(6.4, conversionValue + conversionChange));

        revenueEl.textContent = 'Rs ' + revenueValue.toLocaleString('en-IN');
        ordersEl.textContent = ordersValue.toLocaleString('en-IN');
        visitorsEl.textContent = visitorsValue.toLocaleString('en-IN');
        conversionEl.textContent = conversionValue.toFixed(1) + '%';

        setDelta(deltaRevenue, ((revenueChange / Math.max(revenueValue - revenueChange, 1)) * 100));
        setDelta(deltaOrders, ((ordersChange / Math.max(ordersValue - ordersChange, 1)) * 100));
        setDelta(deltaVisitors, ((visitorsChange / Math.max(visitorsValue - visitorsChange, 1)) * 100));
        setDelta(deltaConversion, conversionChange);

        revenueData.shift();
        revenueData.push(revenueValue);
        activityData = activityData.map(function (v) {
            return Math.max(650, v + randomInt(-90, 120));
        });

        retentionData[0] = clamp(retentionData[0] + randomInt(-1, 1), 79, 92);
        retentionData[1] = 100 - retentionData[0];

        revenueChart.data.datasets[0].data = revenueData;
        revenueChart.update();

        activityChart.data.datasets[0].data = activityData;
        activityChart.update();

        retentionChart.data.datasets[0].data = retentionData;
        retentionChart.update();
    }, 5000);

    initMrXDemo();
    initReveals();
    initRipples();

    function initMrXDemo() {
        var fab = document.getElementById('mrxFab');
        var panel = document.getElementById('mrxPanelDemo');
        var close = document.getElementById('mrxCloseDemo');
        var chat = document.getElementById('mrxChat');
        var input = document.getElementById('mrxInputDemo');
        var send = document.getElementById('mrxSendDemo');

        var quickResponses = {
            'show revenue insights': function () {
                return 'Revenue trend is strongly upward. Live daily revenue now at Rs ' + revenueValue.toLocaleString('en-IN') + '. Recommendation: increase stock depth for top two categories and maintain premium pricing on high-conversion SKUs.';
            },
            'predict next month sales': function () {
                var projected = Math.round(revenueValue * 1.11);
                return 'Projected next month sales estimate: Rs ' + projected.toLocaleString('en-IN') + '. This forecast assumes current conversion stability and 8-10% visitor growth.';
            },
            'best selling product?': function () {
                return 'Best selling product in this simulation is Analytics Pro Suite. It leads in both unit velocity and margin contribution.';
            }
        };

        fab.addEventListener('click', function () {
            panel.classList.toggle('show');
        });

        close.addEventListener('click', function () {
            panel.classList.remove('show');
        });

        document.querySelectorAll('.quick-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var q = btn.textContent.trim().toLowerCase();
                addChat('user', btn.textContent.trim());
                setTimeout(function () {
                    addChat('bot', quickResponses[q] ? quickResponses[q]() : genericResponse(q));
                }, 240);
            });
        });

        send.addEventListener('click', submit);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') submit();
        });

        function submit() {
            var text = input.value.trim();
            if (!text) return;
            input.value = '';
            addChat('user', text);
            setTimeout(function () {
                addChat('bot', quickResponses[text.toLowerCase()] ? quickResponses[text.toLowerCase()]() : genericResponse(text));
            }, 250);
        }

        function addChat(role, text) {
            var msg = document.createElement('div');
            msg.className = 'mrx-msg ' + role;
            msg.textContent = text;
            chat.appendChild(msg);
            chat.scrollTop = chat.scrollHeight;
        }

        function genericResponse(query) {
            if (/revenue|orders|conversion|visitors/.test(query.toLowerCase())) {
                return 'Current live metrics: Revenue Rs ' + revenueValue.toLocaleString('en-IN') + ', Orders ' + ordersValue.toLocaleString('en-IN') + ', Visitors ' + visitorsValue.toLocaleString('en-IN') + ', Conversion ' + conversionValue.toFixed(1) + '%. I recommend optimizing campaign bids on high-intent segments.';
            }
            return 'Demo insight: CART-EL combines real-time analytics, AI forecasting, and action-ready recommendations to improve retail performance faster.';
        }
    }

    function commonChartOptions(withCurrencyTicks) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 700
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#d7e5ff'
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(140, 181, 255, 0.18)'
                    },
                    ticks: {
                        color: '#b4c8ea',
                        callback: function (value) {
                            return withCurrencyTicks ? 'Rs ' + value.toLocaleString('en-IN') : value;
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(140, 181, 255, 0.1)'
                    },
                    ticks: {
                        color: '#b4c8ea'
                    }
                }
            }
        };
    }

    function setDelta(el, value) {
        var positive = value >= 0;
        el.classList.toggle('positive', positive);
        el.textContent = (positive ? '+' : '') + value.toFixed(1) + '%';
    }

    function initReveals() {
        var revealEls = document.querySelectorAll('.reveal');
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealEls.forEach(function (el) {
            io.observe(el);
        });
    }

    function initRipples() {
        document.querySelectorAll('.ripple-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var rect = btn.getBoundingClientRect();
                btn.style.setProperty('--ripple-x', (e.clientX - rect.left) + 'px');
                btn.style.setProperty('--ripple-y', (e.clientY - rect.top) + 'px');
                btn.classList.remove('ripple');
                void btn.offsetWidth;
                btn.classList.add('ripple');
            });
        });
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }
});
