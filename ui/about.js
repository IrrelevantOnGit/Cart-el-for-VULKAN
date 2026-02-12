document.addEventListener("DOMContentLoaded", function () {
    var animated = document.querySelectorAll(".fade-in, .fade-in-up");

    if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(
            function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        animated.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        animated.forEach(function (el) {
            el.classList.add("visible");
        });
    }

    var sectionLinks = document.querySelectorAll('.section-nav a[href^="#"]');
    sectionLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            var targetId = this.getAttribute("href");
            var targetEl = document.querySelector(targetId);

            if (!targetEl) {
                return;
            }

            event.preventDefault();
            targetEl.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
            history.replaceState(null, "", targetId);
        });
    });
});
