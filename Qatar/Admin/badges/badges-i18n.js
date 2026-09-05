/* English / Arabic translations for the Badges & Credentials
   Management page. Every [data-i18n] element's text is swapped by
   key; the page's text direction flips to RTL and the Cairo Arabic
   typeface takes over in Arabic mode, following the same pattern as
   the Competencies Management page. */
(function () {
  var DICT = {
    adminPortal: { en: 'Administrator Portal', ar: 'بوابة المسؤول' },
    myProfile: { en: 'My Profile', ar: 'الملف الشخصي' },
    settingsLabel: { en: 'Settings', ar: 'الإعدادات' },
    signOut: { en: 'Sign Out', ar: 'تسجيل الخروج' },

    pageTitle: { en: 'Badges &amp; Credentials Management', ar: 'إدارة الشارات والاعتمادات' },
    pageSubtitle: { en: 'Design, issue and manage digital badges and credentials.', ar: 'تصميم وإصدار وإدارة الشارات والاعتمادات الرقمية.' },
    importBadges: { en: 'Import Badges', ar: 'استيراد الشارات' },
    createNewBadge: { en: 'Create New Badge', ar: 'إنشاء شارة جديدة' },

    totalBadges: { en: 'Total Badges', ar: 'إجمالي الشارات' },
    activeBadges: { en: 'Active Badges', ar: 'الشارات النشطة' },
    issuedThisMonth: { en: 'Issued This Month', ar: 'الصادرة هذا الشهر' },
    totalIssued: { en: 'Total Issued', ar: 'إجمالي الصادر' },
    expiredRetired: { en: 'Expired / Retired', ar: 'منتهية / متقاعدة' },
    vsApr: { en: 'vs Apr 2025', ar: 'مقارنة بأبريل 2025' },

    searchBadges: { en: 'Search badges by name or description...', ar: 'البحث عن الشارات بالاسم أو الوصف...' },
    statusLabel: { en: 'Status', ar: 'الحالة' },
    allStatus: { en: 'All Status', ar: 'جميع الحالات' },
    badgeType: { en: 'Badge Type', ar: 'نوع الشارة' },
    allTypes: { en: 'All Types', ar: 'جميع الأنواع' },
    organizationLabel: { en: 'Organization', ar: 'الجهة' },
    allOrganizations: { en: 'All Organizations', ar: 'جميع الجهات' },
    moreFilters: { en: 'More Filters', ar: 'المزيد من الفلاتر' },
    clearAll: { en: 'Clear All', ar: 'مسح الكل' },

    badgesCount: { en: 'Badges (482)', ar: 'الشارات (482)' },
    viewBadgeCategories: { en: 'View Badge Categories ↗', ar: 'عرض فئات الشارات ↗' },
    thBadge: { en: 'Badge', ar: 'الشارة' },
    thType: { en: 'Type', ar: 'النوع' },
    thIssued: { en: 'Issued', ar: 'الصادرة' },
    thLastUpdated: { en: 'Last Updated', ar: 'آخر تحديث' },
    actions: { en: 'Actions', ar: 'الإجراءات' },

    typeAchievement: { en: 'Achievement', ar: 'إنجاز' },
    typeSkill: { en: 'Skill', ar: 'مهارة' },
    typeKnowledge: { en: 'Knowledge', ar: 'معرفة' },
    typeBehavior: { en: 'Behavior', ar: 'سلوك' },
    typeCompletion: { en: 'Completion', ar: 'إتمام' },
    statusActive: { en: 'Active', ar: 'نشط' },
    statusDraft: { en: 'Draft', ar: 'مسودة' },

    b1Name: { en: 'Sustainability Champion', ar: 'بطل الاستدامة' },
    b1Desc: { en: 'Demonstrates advanced understanding of sustainability principles.', ar: 'يُظهر فهمًا متقدمًا لمبادئ الاستدامة.' },
    b1Org: { en: 'QF Sustainability<br>Program', ar: 'برنامج مؤسسة قطر<br>للاستدامة' },
    b1Updated: { en: '02 May 2025<br>by Aisha Al-Emadi', ar: '02 مايو 2025<br>بواسطة عائشة العمادي' },

    b2Name: { en: 'AI Foundations - Level 1', ar: 'أساسيات الذكاء الاصطناعي - المستوى 1' },
    b2Desc: { en: 'Basic concepts of Artificial Intelligence and its applications.', ar: 'المفاهيم الأساسية للذكاء الاصطناعي وتطبيقاته.' },
    b2Org: { en: 'Artificial Intelligence<br>Foundations', ar: 'أساسيات<br>الذكاء الاصطناعي' },
    b2Updated: { en: '01 May 2025<br>by Mohammed Al-Mee', ar: '01 مايو 2025<br>بواسطة محمد المير' },

    b3Name: { en: 'Data Analytics Essentials', ar: 'أساسيات تحليل البيانات' },
    b3Desc: { en: 'Apply data analysis techniques to real-world problems.', ar: 'تطبيق تقنيات تحليل البيانات على مشكلات واقعية.' },
    b3Org: { en: 'College of<br>Engineering', ar: 'كلية<br>الهندسة' },
    b3Updated: { en: '30 Apr 2025<br>by Fatima Al-Kaabi', ar: '30 أبريل 2025<br>بواسطة فاطمة الكعبي' },

    b4Name: { en: 'Leadership Excellence', ar: 'التميز القيادي' },
    b4Desc: { en: 'Exhibits effective leadership and team collaboration.', ar: 'يُظهر قيادة فعالة وتعاونًا جماعيًا.' },
    b4Org: { en: 'QF Leadership<br>Institute', ar: 'معهد مؤسسة قطر<br>للقيادة' },
    b4Updated: { en: '28 Apr 2025<br>by Ahmed Al-Hajri', ar: '28 أبريل 2025<br>بواسطة أحمد الهاجري' },

    b5Name: { en: 'Cybersecurity Awareness', ar: 'الوعي بالأمن السيبراني' },
    b5Desc: { en: 'Understands key cybersecurity concepts and best practices.', ar: 'يفهم المفاهيم الأساسية للأمن السيبراني وأفضل الممارسات.' },
    b5Org: { en: 'IT Security<br>Department', ar: 'إدارة أمن<br>تقنية المعلومات' },
    b5Updated: { en: '27 Apr 2025<br>by System', ar: '27 أبريل 2025<br>بواسطة النظام' },

    b6Name: { en: 'Undergraduate Researcher', ar: 'باحث جامعي' },
    b6Desc: { en: 'Successfully completed undergraduate research project.', ar: 'أكمل بنجاح مشروع بحث جامعي.' },
    qatarUniversity: { en: 'Qatar University', ar: 'جامعة قطر' },
    b6Updated: { en: '25 Apr 2025<br>by Aisha Al-Emadi', ar: '25 أبريل 2025<br>بواسطة عائشة العمادي' },

    b7Name: { en: 'Innovation Thinker', ar: 'المفكر المبتكر' },
    b7Desc: { en: 'Demonstrates creative problem-solving and innovative thinking.', ar: 'يُظهر حل المشكلات بإبداع وتفكيرًا مبتكرًا.' },
    b7Org: { en: 'QF Innovation Center', ar: 'مركز مؤسسة قطر للابتكار' },
    b7Updated: { en: '20 Apr 2025<br>by Mohammed Al-Mee', ar: '20 أبريل 2025<br>بواسطة محمد المير' },

    b8Name: { en: 'Orientation Completion', ar: 'إتمام التوجيه' },
    b8Desc: { en: 'Completed student orientation program.', ar: 'أكمل برنامج توجيه الطلاب.' },
    b8Updated: { en: '18 Apr 2025<br>by System', ar: '18 أبريل 2025<br>بواسطة النظام' },

    showingBadges: { en: 'Showing 1 to 8 of 482 badges', ar: 'عرض 1 إلى 8 من أصل 482 شارة' },
    rowsPerPage: { en: 'Rows per page:', ar: 'عدد الصفوف في الصفحة:' },

    badgeTypesDist: { en: 'Badge Types Distribution', ar: 'توزيع أنواع الشارات' },
    totalLabel: { en: 'Total', ar: 'الإجمالي' },
    viewAllBadgeTypes: { en: 'View All Badge Types&nbsp; →', ar: 'عرض جميع أنواع الشارات&nbsp; ←' },

    topBadgesByIssuance: { en: 'Top Badges by Issuance', ar: 'أبرز الشارات حسب الإصدار' },

    recentActivities: { en: 'Recent Activities', ar: 'الأنشطة الأخيرة' },
    viewAll: { en: 'View All', ar: 'عرض الكل' },
    actBadgeCreated: { en: 'Badge Created', ar: 'تم إنشاء شارة' },
    act1Time: { en: '02 May 2025, 11:20 AM<br>by Aisha Al-Emadi', ar: '02 مايو 2025، 11:20 ص<br>بواسطة عائشة العمادي' },
    actBadgeUpdated: { en: 'Badge Updated', ar: 'تم تحديث شارة' },
    act2Time: { en: '02 May 2025, 10:15 AM<br>by Mohammed Al-Mee', ar: '02 مايو 2025، 10:15 ص<br>بواسطة محمد المير' },
    actBadgeIssuedBulk: { en: 'Badge Issued in Bulk', ar: 'تم إصدار شارة بشكل جماعي' },
    actCyberBulk: { en: 'Cybersecurity Awareness (250 badges)', ar: 'الوعي بالأمن السيبراني (250 شارة)' },
    act3Time: { en: '01 May 2025, 04:30 PM<br>by System', ar: '01 مايو 2025، 04:30 م<br>بواسطة النظام' },
    actBadgeRetired: { en: 'Badge Retired', ar: 'تم إلغاء شارة' },
    actOldLeadership: { en: 'Old Leadership Program Badge', ar: 'شارة برنامج القيادة القديم' },
    act4Time: { en: '30 Apr 2025, 02:10 PM<br>by Ahmed Al-Hajri', ar: '30 أبريل 2025، 02:10 م<br>بواسطة أحمد الهاجري' },

    copyright: { en: '© 2026 Qatar Foundation. All rights reserved.', ar: '© 2026 مؤسسة قطر. جميع الحقوق محفوظة.' },
    privacyPolicy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
    termsOfUse: { en: 'Terms of Use', ar: 'شروط الاستخدام' },
    supportLabel: { en: 'Support', ar: 'الدعم' }
  };

  var STORE_KEY = 'qfBadgesLang';

  function decode(str) {
    return str.replace(/&amp;/g, '&');
  }

  function apply(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var entry = DICT[el.getAttribute('data-i18n')];
      if (!entry) return;
      el.innerHTML = decode(entry[lang]);
    });

    var scope = document.querySelector('.adm-badges-scope');
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
