import {
  ArrowPathIcon,
  CalendarDaysIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { getStudents } from "../../data/studentStorage";

const STORAGE_KEY = "education-tracker-attendance";

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const readAttendance = () => {
  try {
    const savedAttendance = window.localStorage.getItem(STORAGE_KEY);
    return savedAttendance ? JSON.parse(savedAttendance) : {};
  } catch (error) {
    console.error("Could not load saved attendance records.", error);
    return {};
  }
};

const statusStyles = {
  Present: "bg-green-50 text-green-700 ring-green-600/20",
  Absent: "bg-red-50 text-red-700 ring-red-600/20",
  Leave: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Unmarked: "bg-gray-100 text-gray-600 ring-gray-500/10",
};

function Attendance() {
  const [studentData] = useState(getStudents);
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [search, setSearch] = useState("");
  const [attendanceByDate, setAttendanceByDate] = useState(readAttendance);

  const classes = useMemo(
    () => [
      ...new Set(studentData.map((student) => student.classEnrolled)),
    ].sort((a, b) => Number(a) - Number(b)),
    [studentData],
  );

  const sections = useMemo(() => {
    const students =
      selectedClass === "all"
        ? studentData
        : studentData.filter(
            (student) => student.classEnrolled === selectedClass,
          );

    return [...new Set(students.map((student) => student.sectionAssigned))].sort();
  }, [selectedClass, studentData]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return studentData.filter((student) => {
      const matchesClass =
        selectedClass === "all" || student.classEnrolled === selectedClass;
      const matchesSection =
        selectedSection === "all" ||
        student.sectionAssigned === selectedSection;
      const fullName =
        `${student.studentFirstName} ${student.studentMiddleLastName}`.toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        student.studentId.toLowerCase().includes(normalizedSearch);

      return matchesClass && matchesSection && matchesSearch;
    });
  }, [search, selectedClass, selectedSection, studentData]);

  const currentAttendance = attendanceByDate[selectedDate] || {};
  const getStatus = (studentId) => currentAttendance[studentId] || "Unmarked";

  const summary = filteredStudents.reduce(
    (counts, student) => {
      counts[getStatus(student.studentId)] += 1;
      return counts;
    },
    { Present: 0, Absent: 0, Leave: 0, Unmarked: 0 },
  );

  const updateAttendance = (studentIds, status) => {
    const nextAttendance = {
      ...attendanceByDate,
      [selectedDate]: { ...currentAttendance },
    };

    studentIds.forEach((studentId) => {
      if (status === "Unmarked") {
        delete nextAttendance[selectedDate][studentId];
      } else {
        nextAttendance[selectedDate][studentId] = status;
      }
    });

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAttendance));
    setAttendanceByDate(nextAttendance);
  };

  const resetFilters = () => {
    setSelectedClass("all");
    setSelectedSection("all");
    setSearch("");
  };

  const summaryCards = [
    {
      label: "Total students",
      count: filteredStudents.length,
      icon: UserGroupIcon,
      accent: "text-blue-700 bg-blue-50",
    },
    {
      label: "Present",
      count: summary.Present,
      icon: CheckIcon,
      accent: "text-green-700 bg-green-50",
    },
    {
      label: "Absent",
      count: summary.Absent,
      icon: XMarkIcon,
      accent: "text-red-700 bg-red-50",
    },
    {
      label: "On leave",
      count: summary.Leave,
      icon: CalendarDaysIcon,
      accent: "text-amber-700 bg-amber-50",
    },
  ];

  return (
    <main className="min-h-screen w-full bg-gray-50 px-3 py-5 sm:px-6 xl:px-20 xl:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500">
            Take and review daily student attendance.
          </p>
        </div>
        <label className="flex h-10 w-full items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 sm:w-auto">
          <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
          <span className="whitespace-nowrap">Attendance date</span>
          <input
            aria-label="Attendance date"
            className="min-w-0 border-0 bg-transparent p-0 text-sm text-gray-900 focus:ring-0"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </label>
      </header>

      <section
        aria-label="Attendance summary"
        className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5"
      >
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <span className={`rounded-md p-2 ${card.accent}`}>
                <card.icon aria-hidden="true" className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {card.count}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Class register</h2>
              <p className="mt-1 text-sm text-gray-500">
                {summary.Unmarked} student{summary.Unmarked === 1 ? "" : "s"}{" "}
                still need to be marked.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
                disabled={filteredStudents.length === 0}
                onClick={() =>
                  updateAttendance(
                    filteredStudents.map((student) => student.studentId),
                    "Present",
                  )
                }
                type="button"
              >
                <CheckIcon aria-hidden="true" className="h-4 w-4" />
                Mark all present
              </button>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={filteredStudents.length === 0 || summary.Unmarked === filteredStudents.length}
                onClick={() =>
                  updateAttendance(
                    filteredStudents.map((student) => student.studentId),
                    "Unmarked",
                  )
                }
                type="button"
              >
                <ArrowPathIcon aria-hidden="true" className="h-4 w-4" />
                Clear marks
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-medium text-gray-700">
              Class
              <select
                className="mt-1 block h-10 w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedClass}
                onChange={(event) => {
                  setSelectedClass(event.target.value);
                  setSelectedSection("all");
                }}
              >
                <option value="all">All classes</option>
                {classes.map((className) => (
                  <option key={className} value={className}>
                    Class {className}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Section
              <select
                className="mt-1 block h-10 w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedSection}
                onChange={(event) => setSelectedSection(event.target.value)}
              >
                <option value="all">All sections</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700 sm:col-span-2 xl:col-span-2">
              Search students
              <span className="relative mt-1 block">
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                />
                <input
                  className="h-10 w-full rounded-md border-gray-300 pl-9 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or student ID"
                  type="search"
                  value={search}
                />
              </span>
            </label>
          </div>
          {(selectedClass !== "all" ||
            selectedSection !== "all" ||
            search) && (
            <button
              className="self-start text-sm font-medium text-blue-700 hover:text-blue-900"
              onClick={resetFilters}
              type="button"
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Student
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Student ID
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Class / Section
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Mark attendance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredStudents.map((student) => {
                const status = getStatus(student.studentId);
                const studentName = `${student.studentFirstName} ${student.studentMiddleLastName}`;

                return (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="font-medium text-gray-900">
                        {studentName}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                      {student.studentId}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      Class {student.classEnrolled} / {student.sectionAssigned}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status] || statusStyles.Unmarked}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div
                        aria-label={`Mark ${studentName}`}
                        className="flex gap-1.5"
                        role="group"
                      >
                        {["Present", "Absent", "Leave"].map((option) => (
                          <button
                            key={option}
                            aria-pressed={status === option}
                            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                              status === option
                                ? statusStyles[option]
                                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                            onClick={() =>
                              updateAttendance([student.studentId], option)
                            }
                            type="button"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    className="px-5 py-12 text-center text-sm text-gray-500"
                    colSpan={5}
                  >
                    No students match these filters.
                    <button
                      className="ml-1 font-medium text-blue-700 hover:text-blue-900"
                      onClick={resetFilters}
                      type="button"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Attendance;
