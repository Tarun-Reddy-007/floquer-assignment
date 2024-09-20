import React, { useEffect, useState } from "react";
import { Table } from "antd";
import Papa from "papaparse";
import Decimal from 'decimal.js';
import JobTitlesTable from "./JobTitlesTable";
import LineGraph from "./LineGraph";
import "./MainTable.css";

interface JobData {
  work_year: string;
  job_title: string;
  salary_in_usd: number;
}

interface AggregatedData {
  year: number;
  totalJobs: number;
  averageSalary: number;
}

const MainTable: React.FC = () => {
  const [data, setData] = useState<AggregatedData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [jobTitlesData, setJobTitlesData] = useState<{ job_title: string; job_count: number }[]>([]);
  const [lineGraphData, setLineGraphData] = useState<{ year: number; totalJobs: number }[]>([]);

  useEffect(() => {
    Papa.parse("/salaries.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const parsedData = results.data as JobData[];
        console.log('Parsed Data:', parsedData);

        const filteredData = parsedData.filter((row: JobData) =>
          !isNaN(Number(row.salary_in_usd)) && Number(row.salary_in_usd) > 0 &&
          !isNaN(Number(row.work_year)) && Number(row.work_year) > 0
        );

        console.log('Filtered Data:', filteredData);

        const aggregatedDataMap = filteredData.reduce((acc: Record<number, { totalJobs: number; totalSalary: Decimal }>, current: JobData) => {
          const year = Number(current.work_year);
          const salary = new Decimal(current.salary_in_usd);

          if (!acc[year]) {
            acc[year] = { totalJobs: 0, totalSalary: new Decimal(0) };
          }

          acc[year].totalJobs += 1;
          acc[year].totalSalary = acc[year].totalSalary.plus(salary);

          return acc;
        }, {});

        const finalData = Object.keys(aggregatedDataMap).map(yearStr => {
          const year = parseInt(yearStr, 10);
          const { totalJobs, totalSalary } = aggregatedDataMap[year];
          const averageSalary = totalJobs > 0 ? totalSalary.div(totalJobs).toDecimalPlaces(0).toNumber() : 0;

          return {
            year: year,
            totalJobs: totalJobs,
            averageSalary: averageSalary,
          };
        });

        console.log('Final Data:', finalData);
        setData(finalData);

        const graphData = finalData.map(item => ({
          year: item.year,
          totalJobs: item.totalJobs,
        }));
        setLineGraphData(graphData);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      }
    });
  }, []);

  const handleRowClick = (record: AggregatedData) => {
    const year = record.year;
    setSelectedYear(year);
    console.log('Selected Year:', year);

    Papa.parse("/salaries.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const parsedData = results.data as JobData[];
        const filteredData = parsedData.filter((row: JobData) => Number(row.work_year) === year);

        console.log('Filtered Data for Selected Year:', filteredData);

        const jobTitlesMap = filteredData.reduce((acc: Record<string, number>, current: JobData) => {
          const jobTitle = current.job_title;
          if (!acc[jobTitle]) {
            acc[jobTitle] = 0;
          }
          acc[jobTitle] += 1;
          return acc;
        }, {});

        console.log('Job Titles Map:', jobTitlesMap);

        const jobTitlesArray = Object.keys(jobTitlesMap).map(jobTitle => ({
          job_title: jobTitle,
          job_count: jobTitlesMap[jobTitle],
        }));

        console.log('Job Titles Array:', jobTitlesArray);
        setJobTitlesData(jobTitlesArray);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      }
    });
  };

  const mainTableColumns = [
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      sorter: (a: AggregatedData, b: AggregatedData) => a.year - b.year,
    },
    {
      title: "Total Jobs",
      dataIndex: "totalJobs",
      key: "totalJobs",
      sorter: (a: AggregatedData, b: AggregatedData) => a.totalJobs - b.totalJobs,
    },
    {
      title: "Average Salary (USD)",
      dataIndex: "averageSalary",
      key: "averageSalary",
      sorter: (a: AggregatedData, b: AggregatedData) => a.averageSalary - b.averageSalary,
    },
  ];

  return (
    <div className="main-table-wrapper">
      <div className="main-table-linegraph-row">
        <div className="main-table-container">
          <Table
            columns={mainTableColumns}
            dataSource={data}
            rowKey="year"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
          />
        </div>
        <div className="line-graph-container">
          <LineGraph data={lineGraphData} />
        </div>
      </div>
      {selectedYear !== null && (
        <div className="job-titles-table-container">
          <JobTitlesTable jobTitlesData={jobTitlesData} />
        </div>
      )}
    </div>
  );
};

export default MainTable;
