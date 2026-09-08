/* English / Arabic translations for the Opportunities Management page.
   Every [data-i18n] element's text (or [data-i18n-ph] placeholder) is
   swapped by key; the page's text direction flips to RTL and the
   Cairo Arabic typeface takes over in Arabic mode, following the
   same pattern as the Competencies Management page. */
(function () {
  var DICT = {
    adminPortal: { en: 'Administrator Portal', ar: 'بوابة المسؤول' },
    myProfile: { en: 'My Profile', ar: 'الملف الشخصي' },
    settingsLabel: { en: 'Settings', ar: 'الإعدادات' },
    signOut: { en: 'Sign Out', ar: 'تسجيل الخروج' },

    pageTitle: { en: 'Opportunities Management', ar: 'إدارة الفرص' },
    pageSubtitle: { en: 'Create, manage and track all learning and career opportunities.', ar: 'إنشاء وإدارة ومتابعة جميع فرص التعلم والفرص المهنية.' },
    importOpportunities: { en: 'Import Opportunities', ar: 'استيراد الفرص' },
    createOpportunityBtn: { en: 'Create Opportunity', ar: 'إنشاء فرصة' },

    totalOpportunities: { en: 'Total Opportunities', ar: 'إجمالي الفرص' },
    activeOpportunities: { en: 'Active Opportunities', ar: 'الفرص النشطة' },
    upcomingOpportunities: { en: 'Upcoming Opportunities', ar: 'الفرص القادمة' },
    completedOpportunities: { en: 'Completed Opportunities', ar: 'الفرص المكتملة' },
    draftOpportunities: { en: 'Draft Opportunities', ar: 'الفرص المسودة' },
    vsApr: { en: 'vs Apr 2025', ar: 'مقارنة بأبريل 2025' },

    searchPlaceholder: { en: 'Search opportunities by title, organization or category...', ar: 'البحث عن الفرص حسب العنوان أو الجهة أو الفئة...' },
    statusLabel: { en: 'Status', ar: 'الحالة' },
    allStatus: { en: 'All Status', ar: 'جميع الحالات' },
    categoryLabel: { en: 'Category', ar: 'الفئة' },
    allCategories: { en: 'All Categories', ar: 'جميع الفئات' },
    organizationLabel: { en: 'Organization', ar: 'الجهة' },
    allOrganizations: { en: 'All Organizations', ar: 'جميع الجهات' },
    moreFilters: { en: 'More Filters', ar: 'المزيد من الفلاتر' },
    clearAll: { en: 'Clear All', ar: 'مسح الكل' },

    oppCount: { en: 'Opportunities (312)', ar: 'الفرص (312)' },
    thOpportunity: { en: 'Opportunity', ar: 'الفرصة' },
    thApplications: { en: 'Applications', ar: 'الطلبات' },
    thStartDate: { en: 'Start Date', ar: 'تاريخ البدء' },
    thDeadline: { en: 'Deadline', ar: 'الموعد النهائي' },
    actions: { en: 'Actions', ar: 'الإجراءات' },

    opp1Name: { en: 'QF Sustainability Challenge', ar: 'تحدي مؤسسة قطر للاستدامة' },
    tagRecommended: { en: 'RECOMMENDED', ar: 'موصى به' },
    org1: { en: 'Qatar<br>University', ar: 'جامعة<br>قطر' },
    catCompetition: { en: 'Competition', ar: 'مسابقة' },
    statusActive: { en: 'Active', ar: 'نشط' },
    date20250620: { en: '20 Jun 2025', ar: '20 يونيو 2025' },
    date20250520: { en: '20 May 2025', ar: '20 مايو 2025' },

    opp2Name: { en: 'Undergraduate Research<br>Program', ar: 'برنامج البحث<br>الجامعي' },
    tagForYou: { en: 'FOR YOU', ar: 'لك' },
    org2: { en: 'Northwestern University<br>in Qatar', ar: 'جامعة نورث وسترن<br>في قطر' },
    catResearch: { en: 'Research', ar: 'بحث' },
    date20250615: { en: '15 Jun 2025', ar: '15 يونيو 2025' },
    date20250525: { en: '25 May 2025', ar: '25 مايو 2025' },

    opp3Name: { en: 'Data Visualization Workshop', ar: 'ورشة تصور البيانات' },
    org3: { en: 'HEC Paris<br>Doha', ar: 'إيتش إي سي باريس<br>الدوحة' },
    catWorkshop: { en: 'Workshop', ar: 'ورشة عمل' },
    date20250628: { en: '28 Jun 2025', ar: '28 يونيو 2025' },
    date20250528: { en: '28 May 2025', ar: '28 مايو 2025' },

    opp4Name: { en: 'Innovation &amp; Entrepreneurship<br>Bootcamp', ar: 'معسكر الابتكار<br>وريادة الأعمال' },
    org4: { en: 'Carnegie Mellon<br>University in Qatar', ar: 'جامعة كارنيغي ميلون<br>في قطر' },
    catBootcamp: { en: 'Bootcamp', ar: 'معسكر تدريبي' },
    statusUpcoming: { en: 'Upcoming', ar: 'قادم' },
    date20250710: { en: '10 Jul 2025', ar: '10 يوليو 2025' },
    date20250605: { en: '05 Jun 2025', ar: '05 يونيو 2025' },

    opp5Name: { en: 'Industry Mentorship Program', ar: 'برنامج الإرشاد المهني الصناعي' },
    org5: { en: 'Texas A&amp;M University<br>at Qatar', ar: 'جامعة تكساس إيه آند إم<br>في قطر' },
    catMentorship: { en: 'Mentorship', ar: 'إرشاد' },
    date20250601: { en: '01 Jun 2025', ar: '01 يونيو 2025' },
    date20250615b: { en: '15 Jun 2025', ar: '15 يونيو 2025' },

    showingText: { en: 'Showing 1 to 5 of 312 opportunities', ar: 'عرض 1 إلى 5 من أصل 312 فرصة' },
    rowsPerPage: { en: 'Rows per page:', ar: 'عدد الصفوف في الصفحة:' },

    oppByCategories: { en: 'Opportunities by Categories', ar: 'الفرص حسب الفئات' },
    totalLabel: { en: 'Total', ar: 'الإجمالي' },
    catOthers: { en: 'Others', ar: 'أخرى' },

    topOrganizations: { en: 'Top Organizations', ar: 'أبرز الجهات' },
    viewAll: { en: 'View All', ar: 'عرض الكل' },
    topOrg1: { en: 'Carnegie Mellon University in Qatar', ar: 'جامعة كارنيغي ميلون في قطر' },
    opps58: { en: '58 Opportunities', ar: '58 فرصة' },
    topOrg2: { en: 'VCU School of the Arts in Qatar', ar: 'كلية الفنون بجامعة VCU في قطر' },
    opps52: { en: '52 Opportunities', ar: '52 فرصة' },
    topOrg3: { en: 'Georgetown University in Qatar', ar: 'جامعة جورجتاون في قطر' },
    opps41: { en: '41 Opportunities', ar: '41 فرصة' },
    topOrg4: { en: 'Texas A&amp;M University at Qatar', ar: 'جامعة تكساس إيه آند إم في قطر' },
    opps33: { en: '33 Opportunities', ar: '33 فرصة' },
    topOrg5: { en: 'Weill Cornell Medicine-Qatar', ar: 'كلية وايل كورنيل للطب - قطر' },
    opps28: { en: '28 Opportunities', ar: '28 فرصة' },

    applicationsOverview: { en: 'Applications Overview', ar: 'نظرة عامة على الطلبات' },
    viewReportArrow: { en: 'View Report &rarr;', ar: 'عرض التقرير &larr;' },
    jan25: { en: "Jan '25", ar: 'يناير 25' },
    feb25: { en: "Feb '25", ar: 'فبراير 25' },
    mar25: { en: "Mar '25", ar: 'مارس 25' },
    apr25: { en: "Apr '25", ar: 'أبريل 25' },
    may25: { en: "May '25", ar: 'مايو 25' },
    totalApplications: { en: 'Total Applications', ar: 'إجمالي الطلبات' },
    approvedLabel: { en: 'Approved', ar: 'مقبول' },
    underReviewLabel: { en: 'Under Review', ar: 'قيد المراجعة' },
    rejectedLabel: { en: 'Rejected', ar: 'مرفوض' },

    oppStatus: { en: 'Opportunities Status', ar: 'حالة الفرص' },
    completedLabel: { en: 'Completed', ar: 'مكتمل' },
    draftLabel: { en: 'Draft', ar: 'مسودة' },

    recentActivities: { en: 'Recent Activities', ar: 'الأنشطة الأخيرة' },
    viewAllArrow: { en: 'View All &rarr;', ar: 'عرض الكل &larr;' },
    actOppCreated: { en: 'Opportunity Created', ar: 'تم إنشاء فرصة' },
    act1Time: { en: '02 May 2025 10:30 AM<br>by Aisha Al-Emadi', ar: '02 مايو 2025 10:30 ص<br>بواسطة عائشة العمادي' },
    actBadgeCreated: { en: 'Badge Created', ar: 'تم إنشاء شارة' },
    actClimateBadge: { en: 'Climate Action Leadership – Level 2', ar: 'قيادة العمل المناخي – المستوى 2' },
    act2Time: { en: '02 May 2025 09:45 AM<br>by Mohamed Al-Meer', ar: '02 مايو 2025 09:45 ص<br>بواسطة محمد المير' },
    actOppUpdated: { en: 'Opportunity Updated', ar: 'تم تحديث فرصة' },
    opp2NameFlat: { en: 'Undergraduate Research Program', ar: 'برنامج البحث الجامعي' },
    act3Time: { en: '01 May 2025 04:20 PM<br>by Al-Kaabi', ar: '01 مايو 2025 04:20 م<br>بواسطة الكعبي' },
    actOppClosed: { en: 'Opportunity Closed', ar: 'تم إغلاق فرصة' },
    actSpringInternship: { en: 'Spring Internship Program 2025', ar: 'برنامج التدريب الربيعي 2025' },
    act4Time: { en: '30 Apr 2025 05:10 PM<br>by System', ar: '30 أبريل 2025 05:10 م<br>بواسطة النظام' },

    astNote2: { en: 'All data is displayed in Arabia Standard Time (AST)', ar: 'يتم عرض جميع البيانات بتوقيت السعودية القياسي (AST)' },

    copyright: { en: '© 2026 Qatar Foundation. All rights reserved.', ar: '© 2026 مؤسسة قطر. جميع الحقوق محفوظة.' },
    privacyPolicy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
    termsOfUse: { en: 'Terms of Use', ar: 'شروط الاستخدام' },
    supportLabel: { en: 'Support', ar: 'الدعم' }
  };

  var STORE_KEY = 'qfOppLang';

  function decode(str) {
    return str.replace(/&amp;/g, '&').replace(/&rarr;/g, '→').replace(/&larr;/g, '←');
  }

  function apply(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var entry = DICT[el.getAttribute('data-i18n')];
      if (!entry) return;
      el.innerHTML = decode(entry[lang]);
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var entry = DICT[el.getAttribute('data-i18n-ph')];
      if (!entry) return;
      el.setAttribute('placeholder', decode(entry[lang]));
    });

    var scope = document.querySelector('.adm-opp-scope');
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
