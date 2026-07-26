import { useEffect, useMemo, useState } from 'react';
import { Box, Button, ButtonGroup, Checkbox, Dialog, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AbcIcon from '@mui/icons-material/Abc';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import { maths7AStudents } from '../../data/Maths7AStudents.js';

const purple = '#9c28af';
const darkText = '#17151a';
const border = 'rgba(23, 21, 26, 0.1)';
const alertText = '#8f2f2f';

function sanitizeNumberInput(value) {
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole = '', ...decimalParts] = cleaned.split('.');
  const decimal = decimalParts.join('');

  return decimalParts.length > 0 ? `${whole}.${decimal}`.slice(0, 6) : whole.slice(0, 5);
}

function sanitizeTextInput(value) {
  return value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 12);
}

function getDraftSaveSummary({ resultMode, results, absentStudents, maxScoreNumber, passScoreNumber, hasValidMaxScore, hasValidPassScore }) {
  return maths7AStudents.reduce((summary, student) => {
    const rawResult = results[student.id] || '';
    const absent = Boolean(absentStudents[student.id]);
    const numericResult = Number(rawResult);
    const hasNumericResult = resultMode === 'number' && rawResult !== '' && Number.isFinite(numericResult);
    const hasLetterResult = resultMode === 'letter' && rawResult !== '';
    const included = absent || hasNumericResult || hasLetterResult;

    if (!included) {
      return {
        ...summary,
        notIncludedCount: summary.notIncludedCount + 1,
      };
    }

    const warning = !absent && (
      (hasNumericResult && hasValidPassScore && numericResult < passScoreNumber)
      || (resultMode === 'letter' && rawResult.toUpperCase() === 'F')
    );
    const percentage = !absent && hasNumericResult && hasValidMaxScore
      ? Math.round((numericResult / maxScoreNumber) * 100)
      : null;

    return {
      includedCount: summary.includedCount + 1,
      absentCount: summary.absentCount + (absent ? 1 : 0),
      warningCount: summary.warningCount + (warning ? 1 : 0),
      notIncludedCount: summary.notIncludedCount,
      percentageCount: summary.percentageCount + (percentage !== null ? 1 : 0),
    };
  }, {
    includedCount: 0,
    absentCount: 0,
    warningCount: 0,
    notIncludedCount: 0,
    percentageCount: 0,
  });
}

export default function AssessmentResultsDialog({
  assessment,
  open,
  resultMode,
  maxScore,
  passScore,
  testTitle,
  selectedTeachingUnitId,
  teachingUnits = [],
  results,
  absentStudents,
  onClose,
  onResultModeChange,
  onMaxScoreChange,
  onPassScoreChange,
  onTestTitleChange,
  onTeachingUnitChange,
  onSave,
  onAbsentChange,
  onResultChange,
  requireTestTitle = false,
}) {
  const [confirmingSave, setConfirmingSave] = useState(false);
  const maxScoreNumber = Number(maxScore);
  const passScoreNumber = Number(passScore);
  const hasValidMaxScore = Number.isFinite(maxScoreNumber) && maxScoreNumber > 0;
  const hasValidPassScore = Number.isFinite(passScoreNumber);
  const showsTestTitle = typeof onTestTitleChange === 'function';
  const showsTeachingUnitSelect = typeof onTeachingUnitChange === 'function' && teachingUnits.length > 0;
  const hasRequiredTitle = !requireTestTitle || !showsTestTitle || Boolean(testTitle?.trim());
  const hasRequiredTeachingUnit = !requireTestTitle || !showsTeachingUnitSelect || Boolean(selectedTeachingUnitId);
  const resultEntryDisabled = !hasRequiredTitle || !hasRequiredTeachingUnit;
  const saveSummary = useMemo(() => getDraftSaveSummary({
    resultMode,
    results,
    absentStudents,
    maxScoreNumber,
    passScoreNumber,
    hasValidMaxScore,
    hasValidPassScore,
  }), [absentStudents, hasValidMaxScore, hasValidPassScore, maxScoreNumber, passScoreNumber, resultMode, results]);

  useEffect(() => {
    if (!open) {
      setConfirmingSave(false);
    }
  }, [open]);

  function handleResultChange(studentId, value) {
    setConfirmingSave(false);
    if (resultMode !== 'number') {
      onResultChange(studentId, sanitizeTextInput(value));
      return;
    }

    const nextValue = sanitizeNumberInput(value);

    if (!nextValue) {
      onResultChange(studentId, '');
      return;
    }

    const nextNumber = Number(nextValue);

    if (hasValidMaxScore && Number.isFinite(nextNumber) && nextNumber > maxScoreNumber) {
      onResultChange(studentId, String(maxScore));
      return;
    }

    onResultChange(studentId, nextValue);
  }

  function handleConfirmSave() {
    setConfirmingSave(false);
    onSave();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          border: `1px solid ${border}`,
          boxShadow: '0 18px 44px rgba(23, 21, 26, 0.18)',
        },
      }}
    >
      <Box sx={{ p: { xs: 1.4, sm: 1.8 } }}>
        <Stack spacing={1.2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Box>
              <Typography sx={{ color: darkText, fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
                {assessment?.title || 'Assessment results'}
              </Typography>
              <Typography sx={{ mt: 0.3, color: 'text.secondary', fontSize: 12.6, lineHeight: 1.4 }}>
                Add a number or short result for each student. Blank results can stay blank.
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={0.8}
              alignItems="center"
              sx={{ width: { xs: '100%', sm: 310 }, justifyContent: 'space-between' }}
            >
              <ButtonGroup
                size="small"
                variant="outlined"
                aria-label="Result type"
                sx={{
                  '& .MuiButtonGroup-grouped': {
                    minWidth: 36,
                    borderColor: 'rgba(23, 21, 26, 0.12)',
                    color: darkText,
                    '&:hover': { borderColor: 'rgba(156, 40, 175, 0.28)', bgcolor: '#fff' },
                    '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
                  },
                }}
              >
                <Button
                  type="button"
                  aria-label="Use number results"
                  aria-pressed={resultMode === 'number'}
                  onClick={() => onResultModeChange('number')}
                  sx={{
                    bgcolor: resultMode === 'number' ? 'rgba(156, 40, 175, 0.055)' : '#fff',
                    color: resultMode === 'number' ? `${purple} !important` : 'text.secondary',
                    borderColor: resultMode === 'number' ? 'rgba(156, 40, 175, 0.34) !important' : undefined,
                  }}
                >
                  <LooksOneIcon fontSize="small" />
                </Button>
                <Button
                  type="button"
                  aria-label="Use letter results"
                  aria-pressed={resultMode === 'letter'}
                  onClick={() => onResultModeChange('letter')}
                  sx={{
                    bgcolor: resultMode === 'letter' ? 'rgba(156, 40, 175, 0.055)' : '#fff',
                    color: resultMode === 'letter' ? `${purple} !important` : 'text.secondary',
                    borderColor: resultMode === 'letter' ? 'rgba(156, 40, 175, 0.34) !important' : undefined,
                  }}
                >
                  <AbcIcon fontSize="small" />
                </Button>
              </ButtonGroup>
              {resultMode === 'number' && (
                <Stack direction="row" spacing={0.55} alignItems="center" sx={{ ml: 'auto' }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 820 }}>
                    Max
                  </Typography>
                  <TextField
                    value={maxScore}
                    onChange={(event) => onMaxScoreChange(sanitizeNumberInput(event.target.value))}
                    size="small"
                    inputMode="decimal"
                    inputProps={{ 'aria-label': 'Maximum score' }}
                    sx={{
                      width: 62,
                      '& .MuiOutlinedInput-root': {
                        height: 32,
                        borderRadius: '9px',
                        bgcolor: '#fff',
                        fontSize: 12.2,
                        '& fieldset': { borderColor: 'rgba(23, 21, 26, 0.12)' },
                        '&:hover fieldset': { borderColor: 'rgba(156, 40, 175, 0.28)' },
                        '&.Mui-focused fieldset': { borderColor: 'rgba(156, 40, 175, 0.38)' },
                      },
                    }}
                  />
                  <Typography sx={{ ml: 0.55, color: 'text.secondary', fontSize: 11.8, fontWeight: 820 }}>
                    Pass
                  </Typography>
                  <TextField
                    value={passScore}
                    onChange={(event) => onPassScoreChange(sanitizeNumberInput(event.target.value))}
                    size="small"
                    inputMode="decimal"
                    inputProps={{ 'aria-label': 'Pass score' }}
                    sx={{
                      width: 62,
                      '& .MuiOutlinedInput-root': {
                        height: 32,
                        borderRadius: '9px',
                        bgcolor: '#fff',
                        fontSize: 12.2,
                        '& fieldset': { borderColor: 'rgba(23, 21, 26, 0.12)' },
                        '&:hover fieldset': { borderColor: 'rgba(156, 40, 175, 0.28)' },
                        '&.Mui-focused fieldset': { borderColor: 'rgba(156, 40, 175, 0.38)' },
                      },
                    }}
                  />
                </Stack>
              )}
            </Stack>
          </Stack>

          {(showsTestTitle || showsTeachingUnitSelect) && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(220px, 0.62fr)' }, gap: 0.8 }}>
              {showsTestTitle && (
                <TextField
                  value={testTitle}
                  onChange={(event) => {
                    setConfirmingSave(false);
                    onTestTitleChange(event.target.value);
                  }}
                  size="small"
                  placeholder="Test title"
                  inputProps={{ 'aria-label': 'Test title' }}
                  helperText={resultEntryDisabled ? 'Add a test title and teaching unit before entering results.' : ' '}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 36,
                      borderRadius: '10px',
                      bgcolor: '#fff',
                      fontSize: 13,
                      '& fieldset': { borderColor: 'rgba(23, 21, 26, 0.12)' },
                      '&:hover fieldset': { borderColor: 'rgba(156, 40, 175, 0.28)' },
                      '&.Mui-focused fieldset': { borderColor: 'rgba(156, 40, 175, 0.38)' },
                    },
                    '& .MuiFormHelperText-root': {
                      mx: 0,
                      color: 'text.secondary',
                      fontSize: 11.3,
                    },
                  }}
                />
              )}
              {showsTeachingUnitSelect && (
                <TextField
                  select
                  value={selectedTeachingUnitId || ''}
                  onChange={(event) => {
                    setConfirmingSave(false);
                    onTeachingUnitChange(event.target.value);
                  }}
                  size="small"
                  inputProps={{ 'aria-label': 'Teaching unit' }}
                  helperText=" "
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 36,
                      borderRadius: '10px',
                      bgcolor: '#fff',
                      fontSize: 13,
                      '& fieldset': { borderColor: 'rgba(23, 21, 26, 0.12)' },
                      '&:hover fieldset': { borderColor: 'rgba(156, 40, 175, 0.28)' },
                      '&.Mui-focused fieldset': { borderColor: 'rgba(156, 40, 175, 0.38)' },
                    },
                    '& .MuiFormHelperText-root': { mx: 0, fontSize: 11.3 },
                  }}
                >
                  <MenuItem value="">
                    Teaching unit
                  </MenuItem>
                  {teachingUnits.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.title}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Box>
          )}

          <Box
            role="table"
            aria-label={`${assessment?.title || 'Assessment'} student results`}
            sx={{
              border: `1px solid ${border}`,
              borderRadius: '12px',
              overflow: 'hidden',
              bgcolor: '#fff',
            }}
          >
            <Box
              role="row"
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr) minmax(140px, 0.8fr) 34px', sm: 'minmax(0, 1fr) minmax(220px, 0.75fr) 40px' },
                gap: 1,
                alignItems: 'center',
                px: 1,
                py: 0.75,
                bgcolor: 'rgba(23, 21, 26, 0.035)',
                borderBottom: '1px solid rgba(23, 21, 26, 0.08)',
              }}
            >
              <Typography role="columnheader" sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 820 }}>
                Student
              </Typography>
              <Typography role="columnheader" sx={{ color: 'text.secondary', fontSize: 11.6, fontWeight: 820 }}>
                Result
              </Typography>
              <Box role="columnheader" aria-label="Absent" sx={{ display: 'flex', justifyContent: 'center', color: 'text.secondary' }}>
                <PersonOffOutlinedIcon sx={{ fontSize: 17 }} />
              </Box>
            </Box>
            {maths7AStudents.map((student) => {
              const resultValue = results[student.id] || '';
              const scoreNumber = Number(resultValue);
              const hasScore = resultMode === 'number' && resultValue !== '' && Number.isFinite(scoreNumber);
              const percentScore = hasScore && hasValidMaxScore ? Math.round((scoreNumber / maxScoreNumber) * 100) : null;
              const hasNotPassed = hasScore && hasValidPassScore && scoreNumber < passScoreNumber && !absentStudents[student.id];
              const hasLetterWarning = resultMode === 'letter' && resultValue.toUpperCase() === 'F' && !absentStudents[student.id];
              const hasAlert = hasNotPassed || hasLetterWarning;

              return (
                <Box
                  key={student.id}
                  role="row"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'minmax(0, 1fr) minmax(140px, 0.8fr) 34px', sm: 'minmax(0, 1fr) minmax(220px, 0.75fr) 40px' },
                    gap: 1,
                    alignItems: 'center',
                    px: 1,
                    py: 0.65,
                    borderBottom: '1px solid rgba(23, 21, 26, 0.06)',
                    '&:last-of-type': { borderBottom: 0 },
                    '&:hover': { bgcolor: 'rgba(156, 40, 175, 0.025)' },
                  }}
                >
                  <Typography role="cell" sx={{ color: darkText, fontSize: 12.9, fontWeight: 780, minWidth: 0 }}>
                    {student.displayName}
                  </Typography>
                  <Stack role="cell" direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                    <TextField
                      value={resultValue}
                      onChange={(event) => handleResultChange(student.id, event.target.value)}
                      disabled={resultEntryDisabled}
                      size="small"
                      placeholder={resultMode === 'number' ? 'Score' : 'A'}
                      inputMode={resultMode === 'number' ? 'decimal' : 'text'}
                      inputProps={{
                        'aria-label': `${student.displayName} result`,
                        ...(resultMode === 'number' && hasValidMaxScore ? { max: maxScoreNumber } : {}),
                      }}
                      sx={{
                        width: { xs: 76, sm: 82 },
                        flexShrink: 0,
                        '& .MuiOutlinedInput-root': {
                          height: 34,
                          borderRadius: '9px',
                          bgcolor: '#fff',
                          fontSize: 12.8,
                          '& fieldset': { borderColor: hasAlert ? 'rgba(143, 47, 47, 0.42)' : 'rgba(23, 21, 26, 0.12)' },
                          '&:hover fieldset': { borderColor: hasAlert ? 'rgba(143, 47, 47, 0.58)' : 'rgba(156, 40, 175, 0.28)' },
                          '&.Mui-focused fieldset': { borderColor: hasAlert ? alertText : 'rgba(156, 40, 175, 0.38)' },
                        },
                      }}
                    />
                    {percentScore !== null && (
                      <Typography sx={{ color: hasNotPassed ? alertText : darkText, fontSize: 12, fontWeight: 840, minWidth: 36 }}>
                        {percentScore}%
                      </Typography>
                    )}
                    {hasNotPassed && (
                      <Typography sx={{ color: alertText, fontSize: 11.2, fontWeight: 820, whiteSpace: 'nowrap' }}>
                        Not passed
                      </Typography>
                    )}
                    {hasLetterWarning && (
                      <Typography sx={{ color: alertText, fontSize: 11.2, fontWeight: 820, whiteSpace: 'nowrap' }}>
                        Warning
                      </Typography>
                    )}
                  </Stack>
                  <Checkbox
                    checked={Boolean(absentStudents[student.id])}
                    onChange={(event) => {
                      setConfirmingSave(false);
                      onAbsentChange(student.id, event.target.checked);
                    }}
                    disabled={resultEntryDisabled}
                    inputProps={{ 'aria-label': `${student.displayName} absent` }}
                    sx={{
                      justifySelf: 'center',
                      p: 0.25,
                      color: 'rgba(23, 21, 26, 0.34)',
                      '&.Mui-checked': { color: purple },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
          {confirmingSave ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto' },
                gap: 1,
                alignItems: 'center',
                p: 1,
                borderRadius: '12px',
                border: '1px solid rgba(156, 40, 175, 0.2)',
                bgcolor: 'rgba(156, 40, 175, 0.04)',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: darkText, fontSize: 12.9, fontWeight: 880 }}>
                  Save this test?
                </Typography>
                <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 11.9, lineHeight: 1.4 }}>
                  {saveSummary.includedCount} student{saveSummary.includedCount === 1 ? '' : 's'} included · {saveSummary.absentCount} absent · {saveSummary.warningCount} warning{saveSummary.warningCount === 1 ? '' : 's'} · {saveSummary.notIncludedCount} not included
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setConfirmingSave(false)}
                  sx={{
                    borderRadius: '10px',
                    borderColor: 'rgba(23, 21, 26, 0.14)',
                    color: darkText,
                    textTransform: 'none',
                    fontSize: 12.8,
                    fontWeight: 820,
                    px: 1.35,
                    '&:hover': { borderColor: 'rgba(156, 40, 175, 0.28)', bgcolor: '#fff' },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  onClick={handleConfirmSave}
                  sx={{
                    borderRadius: '10px',
                    bgcolor: purple,
                    boxShadow: 'none',
                    textTransform: 'none',
                    fontSize: 12.8,
                    fontWeight: 820,
                    px: 1.8,
                    '&:hover': { bgcolor: '#7f1d90', boxShadow: 'none' },
                  }}
                >
                  Save
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="contained"
                onClick={() => setConfirmingSave(true)}
                disabled={resultEntryDisabled}
                sx={{
                  borderRadius: '10px',
                  bgcolor: purple,
                  boxShadow: 'none',
                  textTransform: 'none',
                  fontSize: 12.8,
                  fontWeight: 820,
                  px: 1.8,
                  '&:hover': { bgcolor: '#7f1d90', boxShadow: 'none' },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(23, 21, 26, 0.12)',
                    color: 'rgba(23, 21, 26, 0.38)',
                  },
                }}
              >
                Save
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
    </Dialog>
  );
}
