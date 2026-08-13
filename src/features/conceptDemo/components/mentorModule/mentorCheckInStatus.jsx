import AddCircleIcon from '@mui/icons-material/AddCircle';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

export const checkInStatusOptions = {
  negative: { label: 'Minus', shortLabel: '-', Icon: RemoveCircleIcon },
  neutral: { label: 'Circle', shortLabel: 'o', Icon: PanoramaFishEyeIcon },
  positive: { label: 'Plus', shortLabel: '+', Icon: AddCircleIcon },
};

export function getCheckInStatusMeta(status) {
  return checkInStatusOptions[status] || checkInStatusOptions.neutral;
}

export function CheckInStatusIcon({ status, size = 18, title = '' }) {
  const meta = getCheckInStatusMeta(status);
  const Icon = meta.Icon;

  return <Icon titleAccess={title || meta.label} sx={{ color: 'text.secondary', fontSize: size, display: 'block' }} />;
}
