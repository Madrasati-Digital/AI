// 1. إعدادات Firebase الخاصة بك (تم دمجها الآن)
const firebaseConfig = {
  apiKey: "AIzaSyDHUK8CG8FcJ-GJfvoP0NkosPfd1iFHugw", // تأكد أن هذه هي قيمتك الحقيقية من Firebase
  authDomain: "my-personal-project-25.firebaseapp.com", // تأكد أن هذه هي قيمتك الحقيقية من Firebase
  projectId: "my-personal-project-25", // تأكد أن هذه هي قيمتك الحقيقية من Firebase
  storageBucket: "my-personal-project-25.firebasestorage.app", // تأكد أن هذه هي قيمتك الحقيقية من Firebase
  messagingSenderId: "121788883138", // تأكد أن هذه هي قيمتك الحقيقية من Firebase
  appId: "1:121788883138:web:dcac92ffbba06a10eb9b5b", // تأكد أن هذه هي قيمتك الحقيقية من Firebase
  measurementId: "G-PCF78XM5W5" // تأكد أن هذه هي قيمتك الحقيقية من Firebase
};

// 2. تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// 3. الحصول على مرجع لقاعدة بيانات Firestore
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    const recommendationForm = document.getElementById('recommendationForm');
    // **مهم:** يجب أن يكون هذا الـ div موجوداً في HTML (انظر ملاحظة HTML أدناه)
    const dynamicRecommendationsContainer = document.getElementById('dynamic-recommendations-container'); 

    // الحصول على عناصر التنبيه المخصصة (موجودة في HTML)
    const customAlert = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    const closeButton = document.querySelector('.close-button');
    const alertOkButton = document.getElementById('alert-ok-button');


    // وظيفة لإظهار التنبيه المخصص
    function showCustomAlert(message) {
        if (customAlert) { // التأكد من وجود العنصر
            alertMessage.textContent = message;
            customAlert.style.display = 'flex'; // استخدام flex لإظهاره كـ flexbox (لتوسيعه في الشاشة)
        } else {
            console.error('Custom alert element not found. Falling back to default alert.');
            alert(message); // fallback إذا لم يكن هناك تنبيه مخصص
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
            // إغلاق التنبيه بالنقر خارج مربع الرسالة
            if (event.target === customAlert) {
                hideCustomAlert();
            }
        });
    }


    // وظيفة لإنشاء بطاقة توصية جديدة
    function createRecommendationCard(name, title, text) {
        const card = document.createElement('div');
        card.classList.add('recommendation-card');

        const recommendationText = document.createElement('p');
        recommendationText.textContent = `"${text}"`;
        recommendationText.style.fontStyle = 'italic';

        const recommenderName = document.createElement('h4');
        recommenderName.textContent = name;

        const recommenderTitle = document.createElement('p');
        recommenderTitle.classList.add('recommender-title');
        recommenderTitle.textContent = title ? title : 'Anonymous';

        card.appendChild(recommendationText);
        card.appendChild(recommenderName);
        card.appendChild(recommenderTitle);

        return card;
    }

    // وظيفة لجلب التوصيات من Firestore وعرضها في الحاوية الديناميكية
    async function fetchRecommendations() {
        if (!dynamicRecommendationsContainer) {
            console.error("Error: #dynamic-recommendations-container not found. Dynamic recommendations will not display.");
            return; // إيقاف الوظيفة إذا لم يتم العثور على الحاوية
        }
        dynamicRecommendationsContainer.innerHTML = ''; // مسح المحتوى الديناميكي فقط لمنع التكرار

        try {
            // جلب التوصيات من مجموعة 'recommendations' في Firestore
            // و ترتيبها حسب الطابع الزمني (timestamp) الأحدث أولاً
            const snapshot = await db.collection('recommendations').orderBy('timestamp', 'desc').get();

            // إنشاء بطاقة لكل توصية وإضافتها للحاوية الديناميكية
            snapshot.forEach(doc => {
                const data = doc.data();
                const card = createRecommendationCard(data.name, data.title, data.text);
                dynamicRecommendationsContainer.appendChild(card);
            });
        } catch (error) {
            console.error("Error fetching recommendations: ", error);
            showCustomAlert('Failed to load recommendations. Please try again later.'); // رسالة خطأ عند الجلب
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

            recommendationForm.reset(); // مسح حقول النموذج
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
