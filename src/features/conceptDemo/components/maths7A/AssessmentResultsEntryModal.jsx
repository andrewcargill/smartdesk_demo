import { useEffect, useState } from 'react';
import { maths7AStudents } from '../../data/Maths7AStudents.js';
import { upsertMaths7AAssessmentResult } from '../../data/maths7AAssessmentResultStorage.js';
import { mathsTeachingUnits } from '../../data/mathsCurriculum.js';
import AssessmentResultsDialog from './AssessmentResultsDialog.jsx';

export default function AssessmentResultsEntryModal({
  open,
  assessment,
  storedAssessment,
  demoDate,
  isResultsEntry = false,
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
  const selectedTeachingUnit = mathsTeachingUnits.find((unit) => unit.id === draftTeachingUnitId);

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

  function handleClose() {
    onClose?.();
  }

  function handleSave() {
    if (!isResultsEntry) {
      handleClose();
      return;
    }

    const numericMaxScore = Number(maxScore);
    const numericPassScore = Number(passScore);
    const hasValidMaxScore = Number.isFinite(numericMaxScore) && numericMaxScore > 0;
    const hasValidPassScore = Number.isFinite(numericPassScore);

    const saveResult = upsertMaths7AAssessmentResult({
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
      studentResults: maths7AStudents
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

    handleClose();
    if (saveResult.record) {
      onSaved?.(saveResult);
    }
    resetDraft();
  }

  return (
    <AssessmentResultsDialog
      assessment={storedAssessment ? { title: 'Edit test results' } : assessment}
      open={open}
      resultMode={resultMode}
      maxScore={maxScore}
      passScore={passScore}
      testTitle={isResultsEntry ? draftAssessmentTitle : undefined}
      selectedTeachingUnitId={isResultsEntry ? draftTeachingUnitId : undefined}
      teachingUnits={isResultsEntry ? mathsTeachingUnits : undefined}
      results={draftResults}
      absentStudents={draftAbsentStudents}
      onClose={handleClose}
      onResultModeChange={setResultMode}
      onMaxScoreChange={setMaxScore}
      onPassScoreChange={setPassScore}
      onTestTitleChange={isResultsEntry ? setDraftAssessmentTitle : undefined}
      onTeachingUnitChange={isResultsEntry ? setDraftTeachingUnitId : undefined}
      onSave={handleSave}
      requireTestTitle={isResultsEntry}
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
