const imageInput = document.getElementById("imageInput");
const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
const ownerLoginBtn = document.getElementById("ownerLoginBtn");
const loginModal = document.getElementById("loginModal");
const ownerPasswordInput = document.getElementById("ownerPasswordInput");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const loginCancelBtn = document.getElementById("loginCancelBtn");

// CHANGE THIS to your own secret password
const OWNER_PASSWORD = "changeme123";

function isOwner() {
    return sessionStorage.getItem("isOwner") === "true";
}

function updateOwnerUI() {
    if (!imageInput || !ownerLoginBtn) return;

    if (isOwner()) {
        imageInput.classList.remove("hidden");
        ownerLoginBtn.textContent = "🔓 Owner Mode (click to log out)";
    } else {
        imageInput.classList.add("hidden");
        ownerLoginBtn.textContent = "🔒 Owner Login";
    }

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.classList.toggle("hidden", !isOwner());
    });
}

function openLoginModal() {
    if (!loginModal) return;
    ownerPasswordInput.value = "";
    loginModal.classList.remove("hidden");
    loginModal.classList.add("active");
    ownerPasswordInput.focus();
}

function closeLoginModal() {
    if (!loginModal) return;
    loginModal.classList.remove("active");
    loginModal.classList.add("hidden");
}

function attemptLogin() {
    const entered = ownerPasswordInput.value;
    if (entered === OWNER_PASSWORD) {
        sessionStorage.setItem("isOwner", "true");
        closeLoginModal();
        updateOwnerUI();
        alert("Owner mode unlocked. You can now upload or delete images.");
    } else {
        alert("Incorrect password.");
        ownerPasswordInput.value = "";
        ownerPasswordInput.focus();
    }
}

if (ownerLoginBtn) {
    ownerLoginBtn.addEventListener("click", function () {
        if (isOwner()) {
            sessionStorage.removeItem("isOwner");
            updateOwnerUI();
            return;
        }
        openLoginModal();
    });
}

if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener("click", attemptLogin);
}

if (ownerPasswordInput) {
    ownerPasswordInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            attemptLogin();
        }
    });
}

if (loginCancelBtn) {
    loginCancelBtn.addEventListener("click", closeLoginModal);
}

function addImageToGallery(src, name) {
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "gallery-item";

    const img = document.createElement("img");
    img.src = src;

    img.addEventListener("click", function () {
        lightboxImg.src = src;
        lightbox.classList.add("active");
    });

    const nameEl = document.createElement("div");
    nameEl.className = "filename";
    nameEl.textContent = name;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    if (!isOwner()) {
        deleteBtn.classList.add("hidden");
    }
    deleteBtn.textContent = "🗑 Delete";
    deleteBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!isOwner()) return;
        if (confirm(`Delete "${name}"?`)) {
            imgWrapper.remove();
            saveGalleryToStorage();
        }
    });

    imgWrapper.appendChild(img);
    imgWrapper.appendChild(nameEl);
    imgWrapper.appendChild(deleteBtn);
    gallery.appendChild(imgWrapper);
}

function saveGalleryToStorage() {
    const items = Array.from(gallery.children).map(item => ({
        src: item.querySelector("img").src,
        name: item.querySelector(".filename").textContent
    }));
    localStorage.setItem("portfolioGallery", JSON.stringify(items));
}

function loadGalleryFromStorage() {
    const saved = JSON.parse(localStorage.getItem("portfolioGallery") || "[]");
    saved.forEach(item => addImageToGallery(item.src, item.name));
}

if (imageInput) {
    imageInput.addEventListener("change", function () {
        if (!isOwner()) return;

        const files = Array.from(imageInput.files);

        files.forEach(file => {
            const reader = new FileReader();

            reader.onload = function (e) {
                addImageToGallery(e.target.result, file.name);
                saveGalleryToStorage();
            };

            reader.readAsDataURL(file);
        });

        imageInput.value = "";
    });
}

if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
}
if (lightbox) {
    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

function closeLightbox() {
    lightbox.classList.remove("active");
}

updateOwnerUI();
if (gallery) {
    loadGalleryFromStorage();
}