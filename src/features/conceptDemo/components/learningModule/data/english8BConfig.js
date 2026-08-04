export const english8BConfig = {
  id: 'english-8b',
  subjectId: 'english',
  classId: '8b',
  title: {
    en: 'English 8B',
    sv: 'Engelska 8B',
  },
  subtitle: {
    en: 'Reusable module test config',
    sv: '\u00c5teranv\u00e4ndbar testkonfiguration',
  },
  className: '8B',
  navigation: {
    defaultScreen: 'class-picture',
    items: [
      { id: 'class-picture', label: { en: 'Class Overview', sv: 'Klass\u00f6versikt' } },
      { id: 'plan', label: { en: 'Plan', sv: 'Planering' } },
      { id: 'now', label: { en: 'Now', sv: 'Nu' } },
      { id: 'assessment', label: { en: 'Assessment', sv: 'Bed\u00f6mning' } },
    ],
  },
};
