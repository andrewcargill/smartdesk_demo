import { useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

const purple = '#9c28af';
const darkText = '#17151a';
const scaleLabels = {
  2: 'Strongly positive',
  1: 'Positive',
  0: 'Mixed',
  '-1': 'More difficult',
  '-2': 'Difficult',
};

function valueToY(value, height, padding) {
  const range = 4;
  return padding.top + ((2 - value) / range) * (height - padding.top - padding.bottom);
}

function buildPath(data, key, width, height, padding) {
  return data
    .map((point, index) => {
      const x = padding.left + (index / Math.max(data.length - 1, 1)) * (width - padding.left - padding.right);
      const y = valueToY(point[key], height, padding);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export default function ClassClimateGraph({
  data,
  engagementLabel = 'Engagement',
  climateLabel = 'Working climate',
}) {
  const [activePoint, setActivePoint] = useState(data[data.length - 1] || null);
  const width = 920;
  const height = 235;
  const padding = { top: 18, right: 24, bottom: 38, left: 124 };

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
      <Stack spacing={1.45}>
        <Box>
          <Typography variant="h2" sx={{ color: darkText, fontSize: { xs: 21, sm: 24 }, fontWeight: 880 }}>
            Class climate over time
          </Typography>
          <Typography sx={{ mt: 0.45, color: 'text.secondary', fontSize: 13.7, lineHeight: 1.45 }}>
            Higher points represent more positive engagement and a calmer working climate.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2.2} flexWrap="wrap" useFlexGap aria-hidden="true">
          <Stack direction="row" spacing={0.8} alignItems="center">
            <Box sx={{ width: 28, height: 3, bgcolor: purple, borderRadius: 999 }} />
            <Typography sx={{ color: 'text.secondary', fontSize: 13.5 }}>{engagementLabel}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.8} alignItems="center">
            <Box sx={{ width: 28, borderTop: '3px dashed rgba(23, 21, 26, 0.55)' }} />
            <Typography sx={{ color: 'text.secondary', fontSize: 13.5 }}>{climateLabel}</Typography>
          </Stack>
        </Stack>

        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 760 }}>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="climate-graph-title climate-graph-desc" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <title id="climate-graph-title">Class climate over time</title>
              <desc id="climate-graph-desc">
                {data.map((point) => `${point.dateLabel}: ${engagementLabel} ${scaleLabels[point.engagement]}, ${climateLabel} ${scaleLabels[point.behaviour]}. ${point.label}.`).join(' ')}
              </desc>
              {[-2, -1, 0, 1, 2].map((value) => {
                const y = valueToY(value, height, padding);
                return (
                  <g key={value}>
                    <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="rgba(23, 21, 26, 0.08)" />
                    <text x={padding.left - 12} y={y + 4} textAnchor="end" fill="rgba(23, 21, 26, 0.62)" fontSize="12">
                      {scaleLabels[value]}
                    </text>
                  </g>
                );
              })}
              <path d={buildPath(data, 'engagement', width, height, padding)} fill="none" stroke={purple} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d={buildPath(data, 'behaviour', width, height, padding)} fill="none" stroke="rgba(23, 21, 26, 0.58)" strokeWidth="3" strokeDasharray="7 7" strokeLinecap="round" strokeLinejoin="round" />
              {data.map((point, index) => {
                const x = padding.left + (index / Math.max(data.length - 1, 1)) * (width - padding.left - padding.right);
                const engagementY = valueToY(point.engagement, height, padding);
                const climateY = valueToY(point.behaviour, height, padding);

                return (
                  <g key={point.id}>
                    <text x={x} y={height - 18} textAnchor="middle" fill="rgba(23, 21, 26, 0.58)" fontSize="12">{point.dateLabel}</text>
                    <circle cx={x} cy={engagementY} r="6" fill="#fff" stroke={purple} strokeWidth="3" />
                    <rect x={x - 5} y={climateY - 5} width="10" height="10" rx="2" fill="#fff" stroke="rgba(23, 21, 26, 0.6)" strokeWidth="2.5" />
                    <circle
                      cx={x}
                      cy={(engagementY + climateY) / 2}
                      r="18"
                      fill="transparent"
                      tabIndex="0"
                      role="button"
                      aria-label={`${point.dateLabel}. ${engagementLabel}: ${scaleLabels[point.engagement]}. ${climateLabel}: ${scaleLabels[point.behaviour]}. ${point.label}.`}
                      onFocus={() => setActivePoint(point)}
                      onMouseEnter={() => setActivePoint(point)}
                    />
                  </g>
                );
              })}
            </svg>
          </Box>
        </Box>

        {activePoint && (
          <Box sx={{ p: 1.1, borderRadius: '14px', bgcolor: '#fbfafc', border: '1px solid rgba(23, 21, 26, 0.07)' }}>
            <Typography sx={{ color: darkText, fontWeight: 820 }}>{activePoint.dateLabel}</Typography>
            <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 13 }}>
              {engagementLabel}: {scaleLabels[activePoint.engagement]} · {climateLabel}: {scaleLabels[activePoint.behaviour]}
            </Typography>
            <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 13 }}>{activePoint.label}</Typography>
          </Box>
        )}

        <Typography sx={{ color: 'text.secondary', fontSize: 12.8, lineHeight: 1.4 }}>
          This is a broad teacher impression based on selected lesson moments.
        </Typography>
      </Stack>
    </Paper>
  );
}
