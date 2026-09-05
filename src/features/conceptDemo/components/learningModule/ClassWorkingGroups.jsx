import { useEffect, useMemo, useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Tooltip from '@mui/material/Tooltip';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  getActiveGroups,
  getGroupStudentCount,
  getStudentsForGroup,
  getUngroupedStudents,
} from '../../utils/classGroupUtils.js';

const darkText = 'var(--sd-text)';
const purple = 'var(--sd-primary)';
const palePurple = 'var(--sd-primary-soft)';

function getStudentCountLabel(count) {
  return `${count} ${count === 1 ? 'student' : 'students'}`;
}

function sortStudentsByName(students) {
  return [...(students || [])].sort((first, second) => first.displayName.localeCompare(second.displayName));
}

function getGroupSections(groups, groupDefinitions) {
  const sections = groupDefinitions
    .map((definition) => ({
      definition,
      groups: groups.filter((group) => group.typeId === definition.id),
    }))
    .filter((section) => section.groups.length);

  const knownTypeIds = new Set(groupDefinitions.map((definition) => definition.id));
  const uncategorisedGroups = groups.filter((group) => !knownTypeIds.has(group.typeId));

  if (uncategorisedGroups.length) {
    sections.push({
      definition: {
        id: 'working-group',
        label: 'Focus',
        description: '',
      },
      groups: uncategorisedGroups,
    });
  }

  return sections;
}

function StudentNameChip({ student, onSelectStudent }) {
  return (
    <Chip
      label={student.displayName}
      clickable={Boolean(onSelectStudent)}
      onClick={onSelectStudent ? () => onSelectStudent(student.id) : undefined}
      size="small"
      aria-label={onSelectStudent ? `Open ${student.displayName}'s profile` : undefined}
      sx={{
        bgcolor: 'var(--sd-surface)',
        border: '1px solid rgba(var(--sd-text-rgb), 0.1)',
        color: darkText,
        cursor: onSelectStudent ? 'pointer' : 'default',
        fontWeight: 720,
        maxWidth: '100%',
        '& .MuiChip-label': {
          px: 1.1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        '&:hover': onSelectStudent ? {
          bgcolor: 'var(--sd-surface-muted)',
          borderColor: 'rgba(var(--sd-text-rgb), 0.18)',
        } : undefined,
        '&:focus-visible': {
          outline: '2px solid rgba(var(--sd-primary-rgb), 0.38)',
          outlineOffset: 2,
        },
      }}
    />
  );
}

export function GroupDialog({
  open,
  mode,
  group,
  students,
  groupDefinitions,
  initialTypeId,
  onClose,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAddStudent,
  onRemoveStudent,
}) {
  const titleRef = useRef(null);
  const [label, setLabel] = useState('');
  const [typeId, setTypeId] = useState(initialTypeId || groupDefinitions[0]?.id || '');
  const [description, setDescription] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNameError, setShowNameError] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setLabel(group?.label || '');
    setTypeId(group?.typeId || initialTypeId || groupDefinitions[0]?.id || '');
    setDescription(group?.description || '');
    setSelectedStudentIds([...(group?.studentIds || [])]);
    setStudentSearch('');
    setMoreOpen(false);
    setShowDeleteConfirm(false);
    setShowNameError(false);
    window.requestAnimationFrame(() => titleRef.current?.focus?.());
  }, [group, groupDefinitions, initialTypeId, open]);

  const sortedStudents = useMemo(() => sortStudentsByName(students), [students]);
  const visibleStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) {
      return sortedStudents;
    }

    return sortedStudents.filter((student) => student.displayName.toLowerCase().includes(query));
  }, [sortedStudents, studentSearch]);

  function toggleStudent(studentId) {
    setSelectedStudentIds((currentIds) => (
      currentIds.includes(studentId)
        ? currentIds.filter((id) => id !== studentId)
        : [...currentIds, studentId]
    ));
  }

  function saveGroup() {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      setShowNameError(true);
      return;
    }

    if (mode === 'edit' && group) {
      const previousStudentIds = new Set(group.studentIds || []);
      const nextStudentIds = new Set(selectedStudentIds);

      onUpdateGroup(group.id, {
        label: trimmedLabel,
        typeId,
        description,
      });

      selectedStudentIds
        .filter((studentId) => !previousStudentIds.has(studentId))
        .forEach((studentId) => onAddStudent(group.id, studentId));

      (group.studentIds || [])
        .filter((studentId) => !nextStudentIds.has(studentId))
        .forEach((studentId) => onRemoveStudent(group.id, studentId));
    } else {
      onCreateGroup({
        label: trimmedLabel,
        typeId,
        description,
        studentIds: selectedStudentIds,
      });
    }

    onClose();
  }

  function deleteGroup() {
    if (!group) {
      return;
    }

    onDeleteGroup(group.id);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: { xs: 0, sm: '24px' } } }}
    >
      <DialogTitle ref={titleRef} tabIndex={-1} sx={{ outline: 'none', pr: 3 }}>
        {mode === 'edit' ? 'Edit focus' : 'Create focus'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <TextField
            autoFocus
            label="Focus name"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value);
              setShowNameError(false);
            }}
            error={showNameError}
            helperText={showNameError ? 'Focus name is required.' : ' '}
            fullWidth
          />
          <Button
            aria-expanded={moreOpen}
            aria-controls="focus-more-options"
            onClick={() => setMoreOpen((current) => !current)}
            endIcon={<ExpandMoreIcon sx={{ transform: moreOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 160ms ease' }} />}
            sx={{ alignSelf: 'flex-start', color: darkText, px: 0.5, textTransform: 'none', fontWeight: 820 }}
          >
            More options
          </Button>
          <Collapse in={moreOpen}>
            <Stack id="focus-more-options" spacing={2} sx={{ pt: 0.3 }}>
              <FormControl fullWidth>
                <InputLabel id="working-group-type-label">Focus type</InputLabel>
                <Select
                  labelId="working-group-type-label"
                  label="Focus type"
                  value={typeId}
                  onChange={(event) => setTypeId(event.target.value)}
                >
                  {groupDefinitions.map((definition) => (
                    <MenuItem key={definition.id} value={definition.id}>{definition.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Optional description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                multiline
                minRows={2}
                fullWidth
              />

              <Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
                  <Typography sx={{ color: darkText, fontWeight: 850 }}>Student selection</Typography>
                  <Chip
                    label={`${selectedStudentIds.length} selected`}
                    size="small"
                    sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, bgcolor: palePurple, color: 'var(--sd-accent-text)', fontWeight: 760 }}
                  />
                </Stack>
                <TextField
                  label="Search students"
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  size="small"
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <Paper
                  elevation={0}
                  sx={{
                    mt: 1,
                    maxHeight: 280,
                    overflowY: 'auto',
                    border: '1px solid rgba(var(--sd-text-rgb), 0.1)',
                    borderRadius: '16px',
                    p: 0.5,
                  }}
                >
                  {visibleStudents.map((student) => (
                    <FormControlLabel
                      key={student.id}
                      control={(
                        <Checkbox
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => toggleStudent(student.id)}
                          inputProps={{ 'aria-label': student.displayName }}
                        />
                      )}
                      label={student.displayName}
                      sx={{
                        display: 'flex',
                        mx: 0,
                        px: 0.5,
                        borderRadius: '10px',
                        '&:hover': { bgcolor: 'var(--sd-surface-muted)' },
                      }}
                    />
                  ))}
                  {!visibleStudents.length && (
                    <Typography sx={{ p: 1.5, color: 'text.secondary' }}>No students match that search.</Typography>
                  )}
                </Paper>
              </Box>

              {mode === 'edit' && (
                <>
                  <Divider />
                  {!showDeleteConfirm ? (
                    <Button
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => setShowDeleteConfirm(true)}
                      sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
                    >
                      Delete focus
                    </Button>
                  ) : (
                    <Paper
                      elevation={0}
                      sx={{ p: 1.4, borderRadius: '15px', border: '1px solid rgba(var(--sd-text-rgb), 0.12)', bgcolor: 'var(--sd-surface)' }}
                    >
                      <Typography sx={{ color: darkText, fontWeight: 850 }}>Delete this focus?</Typography>
                      <Typography sx={{ mt: 0.35, color: 'text.secondary', lineHeight: 1.45 }}>
                        This removes the focus only. It does not remove students or saved evidence.
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                        <Button variant="contained" color="inherit" onClick={deleteGroup}>Delete focus</Button>
                        <Button onClick={() => setShowDeleteConfirm(false)} sx={{ color: 'text.secondary' }}>Keep focus</Button>
                      </Stack>
                    </Paper>
                  )}
                </>
              )}
            </Stack>
          </Collapse>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
        <Button variant="contained" onClick={saveGroup} sx={{ bgcolor: purple, '&:hover': { bgcolor: 'var(--sd-primary-hover)' } }}>
          {mode === 'edit' ? 'Save focus' : 'Create focus'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ClassWorkingGroups({
  groups,
  students,
  groupDefinitions,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAddStudent,
  onRemoveStudent,
  onReset,
  onSelectStudent,
}) {
  const [dialogMode, setDialogMode] = useState('create');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const activeGroups = useMemo(() => getActiveGroups(groups), [groups]);
  const groupSections = useMemo(() => getGroupSections(activeGroups, groupDefinitions), [activeGroups, groupDefinitions]);
  const ungroupedStudents = useMemo(() => getUngroupedStudents(students, activeGroups), [activeGroups, students]);

  function openCreateDialog() {
    setDialogMode('create');
    setSelectedGroup(null);
    setDialogOpen(true);
  }

  function openEditDialog(group) {
    setDialogMode('edit');
    setSelectedGroup(group);
    setDialogOpen(true);
  }

  return (
    <Paper
      elevation={0}
      aria-labelledby="current-class-groups-title"
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: '22px',
        border: '1px solid rgba(var(--sd-text-rgb), 0.1)',
        bgcolor: 'var(--sd-surface)',
      }}
    >
      <Stack spacing={2.1}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ xs: 'stretch', sm: 'flex-start' }} justifyContent="space-between">
          <Box>
            <Typography id="current-class-groups-title" component="h2" sx={{ color: darkText, fontSize: 22, fontWeight: 880 }}>
              Current class focus
            </Typography>
            <Typography sx={{ mt: 0.45, color: 'text.secondary', lineHeight: 1.5 }}>
              A working view created by Anna for this class.
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.8} alignItems="center" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={openCreateDialog}
              size="small"
              sx={{ color: 'var(--sd-accent-text)', borderColor: 'rgba(var(--sd-primary-rgb), 0.24)', fontWeight: 760 }}
            >
              Create focus
            </Button>
            <Tooltip title="Reset focus">
              <IconButton aria-label="Reset focus to the seeded Maths 7A view" onClick={onReset} size="small" sx={{ color: 'text.secondary' }}>
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack spacing={2.5}>
          {groupSections.map((section) => (
            <Box key={section.definition.id} component="section" aria-labelledby={`working-group-section-${section.definition.id}`}>
              <Stack spacing={0.45} sx={{ mb: 1.1 }}>
                <Typography id={`working-group-section-${section.definition.id}`} component="h3" sx={{ color: darkText, fontSize: 17, fontWeight: 860 }}>
                  {section.definition.label}
                </Typography>
                {!!section.definition.description && (
                  <Typography sx={{ color: 'text.secondary', fontSize: 13.2, lineHeight: 1.45 }}>
                    {section.definition.description}
                  </Typography>
                )}
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(auto-fit, minmax(260px, 1fr))' },
                  gap: 1.35,
                  alignItems: 'stretch',
                }}
              >
                {section.groups.map((group) => {
                  const groupStudents = getStudentsForGroup(group, students);

                  return (
                    <Paper
                      key={group.id}
                      elevation={0}
                      component="article"
                      sx={{
                        p: 1.55,
                        minHeight: 184,
                        borderRadius: '16px',
                        border: '1px solid rgba(var(--sd-text-rgb), 0.1)',
                        bgcolor: 'var(--sd-surface)',
                      }}
                    >
                      <Stack spacing={1.05} sx={{ height: '100%' }}>
                        <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
                          <Typography component="h4" sx={{ color: darkText, fontSize: 17.5, fontWeight: 880, lineHeight: 1.25, minWidth: 0 }}>
                            {group.label}
                          </Typography>
                          <IconButton
                            aria-label={`Edit ${group.label} focus`}
                            size="small"
                            onClick={() => openEditDialog(group)}
                            sx={{ color: 'text.secondary', mt: -0.55, mr: -0.55 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Stack>

                        <Stack direction="row" spacing={0.65} flexWrap="wrap" useFlexGap>
                          {groupStudents.map((student) => (
                            <StudentNameChip key={student.id} student={student} onSelectStudent={onSelectStudent} />
                          ))}
                          {!groupStudents.length && (
                            <Chip label="No students selected" size="small" sx={{ bgcolor: 'var(--sd-surface)', color: 'text.secondary' }} />
                          )}
                        </Stack>

                        {!!group.description && (
                          <Typography sx={{ color: 'text.secondary', lineHeight: 1.48, fontSize: 13.5 }}>
                            {group.description}
                          </Typography>
                        )}

                        <Typography sx={{ color: 'text.secondary', fontSize: 12.6, fontWeight: 700, mt: 'auto' }}>
                          {getStudentCountLabel(getGroupStudentCount(group))}
                        </Typography>
                      </Stack>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          ))}

          {!!ungroupedStudents.length && (
            <Box component="section" aria-labelledby="not-currently-grouped-title">
              <Paper
                elevation={0}
                sx={{
                  p: 1.55,
                  borderRadius: '16px',
                  border: '1px solid rgba(var(--sd-text-rgb), 0.09)',
                  bgcolor: 'var(--sd-surface-muted)',
                }}
              >
                <Stack spacing={1}>
                  <Box>
                    <Typography id="not-currently-grouped-title" component="h3" sx={{ color: darkText, fontSize: 17, fontWeight: 860 }}>
                      Unassigned
                    </Typography>
                    <Typography sx={{ mt: 0.35, color: 'text.secondary', fontSize: 13.4, lineHeight: 1.45 }}>
                      These students are not currently assigned to a focus.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.65} flexWrap="wrap" useFlexGap>
                    {ungroupedStudents.map((student) => (
                      <StudentNameChip key={student.id} student={student} onSelectStudent={onSelectStudent} />
                    ))}
                  </Stack>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12.6, fontWeight: 700 }}>
                    {getStudentCountLabel(ungroupedStudents.length)}
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          )}
        </Stack>
      </Stack>

      <GroupDialog
        open={dialogOpen}
        mode={dialogMode}
        group={selectedGroup}
        students={students}
        groupDefinitions={groupDefinitions}
        onClose={() => setDialogOpen(false)}
        onCreateGroup={onCreateGroup}
        onUpdateGroup={onUpdateGroup}
        onDeleteGroup={onDeleteGroup}
        onAddStudent={onAddStudent}
        onRemoveStudent={onRemoveStudent}
      />
    </Paper>
  );
}
