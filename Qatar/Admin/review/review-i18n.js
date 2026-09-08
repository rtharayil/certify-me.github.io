/* English / Arabic translations for the Evidence Submissions page.
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

    pageTitle: { en: 'Evidence Submissions', ar: 'تقديمات الأدلة' },
    pageSubtitle: { en: 'Review evidence, verify achievements and manage attestations across the platform.', ar: 'مراجعة الأدلة والتحقق من الإنجازات وإدارة الإقرارات عبر المنصة.' },
    exportReport: { en: 'Export Report', ar: 'تصدير التقرير' },
    verificationSettings: { en: 'Verification Settings', ar: 'إعدادات التحقق' },

    pendingReviews: { en: 'Pending Reviews', ar: 'المراجعات المعلقة' },
    vsApr: { en: 'vs Apr 2025', ar: 'مقارنة بأبريل 2025' },
    dueSoon: { en: 'Due Soon', ar: 'مستحق قريبًا' },
    dueNext7Days: { en: 'Due in next 7 days', ar: 'مستحق خلال 7 أيام' },
    activeVerifiers: { en: 'Active Verifiers', ar: 'المدققون النشطون' },
    across24Orgs: { en: 'Across 24 organizations', ar: 'عبر 24 جهة' },
    completedThisMonth: { en: 'Completed This Month', ar: 'المكتملة هذا الشهر' },

    pendingReviewsCount: { en: 'Pending Reviews (1,248)', ar: 'المراجعات المعلقة (1,248)' },
    allTypes: { en: 'All Types', ar: 'جميع الأنواع' },
    allOrganizations: { en: 'All Organizations', ar: 'جميع الجهات' },
    allPriority: { en: 'All Priority', ar: 'جميع الأولويات' },
    filtersLabel: { en: 'Filters', ar: 'الفلاتر' },
    clearAll: { en: 'Clear All', ar: 'مسح الكل' },
    thSubmission: { en: 'Submission', ar: 'التقديم' },
    thStudentRecipient: { en: 'Student / Recipient', ar: 'الطالب / المستفيد' },
    organizationLabel: { en: 'Organization', ar: 'الجهة' },
    thSubmittedOn: { en: 'Submitted On', ar: 'تاريخ التقديم' },
    thPriority: { en: 'Priority', ar: 'الأولوية' },
    thDueDate: { en: 'Due Date', ar: 'تاريخ الاستحقاق' },

    opp1Name: { en: 'Innovation &amp; Entrepreneurship Bootcamp', ar: 'معسكر الابتكار وريادة الأعمال' },
    opp1Comp: { en: 'Entrepreneurship', ar: 'ريادة الأعمال' },
    student1Name: { en: 'Maryam Ahmed', ar: 'مريم أحمد' },
    org1: { en: 'Carnegie Mellon<br>University in Qatar', ar: 'جامعة كارنيغي ميلون<br>في قطر' },
    sub1Date: { en: '02 May 2025<br>10:15 AM', ar: '02 مايو 2025<br>10:15 ص' },
    priorityHigh: { en: 'High', ar: 'مرتفعة' },
    due1: { en: '05 May 2025<br><span>(2 days left)</span>', ar: '05 مايو 2025<br><span>(يتبقى يومان)</span>' },

    opp2Name: { en: 'QF Sustainability Challenge', ar: 'تحدي مؤسسة قطر للاستدامة' },
    opp2Comp: { en: 'Systems Thinking', ar: 'التفكير المنظومي' },
    student2Name: { en: 'Sara Al Mansoori', ar: 'سارة المنصوري' },
    org2: { en: 'Qatar<br>University', ar: 'جامعة<br>قطر' },
    sub2Date: { en: '01 May 2025<br>03:22 PM', ar: '01 مايو 2025<br>03:22 م' },
    priorityMedium: { en: 'Medium', ar: 'متوسطة' },
    due2: { en: '06 May 2025<br><span class="due-orange">(3 days left)</span>', ar: '06 مايو 2025<br><span class="due-orange">(يتبقى 3 أيام)</span>' },

    opp3Name: { en: 'Undergraduate Research Program', ar: 'برنامج البحث الجامعي' },
    opp3Comp: { en: 'Interdisciplinary Approaches', ar: 'المناهج متعددة التخصصات' },
    student3Name: { en: 'Fatima Al-Mansoori', ar: 'فاطمة المنصوري' },
    org3: { en: 'Northwestern University<br>in Qatar', ar: 'جامعة نورث وسترن<br>في قطر' },
    sub3Date: { en: '30 Apr 2025<br>11:45 AM', ar: '30 أبريل 2025<br>11:45 ص' },
    due3: { en: '04 May 2025<br><span>(Tomorrow)</span>', ar: '04 مايو 2025<br><span>(غدًا)</span>' },

    opp4Name: { en: 'Industry Mentorship Program', ar: 'برنامج الإرشاد المهني الصناعي' },
    opp4Comp: { en: 'Growth Mindset', ar: 'عقلية النمو' },
    student4Name: { en: 'Ahmed Al-Hajri', ar: 'أحمد الهاجري' },
    org4: { en: 'Texas A&amp;M<br>University at Qatar', ar: 'جامعة تكساس إيه آند إم<br>في قطر' },
    sub4Date: { en: '29 Apr 2025<br>09:30 AM', ar: '29 أبريل 2025<br>09:30 ص' },

    opp5Name: { en: 'Data Visualization Workshop', ar: 'ورشة تصور البيانات' },
    opp5Comp: { en: 'Information Literacy', ar: 'الثقافة المعلوماتية' },
    student5Name: { en: 'Noora Mohammed', ar: 'نورة محمد' },
    org5: { en: 'HEC Paris<br>Doha', ar: 'إيتش إي سي باريس<br>الدوحة' },
    sub5Date: { en: '28 Apr 2025<br>02:10 PM', ar: '28 أبريل 2025<br>02:10 م' },
    priorityLow: { en: 'Low', ar: 'منخفضة' },
    due5: { en: '07 May 2025<br><span>(4 days left)</span>', ar: '07 مايو 2025<br><span>(يتبقى 4 أيام)</span>' },

    showingSubmissions: { en: 'Showing 1 to 5 of 1,248 submissions', ar: 'عرض 1 إلى 5 من أصل 1,248 تقديمًا' },
    rowsPerPage: { en: 'Rows per page:', ar: 'عدد الصفوف في الصفحة:' },

    submissionsByType: { en: 'Submissions by Type', ar: 'التقديمات حسب النوع' },
    thisMonth: { en: 'This Month', ar: 'هذا الشهر' },
    totalLabel: { en: 'Total', ar: 'الإجمالي' },
    skillAchievements: { en: 'Skill Achievements', ar: 'إنجازات المهارات' },
    badgeIssuance: { en: 'Badge Issuance', ar: 'إصدار الشارات' },
    evidenceSubmission: { en: 'Evidence Submission', ar: 'تقديم الأدلة' },
    competencyLevel: { en: 'Competency Level', ar: 'مستوى الكفاءة' },
    othersLabel: { en: 'Others', ar: 'أخرى' },

    verificationStatusTrend: { en: 'Verification Status Trend', ar: 'اتجاه حالة التحقق' },
    approvedLabel: { en: 'Approved', ar: 'مقبول' },
    revisionsRequested: { en: 'Revisions Requested', ar: 'طلب مراجعة' },
    rejectedLabel: { en: 'Rejected', ar: 'مرفوض' },
    d01Apr: { en: '01 Apr', ar: '01 أبريل' },
    d08Apr: { en: '08 Apr', ar: '08 أبريل' },
    d15Apr: { en: '15 Apr', ar: '15 أبريل' },
    d22Apr: { en: '22 Apr', ar: '22 أبريل' },
    d29Apr: { en: '29 Apr', ar: '29 أبريل' },

    verificationOverview: { en: 'Verification Overview', ar: 'نظرة عامة على التحقق' },
    withdrawnLabel: { en: 'Withdrawn', ar: 'مسحوب' },
    viewFullReport: { en: 'View Full Report', ar: 'عرض التقرير الكامل' },

    reviewTurnaroundTime: { en: 'Review Turnaround Time', ar: 'وقت إنجاز المراجعة' },
    averageTime: { en: 'Average Time', ar: 'متوسط الوقت' },
    avgTimeValue: { en: '1.8 Days', ar: '1.8 يوم' },
    down04Days: { en: '↓ 0.4 days', ar: '↓ 0.4 يوم' },
    withinSLA: { en: 'Within SLA', ar: 'ضمن اتفاقية مستوى الخدمة' },
    viewSLAReport: { en: 'View SLA Report', ar: 'عرض تقرير اتفاقية مستوى الخدمة' },

    recentActivities: { en: 'Recent Activities', ar: 'الأنشطة الأخيرة' },
    actAchievementVerified: { en: 'Achievement Verified', ar: 'تم التحقق من الإنجاز' },
    ract1Time: { en: '02 May 2025, 11:20 AM<br>by Aisha Al-Emadi', ar: '02 مايو 2025، 11:20 ص<br>بواسطة عائشة العمادي' },
    actRevisionRequested: { en: 'Revision Requested', ar: 'تم طلب مراجعة' },
    ract2Time: { en: '02 May 2025, 10:45 AM<br>by Mohammed Al-Mee', ar: '02 مايو 2025، 10:45 ص<br>بواسطة محمد المير' },
    actEvidenceApproved: { en: 'Evidence Approved', ar: 'تم قبول الأدلة' },
    actSustainBadge: { en: 'QF Sustainability Challenge Badge', ar: 'شارة تحدي مؤسسة قطر للاستدامة' },
    ract3Time: { en: '02 May 2025, 09:30 AM<br>by Fatima Al-Kaabi', ar: '02 مايو 2025، 09:30 ص<br>بواسطة فاطمة الكعبي' },
    actSubmissionRejected: { en: 'Submission Rejected', ar: 'تم رفض التقديم' },
    ract4Time: { en: '01 May 2025, 04:15 PM<br>by Ahmed Al-Hajri', ar: '01 مايو 2025، 04:15 م<br>بواسطة أحمد الهاجري' },
    actAppealSubmitted: { en: 'Appeal Submitted', ar: 'تم تقديم استئناف' },
    ract5Time: { en: '01 May 2025, 02:50 PM<br>by Khalid Hassan', ar: '01 مايو 2025، 02:50 م<br>بواسطة خالد حسن' },
    viewAllActivities: { en: 'View All Activities', ar: 'عرض جميع الأنشطة' },

    astNote4: { en: 'All times are displayed in Arabia Standard Time (AST).', ar: 'يتم عرض جميع الأوقات بتوقيت السعودية القياسي (AST).' }
  };

  var STORE_KEY = 'qfReviewLang';

  function decode(str) {
    return str.replace(/&amp;/g, '&');
  }

  function apply(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var entry = DICT[el.getAttribute('data-i18n')];
      if (!entry) return;
      if (el.namespaceURI === 'http://www.w3.org/2000/svg') {
        el.textContent = decode(entry[lang]).replace(/<br>/g, ' ');
      } else {
        el.innerHTML = decode(entry[lang]);
      }
    });

    var scope = document.querySelector('.adm-review-scope');
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
