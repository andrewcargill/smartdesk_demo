import { useEffect, useMemo, useState } from 'react';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useConceptDemoLanguage } from '../../ConceptDemoLanguageContext.jsx';
import { resolveLocalizedValue } from '../../i18n/conceptDemoTranslations.js';
import SubjectWorkspaceContainer from '../SubjectWorkspaceContainer.jsx';
import {
  readLearningModuleLessonIndex,
  resetLearningModuleDemoStorage,
  resetLearningModuleLessonIndex,
  writeLearningModuleLessonIndex,
} from './utils/learningModuleDemoState.js';
import {
  defaultLearningModuleScreenId,
  getLearningModuleNavigationItems,
  getLearningModuleScreen,
} from './screens/learningModuleScreens.js';

const legacyScreenIds = {
  classPicture: 'class-picture',
};

const purple = '#9c28af';

function normalizeScreenId(screenId) {
  return legacyScreenIds[screenId] || screenId;
}

function localizeValue(value, language, fallback = '') {
  return resolveLocalizedValue(value, language) || fallback;
}

function isLocalizedValue(value) {
  return Boolean(
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && ('en' in value || 'sv' in value)
  );
}

function localizeContent(value, language) {
  if (Array.isArray(value)) {
    return value.map((item) => localizeContent(item, language));
  }

  if (isLocalizedValue(value)) {
    return resolveLocalizedValue(value, language);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((localizedObject, [key, currentValue]) => ({
      ...localizedObject,
      [key]: localizeContent(currentValue, language),
    }), {});
  }

  return value;
}

function getSubjectTitle(subjectId, t) {
  if (!subjectId) {
    return t('learningModule.fallbackSubject');
  }

  const translatedSubject = t(`subjects.${subjectId}`);

  return translatedSubject === `subjects.${subjectId}`
    ? subjectId.charAt(0).toUpperCase() + subjectId.slice(1)
    : translatedSubject;
}

function getNavigationItems(moduleData, language, t) {
  const navigationItems = moduleData?.navigation?.items?.length
    ? moduleData.navigation.items
    : getLearningModuleNavigationItems();

  return navigationItems.map((item) => {
    const id = normalizeScreenId(item.id);
    return {
      ...item,
      id,
      label: localizeValue(item.label, language, t(`learningModule.navigation.${id === 'class-picture' ? 'classPicture' : id}`)),
    };
  });
}

function localizeScreenConfig(screenConfig, language) {
  if (!screenConfig) {
    return {};
  }

  return {
    ...screenConfig,
    title: resolveLocalizedValue(screenConfig.title, language),
    description: resolveLocalizedValue(screenConfig.description, language),
  };
}

function localizeScreens(screens, language) {
  return Object.entries(screens || {}).reduce((localizedScreens, [screenId, screenConfig]) => ({
    ...localizedScreens,
    [normalizeScreenId(screenId)]: localizeScreenConfig(screenConfig, language),
  }), {});
}

function getLearningModuleLocale(language) {
  return language === 'sv' ? 'sv-SE' : 'en-GB';
}

function formatLessonDate(date, language) {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(getLearningModuleLocale(language), {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${date}T12:00:00`));
}

function createLessonContextLine(activeLesson, language, fallbackContextLine) {
  if (!activeLesson?.date) {
    return fallbackContextLine;
  }

  return [
    formatLessonDate(activeLesson.date, language),
    [activeLesson.startTime, activeLesson.endTime].filter(Boolean).join('-'),
  ].filter(Boolean).join(' · ');
}

function createModuleViewModel(moduleData, language, t, { activeLessonIndex = 0, resetToken = 0 } = {}) {
  const navigationItems = getNavigationItems(moduleData, language, t);
  const defaultScreen = normalizeScreenId(moduleData?.navigation?.defaultScreen || navigationItems[0]?.id || defaultLearningModuleScreenId);
  const title = localizeValue(moduleData?.title, language, t('learningModule.fallbackTitle'));
  const subtitle = localizeValue(moduleData?.subtitle, language, t('learningModule.fallbackSubtitle'));
  const lessons = localizeContent(moduleData?.lessons || {}, language);
  const lessonSequence = Array.isArray(lessons.sequence) ? lessons.sequence : [];
  const activeLesson = lessonSequence[activeLessonIndex] || lessons.current || lessonSequence[0] || null;
  const fallbackContextLine = localizeValue(moduleData?.contextLine, language, '');

  return {
    id: moduleData?.id || 'learning-module',
    title,
    subtitle,
    subjectId: moduleData?.subjectId || null,
    classId: moduleData?.classId || null,
    className: localizeValue(moduleData?.className, language, moduleData?.classId || t('learningModule.fallbackClassName')),
    subjectTitle: localizeValue(moduleData?.subjectTitle, language, getSubjectTitle(moduleData?.subjectId, t)),
    headerSubtitle: localizeValue(moduleData?.headerSubtitle, language, subtitle),
    contextLine: createLessonContextLine(activeLesson, language, fallbackContextLine),
    classData: localizeContent(moduleData?.classData || {}, language),
    curriculum: localizeContent(moduleData?.curriculum || {}, language),
    lessons: {
      ...lessons,
      current: activeLesson,
      activeIndex: activeLessonIndex,
    },
    evidence: localizeContent(moduleData?.evidence || {}, language),
    planning: localizeContent(moduleData?.planning || {}, language),
    screens: localizeScreens(moduleData?.screens, language),
    navigation: {
      defaultScreen,
      items: navigationItems,
    },
    demoResetToken: resetToken,
    source: moduleData || {},
  };
}

export default function ReusableLearningModuleShell({ moduleData, onBack }) {
  const { language, t } = useConceptDemoLanguage();
  const moduleId = moduleData?.id || 'learning-module';
  const lessonCount = moduleData?.lessons?.sequence?.length || 0;
  const [activeLessonIndex, setActiveLessonIndex] = useState(() => readLearningModuleLessonIndex(moduleId, lessonCount));
  const [resetToken, setResetToken] = useState(0);
  const moduleViewModel = useMemo(
    () => createModuleViewModel(moduleData, language, t, { activeLessonIndex, resetToken }),
    [activeLessonIndex, language, moduleData, resetToken, t],
  );
  const [activeScreen, setActiveScreen] = useState(moduleViewModel.navigation.defaultScreen);
  const activeScreenDefinition = getLearningModuleScreen(activeScreen);
  const ActiveScreen = activeScreenDefinition.component;
  const activeScreenConfig = {
    ...activeScreenDefinition,
    ...(moduleViewModel.screens[activeScreenDefinition.id] || {}),
  };
  const canAdvanceLesson = activeLessonIndex < Math.max(0, lessonCount - 1);

  useEffect(() => {
    console.groupCollapsed('[LearningModuleShell] render state');
    console.log({
      moduleId,
      hasModuleData: Boolean(moduleData),
      language,
      subjectId: moduleViewModel.subjectId,
      classId: moduleViewModel.classId,
      title: moduleViewModel.title,
      subjectTitle: moduleViewModel.subjectTitle,
      className: moduleViewModel.className,
      lessonCount,
      activeLessonIndex,
      activeLesson: moduleViewModel.lessons.current?.id || moduleViewModel.lessons.current?.title || null,
      activeScreen,
      resolvedScreen: activeScreenDefinition.id,
      navigationDefault: moduleViewModel.navigation.defaultScreen,
      navigationItems: moduleViewModel.navigation.items.map((item) => item.id),
      studentCount: moduleViewModel.classData?.students?.length || 0,
      curriculumUnits: moduleViewModel.curriculum?.teachingUnits?.length || 0,
      evidenceItems: moduleViewModel.evidence?.items?.length || 0,
      planningBlocks: moduleViewModel.planning?.blocks?.length || 0,
    });
    console.groupEnd();
  }, [
    activeLessonIndex,
    activeScreen,
    activeScreenDefinition.id,
    language,
    lessonCount,
    moduleData,
    moduleId,
    moduleViewModel,
  ]);

  function advanceLesson() {
    if (!canAdvanceLesson) {
      return;
    }

    setActiveLessonIndex((currentIndex) => writeLearningModuleLessonIndex(moduleId, currentIndex + 1, lessonCount));
  }

  function resetDemo() {
    resetLearningModuleDemoStorage({
      moduleId,
      subjectId: moduleData?.subjectId || 'learning',
      classId: moduleData?.classId || moduleId,
    });
    setActiveLessonIndex(resetLearningModuleLessonIndex(moduleId));
    setResetToken((currentToken) => currentToken + 1);
  }

  return (
    <SubjectWorkspaceContainer
      title={`${moduleViewModel.subjectTitle} · ${moduleViewModel.className}`}
      subtitle={moduleViewModel.headerSubtitle}
      contextLine={moduleViewModel.contextLine}
      activeMode={activeScreen}
      onModeChange={setActiveScreen}
      onBack={onBack}
      headerActions={(
        <Stack
          direction="row"
          spacing={0.9}
          alignItems="center"
          sx={{
            alignSelf: { xs: 'flex-start', sm: 'center' },
            px: 1,
            py: 0.55,
            borderRadius: '999px',
            border: '1px solid rgba(23, 21, 26, 0.1)',
            bgcolor: '#fff',
            height: 44,
          }}
        >
          <Stack spacing={0.35} sx={{ minWidth: 82 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 10.6, fontWeight: 780, lineHeight: 1 }}>
              {t('learningModule.shell.lessonProgress', { current: Math.min(activeLessonIndex + 1, Math.max(lessonCount, 1)), total: Math.max(lessonCount, 1) })}
            </Typography>
            <Stack direction="row" spacing={0.35} aria-hidden="true">
              {Array.from({ length: Math.max(lessonCount, 1) }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 18,
                    height: 4,
                    borderRadius: '999px',
                    bgcolor: index <= activeLessonIndex ? purple : 'rgba(156, 40, 175, 0.16)',
                  }}
                />
              ))}
            </Stack>
          </Stack>
          <Tooltip title={canAdvanceLesson ? t('learningModule.shell.nextLesson') : t('learningModule.shell.finalLesson')}>
            <Box component="span" sx={{ display: 'inline-flex' }}>
              <IconButton
                size="small"
                aria-label={canAdvanceLesson ? t('learningModule.shell.nextLesson') : t('learningModule.shell.finalLesson')}
                disabled={!canAdvanceLesson}
                onClick={advanceLesson}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '999px',
                  bgcolor: 'rgba(156, 40, 175, 0.09)',
                  color: purple,
                  border: '1px solid rgba(156, 40, 175, 0.16)',
                  '&:hover': {
                    bgcolor: 'rgba(156, 40, 175, 0.13)',
                    borderColor: 'rgba(156, 40, 175, 0.24)',
                  },
                  '&.Mui-disabled': {
                    color: 'rgba(23, 21, 26, 0.38)',
                    bgcolor: 'rgba(23, 21, 26, 0.07)',
                    borderColor: 'rgba(23, 21, 26, 0.08)',
                  },
                }}
              >
                <SkipNextIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Box>
          </Tooltip>
          <Tooltip title={t('learningModule.shell.resetDemo')}>
            <IconButton
              size="small"
              aria-label={t('learningModule.shell.resetDemo')}
              onClick={resetDemo}
              sx={{
                width: 30,
                height: 30,
                borderRadius: '999px',
                color: 'rgba(23, 21, 26, 0.56)',
                border: '1px solid rgba(23, 21, 26, 0.1)',
                bgcolor: '#fff',
                '&:hover': {
                  color: purple,
                  bgcolor: 'rgba(156, 40, 175, 0.07)',
                  borderColor: 'rgba(156, 40, 175, 0.18)',
                },
              }}
            >
              <RestartAltIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
      menuItems={[]}
    >
      <ActiveScreen
        moduleConfig={moduleViewModel}
        screenConfig={activeScreenConfig}
        activeScreenId={activeScreenDefinition.id}
      />
    </SubjectWorkspaceContainer>
  );
}
