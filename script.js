// 1. إعدادات Firebase الخاصة بك (تم دمجها الآن)
const firebaseConfig = {
  apiKey: "AIzaSyDHUK8CG8FcJ-GJfvoP0NkosPfd1iFHugw",
  authDomain: "my-personal-project-25.firebaseapp.com",
  projectId: "my-personal-project-25",
  storageBucket: "my-personal-project-25.firebasestorage.app",
  messagingSenderId: "121788883138",
  appId: "1:121788883138:web:dcac92ffbba06a10eb9b5b",
  measurementId: "G-PCF78XM5W5"
};

// 2. تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// 3. الحصول على مرجع لقاعدة بيانات Firestore
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    const recommendationForm = document.getElementById('recommendationForm');
    const recommendationsContainer = document.querySelector('.recommendations-container');

    // الحصول على عناصر التنبيه المخصصة (تأكد من وجودها في HTML)
    const customAlert = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    const closeButton = document.querySelector('.close-button');
    const alertOkButton = document.getElementById('alert-ok-button');


    // وظيفة لإظهار التنبيه المخصص
    function showCustomAlert(message) {
        if (customAlert) { // التأكد من وجود العنصر
            alertMessage.textContent = message;
            customAlert.style.display = 'flex'; // استخدام flex لإظهاره وتوسيعه
        } else {
            alert(message); // إذا لم يكن هناك تنبيه مخصص، استخدم تنبيه المتصفح
        }
    }

    // وظيفة لإخفاء التنبيه المخصصة
    function hideCustomAlert() {
        if (customAlert) {
            customAlert.style.display = 'none';
        }
    }

    // إضافة مستمعي الأحداث لأزرار الإغلاق والتأكيد في التنبيه المخصص
    if (closeButton) closeButton.addEventListener('click', hideCustomAlert);
    if (alertOkButton) alertOkButton.addEventListener('click', hideCustomAlert);
    if (customAlert) {
        customAlert.addEventListener('click', function(event) {
            if (event.target === customAlert) {
                hideCustomAlert();
            }
        });
    }


    // وظيفة لإنشاء بطاقة توصية جديدة (تُستخدم لعرض التوصيات من Firestore)
    function createRecommendationCard(name, title, text) {
        const card = document.createElement('div');
        card.classList.add('recommendation-card');

        const recommendationText = document.createElement('p');
        recommendationText.textContent = `"${text}"`; // إضافة علامات الاقتباس للنص
        recommendationText.style.fontStyle = 'italic'; // لجعل النص مائلاً كما في التوصيات الثابتة

        const recommenderName = document.createElement('h4');
        recommenderName.textContent = name;

        const recommenderTitle = document.createElement('p');
        recommenderTitle.classList.add('recommender-title'); // إضافة الكلاس لتنسيق العنوان
        recommenderTitle.textContent = title ? title : 'Anonymous'; // إذا لم يكن هناك منصب، يكون "مجهول"

        card.appendChild(recommendationText);
        card.appendChild(recommenderName);
        card.appendChild(recommenderTitle);

        return card;
    }

    // وظيفة لجلب التوصيات من Firestore وعرضها (معدلة)
    async function fetchRecommendations() {
        // لا نقوم بمسح الحاوية هنا
        // recommendationsContainer.innerHTML = ''; // تم إزالة هذا السطر

        // للحفاظ على ترتيب التوصيات (الثابتة والديناميكية) بشكل صحيح،
        // يجب أن نُضيف التوصيات الديناميكية بعد الثابتة.
        // أفضل طريقة هي جلب الديناميكية أولاً ثم إضافة الثابتة من HTML،
        // أو استخدام استعلام يجلب الكل ويضيفهم في مكان واحد.
        // للحفاظ على البساطة، سنُضيف الجديدة فقط بعد الموجودة.
        
        // مسح فقط التوصيات التي أضيفت ديناميكيا من قبل هذا السكربت،
        // للحفاظ على التوصيات الثابتة، نحتاج إلى طريقة لتحديدها.
        // الطريقة الأكثر أمانًا هي مسح كل شيء ثم إعادة بناء الكل بترتيب معين.
        // أو الأفضل هو إدارة جميع التوصيات (الثابتة والديناميكية) من Firebase.
        
        // للتجربة والحل السريع مع التوصيات الثابتة، يمكننا إزالة مسح innerHTML
        // ولكن هذا قد يؤدي إلى تكرار التوصيات عند كل جلب إذا لم يتم التعامل معها بحذر.
        // الأسلوب الأفضل: مسح جميع التوصيات (الثابتة والديناميكية) ثم إعادة إضافتها بالترتيب الصحيح.

        // الطريقة الأبسط للبدء: مسح كل شيء وإعادة بناءه.
        // هذا يتطلب منك إضافة التوصيات الثابتة إلى Firebase أيضاً إذا أردت رؤيتها.
        // بما أنك تريدها ثابتة في HTML وديناميكية من Firebase، سنقوم بمسح الديناميكية فقط.
        // هذا يعني أننا سنحتاج إلى عنصر حاوية منفصلة للتوصيات الديناميكية.

        // **نصيحة:** الطريقة الأكثر نظافة هي أن تكون كل التوصيات (حتى "الثابتة") مخزنة في Firebase.
        // لكن بما أنك تريدها ثابتة في HTML، دعنا نعدل النهج.

        // الطريقة المعدلة: مسح كل التوصيات التي أضفناها ديناميكيا فقط
        // هذا يتطلب أن تكون لديك حاوية منفصلة للتوصيات الديناميكية.
        // لنفترض أنك ستضيف <div> جديدًا في index.html لـ dynamic-recommendations-container
        const dynamicRecommendationsContainer = document.getElementById('dynamic-recommendations-container');
        if (dynamicRecommendationsContainer) {
            dynamicRecommendationsContainer.innerHTML = ''; // مسح الديناميكية فقط
        }
        
        try {
            const snapshot = await db.collection('recommendations').orderBy('timestamp', 'desc').get();
            snapshot.forEach(doc => {
                const data = doc.data();
                const card = createRecommendationCard(data.name, data.title, data.text);
                // إضافة إلى الحاوية الديناميكية
                if (dynamicRecommendationsContainer) {
                    dynamicRecommendationsContainer.appendChild(card);
                } else {
                    // إذا لم تكن هناك حاوية ديناميكية منفصلة، أضفها إلى الحاوية الرئيسية
                    recommendationsContainer.appendChild(card);
                }
            });
        } catch (error) {
            console.error("Error fetching recommendations: ", error);
            showCustomAlert('Failed to load dynamic recommendations. Please try again later.');
        }
    }

    // الاستماع لحدث إرسال النموذج
    recommendationForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = document.getElementById('recommender-name').value;
        const title = document.getElementById('recommender-title-org').value;
        const text = document.getElementById('recommendation-text').value;

        if (name.trim() === '' || text.trim() === '') {
            showCustomAlert('Please fill in your name and recommendation text.');
            return;
        }

        try {
            await db.collection('recommendations').add({
                name: name,
                title: title,
                text: text,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            recommendationForm.reset();
            await fetchRecommendations(); // إعادة جلب وعرض التوصيات الديناميكية

            showCustomAlert('Thank you for your recommendation! It has been added successfully and is now live!');

        } catch (error) {
            console.error("Error adding document: ", error);
            showCustomAlert('Failed to add recommendation. Please check your internet connection or try again later.');
        }
    });

    // جلب وعرض التوصيات الديناميكية عند تحميل الصفحة لأول مرة
    fetchRecommendations();
});
