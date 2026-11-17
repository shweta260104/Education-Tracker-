import {
  Card,
  Title,
  BarChart,
  ColGrid,
  Block,
  Metric,
  Text,
} from "@tremor/react";
import { useMemo, useState } from "react";
import { getStudents } from "../../data/studentStorage";

function Dashboard() {
  const [students] = useState(getStudents);
  const kpiData = [
    { title: "Student Strength", metric: String(students.length) },
    {
      title: "No. of Girls",
      metric: String(
        students.filter((student) => student.studentSex.toLowerCase() === "female")
          .length,
      ),
    },
    {
      title: "No. of Boys",
      metric: String(
        students.filter((student) => student.studentSex.toLowerCase() === "male")
          .length,
      ),
    },
  ];
  const chartdata = useMemo(() => {
    const classCounts = new Map();

    students.forEach((student) => {
      const className = /^\d+$/.test(student.classEnrolled)
        ? `Class ${student.classEnrolled}`
        : student.classEnrolled;
      const counts = classCounts.get(className) || {
        class: className,
        "Number of boys": 0,
        "Number of girls": 0,
      };

      if (student.studentSex.toLowerCase() === "male") {
        counts["Number of boys"] += 1;
      } else if (student.studentSex.toLowerCase() === "female") {
        counts["Number of girls"] += 1;
      }

      classCounts.set(className, counts);
    });

    return [...classCounts.values()].sort((a, b) =>
      a.class.localeCompare(b.class, undefined, { numeric: true }),
    );
  }, [students]);

  return (
    <div className="h-full w-full bg-gray-50 px-3 py-5 xl:px-20 xl:py-12">
      <header className="ie-na-header flex w-full justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Hello Admin!</h3>
      </header>

      <div className="ie-na-content mt-5">
        <ColGrid numColsSm={2} numColsLg={3} gapX="gap-x-6" gapY="gap-y-6">
          {kpiData.map((item) => (
            <Card key={item.title} shadow={false}>
              <Text>{item.title}</Text>
              <Metric>{item.metric}</Metric>
            </Card>
          ))}
        </ColGrid>

        <Block marginTop="mt-6">
          <Card shadow={false}>
            <Title>Class-wise student distribution</Title>
            <BarChart
              data={chartdata}
              dataKey="class"
              categories={["Number of boys", "Number of girls"]}
              colors={["blue", "fuchsia"]}
              marginTop="mt-6"
              stack={true}
              yAxisWidth="w-6"
            />
          </Card>
        </Block>
      </div>
    </div>
  );
}

export default Dashboard;
