const spaces = [
    {id:"executive",name:"Salle Executive",type:"meeting",label:"Réunion",capacity:12,price:25000,image:"meeting-premium.jpg",desc:"Une salle élégante pour vos décisions et réunions stratégiques.",features:["Écran 4K","Wi-Fi","Climatisation"]},
    {id:"conference",name:"Grand Forum",type:"event",label:"Conférence",capacity:50,price:45000,image:"conference.jpg",desc:"Un espace modulable pour conférences, séminaires et présentations.",features:["Projecteur","Sonorisation","50 places"]},
    {id:"coworking",name:"Open Cowork",type:"coworking",label:"Coworking",capacity:16,price:15000,image:"coworking.jpg",desc:"Un environnement lumineux pour travailler seul ou en équipe.",features:["Wi-Fi","Bureaux","Prises"]},
    {id:"boardroom",name:"Boardroom",type:"meeting",label:"Réunion",capacity:14,price:30000,image:"boardroom.jpg",desc:"Une salle premium dédiée aux réunions confidentielles.",features:["Écran","Table centrale","Café"]},
    {id:"training",name:"Lab Formation",type:"training",label:"Formation",capacity:25,price:35000,image:"training-room.jpg",desc:"Une salle équipée pour formations, ateliers et présentations.",features:["Projecteur","Tableaux","25 places"]},
    {id:"event",name:"Grand Salon",type:"event",label:"Événement",capacity:80,price:55000,image:"event-hall.jpg",desc:"Un grand espace flexible pour vos événements professionnels.",features:["Scène","Éclairage","80 places"]},
    {id:"workplace",name:"Work Lounge",type:"coworking",label:"Coworking",capacity:20,price:18000,image:"open-space.jpg",desc:"Des postes de travail dans un cadre confortable et professionnel.",features:["Bureaux","Éclairage","Wi-Fi"]},
    {id:"dining",name:"Business Dining",type:"event",label:"Réception",capacity:30,price:40000,image:"dining-room.jpg",desc:"Une salle chaleureuse pour déjeuners d'affaires et réceptions.",features:["Service","30 places","Écran"]}
];

const money = n => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
const today = new Date();
const isoToday = new Date(today.getTime() - today.getTimezoneOffset()*60000).toISOString().split("T")[0];

const spacesGrid = document.getElementById("spacesGrid");
const spaceSelect = document.getElementById("spaceSelect");
const bookingDate = document.getElementById("bookingDate");
const bookingForm = document.getElementById("bookingForm");
const successModal = document.getElementById("successModal");

bookingDate.min = isoToday;
document.getElementById("quickDate").min = isoToday;
bookingDate.value = isoToday;
document.getElementById("quickDate").value = isoToday;

function renderSpaces(filter="all"){
    spacesGrid.innerHTML = spaces
        .filter(s => filter === "all" || s.type === filter)
        .map(s => `
        <article class="space-card reveal visible">
            <div class="space-image">
                <img src="${s.image}" alt="${s.name}" loading="lazy">
                <span class="badge">${s.label}</span>
            </div>
            <div class="space-body">
                <h3>${s.name}</h3>
                <p>${s.desc}</p>
                <div class="space-meta">
                    <span>👥 ${s.capacity} personnes</span>
                    <span>✓ ${s.features[0]}</span>
                    <span>❄ Climatisé</span>
                </div>
                <div class="space-footer">
                    <div class="price"><strong>${money(s.price)}</strong><span> / créneau</span></div>
                    <button class="book-card-btn" data-book="${s.id}">Réserver</button>
                </div>
            </div>
        </article>`).join("");
}
renderSpaces();

spaceSelect.innerHTML = spaces.map(s => `<option value="${s.id}">${s.name} — ${money(s.price)}</option>`).join("");

function updateTotal(){
    const selected = spaces.find(s => s.id === spaceSelect.value) || spaces[0];
    const options = [...document.querySelectorAll('.check-card input:checked')]
        .reduce((sum, el) => sum + Number(el.dataset.price || 0), 0);
    document.getElementById("basePrice").textContent = money(selected.price);
    document.getElementById("optionsPrice").textContent = money(options);
    document.getElementById("totalPrice").textContent = money(selected.price + options);
}
updateTotal();

document.addEventListener("click", e => {
    const book = e.target.closest("[data-book]");
    if(book){
        spaceSelect.value = book.dataset.book;
        updateTotal();
        document.getElementById("reservation").scrollIntoView({behavior:"smooth"});
        setTimeout(() => document.getElementById("clientName").focus(), 700);
    }
    const scroll = e.target.closest("[data-scroll]");
    if(scroll){
        document.querySelector(scroll.dataset.scroll)?.scrollIntoView({behavior:"smooth"});
    }
});

document.querySelectorAll(".filter").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderSpaces(btn.dataset.filter);
    });
});

spaceSelect.addEventListener("change", updateTotal);
document.querySelectorAll('.check-card input').forEach(c => c.addEventListener("change", updateTotal));

document.getElementById("quickSearch").addEventListener("click", () => {
    const type = document.getElementById("quickType").value;
    const date = document.getElementById("quickDate").value;
    if(date) bookingDate.value = date;
    document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b.dataset.filter === type));
    renderSpaces(type);
    document.getElementById("espaces").scrollIntoView({behavior:"smooth"});
    showToast(type === "all" ? "Tous les espaces affichés." : "Espaces filtrés selon votre recherche.");
});

bookingForm.addEventListener("submit", e => {
    e.preventDefault();
    const selected = spaces.find(s => s.id === spaceSelect.value);
    const optionNames = [...document.querySelectorAll('.check-card input:checked')].map(i => i.parentElement.querySelector("span").firstChild.textContent.trim());
    const optionsTotal = [...document.querySelectorAll('.check-card input:checked')].reduce((a,i)=>a+Number(i.dataset.price||0),0);
    const reservation = {
        id: "ML-" + Math.random().toString(36).slice(2,8).toUpperCase(),
        space: selected.name,
        date: bookingDate.value,
        time: document.getElementById("bookingTime").value,
        guests: document.getElementById("guests").value,
        name: document.getElementById("clientName").value,
        email: document.getElementById("clientEmail").value,
        phone: document.getElementById("clientPhone").value,
        options: optionNames,
        total: selected.price + optionsTotal,
        createdAt: new Date().toISOString()
    };
    const list = JSON.parse(localStorage.getItem("mlReservations") || "[]");
    list.unshift(reservation);
    localStorage.setItem("mlReservations", JSON.stringify(list));
    document.getElementById("successText").textContent = `Merci ${reservation.name}. Votre demande pour ${reservation.space} a bien été enregistrée.`;
    document.getElementById("confirmationDetails").innerHTML = `
        <div><strong>Référence :</strong> ${reservation.id}</div>
        <div><strong>Date :</strong> ${formatDate(reservation.date)}</div>
        <div><strong>Créneau :</strong> ${reservation.time} — ${nextTime(reservation.time)}</div>
        <div><strong>Participants :</strong> ${reservation.guests}</div>
        <div><strong>Total :</strong> ${money(reservation.total)}</div>`;
    successModal.classList.add("open");
    successModal.setAttribute("aria-hidden","false");
    bookingForm.reset();
    bookingDate.value = isoToday;
    updateTotal();
});

function nextTime(start){
    const [h,m] = start.split(":").map(Number);
    const end = new Date(2000,0,1,h,m);
    end.setMinutes(end.getMinutes()+120);
    return String(end.getHours()).padStart(2,"0")+":"+String(end.getMinutes()).padStart(2,"0");
}
function formatDate(v){
    return new Date(v+"T12:00:00").toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"});
}
function showToast(message){
    const t=document.getElementById("toast");
    t.textContent=message;t.classList.add("show");
    clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),3000);
}

document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", ()=>{
    successModal.classList.remove("open");
    successModal.setAttribute("aria-hidden","true");
}));

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", ()=>{
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
});
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click",()=>mainNav.classList.remove("open")));

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}
    });
},{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

document.getElementById("year").textContent = new Date().getFullYear();
