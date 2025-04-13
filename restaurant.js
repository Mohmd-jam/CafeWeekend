// Load menu data from JSON
document.addEventListener('DOMContentLoaded', function () {
    let cart = []; // Moved cart to global scope within the DOMContentLoaded

    fetch('restraurant.json')
        .then(response => response.json())
        .then(data => {
            renderFilters(data.filters);
            renderMenu(data.categories);
            setupEventListeners();
            setupCartFunctionality();
        })
        .catch(error => console.error('Error loading menu:', error));

    function renderFilters(filters) {
        const filterContainer = document.getElementById('filterContainer');
        filterContainer.innerHTML = '';

        filters.forEach(filter => {
            const filterChip = document.createElement('button');
            filterChip.className = `filter-chip ${filter.default ? 'active' : ''} ${filter.highlight ? 'highlight' : ''}`;
            filterChip.dataset.category = filter.id;
            filterChip.textContent = filter.name;
            filterContainer.appendChild(filterChip);
        });
    }

    function renderMenu(categories) {
        const menuContainer = document.getElementById('menuContainer');
        menuContainer.innerHTML = '';

        categories.forEach(category => {
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';
            categorySection.dataset.category = category.id;

            categorySection.innerHTML = `
                <div class="category-header">
                    <div class="category-title">${category.name}</div>
                    <div class="category-icon"><i class="${category.icon}"></i></div>
                </div>
                <div class="menu-items">
                    ${category.items.map(item => `
                        <div class="menu-item" data-tags="${item.tags.join(' ')}" ${item.highlight ? 'data-highlight="true"' : ''} ${item.variants ? `data-variants='${JSON.stringify(item.variants)}'` : ''}>
                            <img src="${item.image}" alt="${item.name}" class="item-image">
                            <div class="item-details">
                                <div class="item-header">
                                    <div class="item-title">${item.name}</div>
                                    <div class="item-price">${item.price}</div>
                                </div>
                                <div class="item-desc">${item.description}</div>
                                <div class="item-footer">
                                    <div class="item-tags">
                                        ${item.tags.map(tag => `
                                            <span class="item-tag ${tag === 'پیشنهاد ویژه' ? 'highlight' : ''}">${tag}</span>
                                        `).join('')}
                                    </div>
                                    <div class="item-actions">
                                        ${item.variants ? `
                                            <button class="action-btn show-variants"><i class="fas fa-list"></i></button>
                                        ` : `
                                            <button class="action-btn add-to-cart"><i class="fas fa-plus"></i></button>
                                        `}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            menuContainer.appendChild(categorySection);
        });
    }

    function setupEventListeners() {
        // Filter functionality with precise smooth scroll
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', function () {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                this.classList.add('active');

                const category = this.dataset.category;
                const targetSection = document.querySelector(`.category-section[data-category="${category}"]`);

                if (targetSection) {
                    const headerHeight = document.querySelector('header')?.offsetHeight || 60;
                    const sectionPosition = targetSection.offsetTop - headerHeight - 60;

                    document.documentElement.style.scrollBehavior = 'smooth';
                    window.scrollTo({
                        top: sectionPosition,
                        behavior: 'smooth'
                    });

                    setTimeout(() => {
                        document.documentElement.style.scrollBehavior = 'auto';
                    }, 1000);
                }
            });
        });

        // Intersection Observer for auto-detecting visible sections
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const categoryId = entry.target.dataset.category;
                    const correspondingFilter = document.querySelector(`.filter-chip[data-category="${categoryId}"]`);

                    if (correspondingFilter && !correspondingFilter.classList.contains('active')) {
                        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                        correspondingFilter.classList.add('active');
                    }
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '-80px 0px -40% 0px'
        });

        document.querySelectorAll('.category-section').forEach(section => {
            observer.observe(section);
        });

        document.documentElement.style.scrollBehavior = 'auto';
    }

    function setupCartFunctionality() {
        function updateCart() {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('cartBadge').textContent = totalItems;

            const cartItems = document.getElementById('cartItems');
            cartItems.innerHTML = '';

            let total = 0;

            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                    </div>
                    <div class="cart-item-price">${itemTotal.toLocaleString()} تومان</div>
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                cartItems.appendChild(cartItem);
            });

            document.getElementById('totalPrice').textContent = `جمع کل: ${total.toLocaleString()} تومان`;

            document.querySelectorAll('.quantity-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const index = parseInt(this.dataset.index);
                    if (this.classList.contains('plus')) {
                        cart[index].quantity += 1;
                    } else {
                        if (cart[index].quantity > 1) {
                            cart[index].quantity -= 1;
                        } else {
                            if (confirm('آیا می‌خواهید این آیتم را حذف کنید؟')) {
                                cart.splice(index, 1);
                            }
                        }
                    }
                    updateCart();
                });
            });

            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', function () {
                    const index = parseInt(this.dataset.index);
                    if (confirm('آیا می‌خواهید این آیتم را حذف کنید؟')) {
                        cart.splice(index, 1);
                        updateCart();
                    }
                });
            });
        }

        document.addEventListener('click', function (e) {
            if (e.target.closest('.add-to-cart')) {
                const menuItem = e.target.closest('.menu-item');
                const itemName = menuItem.querySelector('.item-title').textContent;
                const itemPrice = parseInt(menuItem.querySelector('.item-price').textContent.replace(/,/g, '').replace(' تومان', ''));

                const existingIndex = cart.findIndex(item => item.name === itemName);
                if (existingIndex !== -1) {
                    cart[existingIndex].quantity += 1;
                } else {
                    cart.push({
                        name: itemName,
                        price: itemPrice,
                        quantity: 1
                    });
                }

                updateCart();

                const toast = document.createElement('div');
                toast.className = 'toast-message';
                toast.textContent = `${itemName} به سبد خرید اضافه شد`;
                document.body.appendChild(toast);

                setTimeout(() => {
                    toast.classList.add('show');
                    setTimeout(() => {
                        toast.classList.remove('show');
                        setTimeout(() => {
                            toast.remove();
                        }, 300);
                    }, 2000);
                }, 10);
            }
        });

        // Variant selection functionality
        let currentItem = null;

        document.addEventListener('click', function (e) {
            if (e.target.closest('.show-variants')) {
                const menuItem = e.target.closest('.menu-item');
                const itemName = menuItem.querySelector('.item-title').textContent;
                const variants = JSON.parse(menuItem.dataset.variants || '[]');

                currentItem = {
                    element: menuItem,
                    name: itemName,
                    variants: variants
                };

                showVariantModal(itemName, variants);
            }
        });

        function showVariantModal(itemName, variants) {
            const modal = document.getElementById('variantModal');
            const optionsContainer = document.getElementById('variantOptions');
            const title = document.getElementById('variantTitle');

            title.textContent = `انتخاب نوع ${itemName}`;
            optionsContainer.innerHTML = '';

            variants.forEach((variant, index) => {
                const option = document.createElement('div');
                option.className = 'variant-option';
                option.dataset.index = index;
                option.innerHTML = `
                    <span>${variant.name}</span>
                    <span>${variant.price}</span>
                `;
                optionsContainer.appendChild(option);

                option.addEventListener('click', function () {
                    addVariantToCart(index);
                });
            });

            modal.style.display = 'block';
        }

        document.getElementById('closeVariant').addEventListener('click', () => {
            document.getElementById('variantModal').style.display = 'none';
        });

        document.querySelector('.variant-overlay').addEventListener('click', () => {
            document.getElementById('variantModal').style.display = 'none';
        });

        function addVariantToCart(variantIndex) {
            if (!currentItem) return;

            const variant = currentItem.variants[variantIndex];
            const itemName = `${currentItem.name} (${variant.name})`;
            const itemPrice = parseInt(variant.price.replace(/,/g, '').replace(' تومان', ''));

            const existingIndex = cart.findIndex(item => item.name === itemName);
            if (existingIndex !== -1) {
                cart[existingIndex].quantity += 1;
            } else {
                cart.push({
                    name: itemName,
                    price: itemPrice,
                    quantity: 1
                });
            }

            updateCart();
            document.getElementById('variantModal').style.display = 'none';

            // Show toast message
            const toast = document.createElement('div');
            toast.className = 'toast-message';
            toast.textContent = `${itemName} به سبد خرید اضافه شد`;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        toast.remove();
                    }, 300);
                }, 2000);
            }, 10);
        }

        document.getElementById('cartButton').addEventListener('click', () => {
            document.getElementById('cartModal').style.display = 'block';
        });

        document.getElementById('closeCart').addEventListener('click', () => {
            document.getElementById('cartModal').style.display = 'none';
        });

        document.getElementById('cartOverlay').addEventListener('click', () => {
            document.getElementById('cartModal').style.display = 'none';
        });

        document.getElementById('exportOrder').addEventListener('click', () => {
            if (cart.length === 0) {
                alert('سبد خرید شما خالی است');
                return;
            }

            const orderDetails = cart.map(item =>
                `${item.name} (${item.quantity} عدد) - ${(item.price * item.quantity).toLocaleString()} تومان`
            ).join('\n');

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const orderSummary = `سفارش شما:\n\n${orderDetails}\n\nجمع کل: ${total.toLocaleString()} تومان`;

            console.log(orderSummary);
            alert('سفارش شما با موفقیت ثبت شد');
            cart = [];
            updateCart();
            document.getElementById('cartModal').style.display = 'none';
        });
    }
});