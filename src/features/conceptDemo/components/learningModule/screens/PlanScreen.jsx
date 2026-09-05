import { Paper, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import SubjectPlanningBoard from '../planning/SubjectPlanningBoard.jsx';
import { usePlanningCurriculumNotes } from '../../../hooks/usePlanningCurriculumNotes.js';
import { useSubjectPlanning } from '../../../hooks/useSubjectPlanning.js';
import { useConceptDemoLanguage } from '../../../ConceptDemoLanguageContext.jsx';
import { getLearningContextsForSubject } from '../data/subjectLearningContexts.js';

function normalizeTeachingUnit(unit) {
  const curriculumAreaIds = unit.curriculumAreaIds || [unit.curriculumAreaId].filter(Boolean);
  const abilityIds = unit.defaultAbilityIds || unit.abilityIds || unit.skillIds || [];

  return {
    ...unit,
    curriculumAreaIds,
    defaultAbilityIds: abilityIds,
    abilityIds,
    blockType: unit.blockType || 'teaching',
    evidenceTopicIds: unit.evidenceTopicIds || [unit.id],
    quickCaptureOptions: unit.quickCaptureOptions || [],
  };
}

function normalizePlanningBlock(block, moduleConfig) {
  return {
    subjectId: moduleConfig.subjectId,
    classId: moduleConfig.classId,
    description: '',
    teachingUnitId: '',
    sourceTemplateId: '',
    templateId: '',
    assessmentAnchor: null,
    notes: null,
    createdBy: 'teacher',
    ...block,
    curriculumAreaIds: block.curriculumAreaIds || [block.curriculumAreaId].filter(Boolean),
    abilityIds: block.abilityIds || block.skillIds || [],
    evidenceTopicIds: block.evidenceTopicIds || [],
    quickCaptureOptions: block.quickCaptureOptions || [],
    groupAdaptations: block.groupAdaptations || [],
  };
}

function getLocalizedValue(value, language) {
  if (value && typeof value === 'object') {
    return value[language] || value.en || Object.values(value).find(Boolean) || '';
  }

  return value || '';
}

function getDefaultPlanningTools(markAdvanced = false) {
  return [
    {
      id: 'blank-block',
      title: 'Blank block',
      blockType: 'teaching',
      description: '',
      curriculumAreaIds: [],
      evidenceTopicIds: [],
      abilityIds: [],
      quickCaptureOptions: [],
    },
    {
      id: 'revision-consolidation',
      title: 'Revision and consolidation',
      blockType: 'consolidation',
      description: 'Broad consolidation before an assessment or transition point.',
      curriculumAreaIds: [],
      evidenceTopicIds: [],
      abilityIds: [],
      quickCaptureOptions: [],
    },
    {
      id: 'assessment-point',
      title: 'Assessment point',
      blockType: 'assessment',
      description: 'A planned broad assessment point.',
      curriculumAreaIds: [],
      evidenceTopicIds: [],
      abilityIds: [],
      quickCaptureOptions: [],
    },
  ].map((tool) => (markAdvanced ? { ...tool, advanced: true } : tool));
}

function createPlanningTools(teachingUnits, configuredTools = []) {
  const quickTools = configuredTools.length ? configuredTools : getDefaultPlanningTools(false);

  return [
    ...quickTools,
    ...teachingUnits.map((unit) => ({
      id: unit.id,
      sourceTemplateId: unit.id,
      teachingUnitId: unit.id,
      title: unit.title,
      blockType: unit.blockType || 'teaching',
      description: unit.description || '',
      curriculumAreaIds: [...(unit.curriculumAreaIds || [])],
      evidenceTopicIds: [...(unit.evidenceTopicIds || [])],
      abilityIds: [...(unit.defaultAbilityIds || [])],
      defaultAbilityIds: [...(unit.defaultAbilityIds || [])],
      quickCaptureOptions: unit.quickCaptureOptions || [],
    })),
  ];
}

function createActivityPlanningTools(learningContexts, language) {
  const activityTools = (learningContexts || []).map((context) => {
    const curriculumAreaIds = [...new Set([
      context.primaryCurriculumAreaId,
      ...(context.possibleCurriculumAreaIds || []),
      ...(context.capturePoints || []).flatMap((point) => point.curriculumAreaIds || []),
    ].filter(Boolean))];
    const abilityIds = [...new Set((context.capturePoints || [])
      .map((point) => point.observationDimensionId)
      .filter(Boolean))];

    return {
      id: context.id,
      templateId: context.id,
      sourceTemplateId: context.id,
      teachingUnitId: context.primaryCurriculumAreaId || curriculumAreaIds[0] || '',
      title: getLocalizedValue(context.label, language),
      blockType: 'teaching',
      description: language === 'sv'
        ? 'Aktivitet med kopplade observationspunkter.'
        : 'Activity with linked observation points.',
      curriculumAreaIds,
      evidenceTopicIds: curriculumAreaIds.map((areaId) => `${areaId}-observations`),
      abilityIds,
      defaultAbilityIds: abilityIds,
      quickCaptureOptions: (context.capturePoints || []).map((point) => ({
        id: point.id,
        label: getLocalizedValue(point.label, language),
      })),
      activityContextId: context.id,
    };
  });

  return [
    ...activityTools,
    ...getDefaultPlanningTools(true),
  ];
}

export default function PlanScreen({ moduleConfig, screenConfig }) {
  const { language, t } = useConceptDemoLanguage();
  const planningConfig = moduleConfig?.planning || {};
  const periods = planningConfig.periods || [];
  const teachingUnits = (moduleConfig?.curriculum?.teachingUnits || []).map(normalizeTeachingUnit);
  const initialBlocks = (planningConfig.blocks || []).map((block) => normalizePlanningBlock(block, moduleConfig));
  const abilities = moduleConfig?.curriculum?.skills || [];
  const activeLesson = moduleConfig?.lessons?.current || moduleConfig?.lessons?.sequence?.[0] || null;
  const learningContexts = moduleConfig?.learningContexts?.length
    ? moduleConfig.learningContexts
    : getLearningContextsForSubject(moduleConfig?.subjectId);
  const planningTools = learningContexts.length
    ? createActivityPlanningTools(learningContexts, language)
    : createPlanningTools(teachingUnits, planningConfig.tools || []);
  const {
    blocks,
    createBlock,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    resetPlanning,
  } = useSubjectPlanning({
    subjectId: moduleConfig?.subjectId || 'learning',
    classId: moduleConfig?.classId || moduleConfig?.id || 'module',
    initialBlocks,
    storageVersion: planningConfig.storageVersion || '',
  });
  const {
    resetNotes: resetPlanningCurriculumNotes,
  } = usePlanningCurriculumNotes({
    subjectId: moduleConfig?.subjectId || 'learning',
    classId: moduleConfig?.classId || moduleConfig?.id || 'module',
    initialNotes: planningConfig.curriculumNotes || [],
  });
  const handledResetTokenRef = useRef(moduleConfig?.demoResetToken || 0);

  useEffect(() => {
    const resetToken = moduleConfig?.demoResetToken || 0;

    if (!resetToken || handledResetTokenRef.current === resetToken) {
      return;
    }

    handledResetTokenRef.current = resetToken;
    resetPlanning();
    resetPlanningCurriculumNotes();
  }, [moduleConfig?.demoResetToken, resetPlanning, resetPlanningCurriculumNotes]);

  if (!periods.length || !initialBlocks.length) {
    return (
      <Paper elevation={0} sx={{ border: '1px solid rgba(var(--sd-text-rgb), 0.1)', borderRadius: '14px', p: 2 }}>
        <Typography sx={{ color: 'var(--sd-text)', fontSize: 16, fontWeight: 800 }}>
          {screenConfig?.title || t('learningModule.navigation.plan')}
        </Typography>
        <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: 13.5 }}>
          {screenConfig?.description || t('learningModule.screens.plan.fallbackDescription')}
        </Typography>
      </Paper>
    );
  }

  return (
    <SubjectPlanningBoard
      periods={periods}
      blocks={blocks}
      curriculumAreas={moduleConfig?.curriculum?.areas || []}
      abilities={abilities}
      teachingUnits={teachingUnits}
      planningTools={planningTools}
      curriculumAreaTypeLabels={planningConfig.curriculumAreaTypeLabels || {
        content: 'Content',
        ability: 'Skills',
      }}
      blockTypeLabelOverrides={planningConfig.blockTypeLabels || {}}
      referenceDate={activeLesson?.date || planningConfig.referenceDate}
      workingGroups={planningConfig.workingGroups || []}
      groupDefinitions={planningConfig.groupDefinitions || []}
      onCreateBlock={createBlock}
      onUpdateBlock={updateBlock}
      onDeleteBlock={deleteBlock}
      onDuplicateBlock={duplicateBlock}
      onResetPlanning={resetPlanning}
      onResetCurriculumNotes={resetPlanningCurriculumNotes}
    />
  );
}
