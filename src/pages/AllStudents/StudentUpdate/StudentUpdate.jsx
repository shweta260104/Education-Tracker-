import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getStudents, updateStudent } from "../../../data/studentStorage";
import AcademicDetailsForm from "./sc_forms/AcademicDetailsForm";
import GuardianDetailsForm from "./sc_forms/GuardianDetailsForm";
import IndividualDetailsForm from "./sc_forms/IndividualDetailsForm";
import PreviousSchoolDetailsForm from "./sc_forms/PreviousSchoolDetailsForm";

function StudentUpdate() {
  const { studentid } = useParams();
  const navigate = useNavigate();
  const [newStudent, setNewStudent] = useState(() =>
    getStudents().find(
      (student) => student.studentId.toLowerCase() === studentid,
    ),
  );
  const [saveError, setSaveError] = useState("");

  const submitFormHandler = (event) => {
    event.preventDefault();

    try {
      updateStudent(newStudent);
      navigate("/allstudents");
    } catch (error) {
      console.error("Could not update the student record.", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not update this student. Please try again.",
      );
    }
  };

  if (!newStudent) {
    return (
      <main className="min-h-screen bg-gray-50 px-3 py-12 text-center xl:px-20">
        <p className="text-gray-700">Student record not found.</p>
        <Link
          className="mt-4 inline-block font-medium text-blue-700 hover:text-blue-900"
          to="/allstudents"
        >
          Back to all students
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full bg-gray-50 px-3 py-5 xl:px-20 xl:py-12">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Edit student details
          </h1>
          <p className="mt-1 text-sm text-gray-500">{newStudent.studentId}</p>
        </div>
        <div className="flex gap-2">
          <Link
            className="flex h-9 items-center rounded border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            to="/allstudents"
          >
            Cancel
          </Link>
          <button
            className="h-9 rounded border border-blue-700 bg-blue-700 px-5 text-sm font-medium text-white transition-colors hover:border-blue-800 hover:bg-blue-800"
            form="student-update-form"
            type="submit"
          >
            Save changes
          </button>
        </div>
      </header>

      {saveError && (
        <div
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {saveError}
        </div>
      )}

      <div className="mt-5 flex w-full flex-col gap-10 2xl:flex-row">
        <form
          id="student-update-form"
          onSubmit={submitFormHandler}
          className="flex w-full flex-col items-end gap-10 2xl:max-w-5xl"
        >
          <section className="w-full rounded-md border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium">Individual Details</h2>
            </div>
            <IndividualDetailsForm
              newStudent={newStudent}
              setNewStudent={setNewStudent}
            />
          </section>

          <section className="w-full rounded-md border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium">Academic Details</h2>
            </div>
            <AcademicDetailsForm
              newStudent={newStudent}
              setNewStudent={setNewStudent}
            />
          </section>

          <section className="w-full rounded-md border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium">Guardian Details</h2>
            </div>
            <GuardianDetailsForm
              newStudent={newStudent}
              setNewStudent={setNewStudent}
            />
          </section>

          <section className="w-full rounded-md border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium">Previous School Details</h2>
            </div>
            <PreviousSchoolDetailsForm
              newStudent={newStudent}
              setNewStudent={setNewStudent}
            />
          </section>

          <button
            className="rounded border border-blue-700 bg-blue-700 px-8 py-2 text-sm font-medium text-white transition-colors hover:border-blue-800 hover:bg-blue-800"
            type="submit"
          >
            Save changes
          </button>
        </form>

        <aside className="h-fit flex-1 rounded-md border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-medium">Summary</h2>
          <div className="mt-3 rounded-md bg-gray-50 p-5">
            <span className="block w-fit rounded-full bg-gray-900 px-3 py-1 text-xs text-white">
              {newStudent.studentId}
            </span>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {[newStudent.studentFirstName, newStudent.studentMiddleLastName]
                .filter(Boolean)
                .join(" ") || "Student name"}
            </p>
            <dl className="mt-3 space-y-2 text-sm text-gray-700">
              <div>
                <dt className="inline font-semibold">Class / Section: </dt>
                <dd className="inline">
                  {newStudent.classEnrolled || "N/A"} /{" "}
                  {newStudent.sectionAssigned || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold">Date of birth: </dt>
                <dd className="inline">
                  {newStudent.studentDateOfBirth || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold">Guardian: </dt>
                <dd className="inline">
                  {newStudent.guardianFullName || "N/A"}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default StudentUpdate;
