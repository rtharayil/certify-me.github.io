/* English / Arabic translations shared across the Create Opportunity
   wizard (Opportunity Details, Assign Competencies, Evidence
   Requirements). Every [data-i18n] element's text is swapped by
   key; the page's text direction flips to RTL and the Cairo Arabic
   typeface takes over in Arabic mode. The language choice is shared
   (sessionStorage key qfCreateOppLang) across all three steps so it
   persists as the admin moves through the wizard, matching the
   Competency Framework flow's pattern. */
(function () {
  var DICT = {
    adminPortal: { en: 'Administrator Portal', ar: 'بوابة المسؤول' },
    myProfile: { en: 'My Profile', ar: 'الملف الشخصي' },
    settingsLabel: { en: 'Settings', ar: 'الإعدادات' },
    signOut: { en: 'Sign Out', ar: 'تسجيل الخروج' },

    pageTitle: { en: 'Create Opportunity', ar: 'إنشاء فرصة' },
    pageSubtitle: { en: 'Set up a learning, project or workplace opportunity and link it to competencies with evidence and verification.', ar: 'إعداد فرصة تعلم أو مشروع أو فرصة عمل وربطها بالكفاءات مع الأدلة والتحقق.' },
    saveAsDraft: { en: 'Save as Draft', ar: 'حفظ كمسودة' },
    cancelLabel: { en: 'Cancel', ar: 'إلغاء' },
    backLabel: { en: 'Back', ar: 'رجوع' },

    stepOppDetails: { en: 'Opportunity Details', ar: 'تفاصيل الفرصة' },
    stepBasicInfo: { en: 'Basic information', ar: 'المعلومات الأساسية' },
    stepAssignComp: { en: 'Assign Competencies', ar: 'إسناد الكفاءات' },
    stepSelectConfigure: { en: 'Select and configure', ar: 'الاختيار والإعداد' },
    stepEvidenceReq: { en: 'Evidence Requirements', ar: 'متطلبات الأدلة' },
    stepDefineArtefacts: { en: 'Define artefacts', ar: 'تحديد المخرجات' },
    stepVerificationRules: { en: 'Verification &amp; Rules', ar: 'التحقق والقواعد' },
    stepSetVerifiers: { en: 'Set verifiers and criteria', ar: 'تحديد المدققين والمعايير' },
    stepReviewPublish: { en: 'Review &amp; Publish', ar: 'المراجعة والنشر' },
    stepConfirmLaunch: { en: 'Confirm and launch', ar: 'التأكيد والإطلاق' },

    oppPreviewTitle: { en: 'Opportunity Preview', ar: 'معاينة الفرصة' },
    editLabel: { en: 'Edit', ar: 'تعديل' },
    previewOppName: { en: 'QF Sustainability Challenge', ar: 'تحدي مؤسسة قطر للاستدامة' },
    typeCompetition: { en: 'Competition', ar: 'مسابقة' },
    hbkuName: { en: 'Qatar University', ar: 'جامعة قطر' },
    dateRangePreview: { en: '20 Jun 2025 - 20 Aug 2025', ar: '20 يونيو 2025 - 20 أغسطس 2025' },
    oppDescText: { en: 'A university-wide challenge inviting students to develop innovative solutions for a more sustainable future in Qatar and beyond.', ar: 'تحدٍ على مستوى الجامعة يدعو الطلاب لتطوير حلول مبتكرة من أجل مستقبل أكثر استدامة في قطر وخارجها.' },
    tagSustainability: { en: 'Sustainability', ar: 'الاستدامة' },
    tagInnovation: { en: 'Innovation', ar: 'الابتكار' },
    tagQnv2030: { en: 'Qatar National Vision 2030', ar: 'رؤية قطر الوطنية 2030' },

    copyright: { en: '© 2026 Qatar Foundation. All rights reserved.', ar: '© 2026 مؤسسة قطر. جميع الحقوق محفوظة.' },
    privacyPolicy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
    termsOfUse: { en: 'Terms of Use', ar: 'شروط الاستخدام' },
    supportLabel: { en: 'Support', ar: 'الدعم' },

    statusLabel: { en: 'Status', ar: 'الحالة' },
    statusDraft: { en: 'Draft', ar: 'مسودة' },

    /* index.html — Opportunity Details */
    oppDetailsTitle: { en: 'Opportunity Details', ar: 'تفاصيل الفرصة' },
    oppDetailsDesc: { en: 'Provide the key information about this opportunity.', ar: 'قدّم المعلومات الأساسية عن هذه الفرصة.' },
    oppTitleLabel: { en: 'Opportunity Title', ar: 'عنوان الفرصة' },
    oppTypeLabel: { en: 'Opportunity Type', ar: 'نوع الفرصة' },
    orgProgramLabel: { en: 'Organization / Program', ar: 'الجهة / البرنامج' },
    descriptionLabel: { en: 'Description', ar: 'الوصف' },
    startDateLabel: { en: 'Start Date', ar: 'تاريخ البدء' },
    endDateLabel: { en: 'End Date', ar: 'تاريخ الانتهاء' },
    appDeadlineLabel: { en: 'Application Deadline', ar: 'الموعد النهائي للتقديم' },
    targetAudienceLabel: { en: 'Target Audience', ar: 'الفئة المستهدفة' },
    studentsLabel: { en: 'Students', ar: 'الطلاب' },
    tagsLabel: { en: 'Tags', ar: 'الوسوم' },
    addTagLabel: { en: 'Add Tag', ar: 'إضافة وسم' },
    visibilityLabel: { en: 'Visibility', ar: 'مستوى الظهور' },
    publicDiscoverable: { en: 'Public (Discoverable)', ar: 'عام (قابل للاكتشاف)' },
    additionalSettingsTitle: { en: 'Additional Settings', ar: 'إعدادات إضافية' },
    additionalSettingsDesc: { en: 'Configure optional settings for this opportunity.', ar: 'إعداد الخيارات الاختيارية لهذه الفرصة.' },
    featuredImageLabel: { en: 'Featured Image', ar: 'الصورة المميزة' },
    dragDropImage: { en: 'Drag and drop an image, or', ar: 'اسحب وأفلت صورة، أو' },
    chooseFileLabel: { en: 'Choose File', ar: 'اختيار ملف' },
    recommendedSize: { en: 'Recommended size: 1200 &times; 630 px (JPG, PNG)', ar: 'المقاس الموصى به: 1200 × 630 بكسل (JPG, PNG)' },
    externalLinksLabel: { en: 'External Links', ar: 'روابط خارجية' },
    optionalLabel: { en: '(Optional)', ar: '(اختياري)' },
    programWebsiteLabel: { en: 'Program Website', ar: 'موقع البرنامج' },
    applicationLinkLabel: { en: 'Application Link', ar: 'رابط التقديم' },
    infoGuideLabel: { en: 'Information Guide', ar: 'دليل المعلومات' },
    exampleGuideUrl: { en: 'https://example.com/guide', ar: 'https://example.com/guide' },
    keyInfoTitle: { en: 'Key Information', ar: 'معلومات أساسية' },
    oppIdLabel: { en: 'Opportunity ID', ar: 'معرّف الفرصة' },
    autoGenerated: { en: 'AUTO-GENERATED', ar: 'يُنشأ تلقائيًا' },
    createdByLabel: { en: 'Created By', ar: 'أُنشئ بواسطة' },
    createdOnLabel: { en: 'Created On', ar: 'تاريخ الإنشاء' },
    lastUpdatedLabel: { en: 'Last Updated', ar: 'آخر تحديث' },
    tipText: { en: '<b>Tip:</b> After creating the opportunity, you will assign competencies, define evidence requirements and select verifiers in the next steps.', ar: '<b>ملاحظة:</b> بعد إنشاء الفرصة، ستقوم بإسناد الكفاءات وتحديد متطلبات الأدلة واختيار المدققين في الخطوات التالية.' },
    nextAssignComp: { en: 'Next: Assign Competencies', ar: 'التالي: إسناد الكفاءات' },

    /* assign-competencies.html */
    assignCompTitle: { en: 'Assign Competencies', ar: 'إسناد الكفاءات' },
    assignCompDesc: { en: 'Select the relevant competencies for this opportunity and define the expected proficiency levels.', ar: 'اختر الكفاءات المرتبطة بهذه الفرصة وحدد مستويات الإتقان المتوقعة.' },
    browseCompTitle: { en: 'Browse Competencies', ar: 'تصفح الكفاءات' },
    viewFrameworkLabel: { en: 'View Framework', ar: 'عرض الإطار' },
    searchCompPlaceholder: { en: 'Search competencies by name, keyword or code...', ar: 'البحث عن الكفاءات بالاسم أو الكلمة المفتاحية أو الرمز...' },
    allDomains: { en: 'All Domains', ar: 'جميع المجالات' },
    allLevels: { en: 'All Levels', ar: 'جميع المستويات' },
    allFrameworks: { en: 'All Frameworks', ar: 'جميع الأطر' },

    c3Name: { en: 'Systems Thinking', ar: 'التفكير المنظومي' },
    c3DescBr: { en: 'Understand relationships between<br>interconnected systems.', ar: 'فهم العلاقات بين<br>الأنظمة المترابطة.' },
    dSystemsCriticalBr: { en: 'Systems &amp;<br>Critical Thinking', ar: 'التفكير المنظومي<br>والنقدي' },
    dSystemsCritical: { en: 'Systems &amp; Critical Thinking', ar: 'التفكير المنظومي والنقدي' },
    c8Name: { en: 'Civic Values &amp; Social Responsibility', ar: 'القيم المدنية والمسؤولية الاجتماعية' },
    c8NameBr: { en: 'Civic Values &amp;<br>Social Responsibility', ar: 'القيم المدنية<br>والمسؤولية الاجتماعية' },
    c8DescBr: { en: 'Engage responsibly as an active citizen<br>contributing to community and society.', ar: 'المشاركة بمسؤولية كمواطن فاعل<br>يساهم في المجتمع.' },
    dEthicsCivicBr: { en: 'Ethics &amp; Civic<br>Responsibility', ar: 'الأخلاق<br>والمسؤولية المدنية' },
    dEthicsCivic: { en: 'Ethics &amp; Civic Responsibility', ar: 'الأخلاق والمسؤولية المدنية' },
    c1Name: { en: 'Entrepreneurship', ar: 'ريادة الأعمال' },
    c1DescBr: { en: 'Identify opportunities and turn ideas<br>into innovative ventures.', ar: 'تحديد الفرص وتحويل الأفكار<br>إلى مشاريع مبتكرة.' },
    dPersonalLeadershipBr: { en: 'Personal &amp;<br>Leadership', ar: 'الشخصية<br>والقيادة' },
    dPersonalLeadership: { en: 'Personal &amp; Leadership', ar: 'الشخصية والقيادة' },
    c11Name: { en: 'Interpersonal &amp; Professional Communication', ar: 'التواصل الشخصي والمهني' },
    c11NameBr: { en: 'Interpersonal &amp;<br>Professional Communication', ar: 'التواصل الشخصي<br>والمهني' },
    c11DescBr: { en: 'Communicate ideas clearly and<br>effectively in diverse contexts.', ar: 'التعبير عن الأفكار بوضوح<br>وفعالية في سياقات متنوعة.' },
    dCommunication: { en: 'Communication', ar: 'التواصل' },
    c9Name: { en: 'Growth Mindset', ar: 'عقلية النمو' },
    c9DescBr: { en: 'Adapt, persevere and grow through<br>challenges and change.', ar: 'التكيف والمثابرة والنمو<br>من خلال التحديات والتغيير.' },
    c4Name: { en: 'Information Literacy', ar: 'الثقافة المعلوماتية' },
    c4DescBr: { en: 'Evaluate and use data, media and AI<br>tools responsibly and effectively.', ar: 'تقييم واستخدام البيانات والوسائط<br>وأدوات الذكاء الاصطناعي بمسؤولية وفعالية.' },
    dDigitalDataBr: { en: 'Digital &amp; Data<br>Literacy', ar: 'الثقافة الرقمية<br>والبيانات' },
    c5Name: { en: 'Ethical Reasoning', ar: 'التفكير الأخلاقي' },
    c5DescBr: { en: 'Make informed, principled decisions<br>that consider ethical impacts.', ar: 'اتخاذ قرارات مدروسة ومبدئية<br>تراعي الآثار الأخلاقية.' },
    c7Name: { en: 'Glocal Learning', ar: 'التعلم العالمي المحلي' },
    c7DescBr: { en: 'Apply global perspectives to address<br>local challenges and opportunities.', ar: 'تطبيق منظورات عالمية لمعالجة<br>التحديات والفرص المحلية.' },
    dGlobalInterculturalBr: { en: 'Global &amp;<br>Intercultural Studies', ar: 'الدراسات العالمية<br>بين الثقافات' },

    selectedCompCount: { en: 'Selected Competencies (4)', ar: 'الكفاءات المختارة (4)' },
    clearAll: { en: 'Clear All', ar: 'مسح الكل' },
    proficiencyLevel: { en: 'Proficiency Level', ar: 'مستوى الإتقان' },
    level3Proficient: { en: 'Level 3 - Expert', ar: 'المستوى 3 - خبير' },
    level2Intermediate: { en: 'Level 2 - Proficient', ar: 'المستوى 2 - متمكن' },
    level1Foundational: { en: 'Level 1 - Foundational', ar: 'المستوى 1 - تأسيسي' },
    assignCompInfo: { en: 'These competencies will be linked to evidence requirements and verification in the next steps. You can adjust proficiency levels anytime before publishing.', ar: 'سيتم ربط هذه الكفاءات بمتطلبات الأدلة والتحقق في الخطوات التالية. يمكنك تعديل مستويات الإتقان في أي وقت قبل النشر.' },
    compSummaryTitle: { en: 'Competency Summary', ar: 'ملخص الكفاءات' },
    competenciesLabel: { en: 'Competencies', ar: 'الكفاءات' },
    profLevelDist: { en: 'Proficiency Level Distribution', ar: 'توزيع مستويات الإتقان' },
    level3ProficientBr: { en: 'Level 3<br>Expert', ar: 'المستوى 3<br>خبير' },
    level2IntermediateBr: { en: 'Level 2<br>Proficient', ar: 'المستوى 2<br>متمكن' },
    level1FoundationalBr: { en: 'Level 1<br>Foundational', ar: 'المستوى 1<br>تأسيسي' },
    nextEvidenceReq: { en: 'Next: Evidence Requirements', ar: 'التالي: متطلبات الأدلة' },

    /* evidence-requirements.html */
    evidenceReqTitle: { en: 'Evidence Requirements', ar: 'متطلبات الأدلة' },
    evidenceReqDesc: { en: 'Define what learners need to submit for each selected competency. You can specify the type of evidence, instructions and whether it is mandatory.', ar: 'حدد ما يجب على المتعلمين تقديمه لكل كفاءة مختارة. يمكنك تحديد نوع الدليل والتعليمات وما إذا كان إلزاميًا.' },
    compCount4: { en: 'Competencies (4)', ar: 'الكفاءات (4)' },
    level3ProficientDash: { en: 'Level 3 – Expert', ar: 'المستوى 3 – خبير' },
    level2IntermediateDash: { en: 'Level 2 – Proficient', ar: 'المستوى 2 – متمكن' },
    evidenceForLabel: { en: 'Evidence for', ar: 'الأدلة الخاصة بـ' },
    configureEvidenceDesc: { en: 'Configure the evidence items that learners must submit for this competency.', ar: 'إعداد عناصر الأدلة التي يجب على المتعلمين تقديمها لهذه الكفاءة.' },
    addEvidenceLabel: { en: 'Add Evidence', ar: 'إضافة دليل' },
    projectReportLabel: { en: 'Project Report', ar: 'تقرير المشروع' },
    requiredLabel: { en: 'Required', ar: 'إلزامي' },
    projectReportDesc: { en: 'A detailed report outlining the problem, methodology, findings and recommendations.', ar: 'تقرير مفصل يوضح المشكلة والمنهجية والنتائج والتوصيات.' },
    evidenceTypeLabel: { en: 'Evidence Type', ar: 'نوع الدليل' },
    docPdfDoc: { en: 'Document (PDF, DOC, etc.)', ar: 'مستند (PDF, DOC، إلخ)' },
    presentationLabel: { en: 'Presentation', ar: 'عرض تقديمي' },
    presentationDesc: { en: 'Slide deck or recorded presentation explaining your solution and impact.', ar: 'عرض شرائح أو عرض تقديمي مسجل يشرح الحل والأثر.' },
    presentationPptPdfVideo: { en: 'Presentation (PPT, PDF, Video)', ar: 'عرض تقديمي (PPT, PDF, فيديو)' },
    reflectionLabel: { en: 'Reflection', ar: 'تأمل' },
    reflectionDesc: { en: 'A reflective write-up on what you learned, challenges faced and future improvements.', ar: 'كتابة تأملية عما تعلمته والتحديات التي واجهتها والتحسينات المستقبلية.' },
    writtenReflection: { en: 'Written Reflection', ar: 'تأمل مكتوب' },
    evidenceDetailsTitle: { en: 'Evidence Details', ar: 'تفاصيل الدليل' },
    titleLabel: { en: 'Title', ar: 'العنوان' },
    mandatoryLabel: { en: 'Mandatory', ar: 'إلزامي' },
    acceptableFileTypesLabel: { en: 'Acceptable File Types', ar: 'أنواع الملفات المقبولة' },
    instructionsForLearnersLabel: { en: 'Instructions for Learners', ar: 'تعليمات للمتعلمين' },
    uploadPdfInstructions: { en: 'Upload a PDF document (maximum 10 MB) containing your project report. Include executive summary, methodology, results and impact.', ar: 'ارفع مستند PDF (بحد أقصى 10 ميغابايت) يحتوي على تقرير مشروعك. أدرج الملخص التنفيذي والمنهجية والنتائج والأثر.' },
    maxFileSizeLabel: { en: 'Maximum File Size', ar: 'الحد الأقصى لحجم الملف' },
    evalCriteriaLabel: { en: 'Evaluation Criteria (optional)', ar: 'معايير التقييم (اختياري)' },
    evalCriteriaText: { en: 'Clarity of analysis, depth of insights, and evidence of impact.', ar: 'وضوح التحليل، عمق الرؤى، والدليل على الأثر.' },
    deleteEvidenceLabel: { en: 'Delete Evidence', ar: 'حذف الدليل' },
    updateEvidenceLabel: { en: 'Update Evidence', ar: 'تحديث الدليل' },
    selectedCompetencyTitle: { en: 'Selected Competency', ar: 'الكفاءة المختارة' },
    evidenceReqCount3: { en: 'Evidence Requirements (3)', ar: 'متطلبات الأدلة (3)' },
    viewAll: { en: 'View All', ar: 'عرض الكل' },
    evidenceReqInfo: { en: 'Learners must submit all required evidence items for each competency. Evidence will be reviewed by the assigned verifiers in the next step.', ar: 'يجب على المتعلمين تقديم جميع عناصر الأدلة الإلزامية لكل كفاءة. ستتم مراجعة الأدلة من قبل المدققين المعينين في الخطوة التالية.' },
    nextVerificationRules: { en: 'Next: Verification &amp; Rules', ar: 'التالي: التحقق والقواعد' }
  };

  var STORE_KEY = 'qfCreateOppLang';

  function decode(str) {
    return str.replace(/&amp;/g, '&').replace(/&times;/g, '×');
  }

  function translate(key, lang) {
    var entry = DICT[key];
    if (!entry) return null;
    return decode(entry[lang]);
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

    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var entry = DICT[el.getAttribute('data-i18n-ph')];
      if (!entry) return;
      el.setAttribute('placeholder', decode(entry[lang]));
    });

    var evForName = document.getElementById('evForName');
    if (evForName) {
      var selectedRow = document.querySelector('.comp-side-row.selected');
      var prefix = translate('evidenceForLabel', lang) || 'Evidence for';
      var compKey = selectedRow ? selectedRow.getAttribute('data-i18n-name') : null;
      var compName = (compKey && translate(compKey, lang)) || (selectedRow ? selectedRow.getAttribute('data-name') : '');
      evForName.textContent = prefix + ': ' + compName;
    }

    ['adm-createopp-scope', 'adm-assigncomp-scope', 'adm-evidencereq-scope'].forEach(function (cls) {
      var scope = document.querySelector('.' + cls);
      if (scope) scope.classList.toggle('lang-ar', lang === 'ar');
    });

    document.querySelectorAll('#langToggle .lang-opt').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    try { sessionStorage.setItem(STORE_KEY, lang); } catch (e) {}
  }

  function currentLang() {
    var saved = 'en';
    try { saved = sessionStorage.getItem(STORE_KEY) || 'en'; } catch (e) {}
    return saved;
  }

  window.QFCreateOppI18n = { translate: translate, currentLang: currentLang, apply: apply };

  function init() {
    var toggle = document.getElementById('langToggle');
    if (toggle) {
      toggle.addEventListener('click', function (e) {
        var btn = e.target.closest('.lang-opt');
        if (!btn) return;
        apply(btn.getAttribute('data-lang'));
      });
    }

    apply(currentLang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
