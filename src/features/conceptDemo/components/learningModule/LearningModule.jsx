import { useEffect } from 'react';
import ReusableLearningModuleShell from './ReusableLearningModuleShell.jsx';

function getDemoStorageSnapshot() {
  if (typeof window === 'undefined') {
    return {};
  }

  return Object.keys(window.localStorage)
    .filter((key) => key.includes('smartdesk') || key.includes('learning'))
    .sort()
    .reduce((snapshot, key) => ({
      ...snapshot,
      [key]: window.localStorage.getItem(key),
    }), {});
}

export default function LearningModule({ config, onBack }) {
  useEffect(() => {
    console.groupCollapsed('[LearningModule] received config');
    console.log({
      hasConfig: Boolean(config),
      id: config?.id,
      subjectId: config?.subjectId,
      classId: config?.classId,
      className: config?.className,
      navigationDefault: config?.navigation?.defaultScreen,
      navigationItems: config?.navigation?.items?.map((item) => item.id),
      lessonCount: config?.lessons?.sequence?.length || 0,
      studentCount: config?.classData?.students?.length || 0,
      curriculumUnits: config?.curriculum?.teachingUnits?.length || 0,
      evidenceItems: config?.evidence?.items?.length || 0,
      planningBlocks: config?.planning?.blocks?.length || 0,
    });
    console.log('demo storage', getDemoStorageSnapshot());
    console.groupEnd();
  }, [config]);

  return <ReusableLearningModuleShell moduleData={config} onBack={onBack} />;
}
