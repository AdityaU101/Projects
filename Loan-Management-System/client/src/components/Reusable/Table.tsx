import React, { FC, useEffect, useState } from "react";
import { approveLoan, deleteEntity, editEntity } from "../../utils/api";
import { createPortal } from "react-dom";
import Notification from "./Notification";
import { capitalizeWord } from "../../utils/utils";

interface TableRowData {
  [key: string]: string | number;
}

interface TableColumn {
  header: string;
  field: string;
}

interface TableProps {
  columns: TableColumn[];
  rows: TableRowData[];
  canEdit?: boolean;
  entityType?: "bank" | "branch" | "customer" | "manager" | "payment" | "loan";
  isLoanApproval?: boolean;
}

const ReusableTable: FC<TableProps> = ({ columns, rows, canEdit, isLoanApproval, entityType }) => {
  const [editMode, setEditMode] = useState<{ [rowId: number]: boolean }>({});
  const [updatedRows, setUpdatedRows] = useState<TableRowData[]>(rows);
  const isEditable = canEdit !== undefined ? canEdit : true;
  const [notification, setNotification] = useState<NotificationData | null>(null);

  const handleEditClick = (index: number) => {
    setEditMode((prev) => ({ ...prev, [index]: true }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, index: number, field: string) => {
    setUpdatedRows((prevRows) => prevRows.map((row, i) => (i === index ? { ...row, [field]: event.target.value } : row)));
  };

  const handleSaveClick = async (index: number) => {
    const modifiedRow = updatedRows[index];
    try {
      const response = await editEntity(+modifiedRow.id, modifiedRow, entityType!);
      if (response !== undefined && response.status === 200) {
        setEditMode((prev) => ({ ...prev, [index]: false }));
      } else {
        console.error("Save failed. Response:", response);
      }
    } catch (error) {
      console.error("Error during save:", error);
    }
  };

  const handleDeleteClick = async (index: number) => {
    const rowToBeDeleted = updatedRows[index];
    try {
      const response = await deleteEntity(+rowToBeDeleted.id, entityType!);
      if (response !== undefined && response.status === 200) {
        setUpdatedRows((prev) => prev.filter((element) => element.id !== rowToBeDeleted.id));

        const object: NotificationData = {
          sentiment: "neutral",
          icon: "fa-square-check",
          label: "Success",
          message: `${capitalizeWord(entityType!)} #${rowToBeDeleted.id} has been deleted successfully!`,
        };
        setNotification(object);

        setTimeout(() => {
          setNotification(null);
        }, 5000);
      } else {
        console.error("Delete failed. Response:", response);
      }
    } catch (error) {
      console.error("Error during delete:", error);
    }
  };

  const handleChangeStatusClick = async (id: number, status: "Rejected" | "Approved") => {
    await approveLoan(id, status);
    setUpdatedRows((prev) => prev.filter((element) => element.id !== id));

    const object: NotificationData = {
      sentiment: status === "Approved" ? "positive" : "negative",
      icon: status === "Approved" ? "fa-square-check" : "fa-ban",
      label: "Success",
      message: `Loan request has been ${status}!`,
    };
    setNotification(object);

    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  useEffect(() => {
    setUpdatedRows(rows);
  }, [rows]);

  if (updatedRows.length === 0) {
    return (
      <div className="box">
        <p className="text-lg">{isLoanApproval ? "No loans to approve." : "No data to display."}</p>
      </div>
    );
  }

  return (
    <div className="box flex-1">
      <table className="w-full overflow-hidden rounded shadow" cellPadding={8}>
        <thead className="bg-blue-600 text-blue-50 lg:text-lg">
          <tr className="text-left">
            {columns.map((column, index) => (
              <th key={column.field + index} className={`w-max`}>
                {column.header}
              </th>
            ))}
            {isEditable && <th className="w-8 p-2"></th>}
            {entityType !== "payment" && <th className="w-8 p-2"></th>}
            {isLoanApproval && <th className="w-8 p-2"></th>}
          </tr>
        </thead>
        <tbody>
          {updatedRows.map((row, index) => (
            <tr className={`bg-blue-50 ${index % 2 === 0 ? "bg-blue-100" : ""}`} key={row.id}>
              {columns.map((column, index1) => (
                <td key={column.field + index1}>
                  {editMode[index] && column.field !== "id" && !column.field.match(/Code/) && !column.field.match(/Id/) && !column.field.match(/estd/) ? (
                    <input
                      className="w-32 rounded border border-gray-300 px-2 py-1"
                      type="text"
                      value={updatedRows[index][column.field] as string}
                      onChange={(e) => handleInputChange(e, index, column.field)}
                    />
                  ) : column.field !== "id" && !column.field.match(/Code/) && !column.field.match(/Id/) ? (
                    updatedRows[index][column.field]
                  ) : (
                    <>
                      #<span className="font-bold">{updatedRows[index][column.field]}</span>
                    </>
                  )}
                </td>
              ))}
              {isEditable && (
                <td className="p-2">
                  {editMode[index] ? (
                    <button className="ml-2 size-10 rounded hover:bg-gray-200" onClick={() => handleSaveClick(index)}>
                      <i className="fa-solid fa-floppy-disk"></i>
                    </button>
                  ) : (
                    <button className="size-10 rounded hover:bg-gray-200" onClick={() => handleEditClick(index)}>
                      <i className="fa-solid fa-pencil"></i>
                    </button>
                  )}
                </td>
              )}
              {!isLoanApproval && entityType !== "payment" && (
                <td className="p-2">
                  <button onClick={() => handleDeleteClick(index)} className="size-10 rounded hover:bg-gray-200">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              )}
              {isLoanApproval && (
                <>
                  <td className="p-2">
                    <button onClick={() => handleChangeStatusClick(+row.id, "Rejected")} className="size-10 rounded border border-red-400 bg-red-100 text-red-600 hover:bg-red-200">
                      <i className="fa-solid fa-ban"></i>
                    </button>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleChangeStatusClick(+row.id, "Approved")}
                      className="size-10 rounded border border-green-400  bg-green-100 text-green-600 hover:bg-green-200"
                    >
                      <i className="fa-solid fa-check"></i>
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {notification && createPortal(<Notification {...notification} />, document.body)}
    </div>
  );
};

export default ReusableTable;
