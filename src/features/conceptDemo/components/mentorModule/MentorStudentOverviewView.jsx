import MentorSupportView from './MentorSupportView.jsx';
import MentorCheckInsView from './MentorCheckInsView.jsx';
import MentorSubjectsView from './MentorSubjectsView.jsx';
import MentorFollowUpView, { NextFollowUpCard } from './MentorFollowUpView.jsx';

export default function MentorStudentOverviewView({
  picture,
  subjectConfigs,
  selectedSubjectId,
  setSelectedSubjectId,
  selectedSubjectConfig,
  selectedSubjectFacts,
  onSupportUpdate,
  onTeachingInfoChange,
  onAddCheckIn,
}) {
  const nextFollowUp = picture.followUps.find((item) => !item.completed);

  return (
    <>
      <MentorSupportView picture={picture} onSupportUpdate={onSupportUpdate} onTeachingInfoChange={onTeachingInfoChange} />
      <NextFollowUpCard nextFollowUp={nextFollowUp} />
      <MentorCheckInsView picture={picture} onAddCheckIn={onAddCheckIn} />
      <MentorSubjectsView
        picture={picture}
        subjectConfigs={subjectConfigs}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
        selectedSubjectConfig={selectedSubjectConfig}
        selectedSubjectFacts={selectedSubjectFacts}
      />
      <MentorFollowUpView picture={picture} />
    </>
  );
}
