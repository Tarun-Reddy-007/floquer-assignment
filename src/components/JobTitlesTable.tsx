import React from 'react';
import { Table } from 'antd';
import './JobTitlesTable.css'; 

interface JobTitleData {
  job_title: string;
  job_count: number;
}

interface JobTitlesTableProps {
  jobTitlesData: JobTitleData[];
}

const JobTitlesTable: React.FC<JobTitlesTableProps> = ({ jobTitlesData }) => {
  const columns = [
    {
      title: 'Job Titles',
      dataIndex: 'job_title',
      key: 'job_title',
      sorter: (a: JobTitleData, b: JobTitleData) => a.job_title.localeCompare(b.job_title),
    },
    {
      title: 'Job Count',
      dataIndex: 'job_count',
      key: 'job_count',
      sorter: (a: JobTitleData, b: JobTitleData) => a.job_count - b.job_count,
    },
  ];

  return (
    <div className="job-titles-table-container">
      <Table
        columns={columns}
        dataSource={jobTitlesData}
        rowKey="job_title"
        pagination={false}
        scroll={{ y: 150 }}
      />
    </div>
  );
};

export default JobTitlesTable;
