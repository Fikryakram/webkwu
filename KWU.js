// Menunggu semua konten HTML dimuat sebelum menjalankan script
document.addEventListener('DOMContentLoaded', function() {

    // Inisialisasi keranjang belanja (menggunakan localStorage untuk persistensi)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Fungsi untuk menyimpan keranjang ke localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
    }

    // Fungsi untuk menampilkan popup unik (toast notification)
    function showToast(message) {
        // Buat elemen toast jika belum ada
        let toast = document.getElementById('custom-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'custom-toast';
            toast.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: linear-gradient(45deg, #4CAF50, #45a049);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                font-family: Arial, sans-serif;
                font-size: 16px;
                z-index: 1001;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.5s ease;
                max-width: 300px;
                word-wrap: break-word;
            `;
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';

        // Hilangkan toast setelah 3 detik
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        }, 3000);
    }

    // Fungsi untuk menambahkan produk ke keranjang
    function addToCart(productName, productPrice, quantity, imageSrc) {
        const existingItem = cart.find(item => item.name === productName);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ name: productName, price: productPrice, quantity: quantity, image: imageSrc });
        }
        saveCart();
        showToast('Anda telah menambahkan ' + quantity + ' ' + productName + ' ke keranjang!');
        updateCartDisplay();
    }

    // Fungsi untuk menghapus item dari keranjang
    function removeFromCart(index) {
        cart.splice(index, 1);
        saveCart();
        updateCartDisplay();
    }

    // Fungsi untuk menampilkan isi keranjang (dalam modal sederhana)
    function updateCartDisplay() {
        const cartModal = document.getElementById('cart-modal');
        if (!cartModal) {
            // Buat modal jika belum ada
            const modal = document.createElement('div');
            modal.id = 'cart-modal';
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: none; justify-content: center; align-items: center; z-index: 1000;';
            modal.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px; max-width: 400px; width: 90%;">
                    <h3>Keranjang Belanja</h3>
                    <div id="cart-items"></div>
                    <h3>jika sudah memilih produk, selanjutnya harap screenshoot dan hubungi kontak yang tertera di bawah website. </h3>
                    <button id="close-cart" style="margin-top: 15px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Tutup</button>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('close-cart').addEventListener('click', () => modal.style.display = 'none');
        }
        const cartItems = document.getElementById('cart-items');
        cartItems.innerHTML = '';
        let total = 0;
        if (cart.length === 0) {
            cartItems.innerHTML = '<p>Keranjang kosong.</p>';
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                const itemDiv = document.createElement('div');
                itemDiv.style.cssText = 'display: flex; align-items: center; margin-bottom: 10px;';
                itemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                    <div style="flex: 1;">
                        <p style="margin: 0; font-size: 14px;">${item.name} - Rp ${item.price} x ${item.quantity} = Rp ${itemTotal}</p>
                    </div>
                    <button onclick="removeFromCart(${index})" style="margin-left: 10px; padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 14px;">Hapus</button>
                `;
                cartItems.appendChild(itemDiv);
            });
        }
        // Tambahkan atau update total harga
        const modalContent = cartModal.querySelector('div');
        let totalDiv = modalContent.querySelector('.total-price');
        if (!totalDiv) {
            totalDiv = document.createElement('div');
            totalDiv.className = 'total-price';
            const cartItems = document.getElementById('cart-items');
            cartItems.parentNode.insertBefore(totalDiv, cartItems);
        }
        totalDiv.innerHTML = `<strong style="font-size: 18px; color: #333; margin-bottom: 10px; display: block;">Total harga: Rp ${total}</strong>`;
    }

    // Fungsi untuk scroll ke section tertentu
    function scrollToSection(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Ambil semua tombol "Beli"
    const buyButtons = document.querySelectorAll('.add-to-cart-btn');

    // Fungsi untuk menangani quantity controls
    function setupQuantityControls() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const minusBtn = card.querySelector('.minus-btn');
            const plusBtn = card.querySelector('.plus-btn');
            const qtyInput = card.querySelector('.qty-input');

            minusBtn.addEventListener('click', function() {
                let currentValue = parseInt(qtyInput.value);
                if (currentValue > 0) {
                    qtyInput.value = currentValue - 1;
                }
            });

            plusBtn.addEventListener('click', function() {
                let currentValue = parseInt(qtyInput.value);
                qtyInput.value = currentValue + 1;
            });

            qtyInput.addEventListener('change', function() {
                let currentValue = parseInt(qtyInput.value);
                if (currentValue < 0 || isNaN(currentValue)) {
                    qtyInput.value = 0;
                }
            });
        });
    }

    // Panggil fungsi setup quantity controls
    setupQuantityControls();

    // Loop setiap tombol dan tambahkan event listener
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Ambil elemen card terdekat dari tombol yang diklik
            const productCard = button.closest('.product-card');
            const quantityControls = productCard.querySelector('.quantity-controls');
            // Tampilkan popup quantity controls
            quantityControls.style.opacity = '1';
            quantityControls.style.visibility = 'visible';
        });
    });

    // Event listener untuk tombol "Tambah ke Keranjang" di popup
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart-from-popup-btn')) {
            const productCard = e.target.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = parseInt(productCard.querySelector('.price').textContent.replace('Rp ', '').replace('.', ''));
            const quantity = parseInt(productCard.querySelector('.qty-input').value);
            const imageSrc = productCard.querySelector('img').src;
            if (quantity > 0) {
                addToCart(productName, productPrice, quantity, imageSrc);
                // Sembunyikan popup setelah menambah
                const quantityControls = productCard.querySelector('.quantity-controls');
                quantityControls.style.opacity = '0';
                quantityControls.style.visibility = 'hidden';
            } else {
                showToast('Silakan pilih jumlah produk terlebih dahulu!');
            }
        }

        // Event listener untuk tombol close popup
        if (e.target.classList.contains('close-popup-btn')) {
            const productCard = e.target.closest('.product-card');
            const quantityControls = productCard.querySelector('.quantity-controls');
            quantityControls.style.opacity = '0';
            quantityControls.style.visibility = 'hidden';
        }
    });

    // Event listener untuk ikon keranjang
    const cartIcon = document.querySelector('.nav-icons span:first-child');
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            updateCartDisplay();
            document.getElementById('cart-modal').style.display = 'flex';
        });
    }

    // Event listener untuk tombol "Belanja Sekarang"
    const shopNowButton = document.querySelector('.cta-button');
    if (shopNowButton) {
        shopNowButton.addEventListener('click', function() {
            scrollToSection('.product-grid');
        });
    }

    // Event listener untuk link navigasi
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href === '#') {
                // Untuk Home, scroll ke hero
                scrollToSection('.hero');
            } else if (href.includes('Produk')) {
                scrollToSection('.product-grid');
            } else if (href.includes('Tentang')) {
                // Asumsikan ada section tentang, atau scroll ke footer
                scrollToSection('footer');
            } else if (href.includes('Kontak')) {
                scrollToSection('footer');
            }
        });
    });

    // Fungsi untuk update badge keranjang
    function updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'inline' : 'none';
        }
    }

    // Panggil updateCartBadge saat halaman dimuat
    updateCartBadge();

    // Fungsi global untuk removeFromCart (untuk digunakan dalam modal)
    window.removeFromCart = removeFromCart;
});
//<a href="#">Facebook</a> | <a href="#">Instagram</a>
//<a href="#">Produk Unggulan</a>
//<img src="banner1.png" alt="background">