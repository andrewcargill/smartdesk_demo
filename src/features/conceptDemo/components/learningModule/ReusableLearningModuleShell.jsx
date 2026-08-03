import { useMemo, useState } from 'react';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { useConceptDemoLanguage } from '../../ConceptDemoLanguageContext.jsx';
import { resolveLocalizedValue } from '../../i18n/conceptDemoTranslations.js';
import SubjectWorkspaceContainer from '../SubjectWorkspaceContainer.jsx';
import {
  defaultLearningModuleScreenId,
  getLearningModuleNavigationItems,
  getLearningModuleScreen,
} from './screens/learningModuleScreens.js';

const legacyScreenIds = {
  classPicture: 'class-picture',
};

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

function createModuleViewModel(moduleData, language, t) {
  const navigationItems = getNavigationItems(moduleData, language, t);
  const defaultScreen = normalizeScreenId(moduleData?.navigation?.defaultScreen || navigationItems[0]?.id || defaultLearningModuleScreenId);
  const title = localizeValue(moduleData?.title, language, t('learningModule.fallbackTitle'));
  const subtitle = localizeValue(moduleData?.subtitle, language, t('learningModule.fallbackSubtitle'));

  return {
    id: moduleData?.id || 'learning-module',
    title,
    subtitle,
    subjectId: moduleData?.subjectId || null,
    classId: moduleData?.classId || null,
    className: localizeValue(moduleData?.className, language, moduleData?.classId || t('learningModule.fallbackClassName')),
    subjectTitle: localizeValue(moduleData?.subjectTitle, language, getSubjectTitle(moduleData?.subjectId, t)),
    headerSubtitle: localizeValue(moduleData?.headerSubtitle, language, subtitle),
    contextLine: localizeValue(moduleData?.contextLine, language, ''),
    classData: localizeContent(moduleData?.classData || {}, language),
    curriculum: localizeContent(moduleData?.curriculum || {}, language),
    lessons: localizeContent(moduleData?.lessons || {}, language),
    evidence: localizeContent(moduleData?.evidence || {}, language),
    screens: localizeScreens(moduleData?.screens, language),
    navigation: {
      defaultScreen,
      items: navigationItems,
    },
    source: moduleData || {},
  };
}

export default function ReusableLearningModuleShell({ moduleData, onBack }) {
  const { language, t } = useConceptDemoLanguage();
  const moduleViewModel = useMemo(() => createModuleViewModel(moduleData, language, t), [language, moduleData, t]);
  const [activeScreen, setActiveScreen] = useState(moduleViewModel.navigation.defaultScreen);
  const activeScreenDefinition = getLearningModuleScreen(activeScreen);
  const ActiveScreen = activeScreenDefinition.component;
  const activeScreenConfig = {
    ...activeScreenDefinition,
    ...(moduleViewModel.screens[activeScreenDefinition.id] || {}),
  };

  return (
    <SubjectWorkspaceContainer
      title={`${moduleViewModel.subjectTitle} · ${moduleViewModel.className}`}
      subtitle={moduleViewModel.headerSubtitle}
      contextLine={moduleViewModel.contextLine}
      activeMode={activeScreen}
      onModeChange={setActiveScreen}
      onBack={onBack}
      menuItems={[
        {
          id: `${moduleViewModel.id}-next-lesson`,
          label: t('learningModule.shell.nextLesson'),
          icon: <SkipNextIcon fontSize="small" />,
          disabled: true,
        },
        {
          id: `${moduleViewModel.id}-reset-demo`,
          label: t('learningModule.shell.resetDemo'),
          icon: <RestartAltIcon fontSize="small" />,
          disabled: true,
        },
      ]}
    >
      <ActiveScreen
        moduleConfig={moduleViewModel}
        screenConfig={activeScreenConfig}
        activeScreenId={activeScreenDefinition.id}
      />
    </SubjectWorkspaceContainer>
  );
}
