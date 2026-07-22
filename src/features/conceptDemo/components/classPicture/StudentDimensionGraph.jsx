import { useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

const purple = '#9c28af';
const darkText = '#17151a';
const yLabels = {
  2: 'Clear',
  1: 'Developing',
  0: 'Limited',
};
const markerStyles = {
  concepts: { color: purple, shape: 'circle' },
  methods: { color: 'rgba(23, 21, 26, 0.72)', shape: 'square' },
  'problem-solving': { color: 'rgba(120, 72, 142, 0.78)', shape: 'diamond' },
  reasoning: { color: 'rgba(70, 70, 76, 0.62)', shape: 'triangle' },
  communication: { color: 'rgba(156, 40, 175, 0.52)', shape: 'cross' },
};

function valueToY(value, height, padding) {
  return padding.top + ((2 - value) / 2) * (height - padding.top - padding.bottom);
}

function renderMarker(shape, x, y, color, key) {
  if (shape === 'square') {
    return <rect key={key} x={x - 6} y={y - 6} width="12" height="12" rx="2" fill="#fff" stroke={color} strokeWidth="2.8" />;
  }
  if (shape === 'diamond') {
    return <rect key={key} x={x - 6} y={y - 6} width="12" height="12" transform={`rotate(45 ${x} ${y})`} fill="#fff" stroke={color} strokeWidth="2.8" />;
  }
  if (shape === 'triangle') {
    return <path key={key} d={`M ${x} ${y - 7} L ${x + 7} ${y + 6} L ${x - 7} ${y + 6} Z`} fill="#fff" stroke={color} strokeWidth="2.6" strokeLinejoin="round" />;
  }
  if (shape === 'cross') {
    return (
      <g key={key} stroke={color} strokeWidth="3" strokeLinecap="round">
        <line x1={x - 6} x2={x + 6} y1={y - 6} y2={y + 6} />
        <line x1={x + 6} x2={x - 6} y1={y - 6} y2={y + 6} />
      </g>
    );
  }

  return <circle key={key} cx={x} cy={y} r="6" fill="#fff" stroke={color} strokeWidth="2.8" />;
}

function titleCase(value) {
  if (!value) {
    return null;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function DimensionLegend({ dimensions }) {
  return (
    <Stack direction="row" spacing={1.6} flexWrap="wrap" useFlexGap aria-hidden="true">
      {dimensions.map((dimension) => {
        const marker = markerStyles[dimension.id] || markerStyles.concepts;

        return (
          <Stack key={dimension.id} direction="row" spacing={0.75} alignItems="center">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              {renderMarker(marker.shape, 9, 9, marker.color, dimension.id)}
            </svg>
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{dimension.label}</Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

export default function StudentDimensionGraph({ students, dimensions, onSelectStudent }) {
  const [activePoint, setActivePoint] = useState(null);
  const width = 920;
  const height = 270;
  const padding = { top: 18, right: 30, bottom: 44, left: 96 };
  const dimensionOffset = dimensions.length > 1 ? 48 / (dimensions.length - 1) : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.8, sm: 2.25 },
        borderRadius: '22px',
        border: '1px solid rgba(23, 21, 26, 0.1)',
        bgcolor: '#fff',
      }}
    >
      <Stack spacing={1.55}>
        <Box>
          <Typography variant="h2" sx={{ color: darkText, fontSize: { xs: 21, sm: 24 }, fontWeight: 880 }}>
            Mathematical picture by student
          </Typography>
          <Typography sx={{ mt: 0.45, color: 'text.secondary', fontSize: 13.7, lineHeight: 1.45 }}>
            An overview of the mathematical knowledge currently represented in Anna's saved evidence.
          </Typography>
        </Box>

        <DimensionLegend dimensions={dimensions} />

        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 760 }}>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="dimension-graph-title dimension-graph-desc" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <title id="dimension-graph-title">Mathematical picture by student</title>
              <desc id="dimension-graph-desc">
                {students.map((student) => student.dimensions.map((dimension) => (
                  `${student.displayLabel} ${dimension.label}: ${dimension.indication ? `${titleCase(dimension.indication)}, ${dimension.independence || 'independence not shown'}, ${dimension.dateLabel || 'no date'}` : 'No saved information'}.`
                )).join(' ')).join(' ')}
              </desc>
              {[0, 1, 2].map((value) => {
                const y = valueToY(value, height, padding);
                return (
                  <g key={value}>
                    <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="rgba(23, 21, 26, 0.08)" />
                    <text x={padding.left - 12} y={y + 4} textAnchor="end" fill="rgba(23, 21, 26, 0.62)" fontSize="12">
                      {yLabels[value]}
                    </text>
                  </g>
                );
              })}
              {students.map((student, studentIndex) => {
                const x = padding.left + (studentIndex / Math.max(students.length - 1, 1)) * (width - padding.left - padding.right);

                return (
                  <g key={student.studentId}>
                    <line x1={x} x2={x} y1={padding.top} y2={height - padding.bottom} stroke="rgba(23, 21, 26, 0.045)" />
                    <text x={x} y={height - 18} textAnchor="middle" fill="rgba(23, 21, 26, 0.64)" fontSize="12">{student.displayLabel}</text>
                    <circle
                      cx={x}
                      cy={height - 20}
                      r="18"
                      fill="transparent"
                      tabIndex="0"
                      role="button"
                      aria-label={`Open ${student.fullName} detail`}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onSelectStudent?.(student.studentId);
                        }
                      }}
                      onClick={() => onSelectStudent?.(student.studentId)}
                    />
                    {student.dimensions.map((dimension, dimensionIndex) => {
                      if (dimension.yValue === null) {
                        return null;
                      }

                      const marker = markerStyles[dimension.id] || markerStyles.concepts;
                      const markerX = x - 24 + dimensionIndex * dimensionOffset;
                      const markerY = valueToY(dimension.yValue, height, padding);

                      return (
                        <g key={`${student.studentId}-${dimension.id}`}>
                          {renderMarker(marker.shape, markerX, markerY, marker.color, `${student.studentId}-${dimension.id}-marker`)}
                          <circle
                            cx={markerX}
                            cy={markerY}
                            r="16"
                            fill="transparent"
                            tabIndex="0"
                            role="button"
                            aria-label={`${student.fullName}. ${dimension.label}: ${titleCase(dimension.indication)}. ${dimension.evidenceLabel}. ${dimension.dateLabel}. ${titleCase(dimension.independence)}.`}
                            onFocus={() => setActivePoint({ student, dimension })}
                            onMouseEnter={() => setActivePoint({ student, dimension })}
                            onClick={() => onSelectStudent?.(student.studentId)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onSelectStudent?.(student.studentId);
                              }
                            }}
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </Box>
        </Box>

        {activePoint && (
          <Box sx={{ p: 1.1, borderRadius: '14px', bgcolor: '#fbfafc', border: '1px solid rgba(23, 21, 26, 0.07)' }}>
            <Typography sx={{ color: darkText, fontWeight: 820 }}>{activePoint.student.fullName}</Typography>
            <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 13 }}>
              {activePoint.dimension.label}: {titleCase(activePoint.dimension.indication)}
            </Typography>
            <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 13 }}>
              {activePoint.dimension.evidenceLabel} · {activePoint.dimension.dateLabel} · {titleCase(activePoint.dimension.independence)}
            </Typography>
          </Box>
        )}

        <Typography sx={{ color: 'text.secondary', fontSize: 12.8, lineHeight: 1.4 }}>
          This is not a calculated grade. It reflects only the evidence Anna chose to save.
        </Typography>
      </Stack>
    </Paper>
  );
}
