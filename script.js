// 1. إعدادات Firebase الخاصة بك (استبدل بالمعلومات الحقيقية التي نسختها من لوحة تحكم Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyDHUK8CG8FcJ-GJfvoP0NkosPfd1iFHugw", // تأكد من أن هذا المفتاح صحيح تماماً
    authDomain: "my-personal-project-25.firebaseapp.com",
    projectId: "my-personal-project-25",
    storageBucket: "my-personal-project-25.firebasestorage.app",
    messagingSenderId: "121788883138",
    appId: "1:121788883138:web:dcac92ffbba06a10eb9b5b",
    // measurementId: "G-PCF78XM5W5" // measurementId ليس ضرورياً لـ firestore، يمكن إزالته
};

// 2. تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// 3. الحصول على مرجع لقاعدة بيانات Firestore
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    // استخدم recommendationsContainer مباشرة، لا داعي لـ dynamic-recommendations-container إضافي
    const recommendationsContainer = document.querySelector('.recommendations-container'); 
    const recommendationForm = document.getElementById('recommendationForm');
    
    // الحصول على عناصر التنبيه المخصصة
    const customAlert = document.getElementById('custom-alert'); 
    const alertMessage = document.getElementById('alert-message');
    const closeButton = document.querySelector('#custom-alert .close-button'); 
    const alertOkButton = document.getElementById('alert-ok-button');

    // وظيفة لإظهار التنبيه المخصص
    function showCustomAlert(message) {
        // تأكد من أن customAlert و alertMessage موجودان قبل محاولة الوصول إليهما
        if (customAlert && alertMessage) { 
            alertMessage.textContent = message;
            customAlert.style.display = 'flex'; // استخدم flex لإظهاره وتوسيعه
        } else {
            // هذا الجزء سيتم تنفيذه فقط إذا فشل العثور على customAlert في HTML
            console.error('Custom alert elements not found. Falling back to default alert.');
            alert(message); // إذا لم يتم العثور على التنبيه المخصص، استخدم تنبيه المتصفح الافتراضي
        }
    }

    // وظيفة لإخفاء التنبيه المخصصة
    function hideCustomAlert() {
        if (customAlert) {
            customAlert.style.display = 'none';
        }
    }

    // إضافة مستمعي الأحداث لأزرار الإغلاق والتأكيد في التنبيه المخصص
    // تأكد من وجود العناصر قبل إضافة المستمعين
    if (closeButton) closeButton.addEventListener('click', hideCustomAlert);
    if (alertOkButton) alertOkButton.addEventListener('click', hideCustomAlert);
    if (customAlert) {
        customAlert.addEventListener('click', function(event) {
            if (event.target === customAlert) { 
                hideCustomAlert(); // إغلاق عند النقر خارج المحتوى
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

    // وظيفة لجلب التوصيات من Firestore وعرضها
    async function fetchRecommendations(showErrorAlert = true) { 
        recommendationsContainer.innerHTML = ''; // مسح الحاوية أولاً لمنع التكرار عند إعادة الجلب

        try {
            const snapshot = await db.collection('recommendations').orderBy('timestamp', 'desc').get();
            if (snapshot.empty) {
                console.log("No recommendations found in Firestore.");
                // يمكنك هنا إضافة بطاقة "لا توجد توصيات حتى الآن" إذا أردت
            }
            snapshot.forEach(doc => {
                const data = doc.data();
                const card = createRecommendationCard(data.name, data.title, data.text);
                recommendationsContainer.appendChild(card);
            });
        } catch (error) {
            console.error("Error fetching recommendations: ", error);
            // رسالة خطأ أكثر تفصيلاً في console
            if (showErrorAlert) {
                showCustomAlert('Failed to load recommendations. Please check browser console for error details.');
            }
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
            await fetchRecommendations(false); // لا تظهر رسالة خطأ هنا، لأن الإضافة كانت ناجحة

            showCustomAlert('Thank you for your recommendation! It has been added successfully and is now live!');

        } catch (error) {
            console.error("Error adding document: ", error);
            showCustomAlert('Failed to add recommendation. Please check your internet connection or try again later. (Error: ' + error.message + ')');
        }
    });

    // جلب وعرض الت توصيات عند تحميل الصفحة لأول مرة
    fetchRecommendations(false); 
});
