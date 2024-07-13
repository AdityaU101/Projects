import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  classes?: string;
}

const Wrapper = ({ children, classes }: Props) => {
  return <div className={`mx-auto max-w-[1100px] ${classes}`}>{children}</div>;
};

export default Wrapper;
