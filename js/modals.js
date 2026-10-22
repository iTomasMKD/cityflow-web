let activeSpotForModal = null;

function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

function openRentalModal(spotId) {
    activeSpotForModal = spotsData.find(s => s.id === spotId);
    document.getElementById("rental-spot-title").textContent = activeSpotForModal.title;
    document.getElementById("rental-total-price").textContent = `$${activeSpotForModal.rental_price * 2}.00`;
    openModal("rental-modal");
}

function openTicketModal(spotId) {
    activeSpotForModal = spotsData.find(s => s.id === spotId);
    document.getElementById("ticket-spot-title").textContent = activeSpotForModal.title;
    document.getElementById("ticket-total-price").textContent = `$${activeSpotForModal.ticket_price || 15}.00`;
    document.getElementById("ticket-form-step").style.display = "block";
    document.getElementById("ticket-qr-step").style.display = "none";

    document.getElementById("generate-pass-btn").onclick = () => {
        document.getElementById("ticket-form-step").style.display = "none";
        document.getElementById("ticket-qr-step").style.display = "block";
        document.getElementById("qrcode").innerHTML = "";
        new QRCode(document.getElementById("qrcode"), { text: `CITYFLOW-PASS-${Date.now()}`, width: 128, height: 128 });
    };

    document.getElementById("done-ticket-btn").onclick = () => closeModal("ticket-modal");
    openModal("ticket-modal");
}
