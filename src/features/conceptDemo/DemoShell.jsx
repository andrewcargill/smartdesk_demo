import { Box } from '@mui/material';
import { useConceptDemoDrawers } from './ConceptDemoDrawerContext.jsx';
import { annaSchedule } from './data/annaSchedule.js';
import TodayDrawer from './TodayDrawer.jsx';
import { getCurrentDayEvents, getCurrentScheduleDay } from './utils/todayScheduleUtils.js';

function isMaths7AEvent(event) {
  return event.type === 'lesson'
    && event.className === '7A'
    && event.subject === 'Mathematics';
}

export default function DemoShell({ children, onOpenMaths7A }) {
  const { todayOpen, openToday, closeToday } = useConceptDemoDrawers();
  const { currentContext } = annaSchedule;
  const currentDay = getCurrentScheduleDay(annaSchedule);
  const currentDayEvents = getCurrentDayEvents(annaSchedule);

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
