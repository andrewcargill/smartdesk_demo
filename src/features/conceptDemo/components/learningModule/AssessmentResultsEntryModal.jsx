import { useEffect, useState } from 'react';
import AssessmentResultsDialog from './AssessmentResultsDialog.jsx';
import { upsertLearningModuleAssessmentResult } from './utils/assessmentResultsStorage.js';

export default function AssessmentResultsEntryModal({
  open,
  moduleId,
  assessment,
  storedAssessment,
  students = [],
  teachingUnits = [],
  demoDate,
  onClose,
  onSaved,
}) {
  const [resultMode, setResultMode] = useState('number');
  const [maxScore, setMaxScore] = useState('100');
  const [passScore, setPassScore] = useState('50');
  const [draftAssessmentTitle, setDraftAssessmentTitle] = useState('');
  const [draftTeachingUnitId, setDraftTeachingUnitId] = useState('');
  const [draftResults, setDraftResults] = useState({});
  const [draftAbsentStudents, setDraftAbsentStudents] = useState({});
  const selectedTeachingUnit = teachingUnits.find((unit) => unit.id === draftTeachingUnitId);

  useEffect(() => {
    if (!open) return;

    setResultMode(storedAssessment?.resultMode || 'number');
    setMaxScore(storedAssessment?.maxScore === null || storedAssessment?.maxScore === undefined ? '100' : String(storedAssessment.maxScore));
    setPassScore(storedAssessment?.passScore === null || storedAssessment?.passScore === undefined ? '50' : String(storedAssessment.passScore));
    setDraftAssessmentTitle(storedAssessment?.title || '');
    setDraftTeachingUnitId(storedAssessment?.teachingUnitId || '');
    setDraftResults((storedAssessment?.studentResults || []).reduce((results, result) => ({
      ...results,
      [result.studentId]: result.rawResult || '',
    }), {}));
    setDraftAbsentStudents((storedAssessment?.studentResults || []).reduce((absentStudents, result) => ({
      ...absentStudents,
      [result.studentId]: Boolean(result.absent),
    }), {}));
  }, [open, storedAssessment]);

  function resetDraft() {
    setResultMode('number');
    setMaxScore('100');
    setPassScore('50');
    setDraftAssessmentTitle('');
    setDraftTeachingUnitId('');
    setDraftResults({});
    setDraftAbsentStudents({});
  }

  function handleSave() {
    const numericMaxScore = Number(maxScore);
    const numericPassScore = Number(passScore);
    const hasValidMaxScore = Number.isFinite(numericMaxScore) && numericMaxScore > 0;
    const hasValidPassScore = Number.isFinite(numericPassScore);

    const saveResult = upsertLearningModuleAssessmentResult(moduleId, {
      id: storedAssessment?.id || undefined,
      assessmentId: storedAssessment?.assessmentId || assessment?.id || 'enter-results',
      date: storedAssessment?.date || demoDate,
      createdAt: storedAssessment?.createdAt,
      teachingUnitId: selectedTeachingUnit?.id || '',
      teachingUnitTitle: selectedTeachingUnit?.title || '',
      title: draftAssessmentTitle,
      resultMode,
      maxScore: hasValidMaxScore ? numericMaxScore : null,
      passScore: hasValidPassScore ? numericPassScore : null,
      studentResults: students
        .map((student) => {
          const rawResult = draftResults[student.id] || '';
          const absent = Boolean(draftAbsentStudents[student.id]);
          const numericResult = Number(rawResult);
          const hasNumericResult = resultMode === 'number' && rawResult !== '' && Number.isFinite(numericResult);
          const percentage = !absent && hasNumericResult && hasValidMaxScore
            ? Math.round((numericResult / numericMaxScore) * 100)
            : null;
          const warning = !absent && (
            (hasNumericResult && hasValidPassScore && numericResult < numericPassScore)
            || (resultMode === 'letter' && rawResult.toUpperCase() === 'F')
          );

          return {
            studentId: student.id,
            rawResult,
            actualValue: hasNumericResult ? numericResult : null,
            percentage,
            absent,
            warning,
          };
        })
        .filter((result) => result.absent || result.rawResult),
    });

    onClose?.();
    if (saveResult.record) {
      onSaved?.(saveResult);
    }
    resetDraft();
  }

  return (
    <AssessmentResultsDialog
      assessment={storedAssessment ? { title: 'Edit test results' } : assessment}
      open={open}
      students={students}
      resultMode={resultMode}
      maxScore={maxScore}
      passScore={passScore}
      testTitle={draftAssessmentTitle}
      selectedTeachingUnitId={draftTeachingUnitId}
      teachingUnits={teachingUnits}
      results={draftResults}
      absentStudents={draftAbsentStudents}
      onClose={onClose}
      onResultModeChange={setResultMode}
      onMaxScoreChange={setMaxScore}
      onPassScoreChange={setPassScore}
      onTestTitleChange={setDraftAssessmentTitle}
      onTeachingUnitChange={setDraftTeachingUnitId}
      onSave={handleSave}
      requireTestTitle
      onAbsentChange={(studentId, checked) => {
        setDraftAbsentStudents((previous) => ({
          ...previous,
          [studentId]: checked,
        }));
      }}
      onResultChange={(studentId, value) => {
        setDraftResults((previous) => ({
          ...previous,
          [studentId]: value,
        }));
      }}
    />
  );
}
