(function(){
    const key = "lang";
    const btn = document.getElementById("langToggle");
    if(!btn) return;

    let lang = (localStorage.getItem(key) || (navigator.language||"ro").slice(0,2)).toLowerCase();
    lang = (lang === "en") ? "en" : "ro";
    btn.dataset.lang = lang;

    function setLang(next){
        localStorage.setItem(key, next);
        btn.dataset.lang = next;
        if(typeof applyLang === "function"){ applyLang(next); }
        else { document.documentElement.setAttribute("lang", next); }
    }

    btn.addEventListener("click", () => setLang(btn.dataset.lang === "ro" ? "en" : "ro"));

    btn.addEventListener("keydown", (e)=>{
        if(e.key === " " || e.key === "Enter"){ e.preventDefault(); btn.click(); }
    });
})();