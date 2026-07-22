import { useCallback, useMemo, useState } from 'react';

function cloneBlocks(blocks) {
  return (blocks || []).map((block) => ({
    ...block,
    curriculumAreaIds: [...(block.curriculumAreaIds || [])],
    evidenceTopicIds: [...(block.evidenceTopicIds || [])],
    abilityIds: [...(block.abilityIds || [])],
    assessmentAnchor: block.assessmentAnchor ? { ...block.assessmentAnchor } : null,
    quickCaptureOptions: normalizeQuickCaptureOptions(block.quickCaptureOptions),
    groupAdaptations: normalizeGroupAdaptations(block.groupAdaptations),
  }));
}

function normalizeQuickCaptureOptions(options) {
  if (!Array.isArray(options)) {
    return [];
  }

  return options
    .filter((option) => option && typeof option.label === 'string')
    .map((option) => ({
      id: typeof option.id === 'string' && option.id ? option.id : slugify(option.label),
      label: option.label,
      ...(option.signal ? { signal: option.signal } : {}),
    }));
}

function normalizeGroupAdaptations(adaptations) {
  if (!Array.isArray(adaptations)) {
    return [];
  }

  return adaptations
    .filter((adaptation) => (
      adaptation
      && typeof adaptation.workingGroupId === 'string'
      && typeof adaptation.instruction === 'string'
    ))
    .map((adaptation) => ({
      id: typeof adaptation.id === 'string' && adaptation.id ? adaptation.id : slugify(`${adaptation.workingGroupId}-${adaptation.instruction}`),
      workingGroupId: adaptation.workingGroupId,
      instruction: adaptation.instruction,
    }));
}

function isValidBlock(block) {
  return Boolean(
    block
      && typeof block.id === 'string'
      && typeof block.subjectId === 'string'
      && typeof block.classId === 'string'
      && typeof block.title === 'string'
      && typeof block.periodId === 'string'
      && typeof block.blockType === 'string'
      && typeof block.status === 'string'
      && Array.isArray(block.curriculumAreaIds),
  );
}

function readSavedBlocks(storageKey, initialBlocks) {
  if (typeof window === 'undefined') {
    return cloneBlocks(initialBlocks);
  }

  try {
    const savedValue = window.localStorage.getItem(storageKey);
    if (!savedValue) {
      return cloneBlocks(initialBlocks);
    }

    const parsed = JSON.parse(savedValue);
    if (!Array.isArray(parsed) || !parsed.every(isValidBlock)) {
      return cloneBlocks(initialBlocks);
    }

    return cloneBlocks(parsed);
  } catch {
    return cloneBlocks(initialBlocks);
  }
}

function persistBlocks(storageKey, blocks) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(blocks));
  }
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(value) {
  return String(value || 'planning-block')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function createStableBlockId({ subjectId, classId, title }) {
  return `${slugify(subjectId)}-${slugify(classId)}-${slugify(title)}-${Date.now().toString(36)}`;
}

function uniqueIds(ids) {
  return Array.from(new Set((ids || []).filter(Boolean)));
}

export function useSubjectPlanning({ subjectId, classId, initialBlocks }) {
  const storageKey = useMemo(
    () => `smartdesk_demo_subject_planning_${subjectId}_${classId}`,
    [subjectId, classId],
  );

  const [blocks, setBlocks] = useState(() => readSavedBlocks(storageKey, initialBlocks));

  const commitBlocks = useCallback((updater) => {
    setBlocks((currentBlocks) => {
      const nextBlocks = typeof updater === 'function' ? updater(cloneBlocks(currentBlocks)) : cloneBlocks(updater);
      persistBlocks(storageKey, nextBlocks);
      return nextBlocks;
    });
  }, [storageKey]);

  const createBlock = useCallback((blockInput) => {
    const today = getToday();
    const nextBlock = {
      id: blockInput.id || createStableBlockId({ subjectId, classId, title: blockInput.title }),
      subjectId,
      classId,
      title: blockInput.title.trim(),
      description: blockInput.description?.trim() || '',
      periodId: blockInput.periodId,
      startDate: blockInput.startDate || '',
      endDate: blockInput.endDate || '',
      status: blockInput.status || 'planned',
      curriculumAreaIds: uniqueIds(blockInput.curriculumAreaIds),
      teachingUnitId: blockInput.teachingUnitId || '',
      sourceTemplateId: blockInput.sourceTemplateId || blockInput.templateId || '',
      templateId: blockInput.templateId || '',
      evidenceTopicIds: uniqueIds(blockInput.evidenceTopicIds),
      abilityIds: uniqueIds(blockInput.abilityIds),
      blockType: blockInput.blockType || 'teaching',
      assessmentAnchor: blockInput.assessmentAnchor || null,
      quickCaptureOptions: normalizeQuickCaptureOptions(blockInput.quickCaptureOptions),
      groupAdaptations: normalizeGroupAdaptations(blockInput.groupAdaptations),
      notes: blockInput.notes?.trim() || null,
      createdAt: blockInput.createdAt || today,
      updatedAt: today,
      createdBy: blockInput.createdBy || 'teacher',
    };

    commitBlocks((currentBlocks) => [...currentBlocks, nextBlock]);
    return nextBlock;
  }, [classId, commitBlocks, subjectId]);

  const updateBlock = useCallback((blockId, updates) => {
    const today = getToday();
    commitBlocks((currentBlocks) => currentBlocks.map((block) => {
      if (block.id !== blockId) {
        return block;
      }

      return {
        ...block,
        ...updates,
        title: updates.title !== undefined ? updates.title.trim() : block.title,
        description: updates.description !== undefined ? updates.description.trim() : block.description,
        curriculumAreaIds: updates.curriculumAreaIds !== undefined ? uniqueIds(updates.curriculumAreaIds) : [...(block.curriculumAreaIds || [])],
        teachingUnitId: updates.teachingUnitId !== undefined ? updates.teachingUnitId : block.teachingUnitId || '',
        sourceTemplateId: updates.sourceTemplateId !== undefined ? updates.sourceTemplateId : block.sourceTemplateId || '',
        templateId: updates.templateId !== undefined ? updates.templateId : block.templateId || '',
        evidenceTopicIds: updates.evidenceTopicIds !== undefined ? uniqueIds(updates.evidenceTopicIds) : [...(block.evidenceTopicIds || [])],
        abilityIds: updates.abilityIds !== undefined ? uniqueIds(updates.abilityIds) : [...(block.abilityIds || [])],
        assessmentAnchor: updates.assessmentAnchor !== undefined ? updates.assessmentAnchor : block.assessmentAnchor,
        quickCaptureOptions: updates.quickCaptureOptions !== undefined ? normalizeQuickCaptureOptions(updates.quickCaptureOptions) : normalizeQuickCaptureOptions(block.quickCaptureOptions),
        groupAdaptations: updates.groupAdaptations !== undefined ? normalizeGroupAdaptations(updates.groupAdaptations) : normalizeGroupAdaptations(block.groupAdaptations),
        notes: updates.notes !== undefined ? updates.notes?.trim() || null : block.notes,
        updatedAt: today,
      };
    }));
  }, [commitBlocks]);

  const deleteBlock = useCallback((blockId) => {
    commitBlocks((currentBlocks) => currentBlocks.filter((block) => block.id !== blockId));
  }, [commitBlocks]);

  const moveBlock = useCallback((blockId, periodId) => {
    updateBlock(blockId, { periodId });
  }, [updateBlock]);

  const duplicateBlock = useCallback((blockId) => {
    const sourceBlock = blocks.find((block) => block.id === blockId);
    if (!sourceBlock) {
      return null;
    }

    return createBlock({
      ...sourceBlock,
      id: undefined,
      title: `${sourceBlock.title} copy`,
      status: 'planned',
      createdAt: undefined,
      updatedAt: undefined,
    });
  }, [blocks, createBlock]);

  const resetPlanning = useCallback(() => {
    const seededBlocks = cloneBlocks(initialBlocks);
    persistBlocks(storageKey, seededBlocks);
    setBlocks(seededBlocks);
  }, [initialBlocks, storageKey]);

  return {
    blocks,
    storageKey,
    createBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    resetPlanning,
  };
}
