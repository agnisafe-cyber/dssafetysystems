function switchView(viewName) {
    const catalog = document.getElementById('catalogView');
    const quote = document.getElementById('quoteView');
    const catalogTab = document.getElementById('catalogTabBtn');
    const quoteTab = document.getElementById('quoteTabBtn');

    if (viewName === 'catalog') {
        catalog.classList.add('active');
        quote.classList.remove('active');
        catalogTab.classList.add('active');
        quoteTab.classList.remove('active');
    } else {
        catalog.classList.remove('active');
        quote.classList.add('active');
        catalogTab.classList.remove('active');
        quoteTab.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterTag = btn.getAttribute('data-filter');
        productCards.forEach(card => {
            if (filterTag === 'all' || card.getAttribute('data-category') === filterTag) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

const cardSlideIndices = {};

function updateCardSlider(cardId) {
    const track = document.getElementById(`cardTrack-${cardId}`);
    if (!track) return;
    const idx = cardSlideIndices[cardId] || 0;
    track.style.transform = `translateX(-${idx * 33.333}%)`;
    const card = track.closest('.product-card');
    const dots = card.querySelectorAll('.dot');
    dots.forEach((d, i) => {
        if (i === idx) d.classList.add('active');
        else d.classList.remove('active');
    });
}

function moveCardSlide(event, btn, direction) {
    event.stopPropagation();
    const card = btn.closest('.product-card');
    const track = card.querySelector('.slider-track');
    const cardId = track.id.split('-')[1];
    if (!cardSlideIndices[cardId]) cardSlideIndices[cardId] = 0;
    cardSlideIndices[cardId] += direction;
    if (cardSlideIndices[cardId] > 2) cardSlideIndices[cardId] = 0;
    if (cardSlideIndices[cardId] < 0) cardSlideIndices[cardId] = 2;
    updateCardSlider(cardId);
}

function setCardSlide(event, dot, index) {
    event.stopPropagation();
    const card = dot.closest('.product-card');
    const track = card.querySelector('.slider-track');
    const cardId = track.id.split('-')[1];
    cardSlideIndices[cardId] = index;
    updateCardSlider(cardId);
}

let modalCurrentIndex = 0;

function updateModalSlider() {
    const track = document.getElementById('modalTrack');
    track.style.transform = `translateX(-${modalCurrentIndex * 33.333}%)`;
    const thumbs = document.querySelectorAll('.modal-thumb-btn');
    thumbs.forEach((t, i) => {
        if (i === modalCurrentIndex) t.classList.add('active');
        else t.classList.remove('active');
    });
}

function moveModalSlide(direction) {
    modalCurrentIndex += direction;
    if (modalCurrentIndex > 2) modalCurrentIndex = 0;
    if (modalCurrentIndex < 0) modalCurrentIndex = 2;
    updateModalSlider();
}

function setModalSlide(index) {
    modalCurrentIndex = index;
    updateModalSlider();
}

const productModal = document.getElementById('productModal');
let currentModalTitle = "";
let currentModalCat = "";

function openModal(card) {
    const title = card.getAttribute('data-title');
    const catLabel = card.getAttribute('data-cat-label');
    const purpose = card.getAttribute('data-purpose');
    const stock = card.getAttribute('data-stock');
    const desc = card.getAttribute('data-desc');
    const img1 = card.getAttribute('data-img1');
    const img2 = card.getAttribute('data-img2');
    const img3 = card.getAttribute('data-img3');
    const cap = card.getAttribute('data-spec-cap');
    const range = card.getAttribute('data-spec-range');
    const std = card.getAttribute('data-spec-std');
    const agent = card.getAttribute('data-spec-agent');

    currentModalTitle = title;
    currentModalCat = catLabel;
    modalCurrentIndex = 0;

    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalCatTag').textContent = catLabel;
    document.getElementById('modalPurpose').innerHTML = `<i class="fa-solid fa-bullseye"></i> Purpose: ${purpose}`;
    document.getElementById('modalStockBadge').innerHTML = `<i class="fa-solid fa-circle"></i> ${stock}`;
    document.getElementById('modalDesc').textContent = desc;

    document.getElementById('modalImg1').src = img1;
    document.getElementById('modalImg2').src = img2;
    document.getElementById('modalImg3').src = img3;

    document.getElementById('modalThumb1').src = img1;
    document.getElementById('modalThumb2').src = img2;
    document.getElementById('modalThumb3').src = img3;

    document.getElementById('specCapCell').textContent = cap;
    document.getElementById('specRangeCell').textContent = range;
    document.getElementById('specStdCell').textContent = std;
    document.getElementById('specAgentCell').textContent = agent;

    updateModalSlider();
    productModal.classList.add('is-open');
    productModal.style.display = 'flex';
}

function closeModal() {
    productModal.classList.remove('is-open');
    productModal.style.display = 'none';
}

productCards.forEach(card => {
    card.addEventListener('click', () => {
        openModal(card);
    });
});

const categoryOptions = document.querySelectorAll('.cat-option');
const hiddenCategoryInput = document.getElementById('hiddenCategory');
const summaryCatDisplay = document.getElementById('summaryCatDisplay');
const summaryServiceDisplay = document.getElementById('summaryServiceDisplay');

document.getElementById('modalInquireBtn').addEventListener('click', () => {
    closeModal();
    switchView('quote');

    categoryOptions.forEach(opt => {
        if (opt.getAttribute('data-category') === currentModalCat) {
            categoryOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            hiddenCategoryInput.value = currentModalCat;
            summaryCatDisplay.textContent = currentModalCat;
            summaryServiceDisplay.textContent = opt.getAttribute('data-service');
        }
    });

    document.getElementById('specsTextarea').value = `Requesting quote for: ${currentModalTitle} (Quantity: 1)`;
});

productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeModal();
});

categoryOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        categoryOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const catName = opt.getAttribute('data-category');
        const serviceDesc = opt.getAttribute('data-service');
        hiddenCategoryInput.value = catName;
        summaryCatDisplay.textContent = catName;
        summaryServiceDisplay.textContent = serviceDesc;
    });
});

const leadForm = document.getElementById('leadForm');
const successPopup = document.getElementById('successPopup');
const resetFormBtn = document.getElementById('resetFormBtn');

leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cat = hiddenCategoryInput.value;
    const name = document.getElementById('nameInput').value;
    const phone = document.getElementById('phoneInput').value;
    const property = document.getElementById('propertySelect').value;
    const details = document.getElementById('specsTextarea').value;

    const formData = new FormData(leadForm);
    try {
        fetch(leadForm.action, { method: 'POST', body: formData, headers: { 'Accept': 'json' } });
    } catch (err) {}

    const whatsappNumber = "919811000000";
    const encodedMsg = `Hello DS Safety Systems,%0A%0A*New Lead Submission:*%0A- *Category:* ${cat}%0A- *Name:* ${name}%0A- *Phone:* ${phone}%0A- *Property:* ${property}%0A- *Details:* ${details}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMsg}`, '_blank');
    successPopup.style.display = 'flex';
});

resetFormBtn.addEventListener('click', () => {
    successPopup.style.display = 'none';
    leadForm.reset();
    categoryOptions.forEach(o => o.classList.remove('active'));
    categoryOptions[0].classList.add('active');
    summaryCatDisplay.textContent = "Fire Extinguishers";
    summaryServiceDisplay.textContent = "Supply & Maintenance";
});