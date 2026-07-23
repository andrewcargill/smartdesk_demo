import {
  getCurriculumAreaForEvidenceTopic,
  getEvidenceTopicById,
  getTeachingUnitById,
  normalizeMathsEvidenceItem,
} from '../data/mathsCurriculum.js';

export function getMergedMathsEvidence(baseEvidence, storedEvidence) {
  const storedItems = Array.isArray(storedEvidence)
    ? storedEvidence
    : Array.isArray(storedEvidence?.items)
      ? storedEvidence.items
      : [];

  return [...(baseEvidence || []), ...storedItems]
    .map(normalizeMathsEvidenceItem)
    .filter(Boolean)
    .sort((first, second) => second.date.localeCompare(first.date));
}

export function getEvidenceForStudent(evidence, studentId) {
  return evidence.filter((item) => item.studentId === studentId);
}

export function sortEvidenceByDate(items, direction = 'desc') {
  return [...(items || [])].sort((first, second) => (
    direction === 'asc'
      ? first.date.localeCompare(second.date)
      : second.date.localeCompare(first.date)
  ));
}

export function getStudentAssessments(evidence, studentId) {
  return sortEvidenceByDate(
    getEvidenceForStudent(evidence, studentId).filter((item) => item.type === 'assessment'),
    'asc',
  );
}

export function getStudentObservations(evidence, studentId) {
  return sortEvidenceByDate(
    getEvidenceForStudent(evidence, studentId).filter((item) => item.type !== 'assessment'),
    'desc',
  );
}

export function getEvidenceForTopic(evidence, topicId) {
  return evidence.filter((item) => item.evidenceTopicId === topicId);
}

export function getStudentEvidenceForTeachingUnit({ studentId, teachingUnitId, evidenceItems = [] }) {
  const unit = getTeachingUnitById(teachingUnitId);

  return evidenceItems.filter((item) => (
    item.studentId === studentId
    && (
      item.teachingUnitId === teachingUnitId
    )
  ));
}

export function getClassSignalsForTopic(classSignals = [], topicId) {
  return classSignals.filter((signal) => signal.topicId === topicId);
}

export function getStudentsWithEvidenceForTopic(students, evidence, topicId) {
  const studentIds = new Set(getEvidenceForTopic(evidence, topicId).map((item) => item.studentId));
  return students.filter((student) => studentIds.has(student.id));
}

export function getAssessmentAnchorsForTopic(evidence, topicId) {
  return getEvidenceForTopic(evidence, topicId).filter((item) => item.type === 'assessment');
}

export function getObservationsForTopic(evidence, topicId) {
  return getEvidenceForTopic(evidence, topicId).filter((item) => item.type !== 'assessment');
}

export function getLatestEvidenceDate(evidence) {
  return [...evidence].sort((first, second) => second.date.localeCompare(first.date))[0]?.date || null;
}

export function getStudentEvidenceByContent(evidence, studentId, topics) {
  const studentEvidence = getEvidenceForStudent(evidence, studentId);

  return (topics || []).map((topic) => {
    const unit = getTeachingUnitById(topic.id);
    const items = sortEvidenceByDate(
      unit
        ? getStudentEvidenceForTeachingUnit({ studentId, teachingUnitId: unit.id, evidenceItems: studentEvidence })
        : studentEvidence.filter((item) => item.evidenceTopicId === topic.id),
      'desc',
    );
    const assessments = items.filter((item) => item.type === 'assessment');
    const observations = items.filter((item) => item.type !== 'assessment');
    const latestItem = items[0] || null;

    return {
      topic,
      items,
      assessments,
      observations,
      latestItem,
    };
  });
}

export function getStudentEvidenceSummary(evidence, studentId, topics = []) {
  const studentEvidence = getEvidenceForStudent(evidence, studentId);
  const assessments = studentEvidence.filter((item) => item.type === 'assessment');
  const observations = studentEvidence.filter((item) => item.type !== 'assessment');
  const contentAreas = new Set(studentEvidence
    .map((item) => getCurriculumAreaForEvidenceTopic(item.evidenceTopicId)?.id)
    .filter(Boolean));
  const evidenceByContent = getStudentEvidenceByContent(evidence, studentId, topics);

  return {
    savedItemCount: studentEvidence.length,
    assessmentCount: assessments.length,
    observationCount: observations.length,
    contentAreaCount: contentAreas.size,
    evidenceByContent,
  };
}

export function getStudentVisiblePatterns(evidence, studentId, topics = []) {
  const summary = getStudentEvidenceSummary(evidence, studentId, topics);
  const patterns = [];
  const populatedContent = summary.evidenceByContent.filter((entry) => entry.items.length);
  const mostRepresented = populatedContent.reduce((current, entry) => {
    if (!current || entry.items.length > current.items.length) {
      return entry;
    }
    return current;
  }, null);

  if (mostRepresented) {
    patterns.push(`Most saved evidence relates to ${mostRepresented.topic.label}.`);
  }

  if (summary.assessmentCount) {
    patterns.push(`${summary.assessmentCount} assessment result${summary.assessmentCount === 1 ? ' is' : 's are'} available across ${summary.evidenceByContent.filter((entry) => entry.assessments.length).length} content area${summary.evidenceByContent.filter((entry) => entry.assessments.length).length === 1 ? '' : 's'}.`);
  }

  const latestObservation = getStudentObservations(evidence, studentId)[0] || null;
  if (latestObservation) {
    const topic = topics.find((item) => item.id === latestObservation.evidenceTopicId);
    patterns.push(`The latest saved observation relates to ${topic?.label || latestObservation.evidenceTopicId || 'mathematics'}.`);
  }

  const emptyTopics = summary.evidenceByContent.filter((entry) => !entry.items.length);
  if (emptyTopics.length) {
    patterns.push(`No saved information is currently available for ${emptyTopics[0].topic.label}.`);
  }

  const firstComparableTopic = summary.evidenceByContent.find((entry) => entry.assessments.length >= 2);
  if (firstComparableTopic) {
    const chronological = sortEvidenceByDate(firstComparableTopic.assessments, 'asc');
    const first = chronological[0];
    const latest = chronological[chronological.length - 1];
    const difference = Number(latest.percentage) - Number(first.percentage);
    if (Number.isFinite(difference) && difference !== 0) {
      patterns.push(`The latest ${firstComparableTopic.topic.label} result is ${Math.abs(difference)} percentage points ${difference > 0 ? 'higher' : 'lower'} than the earlier ${firstComparableTopic.topic.label} result.`);
    }
  }

  if (!patterns.length) {
    patterns.push('No visible patterns yet because there is little saved information.');
  }

  return patterns.slice(0, 4);
}

export function getStudentTopicCell(studentId, topicId, evidence) {
  const unit = getTeachingUnitById(topicId);
  const items = unit
    ? getStudentEvidenceForTeachingUnit({ studentId, teachingUnitId: topicId, evidenceItems: evidence })
    : evidence.filter((item) => studentId === item.studentId && item.evidenceTopicId === topicId);
  const assessments = items.filter((item) => item.type === 'assessment');
  const observations = items.filter((item) => item.type !== 'assessment');

  if (!items.length) {
    return {
      label: 'No saved information',
      detail: 'No saved information for this topic',
      count: 0,
      assessments,
      observations,
    };
  }

  if (assessments.length && observations.length) {
    return {
      label: 'Assessment + observation',
      detail: `${assessments.length} assessment anchor${assessments.length === 1 ? '' : 's'} and ${observations.length} observation${observations.length === 1 ? '' : 's'}`,
      count: items.length,
      assessments,
      observations,
    };
  }

  if (assessments.length) {
    const latestAssessment = [...assessments].sort((first, second) => second.date.localeCompare(first.date))[0];
    const value = latestAssessment.percentage !== null ? ` ${latestAssessment.percentage}%` : '';
    return {
      label: `Assessment${value}`,
      detail: `${assessments.length} saved assessment anchor${assessments.length === 1 ? '' : 's'}`,
      count: items.length,
      assessments,
      observations,
    };
  }

  return {
    label: `${observations.length} observation${observations.length === 1 ? '' : 's'}`,
    detail: `${observations.length} saved classroom observation${observations.length === 1 ? '' : 's'}`,
    count: items.length,
    assessments,
    observations,
  };
}

export function getEvidenceTimeline(evidence, classSignals = []) {
  const evidenceItems = evidence.map((item) => ({
    id: item.id,
    date: item.date,
    label: item.assessmentTitle || item.observationText || item.label,
    note: item.observationText || item.note,
    topicId: item.evidenceTopicId,
    teachingUnitId: item.teachingUnitId || '',
    kind: item.type === 'assessment' ? 'Assessment anchor' : 'Observation',
  }));
  const signalItems = classSignals.map((signal) => ({
    id: signal.id,
    date: signal.date,
    label: signal.label,
    note: signal.note,
    topicId: signal.topicId,
    kind: 'Class pattern',
  }));

  return [...evidenceItems, ...signalItems].sort((first, second) => first.date.localeCompare(second.date));
}

export function getStudentPictureSummary(student, evidence) {
  const studentEvidence = getEvidenceForStudent(evidence, student.id);
  const assessments = studentEvidence.filter((item) => item.type === 'assessment');
  const observations = studentEvidence.filter((item) => item.type !== 'assessment');
  const topics = [...new Set(studentEvidence.map((item) => item.evidenceTopicId).filter(Boolean))];
  const latestDate = getLatestEvidenceDate(studentEvidence);
  const averageAssessment = assessments.length
    ? Math.round(assessments.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0) / assessments.length)
    : null;

  let summary = 'The current picture is limited, with no saved Maths 7A information yet.';
  if (student.id === 'leo-andersson') {
    summary = 'Written responses appear less secure than verbal understanding. The current picture remains limited.';
  } else if (student.id === 'amir-khan') {
    summary = 'The current picture is limited, but visual modelling appeared useful.';
  } else if (student.id === 'maya-johnson') {
    summary = 'Several assessment anchors and strong independent work are currently available.';
  } else if (studentEvidence.length) {
    summary = 'The available information includes assessment anchors and classroom observations.';
  }

  return {
    student,
    evidence: studentEvidence,
    assessments,
    observations,
    topics,
    latestDate,
    averageAssessment,
    summary,
    factualSummary: studentEvidence.length
      ? `${studentEvidence.length} saved item${studentEvidence.length === 1 ? '' : 's'}`
      : 'Current picture is limited',
  };
}

export function getTopicPictureSummary(topic, students, evidence, classSignals = []) {
  const topicEvidence = getEvidenceForTopic(evidence, topic.id);
  const assessments = getAssessmentAnchorsForTopic(evidence, topic.id);
  const observations = getObservationsForTopic(evidence, topic.id);
  const signals = getClassSignalsForTopic(classSignals, topic.id);
  const studentsWithEvidence = getStudentsWithEvidenceForTopic(students, evidence, topic.id);
  const latestDates = [getLatestEvidenceDate(topicEvidence), getLatestEvidenceDate(signals)].filter(Boolean);
  const latestDate = latestDates.sort((first, second) => second.localeCompare(first))[0] || null;

  return {
    topic,
    evidence: topicEvidence,
    assessments,
    observations,
    signals,
    studentsWithEvidence,
    latestDate,
    summary: `${studentsWithEvidence.length} student${studentsWithEvidence.length === 1 ? '' : 's'} with saved information, ${assessments.length} assessment anchor${assessments.length === 1 ? '' : 's'}, ${observations.length} observation${observations.length === 1 ? '' : 's'}.`,
  };
}

export function getOverviewTopicGraphItems(topics, students, evidence) {
  return topics.map((topic) => ({
    id: topic.id,
    label: topic.label,
    studentsWithInformation: getStudentsWithEvidenceForTopic(students, evidence, topic.id).length,
    totalStudents: students.length,
  }));
}

export function getStudentScanRows(students, evidence) {
  return students.map((student) => {
    const summary = getStudentPictureSummary(student, evidence);
    const latestItem = [...summary.evidence].sort((first, second) => second.date.localeCompare(first.date))[0] || null;

    return {
      id: student.id,
      displayName: student.displayName,
      summary: summary.summary,
      latestItemLabel: latestItem?.assessmentTitle || latestItem?.observationText || latestItem?.label || 'No saved information',
      latestItemDate: latestItem?.date || null,
      topicsRepresented: summary.topics.length,
    };
  });
}

const indicationValues = {
  clear: 2,
  developing: 1,
  limited: 0,
};

const independenceRank = {
  independent: 3,
  prompted: 2,
  supported: 1,
};

function formatEvidenceDate(date) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

export function getDimensionEvidenceForStudent(evidence, studentId, dimensionId) {
  return evidence
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.studentId === studentId && item.dimensions?.some((dimension) => dimension.id === dimensionId));
}

export function getLatestDimensionIndication(evidence, studentId, dimensionId) {
  const matches = getDimensionEvidenceForStudent(evidence, studentId, dimensionId);

  if (!matches.length) {
    return null;
  }

  // Use the latest saved indication; same-day ties prefer independent, then prompted, then supported, then source order.
  const selected = matches.reduce((current, candidate) => {
    if (!current) {
      return candidate;
    }

    const dateCompare = candidate.item.date.localeCompare(current.item.date);
    if (dateCompare > 0) {
      return candidate;
    }
    if (dateCompare < 0) {
      return current;
    }

    const candidateDimension = candidate.item.dimensions.find((dimension) => dimension.id === dimensionId);
    const currentDimension = current.item.dimensions.find((dimension) => dimension.id === dimensionId);
    const candidateRank = independenceRank[candidateDimension?.independence] || 0;
    const currentRank = independenceRank[currentDimension?.independence] || 0;

    if (candidateRank > currentRank) {
      return candidate;
    }
    if (candidateRank < currentRank) {
      return current;
    }

    return candidate.index > current.index ? candidate : current;
  }, null);
  const dimension = selected.item.dimensions.find((entry) => entry.id === dimensionId);

  return {
    indication: dimension.indication,
    yValue: indicationValues[dimension.indication] ?? null,
    evidenceLabel: selected.item.label,
    date: selected.item.date,
    dateLabel: formatEvidenceDate(selected.item.date),
    independence: dimension.independence || null,
  };
}

export function getStudentDimensionProfile(evidence, student, dimensions) {
  const nameParts = student.displayName.split(' ');
  const displayLabel = `${student.firstName || nameParts[0]} ${student.lastName?.[0] || nameParts[1]?.[0] || ''}.`.trim();

  return {
    studentId: student.id,
    displayLabel,
    fullName: student.displayName,
    dimensions: dimensions.map((dimension) => {
      const latest = getLatestDimensionIndication(evidence, student.id, dimension.id);

      return {
        id: dimension.id,
        label: dimension.label,
        indication: latest?.indication || null,
        yValue: latest?.yValue ?? null,
        evidenceLabel: latest?.evidenceLabel || null,
        dateLabel: latest?.dateLabel || null,
        independence: latest?.independence || null,
      };
    }),
  };
}

export function getClassDimensionProfiles(evidence, students, dimensions) {
  return students.map((student) => getStudentDimensionProfile(evidence, student, dimensions));
}
