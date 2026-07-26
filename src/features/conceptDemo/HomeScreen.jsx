import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ConceptDemoDrawerProvider, useConceptDemoDrawers } from './ConceptDemoDrawerContext.jsx';
import DemoShell from './DemoShell.jsx';
import FocusedWorkspace from './components/FocusedWorkspace.jsx';
import MentorModal from './components/MentorModal.jsx';
import Maths7AModule from './components/Maths7AModule.jsx';
import MyWeekModal from './components/MyWeekModal.jsx';
import NotebookModal from './components/NotebookModal.jsx';
import SmartDeskDrawer from './components/SmartDeskDrawer.jsx';
import { annaSchedule } from './data/annaSchedule.js';
import { maths7APlanningBlocks } from './data/maths7APlanning.js';
import { getTeachingUnitForPlanningBlock, normalizeMathsPlanningBlock } from './data/mathsCurriculum.js';
import { getSmartDeskHomeContext } from './utils/smartDeskContextUtils.js';
import { getSubjectModules, getTeachingEvents } from './utils/annaSubjectUtils.js';
import { getCurrentWeekContext } from './utils/weekDataUtils.js';

const purple = '#9c28af';
const palePurple = '#fbf5fd';
const darkText = '#17151a';
const maths7APlanningStorageKey = 'smartdesk_demo_subject_planning_mathematics_7a';
const legacyMaths7APlanningStorageKey = 'smartdesk_demo_maths7a_plan';

const fixedModules = [
  {
    id: 'mentor',
    title: 'Mentor',
    detail: '1 conversation',
    type: 'fixed',
  },
  {
    id: 'notebook',
    title: 'Notebook',
    detail: '3 recent notes',
    type: 'fixed',
  },
];

function getModuleDetail(module) {
  if (module.type !== 'subject') {
    return module.detail;
  }

  const classCount = module.classes.length;
  return `${classCount} ${classCount === 1 ? 'class' : 'classes'}`;
}

function readJsonStorage(key) {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getStoredPlanningBlocks() {
  const savedValue = readJsonStorage(maths7APlanningStorageKey) || readJsonStorage(legacyMaths7APlanningStorageKey);
  const savedBlocks = Array.isArray(savedValue) ? savedValue : savedValue?.blocks;
  return Array.isArray(savedBlocks) ? savedBlocks : maths7APlanningBlocks;
}

function getCurrentPlanningUnitTitle(block) {
  const teachingUnit = getTeachingUnitForPlanningBlock(block);
  if (!block && !teachingUnit) {
    return 'Mathematics 7A';
  }

  if (block?.title && block.title !== teachingUnit?.title) {
    return block.title;
  }

  return teachingUnit?.title || block?.title || 'Mathematics 7A';
}

function getMaths7ACurrentPlanningTitle() {
  const normalizedBlocks = getStoredPlanningBlocks().map(normalizeMathsPlanningBlock);
  const currentBlock = normalizedBlocks.find((block) => block.status === 'current') || normalizedBlocks[0] || null;
  return getCurrentPlanningUnitTitle(currentBlock);
}

function getClassBubbleTransform(index, total) {
  const angle = total === 1 ? -90 : -135 + (index * 270) / (total - 1);
  const radians = (angle * Math.PI) / 180;
  const radius = 96;
  const x = Math.cos(radians) * radius;
  const y = Math.sin(radians) * radius;

  return `translate(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px)) scale(1)`;
}

function getModulePosition(index, total) {
  const angle = -90 + (index * 360) / total;
  const radians = (angle * Math.PI) / 180;
  const radiusX = 36;
  const radiusY = 41;

  return {
    top: `${50 + Math.sin(radians) * radiusY}%`,
    left: `${50 + Math.cos(radians) * radiusX}%`,
    transform: 'translate(-50%, -50%)',
    line: {
      width: 150,
      angle,
      top: `${50 + Math.sin(radians) * (radiusY / 2)}%`,
      left: `${50 + Math.cos(radians) * (radiusX / 2)}%`,
    },
  };
}

function withOrbitLayout(modulesToPlace) {
  return modulesToPlace.map((module, index) => ({
    ...module,
    ...getModulePosition(index, modulesToPlace.length),
  }));
}

function formatTeachingEvent(event) {
  return event ? `${event.title} ${event.className} begins at ${event.start}` : 'Your teaching day is ready';
}

function getNextTeachingEvent(schedule) {
  const weekContext = getCurrentWeekContext(schedule);
  const dayOrder = weekContext.days.map((day) => day.id);
  const currentDayOrder = dayOrder.indexOf(schedule.currentContext.currentDayId);
  const [currentHour, currentMinute] = schedule.currentContext.currentTime.split(':').map(Number);
  const currentMinutes = currentHour * 60 + currentMinute;

  return getTeachingEvents(schedule)
    .sort((first, second) => {
      const firstDayOrder = dayOrder.indexOf(first.dayId);
      const secondDayOrder = dayOrder.indexOf(second.dayId);
      const [firstHour, firstMinute] = first.start.split(':').map(Number);
      const [secondHour, secondMinute] = second.start.split(':').map(Number);

      return firstDayOrder === secondDayOrder
        ? (firstHour * 60 + firstMinute) - (secondHour * 60 + secondMinute)
        : firstDayOrder - secondDayOrder;
    })
    .find((event) => {
      const eventDayOrder = dayOrder.indexOf(event.dayId);
      const [eventHour, eventMinute] = event.start.split(':').map(Number);
      const eventMinutes = eventHour * 60 + eventMinute;

      return eventDayOrder > currentDayOrder || (eventDayOrder === currentDayOrder && eventMinutes >= currentMinutes);
    });
}

function getMaths7ALesson() {
  return getCurrentWeekContext(annaSchedule).days
    .find((day) => day.id === annaSchedule.currentContext.currentDayId)
    ?.events.find((event) => event.originalId === 'mon-maths-7a');
}

function TeacherCircle({ onOpenWeek }) {
  return (
    <Paper
      component="button"
      type="button"
      aria-label="Open Anna's week"
      onClick={onOpenWeek}
      elevation={0}
      sx={{
        appearance: 'none',
        cursor: 'pointer',
        position: { md: 'absolute' },
        zIndex: 2,
        top: { md: '50%' },
        left: { md: '50%' },
        transform: { md: 'translate(-50%, -50%)' },
        width: { xs: 188, sm: 218, md: 250 },
        aspectRatio: '1 / 1',
        mx: 'auto',
        borderRadius: '50%',
        border: '1px solid rgba(23, 21, 26, 0.13)',
        boxShadow: '0 24px 70px rgba(23, 21, 26, 0.08)',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        p: 3,
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        '&:hover': {
          borderColor: 'rgba(156, 40, 175, 0.32)',
          boxShadow: '0 28px 76px rgba(23, 21, 26, 0.1)',
          transform: { md: 'translate(-50%, calc(-50% - 4px))' },
        },
        '&:focus-visible': {
          outline: `3px solid rgba(156, 40, 175, 0.22)`,
          outlineOffset: 5,
        },
      }}
    >
      <Box>
        <Typography variant="h3" sx={{ fontSize: { xs: 34, md: 42 }, color: darkText }}>
          Anna
        </Typography>
        <Typography sx={{ mt: 0.75, color: 'text.secondary', fontWeight: 650 }}>
          Teacher workspace
        </Typography>
      </Box>
    </Paper>
  );
}

function ModuleCircle({ module, selected, onSelect, onOpenClass, onOpenNotebook, onOpenMentor, maths7ATriggerRef }) {
  const showClassBubbles = module.type === 'subject' && module.classes?.length;

  function handleModuleClick() {
    onSelect(module.id);

    if (module.id === 'notebook') {
      onOpenNotebook?.();
    }

    if (module.id === 'mentor') {
      onOpenMentor?.();
    }
  }

  function handleClassClick(className) {
    onSelect(module.id);

    if (module.id === 'mathematics' && className === '7A') {
      onOpenClass?.();
    }
  }

  return (
    <Box
      sx={{
        position: { md: 'absolute' },
        zIndex: 2,
        top: { md: module.top },
        left: { md: module.left },
        transform: { md: module.transform },
        width: { xs: 'min(42vw, 158px)', sm: 168, md: 172 },
        aspectRatio: '1 / 1',
        overflow: 'visible',
        transition: 'transform 180ms ease',
        '&:hover': {
          transform: { md: 'translate(-50%, calc(-50% - 5px))' },
        },
        '&:hover .module-circle-surface': {
          boxShadow: '0 20px 48px rgba(23, 21, 26, 0.1)',
        },
        '&:hover .module-class-bubble, &:focus-within .module-class-bubble': {
          opacity: 1,
          transform: 'var(--class-bubble-transform)',
          pointerEvents: 'auto',
        },
      }}
    >
      <Box
        component="button"
        type="button"
        className="module-circle-surface"
        onClick={handleModuleClick}
        aria-pressed={selected}
        sx={{
          appearance: 'none',
          border: 0,
          cursor: 'pointer',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          bgcolor: module.relevant ? palePurple : '#fff',
          color: darkText,
          boxShadow: selected ? '0 18px 46px rgba(156, 40, 175, 0.13)' : '0 14px 38px rgba(23, 21, 26, 0.06)',
          borderStyle: 'solid',
          borderWidth: selected ? 2 : 1,
          borderColor: selected && module.type !== 'subject' && !['mentor', 'notebook'].includes(module.id) ? purple : 'rgba(23, 21, 26, 0.13)',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          p: 2.25,
          transition: 'box-shadow 180ms ease, border-color 180ms ease',
          '&:focus-visible': {
            outline: `3px solid rgba(156, 40, 175, 0.22)`,
            outlineOffset: 4,
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1.15 }}>
            {module.title}
          </Typography>
          <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: 14.5, fontWeight: 650, lineHeight: 1.35 }}>
            {getModuleDetail(module)}
          </Typography>
        </Box>
      </Box>
      {showClassBubbles && module.classes.map((className, index) => (
        <Button
          key={className}
          ref={module.id === 'mathematics' && className === '7A' ? maths7ATriggerRef : undefined}
          type="button"
          className="module-class-bubble"
          aria-label={`Open ${module.shortTitle || module.title} ${className}`}
          onClick={() => handleClassClick(className)}
          sx={{
            '--class-bubble-transform': getClassBubbleTransform(index, module.classes.length),
            position: 'absolute',
            top: '50%',
            left: '50%',
            zIndex: 4,
            minWidth: 0,
            width: { xs: 38, sm: 42 },
            height: { xs: 38, sm: 42 },
            borderRadius: '50%',
            p: 0,
            bgcolor: '#fff',
            color: purple,
            fontSize: 12.5,
            fontWeight: 850,
            lineHeight: 1.2,
            border: '1px solid rgba(156, 40, 175, 0.18)',
            boxShadow: '0 10px 24px rgba(23, 21, 26, 0.08)',
            opacity: 0,
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%) scale(0.78)',
            transformOrigin: 'center',
            transition: 'opacity 420ms ease, transform 920ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms ease, background-color 260ms ease, border-color 260ms ease',
            '&:hover': {
              bgcolor: palePurple,
              borderColor: 'rgba(156, 40, 175, 0.34)',
              boxShadow: '0 12px 24px rgba(156, 40, 175, 0.14)',
            },
            '&:focus-visible': {
              outline: `3px solid rgba(156, 40, 175, 0.2)`,
              outlineOffset: 3,
            },
          }}
        >
          {className}
        </Button>
      ))}
    </Box>
  );
}

function ConnectorLine({ line }) {
  const { angle, width, ...placement } = line;

  return (
    <Box
      aria-hidden="true"
      sx={{
        display: { xs: 'none', md: 'block' },
        position: 'absolute',
        zIndex: 1,
        height: 1,
        width,
        bgcolor: 'rgba(23, 21, 26, 0.11)',
        transform: `rotate(${angle}deg)`,
        transformOrigin: 'center',
        ...placement,
      }}
    />
  );
}

function InsightPanel({ subjectCount, nextTeachingEvent, onOpenWeek }) {
  return (
    <Paper
      elevation={0}
      sx={{
        mt: { xs: 5, md: 2 },
        mx: 'auto',
        maxWidth: 860,
        borderRadius: '22px',
        border: '1px solid rgba(23, 21, 26, 0.1)',
        boxShadow: '0 18px 54px rgba(23, 21, 26, 0.05)',
        p: { xs: 2.5, sm: 3.5 },
      }}
    >
      <Stack spacing={2.25}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: 22, sm: 25 }, color: darkText }}>
            SmartDesk noticed
          </Typography>
          <Typography sx={{ mt: 1, maxWidth: 700, color: 'text.secondary', fontSize: 16.5, lineHeight: 1.65 }}>
            Anna's week includes {subjectCount} teaching areas. The next teaching block is {nextTeachingEvent ? `${nextTeachingEvent.title} ${nextTeachingEvent.className} at ${nextTeachingEvent.start}` : 'ready when you are'}.
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Button variant="text" onClick={onOpenWeek} sx={{ color: purple }}>
            View weekly picture
          </Button>
          <Button variant="text" sx={{ color: purple }}>
            Ask SmartDesk
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function HomeScreenContent() {
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const maths7ATriggerRef = useRef(null);
  const subjectModules = useMemo(() => getSubjectModules(annaSchedule), []);
  const nextTeachingEvent = useMemo(() => getNextTeachingEvent(annaSchedule), []);
  const maths7ALesson = useMemo(() => getMaths7ALesson(), []);
  const maths7ACurrentPlanningTitle = useMemo(() => getMaths7ACurrentPlanningTitle(), [activeWorkspace]);
  const smartDeskContext = useMemo(() => {
    const homeContext = getSmartDeskHomeContext();

    if (activeWorkspace?.type === 'class' && activeWorkspace.classId === '7a') {
      return {
        ...homeContext,
        screen: 'maths-7a',
      };
    }

    return homeContext;
  }, [activeWorkspace]);
  const {
    weekOpen,
    openWeek,
    closeWeek,
    smartDeskOpen,
    smartDeskMode,
    openSmartDesk,
    closeSmartDesk,
    openToday,
    closeToday,
  } = useConceptDemoDrawers();
  const modules = useMemo(() => {
    if (!subjectModules.length && typeof console !== 'undefined') {
      console.warn('No teaching subjects found for the SmartDesk concept demo home screen.');
    }

    return withOrbitLayout([
      ...subjectModules.map((module) => ({
        ...module,
      })),
      ...fixedModules,
    ]);
  }, [subjectModules]);
  const [selectedModule, setSelectedModule] = useState(modules[0]?.id || 'mentor');
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);
  const mathsWorkspaceOpen = activeWorkspace?.type === 'class'
    && activeWorkspace.subjectId === 'mathematics'
    && activeWorkspace.classId === '7a';

  useEffect(() => {
    if (!mathsWorkspaceOpen || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mathsWorkspaceOpen]);

  function openMaths7A() {
    closeToday();
    closeSmartDesk();
    closeWeek();
    setNotebookOpen(false);
    setMentorOpen(false);
    setActiveWorkspace({
      type: 'class',
      subjectId: 'mathematics',
      classId: '7a',
    });
  }

  function backToWeek() {
    setActiveWorkspace(null);
    openWeek();
  }

  function closeWorkspace() {
    setActiveWorkspace(null);
  }

  function openNotebook() {
    closeToday();
    closeSmartDesk();
    closeWeek();
    setMentorOpen(false);
    setNotebookOpen(true);
  }

  function openMentor() {
    closeToday();
    closeSmartDesk();
    closeWeek();
    setNotebookOpen(false);
    setMentorOpen(true);
  }

  function handleSmartDeskAction(actionName) {
    if (actionName === 'open-maths-7a') {
      closeSmartDesk();
      openMaths7A();
      return;
    }

    if (actionName === 'open-week' || actionName === 'view-related-lessons') {
      closeSmartDesk();
      openWeek();
      return;
    }

    if (actionName === 'open-today') {
      closeSmartDesk();
      openToday();
    }
  }

  return (
    <DemoShell onOpenMaths7A={openMaths7A}>
      <Box
        aria-hidden={mathsWorkspaceOpen}
        inert={mathsWorkspaceOpen}
        sx={{
          transform: mathsWorkspaceOpen ? { xs: 'none', md: 'translateX(-36px)' } : 'translateX(0)',
          opacity: mathsWorkspaceOpen ? 0.84 : 1,
          transition: mathsWorkspaceOpen
            ? 'transform 920ms cubic-bezier(0.22, 1, 0.36, 1), opacity 520ms ease'
            : 'transform 420ms cubic-bezier(0.4, 0, 1, 1), opacity 240ms ease',
          pointerEvents: mathsWorkspaceOpen ? 'none' : 'auto',
          overflow: 'hidden',
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'opacity 120ms ease',
            transform: 'none',
          },
        }}
      >
        <Box
          component="section"
          sx={{
            minHeight: '100vh',
            width: '100%',
            overflowX: 'hidden',
            bgcolor: '#fff',
            color: darkText,
            px: { xs: 2, sm: 3, md: 5 },
            py: { xs: 3, md: 4 },
          }}
        >
        <Box sx={{ position: 'relative', maxWidth: 1160, mx: 'auto' }}>
          <Stack spacing={1.1} alignItems="center" textAlign="center" sx={{ pt: { xs: 5, sm: 2 }, mb: { xs: 4, md: 2 } }}>
            {/* <Typography variant="h1" sx={{ fontSize: { xs: 36, sm: 48, md: 58 }, lineHeight: 1.04, color: darkText }}>
              Welcome back, Anna
            </Typography> */}
            <Typography sx={{ color: 'text.secondary', fontSize: { xs: 17, sm: 19 }, fontWeight: 650 }}>
              Monday · 3 lessons · 1 follow-up
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 15.5 }}>
              V2 - Nothing pressing. {formatTeachingEvent(nextTeachingEvent)}.
            </Typography>
          </Stack>

          <Box
            sx={{
              position: 'relative',
              minHeight: { md: 620 },
              display: { xs: 'grid', md: 'block' },
              justifyItems: 'center',
              rowGap: 3,
              pt: { xs: 1, md: 0 },
            }}
          >
            {/* Desktop uses absolute positions to keep a relaxed orbit around Anna. */}
            {modules.map((module) => (
              <ConnectorLine key={`${module.id}-line`} line={module.line} />
            ))}
            <TeacherCircle onOpenWeek={openWeek} />
            <Box
              sx={{
                display: { xs: 'grid', md: 'contents' },
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))' },
                justifyItems: 'center',
                gap: { xs: 1.5, sm: 2.5 },
                width: '100%',
                maxWidth: 430,
              }}
            >
              {modules.map((module) => (
                <ModuleCircle
                  key={module.id}
                  module={module}
                  selected={selectedModule === module.id}
                  onSelect={setSelectedModule}
                  onOpenClass={openMaths7A}
                  onOpenNotebook={openNotebook}
                  onOpenMentor={openMentor}
                  maths7ATriggerRef={maths7ATriggerRef}
                />
              ))}
            </Box>
          </Box>

          <InsightPanel
            subjectCount={subjectModules.length}
            nextTeachingEvent={nextTeachingEvent}
            onOpenWeek={openWeek}
          />
        </Box>
        </Box>
      </Box>

      <FocusedWorkspace
        open={mathsWorkspaceOpen}
        onClose={closeWorkspace}
        title="Mathematics - 7A"
        subtitle={`${maths7ACurrentPlanningTitle} - Monday - ${maths7ALesson?.start || '08:40'}-${maths7ALesson?.end || '09:30'}`}
        returnFocusRef={maths7ATriggerRef}
        showHeader={false}
      >
        <Maths7AModule onBackToWeek={backToWeek} onClose={closeWorkspace} />
      </FocusedWorkspace>
      <MyWeekModal open={weekOpen} onClose={closeWeek} onOpenClass={openMaths7A} />
      <NotebookModal open={notebookOpen} onClose={() => setNotebookOpen(false)} />
      <MentorModal open={mentorOpen} onClose={() => setMentorOpen(false)} />
      <SmartDeskDrawer
        open={smartDeskOpen}
        onOpen={() => openSmartDesk('text')}
        onClose={closeSmartDesk}
        initialMode={smartDeskMode}
        context={smartDeskContext}
        onAction={handleSmartDeskAction}
      />
    </DemoShell>
  );
}

export default function HomeScreen() {
  return (
    <ConceptDemoDrawerProvider>
      <HomeScreenContent />
    </ConceptDemoDrawerProvider>
  );
}
