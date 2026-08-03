import { Box } from '@mui/material';
import { useConceptDemoDrawers } from './ConceptDemoDrawerContext.jsx';
import FloatingSmartDesk from './components/FloatingSmartDesk.jsx';
import { annaSchedule } from './data/annaSchedule.js';
import TodayDrawer from './TodayDrawer.jsx';
import { getCurrentDayEvents, getCurrentScheduleDay } from './utils/todayScheduleUtils.js';

function isMaths7AEvent(event) {
  return event.type === 'lesson'
    && event.originalId === 'mon-maths-7a';
}

export default function DemoShell({
  children,
  onOpenMaths7A,
  smartDeskContext,
  smartDeskDataStreams,
  schedule = annaSchedule,
  smartDeskSurface = 'floating',
}) {
  const { todayOpen, openToday, closeToday } = useConceptDemoDrawers();
  const { currentContext } = schedule;
  const currentDay = getCurrentScheduleDay(schedule);
  const currentDayEvents = getCurrentDayEvents(schedule);

  if (!currentDay && typeof console !== 'undefined') {
    console.warn('No current day found for the SmartDesk Today drawer.');
  }

  function handleOpenEvent(event) {
    if (isMaths7AEvent(event)) {
      closeToday();
      onOpenMaths7A?.(event);
    }
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {children}

      {smartDeskSurface === 'floating' && (
        <FloatingSmartDesk context={smartDeskContext} dataStreams={smartDeskDataStreams} />
      )}

      <TodayDrawer
        open={todayOpen}
        onOpen={openToday}
        onClose={closeToday}
        currentTime={currentContext.currentTime}
        dateLabel={currentContext.dateLabel}
        events={currentDayEvents}
        onOpenEvent={handleOpenEvent}
      />
    </Box>
  );
}
