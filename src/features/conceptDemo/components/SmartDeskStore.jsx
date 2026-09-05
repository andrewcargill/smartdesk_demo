import { Box } from '@mui/material';
import smartDeskStoreImage from '../media/smartdesk-store-image.png';

export default function SmartDeskStore() {
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <Box
        component="img"
        src={smartDeskStoreImage}
        alt="SmartDeskStore"
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--sd-text-muted)',
          fontSize: { xs: 48, sm: 86, md: 118 },
          fontWeight: 900,
          lineHeight: 1,
          textTransform: 'uppercase',
          transform: 'rotate(-24deg)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        placeholder image
      </Box>
    </Box>
  );
}
