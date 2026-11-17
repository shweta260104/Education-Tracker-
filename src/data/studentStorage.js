import initialStudents from "./allStudents.json";

const STUDENTS_STORAGE_KEY = "education-tracker-students";

const getSavedStudents = () => {
  const savedStudents = window.localStorage.getItem(STUDENTS_STORAGE_KEY);

  if (!savedStudents) {
    return [];
  }

  let parsedStudents;
  try {
    parsedStudents = JSON.parse(savedStudents);
  } catch (error) {
    throw new Error("Saved student records are invalid and could not be loaded.", {
      cause: error,
    });
  }

  if (
    !Array.isArray(parsedStudents) ||
    parsedStudents.some(
      (student) =>
        !student ||
        typeof student.studentId !== "string" ||
        !student.studentId,
    )
  ) {
    throw new Error("Saved student records have an invalid format.");
  }

  return parsedStudents;
};

export const getStudents = () => {
  const savedStudents = getSavedStudents();
  const savedStudentsById = new Map(
    savedStudents.map((student) => [student.studentId, student]),
  );
  const initialStudentIds = new Set();

  return [
    ...initialStudents.map((student) => {
      initialStudentIds.add(student.studentId);
      return savedStudentsById.get(student.studentId) || student;
    }),
    ...savedStudents.filter(
      (student) => !initialStudentIds.has(student.studentId),
    ),
  ];
};

export const getNextStudentId = () => {
  const highestId = getStudents().reduce((highest, student) => {
    const match = /^DEMO-(\d+)$/i.exec(student.studentId);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return `DEMO-${String(highestId + 1).padStart(4, "0")}`;
};

export const saveStudent = (student) => {
  const students = getStudents();

  if (students.some((savedStudent) => savedStudent.studentId === student.studentId)) {
    throw new Error(`Student ID ${student.studentId} is already in use.`);
  }

  const savedStudents = getSavedStudents();
  window.localStorage.setItem(
    STUDENTS_STORAGE_KEY,
    JSON.stringify([...savedStudents, student]),
  );
};

export const updateStudent = (student) => {
  const students = getStudents();

  if (!students.some((savedStudent) => savedStudent.studentId === student.studentId)) {
    throw new Error(`Student ID ${student.studentId} was not found.`);
  }

  const savedStudents = getSavedStudents();
  const updatedStudents = savedStudents.some(
    (savedStudent) => savedStudent.studentId === student.studentId,
  )
    ? savedStudents.map((savedStudent) =>
        savedStudent.studentId === student.studentId ? student : savedStudent,
      )
    : [...savedStudents, student];

  window.localStorage.setItem(
    STUDENTS_STORAGE_KEY,
    JSON.stringify(updatedStudents),
  );
};
