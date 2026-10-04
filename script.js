// Category Selection Logic
const catCards = document.querySelectorAll('#catGrid .cat-card');
const selectedCategoryInput = document.getElementById('selectedCategory');
const summaryCat = document.getElementById('summaryCat');
const summaryServiceType = document.getElementById('summaryServiceType');

catCards.forEach(card => {
    card.addEventListener('click', () => {
        catCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        const catName = card.getAttribute('data-cat');
        const catServiceDesc = card.getAttribute('data-service');

        selectedCategoryInput.value = catName;
        summaryCat.textContent = catName;
        summaryServiceType.textContent = catServiceDesc;
    });
});

// Form Submission & WhatsApp / Formspree Integration Logic
const quoteForm = document.getElementById('quoteForm');
const successOverlay = document.getElementById('successOverlay');
const resetBtn = document.getElementById('resetBtn');

quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Gather values for WhatsApp message format
    const cat = selectedCategoryInput.value;
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const property = document.getElementById('propertyType').value;
    const details = document.getElementById('projectDetails').value;

    // 1. Submit data via fetch to Formspree for email notification backup
    const formData = new FormData(quoteForm);
    try {
        fetch(quoteForm.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'json' }
        });
    } catch (err) {
        console.log('Email submission background notice:', err);
    }

    // 2. Open WhatsApp business chat with pre-filled details 
    // (Remember to change "919811000000" below to your actual WhatsApp phone number including country code)
    const whatsappNumber = "919811000000"; 
    const whatsappMessage = `Hello DS Safety Systems,%0A%0A*New Quote Request Received:*%0A- *Category:* ${cat}%0A- *Name:* ${name}%0A- *Phone:* ${phone}%0A- *Property:* ${property}%0A- *Notes:* ${details}`;
    
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');

    // 3. Display success screen confirmation modal overlay
    successOverlay.style.display = 'flex';
});

resetBtn.addEventListener('click', () => {
    successOverlay.style.display = 'none';
    quoteForm.reset();
    catCards.forEach(c => c.classList.remove('active'));
    catCards[0].classList.add('active');
    summaryCat.textContent = "Fire Extinguishers";
    summaryServiceType.textContent = "Standard Supply & Refill";
});