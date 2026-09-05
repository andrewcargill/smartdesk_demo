export const mathsTeachingMaterial = {
  id: 'favorit-matematik-8',
  title: 'Favorit matematik 8',
  publisher: 'Studentlitteratur',
  chapterMapNote: 'Illustrative chapter mapping · not the book’s verified contents.',
  // Teacher-defined mock links, not claims about the publication's chapter order.
  chapters: [
    { id: 'algebra', label: 'Mock ch. 1', title: 'Algebra & equations', practice: 'Worked examples and two-step equations' },
    { id: 'graphs', label: 'Mock ch. 2', title: 'Patterns & graphs', practice: 'Tables, rules and simple graphs' },
    { id: 'geometry', label: 'Mock ch. 3', title: 'Shapes & measurement', practice: 'Area, perimeter and measuring tasks' },
  ],
};

export function getMaterialChapter(id) {
  return mathsTeachingMaterial.chapters.find((chapter) => chapter.id === id) || null;
}
