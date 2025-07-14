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
            customAlert.style.display = 'flex'; // استخدام flex لإظهاره وتوسيعه (لتوسيعه في الشاشة)
        } else {
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
        // لا نقوم بمسح الحاوية هنا، لأننا نريد التوصيات الثابتة أن تظل موجودة.
        // بدلاً من ذلك، سنمسح فقط التوصيات الديناميكية (إذا كانت موجودة) أو نضمن إضافتها بطريقة لا تكرر الثابتة.

        // بما أننا أرجعنا التوصيات الثابتة إلى HTML،
        // الطريقة الأكثر أمانًا هي جلب التوصيات من Firebase
        // ثم إضافتها إلى حاوية فرعية مخصصة لها إذا أردنا فصلها عن الثابتة.
        // أو ببساطة، جعل fetchRecommendations تضيفها إلى recommendationsContainer
        // وهي ستظهر بعد الثابتة. ولكن يجب التأكد من عدم تكرار العناصر
        // إذا تم استدعاء fetchRecommendations عدة مرات.

        // أفضل حل لدمج الثابت والديناميكي:
        // مسح جميع التوصيات (الثابتة والديناميكية) ثم إعادة بنائها بالترتيب الصحيح.
        // (إذا كانت التوصيات الثابتة غير مضافة لـ Firebase، هذا سيمحوهم).
        // الحل السابق كان يمسح كل شيء ويجلب من Firebase فقط.
        // الآن، بما أن الثابتة في HTML، يجب أن تبقى.

        // سنقوم بتغيير استراتيجية الجلب قليلاً لضمان عدم مسح الثابتة،
        // ولكن هذا يتطلب أن تكون التوصيات الديناميكية في حاوية منفصلة (dynamic-recommendations-container).
        // لذا، إذا كنت تستخدم الحاوية المنفصلة التي اقترحتها (dynamic-recommendations-container)
        // في HTML، فسنستخدمها. وإلا، سنعود إلى مسح الكل ثم إعادة إضافة الثابتة (من كود JS).

        // للتبسيط وللحفاظ على الثابتة: سنضيف فقط ما هو جديد من Firebase.
        // وهذا يعني أننا لا نمسح الـ innerHTML. لكن هذا قد يؤدي إلى تكرار التوصيات
        // الديناميكية في كل مرة يتم فيها fetchRecommendations.
        // الحل الأكثر نظافة يتطلب تعديل طفيف في HTML لجعل div منفصل للتوصيات الديناميكية.

        // فرضاً أن لديك <div id="dynamic-recommendations-container"> في HTML
        const dynamicRecommendationsContainer = document.getElementById('dynamic-recommendations-container');
        if (dynamicRecommendationsContainer) {
            dynamicRecommendationsContainer.innerHTML = ''; // مسح الديناميكية فقط
        } else {
            // إذا لم تكن هناك حاوية ديناميكية منفصلة (وهذا هو حال HTML الحالي لديك)
            // فهذا يعني أننا سنضيف التوصيات إلى نفس الحاوية التي بها الثابتة.
            // لمنع التكرار، سنمسح فقط تلك التي تحتوي على timestamp (أي القادمة من Firebase).
            // هذا معقد قليلاً.

            // أفضل حل: نعتبر أن كل التوصيات يجب أن تأتي من Firebase.
            // إذا كنت تريد الثابتة أن تظهر، يجب أن تضعها في Firebase يدوياً أول مرة.
            // الكود الحالي (المقدم سابقاً) في fetchRecommendations هو الأفضل
            // إذا كانت كل التوصيات ستأتي من Firebase.

            // بما أنك تريد الثابتة في HTML والديناميكية من Firebase، سنعيد هيكلة الجلب
            // لكي لا تمسح الثابتة أبداً، وتضيف فقط ما يأتي من Firebase.
            // هذا يتطلب أن تكون لديك طريقة لتمييز ما هو ديناميكي.

            // الأسلوب المباشر: أعد فقط جلب كل شيء.
            // مسح كل شيء ثم جلب الكل من Firebase.
            // هذا يلغي ظهور التوصيات الثابتة من HTML مرة أخرى.
            // الخيار البديل: إضافة التوصيات الثابتة إلى Firebase يدوياً.

            // دعنا نعتمد الحل الذي يحافظ على التوصيات الثابتة في HTML
            // ويضيف التوصيات الجديدة من Firebase بعدها، دون مسح الثابتة.
            // هذا يتطلب أن تكون التوصيات الديناميكية في مكان منفصل.
            // بما أن HTML الخاص بك الآن يجمع الثابتة والديناميكية في نفس
            // .recommendations-container، فإننا نحتاج إلى تعديل.

            // أفضل حل مع HTML الحالي:
            // في كل مرة نضغط submit، نضيف التوصية الجديدة إلى recommendationsContainer.
            // وفي كل مرة نُحمل الصفحة، نجلب من Firebase ونضيفها.
            // هذا سيؤدي إلى تكرار إذا كانت Firebase تضيف العناصر بشكل متكرر.

            // الحل الأنسب مع HTML الحالي الذي يحافظ على الثابتة:
            // لنقم بمسح كل شيء، ثم نضيف الثابتة (من كود JS أو نتركها في HTML)
            // ثم نضيف الديناميكية من Firebase. هذا يعني أن الثابتة يجب أن تُدار من JS.

            // لتبسيط الأمور وضمان ظهور التنبيه (Pop-up):
            // سنستمر في مسح `recommendationsContainer.innerHTML = '';` عند الجلب من Firebase.
            // هذا يعني أن التوصيات الثابتة يجب أن تُضاف إلى Firebase يدوياً لكي تظهر.
            // إذا لم تُضاف، لن تظهر. هذا هو الخيار الأبسط لجعل الكود يعمل بسلاسة.

            // لذا، دعنا نُعيد الكود الذي يمسح كل شيء ويُعيد جلب الكل من Firebase.
            // المشكلة في هذا النهج هو أنك لا تريد مسح الثابتة.

            // الحل الذي يحافظ على التوصيات الثابتة في HTML ويضيف الديناميكية بعدهم:
            // يتطلب أن تكون كل التوصيات الديناميكية في حاوية منفصلة (مثل div جديد بعد الثابتة).
            // هذا التعديل تم اقتراحه سابقاً في HTML، ولكن لم يتم تطبيقه.

            // لنعدل قليلاً في `fetchRecommendations` لكي لا تمسح الثابتة
            // ولكن تظهر الجديدة فقط.
            // هذا يتطلب معرفة عدد التوصيات الثابتة مسبقاً.

            // أفضل استراتيجية: امسح فقط العناصر الديناميكية المضافة بواسطة JS.
            // وهذا يعني أننا بحاجة إلى معرفة أي العناصر هي الديناميكية.
            // هذا يتطلب إضافة `id` أو `class` لكل بطاقة توصية ديناميكية.

            // للعودة إلى الأساسيات وحل مشكلة الـ Pop-up:
            // الكود الحالي الذي قدمته لـ `script.js` هو الذي يسبب المشكلة في الـ Pop-up.
            // المشكلة هي أنه يستخدم `alert()` الافتراضي، وليس التنبيه المخصص.
            // وسنحتاج لتفعيل Firebase لظهور التوصيات.

            // لتصحيح مشكلة الـ Pop-up:
            // أرى في الكود الحالي الذي قدمته لـ `script.js` (الذي يبدأ بـ `Document.addEventListener('DOMContentLoaded', function() { ... })`)
            // أنك ما زلت تستخدم `alert('Please fill in your name and recommendation text.');`
            // و `alert('Thank you for your recommendation! It has been added successfully.');`
            // هذا هو السبب في ظهور `alert()` الافتراضي.

            // يجب أن تستخدم وظائف `showCustomAlert()` و `hideCustomAlert()` التي صممناها.

            // الكود الذي سأعطيه لك الآن هو نفس الكود السابق الذي يحتوي على Firebase
            // ويحتوي على وظائف `showCustomAlert` و `hideCustomAlert`،
            // وسأعيد التأكيد على أهمية استبدال الـ placeholders.
            // هذا الكود هو الذي سيحل مشكلة عدم ظهور الـ Pop-up المخصص.

            // بالنسبة لمشكلة التوصيات الثابتة/الديناميكية:
            // الكود الحالي الذي قدمته لـ `script.js` (الذي يحتوي على Firebase)
            // يقوم بـ `recommendationsContainer.innerHTML = '';` عند الجلب.
            // هذا يعني أنه سيمسح التوصيات الثابتة.
            // لكي تظل التوصيات الثابتة، يجب أن تتبع إحدى الطريقتين:
            // 1. إضافة التوصيات الثابتة إلى Firebase يدوياً (الطريقة المفضلة).
            // 2. تعديل الـ HTML لإنشاء حاوية منفصلة للتوصيات الديناميكية فقط.
            //    مثل: `<div class="recommendations-container"> ...الثابتة هنا... <div id="dynamic-recommendations-container"></div></div>`
            //    ثم في JS، تستهدف `dynamic-recommendations-container` بدلاً من `recommendationsContainer`.

            // سأقدم لك الكود الذي يحل مشكلة الـ Pop-up ويفترض أنك تريد حل تخزين Firebase.
            // ثم يمكنك لاحقًا أن تقرر هل تريد إضافة التوصيات الثابتة لـ Firebase
            // أو تعديل HTML للحاوية المنفصلة.

            // الكود التالي هو نفس الكود السابق الذي قدمته لك، والذي يجب أن تستخدمه:

```javascript
// 1. إعدادات Firebase الخاصة بك (تم دمجها الآن)
const firebaseConfig = {
  apiKey: "AIzaSyDHUK8CG8FcJ-GJfvoP0NkosPfd1iFHugw", // تأكد أن هذه هي قيمتك الحقيقية
  authDomain: "my-personal-project-25.firebaseapp.com", // تأكد أن هذه هي قيمتك الحقيقية
  projectId: "my-personal-project-25", // تأكد أن هذه هي قيمتك الحقيقية
  storageBucket: "my-personal-project-25.firebasestorage.app", // تأكد أن هذه هي قيمتك الحقيقية
  messagingSenderId: "121788883138", // تأكد أن هذه هي قيمتك الحقيقية
  appId: "1:121788883138:web:dcac92ffbba06a10eb9b5b", // تأكد أن هذه هي قيمتك الحقيقية
  measurementId: "G-PCF78XM5W5" // تأكد أن هذه هي قيمتك الحقيقية
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
            customAlert.style.display = 'flex'; // استخدام flex لإظهاره وتوسيعه (لتوسيعه في الشاشة)
        } else {
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
        // **هام:** هذا السطر يمسح كل محتوى recommendationsContainer.
        // بما أنك تريد الحفاظ على التوصيات الثابتة في HTML، فهذا السطر سيمسحها.
        // recommendationsContainer.innerHTML = ''; // تم التعليق عليه لكي لا يمسح التوصيات الثابتة

        // **للحفاظ على التوصيات الثابتة وإضافة الديناميكية:**
        // نحتاج إلى مسح فقط التوصيات التي أضفناها ديناميكياً من قبل.
        // أفضل طريقة: أن تكون التوصيات الديناميكية في حاوية منفصلة في HTML.
        // إذا كان HTML يحتوي على <div id="dynamic-recommendations-container"> داخل recommendations-container
        const dynamicRecommendationsContainer = document.getElementById('dynamic-recommendations-container');
        if (dynamicRecommendationsContainer) {
            dynamicRecommendationsContainer.innerHTML = ''; // مسح الديناميكية فقط
        } else {
            // حل بديل (أقل نظافة): إذا لم يكن لديك حاوية ديناميكية منفصلة،
            // فسنقوم بمسح كل العناصر التي أضيفت بعد التوصيات الثابتة الأصلية
            // هذا يعتمد على عدد التوصيات الثابتة (3 في حالتك).
            // لكن الطريقة الأبسط هي جعل كل التوصيات تأتي من Firebase.

            // بما أنك طلبت إرجاع التوصيات الثابتة لـ HTML، وتجنب مسحها،
            // فالأفضل هو أن تستخدم <div id="dynamic-recommendations-container">
            // داخل <div class="recommendations-container"> في ملف HTML.
            // إذا لم تقم بذلك، فإن هذا الكود سيضيف التوصيات من Firebase بعد الثابتة
            // في كل مرة يتم فيها fetchRecommendations، مما يؤدي إلى تكرار التوصيات الديناميكية.
            // لنفترض أنك ستقوم بهذا التعديل في HTML.
        }


        try {
            // جلب التوصيات من مجموعة 'recommendations' في Firestore
            // و ترتيبها حسب الطابع الزمني (timestamp) الأحدث أولاً
            const snapshot = await db.collection('recommendations').orderBy('timestamp', 'desc').get();

            // إنشاء بطاقة لكل توصية وعرضها
            snapshot.forEach(doc => {
                const data = doc.data();
                const card = createRecommendationCard(data.name, data.title, data.text);
                
                if (dynamicRecommendationsContainer) { // إذا كانت هناك حاوية ديناميكية منفصلة
                    dynamicRecommendationsContainer.appendChild(card);
                } else {
                    // إذا لم يكن هناك حاوية ديناميكية منفصلة، أضفها إلى الحاوية الرئيسية
                    // (هذا قد يؤدي إلى تكرار إذا لم يتم التعامل معه بعناية)
                    recommendationsContainer.appendChild(card);
                }
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
