// translations.js - يوضع في بداية ملف script.js
const translations = {
    ar: {
        // Navbar
        navHome: "الرئيسية",
        navAbout: "عني",
        navSkills: "المهارات",
        navProjects: "مشاريعي",
        navRecommendations: "توصيات",
        // ... (باقي الترجمات العربية)
        anonymousPlaceholder: "مجهول", // تأكد من وجودها
        alertFillForm: "الرجاء تعبئة اسمك ونص التوصية.",
        alertSuccessMessage: "شكراً لتوصيتك! تم إضافتها بنجاح وهي الآن متاحة!",
        alertErrorMessage: "حدث خطأ أثناء إرسال التوصية. يرجى التحقق من اتصال الإنترنت لديك أو المحاولة لاحقاً.",
        alertFailedLoad: "فشل تحميل التوصيات. الرجاء التحقق من مشغل المتصفح للحصول على تفاصيل الخطأ.",
    },
    en: {
        // Navbar
        navHome: "Home",
        navAbout: "About",
        navSkills: "Skills",
        navProjects: "Projects",
        navRecommendations: "Recommendations",
        // ... (باقي الترجمات الإنجليزية)
        anonymousPlaceholder: "Anonymous", // تأكد من وجودها
        alertFillForm: "Please fill in your name and recommendation text.",
        alertSuccessMessage: "Thank you for your recommendation! It has been added successfully and is now live!",
        alertErrorMessage: "An error occurred while submitting your recommendation. Please check your internet connection or try again later.",
        alertFailedLoad: "Failed to load recommendations. Please check browser console for error details.",
    }
};

let currentLanguage = 'ar'; // اللغة الافتراضية عند تحميل الصفحة

function applyTranslation(lang) {
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[lang] && translations[lang][key]) {
            if (element.placeholder !== undefined) {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    const body = document.body;
    body.classList.remove('lang-ar', 'lang-en');
    body.classList.add(`lang-${lang}`);

    localStorage.setItem('preferredLang', lang);
    currentLanguage = lang;

    // هذا هو الجزء الجديد الذي يتحكم في إظهار وإخفاء الأزرار
    const langArBtn = document.getElementById('lang-ar');
    const langEnBtn = document.getElementById('lang-en');

    if (langArBtn && langEnBtn) {
        if (lang === 'ar') {
            langArBtn.classList.add('hidden'); // إخفاء زر العربية
            langEnBtn.classList.remove('hidden'); // إظهار زر الإنجليزية
        } else { // lang === 'en'
            langEnBtn.classList.add('hidden'); // إخفاء زر الإنجليزية
            langArBtn.classList.remove('hidden'); // إظهار زر العربية
        }
        // إزالة فئة 'active' من كلاهما لأننا لن نستخدمها للدلالة على اللغة النشطة
        langArBtn.classList.remove('active');
        langEnBtn.classList.remove('active');
    }
}

// ... (باقي كود showCustomAlert ووظائف Firebase كما هي) ...

// بداية كود DOMContentLoaded الخاص بك:
document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('preferredLang');
    if (savedLang) {
        currentLanguage = savedLang;
    }

    applyTranslation(currentLanguage); // تطبيق اللغة المحفوظة/الافتراضية عند التحميل

    const langArBtn = document.getElementById('lang-ar');
    const langEnBtn = document.getElementById('lang-en');

    if (langArBtn && langEnBtn) {
        langArBtn.addEventListener('click', () => applyTranslation('ar'));
        langEnBtn.addEventListener('click', () => applyTranslation('en'));
    }

    // ... (باقي كود Firebase وDOMReady الخاص بك كما هو) ...

    // تأكد من وجود هذا السطر إذا كنت تستخدم anonymousPlaceholder
    if (!translations.ar.anonymousPlaceholder) translations.ar.anonymousPlaceholder = "مجهول";
    if (!translations.en.anonymousPlaceholder) translations.en.anonymousPlaceholder = "Anonymous";

    fetchRecommendations(false);
});
