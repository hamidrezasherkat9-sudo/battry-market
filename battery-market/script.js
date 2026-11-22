
document.addEventListener("DOMContentLoaded", () => {
    // عناصر اصلی
    const menuBtn = document.getElementById("menuBtn");
    const mainNav = document.getElementById("mainNav");

    const searchBtn = document.getElementById("searchBtn");
    const searchPanel = document.getElementById("searchPanel");
    const searchInput = document.getElementById("searchInput");
    const closeSearch = document.getElementById("closeSearch");

    const cartBtn = document.getElementById("cartBtn");
    const cartDrawer = document.getElementById("cartDrawer");
    const cartBackdrop = document.getElementById("cartBackdrop");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartCount = document.getElementById("cartCount");
    const closeCart = document.querySelector(".cart-close");
    const checkoutBtn = document.getElementById("checkoutBtn");

    const toast = document.getElementById("toast");

    // داده‌های سبد خرید
    let cart = [];

    // نمایش پیام
    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }

    // منوی موبایل
    if (menuBtn && mainNav) {
        menuBtn.addEventListener("click", () => {
            mainNav.classList.toggle("active");
            menuBtn.classList.toggle("active");
        });

        mainNav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mainNav.classList.remove("active");
                menuBtn.classList.remove("active");
            });
        });
    }

    // باز و بسته کردن جست‌وجو
    if (searchBtn && searchPanel) {
        searchBtn.addEventListener("click", () => {
            searchPanel.classList.toggle("active");

            if (searchPanel.classList.contains("active") && searchInput) {
                searchInput.focus();
            }
        });
    }

    if (closeSearch && searchPanel) {
        closeSearch.addEventListener("click", () => {
            searchPanel.classList.remove("active");
        });
    }

    // جست‌وجوی محصولات
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const value = searchInput.value.trim().toLowerCase();

            document.querySelectorAll(".product-card").forEach(card => {
                const name = (
                    card.dataset.name ||
                    card.dataset.product ||
                    card.textContent
                ).toLowerCase();

                card.style.display = name.includes(value) ? "" : "none";
            });
        });
    }

    // فیلتر محصولات
    function filterProducts(category) {
        document.querySelectorAll(".product-card").forEach(card => {
            const cardCategory = card.dataset.category;

            card.style.display =
                category === "all" || cardCategory === category
                    ? ""
                    : "none";
        });
    }

    document.querySelectorAll(".product-filter").forEach(button => {
        button.addEventListener("click", () => {
            const category =
                button.dataset.category ||
                button.dataset.filter ||
                "all";

            document.querySelectorAll(".product-filter").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            filterProducts(category);
        });
    });

    // کلیک روی دسته‌بندی‌ها
    document.querySelectorAll(".category-card").forEach(card => {
        card.addEventListener("click", () => {
            const category = card.dataset.category;

            if (category) {
                filterProducts(category);

                document.querySelectorAll(".product-filter").forEach(item => {
                    const itemCategory =
                        item.dataset.category ||
                        item.dataset.filter;

                    item.classList.toggle(
                        "active",
                        itemCategory === category
                    );
                });

                document.getElementById("products")?.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    });

    // باز و بسته کردن سبد خرید
    function openCart() {
        cartDrawer?.classList.add("active");
        cartBackdrop?.classList.add("active");
        document.body.classList.add("cart-open");
    }

    function closeCartDrawer() {
        cartDrawer?.classList.remove("active");
        cartBackdrop?.classList.remove("active");
        document.body.classList.remove("cart-open");
    }

    cartBtn?.addEventListener("click", openCart);
    closeCart?.addEventListener("click", closeCartDrawer);
    cartBackdrop?.addEventListener("click", closeCartDrawer);

    // فرمت قیمت
    function formatPrice(price) {
        return Number(price).toLocaleString("fa-IR") + " تومان";
    }

    // به‌روزرسانی سبد خرید
    function updateCart() {
        if (!cartItems || !cartTotal || !cartCount) return;

        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        cartCount.textContent = totalCount;
        cartTotal.textContent = formatPrice(totalPrice);

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <span>🛒</span>
                    <h3>سبد خرید شما خالی است</h3>
                    <p>هنوز محصولی به سبد خرید اضافه نکرده‌اید.</p>
                </div>
            `;
            return;
        }

        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${formatPrice(item.price)}</p>
                    <div class="cart-quantity">
                        <button class="quantity-plus" data-id="${item.id}" aria-label="افزایش تعداد">+</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-minus" data-id="${item.id}" aria-label="کاهش تعداد">−</button>
                    </div>
                </div>
                <button class="remove-cart-item" data-id="${item.id}" aria-label="حذف محصول">×</button>
            </div>
        `).join("");

        cartItems.querySelectorAll(".quantity-plus").forEach(button => {
            button.addEventListener("click", () => {
                changeQuantity(button.dataset.id, 1);
            });
        });

        cartItems.querySelectorAll(".quantity-minus").forEach(button => {
            button.addEventListener("click", () => {
                changeQuantity(button.dataset.id, -1);
            });
        });

        cartItems.querySelectorAll(".remove-cart-item").forEach(button => {
            button.addEventListener("click", () => {
                removeFromCart(button.dataset.id);
            });
        });
    }

    // تغییر تعداد محصول
    function changeQuantity(id, amount) {
        const item = cart.find(product => product.id === id);
        if (!item) return;

        item.quantity += amount;

        if (item.quantity <= 0) {
            cart = cart.filter(product => product.id !== id);
        }

        updateCart();
    }

    // حذف محصول
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCart();
        showToast("محصول از سبد خرید حذف شد");
    }

    // افزودن محصول به سبد خرید
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".product-card");
            if (!card) return;

            const name =
                card.dataset.name ||
                card.dataset.product ||
                card.querySelector("h3")?.textContent.trim() ||
                "محصول";

            const price = Number(
                String(card.dataset.price || "0").replace(/[^\d]/g, "")
            );

            if (!price) {
                showToast("قیمت این محصول مشخص نشده است");
                return;
            }

            const id = card.dataset.product || name;
            const existingItem = cart.find(item => item.id === id);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    id,
                    name,
                    price,
                    quantity: 1
                });
            }

            updateCart();
            showToast(name + " به سبد خرید اضافه شد");

            button.classList.add("added");
            setTimeout(() => button.classList.remove("added"), 500);
        });
    });

    // انتخاب خودرو
    const carBrand = document.getElementById("carBrand");
    const carModel = document.getElementById("carModel");
    const carYear = document.getElementById("carYear");
    const findBattery = document.getElementById("findBattery");
    const finderMessage = document.getElementById("finderMessage");

    if (findBattery) {
        findBattery.addEventListener("click", () => {
            const brand = carBrand?.value;
            const model = carModel?.value;
            const year = carYear?.value;

            if (!brand || !model || !year) {
                if (finderMessage) {
                    finderMessage.textContent =
                        "لطفاً برند، مدل و سال تولید خودرو را انتخاب کنید.";
                }
                return;
            }

            if (finderMessage) {
                finderMessage.textContent =
                    `خودروی ${brand} ${model} مدل ${year} انتخاب شد. برای انتخاب باتری مناسب، مشخصات فنی خودرو باید بررسی شود.`;
            }

            document.getElementById("products")?.scrollIntoView({
                behavior: "smooth"
            });
        });
    }

    // دکمه ثبت سفارش نمایشی
    checkoutBtn?.addEventListener("click", () => {
        if (cart.length === 0) {
            showToast("سبد خرید شما خالی است");
            return;
        }

        showToast("این نسخه نمایشی است؛ ثبت سفارش آنلاین هنوز فعال نیست.");
    });

    // مقدار اولیه سبد خرید
    updateCart();
});
