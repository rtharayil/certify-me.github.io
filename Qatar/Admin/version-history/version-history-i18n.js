/* English / Arabic translations for the Version History page.
   Shares the sessionStorage key with the Competencies Management and
   Taxonomy Mapping pages so the chosen language carries across the
   whole Competency Framework flow as you move between them. */
(function () {
  var DICT = {
    adminPortal: { en: 'Administrator Portal', ar: 'بوابة المسؤول' },
    myProfile: { en: 'My Profile', ar: 'الملف الشخصي' },
    settingsLabel: { en: 'Settings', ar: 'الإعدادات' },
    signOut: { en: 'Sign Out', ar: 'تسجيل الخروج' },

    stepCompMgmtTitle: { en: 'Competency Management', ar: 'إدارة الكفاءات' },
    stepCompMgmtSub: { en: 'Create and edit competencies', ar: 'إنشاء وتعديل الكفاءات' },
    stepTaxTitle: { en: 'Taxonomy Mapping', ar: 'ربط التصنيفات' },
    stepTaxSub: { en: 'Link to global taxonomies', ar: 'الربط بالتصنيفات العالمية' },
    stepVersionTitle: { en: 'Version History', ar: 'سجل الإصدارات' },
    stepVersionSub: { en: 'View changes', ar: 'عرض التغييرات' },
    stepDiplomaTitle: { en: 'Criteria', ar: 'المعايير' },
    stepDiplomaSub: { en: 'Set criteria and requirements', ar: 'تحديد المعايير والمتطلبات' },
    stepReviewTitle: { en: 'Review &amp; Publish', ar: 'المراجعة والنشر' },
    stepReviewSub: { en: 'Finalize and publish', ar: 'الإنهاء والنشر' },

    pageTitle: { en: 'Version History', ar: 'سجل الإصدارات' },
    pageSubtitle: { en: 'Design, manage, and maintain competency frameworks and academic mappings.', ar: 'تصميم وإدارة وصيانة أطر الكفاءات والروابط الأكاديمية.' },

    sectionTitle: { en: 'Version History', ar: 'سجل الإصدارات' },
    sectionSub: { en: 'Track changes to competency definitions, taxonomy mappings, and proficiency level configurations.', ar: 'تتبّع التغييرات في تعريفات الكفاءات وروابط التصنيفات وإعدادات مستويات الإتقان.' },

    searchPlaceholder: { en: 'Search competencies...', ar: 'البحث عن الكفاءات...' },
    allDomains: { en: 'All Domains', ar: 'جميع المجالات' },
    allTaxonomies: { en: 'All Taxonomies', ar: 'جميع التصنيفات' },
    allChangeTypes: { en: 'All Change Types', ar: 'جميع أنواع التغييرات' },
    dateRange: { en: 'Date Range', ar: 'النطاق الزمني' },
    importBtn: { en: 'Import', ar: 'استيراد' },
    exportBtn: { en: 'Export', ar: 'تصدير' },

    thCompetency: { en: 'Competency', ar: 'الكفاءة' },
    thVersion: { en: 'Version', ar: 'الإصدار' },
    thChangeType: { en: 'Change Type', ar: 'نوع التغيير' },
    thHierarchyPath: { en: 'Hierarchy Path', ar: 'المسار الهرمي' },
    thTaxonomiesMapped: { en: 'Taxonomies Mapped', ar: 'التصنيفات المرتبطة' },
    thChangedBy: { en: 'Changed By', ar: 'تم التغيير بواسطة' },
    thDateTime: { en: 'Date &amp; Time', ar: 'التاريخ والوقت' },
    thActions: { en: 'Actions', ar: 'الإجراءات' },

    r1Name: { en: 'Systems Thinking', ar: 'التفكير المنظومي' },
    r1Sub: { en: 'Systems &amp; Critical Thinking', ar: 'التفكير المنظومي والنقدي' },
    r1Path: { en: 'Cognitive Skills &rsaquo; Systems Thinking', ar: 'المهارات المعرفية &lsaquo; التفكير المنظومي' },
    r1Date: { en: '02 Sep 2026<br>10:15 AM', ar: '02 سبتمبر 2026<br>10:15 ص' },

    r2Name: { en: 'Sustainability', ar: 'الاستدامة' },
    r2Sub: { en: 'Sustainability', ar: 'الاستدامة' },
    r2Path: { en: 'Applied Skills &rsaquo; Sustainability', ar: 'المهارات التطبيقية &lsaquo; الاستدامة' },
    r2Date: { en: '28 Aug 2026<br>04:20 PM', ar: '28 أغسطس 2026<br>04:20 م' },

    r3Name: { en: 'Problem Solving', ar: 'حل المشكلات' },
    r3Sub: { en: 'Innovation &amp; Problem Solving', ar: 'الابتكار وحل المشكلات' },
    r3Path: { en: 'Cognitive Skills &rsaquo; Problem Solving', ar: 'المهارات المعرفية &lsaquo; حل المشكلات' },
    r3Date: { en: '12 Aug 2026<br>11:05 AM', ar: '12 أغسطس 2026<br>11:05 ص' },

    r4Name: { en: 'Professional Communication', ar: 'التواصل المهني' },
    r4Sub: { en: 'Communication', ar: 'التواصل' },
    r4Path: { en: 'Applied Skills &rsaquo; Communication', ar: 'المهارات التطبيقية &lsaquo; التواصل' },
    r4Date: { en: '05 Aug 2026<br>09:30 AM', ar: '05 أغسطس 2026<br>09:30 ص' },

    r5Name: { en: 'Leadership', ar: 'القيادة' },
    r5Sub: { en: 'Personal &amp; Leadership', ar: 'الشخصية والقيادة' },
    r5Path: { en: 'Values &rsaquo; Leadership', ar: 'القيم &lsaquo; القيادة' },
    r5Date: { en: '21 Jul 2026<br>03:45 PM', ar: '21 يوليو 2026<br>03:45 م' },

    r6Name: { en: 'Ethical Reasoning', ar: 'التفكير الأخلاقي' },
    r6Sub: { en: 'Ethics &amp; Civic Responsibility', ar: 'الأخلاق والمسؤولية المدنية' },
    r6Path: { en: 'Values &rsaquo; Ethics', ar: 'القيم &lsaquo; الأخلاق' },
    r6Date: { en: '14 Jul 2026<br>11:10 AM', ar: '14 يوليو 2026<br>11:10 ص' },

    r7Name: { en: 'Data Analysis', ar: 'تحليل البيانات' },
    r7Sub: { en: 'Digital &amp; Data Literacy', ar: 'الثقافة الرقمية والبيانات' },
    r7Path: { en: 'Applied Skills &rsaquo; Data Analysis', ar: 'المهارات التطبيقية &lsaquo; تحليل البيانات' },
    r7Date: { en: '02 Jul 2026<br>02:25 PM', ar: '02 يوليو 2026<br>02:25 م' },

    r8Name: { en: 'Global Citizenship', ar: 'المواطنة العالمية' },
    r8Sub: { en: 'Civic Values', ar: 'القيم المدنية' },
    r8Path: { en: 'Values &rsaquo; Global Citizenship', ar: 'القيم &lsaquo; المواطنة العالمية' },
    r8Date: { en: '15 Jun 2026<br>09:10 AM', ar: '15 يونيو 2026<br>09:10 ص' },

    pillUpdated: { en: 'Updated', ar: 'تحديث' },
    pillMajor: { en: 'Major Update', ar: 'تحديث رئيسي' },
    pillMinor: { en: 'Minor Update', ar: 'تحديث طفيف' },
    pillCreated: { en: 'Created', ar: 'إنشاء' },
    viewBtn: { en: 'View', ar: 'عرض' },

    showingText: { en: 'Showing 1 to 8 of 256 competencies', ar: 'عرض 1 إلى 8 من أصل 256 كفاءة' },
    rowsPerPage: { en: 'Rows per page:', ar: 'عدد الصفوف في الصفحة:' },

    domainLabel: { en: 'Domain:', ar: 'المجال:' },
    tabChangeDetails: { en: 'Change Details', ar: 'تفاصيل التغيير' },
    tabVersionCompare: { en: 'Version Compare', ar: 'مقارنة الإصدارات' },

    reasonLabel: { en: 'Reason', ar: 'السبب' },
    reasonText: { en: 'Updated definition to align with latest ESCO 1.2 and enhance proficiency level descriptors.', ar: 'تم تحديث التعريف ليتوافق مع أحدث إصدار من ESCO 1.2 ولتحسين أوصاف مستويات الإتقان.' },
    byFatima: { en: 'Fatima Al-Kuwari', ar: 'فاطمة الكواري' },
    byOmar: { en: 'Omar Al-Emadi', ar: 'عمر العمادي' },
    bySarah: { en: 'Sarah Hassan', ar: 'سارة حسن' },
    byKhalid: { en: 'Khalid Al-Hajri', ar: 'خالد الهاجري' },
    byNoora: { en: 'Noora Al-Mansoori', ar: 'نورة المنصوري' },
    byDavid: { en: 'David Lee', ar: 'ديفيد لي' },
    byAhmed: { en: 'Ahmed Al-Mansoori', ar: 'أحمد المنصوري' },
    byMaryam: { en: 'Maryam Ibrahim', ar: 'مريم إبراهيم' },
    fatimaRole: { en: 'Senior Academic Reviewer', ar: 'مراجعة أكاديمية أولى' },
    detailDateTime: { en: '02 Sep 2026, 10:15 AM', ar: '02 سبتمبر 2026، 10:15 ص' },

    whatChangedTitle: { en: 'What Changed', ar: 'ما الذي تغيّر' },
    wc1: { en: 'Refined competency description', ar: 'تنقيح وصف الكفاءة' },
    wc2: { en: 'Updated proficiency level descriptors (Levels 1-4)', ar: 'تحديث أوصاف مستويات الإتقان (المستويات 1-4)' },
    wc3: { en: 'Revised taxonomy mapping (added O*NET 3.1)', ar: 'مراجعة ربط التصنيف (إضافة O*NET 3.1)' },
    wc4: { en: 'Updated related skills', ar: 'تحديث المهارات ذات الصلة' },

    affectedTitle: { en: 'Affected Elements', ar: 'العناصر المتأثرة' },
    affCompDef: { en: 'Competency Definition', ar: 'تعريف الكفاءة' },
    affProfLevels: { en: 'Proficiency Levels (4)', ar: 'مستويات الإتقان (4)' },
    affTaxMappings: { en: 'Taxonomy Mappings (2)', ar: 'روابط التصنيف (2)' },
    affRelatedSkills: { en: 'Related Skills (6)', ar: 'المهارات ذات الصلة (6)' },

    viewFullLog: { en: 'View Full Change Log', ar: 'عرض سجل التغييرات الكامل' },
    restoreVersion: { en: 'Restore Version', ar: 'استعادة الإصدار' },

    arrowBack: { en: '&larr;', ar: '&rarr;' },
    backBtn: { en: 'Back', ar: 'رجوع' },

    copyright: { en: '© 2026 Qatar Foundation. All rights reserved.', ar: '© 2026 مؤسسة قطر. جميع الحقوق محفوظة.' },
    privacyPolicy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
    termsOfUse: { en: 'Terms of Use', ar: 'شروط الاستخدام' },
    supportLabel: { en: 'Support', ar: 'الدعم' }
  };

  var STORE_KEY = 'qfCompLang';

  function decode(str) {
    return str.replace(/&amp;/g, '&');
  }

  function apply(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var entry = DICT[el.getAttribute('data-i18n')];
      if (!entry) return;
      el.innerHTML = decode(entry[lang]);
    });

    var scope = document.querySelector('.adm-vh-scope');
    if (scope) scope.classList.toggle('lang-ar', lang === 'ar');

    document.querySelectorAll('#langToggle .lang-opt').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    try { sessionStorage.setItem(STORE_KEY, lang); } catch (e) {}
  }

  function init() {
    var toggle = document.getElementById('langToggle');
    if (!toggle) return;
    toggle.addEventListener('click', function (e) {
      var btn = e.target.closest('.lang-opt');
      if (!btn) return;
      apply(btn.getAttribute('data-lang'));
    });

    var saved = 'en';
    try { saved = sessionStorage.getItem(STORE_KEY) || 'en'; } catch (e) {}
    apply(saved);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
