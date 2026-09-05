import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import { Box, Tooltip } from '@mui/material';

const purple = 'var(--sd-chart)';
const absentOrange = 'var(--sd-warning)';

function fallbackT(key, values = {}) {
  const fallbacks = {
    'learningModule.classPicture.studentAbsentAssessment': 'Student marked as absent in assessment',
    'learningModule.classPicture.scorePassMax': 'Score: {{score}} · Pass: {{pass}} · Max: {{max}}',
    'learningModule.classPicture.notPassed': 'Not passed',
  };
  const template = fallbacks[key] || key;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name) => (values[name] == null ? match : String(values[name])));
}

export function getAssessmentPassPercentage(assessment) {
  const maxScore = Number(assessment.maxScore ?? assessment.max);
  const passScore = Number(assessment.passScore ?? assessment.pass);

  return Number.isFinite(maxScore) && maxScore > 0 && Number.isFinite(passScore)
    ? Math.max(0, Math.min(100, (passScore / maxScore) * 100))
    : null;
}

export function isAssessmentNotPassed(assessment) {
  const passPercentage = getAssessmentPassPercentage(assessment);

  return !assessment.absent && (
    Boolean(assessment.warning)
    || assessment.passed === false
    || (passPercentage !== null && Number(assessment.percentage) < passPercentage)
  );
}

function formatAssessmentHoverValue(value, fallback = '-') {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Number.isInteger(numberValue) ? String(numberValue) : String(numberValue);
}

export function getAssessmentPieHoverText(assessment, t = fallbackT) {
  if (assessment.absent) {
    return t('learningModule.classPicture.studentAbsentAssessment');
  }

  const score = assessment.actualValue ?? assessment.rawResult ?? assessment.score ?? assessment.percentage;
  const passScore = assessment.passScore ?? assessment.pass;
  const maxScore = assessment.maxScore ?? assessment.max;
  const text = t('learningModule.classPicture.scorePassMax', {
    score: formatAssessmentHoverValue(score),
    pass: formatAssessmentHoverValue(passScore),
    max: formatAssessmentHoverValue(maxScore),
  });

  return isAssessmentNotPassed(assessment) ? `${t('learningModule.classPicture.notPassed')} - ${text}` : text;
}

export default function AssessmentPieChart({ assessment, size = 86, onEditAssessment, t = fallbackT }) {
  const passPercentage = getAssessmentPassPercentage(assessment);
  const passRadians = passPercentage !== null ? (passPercentage / 100) * Math.PI * 2 : null;
  const hoverText = getAssessmentPieHoverText(assessment, t);
  const notPassed = isAssessmentNotPassed(assessment);
  const canEditAssessment = typeof onEditAssessment === 'function';
  const percentage = assessment.absent || !Number.isFinite(Number(assessment.percentage))
    ? 0
    : Math.max(0, Math.min(100, Number(assessment.percentage)));
  const passMarker = passRadians !== null
    ? (() => {
      const radial = { x: Math.sin(passRadians), y: -Math.cos(passRadians) };
      const tangent = { x: Math.cos(passRadians), y: Math.sin(passRadians) };
      const tip = { x: 50 + radial.x * 38, y: 50 + radial.y * 38 };
      const base = { x: 50 + radial.x * 49, y: 50 + radial.y * 49 };
      const halfWidth = 6.1;
      const leftBase = { x: base.x + tangent.x * halfWidth, y: base.y + tangent.y * halfWidth };
      const rightBase = { x: base.x - tangent.x * halfWidth, y: base.y - tangent.y * halfWidth };

      return {
        tip,
        leftBase,
        rightBase,
        points: [`${tip.x},${tip.y}`, `${leftBase.x},${leftBase.y}`, `${rightBase.x},${rightBase.y}`].join(' '),
      };
    })()
    : null;

  return (
    <Tooltip title={hoverText} arrow>
      <Box
        role={canEditAssessment ? 'button' : undefined}
        tabIndex={canEditAssessment ? 0 : undefined}
        onClick={canEditAssessment ? () => onEditAssessment(assessment) : undefined}
        onKeyDown={canEditAssessment ? (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onEditAssessment(assessment);
          }
        } : undefined}
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          cursor: canEditAssessment ? 'pointer' : 'default',
          color: assessment.absent ? absentOrange : notPassed ? 'var(--sd-error)' : 'var(--sd-accent-text)',
          background: assessment.absent
            ? 'rgba(var(--sd-warning-rgb), 0.08)'
            : `conic-gradient(${purple} 0 ${percentage}%, rgba(var(--sd-primary-rgb), 0.12) ${percentage}% 100%)`,
          boxShadow: assessment.absent
            ? 'inset 0 0 0 1px rgba(var(--sd-warning-rgb), 0.34)'
            : notPassed
              ? 'inset 0 0 0 2px rgba(var(--sd-error-rgb), 0.38)'
              : 'inset 0 0 0 1px rgba(var(--sd-primary-rgb), 0.28)',
          transition: 'transform 140ms ease, box-shadow 140ms ease',
          '&:focus-visible': {
            outline: `2px solid ${'var(--sd-focus)'}`,
            outlineOffset: 3,
          },
          '&:hover': {
            transform: 'scale(1.04)',
            boxShadow: assessment.absent
              ? 'inset 0 0 0 1px rgba(var(--sd-warning-rgb), 0.5), 0 10px 24px rgba(var(--sd-warning-rgb), 0.12)'
              : notPassed
                ? 'inset 0 0 0 2px rgba(var(--sd-error-rgb), 0.5), 0 10px 24px rgba(var(--sd-error-rgb), 0.1)'
                : 'inset 0 0 0 1px rgba(var(--sd-primary-rgb), 0.45), 0 10px 24px rgba(var(--sd-primary-rgb), 0.13)',
          },
        }}
      >
        {passMarker && !assessment.absent && (
          <Box component="svg" aria-hidden="true" viewBox="0 0 100 100" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
            <polygon points={passMarker.points} fill="var(--sd-surface)" />
            <line x1={passMarker.tip.x} y1={passMarker.tip.y} x2={passMarker.leftBase.x} y2={passMarker.leftBase.y} stroke="rgba(var(--sd-primary-rgb), 0.28)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1={passMarker.tip.x} y1={passMarker.tip.y} x2={passMarker.rightBase.x} y2={passMarker.rightBase.y} stroke="rgba(var(--sd-primary-rgb), 0.28)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1={passMarker.leftBase.x} y1={passMarker.leftBase.y} x2={passMarker.rightBase.x} y2={passMarker.rightBase.y} stroke="var(--sd-surface)" strokeWidth="2.2" strokeLinecap="round" />
          </Box>
        )}
        {assessment.absent && <PersonOffOutlinedIcon sx={{ position: 'relative', zIndex: 2, fontSize: Math.round(size * 0.38) }} />}
        {!assessment.absent && notPassed && (
          <ErrorOutlineIcon
            sx={{
              position: 'absolute',
              right: Math.max(5, Math.round(size * 0.08)),
              bottom: Math.max(5, Math.round(size * 0.08)),
              zIndex: 2,
              fontSize: Math.round(size * 0.28),
              color: 'var(--sd-error)',
              bgcolor: 'var(--sd-surface)',
              borderRadius: '50%',
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
}
