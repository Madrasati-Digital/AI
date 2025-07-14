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

    // وظيفة لجلب التوصيات من Firestore وعرضها
    async function fetchRecommendations() {
        // مسح الحاوية أولاً لمنع التكرار عند إعادة الجلب
        recommendationsContainer.innerHTML = '';

        try {
            // جلب التوصيات من مجموعة 'recommendations' في Firestore
            // و ترتيبها حسب الطابع الزمني (timestamp) الأحدث أولاً
            const snapshot = await db.collection('recommendations').orderBy('timestamp', 'desc').get();

            // إنشاء بطاقة لكل توصية وعرضها
            snapshot.forEach(doc => {
                const data = doc.data();
                const card = createRecommendationCard(data.name, data.title, data.text);
                recommendationsContainer.appendChild(card);
            });
        } catch (error) {
            console.error("Error fetching recommendations: ", error);
            showCustomAlert('Failed to load recommendations. Please try again later.'); // رسالة خطأ عند الجلب
        }
    }

    // الاستماع لحدث إرسال النموذج
    recommendationForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // منع السلوك الافتراضي للنموذج (إعادة تحميل الصفحة)

        // الحصول على قيم المدخلات
        const name = document.getElementById('recommender-name').value;
        const title = document.getElementById('recommender-title-org').value;
        const text = document.getElementById('recommendation-text').value;

        // التحقق من أن حقول الاسم والنص ليست فارغة
        if (name.trim() === '' || text.trim() === '') {
            showCustomAlert('Please fill in your name and recommendation text.');
            return; // إيقاف الوظيفة إذا كانت الحقول فارغة
        }

        try {
            // حفظ التوصية في Firestore
            await db.collection('recommendations').add({
                name: name,
                title: title,
                text: text,
                timestamp: firebase.firestore.FieldValue.serverTimestamp() // لتسجيل وقت الإرسال
            });

            // مسح حقول النموذج بعد الإرسال
            recommendationForm.reset();

            // إعادة جلب وعرض التوصيات لتضمين الجديدة
            await fetchRecommendations();

            showCustomAlert('Thank you for your recommendation! It has been added successfully and is now live!');

        } catch (error) {
            console.error("Error adding document: ", error);
            showCustomAlert('Failed to add recommendation. Please check your internet connection or try again later.');
        }
    });

    // جلب وعرض التوصيات عند تحميل الصفحة لأول مرة
    fetchRecommendations();
});
