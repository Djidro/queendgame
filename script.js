document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const productList = document.getElementById('product-list');
    const cartItems = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    const clearCartBtn = document.getElementById('clear-cart');
    const payNowBtn = document.getElementById('pay-now');
    const holdOrderBtn = document.getElementById('hold-order');
    const paymentModal = document.getElementById('payment-modal');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.querySelector('.close');
    const paymentMethods = document.querySelectorAll('.payment-method');
    const completePaymentBtn = document.getElementById('complete-payment');
    const amountTendered = document.getElementById('amount-tendered');
    const changeAmount = document.getElementById('change-amount');
    const productSearch = document.getElementById('product-search');
    const logoutBtn = document.getElementById('logout-btn');
    const loginBtn = document.getElementById('login-btn');
    
    // Sample product data (in a real app, this would come from a database)
    const products = [
        { id: 1, name: 'Laptop', price: 999.99, barcode: '123456789', stock: 10, image: 'https://via.placeholder.com/150' },
        { id: 2, name: 'Smartphone', price: 699.99, barcode: '987654321', stock: 15, image: 'https://via.placeholder.com/150' },
        { id: 3, name: 'Headphones', price: 149.99, barcode: '456789123', stock: 20, image: 'https://via.placeholder.com/150' },
        { id: 4, name: 'Keyboard', price: 59.99, barcode: '321654987', stock: 12, image: 'https://via.placeholder.com/150' },
        { id: 5, name: 'Mouse', price: 29.99, barcode: '789123456', stock: 8, image: 'https://via.placeholder.com/150' },
        { id: 6, name: 'Monitor', price: 199.99, barcode: '654987321', stock: 5, image: 'https://via.placeholder.com/150' },
        { id: 7, name: 'USB Cable', price: 9.99, barcode: '147258369', stock: 30, image: 'https://via.placeholder.com/150' },
        { id: 8, name: 'Power Bank', price: 39.99, barcode: '369258147', stock: 7, image: 'https://via.placeholder.com/150' }
    ];
    
    // Sample employee data
    const employees = [
        { id: 'admin', name: 'Admin', pin: '1234', role: 'admin' },
        { id: 'cashier1', name: 'John Doe', pin: '1111', role: 'cashier' },
        { id: 'cashier2', name: 'Jane Smith', pin: '2222', role: 'cashier' }
    ];
    
    // Current cart and app state
    let cart = [];
    let currentPaymentMethod = '';
    let currentEmployee = null;
    
    // Initialize the app
    function init() {
        renderProducts(products);
        loadCartFromLocalStorage();
        updateCartDisplay();
        showLoginModal();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Product search
        productSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const filteredProducts = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                product.barcode.includes(searchTerm)
            );
            renderProducts(filteredProducts);
        });
        
        // Cart buttons
        clearCartBtn.addEventListener('click', clearCart);
        payNowBtn.addEventListener('click', showPaymentModal);
        holdOrderBtn.addEventListener('click', holdOrder);
        
        // Payment modal
        closeModal.addEventListener('click', () => paymentModal.style.display = 'none');
        paymentMethods.forEach(method => {
            method.addEventListener('click', selectPaymentMethod);
        });
        
        // Amount tendered calculation
        amountTendered.addEventListener('input', calculateChange);
        completePaymentBtn.addEventListener('click', completePayment);
        
        // Login/logout
        logoutBtn.addEventListener('click', logout);
        loginBtn.addEventListener('click', login);
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === paymentModal) {
                paymentModal.style.display = 'none';
            }
            if (event.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }
    
    // Product rendering
    function renderProducts(productsToRender) {
        productList.innerHTML = '';
        
        productsToRender.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <p>Stock: ${product.stock}</p>
            `;
            productElement.addEventListener('click', () => addToCart(product));
            productList.appendChild(productElement);
        });
    }
    
    // Cart functionality
    function addToCart(product) {
        const existingItem = cart.find(item => item.product.id === product.id);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity++;
            } else {
                alert('Not enough stock available!');
                return;
            }
        } else {
            if (product.stock > 0) {
                cart.push({ product, quantity: 1 });
            } else {
                alert('This product is out of stock!');
                return;
            }
        }
        
        saveCartToLocalStorage();
        updateCartDisplay();
    }
    
    function updateCartDisplay() {
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty</p>';
            subtotalElement.textContent = '$0.00';
            taxElement.textContent = '$0.00';
            totalElement.textContent = '$0.00';
            return;
        }
        
        let subtotal = 0;
        
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            
            const itemTotal = item.product.price * item.quantity;
            subtotal += itemTotal;
            
            cartItemElement.innerHTML = `
                <div>
                    <h4>${item.product.name}</h4>
                    <p>$${item.product.price.toFixed(2)} × ${item.quantity}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="decrease">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase">+</button>
                    <button class="remove">×</button>
                </div>
            `;
            
            // Add event listeners to buttons
            const decreaseBtn = cartItemElement.querySelector('.decrease');
            const increaseBtn = cartItemElement.querySelector('.increase');
            const removeBtn = cartItemElement.querySelector('.remove');
            
            decreaseBtn.addEventListener('click', () => {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    cart = cart.filter(cartItem => cartItem.product.id !== item.product.id);
                }
                saveCartToLocalStorage();
                updateCartDisplay();
            });
            
            increaseBtn.addEventListener('click', () => {
                if (item.quantity < item.product.stock) {
                    item.quantity++;
                    saveCartToLocalStorage();
                    updateCartDisplay();
                } else {
                    alert('Not enough stock available!');
                }
            });
            
            removeBtn.addEventListener('click', () => {
                cart = cart.filter(cartItem => cartItem.product.id !== item.product.id);
                saveCartToLocalStorage();
                updateCartDisplay();
            });
            
            cartItems.appendChild(cartItemElement);
        });
        
        const tax = subtotal * 0.10; // 10% tax
        const total = subtotal + tax;
        
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        taxElement.textContent = `$${tax.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
    
    function clearCart() {
        if (cart.length === 0) return;
        
        if (confirm('Are you sure you want to clear the cart?')) {
            cart = [];
            saveCartToLocalStorage();
            updateCartDisplay();
        }
    }
    
    function holdOrder() {
        if (cart.length === 0) return;
        
        // In a real app, this would save the order to a database
        alert('Order held successfully!');
        clearCart();
    }
    
    // Payment functionality
    function showPaymentModal() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        paymentModal.style.display = 'block';
        currentPaymentMethod = '';
        
        // Reset payment UI
        document.querySelectorAll('.payment-details').forEach(el => {
            el.style.display = 'none';
        });
        
        paymentMethods.forEach(method => {
            method.classList.remove('active');
        });
    }
    
    function selectPaymentMethod(e) {
        currentPaymentMethod = e.target.dataset.method;
        
        // Update UI
        paymentMethods.forEach(method => {
            method.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Show appropriate payment details
        document.querySelectorAll('.payment-details').forEach(el => {
            el.style.display = 'none';
        });
        
        if (currentPaymentMethod === 'cash') {
            document.getElementById('cash-details').style.display = 'block';
            amountTendered.value = '';
            changeAmount.textContent = '$0.00';
        }
    }
    
    function calculateChange() {
        if (currentPaymentMethod !== 'cash') return;
        
        const total = parseFloat(totalElement.textContent.replace('$', ''));
        const tendered = parseFloat(amountTendered.value) || 0;
        const change = tendered - total;
        
        if (change >= 0) {
            changeAmount.textContent = `$${change.toFixed(2)}`;
        } else {
            changeAmount.textContent = 'Insufficient';
        }
    }
    
    function completePayment() {
        if (!currentPaymentMethod) {
            alert('Please select a payment method!');
            return;
        }
        
        if (currentPaymentMethod === 'cash') {
            const total = parseFloat(totalElement.textContent.replace('$', ''));
            const tendered = parseFloat(amountTendered.value) || 0;
            
            if (tendered < total) {
                alert('Amount tendered is less than the total!');
                return;
            }
        }
        
        // In a real app, this would process the payment and save the transaction
        const transaction = {
            date: new Date(),
            items: [...cart],
            subtotal: parseFloat(subtotalElement.textContent.replace('$', '')),
            tax: parseFloat(taxElement.textContent.replace('$', '')),
            total: parseFloat(totalElement.textContent.replace('$', '')),
            paymentMethod: currentPaymentMethod,
            employee: currentEmployee.name
        };
        
        // Save to local storage (in a real app, this would go to a database)
        saveTransaction(transaction);
        
        // Print receipt
        printReceipt(transaction);
        
        // Close modal and clear cart
        paymentModal.style.display = 'none';
        clearCart();
    }
    
    function saveTransaction(transaction) {
        let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    
    function printReceipt(transaction) {
        // In a real app, this would format a proper receipt and send to a printer
        let receiptText = `=== RECEIPT ===\n`;
        receiptText += `Date: ${transaction.date.toLocaleString()}\n`;
        receiptText += `Cashier: ${transaction.employee}\n\n`;
        receiptText += `ITEMS:\n`;
        
        transaction.items.forEach(item => {
            receiptText += `${item.product.name} x${item.quantity} @ $${item.product.price.toFixed(2)}\n`;
        });
        
        receiptText += `\nSubtotal: $${transaction.subtotal.toFixed(2)}\n`;
        receiptText += `Tax (10%): $${transaction.tax.toFixed(2)}\n`;
        receiptText += `TOTAL: $${transaction.total.toFixed(2)}\n\n`;
        receiptText += `Payment Method: ${transaction.paymentMethod.toUpperCase()}\n`;
        receiptText += `=== THANK YOU ===\n`;
        
        // For demo purposes, we'll just show an alert
        alert(receiptText);
        
        // In a real app, you might open this in a new window for printing
        // or send to a thermal printer
    }
    
    // Local storage functions
    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    function loadCartFromLocalStorage() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            
            // In a real app, you would verify product IDs and stock levels
        }
    }
    
    // Employee authentication
    function showLoginModal() {
        loginModal.style.display = 'block';
    }
    
    function login() {
        const employeeId = document.getElementById('employee-id').value;
        const pin = document.getElementById('employee-pin').value;
        
        const employee = employees.find(emp => emp.id === employeeId && emp.pin === pin);
        
        if (employee) {
            currentEmployee = employee;
            document.getElementById('current-employee').textContent = `Cashier: ${employee.name}`;
            loginModal.style.display = 'none';
        } else {
            alert('Invalid employee ID or PIN!');
        }
    }
    
    function logout() {
        currentEmployee = null;
        showLoginModal();
    }
    
    // Offline functionality check
    window.addEventListener('online', () => {
        // In a real app, you would sync any offline data here
        console.log('Connection restored - syncing data...');
    });
    
    window.addEventListener('offline', () => {
        // In a real app, you would enable offline mode
        console.log('Connection lost - switching to offline mode...');
    });
    
    // Initialize the app
    init();
});