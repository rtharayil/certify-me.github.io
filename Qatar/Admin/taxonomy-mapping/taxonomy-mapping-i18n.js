/* English / Arabic translations for the Taxonomy Mapping page.
   Shares the sessionStorage key with the Competencies Management and
   Version History pages so the chosen language carries across the
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

    pageTitle: { en: 'Competency &rarr; Taxonomy Mapping', ar: 'ربط الكفاءة بالتصنيف' },
    pageSubtitle: { en: 'Link your competencies to global skills taxonomies to ensure interoperability and recognition.', ar: 'اربط كفاءاتك بتصنيفات المهارات العالمية لضمان قابلية التبادل والاعتراف بها.' },

    section1Title: { en: '1. Select Taxonomy', ar: '1. اختر التصنيف' },
    section1Help: { en: 'Choose a taxonomy and browse or search for relevant skills.', ar: 'اختر تصنيفًا وتصفح أو ابحث عن المهارات ذات الصلة.' },
    taxonomyLabel: { en: 'Taxonomy', ar: 'التصنيف' },
    escoOption: { en: 'ESCO – European Skills, Competences, Qualifications and Occupations', ar: 'ESCO – التصنيف الأوروبي للمهارات والكفاءات والمؤهلات والمهن' },
    searchEscoPlaceholder: { en: 'Search ESCO skills, concepts or codes...', ar: 'ابحث عن مهارات أو مفاهيم أو رموز ESCO...' },
    searchBySkill: { en: 'Search by Skill', ar: 'البحث حسب المهارة' },
    searchByOccupation: { en: 'Search by Occupation', ar: 'البحث حسب المهنة' },

    treeA: { en: 'A - Agriculture, Forestry and Fisheries (129)', ar: 'A - الزراعة والحراجة ومصايد الأسماك (129)' },
    treeB: { en: 'B - Arts and Humanities (256)', ar: 'B - الفنون والعلوم الإنسانية (256)' },
    treeC: { en: 'C - Business, Administration and Law (432)', ar: 'C - الأعمال والإدارة والقانون (432)' },
    treeD: { en: 'D - Natural Sciences, Mathematics and Statistics (310)', ar: 'D - العلوم الطبيعية والرياضيات والإحصاء (310)' },
    treeE: { en: 'E - Information and Communication Technologies (298)', ar: 'E - تكنولوجيا المعلومات والاتصالات (298)' },
    treeF: { en: 'F - Engineering, Manufacturing and Construction (412)', ar: 'F - الهندسة والتصنيع والبناء (412)' },
    treeG: { en: 'G - Health and Welfare (341)', ar: 'G - الصحة والرعاية الاجتماعية (341)' },
    treeH: { en: 'H - Education (268)', ar: 'H - التعليم (268)' },
    treeI: { en: 'I - Services (394)', ar: 'I - الخدمات (394)' },
    treeJ: { en: 'J - Environmental Protection (176)', ar: 'J - حماية البيئة (176)' },
    treeD1: { en: 'D.1 - Systems and Complexity Science (47)', ar: 'D.1 - علوم النظم والتعقيد (47)' },
    treeD11: { en: 'Analyze systems architecture (D.1.1)', ar: 'تحليل بنية الأنظمة (D.1.1)' },
    treeD11Bare: { en: 'Analyze systems architecture', ar: 'تحليل بنية الأنظمة' },
    treeD12: { en: 'Model complex adaptive systems (D.1.2)', ar: 'نمذجة الأنظمة التكيفية المعقدة (D.1.2)' },
    treeD13: { en: 'Apply systems thinking methodologies (D.1.3)', ar: 'تطبيق منهجيات التفكير المنظومي (D.1.3)' },
    treeD14: { en: 'Evaluate feedback loops and dependencies (D.1.4)', ar: 'تقييم حلقات التغذية الراجعة والترابطات (D.1.4)' },
    treeD2: { en: 'D.2 - Computational Modeling (39)', ar: 'D.2 - النمذجة الحاسوبية (39)' },
    treeD3: { en: 'D.3 - Statistical Analysis (33)', ar: 'D.3 - التحليل الإحصائي (33)' },
    treeD4: { en: 'D.4 - Applied Mathematics (41)', ar: 'D.4 - الرياضيات التطبيقية (41)' },

    section2Title: { en: '2. Map to Your Competency', ar: '2. الربط بكفاءتك' },
    section2Help: { en: 'Link one or more taxonomy skills to this competency and set the proficiency alignment.', ar: 'اربط مهارة واحدة أو أكثر من التصنيف بهذه الكفاءة وحدد مستوى التوافق.' },
    compNameSystems: { en: 'Systems Thinking', ar: 'التفكير المنظومي' },
    compDescSystems: { en: 'Understand relationships between<br>interconnected systems.', ar: 'فهم العلاقات بين<br>الأنظمة المترابطة.' },
    yourProfLevels: { en: 'Your Proficiency Levels', ar: 'مستويات إتقانك' },
    levelFoundational: { en: 'Foundational', ar: 'تأسيسي' },
    levelProficient: { en: 'Proficient', ar: 'متمكن' },
    levelExpert: { en: 'Expert', ar: 'خبير' },

    selectedSkillLabel: { en: 'Selected Taxonomy Skill', ar: 'مهارة التصنيف المحددة' },
    skillNameSystems: { en: 'Apply systems thinking methodologies', ar: 'تطبيق منهجيات التفكير المنظومي' },
    skillDescSystems: { en: 'Apply structured methods to understand how components of a system interact,<br>anticipate emergent behavior and design more effective interventions.', ar: 'تطبيق أساليب منهجية لفهم كيفية تفاعل مكوّنات النظام،<br>واستشراف السلوك الناشئ، وتصميم تدخلات أكثر فعالية.' },
    relevanceScore: { en: 'Relevance Score', ar: 'درجة الصلة' },
    highAlignment: { en: 'High alignment', ar: 'توافق مرتفع' },

    mappingDetailsTitle: { en: 'Mapping Details', ar: 'تفاصيل الربط' },
    yourCompLevel: { en: 'Your Competency Level', ar: 'مستوى كفاءتك' },
    level3Advanced: { en: 'Expert', ar: 'خبير' },
    mappingTypeLabel: { en: 'Mapping Type', ar: 'نوع الربط' },
    directMatch: { en: 'Direct Match', ar: 'تطابق مباشر' },

    justificationLabel: { en: 'Justification (optional)', ar: 'المبرر (اختياري)' },
    justificationText: { en: 'Direct alignment with ESCO definition. Skill represents core element of systems thinking competency.', ar: 'توافق مباشر مع تعريف ESCO. تمثل هذه المهارة عنصرًا أساسيًا في كفاءة التفكير المنظومي.' },
    mappingConfidence: { en: 'Mapping Confidence', ar: 'درجة الثقة في الربط' },
    confLow: { en: 'Low', ar: 'منخفضة' },
    confMedium: { en: 'Medium', ar: 'متوسطة' },
    confHigh: { en: 'High', ar: 'مرتفعة' },

    addAnotherSkill: { en: 'Add Another Taxonomy Skill', ar: 'إضافة مهارة تصنيف أخرى' },
    mappedSkillsTitle: { en: 'Mapped Taxonomy Skills (2)', ar: 'مهارات التصنيف المرتبطة (2)' },

    thSkill: { en: 'Skill', ar: 'المهارة' },
    thTaxonomy: { en: 'Taxonomy', ar: 'التصنيف' },
    thYourLevel: { en: 'Your Level', ar: 'مستواك' },
    thMappingType: { en: 'Mapping Type', ar: 'نوع الربط' },
    thConfidence: { en: 'Confidence', ar: 'الثقة' },
    thActions: { en: 'Actions', ar: 'الإجراءات' },
    level3: { en: 'Level 3', ar: 'المستوى 3' },
    level2: { en: 'Level 2', ar: 'المستوى 2' },
    relatedSkillType: { en: 'Related Skill', ar: 'مهارة ذات صلة' },

    currentMappingsTitle: { en: 'Current Mappings (2)', ar: 'الروابط الحالية (2)' },
    viewAllLink: { en: 'View All', ar: 'عرض الكل' },
    primaryBadge: { en: 'Primary', ar: 'أساسي' },
    levelArrowEsco3: { en: 'Your Level 3 &rarr; ESCO Level 3', ar: 'مستواك 3 &larr; مستوى ESCO 3' },
    levelArrowEsco2: { en: 'Your Level 2 &rarr; ESCO Level 2', ar: 'مستواك 2 &larr; مستوى ESCO 2' },

    skillInfoTitle: { en: 'Skill Information (from ESCO)', ar: 'معلومات المهارة (من ESCO)' },
    viewInEsco: { en: 'View in ESCO &#8599;', ar: 'عرض في ESCO &#8599;' },
    infoSkillUri: { en: 'Skill URI', ar: 'رابط المهارة' },
    infoSkillType: { en: 'Skill Type', ar: 'نوع المهارة' },
    infoSkillTypeVal: { en: 'Skill', ar: 'مهارة' },
    infoStatus: { en: 'Status', ar: 'الحالة' },
    infoStatusVal: { en: 'Valid', ar: 'سارية' },
    infoCreated: { en: 'Created', ar: 'تاريخ الإنشاء' },
    infoLastModified: { en: 'Last Modified', ar: 'آخر تعديل' },
    infoBroaderConcept: { en: 'Broader Concept', ar: 'المفهوم الأوسع' },
    broaderConceptVal: { en: 'D.1 - Systems and Complexity Science', ar: 'D.1 - علوم النظم والتعقيد' },
    infoRelatedSkills: { en: 'Related Skills', ar: 'المهارات ذات الصلة' },
    infoScopeNote: { en: 'Scope Note', ar: 'ملاحظة النطاق' },
    scopeNoteVal: { en: 'Involves applying structured approaches to analyze how parts of a system interact, anticipate emergent behavior and improve decision-making across complex processes.', ar: 'يتضمن تطبيق مناهج منهجية لتحليل كيفية تفاعل أجزاء النظام، واستشراف السلوك الناشئ، وتحسين اتخاذ القرار عبر العمليات المعقدة.' },

    noteText: { en: 'Mapping to global taxonomies ensures<br>interoperability and enables recognition of<br>competencies across borders and systems.', ar: 'يضمن الربط بالتصنيفات العالمية قابلية التبادل<br>ويتيح الاعتراف بالكفاءات عبر الحدود<br>والأنظمة.' },

    backBtn: { en: 'Back', ar: 'رجوع' },
    saveDraftBtn: { en: 'Save as Draft', ar: 'حفظ كمسودة' },
    nextVersionHistory: { en: 'Next: Version History', ar: 'التالي: سجل الإصدارات' },
    arrowBack: { en: '&larr;', ar: '&rarr;' },
    arrowNext: { en: '&rarr;', ar: '&larr;' },

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
      var text = decode(entry[lang]);
      if (el.tagName === 'TEXTAREA') {
        el.value = text.replace(/<br>/g, '\n');
      } else {
        el.innerHTML = text;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var entry = DICT[el.getAttribute('data-i18n-placeholder')];
      if (!entry) return;
      el.setAttribute('placeholder', decode(entry[lang]));
    });

    var scope = document.querySelector('.adm-taxmap-scope');
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
