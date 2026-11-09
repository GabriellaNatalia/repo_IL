const roleButtons = document.querySelectorAll(".role-btn");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const dashboard = document.getElementById("dashboard");
const formTitle = document.getElementById("formTitle");
const message = document.getElementById("message");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const registerUsername = document.getElementById("registerUsername");
const registerPassword = document.getElementById("registerPassword");
const confirmPassword = document.getElementById("confirmPassword");
let selectedRole = "konsumen";

const menuForm = document.getElementById("menuForm");
const addMenuBtn = document.getElementById("addMenuBtn");
const cancelMenuBtn = document.getElementById("cancelMenuBtn");
const menuList = document.getElementById("menuList");
const menuName = document.getElementById("menuName");
const menuDescription = document.getElementById("menuDescription");
const menuPrice = document.getElementById("menuPrice");
let activeRestaurant = "";

const addressPage = document.getElementById("addressPage");
const receiptPage = document.getElementById("receiptPage");
const orderBar = document.getElementById("orderBar");
const addressForm = document.getElementById("addressForm");
const deliveryAddress = document.getElementById("deliveryAddress");
const addressNote = document.getElementById("addressNote");
let selectedRestaurant = "";
let cart = {};

// Mengambil data akun yang sudah terdaftar
function getUsers() {
    try {
        const data = JSON.parse(localStorage.getItem("foodieUsers") || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

// Menampilkan pesan
function showMessage(text, success = false) {
    message.textContent = text;
    message.style.color = success ? "#16a34a" : "#dc2626";
}

// Memilih peran konsumen atau penjual atau kurir
roleButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedRole = button.dataset.role;
        roleButtons.forEach(btn => {
            btn.classList.remove("active");
        });
        button.classList.add("active");
        const roleName = {
            konsumen: "Konsumen",
            penjual: "Penjual",
            kurir: "Kurir"
        };
        formTitle.textContent = `Login ${roleName[selectedRole]}`;

        // Tampilkan alamat hanya saat mendaftar sebagai penjual
        document.getElementById("sellerAddressGroup").hidden = selectedRole !== "penjual";

        // Alamat wajib diisi hanya untuk penjual
        document.getElementById("registerRestaurantAddress").required = selectedRole === "penjual";

        showMessage("");
    });
});

// Berpindah ke formulir pendaftaran
showRegister.addEventListener("click", event => {
    event.preventDefault();
    loginForm.hidden = true;
    registerForm.hidden = false;
    showMessage("");
});

// Kembali ke formulir login
showLogin.addEventListener("click", event => {
    event.preventDefault();
    registerForm.hidden = true;
    loginForm.hidden = false;
    showMessage("");
});

// Proses pendaftaran
registerForm.addEventListener("submit", event => {
    event.preventDefault();
    const username = registerUsername.value.trim();
    const password = registerPassword.value;
    const confirmation = confirmPassword.value;
    const restaurantAddress = document.getElementById("registerRestaurantAddress").value.trim();
    if (username.length < 3) {
        showMessage("Username minimal 3 karakter.");
        return;
    }
    if (password.length < 6) {
        showMessage("Password minimal 6 karakter.");
        return;
    }
    if (password !== confirmation) {
        showMessage("Konfirmasi password tidak cocok.");
        return;
    }
    const users = getUsers();
    if (selectedRole === "penjual" && restaurantAddress.length < 10) {
        showMessage("Alamat restoran minimal 10 karakter.");
        return;
    }

    // Username harus unik untuk setiap peran
    const existingUser = users.find(user =>
        user.username.toLowerCase() === username.toLowerCase() && user.role === selectedRole
    );
    if (existingUser) {
        showMessage("Username sudah terdaftar untuk peran ini.");
        return;
    }
    const newUser = {
        username: username,
        password: password,
        role: selectedRole
    };
    if (selectedRole === "penjual") {
        newUser.restaurantAddress = restaurantAddress;
    }
    users.push(newUser);

    try {
        localStorage.setItem("foodieUsers", JSON.stringify(users));
    } catch {
        showMessage("Penyimpanan gagal. Periksa pengaturan browser.");
        return;
    }
    registerForm.reset();
    document.getElementById("sellerAddressGroup").hidden = true;
    document.getElementById("registerRestaurantAddress").required = false; 
    registerForm.hidden = true;
    loginForm.hidden = false;
    loginUsername.value = username;
    loginPassword.value = "";
    showMessage("Pendaftaran berhasil! Silakan login.", true);
});

// Proses login
loginForm.addEventListener("submit", event => {
    event.preventDefault();
    const username = loginUsername.value.trim();
    const password = loginPassword.value;
    const users = getUsers();
    const user = users.find(user =>
        user.username.toLowerCase() === username.toLowerCase() && user.password === password && user.role === selectedRole
    );

    if (!user) {
        showMessage("Username, password, atau peran tidak sesuai.");
        return;
    }

    // Menyembunyikan halaman login
    // Login berhasil
    loginForm.hidden = true;
    registerForm.hidden = true;
    document.querySelector(".role-selection").hidden = true;
    document.querySelector(".subtitle").hidden = true;
    dashboard.hidden = false;
    const isSeller = user.role === "penjual";
    const isCourier = user.role === "kurir";
    const isConsumer = user.role === "konsumen";

    // Tampilkan dashboard sesuai peran
    document.querySelector(".seller-header").hidden = !isSeller;
    document.querySelector(".seller-content").hidden = !isSeller;
    document.getElementById("consumerView").hidden = !isConsumer;
    document.getElementById("courierView").hidden = true;

    if (isSeller) {
        activeRestaurant = user.username;
        document.getElementById("welcomeTitle").textContent = `Welcome, ${user.username}!`;
        renderMenus();
        renderSellerOrders();
    } else if (isConsumer) {
        activeRestaurant = "";
        document.getElementById("consumerWelcome").textContent = `Welcome, ${user.username}!`;
        document.getElementById("restaurantPage").hidden = false;
        document.getElementById("restaurantDetail").hidden = true;
        document.getElementById("addressPage").hidden = true;
        document.getElementById("receiptPage").hidden = true;
        document.getElementById("myOrdersPage").hidden = true;
        document.getElementById("orderBar").hidden = true;
        renderRestaurants();
    } else if (isCourier) {
        activeRestaurant = "";
        document.getElementById("courierView").hidden = false;
        document.getElementById("courierWelcome").textContent = `Welcome, ${user.username}!`;
        renderCourierOrders();
    }
    showMessage("");
});

// Logout
function logout() {
    dashboard.hidden = true;
    loginForm.hidden = false;
    registerForm.hidden = true;
    document.querySelector(".role-selection").hidden = false;
    document.querySelector(".subtitle").hidden = false;
    menuForm.hidden = true;
    menuForm.reset();
    loginForm.reset();
    registerForm.reset();
    addMenuBtn.hidden = false;
    document.querySelector(".add-menu-text").hidden = false;
    document.getElementById("consumerView").hidden = true;
    document.getElementById("restaurantPage").hidden = false;
    document.getElementById("restaurantDetail").hidden = true;

    // Reset halaman pemesanan
    addressPage.hidden = true;
    receiptPage.hidden = true;
    orderBar.hidden = true;
    document.getElementById("restaurantDetail").hidden = true;
    document.getElementById("restaurantPage").hidden = false;
    cart = {};
    selectedRestaurant = "";
    activeRestaurant = "";
    showMessage("");
}

document.getElementById("logoutBtn").addEventListener("click", logout);

function getMenus() {
    try {
        const menus = JSON.parse(localStorage.getItem("foodieMenus_" + activeRestaurant.toLowerCase()) || "[]");
        return Array.isArray(menus) ? menus : [];
    } catch {
        return [];
    }
}

function renderMenus() {
    menuList.replaceChildren();
    const menus = getMenus();
    menus.forEach(menu => {
        const item = document.createElement("div");
        item.className = "menu-item";
        const title = document.createElement("h3");
        title.textContent = menu.name;
        const description = document.createElement("p");
        description.textContent = menu.description;
        const price = document.createElement("div");
        price.className = "menu-price";
        price.textContent = "Rp " + Number(menu.price).toLocaleString("id-ID");
        item.append(title, description, price);
        menuList.appendChild(item);
    });
}

/* SISTEM PESANAN */
function getOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem("foodieOrders") || "[]");
        return Array.isArray(orders) ? orders : [];
    } catch {
        return [];
    }
}

function saveOrders(orders) {
    localStorage.setItem("foodieOrders", JSON.stringify(orders));
}

/* SISTEM PESANAN KURIR */
let skippedCourierOrders = new Set();
function renderCourierOrders() {
    const container = document.getElementById("courierOrders");
    if (!container) return;
    container.replaceChildren();
    const availableOrders = getOrders().filter(order =>
        order.status === "pending" &&
        !order.courier &&
        !skippedCourierOrders.has(order.id)
    );
    if (availableOrders.length === 0) {
        const empty = document.createElement("div");
        empty.className = "courier-empty";
        empty.textContent = "Belum ada pesanan yang tersedia.";
        container.appendChild(empty);
        return;
    }

    availableOrders.forEach(order => {
        const card = document.createElement("article");
        card.className = "courier-order-card";
        const title = document.createElement("h3");
        title.textContent = `Pesanan ${order.id}`;
        const restaurant = document.createElement("p");
        restaurant.textContent = `Restoran: ${order.restaurant}`;
        const seller = getUsers().find(user =>
            user.role === "penjual" && user.username.toLowerCase() === String(order.restaurant || "").toLowerCase()
        );
        const restaurantAddress = document.createElement("p");
        restaurantAddress.textContent = `Alamat restoran: ${seller?.restaurantAddress || "Alamat restoran belum diisi."}`;
        const customerAddress = document.createElement("p");
        customerAddress.textContent = `Alamat konsumen: ${order.address || "Tidak tersedia"}`;
        const itemsTitle = document.createElement("p");
        itemsTitle.textContent = "Pesanan:";
        const itemsList = document.createElement("ul");
        (Array.isArray(order.items) ? order.items : []).forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.name} × ${item.quantity}`;
            itemsList.appendChild(li);
        });
        const skipButton = document.createElement("button");
        skipButton.type = "button";
        skipButton.className = "courier-skip-btn";
        skipButton.textContent = "Skip";
        skipButton.addEventListener("click", () => {
            skippedCourierOrders.add(order.id);
            renderCourierOrders();
        });
        const takeButton = document.createElement("button");
        takeButton.type = "button";
        takeButton.className = "courier-take-btn";
        takeButton.textContent = "Ambil Pesanan";
        takeButton.addEventListener("click", () => {
            const orders = getOrders();
            const currentOrder = orders.find(item =>
                item.id === order.id && item.status === "pending" && !item.courier
            );
            if (!currentOrder) {
                alert("Pesanan ini sudah diambil atau tidak tersedia.");
                renderCourierOrders();
                return;
            }
            const courierName = document
                .getElementById("courierWelcome")
                .textContent
                .replace(/^Welcome,\s*/, "")
                .replace(/!$/, "")
                .trim();

            currentOrder.courier = courierName;
            currentOrder.status = "accepted";
            saveOrders(orders);
            alert("Pesanan berhasil kamu ambil!");
            renderCourierOrders();
        });

        const actions = document.createElement("div");
        actions.className = "courier-order-actions";
        actions.append(skipButton, takeButton);

        card.append(
            title,
            restaurant,
            restaurantAddress,
            customerAddress,
            itemsTitle,
            itemsList,
            actions
        );
        container.appendChild(card);
    });
}

function formatRupiah(amount) {
    return "Rp " + Number(amount).toLocaleString("id-ID");
}

function renderSellerOrders() {
    const orderList = document.getElementById("sellerOrderList");
    const emptyMessage = document.getElementById("emptyOrdersMessage");
    if (!orderList || !emptyMessage || !activeRestaurant) {
        return;
    }
    orderList.replaceChildren();
    const orders = getOrders().filter(order => order.restaurant.toLowerCase() === activeRestaurant.toLowerCase());
    emptyMessage.hidden = orders.length > 0;
    orders.slice().reverse().forEach(order => {
        const card = document.createElement("article");
        card.className = "seller-order-card";
        const header = document.createElement("div");
        header.className = "order-card-header";
        const heading = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = "Pesanan " + order.customer;
        const id = document.createElement("p");
        id.className = "order-id";
        id.textContent = "ID Pesanan: " + order.id;
        heading.append(title, id);
        const status = document.createElement("span");
        status.className = "order-status";
        const statusLabels = {
            pending: "Menunggu konfirmasi",
            processing: "Diproses",
            completed: "Selesai",
            rejected: "Ditolak"
        };

        status.textContent = statusLabels[order.status] || "Tidak diketahui";

        if (order.status === "processing") {
            status.classList.add("processing");
        } else if (order.status === "completed") {
            status.classList.add("completed");
        } else if (order.status === "rejected") {
            status.classList.add("rejected");
        }

        header.append(heading, status);

        const detail = document.createElement("div");
        detail.className = "order-detail";
        const addressHeading = document.createElement("h4");
        addressHeading.textContent = "Alamat Pengiriman";
        const address = document.createElement("p");
        address.textContent = order.address;
        detail.append(header, addressHeading, address);

        if (order.note) {
            const note = document.createElement("p");
            note.textContent = "Catatan: " + order.note;
            detail.appendChild(note);
        }

        const menuHeading = document.createElement("h4");
        menuHeading.textContent = "Daftar Menu";
        const menuList = document.createElement("ul");
        order.items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.name} — ${item.quantity} porsi × ` + `${formatRupiah(item.price)} = ` + formatRupiah(item.quantity * item.price);
            menuList.appendChild(li);
        });

        detail.append(menuHeading, menuList);

        const subtotal = document.createElement("p");
        subtotal.textContent ="Total belanja: " + formatRupiah(order.subtotal);
        const delivery = document.createElement("p");
        delivery.textContent = "Ongkos kirim: " + formatRupiah(order.deliveryFee);
        const total = document.createElement("p");
        total.className = "order-total";
        total.textContent = "Total pembayaran: " + formatRupiah(order.total);

        detail.append(subtotal, delivery, total);

        const statusLabel = document.createElement("label");
        statusLabel.className = "order-status-label";
        statusLabel.textContent = "Perbarui status pesanan";
        const select = document.createElement("select");
        select.className = "order-status-select";
        select.setAttribute("aria-label", "Status pesanan");

        const options = [
            { value: "pending", label: "Menunggu konfirmasi" },
            { value: "processing", label: "Diproses" },
            { value: "completed", label: "Selesai" },
            { value: "rejected", label: "Ditolak" }
        ];

        options.forEach(optionData => {
            const option = document.createElement("option");
            option.value = optionData.value;
            option.textContent = optionData.label;
            select.appendChild(option);
        });

        select.value = order.status;

        select.addEventListener("change", () => {
            const allOrders = getOrders();
            const target = allOrders.find(item =>
                item.id === order.id && item.restaurant.toLowerCase() === activeRestaurant.toLowerCase()
            );

            if (!target) {
                alert("Pesanan tidak ditemukan.");
                renderSellerOrders();
                return;
            }

            target.status = select.value;

            try {
                saveOrders(allOrders);
                renderSellerOrders();
            } catch {
                alert("Status gagal disimpan.");
            }
        });

        card.append(detail, statusLabel, select);
        orderList.appendChild(card);
    });
}

addMenuBtn.addEventListener("click", () => {
    menuForm.hidden = false;
    addMenuBtn.hidden = true;
    document.querySelector(".add-menu-text").hidden = true;
    menuName.focus();
});

cancelMenuBtn.addEventListener("click", () => {
    menuForm.reset();
    menuForm.hidden = true;
    addMenuBtn.hidden = false;
    document.querySelector(".add-menu-text").hidden = false;
});

menuForm.addEventListener("submit", event => {
    event.preventDefault();
    const name = menuName.value.trim();
    const description = menuDescription.value.trim();
    const price = Number(menuPrice.value);
    if (!name || !description || !Number.isSafeInteger(price) || price <= 0) {
        alert("Mohon isi nama, keterangan, dan harga dengan benar.");
        return;
    }

    const menus = getMenus();

    menus.push({
        name: name,
        description: description,
        price: price
    });

    try {
        localStorage.setItem(
            "foodieMenus_" + activeRestaurant.toLowerCase(),
            JSON.stringify(menus)
        );
    } catch {
        alert("Menu gagal disimpan. Periksa penyimpanan browser.");
        return;
    }

    menuForm.reset();
    menuForm.hidden = true;
    addMenuBtn.hidden = false;
    document.querySelector(".add-menu-text").hidden = false;
    renderMenus();
});

/* HALAMAN KONSUMEN */
// Mengambil semua akun yang terdaftar sebagai penjual
function renderRestaurants() {
    const restaurantList = document.getElementById("restaurantList");
    restaurantList.replaceChildren();
    const users = getUsers();
    const restaurants = users.filter(user => user.role === "penjual");

    restaurants.forEach(restaurant => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "restaurant-card";
        const name = document.createElement("h3");
        name.textContent = restaurant.username;
        const description = document.createElement("p");
        description.textContent = "Lihat pilihan menu restoran";

        card.append(name, description);

        card.addEventListener("click", () => { 
            openRestaurant(restaurant.username);
        });
        restaurantList.appendChild(card);
    });
}

// Membuka halaman detail restoran yang dipilih
function openRestaurant(username) {
    selectedRestaurant = username;
    cart = {};
    document.getElementById("restaurantPage").hidden = true;
    document.getElementById("restaurantDetail").hidden = false;
    addressPage.hidden = true;
    receiptPage.hidden = true;
    document.getElementById("restaurantName").textContent = username;
    const consumerMenuList = document.getElementById("consumerMenuList");
    consumerMenuList.replaceChildren();
    let menus = [];
    try {
        menus = JSON.parse(
            localStorage.getItem(
                "foodieMenus_" + username.toLowerCase()
            ) || "[]"
        );

        if (!Array.isArray(menus)) {
            menus = [];
        }
    } catch {
        menus = [];
    }

    const emptyMenuMessage = document.getElementById("emptyMenuMessage");

    if (menus.length === 0) {
        emptyMenuMessage.hidden = false;
        orderBar.hidden = true;
        return;
    }

    emptyMenuMessage.hidden = true;
    orderBar.hidden = false;

    menus.forEach((menu, index) => {
        const item = document.createElement("div");
        item.className = "menu-item";
        const info = document.createElement("div");
        info.className = "menu-info";
        const name = document.createElement("h3");
        name.textContent = menu.name;
        const description = document.createElement("p");
        description.textContent = menu.description;
        const price = document.createElement("div");
        price.className = "menu-price";
        price.textContent = "Rp " + Number(menu.price).toLocaleString("id-ID");

        info.append(name, description, price);

        const action = document.createElement("div");
        action.className = "menu-action";
        const controls = document.createElement("div");
        controls.className = "quantity-control";
        const minusBtn = document.createElement("button");
        minusBtn.type = "button";
        minusBtn.className = "quantity-btn";
        minusBtn.textContent = "−";
        minusBtn.setAttribute("aria-label", "Kurangi porsi");
        const quantityNumber = document.createElement("span");
        quantityNumber.className = "quantity-number";
        quantityNumber.textContent = "0";
        const plusBtn = document.createElement("button");
        plusBtn.type = "button";
        plusBtn.className = "quantity-btn";
        plusBtn.textContent = "+";
        plusBtn.setAttribute("aria-label", "Tambah porsi");

        // Menambah jumlah porsi
        plusBtn.addEventListener("click", () => {
            const key = String(index);
            if (!cart[key]) {
                cart[key] = {name: menu.name, price: Number(menu.price), quantity: 0};
            }
            if (cart[key].quantity >= 99) {
                return;
            }
            cart[key].quantity++;
            quantityNumber.textContent = cart[key].quantity;
            updateCartSummary();
        });

        // Mengurangi jumlah porsi
        minusBtn.addEventListener("click", () => {
            const key = String(index);
            if (!cart[key] || cart[key].quantity <= 0) {
                return;
            }
            cart[key].quantity--;
            quantityNumber.textContent = cart[key].quantity;
            if (cart[key].quantity === 0) {
                delete cart[key];
            }
            updateCartSummary();
        });
        controls.append(minusBtn, quantityNumber, plusBtn);
        action.appendChild(controls);
        item.append(info, action);
        consumerMenuList.appendChild(item);
    });
    updateCartSummary();
}

function getCartSubtotal() {
    return Object.values(cart).reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
}

function updateCartSummary() {
    const totalQuantity = Object.values(cart).reduce(
        (total, item) => total + item.quantity,
        0
    );

    const subtotal = getCartSubtotal();
    document.getElementById("cartSummary").textContent = `${totalQuantity} porsi dipilih`;
    document.getElementById("cartTotal").textContent = "Rp " + subtotal.toLocaleString("id-ID");
    document.getElementById("orderBtn").disabled = totalQuantity === 0;
    document.getElementById("orderBtn").style.opacity = totalQuantity === 0 ? "0.5" : "1";
}

/* Membuka halaman alamat setelah menekan Pesan */
document.getElementById("orderBtn").addEventListener("click", () => {
    if (Object.keys(cart).length === 0) {
        alert("Pilih minimal satu menu terlebih dahulu.");
        return;
    }
    document.getElementById("restaurantDetail").hidden = true;
    orderBar.hidden = true;
    addressPage.hidden = false;
    receiptPage.hidden = true;
    addressForm.reset();
});

/* Menghitung dan menampilkan rekap pesanan */
addressForm.addEventListener("submit", event => {
    event.preventDefault();
    if (Object.keys(cart).length === 0) {
        alert("Keranjang pesanan masih kosong.");
        return;
    }
    const address = deliveryAddress.value.trim();
    const note = addressNote.value.trim();
    if (address.length < 10) {
        alert("Mohon masukkan alamat lengkap minimal 10 karakter.");
        return;
    }
    const subtotal = getCartSubtotal();
    const deliveryFee = Math.round(subtotal * 0.10);
    const grandTotal = subtotal + deliveryFee;

    // Menampilkan nama restoran
    document.getElementById("receiptRestaurant").textContent = "Restoran: " + selectedRestaurant;

    // Menampilkan daftar menu dan jumlah porsi
    const receiptItems = document.getElementById("receiptItems");
    receiptItems.replaceChildren();

    Object.values(cart).forEach(item => {
        const row = document.createElement("div");
        row.className = "receipt-item";
        const info = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = item.name;
        const quantity = document.createElement("div");
        quantity.textContent = `${item.quantity} porsi × Rp ${item.price.toLocaleString("id-ID")}`;
        info.append(name, quantity);
        const price = document.createElement("div");
        price.textContent = "Rp " + (item.price * item.quantity).toLocaleString("id-ID");
        row.append(info, price);
        receiptItems.appendChild(row);
    });

    // Menampilkan total belanja dan ongkos kirim
    document.getElementById("receiptSubtotal").textContent = "Rp " + subtotal.toLocaleString("id-ID");
    document.getElementById("receiptDelivery").textContent = "Rp " + deliveryFee.toLocaleString("id-ID");
    document.getElementById("receiptTotal").textContent = "Rp " + grandTotal.toLocaleString("id-ID");

    // Membuat data pesanan
    const order = {
        id: "LB" + Date.now(),
        restaurant: selectedRestaurant,
        customer: document.getElementById("consumerWelcome")
            .textContent.replace(/^Welcome,\s*/, "").replace(/!$/, "").trim(),
        items: Object.values(cart).map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        address: address,
        note: note,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: grandTotal,
        status: "pending",
        createdAt: new Date().toISOString()
    };

    // Menyimpan pesanan
    const orders = getOrders();
    orders.push(order);
    saveOrders(orders);
    console.log("Pesanan berhasil disimpan:", order);
    console.log("Semua pesanan:", getOrders());

    // Menampilkan alamat pengiriman
    document.getElementById("receiptAddress").textContent = address;
    document.getElementById("receiptNote").textContent = note ? "Catatan: " + note : "";

    // Berpindah ke halaman rekap
    addressPage.hidden = true;
    receiptPage.hidden = false;
    window.scrollTo(0, 0);
});

/* Kembali dari halaman alamat ke menu */
document.getElementById("backToMenu").addEventListener("click", () => {
    addressPage.hidden = true;
    receiptPage.hidden = true;
    document.getElementById("restaurantDetail").hidden = false;
    orderBar.hidden = document.getElementById("emptyMenuMessage").hidden === false;
    window.scrollTo(0, 0);
});

/* Selesai melihat rekap pesanan */
document.getElementById("finishOrderBtn").addEventListener("click", () => {
    // Kosongkan keranjang setelah pesanan tersimpan
    cart = {};
    selectedRestaurant = "";
    receiptPage.hidden = true;
    addressPage.hidden = true;
    document.getElementById("restaurantDetail").hidden = true;
    document.getElementById("restaurantPage").hidden = false;
    renderRestaurants();
    window.scrollTo(0, 0);
    alert("Pesanan berhasil diselesaikan dan disimpan!");
});

// Kembali ke daftar restoran
document.getElementById("backToRestaurants").addEventListener("click", () => {
    document.getElementById("restaurantDetail").hidden = true;
    document.getElementById("restaurantPage").hidden = false;
});

/* PESANAN SAYA */
function getCurrentCustomer() {
    return document.getElementById("consumerWelcome")
        .textContent
        .replace(/^Welcome,\s*/, "")
        .replace(/!$/, "")
        .trim();
}

function renderConsumerOrders() {
    const orderList = document.getElementById("consumerOrderList");
    const emptyMessage = document.getElementById("noConsumerOrders");
    if (!orderList || !emptyMessage) {
        return;
    }
    orderList.replaceChildren();
    const customer = getCurrentCustomer();
    const orders = getOrders().filter(order =>
        typeof order.customer === "string" && order.customer.toLowerCase() === customer.toLowerCase()).reverse();

    emptyMessage.hidden = orders.length > 0;

    const statusLabels = {
        pending: "Menunggu konfirmasi",
        processing: "Diproses",
        completed: "Selesai",
        rejected: "Ditolak"
    };

    orders.forEach(order => {
        const card = document.createElement("article");
        card.className = "consumer-order-card";
        const title = document.createElement("h3");
        title.textContent = order.restaurant;
        const id = document.createElement("p");
        id.className = "consumer-order-meta";
        id.textContent = "ID Pesanan: " + order.id;
        const date = document.createElement("p");
        date.className = "consumer-order-meta";

        if (order.createdAt) {
            const parsedDate = new Date(order.createdAt);
            if (!Number.isNaN(parsedDate.getTime())) {
                date.textContent =
                    "Tanggal: " + parsedDate.toLocaleString("id-ID");
            }
        }

        const status = document.createElement("span");
        status.className = "consumer-order-status";
        status.textContent = statusLabels[order.status] || "Status tidak diketahui";

        if (order.status === "processing") {
            status.classList.add("processing");
        } else if (order.status === "completed") {
            status.classList.add("completed");
        } else if (order.status === "rejected") {
            status.classList.add("rejected");
        }

        const items = document.createElement("ul");
        items.className = "consumer-order-items";

        (Array.isArray(order.items) ? order.items : []).forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.name} × ${item.quantity} — ` + formatRupiah(item.price * item.quantity);
            items.appendChild(li);
        });

        const total = document.createElement("p");
        total.className = "consumer-order-total";
        total.textContent = "Total pembayaran: " + formatRupiah(order.total);
        const address = document.createElement("p");
        address.className = "consumer-order-meta";
        address.textContent = "Alamat: " + order.address;
        card.append(title, id);

        if (date.textContent) {
            card.appendChild(date);
        }

        card.append(status, items, total, address);

        if (order.note) {
            const note = document.createElement("p");
            note.className = "consumer-order-meta";
            note.textContent = "Catatan: " + order.note;
            card.appendChild(note);
        }

        orderList.appendChild(card);
    });
}

/* Membuka halaman Pesanan Saya */
document.getElementById("myOrdersBtn").addEventListener("click", () => {
    document.getElementById("restaurantPage").hidden = true;
    document.getElementById("restaurantDetail").hidden = true;
    document.getElementById("addressPage").hidden = true;
    document.getElementById("receiptPage").hidden = true;
    document.getElementById("myOrdersPage").hidden = false;
    document.getElementById("orderBar").hidden = true;
    renderConsumerOrders();
    window.scrollTo(0, 0);
});

/* Kembali ke beranda konsumen */
document.getElementById("backFromOrders").addEventListener("click", () => {
    document.getElementById("myOrdersPage").hidden = true;
    document.getElementById("restaurantPage").hidden = false;
    window.scrollTo(0, 0);
});

/* Memuat status terbaru */
document.getElementById("refreshOrdersBtn").addEventListener("click", () => {
    renderConsumerOrders();
});

/* Membuka dan menutup menu Setting */
const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");
settingsBtn.addEventListener("click", () => {
    settingsMenu.hidden = !settingsMenu.hidden;
});

/* Logout untuk konsumen, penjual, dan kurir */
document.getElementById("logoutBtn").addEventListener("click", () => {
    // Tutup menu Setting
    settingsMenu.hidden = true;

    // Sembunyikan semua halaman dashboard
    document.getElementById("dashboard").hidden = true;
    document.getElementById("courierView").hidden = true;
    document.getElementById("consumerView").hidden = true;
    document.querySelector(".seller-header").hidden = true;
    document.querySelector(".seller-content").hidden = true;

    // Kembali ke halaman login
    loginForm.hidden = false;
    registerForm.hidden = true;
    document.querySelector(".role-selection").hidden = false;
    document.querySelector(".subtitle").hidden = false;

    // Bersihkan kolom login
    loginUsername.value = "";
    loginPassword.value = "";

    // Kembalikan pilihan role ke konsumen
    selectedRole = "konsumen";

    document.querySelectorAll(".role-btn").forEach(button => {
        button.classList.toggle("active", button.dataset.role === "konsumen");
    });
    formTitle.textContent = "Login Konsumen";
    showMessage("");
    window.scrollTo(0, 0);
});