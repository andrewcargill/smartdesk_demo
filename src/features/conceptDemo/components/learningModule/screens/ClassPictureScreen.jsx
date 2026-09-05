import { useEffect, useMemo, useRef, useState } from 'react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import GridViewIcon from '@mui/icons-material/GridView';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotesIcon from '@mui/icons-material/Notes';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TimelineIcon from '@mui/icons-material/Timeline';
import { Box, ButtonBase, Dialog, DialogContent, IconButton, MenuItem, Paper, Select, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { useConceptDemoLanguage } from '../../../ConceptDemoLanguageContext.jsx';
import { classGroupDefinitions } from '../../../data/classGroupDefinitions.js';
import { useClassWorkingGroups } from '../../../hooks/useClassWorkingGroups.js';
import { getActiveGroups } from '../../../utils/classGroupUtils.js';
import { GroupDialog } from '../ClassWorkingGroups.jsx';
import AssessmentResultsEntryModal from '../AssessmentResultsEntryModal.jsx';
import ClassPictureExpandedView from '../ClassPictureExpandedView.jsx';
import StudentEvidenceHeatmap from '../StudentEvidenceHeatmap.jsx';
import StudentUnitInsightPanel from '../StudentUnitInsightPanel.jsx';
import { WorkspaceExpandedRowCell } from '../../WorkspaceExpandedRowPanel.jsx';
import { getLearningContextsForSubject } from '../data/subjectLearningContexts.js';
import {
  LEARNING_MODULE_ASSESSMENT_RESULTS_STORAGE_EVENT,
  getLearningModuleAssessmentResultsStorageKey,
  normalizeLearningModuleAssessmentAsEvidence,
  readLearningModuleAssessmentResults,
} from '../utils/assessmentResultsStorage.js';
import {
  LEARNING_MODULE_EVIDENCE_STORAGE_EVENT,
  LEARNING_MODULE_LEARNING_OBSERVATIONS_STORAGE_EVENT,
  getLearningModuleEvidenceStorageKey,
  getLearningModuleLearningObservationsStorageKey,
  groupLearningObservationRecords,
  readLearningModuleEvidence,
  readLearningModuleLearningObservations,
} from '../utils/learningModuleEvidenceStorage.js';

const purple = 'var(--sd-primary)';
const darkText = 'var(--sd-text)';
const border = 'rgba(var(--sd-text-rgb), 0.1)';
const absentOrange = 'var(--sd-warning)';

function getClassViewStorageKey(moduleId) {
  return `smartdesk_demo_learning_class_views_${moduleId}`;
}

function readStoredClassViews(moduleId) {
  if (typeof window === 'undefined') return [];

  try {
    const value = window.localStorage.getItem(getClassViewStorageKey(moduleId));
    const views = value ? JSON.parse(value) : [];
    return Array.isArray(views) ? views.filter((view) => view?.id && view?.label) : [];
  } catch {
    return [];
  }
}

function writeStoredClassViews(moduleId, views) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getClassViewStorageKey(moduleId), JSON.stringify(views));
}

function slugifyClassViewTitle(value) {
  return String(value || 'view')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const learningObservationChoices = [
  { id: '-', label: '-' },
  { id: '0', label: '0' },
  { id: '+', label: '+' },
];

function getLearningModuleLocale(language) {
  return language === 'sv' ? 'sv-SE' : 'en-GB';
}

function formatDemoDate(date, language = 'en', t = null) {
  if (!date) {
    return t ? t('learningModule.classPicture.noSavedDate') : 'No saved date';
  }

  return new Intl.DateTimeFormat(getLearningModuleLocale(language), { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function getCountLabel(t, baseKey, count) {
  return t(`${baseKey}_${count === 1 ? 'one' : 'other'}`, { count });
}

function sortByDate(items, direction = 'asc') {
  return [...(items || [])].sort((first, second) => {
    const comparison = (first.date || '').localeCompare(second.date || '');
    return direction === 'desc' ? -comparison : comparison;
  });
}

function getLatestDate(items) {
  return sortByDate(items, 'desc')[0]?.date || '';
}

function getAssessmentResultsForStudent(evidenceItems, studentId, teachingUnitId) {
  return (evidenceItems || [])
    .filter((item) => item.type === 'assessment' && (!teachingUnitId || item.teachingUnitId === teachingUnitId))
    .flatMap((assessment) => (assessment.results || [])
      .filter((result) => result.studentId === studentId)
      .map((result) => ({
        ...result,
        id: `${assessment.id}:${result.studentId}`,
        title: assessment.title,
        date: assessment.date,
        teachingUnitId: assessment.teachingUnitId,
        max: assessment.max,
        pass: assessment.pass,
      })));
}

function getObservationItemsForStudent(evidenceItems, studentId, teachingUnitId = '') {
  return (evidenceItems || []).filter((item) => (
    item.type !== 'assessment'
    && item.studentId === studentId
    && (!teachingUnitId || item.teachingUnitId === teachingUnitId)
  ));
}

function getStudentEvidenceItems(evidenceItems, studentId) {
  return [
    ...getObservationItemsForStudent(evidenceItems, studentId),
    ...getAssessmentResultsForStudent(evidenceItems, studentId),
  ];
}

function getAssessmentRecordId(assessmentEvidence) {
  return assessmentEvidence?.id ? String(assessmentEvidence.id).split(':')[0] : '';
}

function createStoredAssessmentFromEvidence(assessment, students = []) {
  if (!assessment) {
    return null;
  }

  const maxScore = assessment.maxScore ?? assessment.max ?? null;
  const passScore = assessment.passScore ?? assessment.pass ?? null;
  const resultsByStudentId = new Map((assessment.results || assessment.studentResults || [])
    .map((result) => [result.studentId, result]));

  return {
    id: assessment.id,
    assessmentId: assessment.assessmentId || assessment.id,
    title: assessment.title || assessment.assessmentTitle || assessment.label || 'Assessment',
    date: assessment.date || '',
    createdAt: assessment.createdAt || `${assessment.date || new Date().toISOString().slice(0, 10)}T12:00:00.000`,
    updatedAt: assessment.updatedAt || `${assessment.date || new Date().toISOString().slice(0, 10)}T12:00:00.000`,
    teachingUnitId: assessment.teachingUnitId || '',
    teachingUnitTitle: assessment.teachingUnitTitle || '',
    resultMode: assessment.resultMode || 'number',
    maxScore,
    passScore,
    studentResults: students.map((student) => {
      const result = resultsByStudentId.get(student.id) || {};
      const absent = Boolean(result.absent);
      const score = result.score ?? result.actualValue ?? null;
      const hasScore = score !== null && score !== undefined && score !== '';
      const numericScore = Number(score);

      return {
        studentId: student.id,
        rawResult: absent ? '' : hasScore ? String(score) : (result.rawResult || ''),
        actualValue: !absent && hasScore && Number.isFinite(numericScore) ? numericScore : null,
        percentage: absent ? null : result.percentage ?? (
          hasScore && Number(maxScore) > 0 ? Math.round((Number(score) / Number(maxScore)) * 100) : null
        ),
        absent,
        warning: !absent && Boolean(result.warning || result.passed === false),
      };
    }).filter((result) => result.absent || result.rawResult),
  };
}

function buildStudentUnitSummary(evidenceItems, studentId, teachingUnitId) {
  const observations = getObservationItemsForStudent(evidenceItems, studentId, teachingUnitId);
  const assessments = getAssessmentResultsForStudent(evidenceItems, studentId, teachingUnitId);

  return {
    unit: null,
    observations,
    assessments,
    items: [...observations, ...assessments],
  };
}

function buildAssessmentAlerts(evidenceItems, studentId, language, t) {
  return getAssessmentResultsForStudent(evidenceItems, studentId)
    .filter((result) => result.absent || result.warning || result.passed === false)
    .map((result) => ({
      ...result,
      type: result.absent ? 'absent' : 'not-passed',
      label: result.absent
        ? t('learningModule.classPicture.assessmentAlertAbsent', { date: formatDemoDate(result.date, language, t), title: result.title })
        : t('learningModule.classPicture.assessmentAlertNotPassed', { date: formatDemoDate(result.date, language, t), title: result.title }),
    }));
}

function EvidenceMarker({ summary, t }) {
  const assessments = (summary.assessments || [])
    .filter((assessment) => Number.isFinite(Number(assessment.percentage)))
    .sort((first, second) => (first.date || '').localeCompare(second.date || ''))
    .slice(-3);
  const observationCount = (summary.observations || []).length;
  const hasEvidence = Boolean(summary.items?.length);
  const density = Math.min(observationCount / 4, 1);

  if (!hasEvidence) {
    return (
      <Box sx={{ minHeight: 34, display: 'grid', placeItems: 'center' }}>
        <Box sx={{ width: 20, height: 2, borderRadius: 999, bgcolor: 'rgba(var(--sd-text-rgb), 0.18)' }} />
      </Box>
    );
  }

  return (
    <Stack spacing={0.55} justifyContent="center" sx={{ minHeight: 34 }}>
      <Stack direction="row" spacing={0.35} alignItems="center" sx={{ minHeight: 16 }}>
        {assessments.length ? assessments.map((assessment) => {
          const percentage = Math.max(0, Math.min(100, Number(assessment.percentage)));

          return (
            <Box
              key={assessment.id}
              title={`${assessment.title} · ${percentage}%`}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: `conic-gradient(${purple} 0 ${percentage}%, rgba(var(--sd-primary-rgb), 0.13) ${percentage}% 100%)`,
                boxShadow: 'inset 0 0 0 1px rgba(var(--sd-primary-rgb), 0.28)',
              }}
            />
          );
        }) : (
          <Box sx={{ width: 24, height: 6, borderRadius: 999, bgcolor: 'rgba(var(--sd-primary-rgb), 0.12)' }} />
        )}
      </Stack>
      <Box
        title={getCountLabel(t, 'learningModule.classPicture.evidenceMarkerObservations', observationCount)}
        sx={{
          height: 5,
          borderRadius: 999,
          bgcolor: 'rgba(var(--sd-text-rgb), 0.08)',
          overflow: 'hidden',
        }}
      >
        {!!observationCount && (
          <Box
            sx={{
              width: `${Math.max(density * 100, 18)}%`,
              height: '100%',
              borderRadius: 999,
              bgcolor: 'rgba(var(--sd-text-rgb), 0.42)',
            }}
          />
        )}
      </Box>
    </Stack>
  );
}

function getLearningObservationChoiceValue(choiceId) {
  if (choiceId === '+') {
    return 1;
  }
  if (choiceId === '-') {
    return -1;
  }
  return 0;
}

function getLearningObservationAreas(t) {
  return [
    { id: 'focus', label: t('learningModule.evidenceLabels.focus') },
    { id: 'participation', label: t('learningModule.evidenceLabels.participation') },
    { id: 'independence', label: t('learningModule.evidenceLabels.independence') },
  ];
}

function LearningObservationTimelineGraph({ observations, activeObservationId, onActiveObservationChange, learningObservationAreas, language, t }) {
  const sortedObservations = sortByDate(observations || [], 'asc');
  const pointEvents = sortedObservations.flatMap((observation) => (
    learningObservationAreas
      .filter((area) => observation[area.id])
      .map((area) => ({
        ...observation,
        id: `${observation.id}:${area.id}`,
        areaId: area.id,
        areaLabel: area.label,
        choiceId: observation[area.id],
        note: observation.comment || observation.note || '',
      }))
  ));
  const timestamps = pointEvents.map((observation) => new Date(`${observation.date}T12:00:00`).getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const hasRange = Number.isFinite(minTime) && Number.isFinite(maxTime) && minTime !== maxTime;

  return (
    <Paper elevation={0} sx={{ p: 1.15, borderRadius: '14px', border: '1px solid rgba(var(--sd-text-rgb), 0.08)', bgcolor: 'var(--sd-surface)', minHeight: '100%' }}>
      <Stack spacing={0.8}>
        <Typography sx={{ color: darkText, fontSize: 13.6, fontWeight: 880 }}>{t('learningModule.classPicture.learningObservationPattern')}</Typography>
        <Stack spacing={0.65}>
          {learningObservationAreas.map((area) => {
            const areaObservations = pointEvents.filter((observation) => observation.areaId === area.id);
            const points = areaObservations.map((observation) => {
              const timestamp = new Date(`${observation.date}T12:00:00`).getTime();
              const choiceValue = getLearningObservationChoiceValue(observation.choiceId);

              return {
                ...observation,
                x: hasRange ? 16 + ((timestamp - minTime) / (maxTime - minTime)) * 197 : 114,
                y: 36 - choiceValue * 14,
              };
            });
            const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');

            return (
              <Box
                key={area.id}
                component="svg"
                role="img"
                aria-label={t('learningModule.classPicture.learningObservationTimelineAria', { area: area.label })}
                viewBox="0 0 220 58"
                sx={{
                  width: '100%',
                  height: { xs: 92, sm: 108 },
                  display: 'block',
                  overflow: 'visible',
                  '& circle': { outline: 'none', transition: 'r 140ms ease, fill 140ms ease' },
                  '& circle:hover': { r: 4.4, fill: purple },
                }}
              >
                <text x="1" y="7" fill="rgba(var(--sd-text-rgb), 0.68)" fontSize="5.4" fontWeight="800">{area.label}</text>
                <text x="6" y="23.8" fill="rgba(var(--sd-text-rgb), 0.48)" fontSize="5.2" fontWeight="800" textAnchor="middle">+</text>
                <text x="6" y="37.8" fill="rgba(var(--sd-text-rgb), 0.48)" fontSize="5.2" fontWeight="800" textAnchor="middle">0</text>
                <text x="6" y="51.8" fill="rgba(var(--sd-text-rgb), 0.48)" fontSize="5.2" fontWeight="800" textAnchor="middle">-</text>
                <line x1="16" y1="22" x2="213" y2="22" stroke="rgba(var(--sd-text-rgb), 0.05)" strokeWidth="1" />
                <line x1="16" y1="36" x2="213" y2="36" stroke="rgba(var(--sd-text-rgb), 0.1)" strokeWidth="1" />
                <line x1="16" y1="50" x2="213" y2="50" stroke="rgba(var(--sd-text-rgb), 0.05)" strokeWidth="1" />
                {points.length > 1 && <polyline points={linePoints} fill="none" stroke="rgba(var(--sd-primary-rgb), 0.34)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />}
                {points.map((point) => {
                  const isActive = activeObservationId === point.id;

                  return (
                    <circle
                      key={point.id}
                      cx={point.x}
                      cy={point.y}
                      r={isActive ? '3.9' : '2.8'}
                      fill={purple}
                      stroke={isActive ? 'rgba(var(--sd-primary-rgb), 0.28)' : 'var(--sd-surface)'}
                      strokeWidth={isActive ? '2.4' : '1'}
                      tabIndex={0}
                      onMouseEnter={() => onActiveObservationChange?.(point)}
                      onFocus={() => onActiveObservationChange?.(point)}
                      onMouseDown={(event) => event.preventDefault()}
                    >
                      <title>{`${formatDemoDate(point.date, language, t)} · ${area.label} · ${point.choiceId}${point.note ? ` · ${point.note}` : ''}`}</title>
                    </circle>
                  );
                })}
                {!points.length && (
                  <>
                    <line x1="24" y1="36" x2="86" y2="36" stroke="rgba(var(--sd-text-rgb), 0.16)" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="55" cy="36" r="3" fill="rgba(var(--sd-text-rgb), 0.18)" />
                  </>
                )}
              </Box>
            );
          })}
        </Stack>
        <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
          {pointEvents.length
            ? t('learningModule.classPicture.dateRange', {
              start: formatDemoDate(pointEvents[0].date, language, t),
              end: formatDemoDate(pointEvents[pointEvents.length - 1].date, language, t),
            })
            : t('learningModule.classPicture.noLearningObservationsYet')}
        </Typography>
      </Stack>
    </Paper>
  );
}

function LearningObservationHistoryPanel({ observations, activeObservation, learningObservationAreas, language, t }) {
  const sortedObservations = sortByDate(observations || [], 'desc');
  const latestByAreaId = learningObservationAreas.reduce((itemsByArea, area) => {
    itemsByArea[area.id] = sortedObservations.find((observation) => observation[area.id]) || null;
    return itemsByArea;
  }, {});

  return (
    <Paper elevation={0} sx={{ p: 1.15, height: 310, borderRadius: '14px', border: '1px solid rgba(var(--sd-text-rgb), 0.08)', bgcolor: 'var(--sd-surface)' }}>
      <Typography sx={{ color: darkText, fontSize: 13.6, fontWeight: 880 }}>{t('learningModule.classPicture.learningObservations')}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(3, minmax(0, 1fr))' }, gap: 0.8, mt: 0.9 }}>
        {learningObservationAreas.map((area) => {
          const latestObservation = latestByAreaId[area.id];
          const choice = latestObservation?.[area.id] || '';

          return (
            <Box key={area.id} sx={{ p: 1, minHeight: 68, borderRadius: '12px', border: '1px solid rgba(var(--sd-text-rgb), 0.08)', bgcolor: 'var(--sd-surface)' }}>
              <Typography sx={{ color: darkText, fontSize: 12.6, fontWeight: 850 }}>{area.label}</Typography>
              <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="space-between" sx={{ mt: 0.45 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 11.8, fontWeight: 650 }}>
                  {latestObservation ? formatDemoDate(latestObservation.date, language, t) : t('learningModule.classPicture.noEntryYet')}
                </Typography>
                <Box
                  title={latestObservation ? `${area.label} · ${choice} · ${formatDemoDate(latestObservation.date, language, t)}` : `${area.label} · ${t('learningModule.classPicture.noObservation')}`}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: latestObservation ? `1px solid ${purple}` : '1px solid rgba(var(--sd-text-rgb), 0.14)',
                    bgcolor: latestObservation ? purple : 'var(--sd-surface)',
                    color: latestObservation ? 'var(--sd-on-primary)' : 'var(--sd-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 880,
                  }}
                >
                  {choice}
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          mt: 1,
          minHeight: 112,
          p: 1.25,
          borderRadius: '12px',
          border: '1px solid rgba(var(--sd-text-rgb), 0.07)',
          bgcolor: activeObservation ? 'rgba(var(--sd-primary-rgb), 0.035)' : 'var(--sd-surface)',
          transition: 'background-color 140ms ease',
        }}
      >
        {activeObservation ? (
          <Stack spacing={0.8}>
            <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 880, lineHeight: 1.25 }}>
              {formatDemoDate(activeObservation.date, language, t)} · {activeObservation.areaLabel} · {activeObservation.choiceId}
            </Typography>
            <Box>
              <Typography sx={{ color: 'var(--sd-text-muted)', fontSize: 11.8, fontWeight: 840, lineHeight: 1.2 }}>
                {t('learningModule.classPicture.teacherComment')}
              </Typography>
              <Typography sx={{ mt: 0.35, pl: 0.9, color: 'text.secondary', fontSize: 13.4, lineHeight: 1.48, borderLeft: '3px solid rgba(var(--sd-primary-rgb), 0.24)' }}>
                {activeObservation.note || t('learningModule.classPicture.noCommentAdded')}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Typography sx={{ color: 'var(--sd-text-muted)', fontSize: 13.2, lineHeight: 1.45 }}>
            {t('learningModule.classPicture.hoverGraphPoint')}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function StudentGlobalInsightPanel({ student, evidenceItems, rowNote, learningObservations, subjectId, subjectTitle, learningObservationAreas, language, t }) {
  const studentEvidence = getStudentEvidenceItems(evidenceItems, student.id);
  const previousResult = student.previousResults?.find((result) => result.subjectId === subjectId) || student.previousResults?.[0] || null;
  const latestEvidenceDate = getLatestDate(studentEvidence);
  const [activeLearningObservation, setActiveLearningObservation] = useState(null);

  return (
    <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: 'var(--sd-surface-muted)', borderTop: '1px solid rgba(var(--sd-text-rgb), 0.07)' }}>
      <Paper elevation={0} id={`student-insight-global-${student.id}`} sx={{ p: { xs: 1.25, sm: 1.55 }, borderRadius: '18px', border: `4px solid ${purple}`, bgcolor: 'var(--sd-surface)' }}>
        <Stack spacing={1.25}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Box>
              <Typography component="h2" sx={{ color: darkText, fontSize: 17, fontWeight: 900 }}>{t('learningModule.classPicture.globalStudentPicture')}</Typography>
              <Typography sx={{ mt: 0.2, color: 'text.secondary', fontSize: 12.8 }}>
                {t('learningModule.classPicture.latestEvidence', { date: latestEvidenceDate ? formatDemoDate(latestEvidenceDate, language, t) : t('learningModule.classPicture.none') })}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2.15fr) minmax(220px, 0.85fr)' }, gap: 1.1, alignItems: 'stretch' }}>
            <LearningObservationTimelineGraph
              observations={learningObservations}
              activeObservationId={activeLearningObservation?.id || ''}
              onActiveObservationChange={setActiveLearningObservation}
              learningObservationAreas={learningObservationAreas}
              language={language}
              t={t}
            />
            <Stack spacing={1.1}>
              <LearningObservationHistoryPanel
                observations={learningObservations}
                activeObservation={activeLearningObservation}
                learningObservationAreas={learningObservationAreas}
                language={language}
                t={t}
              />
              <Paper elevation={0} sx={{ p: 0.95, borderRadius: '14px', border: '1px solid rgba(var(--sd-text-rgb), 0.08)', bgcolor: 'var(--sd-surface)' }}>
                <Typography sx={{ color: darkText, fontSize: 12.4, fontWeight: 880 }}>{t('learningModule.classPicture.knownAnchors')}</Typography>
                <Stack spacing={0.42} sx={{ mt: 0.65 }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
                    {t('learningModule.classPicture.priorSubject', { subject: subjectTitle })} · <Box component="span" sx={{ color: darkText, fontWeight: 800 }}>{previousResult?.grade || t('learningModule.classPicture.notShown')}</Box>
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
                    {t('learningModule.classPicture.class')} · <Box component="span" sx={{ color: darkText, fontWeight: 800 }}>{subjectTitle} {String(student.classId || '').toUpperCase()}</Box>
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11.8 }}>
                    {t('learningModule.classPicture.quickNote')} · <Box component="span" sx={{ color: rowNote ? darkText : 'text.secondary', fontWeight: rowNote ? 800 : 650 }}>{rowNote || t('learningModule.classPicture.noneAdded')}</Box>
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

function getStoredNotes(storageKey) {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredNotes(storageKey, notes) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(notes));
  }
  return notes;
}

function normalizeNote(value, maxLength) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function getStudentUnitCellNoteKey(studentId, unitId) {
  return `${studentId}:${unitId}`;
}

function sortGroupsForDisplay(groups) {
  return [...(groups || [])].sort((first, second) => (
    (first.order || 0) - (second.order || 0)
    || (first.createdAt || '').localeCompare(second.createdAt || '')
    || first.label.localeCompare(second.label)
  ));
}

function getStudentsInGroupOrder(group, students) {
  const studentById = new Map((students || []).map((student) => [student.id, student]));
  return (group?.studentIds || []).map((studentId) => studentById.get(studentId)).filter(Boolean);
}

function getUngroupedStudentsForType(students, groups, typeId) {
  const groupedStudentIds = new Set((groups || [])
    .filter((group) => group.typeId === typeId && group.status !== 'archived')
    .flatMap((group) => group.studentIds || []));

  return (students || []).filter((student) => !groupedStudentIds.has(student.id));
}

function ClassPictureEvidenceGridV1({
  activeGroupingSet,
  allowDrop,
  buildGridAriaLabel,
  cancelEditingCell,
  cancelEditingRowNote,
  cancelEditingUnit,
  cellNotes,
  classPictureRows,
  collapsedGroupIds,
  comparisonVariant = 'v1',
  curriculumAreas,
  draftCellNote,
  draftRowNote,
  draftUnitNote,
  draggedStudentId,
  dragTargetId,
  editingCellKey,
  editingRowNoteStudentId,
  editingUnitId,
  allEvidenceItems,
  evidenceItems,
  expandedStudentId,
  expandedUnitId,
  expandedViewMode,
  groupedViewActive,
  handleDragEnd,
  handleDragStart,
  handleDrop,
  hoveredRowNoteStudentId,
  hoveredStudentId,
  language,
  learningObservationAreas,
  learningObservations,
  learningContexts,
  levels,
  moduleConfig,
  openAssessmentEdit,
  openCreateGroupDialog,
  openEditGroupDialog,
  rowNotes,
  rowNotesVisible,
  saveEditingCell,
  saveEditingRowNote,
  saveEditingUnit,
  setDraftCellNote,
  setDraftRowNote,
  setDraftUnitNote,
  setExpandedStudentId,
  setExpandedUnitId,
  setHoveredRowNoteStudentId,
  setHoveredStudentId,
  setRowNotesVisible,
  skills,
  startEditingCell,
  startEditingRowNote,
  startEditingUnit,
  subjectTitle,
  summariesByStudentId,
  t,
  teachingUnits,
  toggleGroup,
  toggleStudent,
  unitNotes,
}) {
  const [studentOverviewView, setStudentOverviewView] = useState('timeline');
  const v2 = comparisonVariant === 'v2';
  const v3 = comparisonVariant === 'v3';
  const v2UnitColumnFlex = 3 / Math.max(teachingUnits.length, 1);
  const v2MinimumGridWidth = 384 + (teachingUnits.length * 92);
  const gridTemplateColumns = v3
    ? `minmax(96px, 0.82fr) minmax(56px, 0.36fr) minmax(112px, 0.86fr) minmax(70px, 0.46fr) repeat(${teachingUnits.length}, minmax(92px, ${v2UnitColumnFlex}fr))`
    : v2
    ? `minmax(128px, 1.1fr) minmax(56px, 0.36fr) minmax(112px, 0.86fr) minmax(70px, 0.46fr) repeat(${teachingUnits.length}, minmax(92px, ${v2UnitColumnFlex}fr))`
    : `minmax(105px, max-content) 96px minmax(90px, 1fr) 72px repeat(${teachingUnits.length}, 100px)`;
  const gridShellSx = {
    minWidth: { xs: v2 || v3 ? v2MinimumGridWidth : 760, lg: v2 || v3 ? v2MinimumGridWidth : 0 },
    display: 'grid',
    gridTemplateColumns,
    border: v2 || v3 ? '1px solid rgba(var(--sd-text-rgb), 0.16)' : '1px solid rgba(var(--sd-text-rgb), 0.12)',
    borderRadius: v2 || v3 ? '10px' : '14px',
    overflow: 'hidden',
    bgcolor: 'var(--sd-surface)',
    boxShadow: v2 || v3 ? '0 10px 28px rgba(23, 21, 26, 0.045)' : 'none',
  };

  return (
    <Box sx={{ overflowX: { xs: 'auto', lg: v2 || v3 ? 'auto' : 'visible' }, pb: 0.5 }}>
      <Box
        role="table"
        aria-label={buildGridAriaLabel()}
        sx={gridShellSx}
      >
        <Box
          role="columnheader"
          aria-label={t('learningModule.classPicture.classList')}
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            bgcolor: 'var(--sd-surface)',
            borderBottom: '1px solid rgba(var(--sd-text-rgb), 0.12)',
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              width: 28,
              height: 28,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--sd-text-muted)',
            }}
          >
            <GroupsIcon sx={{ fontSize: 16, opacity: 1 }} />
          </Box>
        </Box>
        <Box role="columnheader" aria-label={t('learningModule.classPicture.assessmentAlerts')} sx={{ p: 1, bgcolor: 'var(--sd-surface)', borderBottom: '1px solid rgba(var(--sd-text-rgb), 0.12)' }} />
        <Box
          role="columnheader"
          aria-label={t('learningModule.classPicture.quickNotes')}
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.45,
            justifyContent: 'flex-start',
            bgcolor: 'var(--sd-surface)',
            borderBottom: '1px solid rgba(var(--sd-text-rgb), 0.12)',
          }}
        >
          <IconButton
            aria-label={rowNotesVisible ? t('learningModule.classPicture.hideQuickNotes') : t('learningModule.classPicture.showQuickNotes')}
            aria-pressed={!rowNotesVisible}
            size="small"
            onClick={() => {
              setRowNotesVisible((currentValue) => !currentValue);
              cancelEditingRowNote();
            }}
            sx={{
              width: 28,
              height: 28,
              color: rowNotesVisible ? 'var(--sd-text-muted)' : 'var(--sd-text-muted)',
              bgcolor: 'transparent',
              border: '1px solid transparent',
              '&:hover, &:focus-visible': {
                bgcolor: rowNotesVisible ? 'rgba(var(--sd-primary-rgb), 0.09)' : 'rgba(var(--sd-text-rgb), 0.07)',
                borderColor: rowNotesVisible ? 'rgba(var(--sd-primary-rgb), 0.12)' : 'rgba(var(--sd-text-rgb), 0.08)',
              },
            }}
          >
            <NotesIcon sx={{ fontSize: 16, opacity: rowNotesVisible ? 1 : 0.48 }} />
          </IconButton>
          {!rowNotesVisible && (
            <Typography sx={{ color: 'var(--sd-text-muted)', fontSize: 11.5, fontWeight: 760, lineHeight: 1 }}>
              {t('learningModule.classPicture.hidden')}
            </Typography>
          )}
        </Box>
        <Box
          role="columnheader"
          aria-label={t('learningModule.classPicture.learningObservations')}
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'var(--sd-surface)',
            borderBottom: '1px solid rgba(var(--sd-text-rgb), 0.12)',
            borderLeft: '1px solid rgba(var(--sd-text-rgb), 0.055)',
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              width: 28,
              height: 28,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--sd-text-muted)',
            }}
          >
            <TimelineIcon sx={{ fontSize: 16, opacity: 1 }} />
          </Box>
        </Box>
        {teachingUnits.map((unit) => {
          const isEditingUnit = editingUnitId === unit.id;

          return (
            <Box
              key={unit.id}
              role="columnheader"
              aria-label={unit.title || unit.label}
              onClick={() => startEditingUnit(unit.id)}
              sx={{
                p: 1,
                bgcolor: 'var(--sd-surface)',
                color: darkText,
                borderBottom: '1px solid rgba(var(--sd-text-rgb), 0.12)',
                borderLeft: '1px solid rgba(var(--sd-text-rgb), 0.055)',
                cursor: 'pointer',
                minWidth: 0,
              }}
            >
              {isEditingUnit ? (
                <Box
                  component="input"
                  autoFocus
                  aria-label={t('learningModule.classPicture.oneWordUnitNote', { unit: unit.title || unit.label })}
                  value={draftUnitNote}
                  maxLength={16}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => setDraftUnitNote(event.target.value.replace(/\s+/g, ' '))}
                  onBlur={saveEditingUnit}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      saveEditingUnit();
                    }
                    if (event.key === 'Escape') {
                      event.preventDefault();
                      cancelEditingUnit();
                    }
                  }}
                  sx={{
                    width: '100%',
                    height: 30,
                    px: 0.55,
                    border: `1px solid ${purple}`,
                    borderRadius: '8px',
                    color: darkText,
                    bgcolor: 'var(--sd-surface)',
                    font: 'inherit',
                    fontSize: 12.4,
                    fontWeight: 860,
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
              ) : (
                <Typography sx={{ color: darkText, fontSize: 12.5, fontWeight: 820, lineHeight: 1.2 }}>
                  {unit.title || unit.label}
                </Typography>
              )}
            </Box>
          );
        })}

        {classPictureRows.map((row) => {
          if (row.type === 'group') {
            const group = row.group;
            const isCollapsed = collapsedGroupIds.includes(group.id);
            const isDragTarget = dragTargetId === group.id;

            return (
              <Box key={`group-${group.id}`} role="rowgroup" sx={{ display: 'contents' }}>
                <Box
                  role="row"
                  onDragOver={(event) => allowDrop(event, group.id)}
                  onDrop={(event) => handleDrop(event, group.id)}
                  sx={{ display: 'contents' }}
                >
                  <Box
                    role="cell"
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      openEditGroupDialog(group);
                    }}
                    aria-label={t('learningModule.classPicture.groupHeaderEditAria', { group: group.label })}
                    sx={{
                      gridColumn: `1 / span ${teachingUnits.length + 4}`,
                      p: 0.85,
                      borderTop: '1px solid rgba(var(--sd-text-rgb), 0.12)',
                      bgcolor: isDragTarget ? 'rgba(var(--sd-primary-rgb), 0.12)' : 'var(--sd-surface)',
                      cursor: 'default',
                    }}
                  >
                    <ButtonBase
                      onClick={() => toggleGroup(group.id)}
                      onDoubleClick={(event) => {
                        event.stopPropagation();
                        openEditGroupDialog(group);
                      }}
                      aria-expanded={!isCollapsed}
                      sx={{ minWidth: 0, gap: 0.55, borderRadius: '8px', textAlign: 'left', '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 1 } }}
                    >
                      <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: 18, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }} />
                      <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 860 }}>
                        {group.label}
                      </Typography>
                    </ButtonBase>
                  </Box>
                </Box>
              </Box>
            );
          }

          if (row.type === 'unassigned') {
            const isCollapsed = collapsedGroupIds.includes('not-grouped');
            const isDragTarget = dragTargetId === 'not-grouped';

            return (
              <Box key="not-grouped" role="rowgroup" sx={{ display: 'contents' }}>
                <Box
                  role="row"
                  onDragOver={(event) => allowDrop(event, 'not-grouped')}
                  onDrop={(event) => handleDrop(event, '')}
                  sx={{ display: 'contents' }}
                >
                  <Tooltip
                    arrow
                    enterDelay={1200}
                    enterNextDelay={1200}
                    title={(
                      <Box sx={{ px: 0.25, py: 0.15 }}>
                        <Typography sx={{ color: 'var(--sd-on-primary)', fontSize: 12.4, fontWeight: 820, lineHeight: 1.35 }}>
                          {t('learningModule.classPicture.doubleClickCreateFocus')}
                        </Typography>
                      </Box>
                    )}
                  >
                    <Box
                      role="cell"
                      onDoubleClick={(event) => {
                        event.stopPropagation();
                        openCreateGroupDialog();
                      }}
                      aria-label={t('learningModule.classPicture.unassignedStudentsCreateFocus')}
                      sx={{
                        gridColumn: `1 / span ${teachingUnits.length + 4}`,
                        p: 0.85,
                        borderTop: '1px solid rgba(var(--sd-text-rgb), 0.12)',
                        bgcolor: isDragTarget ? 'rgba(var(--sd-primary-rgb), 0.12)' : 'var(--sd-surface)',
                        cursor: 'default',
                      }}
                    >
                      <ButtonBase
                        onClick={() => toggleGroup('not-grouped')}
                        onDoubleClick={(event) => {
                          event.stopPropagation();
                          openCreateGroupDialog();
                        }}
                        aria-expanded={!isCollapsed}
                        sx={{ gap: 0.55, borderRadius: '8px', textAlign: 'left', '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 1 } }}
                      >
                        <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: 18, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }} />
                        <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 860 }}>
                          {t('learningModule.classPicture.unassigned')}
                        </Typography>
                      </ButtonBase>
                    </Box>
                  </Tooltip>
                </Box>
              </Box>
            );
          }

          const student = row.student;
          const groupId = row.groupId || '';
          const rowIndex = row.index || 0;
          const isExpanded = expandedStudentId === student.id;
          const timelineViewOpen = expandedViewMode === 'timeline' && Boolean(expandedStudentId);
          const isMutedByTimeline = timelineViewOpen && !isExpanded;
          const timelineMuteCellSx = isMutedByTimeline
            ? {
              opacity: 0.28,
              filter: 'grayscale(0.35)',
              transition: 'opacity 160ms ease, filter 160ms ease, background-color 140ms ease, border-color 140ms ease',
              '&:hover, &:focus-within': {
                opacity: 0.72,
                filter: 'grayscale(0.1)',
              },
            }
            : {};
          const isHovered = hoveredStudentId === student.id;
          const isRowNoteHovered = hoveredRowNoteStudentId === student.id;
          const rowNote = rowNotes[student.id] || '';
          const isEditingRowNote = editingRowNoteStudentId === student.id;
          const unitSummaries = summariesByStudentId.get(student.id) || new Map();
          const expandedUnit = expandedUnitId ? teachingUnits.find((unit) => unit.id === expandedUnitId) : null;
          const expandedUnitSummary = expandedUnitId
            ? unitSummaries.get(expandedUnitId) || {
              ...buildStudentUnitSummary([], student.id, expandedUnitId),
              unit: expandedUnit,
            }
            : null;
          const studentLearningObservations = sortByDate(
            learningObservations.filter((observation) => observation.studentId === student.id),
            'desc',
          );
          const alerts = buildAssessmentAlerts(evidenceItems, student.id, language, t);
          const learningObservationCount = studentLearningObservations.length;
          const latestLearningObservationDate = studentLearningObservations[0]?.date || '';

          return (
            <Box key={student.id} role="rowgroup" sx={{ display: 'contents' }}>
              <Box
                role="row"
                onDragOver={groupedViewActive ? (event) => allowDrop(event, `${groupId || 'not-grouped'}-${student.id}`) : undefined}
                onDrop={groupedViewActive ? (event) => handleDrop(event, groupId, rowIndex) : undefined}
                onMouseEnter={() => setHoveredStudentId(student.id)}
                onMouseLeave={() => setHoveredStudentId('')}
                sx={{ display: 'contents' }}
              >
                <Box
                  role="rowheader"
                  data-learning-module-row-cell="true"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.45,
                    p: 1,
                    borderTop: isHovered ? '1px solid rgba(var(--sd-primary-rgb), 0.34)' : '1px solid rgba(var(--sd-text-rgb), 0.08)',
                    borderBottom: isHovered ? '1px solid rgba(var(--sd-primary-rgb), 0.22)' : '1px solid transparent',
                    bgcolor: draggedStudentId === student.id ? 'rgba(var(--sd-primary-rgb), 0.08)' : isHovered ? 'rgba(var(--sd-primary-rgb), 0.045)' : 'var(--sd-surface)',
                    minWidth: 0,
                    transition: 'opacity 160ms ease, filter 160ms ease, background-color 140ms ease, border-color 140ms ease',
                    ...timelineMuteCellSx,
                  }}
                >
                  {groupedViewActive && (
                    <ButtonBase
                      draggable
                      onDragStart={(event) => handleDragStart(event, student.id)}
                      onDragEnd={handleDragEnd}
                      onClick={(event) => event.stopPropagation()}
                      aria-label={t('learningModule.classPicture.moveStudent', { student: student.displayName })}
                      sx={{
                        width: 24,
                        height: 28,
                        flexShrink: 0,
                        borderRadius: '8px',
                        color: 'text.secondary',
                        cursor: 'grab',
                        '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 1 },
                      }}
                    >
                      <DragIndicatorIcon sx={{ fontSize: 17 }} />
                    </ButtonBase>
                  )}
                  <ButtonBase
                    onClick={() => toggleStudent(student.id, '', 'timeline')}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${student.displayName}`}
                    aria-expanded={isExpanded}
                    aria-controls={`student-insight-${student.id}`}
                    sx={{
                      width: 24,
                      height: 28,
                      flexShrink: 0,
                      borderRadius: '8px',
                      color: 'text.secondary',
                      '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 1 },
                    }}
                  >
                    <KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: 18, transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 150ms ease' }} />
                  </ButtonBase>
                  <Box
                    data-smartdesk-hotspot={student.id === 'elias-nilsson' ? 'elias-student-row' : undefined}
                    data-smartdesk-student-id={student.id === 'elias-nilsson' ? student.id : undefined}
                    data-smartdesk-student-name={student.id === 'elias-nilsson' ? student.displayName : undefined}
                    data-smartdesk-subject-id={student.id === 'elias-nilsson' ? moduleConfig?.subjectId : undefined}
                    data-smartdesk-subject-title={student.id === 'elias-nilsson' ? subjectTitle : undefined}
                    sx={{
                      flex: '1 1 auto',
                      minWidth: 0,
                    }}
                  >
                    <Typography sx={{ color: darkText, fontSize: isExpanded ? 18 : 13, fontWeight: isExpanded ? 920 : 820, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'font-size 140ms ease, font-weight 140ms ease' }}>
                      {student.displayName}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  role="cell"
                  aria-label={t('learningModule.classPicture.studentAssessmentStatus', { student: student.displayName })}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 0.35,
                    flexWrap: 'wrap',
                    py: 0.45,
                    pl: 0.35,
                    pr: 0.25,
                    minWidth: 0,
                    borderTop: isHovered ? '1px solid rgba(var(--sd-primary-rgb), 0.34)' : '1px solid rgba(var(--sd-text-rgb), 0.08)',
                    borderBottom: isHovered ? '1px solid rgba(var(--sd-primary-rgb), 0.22)' : '1px solid transparent',
                    bgcolor: isHovered ? 'rgba(var(--sd-primary-rgb), 0.045)' : 'var(--sd-surface)',
                    transition: 'opacity 160ms ease, filter 160ms ease, background-color 140ms ease, border-color 140ms ease',
                    ...timelineMuteCellSx,
                  }}
                >
                  {alerts.map((alert) => (
                    <Tooltip key={alert.id} title={alert.label} arrow>
                      <ButtonBase
                        type="button"
                        aria-label={alert.label}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (alert.teachingUnitId) {
                            toggleStudent(student.id, alert.teachingUnitId, 'unit');
                          }
                        }}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: isExpanded ? 23 : 20,
                          height: isExpanded ? 23 : 20,
                          borderRadius: '5px',
                          cursor: alert.teachingUnitId ? 'pointer' : 'default',
                          '&:hover': {
                            bgcolor: alert.type === 'absent' ? 'rgba(var(--sd-warning-rgb), 0.08)' : 'rgba(var(--sd-primary-rgb), 0.08)',
                          },
                          '&:focus-visible': { outline: `2px solid ${alert.type === 'absent' ? absentOrange : purple}`, outlineOffset: 1 },
                        }}
                      >
                        {alert.type === 'absent' ? (
                          <PersonOffOutlinedIcon sx={{ color: absentOrange, fontSize: isExpanded ? 18 : 15, flexShrink: 0, opacity: 0.88 }} />
                        ) : (
                          <ErrorOutlineIcon sx={{ color: 'var(--sd-accent-text)', fontSize: isExpanded ? 18 : 15, flexShrink: 0, opacity: 0.88 }} />
                        )}
                      </ButtonBase>
                    </Tooltip>
                  ))}
                </Box>

                <Box
                  role="cell"
                  aria-label={rowNotesVisible
                    ? rowNote
                      ? t('learningModule.classPicture.quickNoteWithValueForStudent', { student: student.displayName, note: rowNote })
                      : t('learningModule.classPicture.quickNoteLabelForStudent', { student: student.displayName })
                    : t('learningModule.classPicture.quickNoteHiddenForStudent', { student: student.displayName })}
                  onClick={rowNotesVisible ? () => startEditingRowNote(student.id) : undefined}
                  onMouseEnter={() => setHoveredRowNoteStudentId(student.id)}
                  onMouseLeave={() => setHoveredRowNoteStudentId('')}
                  sx={{
                    p: 0.85,
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 0,
                    borderTop: isHovered ? '1px solid rgba(var(--sd-primary-rgb), 0.34)' : '1px solid rgba(var(--sd-text-rgb), 0.08)',
                    borderBottom: isHovered ? '1px solid rgba(var(--sd-primary-rgb), 0.22)' : '1px solid transparent',
                    bgcolor: isHovered ? 'rgba(var(--sd-primary-rgb), 0.045)' : 'var(--sd-surface)',
                    cursor: rowNotesVisible ? 'pointer' : 'default',
                    transition: 'opacity 160ms ease, filter 160ms ease, background-color 140ms ease, border-color 140ms ease',
                    ...timelineMuteCellSx,
                  }}
                >
                  {rowNotesVisible && isEditingRowNote ? (
                      <Box
                        component="input"
                        autoFocus
                        aria-label={t('learningModule.classPicture.quickNoteForStudent', { student: student.displayName })}
                        value={draftRowNote}
                        maxLength={60}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => setDraftRowNote(event.target.value.replace(/\s+/g, ' '))}
                        onBlur={saveEditingRowNote}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            saveEditingRowNote();
                          }
                          if (event.key === 'Escape') {
                            event.preventDefault();
                            cancelEditingRowNote();
                          }
                        }}
                        sx={{
                          width: '100%',
                          height: 30,
                          px: 0.65,
                          border: `1px solid ${purple}`,
                          borderRadius: '8px',
                          color: darkText,
                          bgcolor: 'var(--sd-surface)',
                          font: 'inherit',
                          fontSize: 12.5,
                          fontWeight: 760,
                          outline: 'none',
                        }}
                      />
                  ) : rowNotesVisible ? (
                      <Box
                        sx={{
                          width: '100%',
                            minHeight: 28,
                            px: 0.7,
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '8px',
                            bgcolor: isRowNoteHovered ? 'rgba(var(--sd-primary-rgb), 0.13)' : 'rgba(var(--sd-primary-rgb), 0.055)',
                            transition: 'background-color 140ms ease',
                          }}
                        >
                        <Typography sx={{ color: rowNote ? 'var(--sd-text-muted)' : 'var(--sd-text-muted)', fontSize: 12.2, fontWeight: rowNote ? 720 : 640, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rowNote}
                        </Typography>
                      </Box>
                  ) : null}
                </Box>

                <Box
                  role="cell"
                  aria-label={`${student.displayName}: ${learningObservationCount} ${t('learningModule.classPicture.learningObservations').toLowerCase()}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 0.45,
                    minWidth: 0,
                    borderTop: isHovered ? '1px solid rgba(var(--sd-primary-rgb), 0.34)' : '1px solid rgba(var(--sd-text-rgb), 0.08)',
                    borderBottom: isHovered ? '1px solid rgba(var(--sd-primary-rgb), 0.22)' : '1px solid transparent',
                    borderLeft: '1px solid rgba(var(--sd-text-rgb), 0.055)',
                    bgcolor: isHovered ? 'rgba(var(--sd-primary-rgb), 0.045)' : 'var(--sd-surface)',
                    transition: 'opacity 160ms ease, filter 160ms ease, background-color 140ms ease, border-color 140ms ease',
                    ...timelineMuteCellSx,
                  }}
                >
                  {!!learningObservationCount ? (
                    <Tooltip
                      title={`${student.displayName}: ${learningObservationCount} ${t('learningModule.classPicture.learningObservations').toLowerCase()}${latestLearningObservationDate ? ` · ${formatDemoDate(latestLearningObservationDate, language, t)}` : ''}`}
                      arrow
                    >
                      <Box
                        component="span"
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleStudent(student.id, '', 'global')}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            toggleStudent(student.id, '', 'global');
                          }
                        }}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.25,
                          minWidth: learningObservationCount >= 10 ? 34 : 28,
                          height: isExpanded ? 22 : 19,
                          px: 0.45,
                          borderRadius: '999px',
                          border: '1px solid rgba(var(--sd-text-rgb), 0.14)',
                          bgcolor: 'rgba(var(--sd-text-rgb), 0.035)',
                          color: 'var(--sd-text-muted)',
                          cursor: 'pointer',
                          '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                        }}
                      >
                        <NotesIcon sx={{ fontSize: isExpanded ? 13.5 : 12.5, flexShrink: 0 }} />
                        <Typography component="span" sx={{ fontSize: isExpanded ? 12 : 10.8, fontWeight: 900, lineHeight: 1 }}>
                          {learningObservationCount}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ) : (
                    <Box sx={{ width: 20, height: 2, borderRadius: 999, bgcolor: 'rgba(var(--sd-text-rgb), 0.16)' }} />
                  )}
                </Box>

                {teachingUnits.map((unit) => {
                  const summary = unitSummaries.get(unit.id) || buildStudentUnitSummary([], student.id, unit.id);
                  const noteKey = getStudentUnitCellNoteKey(student.id, unit.id);
                  const savedNote = cellNotes[noteKey] || unitNotes[unit.id] || '';
                  const isEditingCell = editingCellKey === noteKey;
                  const isActiveUnitCell = isExpanded && expandedUnitId === unit.id;
                  const cellDetail = savedNote
                    ? t('learningModule.classPicture.manualNote', { note: savedNote })
                    : summary.items.length
                      ? t('learningModule.classPicture.evidenceSummary', {
                        observations: summary.observations.length,
                        observationLabel: getCountLabel(t, 'learningModule.classPicture.observation', summary.observations.length),
                        assessments: summary.assessments.length,
                        assessmentLabel: getCountLabel(t, 'learningModule.classPicture.assessment', summary.assessments.length),
                      })
                      : t('learningModule.classPicture.noEvidenceRecorded');

                  return (
                    <Box
                      key={`${student.id}:${unit.id}`}
                      role="cell"
                      tabIndex={isEditingCell ? -1 : 0}
                      aria-label={`${student.displayName}, ${unit.title || unit.label}: ${cellDetail}`}
                      onClick={() => {
                        if (!isEditingCell) {
                          toggleStudent(student.id, unit.id, 'unit');
                        }
                      }}
                      onKeyDown={(event) => {
                        if (!isEditingCell && (event.key === 'Enter' || event.key === ' ')) {
                          event.preventDefault();
                          toggleStudent(student.id, unit.id, 'unit');
                        }
                      }}
                      sx={{
                        p: 1,
                        borderTop: isHovered ? '1px solid rgba(var(--sd-primary-rgb), 0.34)' : '1px solid rgba(var(--sd-text-rgb), 0.08)',
                        borderBottom: isHovered ? '1px solid rgba(var(--sd-primary-rgb), 0.22)' : '1px solid transparent',
                        borderLeft: '1px solid rgba(var(--sd-text-rgb), 0.055)',
                        textAlign: 'left',
                        position: 'relative',
                        bgcolor: isActiveUnitCell ? 'rgba(var(--sd-primary-rgb), 0.095)' : isHovered ? 'rgba(var(--sd-primary-rgb), 0.045)' : 'var(--sd-surface)',
                        boxShadow: isActiveUnitCell ? 'inset 0 0 0 1px rgba(var(--sd-primary-rgb), 0.22)' : 'none',
                        cursor: isEditingCell ? 'text' : 'pointer',
                        transition: 'opacity 160ms ease, filter 160ms ease, background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease',
                        ...timelineMuteCellSx,
                        '&:hover, &:focus-within': {
                          bgcolor: 'rgba(var(--sd-primary-rgb), 0.085)',
                          boxShadow: 'inset 0 0 0 1px rgba(var(--sd-primary-rgb), 0.16)',
                        },
                        '&:hover .LearningModuleUnitNoteButton, &:focus-within .LearningModuleUnitNoteButton': {
                          opacity: 1,
                          transform: 'translateY(0) scale(1)',
                          pointerEvents: 'auto',
                          transitionDelay: '650ms',
                        },
                      }}
                    >
                      {!isEditingCell && (
                        <IconButton
                          className="LearningModuleUnitNoteButton"
                          aria-label={t('learningModule.classPicture.addNoteForStudentUnit', { student: student.displayName, unit: unit.title || unit.label })}
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            startEditingCell(student.id, unit.id);
                            event.currentTarget.blur();
                          }}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            zIndex: 1,
                            width: 22,
                            height: 22,
                            opacity: 0,
                            pointerEvents: 'none',
                            transform: 'translateY(1px) scale(0.96)',
                            transition: 'opacity 140ms ease, transform 140ms ease, background-color 140ms ease, color 140ms ease',
                            transitionDelay: '0ms',
                            color: 'var(--sd-accent-text)',
                            bgcolor: 'var(--sd-surface)',
                            border: '1px solid rgba(var(--sd-primary-rgb), 0.18)',
                            boxShadow: '0 4px 10px rgba(23, 21, 26, 0.08)',
                            '&:hover': { bgcolor: purple, color: 'var(--sd-on-primary)' },
                            '&:focus-visible': {
                              opacity: 1,
                              pointerEvents: 'auto',
                              outline: `2px solid ${'var(--sd-focus)'}`,
                              outlineOffset: 1,
                            },
                          }}
                        >
                          <NotesIcon sx={{ fontSize: 12.5 }} />
                        </IconButton>
                      )}
                      {isEditingCell ? (
                        <Box
                          component="input"
                          autoFocus
                          aria-label={t('learningModule.classPicture.oneWordStudentUnitNote', { student: student.displayName, unit: unit.title || unit.label })}
                          value={draftCellNote}
                          maxLength={16}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => setDraftCellNote(event.target.value.replace(/\s+/g, ' '))}
                          onBlur={saveEditingCell}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              saveEditingCell();
                            }
                            if (event.key === 'Escape') {
                              event.preventDefault();
                              cancelEditingCell();
                            }
                          }}
                          sx={{
                            width: '100%',
                            height: 33,
                            px: 0.55,
                            border: `1px solid ${purple}`,
                            borderRadius: '8px',
                            color: darkText,
                            bgcolor: 'var(--sd-surface)',
                            font: 'inherit',
                            fontSize: 13,
                            fontWeight: 860,
                            textAlign: 'center',
                            outline: 'none',
                          }}
                        />
                      ) : savedNote ? (
                        <Box sx={{ minHeight: 33, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ color: 'var(--sd-accent-text)', fontSize: 13.4, fontWeight: 900, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {savedNote}
                          </Typography>
                        </Box>
                      ) : (
                        <EvidenceMarker summary={summary} t={t} />
                      )}
                    </Box>
                  );
                })}
              </Box>

              {isExpanded && (
                <WorkspaceExpandedRowCell
                  id={`student-insight-${student.id}`}
                  gridColumn={`1 / span ${teachingUnits.length + 4}`}
                >
                    {expandedViewMode === 'unit' && expandedUnit ? (
                      <StudentUnitInsightPanel
                        student={student}
                        summary={expandedUnitSummary}
                        unit={expandedUnit}
                        configuredFocuses={skills}
                        learningContexts={learningContexts}
                        levels={levels}
                        onClose={() => toggleStudent(student.id, expandedUnitId, 'unit')}
                        onEditAssessment={openAssessmentEdit}
                        language={language}
                        t={t}
                      />
                    ) : expandedViewMode === 'global' ? (
                      <StudentGlobalInsightPanel
                        student={student}
                        evidenceItems={evidenceItems}
                        rowNote={rowNote}
                        learningObservations={studentLearningObservations}
                        subjectId={moduleConfig?.subjectId}
                        subjectTitle={subjectTitle}
                        learningObservationAreas={learningObservationAreas}
                        language={language}
                        t={t}
                      />
                    ) : (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: { xs: 1, sm: 1.25 }, pt: { xs: 1, sm: 1.15 }, pb: 0.1 }}>
                          <Stack direction="row" spacing={0.45} alignItems="center">
                            {[
                              { id: 'timeline', label: 'Timeline', Icon: TimelineIcon },
                              { id: 'heatmap', label: 'Heatmap', Icon: GridViewIcon },
                            ].map((option) => {
                              const selected = studentOverviewView === option.id;
                              const Icon = option.Icon;
                              return (
                                <ButtonBase
                                  key={option.id}
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => setStudentOverviewView(option.id)}
                                  sx={{
                                    minHeight: 28,
                                    px: 0.75,
                                    borderRadius: '999px',
                                    border: '1px solid',
                                    borderColor: selected ? 'rgba(var(--sd-primary-rgb), 0.24)' : 'rgba(var(--sd-text-rgb), 0.095)',
                                    bgcolor: selected ? 'rgba(var(--sd-primary-rgb), 0.06)' : 'var(--sd-surface)',
                                    color: selected ? darkText : 'text.secondary',
                                    fontSize: 11.4,
                                    fontWeight: selected ? 880 : 780,
                                    gap: 0.35,
                                    '&:hover': { bgcolor: selected ? 'rgba(var(--sd-primary-rgb), 0.075)' : 'rgba(var(--sd-text-rgb), 0.026)' },
                                    '&:focus-visible': { outline: `2px solid ${'var(--sd-focus)'}`, outlineOffset: 2 },
                                  }}
                                >
                                  <Icon sx={{ fontSize: 14 }} />
                                  {option.label}
                                </ButtonBase>
                              );
                            })}
                          </Stack>
                        </Box>
                        {studentOverviewView === 'heatmap' ? (
                          <StudentEvidenceHeatmap
                            student={student}
                            evidenceItems={allEvidenceItems || evidenceItems}
                            learningObservations={studentLearningObservations}
                            learningObservationAreas={learningObservationAreas}
                            curriculumAreas={curriculumAreas}
                            teachingUnits={teachingUnits}
                            skills={skills}
                            levels={levels}
                            language={language}
                          />
                        ) : (
                          <ClassPictureExpandedView
                            moduleId={moduleConfig?.id || 'learning-module'}
                            student={student}
                            evidenceItems={allEvidenceItems || evidenceItems}
                            learningObservations={studentLearningObservations}
                            teachingUnits={teachingUnits}
                            rowNote={rowNote}
                            cellNotes={cellNotes}
                            unitNotes={unitNotes}
                            learningObservationAreas={learningObservationAreas}
                            skills={skills}
                            levels={levels}
                            learningContexts={learningContexts}
                            seededTimelineResponses={moduleConfig?.evidence?.timelineResponses || []}
                            timelineClassContextLabel={moduleConfig?.planning?.blockTypeLabels?.teaching || ''}
                            language={language}
                            t={t}
                          />
                        )}
                      </Box>
                    )}
                </WorkspaceExpandedRowCell>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function ClassPictureEvidenceGridV2(props) {
  return <ClassPictureEvidenceGridV1 {...props} comparisonVariant="v2" />;
}

export default function ClassPictureScreen({ moduleConfig, screenConfig }) {
  const { language, t } = useConceptDemoLanguage();
  const learningObservationAreas = useMemo(() => getLearningObservationAreas(t), [t]);
  const students = moduleConfig?.classData?.students || [];
  const teachingUnits = [...(moduleConfig?.curriculum?.teachingUnits || [])]
    .sort((first, second) => (first.order || 0) - (second.order || 0));
  const curriculumAreas = [...(moduleConfig?.curriculum?.areas || [])]
    .sort((first, second) => (first.order || 0) - (second.order || 0));
  const moduleId = moduleConfig?.id || 'learning-module';
  const activeLessonDate = moduleConfig?.lessons?.current?.date || '';
  const [storedAssessments, setStoredAssessments] = useState(() => readLearningModuleAssessmentResults(moduleId).assessments);
  const [localEvidencePayload, setLocalEvidencePayload] = useState(() => readLearningModuleEvidence(moduleId));
  const [localLearningObservationPayload, setLocalLearningObservationPayload] = useState(() => readLearningModuleLearningObservations(moduleId));
  const allEvidenceItems = useMemo(() => {
    const storedAssessmentItems = storedAssessments.map(normalizeLearningModuleAssessmentAsEvidence);
    const storedAssessmentIds = new Set(storedAssessmentItems.map((assessment) => assessment.id));

    return [
      ...storedAssessmentItems,
      ...(localEvidencePayload.observations || []),
      ...(moduleConfig?.evidence?.items || [])
        .filter((item) => item?.type !== 'assessment' || !storedAssessmentIds.has(item.id)),
    ];
  }, [localEvidencePayload, moduleConfig, storedAssessments]);
  const evidenceItems = useMemo(() => (
    allEvidenceItems.filter((item) => !activeLessonDate || !item.date || item.date <= activeLessonDate)
  ), [activeLessonDate, allEvidenceItems]);
  const learningObservations = useMemo(() => [
    ...(moduleConfig?.evidence?.learningObservations || []),
    ...groupLearningObservationRecords(localLearningObservationPayload.observations || []),
  ].filter((observation) => !activeLessonDate || !observation.date || observation.date <= activeLessonDate), [activeLessonDate, localLearningObservationPayload, moduleConfig]);
  const skills = moduleConfig?.curriculum?.skills || [];
  const levels = moduleConfig?.curriculum?.observationLevels || [];
  const subjectTitle = moduleConfig?.subjectTitle || moduleConfig?.subjectId || 'Subject';
  const learningContexts = moduleConfig?.learningContexts?.length
    ? moduleConfig.learningContexts
    : getLearningContextsForSubject(moduleConfig?.subjectId);
  const rowNotesStorageKey = `${moduleConfig?.id || 'learning-module'}-row-notes`;
  const cellNotesStorageKey = `${moduleConfig?.id || 'learning-module'}-cell-notes`;
  const unitNotesStorageKey = `${moduleConfig?.id || 'learning-module'}-unit-notes`;
  const [expandedStudentId, setExpandedStudentId] = useState('');
  const [expandedUnitId, setExpandedUnitId] = useState('');
  const [hoveredStudentId, setHoveredStudentId] = useState('');
  const [hoveredRowNoteStudentId, setHoveredRowNoteStudentId] = useState('');
  const [rowNotesVisible, setRowNotesVisible] = useState(true);
  const [expandedViewMode, setExpandedViewMode] = useState('timeline');
  const [rowNotes, setRowNotes] = useState(() => getStoredNotes(rowNotesStorageKey));
  const [cellNotes, setCellNotes] = useState(() => getStoredNotes(cellNotesStorageKey));
  const [unitNotes, setUnitNotes] = useState(() => getStoredNotes(unitNotesStorageKey));
  const [editingRowNoteStudentId, setEditingRowNoteStudentId] = useState('');
  const [draftRowNote, setDraftRowNote] = useState('');
  const [editingCellKey, setEditingCellKey] = useState('');
  const [draftCellNote, setDraftCellNote] = useState('');
  const [editingUnitId, setEditingUnitId] = useState('');
  const [draftUnitNote, setDraftUnitNote] = useState('');
  const [activeGroupingSetId, setActiveGroupingSetId] = useState('none');
  const [customClassViews, setCustomClassViews] = useState(() => readStoredClassViews(moduleId));
  const [addClassViewOpen, setAddClassViewOpen] = useState(false);
  const [newClassViewTitle, setNewClassViewTitle] = useState('');
  const [collapsedGroupIds, setCollapsedGroupIds] = useState([]);
  const [draggedStudentId, setDraggedStudentId] = useState('');
  const [dragTargetId, setDragTargetId] = useState('');
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupDialogMode, setGroupDialogMode] = useState('create');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [moveAnnouncement, setMoveAnnouncement] = useState('');
  const [assessmentEditModal, setAssessmentEditModal] = useState({
    open: false,
    storedAssessment: null,
  });
  const {
    groups: workingGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    moveStudentToGroup,
    moveStudentToUngrouped,
    resetGroups,
  } = useClassWorkingGroups({
    subjectId: moduleConfig?.subjectId || moduleId,
    classId: moduleConfig?.classId || moduleId,
    initialGroups: moduleConfig?.classData?.workingGroups || [],
  });
  const handledResetTokenRef = useRef(moduleConfig?.demoResetToken || 0);
  const groupDefinitions = [
    ...(moduleConfig?.classData?.groupDefinitions || classGroupDefinitions),
    ...customClassViews,
  ];
  const activeGroupingSet = groupDefinitions.find((definition) => definition.id === activeGroupingSetId) || null;
  const groupedViewActive = activeGroupingSetId !== 'none';
  const activeGroups = useMemo(
    () => sortGroupsForDisplay(getActiveGroups(workingGroups).filter((group) => group.typeId === activeGroupingSetId)),
    [activeGroupingSetId, workingGroups],
  );
  const notGroupedStudents = useMemo(
    () => (groupedViewActive ? getUngroupedStudentsForType(students, workingGroups, activeGroupingSetId) : []),
    [activeGroupingSetId, groupedViewActive, students, workingGroups],
  );

  useEffect(() => {
    function refreshStoredAssessments() {
      setStoredAssessments(readLearningModuleAssessmentResults(moduleId).assessments);
    }

    function refreshStoredEvidence() {
      setLocalEvidencePayload(readLearningModuleEvidence(moduleId));
    }

    function refreshStoredLearningObservations() {
      setLocalLearningObservationPayload(readLearningModuleLearningObservations(moduleId));
    }

    function handleStorageChange(event) {
      if (event.key === getLearningModuleAssessmentResultsStorageKey(moduleId)) {
        refreshStoredAssessments();
      }
      if (event.key === getLearningModuleEvidenceStorageKey(moduleId)) {
        refreshStoredEvidence();
      }
      if (event.key === getLearningModuleLearningObservationsStorageKey(moduleId)) {
        refreshStoredLearningObservations();
      }
    }

    function handleCustomStorageChange(event) {
      if (!event.detail?.moduleId || event.detail.moduleId === moduleId) {
        refreshStoredAssessments();
      }
    }

    function handleCustomEvidenceChange(event) {
      if (!event.detail?.moduleId || event.detail.moduleId === moduleId) {
        refreshStoredEvidence();
      }
    }

    function handleCustomLearningObservationsChange(event) {
      if (!event.detail?.moduleId || event.detail.moduleId === moduleId) {
        refreshStoredLearningObservations();
      }
    }

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(LEARNING_MODULE_ASSESSMENT_RESULTS_STORAGE_EVENT, handleCustomStorageChange);
    window.addEventListener(LEARNING_MODULE_EVIDENCE_STORAGE_EVENT, handleCustomEvidenceChange);
    window.addEventListener(LEARNING_MODULE_LEARNING_OBSERVATIONS_STORAGE_EVENT, handleCustomLearningObservationsChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(LEARNING_MODULE_ASSESSMENT_RESULTS_STORAGE_EVENT, handleCustomStorageChange);
      window.removeEventListener(LEARNING_MODULE_EVIDENCE_STORAGE_EVENT, handleCustomEvidenceChange);
      window.removeEventListener(LEARNING_MODULE_LEARNING_OBSERVATIONS_STORAGE_EVENT, handleCustomLearningObservationsChange);
    };
  }, [moduleId]);

  useEffect(() => {
    const resetToken = moduleConfig?.demoResetToken || 0;

    if (!resetToken || handledResetTokenRef.current === resetToken) {
      return;
    }

    handledResetTokenRef.current = resetToken;
    setStoredAssessments(readLearningModuleAssessmentResults(moduleId).assessments);
    setLocalEvidencePayload(readLearningModuleEvidence(moduleId));
    setLocalLearningObservationPayload(readLearningModuleLearningObservations(moduleId));
    setRowNotes({});
    setCellNotes({});
    setUnitNotes({});
    setExpandedStudentId('');
    setExpandedUnitId('');
    setExpandedViewMode('timeline');
    setHoveredStudentId('');
    setHoveredRowNoteStudentId('');
    setEditingRowNoteStudentId('');
    setDraftRowNote('');
    setEditingCellKey('');
    setDraftCellNote('');
    setEditingUnitId('');
    setDraftUnitNote('');
    setActiveGroupingSetId('none');
    setAddClassViewOpen(false);
    setNewClassViewTitle('');
    setCollapsedGroupIds([]);
    setDraggedStudentId('');
    setDragTargetId('');
    setGroupDialogOpen(false);
    setGroupDialogMode('create');
    setSelectedGroup(null);
    setAssessmentEditModal({
      open: false,
      storedAssessment: null,
    });
    setMoveAnnouncement('');
    resetGroups();
  }, [moduleConfig?.demoResetToken, moduleId, resetGroups]);

  function openAssessmentEdit(assessmentEvidence) {
    const assessmentRecordId = getAssessmentRecordId(assessmentEvidence);
    const storedAssessment = storedAssessments.find((assessment) => assessment.id === assessmentRecordId);
    const seedAssessment = (moduleConfig?.evidence?.items || [])
      .find((item) => item?.type === 'assessment' && item.id === assessmentRecordId);
    const editableAssessment = storedAssessment || createStoredAssessmentFromEvidence(seedAssessment, students);

    if (!editableAssessment) {
      return;
    }

    setAssessmentEditModal({
      open: true,
      storedAssessment: editableAssessment,
    });
  }

  function closeAssessmentEdit() {
    setAssessmentEditModal((currentState) => ({
      ...currentState,
      open: false,
    }));
  }

  function handleAssessmentEditSaved(saveResult) {
    setStoredAssessments(saveResult?.payload?.assessments || readLearningModuleAssessmentResults(moduleId).assessments);
  }

  const summariesByStudentId = useMemo(() => {
    const summaries = new Map();
    students.forEach((student) => {
      const unitSummaries = new Map();
      teachingUnits.forEach((unit) => {
        unitSummaries.set(unit.id, {
          ...buildStudentUnitSummary(evidenceItems, student.id, unit.id),
          unit,
        });
      });
      summaries.set(student.id, unitSummaries);
    });
    return summaries;
  }, [evidenceItems, students, teachingUnits]);
  const classPictureRows = useMemo(() => {
    if (!groupedViewActive) {
      return students.map((student, index) => ({ type: 'student', student, groupId: '', index }));
    }

    const rows = [];
    activeGroups.forEach((group) => {
      rows.push({ type: 'group', group });
      if (!collapsedGroupIds.includes(group.id)) {
        getStudentsInGroupOrder(group, students).forEach((student, index) => {
          rows.push({ type: 'student', student, groupId: group.id, index });
        });
      }
    });
    rows.push({ type: 'unassigned' });
    if (!collapsedGroupIds.includes('not-grouped')) {
      notGroupedStudents.forEach((student, index) => {
        rows.push({ type: 'student', student, groupId: '', index });
      });
    }

    return rows;
  }, [activeGroups, collapsedGroupIds, groupedViewActive, notGroupedStudents, students]);

  function toggleStudent(studentId, unitId = '', viewMode = 'timeline') {
    if (expandedStudentId === studentId && expandedUnitId === unitId && expandedViewMode === viewMode) {
      setExpandedStudentId('');
      setExpandedUnitId('');
      setExpandedViewMode('timeline');
    } else {
      setExpandedStudentId(studentId);
      setExpandedUnitId(unitId);
      setExpandedViewMode(viewMode);
    }
  }

  function toggleGroup(groupId) {
    setCollapsedGroupIds((currentIds) => (
      currentIds.includes(groupId)
        ? currentIds.filter((id) => id !== groupId)
        : [...currentIds, groupId]
    ));
  }

  function changeClassView(value) {
    if (value === 'add-new-view') {
      setAddClassViewOpen(true);
      return;
    }

    setActiveGroupingSetId(value);
    setCollapsedGroupIds([]);
  }

  function closeAddClassViewDialog() {
    setAddClassViewOpen(false);
    setNewClassViewTitle('');
  }

  function addClassView() {
    const title = newClassViewTitle.trim();
    if (!title) return;

    const id = `custom-view-${slugifyClassViewTitle(title)}-${Date.now().toString(36)}`;
    const nextView = {
      id,
      label: title,
      description: '',
      allowMultiplePerStudent: true,
      custom: true,
    };
    const nextViews = [...customClassViews, nextView];
    setCustomClassViews(nextViews);
    writeStoredClassViews(moduleId, nextViews);
    setActiveGroupingSetId(id);
    setCollapsedGroupIds([]);
    closeAddClassViewDialog();
  }

  function deleteClassView(viewId) {
    const nextViews = customClassViews.filter((view) => view.id !== viewId);
    setCustomClassViews(nextViews);
    writeStoredClassViews(moduleId, nextViews);
    if (activeGroupingSetId === viewId) {
      setActiveGroupingSetId('none');
      setCollapsedGroupIds([]);
    }
  }

  function openCreateGroupDialog() {
    setGroupDialogMode('create');
    setSelectedGroup(null);
    setGroupDialogOpen(true);
  }

  function openEditGroupDialog(group) {
    setGroupDialogMode('edit');
    setSelectedGroup(group);
    setGroupDialogOpen(true);
  }

  function handleCreateGroup(groupInput) {
    createGroup({
      ...groupInput,
      typeId: groupedViewActive ? activeGroupingSetId : groupInput.typeId,
    });
  }

  function announceMove(studentId, groupLabel) {
    const student = students.find((item) => item.id === studentId);
    setMoveAnnouncement(t('learningModule.classPicture.studentMovedToGroup', {
      student: student?.displayName || 'Student',
      group: groupLabel,
    }));
  }

  function moveStudent(studentId, groupId, index) {
    if (!groupedViewActive) {
      return;
    }

    if (groupId) {
      const group = activeGroups.find((item) => item.id === groupId);
      moveStudentToGroup(groupId, studentId, index);
      announceMove(studentId, group?.label || t('learningModule.classPicture.focusFallback'));
    } else {
      moveStudentToUngrouped(activeGroupingSetId, studentId);
      announceMove(studentId, t('learningModule.classPicture.unassigned'));
    }
  }

  function handleDragStart(event, studentId) {
    setDraggedStudentId(studentId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', studentId);
    event.stopPropagation();
  }

  function allowDrop(event, targetId) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragTargetId(targetId);
  }

  function handleDrop(event, groupId, index) {
    event.preventDefault();
    const studentId = event.dataTransfer.getData('text/plain') || draggedStudentId;
    if (studentId) {
      moveStudent(studentId, groupId, index);
    }
    setDraggedStudentId('');
    setDragTargetId('');
  }

  function handleDragEnd() {
    setDraggedStudentId('');
    setDragTargetId('');
  }

  function startEditingRowNote(studentId) {
    setEditingRowNoteStudentId(studentId);
    setDraftRowNote(rowNotes[studentId] || '');
  }

  function saveEditingRowNote() {
    if (!editingRowNoteStudentId) {
      return;
    }

    setRowNotes((currentNotes) => {
      const nextNotes = { ...currentNotes };
      const note = normalizeNote(draftRowNote, 60);

      if (note) {
        nextNotes[editingRowNoteStudentId] = note;
      } else {
        delete nextNotes[editingRowNoteStudentId];
      }

      return writeStoredNotes(rowNotesStorageKey, nextNotes);
    });
    setEditingRowNoteStudentId('');
    setDraftRowNote('');
  }

  function startEditingCell(studentId, unitId) {
    const key = getStudentUnitCellNoteKey(studentId, unitId);
    setEditingCellKey(key);
    setDraftCellNote(cellNotes[key] || unitNotes[unitId] || '');
  }

  function saveEditingCell() {
    if (!editingCellKey) {
      return;
    }

    setCellNotes((currentNotes) => {
      const nextNotes = { ...currentNotes };
      const note = normalizeNote(draftCellNote, 16);

      if (note) {
        nextNotes[editingCellKey] = note;
      } else {
        delete nextNotes[editingCellKey];
      }

      return writeStoredNotes(cellNotesStorageKey, nextNotes);
    });
    setEditingCellKey('');
    setDraftCellNote('');
  }

  function cancelEditingCell() {
    setEditingCellKey('');
    setDraftCellNote('');
  }

  function cancelEditingRowNote() {
    setEditingRowNoteStudentId('');
    setDraftRowNote('');
  }

  function startEditingUnit(unitId) {
    setEditingUnitId(unitId);
    setDraftUnitNote(unitNotes[unitId] || '');
  }

  function saveEditingUnit() {
    if (!editingUnitId) {
      return;
    }

    setUnitNotes((currentNotes) => {
      const nextNotes = { ...currentNotes };
      const note = normalizeNote(draftUnitNote, 16);

      if (note) {
        nextNotes[editingUnitId] = note;
      } else {
        delete nextNotes[editingUnitId];
      }

      return writeStoredNotes(unitNotesStorageKey, nextNotes);
    });
    setEditingUnitId('');
    setDraftUnitNote('');
  }

  function cancelEditingUnit() {
    setEditingUnitId('');
    setDraftUnitNote('');
  }

  function buildGridAriaLabel() {
    return groupedViewActive
      ? t('learningModule.classPicture.evidenceMapFocused', {
        title: moduleConfig?.title || t('learningModule.fallbackTitle'),
        focus: activeGroupingSet?.label || t('learningModule.classPicture.focus'),
      })
      : t('learningModule.classPicture.classPictureAria', { title: moduleConfig?.title || t('learningModule.fallbackTitle') });
  }

  const classPictureGridProps = {
    activeGroupingSet,
    allowDrop,
    buildGridAriaLabel,
    cancelEditingCell,
    cancelEditingRowNote,
    cancelEditingUnit,
    cellNotes,
    classPictureRows,
    collapsedGroupIds,
    draftCellNote,
    draftRowNote,
    draftUnitNote,
    draggedStudentId,
    dragTargetId,
    editingCellKey,
    editingRowNoteStudentId,
    editingUnitId,
    allEvidenceItems,
    evidenceItems,
    expandedStudentId,
    expandedUnitId,
    expandedViewMode,
    groupedViewActive,
    handleDragEnd,
    handleDragStart,
    handleDrop,
    hoveredRowNoteStudentId,
    hoveredStudentId,
    language,
    curriculumAreas,
    learningObservationAreas,
    learningObservations,
    learningContexts,
    levels,
    moduleConfig,
    openAssessmentEdit,
    openCreateGroupDialog,
    openEditGroupDialog,
    rowNotes,
    rowNotesVisible,
    saveEditingCell,
    saveEditingRowNote,
    saveEditingUnit,
    setDraftCellNote,
    setDraftRowNote,
    setDraftUnitNote,
    setExpandedStudentId,
    setExpandedUnitId,
    setHoveredRowNoteStudentId,
    setHoveredStudentId,
    setRowNotesVisible,
    skills,
    startEditingCell,
    startEditingRowNote,
    startEditingUnit,
    subjectTitle,
    summariesByStudentId,
    t,
    teachingUnits,
    toggleGroup,
    toggleStudent,
    unitNotes,
  };

  return (
    <Stack spacing={2.25} sx={{ minWidth: 0 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'auto' }, gap: 1.2, alignItems: 'start', justifyContent: 'end' }}>
        <Stack direction="row" spacing={0.7} alignItems="center" sx={{ justifySelf: { xs: 'stretch', lg: 'end' }, alignSelf: 'start', flexWrap: 'wrap' }}>
          <Select
            value={activeGroupingSetId}
            onChange={(event) => changeClassView(event.target.value)}
            size="small"
            inputProps={{ 'aria-label': t('learningModule.classPicture.focus') }}
            sx={{
              minWidth: { xs: 180, sm: 220 },
              borderRadius: '999px',
              color: groupedViewActive ? 'var(--sd-accent-text)' : 'text.secondary',
              fontSize: 13,
              fontWeight: 760,
              '& .MuiSelect-select': {
                py: 0.75,
                pl: 1.8,
                pr: 4,
              },
              '& fieldset': {
                borderColor: groupedViewActive ? 'rgba(var(--sd-primary-rgb), 0.28)' : 'rgba(var(--sd-text-rgb), 0.12)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(var(--sd-primary-rgb), 0.28) !important',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgba(var(--sd-primary-rgb), 0.38) !important',
              },
            }}
          >
            <MenuItem value="none">{t('learningModule.classPicture.classList')}</MenuItem>
            {groupDefinitions.map((definition, index) => (
              <MenuItem key={definition.id} value={definition.id}>
                {definition.custom ? (
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ width: '100%', minWidth: 180 }}>
                    <Typography sx={{ minWidth: 0, flex: '1 1 auto', color: 'inherit', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {definition.label}
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label={`Delete ${definition.label}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        deleteClassView(definition.id);
                      }}
                      sx={{ ml: 'auto', mr: -0.5, flexShrink: 0, color: 'text.secondary', '&:hover': { color: 'var(--sd-error)', bgcolor: 'rgba(var(--sd-error-rgb), 0.08)' } }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>
                ) : index + 1}
              </MenuItem>
            ))}
            <MenuItem value="add-new-view">+ Add new view</MenuItem>
          </Select>
          <Tooltip title={t('learningModule.classPicture.resetFocus')}>
            <IconButton aria-label={t('learningModule.classPicture.resetGroupsAria')} onClick={resetGroups} size="small" sx={{ color: 'text.secondary' }}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <Box aria-live="polite" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {moveAnnouncement}
      </Box>
      <ClassPictureEvidenceGridV2 {...classPictureGridProps} />
      <GroupDialog
        open={groupDialogOpen}
        mode={groupDialogMode}
        group={selectedGroup}
        students={students}
        groupDefinitions={groupDefinitions}
        initialTypeId={groupedViewActive ? activeGroupingSetId : ''}
        onClose={() => setGroupDialogOpen(false)}
        onCreateGroup={handleCreateGroup}
        onUpdateGroup={updateGroup}
        onDeleteGroup={deleteGroup}
        onAddStudent={moveStudentToGroup}
        onRemoveStudent={(groupId, studentId) => {
          const group = activeGroups.find((item) => item.id === groupId);
          moveStudentToUngrouped(group?.typeId || activeGroupingSetId, studentId);
        }}
      />
      <Dialog open={addClassViewOpen} onClose={closeAddClassViewDialog} PaperProps={{ sx: { borderRadius: '8px', width: 340 } }}>
        <DialogContent sx={{ p: 1.25 }}>
          <Typography sx={{ color: darkText, fontSize: 15.2, fontWeight: 900 }}>Add view</Typography>
          <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.1, lineHeight: 1.35 }}>
            Create a new class overview list.
          </Typography>
          <TextField
            autoFocus
            label="View title"
            value={newClassViewTitle}
            onChange={(event) => setNewClassViewTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') addClassView();
            }}
            size="small"
            fullWidth
            sx={{ mt: 1 }}
          />
          <Stack direction="row" spacing={0.65} justifyContent="flex-end" sx={{ mt: 1 }}>
            <ButtonBase
              type="button"
              onClick={closeAddClassViewDialog}
              sx={{ px: 0.85, py: 0.45, borderRadius: '8px', color: 'text.secondary', fontSize: 12, fontWeight: 850, '&:hover': { bgcolor: 'rgba(var(--sd-text-rgb), 0.035)' } }}
            >
              Cancel
            </ButtonBase>
            <ButtonBase
              type="button"
              onClick={addClassView}
              disabled={!newClassViewTitle.trim()}
              sx={{
                px: 0.9,
                py: 0.45,
                borderRadius: '8px',
                bgcolor: purple,
                color: 'var(--sd-on-primary)',
                fontSize: 12,
                fontWeight: 880,
                opacity: newClassViewTitle.trim() ? 1 : 0.45,
                '&:hover': { bgcolor: purple },
              }}
            >
              Add
            </ButtonBase>
          </Stack>
        </DialogContent>
      </Dialog>
      <AssessmentResultsEntryModal
        assessment={{ id: 'enter-results', title: t('learningModule.classPicture.assessmentFallback') }}
        storedAssessment={assessmentEditModal.storedAssessment}
        demoDate={activeLessonDate}
        moduleId={moduleId}
        students={students}
        teachingUnits={teachingUnits}
        open={assessmentEditModal.open}
        onClose={closeAssessmentEdit}
        onSaved={handleAssessmentEditSaved}
      />
    </Stack>
  );
}
