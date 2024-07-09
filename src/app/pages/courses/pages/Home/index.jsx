import React, { useMemo, useState } from "react";
import ReactBaseTable from "src/app/_ezs/partials/table";
import { PickerCourses, PickerFilters } from "./components";
import {
  Cog6ToothIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import PickerCreateTags from "./components/PickerCreateTags";
import { useQuery } from "@tanstack/react-query";
import CourseAPI from "src/app/_ezs/api/course.api";

function Home(props) {
  const [filters, setFilters] = useState({
    pi: 1,
    ps: 20,
    filter: {},
  });

  const { isLoading, data } = useQuery({
    queryKey: ["ListCourses", filters],
    queryFn: async () => {
      let { data } = await CourseAPI.list(filters);
      return data;
    },
  });

  const columns = useMemo(
    () => [
      {
        key: "ID",
        title: "ID",
        dataKey: "ID",
        cellRenderer: ({ rowData }) => rowData?.ID,
        width: 135,
        sortable: false,
      },
      {
        key: "Title",
        title: "Tên khóa học",
        dataKey: "Title",
        width: 250,
        sortable: false,
      },
      {
        key: "StockID",
        title: "Cơ sở",
        dataKey: "StockID",
        width: 250,
        sortable: false,
      },
      {
        key: "Total",
        title: "Số buổi",
        dataKey: "Total",
        width: 135,
        sortable: false,
      },
      {
        key: "Status",
        title: "Trạng thái thái",
        dataKey: "Status",
        cellRenderer: ({ rowData }) => (
          <>
            {rowData?.Status
              ? Number(rowData?.Status) === 1
                ? "Đang vận hành"
                : "Đã kết thúc"
              : ""}
          </>
        ),
        width: 180,
        sortable: false,
      },
      {
        key: "Student",
        title: "Học viên",
        dataKey: "Student",
        cellRenderer: ({ rowData }) => rowData?.Student || 0,
        width: 135,
        sortable: false,
      },
      {
        key: "Teachers",
        title: "Giáo viên phụ trách",
        dataKey: "Teachers",
        width: 250,
        sortable: false,
      },
      {
        key: "#",
        title: "Action",
        dataKey: "#",
        width: 200,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <div className="flex">
            <PickerCourses data={rowData}>
              {({ open }) => (
                <button
                  type="button"
                  className="bg-primary hover:bg-primaryhv text-white text-sm rounded cursor-pointer p-2 transition"
                  onClick={open}
                >
                  <PencilIcon className="w-5" />
                </button>
              )}
            </PickerCourses>

            <button
              type="button"
              className="bg-danger hover:bg-dangerhv text-white mx-[4px] text-sm rounded cursor-pointer p-2 transition"
            >
              <TrashIcon className="w-5" />
            </button>
            <button
              type="button"
              className="bg-success hover:bg-successhv text-white text-sm rounded cursor-pointer px-4 py-2 transition"
            >
              Điểm danh
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center px-5 py-4 border-b">
        <div className="text-3xl font-bold">Khóa đào tạo</div>
        <div className="flex">
          <PickerCreateTags>
            {({ open }) => (
              <button
                type="button"
                onClick={open}
                className="flex items-center justify-center text-gray-900 bg-light border rounded border-light h-12 w-12 mr-2.5"
              >
                <Cog6ToothIcon className="w-7" />
              </button>
            )}
          </PickerCreateTags>

          <PickerFilters>
            {({ open }) => (
              <button
                type="button"
                className="flex items-center px-3.5 border border-gray-300 transition rounded h-12 bg-white font-semibold"
                onClick={open}
              >
                Bộ lọc
              </button>
            )}
          </PickerFilters>

          <PickerCourses>
            {({ open }) => (
              <button
                type="button"
                className="flex items-center justify-center h-12 px-2 md:px-5 ml-2 text-white transition border rounded bg-primary border-primary hover:bg-primaryhv hover:border-primaryhv text-[14px] md:text-base"
                onClick={open}
              >
                Thêm mới
              </button>
            )}
          </PickerCourses>
        </div>
      </div>
      <ReactBaseTable
        fixed
        pagination
        wrapClassName="grow p-5"
        rowKey="ID"
        columns={columns}
        data={data?.items || []}
        rowHeight={60}
        isPreviousData={false}
        loading={false}
        pageCount={data?.pcount || 0}
        pageOffset={filters.pi}
        pageSizes={filters.ps}
        onChange={({ pageIndex, pageSize }) =>
          setFilters((prevState) => ({
            ...prevState,
            pi: pageIndex,
            ps: pageSize,
          }))
        }
        footerClass="flex items-center justify-between w-full px-5 pb-5"
      />
    </div>
  );
}

export default Home;
