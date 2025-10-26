const I18N = {
    ro: {
        "logo": "Welcome to <b>GameHub</b>",
        "nav.home": "Acasă", "nav.games": "Jocuri", "nav.about": "Despre", "nav.contact": "Contact",
        "hero.title1": "Intră în", "hero.title2": "și apasă",
        "hero.desc": "O colecție de mini-jocuri rapide, perfecte pentru pauze scurte. Fără instalare, doar distracție.",
        "hero.btn1": "Vezi jocurile", "hero.btn2": "Ce este GameHub?",
        "hero.search": "Caută jocuri (ex: flappy, retro, puzzle)",
        "game1.title": "Flappy Square", "game1.desc": "Controlează pătratul și evită obstacolele verzi. Cât de departe poți ajunge?", "game1.meta": "Reflexe • Singleplayer", "game1.play": "Joacă acum",
        "game2.title": "Un nou joc", "game2.desc": "Rămâi pe aproape – adăugăm curând conținut fresh.", "game2.meta": "În curând", "game2.play": "În curând",
        "about.title": "Despre GameHub", "about.desc": "GameHub este un portal simplu pentru mini-jocuri web. Structurat pe pagini separate, fiecare joc rulează în sandbox-ul lui.", "about.tip": "Sfat: adaugă jocuri noi duplicând un card și setând linkul spre pagina jocului.",
        "footer.text": "© 2025 GameHub • Made by Darius • Mail:",
        "puzzle.title": "Puzzle","puzzle.desc": "Un puzzle clasic care îți pune la încercare atenția la detaliu și gândirea strategică. Alege nivelul potrivit și urmărește-ți timpul pentru a-ți îmbunătăți performanța.","puzzle.meta": "Logică • Atenție","puzzle.play": "Joacă acum"
    },
    en: {
        "logo": "Welcome to <b>GameHub</b>",
        "nav.home": "Home", "nav.games": "Games", "nav.about": "About", "nav.contact": "Contact",
        "hero.title1": "Enter the", "hero.title2": "and press",
        "hero.desc": "A collection of quick mini-games, perfect for short breaks. No installation, just fun.",
        "hero.btn1": "See Games", "hero.btn2": "What is GameHub?",
        "hero.search": "Search games (e.g. flappy, retro, puzzle)",
        "game1.title": "Flappy Square", "game1.desc": "Control the square and avoid the green pipes. How far can you go?", "game1.meta": "Reflexes • Singleplayer", "game1.play": "Play now",
        "game2.title": "New Game", "game2.desc": "Stay tuned – fresh content coming soon.", "game2.meta": "Coming soon", "game2.play": "Coming soon",
        "about.title": "About GameHub", "about.desc": "GameHub is a simple portal for web mini-games. Each game runs in its own sandboxed page.", "about.tip": "Tip: add new games by duplicating a card and linking to the game page.",
        "footer.text": "© 2025 GameHub • Made by Darius • Mail:",
        "puzzle.title": "Puzzle","puzzle.desc": "A classic puzzle that challenges your attention to detail and strategic thinking. Choose a difficulty level and try to improve your time.","puzzle.meta": "Logic • Focus","puzzle.play": "Play now"
    }
};

function applyLang(lang){
    const dict = I18N[lang] || I18N.ro;
    document.querySelectorAll("[data-i18n]").forEach(el=>{
        const key = el.getAttribute("data-i18n");
        if(dict[key]!==undefined) el.innerHTML = dict[key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
        const key = el.getAttribute("data-i18n-placeholder");
        if(dict[key]!==undefined) el.setAttribute("placeholder", dict[key]);
    });
    localStorage.setItem("lang", lang);
    document.getElementById("lang").value = lang;
}

(function(){
    const select=document.getElementById("lang");
    const stored=localStorage.getItem("lang");
    const browser=(navigator.language||"ro").slice(0,2).toLowerCase();
    const initial=stored||((browser==="en")?"en":"ro");
    applyLang(initial);
    select.addEventListener("change", e=>applyLang(e.target.value));
})();