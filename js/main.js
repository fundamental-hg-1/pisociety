document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const header = document.querySelector(".header");
    const menuSection = document.getElementById("menu");
    const filtersBar = document.getElementById("menu-filters");
    const menuContainer = document.getElementById("menu-container");
    const navToggle = document.querySelector(".navtoggle");
    const navMenu = document.querySelector(".header nav");

    function syncStickyMetrics() {
        if (!header) return;
        const headerHeight = header.getBoundingClientRect().height;
        document.documentElement.style.setProperty("--header-height", headerHeight + "px");

        if (filtersBar) {
            const filtersTop = filtersBar.getBoundingClientRect().top;
            const isStuck = Math.abs(filtersTop - headerHeight) <= 2;
            filtersBar.classList.toggle("is-stuck", isStuck);
        }
    }

    syncStickyMetrics();
    window.addEventListener("scroll", syncStickyMetrics, { passive: true });
    window.addEventListener("resize", syncStickyMetrics, { passive: true });
    window.addEventListener("load", syncStickyMetrics);

    if ("ResizeObserver" in window && header) {
        new ResizeObserver(syncStickyMetrics).observe(header);
    }

    // Mobile Navigation Toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
        navMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
        document.addEventListener("click", (e) => {
            if (navMenu.classList.contains("open") && header && !header.contains(e.target)) {
                navMenu.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    function applyCategoryFilter(filterValue, activeBtn) {
        if (!menuContainer) return;

        if (filtersBar) {
            filtersBar.querySelectorAll("button").forEach((btn) => {
                const isMatch = btn === activeBtn || btn.dataset.filter === filterValue;
                btn.classList.toggle("active", isMatch);
                btn.setAttribute("aria-selected", isMatch ? "true" : "false");
            });
        }

        const isAll = filterValue === "all";
        menuContainer.querySelectorAll(".menu-category-group").forEach((group) => {
            const show = isAll || group.dataset.categoryIndex === filterValue;
            group.hidden = !show;
        });

        if (activeBtn && activeBtn.scrollIntoView) {
            activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }

        if (menuSection) {
            const headerOffset = header ? header.getBoundingClientRect().height : 0;
            const menuTop = menuSection.getBoundingClientRect().top + window.scrollY - headerOffset;
            if (window.scrollY > menuTop + 32) {
                window.scrollTo({ top: menuTop, behavior: "smooth" });
            }
        }

        requestAnimationFrame(syncStickyMetrics);
    }

    // Render Menu Dynamically from menu-data.js
    if (menuContainer && typeof menuData !== "undefined" && Array.isArray(menuData)) {
        menuContainer.innerHTML = "";
        if (filtersBar) filtersBar.innerHTML = "";

        const validCategories = menuData.filter(
            (section) => section && typeof section.category === "string" && Array.isArray(section.items)
        );

        if (filtersBar) {
            const allBtn = document.createElement("button");
            allBtn.type = "button";
            allBtn.className = "active";
            allBtn.dataset.filter = "all";
            allBtn.setAttribute("role", "tab");
            allBtn.setAttribute("aria-selected", "true");
            allBtn.textContent = "ALL ITEMS";
            filtersBar.appendChild(allBtn);
        }

        validCategories.forEach((section, index) => {
            const catIndex = String(index);

            if (filtersBar) {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.dataset.filter = catIndex;
                btn.setAttribute("role", "tab");
                btn.setAttribute("aria-selected", "false");
                btn.textContent = section.category;
                filtersBar.appendChild(btn);
            }

            const groupEl = document.createElement("div");
            groupEl.className = "menu-category-group";
            groupEl.dataset.categoryIndex = catIndex;

            let groupHtml = `
                <div class="menu-category-header">
                    <div class="menu-category-title-row">
                        <h3>${escapeHtml(section.category)}</h3>
                        ${section.price ? `<span class="menu-category-price">${escapeHtml(section.price)}</span>` : ""}
                    </div>
                    ${section.description ? `<p class="menu-category-desc">${escapeHtml(section.description)}</p>` : ""}
                </div>
                <div class="menu-category-items">
            `;

            section.items.forEach((item) => {
                if (!item) return;
                groupHtml += `
                    <div class="menu-item">
                        ${item.number ? `<div class="menu-number">${escapeHtml(item.number)}</div>` : ""}
                        <div class="item-heading">
                            <h4>${escapeHtml(item.name)}</h4>
                            ${item.price ? `<strong>${escapeHtml(item.price)}</strong>` : ""}
                        </div>
                        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
                    </div>
                `;
            });

            groupHtml += `</div>`;
            groupEl.innerHTML = groupHtml;
            menuContainer.appendChild(groupEl);
        });

        if (filtersBar) {
            filtersBar.addEventListener("click", (e) => {
                const btn = e.target.closest("button");
                if (!btn || !btn.dataset.filter) return;
                applyCategoryFilter(btn.dataset.filter, btn);
            });
        }
    }

    // --- ORDER REDIRECT POPUP MODAL LOGIC ---
    const orderUrl = "https://order.toasttab.com/online/pi-society";
    const modal = document.getElementById("orderModal");
    const proceedBtn = document.getElementById("proceedBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    let targetRedirectUrl = orderUrl;
    let lastFocusedTrigger = null;

    const closeModal = () => {
        if (modal) modal.classList.remove("active");
        if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === "function") {
            lastFocusedTrigger.focus();
        }
    };

    document.querySelectorAll(".order-popup-trigger").forEach((trigger) => {
        trigger.addEventListener("click", (e) => {
            e.preventDefault();
            lastFocusedTrigger = trigger;
            targetRedirectUrl = trigger.getAttribute("href") || orderUrl;
            if (modal) {
                modal.classList.add("active");
                if (proceedBtn) proceedBtn.focus();
            }
        });
    });

    if (proceedBtn) {
        proceedBtn.addEventListener("click", () => {
            closeModal();
            window.open(targetRedirectUrl, "_blank", "noopener,noreferrer");
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeModal);
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal && modal.classList.contains("active")) {
            closeModal();
        }
    });
});

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
