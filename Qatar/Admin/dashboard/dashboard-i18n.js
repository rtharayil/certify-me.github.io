/* English / Arabic translations for the Dashboard page.
   Every [data-i18n] element's text is swapped by key; the page's
   text direction flips to RTL and the Cairo Arabic typeface takes
   over in Arabic mode, following the same pattern as the
   Competencies Management page. */
(function () {
  var DICT = {
    adminPortal: { en: 'Administrator Portal', ar: 'بوابة المسؤول' },
    myProfile: { en: 'My Profile', ar: 'الملف الشخصي' },
    settingsLabel: { en: 'Settings', ar: 'الإعدادات' },
    signOut: { en: 'Sign Out', ar: 'تسجيل الخروج' },

    welcomeBack: { en: 'Welcome back,', ar: 'مرحبًا بعودتك،' },
    introSub: { en: "Here's what's happening on the Universal Skills Passport platform.", ar: 'إليك آخر مستجدات منصة جواز المهارات الشامل.' },
    dateRange: { en: '01 – 31 May 2025', ar: '01 – 31 مايو 2025' },
    exportReport: { en: 'Export Report', ar: 'تصدير التقرير' },

    totalStudents: { en: 'Total Students', ar: 'إجمالي الطلاب' },
    activeCompetencies: { en: 'Competencies', ar: 'الكفاءات' },
    skillsEarned: { en: 'Skills Earned', ar: 'المهارات المكتسبة' },
    badgesIssued: { en: 'Badges Issued', ar: 'الشارات الصادرة' },
    vsApr: { en: 'vs Apr 2025', ar: 'مقارنة بأبريل 2025' },

    recentActivities: { en: 'Recent Activities', ar: 'الأنشطة الأخيرة' },
    viewAllActivities: { en: 'View All Activities', ar: 'عرض جميع الأنشطة' },
    actOppCreated: { en: 'Opportunity Created', ar: 'تم إنشاء فرصة' },
    dt20250502a: { en: '02 May 2025, 10:30 AM', ar: '02 مايو 2025، 10:30 ص' },
    byAishaAlEmadi2: { en: 'by Aisha Al-Emadi', ar: 'بواسطة عائشة العمادي' },
    actSustainChallenge: { en: 'QF Sustainability Challenge', ar: 'تحدي مؤسسة قطر للاستدامة' },
    actBadgeCreated: { en: 'Badge Created', ar: 'تم إنشاء شارة' },
    dt20250502b2: { en: '02 May 2025, 09:45 AM', ar: '02 مايو 2025، 09:45 ص' },
    byMohammedAlMeer: { en: 'by Mohammed Al-Meer', ar: 'بواسطة محمد المير' },
    actAiFoundations: { en: 'Artificial Intelligence Foundations – Level 2', ar: 'أساسيات الذكاء الاصطناعي – المستوى 2' },
    actStudentEnrolled: { en: 'Student Enrolled', ar: 'تم تسجيل طالب' },
    dt20250501a: { en: '01 May 2025, 04:20 PM', ar: '01 مايو 2025، 04:20 م' },
    bySystem: { en: 'by System', ar: 'بواسطة النظام' },
    actQuEnrolled: { en: '120 new students enrolled from Qatar University', ar: 'التحق 120 طالبًا جديدًا من جامعة قطر' },
    actEvidenceSubmitted: { en: 'Evidence Submitted', ar: 'تم تقديم أدلة' },
    dt20250501b2: { en: '01 May 2025, 03:10 PM', ar: '01 مايو 2025، 03:10 م' },
    byStudents: { en: 'by Students', ar: 'بواسطة الطلاب' },
    actEvidence56: { en: '56 evidence submissions across 8 competencies', ar: '56 عملية تقديم أدلة عبر 8 كفاءات' },
    actCompVerified: { en: 'Competency Verified', ar: 'تم التحقق من كفاءة' },
    dt20250501c: { en: '01 May 2025, 11:05 AM', ar: '01 مايو 2025، 11:05 ص' },
    byVerifiers: { en: 'by Verifiers', ar: 'بواسطة المدققين' },
    actSystemsVerified: { en: 'Systems Thinking – Level 3 verified for 28 students', ar: 'تم التحقق من التفكير المنظومي – المستوى 3 لـ 28 طالبًا' },
    actCompCreated2: { en: 'Competency Created', ar: 'تم إنشاء كفاءة' },
    dt20250430: { en: '30 Apr 2025, 02:15 PM', ar: '30 أبريل 2025، 02:15 م' },
    byFatimaAlKaabi2: { en: 'by Fatima Al-Kaabi', ar: 'بواسطة فاطمة الكعبي' },
    c11Name: { en: 'Interpersonal &amp; Professional Communication', ar: 'التواصل الشخصي والمهني' },

    enrollmentTrends: { en: 'Enrollment Trends', ar: 'اتجاهات التسجيل' },
    viewFullReport: { en: 'View Full Report', ar: 'عرض التقرير الكامل' },
    delta85vsApr: { en: '↑ 8.5% vs Apr 2025', ar: '↑ 8.5% مقارنة بأبريل 2025' },
    monthly: { en: 'Monthly', ar: 'شهريًا' },
    jan25: { en: "Jan '25", ar: 'يناير 25' },
    feb25: { en: "Feb '25", ar: 'فبراير 25' },
    mar25: { en: "Mar '25", ar: 'مارس 25' },
    apr25: { en: "Apr '25", ar: 'أبريل 25' },
    may25: { en: "May '25", ar: 'مايو 25' },
    newThisMonth: { en: 'New This Month', ar: 'جديد هذا الشهر' },
    activeThisMonth: { en: 'Active This Month', ar: 'نشط هذا الشهر' },
    completedJourneys: { en: 'Completed Journeys', ar: 'الرحلات المكتملة' },

    quickActions: { en: 'Quick Actions', ar: 'إجراءات سريعة' },
    createCompetency: { en: 'Create Competency', ar: 'إنشاء كفاءة' },
    createBadge: { en: 'Create Badge', ar: 'إنشاء شارة' },
    addStudents: { en: 'Add Students', ar: 'إضافة طلاب' },
    createOpportunity: { en: 'Create Opportunity', ar: 'إنشاء فرصة' },

    platformOverview: { en: 'Platform Overview', ar: 'نظرة عامة على المنصة' },
    totalCompetencies: { en: 'Total Competencies', ar: 'إجمالي الكفاءات' },
    verifiedCompetencies: { en: 'Verified Competencies', ar: 'الكفاءات الموثقة' },
    opportunitiesLabel: { en: 'Opportunities', ar: 'الفرص' },
    activeVerifiers: { en: 'Active Verifiers', ar: 'المدققون النشطون' },
    partnersLabel: { en: 'Partners', ar: 'الشركاء' },

    oppSummary: { en: 'Opportunities Summary', ar: 'ملخص الفرص' },
    viewAll: { en: 'View All', ar: 'عرض الكل' },
    totalLabel: { en: 'Total', ar: 'الإجمالي' },
    activeLabel: { en: 'Active', ar: 'نشط' },
    upcomingLabel: { en: 'Upcoming', ar: 'قادم' },
    closedLabel: { en: 'Closed', ar: 'مغلق' },
    draftLabel: { en: 'Draft', ar: 'مسودة' },

    badgeIssuanceTrend: { en: 'Badge Issuance Trend', ar: 'اتجاه إصدار الشارات' },

    topCompetencies: { en: 'Top Competencies', ar: 'أبرز الكفاءات' },
    c3Name: { en: 'Systems Thinking', ar: 'التفكير المنظومي' },
    c5Name: { en: 'Ethical Reasoning', ar: 'التفكير الأخلاقي' },
    c4Name: { en: 'Information Literacy', ar: 'الثقافة المعلوماتية' },
    c1Name: { en: 'Entrepreneurship', ar: 'ريادة الأعمال' },

    astNote: { en: 'Data is updated in real-time. All times are displayed in Arabian Standard Time (AST).', ar: 'يتم تحديث البيانات في الوقت الفعلي. جميع الأوقات معروضة بتوقيت السعودية القياسي (AST).' },

    copyright: { en: '© 2026 Qatar Foundation. All rights reserved.', ar: '© 2026 مؤسسة قطر. جميع الحقوق محفوظة.' },
    privacyPolicy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
    termsOfUse: { en: 'Terms of Use', ar: 'شروط الاستخدام' },
    supportLabel: { en: 'Support', ar: 'الدعم' }
  };

  var STORE_KEY = 'qfDashLang';

  function decode(str) {
    return str.replace(/&amp;/g, '&');
  }

  function apply(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var entry = DICT[el.getAttribute('data-i18n')];
      if (!entry) return;
      el.innerHTML = decode(entry[lang]);
    });

    var scope = document.querySelector('.adm-dash-scope');
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
