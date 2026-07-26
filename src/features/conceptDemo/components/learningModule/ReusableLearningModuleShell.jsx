import { useMemo, useState } from 'react';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SubjectWorkspaceContainer from '../SubjectWorkspaceContainer.jsx';
import {
  defaultLearningModuleScreenId,
  getLearningModuleNavigationItems,
  getLearningModuleScreen,
} from './screens/learningModuleScreens.js';

function getSubjectTitle(subjectId) {
  if (subjectId === 'mathematics') {
    return 'Mathematics';
  }

  if (!subjectId) {
    return 'Learning';
  }

  return subjectId.charAt(0).toUpperCase() + subjectId.slice(1);
}

function createModuleViewModel(moduleData) {
  const navigationItems = moduleData?.navigation?.items?.length
    ? moduleData.navigation.items
    : getLearningModuleNavigationItems();

  return {
    id: moduleData?.id || 'learning-module',
    title: moduleData?.title || 'Learning module',
    subtitle: moduleData?.subtitle || 'Reusable class workspace',
    subjectId: moduleData?.subjectId || null,
    classId: moduleData?.classId || null,
    className: moduleData?.className || moduleData?.classId || 'Class',
    subjectTitle: moduleData?.subjectTitle || getSubjectTitle(moduleData?.subjectId),
    headerSubtitle: moduleData?.headerSubtitle || moduleData?.subtitle || 'Reusable class workspace',
    contextLine: moduleData?.contextLine || '',
    classData: moduleData?.classData || {},
    curriculum: moduleData?.curriculum || {},
    lessons: moduleData?.lessons || {},
    evidence: moduleData?.evidence || {},
    screens: moduleData?.screens || {},
    navigation: {
      defaultScreen: moduleData?.navigation?.defaultScreen || navigationItems[0]?.id || defaultLearningModuleScreenId,
      items: navigationItems,
    },
    source: moduleData || {},
  };
}

export default function ReusableLearningModuleShell({ moduleData, onBack }) {
  const moduleViewModel = useMemo(() => createModuleViewModel(moduleData), [moduleData]);
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
          label: 'Next lesson',
          icon: <SkipNextIcon fontSize="small" />,
          disabled: true,
        },
        {
          id: `${moduleViewModel.id}-reset-demo`,
          label: 'Reset demo',
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
