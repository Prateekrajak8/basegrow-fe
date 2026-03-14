import React from "react";

const CustomTooltip = (props: any) => {
  return (
    <div className="bg-black text-white p-2 rounded shadow-lg max-w-lg break-words">
      {props.value}
    </div>
  );
};

export default CustomTooltip;
