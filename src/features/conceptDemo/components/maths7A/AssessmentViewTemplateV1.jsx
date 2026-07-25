import { useMemo, useState } from 'react';
import { Box, Button, ButtonBase, ButtonGroup, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { maths7AEvidence } from '../../data/Maths7AEvidence.js';
import { maths7AStudents } from '../../data/Maths7AStudents.js';
import {
  getEvidenceTopicById,
  getTeachingUnitById,
  normalizeMathsEvidenceItem,
} from '../../data/mathsCurriculum.js';

const purple = '#9c28af';
const darkText = '#17151a';
const border = 'rgba(23, 21, 26, 0.1)';

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'recent', label: 'Recent' },
  { id: 'attention', label: 'Needs attention' },
  { id: 'drafts', label: 'Drafts' },
];

const primaryActions = [
  { id: 'new', label: 'New assessment', icon: <AddIcon fontSize="small" /> },
  { id: 'enter', label: 'Enter results', icon: <EditNoteIcon fontSize="small" /> },
  { id: 'import', label: 'Import results', icon: <FileUploadIcon fontSize="small" /> },
  { id: 'upload', label: 'Upload work', icon: <DriveFolderUploadIcon fontSize="small" /> },
];

function formatDemoDate(date) {
  if (!date) {
    return 'No date';
  }

  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

function getAssessmentTypeLabel(type) {
  return String(type || 'assessment')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getResultFormat(items) {
  const hasPercentage = items.some((item) => item.percentage !== null);
  const hasOther = items.some((item) => item.percentage === null);

  if (hasPercentage && hasOther) {
    return 'Mixed results';
  }
  if (hasPercentage) {
    return 'Percentage';
  }

  return 'Recorded result';
}

function getAssessmentState(itemCount, studentCount) {
  if (!itemCount) {
    return 'Draft';
  }
  if (itemCount < studentCount) {
    return 'Partially recorded';
  }

  return 'Results added';
}

function buildAssessmentRows() {
  const normalisedAssessments = maths7AEvidence
    .map(normalizeMathsEvidenceItem)
    .filter((item) => item?.type === 'assessment');
  const grouped = new Map();

  normalisedAssessments.forEach((item) => {
    const title = item.assessmentTitle || item.label || 'Assessment';
    const groupKey = [
      title,
      item.date,
      item.assessmentType || '',
      item.evidenceTopicId || '',
      item.teachingUnitId || '',
    ].join('::');

    if (!grouped.has(groupKey)) {
      const topic = getEvidenceTopicById(item.evidenceTopicId);
      const unit = getTeachingUnitById(item.teachingUnitId);

      grouped.set(groupKey, {
        id: groupKey,
        title,
        date: item.date,
        assessmentType: item.assessmentType || 'assessment',
        topicLabel: topic?.label || topic?.title || '',
        unitLabel: unit?.label || unit?.title || '',
        items: [],
        studentIds: new Set(),
        needsAttention: Boolean(item.aiReviewAvailable || item.importNeedsMatching || item.uploadProcessingIssue),
        isDraft: Boolean(item.isDraft),
      });
    }

    const row = grouped.get(groupKey);
    row.items.push(item);
    row.studentIds.add(item.studentId);
    row.needsAttention = row.needsAttention || Boolean(item.aiReviewAvailable || item.importNeedsMatching || item.uploadProcessingIssue);
    row.isDraft = row.isDraft || Boolean(item.isDraft);
  });

  return [...grouped.values()]
    .map((row) => {
      const savedResultCount = row.studentIds.size;
      const state = row.isDraft
        ? 'Draft'
        : row.needsAttention
          ? 'Needs attention'
          : getAssessmentState(savedResultCount, maths7AStudents.length);

      return {
        ...row,
        savedResultCount,
        resultFormat: getResultFormat(row.items),
        state,
        searchableText: [
          row.title,
          row.date,
          row.assessmentType,
          row.topicLabel,
          row.unitLabel,
          state,
        ].filter(Boolean).join(' ').toLowerCase(),
      };
    })
    .sort((first, second) => second.date.localeCompare(first.date) || first.title.localeCompare(second.title));
}

function isRecentAssessment(row, rows) {
  const latestDate = rows[0]?.date;
  if (!latestDate || !row.date) {
    return false;
  }

  const latestTime = new Date(`${latestDate}T12:00:00`).getTime();
  const rowTime = new Date(`${row.date}T12:00:00`).getTime();
  const daysDifference = (latestTime - rowTime) / 86400000;

  return daysDifference <= 45;
}

function OverviewItem({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ color: 'rgba(23, 21, 26, 0.52)', fontSize: 11.5, fontWeight: 760, lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography sx={{ mt: 0.25, color: darkText, fontSize: 13.2, fontWeight: 860, lineHeight: 1.25 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function AssessmentViewTemplateV1() {
  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const assessmentRows = useMemo(buildAssessmentRows, []);
  const attentionRows = assessmentRows.filter((row) => row.needsAttention);
  const latestAssessment = assessmentRows[0] || null;
  const termAssessmentCount = assessmentRows.filter((row) => row.date >= '2026-04-01').length;
  const normalisedSearch = searchValue.trim().toLowerCase();
  const filteredRows = assessmentRows.filter((row) => {
    if (activeFilter === 'recent' && !isRecentAssessment(row, assessmentRows)) {
      return false;
    }
    if (activeFilter === 'attention' && !row.needsAttention) {
      return false;
    }
    if (activeFilter === 'drafts' && !row.isDraft) {
      return false;
    }

    return !normalisedSearch || row.searchableText.includes(normalisedSearch);
  });

  return (
    <Stack spacing={1.35}>
      {!!attentionRows.length && (
        <Paper elevation={0} sx={{ p: 1.15, borderRadius: '12px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
          <Typography sx={{ color: darkText, fontSize: 13.2, fontWeight: 860 }}>Needs Anna's attention</Typography>
          <Stack spacing={0.55} sx={{ mt: 0.7 }}>
            {attentionRows.map((row) => (
              <Typography key={row.id} sx={{ color: 'text.secondary', fontSize: 12.6, lineHeight: 1.4 }}>
                {row.title} · {row.state}
              </Typography>
            ))}
          </Stack>
        </Paper>
      )}

      <Paper elevation={0} sx={{ p: 1.15, borderRadius: '12px', border: `1px solid ${border}`, bgcolor: '#fff' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
            gap: { xs: 1.1, md: 1.4 },
          }}
        >
          <OverviewItem label="Total assessments" value={assessmentRows.length} />
          <OverviewItem label="This term" value={termAssessmentCount} />
          <OverviewItem label="Needs attention" value={attentionRows.length || 'None'} />
          <OverviewItem label="Latest" value={latestAssessment ? formatDemoDate(latestAssessment.date) : 'None'} />
        </Box>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, minmax(0, 1fr))' },
          gap: 0.8,
        }}
      >
        {primaryActions.map((action) => (
          <Button
            key={action.id}
            type="button"
            variant="outlined"
            startIcon={action.icon}
            sx={{
              justifyContent: 'flex-start',
              minHeight: 40,
              px: 1.25,
              borderColor: border,
              color: darkText,
              borderRadius: '10px',
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 780,
              bgcolor: '#fff',
              '&:hover': {
                bgcolor: 'rgba(156, 40, 175, 0.035)',
                borderColor: 'rgba(156, 40, 175, 0.28)',
              },
            }}
          >
            {action.label}
          </Button>
        ))}
      </Box>

      <Paper elevation={0} sx={{ borderRadius: '14px', border: `1px solid ${border}`, bgcolor: '#fff', overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 1.1, sm: 1.25 }, borderBottom: `1px solid ${border}` }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={0.9} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search assessments"
              size="small"
              aria-label="Search assessments"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 0.8, color: 'rgba(23, 21, 26, 0.34)', fontSize: 18 }} />,
              }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: '#fff',
                  fontSize: 13,
                  '& fieldset': { borderColor: 'rgba(23, 21, 26, 0.12)' },
                  '&:hover fieldset': { borderColor: 'rgba(156, 40, 175, 0.28)' },
                  '&.Mui-focused fieldset': { borderColor: 'rgba(156, 40, 175, 0.38)' },
                },
              }}
            />
            <ButtonGroup
              variant="outlined"
              size="small"
              aria-label="Assessment library filters"
              sx={{
                '& .MuiButtonGroup-grouped': {
                  borderColor: 'rgba(23, 21, 26, 0.12)',
                  color: darkText,
                  fontSize: 12.2,
                  fontWeight: 760,
                  textTransform: 'none',
                  minWidth: { xs: 'auto', sm: 72 },
                },
              }}
            >
              {filterOptions.map((filter) => {
                const isSelected = activeFilter === filter.id;

                return (
                  <Button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    aria-pressed={isSelected}
                    sx={{
                      bgcolor: isSelected ? 'rgba(156, 40, 175, 0.06)' : '#fff',
                      color: isSelected ? `${purple} !important` : 'text.secondary',
                      borderColor: isSelected ? 'rgba(156, 40, 175, 0.34) !important' : undefined,
                      '&:hover': { bgcolor: isSelected ? 'rgba(156, 40, 175, 0.08)' : '#fff' },
                    }}
                  >
                    {filter.label}
                  </Button>
                );
              })}
            </ButtonGroup>
            <Button
              type="button"
              variant="outlined"
              startIcon={<TuneIcon fontSize="small" />}
              sx={{
                flexShrink: 0,
                borderColor: 'rgba(23, 21, 26, 0.12)',
                color: darkText,
                borderRadius: '10px',
                textTransform: 'none',
                fontSize: 12.6,
                fontWeight: 760,
                '&:hover': { bgcolor: '#fff', borderColor: 'rgba(156, 40, 175, 0.28)' },
              }}
            >
              Filters
            </Button>
          </Stack>
        </Box>

        <Stack spacing={0} component="section" aria-label="Assessment library">
          {filteredRows.map((row) => (
            <ButtonBase
              key={row.id}
              sx={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                borderBottom: '1px solid rgba(23, 21, 26, 0.07)',
                '&:last-of-type': { borderBottom: 0 },
                '&:hover': { bgcolor: 'rgba(156, 40, 175, 0.025)' },
                '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: -2 },
              }}
            >
              <Box
                sx={{
                  p: { xs: 1.15, sm: 1.35 },
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'minmax(220px, 1.35fr) minmax(150px, 0.9fr) minmax(135px, 0.75fr) auto' },
                  gap: { xs: 0.65, md: 1.4 },
                  alignItems: 'center',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: darkText, fontSize: 13.7, fontWeight: 850, lineHeight: 1.25 }}>
                    {row.title}
                  </Typography>
                  <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 12.2, lineHeight: 1.35 }}>
                    {formatDemoDate(row.date)} · {getAssessmentTypeLabel(row.assessmentType)}
                  </Typography>
                </Box>

                <Typography sx={{ color: 'text.secondary', fontSize: 12.3, lineHeight: 1.35 }}>
                  {row.unitLabel || row.topicLabel || 'No unit link'}
                </Typography>

                <Typography sx={{ color: 'text.secondary', fontSize: 12.3, lineHeight: 1.35 }}>
                  {row.resultFormat} · {row.savedResultCount}/{maths7AStudents.length} results
                </Typography>

                <Stack direction="row" spacing={0.75} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  <Chip
                    label={row.state}
                    size="small"
                    sx={{
                      height: 24,
                      borderRadius: '999px',
                      color: row.needsAttention ? purple : 'text.secondary',
                      bgcolor: row.needsAttention ? 'rgba(156, 40, 175, 0.06)' : 'rgba(23, 21, 26, 0.045)',
                      fontSize: 11.4,
                      fontWeight: 760,
                    }}
                  />
                  <Typography sx={{ color: purple, fontSize: 12.3, fontWeight: 820 }}>Open</Typography>
                </Stack>
              </Box>
            </ButtonBase>
          ))}
          {!filteredRows.length && (
            <Box sx={{ p: 2 }}>
              <Typography sx={{ color: 'text.secondary', fontSize: 13.2 }}>
                No assessments match this view.
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
