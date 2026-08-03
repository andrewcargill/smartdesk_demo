import { Paper, Typography } from '@mui/material';
import SubjectPlanningBoard from '../planning/SubjectPlanningBoard.jsx';
import { usePlanningCurriculumNotes } from '../../../hooks/usePlanningCurriculumNotes.js';
import { useSubjectPlanning } from '../../../hooks/useSubjectPlanning.js';
import { useConceptDemoLanguage } from '../../../ConceptDemoLanguageContext.jsx';

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

function createPlanningTools(teachingUnits, configuredTools = []) {
  const quickTools = configuredTools.length ? configuredTools : [
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
  ];

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

export default function PlanScreen({ moduleConfig, screenConfig }) {
  const { t } = useConceptDemoLanguage();
  const planningConfig = moduleConfig?.planning || {};
  const periods = planningConfig.periods || [];
  const teachingUnits = (moduleConfig?.curriculum?.teachingUnits || []).map(normalizeTeachingUnit);
  const initialBlocks = (planningConfig.blocks || []).map((block) => normalizePlanningBlock(block, moduleConfig));
  const abilities = moduleConfig?.curriculum?.skills || [];
  const activeLesson = moduleConfig?.lessons?.current || moduleConfig?.lessons?.sequence?.[0] || null;
  const planningTools = createPlanningTools(teachingUnits, planningConfig.tools || []);
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
  });
  const {
    resetNotes: resetPlanningCurriculumNotes,
  } = usePlanningCurriculumNotes({
    subjectId: moduleConfig?.subjectId || 'learning',
    classId: moduleConfig?.classId || moduleConfig?.id || 'module',
    initialNotes: planningConfig.curriculumNotes || [],
  });

  if (!periods.length || !initialBlocks.length) {
    return (
      <Paper elevation={0} sx={{ border: '1px solid rgba(23, 21, 26, 0.1)', borderRadius: '14px', p: 2 }}>
        <Typography sx={{ color: '#17151a', fontSize: 16, fontWeight: 800 }}>
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
