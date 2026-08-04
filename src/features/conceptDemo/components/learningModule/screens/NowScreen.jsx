import { useEffect, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import LearningModuleQuickCapture from '../LearningModuleQuickCapture.jsx';
import { physicalEducationLearningContexts } from '../data/physicalEducationLearningContexts.js';
import {
  readLearningModuleEvidence,
  readLearningModuleLearningObservations,
} from '../utils/learningModuleEvidenceStorage.js';

const darkText = '#17151a';

export default function NowScreen({ moduleConfig }) {
  const moduleId = moduleConfig?.id || 'learning-module';
  const students = moduleConfig?.classData?.students || [];
  const teachingUnits = [...(moduleConfig?.curriculum?.teachingUnits || [])]
    .sort((first, second) => (first.order || 0) - (second.order || 0));
  const skills = moduleConfig?.curriculum?.skills || [];
  const levels = moduleConfig?.curriculum?.observationLevels || [];
  const learningContexts = moduleConfig?.subjectId === 'physical-education' ? physicalEducationLearningContexts : [];
  const activeLesson = moduleConfig?.lessons?.current || moduleConfig?.lessons?.sequence?.[0] || null;
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [localEvidencePayload, setLocalEvidencePayload] = useState(() => readLearningModuleEvidence(moduleId));
  const [localLearningObservationPayload, setLocalLearningObservationPayload] = useState(() => (
    readLearningModuleLearningObservations(moduleId)
  ));

  useEffect(() => {
    if (!moduleConfig?.demoResetToken) {
      return;
    }

    setSelectedStudentId(students[0]?.id || '');
    setLocalEvidencePayload(readLearningModuleEvidence(moduleId));
    setLocalLearningObservationPayload(readLearningModuleLearningObservations(moduleId));
  }, [moduleConfig?.demoResetToken, moduleId, students]);

  function restartLessonSequence() {
    setSelectedStudentId(students[0]?.id || '');
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack spacing={1.35}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
          <Typography sx={{ color: darkText, fontSize: { xs: 18, sm: 20 }, fontWeight: 880, lineHeight: 1.15 }}>
            Lesson capture
          </Typography>
        </Stack>
        <LearningModuleQuickCapture
          moduleId={moduleId}
          students={students}
          teachingUnits={teachingUnits}
          skills={skills}
          levels={levels}
          learningContexts={learningContexts}
          subjectId={moduleConfig?.subjectId}
          selectedStudentId={selectedStudentId}
          localEvidencePayload={localEvidencePayload}
          learningObservations={moduleConfig?.evidence?.learningObservations || []}
          localLearningObservationPayload={localLearningObservationPayload}
          activeLesson={activeLesson}
          onRestartLessonSequence={restartLessonSequence}
          onLocalEvidencePayloadChange={setLocalEvidencePayload}
          onLocalLearningObservationPayloadChange={setLocalLearningObservationPayload}
          onStudentChange={setSelectedStudentId}
        />
      </Stack>
    </Box>
  );
}
