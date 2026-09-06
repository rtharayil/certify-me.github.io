/* English / Arabic translations for the Competencies Management page.
   Every [data-i18n] element's text is swapped by key; the page's
   text direction flips to RTL and the Cairo Arabic typeface takes
   over in Arabic mode. The chosen language is shared (sessionStorage
   key qfCompLang) with the Taxonomy Mapping and Version History
   pages, which carry the same key, so it persists across the whole
   Competency Framework flow. */
(function () {
  var DICT = {
    pageTitle: { en: 'Competencies Management', ar: 'إدارة الكفاءات' },
    pageSubtitle: { en: 'Create, manage and organize competencies across domains and proficiency levels.', ar: 'إنشاء وإدارة وتنظيم الكفاءات عبر المجالات ومستويات الإتقان.' },

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
    nextTaxonomyMapping: { en: 'Next: Taxonomy Mapping', ar: 'التالي: ربط التصنيفات' },
    arrowNext: { en: '&rarr;', ar: '&larr;' },
    exportBtn: { en: 'Export Competencies', ar: 'تصدير الكفاءات' },
    addBtn: { en: 'Add Competency', ar: 'إضافة كفاءة' },
    searchPlaceholder: { en: 'Search competencies...', ar: 'البحث عن الكفاءات...' },
    domain: { en: 'Domain', ar: 'المجال' },
    proficiencyLevel: { en: 'Proficiency Level', ar: 'مستوى الإتقان' },
    status: { en: 'Status', ar: 'الحالة' },
    allDomains: { en: 'All Domains', ar: 'جميع المجالات' },
    allLevels: { en: 'All Levels', ar: 'جميع المستويات' },
    allStatus: { en: 'All Status', ar: 'جميع الحالات' },
    moreFilters: { en: 'More Filters', ar: 'المزيد من الفلاتر' },
    clearAll: { en: 'Clear All', ar: 'مسح الكل' },

    totalCompetencies: { en: 'Total Competencies', ar: 'إجمالي الكفاءات' },
    activeCompetencies: { en: 'Active Competencies', ar: 'الكفاءات النشطة' },
    draftCompetencies: { en: 'Draft Competencies', ar: 'الكفاءات المسودة' },
    archivedCompetencies: { en: 'Archived Competencies', ar: 'الكفاءات المؤرشفة' },
    vsApr: { en: 'vs Apr 2025', ar: 'مقارنة بأبريل 2025' },

    competenciesCount: { en: 'Competencies (11)', ar: 'الكفاءات (11)' },
    viewFramework: { en: 'View Framework', ar: 'عرض الإطار' },
    thCompetency: { en: 'Competency', ar: 'الكفاءة' },
    proficiencyLevels: { en: 'Proficiency Levels', ar: 'مستويات الإتقان' },
    lastUpdated: { en: 'Last Updated', ar: 'آخر تحديث' },
    actions: { en: 'Actions', ar: 'الإجراءات' },

    c1Name: { en: 'Entrepreneurship', ar: 'ريادة الأعمال' },
    c1Desc: { en: 'Identify opportunities and turn ideas into innovative ventures.', ar: 'تحديد الفرص وتحويل الأفكار إلى مشاريع مبتكرة.' },
    c2Name: { en: 'Interdisciplinary Approaches', ar: 'المناهج متعددة التخصصات' },
    c2Desc: { en: 'Connect knowledge and methods across different fields to solve complex problems.', ar: 'ربط المعارف والأساليب عبر مجالات مختلفة لحل المشكلات المعقدة.' },
    c3Name: { en: 'Systems Thinking', ar: 'التفكير المنظومي' },
    c3Desc: { en: 'Understand relationships between interconnected systems.', ar: 'فهم العلاقات بين الأنظمة المترابطة.' },
    c4Name: { en: 'Information Literacy', ar: 'الثقافة المعلوماتية' },
    c4Desc: { en: 'Evaluate and use data, media and AI tools responsibly and effectively.', ar: 'تقييم واستخدام البيانات والوسائط وأدوات الذكاء الاصطناعي بمسؤولية وفعالية.' },
    c5Name: { en: 'Ethical Reasoning', ar: 'التفكير الأخلاقي' },
    c5Desc: { en: 'Make informed, principled decisions that consider ethical impacts.', ar: 'اتخاذ قرارات مدروسة ومبدئية تراعي الآثار الأخلاقية.' },
    c6Name: { en: 'Intercultural Knowledge', ar: 'المعرفة بين الثقافات' },
    c6Desc: { en: 'Understand and engage respectfully across diverse cultures and perspectives.', ar: 'فهم الثقافات ووجهات النظر المتنوعة والتفاعل معها باحترام.' },
    c7Name: { en: 'Glocal Learning', ar: 'التعلم العالمي المحلي' },
    c7Desc: { en: 'Apply global perspectives to address local challenges and opportunities.', ar: 'تطبيق منظورات عالمية لمعالجة التحديات والفرص المحلية.' },
    c8Name: { en: 'Civic Values &amp; Social Responsibility', ar: 'القيم المدنية والمسؤولية الاجتماعية' },
    c8Desc: { en: 'Engage responsibly as an active citizen contributing to community and society.', ar: 'المشاركة بمسؤولية كمواطن فاعل يساهم في المجتمع.' },
    c9Name: { en: 'Growth Mindset', ar: 'عقلية النمو' },
    c9Desc: { en: 'Adapt, persevere and grow through challenges and change.', ar: 'التكيف والمثابرة والنمو من خلال التحديات والتغيير.' },
    c10Name: { en: 'Arabic Linguistic Competence', ar: 'الكفاءة اللغوية العربية' },
    c10Desc: { en: 'Communicate effectively and confidently in Arabic across contexts.', ar: 'التواصل بفعالية وثقة باللغة العربية في مختلف السياقات.' },
    c11Name: { en: 'Interpersonal &amp; Professional Communication', ar: 'التواصل الشخصي والمهني' },
    c11Desc: { en: 'Communicate ideas clearly and effectively in diverse contexts.', ar: 'التعبير عن الأفكار بوضوح وفعالية في سياقات متنوعة.' },

    dPersonalLeadership: { en: 'Personal &amp; Leadership', ar: 'الشخصية والقيادة' },
    dSystemsCritical: { en: 'Systems &amp; Critical Thinking', ar: 'التفكير المنظومي والنقدي' },
    dDigitalData: { en: 'Digital &amp; Data Literacy', ar: 'الثقافة الرقمية والبيانات' },
    dEthicsCivic: { en: 'Ethics &amp; Civic Responsibility', ar: 'الأخلاق والمسؤولية المدنية' },
    dCommunication: { en: 'Communication', ar: 'التواصل' },
    dGlobalIntercultural: { en: 'Global &amp; Intercultural Studies', ar: 'الدراسات العالمية بين الثقافات' },
    dLanguageProficiency: { en: 'Language Proficiency', ar: 'الكفاءة اللغوية' },

    levelFoundational: { en: 'Foundational', ar: 'تأسيسي' },
    levelProficient: { en: 'Proficient', ar: 'متمكن' },
    levelExpert: { en: 'Expert', ar: 'خبير' },
    statusActive: { en: 'Active', ar: 'نشط' },

    date20250502: { en: '02 May 2025', ar: '02 مايو 2025' },
    date20250430: { en: '30 Apr 2025', ar: '30 أبريل 2025' },
    date20250428: { en: '28 Apr 2025', ar: '28 أبريل 2025' },
    date20250425: { en: '25 Apr 2025', ar: '25 أبريل 2025' },
    date20250420: { en: '20 Apr 2025', ar: '20 أبريل 2025' },
    date20250418: { en: '18 Apr 2025', ar: '18 أبريل 2025' },
    date20250415: { en: '15 Apr 2025', ar: '15 أبريل 2025' },
    date20250410: { en: '10 Apr 2025', ar: '10 أبريل 2025' },
    date20250408: { en: '08 Apr 2025', ar: '08 أبريل 2025' },
    date20250405: { en: '05 Apr 2025', ar: '05 أبريل 2025' },
    date20250402: { en: '02 Apr 2025', ar: '02 أبريل 2025' },

    byLabel: { en: 'by', ar: 'بواسطة' },
    byAishaAlEmadi: { en: 'Aisha Al-Emadi', ar: 'عائشة العمادي' },
    byMohammedAlMee: { en: 'Mohammed Al-Mee', ar: 'محمد المير' },
    byFatimaAlKaabi: { en: 'Fatima Al-Kaabi', ar: 'فاطمة الكعبي' },
    byAhmedAlHajri: { en: 'Ahmed Al-Hajri', ar: 'أحمد الهاجري' },

    showingText: { en: 'Showing 1 to 11 of 11 competencies', ar: 'عرض 1 إلى 11 من أصل 11 كفاءة' },
    rowsPerPage: { en: 'Rows per page:', ar: 'عدد الصفوف في الصفحة:' },

    compByDomain: { en: 'Competencies by Domain', ar: 'الكفاءات حسب المجال' },
    totalLabel: { en: 'Total', ar: 'الإجمالي' },
    viewDomainDetails: { en: 'View Domain Details', ar: 'عرض تفاصيل المجال' },

    profLevelDist: { en: 'Proficiency Level Distribution', ar: 'توزيع مستويات الإتقان' },
    level1Emerging: { en: 'Level 1<br>Emerging', ar: 'المستوى 1<br>ناشئ' },
    level2Developing: { en: 'Level 2<br>Developing', ar: 'المستوى 2<br>متطور' },
    level3Applied: { en: 'Level 3<br>Applied', ar: 'المستوى 3<br>تطبيقي' },
    manageProfLevels: { en: 'Manage Proficiency Levels', ar: 'إدارة مستويات الإتقان' },

    recentActivities: { en: 'Recent Activities', ar: 'الأنشطة الأخيرة' },
    viewAll: { en: 'View All', ar: 'عرض الكل' },
    actCompCreated: { en: 'Competency Created', ar: 'تم إنشاء كفاءة' },
    actClimateAdapt: { en: 'Climate Adaptation Strategies', ar: 'استراتيجيات التكيف مع المناخ' },
    actCompUpdated: { en: 'Competency Updated', ar: 'تم تحديث كفاءة' },
    actDataViz: { en: 'Data Visualization', ar: 'تصور البيانات' },
    actCompDeactivated: { en: 'Competency Deactivated', ar: 'تم إلغاء تفعيل كفاءة' },
    actLegacyIct: { en: 'Legacy ICT Skills', ar: 'مهارات تقنية المعلومات القديمة' },
    actDomainCreated: { en: 'Domain Created', ar: 'تم إنشاء مجال' },
    actEmergingTech: { en: 'Emerging Technologies', ar: 'التقنيات الناشئة' },
    viewAllActivities: { en: 'View All Activities', ar: 'عرض جميع الأنشطة' },

    dt20250502: { en: '02 May 2025, 11:20 AM', ar: '02 مايو 2025، 11:20 ص' },
    dt20250502b: { en: '02 May 2025, 10:15 AM', ar: '02 مايو 2025، 10:15 ص' },
    dt20250501: { en: '01 May 2025, 04:30 PM', ar: '01 مايو 2025، 04:30 م' },
    dt20250501b: { en: '01 May 2025, 02:10 PM', ar: '01 مايو 2025، 02:10 م' },

    adminPortal: { en: 'Administrator Portal', ar: 'بوابة المسؤول' },
    myProfile: { en: 'My Profile', ar: 'الملف الشخصي' },
    settingsLabel: { en: 'Settings', ar: 'الإعدادات' },
    signOut: { en: 'Sign Out', ar: 'تسجيل الخروج' },

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

    var scope = document.querySelector('.adm-comp-scope');
    if (scope) {
      scope.classList.toggle('lang-ar', lang === 'ar');
    }

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
