import { useEffect, useMemo, useRef, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { ConceptDemoDrawerProvider, useConceptDemoDrawers } from './ConceptDemoDrawerContext.jsx';
import { ConceptDemoLanguageProvider, useConceptDemoLanguage } from './ConceptDemoLanguageContext.jsx';
import { ConceptDemoSubjectProvider, useConceptDemoSubjects } from './ConceptDemoSubjectContext.jsx';
import { ConceptDemoTeacherProvider, useConceptDemoTeacher } from './ConceptDemoTeacherContext.jsx';
import DemoShell from './DemoShell.jsx';
import FocusedWorkspace from './components/FocusedWorkspace.jsx';
import LearningModule from './components/learningModule/LearningModule.jsx';
import MentorModule from './components/MentorModule.jsx';
import MyWeekModal from './components/MyWeekModal.jsx';
import NotebookModal from './components/NotebookModal.jsx';
import SmartDeskDrawer from './components/SmartDeskDrawer.jsx';
import SmartDeskStore from './components/SmartDeskStore.jsx';
import { buildDemoSchedule } from './data/demoScheduleBuilder.js';
import { getLearningModuleConfig } from './components/learningModule/data/subject8AConfigFactory.js';
import { maths7APlanningBlocks } from './data/maths7APlanning.js';
import { getTeachingUnitForPlanningBlock, normalizeMathsPlanningBlock } from './data/mathsCurriculum.js';
import { resolveLocalizedValue } from './i18n/conceptDemoTranslations.js';
import { getSmartDeskHomeContext } from './utils/smartDeskContextUtils.js';
import { getSubjectModules, getTeachingEvents } from './utils/annaSubjectUtils.js';
import { getCurrentWeekContext } from './utils/weekDataUtils.js';
import bg1Image from './media/bg-1.jpg';
import bg2Image from './media/bg-2.jpg';
import bg3Image from './media/bg-3.jpg';
import smartDeskImage from './media/smartdesk-image.png';
import smartDeskObservationsImage from './media/smartdesk-observations.png';
import smartDeskWorkflowImage from './media/smartdesk-workflow.png';

const purple = '#9c28af';
const palePurple = '#fbf5fd';
const darkText = '#17151a';
const homeBackgrounds = {
  none: null,
  bg1: bg1Image,
  bg2: bg2Image,
  bg3: bg3Image,
};
const maths7APlanningStorageKey = 'smartdesk_demo_subject_planning_mathematics_7a';
const legacyMaths7APlanningStorageKey = 'smartdesk_demo_maths7a_plan';
const setupCompletedStorageKey = 'smartdesk_demo_setup_complete';

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

function hasCompletedSetup() {
  if (typeof window === 'undefined') {
    return true;
  }

  try {
    return window.localStorage.getItem(setupCompletedStorageKey) === 'true';
  } catch {
    return true;
  }
}

function writeSetupCompleted() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(setupCompletedStorageKey, 'true');
  } catch {
    // The modal can still close in-memory if localStorage is unavailable.
  }
}

function resetDemoStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('smartdesk_demo_'))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // The reload still gives the in-memory demo a clean first screen.
  }
}

function getSubjectTitle(subjectId, t, fallbackTitle) {
  const translatedTitle = t(`subjects.${subjectId}`);
  return translatedTitle === `subjects.${subjectId}` ? fallbackTitle : translatedTitle;
}

function getModuleTitle(module, t) {
  if (module.type === 'subject') {
    return getSubjectTitle(module.id, t, module.title);
  }

  const translatedTitle = t(`home.modules.${module.id}.title`);
  return translatedTitle === `home.modules.${module.id}.title` ? module.title : translatedTitle;
}

function getModuleShortTitle(module, t) {
  if (module.type === 'subject') {
    const translatedShortTitle = t(`home.modules.${module.id}.shortTitle`);
    return translatedShortTitle === `home.modules.${module.id}.shortTitle`
      ? module.shortTitle || getModuleTitle(module, t)
      : translatedShortTitle;
  }

  return getModuleTitle(module, t);
}

function getModuleDetail(module, t) {
  if (module.type !== 'subject') {
    const translatedDetail = t(`home.modules.${module.id}.detail`);
    return translatedDetail === `home.modules.${module.id}.detail` ? module.detail : translatedDetail;
  }

  const classCount = module.classes.length;
  return t(classCount === 1 ? 'home.classCount_one' : 'home.classCount_other', { count: classCount });
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

function formatTeachingEvent(event, t) {
  if (!event) {
    return t('home.teachingDayReady');
  }

  return t('home.teachingEventBegins', {
    title: getSubjectTitle(event.subjectId, t, event.title),
    className: event.className,
    start: event.start,
  });
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

function getMaths7ALesson(schedule) {
  return getCurrentWeekContext(schedule).days
    .find((day) => day.id === schedule.currentContext.currentDayId)
    ?.events.find((event) => event.originalId === 'mon-maths-7a');
}

function TeacherCircle({ teacherName, onOpenWeek, t }) {
  return (
    <Paper
      component="button"
      type="button"
      aria-label={t('home.openTeacherWeek', { teacherName })}
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
          {teacherName}
        </Typography>
        <Typography sx={{ mt: 0.75, color: 'text.secondary', fontWeight: 650 }}>
          {t('home.teacherWorkspace')}
        </Typography>
      </Box>
    </Paper>
  );
}

function ModuleCircle({ module, selected, onSelect, onOpenSubjectClass, onOpenNotebook, onOpenMentor, maths7ATriggerRef, t }) {
  const showClassBubbles = module.type === 'subject' && module.classes?.length;
  const moduleTitle = getModuleTitle(module, t);
  const moduleShortTitle = getModuleShortTitle(module, t);

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
    console.log('[HomeScreen] class bubble clicked', {
      subjectId: module.id,
      className,
      opensLearningModule: className === '8A',
    });
    onSelect(module.id);

    if (className === '8A') {
      onOpenSubjectClass?.(module.id, className);
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
        data-smartdesk-hotspot={module.id === 'mathematics' ? 'mathematics-bubble' : undefined}
        data-smartdesk-subject-id={module.id === 'mathematics' ? module.id : undefined}
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
            {moduleTitle}
          </Typography>
          <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: 14.5, fontWeight: 650, lineHeight: 1.35 }}>
            {getModuleDetail(module, t)}
          </Typography>
        </Box>
      </Box>
      {showClassBubbles && module.classes.map((className, index) => (
        <Button
          key={className}
          ref={module.id === 'mathematics' && className === '8A' ? maths7ATriggerRef : undefined}
          type="button"
          className="module-class-bubble"
          aria-label={t('home.openClass', { subject: moduleShortTitle, className })}
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

function SetupDialog({ open, onClose, initialSetup = false }) {
  const { language, languages, setLanguage, t } = useConceptDemoLanguage();
  const {
    availableSubjects,
    maxSelectedSubjectCount,
    selectedSubjectIds,
    setSelectedSubjectIds,
  } = useConceptDemoSubjects();
  const { teacherName, setTeacherName } = useConceptDemoTeacher();
  const [draftLanguage, setDraftLanguage] = useState(language);
  const [draftTeacherName, setDraftTeacherName] = useState(teacherName);
  const [draftSubjectIds, setDraftSubjectIds] = useState(selectedSubjectIds);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftLanguage(language);
    setDraftTeacherName(teacherName);
    setDraftSubjectIds(selectedSubjectIds);
  }, [language, open, selectedSubjectIds, teacherName]);

  function toggleDraftSubject(subjectId) {
    setDraftSubjectIds((currentSubjectIds) => {
      if (currentSubjectIds.includes(subjectId)) {
        return currentSubjectIds.filter((currentSubjectId) => currentSubjectId !== subjectId);
      }

      if (currentSubjectIds.length >= maxSelectedSubjectCount) {
        return currentSubjectIds;
      }

      return [...currentSubjectIds, subjectId];
    });
  }

  function handleSave() {
    const cleanedTeacherName = draftTeacherName.replace(/\s+/g, ' ').trim();

    if (!cleanedTeacherName || draftSubjectIds.length !== maxSelectedSubjectCount) {
      return;
    }

    setLanguage(draftLanguage);
    setTeacherName(cleanedTeacherName);
    setSelectedSubjectIds(draftSubjectIds);
    onClose();
  }

  const saveDisabled = !draftTeacherName.trim() || draftSubjectIds.length !== maxSelectedSubjectCount;

  return (
    <Dialog
      open={open}
      onClose={initialSetup ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="concept-demo-setup-title"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          border: '1px solid rgba(23, 21, 26, 0.12)',
          boxShadow: '0 24px 70px rgba(23, 21, 26, 0.18)',
        },
      }}
    >
      <DialogTitle id="concept-demo-setup-title" sx={{ color: darkText, fontSize: 22, fontWeight: 880, pb: 1 }}>
        {t('home.setup.title')}
      </DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>
        <Stack spacing={2.25}>
          <Typography sx={{ color: 'text.secondary', fontSize: 14.5, lineHeight: 1.55 }}>
            {t('home.setup.description')}
          </Typography>

          <Box>
            <Typography sx={{ mb: 0.8, color: darkText, fontSize: 13.5, fontWeight: 820 }}>
              {t('home.setup.languageLabel')}
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={draftLanguage}
              onChange={(_, nextLanguage) => {
                if (nextLanguage) {
                  setDraftLanguage(nextLanguage);
                }
              }}
              aria-label={t('home.setup.languageLabel')}
              sx={{
                '& .MuiToggleButton-root': {
                  minWidth: 74,
                  color: darkText,
                  borderColor: 'rgba(23, 21, 26, 0.12)',
                  px: 1.4,
                  py: 0.7,
                  fontSize: 12.5,
                  fontWeight: 800,
                },
                '& .Mui-selected': {
                  color: purple,
                  bgcolor: palePurple,
                },
                '& .Mui-selected:hover': {
                  bgcolor: palePurple,
                },
              }}
            >
              {Object.values(languages).map((option) => (
                <ToggleButton key={option.code} value={option.code} aria-label={option.label}>
                  {option.shortLabel}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <TextField
            label={t('home.setup.teacherNameLabel')}
            value={draftTeacherName}
            onChange={(event) => setDraftTeacherName(event.target.value)}
            fullWidth
            size="small"
            inputProps={{ maxLength: 40 }}
          />

          <Box>
            <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="baseline" sx={{ mb: 1 }}>
              <Typography sx={{ color: darkText, fontSize: 13.5, fontWeight: 820 }}>
                {t('home.setup.subjectsLabel')}
              </Typography>
              <Typography sx={{ color: draftSubjectIds.length === maxSelectedSubjectCount ? purple : 'text.secondary', fontSize: 12.4, fontWeight: 760 }}>
                {t('home.setup.subjectCount', { count: draftSubjectIds.length, max: maxSelectedSubjectCount })}
              </Typography>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 0.8 }}>
              {availableSubjects.map((subject) => {
                const selected = draftSubjectIds.includes(subject.id);
                const disabled = !selected && draftSubjectIds.length >= maxSelectedSubjectCount;
                const subjectTitle = resolveLocalizedValue(subject.title, draftLanguage, subject.id);
                const subjectShortTitle = resolveLocalizedValue(subject.shortTitle, draftLanguage, subjectTitle);

                return (
                  <Button
                    key={subject.id}
                    type="button"
                    variant="outlined"
                    disabled={disabled}
                    aria-pressed={selected}
                    onClick={() => toggleDraftSubject(subject.id)}
                    sx={{
                      justifyContent: 'space-between',
                      minHeight: 46,
                      borderRadius: '10px',
                      textTransform: 'none',
                      borderColor: selected ? 'rgba(156, 40, 175, 0.42)' : 'rgba(23, 21, 26, 0.12)',
                      bgcolor: selected ? palePurple : '#fff',
                      color: selected ? purple : darkText,
                      px: 1.4,
                      '&:hover': {
                        bgcolor: selected ? palePurple : '#fff',
                        borderColor: 'rgba(156, 40, 175, 0.36)',
                      },
                    }}
                  >
                    <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 820 }}>
                      {subjectTitle}
                    </Box>
                    <Box component="span" sx={{ ml: 1, color: selected ? purple : 'text.secondary', fontSize: 11.5, fontWeight: 850 }}>
                      {subjectShortTitle}
                    </Box>
                  </Button>
                );
              })}
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {!initialSetup && (
          <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
            {t('common.close')}
          </Button>
        )}
        <Button variant="contained" disabled={saveDisabled} onClick={handleSave} sx={{ bgcolor: purple, '&:hover': { bgcolor: '#842195' } }}>
          {t('home.setup.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function LanguageToggle() {
  const { language, languages, setLanguage, t } = useConceptDemoLanguage();

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="flex-end"
      sx={{
        position: 'absolute',
        top: { xs: 0, sm: 2 },
        right: 0,
        zIndex: 8,
      }}
    >
      <Typography sx={{ color: 'text.secondary', fontSize: 12.5, fontWeight: 750 }}>
        {t('common.language')}
      </Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={language}
        onChange={(_, nextLanguage) => {
          if (nextLanguage) {
            setLanguage(nextLanguage);
          }
        }}
        aria-label={t('common.language')}
        sx={{
          bgcolor: '#fff',
          '& .MuiToggleButton-root': {
            width: 38,
            height: 30,
            color: darkText,
            borderColor: 'rgba(23, 21, 26, 0.12)',
            px: 0,
            py: 0,
            fontSize: 11.5,
            fontWeight: 850,
          },
          '& .Mui-selected': {
            color: purple,
            bgcolor: palePurple,
          },
          '& .Mui-selected:hover': {
            bgcolor: palePurple,
          },
        }}
      >
        {Object.values(languages).map((option) => (
          <ToggleButton
            key={option.code}
            value={option.code}
            aria-label={option.label}
          >
            {option.shortLabel}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}

function HomeScreenContent() {
  const { language, languages, setLanguage, t } = useConceptDemoLanguage();
  const { selectedSubjectIds } = useConceptDemoSubjects();
  const { teacherName } = useConceptDemoTeacher();
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const maths7ATriggerRef = useRef(null);
  const [setupOpen, setSetupOpen] = useState(() => !hasCompletedSetup());
  const [setupInitial, setSetupInitial] = useState(() => !hasCompletedSetup());
  const schedule = useMemo(() => buildDemoSchedule({ selectedSubjectIds, language, teacherName }), [language, selectedSubjectIds, teacherName]);
  const subjectModules = useMemo(() => getSubjectModules(schedule), [schedule]);
  const nextTeachingEvent = useMemo(() => getNextTeachingEvent(schedule), [schedule]);
  const maths7ALesson = useMemo(() => getMaths7ALesson(schedule), [schedule]);
  const maths7ACurrentPlanningTitle = useMemo(() => getMaths7ACurrentPlanningTitle(), [activeWorkspace]);
  const activeModuleConfig = useMemo(() => (
    activeWorkspace?.type === 'class'
      ? getLearningModuleConfig({
        subjectId: activeWorkspace.subjectId,
        classId: activeWorkspace.classId,
        schedule,
      })
      : null
  ), [activeWorkspace, schedule]);
  const smartDeskContext = useMemo(() => {
    const homeContext = getSmartDeskHomeContext(schedule);

    if (activeWorkspace?.type === 'class') {
      return {
        ...homeContext,
        screen: `${activeWorkspace.subjectId}-${activeWorkspace.classId}`,
      };
    }

    return homeContext;
  }, [activeWorkspace, schedule]);
  const subjectWorkspaceActive = activeWorkspace?.type === 'class' && Boolean(activeModuleConfig);
  const mathsWorkspaceActive = activeWorkspace?.type === 'class'
    && activeWorkspace.subjectId === 'mathematics'
    && ['7a', '7c'].includes(activeWorkspace.classId);
  const smartDeskDataStreams = useMemo(() => ({
    schedule,
    subjects: subjectModules,
    nextTeachingEvent,
    maths7A: {
      currentPlanningTitle: maths7ACurrentPlanningTitle,
      lesson: maths7ALesson,
      workspaceOpen: mathsWorkspaceActive,
    },
  }), [maths7ACurrentPlanningTitle, maths7ALesson, mathsWorkspaceActive, nextTeachingEvent, schedule, subjectModules]);
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
      ...subjectModules,
      ...fixedModules,
    ]);
  }, [subjectModules]);
  const [selectedModule, setSelectedModule] = useState(modules[0]?.id || 'mentor');
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [smartDeskInfoOpen, setSmartDeskInfoOpen] = useState(false);
  const [smartDeskHowItWorksOpen, setSmartDeskHowItWorksOpen] = useState(false);
  const [smartDeskWorkflowOpen, setSmartDeskWorkflowOpen] = useState(false);
  const [smartDeskStoreOpen, setSmartDeskStoreOpen] = useState(false);
  const [smartDeskSurface, setSmartDeskSurface] = useState('floating');
  const [homeBackground, setHomeBackground] = useState('none');
  const [homeMenuAnchor, setHomeMenuAnchor] = useState(null);
  const [homeBackgroundDialogOpen, setHomeBackgroundDialogOpen] = useState(false);
  const selectedHomeBackground = homeBackgrounds[homeBackground];
  const mentorWorkspaceActive = activeWorkspace?.type === 'mentor';
  const subjectWorkspaceOpen = subjectWorkspaceActive || mentorWorkspaceActive;
  const homeMenuOpen = Boolean(homeMenuAnchor);

  useEffect(() => {
    if (!subjectWorkspaceOpen || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [subjectWorkspaceOpen]);

  function openSubjectClass(subjectId, classNameOrId) {
    console.log('[HomeScreen] open subject class', {
      subjectId,
      classNameOrId,
      classId: String(classNameOrId || '8A').toLowerCase(),
    });
    closeToday();
    closeSmartDesk();
    closeWeek();
    setNotebookOpen(false);
    setActiveWorkspace({
      type: 'class',
      subjectId,
      classId: String(classNameOrId || '8A').toLowerCase(),
    });
  }

  function openMaths7A(event) {
    openSubjectClass(event?.subjectId || 'mathematics', '8A');
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
    setActiveWorkspace(null);
    setNotebookOpen(true);
  }

  function openMentor() {
    closeToday();
    closeSmartDesk();
    closeWeek();
    setNotebookOpen(false);
    setActiveWorkspace({ type: 'mentor' });
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

  function handleSmartDeskSurfaceChange(event) {
    const nextSurface = event.target.checked ? 'floating' : 'drawer';
    setSmartDeskSurface(nextSurface);

    if (nextSurface === 'floating') {
      closeSmartDesk();
    }
  }

  function toggleSmartDeskSurface() {
    const nextSurface = smartDeskSurface === 'floating' ? 'drawer' : 'floating';
    setSmartDeskSurface(nextSurface);

    if (nextSurface === 'floating') {
      closeSmartDesk();
    }
  }

  function openSetup() {
    setSetupInitial(false);
    setSetupOpen(true);
  }

  function closeHomeMenu() {
    setHomeMenuAnchor(null);
  }

  function runHomeMenuAction(action) {
    closeHomeMenu();
    action();
  }

  function closeSetup() {
    writeSetupCompleted();
    setSetupInitial(false);
    setSetupOpen(false);
  }

  function resetDemo() {
    resetDemoStorage();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  return (
    <DemoShell
      onOpenMaths7A={openMaths7A}
      schedule={schedule}
      smartDeskContext={smartDeskContext}
      smartDeskDataStreams={smartDeskDataStreams}
      smartDeskSurface={smartDeskSurface}
    >
      <Box
        aria-hidden={subjectWorkspaceOpen}
        {...(subjectWorkspaceOpen ? { inert: '' } : {})}
        sx={{
          transform: subjectWorkspaceOpen ? { xs: 'none', md: 'translateX(-36px)' } : 'translateX(0)',
          opacity: subjectWorkspaceOpen ? 0.84 : 1,
          transition: subjectWorkspaceOpen
            ? 'transform 920ms cubic-bezier(0.22, 1, 0.36, 1), opacity 520ms ease'
            : 'transform 420ms cubic-bezier(0.4, 0, 1, 1), opacity 240ms ease',
          pointerEvents: subjectWorkspaceOpen ? 'none' : 'auto',
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
            bgcolor: selectedHomeBackground ? 'rgba(255, 255, 255, 0.86)' : '#fff',
            backgroundImage: selectedHomeBackground
              ? `linear-gradient(rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.68)), url(${selectedHomeBackground})`
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            color: darkText,
            px: { xs: 2, sm: 3, md: 5 },
            py: { xs: 3, md: 4 },
          }}
        >
        <Box sx={{ position: 'relative', maxWidth: 1160, mx: 'auto' }}>
          <IconButton
            aria-label={t('home.moreOptions')}
            aria-controls={homeMenuOpen ? 'home-options-menu' : undefined}
            aria-haspopup="menu"
            aria-expanded={homeMenuOpen ? 'true' : undefined}
            onClick={(event) => setHomeMenuAnchor(event.currentTarget)}
            sx={{
              position: 'absolute',
              top: { xs: -10, md: -7 },
              right: { xs: -10, sm: -26, md: -54, lg: -230 },
              width: 38,
              height: 38,
              color: darkText,
              // bgcolor: 'rgba(255, 255, 255, 0.76)',
              // border: '1px solid rgba(23, 21, 26, 0.1)',
              boxShadow: '0 10px 24px rgba(23, 21, 26, 0.08)',
              '&:hover': {
                bgcolor: '#fff',
                color: purple,
                borderColor: 'rgba(156, 40, 175, 0.22)',
              },
              '&:focus-visible': { outline: `2px solid ${purple}`, outlineOffset: 2 },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            id="home-options-menu"
            anchorEl={homeMenuAnchor}
            open={homeMenuOpen}
            onClose={closeHomeMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            MenuListProps={{ 'aria-label': t('home.moreOptions') }}
            slotProps={{
              paper: {
                sx: {
                  mt: 0.6,
                  minWidth: 192,
                  borderRadius: '12px',
                  border: '1px solid rgba(23, 21, 26, 0.1)',
                  boxShadow: '0 18px 42px rgba(23, 21, 26, 0.14)',
                },
              },
            }}
          >
            <MenuItem onClick={() => runHomeMenuAction(openSetup)}>
              {t('home.setup.changeSubjects')}
            </MenuItem>
            <MenuItem onClick={() => runHomeMenuAction(() => setSmartDeskInfoOpen(true))}>
              {t('home.whatIsSmartDesk')}
            </MenuItem>
            <MenuItem onClick={() => runHomeMenuAction(() => setSmartDeskHowItWorksOpen(true))}>
              {t('home.howItWorks')}
            </MenuItem>
            <MenuItem onClick={() => runHomeMenuAction(() => setSmartDeskWorkflowOpen(true))}>
              {t('home.workflow')}
            </MenuItem>
            <MenuItem onClick={() => runHomeMenuAction(() => setSmartDeskStoreOpen(true))}>
              {t('home.openSmartDeskStore')}
            </MenuItem>
            <MenuItem onClick={() => runHomeMenuAction(() => setHomeBackgroundDialogOpen(true))}>
              {t('home.homeBackground')}
            </MenuItem>
            <MenuItem
              disableRipple
              sx={{ gap: 1.1, justifyContent: 'space-between', py: 1, cursor: 'default' }}
              onClick={(event) => event.stopPropagation()}
            >
              <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 760 }}>
                {t('common.language')}
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={language}
                onChange={(_, nextLanguage) => {
                  if (nextLanguage) {
                    setLanguage(nextLanguage);
                  }
                }}
                aria-label={t('common.language')}
                sx={{
                  '& .MuiToggleButton-root': {
                    minWidth: 38,
                    px: 0.75,
                    py: 0.25,
                    color: darkText,
                    borderColor: 'rgba(23, 21, 26, 0.12)',
                    fontSize: 11.5,
                    fontWeight: 820,
                    lineHeight: 1.2,
                  },
                  '& .Mui-selected': {
                    color: purple,
                    bgcolor: palePurple,
                  },
                  '& .Mui-selected:hover': {
                    bgcolor: palePurple,
                  },
                }}
              >
                {Object.values(languages).map((option) => (
                  <ToggleButton key={option.code} value={option.code} aria-label={option.label}>
                    {option.shortLabel}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </MenuItem>
            <MenuItem
              onClick={toggleSmartDeskSurface}
              sx={{ gap: 1.1, justifyContent: 'space-between', py: 1 }}
            >
              <Typography sx={{ color: darkText, fontSize: 14, fontWeight: 760 }}>
                SmartDesk
              </Typography>
              <Stack direction="row" spacing={0.65} alignItems="center">
                <Typography sx={{ color: smartDeskSurface === 'drawer' ? darkText : 'text.secondary', fontSize: 12.2, fontWeight: 750 }}>
                  {t('home.drawer')}
                </Typography>
                <Switch
                  size="small"
                  checked={smartDeskSurface === 'floating'}
                  onChange={handleSmartDeskSurfaceChange}
                  onClick={(event) => event.stopPropagation()}
                  inputProps={{ 'aria-label': t('home.toggleSmartDeskSurface') }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: purple,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: purple,
                    },
                  }}
                />
                <Typography sx={{ color: smartDeskSurface === 'floating' ? darkText : 'text.secondary', fontSize: 12.2, fontWeight: 750 }}>
                  {t('home.floating')}
                </Typography>
              </Stack>
            </MenuItem>
            <MenuItem onClick={() => runHomeMenuAction(resetDemo)}>
              {t('home.setup.resetDemo')}
            </MenuItem>
          </Menu>
          <Stack spacing={1.1} alignItems="center" textAlign="center" sx={{ pt: { xs: 5, sm: 2 }, mb: { xs: 4, md: 2 } }}>
            {/* <Typography variant="h1" sx={{ fontSize: { xs: 36, sm: 48, md: 58 }, lineHeight: 1.04, color: darkText }}>
              Welcome back, Anna
            </Typography> */}
            <Typography sx={{ color: 'text.secondary', fontSize: { xs: 17, sm: 19 }, fontWeight: 650 }}>
              {t('home.weekSummary')}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 15.5 }}>
              {t('home.statusLine', { eventSummary: formatTeachingEvent(nextTeachingEvent, t) })}
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
            <TeacherCircle teacherName={teacherName} onOpenWeek={openWeek} t={t} />
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
                  onOpenSubjectClass={openSubjectClass}
                  onOpenNotebook={openNotebook}
                  onOpenMentor={openMentor}
                  maths7ATriggerRef={maths7ATriggerRef}
                  t={t}
                />
              ))}
            </Box>
          </Box>

        </Box>
        </Box>
      </Box>

      <FocusedWorkspace
        open={subjectWorkspaceOpen}
        onClose={closeWorkspace}
        title={mentorWorkspaceActive ? 'Mentor' : activeModuleConfig?.title?.[language] || activeModuleConfig?.title?.en || ''}
        subtitle={mentorWorkspaceActive ? 'Follow-ups, meeting rhythm, and Prorenata handoff' : activeModuleConfig?.subtitle?.[language] || activeModuleConfig?.subtitle?.en || t('home.focusedWorkspaceSubtitle')}
        returnFocusRef={maths7ATriggerRef}
        showHeader={false}
      >
        {mentorWorkspaceActive ? (
          <MentorModule onBack={closeWorkspace} />
        ) : activeModuleConfig && (
          <LearningModule config={activeModuleConfig} onBack={closeWorkspace} />
        )}
      </FocusedWorkspace>
      <MyWeekModal open={weekOpen} onClose={closeWeek} onOpenClass={openMaths7A} schedule={schedule} />
      <NotebookModal open={notebookOpen} onClose={() => setNotebookOpen(false)} />
      <Dialog
        open={homeBackgroundDialogOpen}
        onClose={() => setHomeBackgroundDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: darkText, fontSize: 20, fontWeight: 880 }}>
          {t('home.homeBackground')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.3} sx={{ pt: 0.5 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 650 }}>
              {t('home.chooseHomeBackground')}
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={homeBackground}
              onChange={(event, nextBackground) => {
                if (nextBackground) {
                  setHomeBackground(nextBackground);
                }
              }}
              aria-label={t('home.chooseHomeBackground')}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
                gap: 0.75,
                '& .MuiToggleButtonGroup-grouped': {
                  m: '0 !important',
                  border: '1px solid rgba(23, 21, 26, 0.12) !important',
                  borderRadius: '10px !important',
                },
                '& .MuiToggleButton-root': {
                  color: darkText,
                  px: 1,
                  py: 0.85,
                  fontSize: 12,
                  fontWeight: 780,
                  textTransform: 'none',
                },
                '& .Mui-selected': {
                  color: purple,
                  bgcolor: palePurple,
                },
                '& .Mui-selected:hover': {
                  bgcolor: palePurple,
                },
              }}
            >
              <ToggleButton value="none" aria-label={t('home.noHomeBackground')}>{t('home.noBackground')}</ToggleButton>
              <ToggleButton value="bg1" aria-label={t('home.useBackground', { number: 1 })}>{t('home.backgroundShort', { number: 1 })}</ToggleButton>
              <ToggleButton value="bg2" aria-label={t('home.useBackground', { number: 2 })}>{t('home.backgroundShort', { number: 2 })}</ToggleButton>
              <ToggleButton value="bg3" aria-label={t('home.useBackground', { number: 3 })}>{t('home.backgroundShort', { number: 3 })}</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.2 }}>
          <Button
            onClick={() => setHomeBackgroundDialogOpen(false)}
            sx={{ color: purple, textTransform: 'none', fontWeight: 760 }}
          >
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
      {smartDeskStoreOpen && (
        <Box
          role="presentation"
          onClick={() => setSmartDeskStoreOpen(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1600,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(23, 21, 26, 0.34)',
            px: 2,
          }}
        >
          <Paper
            role="dialog"
            aria-modal="true"
            aria-label={t('home.openSmartDeskStore')}
            elevation={0}
            onClick={(event) => event.stopPropagation()}
            sx={{
              width: '96vw',
              height: '92vh',
              overflow: 'hidden',
              borderRadius: '18px',
              border: '1px solid rgba(23, 21, 26, 0.12)',
              boxShadow: '0 24px 70px rgba(23, 21, 26, 0.18)',
              p: 0,
              bgcolor: '#fff',
            }}
          >
            <SmartDeskStore />
          </Paper>
        </Box>
      )}
      {smartDeskInfoOpen && (
        <Box
          role="presentation"
          onClick={() => setSmartDeskInfoOpen(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1600,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(23, 21, 26, 0.34)',
            px: 2,
          }}
        >
          <Paper
            role="dialog"
            aria-modal="true"
            aria-labelledby="smartdesk-info-title"
            elevation={0}
            onClick={(event) => event.stopPropagation()}
            sx={{
              width: 'min(1180px, 100%)',
              maxHeight: 'calc(100vh - 48px)',
              overflowY: 'auto',
              borderRadius: '18px',
              border: '1px solid rgba(23, 21, 26, 0.12)',
              boxShadow: '0 24px 70px rgba(23, 21, 26, 0.18)',
              p: { xs: 2, sm: 2.5 },
              bgcolor: '#fff',
            }}
          >
            <Typography id="smartdesk-info-title" variant="h2" sx={{ color: darkText, fontSize: 24, fontWeight: 750 }}>
              {t('home.whatIsSmartDesk')}
            </Typography>
               <Typography sx={{ mt: 1.25, color: 'text.secondary', lineHeight: 1.7 }}>
              {t('home.smartDeskInfoBody')}
            </Typography>
            <Box
              component="img"
              src={smartDeskImage}
              alt={t('home.smartDeskInfoImageAlt')}
              sx={{
                display: 'block',
                width: '100%',
                mt: 2,
                borderRadius: '12px',
                border: '1px solid rgba(23, 21, 26, 0.1)',
              }}
            />
         
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2.5 }}>
              <Button variant="text" onClick={() => setSmartDeskInfoOpen(false)} sx={{ color: purple }}>
                {t('common.close')}
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}
      {smartDeskHowItWorksOpen && (
        <Box
          role="presentation"
          onClick={() => setSmartDeskHowItWorksOpen(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1600,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(23, 21, 26, 0.34)',
            px: 2,
          }}
        >
          <Paper
            role="dialog"
            aria-modal="true"
            aria-labelledby="smartdesk-how-it-works-title"
            elevation={0}
            onClick={(event) => event.stopPropagation()}
            sx={{
              width: 'min(1180px, 100%)',
              maxHeight: 'calc(100vh - 48px)',
              overflowY: 'auto',
              borderRadius: '18px',
              border: '1px solid rgba(23, 21, 26, 0.12)',
              boxShadow: '0 24px 70px rgba(23, 21, 26, 0.18)',
              p: { xs: 2, sm: 2.5 },
              bgcolor: '#fff',
            }}
          >
            <Typography id="smartdesk-how-it-works-title" variant="h2" sx={{ color: darkText, fontSize: 24, fontWeight: 750 }}>
              {t('home.howItWorks')}
            </Typography>
            <Box
              component="img"
              src={smartDeskObservationsImage}
              alt={t('home.howItWorksImageAlt')}
              sx={{
                display: 'block',
                width: '100%',
                mt: 2,
                borderRadius: '12px',
                border: '1px solid rgba(23, 21, 26, 0.1)',
              }}
            />
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2.5 }}>
              <Button variant="text" onClick={() => setSmartDeskHowItWorksOpen(false)} sx={{ color: purple }}>
                {t('common.close')}
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}
      {smartDeskWorkflowOpen && (
        <Box
          role="presentation"
          onClick={() => setSmartDeskWorkflowOpen(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1600,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(23, 21, 26, 0.34)',
            px: 2,
          }}
        >
          <Paper
            role="dialog"
            aria-modal="true"
            aria-labelledby="smartdesk-workflow-title"
            elevation={0}
            onClick={(event) => event.stopPropagation()}
            sx={{
              width: 'min(1180px, 100%)',
              maxHeight: 'calc(100vh - 48px)',
              overflowY: 'auto',
              borderRadius: '18px',
              border: '1px solid rgba(23, 21, 26, 0.12)',
              boxShadow: '0 24px 70px rgba(23, 21, 26, 0.18)',
              p: { xs: 2, sm: 2.5 },
              bgcolor: '#fff',
            }}
          >
            <Typography id="smartdesk-workflow-title" variant="h2" sx={{ color: darkText, fontSize: 24, fontWeight: 750 }}>
              {t('home.workflow')}
            </Typography>
            <Box
              component="img"
              src={smartDeskWorkflowImage}
              alt={t('home.workflowImageAlt')}
              sx={{
                display: 'block',
                width: '100%',
                mt: 2,
                borderRadius: '12px',
                border: '1px solid rgba(23, 21, 26, 0.1)',
              }}
            />
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2.5 }}>
              <Button variant="text" onClick={() => setSmartDeskWorkflowOpen(false)} sx={{ color: purple }}>
                {t('common.close')}
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}
      {smartDeskSurface === 'drawer' && (
        <SmartDeskDrawer
          open={smartDeskOpen}
          onOpen={() => openSmartDesk('text')}
          onClose={closeSmartDesk}
          initialMode={smartDeskMode}
          context={smartDeskContext}
          onAction={handleSmartDeskAction}
        />
      )}
      <SetupDialog open={setupOpen} initialSetup={setupInitial} onClose={closeSetup} />
    </DemoShell>
  );
}

export default function HomeScreen() {
  return (
    <ConceptDemoLanguageProvider>
      <ConceptDemoSubjectProvider>
        <ConceptDemoTeacherProvider>
          <ConceptDemoDrawerProvider>
            <HomeScreenContent />
          </ConceptDemoDrawerProvider>
        </ConceptDemoTeacherProvider>
      </ConceptDemoSubjectProvider>
    </ConceptDemoLanguageProvider>
  );
}
