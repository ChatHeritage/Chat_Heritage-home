document.addEventListener('DOMContentLoaded', function() {
    // SEZIONE DROPDOWN SELEZIONE LINGUA E TRADUZIONI
    const locales = ["en-GB", "it-IT"];
    const translationsURL = ""; // mettere il file translations.json nella stessa cartella di script.js

    // Funzione per ottenere la bandiera
    function getFlagSrc(countryCode) {
        return `https://flagsapi.com/${countryCode}/shiny/64.png`;
    }

    // Elementi del dropdown
    const dropdown = document.querySelector('.dropdown');
    const dropdownBtn = document.getElementById('dropdown-btn');
    const dropdownContent = document.getElementById('dropdown-content');

    // Verifica che gli elementi esistano prima di inizializzare
    if (!dropdown || !dropdownBtn || !dropdownContent) {
        console.warn('Elementi dropdown per lingua non trovati nel DOM. Sistema di traduzione non inizializzato.');
        return;
    }

    // Caricamento traduzioni dal file JSON
    async function loadTranslations(lang) {
        try {
            const response = await fetch(translationsURL);
            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }

            const translations = await response.json();
            
            // Applica le traduzioni a tutti gli elementi con data-key
            document.querySelectorAll('[data-key]').forEach(el => {
                const key = el.getAttribute('data-key');
                if (translations[lang] && translations[lang][key]) {
                    el.textContent = translations[lang][key];
                }
            });

            console.log(`Traduzioni caricate per lingua: ${lang}`);
        } catch (error) {
            console.error("Errore nel caricamento delle traduzioni:", error);
        }
    }

    // Imposta la lingua selezionata e aggiorna il dropdown
    function setSelectedLocale(locale) {
        try {
            const intlLocale = new Intl.Locale(locale);
            const langName = new Intl.DisplayNames([locale], {
                type: "language"
            }).of(intlLocale.language).toLowerCase(); // Aggiungi .toLowerCase() qui
    
            // Pulisce il contenuto del dropdown
            dropdownContent.innerHTML = "";
    
            // Crea le opzioni per le altre lingue
            locales.filter(l => l !== locale).forEach(otherLocale => {
                const otherIntlLocale = new Intl.Locale(otherLocale);
                const otherLangName = new Intl.DisplayNames([otherLocale], {
                    type: "language"
                }).of(otherIntlLocale.language).toLowerCase(); // Aggiungi .toLowerCase() anche qui
    
                const li = document.createElement("li");
                li.innerHTML = `<img src="${getFlagSrc(otherIntlLocale.region)}" alt="${otherLangName}"> ${otherLangName}`;
                
                // Event listener per il cambio lingua
                li.addEventListener("click", () => {
                    setSelectedLocale(otherLocale);
                    loadTranslations(otherIntlLocale.language);
                    sessionStorage.setItem("selectedLang", otherIntlLocale.language);
                    dropdownContent.classList.remove('show');
                });
    
                dropdownContent.appendChild(li);
            });
    
            // Aggiorna il bottone con la lingua corrente
            dropdownBtn.innerHTML = `<img src="${getFlagSrc(intlLocale.region)}" alt="${langName}"> ${langName} <span class="arrow-down"></span>`;
            
            // Carica le traduzioni per la lingua selezionata
            loadTranslations(intlLocale.language);
        } catch (error) {
            console.error("Errore nella selezione della lingua:", error);
        }
    }

    // Event listener per mostrare/nascondere il menu dropdown
    dropdownBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropdownContent.classList.toggle('show');
    });

    // Chiudi il dropdown se si clicca fuori
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            dropdownContent.classList.remove('show');
        }
    });

    // Chiudi il dropdown con il tasto ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdownContent.classList.remove('show');
        }
    });

    // Inizializzazione: carica la lingua salvata o quella predefinita
    const savedLang = sessionStorage.getItem("selectedLang");
    const initialLocale = savedLang && locales.find(l => l.startsWith(savedLang)) ? 
        locales.find(l => l.startsWith(savedLang)) : 
        "it-IT"; // Lingua predefinita

    // Salva la lingua iniziale nella sessione
    sessionStorage.setItem("selectedLang", new Intl.Locale(initialLocale).language);
    
    // Imposta la lingua iniziale
    setSelectedLocale(initialLocale);

    console.log('Sistema di traduzione inizializzato correttamente');
});