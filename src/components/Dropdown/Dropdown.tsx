// import React from 'react';
// import styles from './dropdown.module.css';

// interface DropdownProps {
//   options: string[];
//   onChange: (value: string) => void;
// }

// const Dropdown: React.FC<DropdownProps> = ({ options, onChange }) => {
//   return (
//     <select className={styles.dropdown} onChange={(e) => onChange(e.target.value)}>
//       {options.map((option, index) => (
//         <option key={index} value={option}>{option}</option>
//       ))}
//     </select>
//   );
// };

// export default Dropdown;

interface DropdownProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, selected, onChange }) => {
  return (
    <select
      className="border border-gray-300 rounded-md p-2 text-sm w-48 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;

