/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import Notification from "./Notification";
import { capitalizeWord } from "../../utils/utils";

interface FormField {
  name: string;
  label: string;
  type?: string; // Default to 'text'
  error?: string; // Error message for the field
}

interface FormProps {
  children?: ReactNode;
  title: string;
  fields: FormField[];
  entityType: "bank" | "branch" | "customer" | "manager" | "payment" | "loan";
  onSubmit: (formData: any) => void;
}

const ReusableForm = ({ children, title, fields, entityType, onSubmit }: FormProps) => {
  const [formData, setFormData] = useState(() => {
    const initialData = {};
    fields.forEach((field) => (initialData[field.name] = ""));
    return initialData;
  });

  const [success, setSucces] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Validation logic
    const errors: { [key: string]: string } = {};
    fields.forEach((field) => {
      if (!formData[field.name]) {
        errors[field.name] = `${field.label} is required`;
      }
    });
    if (Object.keys(errors).length === 0) {
      onSubmit(formData);
      setSucces(true);

      setTimeout(() => {
        setSucces(false);
      }, 5000);

      setFormData(() => {
        const initialData = {};
        fields.forEach((field) => (initialData[field.name] = ""));
        return initialData;
      });
    } else {
      setFormErrors(errors);
    }
  };

  return (
    <div className="box ">
      <p className="mb-4 text-lg font-bold md:text-xl lg:text-3xl">{title}</p>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div className="relative flex items-center" key={field.name}>
            <label className="form-label" htmlFor={field.name}>
              {field.label}
            </label>
            <input
              value={formData[field.name]}
              onChange={(event) => handleChange(field.name, event.target.value)}
              className={`form-input-box ${formErrors[field.name] ? "border border-red-400" : ""}`}
              type={field.type || "text"}
              id={field.name}
            />
            {formErrors[field.name] && <p className={`absolute leading-none ${field.type === "date" ? "right-10" : "right-4"} text-red-500`}>{formErrors[field.name]}</p>}
          </div>
        ))}
        {children}
        <button className="rounded bg-blue-600 px-6 py-2 font-bold text-blue-50 shadow-lg hover:bg-blue-400 hover:text-blue-800 hover:shadow-none md:self-end">
          {entityType === "payment" ? "Make payment" : entityType === "loan" ? "Create request" : "Add"}
        </button>
      </form>
      {success &&
        createPortal(
          <Notification
            sentiment="positive"
            icon="fa-square-check"
            label="Success"
            message={`${capitalizeWord(entityType)} ${entityType === "loan" ? "request" : ""} created successfully!`}
          />,
          document.body
        )}
    </div>
  );
};

export default ReusableForm;
