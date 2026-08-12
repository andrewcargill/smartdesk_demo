import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ErrorIcon from '@mui/icons-material/Error';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HistoryIcon from '@mui/icons-material/History';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import NoCellIcon from '@mui/icons-material/NoCell';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ReportIcon from '@mui/icons-material/Report';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
import {
  actionLabels,
  classes,
  historyByStudent,
  incidentTypeLabels,
  initialDailyStatus,
  initialIncidents,
  repeatIncidentStudents,
  schoolDate,
  staffMembers,
  students,
} from './phoneKeeperData.js';

const navItems = [
  { id: 'today', label: 'Idag', icon: <DashboardIcon /> },
  { id: 'collect', label: 'Samla in', icon: <PhoneIphoneIcon /> },
  { id: 'return', label: 'Lämna tillbaka', icon: <AssignmentReturnIcon /> },
  { id: 'incident', label: 'Incident', icon: <AddAlertIcon /> },
  { id: 'students', label: 'Elever', icon: <PersonSearchIcon /> },
  { id: 'overview', label: 'Översikt', icon: <EventNoteIcon /> },
];

const statusMeta = {
  collected: { label: 'Inlämnad', icon: <CheckCircleIcon />, color: '#1f7a4d', bg: '#e8f5ee' },
  no_phone: { label: 'Ingen telefon', icon: <NoCellIcon />, color: '#53606d', bg: '#eef1f4' },
  missing: { label: 'Saknas', icon: <ErrorIcon />, color: '#a33a27', bg: '#fdece8' },
  exception: { label: 'Undantag', icon: <ShieldIcon />, color: '#7a5b12', bg: '#fff4d7' },
  incident: { label: 'Incident', icon: <WarningIcon />, color: '#8a3f00', bg: '#fff0de' },
  returned: { label: 'Återlämnad', icon: <AssignmentReturnIcon />, color: '#3064a3', bg: '#e9f1fb' },
};

function getDisplayStatus(status) {
  if (status.returnedAt) return 'returned';
  return status.status;
}

function makeTimeline(student, status, incidents) {
  const rows = [];
  if (status.status === 'no_phone') rows.push({ time: '07:52', text: 'Ingen telefon uppgiven' });
  if (status.status === 'exception') rows.push({ time: '07:49', text: 'Undantag registrerat' });
  if (status.collectedAt) rows.push({ time: status.collectedAt, text: 'Telefon inlämnad' });
  if (status.storage) rows.push({ time: status.collectedAt, text: `Förvarad i ${status.storage.cabinet}-${status.storage.slot}` });
  incidents.forEach((incident) => rows.push({ time: incident.time, text: `${incidentTypeLabels[incident.type]} - ${incident.location}` }));
  if (status.returnedAt) rows.push({ time: status.returnedAt, text: 'Telefon återlämnad' });
  if (!rows.length) rows.push({ time: '08:10', text: `${student.name} saknar registrerad telefonstatus` });
  return rows.sort((a, b) => a.time.localeCompare(b.time));
}

function StatusChip({ value }) {
  const meta = statusMeta[value] || statusMeta.missing;
  return (
    <Chip
      icon={meta.icon}
      label={meta.label}
      size="small"
      sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 850, '& .MuiChip-icon': { color: meta.color } }}
    />
  );
}

function Metric({ label, value, icon, tone = '#17202a' }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, minHeight: 92, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography color="text.secondary" fontSize={13} fontWeight={800}>{label}</Typography>
        <Box sx={{ color: tone, display: 'inline-flex' }}>{icon}</Box>
      </Stack>
      <Typography sx={{ mt: 0.8, fontSize: 28, lineHeight: 1, fontWeight: 900, color: tone }}>{value}</Typography>
    </Paper>
  );
}

function ClassSwitcher({ activeClass, onChange, statuses }) {
  return (
    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
      {classes.map((classId) => {
        const classStudents = students.filter((student) => student.classId === classId);
        const done = classStudents.filter((student) => {
          const status = statuses.find((item) => item.studentId === student.id);
          return status && status.status !== 'missing';
        }).length;
        return (
          <Button
            key={classId}
            variant={activeClass === classId ? 'contained' : 'outlined'}
            onClick={() => onChange(classId)}
            sx={{ minWidth: 88, borderRadius: 2, flexShrink: 0 }}
          >
            {classId} {done}/{classStudents.length}
          </Button>
        );
      })}
    </Stack>
  );
}

function StudentRow({ student, status, onSelect, onMark, mode = 'collect' }) {
  const displayStatus = getDisplayStatus(status);
  const meta = statusMeta[displayStatus];
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'minmax(180px, 1fr) auto auto' },
        gap: 1,
        alignItems: 'center',
        borderLeft: `5px solid ${meta.color}`,
        borderRadius: 2,
      }}
    >
      <ButtonBase onClick={() => onSelect(student.id)} sx={{ justifyContent: 'flex-start', textAlign: 'left', borderRadius: 1 }}>
        <Box>
          <Typography fontWeight={900}>{student.name}</Typography>
          <Typography color="text.secondary" fontSize={13}>
            {status.collectedAt ? `Inlämnad ${status.collectedAt}` : 'Ingen tid registrerad'}
            {status.storage ? ` · skåp ${status.storage.cabinet}-${status.storage.slot}` : ''}
          </Typography>
        </Box>
      </ButtonBase>
      <StatusChip value={displayStatus} />
      {mode === 'return' ? (
        <Button
          variant={status.storage && !status.returnedAt ? 'contained' : 'outlined'}
          disabled={!status.storage || Boolean(status.returnedAt)}
          onClick={() => onMark(student.id, 'returned')}
          sx={{ minHeight: 44 }}
        >
          Lämna tillbaka
        </Button>
      ) : (
        <Stack direction="row" spacing={0.75} sx={{ justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
          <Tooltip title="Markera som inlämnad">
            <IconButton color="success" onClick={() => onMark(student.id, 'collected')}><CheckCircleIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Ingen telefon">
            <IconButton onClick={() => onMark(student.id, 'no_phone')}><NoCellIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Undantag">
            <IconButton color="warning" onClick={() => onMark(student.id, 'exception')}><ShieldIcon /></IconButton>
          </Tooltip>
        </Stack>
      )}
    </Paper>
  );
}

function StorageView({ activeClass, statuses, selectedSlot, onSelectSlot }) {
  const classStudents = students.filter((student) => student.classId === activeClass);
  const slots = classStudents.map((student, index) => {
    const status = statuses.find((item) => item.studentId === student.id);
    return { student, status, slot: String(index + 1).padStart(2, '0') };
  });
  const selected = selectedSlot ? slots.find((slot) => slot.student.id === selectedSlot) : slots.find((slot) => slot.status?.storage);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={950}>{activeClass} - Telefonförvaring</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(58px, 1fr))', gap: 1, mt: 1.5 }}>
            {slots.map(({ student, status, slot }) => {
              const displayStatus = getDisplayStatus(status);
              const meta = statusMeta[displayStatus];
              const stored = Boolean(status.storage && !status.returnedAt);
              return (
                <ButtonBase
                  key={student.id}
                  onClick={() => onSelectSlot(student.id)}
                  sx={{
                    minHeight: 58,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: selected?.student.id === student.id ? '#17202a' : 'divider',
                    bgcolor: stored ? meta.bg : '#f7f8f9',
                    color: stored ? meta.color : 'text.secondary',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 950,
                  }}
                >
                  <Box>{slot} {stored ? (displayStatus === 'incident' ? '!' : '✓') : '○'}</Box>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
        <Box sx={{ width: { xs: '100%', md: 280 }, p: 1 }}>
          {selected ? (
            <Stack spacing={1}>
              <Typography fontWeight={950}>{selected.student.name}</Typography>
              <StatusChip value={getDisplayStatus(selected.status)} />
              <Typography color="text.secondary" fontSize={14}>
                {selected.status.collectedAt ? `Inlämnad ${selected.status.collectedAt}` : 'Ej inlämnad'}
              </Typography>
              <Typography color="text.secondary" fontSize={14}>
                {selected.status.storage ? `Skåp ${selected.status.storage.cabinet} · plats ${selected.status.storage.slot}` : 'Ingen förvaringsplats'}
              </Typography>
              <Typography color="text.secondary" fontSize={14}>
                {selected.status.collectedBy ? `Mottagen av ${selected.status.collectedBy}` : 'Ingen mottagare'}
              </Typography>
            </Stack>
          ) : null}
        </Box>
      </Stack>
    </Paper>
  );
}

function IncidentDialog({ open, onClose, onCreate, initialStudentId }) {
  const [studentId, setStudentId] = useState(initialStudentId || students[0].id);
  const [type, setType] = useState('phone_use');
  const [location, setLocation] = useState('Lektion');
  const [action, setAction] = useState('phone_collected');
  const [note, setNote] = useState('');

  function submit() {
    onCreate({ studentId, type, location, action, note });
    setNote('');
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Telefonincident
        <IconButton onClick={onClose} aria-label="Stäng"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ pt: 0.5 }}>
          <Select value={studentId} onChange={(event) => setStudentId(event.target.value)} fullWidth>
            {students.map((student) => <MenuItem key={student.id} value={student.id}>{student.name} - {student.classId}</MenuItem>)}
          </Select>
          <Grid container spacing={1}>
            {Object.entries(incidentTypeLabels).map(([value, label]) => (
              <Grid item xs={12} sm={4} key={value}>
                <Button fullWidth variant={type === value ? 'contained' : 'outlined'} onClick={() => setType(value)} sx={{ minHeight: 54 }}>
                  {label}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Select value={location} onChange={(event) => setLocation(event.target.value)} fullWidth>
            {['Lektion', 'Rast', 'Matsal', 'Korridor', 'Annat'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </Select>
          <Select value={action} onChange={(event) => setAction(event.target.value)} fullWidth>
            {Object.entries(actionLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
          </Select>
          <TextField label="Kort notering, frivilligt" value={note} onChange={(event) => setNote(event.target.value)} multiline minRows={2} />
          <Button variant="contained" size="large" startIcon={<ReportIcon />} onClick={submit}>Registrera incident</Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default function PhoneKeeperDemo() {
  const [activeView, setActiveView] = useState('today');
  const [activeClass, setActiveClass] = useState('8A');
  const [statuses, setStatuses] = useState(initialDailyStatus);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [selectedStudentId, setSelectedStudentId] = useState('8a-002');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [incidentOpen, setIncidentOpen] = useState(false);

  const statusByStudent = useMemo(() => new Map(statuses.map((status) => [status.studentId, status])), [statuses]);
  const selectedStudent = students.find((student) => student.id === selectedStudentId) || students[0];
  const selectedStatus = statusByStudent.get(selectedStudent.id);
  const selectedIncidents = incidents.filter((incident) => incident.studentId === selectedStudent.id);

  const stats = useMemo(() => {
    const counts = statuses.reduce((total, status) => {
      const key = getDisplayStatus(status);
      total[key] = (total[key] || 0) + 1;
      return total;
    }, {});
    return {
      sampleTotal: students.length,
      complete: statuses.filter((status) => status.status !== 'missing').length,
      collected: (counts.collected || 0) + (counts.incident || 0),
      noPhone: counts.no_phone || 0,
      exception: counts.exception || 0,
      missing: counts.missing || 0,
      returned: counts.returned || 0,
      inStorage: statuses.filter((status) => status.storage && !status.returnedAt).length,
    };
  }, [statuses]);

  function updateStatus(studentId, nextStatus) {
    setStatuses((current) => current.map((status) => {
      if (status.studentId !== studentId) return status;
      if (nextStatus === 'returned') {
        return { ...status, returnedAt: '15:07', returnedBy: 'Anna Jones' };
      }
      if (nextStatus === 'collected') {
        const studentIndex = students.findIndex((student) => student.id === studentId);
        const classIndex = classes.indexOf(students[studentIndex]?.classId || '7A');
        return {
          ...status,
          status: 'collected',
          collectedAt: status.collectedAt || '08:04',
          collectedBy: status.collectedBy || 'Anna Jones',
          storage: status.storage || { cabinet: String.fromCharCode(65 + classIndex), slot: String(studentIndex + 1).padStart(2, '0') },
          returnedAt: null,
          returnedBy: null,
        };
      }
      return { ...status, status: nextStatus, collectedAt: null, collectedBy: null, storage: null, returnedAt: null, returnedBy: null };
    }));
  }

  function createIncident(payload) {
    const incident = {
      id: `incident-${Date.now()}`,
      date: '2026-08-12',
      time: '10:42',
      reportedBy: staffMembers[0],
      ...payload,
    };
    setIncidents((current) => [incident, ...current]);
    setSelectedStudentId(payload.studentId);
    setStatuses((current) => current.map((status) => (
      status.studentId === payload.studentId ? { ...status, status: 'incident' } : status
    )));
    setIncidentOpen(false);
  }

  const classStudents = students.filter((student) => student.classId === activeClass);
  const incompleteClasses = classes.map((classId) => {
    const members = students.filter((student) => student.classId === classId);
    const done = members.filter((student) => statusByStudent.get(student.id)?.status !== 'missing').length;
    return { classId, done, total: members.length };
  }).filter((item) => item.done < item.total);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f7f2', color: '#17202a' }}>
      <Box sx={{ px: { xs: 1.5, md: 3 }, py: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.9)', position: 'sticky', top: 0, zIndex: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="overline" color="text.secondary" fontWeight={900}>Skolans mobilförvaring</Typography>
            <Typography variant="h5" fontWeight={950}>PhoneKeeper</Typography>
          </Box>
          <Stack direction="row" spacing={0.75} sx={{ overflowX: 'auto' }}>
            {navItems.map((item) => (
              <Button
                key={item.id}
                startIcon={item.icon}
                variant={activeView === item.id ? 'contained' : 'text'}
                onClick={() => setActiveView(item.id)}
                sx={{ flexShrink: 0, minHeight: 42 }}
              >
                {item.label}
              </Button>
            ))}
            <Button variant="contained" color="warning" startIcon={<AddAlertIcon />} onClick={() => setIncidentOpen(true)} sx={{ flexShrink: 0 }}>
              Telefonincident
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box component="main" sx={{ px: { xs: 1.5, md: 3 }, py: 2.5, maxWidth: 1380, mx: 'auto' }}>
        {activeView === 'today' && (
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" fontWeight={850}>Mobilstatus · {schoolDate}</Typography>
                  <Typography sx={{ fontSize: { xs: 42, md: 64 }, lineHeight: 1, fontWeight: 950 }}>{stats.complete} / {stats.sampleTotal} klara</Typography>
                </Box>
                <Button variant="contained" size="large" startIcon={<PhoneIphoneIcon />} onClick={() => setActiveView('collect')} sx={{ alignSelf: { xs: 'stretch', md: 'center' }, minHeight: 56 }}>
                  Fortsätt insamling
                </Button>
              </Stack>
            </Paper>
            <Grid container spacing={1.5}>
              <Grid item xs={6} md={2.4}><Metric label="Inlämnade" value={stats.collected} icon={<CheckCircleIcon />} tone="#1f7a4d" /></Grid>
              <Grid item xs={6} md={2.4}><Metric label="Ingen telefon" value={stats.noPhone} icon={<NoCellIcon />} tone="#53606d" /></Grid>
              <Grid item xs={6} md={2.4}><Metric label="Undantag" value={stats.exception} icon={<ShieldIcon />} tone="#7a5b12" /></Grid>
              <Grid item xs={6} md={2.4}><Metric label="Saknas" value={stats.missing} icon={<ErrorIcon />} tone="#a33a27" /></Grid>
              <Grid item xs={12} md={2.4}><Metric label="I förvaring nu" value={stats.inStorage} icon={<Inventory2Icon />} tone="#3064a3" /></Grid>
            </Grid>
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={7}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography fontWeight={950} sx={{ mb: 1 }}>Klasser dar insamling inte ar klar</Typography>
                  <Grid container spacing={1}>
                    {incompleteClasses.map((item) => (
                      <Grid item xs={6} sm={4} key={item.classId}>
                        <Button fullWidth variant="outlined" onClick={() => { setActiveClass(item.classId); setActiveView('collect'); }} sx={{ minHeight: 62, justifyContent: 'space-between' }}>
                          <span>{item.classId}</span><strong>{item.done}/{item.total}</strong>
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography fontWeight={950} sx={{ mb: 1 }}>Incidenter idag</Typography>
                  <Stack spacing={1}>
                    {incidents.slice(0, 4).map((incident) => {
                      const student = students.find((item) => item.id === incident.studentId);
                      return <Alert key={incident.id} icon={<WarningIcon />} severity="warning">{incident.time} - {incidentTypeLabels[incident.type]} · {student?.name}</Alert>;
                    })}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        )}

        {activeView === 'collect' && (
          <Stack spacing={2}>
            <ClassSwitcher activeClass={activeClass} onChange={setActiveClass} statuses={statuses} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Box>
                      <Typography variant="h5" fontWeight={950}>{activeClass}</Typography>
                      <Typography color="text.secondary" fontWeight={800}>
                        {classStudents.filter((student) => statusByStudent.get(student.id)?.status !== 'missing').length} / {classStudents.length} klara
                      </Typography>
                    </Box>
                    <Button startIcon={<AddAlertIcon />} onClick={() => setIncidentOpen(true)}>Incident</Button>
                  </Stack>
                  <Stack spacing={1}>
                    {classStudents.map((student) => (
                      <StudentRow key={student.id} student={student} status={statusByStudent.get(student.id)} onSelect={setSelectedStudentId} onMark={updateStatus} />
                    ))}
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <StorageView activeClass={activeClass} statuses={statuses} selectedSlot={selectedSlot} onSelectSlot={(id) => { setSelectedSlot(id); setSelectedStudentId(id); }} />
              </Grid>
            </Grid>
          </Stack>
        )}

        {activeView === 'return' && (
          <Stack spacing={2}>
            <ClassSwitcher activeClass={activeClass} onChange={setActiveClass} statuses={statuses} />
            {stats.inStorage > 0 && <Alert severity="warning" icon={<Inventory2Icon />}>{stats.inStorage} telefoner kvar i förvaring</Alert>}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight={950}>{activeClass}</Typography>
              <Typography color="text.secondary" fontWeight={800} sx={{ mb: 1.5 }}>
                {classStudents.filter((student) => statusByStudent.get(student.id)?.storage).length} telefoner i förvaring · {classStudents.filter((student) => statusByStudent.get(student.id)?.returnedAt).length} återlämnade
              </Typography>
              <Stack spacing={1}>
                {classStudents.map((student) => (
                  <StudentRow key={student.id} student={student} status={statusByStudent.get(student.id)} onSelect={setSelectedStudentId} onMark={updateStatus} mode="return" />
                ))}
              </Stack>
            </Paper>
          </Stack>
        )}

        {activeView === 'incident' && (
          <Stack spacing={2}>
            <Button variant="contained" size="large" startIcon={<AddAlertIcon />} onClick={() => setIncidentOpen(true)} sx={{ alignSelf: 'flex-start' }}>Ny telefonincident</Button>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={950}>Dagens incidenter</Typography>
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                {incidents.map((incident) => {
                  const student = students.find((item) => item.id === incident.studentId);
                  return (
                    <Paper key={incident.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                        <Box>
                          <Typography fontWeight={950}>{incident.time} - {incidentTypeLabels[incident.type]}</Typography>
                          <Typography color="text.secondary">{student?.name} · {student?.classId} · {incident.location}</Typography>
                        </Box>
                        <Chip label={`Atgard: ${actionLabels[incident.action]}`} />
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>
          </Stack>
        )}

        {activeView === 'students' && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography fontWeight={950} sx={{ mb: 1 }}>Elever</Typography>
                <Stack spacing={0.75} sx={{ maxHeight: 620, overflowY: 'auto' }}>
                  {students.map((student) => (
                    <Button key={student.id} variant={selectedStudent.id === student.id ? 'contained' : 'text'} onClick={() => setSelectedStudentId(student.id)} sx={{ justifyContent: 'space-between' }}>
                      <span>{student.name}</span><span>{student.classId}</span>
                    </Button>
                  ))}
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Box>
                    <Typography variant="h5" fontWeight={950}>{selectedStudent.name} - {selectedStudent.classId}</Typography>
                    <Typography color="text.secondary" fontWeight={800}>Denna termin</Typography>
                  </Box>
                  <StatusChip value={getDisplayStatus(selectedStatus)} />
                </Stack>
                <Grid container spacing={1.5} sx={{ my: 1 }}>
                  <Grid item xs={6} md={3}><Metric label="Normala dagar" value="27" icon={<CheckCircleIcon />} tone="#1f7a4d" /></Grid>
                  <Grid item xs={6} md={3}><Metric label="Ej inlämnad" value={selectedStudent.id === '8a-002' ? '6' : '2'} icon={<ErrorIcon />} tone="#a33a27" /></Grid>
                  <Grid item xs={6} md={3}><Metric label="Incidenter" value={selectedStudent.id === '9b-005' ? '6' : selectedIncidents.length || 1} icon={<WarningIcon />} tone="#8a3f00" /></Grid>
                  <Grid item xs={6} md={3}><Metric label="Vägran" value={selectedStudent.id === '7b-001' ? '1' : '0'} icon={<ReportIcon />} tone="#7a5b12" /></Grid>
                </Grid>
                <Divider sx={{ my: 1.5 }} />
                <Typography fontWeight={950} sx={{ mb: 1 }}>Idag</Typography>
                <Stack spacing={0.8}>
                  {makeTimeline(selectedStudent, selectedStatus, selectedIncidents).map((event) => (
                    <Typography key={`${event.time}-${event.text}`}><strong>{event.time}</strong> - {event.text}</Typography>
                  ))}
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Typography fontWeight={950} sx={{ mb: 1 }}>Historik</Typography>
                <Stack spacing={0.8}>
                  {(historyByStudent[selectedStudent.id] || [{ date: '12 aug', label: 'Normal dag', tone: 'ok' }, { date: '11 aug', label: 'Normal dag', tone: 'ok' }, { date: '10 aug', label: 'Ingen avvikelse', tone: 'ok' }]).map((item) => (
                    <Typography key={`${item.date}-${item.label}`}>{item.tone === 'ok' ? '✓' : item.tone === 'incident' ? '⚠' : '!'} <strong>{item.date}</strong> {item.label}</Typography>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeView === 'overview' && (
          <Stack spacing={2}>
            <Grid container spacing={1.5}>
              <Grid item xs={6} md={3}><Metric label="Elever" value="306" icon={<PersonSearchIcon />} /></Grid>
              <Grid item xs={6} md={3}><Metric label="Incidenter idag" value={incidents.length} icon={<WarningIcon />} tone="#8a3f00" /></Grid>
              <Grid item xs={6} md={3}><Metric label="Telefoner i förvaring" value={stats.inStorage} icon={<Inventory2Icon />} tone="#3064a3" /></Grid>
              <Grid item xs={6} md={3}><Metric label="Ej återlämnade igår" value="0" icon={<CheckCircleIcon />} tone="#1f7a4d" /></Grid>
            </Grid>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={950}>Återkommande telefonincidenter</Typography>
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                {repeatIncidentStudents.map((item) => {
                  const student = students.find((entry) => entry.id === item.studentId);
                  return (
                    <Paper key={item.studentId} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
                        <Box>
                          <Typography fontWeight={950}>{student?.name}</Typography>
                          <Typography color="text.secondary">{student?.classId} · {item.incidents} incidenter de senaste {item.window}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button variant="outlined" startIcon={<HistoryIcon />} onClick={() => { setSelectedStudentId(item.studentId); setActiveView('students'); }}>Visa historik</Button>
                          <Button variant="contained">Registrera åtgärd</Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>
          </Stack>
        )}
      </Box>

      <IncidentDialog open={incidentOpen} onClose={() => setIncidentOpen(false)} onCreate={createIncident} initialStudentId={selectedStudentId} />
    </Box>
  );
}
