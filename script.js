document.addEventListener('DOMContentLoaded', function() {
    // الحصول على عناصر النموذج والحاوية
    const recommendationForm = document.getElementById('recommendationForm');
    const recommendationsContainer = document.querySelector('.recommendations-container');

    // وظيفة لإنشاء بطاقة توصية جديدة
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

    // الاستماع لحدث إرسال النموذج
    recommendationForm.addEventListener('submit', function(event) {
        event.preventDefault(); // منع السلوك الافتراضي للنموذج (إعادة تحميل الصفحة)

        // الحصول على قيم المدخلات
        const name = document.getElementById('recommender-name').value;
        const title = document.getElementById('recommender-title-org').value;
        const text = document.getElementById('recommendation-text').value;

        // التحقق من أن حقول الاسم والنص ليست فارغة
        if (name.trim() === '' || text.trim() === '') {
            alert('Please fill in your name and recommendation text.');
            return; // إيقاف الوظيفة إذا كانت الحقول فارغة
        }

        // إنشاء بطاقة توصية جديدة
        const newRecommendationCard = createRecommendationCard(name, title, text);

        // إضافة البطاقة الجديدة إلى حاوية التوصيات (المهمة 7)
        recommendationsContainer.appendChild(newRecommendationCard);

        // مسح حقول النموذج بعد الإرسال
        recommendationForm.reset();

        // عرض رسالة التأكيد (المهمة 9)
        alert('Thank you for your recommendation! It has been added successfully.');
    });
});
